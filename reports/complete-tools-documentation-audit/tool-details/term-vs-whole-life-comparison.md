# Term vs Whole Life Insurance Comparison

**Tool Slug:** `term-vs-whole-life-comparison`  
**Category:** Insurance Tools (`insurance-tools`)  
**Subcategory:** Life & Disability Needs (`life-health-disability-needs`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/insurance-tools/term-vs-whole-life-comparison](https://charming-vitality-production-dd02.up.railway.app/insurance-tools/term-vs-whole-life-comparison)  

---

## 1. Purpose & Intended Use Case
Model the classic "buy term, invest the difference" comparison between term and whole life insurance.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Term life annual premium ($), Whole life annual premium ($), Years to compare, Assumed investment return (%)
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** Client-side copy to clipboard, text/JSON/CSV deliverable export

## 5. Source Code & Architecture
- **Component Identifier:** `TermVsWholeLifeComparison`
- **Component Path:** `../tools/insurance/TermVsWholeLifeComparison.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (42 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
