# BMI & Body Composition Calculator

**Tool Slug:** `bmi-body-health-calculator`  
**Category:** Health & Wellness Tools (`health-wellness-tools`)  
**Subcategory:** Body & Metabolic Metrics (`body-metrics-health`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/health-wellness-tools/bmi-body-health-calculator](https://charming-vitality-production-dd02.up.railway.app/health-wellness-tools/bmi-body-health-calculator)  

---

## 1. Purpose & Intended Use Case
Calculate Body Mass Index (BMI), healthy weight range, and body mass category.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** ft, in
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** Client-side copy to clipboard, text/JSON/CSV deliverable export

## 5. Source Code & Architecture
- **Component Identifier:** `BmiHealthCalculator`
- **Component Path:** `../tools/women/BmiHealthCalculator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (111 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
