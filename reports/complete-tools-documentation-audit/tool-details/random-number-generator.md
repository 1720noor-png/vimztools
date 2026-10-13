# Quick Random Number Drawer

**Tool Slug:** `random-number-generator`  
**Category:** Productivity Tools (`productivity-tools`)  
**Subcategory:** Workflow Utilities & Randomizers (`workflow-randomizers-utilities`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/productivity-tools/random-number-generator](https://charming-vitality-production-dd02.up.railway.app/productivity-tools/random-number-generator)  

---

## 1. Purpose & Intended Use Case
Generate one or many random whole numbers or decimals in a range, with optional no-repeat and sorting.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Minimum, Maximum, How many numbers (1–1000), Decimal places (0–6), Checkbox Option
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `RandNum`
- **Component Path:** `../tools/productivity/RandomNumberGenerator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (42 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
