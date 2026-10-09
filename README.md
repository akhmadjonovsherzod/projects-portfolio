# Lotin tilida klinik terminlar yasash usullari

A simple educational web app that teaches how Latin clinical/medical terms are
built from roots, prefixes, and suffixes — with an AI tutor chatbot (Google
Gemini) and bilingual (English / Uzbek) content.

**Stack:** plain HTML / CSS / JavaScript (ES modules, no frameworks), Firebase
Authentication, Google Gemini API (proxied through a Cloudflare Worker so the
API key is never exposed to the browser).

## Project structure

```
/
├── index.html              # Login / Register page
├── chatbot.html             # Main app: sections + AI tutor chat
├── profile.html              # Profile page
├── css/
│   └── style.css              # Shared styles (light + dark theme)
├── js/
│   ├── firebase.js            # Firebase app/auth init
│   ├── auth.js                # Login/register logic + route guard
│   ├── app.js                 # Profile page logic
│   ├── chatbot.js             # Chat UI + calls to the Worker
│   ├── i18n.js                # EN/UZ translations + theme helper
│   └── sections-data.js       # The 4 educational sections' content
├── config.js                 # Firebase config + Worker URL (EDIT THIS)
├── cloudflare-worker/
│   ├── worker.js               # Gemini proxy (Cloudflare Worker)
│   └── wrangler.toml           # Worker deploy config
└── README.md
```

## 1. Firebase setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
3. In **Project settings → General → Your apps**, click the **Web** icon (`</>`) to register a web app.
4. Copy the generated `firebaseConfig` object.
5. Paste those values into `config.js` at the project root:

   ```js
   export const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

No further Firebase setup is required — the app only uses Email/Password
Authentication. Chat history is stored locally in the browser
(`localStorage`), scoped per logged-in user.

## 2. Google Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create an API key.
2. **Do not** put this key in any frontend file. It only goes into the Cloudflare Worker secret (step 3 below).

## 3. Cloudflare Worker setup (Gemini proxy)

The frontend never calls Gemini directly — it calls your Worker, which holds
the API key as a secret and forwards the request.

1. Install Wrangler (Cloudflare's CLI) if you don't have it:

   ```bash
   npm install -g wrangler
   ```

2. Log in:

   ```bash
   wrangler login
   ```

3. From the `cloudflare-worker/` folder, deploy the worker:

   ```bash
   cd cloudflare-worker
   wrangler deploy
   ```

4. Set your Gemini API key as a secret (you'll be prompted to paste it):

   ```bash
   wrangler secret put GEMINI_API_KEY
   ```

5. After deploying, Wrangler prints a URL like:

   ```
   https://clinical-latin-tutor.<your-subdomain>.workers.dev
   ```

   Copy this URL into `config.js`:

   ```js
   export const WORKER_URL = "https://clinical-latin-tutor.<your-subdomain>.workers.dev";
   ```

6. (Recommended for production) In `cloudflare-worker/worker.js`, change
   `ALLOWED_ORIGIN` from `"*"` to your actual deployed frontend origin, so only
   your site can call the Worker.

## 4. Running the project locally

This is a static site — no build step. Any static file server works, for example:

```bash
# from the project root
python3 -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

> Opening `index.html` directly via `file://` will **not** work because ES
> modules and Firebase require a proper HTTP origin — always use a local
> server.

## 5. Using the app

1. Open the app → **Register** with an email and password (name is optional).
2. You're redirected to the **Tutor** page.
3. Pick one of the four sections in the sidebar:
   - Lotin tilida termin yasash (Term formation)
   - Prefikslar (Prefixes)
   - Suffikslar (Suffixes)
   - Ildizlar (Roots)
4. Click an example chip to pre-fill a question, or type your own.
5. Click **Summarize section** to get a structured AI-generated summary of the
   currently selected section.
6. Use the **EN / UZ** switch and the 🌙/☀️ button in the top bar to change
   language and theme at any time.
7. Visit **Profile** to see your account info, or **Log out**.

## Notes

- All educational content (the 4 sections) lives in `js/sections-data.js` in
  both English and Uzbek — edit it directly to add or change terms.
- The Gemini system instruction (tutor behavior) lives in `js/chatbot.js`
  (`SYSTEM_INSTRUCTION`) — edit it there if you want to adjust how strict,
  verbose, or bilingual the AI should be.
- The Worker uses the `gemini-2.0-flash` model by default; change
  `GEMINI_MODEL` in `cloudflare-worker/worker.js` if you want a different one.
