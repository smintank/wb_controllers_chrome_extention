# Privacy Policy Template

Last updated: 2026-05-06

## Product

WB Controller Tracker

## What the extension does

WB Controller Tracker helps the user reopen recently visited local Wiren Board controllers from a popup. It stores discovered controller addresses locally in the browser and lets the user open the controller web UI or SSH link again while the controller is still reachable on the local network.

## Data the extension processes

The extension may process:

- Controller page URLs that match supported Wiren Board address patterns.
- Controller serial numbers derived from those URLs.
- Local controller hostnames derived from those URLs.
- Timestamps such as when a controller was last seen.

## How the data is used

The data is used only to:

- detect supported Wiren Board controller pages the user opens;
- remember controllers in the popup list;
- show current controller availability in the popup;
- reopen the controller web UI or SSH link when the user clicks an action.

## Where the data is stored

The extension stores controller data locally in the user's browser using Chrome extension storage.

## Data sharing

The extension does not sell user data.

The extension does not transfer stored controller data to the developer or to third parties.

The extension may send standard network requests directly from the user's browser to controller addresses on the local network in order to check whether a controller is online.

## Permissions

- `storage`: stores the remembered controller list locally.
- `tabs`: reads the current tab URL so the extension can detect supported Wiren Board controller pages.
- `activeTab`: used together with popup actions in the active browser context.
- `scripting`: reserved for extension runtime capabilities in Chrome; if unused in the final release, remove it from the manifest before submission.
- host permissions for `http://*/` and `https://*/`: allow the extension to detect supported controller URLs and check controller availability.

## User control

Users can remove remembered controllers from the popup list. Users can also uninstall the extension at any time to stop further data processing.

## Contact

Replace this section with your real support or publisher contact details before publishing.
