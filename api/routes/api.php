<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ToolApiController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\DownloadController;
use App\Http\Controllers\Api\UserDashboardController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\EntitlementController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/health', function () {
    $dbConnected = false;
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbConnected = true;
    } catch (\Throwable $e) {
        $dbConnected = false;
    }

    $paymentsConfigured = !empty(config('services.lemonsqueezy.api_key'))
        && !empty(config('services.lemonsqueezy.store_id'));

    return response()->json([
        'status' => 'ok',
        'service' => 'Vimz.ai API',
        'database' => $dbConnected ? 'connected' : 'error',
        'driver' => config('database.default'),
        'payments_mode' => $paymentsConfigured ? 'configured' : 'payments_deferred',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/tools', [ToolApiController::class, 'index']);
Route::get('/tools/{slug}', [ToolApiController::class, 'show']);
Route::post('/tools/{slug}/use', [ToolApiController::class, 'incrementUsage']);

// Checkout & Hosted Sessions (Rate-limited, Guest or Authenticated)
Route::post('/checkout/purchase', [CheckoutController::class, 'purchase'])->middleware('throttle:30,1');
Route::post('/checkout/session', [CheckoutController::class, 'createSession'])->middleware('throttle:30,1');

// Provider Webhooks (HMAC Verified, Rate-limited)
Route::post('/webhooks/lemonsqueezy', [WebhookController::class, 'handleLemonSqueezy'])->middleware('throttle:120,1');

// Token verification & download tracking
Route::get('/download/verify/{token}', [DownloadController::class, 'verifyToken']);
Route::post('/download/record/{token}', [DownloadController::class, 'recordDownload']);

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // User Dashboard & Entitlements
    Route::get('/user/purchases', [CheckoutController::class, 'userPurchases']);
    Route::get('/user/entitlements', [EntitlementController::class, 'userEntitlements']);
    Route::get('/user/entitlements/{slug}', [EntitlementController::class, 'check']);
    Route::get('/user/favorites', [UserDashboardController::class, 'getFavorites']);
    Route::post('/user/favorites/toggle', [UserDashboardController::class, 'toggleFavorite']);
    Route::get('/user/saved-results', [UserDashboardController::class, 'getSavedResults']);
    Route::post('/user/saved-results', [UserDashboardController::class, 'saveResult']);
    Route::delete('/user/saved-results/{id}', [UserDashboardController::class, 'deleteResult']);

    // Admin Panel (Protected by isAdmin check in AdminController)
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/tools', [AdminController::class, 'tools']);
        Route::put('/tools/{id}', [AdminController::class, 'updateTool']);
        Route::get('/purchases', [AdminController::class, 'purchases']);
    });
});
