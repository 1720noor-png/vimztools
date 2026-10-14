<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiChatController extends Controller
{
    /**
     * Record a chat turn and store AI response with tool-call telemetry.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'session_id' => 'nullable|string|max:64',
            'reply' => 'nullable|string|max:10000',
            'tool_name' => 'nullable|string|max:100',
            'tool_slug' => 'nullable|string|max:100',
            'tool_args' => 'nullable|array',
            'tool_result' => 'nullable|array',
            'link' => 'nullable|string|max:500',
            'level' => 'nullable|string|max:10',
        ]);

        $userId = $request->user()?->id;
        $sessionId = $validated['session_id'] ?? (string) Str::uuid();

        // 1. Record incoming user message
        $userMsg = AiChatMessage::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        // 2. If client provided the assistant reply (from dual online/local engine), record it
        $assistantMsg = null;
        if (!empty($validated['reply'])) {
            $assistantMsg = AiChatMessage::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'role' => 'assistant',
                'content' => $validated['reply'],
                'tool_name' => $validated['tool_name'] ?? null,
                'tool_slug' => $validated['tool_slug'] ?? null,
                'tool_args' => $validated['tool_args'] ?? null,
                'tool_result' => $validated['tool_result'] ?? null,
                'link' => $validated['link'] ?? null,
                'level' => $validated['level'] ?? 'L2',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'session_id' => $sessionId,
            'user_message' => $userMsg,
            'assistant_message' => $assistantMsg,
        ]);
    }

    /**
     * Retrieve chat history for authenticated user or guest browser session.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function history(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->query('session_id');

        if (!$userId && !$sessionId) {
            return response()->json([
                'status' => 'success',
                'messages' => [],
            ]);
        }

        $query = AiChatMessage::query();

        if ($userId) {
            $query->where(function ($q) use ($userId, $sessionId) {
                $q->where('user_id', $userId);
                if ($sessionId) {
                    $q->orWhere('session_id', $sessionId);
                }
            });
        } else {
            $query->where('session_id', $sessionId);
        }

        $messages = $query->orderBy('created_at', 'asc')
            ->limit(100)
            ->get();

        return response()->json([
            'status' => 'success',
            'count' => $messages->count(),
            'messages' => $messages,
        ]);
    }

    /**
     * Clear chat history for user or session.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clearHistory(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->input('session_id') ?: $request->query('session_id');

        if (!$userId && !$sessionId) {
            return response()->json([
                'status' => 'error',
                'message' => 'User or session identification required to clear history.',
            ], 400);
        }

        $query = AiChatMessage::query();

        if ($userId) {
            $query->where(function ($q) use ($userId, $sessionId) {
                $q->where('user_id', $userId);
                if ($sessionId) {
                    $q->orWhere('session_id', $sessionId);
                }
            });
        } else {
            $query->where('session_id', $sessionId);
        }

        $deletedCount = $query->delete();

        return response()->json([
            'status' => 'success',
            'deleted_count' => $deletedCount,
            'message' => 'Chat history cleared successfully.',
        ]);
    }
}
