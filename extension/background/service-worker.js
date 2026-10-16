// Background Service Worker for Vimz.ai Extension (Manifest V3)

// 1. Initialize context menus on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'vimz-root',
    title: 'Vimz.ai Tools',
    contexts: ['selection', 'page']
  });

  chrome.contextMenus.create({
    id: 'vimz-word-count',
    parentId: 'vimz-root',
    title: 'Count Words & Characters',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'vimz-open-app',
    parentId: 'vimz-root',
    title: 'Open Vimz.ai Web Platform',
    contexts: ['page', 'selection']
  });
});

// 2. Handle context menu actions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'vimz-word-count' && info.selectionText) {
    const text = info.selectionText;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    
    // Save to storage for popup to view
    await chrome.storage.local.set({
      lastSelectedText: text,
      lastWordCount: { words, chars, timestamp: Date.now() }
    });

    // Provide immediate badge feedback
    await chrome.action.setBadgeText({ text: `${words}w` });
    await chrome.action.setBadgeBackgroundColor({ color: '#6C4CF1' });

    // Clear badge after 4 seconds
    setTimeout(async () => {
      await chrome.action.setBadgeText({ text: '' });
    }, 4000);
  } else if (info.menuItemId === 'vimz-open-app') {
    await chrome.tabs.create({ url: 'https://vimztools-app.netlify.app' });
  }
});

// 3. Message handler for extension communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_APP_URL') {
    sendResponse({ url: 'https://vimztools-app.netlify.app' });
    return true;
  }
  return true;
});
