// ============================================================
// config.js — Project configuration
// Fill these in with your own Firebase project + Cloudflare
// Worker values. This file is loaded by every page.
// ============================================================

// Firebase project config (from Firebase Console > Project settings)
export const firebaseConfig = {
  apiKey: "AIzaSyDA80PZwZ8CGm2KjCo1OU59u17ZPOqTTHM",
  authDomain: "clinical-latin-tutor.firebaseapp.com",
  projectId: "clinical-latin-tutor",
  storageBucket: "clinical-latin-tutor.firebasestorage.app",
  messagingSenderId: "247658111309",
  appId: "1:247658111309:web:53eb988a5835a68b465704"
};

// URL of your deployed Cloudflare Worker that proxies Gemini requests.
// Example after `wrangler deploy`: https://clinical-latin-tutor.yoursubdomain.workers.dev
export const WORKER_URL = "https://clinical-latin-tutor.sherzodbekakhmadjonov0604.workers.dev";
