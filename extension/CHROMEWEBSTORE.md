# Chrome Web Store Listing & Compliance Specification

## 1. Store Listing Details

* **Extension Name:** Vimz.ai — Smart Web Utilities & SEO Inspector
* **Short Description (max 132 chars):**
  Inspect on-page SEO meta tags, format text and JSON, and search 1,000+ free online AI tools directly from your browser.
* **Category:** Productivity / Developer Tools
* **Primary Language:** English
* **Website URL:** [https://vimztools-app.netlify.app](https://vimztools-app.netlify.app)
* **Support URL:** [https://vimztools-app.netlify.app](https://vimztools-app.netlify.app)

### Detailed Description (Store Listing Body)
```markdown
Vimz.ai is your essential in-browser Swiss Army knife for SEO, content creation, developer utilities, and quick calculations. 

Instantly audit the webpage you are browsing or access convenient utility tools with a single click—no page reloads, no heavy software, and zero tracking.

KEY FEATURES:
★ On-Page SEO Inspector
Analyze any webpage in seconds. Review title tag length, meta description length, heading hierarchy (H1-H6), Open Graph social tags, image alt text counts, and total page word count.

★ Quick Text & Formatting Utilities
- Real-time Word & Character Counter with estimated reading time.
- Case Converter: Instant transformation between UPPERCASE, lowercase, Title Case, camelCase, kebab-case, and snake_case.
- JSON Formatter & Validator: Prettify or minify JSON payloads with syntax error detection.
- Percentage & Discount Calculator: Quick math calculations on the fly.

★ Instant Search for 1,059+ Tools
Search the entire Vimz.ai catalog of over 1,000 calculators, converters, financial modelers, and strategy tools directly from the popup and launch them with one click.

★ Privacy-First & Offline Capable
All text formatting, word counting, and DOM inspections execute 100% on your device in real-time. Your browsing data is never tracked, logged, or sent to third-party servers.
```

---

## 2. Permissions Justification (Required for Review Team)

Every permission declared in `manifest.json` serves an explicit, necessary purpose:

| Permission | Review Team Justification |
| :--- | :--- |
| **`activeTab`** | Enables the user to inspect the title, meta description, heading structure, and Open Graph tags of the current webpage when they explicitly click the "Analyze Tab" button. Access is granted only upon direct user gesture and ceases when the tab is closed. |
| **`scripting`** | Injects the lightweight `content/inspector.js` analysis script into the active tab to read DOM metadata (title, headings, image alt attributes) upon user request. |
| **`storage`** | Persists user preferences, recent tool inputs, and optional authenticated account tokens locally using `chrome.storage.local`. |
| **`contextMenus`** | Adds convenient right-click options on highlighted text (e.g., "Count Words in Vimz.ai") to provide immediate word and character counts via the extension badge. |
| **`host_permissions` (`https://charming-vitality-production-dd02.up.railway.app/*`)** | Allows the extension to communicate exclusively with the official Vimz.ai backend API to verify user login sessions and sync Pro entitlements. No other domains are requested. |

---

## 3. Privacy & Data Use Disclosure

* **Single Purpose Statement:**
  To provide in-browser webpage SEO inspection, text formatting, and quick access to Vimz.ai utilities.
* **Data Collection Disclosures:**
  - Personally Identifiable Information: NONE collected, unless the user voluntarily signs in with their Vimz.ai account (email and auth token stored only in local storage).
  - Web Browsing History: NONE collected.
  - Keystroke Logging: NONE.
  - Advertising or Analytics Tracking: NONE.
* **Privacy Policy URL:**
  `https://vimztools-app.netlify.app/privacy-policy`

---

## 4. Pre-Publish Review Checklist

- [x] Manifest version is V3 (`manifest_version: 3`).
- [x] Icons exist as real PNG files at 16x16, 48x48, and 128x128 in `extension/icons/`.
- [x] Zero inline `<script>` tags or event handlers in HTML.
- [x] Service worker stores state in `chrome.storage.local` (zero global variables).
- [x] Host permissions strictly scoped to the official backend domain (no `<all_urls>`).
- [x] Zero external remote code execution (pure self-contained code).
- [x] Build script creates clean ZIP excluding `.git`, `node_modules`, and temporary files.
