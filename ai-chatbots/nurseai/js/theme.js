// theme.js — persists theme (light/dark) and UI language (ru/en) choices.

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function initTheme() {
  const saved = localStorage.getItem("theme") ||
    (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(saved);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }
}

const UI_STRINGS = {
  ru: {
    appName: "Nursing English",
    navLearn: "Обучение",
    navProfile: "Профиль",
    logout: "Выйти",
    loginTitle: "Вход",
    registerTitle: "Регистрация",
    email: "Email",
    password: "Пароль",
    name: "Имя",
    loginBtn: "Войти",
    registerBtn: "Зарегистрироваться",
    noAccount: "Нет аккаунта? Зарегистрироваться",
    haveAccount: "Уже есть аккаунт? Войти",
    vocabTab: "Словарь",
    exercisesTab: "Упражнения",
    summarize: "Резюме юнита",
    chatPlaceholder: "Спросите про слово или грамматику...",
    send: "Отправить"
  },
  en: {
    appName: "Nursing English",
    navLearn: "Learning",
    navProfile: "Profile",
    logout: "Log out",
    loginTitle: "Login",
    registerTitle: "Register",
    email: "Email",
    password: "Password",
    name: "Name",
    loginBtn: "Log in",
    registerBtn: "Register",
    noAccount: "No account? Register",
    haveAccount: "Already have an account? Log in",
    vocabTab: "Vocabulary",
    exercisesTab: "Exercises",
    summarize: "Summarize Unit",
    chatPlaceholder: "Ask about a word or grammar...",
    send: "Send"
  }
};

function applyLang(lang) {
  localStorage.setItem("uiLang", lang);
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (UI_STRINGS[lang][key]) el.textContent = UI_STRINGS[lang][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (UI_STRINGS[lang][key]) el.placeholder = UI_STRINGS[lang][key];
  });
  const btn = document.getElementById("lang-toggle");
  if (btn) btn.textContent = lang === "ru" ? "EN" : "RU";
}

function initLang() {
  const saved = localStorage.getItem("uiLang") || "ru";
  applyLang(saved);
  const btn = document.getElementById("lang-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = localStorage.getItem("uiLang") || "ru";
      applyLang(current === "ru" ? "en" : "ru");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLang();
});
