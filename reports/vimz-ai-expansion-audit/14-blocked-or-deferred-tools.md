# Vimz.ai — Blocked, Deferred, or External API-Dependent Tools

**Date:** October 9, 2026

---

## 1. Direct Social Media Media Downloader (Instagram / TikTok / YouTube MP4)

### Current Architecture Limitation
Vimz.ai is a client-side Single Page Application (SPA) statically hosted on Netlify, backed optionally by a lightweight serverless API on Railway.

### Technical & Legal Blockers:
1. **CORS (Cross-Origin Resource Sharing):** Direct `fetch()` requests from the browser to Instagram (`instagram.com`), TikTok (`tiktok.com`), and YouTube (`googlevideo.com`) are blocked by browser CORS security policies.
2. **Session Signatures & Bot Mitigation:** Platforms enforce rolling bot protection (Cloudflare, Akamai, PoToken on YouTube, Instagram device signatures). Client-side JavaScript cannot bypass these protections.
3. **Platform Terms of Service:** Providing automated media extraction of third-party copyright content exposes the hosting domain to DMCA notices and API rate-limiting blocks.

### Viable Alternative Implemented in Vimz.ai:
- **YouTube HD Thumbnail Extractor** (`/social-media-tools/youtube-thumbnail-extractor`): Downloads official high-res thumbnails legally and directly from `img.youtube.com`.
- **Universal Social Media oEmbed Viewer & Generator** (`/social-media-tools/social-oembed-viewer`): Uses official oEmbed endpoints to legally preview, generate responsive iframe embeds, and fetch metadata without violating terms.
- **Instagram Grid & Carousel Splitter** (`/social-media-tools/instagram-grid-carousel-splitter`): Processes local user media client-side with 100% privacy and zero external network calls.

### Recommended Infrastructure if Full Downloading is Desired in Future:
Deploy a dedicated worker service (e.g., Docker container running `yt-dlp` and Chromium with rotating residential proxies) behind authenticated API endpoints on Railway with strict per-user rate limits.
