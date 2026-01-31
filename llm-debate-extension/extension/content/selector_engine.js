// content/selector_engine.js

class SelectorEngine {
  constructor() {
    this.domain = window.location.hostname;
    this.defaultSelectors = {};
    this.userSelectors = {};
    this.init();
  }

  async init() {
    // Load defaults
    const url = chrome.runtime.getURL('content/selectors.json');
    const response = await fetch(url);
    const allDefaults = await response.json();
    this.defaultSelectors = allDefaults[this.domain] || {};

    // Load user overrides
    const storage = await chrome.storage.local.get('selectorOverrides');
    if (storage.selectorOverrides && storage.selectorOverrides[this.domain]) {
      this.userSelectors = storage.selectorOverrides[this.domain];
    }
  }

  getSelector(type) {
    // Priority: User > Default
    if (this.userSelectors[type]) {
      return [this.userSelectors[type]]; // User selector is always a single string (CSS path)
    }
    return this.defaultSelectors[type] || [];
  }

  findElement(type) {
    const selectors = this.getSelector(type);
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) {
        console.warn(`Invalid selector: ${sel}`, e);
      }
    }
    return null;
  }

  // Update user selector (from Teach Mode)
  async saveUserSelector(type, cssPath) {
    const storage = await chrome.storage.local.get('selectorOverrides');
    const overrides = storage.selectorOverrides || {};

    if (!overrides[this.domain]) {
      overrides[this.domain] = {};
    }

    overrides[this.domain][type] = cssPath;
    await chrome.storage.local.set({ selectorOverrides: overrides });
    this.userSelectors = overrides[this.domain];
    console.log(`Saved user selector for ${type}: ${cssPath}`);
  }
}

// Singleton instance
window.selectorEngine = new SelectorEngine();
