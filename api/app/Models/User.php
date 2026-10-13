<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'lemonsqueezy_customer_id',
        'subscription_tier',
        'subscription_status',
        'subscription_ends_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function entitlements()
    {
        return $this->hasMany(UserEntitlement::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function savedResults()
    {
        return $this->hasMany(SavedResult::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Check if user has an active Pro Monthly Subscription
     */
    public function hasProSubscription(): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if ($this->subscription_tier === 'pro') {
            if ($this->subscription_status === 'active' && (!$this->subscription_ends_at || $this->subscription_ends_at->isFuture())) {
                return true;
            }
            if ($this->subscription_status === 'cancelled' && $this->subscription_ends_at && $this->subscription_ends_at->isFuture()) {
                return true;
            }
        }

        return $this->subscriptions()
            ->whereIn('status', ['active', 'cancelled'])
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>', now());
            })
            ->exists();
    }

    /**
     * Check if user has entitlement for a specific tool (either via Pro or single purchase)
     */
    public function hasToolEntitlement(?string $toolSlug): bool
    {
        if ($this->hasProSubscription()) {
            return true;
        }

        if (!$toolSlug) {
            return false;
        }

        return $this->entitlements()
            ->where('tool_slug', $toolSlug)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * Check if user can access an advanced premium feature of a tool
     */
    public function canAccessAdvancedFeature(?string $toolSlug): bool
    {
        return $this->hasToolEntitlement($toolSlug);
    }
}
