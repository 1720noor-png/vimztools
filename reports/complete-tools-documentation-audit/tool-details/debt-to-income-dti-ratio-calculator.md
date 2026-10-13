# Debt-to-Income (DTI) Ratio Calculator

**Tool Slug:** `debt-to-income-dti-ratio-calculator`  
**Category:** Finance & Investment Tools (`finance-tools`)  
**Subcategory:** Loan & Debt Calculators (`loan-debt`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/finance-tools/debt-to-income-dti-ratio-calculator](https://charming-vitality-production-dd02.up.railway.app/finance-tools/debt-to-income-dti-ratio-calculator)  

---

## 1. Purpose & Intended Use Case
Calculate gross monthly debt-to-income (DTI) ratio used by mortgage and personal loan lenders.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Gross Monthly Income ($), Monthly Housing Debt / Rent ($), Monthly Car Payments ($), Student Loans & Credit Minimums ($)
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `DebtToIncomeDtiRatioCalculator`
- **Component Path:** `../tools/finance/DebtToIncomeDtiRatioCalculator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (67 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
