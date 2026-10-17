# vimz-tools — Project Memory

Always read this file at the start of any session. It is the canonical memory for this
frontend web app so you can resume work with full context instantly.

## What this app is
"vimz.ai — Every Tool You Need, Right in Your Browser." A large client-side-only web app
(React 19 + Vite) with 297+ tools in the main catalog plus category portals. All tools run
100% in the browser — no uploads, no backend for the tools. There is a SEPARATE Laravel
backend project in the sibling folder `vimz-tools-backend` (do not modify it).

## Project root
`C:\Users\Lenovo\Documents\Default Project\vimz-tools`
- Frontend (THIS project): `vimz-tools`
- Backend (untouchable, separate): `C:\Users\Lenovo\Documents\Default Project\vimz-tools-backend`

## Stack
React 19, TypeScript ~6.0, Vite 8, Tailwind CSS v4 (via `@tailwindcss/vite`, CSS-first config
in `src/index.css`), `react-router-dom` v7, `lucide-react` (icons), `oxlint` (lint, not eslint).
Key libs: pdf-lib, pdfjs-dist, tesseract.js, jspdf, mammoth (Word→PDF), html2pdf.js, chart.js +
react-chartjs-2, cropperjs, qrcode, html5-qrcode, dayjs/date-fns, docx, jszip.

## Commands (shell is Windows PowerShell 5.1; use npm.cmd)
- Typecheck: `& ".\\node_modules\\.bin\\tsc.cmd" --noEmit -p tsconfig.app.json`
- Build: `npm.cmd run build` (tsc -b + vite build; ~7-9s)
- Lint: `npm.cmd run lint` → oxlint. Baseline = 1920 warnings, 0 errors. NEW CODE MUST ADD 0 ERRORS
  (warnings tolerated; they come from `public/ocr/` vendor files). Avoid unused vars/imports.
- Preview: `npm.cmd run preview -- --host 127.0.0.1 --port 4174 --strictPort` (current live preview
  runs here). Restart after each build: kill listener on 4174, start hidden, verify HTTP 200.

## Structure
- `src/App.tsx` — `createBrowserRouter` with all routes. Add new routes here.
- `src/components/layout/Layout.tsx` — global shell: mounts `AmbientBackground` inside
  `ToastProvider` before `<main>`; wraps `Header` + `<Outlet>` + `Footer`.
- `src/components/layout/Header.tsx` — logo (homepage button), desktop nav buttons (`links` array
  ~line 185 — nav items are `<button onClick={() => navigate(l.to)}>`, NOT anchors), search modal
  (Ctrl+K), theme toggle, mobile menu. Glass style: `bg-white/70 backdrop-blur-xl dark:bg-slate-900/70`.
- `src/components/layout/AmbientBackground.tsx` — fixed `-z-50` scroll-lerped gradient
  (`class="ambient-bg"`); light stops lavender→rose→cyan→mint, dark `#0F172A→#1E1B4B→#064E3B`.
- `src/lib/catalog.ts` — `categories: ToolCategory[]` (ends ~line 238) + `tools: Tool[]`
  (starts line 240, ends with `...HEALTH_NEW_TOOLS, ...OFFICE_TOOLS, ...HEALTH_TOOLS` then `]`;
  ~400 tools) + `getToolById(id)`.
  Tool fields: id, name, categoryId, category, description, keywords[], path, icon (string key),
  subcategory. Specialty tool arrays are spread in: `...OFFICE_TOOLS`, `...HEALTH_TOOLS`,
  `...HEALTH_NEW_TOOLS` (208 config-driven health tools generated from `allHealthToolConfigs`).
- `src/lib/categoryAccents.ts` — `exactCategories` (used by HomePage "Browse by category" grid,
  11 entries: PDF/Image/Documents/Women/Office Utilities/Students/Marketers/Office&Corporate/
  Blogs/Health/Household) + `getCategoryAccent(path)`. Each entry: {name, path, icon, bg, bgDark,
  accent}.
- `src/lib/numbers.ts` — `round(n, digits)`, `toNumber(raw: string): number` (returns `number`,
  safe). `src/lib/utils.ts` — `uid()`. `src/lib/toolRegistry.ts` / `useWinIndex` — collections
  index. `src/lib/folderAccent.ts` — collection tile accent classes.
- `src/components/ui/Cards.tsx` — `CategoryCard` (uses `iconMap[category.icon] ?? Zap`) and
  `ToolCard` (card link, shows ArrowRight tile — does NOT use iconMap).
- `src/components/ui/Fields.tsx` — `Field`, `TextInput`, `Select`, `TextArea`, `Button`
  (variant `primary`/`secondary`), etc. `Seo.tsx` — per-page title/description.
- `src/components/ui/CategoryHero.tsx` — accent-tinted hero band driven by CSS vars
  (`--cat-bg`, `--cat-bg-dark`, `--cat-accent`) via `.accent-hero`.
- `src/components/tools/ToolShell.tsx` — standard tool-page frame: icon, title, description,
  breadcrumb, instruction, collapsible `guideSteps` ("How to Use in 3 Simple Steps" steps) +
  `guideTips` box (heading default `Quick Tips & Suggestions`), and `children` = workspace. Both
  sections ALWAYS render (they have defaults) — do NOT duplicate them inside the workspace.
  All tools render inside ToolShell.
- `src/index.css` — Tailwind v4 theme tokens + custom UI classes:
  `.ambient-bg`, `.accent-hero`, `.ws-frame/.ws-strip/.ws-icon-tile` (workspace accent frame),
  `.cat-card` (hover: `translateY(-6px) scale(1.05)` + accent glow shadow; click `animate-glow-burst`),
  `.hlth-tile` (Health rose tiles), `.hh-tile`/`.hh-emoji`/`.hh-panel` (Household pastel tiles via
  per-tile CSS vars `--hh-bg/--hh-border/--hh-accent/--hh-bg-dark`), dark-mode overrides
  (`html.dark ...` includes `[class~="text-slate-400/500/600"]` color swaps and `html.dark .cat-card`).

## Category portal pattern (used for Health & Household)
1. Config module under `src/pages/<cat>/<cat>Config.ts` exporting subcategory array
   (id/title/emoji/tagline/description/icon/accent-ish HEX vars/toolIds) + helpers.
   Type-only import pattern (`import type { Tool }`) avoids runtime circular imports when catalog
   imports the config. Health's config exports `HEALTH_TOOLS: Tool[]` (16 curated tools),
   `HEALTH_NEW_TOOLS: Tool[]` (208 config-driven, generated from `allHealthToolConfigs`), and
   `HEALTH_TOTAL_FOLDERS`/`HEALTH_TOTAL_TOOLS`; both arrays are spread into catalog.ts.
   Household reuses EXISTING tool ids only (no new tools, no catalog spread).
2. `<Cat>HomePage.tsx` — `<Seo>`, breadcrumb, `<CategoryHero accent={getCategoryAccent('/<cat>')!}>`,
   grid of folder tiles linking `/cat/<sub>`.
3. `<Cat>SubcategoryPage.tsx` — breadcrumb `Home > <Cat> > Sub`, emoji chip (colored pastel),
   `ToolCard` grid from `toolIds.filter(getToolById)`, graceful empty state when no tools mapped.
4. App.tsx routes `/cat` + `/cat/:subcategory`; Header.tsx nav entry; categoryAccents.ts entry
   (gives homepage card + hero accent); index.css tile class if custom visual needed.
   Do NOT add a catalog category that owns zero tools (it creates a phantom "0 tools" section on
   the Tools page).

## Existing portals / routes
- `/` Home (category cards + collections + popular + features), `/tools`, `/tools/:category`,
  `/tools/:category/:toolSlug` (→ `DynamicToolPage`), `/women[/:sub]`, `/students[/:mainCat[/:sub]]`,
  `/marketers-seo[/:sub]` (23 subs; 94 classic tools + 226 spec-driven, see ROUND 7 below),
  `/office-corporate[/:moduleId[/:subcategoryId]]` (spec-driven office tools
from `src/pages/office/specs/mod*.ts` + `officeConfig.ts`), `/health[/:sub]` (19 folders; 224
   health tools = 16 curated + 208 config-driven under `src/pages/tools/health/`), `/household[/:sub]`
  (15 folders, curates existing tools; Pets/Moving/Safety intentionally empty until tools exist),
  `/category[/...]` (win collections), `/blogs`, `/blogs/submit`, `/blog/:slug`, `/privacy`,
  `/home`→`/`, `*`→NotFound.
- `/students-academics[/:subcategory]` (20 `acad-*` folders; 337 spec-driven tools, see ROUND 8
  below) — added alongside the older `/students` route, which is still live.
- `/image-tools[/:subcategory[/:tool]]` (20 folders; 233 identities / 238 placements / 228 new tools
  driven by one generic renderer, see ROUND 9 below). Legacy `/tools/image/*` tool pages stay live.
- `DynamicToolPage` (`src/pages/DynamicToolPage.tsx`): `staticImplementations` map `{'slug':
  Component}` starting ~line 264 (bmi-calculator) + health tool entries (~line 345); office tools
  registered via loop `staticImplementations[officeTool.id] = OfficeToolPage`; ALL 208 health
  tools registered via a loop that sets `staticImplementations[id] = () => <HealthGenericTool
  config={config} />` (imports `HealthGenericTool, { allHealthToolConfigs }` from
  `src/pages/tools/health/healthNewRegistry.tsx`). Add new tool components here.

## Health module (rounds 3 + 5 + 6 B)
- CURATED tools: in `src/pages/tools/health/` (16 files, each default-exports `<Seo>` +
  `<ToolShell>`). They use the generic ToolShell frame + rose `border-rose-100` panels.
- CONFIG-DRIVEN tools (208): `src/pages/tools/health/HealthGenericTool.tsx` defines
  `HealthToolConfig` (id/title/description/icon/breadcrumb/instruction/sub/emoji/accent/
  fields[]/compute/howItWorks/tips), `HealthResult` (title/value/unit/tone/badge/note/pct), and the
  generic component: rose outer frame, input panel + instant result panel (tone ring, badge, optional
  pct bar), passing `guideSteps={howItWorks}`/`guideTips={tips}`/`tipsTitle="Health Tips & Next
  Steps"` to ToolShell (do NOT re-render those sections in the workspace — ToolShell always renders
  them).
- CONFIGS: 13 group files under `src/pages/tools/health/registry/` — 6 originals
  (bodyWeightGroup 17, lifestyleGroup 18, womenSleepGroup 12, clinicGroup 18 incl. shared
  `converterConfig` helper, respKidneyGroup 10, dentalHairSymGroup 9) + 7 extras added in round 6 B
  (extrasWeightGroup 11, extrasFitnessHeartGroup 15, extrasWomenSleepGroup 24,
  extrasDiabetesMentalGroup 16, extrasBabyMedGroup 17, extrasClinicalHealthGroup 16 incl.
  cholesterol/hemoglobin unit converters, extrasDentalBeautySymptomGroup 25). Total 208 unique ids,
  no cross-file duplicates. Barrel `healthNewRegistry.tsx` exports `allHealthToolConfigs` + re-exports
  the generic component default. Imports of lib modules in these files use `../../../../lib/health/...`
  (one level deeper than HealthGenericTool). NOTE: folder `toolIds` also cross-curate non-health
  catalog tools (e.g. fitness-category bmi-calculator, body-fat-us-navy) — those resolve via
  `getToolById` and render with their own `/tools/fitness/*` paths, so health card counts on a folder
  page can be lower than the folder's toolIds length.
- FORMS: no runtime form lib; template uses `fin()` from `src/lib/health/guard.ts` to coerce field
  strings. IMPORTANT: select option `value`s MUST be numeric strings ('0'..'n') — `fin()` maps words
  to `null`; bool fields send '1'/'0'; date fields are parsed with `Date.parse`.
- MATH: one lib module + one `*.test.ts` per tool (or shared module for a group) under
  `src/lib/health/`. Unique pure functions, no side effects. Tests: `node --test
  "src/lib/health/*.test.ts"` (currently 175 passing; Node 24 runs TS directly, imports need
  explicit `.ts`; `assert.ok(fn())` fails when a valid result is 0/'' — assert exact values instead).
- FOLDERS (19) in `src/pages/health/healthConfig.ts`: body-weight, weight-management, nutrition,
  hydration, fitness, heart, womens-health, sleep, diabetes, mental-wellness, baby-kids,
  medication, medical-scores, blood-tests, respiratory, kidney, dental, hair-skin, symptoms.
  Icons: plus mentioned new ones — TrendingDown, FlaskConical, Wind, Droplet (no Lungs/Kidney in
  this lucide version). Registry `sub` labels must equal folder titles.

## Tool component locations
`src/pages/tools/<domain>/<Name>.tsx` (domains: pdf, image, win, utilities, study, student,
life, fitness, cooking, household(home), beauty, femhealth, health, office, career, marketing,
office topics...). Each default-exports a component that renders `<Seo>` + `<ToolShell>`. Health
tools added under `src/pages/tools/health/`.

## Recent work (already done, verified)
- ROUND 2 (visual restyle): AmbientBackground scroll gradient, CategoryHero, categoryAccents,
  transparent heroes, glass header, dark mode. Verified headless 15/15.
- ROUND 3 (Health portal): 14 folders + 16 new tools with "Quick Health Tips"; routes/header/
  accents/catalog wired. Verified headless 16/16.
- ROUND 4 (Household portal): 11th homepage card (amber #FEF3C7/#F59E0B), 15 folders with exact
  pastel specs, ~60 existing tools curate-mapped, empty states for empty folders, dark-mode glowing
  tiles. Verified headless 19/19. Tool cross-hidden; `utility-bill-splitter` intentionally listed in
  both Electricity & Utilities.
- ROUND 5 (Health expansion): 19 folders (Health portal), 86 config-driven tools via
  `HealthGenericTool` + `registry/*Group.tsx` (72/72 unit tests, tsc clean, lint 0 errors),
  catalog/DynamicToolPage wired, existing 16 health tools restyled to rose frame, no duplication of
  ToolShell sections. Verified headless 71/71 (new) + 36/36 (regression) + 8/8 (dark/dup).
- ROUND 6 B (Health Phase B, ongoing): 122 additional config-driven health tools across 7 extra
  `extras*Group.tsx` files → HEALTH_NEW_TOOLS now 208. All 19 folders' `toolIds` wired
  (258 entries / 257 unique; the dup is intentional cross-curation). New lib modules:
  objectives, fitnessPlanner, cardiovascularRisk, womenCycles, sleepPlanner, diabetesCare,
  mentalScore, babyCare, medicationPlan, clinicalExtra, kidneyResp, dentalBeauty, symptomChecks.
  175/175 unit tests, tsc clean, build OK, lint 0 errors. Note: `checkHealthIds.cjs` is
  regex-based (id strings anywhere in catalog/healthConfig/registry) — it does NOT reflect runtime
  resolution; live card counts on folder pages include cross-category links with different prefixes.
- Live preview restart flow established; UI verification scripts reused from
  `C:\Users\Lenovo\AppData\Local\Temp\opencode\uiVerify*.js` (self-contained CDP over Node's native
  WebSocket; spawns its own headless Chrome, `PortA + /json/new`, checks + console-error capture).
  Health-specific harnesses: `uiVerifyHealthNew.js` (19 subs + 24 tool pages + interacts),
  `uiVerifyHealthIds.cjs` through `checkHealthIds.cjs` (toolId cross-check), `uiVerifyRegression.cjs`,
  `uiVerifyDarkHealth.cjs`.
- ROUND 7 (Marketers & SEO expansion): 18 new marketing subcategories (marketers-seo now has 23
  subs; 5 original + 18 new below) + 226 config/spec-driven SEO & marketing tools. Specs live at
  `src/pages/marketing/specs/mod06.ts`–`mod23.ts` (each `MarketingSeoSpec[]`, reusing the OFFICE spec
  helpers from `src/pages/office/archetypes/spec.ts` — `T/n/sel/txt/ck/res/doc/asNum/asSel/asStr/
  asBoolList/pct/num/ratio/money/clamp`; `ck()` takes 3 args only, `res()` up to 4). Barrel
  `specs/index.ts` exports `marketingSeoSpecs`, `getMarketingSeoSpec(id)` (+ alias `marketingSpecs`).
  `src/pages/marketing/marketingSeoConfig.ts` maps specs → `MARKETING_SEO_TOOLS: Tool[]`
  (path `/tools/marketers-seo/<id>`, icon `'Megaphone'`, `subcategory: spec.subject`); it imports
  ONLY `import type { Tool }` from catalog (cycle avoidance) and defines its own
  `MARKETING_CATEGORY='marketers-seo'`/`MARKETING_CATEGORY_NAME='Marketers & SEO Specialists'`.
  Spread `...MARKETING_SEO_TOOLS` into catalog.ts (~line 3370). marketingConfig.ts gained 18
  subcategories (ids: keyword-content, link-building, local-seo, ecommerce, email-marketing,
  conversion-cro, website-seo-audit, on-page-seo, influencer-affiliate, youtube-video, app-aso,
  mk-calculators, mk-strategy, branding, ai-marketing, customer-reputation, pr-media,
  competitor-research; titles MUST equal spec `subject` exactly — 'Influencer & Affiliate Marketing'
  and 'YouTube & Video Marketing' differ from the short names). Renderer
  `src/pages/tools/marketing/MarketingSeoToolPage.tsx` = indigo frame
  (`rounded-2xl border border-indigo-100 dark:border-indigo-900/30 dark:bg-slate-900`), `SpecInput`
  per field, `ResultCard` with tone pills, methodology panel, ToolShell gets
  `guideSteps={spec.usage}` + `guideTips={[spec.tip]}` + `tipsTitle="Marketer's Pro Tip"`.
  Registered in DynamicToolPage via loop `staticImplementations[seoTool.id] = MarketingSeoToolPage`.
  226 ids unique, no collisions with existing catalog. Verified headless `uiVerifyMarketingSeo.js`
  (hub 23 tiles, all 18 subs exact card counts, 36 sample tool pages, zero console errors, live
  recompute, dark mode). Counts: mod06:14, 07:13, 08:12, 09:12, 10:13, 11:13, 12:16, 13:13, 14:12,
   15:14, 16:11, 17:14, 18:14, 19:13, 20:12, 21:11, 22:9, 23:10.
- ROUND 8 (Students & Academics expansion): new `/students-academics` portal with 20
  `acad-*` subcategories and 337 new spec-driven tools. Specs at
  `src/pages/students/specs/mod01.ts`–`mod20.ts`, one file per subcategory, each exporting
  `StudentSpec[]` (`{id,name,archetype,subject,blurb,tip,usage,method,fields,compute}`) and
  re-using the OFFICE field helpers from `src/pages/office/archetypes/spec.ts` — but note the
  students barrel is `specs/index.ts` → `studentSpecs` / `academicsSpecs` +
  `getStudentSpec(id)`, and `StudentResult` in `specs/studentSpec.ts` is the students' own type:
  `sres(label, value, tone?, hint?, pct?)`, `res(label, value, tone?, hint?)` (4 args),
  `docr(label, raw)` for code/formula blocks, plus `qrres({data,ec})` and `barres({modules,caption})`
  for the QR/EAN tools. Counts: mod01:19, 02:18, 03:21, 04:19, 05:17, 06:20, 07:22, 08:26, 09:19,
  10:17, 11:17, 12:12, 13:19, 14:20, 15:12, 16:12, 17:13, 18:12, 19:10, 20:12 = 337.
  `src/pages/students/studentAcademicsConfig.ts` derives `STUDENT_ACADEMICS_CATEGORY='students-academics'`
  (`'Students & Academics'`), the 20 subcategory objects (id/title/tagline/icon/accent, titles MUST
  equal the spec `SUBJECT` string exactly) and `STUDENT_ACADEMICS_TOOLS: Tool[]` mapped from
  `studentSpecs` (path `/tools/students-academics/<id>`, `subcategory: spec.subject`); it imports
  ONLY `import type { Tool }` from catalog (cycle avoidance) and auto-assigns `acad-*` subcategories
  by matching each spec's `subject`. Spread `...STUDENT_ACADEMICS_TOOLS` into catalog.ts →
  catalog total is now 1684 (297 literal + office 600 + health 16 + health-new 208 + seo 226 +
  academics 337). Pages: `StudentAcademicsHomePage.tsx` (20 folder tiles) and
  `StudentAcademicsSubcategoryPage.tsx` (`toolIds.filter(getToolById)`, graceful empty state);
  renderer `src/pages/tools/student/StudentAcademicsToolPage.tsx` (indigo frame, `SpecInput` per
  field incl. a `matrix` kind whose `columns[0]` is the row-label corner and whose LAST column is
  treated as the right-hand side, `ResultCard` tone pills, methodology panel, ToolShell gets
  `guideSteps={spec.usage}` + `guideTips={[spec.tip]}` + `tipsTitle="Student's Pro Tip"`).
  QR/EAN tools render real previews there: `createQrSymbol` from the `qrcode` lib → one merged
  `<path>` inside `svg[aria-label="QR code preview"]`, bars → merged `<path>` inside
  `svg[aria-label="Barcode preview"]` (NOT `<rect>`s — the CDP harness must count `path` runs).
  Registration: DynamicToolPage loop `staticImplementations[id] = StudentAcademicsToolPage` for all
   337 ids; `categoryAccents.ts` entry; Header nav item; `/students` page tile.
  Also: mod06 has NO `eval` — graphing calculator and the algebra/equation solvers use a shunting-yard
  `evalExpr` with precedence, unary ±, `^` right-assoc, functions, constants, implicit
  multiplication (`2x`, `2(x+1)`); the equation solver reads a 4-column augmented matrix
  (x,y,z,=d) and uses Cramer + residual verification.
  337 ids unique, zero collisions with any other literal id under `src`. Verified: tsc clean,
  `npm.cmd run build` OK, lint 0 errors (1923 warnings vs 1920 baseline — the remaining 3 are
  oxlint false positives on the Lanczos constants), runtime harness 1011 compute calls 0 errors,
  headless `uiVerifyAcademics.js` 75/75 (hub 20 tiles, all 20 subs exact card counts, 40 tool
  pages, 2×2 + 3×3 solver recompute, QR/barcode SVG structure, dark mode, `/tools` regression,
  zero console errors).
- ROUND 9 (Image Tools portal): new `/image-tools` portal — **20 folders, 233 unique identities,
  238 folder placements, 228 new catalog tools** (1684 → 1912 catalog total). Specs at
  `src/pages/image-tools/specs/mod01.ts`–`mod20.ts` (one file per folder, `export const *_TOOLS`/
  `*_SPECS: ImageToolSpec[]`, each importing the tiny DSL from `engine/factories.ts`:
  `n/sl/sel/txt/clr/tg/pr/fmtParam/qualityParam/gapParam/bgParam` — `bgParam(def)` takes ONE arg).
  Folder→spec mapping: mod01 id-passport 13, 02 crop-resize 12, 03 compression 11,
  04 format-conversion 19 (17 generated by a local `conversion()` helper + ico-converter +
  image-format-tester), 05 background-cutout 13, 06 watermark-protection 9,
  07 editing-enhancement 17, 08 face-portrait 11, 09 social-media 13, 10 ecommerce 12,
  11 collage-photo 13, 12 image-to-document 9, 13 ocr-text 9, 14 ai-image 13,
  15 metadata-info 9, 16 color-design 10, 17 qr-barcode 8, 18 batch 10, 19 print-layout 9,
  20 icons-logos 10 = 228 identities / 233 placements (5 `alsoIn` cross-listings only:
  batch-image-compressor→batch, background-remover-ai→ai-image, product-background-remover→
  ecommerce, background-replacer-batch→ecommerce, batch-image-resizer→crop-resize).
  Barrel `specs/index.ts` exports `imageToolSpecs`, `imageSpecById`, `getImageToolSpec`,
  `placementsOf`, `imagePlacements`, `validateImageSpecCounts()` (asserts 20 folders, 0 duplicate
  ids/placements, complete id+name+blurb+tip). Config `imageToolsConfig.ts` maps specs →
  `IMAGE_TOOLS: Tool[]` (path `/image-tools/<sub>/<id>`, `categoryId: 'image-tools'`), curates the
  5 legacy catalog tools into folders via `LEGACY_IMAGE_TOOLS` + `IMAGE_LEGACY_ALIASES`
  (passport-photo, image-resizer, format-converter, background-remover, watermark — their original
  `/tools/image/*` paths are untouched), and exports the 20 `imageSubcategories` (title/tagline/
  description/LucideIcon/accent/`toolIds: idsFor(sub)`). Pages: `ImageToolsHomePage.tsx` (20 tiles)
  + `ImageToolsSubcategoryPage.tsx` (ToolCard grid + count line + other-folder pills). Generic
  renderer `src/pages/tools/image/ImageToolPage.tsx` — one component for all 228 tools: Dropzone,
  ParamDef-driven fields (number/slider/select/text/color/toggle/coords/pair), `Run tool`, preview
  `<img>`, info rows, extracted-text copy, per-file download, cross-links; cancels superseded runs
  with a `runId` ref and releases ImageBitmaps/objects URLs. Routes in App.tsx:
  `/image-tools`, `/image-tools/:subcategory`, `/image-tools/:subcategory/:tool`; Header "Image
  Tools" nav now points at `/image-tools`; `categoryAccents.ts` gains a sky entry
  (`#E0F2FE` / `#0b2733` / `#0EA5E9`, icon `Images`) → homepage card count is now 13.
  `catalog.ts` spreads `...IMAGE_TOOLS` last (so a new id always wins over an older duplicate).
  Engine (`src/pages/image-tools/engine/`): types/values/geometry/colors/pixels/decode/ops/sheets/
  load/outputs/run/factories/runners/analysis + `engine.test.ts` (37/37 passing). Custom runners
  live in `runners.ts` (compressToTarget, autoOptimize, inspectImage, colorInfo, checkPrint,
  stripMetadataRun, convertToIco→`buildIco`, checkPassport, captionDraft, renameBatch) and
  `analysis.ts` (ocrText via tesseract.js, qrScan/jsQR, qrMake/qrcode, barcodeMake/EAN-13,
  metadataReport, imageInfoReport, paletteReport, colorContrastCheck, rebrandBatch, dataUrlReport).
  "AI" tools are deterministic on-device algorithms and say so in their blurb. ID COLLISIONS to
  watch: `image-to-pdf`, `barcode-generator`, `qr-code-generator` already existed in the catalog
  (pdf/student-tools/students-academics) — the new specs are `image-to-pdf-converter`,
  `ean-13-barcode-generator`, `image-qr-code-generator`. Verify with
  `node --experimental-strip-types scripts/checkImageIdCollisions.mts` (scans all of `src`),
  `scripts/checkImageSpecCounts.mts` (20/228/233, 0 dupes) and `scripts/checkImagePortal.mts`
  (233 identities / 238 placements, every folder id resolves). Headless harness
  `C:\Users\Lenovo\AppData\Local\Temp\opencode\uiVerifyImageTools.js`: ALL PASSED (hub 20 tiles +
  "233 image tools", 20 folders with exact card counts summing to 238, 25 tool pages, bad-route
  fallbacks, 5 legacy routes, `/tools/image-tools` 228 cards, students/health regression, dark
  mode, zero console errors). `uiVerifyRegression.cjs` now reports 13 home category cards (was 11) —
  that one "FAIL" line is the expected count change. tsc clean, build OK, lint 0 errors (1925
  warnings). ROUND 9 STATUS: complete and verified (114/114 headless checks). KNOWN GAPS if this is
  picked up again: (1) no OffscreenCanvas/Worker offload — the renderer runs on the main thread and
  cancels superseded runs with a `runId` ref; (2) some specs are honest-but-thin and worth a
  behaviour audit — `invisible-watermark` alters pixels rather than embedding/extracting a payload,
  `png-compressor` posterizes, `colorInfo` ignores its x/y sampling params, `ocrText` ignores the
  `scale`/`contrast` preprocessing params, `rebrandBatch` only re-encodes, `print-size-converter`
  ignores `dpi`; (3) `specs/index.ts` `validateImageSpecCounts()` is the source of truth for the
  20/228/233 numbers — re-run it after ANY spec edit, and re-run
  `scripts/checkImageIdCollisions.mts` after adding ids.
- ROUND 10 (Household Tools expansion): **15 folders, 358 brand-new functional spec-driven tools**
  across Cleaning (20), Laundry (20), Kitchen (25), Grocery (20), Budget (24), Electricity (22),
  Utilities (22), Home Planning (22), DIY (22), Maintenance (22), Gardening (24), Pets (30),
  Family (25), Moving (30), Safety (30).
  - Specs: `src/pages/household/specs/mod01_cleaning.ts` to `mod15_safety.ts`, unified via
    `householdSpec.ts` and barrel `specs/index.ts`. All 358 slugs collision-tested against full workspace.
  - Renderer: `src/pages/tools/household/HouseholdToolPage.tsx` with warm amber theme, real reactive
    formulas, custom inputs (number, select, text, date, boolean checkbox, checklist, matrix),
    result cards with tone pills, Reset Defaults, Copy Summary, and Tool Logic panel.
  - Integration: `householdConfig.ts` maps all 15 folders to their exact tool counts and exports
    `HOUSEHOLD_TOOLS: Tool[]`. `catalog.ts` spreads `...HOUSEHOLD_TOOLS` and registers `household`
    category. `App.tsx` routes `/household/:subcategory/:tool` and `DynamicToolPage.tsx` registers
    all 358 tool IDs to `HouseholdToolPage`. `HouseholdHomePage.tsx` features an instant search filter.
  - Verification: `tsc` 0 errors, `npm.cmd run lint` 0 errors, `npm.cmd run build` clean (exit 0),
    automated headless Chrome harness `scripts/uiVerifyHousehold.cjs` 110/110 PASSED (Hub 15 folders,
    all 15 subpages exact tool card counts, tool pages, reactive recomputes, reset defaults, 0 console errors).


## Hard constraints (user requirements)
- DO NOT modify, rename, delete, or break existing tools, routes, backend logic, or data-handling
  functions. Changes must be frontend UI/layout/navigation/CSS only — additive where possible —
  with zero errors.
- ADDING new tools/pages/routes/styling is explicitly allowed and expected when requested.
- Never commit unless asked.
- No code comments unless asked. Follow existing conventions (no lint errors).

## Verification checklist before finishing any change
1. `tsc` (must be clean) → 2. `npm.cmd run build` (exit 0) → 3. `npm.cmd run lint` (0 errors)
→ 4. restart preview on 4174 → 5. headless CDP spot check (pages render, counts, dark mode,
zero console errors) → 6. open `http://127.0.0.1:4174` in the browser.

## Environment quirks
  - PowerShell 5.1: no `&&`; use `cmd1; if ($?) { cmd2 }`. Use `Start-Process` for background
    long-running servers; `Get-NetTCPConnection -LocalPort 4174 -State Listen` + `Stop-Process` to
    restart preview.
  - The Bash tool's `workdir` is sometimes ignored for multi-statement commands (npm then runs in the
    outer `Default Project` folder and fails with ENOENT package.json). When that happens use an
    explicit prefix instead: `npm.cmd --prefix "C:\Users\Lenovo\Documents\Default Project\vimz-tools"
    run build` (same trick for `Start-Process -FilePath "cmd.exe" /c "npm.cmd --prefix ... run
    preview -- --host 127.0.0.1 --port 4174 --strictPort"`).
- Tool directory for scratch work: `C:\Users\Lenovo\AppData\Local\Temp\opencode` (pre-approved).
- Chrome exists at `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` (primary) or
  `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- Glob/Grep default to the outer `Default Project` folder — always pass
  `path: "C:\Users\Lenovo\Documents\Default Project\vimz-tools"`.