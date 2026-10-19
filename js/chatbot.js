// chatbot.js — sends chat / summarize requests to the Cloudflare Worker,
// which holds the Gemini API key as a secret. The frontend never sees the key.

async function callWorker(payload) {
  if (!WORKER_URL || WORKER_URL.includes("YOUR-WORKER-SUBDOMAIN")) {
    throw new Error("CONFIG_MISSING");
  }
  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`HTTP_${res.status}`);
  }
  const data = await res.json();
  if (!data || !data.text) {
    throw new Error("BAD_RESPONSE");
  }
  return data.text;
}

function appendChatMessage(container, role, text) {
  const div = document.createElement("div");
  div.className = `chat-msg chat-${role}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

// Render the small Markdown subset commonly returned by the tutor. All user
// and model text is inserted as text nodes, never interpreted as HTML.
function renderChatResponse(element, text) {
  element.replaceChildren();
  element.classList.add("chat-response");

  function appendInline(parent, value) {
    const pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    let cursor = 0;
    let match;
    while ((match = pattern.exec(value)) !== null) {
      parent.appendChild(document.createTextNode(value.slice(cursor, match.index)));
      const tag = match[1] !== undefined ? "strong" : "em";
      const node = document.createElement(tag);
      node.textContent = match[1] !== undefined ? match[1] : match[2];
      parent.appendChild(node);
      cursor = pattern.lastIndex;
    }
    parent.appendChild(document.createTextNode(value.slice(cursor)));
  }

  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  let paragraph = [];
  let list = null;

  function flushParagraph() {
    if (!paragraph.length) return;
    const p = document.createElement("p");
    appendInline(p, paragraph.join(" "));
    element.appendChild(p);
    paragraph = [];
  }
  function closeList() { list = null; }

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      return;
    }
    if (/^(?:-{3,}|\*{3,})$/.test(line)) {
      flushParagraph();
      closeList();
      element.appendChild(document.createElement("hr"));
      return;
    }
    const heading = line.match(/^#{1,4}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const h = document.createElement("h4");
      appendInline(h, heading[1]);
      element.appendChild(h);
      return;
    }
    const bullet = line.match(/^(?:[*•-])\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushParagraph();
      const tag = numbered ? "ol" : "ul";
      if (!list || list.tagName.toLowerCase() !== tag) {
        closeList();
        list = document.createElement(tag);
        element.appendChild(list);
      }
      const li = document.createElement("li");
      appendInline(li, (bullet || numbered)[1]);
      list.appendChild(li);
      return;
    }
    closeList();
    paragraph.push(line);
  });
  flushParagraph();
}

function friendlyChatError(err) {
  if (err.message === "CONFIG_MISSING") {
    return "Чат-бот ещё не настроен: не указан адрес Cloudflare Worker (см. README, WORKER_URL).";
  }
  return "Не удалось получить ответ от ассистента. Проверьте интернет-соединение и попробуйте снова.";
}

function initChatbot(getCurrentUnit) {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const messages = document.getElementById("chat-messages");
  const summarizeBtn = document.getElementById("summarize-btn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendChatMessage(messages, "user", text);
    input.value = "";
    input.disabled = true;
    const loadingEl = appendChatMessage(messages, "bot", "Печатает...");
    try {
      const unit = getCurrentUnit();
      const reply = await callWorker({
        mode: "chat",
        message: text,
        unitTitle: unit ? unit.title : null,
        unitVocab: unit ? [...unit.vocab,...EXTRA_VOCAB[unit.id-1],...UNIT_LEARNING[unit.id-1].phrases.map(en=>({en,ru:phraseRu(en),ex:phraseExample(en),exRu:phraseExampleRu(en)}))].map(v => ({en:v.en,ru:v.ru,ex:v.ex})) : [],
        unitContent: unit ? UNIT_LEARNING[unit.id-1] : null
      });
      renderChatResponse(loadingEl, reply);
    } catch (err) {
      loadingEl.textContent = friendlyChatError(err);
      loadingEl.classList.add("chat-error");
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  if (summarizeBtn) {
    summarizeBtn.addEventListener("click", async () => {
      const unit = getCurrentUnit();
      if (!unit) return;
      summarizeBtn.disabled = true;
      const loadingEl = appendChatMessage(messages, "bot", `Создаю резюме юнита "${unit.title}"...`);
      try {
        const reply = await callWorker({
          mode: "summarize",
          unitTitle: unit.title,
          unitVocab: [...unit.vocab,...EXTRA_VOCAB[unit.id-1],...UNIT_LEARNING[unit.id-1].phrases.map(en=>({en,ru:phraseRu(en),ex:phraseExample(en),exRu:phraseExampleRu(en)}))].map(v => ({en:v.en,ru:v.ru,example:v.ex})),
          unitContent: UNIT_LEARNING[unit.id-1]
        });
        renderChatResponse(loadingEl, reply);
      } catch (err) {
        loadingEl.textContent = friendlyChatError(err);
        loadingEl.classList.add("chat-error");
      } finally {
        summarizeBtn.disabled = false;
      }
    });
  }
}
