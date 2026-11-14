// ============================================================
// auth.js — Login / Register page logic + route protection helper
// ============================================================
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from "./firebase.js";
import { t, applyTranslations, getLang, setLang } from "./i18n.js";

// Language switch works on the login page regardless of auth state
document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
});

// ---- Route protection: call this at the top of protected pages ----
export function requireAuth(onReady) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      onReady(user);
    }
  });
}

// ---- Only run the login/register wiring on index.html ----
const form = document.getElementById("auth-form");
if (form) {
  applyTranslations();

  const nameField = document.getElementById("name-field");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("auth-error");
  const submitBtn = document.getElementById("auth-submit");
  const toggleBtn = document.getElementById("toggle-mode");
  const title = document.getElementById("auth-title");
  const loadingEl = document.getElementById("auth-loading");

  let mode = "login"; // or "register"

  // If already logged in, skip straight to chatbot
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "chatbot.html";
  });

  function setMode(newMode) {
    mode = newMode;
    errorBox.textContent = "";
    if (mode === "login") {
      title.textContent = t("login_title");
      submitBtn.textContent = t("login_button");
      toggleBtn.textContent = t("switch_to_register");
      nameField.classList.add("hidden");
    } else {
      title.textContent = t("register_title");
      submitBtn.textContent = t("register_button");
      toggleBtn.textContent = t("switch_to_login");
      nameField.classList.remove("hidden");
    }
  }

  toggleBtn.addEventListener("click", () => {
    setMode(mode === "login" ? "register" : "login");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorBox.textContent = t("error_required");
      return;
    }

    submitBtn.disabled = true;
    loadingEl.classList.remove("hidden");

    try {
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const name = nameInput.value.trim();
        if (name) {
          await updateProfile(cred.user, { displayName: name });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "chatbot.html";
    } catch (err) {
      errorBox.textContent = friendlyError(err.code);
    } finally {
      submitBtn.disabled = false;
      loadingEl.classList.add("hidden");
    }
  });

  setMode("login");
}

function friendlyError(code) {
  const lang = getLang();
  const map = {
    en: {
      "auth/email-already-in-use": "This email is already registered.",
      "auth/invalid-email": "Invalid email address.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/user-not-found": "Incorrect email or password.",
      "auth/wrong-password": "Incorrect email or password.",
      "auth/too-many-requests": "Too many attempts. Try again later."
    },
    uz: {
      "auth/email-already-in-use": "Bu email allaqachon ro'yxatdan o'tgan.",
      "auth/invalid-email": "Email manzili noto'g'ri.",
      "auth/weak-password": "Parol kamida 6 ta belgidan iborat bo'lishi kerak.",
      "auth/invalid-credential": "Email yoki parol noto'g'ri.",
      "auth/user-not-found": "Email yoki parol noto'g'ri.",
      "auth/wrong-password": "Email yoki parol noto'g'ri.",
      "auth/too-many-requests": "Juda ko'p urinish. Keyinroq qayta urinib ko'ring."
    }
  };
  return (map[lang] && map[lang][code]) || (lang === "uz" ? "Xatolik yuz berdi. Qayta urinib ko'ring." : "Something went wrong. Please try again.");
}
