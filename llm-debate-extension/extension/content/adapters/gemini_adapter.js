// content/adapters/gemini_adapter.js

class GeminiAdapter extends BaseAdapter {
  constructor() {
    super('gemini.google.com');
  }

  async setInputValue(input, text) {
    // Gemini often puts the contenteditable inside a wrapper
    if (!input.isContentEditable && input.querySelector('[contenteditable="true"]')) {
      input = input.querySelector('[contenteditable="true"]');
    }

    input.innerText = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

window.GeminiAdapter = GeminiAdapter;
