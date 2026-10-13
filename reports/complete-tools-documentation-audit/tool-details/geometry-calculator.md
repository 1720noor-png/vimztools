# 2D & 3D Geometry Calculator

**Tool Slug:** `geometry-calculator`  
**Category:** Math & Unit Conversion Tools (`math-unit-tools`)  
**Subcategory:** Geometry & Statistics (`geometry-statistics`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/math-unit-tools/geometry-calculator](https://charming-vitality-production-dd02.up.railway.app/math-unit-tools/geometry-calculator)  

---

## 1. Purpose & Intended Use Case
Calculate area, perimeter, surface area, and volume for 2D shapes and 3D solids.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Select Geometric Shape, Radius (r), Length (l), Width (w), Base (b), Height (h)
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `GeometryCalc`
- **Component Path:** `../tools/math/GeometryCalculator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (163 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
