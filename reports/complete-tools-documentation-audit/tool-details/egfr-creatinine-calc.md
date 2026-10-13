# eGFR & Creatinine Clearance Calculator

**Tool Slug:** `egfr-creatinine-calc`  
**Category:** Health & Wellness Tools (`health-wellness-tools`)  
**Subcategory:** Body & Metabolic Metrics (`body-metrics-health`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/health-wellness-tools/egfr-creatinine-calc](https://charming-vitality-production-dd02.up.railway.app/health-wellness-tools/egfr-creatinine-calc)  

---

## 1. Purpose & Intended Use Case
Calculate eGFR via 2021 CKD-EPI and CrCl via Cockcroft-Gault for clinical renal function.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Serum Creatinine, Creatinine Unit, Patient Biological Sex, Age (Years, 18+), Patient Weight (kg), Copy eGFR / CrCl Findings
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `EgfrCreatinineCalcTool`
- **Component Path:** `../tools/health/EgfrCreatinineCalcTool.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (154 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
