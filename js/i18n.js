// ============================================================
// i18n.js — Simple EN/UZ translation + theme (dark/light) helper
// No frameworks: plain lookup table + data-i18n attribute scan.
// ============================================================

const STRINGS = {
  en: {
    app_name: "Latin Clinical Terms",
    login_title: "Sign in",
    register_title: "Create account",
    login_button: "Sign in",
    register_button: "Create account",
    switch_to_register: "Need an account? Register",
    switch_to_login: "Have an account? Sign in",
    name_label: "Full name",
    email_label: "Email",
    password_label: "Password",
    error_required: "Please fill in email and password.",
    tagline: "Learn how clinical terms are built in Latin",
    nav_chat: "Tutor",
    nav_profile: "Profile",
    logout: "Log out",
    sections_title: "Sections",
    summarize_button: "Summarize section",
    chat_placeholder: "Ask about a term, prefix, suffix or root…",
    send: "Send",
    examples_title: "Try asking",
    empty_chat: "Ask a question or click \"Summarize section\" to begin.",
    loading: "Thinking…",
    error_generic: "Something went wrong. Please try again.",
    profile_title: "Profile",
    profile_name: "Name",
    profile_email: "Email",
    no_name: "No name set",
    section_1_title: "Latin Term Formation",
    section_2_title: "Prefixes",
    section_3_title: "Suffixes",
    section_4_title: "Roots",
    history_cleared: "Chat history cleared.",
    clear_chat: "Clear chat"
  },
  uz: {
    app_name: "Lotin klinik terminlari",
    login_title: "Kirish",
    register_title: "Ro'yxatdan o'tish",
    login_button: "Kirish",
    register_button: "Ro'yxatdan o'tish",
    switch_to_register: "Akkount kerakmi? Ro'yxatdan o'ting",
    switch_to_login: "Akkountingiz bormi? Kiring",
    name_label: "To'liq ism",
    email_label: "Email",
    password_label: "Parol",
    error_required: "Iltimos, email va parolni kiriting.",
    tagline: "Klinik terminlarning lotin tilida qanday yasalishini o'rganing",
    nav_chat: "Repetitor",
    nav_profile: "Profil",
    logout: "Chiqish",
    sections_title: "Bo'limlar",
    summarize_button: "Bo'limni xulosalash",
    chat_placeholder: "Termin, prefiks, suffiks yoki ildiz haqida so'rang…",
    send: "Yuborish",
    examples_title: "Shuni so'rab ko'ring",
    empty_chat: "Savol bering yoki boshlash uchun \"Bo'limni xulosalash\" tugmasini bosing.",
    loading: "O'ylanmoqda…",
    error_generic: "Xatolik yuz berdi. Qayta urinib ko'ring.",
    profile_title: "Profil",
    profile_name: "Ism",
    profile_email: "Email",
    no_name: "Ism kiritilmagan",
    section_1_title: "Lotin tilida termin yasash",
    section_2_title: "Prefikslar",
    section_3_title: "Suffikslar",
    section_4_title: "Ildizlar",
    history_cleared: "Chat tarixi tozalandi.",
    clear_chat: "Chatni tozalash"
  }
};

export function getLang() {
  return localStorage.getItem("lang") || "en";
}

export function setLang(lang) {
  localStorage.setItem("lang", lang);
  applyTranslations();
}

export function t(key) {
  const lang = getLang();
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}

export function applyTranslations() {
  const lang = getLang();
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });
}

// ---- Theme (dark/light) ----
export function getTheme() {
  return localStorage.getItem("theme") || "light";
}

export function setTheme(theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
}

export function applyTheme() {
  document.documentElement.setAttribute("data-theme", getTheme());
}

applyTheme();
