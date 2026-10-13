# Golden Hour Calculator

**Tool Slug:** `golden-hour-calculator`  
**Category:** Photography Tools (`photography-tools`)  
**Subcategory:** Photo Planning (`photo-planning`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/photography-tools/golden-hour-calculator](https://charming-vitality-production-dd02.up.railway.app/photography-tools/golden-hour-calculator)  

---

## 1. Purpose & Intended Use Case
Get golden hour and blue hour windows from a sunrise and sunset time.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Sunrise time, Sunset time
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** Client-side copy to clipboard, text/JSON/CSV deliverable export

## 5. Source Code & Architecture
- **Component Identifier:** `GoldenHourCalculator`
- **Component Path:** `../tools/photography/GoldenHourCalculator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (45 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
