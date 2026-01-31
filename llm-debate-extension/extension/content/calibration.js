// content/calibration.js

class CalibrationMode {
  constructor() {
    this.isActive = false;
    this.currentTargetType = null; // 'input' or 'send'
    this.overlay = null;

    // Listen for toggle message
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'TOGGLE_TEACH_MODE') {
        this.toggle(request.payload.enable);
      }
    });
  }

  toggle(enable) {
    this.isActive = enable;
    if (enable) {
      this.createOverlay();
      document.addEventListener('click', this.handleClick, true);
      document.addEventListener('mouseover', this.handleHover, true);
    } else {
      this.removeOverlay();
      document.removeEventListener('click', this.handleClick, true);
      document.removeEventListener('mouseover', this.handleHover, true);
    }
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.style.position = 'fixed';
    this.overlay.style.top = '10px';
    this.overlay.style.left = '50%';
    this.overlay.style.transform = 'translateX(-50%)';
    this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.overlay.style.color = 'white';
    this.overlay.style.padding = '10px 20px';
    this.overlay.style.borderRadius = '5px';
    this.overlay.style.zIndex = '10000';
    this.overlay.style.pointerEvents = 'none'; // Let clicks pass through to elements, but we capture them
    this.overlay.innerText = 'Teach Mode: Click the INPUT box (Textarea)';
    document.body.appendChild(this.overlay);

    this.currentTargetType = 'input';
  }

  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    // Remove any highlights
    this.clearHighlights();
  }

  handleHover = (e) => {
    if (!this.isActive) return;
    this.clearHighlights();
    e.target.style.outline = '2px solid red';
    e.target.dataset.calibrationHighlight = 'true';
  }

  handleClick = (e) => {
    if (!this.isActive) return;
    e.preventDefault();
    e.stopPropagation();

    const element = e.target;
    const selector = this.generateSelector(element);

    console.log(`Selected ${this.currentTargetType}:`, selector);
    window.selectorEngine.saveUserSelector(this.currentTargetType, selector);

    if (this.currentTargetType === 'input') {
      this.currentTargetType = 'send';
      this.overlay.innerText = 'Teach Mode: Now click the SEND button';
    } else if (this.currentTargetType === 'send') {
      this.toggle(false);
      alert('Calibration Complete! Selectors saved.');
      // Notify popup/background?
    }
  }

  clearHighlights() {
    const highlighted = document.querySelectorAll('[data-calibration-highlight="true"]');
    highlighted.forEach(el => {
      el.style.outline = '';
      delete el.dataset.calibrationHighlight;
    });
  }

  generateSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c.trim()).join('.');
      if (classes) return `${el.tagName.toLowerCase()}.${classes}`;
    }
    // Fallback to simple path
    let path = [], parent;
    while (parent = el.parentNode) {
      path.unshift(`${el.tagName.toLowerCase()}:nth-child(${[].indexOf.call(parent.children, el)+1})`);
      el = parent;
      if (el.tagName === 'HTML') break;
    }
    return `${el.tagName.toLowerCase()} > ${path.join(' > ')}`;
  }
}

window.calibrationMode = new CalibrationMode();
