# One-Rep Max (1RM) Calculator

**Tool Slug:** `one-rep-max-calculator`  
**Category:** Fitness & Personal Health Tools (`fitness-tools`)  
**Subcategory:** Workout & Performance Tools (`workout-performance`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/fitness-tools/one-rep-max-calculator](https://charming-vitality-production-dd02.up.railway.app/fitness-tools/one-rep-max-calculator)  

---

## 1. Purpose & Intended Use Case
Estimate your 1RM for bench press, squat, or deadlift and generate training percentages.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** Reps Performed (1-12), Weight Unit, Copy 1RM Matrix, Dropdown Selection
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `OneRepMax`
- **Component Path:** `../tools/fitness/OneRepMaxCalculator.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (98 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
