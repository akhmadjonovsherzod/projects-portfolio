// firebase-config.example.js
// 1. Copy this file to js/firebase-config.js
// 2. Fill in the values from your Firebase project settings
//    (Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration)
// 3. js/firebase-config.js is already used by index.html / app.html / profile.html
//    Do not commit your real firebase-config.js with secrets to a public repo.

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// URL of your deployed Cloudflare Worker (see /worker/worker.js)
// Example: "https://nursing-chatbot.yourname.workers.dev"
const WORKER_URL = "https://YOUR-WORKER-SUBDOMAIN.workers.dev";
