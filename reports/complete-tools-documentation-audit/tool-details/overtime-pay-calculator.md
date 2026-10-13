# Overtime Pay & Wage Calculator

**Tool Slug:** `overtime-pay-calculator`  
**Category:** Office Tools (`office-tools`)  
**Subcategory:** Compensation & Payroll (`workplace-compensation-payroll`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/office-tools/overtime-pay-calculator](https://charming-vitality-production-dd02.up.railway.app/office-tools/overtime-pay-calculator)  

---

## 1. Purpose & Intended Use Case
Calculate total weekly gross earnings including regular hours, overtime (1.5x), and double time (2x).

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Base Hourly Wage ($), Regular Hours (1.0x), Overtime Hours (1.5x), Double Time Hours (2.0x)
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `OvertimePayCalculator`
- **Component Path:** `../tools/office/OvertimePayCalculator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (52 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
