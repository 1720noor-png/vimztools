# Vimz.ai — Chrome Extension Architecture & Scope Specification
**Companion Browser Utility, Manifest V3 Architecture, Security & Web Store Readiness**

* **Status:** Complete Technical Specification & Implementation Architecture
* **Date:** October 12, 2026
* **Target Environment:** Google Chrome / Chromium-based browsers (Edge, Brave, Opera)
* **Manifest Version:** Manifest V3 (Strict Least-Privilege Policy)
* **Backend Integration:** Laravel 13 Sanctum API on Railway (`https://charming-vitality-production-dd02.up.railway.app/api`)
* **Associated Datasets:**
  - Master Classification: [`09-complete-1059-tool-master-classification.md`](file:///c:/Users/ranah/OneDrive/Desktop/vimztools/reports/vimz-ai-freemium-audit/09-complete-1059-tool-master-classification.md)
  - Extension Source Directory: `extension/`
  - Web Store Listing Manifest: `extension/CHROMEWEBSTORE.md`

---

## 1. Extension Purpose & Product Scope

Rather than attempting to awkwardly duplicate all 1,059 complex multi-screen tools into a cramped browser popup, the **Vimz.ai Chrome Companion** is purposefully designed as an agile, high-utility browser accessory that complements the main web platform:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      VIMZ.AI CHROME EXTENSION SCOPE                    │
├──────────────────────────────┬─────────────────────────────────────────┤
│ Core Module                  │ Key Capabilities                        │
├──────────────────────────────┼─────────────────────────────────────────┤
│ 1. In-Tab Page Inspector     │ Meta tags, Title/Desc length, OpenGraph,│
│                              │ H1-H6 heading hierarchy, page word count│
├──────────────────────────────┼─────────────────────────────────────────┤
│ 2. Instant Text & Dev Tools  │ Word count, Case convert, JSON format,  │
│                              │ Base64/URL encode, Percentage calc      │
├──────────────────────────────┼─────────────────────────────────────────┤
│ 3. 1,059 Tool Omni-Search    │ Instant fuzzy search across all 1,059   │
│                              │ tools with 1-click deep-links to web app│
├──────────────────────────────┼─────────────────────────────────────────┤
│ 4. Pro Account Sync          │ Sanctum token authentication; displays  │
│                              │ active subscription & single-tool passes│
└──────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2. Manifest V3 Technical Architecture

### 2.1 File Structure
```
extension/
├── manifest.json                  # Manifest V3 configuration
├── icons/
│   ├── icon-16.png                # 16x16 toolbar icon
│   ├── icon-48.png                # 48x48 extension manager icon
│   └── icon-128.png               # 128x128 Chrome Web Store icon
├── popup/
│   ├── popup.html                 # Main tabbed popup interface (Violet & White)
│   ├── popup.js                   # Popup logic (tools, search, tab switcher)
│   └── popup.css                  # Premium styling matching Vimz.ai design
├── content/
│   └── inspector.js               # Injected on-demand to analyze active tab DOM
├── background/
│   └── service-worker.js          # Ephemeral SW handling context menus & storage
├── shared/
│   └── api.js                     # Sanctum API client for entitlement sync
├── CHROMEWEBSTORE.md              # Store listing metadata, justifications & checklist
└── README.md                      # Local installation & testing instructions
```

### 2.2 Strict Least-Privilege Permissions
In compliance with Google Web Store Developer Program Policies:
* `"permissions": ["activeTab", "storage", "scripting", "contextMenus"]`:
  - `activeTab`: Grants temporary, secure access to the active webpage **only when the user explicitly clicks the extension popup or context menu**. Zero background tracking.
  - `storage`: Uses `chrome.storage.local` to safely persist user preferences, recent tool usage, and Sanctum auth tokens across service worker terminations.
  - `scripting`: Executes `inspector.js` in the active tab to extract meta tags and heading hierarchy on demand.
  - `contextMenus`: Adds right-click options for highlighted text (*"Count words in Vimz.ai"*, *"Format JSON in Vimz.ai"*).
* **Host Permissions:** Strictly scoped:
  `"host_permissions": ["https://charming-vitality-production-dd02.up.railway.app/*"]` (API access only). Zero `<all_urls>` permission, preventing any Chrome Web Store review rejections.

---

## 3. Popup User Interface & Experience

The popup adopts the exact premium Violet + White visual identity of the main website:
* **Primary violet:** `#6C4CF1`
* **Surface background:** `#F7F7FC`
* **Card background:** `#FFFFFF`
* **Text primary:** `#20213A`
* **Borders:** `#E9E7F2`

### 3.1 Four Core Tabs
1. **Inspector Tab:**
   - Detects the current page URL and title.
   - Extracts SEO title tag and meta description with character count and pixel length warnings.
   - Summarizes Open Graph tags (`og:title`, `og:image`, `og:description`).
   - Counts H1, H2, H3 headings and displays broken heading hierarchy alerts.
2. **Quick Tools Tab:**
   - **Word & Character Counter:** Type or paste text to see real-time words, characters, sentences, and reading time.
   - **Case Converter:** UPPERCASE, lowercase, Title Case, camelCase, kebab-case, snake_case.
   - **JSON Formatter & Validator:** Instantly prettify and validate JSON payloads with syntax error detection.
   - **Percentage Calculator:** Fast percentage calculations.
3. **Search 1,059 Tools Tab:**
   - Real-time client-side search indexed across all 1,059 registered tools.
   - Filter by category with 1-click launch to the live Netlify application (`https://vimztools-app.netlify.app/tool/{slug}`).
4. **Account & Pro Tab:**
   - Allows users to log in with their Vimz.ai account credentials.
   - Queries `GET /api/v1/auth/user` and `GET /api/v1/user/purchases`.
   - Displays current plan status (*"Free Account"* vs. *"Vimz.ai Pro Member"*).

---

## 4. Security, Privacy & Compliance Policy

1. **Zero Data Tracking:** The extension operates with an absolute zero-tracking guarantee. It does not monitor browsing history, track user search terms, or send page contents to third parties.
2. **On-Device Execution:** All text utilities, JSON formatting, case conversions, and page meta inspections run 100% locally in the browser memory.
3. **No Embedded Secrets:** Zero API keys, Stripe secrets, or private certificates are bundled in the extension source code.
4. **Content Security Policy (CSP):** Strict Manifest V3 CSP; zero `eval()`, zero `new Function()`, zero remote script execution. All scripts are packaged locally.
