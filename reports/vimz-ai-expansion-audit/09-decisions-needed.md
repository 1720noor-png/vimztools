# Vimz.ai — Strategic & Technical Decisions Needed
## Document 09: Decisions for Stakeholder Alignment

The following strategic questions require stakeholder decision before proceeding to future implementation phases:

---

### Decision 1: Scope & Legal Framing for Social Media Tools
* **Context:** The teacher requested social media downloading for major platforms (YouTube, Instagram, TikTok, Facebook, X). As demonstrated in Document 04, unrestricted client-side video/image downloading is technically and legally prohibited by platform terms of service, CORS, and cipher encryption.
* **Options:**
  1. *(Recommended)* **Creative & Compliance Suite:** Focus exclusively on fully legal, client-side tools: YouTube HD Thumbnail Extractor (already live), Instagram Carousel/Grid Splitter (already live), Universal oEmbed Metadata Viewer (P1 candidate), and Social Media Media Inspector & Compliance Hub (already live).
  2. **External Backend Downloader API:** Provision and host a dedicated backend server utilizing proxy rotation and scraping utilities. *(Warning: High recurring server costs, ongoing maintenance as platforms change obfuscation keys, and legal/DMCA exposure).*
* **Decision Needed:** Confirm whether Option 1 (Zero-backend, legal creative & compliance suite) is approved.

---

### Decision 2: Disambiguation of 13 Duplicate Tool Display Names
* **Context:** Exactly 13 pairs of tools have identical display names (e.g., two tools named "HTTP Status Code Lookup", two named "CSS Gradient Generator", two named "Random Number Generator") across different categories.
* **Options:**
  1. *(Recommended)* **Update Display Names to Be Descriptive:** Update the `name` field in `src/data/registry.js` to clearly reflect the distinct use cases (e.g. "HTTP Status Quick Reference" vs "HTTP Status Code & Header Debugger") while keeping all existing URLs, slugs, and components strictly identical.
  2. **Leave Names Unchanged:** Maintain identical display names, relying on category badges to distinguish them.
* **Decision Needed:** Confirm whether updating the 13 tool display names for search clarity is approved.

---

### Decision 3: Formalizing the 2 Ad-Hoc Categories (`privacy-tools` & `women-tools`)
* **Context:** 10 tools belong to `cat: "privacy-tools"` (5 tools) and `cat: "women-tools"` (5 tools), but neither category is defined in the `categories = [...]` array in `src/data/registry.js`. Consequently, they are missing from the Category index page and navigation dropdowns.
* **Options:**
  1. *(Recommended)* **Add Official Category Definitions:** Add formal entries with icons and descriptions for both categories to the `categories` array, assigning appropriate pastel themes.
  2. **Re-Categorize Tools:** Move the 5 privacy tools into `security-tools` and the 5 women care tools into `health-wellness-tools`, with route rewrites.
* **Decision Needed:** Confirm whether to formalize them as standalone categories (Option 1) or consolidate them (Option 2).

---

### Decision 4: Assigning Subcategories to 240 Unassigned Tools
* **Context:** Exactly 240 tools have blank/omitted `subcat` properties, preventing them from being filtered under subcategory tabs on Category pages.
* **Options:**
  1. *(Recommended)* **Execute Subcategory Mapping Batch:** Map each of the 240 tools to existing or appropriate subcategories in a coordinated metadata update.
  2. **Leave Unassigned:** Allow them to appear only in the "All" tab on category pages.
* **Decision Needed:** Approve batch subcategory mapping in the next maintenance cycle.
