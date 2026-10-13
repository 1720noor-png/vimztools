# SEO Title Generator

**Tool Slug:** `seo-title-generator`  
**Category:** Marketing Tools (`marketing-tools`)  
**Subcategory:** SEO & Content Optimization (`seo-content-optimization`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/marketing-tools/seo-title-generator](https://charming-vitality-production-dd02.up.railway.app/marketing-tools/seo-title-generator)  

---

## 1. Purpose & Intended Use Case
Generate several title ideas for a topic, with character counts and truncation guidance.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Topic or keyword *, Keyword type, Brand (optional, added if it fits), Number for list titles, Dropdown Selection
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `SeoTitle`
- **Component Path:** `../tools/marketing/SeoTitleGenerator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (37 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
