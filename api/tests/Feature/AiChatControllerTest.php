<?php

namespace Tests\Feature;

use App\Models\AiChatMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiChatControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_send_chat_message_and_persist_history(): void
    {
        $payload = [
            'session_id' => 'guest-session-uuid-123',
            'message' => 'convert 10 km to miles',
            'reply' => '10 Kilometers (km) = 6.213712 Miles (mi)',
            'tool_name' => 'convertUnit',
            'tool_slug' => 'universal-unit-converter',
            'tool_args' => ['value' => 10, 'fromUnit' => 'km', 'toUnit' => 'mi'],
            'tool_result' => ['result' => 6.213712],
            'link' => '/tools/universal-unit-converter?cat=length&from=km&to=mi&val=10',
            'level' => 'L2',
        ];

        $response = $this->postJson('/api/ai/chat', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'session_id' => 'guest-session-uuid-123',
        ]);

        $this->assertDatabaseHas('ai_chat_messages', [
            'session_id' => 'guest-session-uuid-123',
            'role' => 'user',
            'content' => 'convert 10 km to miles',
        ]);

        $this->assertDatabaseHas('ai_chat_messages', [
            'session_id' => 'guest-session-uuid-123',
            'role' => 'assistant',
            'tool_name' => 'convertUnit',
            'tool_slug' => 'universal-unit-converter',
            'link' => '/tools/universal-unit-converter?cat=length&from=km&to=mi&val=10',
        ]);
    }

    public function test_authenticated_user_chat_is_linked_to_user_id(): void
    {
        $user = User::factory()->create();

        $payload = [
            'session_id' => 'user-session-456',
            'message' => 'Calculate GPA for 2 courses',
            'reply' => 'Your calculated GPA is 3.50',
            'tool_name' => 'calculateGpa',
            'tool_slug' => 'gpa-calculator',
            'link' => '/tools/gpa-calculator',
        ];

        $response = $this->actingAs($user)->postJson('/api/ai/chat', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('ai_chat_messages', [
            'user_id' => $user->id,
            'role' => 'user',
            'content' => 'Calculate GPA for 2 courses',
        ]);

        $this->assertDatabaseHas('ai_chat_messages', [
            'user_id' => $user->id,
            'role' => 'assistant',
            'tool_name' => 'calculateGpa',
        ]);
    }

    public function test_history_endpoint_returns_chronological_messages(): void
    {
        $sessionId = 'history-session-789';

        AiChatMessage::create([
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => 'First message',
        ]);

        AiChatMessage::create([
            'session_id' => $sessionId,
            'role' => 'assistant',
            'content' => 'First reply',
        ]);

        $response = $this->getJson("/api/ai/history?session_id={$sessionId}");

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'count' => 2,
        ]);
        $this->assertCount(2, $response->json('messages'));
        $this->assertEquals('First message', $response->json('messages.0.content'));
        $this->assertEquals('First reply', $response->json('messages.1.content'));
    }

    public function test_clear_history_removes_session_messages(): void
    {
        $sessionId = 'clear-session-999';

        AiChatMessage::create([
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => 'Delete me',
        ]);

        $response = $this->deleteJson('/api/ai/history', [
            'session_id' => $sessionId,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'deleted_count' => 1,
        ]);

        $this->assertDatabaseMissing('ai_chat_messages', [
            'session_id' => $sessionId,
        ]);
    }

    public function test_chat_endpoint_validates_required_message(): void
    {
        $response = $this->postJson('/api/ai/chat', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['message']);
    }
}
