# LatinMed AI — Simple Version

No build tools, no Vite, no Cloudflare Worker. Just plain HTML/CSS/JS.

## Setup (only one file to edit)

Open **config.js** and:

1. Firebase config — already filled in with your project's values.
2. Replace `PASTE_YOUR_GEMINI_API_KEY_HERE` with your Google Gemini API key
   (get one free at https://aistudio.google.com/app/apikey).

## Run it

Just open `index.html` in a browser, or host the whole folder on any static
host (GitHub Pages, Netlify, Firebase Hosting, etc.) — no build step needed.

## ⚠️ Important note about the Gemini API key

This version calls the Gemini API directly from the browser, which means the
API key is visible to anyone who opens the browser dev tools. This is fine
for personal use, testing, or a small private deployment, but if you publish
this publicly, someone could copy your key and use your Gemini quota.

To prevent that, you'd need a small server-side proxy (like the original
Cloudflare Worker version) to hide the key — but for ease-of-use, this
version skips that.

## Files

- `index.html` — the whole app (auth screen + chat UI)
- `config.js` — **your API keys go here**
- `js/auth.js` — Firebase login/signup/logout
- `js/app.js` — chat logic, calls Gemini, session summary

## Firestore rules

Make sure Firestore has a `users` collection where each doc (by uid) has
`username` and `email` fields — same as before, signup creates this
automatically.
