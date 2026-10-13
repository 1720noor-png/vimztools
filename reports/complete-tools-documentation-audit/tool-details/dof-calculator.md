# Macro & Portrait DoF Simulator

**Tool Slug:** `dof-calculator`  
**Category:** Photography Tools (`photography-tools`)  
**Subcategory:** Camera Settings (`camera-settings`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/photography-tools/dof-calculator](https://charming-vitality-production-dd02.up.railway.app/photography-tools/dof-calculator)  

---

## 1. Purpose & Intended Use Case
Macro & Portrait DoF Simulator utility for Camera Settings.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Focal Length (mm), Aperture (f/), Subject Distance (m), Sensor Width (mm), 50
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** Client-side copy to clipboard, text/JSON/CSV deliverable export

## 5. Source Code & Architecture
- **Component Identifier:** `DofCalculator`
- **Component Path:** `../tools/photography/DofCalculator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (35 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
