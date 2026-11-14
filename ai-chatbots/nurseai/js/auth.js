// auth.js — Firebase email/password authentication helpers.
// Requires firebase-app, firebase-auth compat SDKs and firebase-config.js
// to be loaded before this file.

let auth;
try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
} catch (e) {
  console.error("Firebase failed to initialize. Check js/firebase-config.js", e);
}

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  if (el) {
    el.textContent = msg;
    el.style.display = msg ? "block" : "none";
  }
}

function translateFirebaseError(code) {
  const map = {
    "auth/invalid-email": "Некорректный email.",
    "auth/user-disabled": "Этот аккаунт заблокирован.",
    "auth/user-not-found": "Пользователь с таким email не найден.",
    "auth/wrong-password": "Неверный пароль.",
    "auth/email-already-in-use": "Этот email уже зарегистрирован.",
    "auth/weak-password": "Пароль слишком простой (минимум 6 символов).",
    "auth/invalid-credential": "Неверный email или пароль.",
    "auth/network-request-failed": "Ошибка сети. Проверьте подключение к интернету."
  };
  return map[code] || "Произошла ошибка. Попробуйте ещё раз.";
}

function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showAuthError("");
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    auth.signInWithEmailAndPassword(email, password)
      .then(() => { window.location.href = "app.html"; })
      .catch((err) => { showAuthError(translateFirebaseError(err.code)); btn.disabled = false; });
  });
}

function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showAuthError("");
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    auth.createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        return cred.user.updateProfile({ displayName: name || email.split("@")[0] });
      })
      .then(() => { window.location.href = "app.html"; })
      .catch((err) => { showAuthError(translateFirebaseError(err.code)); btn.disabled = false; });
  });
}

// Guard: redirect to index.html if not logged in. Call on app.html / profile.html.
function requireAuth(onReady) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      onReady(user);
    } else {
      window.location.href = "index.html";
    }
  });
}

function logout() {
  auth.signOut().then(() => { window.location.href = "index.html"; });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoginForm();
  initRegisterForm();
});
