// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const bindButtons = {
    'bind-orch': 'ORCHESTRATOR',
    'bind-gpt': 'DEBATER',
    'bind-claude': 'CLAUDE',
    'bind-gemini': 'GEMINI'
  };

  // Bind Handlers
  for (const [id, role] of Object.entries(bindButtons)) {
    document.getElementById(id).addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.runtime.sendMessage({
          action: 'BIND_TAB',
          payload: { role, tabId: tab.id }
        }, (response) => {
          updateStatus(`Bound ${role} to Tab ${tab.id}`);
        });
      }
    });
  }

  // Debate Control
  document.getElementById('start-debate').addEventListener('click', () => {
    const topic = document.getElementById('topic').value;
    if (!topic) return alert('Please enter a topic');

    chrome.runtime.sendMessage({
      action: 'START_DEBATE',
      payload: { topic }
    });
    updateStatus('Debate Started...');
  });

  // Tools
  document.getElementById('toggle-teach').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_TEACH_MODE', payload: { enable: true } });
  });

  document.getElementById('toggle-debug').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_DEBUG_OVERLAY', payload: { enable: true } });
  });

  // Assisted Mode Controls
  document.getElementById('copy-prompt').addEventListener('click', () => {
    const copyText = document.getElementById('assisted-prompt');
    copyText.select();
    document.execCommand('copy');
  });

  document.getElementById('submit-manual').addEventListener('click', () => {
    const response = document.getElementById('manual-response').value;
    if (!response) return alert('Please paste the response');

    chrome.runtime.sendMessage({
      action: 'SUBMIT_MANUAL_RESPONSE',
      payload: { response }
    });

    // Hide UI immediately
    document.getElementById('assisted-controls').style.display = 'none';
    updateStatus('Manual response submitted...');
  });

  function updateStatus(text) {
    document.getElementById('status-display').innerText = `Status: ${text}`;
  }

  // Poll Status
  setInterval(() => {
    chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response) {
        updateStatus(response.state);

        if (response.state === 'ASSISTED_WAIT' && response.pendingAssistance) {
          document.getElementById('assisted-controls').style.display = 'block';
          document.getElementById('assisted-prompt').value = response.pendingAssistance.prompt;
        } else {
          document.getElementById('assisted-controls').style.display = 'none';
        }
      }
    });
  }, 1000);
});
