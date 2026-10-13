# Meta Tag Generator

**Tool Slug:** `meta-tag-generator`  
**Category:** Marketing Tools (`marketing-tools`)  
**Subcategory:** SEO & Content Optimization (`seo-content-optimization`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/marketing-tools/meta-tag-generator](https://charming-vitality-production-dd02.up.railway.app/marketing-tools/meta-tag-generator)  

---

## 1. Purpose & Intended Use Case
Generate title, description, robots, canonical and Open Graph tags as copyable HTML.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Keywords (optional, comma separated), Canonical / page URL, Social image URL, Site name, Robots, Open Graph type
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `Meta`
- **Component Path:** `../tools/marketing/MetaTagGenerator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (49 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
