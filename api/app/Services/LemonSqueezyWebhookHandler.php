<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subscription;
use App\Models\Purchase;
use App\Models\PaymentEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class LemonSqueezyWebhookHandler
{
    protected EntitlementService $entitlementService;

    public function __construct(EntitlementService $entitlementService)
    {
        $this->entitlementService = $entitlementService;
    }

    /**
     * Verify HMAC SHA-256 signature from Lemon Squeezy
     */
    public function verifySignature(string $rawPayload, ?string $signature, ?string $secret = null): bool
    {
        $secret = $secret ?: config('services.lemonsqueezy.webhook_secret');

        if (empty($secret) || empty($signature)) {
            return false;
        }

        $calculated = hash_hmac('sha256', $rawPayload, $secret);
        return hash_equals($calculated, $signature);
    }

    /**
     * Handle incoming webhook with idempotency and audit tracking
     */
    public function handle(Request $request): array
    {
        $signature = $request->header('X-Signature');
        $rawPayload = $request->getContent();

        if (!$this->verifySignature($rawPayload, $signature)) {
            Log::warning('Lemon Squeezy webhook signature verification failed.');
            return [
                'status' => 'error',
                'code' => 'INVALID_SIGNATURE',
                'message' => 'Invalid webhook signature.',
                'http_code' => 401,
            ];
        }

        $payload = json_decode($rawPayload, true);
        if (!$payload || !isset($payload['meta']['event_name'])) {
            return [
                'status' => 'error',
                'code' => 'MALFORMED_PAYLOAD',
                'message' => 'Malformed webhook payload.',
                'http_code' => 400,
            ];
        }

        $eventName = $payload['meta']['event_name'];
        // Event ID from Lemon Squeezy or custom data / header
        $eventId = (string) ($payload['meta']['webhook_id'] ?? $request->header('X-Event-Id') ?? ($eventName . '_' . ($payload['data']['id'] ?? Str::uuid()->toString())));

        // Check idempotency
        if (PaymentEvent::isDuplicate($eventId)) {
            return [
                'status' => 'duplicate',
                'message' => 'Event already processed.',
                'http_code' => 200,
            ];
        }

        $event = PaymentEvent::create([
            'event_id' => $eventId,
            'event_name' => $eventName,
            'provider' => 'lemonsqueezy',
            'payload' => $payload,
            'status' => 'pending',
        ]);

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($eventName, $payload) {
                switch ($eventName) {
                    case 'order_created':
                        $this->handleOrderCreated($payload);
                        break;

                    case 'subscription_created':
                        $this->handleSubscriptionCreated($payload);
                        break;

                    case 'subscription_updated':
                        $this->handleSubscriptionUpdated($payload);
                        break;

                    case 'subscription_cancelled':
                        $this->handleSubscriptionCancelled($payload);
                        break;

                    case 'subscription_expired':
                        $this->handleSubscriptionExpired($payload);
                        break;

                    case 'order_refunded':
                        $this->handleOrderRefunded($payload);
                        break;

                    default:
                        Log::info("Unhandled Lemon Squeezy webhook event: {$eventName}");
                        break;
                }
            });

            $event->update([
                'status' => 'processed',
                'processed_at' => now(),
            ]);

            return [
                'status' => 'success',
                'event_name' => $eventName,
                'http_code' => 200,
            ];
        } catch (\Throwable $e) {
            Log::error("Error processing Lemon Squeezy webhook {$eventName}: " . $e->getMessage(), [
                'event_name' => $eventName,
                'event_id' => $eventId,
            ]);

            $event->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return [
                'status' => 'error',
                'code' => 'PROCESSING_FAILED',
                'message' => $e->getMessage(),
                'http_code' => 500,
            ];
        }
    }

    protected function handleOrderCreated(array $payload): void
    {
        $data = $payload['data'];
        $attributes = $data['attributes'];
        $customData = $payload['meta']['custom_data'] ?? [];

        $userEmail = $attributes['user_email'] ?? null;
        $userId = $customData['user_id'] ?? null;
        $toolSlug = $customData['tool_slug'] ?? null;

        $user = $userId ? User::find($userId) : ($userEmail ? User::where('email', $userEmail)->first() : null);

        // Only handle if this is a single tool purchase (subscriptions are handled via subscription_created)
        if ($toolSlug) {
            $transactionId = 'LS_ORD_' . ($data['id'] ?? Str::random(10));
            $downloadToken = 'DL_' . Str::random(40);

            $purchase = Purchase::updateOrCreate(
                ['transaction_id' => $transactionId],
                [
                    'user_id' => $user?->id,
                    'guest_email' => $userEmail,
                    'tool_slug' => $toolSlug,
                    'amount' => ($attributes['total'] ?? 0) / 100,
                    'currency' => $attributes['currency'] ?? 'USD',
                    'payment_gateway' => 'lemonsqueezy',
                    'status' => 'completed',
                    'download_token' => $downloadToken,
                    'download_limit' => 50,
                    'download_count' => 0,
                    'expires_at' => null, // Lifetime for single purchase
                    'metadata' => [
                        'order_id' => $data['id'],
                        'customer_id' => $attributes['customer_id'] ?? null,
                    ],
                ]
            );

            if ($user) {
                $this->entitlementService->grantSingleToolPurchase($user, $toolSlug, $purchase);
            }
        }
    }

    protected function handleSubscriptionCreated(array $payload): void
    {
        $data = $payload['data'];
        $attributes = $data['attributes'];
        $customData = $payload['meta']['custom_data'] ?? [];

        $subscriptionId = (string) $data['id'];
        $customerId = (string) ($attributes['customer_id'] ?? '');
        $variantId = (string) ($attributes['variant_id'] ?? '');
        $orderId = (string) ($attributes['order_id'] ?? '');
        $userEmail = $attributes['user_email'] ?? null;
        $userId = $customData['user_id'] ?? null;

        $user = $userId ? User::find($userId) : ($userEmail ? User::where('email', $userEmail)->first() : null);

        if (!$user) {
            Log::warning("User not found for Lemon Squeezy subscription: {$subscriptionId}");
            return;
        }

        $subscription = Subscription::updateOrCreate(
            ['lemonsqueezy_subscription_id' => $subscriptionId],
            [
                'user_id' => $user->id,
                'lemonsqueezy_order_id' => $orderId,
                'lemonsqueezy_customer_id' => $customerId,
                'variant_id' => $variantId,
                'product_name' => $attributes['product_name'] ?? 'Vimz.ai Pro',
                'status' => $attributes['status'] ?? 'active',
                'renews_at' => !empty($attributes['renews_at']) ? Carbon::parse($attributes['renews_at']) : null,
                'ends_at' => !empty($attributes['ends_at']) ? Carbon::parse($attributes['ends_at']) : (!empty($attributes['renews_at']) ? Carbon::parse($attributes['renews_at']) : now()->addMonth()),
                'trial_ends_at' => !empty($attributes['trial_ends_at']) ? Carbon::parse($attributes['trial_ends_at']) : null,
                'card_brand' => $attributes['card_brand'] ?? null,
                'card_last_four' => $attributes['card_last_four'] ?? null,
                'update_payment_method_url' => $attributes['urls']['update_payment_method'] ?? null,
                'customer_portal_url' => $attributes['urls']['customer_portal'] ?? null,
                'metadata' => $attributes,
            ]
        );

        $this->entitlementService->grantProSubscription($user, $subscription);
    }

    protected function handleSubscriptionUpdated(array $payload): void
    {
        $data = $payload['data'];
        $attributes = $data['attributes'];
        $subscriptionId = (string) $data['id'];

        $subscription = Subscription::where('lemonsqueezy_subscription_id', $subscriptionId)->first();
        if (!$subscription) {
            return;
        }

        $status = $attributes['status'] ?? $subscription->status;
        $renewsAt = !empty($attributes['renews_at']) ? Carbon::parse($attributes['renews_at']) : $subscription->renews_at;
        $endsAt = !empty($attributes['ends_at']) ? Carbon::parse($attributes['ends_at']) : $subscription->ends_at;

        // Out-of-order defense: if ends_at is already in the past, status cannot remain active
        if ($endsAt && $endsAt->isPast()) {
            $status = 'expired';
        }

        $subscription->update([
            'status' => $status,
            'renews_at' => $renewsAt,
            'ends_at' => $endsAt,
            'card_brand' => $attributes['card_brand'] ?? $subscription->card_brand,
            'card_last_four' => $attributes['card_last_four'] ?? $subscription->card_last_four,
            'metadata' => [
                'variant_id' => $attributes['variant_id'] ?? $subscription->variant_id,
                'customer_id' => $attributes['customer_id'] ?? $subscription->lemonsqueezy_customer_id,
                'product_name' => $attributes['product_name'] ?? $subscription->product_name,
            ],
        ]);

        if ($status === 'active' && $subscription->user && (!$endsAt || $endsAt->isFuture())) {
            $this->entitlementService->grantProSubscription($subscription->user, $subscription);
        } elseif (in_array($status, ['expired', 'unpaid']) || ($endsAt && $endsAt->isPast())) {
            $this->entitlementService->expireSubscription($subscription);
        }
    }

    protected function handleSubscriptionCancelled(array $payload): void
    {
        $subscriptionId = (string) $payload['data']['id'];
        $subscription = Subscription::where('lemonsqueezy_subscription_id', $subscriptionId)->first();

        if ($subscription) {
            $this->entitlementService->cancelSubscription($subscription);
        }
    }

    protected function handleSubscriptionExpired(array $payload): void
    {
        $subscriptionId = (string) $payload['data']['id'];
        $subscription = Subscription::where('lemonsqueezy_subscription_id', $subscriptionId)->first();

        if ($subscription) {
            $this->entitlementService->expireSubscription($subscription);
        }
    }

    protected function handleOrderRefunded(array $payload): void
    {
        $data = $payload['data'];
        $orderId = (string) $data['id'];

        // 1. Single tool purchase refund
        $purchase = Purchase::where('transaction_id', 'LIKE', "%{$orderId}%")
            ->orWhereJsonContains('metadata->order_id', $orderId)
            ->first();

        if ($purchase) {
            $this->entitlementService->revokeSingleToolPurchase($purchase);
        }

        // 2. Subscription initial order refund / chargeback
        $subscription = Subscription::where('lemonsqueezy_order_id', $orderId)->first();
        if ($subscription) {
            $this->entitlementService->expireSubscription($subscription);
        }
    }
}
