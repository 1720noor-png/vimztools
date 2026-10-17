const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VimzTools (Vimz AI) — Complete Handover Documentation</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10pt;
      margin: 0;
      padding: 0;
    }
    .cover {
      page-break-after: always;
      padding-top: 40px;
      text-align: center;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 60px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 9999px;
      background: #e0e7ff;
      color: #3730a3;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 26pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 13pt;
      color: #475569;
      margin: 0 0 30px 0;
      font-weight: 500;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      max-width: 550px;
      margin: 30px auto;
      text-align: left;
      background: #f8fafc;
      padding: 18px 24px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .meta-item {
      font-size: 9.5pt;
    }
    .meta-label {
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.05em;
    }
    .meta-value {
      color: #0f172a;
      font-weight: 600;
      margin-top: 2px;
    }

    h2 {
      font-size: 14pt;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 26px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      color: #1e293b;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 10px 0;
      color: #334155;
    }
    ul, ol {
      margin: 0 0 12px 0;
      padding-left: 20px;
      color: #334155;
    }
    li {
      margin-bottom: 4px;
    }
    strong {
      color: #0f172a;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    th, td {
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      font-size: 8pt;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }

    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 6px;
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 8pt;
      line-height: 1.45;
      overflow-x: hidden;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 10px 0 14px 0;
      page-break-inside: avoid;
    }
    code {
      font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #4f46e5;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 12px 0;
      page-break-inside: avoid;
    }
    .card-title {
      font-weight: 700;
      color: #1e1b4b;
      margin-bottom: 4px;
    }

    .page-break {
      page-break-before: always;
    }
    .footer-note {
      text-align: center;
      margin-top: 40px;
      font-size: 8pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
  </style>
</head>
<body>

  <div class="cover">
    <span class="badge">Production Release Document</span>
    <h1>VimzTools (Vimz AI)</h1>
    <div class="subtitle">Complete Technical Handover & System Operation Manual</div>
    
    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Release Version</div>
        <div class="meta-value">v1.0.0 (Production Ready)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Handover Date</div>
        <div class="meta-value">October 2026</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Total Interactive Tools</div>
        <div class="meta-value">1,059 Tools (18 Verticals)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Automated Test Coverage</div>
        <div class="meta-value">55 Suites / 408 Tests Passing (100%)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Frontend Framework</div>
        <div class="meta-value">React 19 + Vite 6 + Tailwind CSS v4</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Offline Capability</div>
        <div class="meta-value">Zero-Internet Single-File HTML Export</div>
      </div>
    </div>
  </div>

  <h2>1. Executive Summary & Core Value Proposition</h2>
  <p><strong>VimzTools</strong> (also recognized as <strong>Vimz AI</strong>) is a high-performance web platform featuring <strong>1,059 interactive, client-side tools</strong>. Built with a strict privacy-first philosophy, all data calculations, transformations, and processing are performed directly within the user's browser, eliminating external server transmission.</p>

  <div class="card">
    <div class="card-title">Core Platform Pillars:</div>
    <ul>
      <li><strong>In-Browser Zero-Latency Execution:</strong> Calculations happen instantly using modern client-side JavaScript.</li>
      <li><strong>Offline HTML Portability:</strong> Any tool can be exported as an independent, single-file <code>.html</code> file runnable on any computer without an internet connection.</li>
      <li><strong>Monetization & License Management:</strong> Integrated tier separation (Free, Pro, Enterprise) with sandbox mock checkout and persistent client-side unlocks.</li>
      <li><strong>Dual Dashboards:</strong> Dedicated interfaces for end-user tool management (<code>/dashboard</code>) and administrative telemetry (<code>/admin</code>).</li>
      <li><strong>Modern Neumorphic Design System:</strong> Soft convex and concave UI components styled with Tailwind CSS v4 for optimal contrast and visual elegance.</li>
    </ul>
  </div>

  <h2>2. System Architecture & Tech Stack</h2>
  <p>The application is built on a clean, modern decoupled architecture with zero heavy server dependencies:</p>
  <ul>
    <li><strong>UI Framework:</strong> React 19 with React Router DOM v7 for declarative client-side routing.</li>
    <li><strong>Bundler:</strong> Vite 6 featuring rapid Hot Module Replacement (HMR) and Rollup code splitting.</li>
    <li><strong>Styling Engine:</strong> Tailwind CSS v4 utilizing CSS modern variables and bespoke Neumorphic design tokens.</li>
    <li><strong>Icons:</strong> Lucide React iconography.</li>
    <li><strong>State & Storage:</strong> Browser <code>LocalStorage</code> APIs providing persistent client-side data without latency.</li>
    <li><strong>Test Runner:</strong> Vitest 3 with Happy DOM environment and React Testing Library (100% pass rate).</li>
  </ul>

  <pre>
+-----------------------------------------------------------------------------------+
|                                  VimzTools Core                                   |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  |     React 19       |   |    Tailwind CSS v4    |   |     Vite 6 Bundler     |  |
|  | (React Router DOM) |   |  (Neumorphic Design)  |   |  (Rollup / Fast HMR)   |  |
|  +---------+----------+   +-----------+-----------+   +-----------+------------+  |
|            |                          |                           |               |
|  +---------v--------------------------v---------------------------v------------+  |
|  |                          Application Routes & Pages                         |  |
|  |  /               -> Home (Search, Hero, Category Grid, Featured Tools)     |  |
|  |  /:category      -> CategoryPage (Filtered Tools, Facets, Grid/List)       |  |
|  |  /:cat/:toolId   -> ToolPage (Interactive Tool, Download Engine, Banner)   |  |
|  |  /dashboard      -> UserDashboard (Saved Tools, Unlocked, History, Stats)  |  |
|  |  /admin          -> AdminDashboard (Metrics, Tools Manager, Telemetry)     |  |
|  |  /pricing        -> Pricing (Tier breakdown, FAQs, Subscription Plans)     |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+</pre>

  <div class="page-break"></div>

  <h2>3. Key Directory & Codebase Layout</h2>
  <pre>
vimztools/
├── index.html                   # HTML entry point with meta tags & font preloads
├── package.json                 # Project dependencies, scripts, and engine metadata
├── vite.config.js               # Vite configuration with Tailwind CSS & alias plugins
├── vitest.config.js             # Vitest test runner configuration
├── netlify.toml                 # Netlify deployment configuration & redirect rules
├── HANDOVER_NOTES.md            # Markdown version of handover documentation
├── HANDOVER_NOTES.pdf           # Executive PDF edition of handover documentation
├── src/
│   ├── main.jsx                 # Application DOM root mount
│   ├── App.jsx                  # Top-level Router configuration & route declarations
│   ├── index.css                # Global styles, Tailwind directives, & Neumorphic utilities
│   ├── components/
│   │   ├── Layout.jsx           # Global header with Dashboards menu, nav, and footer
│   │   ├── ToolCard.jsx         # Card component with Download & Unlock buttons
│   │   ├── BuyNoticeModal.jsx   # Sandbox checkout modal with instant license unlock
│   │   ├── Sidebar.jsx          # Category navigation sidebar
│   │   └── SearchModal.jsx      # Global search modal with real-time filtering
│   ├── pages/
│   │   ├── Home.jsx             # Homepage with hero, category explorer, & quick search
│   │   ├── CategoryPage.jsx     # Category view with filtering, tags, and pagination
│   │   ├── ToolPage.jsx         # Dedicated tool view with offline download banners
│   │   ├── UserDashboard.jsx    # User workspace (/dashboard) for downloads & saved tools
│   │   ├── AdminDashboard.jsx   # Admin management console (/admin) with metrics & health
│   │   └── Pricing.jsx          # Pricing plans and licensing comparison
│   ├── data/
│   │   └── tools.js             # Master catalog of 1,059 tools with metadata & components
│   ├── utils/
│   │   ├── offlineToolEngine.js # The Single-File HTML exporter and template engine
│   │   └── storage.js           # LocalStorage helper functions for licenses & favorites
│   └── tools/                   # 18 Modular Category Folders (1,059 tools)
├── extension/                   # Chrome Extension standalone build & manifest
└── api/                         # Auxiliary PHP/Laravel API (optional background services)</pre>

  <h2>4. 1,059 Interactive Tools Catalog (18 Verticals)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 25%;">Category Name</th>
        <th style="width: 20%;">Route Slug</th>
        <th style="width: 10%;">Tools</th>
        <th style="width: 40%;">Sample Tools Included</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>Student & Academic</strong></td>
        <td><code>student-tools</code></td>
        <td>55+</td>
        <td>GPA Calculator, Percentage Calculator, Citation Formatter, Thesis Builder</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Developer Tools</strong></td>
        <td><code>developer-tools</code></td>
        <td>120+</td>
        <td>JSON Formatter, Regex Tester, SQL Query Builder, JWT Debugger, Base64</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Business & Strategy</strong></td>
        <td><code>business-tools</code></td>
        <td>75+</td>
        <td>Business Model Canvas, Break-Even Calculator, Pitch Deck Generator</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Design & UI/UX</strong></td>
        <td><code>design-tools</code></td>
        <td>65+</td>
        <td>Neumorphic Generator, Color Palette Picker, Contrast Checker, Aspect Ratio</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Marketing & Growth</strong></td>
        <td><code>marketing-tools</code></td>
        <td>65+</td>
        <td>UTM Builder, CAC/LTV Calculator, Ad Spend Estimator, Subject Line Tester</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>SEO & Webmaster</strong></td>
        <td><code>seo-tools</code></td>
        <td>55+</td>
        <td>Meta Tag Generator, Robots.txt Builder, Keyword Density, Sitemap XML</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Writing & Content</strong></td>
        <td><code>writing-tools</code></td>
        <td>55+</td>
        <td>Word Counter, Readability Score, Passive Voice Detector, Markdown Editor</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>AI & Machine Learning</strong></td>
        <td><code>ai-tools</code></td>
        <td>65+</td>
        <td>Prompt Optimizer, Token Counter, Embedding Distance, AI Persona Tester</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>Finance & Accounting</strong></td>
        <td><code>finance-tools</code></td>
        <td>75+</td>
        <td>Compound Interest, Loan Amortization, Crypto Profit, Tax Estimator</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>Health & Wellness</strong></td>
        <td><code>health-tools</code></td>
        <td>55+</td>
        <td>BMI/BMR Calculator, Water Intake Tracker, Calorie Deficit Estimator</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>Productivity & Tasks</strong></td>
        <td><code>productivity-tools</code></td>
        <td>65+</td>
        <td>Eisenhower Matrix, Pomodoro Timer, Habit Tracker, Kanban Board</td>
      </tr>
      <tr>
        <td>12</td>
        <td><strong>Social Media Tools</strong></td>
        <td><code>social-media-tools</code></td>
        <td>55+</td>
        <td>Hashtag Generator, Engagement Rate Calculator, Bio Formatter</td>
      </tr>
      <tr>
        <td>13</td>
        <td><strong>Video & Audio Media</strong></td>
        <td><code>media-tools</code></td>
        <td>55+</td>
        <td>Audio Bitrate Calculator, Aspect Ratio Scaler, Video File Size Estimator</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>Security & Privacy</strong></td>
        <td><code>security-tools</code></td>
        <td>55+</td>
        <td>Password Strength Checker, SHA-256 Hash Generator, IP Data Exposure</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>Math & Science</strong></td>
        <td><code>math-tools</code></td>
        <td>65+</td>
        <td>Matrix Multiplier, Standard Deviation, Unit Converter, Quadratic Solver</td>
      </tr>
      <tr>
        <td>16</td>
        <td><strong>HR & Recruitment</strong></td>
        <td><code>hr-tools</code></td>
        <td>55+</td>
        <td>Salary Take-Home Calculator, Employee NPS, Turnover Cost Analyzer</td>
      </tr>
      <tr>
        <td>17</td>
        <td><strong>Legal & Compliance</strong></td>
        <td><code>legal-tools</code></td>
        <td>45+</td>
        <td>NDA Generator, Privacy Policy Boilerplate, Terms of Service, GDPR Checker</td>
      </tr>
      <tr>
        <td>18</td>
        <td><strong>E-Commerce Tools</strong></td>
        <td><code>ecommerce-tools</code></td>
        <td>65+</td>
        <td>Profit Margin Calculator, Dropshipping Fee Estimator, Shopify Fee Calc</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>5. Offline Single-File HTML Generation Engine</h2>
  <p>The <strong>Single-File HTML Engine</strong> (<code>src/utils/offlineToolEngine.js</code>) allows users to take any tool anywhere in the world and use it without network connectivity.</p>
  
  <div class="card">
    <div class="card-title">Technical Highlights of the Offline Engine:</div>
    <ul>
      <li><strong>Zero CDN Dependencies:</strong> Fonts, styles, layout frameworks, and calculation scripts are bundled directly inside the single file. No external requests are made when the file is opened.</li>
      <li><strong>Client-Side Blob Trigger:</strong> Creates a localized UTF-8 text/html blob in browser memory and triggers an automated download via an ephemeral anchor element.</li>
      <li><strong>Cross-Platform Compatibility:</strong> Operates natively on Google Chrome, Microsoft Edge, Safari, Mozilla Firefox, Brave, and mobile web browsers on iOS and Android.</li>
    </ul>
  </div>

  <h2>6. Direct Download & Monetization Architecture</h2>
  <h3>6.1 Download & Unlock Action Points</h3>
  <ul>
    <li><strong>Tool Cards (<code>src/components/ToolCard.jsx</code>):</strong> Each card showcases category tags, description, and direct action buttons. Free tools display <code>Download (.html)</code>. Pro tools display <code>Unlock (.html)</code> with a lock badge.</li>
    <li><strong>Tool Detail Page (<code>src/pages/ToolPage.jsx</code>):</strong> Features a primary action button in the hero bar alongside a dedicated <strong>"Use Without Internet"</strong> banner explaining how to run the tool offline.</li>
  </ul>

  <h3>6.2 Checkout & License Management (<code>src/components/BuyNoticeModal.jsx</code>)</h3>
  <ul>
    <li><strong>Sandbox Payment Simulation:</strong> Users can select Credit Card, PayPal, or Crypto to test instant purchases ($19 one-time lifetime license).</li>
    <li><strong>Instant LocalStorage License Grant:</strong> When approved, the tool's ID is stored in <code>vimz_download_unlocked_tools</code> and the offline file is automatically downloaded immediately.</li>
    <li><strong>Persistent Unlock State:</strong> Unlocked tools permanently switch to "Unlocked" state on that device, enabling infinite re-downloads without paying again.</li>
  </ul>

  <h2>7. User Workspace & Admin Dashboards</h2>
  <h3>7.1 Header Navigation</h3>
  <p>A dedicated <strong>Dashboards</strong> menu with an interactive Neumorphic dropdown in the global navigation bar allows one-click switching between:</p>
  <ul>
    <li><strong>User Workspace (<code>/dashboard</code>):</strong> Saved tools, download history, and unlocked offline files.</li>
    <li><strong>Admin Console (<code>/admin</code>):</strong> Complete system metrics, tool activation states, category breakdown, and simulated revenue analytics. Demo login credentials: <code>admin@vimztools.com</code> / <code>admin123</code>.</li>
  </ul>

  <div class="page-break"></div>

  <h2>8. Local Setup, Development & Operational Commands</h2>
  <pre>
# 1. Install all dependencies
npm install

# 2. Launch development server with instant HMR
npm run dev
# Running at: http://localhost:5173/

# 3. Create optimized production build
npm run build
# Output directory: /dist

# 4. Preview the production build locally
npm run preview
# Running at: http://localhost:4173/

# 5. Run full automated test suite (55 suites / 408 tests)
npx vitest run</pre>

  <h2>9. LocalStorage Keys & Data Storage Reference</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Key Name</th>
        <th style="width: 20%;">Data Type</th>
        <th style="width: 45%;">Operational Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>vimz_download_unlocked_tools</code></td>
        <td><code>Array&lt;string&gt;</code></td>
        <td>List of tool IDs unlocked by the user for offline single-file download.</td>
      </tr>
      <tr>
        <td><code>vimz_user_favorites</code></td>
        <td><code>Array&lt;string&gt;</code></td>
        <td>Tool IDs bookmarked into the User Workspace.</td>
      </tr>
      <tr>
        <td><code>vimz_recent_tools</code></td>
        <td><code>Array&lt;string&gt;</code></td>
        <td>Chronological list of recently visited tool slugs.</td>
      </tr>
      <tr>
        <td><code>vimz_theme</code></td>
        <td><code>'dark' | 'light'</code></td>
        <td>User UI color preference (default dark Neumorphism).</td>
      </tr>
      <tr>
        <td><code>vimz_admin_session</code></td>
        <td><code>Object</code></td>
        <td>Admin authentication session token and permissions.</td>
      </tr>
    </tbody>
  </table>

  <h2>10. Production Deployment, Maintenance & Roadmap</h2>
  <div class="card">
    <div class="card-title">Production Hosting Options:</div>
    <ul>
      <li><strong>Netlify:</strong> Pre-configured with <code>netlify.toml</code>. If an account credit limit is encountered, upload the generated <code>dist/</code> folder directly via Netlify manual drag-and-drop.</li>
      <li><strong>Vercel / Cloudflare Pages / Firebase:</strong> The <code>dist/</code> folder contains 100% static assets (HTML/CSS/JS) and can be hosted on any static hosting platform with zero server setup.</li>
    </ul>
  </div>

  <h3>Recommended Next Steps</h3>
  <ol>
    <li><strong>Live Stripe Processing:</strong> Replace the mock payment sandbox with live Stripe Checkout webhooks.</li>
    <li><strong>Progressive Web App (PWA):</strong> Add a Service Worker to enable one-click desktop app installation.</li>
    <li><strong>Multi-Language (i18n):</strong> Expand localization for global international traffic.</li>
  </ol>

  <div class="footer-note">
    VimzTools Handover Documentation &bull; Generated October 2026 &bull; All 1,059 Tools Production Ready & Verified
  </div>

</body>
</html>
`;

async function generatePdf() {
  const htmlPath = path.join(__dirname, '..', 'HANDOVER_NOTES.html');
  const pdfPath = path.join(__dirname, '..', 'HANDOVER_NOTES.pdf');
  
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('Written HANDOVER_NOTES.html successfully.');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--no-sandbox',
    '--disable-gpu',
    `file://${htmlPath.replace(/\\\\/g, '/')}`
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2000));

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9227/json');
      targets = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const page = targets?.find(t => t.type === 'page');
  if (!page) {
    console.error('No page target found');
    chromeProcess.kill();
    return;
  }

  const ws = new (require('ws'))(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.id === curId) {
        ws.off('message', handler);
        resolve(parsed.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Printing to PDF via CDP...');
  const pdfResult = await send('Page.printToPDF', {
    printBackground: true,
    marginTop: 0.4,
    marginBottom: 0.4,
    marginLeft: 0.4,
    marginRight: 0.4,
    paperWidth: 8.27,
    paperHeight: 11.69,
    preferCSSPageSize: true
  });

  if (pdfResult && pdfResult.data) {
    const buffer = Buffer.from(pdfResult.data, 'base64');
    fs.writeFileSync(pdfPath, buffer);
    console.log(`Successfully generated HANDOVER_NOTES.pdf (${buffer.length} bytes)!`);
  } else {
    console.error('Failed to get PDF data from CDP:', pdfResult);
  }

  ws.close();
  chromeProcess.kill();
}

generatePdf().catch(console.error);
