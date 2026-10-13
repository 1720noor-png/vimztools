# A/B Test Sample Size Calculator

**Tool Slug:** `ab-test-sample-calc`  
**Category:** Marketing Tools (`marketing-tools`)  
**Subcategory:** Campaigns & Advertising (`campaign-tracking-advertising`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/marketing-tools/ab-test-sample-calc](https://charming-vitality-production-dd02.up.railway.app/marketing-tools/ab-test-sample-calc)  

---

## 1. Purpose & Intended Use Case
Calculate the required sample size and experiment duration per variation to achieve statistical power.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Baseline Conversion Rate (%), Minimum Detectable Effect / MDE (% Relative Lift), Significance Level (Alpha / Confidence), Statistical Power (1 - Beta), Total Daily Experiment Traffic (Visitors/day), Total Test Variations (Including Control)
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `AbTestSampleCalcTool`
- **Component Path:** `../tools/marketing/AbTestSampleCalcTool.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (143 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
