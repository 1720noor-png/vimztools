<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subscription;
use App\Models\Purchase;
use App\Models\UserEntitlement;
use Carbon\Carbon;

class EntitlementService
{
    /**
     * Grant Pro subscription entitlement
     */
    public function grantProSubscription(User $user, Subscription $subscription): UserEntitlement
    {
        $user->update([
            'lemonsqueezy_customer_id' => $subscription->lemonsqueezy_customer_id,
            'subscription_tier' => 'pro',
            'subscription_status' => 'active',
            'subscription_ends_at' => $subscription->ends_at,
        ]);

        return UserEntitlement::updateOrCreate(
            [
                'user_id' => $user->id,
                'tool_slug' => null, // Platform-wide Pro access
                'entitlement_type' => 'pro_subscription',
            ],
            [
                'source_id' => $subscription->lemonsqueezy_subscription_id,
                'is_active' => true,
                'expires_at' => $subscription->ends_at,
                'metadata' => [
                    'variant_id' => $subscription->variant_id,
                    'renews_at' => $subscription->renews_at?->toIso8601String(),
                ],
            ]
        );
    }

    /**
     * Handle subscription cancellation (remains active until period ends)
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        $subscription->update([
            'status' => 'cancelled',
        ]);

        $user = $subscription->user;
        if ($user) {
            $user->update([
                'subscription_status' => 'cancelled',
            ]);
        }
    }

    /**
     * Expire subscription and revoke Pro access
     */
    public function expireSubscription(Subscription $subscription): void
    {
        $subscription->update([
            'status' => 'expired',
        ]);

        $user = $subscription->user;
        if ($user) {
            $user->update([
                'subscription_tier' => 'free',
                'subscription_status' => 'expired',
            ]);

            UserEntitlement::where('user_id', $user->id)
                ->where('entitlement_type', 'pro_subscription')
                ->where('source_id', $subscription->lemonsqueezy_subscription_id)
                ->update(['is_active' => false]);
        }
    }

    /**
     * Grant single tool purchase (lifetime advanced access)
     */
    public function grantSingleToolPurchase(User $user, string $toolSlug, Purchase $purchase): UserEntitlement
    {
        return UserEntitlement::updateOrCreate(
            [
                'user_id' => $user->id,
                'tool_slug' => $toolSlug,
                'entitlement_type' => 'single_tool_purchase',
            ],
            [
                'source_id' => $purchase->transaction_id,
                'is_active' => true,
                'expires_at' => null, // Lifetime for this tool
                'metadata' => [
                    'amount' => $purchase->amount,
                    'download_token' => $purchase->download_token,
                ],
            ]
        );
    }

    /**
     * Revoke single tool purchase (e.g. upon refund)
     */
    public function revokeSingleToolPurchase(Purchase $purchase): void
    {
        $purchase->update(['status' => 'refunded']);

        if ($purchase->user_id) {
            UserEntitlement::where('user_id', $purchase->user_id)
                ->where('tool_slug', $purchase->tool_slug)
                ->where('entitlement_type', 'single_tool_purchase')
                ->update(['is_active' => false]);
        }
    }

    /**
     * Check user entitlement status for a tool or platform-wide
     */
    public function checkEntitlements(User $user, ?string $toolSlug = null): array
    {
        $hasPro = $user->hasProSubscription();
        $hasTool = $toolSlug ? $user->hasToolEntitlement($toolSlug) : $hasPro;

        $entitlement = null;
        if ($hasPro) {
            $entitlement = [
                'type' => 'pro_subscription',
                'tier' => 'pro',
                'expires_at' => $user->subscription_ends_at?->toIso8601String(),
            ];
        } elseif ($toolSlug && $hasTool) {
            $record = $user->entitlements()
                ->where('tool_slug', $toolSlug)
                ->where('is_active', true)
                ->first();

            $entitlement = [
                'type' => 'single_tool_purchase',
                'tier' => 'single_tool',
                'tool_slug' => $toolSlug,
                'expires_at' => $record?->expires_at?->toIso8601String(),
            ];
        }

        return [
            'has_pro_subscription' => $hasPro,
            'is_entitled' => $hasTool,
            'entitlement' => $entitlement,
        ];
    }
}
