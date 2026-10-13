<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Purchase;
use App\Services\EntitlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    protected EntitlementService $entitlementService;

    public function __construct(EntitlementService $entitlementService)
    {
        $this->entitlementService = $entitlementService;
    }

    /**
     * Process a one-time tool purchase (Sandbox or Gateway verified)
     */
    public function purchase(Request $request)
    {
        $validated = $request->validate([
            'tool_slug' => 'required|string',
            'guest_email' => 'nullable|email',
            'payment_method' => 'required|string|in:stripe,paypal,sandbox,lemonsqueezy',
        ]);

        $tool = Tool::where('slug', $validated['tool_slug'])->first();

        if (!$tool || !$tool->is_paid) {
            return response()->json([
                'status' => 'error',
                'message' => 'This tool is not available for purchase or is already free.',
            ], 400);
        }

        $user = $request->user();
        $email = $user ? $user->email : ($validated['guest_email'] ?? 'guest@example.com');

        // Security Guard: Prevent clients from granting themselves free entitlements
        if (!app()->environment('local', 'testing') || $validated['payment_method'] !== 'sandbox') {
            return response()->json([
                'status' => 'error',
                'code' => 'DIRECT_PURCHASE_DISABLED',
                'message' => 'Direct client-side checkout completion is disabled. Please initiate payment via /api/checkout/session.',
            ], 403);
        }

        // Check if already purchased
        if ($user) {
            $existing = Purchase::where('user_id', $user->id)
                ->where('tool_slug', $tool->slug)
                ->where('status', 'completed')
                ->first();

            if ($existing && $existing->canDownload()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'You already have access to this tool export!',
                    'purchase' => $existing,
                    'download_token' => $existing->download_token,
                ]);
            }
        }

        // Generate one-time transaction and download token
        $transactionId = 'TXN_' . strtoupper(Str::random(12));
        $downloadToken = 'DL_' . Str::random(40);

        $purchase = Purchase::create([
            'user_id' => $user ? $user->id : null,
            'guest_email' => $email,
            'tool_slug' => $tool->slug,
            'transaction_id' => $transactionId,
            'amount' => $tool->price,
            'currency' => $tool->currency ?: 'USD',
            'payment_gateway' => $validated['payment_method'],
            'status' => 'completed', // Instant completion for sandbox / verified payment
            'download_token' => $downloadToken,
            'download_limit' => 50,
            'download_count' => 0,
            'expires_at' => null, // Lifetime access
            'metadata' => [
                'tool_name' => $tool->name,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        ]);

        $tool->increment('purchase_count');

        // Server-side entitlement grant for logged in users
        if ($user) {
            $this->entitlementService->grantSingleToolPurchase($user, $tool->slug, $purchase);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase successful! Your advanced features and high-res exports are unlocked.',
            'purchase' => [
                'id' => $purchase->id,
                'transaction_id' => $purchase->transaction_id,
                'amount' => $purchase->amount,
                'currency' => $purchase->currency,
                'download_token' => $purchase->download_token,
                'download_limit' => $purchase->download_limit,
                'download_count' => $purchase->download_count,
                'expires_at' => $purchase->expires_at,
                'created_at' => $purchase->created_at,
            ],
        ], 201);
    }

    /**
     * Create a Lemon Squeezy checkout session (Sandbox or Live)
     */
    public function createSession(Request $request)
    {
        $validated = $request->validate([
            'tier' => 'required|string|in:pro_monthly,pro_annual,single_tool',
            'tool_slug' => 'nullable|string|required_if:tier,single_tool',
            'guest_email' => 'nullable|email',
        ]);

        $user = $request->user();
        $customerEmail = $user?->email ?? ($validated['guest_email'] ?? null);
        $apiKey = config('services.lemonsqueezy.api_key');
        $storeId = config('services.lemonsqueezy.store_id');

        $variantId = match ($validated['tier']) {
            'pro_monthly' => config('services.lemonsqueezy.pro_monthly_variant_id'),
            'pro_annual' => config('services.lemonsqueezy.pro_annual_variant_id') ?: config('services.lemonsqueezy.pro_monthly_variant_id'),
            default => config('services.lemonsqueezy.single_tool_variant_id'),
        };

        // When payment credentials are not configured, payments are deferred
        if (empty($apiKey) || empty($storeId) || empty($variantId)) {
            return response()->json([
                'status' => 'success',
                'mode' => 'payments_deferred',
                'payments_enabled' => false,
                'supported_methods' => ['google_pay', 'card', 'apple_pay'],
                'message' => 'Online payments (including Google Pay and Card checkout) are currently deferred until merchant processor credentials are configured.',
                'checkout_url' => app()->environment('testing') ? 'https://vimztools.lemonsqueezy.com/buy/test-variant?test_mode=1' : null,
                'custom_data' => [
                    'user_id' => $user?->id,
                    'guest_email' => $customerEmail,
                    'tool_slug' => $validated['tool_slug'] ?? null,
                    'tier' => $validated['tier'],
                ],
            ]);
        }

        try {
            $apiResponse = \Illuminate\Support\Facades\Http::withToken($apiKey)
                ->withHeaders([
                    'Accept' => 'application/vnd.api+json',
                    'Content-Type' => 'application/vnd.api+json',
                ])
                ->post('https://api.lemonsqueezy.com/v1/checkouts', [
                    'data' => [
                        'type' => 'checkouts',
                        'attributes' => [
                            'checkout_data' => [
                                'email' => $customerEmail,
                                'name' => $user?->name,
                                'custom' => [
                                    'user_id' => $user?->id,
                                    'guest_email' => $customerEmail,
                                    'tool_slug' => $validated['tool_slug'] ?? null,
                                    'tier' => $validated['tier'],
                                ],
                            ],
                        ],
                        'relationships' => [
                            'store' => [
                                'data' => [
                                    'type' => 'stores',
                                    'id' => (string) $storeId,
                                ],
                            ],
                            'variant' => [
                                'data' => [
                                    'type' => 'variants',
                                    'id' => (string) $variantId,
                                ],
                            ],
                        ],
                    ],
                ]);

            if ($apiResponse->successful() && isset($apiResponse['data']['attributes']['url'])) {
                return response()->json([
                    'status' => 'success',
                    'mode' => 'api_generated_checkout',
                    'checkout_url' => $apiResponse['data']['attributes']['url'],
                    'custom_data' => [
                        'user_id' => $user?->id,
                        'tool_slug' => $validated['tool_slug'] ?? null,
                        'tier' => $validated['tier'],
                    ],
                ]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Lemon Squeezy checkout API error: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'mode' => 'hosted_checkout_fallback',
            'checkout_url' => "https://{$storeId}.lemonsqueezy.com/buy/{$variantId}",
            'custom_data' => [
                'user_id' => $user?->id,
                'tool_slug' => $validated['tool_slug'] ?? null,
                'tier' => $validated['tier'],
            ],
        ]);
    }

    /**
     * List user's purchases
     */
    public function userPurchases(Request $request)
    {
        $user = $request->user();
        $purchases = Purchase::with('tool')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'purchases' => $purchases,
        ]);
    }
}
