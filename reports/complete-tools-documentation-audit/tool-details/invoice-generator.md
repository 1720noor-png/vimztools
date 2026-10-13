# Invoice Generator

**Tool Slug:** `invoice-generator`  
**Category:** Office Tools (`office-tools`)  
**Subcategory:** Business Communications & Forms (`business-communications-forms`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/office-tools/invoice-generator](https://charming-vitality-production-dd02.up.railway.app/office-tools/invoice-generator)  

---

## 1. Purpose & Intended Use Case
Create an itemised invoice with automatic subtotal, discount, tax and total, then print or download it.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Your business name *, Business email, Customer name *, Business address, Customer address, Invoice number *
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** Client-side copy to clipboard, text/JSON/CSV deliverable export

## 5. Source Code & Architecture
- **Component Identifier:** `Invoice`
- **Component Path:** `../tools/office/InvoiceGenerator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (73 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
