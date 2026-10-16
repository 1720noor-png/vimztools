// Popup Logic for Vimz.ai Chrome Extension
import { fetchCurrentUser, loginUser, logoutUser } from '../shared/api.js';
import { ALL_TOOLS } from '../shared/tools.js';

// Curated popular tools shown by default
const POPULAR_TOOLS = ALL_TOOLS.slice(0, 20);

document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupSubtools();
  setupInspector();
  setupQuickTools();
  setupSearch();
  await setupAccount();
});

// 1. Tab Switching
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = `tab-${btn.dataset.tab}`;
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
    });
  });
}

// 2. Subtool Switching
function setupSubtools() {
  const subBtns = document.querySelectorAll('.subtool-btn');
  subBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.subtool-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`tool-${btn.dataset.tool}`);
      if (pane) pane.classList.add('active');
    });
  });
}

// 3. Active Page SEO Inspector
function setupInspector() {
  const btnInspect = document.getElementById('btn-inspect-page');
  const loading = document.getElementById('inspector-loading');
  const results = document.getElementById('inspector-results');

  btnInspect.addEventListener('click', async () => {
    loading.classList.remove('hidden');
    results.innerHTML = '';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('No active browser tab found.');

      if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('chrome-extension://')) {
        loading.classList.add('hidden');
        results.innerHTML = `<p class="error-msg">Cannot inspect internal browser pages (${tab.url}). Please open a regular website.</p>`;
        return;
      }

      // Execute inspector script in active tab
      const [injectionResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/inspector.js']
      });

      loading.classList.add('hidden');
      const data = injectionResult ? injectionResult.result : null;

      if (!data || !data.success) {
        results.innerHTML = `<p class="error-msg">${data?.error || 'Failed to analyze page.'}</p>`;
        return;
      }

      renderAuditResults(data);
    } catch (err) {
      loading.classList.add('hidden');
      results.innerHTML = `<p class="error-msg">${err.message}</p>`;
    }
  });
}

function renderAuditResults(d) {
  const container = document.getElementById('inspector-results');
  
  const titleBadge = (d.titleLength >= 30 && d.titleLength <= 60) 
    ? '<span class="tag-badge ok">Optimal (30-60 chars)</span>' 
    : '<span class="tag-badge warn">Needs optimization</span>';

  const descBadge = (d.metaDescLength >= 120 && d.metaDescLength <= 160)
    ? '<span class="tag-badge ok">Optimal (120-160 chars)</span>'
    : '<span class="tag-badge warn">Needs optimization</span>';

  const h1Badge = d.headings.h1Count === 1 
    ? '<span class="tag-badge ok">1 H1 Tag (Good)</span>' 
    : `<span class="tag-badge warn">${d.headings.h1Count} H1 Tags</span>`;

  container.innerHTML = `
    <div class="audit-row">
      <span class="audit-label">Page Title (${d.titleLength} chars) ${titleBadge}</span>
      <span class="audit-val">${escapeHtml(d.title || '(No title found)')}</span>
    </div>
    <div class="audit-row">
      <span class="audit-label">Meta Description (${d.metaDescLength} chars) ${descBadge}</span>
      <span class="audit-val">${escapeHtml(d.metaDesc || '(No meta description found)')}</span>
    </div>
    <div class="audit-row">
      <span class="audit-label">Headings & Structure ${h1Badge}</span>
      <span class="audit-val">H1: ${d.headings.h1Count} | H2: ${d.headings.h2Count} | H3: ${d.headings.h3Count}</span>
      ${d.headings.h1List.length ? `<span class="muted" style="font-size:10px;">Primary H1: "${escapeHtml(d.headings.h1List[0])}"</span>` : ''}
    </div>
    <div class="audit-row">
      <span class="audit-label">Page Word Count & Images</span>
      <span class="audit-val">Total Words: ~${d.wordCount.toLocaleString()} | Images: ${d.images.total} (${d.images.missingAlt} missing alt)</span>
    </div>
    <div class="audit-row">
      <span class="audit-label">Open Graph (og:title)</span>
      <span class="audit-val">${escapeHtml(d.og.title || '(No og:title set)')}</span>
    </div>
  `;
}

// 4. Quick Tools Handlers
function setupQuickTools() {
  // Word Counter
  const wcInput = document.getElementById('wc-input');
  const wcWords = document.getElementById('wc-words');
  const wcChars = document.getElementById('wc-chars');
  const wcSentences = document.getElementById('wc-sentences');
  const wcTime = document.getElementById('wc-time');

  const updateWordCount = () => {
    const text = wcInput.value || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const readMinutes = Math.ceil(words / 200);

    wcWords.textContent = words;
    wcChars.textContent = chars;
    wcSentences.textContent = sentences;
    wcTime.textContent = `${readMinutes}m`;
  };

  wcInput.addEventListener('input', updateWordCount);

  // Check if context menu saved any selection
  chrome.storage.local.get('lastSelectedText').then(data => {
    if (data.lastSelectedText) {
      wcInput.value = data.lastSelectedText;
      updateWordCount();
      chrome.storage.local.remove('lastSelectedText');
    }
  });

  // Case Converter
  const caseInput = document.getElementById('case-input');
  document.getElementById('btn-upper').addEventListener('click', () => { caseInput.value = caseInput.value.toUpperCase(); });
  document.getElementById('btn-lower').addEventListener('click', () => { caseInput.value = caseInput.value.toLowerCase(); });
  document.getElementById('btn-title').addEventListener('click', () => {
    caseInput.value = caseInput.value.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
  });
  document.getElementById('btn-camel').addEventListener('click', () => {
    caseInput.value = caseInput.value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  });
  document.getElementById('btn-kebab').addEventListener('click', () => {
    caseInput.value = caseInput.value.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
  });
  document.getElementById('btn-snake').addEventListener('click', () => {
    caseInput.value = caseInput.value.trim().toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
  });

  // JSON Formatter
  const jsonInput = document.getElementById('json-input');
  const jsonStatus = document.getElementById('json-status');
  document.getElementById('btn-format-json').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(jsonInput.value);
      jsonInput.value = JSON.stringify(parsed, null, 2);
      jsonStatus.textContent = 'Valid JSON formatted.';
      jsonStatus.style.color = '#0D9B79';
    } catch (e) {
      jsonStatus.textContent = `Invalid JSON: ${e.message}`;
      jsonStatus.style.color = '#E53E3E';
    }
  });
  document.getElementById('btn-minify-json').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(jsonInput.value);
      jsonInput.value = JSON.stringify(parsed);
      jsonStatus.textContent = 'Minified successfully.';
      jsonStatus.style.color = '#0D9B79';
    } catch (e) {
      jsonStatus.textContent = `Invalid JSON: ${e.message}`;
      jsonStatus.style.color = '#E53E3E';
    }
  });
  document.getElementById('btn-copy-json').addEventListener('click', () => {
    navigator.clipboard.writeText(jsonInput.value);
    jsonStatus.textContent = 'Copied to clipboard!';
    jsonStatus.style.color = '#6C4CF1';
  });

  // Percentage Calculator
  const pctX = document.getElementById('pct-x');
  const pctY = document.getElementById('pct-y');
  const pctResult = document.getElementById('pct-result');
  const updatePct = () => {
    const x = parseFloat(pctX.value) || 0;
    const y = parseFloat(pctY.value) || 0;
    const res = (x * y) / 100;
    pctResult.textContent = Number.isInteger(res) ? res : res.toFixed(2);
  };
  pctX.addEventListener('input', updatePct);
  pctY.addEventListener('input', updatePct);
}

// 5. Search 1,059 Tools
function setupSearch() {
  const input = document.getElementById('omni-search-input');
  const list = document.getElementById('search-results-list');

  const renderTools = (tools) => {
    if (!tools.length) {
      list.innerHTML = `<p class="hint-text" style="padding:10px;">No tools found matching your search.</p>`;
      return;
    }
    list.innerHTML = tools.map(t => `
      <a href="https://vimztools-app.netlify.app/tool/${t.slug}" target="_blank" class="search-item">
        <div class="search-item-info">
          <span class="search-item-name">${escapeHtml(t.name)}</span>
          <span class="search-item-cat">${escapeHtml(t.cat)}</span>
        </div>
        <span class="muted" style="font-size:12px;">&rarr;</span>
      </a>
    `).join('');
  };

  renderTools(POPULAR_TOOLS);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      renderTools(POPULAR_TOOLS);
      return;
    }
    const filtered = ALL_TOOLS.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.slug.toLowerCase().includes(q) || 
      t.cat.toLowerCase().includes(q)
    ).slice(0, 30);
    renderTools(filtered);
  });
}

// 6. Account & Pro Sync
async function setupAccount() {
  const loggedInPane = document.getElementById('account-logged-in');
  const loggedOutPane = document.getElementById('account-logged-out');
  const headerBadge = document.getElementById('pro-badge-header');
  const loginError = document.getElementById('login-error');

  const renderUser = (user) => {
    if (user) {
      loggedOutPane.classList.add('hidden');
      loggedInPane.classList.remove('hidden');
      document.getElementById('user-display-name').textContent = user.name || 'Vimz User';
      document.getElementById('user-display-email').textContent = user.email || '';
      document.getElementById('user-initial').textContent = (user.name || user.email || 'U').charAt(0).toUpperCase();

      const isPro = user.role === 'admin' || user.is_pro || false;
      if (isPro) {
        headerBadge.textContent = 'PRO';
        headerBadge.className = 'badge-pro';
        document.getElementById('user-plan-badge').textContent = 'Vimz.ai Pro Member';
        document.getElementById('user-plan-badge').className = 'badge-pro';
      } else {
        headerBadge.textContent = 'FREE';
        headerBadge.className = 'badge-free';
        document.getElementById('user-plan-badge').textContent = 'Free Account';
        document.getElementById('user-plan-badge').className = 'badge-free';
      }
    } else {
      loggedInPane.classList.add('hidden');
      loggedOutPane.classList.remove('hidden');
      headerBadge.textContent = 'FREE';
      headerBadge.className = 'badge-free';
    }
  };

  // Initial check
  const user = await fetchCurrentUser();
  renderUser(user);

  // Login handler
  document.getElementById('btn-submit-login').addEventListener('click', async () => {
    loginError.textContent = '';
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      loginError.textContent = 'Please enter both email and password.';
      return;
    }

    try {
      const u = await loginUser(email, password);
      renderUser(u);
    } catch (err) {
      loginError.textContent = err.message || 'Login failed.';
    }
  });

  // Logout handler
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await logoutUser();
    renderUser(null);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
