# Vimz.ai — Open Decisions & Executive Approval Checklist
**Phase 2: Decisions, Risk Governance & Next Steps for Sir**

* **Status:** Complete Planning Document (Zero Code Changes — Awaiting Executive Approval)
* **Date:** October 12, 2026
* **Platform Scope:** Vimz.ai (1,059 Registered Tools; 1,030 Free; 29 Pro Candidates)
* **Associated Documents:**
  - Roadmap: [`04-29-tool-implementation-roadmap.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/04-29-tool-implementation-roadmap.md)
  - Architecture: [`05-hybrid-monetization-architecture.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/05-hybrid-monetization-architecture.md)
  - Tool-by-Tool Boundaries: [`06-free-premium-feature-boundaries.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/06-free-premium-feature-boundaries.md)
  - Infrastructure & Security: [`07-infrastructure-security-and-testing-plan.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/07-infrastructure-security-and-testing-plan.md)

---

## 1. Executive Summary

All architecture, boundary specifications, and phased implementation plans for the **29 Premium Candidate Tools** have been completed and verified. 

In strict adherence to instructions:
* **Zero production code has been modified.**
* **Zero database schemas or migrations were run.**
* **Zero fake buttons or placeholder paywalls were introduced.**
* **All 1,059 tools remain in their fully working, current production state.**

Before any implementation code is written, Sir must review and approve the strategic, financial, and operational decisions detailed below.

---

## 2. Strategic Decisions Requiring Sir's Explicit Approval

```
┌────────────────────────────────────────────────────────────────────────┐
│                      EXECUTIVE APPROVAL CHECKLIST                      │
├────┬─────────────────────────────┬────────────────────────────────────┤
│ No │ Decision Item               │ Status                             │
├────┼─────────────────────────────┼────────────────────────────────────┤
│ 1  │ Payment Provider Selection  │ Awaiting Selection (Option A vs B) │
│ 2  │ Pricing Structure Approval  │ Awaiting Price Points              │
│ 3  │ Database Strategy Timing    │ Awaiting Stage Confirmation        │
│ 4  │ Free Branding Footer Wording│ Awaiting Copy Approval             │
│ 5  │ Rollout Execution Order     │ Awaiting Pilot vs Batch Decision   │
└────┴─────────────────────────────┴────────────────────────────────────┘
```

### Decision 1: Payment Provider Selection (Global Payouts to Pakistan)
* **Option A: LemonSqueezy (Recommended):**
  - *Details:* Acts as a Merchant of Record (MoR). Handles global sales tax, VAT, chargebacks, and compliance automatically. Supports global cards, PayPal, and Apple Pay. Pays out directly to Pakistani founders via Payoneer or Wise bank transfer.
* **Option B: Paddle:**
  - *Details:* Similar MoR model to LemonSqueezy; strong European and enterprise coverage.
* **Option C: Stripe (Direct):**
  - *Details:* Requires an existing US or UK legal business entity (e.g., Stripe Atlas).
* **Sir's Directive Needed:** Please confirm whether to proceed with **Option A (LemonSqueezy)** or an alternative gateway.

---

### Decision 2: Hybrid Pricing Structure & Currency
* **Option A: Standard SaaS Tiering (Recommended):**
  - **Single Tool Pass:** \$4.99 one-time payment (unlocks lifetime white-label exports for that specific tool).
  - **All-Access Monthly Subscription:** \$12.99 / month (unlocks white-label deliverables across all 29 Pro tools).
  - **All-Access Annual Subscription:** \$99.00 / year (approx. \$8.25/mo — 36% discount).
* **Option B: Value-Priced Tiering:**
  - Single Tool Pass: \$2.99.
  - Monthly Subscription: \$7.99 / month.
* **Sir's Directive Needed:** Please confirm the target retail price points for single tool passes and monthly subscriptions.

---

### Decision 3: Database Persistence & Migration Pathway
* **Phase 1 (Development & Foundation):** Attach a persistent Railway Volume mount to `/var/www/html/database` for the current SQLite setup. Cost: ~\$1.00/mo. Zero code changes required.
* **Phase 2 (Commercial Launch):** Provision a managed PostgreSQL instance on Railway before connecting live payment webhooks. Cost: ~\$5.00/mo.
* **Sir's Directive Needed:** Does Sir approve using the persistent SQLite volume during development, followed by managed PostgreSQL upon payment gateway activation?

---

### Decision 4: Free Export Attribution Copy
For free document downloads and printed outputs:
* **Recommended Wording:**
  $$\text{"Generated with Vimz.ai — Free Professional Business & Marketing Tools"}$$
* **Styling:** Small, tasteful footer line (`9pt`, light gray `#77748B`), centered at the bottom of printed pages.
* **Sir's Directive Needed:** Does Sir approve this attribution wording, or would you like to specify custom wording?

---

### Decision 5: Implementation Rollout Sequencing
* **Approach A: Foundation + Single Pilot First (Recommended):**
  1. Build Phase A (Entitlement DB & UI Kit) and Phase B (PDF Engine).
  2. Implement Pro features on **1 Pilot Tool** (`business-model-canvas-builder`).
  3. Validate end-to-end checkout, entitlement check, and white-label PDF export in production.
  4. Once validated, roll out across the remaining 28 tools in organized batches.
* **Approach B: Full 29-Tool Rollout in One Sprint:**
  - Build foundation and update all 29 tools simultaneously before initial testing.
* **Sir's Directive Needed:** Does Sir approve **Approach A (Pilot First)** or **Approach B (Simultaneous Rollout)**?

---

## 3. Risk Management Matrix

| Risk Identified | Likelihood | Impact | Built-in Engineering Mitigation |
| :--- | :---: | :---: | :--- |
| **Accidental Paywalling of Free Tools** | Low | Critical | Automated test suite tests all 1,030 Free tools before release. Strict rule: core calculations remain 100% free. |
| **Container Redeploy Database Reset** | High (if ignored) | Critical | Resolved in Phase A by mounting Railway persistent storage volume or connecting managed PostgreSQL. |
| **Client-Side DevTools Paywall Bypass** | High (if in React) | High | All unwatermarked PDF generation and sensitive data modeling are gated and compiled strictly on the Laravel backend. |
| **PDF Memory Spikes on High Concurrency** | Medium | Medium | Dompdf memory cap set to 128 MB per request with a 15-second execution timeout and hourly automated temp cleanup. |
| **Payment Webhook Replay Attacks** | Low | High | Signature verification via gateway HMAC secrets combined with atomic idempotency checks in `payment_events`. |

---

## 4. Next Steps Authorization Protocol

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    Awaiting Sir's                      │
                               │                   Explicit Approval                    │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           ▼
                                      ┌──────────────────────────────────────────┐
                                      │   STEP 1: Database Persistence Setup     │
                                      │   (Mount Railway Volume for DB file)     │
                                      └────────────────────┬─────────────────────┘
                                                           │
                                                           ▼
                                      ┌──────────────────────────────────────────┐
                                      │   STEP 2: Backend Entitlement Schema     │
                                      │   (subscriptions, purchases, events)     │
                                      └────────────────────┬─────────────────────┘
                                                           │
                                                           ▼
                                      ┌──────────────────────────────────────────┐
                                      │   STEP 3: Dompdf Engine & Blade Template │
                                      │   (Free footer vs Pro white-label)       │
                                      └────────────────────┬─────────────────────┘
                                                           │
                                                           ▼
                                      ┌──────────────────────────────────────────┐
                                      │   STEP 4: Pilot Tool Implementation      │
                                      │   (Business Model Canvas Builder)        │
                                      └──────────────────────────────────────────┘
```

**We are completely stopped and standing by. No code or database changes will occur until you review and confirm the decisions above.**
