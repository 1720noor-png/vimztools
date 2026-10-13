<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Tool;
use App\Models\Purchase;
use App\Models\Subscription;
use App\Models\UserEntitlement;
use App\Models\PaymentEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EntitlementsAndWebhooksTest extends TestCase
{
    use RefreshDatabase;

    protected string $webhookSecret = 'test_secret_for_hmac_sha256';

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.lemonsqueezy.webhook_secret' => $this->webhookSecret]);
    }

    protected function generateSignature(array $payload): string
    {
        return hash_hmac('sha256', json_encode($payload), $this->webhookSecret);
    }

    public function test_invalid_webhook_signature_is_rejected_with_401(): void
    {
        $payload = [
            'meta' => [
                'event_name' => 'order_created',
                'webhook_id' => 'evt_test_123',
            ],
            'data' => [
                'id' => '1001',
                'type' => 'orders',
                'attributes' => [],
            ],
        ];

        $response = $this->postJson('/api/webhooks/lemonsqueezy', $payload, [
            'X-Signature' => 'invalid_signature_hash',
        ]);

        $response->assertStatus(401);
        $response->assertJson(['status' => 'error', 'code' => 'INVALID_SIGNATURE']);
    }

    public function test_valid_subscription_created_webhook_grants_pro_entitlement(): void
    {
        $user = User::factory()->create(['email' => 'pro_subscriber@example.com']);

        $payload = [
            'meta' => [
                'event_name' => 'subscription_created',
                'webhook_id' => 'evt_sub_001',
                'custom_data' => [
                    'user_id' => $user->id,
                ],
            ],
            'data' => [
                'id' => 'sub_9999',
                'type' => 'subscriptions',
                'attributes' => [
                    'customer_id' => 'cust_123',
                    'variant_id' => 'var_pro_monthly',
                    'order_id' => 'ord_555',
                    'product_name' => 'Vimz.ai Pro Monthly',
                    'status' => 'active',
                    'renews_at' => now()->addMonth()->toIso8601String(),
                    'ends_at' => now()->addMonth()->toIso8601String(),
                    'user_email' => $user->email,
                ],
            ],
        ];

        $signature = $this->generateSignature($payload);

        $response = $this->postJson('/api/webhooks/lemonsqueezy', $payload, [
            'X-Signature' => $signature,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['status' => 'success', 'event_name' => 'subscription_created']);

        $user->refresh();
        $this->assertEquals('pro', $user->subscription_tier);
        $this->assertEquals('active', $user->subscription_status);
        $this->assertTrue($user->hasProSubscription());

        $this->assertDatabaseHas('user_entitlements', [
            'user_id' => $user->id,
            'tool_slug' => null,
            'entitlement_type' => 'pro_subscription',
            'is_active' => true,
        ]);
    }

    public function test_duplicate_webhook_is_handled_idempotently(): void
    {
        $user = User::factory()->create();

        $payload = [
            'meta' => [
                'event_name' => 'subscription_created',
                'webhook_id' => 'evt_sub_duplicate_check',
                'custom_data' => ['user_id' => $user->id],
            ],
            'data' => [
                'id' => 'sub_dup_01',
                'type' => 'subscriptions',
                'attributes' => [
                    'customer_id' => 'cust_dup',
                    'variant_id' => 'var_pro',
                    'user_email' => $user->email,
                    'status' => 'active',
                ],
            ],
        ];

        $signature = $this->generateSignature($payload);

        // First attempt: should succeed and create record
        $first = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $signature]);
        $first->assertStatus(200);

        // Second attempt with identical webhook_id: should report duplicate and return 200 without duplicate rows
        $second = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $signature]);
        $second->assertStatus(200);
        $second->assertJson(['status' => 'duplicate']);

        $this->assertEquals(1, PaymentEvent::where('event_id', 'evt_sub_duplicate_check')->count());
    }

    public function test_subscription_expired_revokes_pro_entitlement(): void
    {
        $user = User::factory()->create();
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'lemonsqueezy_subscription_id' => 'sub_to_expire',
            'lemonsqueezy_customer_id' => 'cust_exp',
            'variant_id' => 'var_pro',
            'status' => 'active',
            'ends_at' => now()->addDays(5),
        ]);

        $entitlement = UserEntitlement::create([
            'user_id' => $user->id,
            'tool_slug' => null,
            'entitlement_type' => 'pro_subscription',
            'source_id' => 'sub_to_expire',
            'is_active' => true,
            'expires_at' => now()->addDays(5),
        ]);

        $payload = [
            'meta' => [
                'event_name' => 'subscription_expired',
                'webhook_id' => 'evt_expire_01',
            ],
            'data' => [
                'id' => 'sub_to_expire',
                'type' => 'subscriptions',
                'attributes' => [
                    'status' => 'expired',
                ],
            ],
        ];

        $signature = $this->generateSignature($payload);

        $response = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $signature]);
        $response->assertStatus(200);

        $subscription->refresh();
        $this->assertEquals('expired', $subscription->status);

        $entitlement->refresh();
        $this->assertFalse($entitlement->is_active);

        $user->refresh();
        $this->assertEquals('free', $user->subscription_tier);
        $this->assertFalse($user->hasProSubscription());
    }

    public function test_order_refunded_revokes_tool_entitlement(): void
    {
        $user = User::factory()->create();
        $purchase = Purchase::create([
            'user_id' => $user->id,
            'tool_slug' => 'instagram-grid-carousel-splitter',
            'transaction_id' => 'LS_ORD_refund_target',
            'amount' => 19.00,
            'payment_gateway' => 'lemonsqueezy',
            'status' => 'completed',
            'download_token' => 'DL_test_refund_token',
            'metadata' => ['order_id' => 'refund_target'],
        ]);

        $entitlement = UserEntitlement::create([
            'user_id' => $user->id,
            'tool_slug' => 'instagram-grid-carousel-splitter',
            'entitlement_type' => 'single_tool_purchase',
            'source_id' => 'LS_ORD_refund_target',
            'is_active' => true,
        ]);

        $payload = [
            'meta' => [
                'event_name' => 'order_refunded',
                'webhook_id' => 'evt_refund_01',
            ],
            'data' => [
                'id' => 'refund_target',
                'type' => 'orders',
                'attributes' => [
                    'status' => 'refunded',
                ],
            ],
        ];

        $signature = $this->generateSignature($payload);

        $response = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $signature]);
        $response->assertStatus(200);

        $purchase->refresh();
        $this->assertEquals('refunded', $purchase->status);

        $entitlement->refresh();
        $this->assertFalse($entitlement->is_active);
        $this->assertFalse($user->hasToolEntitlement('instagram-grid-carousel-splitter'));
    }

    public function test_checkout_session_generation_in_sandbox_mode(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/checkout/session', [
            'tier' => 'pro_monthly',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'custom_data' => [
                'user_id' => $user->id,
                'tier' => 'pro_monthly',
            ],
        ]);
        $this->assertNotEmpty($response->json('checkout_url'));
    }

    public function test_user_entitlements_endpoint_returns_correct_status(): void
    {
        $user = User::factory()->create();

        // 1. Unentitled user
        $response = $this->actingAs($user, 'sanctum')->getJson('/api/user/entitlements');
        $response->assertStatus(200);
        $response->assertJson([
            'has_pro' => false,
            'subscription_tier' => 'free',
        ]);

        // 2. Grant single entitlement
        UserEntitlement::create([
            'user_id' => $user->id,
            'tool_slug' => 'schema-json-ld-generator',
            'entitlement_type' => 'single_tool_purchase',
            'source_id' => 'TXN_123',
            'is_active' => true,
        ]);

        $toolCheck = $this->actingAs($user, 'sanctum')->getJson('/api/user/entitlements/schema-json-ld-generator');
        $toolCheck->assertStatus(200);
        $toolCheck->assertJson([
            'is_entitled' => true,
            'has_pro_subscription' => false,
        ]);
    }

    public function test_middleware_blocks_unauthorized_user_and_permits_entitled_user(): void
    {
        \Illuminate\Support\Facades\Route::get('/api/test-premium-export/{slug}', function () {
            return response()->json(['status' => 'unlocked', 'feature' => 'watermark_free_export']);
        })->middleware('entitled');

        $user = User::factory()->create();

        // 1. Unauthorized user without Pro or single purchase should receive 403 Forbidden
        $blocked = $this->actingAs($user, 'sanctum')->getJson('/api/test-premium-export/instagram-grid-carousel-splitter');
        $blocked->assertStatus(403);
        $blocked->assertJson([
            'status' => 'forbidden',
            'code' => 'PREMIUM_ENTITLEMENT_REQUIRED',
        ]);

        // 2. User with active Pro subscription should be allowed through
        $user->update([
            'subscription_tier' => 'pro',
            'subscription_status' => 'active',
            'subscription_ends_at' => now()->addMonth(),
        ]);

        $allowed = $this->actingAs($user, 'sanctum')->getJson('/api/test-premium-export/instagram-grid-carousel-splitter');
        $allowed->assertStatus(200);
        $allowed->assertJson(['status' => 'unlocked']);
    }

    public function test_forged_webhook_signature_with_empty_or_mismatched_secret_fails(): void
    {
        $payload = ['meta' => ['event_name' => 'order_created'], 'data' => ['id' => '1']];

        // 1. Missing signature
        $resp1 = $this->postJson('/api/webhooks/lemonsqueezy', $payload);
        $resp1->assertStatus(401);

        // 2. Signature with wrong secret
        $badSignature = hash_hmac('sha256', json_encode($payload), 'completely_wrong_secret');
        $resp2 = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $badSignature]);
        $resp2->assertStatus(401);
    }

    public function test_out_of_order_subscription_updated_with_expired_date_revokes_access(): void
    {
        $user = User::factory()->create();
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'lemonsqueezy_subscription_id' => 'sub_ooo_01',
            'lemonsqueezy_customer_id' => 'cust_ooo',
            'variant_id' => 'var_pro',
            'status' => 'active',
            'ends_at' => now()->addMonth(),
        ]);

        $payload = [
            'meta' => [
                'event_name' => 'subscription_updated',
                'webhook_id' => 'evt_ooo_update',
            ],
            'data' => [
                'id' => 'sub_ooo_01',
                'type' => 'subscriptions',
                'attributes' => [
                    'status' => 'active',
                    'ends_at' => now()->subDay()->toIso8601String(), // Out of order / past date
                ],
            ],
        ];

        $signature = $this->generateSignature($payload);
        $response = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $signature]);
        $response->assertStatus(200);

        $subscription->refresh();
        $this->assertEquals('expired', $subscription->status);
        $this->assertFalse($user->fresh()->hasProSubscription());
    }

    public function test_repeated_subscription_renewal_extends_subscription_ends_at(): void
    {
        $user = User::factory()->create();
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'lemonsqueezy_subscription_id' => 'sub_renew_01',
            'lemonsqueezy_customer_id' => 'cust_renew',
            'variant_id' => 'var_pro',
            'status' => 'active',
            'ends_at' => now()->addDays(2),
        ]);

        $newEndsAt = now()->addDays(32);
        $payload = [
            'meta' => [
                'event_name' => 'subscription_updated',
                'webhook_id' => 'evt_renew_update',
            ],
            'data' => [
                'id' => 'sub_renew_01',
                'type' => 'subscriptions',
                'attributes' => [
                    'status' => 'active',
                    'renews_at' => $newEndsAt->toIso8601String(),
                    'ends_at' => $newEndsAt->toIso8601String(),
                ],
            ],
        ];

        $signature = $this->generateSignature($payload);
        $response = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $signature]);
        $response->assertStatus(200);

        $subscription->refresh();
        $this->assertTrue($subscription->ends_at->isFuture());
        $this->assertTrue($user->fresh()->hasProSubscription());
    }

    public function test_cancellation_at_period_end_retains_access_until_ends_at_then_blocks(): void
    {
        $user = User::factory()->create();
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'lemonsqueezy_subscription_id' => 'sub_cancel_grace',
            'lemonsqueezy_customer_id' => 'cust_cg',
            'variant_id' => 'var_pro',
            'status' => 'active',
            'ends_at' => now()->addDays(15),
        ]);

        $payload = [
            'meta' => [
                'event_name' => 'subscription_cancelled',
                'webhook_id' => 'evt_cancel_01',
            ],
            'data' => [
                'id' => 'sub_cancel_grace',
                'type' => 'subscriptions',
                'attributes' => [],
            ],
        ];

        $signature = $this->generateSignature($payload);
        $response = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $signature]);
        $response->assertStatus(200);

        // While period hasn't ended (15 days left), user retains grace access
        $this->assertTrue($user->fresh()->hasProSubscription());

        // Fast forward / expire ends_at into the past
        $subscription->update(['ends_at' => now()->subDay(), 'status' => 'expired']);
        $user->update(['subscription_status' => 'expired', 'subscription_ends_at' => now()->subDay()]);
        $this->assertFalse($user->fresh()->hasProSubscription());
    }

    public function test_subscription_order_refund_or_chargeback_revokes_subscription(): void
    {
        $user = User::factory()->create();
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'lemonsqueezy_subscription_id' => 'sub_chargeback_target',
            'lemonsqueezy_order_id' => 'ord_cb_999',
            'lemonsqueezy_customer_id' => 'cust_cb',
            'variant_id' => 'var_pro',
            'status' => 'active',
            'ends_at' => now()->addMonth(),
        ]);

        $user->update([
            'subscription_tier' => 'pro',
            'subscription_status' => 'active',
            'subscription_ends_at' => now()->addMonth(),
        ]);

        $payload = [
            'meta' => [
                'event_name' => 'order_refunded',
                'webhook_id' => 'evt_order_chargeback_01',
            ],
            'data' => [
                'id' => 'ord_cb_999',
                'type' => 'orders',
                'attributes' => [],
            ],
        ];

        $signature = $this->generateSignature($payload);
        $response = $this->postJson('/api/webhooks/lemonsqueezy', $payload, ['X-Signature' => $signature]);
        $response->assertStatus(200);

        $subscription->refresh();
        $this->assertEquals('expired', $subscription->status);
        $this->assertFalse($user->fresh()->hasProSubscription());
    }

    public function test_user_b_cannot_use_user_a_download_token_idor_prevention(): void
    {
        \Illuminate\Support\Facades\Route::get('/api/test-token-export/{slug}', function () {
            return response()->json(['status' => 'unlocked']);
        })->middleware('entitled');

        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $purchaseA = Purchase::create([
            'user_id' => $userA->id,
            'tool_slug' => 'instagram-grid-carousel-splitter',
            'transaction_id' => 'TXN_USER_A_ONLY',
            'amount' => 19.00,
            'payment_gateway' => 'lemonsqueezy',
            'status' => 'completed',
            'download_token' => 'DL_TOKEN_USER_A',
            'download_limit' => 10,
            'download_count' => 0,
        ]);

        // User B passes User A's token -> MUST be forbidden with TOKEN_USER_MISMATCH
        $response = $this->actingAs($userB, 'sanctum')->getJson('/api/test-token-export/instagram-grid-carousel-splitter', [
            'X-Download-Token' => 'DL_TOKEN_USER_A',
        ]);

        $response->assertStatus(403);
        $response->assertJson(['code' => 'TOKEN_USER_MISMATCH']);
    }

    public function test_unauthenticated_user_accessing_protected_endpoint_is_forbidden(): void
    {
        \Illuminate\Support\Facades\Route::get('/api/test-guest-export/{slug}', function () {
            return response()->json(['status' => 'unlocked']);
        })->middleware('entitled');

        $response = $this->getJson('/api/test-guest-export/schema-json-ld-generator');
        $response->assertStatus(403);
        $response->assertJson(['code' => 'PREMIUM_ENTITLEMENT_REQUIRED']);
    }

    public function test_free_tools_remain_completely_accessible_without_entitlement(): void
    {
        // Public route without middleware remains 200 for everyone
        $response = $this->getJson('/api/tools');
        $response->assertStatus(200);
    }

    public function test_client_cannot_self_grant_paid_entitlement_via_direct_purchase_in_non_sandbox(): void
    {
        $tool = Tool::create([
            'slug' => 'test-paid-tool',
            'name' => 'Test Paid Tool',
            'is_paid' => true,
            'price' => 19.00,
            'currency' => 'USD',
        ]);

        $user = User::factory()->create();

        // Attempting to complete purchase directly using 'stripe' payment method
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/checkout/purchase', [
            'tool_slug' => 'test-paid-tool',
            'payment_method' => 'stripe',
        ]);

        $response->assertStatus(403);
        $response->assertJson(['code' => 'DIRECT_PURCHASE_DISABLED']);
    }

    public function test_health_endpoint_and_root_status_return_200_ok(): void
    {
        $root = $this->getJson('/');
        $root->assertStatus(200);
        $root->assertJson(['status' => 'ok', 'service' => 'Vimz.ai Laravel API']);

        $health = $this->getJson('/api/health');
        $health->assertStatus(200);
        $health->assertJson([
            'status' => 'ok',
            'database' => 'connected',
        ]);
    }

    public function test_pro_annual_and_guest_email_checkout_session_in_deferred_mode(): void
    {
        $response = $this->postJson('/api/checkout/session', [
            'tier' => 'pro_annual',
            'guest_email' => 'guest_buyer@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'mode' => 'payments_deferred',
            'payments_enabled' => false,
            'supported_methods' => ['google_pay', 'card', 'apple_pay'],
            'custom_data' => [
                'tier' => 'pro_annual',
                'guest_email' => 'guest_buyer@example.com',
            ],
        ]);
    }
}
