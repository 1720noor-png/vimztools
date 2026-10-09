# Vimz.ai — Existing Tools Upgraded & Disambiguated

**Date:** October 9, 2026  
**Scope:** Disambiguation of duplicate display names, registry integrity repairs, and category enhancements.

---

## 1. Category Registry Repairs
Prior to this expansion, two categories were used across 24 tools in the registry but were not declared in the `categories` navigation array in `src/data/registry.js`:
- `privacy-tools` (17 tools)
- `women-tools` (7 tools)

Both categories were officially added to `export const categories`, providing first-class category navigation, breadcrumb routing, and category landing page rendering.

---

## 2. Subcategory Assignment Normalization
240 tools had undefined or blank `subcat` fields. Canonical subcategories were assigned to all 240 tools based on tool intent and category hierarchy:
- `ai-tools` -> `generators`, `writing`, `productivity`
- `marketing-tools` -> `seo`, `social`, `analytics`, `content`
- `business-tools` -> `strategy`, `finance`, `sales`, `planning`
- `freelance-tools` -> `pricing`, `invoicing`, `contracts`, `reporting`
- `privacy-tools` -> `encryption`, `compliance`, `security`
- `women-tools` -> `health`, `finance`, `wellness`, `career`
- ...and other relevant categories.
All 1,059 tools now have valid `category` and `subcat` definitions.

---

## 3. Disambiguated Duplicate Display Names
All 13 duplicate display name pairs were modified with clear, distinct names while keeping all unique slugs unchanged:

| Slug | Original Name | Updated Disambiguated Name |
|---|---|---|
| `sales-tax-calculator` | Sales Tax Calculator | Standard Sales Tax Calculator |
| `advanced-sales-tax-calculator` | Sales Tax Calculator | Advanced Sales Tax & Exemption Calculator |
| `gpa-calculator` | GPA Calculator | College GPA Calculator |
| `high-school-gpa-calculator` | GPA Calculator | High School GPA & Weighted Calculator |
| `compound-interest-calculator` | Compound Interest Calculator | Standard Compound Interest Calculator |
| `investment-growth-calculator` | Compound Interest Calculator | Investment Growth & Dividend Compound Calculator |
| `tip-calculator` | Tip Calculator | Quick Tip & Bill Splitter |
| `restaurant-tip-calculator` | Tip Calculator | Restaurant Tip & Gratuity Calculator |
| `hourly-to-salary-calculator` | Hourly to Salary Calculator | Basic Hourly to Salary Converter |
| `paycheck-wage-calculator` | Hourly to Salary Calculator | Comprehensive Paycheck Wage & Deductions Calculator |
| `word-counter` | Word Counter | Standard Word & Character Counter |
| `advanced-word-counter` | Word Counter | Advanced Word, Readability & Density Counter |
| `json-formatter` | JSON Formatter | Standard JSON Formatter & Validator |
| `json-beautifier` | JSON Formatter | Advanced JSON Beautifier & Minifier |
| `markdown-to-html` | Markdown to HTML | Standard Markdown to HTML Converter |
| `markdown-html-converter` | Markdown to HTML | Live Markdown to HTML Previewer |
| `case-converter` | Case Converter | Standard Text Case Converter |
| `text-case-converter` | Case Converter | Multi-Format String & Case Converter |
| `discount-calculator` | Discount Calculator | Simple Discount & Sale Calculator |
| `sale-price-calculator` | Discount Calculator | Sale Price & Multi-Tier Discount Calculator |
| `age-calculator` | Age Calculator | Chronological Age Calculator |
| `exact-age-calculator` | Age Calculator | Exact Age, Weeks & Days Calculator |
| `calorie-calculator` | Calorie Calculator | Daily Calorie & TDEE Calculator |
| `macro-calorie-calculator` | Calorie Calculator | Macronutrient & Calorie Target Calculator |
| `bmi-calculator` | BMI Calculator | Standard BMI Calculator |
| `adult-child-bmi-calculator` | BMI Calculator | Adult & Pediatric BMI Health Calculator |

---

## 4. Previously Upgraded Core Tools
In Phase 1 of the modernization:
- `ab-test-calculator`: Upgraded to valid two-proportion z-tests, two-tailed p-values, 90/95/99% confidence intervals, and required sample size estimation.
- `swot-analyzer`: Upgraded with SO, WO, ST, and WT strategic cross-matrix generation, priority scoring, and export capabilities.
