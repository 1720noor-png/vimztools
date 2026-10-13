# RICE Feature Prioritization Calculator

**Tool Slug:** `rice-prioritization-calc`  
**Category:** Business Operations Tools (`business-tools`)  
**Subcategory:** Operations & Capacity Planning (`operations-planning`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/business-tools/rice-prioritization-calc](https://charming-vitality-production-dd02.up.railway.app/business-tools/rice-prioritization-calc)  

---

## 1. Purpose & Intended Use Case
Score and prioritize product backlogs and strategic initiatives using Reach, Impact, Confidence, and Effort.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Feature / Initiative Name, Reach (Users / Month), Impact Level, Confidence (%), Effort (Person-Months / Sprints), Copy Ranked Backlog
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `RicePrioritizationCalcTool`
- **Component Path:** `../tools/business/RicePrioritizationCalcTool.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (145 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
