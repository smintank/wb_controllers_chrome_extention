# WB Controller Tracker

WB Controller Tracker is a small Chrome extension for keeping recently opened local Wiren Board controllers in one popup.

It watches supported Wiren Board controller pages that you open in the browser, remembers them locally, and shows them as a compact list for quick access later. From the popup you can:

- reopen a controller web UI;
- open an SSH link for the controller;
- see whether the controller is currently reachable on the local network.

## Why it exists

When you work with several local controllers, it is easy to lose track of hostnames and serial numbers. This extension turns your recent browser activity into a lightweight launcher, so controllers you already visited stay one click away while they are still reachable on your network.

## Local installation

This extension is not currently published in the Chrome Web Store, so install it locally in developer mode.

1. Clone this repository.
2. Install dependencies:

```bash
npm install
```

3. Build the local extension package:

```bash
npm run package:extension
```

4. Open `chrome://extensions/` in Chrome.
5. Enable `Developer mode`.
6. Click `Load unpacked`.
7. Select the `dist/chrome-extension` folder inside your local copy of this repository.

After that, open a supported Wiren Board controller page in your browser. The controller will be remembered and will appear in the extension popup.

## Development

Run tests with:

```bash
npm test
```
