# LLM Debate Orchestrator

A Chrome Extension to orchestrate live debates between ChatGPT, Claude, and Gemini.

## Prerequisites

1.  **Node.js**: Required for the Localhost Server.
2.  **Google Chrome**: To load the unpacked extension.
3.  **Accounts**: You must be logged into ChatGPT, Claude, and Gemini in your browser.

## Installation

### 1. Start the Localhost Server
The server persists debate logs and provides a live dashboard.

```bash
cd llm-debate-extension/server
npm install
node server.js
```
The server will run on `http://localhost:3000`.
Dashboard: `http://localhost:3000` (Open in browser).

### 2. Load the Chrome Extension
1.  Open Chrome and go to `chrome://extensions`.
2.  Enable **Developer Mode** (top right).
3.  Click **Load unpacked**.
4.  Select the `llm-debate-extension/extension` folder.

## Usage

1.  **Open 4 Tabs**:
    *   **Tab 1**: ChatGPT (Will be the **Orchestrator**).
    *   **Tab 2**: ChatGPT (Will be the **Debater** - open a *new* chat).
    *   **Tab 3**: Claude (Will be the **Critic**).
    *   **Tab 4**: Gemini (Will be the **Researcher**).

2.  **Bind Tabs**:
    *   Go to each tab, open the Extension Popup.
    *   Click **Bind** for the corresponding role.
    *   *Tip*: You can verify bindings in the Server Dashboard.

3.  **Start Debate**:
    *   In the Extension Popup, enter a **Topic**.
    *   Click **Start Debate**.

4.  **Monitor**:
    *   Watch the tabs work automatically.
    *   View live logs at `http://localhost:3000`.

## Troubleshooting

*   **Selectors**: If the extension can't find the input box, click **Toggle Teach Mode** in the popup. Click the Input box, then the Send button to teach the extension.
*   **Debug Overlay**: Click **Toggle Debug Overlay** to see what the extension sees (Green = Input, Blue = Send).
*   **Stuck?**: If a model gets stuck, reload the page. The extension will likely error out for that round.

## Architecture
*   **Extension**: Handles the state machine and DOM interaction.
*   **Server**: Node.js + WebSocket for logging and dashboard.
*   **Orchestrator**: ChatGPT (Tab A) generates instructions in JSON format.
