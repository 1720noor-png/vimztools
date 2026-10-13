<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Vimz.ai Laravel API',
        'health_url' => url('/api/health'),
    ]);
});
