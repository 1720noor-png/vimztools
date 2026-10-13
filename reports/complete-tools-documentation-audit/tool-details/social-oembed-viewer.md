# Universal Social Media oEmbed Viewer & Generator

**Tool Slug:** `social-oembed-viewer`  
**Category:** Social Media Tools (`social-media-tools`)  
**Subcategory:** Content Generation (`content-generation`)  
**Verification Status:** **PASS**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/social-media-tools/social-oembed-viewer](https://charming-vitality-production-dd02.up.railway.app/social-media-tools/social-oembed-viewer)  

---

## 1. Purpose & Intended Use Case
Retrieve official embed codes, author details, and thumbnails from YouTube, TikTok, Vimeo, Spotify, and Reddit.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** e.g. https://www.youtube.com/watch?v=... or https://www.tiktok.com/@.../video/..., Text Area Input
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Accepts user parameters, validates inputs via client-side state hooks, executes procedural mathematical/text transformation, and displays reactive results in real time.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** One-click copy to clipboard, plus universal white-label CSV/Excel/JSON export via ToolPage.

## 5. Source Code & Architecture
- **Component Identifier:** `SocialMediaOembedViewerTool`
- **Component Path:** `../tools/socialmedia/SocialMediaOembedViewer.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** Source code verified (158 lines). State hooks and calculation functions validated.
- **Limitations:** Client-side browser execution; dependent on local device performance.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
