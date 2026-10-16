# Vimz.ai — Infrastructure, Security & Quality Assurance Plan
**Phase 2: Technical Specifications for Database Persistence, PDF Processing, Security & Testing**

* **Status:** Complete Planning Document (Zero Code Changes — Awaiting Executive Approval)
* **Date:** October 12, 2026
* **Platform Scope:** Vimz.ai Production Stack (React 19 on Netlify + Laravel 13 on Railway)
* **Target Workload:** High-concurrency client calculations + Secure server-rendered deliverables
* **Associated Documents:**
  - Roadmap: [`04-29-tool-implementation-roadmap.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/04-29-tool-implementation-roadmap.md)
  - Architecture: [`05-hybrid-monetization-architecture.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/05-hybrid-monetization-architecture.md)
  - Tool-by-Tool Boundaries: [`06-free-premium-feature-boundaries.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/06-free-premium-feature-boundaries.md)
  - Executive Approval Checklist: [`08-open-decisions-and-approval-checklist.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/08-open-decisions-and-approval-checklist.md)

---

## 1. Database Persistence & Deployment Resilience

### 1.1 Root Cause of Current Ephemeral Reset
Our inspection of `api/Dockerfile` revealed that every deployment rebuilds the container from scratch:
```dockerfile
# api/Dockerfile: lines 27 and 32
RUN touch database/database.sqlite && chmod 666 database/database.sqlite
CMD ["sh", "-c", "php artisan key:generate --force || true; php artisan migrate --force || true; ..."]
```
Because neither `railway.json` nor `render.yaml` declares a persistent volume mount, any new Git push erases the SQLite database file and regenerates `APP_KEY`, which would invalidate all Sanctum tokens, purchase records, and user accounts.

### 1.2 Two-Stage Persistence Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      DATABASE EVOLUTION STRATEGY                       │
├──────────────────────────────────┬─────────────────────────────────────┤
│ STAGE 1: Pilot & Development     │ STAGE 2: Commercial Launch          │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Railway Persistent Volume      │ • Managed PostgreSQL on Railway     │
│ • Mount at: `/data/db.sqlite`    │ • `DB_CONNECTION=pgsql`             │
│ • Zero code or migration changes │ • Native high concurrency           │
│ • Cost: ~$0.50 - $1.00 / month   │ • Cost: ~$5.00 / month              │
│ • Perfect for 1-tool pilot       │ • Essential for paid transactions   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

#### Why PostgreSQL is the Recommended Target:
1. **PHP Driver is Already Compiled:** `api/Dockerfile` (line 13) **already installs `pdo_pgsql`**! Zero Dockerfile edits are required to support PostgreSQL.
2. **Transaction Isolation & Webhooks:** Concurrent incoming payment webhooks from LemonSqueezy/Paddle require row-level locking to prevent race conditions. SQLite uses file-level locking, which can cause timeout exceptions (`SQLSTATE[HY000]: General error: 5 database is locked`) under burst loads.
3. **Decoupled Architecture:** A managed PostgreSQL database exists outside the web container. Code deployments can restart, scale, or fail without any risk to user accounts or transaction tables.

---

## 2. Server-Side Export Engine Architecture

### 2.1 The PDF Engine Dilemma: Headless Chrome vs. PHP-Native
* **Option 1: Spatie Browsershot / Headless Chrome:**
  - *Pros:* Renders exact React DOM and CSS.
  - *Cons:* Requires installing Node.js, Puppeteer, and Chromium inside the PHP Docker container. Increases Docker image size by 450 MB; consumes 300+ MB RAM per render. Unsuitable for Railway low-tier compute.
* **Option 2: PHP-Native Dompdf (`barryvdh/laravel-dompdf`) — RECOMMENDED:**
  - *Pros:* Ultra-lightweight; zero external binary dependencies; runs inside the existing PHP 8.4 CLI environment; generates vector PDFs in under 400 milliseconds; consumes less than 30 MB RAM per document.
  - *Cons:* Relies on standard HTML/CSS templates (Blade templates) rather than executing live JavaScript.
  - *Verdict:* **Adopt Dompdf for all 29 tools.** Blade templates provide pixel-perfect, predictable pagination, headers, page breaks, and footers for business documents.

### 2.2 Memory Limits & Execution Guardrails
To prevent server memory exhaustion during batch exports:
1. **Payload Limit:** Restrict export JSON payloads to maximum 2 MB per request.
2. **Execution Timeout:** Set `max_execution_time` to 15 seconds for export routes.
3. **Memory Cap:** Constrain PHP memory allocation to 128 MB per request (`memory_limit = 128M`).
4. **Automated Temporary File Cleanup:**
   - PDF files should be streamed directly to the HTTP response (`return $pdf->stream('filename.pdf')`) or saved to temporary storage (`storage/app/exports/tmp_*.pdf`).
   - A scheduled Laravel command (`php artisan exports:clean`) runs hourly to prune files older than 15 minutes:
     ```php
     Storage::disk('local')->delete(
         collect(Storage::disk('local')->files('exports'))
             ->filter(fn($file) => now()->subMinutes(15)->timestamp > Storage::disk('local')->lastModified($file))
     );
     ```

---

## 3. Security, Authentication & Entitlement Hardening

### 3.1 Server-Side Entitlement Middleware: `EnsureToolAccess`
```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureToolAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $toolSlug = $request->route('slug') ?? $request->input('tool_slug');
        $user = $request->user();

        // 1. Admin Override
        if ($user && $user->isAdmin()) {
            return $next($request);
        }

        // 2. Active Subscription Check
        if ($user && $user->hasActiveSubscription()) {
            return $next($request);
        }

        // 3. Individual Tool Purchase Check
        if ($user && $user->hasPurchasedTool($toolSlug)) {
            return $next($request);
        }

        // 4. Deny Access
        return response()->json([
            'status' => 'error',
            'code' => 'ENTITLEMENT_REQUIRED',
            'message' => 'This advanced feature requires an active Pro subscription or an individual tool pass.',
            'tool_slug' => $toolSlug,
        ], 403);
    }
}
```

### 3.2 Webhook Security & Idempotency Pipeline
1. **Signature Verification:** All incoming webhooks from LemonSqueezy/Paddle must validate the `X-Signature` HMAC hash before execution. Unsigned or malformed requests are rejected with `401 Unauthorized`.
2. **Idempotency Guard:** Webhook event IDs are checked against `payment_events`. If an event was already processed, the server immediately returns `200 OK` to prevent duplicate crediting.
3. **Database Transactions:** All status changes (e.g., creating subscriptions, granting tool passes) run inside atomic `DB::transaction` closures.

### 3.3 OWASP & Input Sanitization
* **HTML/PDF Injection Prevention:** User-provided inputs (e.g., custom company names, client addresses, invoice notes) are sanitized using `htmlspecialchars()` before being compiled into Blade templates to prevent PDF HTML injection.
* **CORS Whitelist:** Ensure `CORS_ALLOWED_ORIGINS` in `render.yaml` and Railway env strictly allows `https://vimztools-app.netlify.app`.
* **Zero Secrets Exposure:** Webhook secrets, database passwords, and API keys remain stored strictly in Railway Environment Variables. Zero private keys or credentials are committed to the Git repository.

---

## 4. Accessibility (a11y) & Performance Standards

### 4.1 Accessibility Standards (WCAG 2.1 AA Compliance)
1. **Keyboard Navigability:** The `<UpgradeModal />` must support full keyboard trapping, closing on `Escape`, and returning focus to the trigger button upon dismissal.
2. **Screen Reader Semantic Roles:** All `<ProBadge />` components must include `aria-label="Pro Feature"` and Pro export buttons must announce entitlement state to assistive technologies.
3. **Color Contrast:** All lavender Pro accent buttons (`#6C4CF1` background with `#FFFFFF` text) must exceed the 4.5:1 WCAG contrast ratio for normal text.

### 4.2 Performance Guardrails
1. **Zero Bundle Bloat for Free Tools:** The Pro modal and export drawer components must be lazy-loaded (`React.lazy(() => import('../components/ProModal.jsx'))`). Free users loading any of the 1,030 free tools will download zero Pro-related code.
2. **Sub-Second PDF Rendering:** Backend PDF generation templates must render in under 800 milliseconds on standard Railway compute.

---

## 5. Comprehensive Quality Assurance & Testing Plan

### 5.1 Test Pyramid Overview
```
             ┌─────────────────────────┐
             │       E2E Tests         │  (5 tests: Full purchase & export flow)
             ├─────────────────────────┤
             │    Integration Tests    │  (20 tests: Webhooks, Entitlement MW, API)
             ├─────────────────────────┤
             │       Unit Tests        │  (50+ tests: Math accuracy, Sanitization)
             └─────────────────────────┘
```

### 5.2 Mandatory Test Cases

| Test Category | Test Identifier | Test Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **Entitlement** | `TC-ENT-001` | Guest user calls `/api/v1/tools/{slug}/export-pdf` | Returns `403 Forbidden` with `ENTITLEMENT_REQUIRED` |
| **Entitlement** | `TC-ENT-002` | User with active subscription calls export endpoint | Returns `200 OK` and streams unwatermarked PDF |
| **Entitlement** | `TC-ENT-003` | User with single-tool pass for Tool A calls Tool B export | Returns `403 Forbidden` for Tool B |
| **Entitlement** | `TC-ENT-004` | User with canceled subscription within billing cycle | Returns `200 OK` (access active until `ends_at`) |
| **Entitlement** | `TC-ENT-005` | User with expired subscription calls export endpoint | Returns `403 Forbidden` |
| **Webhooks** | `TC-WH-001` | Webhook with invalid HMAC signature sent to `/api/v1/webhooks` | Returns `401 Unauthorized` |
| **Webhooks** | `TC-WH-002` | Duplicate webhook event ID received | Returns `200 OK` immediately without duplicate crediting |
| **Webhooks** | `TC-WH-003` | Valid `subscription_created` payload received | Inserts record into `subscriptions` and marks `active` |
| **Exports** | `TC-EXP-001` | Free user prints or downloads document | Contains subtle footer *"Created with Vimz.ai"* |
| **Exports** | `TC-EXP-002` | Pro user generates export with custom company logo | PDF contains custom logo; 0 references to Vimz.ai |
| **Zero Regression** | `TC-REG-001` | Verify 50 random Free-Only tools (e.g., student/math tools) | 100% calculation and print capabilities remain unrestricted |
| **Zero Regression** | `TC-REG-002` | Verify Carousel Splitter (`instagram-grid-carousel-splitter`)| 1-click JSZip batch download remains 100% free |
