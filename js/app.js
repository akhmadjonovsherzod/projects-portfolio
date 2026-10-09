// ============================================================
// app.js — Profile page logic + shared nav wiring (lang/theme)
// ============================================================
import { requireAuth } from "./auth.js";
import { auth, signOut } from "./firebase.js";
import { applyTranslations, getLang, setLang, getTheme, setTheme } from "./i18n.js";

applyTranslations();

const langButtons = document.querySelectorAll(".lang-switch [data-lang]");
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
});

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.textContent = getTheme() === "dark" ? "☀️" : "🌙";
  themeToggle.addEventListener("click", () => {
    const next = getTheme() === "dark" ? "light" : "dark";
    setTheme(next);
    themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
  });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

requireAuth((user) => {
  const avatar = document.getElementById("profile-avatar");
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");

  if (user.photoURL) {
    avatar.src = user.photoURL;
    avatar.classList.remove("hidden");
  } else {
    avatar.classList.add("hidden");
  }
  nameEl.textContent = user.displayName || "—";
  emailEl.textContent = user.email || "—";
});
