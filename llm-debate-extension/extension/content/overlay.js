// content/overlay.js

class DebugOverlay {
  constructor() {
    this.enabled = false;
    this.interval = null;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'TOGGLE_DEBUG_OVERLAY') {
        this.toggle(request.payload.enable);
      }
    });
  }

  toggle(enable) {
    this.enabled = enable;
    if (enable) {
      this.interval = setInterval(() => this.update(), 1000);
      this.createStatusPanel();
    } else {
      clearInterval(this.interval);
      this.removeHighlights();
      this.removeStatusPanel();
    }
  }

  createStatusPanel() {
    this.panel = document.createElement('div');
    this.panel.style.position = 'fixed';
    this.panel.style.bottom = '10px';
    this.panel.style.right = '10px';
    this.panel.style.backgroundColor = 'rgba(0,0,0,0.7)';
    this.panel.style.color = '#fff';
    this.panel.style.padding = '5px';
    this.panel.style.zIndex = '9999';
    this.panel.style.fontSize = '12px';
    this.panel.innerHTML = 'Debug: Active';
    document.body.appendChild(this.panel);
  }

  removeStatusPanel() {
    if (this.panel) this.panel.remove();
  }

  update() {
    if (!window.selectorEngine) return;

    const input = window.selectorEngine.findElement('input');
    const send = window.selectorEngine.findElement('send');
    const stop = window.selectorEngine.findElement('stop');

    this.removeHighlights();

    if (input) this.highlight(input, 'green', 'INPUT');
    if (send) this.highlight(send, 'blue', 'SEND');
    if (stop) this.highlight(stop, 'red', 'GENERATING');

    if (this.panel) {
      this.panel.innerHTML = `
        Input: ${input ? 'Found' : 'Missing'}<br>
        Send: ${send ? 'Found' : 'Missing'}<br>
        Status: ${stop ? 'Generating' : 'Idle'}
      `;
    }
  }

  highlight(el, color, label) {
    const rect = el.getBoundingClientRect();
    const div = document.createElement('div');
    div.className = 'debate-debug-highlight';
    div.style.position = 'absolute';
    div.style.left = rect.left + 'px';
    div.style.top = rect.top + 'px';
    div.style.width = rect.width + 'px';
    div.style.height = rect.height + 'px';
    div.style.border = `2px solid ${color}`;
    div.style.pointerEvents = 'none';
    div.style.zIndex = '9998';

    // Adjust for scroll
    div.style.top = (rect.top + window.scrollY) + 'px';
    div.style.left = (rect.left + window.scrollX) + 'px';

    document.body.appendChild(div);
  }

  removeHighlights() {
    document.querySelectorAll('.debate-debug-highlight').forEach(el => el.remove());
  }
}

window.debugOverlay = new DebugOverlay();
