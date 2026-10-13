# UTM Builder

**Tool Slug:** `utm-builder`  
**Category:** Marketing Tools (`marketing-tools`)  
**Subcategory:** Campaigns & Advertising (`campaign-tracking-advertising`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/marketing-tools/utm-builder](https://charming-vitality-production-dd02.up.railway.app/marketing-tools/utm-builder)  

---

## 1. Purpose & Intended Use Case
Add UTM campaign parameters to any URL for clean analytics tracking.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Destination URL, Source (required), Medium (required), Campaign (required), Term (optional), Content (optional)
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `Utm`
- **Component Path:** `../tools/marketing/UtmBuilder.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (38 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
