// content/adapters/chatgpt_adapter.js

class ChatGPTAdapter extends BaseAdapter {
  constructor() {
    super('chatgpt.com');
  }

  async setInputValue(input, text) {
    if (input.tagName === 'TEXTAREA') {
        input.value = text;
        input.style.height = '200px'; // Force resize to be visible
    } else {
        input.innerHTML = '<p>' + text + '</p>';
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

window.ChatGPTAdapter = ChatGPTAdapter;
