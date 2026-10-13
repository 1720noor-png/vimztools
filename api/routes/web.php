<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

$serveSpaOrStatus = function (Request $request) {
    $spaPath = public_path('spa.html');
    if (!$request->expectsJson() && file_exists($spaPath)) {
        return response()->file($spaPath, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    return response()->json([
        'status' => 'ok',
        'service' => 'Vimz.ai Laravel API',
        'health_url' => url('/api/health'),
    ]);
};

Route::get('/', $serveSpaOrStatus)->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

Route::get('/{any}', $serveSpaOrStatus)
    ->where('any', '^(?!api(?:/|$)|up(?:/|$)|assets(?:/|$)).*$')
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
