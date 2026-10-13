<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LemonSqueezyWebhookHandler;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    /**
     * Handle incoming Lemon Squeezy webhooks
     */
    public function handleLemonSqueezy(Request $request, LemonSqueezyWebhookHandler $handler)
    {
        $result = $handler->handle($request);
        $httpCode = $result['http_code'] ?? 200;

        return response()->json($result, $httpCode);
    }
}
