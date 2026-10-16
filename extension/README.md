# Vimz.ai Chrome Extension — Local Testing & Installation Guide

This directory contains the production-ready Manifest V3 Chrome Extension for Vimz.ai.

## Local Installation (Developer Mode)

To install and test the extension in Google Chrome, Microsoft Edge, Brave, or Opera:

1. Open your browser and navigate to the Extensions management page:
   - In Chrome: `chrome://extensions`
   - In Edge: `edge://extensions`
   - In Brave: `brave://extensions`
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left toolbar.
4. Browse to and select the `extension` folder inside this repository:
   ```
   c:\Users\ranah\OneDrive\Desktop\vimztools\extension
   ```
5. The extension **Vimz.ai — Smart Web Utilities & SEO Inspector** will appear in your extensions list.
6. Pin the extension to your browser toolbar for quick access.

---

## Verifying Key Capabilities

1. **Active Tab SEO Inspector:**
   - Navigate to any standard website (e.g., `https://github.com` or `https://news.ycombinator.com`).
   - Click the Vimz.ai extension icon in your toolbar.
   - On the **Inspector** tab, click **Analyze Tab**.
   - Review title length, meta description, H1-H6 headings, and OpenGraph tags.
2. **Quick Text & Formatting Tools:**
   - Switch to the **Quick Tools** tab.
   - Test the real-time **Word Counter**, **Case Converter**, **JSON Formatter**, and **Percentage Calculator**.
3. **Context Menu Actions:**
   - Select any text on a webpage, right-click, and select **Vimz.ai Tools $\to$ Count Words & Characters**.
   - Notice the instant word count badge on the extension icon.
4. **Omni-Search Across 1,059 Tools:**
   - Switch to the **Search 1,059** tab.
   - Type any keyword (e.g., `invoice`, `dcf`, `swot`, `seo`) to find instant direct links to the live Vimz.ai web platform.
5. **Account & Pro Sync:**
   - Switch to the **Account** tab to test Sanctum login or view current subscription status.

---

## Packaging for Chrome Web Store

Run the automated build packaging script from the root repository:
```bash
node scripts/build_extension.cjs
```
This packages the clean extension into `dist/vimz-ai-extension.zip` ready for upload to the Chrome Developer Dashboard.
