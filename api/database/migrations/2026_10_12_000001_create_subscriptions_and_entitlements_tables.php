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
        // 1. Add subscription and customer tracking fields to users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'lemonsqueezy_customer_id')) {
                $table->string('lemonsqueezy_customer_id')->nullable()->index();
            }
            if (!Schema::hasColumn('users', 'subscription_tier')) {
                $table->string('subscription_tier')->default('free'); // 'free', 'pro'
            }
            if (!Schema::hasColumn('users', 'subscription_status')) {
                $table->string('subscription_status')->default('none'); // 'none', 'active', 'past_due', 'cancelled', 'expired'
            }
            if (!Schema::hasColumn('users', 'subscription_ends_at')) {
                $table->timestamp('subscription_ends_at')->nullable();
            }
        });

        // 2. Subscriptions table (Monthly Pro Subscriptions)
        if (!Schema::hasTable('subscriptions')) {
            Schema::create('subscriptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('lemonsqueezy_subscription_id')->unique();
                $table->string('lemonsqueezy_order_id')->nullable();
                $table->string('lemonsqueezy_customer_id')->index();
                $table->string('variant_id');
                $table->string('product_name')->default('Vimz.ai Pro');
                $table->string('status')->default('active'); // active, past_due, unpaid, cancelled, expired, paused
                $table->timestamp('renews_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->timestamp('trial_ends_at')->nullable();
                $table->string('card_brand')->nullable();
                $table->string('card_last_four', 4)->nullable();
                $table->text('update_payment_method_url')->nullable();
                $table->text('customer_portal_url')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'status']);
            });
        }

        // 3. Payment Events table (Webhook Idempotency & Audit Log)
        if (!Schema::hasTable('payment_events')) {
            Schema::create('payment_events', function (Blueprint $table) {
                $table->id();
                $table->string('event_id')->unique(); // Unique identifier from provider
                $table->string('event_name'); // order_created, subscription_created, etc.
                $table->string('provider')->default('lemonsqueezy'); // lemonsqueezy, stripe, sandbox
                $table->json('payload');
                $table->string('status')->default('pending'); // pending, processed, failed, duplicate
                $table->text('error_message')->nullable();
                $table->timestamp('processed_at')->nullable();
                $table->timestamps();

                $table->index('event_name');
                $table->index('status');
            });
        }

        // 4. User Entitlements table (Explicit Tool and Feature Access)
        if (!Schema::hasTable('user_entitlements')) {
            Schema::create('user_entitlements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('tool_slug')->nullable(); // null = Platform-wide Pro access
                $table->string('entitlement_type'); // 'pro_subscription', 'single_tool_purchase'
                $table->string('source_id')->nullable(); // transaction_id or subscription_id
                $table->boolean('is_active')->default(true);
                $table->timestamp('expires_at')->nullable(); // null = lifetime
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->unique(['user_id', 'tool_slug', 'entitlement_type'], 'user_tool_entitlement_unique');
                $table->index(['user_id', 'is_active']);
                $table->index('tool_slug');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_entitlements');
        Schema::dropIfExists('payment_events');
        Schema::dropIfExists('subscriptions');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'lemonsqueezy_customer_id')) {
                try {
                    $table->dropIndex(['lemonsqueezy_customer_id']);
                } catch (\Throwable $e) {
                    // Ignore if index does not exist
                }
            }

            $columnsToDrop = [];
            if (Schema::hasColumn('users', 'subscription_ends_at')) {
                $columnsToDrop[] = 'subscription_ends_at';
            }
            if (Schema::hasColumn('users', 'subscription_status')) {
                $columnsToDrop[] = 'subscription_status';
            }
            if (Schema::hasColumn('users', 'subscription_tier')) {
                $columnsToDrop[] = 'subscription_tier';
            }
            if (Schema::hasColumn('users', 'lemonsqueezy_customer_id')) {
                $columnsToDrop[] = 'lemonsqueezy_customer_id';
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
