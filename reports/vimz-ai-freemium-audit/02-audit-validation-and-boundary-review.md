# Vimz.ai — Audit Validation & Premium Boundary Review
**Phase 1 Review: Evidence-Based Verification, Feature De-Duplication & Architecture Audit**

* **Status:** Complete (Validation Only — Zero Application Code or Production State Modified)
* **Date:** October 12, 2026
* **Scope:** 1,059 Registered Tools across 74 Categories
* **Target Files Audited:**
  - [`reports/vimz-ai-freemium-audit/01-freemium-readiness-and-feature-classification-report.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/01-freemium-readiness-and-feature-classification-report.md)
  - [`reports/vimz-ai-freemium-audit/freemium_classification_matrix.csv`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/freemium_classification_matrix.csv)
  - [`reports/vimz-ai-freemium-audit/freemium_audit_summary.json`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/freemium_audit_summary.json)

---

## 1. Task 1: Validation of Initial Audit Artifacts

A rigorous, automated cross-validation was conducted between the exported CSV dataset, the summary JSON, and the primary application registry [`src/data/registry.js`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/src/data/registry.js).

### 1.1 Integrity & Reconciliation Checklist

| Verification Metric | Target | Actual Count | Status | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Total CSV Data Records** | 1,059 | 1,059 | **VERIFIED** | Exactly 1,059 rows excluding header row. |
| **Unique Tool Slugs in CSV** | 1,059 | 1,059 | **VERIFIED** | Zero duplicate slugs detected. |
| **Unique Tool IDs in CSV** | 1,059 | 1,059 | **VERIFIED** | IDs 1 through 1,059 strictly sequential. |
| **Registry Tools Extracted** | 1,059 | 1,059 | **VERIFIED** | Matches tools array in `registry.js`. |
| **Registry Slug Matching** | 1,059 | 1,059 | **VERIFIED** | Zero discrepancies in slug-to-ID order. |
| **Component Mapping** | 1,059 | 1,059 | **VERIFIED** | Every tool references its exact component name. |
| **Category Sum Reconciliation** | 1,059 | 1,059 | **VERIFIED** | Sum of all 74 categories equals exactly 1,059. |
| **Tier Breakdown Reconciliation** | 1,059 | 1,059 | **VERIFIED** | 1,023 Free + 35 Premium + 1 Review = 1,059. |

### 1.2 Discrepancies & Corrections Documented from the Initial Report

The initial audit was sound in total counts, but this validation identified three important nuances that must be documented:

1. **Subdirectory Path Resolution:**
   The initial extraction script initially searched `src/tools/` assuming a flat structure. In reality, the codebase organizes tools into subdirectories (e.g., `src/tools/office/InvoiceGenerator.jsx`, `src/tools/business/BusinessModelCanvasBuilder.jsx`, `src/tools/marketing/SeoContentDecayAuditCalculator.jsx`). Re-auditing with full path resolution confirmed that 100% of the 36 candidate component files exist on disk.
2. **Cap Table Discrepancy in Initial Narrative:**
   Section 3 of the initial report narrative listed a bullet item `#35 Cap Table / Equity Dilution Modeler`, but in the actual CSV data matrix, row `#1055 Campaign Budget Allocator` was candidate #34 and `#1056 Local SEO GBP Audit Planner` was candidate #35. The `cap-table` tool is registered in the Free-only tier (`math-unit-tools`/`finance-tools`). The CSV matrix itself was correct, but the prose narrative had an errant bullet name.
3. **The "Artificial Downgrade" Trap (Critical Finding):**
   The initial report proposed paid features (such as Batch ZIP download for the Instagram Carousel Splitter, and CSV/JSON downloads for the Business Model Canvas) that **are already fully built and operational in the free client-side components**. 
   * **Rule Enforced:** If a capability already works in the browser for free, proposing to gate it behind a paywall constitutes an artificial restriction that damages the existing user experience. Premium capabilities must represent **genuinely new, additive value**.

---

## 2. Task 2: Individual Evaluation of the 35 Premium Candidates

Every one of the 35 Premium Candidates and the 1 Review Tool was individually audited against its actual React component implementation.

### 2.1 Complete Candidate Evaluation Matrix

| ID | Tool Name & Slug | Component & File Path | Existing Capabilities in Code | Free Usability Status | Valid Pro Differentiation? | Recommendation & Boundary |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **27** | Invoice Generator<br>`invoice-generator` | `Invoice`<br>`src/tools/office/InvoiceGenerator.jsx` | Full item math, tax/discount calculation, HTML preview, clean print dialog, HTML download. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full math, unwatermarked print/save via browser, HTML file.<br>**Pro (New):** Server-rendered multi-currency vector PDF, custom agency logo/tax ID, saved client profiles. |
| **263** | Image to Text OCR<br>`image-to-text-ocr` | `ImageToText`<br>`src/tools/image/ImageToText.jsx` | Client-side Tesseract.js (WASM), image preview, text extraction, copy. | **100% Complete** | **YES (Infrastructure)** | **Keep Free:** Single-image client WASM extraction.<br>**Pro (New):** High-speed server queue OCR for multi-page scanned PDFs and batch images. |
| **308** | Commercial Lease Rent<br>`commercial-lease-rent-calculator` | `CommercialLeaseRentCalculator`<br>`src/tools/real-estate/CommercialLeaseRentCalculator.jsx` | NNN vs Gross math, CAM charges, square footage calculation, copy. | **100% Complete** | **BORDERLINE** | **Reclassify to FREE.** This is a mathematical calculation. Adding an artificial paywall would provide little value. Keep 100% free. |
| **316** | DCF Valuation Tool<br>`discounted-cash-flow-dcf-valuation-tool` | `DiscountedCashFlowDcfValuationTool`<br>`src/tools/finance/DiscountedCashFlowDcfValuationTool.jsx` | WACC, terminal value, enterprise value, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full intrinsic value math on-screen.<br>**Pro (New):** Sensitivity table matrix (WACC vs Growth rate), exportable financial model. |
| **380** | NDA Generator<br>`nda-generator` | `NdaGenerator`<br>`src/tools/legal/NdaGenerator.jsx` | Standard bilateral/unilateral clauses, jurisdiction selection, copy text. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full text generation and copy.<br>**Pro (New):** Formatted legal PDF contract download with signature lines and custom company branding. |
| **388** | Terms of Service Generator<br>`terms-of-service-generator` | `TermsOfServiceGenerator`<br>`src/tools/legal/TermsOfServiceGenerator.jsx` | Clauses selection, company name insertion, copy text. | **100% Complete** | **QUESTIONABLE** | **Keep Free.** Standard boilerplate generator. Users can easily copy to Word. Better kept 100% free for SEO authority. |
| **389** | Privacy Policy Generator<br>`privacy-policy-generator` | `PrivacyPolicyGenerator`<br>`src/tools/legal/PrivacyPolicyGenerator.jsx` | GDPR/CCPA clauses, cookies disclosure, copy text. | **100% Complete** | **QUESTIONABLE** | **Keep Free.** Standard boilerplate generator. Keep 100% free. |
| **875** | SWOT Analyzer<br>`swot-analyzer` | `SwotAnalyzer`<br>`src/tools/productivity/SwotAnalyzer.jsx` | 4 quadrants, card creation, JSON download, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Complete interactive matrix, on-screen analysis, JSON save.<br>**Pro (New):** Executive SWOT presentation PDF deck, TOWS strategic matching action plan. |
| **1010** | DCF Valuation Modeler<br>`dcf-valuation-calc` | `DcfValuationCalcTool`<br>`src/tools/finance/DcfValuationCalc.jsx` | Cash flow projections, terminal value, share price estimate, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full DCF calculation and ratios.<br>**Pro (New):** Multi-scenario (Bull/Base/Bear) comparison, downloadable Excel model (.xlsx). |
| **1020** | Carousel Splitter<br>`instagram-grid-carousel-splitter` | `InstagramGridCarouselSplitterTool`<br>`src/tools/social/InstagramGridCarouselSplitter.jsx` | HTML5 canvas image slicing, individual downloads, **JSZip batch download already built**, copy. | **100% Complete** | **NO (Already Built)** | **KEEP 100% FREE.** The initial report proposed Batch ZIP as a paid feature. However, JSZip is **already implemented and working**. Revoking it would be an unfair regression! |
| **1022** | Robots.txt & Sitemap Directives<br>`robots-sitemap-generator` | `RobotsSitemapGeneratorTool`<br>`src/tools/marketing/RobotsSitemapGenerator.jsx` | Bot directives builder, disallow rules, file download (.txt), copy. | **100% Complete** | **NO (Developer Utility)** | **Reclassify to FREE.** This is a text config builder. Locking it would provide no commercial moat. |
| **1023** | Schema JSON-LD Generator<br>`schema-json-ld-generator` | `SchemaJsonLdGeneratorTool`<br>`src/tools/marketing/SchemaJsonLdGenerator.jsx` | Schema types (Article, FAQ, LocalBiz), script snippet copy. | **100% Complete** | **NO (Developer Utility)** | **Reclassify to FREE.** Pure code generator. Commodity tool that belongs in the Free tier. |
| **1025** | SEO Redirect Map Builder<br>`seo-redirect-map-builder` | `SeoRedirectMapBuilderTool`<br>`src/tools/marketing/SeoRedirectMapBuilder.jsx` | Redirect rule creation, loop check, .htaccess/Nginx copy. | **100% Complete** | **NO (Developer Utility)** | **Reclassify to FREE.** Pure text config builder. Belongs in Free tier. |
| **1030** | Lean Canvas Builder<br>`lean-canvas-business-builder` | `LeanCanvasBusinessBuilderTool`<br>`src/tools/business/LeanCanvasBusinessBuilder.jsx` | 9-box business model canvas, local editing, canvas preview, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full interactive editing, on-screen results, JSON state save.<br>**Pro (New):** Unwatermarked executive PDF poster export, presentation mode. |
| **1031** | Sales Funnel Velocity<br>`sales-funnel-velocity-calculator` | `SalesFunnelVelocityCalculatorTool`<br>`src/tools/business/SalesFunnelVelocityCalculator.jsx` | Multi-stage conversion math, velocity ($/day), copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Complete velocity formula calculation.<br>**Pro (New):** Multi-pipeline comparative modeling, quota capacity simulations. |
| **1032** | SaaS CAC Payback Matrix<br>`saas-cac-payback-matrix` | `SaasCacPaybackMatrixTool`<br>`src/tools/business/SaasCacPaybackMatrix.jsx` | CAC payback months, LTV/CAC, Rule of 40 evaluation, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full SaaS health metrics on-screen.<br>**Pro (New):** Investor-ready SaaS KPI board report PDF, cohort churn sensitivity simulator. |
| **1033** | Sales Commission Calculator<br>`sales-commission-calculator` | `SalesCommissionCalculatorTool`<br>`src/tools/business/SalesCommissionCalculator.jsx` | Multi-tier accelerators, attainment brackets, payout math, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Commission calculation on-screen.<br>**Pro (New):** Sales team comp plan PDF export, team roster payout CSV export. |
| **1034** | Agency Client Retainer<br>`agency-retainer-calculator` | `AgencyRetainerCalculatorTool`<br>`src/tools/freelance/AgencyRetainerCalculator.jsx` | Retainer hours, effective rate, margin calculation, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full retainer profitability math.<br>**Pro (New):** Client pricing proposal PDF with agency branding, scope agreement template. |
| **1035** | Marketing Attribution ROI<br>`marketing-attribution-roi-model` | `MarketingAttributionRoiModelTool`<br>`src/tools/freelance/MarketingAttributionRoiModel.jsx` | 4 attribution models (First, Last, Linear, Time-Decay), ROI comparison, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full multi-model attribution math on-screen.<br>**Pro (New):** Executive CMO marketing attribution audit PDF, custom weighted attribution. |
| **1036** | Agency Pitch Proposal<br>`agency-pitch-proposal-generator` | `AgencyPitchProposalGeneratorTool`<br>`src/tools/freelance/AgencyPitchProposalGenerator.jsx` | 5 proposal sections, timeline/scope builder, copy text. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full proposal drafting and text copy.<br>**Pro (New):** Agency white-label multi-page proposal PDF with logo and contract terms. |
| **1039** | Agency Blended Rate<br>`agency-blended-rate-calculator` | `AgencyBlendedRateCalculatorTool`<br>`src/tools/freelance/AgencyBlendedRateCalculator.jsx` | Role billing rates, margin targets, blended rate math, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full blended rate math.<br>**Pro (New):** Agency rate card PDF/CSV export, team staffing capacity simulator. |
| **1042** | SEO Content Decay<br>`seo-content-decay-audit-calculator` | `SeoContentDecayAuditCalculatorTool`<br>`src/tools/marketing/SeoContentDecayAuditCalculator.jsx` | Decay velocity, traffic loss estimation, revenue impact math, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Traffic decay and revenue loss calculation.<br>**Pro (New):** Content refresh prioritization matrix, client business case PDF report. |
| **1044** | Business Model Canvas<br>`business-model-canvas-builder` | `BusinessModelCanvasBuilderTool`<br>`src/tools/business/BusinessModelCanvasBuilder.jsx` | 9-box canvas, sticky cards, **print dialog, CSV export, and JSON export already built**, canvas drawing. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full interactive canvas, existing CSV/JSON export, browser print.<br>**Pro (New):** Vector PDF presentation poster, custom brand colors, investor deck format. |
| **1045** | Value Proposition Canvas<br>`value-proposition-canvas-mapper` | `ValuePropositionCanvasMapperTool`<br>`src/tools/business/ValuePropositionCanvasMapper.jsx` | Customer profile vs Value map, **print dialog, CSV export, JSON export already built**, canvas. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full interactive mapping, CSV/JSON export, browser print.<br>**Pro (New):** Executive fit report PDF, pain-reliever priority matrix. |
| **1046** | Sales Pipeline Stage Velocity<br>`sales-pipeline-stage-planner` | `SalesPipelineStagePlannerTool`<br>`src/tools/business/SalesPipelineStagePlanner.jsx` | Pipeline stage conversion, drop-off diagnosis, **CSV download already built**. | **100% Complete** | **YES (Additive)** | **Keep Free:** Pipeline calculations and existing CSV download.<br>**Pro (New):** Executive revenue leakage mitigation report PDF, stage benchmark analysis. |
| **1047** | Business Idea Validation<br>`business-idea-validation-planner` | `BusinessIdeaValidationPlannerTool`<br>`src/tools/business/BusinessIdeaValidationPlanner.jsx` | 5-stage scorecard, viability score, text report download. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full validation scorecard and text export.<br>**Pro (New):** Investor-ready venture validation brief PDF. |
| **1048** | Revenue Model Comparison<br>`revenue-model-comparison-calculator` | `RevenueModelComparisonCalculatorTool`<br>`src/tools/business/RevenueModelComparisonCalculator.jsx` | Subscription vs Usage vs One-time modeling, comparative metrics. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full comparative financial modeling on-screen.<br>**Pro (New):** 3-year transition sensitivity simulation, financial model export. |
| **1049** | Project Scope Pricing<br>`project-scope-pricing-estimator` | `ProjectScopePricingEstimatorTool`<br>`src/tools/freelance/ProjectScopePricingEstimator.jsx` | Work breakdown structure, buffer margins, **CSV download already built**. | **100% Complete** | **YES (Additive)** | **Keep Free:** Pricing math and existing CSV export.<br>**Pro (New):** Formal Statement of Work (SOW) client agreement PDF. |
| **1050** | Cold Email Deliverability<br>`cold-email-outreach-planner` | `ColdEmailOutreachPlannerTool`<br>`src/tools/business/ColdEmailOutreachPlanner.jsx` | Warmup ramp schedule, inbox volume limits, bounce thresholds. | **100% Complete** | **QUESTIONABLE** | **Keep Free.** Good educational planning tool, but difficult to justify as paid without live SMTP inbox testing. |
| **1051** | Technical SEO Pre-Launch Audit<br>`technical-seo-audit-checklist` | `TechnicalSeoAuditChecklistTool`<br>`src/tools/marketing/TechnicalSeoAuditChecklist.jsx` | 24-point pre-launch checklist, instant health score, print dialog, text download. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full 24-point audit, on-screen results, text download.<br>**Pro (New):** Agency white-label client audit PDF report, Jira/Asana CSV task export. |
| **1052** | Content Brief Builder<br>`content-brief-generator` | `ContentBriefGeneratorTool`<br>`src/tools/marketing/ContentBriefGenerator.jsx` | Editorial spec builder, keyword mapping, text download, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full brief drafting, text download, copy.<br>**Pro (New):** Formatted writer brief PDF/Word export with editorial checklist. |
| **1053** | Landing Page CRO Audit<br>`landing-page-audit-checklist` | `LandingPageAuditChecklistTool`<br>`src/tools/marketing/LandingPageAuditChecklist.jsx` | CRO scoring rubric across 5 dimensions, print dialog, text download, copy. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full CRO checklist scoring, browser print.<br>**Pro (New):** Executive CRO audit report PDF with conversion priority roadmap. |
| **1054** | SEO Internal Linking Cluster<br>`internal-linking-cluster-architect` | `InternalLinkingClusterArchitectTool`<br>`src/tools/marketing/InternalLinkingClusterArchitect.jsx` | Pillar/cluster architecture, anchor text rules, **CSV download and text download built**. | **100% Complete** | **YES (Additive)** | **Keep Free:** Cluster mapping and existing CSV export.<br>**Pro (New):** Content architecture visual diagram export (SVG/PDF), multi-cluster storage. |
| **1055** | Marketing Campaign Budget<br>`campaign-budget-allocator` | `CampaignBudgetAllocatorTool`<br>`src/tools/marketing/CampaignBudgetAllocator.jsx` | Multi-channel budget math, conversions forecast, blended CAC. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full budget allocation math on-screen.<br>**Pro (New):** Executive CMO marketing plan PDF, channel optimization scenario modeling. |
| **1056** | Local SEO GBP Audit Planner<br>`local-seo-gbp-audit-planner` | `LocalSeoGbpAuditPlannerTool`<br>`src/tools/marketing/LocalSeoGbpAuditPlanner.jsx` | Google Business Profile checklist, local ranking factors, print dialog, text download. | **100% Complete** | **YES (Additive)** | **Keep Free:** Complete GBP checklist, on-screen recommendations, text download.<br>**Pro (New):** Agency client local SEO audit report PDF with agency branding. |
| **1059** | Client Retainer ROI Report<br>`client-retainer-roi-report-generator` | `ClientRetainerRoiReportGeneratorTool`<br>`src/tools/freelance/ClientRetainerRoiReportGenerator.jsx` | Deliverables vs hours tracking, ROI calculation, print dialog, text download. | **100% Complete** | **YES (Additive)** | **Keep Free:** Full retainer deliverables math, text download.<br>**Pro (New):** Monthly executive client performance report PDF with white-label branding. |

### 2.2 Critical Boundary Insights

1. **Tools Recommended for Immediate Reclassification to 100% FREE (6 Tools):**
   - `instagram-grid-carousel-splitter` (#1020): JSZip is already fully implemented client-side. Paywalling it would be an unfair regression.
   - `robots-sitemap-generator` (#1022), `schema-json-ld-generator` (#1023), `seo-redirect-map-builder` (#1025): These generate pure code/directives snippets that developers can copy. There is no legitimate SaaS moat here.
   - `commercial-lease-rent-calculator` (#308): Simple math formula; belongs in the free real-estate calculator suite.
   - `cold-email-outreach-planner` (#1050): Mathematical ramp schedule without live SMTP checking; better left 100% free.
2. **Refined Premium Candidate Pool (29 Tools):**
   - The remaining 29 tools genuinely generate high-value commercial assets (agency proposals, business model canvases, DCF valuations, technical client audits, and NDA agreements).
   - In all 29 tools, **100% of current functionality remains completely free**. The premium tier is exclusively reserved for **new, server-rendered white-label client deliverables and multi-scenario modeling**.

---

## 3. Task 3: Assessment of Backend Architecture Claims

### 3.1 SQLite Persistence & Container Lifecycles

* **Claim:** "The Laravel backend database resets on redeployment."
* **Verified Code Facts:**
  - In `api/Dockerfile` (lines 27–32):
    ```dockerfile
    RUN touch database/database.sqlite && chmod 666 database/database.sqlite
    CMD ["sh", "-c", "php artisan key:generate --force || true; php artisan migrate --force || true; php artisan db:seed --force || true; php -S 0.0.0.0:${PORT:-8080} -t public"]
    ```
  - In `api/railway.json`: Builds from `Dockerfile`, replica count 1. No volume mounts specified.
  - In `render.yaml`: `DB_CONNECTION: sqlite`, `DB_DATABASE: /var/www/html/database/database.sqlite`. No disk mount.
* **Finding:** The assessment is **verified fact**. Every time a code push triggers a container rebuild, the container image is replaced, recreating an empty `database.sqlite` file and regenerating `APP_KEY`. Without a persistent volume mount or an external database, all local database state is lost upon deployment.

### 3.2 Authentication & Authorization Reality

* **Claim:** "Sanctum authentication is implemented and ready."
* **Verified Code Facts:**
  - `laravel/sanctum` (v4.0) is installed and active in `api/routes/api.php`.
  - `User.php` has `HasApiTokens`, `role`, and `isAdmin()`.
  - However, there are **no subscription middleware, no subscription tables, and no role-based permission policies** in the backend.
  - `CheckoutController.php` contains a mock stub (`payment_method: 'stripe,paypal,sandbox'`) that instantly marks transactions as `completed` without calling any payment gateway API.
* **Finding:** The authentication foundation is present, but subscription entitlement checking and payment processing are currently stubs.

### 3.3 Server-Side PDF & ZIP Generation Feasibility

* **Claim:** "The backend can generate unwatermarked vector PDFs and ZIP files."
* **Verified Code Facts:**
  - In `api/composer.json`: No PDF library is installed (neither `barryvdh/laravel-dompdf`, `spatie/browsershot`, nor `mpdf`).
  - In `api/Dockerfile`: Only basic PHP extensions are installed; there is no headless Chrome, Node.js, or Chromium binary for rendering React HTML to PDF.
  - The server runs on `php -S` (PHP built-in CLI web server), which is single-threaded and unsuitable for long-running headless browser rendering.
* **Finding:** The backend **cannot generate PDFs today**. Generating PDFs server-side will require either:
  1. Installing a PHP PDF generator like `dompdf` in `composer.json` (lightweight, handles standard HTML/CSS).
  2. Or using client-side `pdf-lib` / `jspdf` where unwatermarked generation is unlocked by an authenticated token check.

---

## 4. Summary of Validation Findings

1. **Inventory Integrity:** The 1,059 tool inventory, 74 categories, and 1,059 unique slugs are 100% verified with zero discrepancies.
2. **Boundary Fairness:** 6 tools originally flagged as Premium Candidates must remain 100% Free because their features already exist or represent commodity developer snippets.
3. **No Artificial Downgrades:** Free users must retain full access to all existing features (including the carousel splitter's ZIP export and canvas builders' CSV/JSON exports).
4. **Backend Readiness:** Before introducing paid features, the backend requires a persistent database (PostgreSQL or mounted SQLite volume) and a real PDF rendering engine.
