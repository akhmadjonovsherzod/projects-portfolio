/**
 * worker.js — Cloudflare Worker that proxies requests to the Google
 * Gemini API so the API key never reaches the browser.
 *
 * Deploy with Wrangler and set the secret:
 *   wrangler secret put GEMINI_API_KEY
 *
 * The frontend POSTs JSON: { systemInstruction, contents, isSummary }
 * and this worker forwards it to the Gemini generateContent endpoint,
 * returning { text } or { error }.
 */

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Set this to your actual frontend origin(s) in production, e.g.
// "https://your-username.github.io" or "http://localhost:5500"
const ALLOWED_ORIGIN = "*";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { systemInstruction, contents, isSummary } = body;

    if (!Array.isArray(contents) || contents.length === 0) {
      return jsonResponse({ error: "Missing 'contents' array" }, 400);
    }

    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: "Server misconfiguration: missing API key" }, 500);
    }

    const payload = {
      contents,
      systemInstruction: systemInstruction
        ? { role: "system", parts: [{ text: systemInstruction }] }
        : undefined,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: isSummary ? 500 : 400
      }
    };

    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await geminiRes.json();

      if (!geminiRes.ok) {
        const message = (data && data.error && data.error.message) || "Gemini API error";
        return jsonResponse({ error: message }, geminiRes.status);
      }

      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

      return jsonResponse({ text });
    } catch (err) {
      return jsonResponse({ error: "Failed to reach Gemini API: " + err.message }, 502);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() }
  });
}
