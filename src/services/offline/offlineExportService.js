// Vimz.ai — Offline Single-File HTML Exporter Engine
// Generates self-contained, zero-dependency .html files that run in any browser with NO internet.

export const OFFLINE_BASIC_TOOLS_COUNT = 359;
export const OFFLINE_ADVANCED_TOOLS_COUNT = 700;

/**
 * Returns true if the tool is in the 359 basic free tools (free offline download).
 */
export function isBasicFreeTool(toolSlug, advancedSet = new Set()) {
  return !advancedSet.has(toolSlug);
}

/**
 * Generate a standalone offline HTML string for a tool
 */
export function generateOfflineHtml(tool, isPro = false) {
  const title = tool.name || 'Vimz.ai Offline Tool';
  const slug = tool.slug || 'tool';
  const desc = tool.desc || 'Fast, private offline tool that runs 100% on your device.';
  const category = tool.cat || 'Utility';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — Offline Tool (Vimz.ai)</title>
  <style>
    :root {
      --bg: #0F172A;
      --card-bg: #1E293B;
      --text: #F8FAFC;
      --muted: #94A3B8;
      --border: #334155;
      --primary: #1F9D6B;
      --primary-hover: #168055;
      --badge-bg: rgba(31, 157, 107, 0.15);
      --badge-border: #1F9D6B;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }
    .offline-banner {
      background: var(--badge-bg);
      border: 1px solid var(--badge-border);
      color: #34D399;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      width: 100%;
      max-width: 650px;
      padding: 2rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    .header { margin-bottom: 1.5rem; }
    .category {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #60A5FA;
      margin-bottom: 0.35rem;
    }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    p.desc { font-size: 0.95rem; color: var(--muted); line-height: 1.5; }
    .field { margin-bottom: 1.25rem; }
    label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text); }
    input, select, textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #090D16;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: #FFF;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--primary); }
    button.btn-calc {
      width: 100%;
      background: var(--primary);
      color: #FFF;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.85rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 0.5rem;
    }
    button.btn-calc:hover { background: var(--primary-hover); }
    .result-box {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: #090D16;
      border: 1px solid var(--border);
      border-radius: 8px;
      display: none;
    }
    .result-box.visible { display: block; }
    .result-title { font-size: 0.85rem; text-transform: uppercase; color: var(--muted); margin-bottom: 0.5rem; }
    .result-val { font-size: 1.5rem; font-weight: 700; color: #34D399; }
    .result-detail { font-size: 0.9rem; color: var(--muted); margin-top: 0.5rem; line-height: 1.4; }
    .footer {
      margin-top: 2rem;
      font-size: 0.8rem;
      color: var(--muted);
      text-align: center;
    }
    .footer a { color: #60A5FA; text-decoration: none; }
  </style>
</head>
<body>

  <div class="offline-banner">
    <span>⚡</span>
    <span>OFFLINE STANDALONE TOOL — Runs 100% locally with zero internet connection</span>
  </div>

  <div class="card">
    <div class="header">
      <div class="category">${escapeHtml(category)}</div>
      <h1>${escapeHtml(title)}</h1>
      <p class="desc">${escapeHtml(desc)}</p>
    </div>

    <form id="toolForm" onsubmit="event.preventDefault(); runCalc();">
      <div id="dynamicFields">
        <!-- Render form fields according to tool slug -->
      </div>

      <button type="submit" class="btn-calc">Calculate & Execute</button>
    </form>

    <div id="resultBox" class="result-box">
      <div class="result-title">Result</div>
      <div id="resultMain" class="result-val">-</div>
      <div id="resultDetail" class="result-detail"></div>
    </div>
  </div>

  <div class="footer">
    ${isPro ? 'Vimz.ai Pro Offline Tool' : 'Powered by <a href="https://vimzai.netlify.app" target="_blank">Vimz.ai</a> — 1,000+ Everyday Productivity Tools'}
    <div>Downloaded on ${new Date().toISOString().split('T')[0]} • Client-Side Execution</div>
  </div>

  <script>
    const slug = "${escapeHtml(slug)}";

    function setupFields() {
      const container = document.getElementById('dynamicFields');
      if (slug.includes('rule-of-72') || slug.includes('doubling')) {
        container.innerHTML = \`
          <div class="field">
            <label>Annual Return / Interest Rate (%)</label>
            <input type="number" step="0.1" id="rateInput" value="7.2" required />
          </div>
        \`;
      } else if (slug.includes('bmi')) {
        container.innerHTML = \`
          <div class="field">
            <label>Weight (kg)</label>
            <input type="number" step="0.5" id="weightInput" value="70" required />
          </div>
          <div class="field">
            <label>Height (cm)</label>
            <input type="number" step="1" id="heightInput" value="175" required />
          </div>
        \`;
      } else if (slug.includes('age')) {
        container.innerHTML = \`
          <div class="field">
            <label>Date of Birth</label>
            <input type="date" id="dobInput" value="1998-05-15" required />
          </div>
        \`;
      } else if (slug.includes('tax')) {
        container.innerHTML = \`
          <div class="field">
            <label>Monthly Salary (PKR)</label>
            <input type="number" step="1000" id="salaryInput" value="150000" required />
          </div>
        \`;
      } else if (slug.includes('compound-interest')) {
        container.innerHTML = \`
          <div class="field">
            <label>Principal Amount ($)</label>
            <input type="number" id="pInput" value="10000" required />
          </div>
          <div class="field">
            <label>Annual Interest Rate (%)</label>
            <input type="number" step="0.1" id="rInput" value="7" required />
          </div>
          <div class="field">
            <label>Time Period (Years)</label>
            <input type="number" id="tInput" value="5" required />
          </div>
        \`;
      } else {
        // Generic Input
        container.innerHTML = \`
          <div class="field">
            <label>Input Value / Data</label>
            <textarea id="genericInput" rows="4" placeholder="Enter input here..."></textarea>
          </div>
        \`;
      }
    }

    function runCalc() {
      const resultBox = document.getElementById('resultBox');
      const resultMain = document.getElementById('resultMain');
      const resultDetail = document.getElementById('resultDetail');

      if (slug.includes('rule-of-72') || slug.includes('doubling')) {
        const r = parseFloat(document.getElementById('rateInput').value);
        if (!r || r <= 0) { alert('Enter positive rate'); return; }
        const approx = (72 / r).toFixed(1);
        const exact = (Math.log(2) / Math.log(1 + r / 100)).toFixed(2);
        resultMain.textContent = approx + ' Years (Approx)';
        resultDetail.textContent = 'Exact mathematical doubling time: ' + exact + ' years at ' + r + '% annual return.';
      } else if (slug.includes('bmi')) {
        const w = parseFloat(document.getElementById('weightInput').value);
        const h = parseFloat(document.getElementById('heightInput').value) / 100;
        const bmi = (w / (h * h)).toFixed(2);
        let cat = 'Normal weight';
        if (bmi < 18.5) cat = 'Underweight';
        else if (bmi >= 25 && bmi < 29.9) cat = 'Overweight';
        else if (bmi >= 30) cat = 'Obese';
        resultMain.textContent = bmi + ' BMI';
        resultDetail.textContent = 'WHO Category: ' + cat + ' for ' + w + 'kg and ' + (h*100) + 'cm.';
      } else if (slug.includes('age')) {
        const dobStr = document.getElementById('dobInput').value;
        const dob = new Date(dobStr);
        const now = new Date();
        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();
        if (days < 0) { months--; days += 30; }
        if (months < 0) { years--; months += 12; }
        resultMain.textContent = years + ' Years, ' + months + ' Months';
        resultDetail.textContent = 'Total living days: ' + Math.floor((now - dob)/(1000*60*60*24)) + ' days.';
      } else if (slug.includes('tax')) {
        const salary = parseFloat(document.getElementById('salaryInput').value);
        const annual = salary * 12;
        let taxAnnual = 0;
        if (annual <= 600000) taxAnnual = 0;
        else if (annual <= 1200000) taxAnnual = (annual - 600000) * 0.05;
        else if (annual <= 2200000) taxAnnual = 30000 + (annual - 1200000) * 0.15;
        else if (annual <= 3200000) taxAnnual = 180000 + (annual - 2200000) * 0.25;
        else if (annual <= 4100000) taxAnnual = 430000 + (annual - 3200000) * 0.30;
        else taxAnnual = 700000 + (annual - 4100000) * 0.35;
        const monthlyTax = (taxAnnual / 12).toFixed(0);
        const takeHome = (salary - monthlyTax).toFixed(0);
        resultMain.textContent = 'PKR ' + Number(monthlyTax).toLocaleString() + ' / month tax';
        resultDetail.textContent = 'Net Take-Home Salary: PKR ' + Number(takeHome).toLocaleString() + ' / month. (Annual FBR Tax: PKR ' + Number(taxAnnual.toFixed(0)).toLocaleString() + ')';
      } else if (slug.includes('compound-interest')) {
        const p = parseFloat(document.getElementById('pInput').value);
        const r = parseFloat(document.getElementById('rInput').value) / 100;
        const t = parseFloat(document.getElementById('tInput').value);
        const total = (p * Math.pow(1 + r, t)).toFixed(2);
        const interest = (total - p).toFixed(2);
        resultMain.textContent = '$' + Number(total).toLocaleString();
        resultDetail.textContent = 'Total Interest Earned: $' + Number(interest).toLocaleString() + ' over ' + t + ' years at ' + (r*100) + '%.';
      } else {
        const val = document.getElementById('genericInput').value;
        resultMain.textContent = 'Input Processed';
        resultDetail.textContent = 'Character length: ' + val.length + ', Words: ' + (val.trim() ? val.trim().split(/\\s+/).length : 0);
      }

      resultBox.classList.add('visible');
    }

    setupFields();
  </script>
</body>
</html>`;
}

/**
 * Trigger immediate browser download of the standalone offline HTML tool
 */
export function downloadToolOfflineFile(tool, isPro = false) {
  const htmlContent = generateOfflineHtml(tool, isPro);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tool.slug || 'tool'}.offline.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
