# Chrome Web Store Assertions

Updated: 2026-05-06

## Single Purpose

WB Controller Tracker keeps recently opened local Wiren Board controllers in one popup so users can quickly reopen their web UI or SSH while the controllers remain available on the local network.

## Core User Value

- The user opens a Wiren Board controller in the browser once.
- The extension remembers that controller locally.
- The popup becomes a compact launcher for returning to the same controller later without searching for its serial number or typing its address again.

## Permissions Justification

- `storage`
  Stores the remembered controller list locally in Chrome so the popup can show previously discovered controllers.

- `tabs`
  Reads tab URLs when pages finish loading so the extension can detect supported Wiren Board controller addresses visited by the user.

- `activeTab`
  Supports extension interaction in the current browser context. If Chrome Web Store review flags this as unnecessary, it can be removed because the main workflow does not depend on elevated page access.

- `scripting`
  Currently declared but not required by the shipped behavior. Remove before submission if you want the smallest possible permission surface.

- Host permissions: `http://*/`, `https://*/`
  Needed to recognize supported Wiren Board controller URLs and to probe controller web UI availability for the online status indicator.

## Data Handling Assertions

- The extension stores controller metadata only in local Chrome extension storage.
- The extension does not upload the remembered controller list to any backend.
- The extension does not sell or share user data with third parties.
- Online checks are direct requests from the browser to controller addresses on the user's network.

## Listing Assertions

- The store description must match the actual behavior: remembering and reopening local Wiren Board controllers.
- Screenshots must show the current popup UI, including controller rows, SSH action, overflow menu, and status indicator.
- The privacy policy must stay consistent with the declared permissions and real runtime behavior.

## Submission Checklist

- ZIP upload built from `dist/chrome-extension`
- At least one screenshot
- Small promo image `440x280`
- Privacy policy URL
- Accurate permission answers in the Privacy practices tab
