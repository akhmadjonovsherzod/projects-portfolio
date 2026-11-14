// worker.js — Cloudflare Worker.
// Proxies chat / "Summarize Unit" requests to the Google Gemini API.
// The Gemini API key is stored as the Worker secret GEMINI_API_KEY and is
// never exposed to the frontend.
//
// Deploy with Wrangler:
//   wrangler secret put GEMINI_API_KEY
//   wrangler deploy
//
// Expected POST body (JSON):
//   { mode: "chat", message: "...", unitTitle: "...", unitVocab: ["..."] }
//   { mode: "summarize", unitTitle: "...", unitVocab: ["word — перевод", ...] }

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

const SYSTEM_PROMPT = `You are a friendly, patient English tutor for Pre-Intermediate
Russian-speaking nursing students (CIS student groups) learning medical/nursing English.
Rules:
- Explain English words, grammar and phrases mainly in Russian, with simple English examples.
- Keep your language at Pre-Intermediate (A2-B1) level — short sentences, common words.
- When asked to compare similar words, explain the difference clearly in Russian.
- Use the current unit's vocabulary and topic when it is relevant to the question.
- Never invent facts about the textbook; if you are not sure, say so honestly.
- Do not give personalized medical diagnoses or treatment advice — keep medical content
  educational and general, and suggest the person consult a real healthcare professional
  for personal medical concerns.
- Keep replies concise (a few sentences or a short list), friendly and encouraging.`;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

async function callGemini(apiKey, prompt) {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
  };
  const res = await fetch(GEMINI_URL(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini API returned no text");
  return text.trim();
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
    }
    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Server missing GEMINI_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    const { mode, message, unitTitle, unitVocab, unitContent } = payload;
    const structuredContext = JSON.stringify({ vocabulary: unitVocab || [], content: unitContent || {} }).slice(0, 14000);
    let userPrompt;

    if (mode === "summarize") {
      userPrompt = `${SYSTEM_PROMPT}\n\nSummarize the actual structured content of the selected unit "${unitTitle}". Write in Russian. Use only the supplied content for claims about the textbook. Clearly label any extra language explanation as an additional explanation. Include unit focus, language/grammar, useful phrases, and a short study tip.\nSTRUCTURED UNIT CONTENT:\n${structuredContext}`;
    } else if (mode === "chat") {
      userPrompt = `${SYSTEM_PROMPT}\n\n${unitTitle ? `Selected unit: "${unitTitle}". Answer from its supplied content first. Distinguish textbook-aligned material from additional explanations, and say when a detail is not in the supplied unit data.\nSTRUCTURED UNIT CONTENT:\n${structuredContext}\n` : ""}Student's question: ${message}`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown mode" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    try {
      const text = await callGemini(env.GEMINI_API_KEY, userPrompt);
      return new Response(JSON.stringify({ text }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }
  }
};
