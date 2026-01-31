// content/adapters/base_adapter.js

class BaseAdapter {
  constructor(domain) {
    this.domain = domain;
    this.engine = window.selectorEngine;
  }

  async sendMessage(text) {
    console.log(`[Adapter] Sending message to ${this.domain}...`);
    const input = this.engine.findElement('input');
    const send = this.engine.findElement('send');

    if (!input) throw new Error('Input element not found');
    if (!send) throw new Error('Send button not found');

    // Strategy 1: standard value set + event dispatch
    await this.setInputValue(input, text);

    // Allow UI to update
    await new Promise(r => setTimeout(r, 500));

    // Strategy 2: Click send
    send.click();

    // Fallback: Check if still present after 1s, try Enter key?
    // Not implemented in Base, can be overridden
  }

  async setInputValue(input, text) {
    // Handle ContentEditable
    if (input.isContentEditable) {
      input.textContent = text; // or innerHTML? textContent is safer
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async waitForCompletion(timeout = 60000) {
    console.log('[Adapter] Waiting for completion...');
    const startTime = Date.now();
    let stableCount = 0;
    let lastText = '';

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        // Timeout check
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error('Timeout waiting for completion'));
          return;
        }

        // Check 1: Is "Stop Generating" button visible?
        const stopBtn = this.engine.findElement('stop');
        if (stopBtn) {
          // Still generating
          stableCount = 0;
          return;
        }

        // Check 2: Text Stabilization
        const lastMsg = this.getLatestMessage();
        const currentText = lastMsg ? lastMsg.innerText : '';

        if (currentText && currentText === lastText) {
          stableCount++;
        } else {
          stableCount = 0;
          lastText = currentText;
        }

        // If stable for 2 seconds (4 checks at 500ms)
        if (stableCount >= 4) {
          clearInterval(interval);
          resolve(currentText);
        }
      }, 500);
    });
  }

  getLatestMessage() {
    return this.engine.findElement('lastMessage');
  }
}

window.BaseAdapter = BaseAdapter;
