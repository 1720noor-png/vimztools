<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id', 64)->index();
            $table->string('role', 20)->default('user'); // user, assistant, system
            $table->text('content');
            $table->string('tool_name')->nullable();
            $table->string('tool_slug')->nullable();
            $table->json('tool_args')->nullable();
            $table->json('tool_result')->nullable();
            $table->string('link')->nullable(); // Level 1 L1 Deep Link
            $table->string('level', 10)->nullable(); // L0, L1, L2, L3
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['session_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_chat_messages');
    }
};
