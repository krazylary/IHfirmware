// content/adapters/claude_adapter.js

class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super('claude.ai');
  }

  async setInputValue(input, text) {
    // Claude is sensitive to how text is inserted
    input.focus();
    // Use execCommand for contenteditable reliability if direct assignment fails
    // But direct assignment is usually preferred for extensions
    input.innerText = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

window.ClaudeAdapter = ClaudeAdapter;
