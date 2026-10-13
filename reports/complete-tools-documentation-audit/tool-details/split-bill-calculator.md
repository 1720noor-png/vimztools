# Split Bill Calculator

**Tool Slug:** `split-bill-calculator`  
**Category:** Shopping Tools (`shopping-tools`)  
**Subcategory:** Taxes, Fees & Shipping (`tax-fees-shipping-costs`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/shopping-tools/split-bill-calculator](https://charming-vitality-production-dd02.up.railway.app/shopping-tools/split-bill-calculator)  

---

## 1. Purpose & Intended Use Case
Split a bill equally, or by what each person ordered, with shared dishes, tax and tip divided fairly.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** How do you want to split?, Bill total, Tip (%), Number of people, Shared items (split equally), Total tax (shared in proportion)
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `SplitBill`
- **Component Path:** `../tools/shopping/SplitBillCalculator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (76 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
