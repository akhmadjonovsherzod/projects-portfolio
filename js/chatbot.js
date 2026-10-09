// ============================================================
// chatbot.js — Chatbot page: section selector, summarize button,
// chat UI, calls the Cloudflare Worker (never Gemini directly).
// ============================================================
import { requireAuth } from "./auth.js";
import { auth, signOut } from "./firebase.js";
import { t, applyTranslations, getLang, setLang, getTheme, setTheme } from "./i18n.js";
import { SECTIONS, getSection } from "./sections-data.js";
import { WORKER_URL } from "../config.js";

applyTranslations();

const sectionListEl = document.getElementById("section-list");
const examplesEl = document.getElementById("examples-list");
const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const summarizeBtn = document.getElementById("summarize-btn");
const clearBtn = document.getElementById("clear-chat-btn");
const logoutBtn = document.getElementById("logout-btn");
const langButtons = document.querySelectorAll(".lang-switch [data-lang]");
const themeToggle = document.getElementById("theme-toggle");

let currentUser = null;
let activeSectionId = SECTIONS[0].id;
let history = []; // { role: 'user' | 'model', text: string }

const SYSTEM_INSTRUCTION = `You are a careful, encouraging tutor specializing in Latin clinical terminology
(medical terms built from Latin/Greek roots, prefixes, and suffixes).

Rules you must always follow:
- Answer primarily in English and/or Uzbek (match the language the student used, or mix both if helpful),
  while always preserving the Latin terminology itself unchanged (e.g. keep "gastritis", "hepat/o", "-itis" as is).
- When explaining a term, break it into its root(s), prefix(es), and suffix(es) when possible, and give the
  Latin/Greek element plus its Uzbek meaning.
- Use examples relevant to medical/clinical terminology.
- Do NOT invent terminology, roots, or meanings. If you are not fully certain about a term or etymology,
  clearly say so (e.g. "I'm not fully certain, but...") rather than presenting a guess as fact.
- Stay strictly within the topic of Latin clinical terminology and related basic anatomy/medical vocabulary.

Formatting rules (strict — your output is shown in a plain chat bubble, not a document):
- No greetings, no headings, no closing remarks like "let me know if...".
- For breaking down a term: one short flat bulleted list, one bullet per word part ("hypo- (under) — ostki, pastki"),
  then a single closing sentence giving the overall meaning in both English and Uzbek. Nothing else.
- For a normal question: 2-4 short sentences, plain prose, no lists unless the question asks for multiple items.
- For a summary request: a flat bulleted list only, 3-6 bullets max, each at most one line. If summarizing
  lesson content, one bullet per term ("term — root/prefix/suffix breakdown — Uzbek meaning"). If summarizing
  a conversation, one bullet per topic/question actually covered in the chat. No sub-bullets, no intro, no outro.
- Use **bold** only for the term itself, never for whole sentences. Never use numbered headers or nested lists.`;

function renderSections() {
  sectionListEl.innerHTML = "";
  SECTIONS.forEach((section) => {
    const btn = document.createElement("button");
    btn.className = "section-chip" + (section.id === activeSectionId ? " active" : "");
    btn.textContent = section.title[getLang()];
    btn.addEventListener("click", () => {
      activeSectionId = section.id;
      renderSections();
      renderExamples();
    });
    sectionListEl.appendChild(btn);
  });
}

function renderExamples() {
  const section = getSection(activeSectionId);
  examplesEl.innerHTML = "";
  section.examples.forEach((ex) => {
    const chip = document.createElement("button");
    chip.className = "example-chip";
    chip.textContent = ex;
    chip.addEventListener("click", () => {
      chatInput.value =
        getLang() === "uz" ? `"${ex}" so'zini tahlil qilib bering` : `Break down the term "${ex}" for me`;
      chatInput.focus();
    });
    examplesEl.appendChild(chip);
  });
}

// Minimal, safe markdown-ish renderer: escapes HTML first (so the model
// can never inject real tags), then turns **bold**, "- " / "1. " list
// lines, and blank-line paragraphs into real elements.
function renderLiteMarkdown(raw) {
  const escape = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = raw.split("\n");
  let html = "";
  let listBuffer = [];
  let listType = null; // "ul" | "ol"

  const flushList = () => {
    if (listBuffer.length) {
      html += `<${listType}>` + listBuffer.map((li) => `<li>${li}</li>`).join("") + `</${listType}>`;
      listBuffer = [];
      listType = null;
    }
  };

  const inline = (s) => escape(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  lines.forEach((line) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*]\s+(.*)/);
    const numberMatch = trimmed.match(/^\d+[.)]\s+(.*)/);

    if (bulletMatch) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuffer.push(inline(bulletMatch[1]));
    } else if (numberMatch) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuffer.push(inline(numberMatch[1]));
    } else {
      flushList();
      if (trimmed === "") {
        html += "<br>";
      } else {
        html += `<p>${inline(trimmed)}</p>`;
      }
    }
  });
  flushList();
  return html;
}

function appendMessage(role, text, { temporary = false } = {}) {
  const emptyState = chatLog.querySelector(".empty-state");
  if (emptyState) emptyState.remove();

  const wrap = document.createElement("div");
  wrap.className = "msg msg-" + role + (temporary ? " msg-pending" : "");
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (role === "model" && !temporary) {
    bubble.innerHTML = renderLiteMarkdown(text);
  } else {
    bubble.textContent = text;
  }
  wrap.appendChild(bubble);
  chatLog.appendChild(wrap);
  chatLog.scrollTop = chatLog.scrollHeight;
  return wrap;
}

function showEmptyState() {
  chatLog.innerHTML = `<div class="empty-state" data-i18n="empty_chat">${t("empty_chat")}</div>`;
}

async function callGemini(userText, { isSummary = false } = {}) {
  const contents = [];
  history.slice(-10).forEach((m) => {
    contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] });
  });
  contents.push({ role: "user", parts: [{ text: userText }] });

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: SYSTEM_INSTRUCTION,
      contents,
      isSummary
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error("Worker error " + res.status + " " + errText);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text || "";
}

async function sendMessage(text, { isSummary = false } = {}) {
  appendMessage("user", text);
  history.push({ role: "user", text });
  const pending = appendMessage("model", t("loading"), { temporary: true });

  try {
    const reply = await callGemini(text, { isSummary });
    pending.remove();
    appendMessage("model", reply);
    history.push({ role: "model", text: reply });
    saveHistory();
  } catch (err) {
    pending.remove();
    appendMessage("model", t("error_generic"));
    console.error(err);
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  sendMessage(text);
});

summarizeBtn.addEventListener("click", () => {
  const section = getSection(activeSectionId);
  const lang = getLang();
  const hasConversation = history.some((m) => m.role === "user");

  let prompt;
  if (hasConversation) {
    // Summarize the actual chat so far (the model already sees the last
    // 10 turns as context via callGemini's `contents` array).
    prompt =
      lang === "uz"
        ? `Ushbu chatda "${section.title.uz}" bo'limi doirasida hozirgacha muhokama qilingan narsalarni qisqacha xulosalang: qanday savollar berildi va qanday asosiy fikrlar aniqlandi.`
        : `Summarize what we've discussed in this chat so far about the "${section.title.en}" section: what was asked and the key points covered.`;
  } else {
    // No conversation yet — fall back to summarizing the lesson content itself.
    prompt =
      (lang === "uz"
        ? `Quyidagi bo'limni xulosalab bering: "${section.title.uz}".\n\nMatn:\n`
        : `Please summarize this section: "${section.title.en}".\n\nContent:\n`) + section.content[lang];
  }
  sendMessage(prompt, { isSummary: true });
});

clearBtn.addEventListener("click", () => {
  history = [];
  showEmptyState();
  saveHistory();
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setLang(btn.getAttribute("data-lang"));
    renderSections();
    renderExamples();
  });
});

themeToggle.addEventListener("click", () => {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
});
themeToggle.textContent = getTheme() === "dark" ? "☀️" : "🌙";

// ---- Local history persistence (per-user, localStorage) ----
function historyKey() {
  return "chatHistory:" + (currentUser ? currentUser.uid : "anon");
}
function saveHistory() {
  try {
    localStorage.setItem(historyKey(), JSON.stringify(history));
  } catch (e) {
    console.warn("Could not save chat history", e);
  }
}
function loadHistory() {
  try {
    const raw = localStorage.getItem(historyKey());
    if (raw) {
      history = JSON.parse(raw);
      if (history.length) {
        chatLog.innerHTML = "";
        history.forEach((m) => appendMessage(m.role === "user" ? "user" : "model", m.text));
      }
    }
  } catch (e) {
    console.warn("Could not load chat history", e);
  }
}

requireAuth((user) => {
  currentUser = user;
  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.textContent = user.displayName || user.email;
  renderSections();
  renderExamples();
  loadHistory();
});
