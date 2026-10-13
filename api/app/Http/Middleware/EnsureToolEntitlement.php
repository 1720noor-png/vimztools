<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Purchase;
use Symfony\Component\HttpFoundation\Response;

class EnsureToolEntitlement
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ?string $toolSlug = null): Response
    {
        // 1. Resolve tool slug from route param, input, or middleware arg
        $slug = $toolSlug ?: $request->route('slug') ?: $request->input('tool_slug');

        // 2. If no tool slug or if request is for a free basic operation, pass through
        if (!$slug) {
            return $next($request);
        }

        // 3. Check authenticated user
        $user = $request->user();
        if ($user) {
            // Admins always have access
            if ($user->isAdmin()) {
                return $next($request);
            }

            // Pro Monthly Subscription grants access to all advanced tools
            if ($user->hasProSubscription()) {
                return $next($request);
            }

            // User has individual purchase entitlement for this tool
            if ($user->hasToolEntitlement($slug)) {
                return $next($request);
            }
        }

        // 4. Check guest/order download token if provided
        $downloadToken = $request->header('X-Download-Token') ?: $request->input('download_token') ?: $request->route('token');
        if ($downloadToken) {
            $purchase = Purchase::where('download_token', $downloadToken)
                ->where('tool_slug', $slug)
                ->where('status', 'completed')
                ->first();

            // Anti-IDOR check: If purchase belongs to User A, User B cannot use User A's token
            if ($purchase && $purchase->canDownload()) {
                if ($purchase->user_id !== null && $user !== null && $purchase->user_id !== $user->id) {
                    return response()->json([
                        'status' => 'forbidden',
                        'code' => 'TOKEN_USER_MISMATCH',
                        'message' => 'This download token belongs to another user account.',
                    ], 403);
                }

                return $next($request);
            }
        }

        // 5. Entitlement check failed: deny access with 403 Forbidden
        return response()->json([
            'status' => 'forbidden',
            'code' => 'PREMIUM_ENTITLEMENT_REQUIRED',
            'message' => 'This advanced feature requires a Vimz.ai Pro subscription or a verified single-tool advanced purchase.',
            'tool_slug' => $slug,
            'pricing_options' => [
                'pro_monthly' => 9.00,
                'single_tool_lifetime' => 19.00,
            ],
        ], 403);
    }
}
