<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EntitlementService;
use Illuminate\Http\Request;

class EntitlementController extends Controller
{
    /**
     * Check entitlement status for a specific tool
     */
    public function check(Request $request, string $slug, EntitlementService $service)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'success',
                'has_pro_subscription' => false,
                'is_entitled' => false,
                'message' => 'Unauthenticated guest user.',
            ]);
        }

        $result = $service->checkEntitlements($user, $slug);

        return response()->json([
            'status' => 'success',
            'tool_slug' => $slug,
            'has_pro_subscription' => $result['has_pro_subscription'],
            'is_entitled' => $result['is_entitled'],
            'entitlement' => $result['entitlement'],
        ]);
    }

    /**
     * Get all active entitlements and subscriptions for the authenticated user
     */
    public function userEntitlements(Request $request)
    {
        $user = $request->user();

        $subscriptions = $user->subscriptions()->latest()->get();
        $entitlements = $user->entitlements()->with('tool')->latest()->get();

        return response()->json([
            'status' => 'success',
            'has_pro' => $user->hasProSubscription(),
            'subscription_tier' => $user->subscription_tier ?: 'free',
            'subscription_status' => $user->subscription_status ?: 'none',
            'subscription_ends_at' => $user->subscription_ends_at,
            'subscriptions' => $subscriptions,
            'entitlements' => $entitlements,
        ]);
    }
}
