// content/main.js

(function() {
  console.log('LLM Debate Content Script Loaded');

  const hostname = window.location.hostname;
  let adapter = null;

  if (hostname.includes('chatgpt.com')) {
    adapter = new ChatGPTAdapter();
  } else if (hostname.includes('claude.ai')) {
    adapter = new ClaudeAdapter();
  } else if (hostname.includes('gemini.google.com')) {
    adapter = new GeminiAdapter();
  } else {
    console.log('No specific adapter for this domain, using BaseAdapter');
    adapter = new BaseAdapter(hostname);
  }

  // Listen for messages from Background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SEND_PROMPT') {
      handleSendPrompt(request.payload, sendResponse);
      return true; // Async response
    }
  });

  async function handleSendPrompt(payload, sendResponse) {
    try {
      await adapter.sendMessage(payload.text);
      const response = await adapter.waitForCompletion();
      sendResponse({ success: true, response });
    } catch (e) {
      console.error('Debate Adapter Error:', e);
      sendResponse({ success: false, error: e.toString() });
    }
  }

})();
