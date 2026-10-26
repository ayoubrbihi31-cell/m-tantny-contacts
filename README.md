# M-Tantny Contacts

Static contact organizer: HTML, CSS, vanilla JS (ES modules) and IndexedDB. No backend, no npm, no tracking. Arabic RTL interface.

## What works
Category cards → subcategories → contacts · add/edit/delete contacts · one contact in many categories · global search + filters (category, profession, favorites, recent) · favorites · call/SMS via `tel:`/`sms:` · copy number · share (where supported) · category create/rename/reorder/delete (contacts are moved or left uncategorized) · JSON export/import (validated, confirmed) · clear all data · light/dark theme · Contact Picker import with preview.

## Honest limits
- **Phone contacts:** only the browser Contact Picker API (Chrome on Android, HTTPS). You choose contacts each time. A website cannot read the whole address book, sync it, or read call history. Other browsers get a clear message and manual entry.
- **Storage:** data lives only in this browser on this device. Clearing browser/site data deletes it. No cross-device sync. Use Settings → Export for backups.
- **Not in v1:** English/French interface (Arabic only), contact photos, service worker (the app needs internet to open the first time and has no offline cache).
- Calls and SMS are handed to your phone's apps; the web page cannot place calls itself.
- Not yet tested on a live server or real phone. Test it after deploying.

## Upload to GitHub from a phone
1. In Chrome open github.com, sign in, tap **＋ → New repository**. Name it `m-tantny-contacts`, keep it Public, tap **Create repository**.
2. Chrome menu **⋮ → Desktop site** (makes the upload buttons easier to see).
3. Tap **Add file → Upload files**. Select these 8 files together: `index.html`, `style.css`, `app.js`, `db.js`, `contacts.js`, `categories.js`, `manifest.json`, `README.md`. Tap **Commit changes**.
4. Make the icons folder: **Add file → Create new file**, type `icons/readme.txt` as the name (typing `/` creates the folder), write any text, **Commit**.
5. Open the `icons` folder → **Add file → Upload files** → select `icon-192.png` and `icon-512.png` → **Commit**.
6. Check the repo shows `icons/` and all files in the root (not inside another folder).

## Deploy on Vercel
1. Go to vercel.com → **Sign up with GitHub**.
2. **Add New → Project** → import `m-tantny-contacts`.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Root Directory: `./`.
4. Tap **Deploy**. Open the `https://….vercel.app` link on your Android phone in Chrome.
5. **Update later:** open a file on GitHub → pencil icon → edit → **Commit**. Vercel redeploys automatically in about a minute. To replace a file, **Add file → Upload files** with the same name.

## Install as an app (PWA)
Open the live HTTPS link in Chrome → **⋮ → Add to Home screen** (or **Install app**). It uses `manifest.json` and the two icons. Without a service worker it still opens as a standalone app but needs internet.

## Copy checklist
- [ ] Root: index.html, style.css, app.js, db.js, contacts.js, categories.js, manifest.json, README.md
- [ ] icons/icon-192.png and icons/icon-512.png
- [ ] Live page loads, home shows 8 category cards
- [ ] Add a contact, refresh, it is still there
- [ ] Contact in two categories shows under both
- [ ] Search by name, number, profession and category name
- [ ] Call and SMS buttons open the phone apps with the right number
- [ ] Export, then import the same file
- [ ] Contact import shows a clear result or limitation message
