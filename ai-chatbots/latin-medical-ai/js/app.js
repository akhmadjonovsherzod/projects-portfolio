// ============================================================
// app.js — Chat logic, auth wiring, summary
// ============================================================

// ---- State ----
let cUser = null, cName = '', qCount = 0, busy = false, hist = [], convo = [];

const GEMINI_URL = window.PROXY_URL;

// ---- Boot ----
watchAuth(
  (user, username) => { cUser = user; cName = username; showApp(); },
  ()               => { cUser = null; cName = '';        showAuth(); }
);

// ============================================================
// VIEWS
// ============================================================
function showApp() {
  document.getElementById('authView').style.display = 'none';
  document.getElementById('appView').style.display  = 'grid';
  document.getElementById('pavatar').textContent    = (cName || '?')[0].toUpperCase();
  document.getElementById('ddName').textContent     = cName;
  document.getElementById('ddEmail').textContent    = cUser?.email || '';
  qCount = 0; hist = []; convo = [];
  document.getElementById('qCount').textContent     = '0 questions';
  document.getElementById('chatArea').innerHTML     = '';
  renderWelcome();
}

function showAuth() {
  document.getElementById('appView').style.display  = 'none';
  document.getElementById('authView').style.display = 'flex';
  document.getElementById('chatArea').innerHTML     = '';
}

function renderWelcome() {
  const a = document.getElementById('chatArea');
  a.innerHTML = `
    <div class="welcome" id="welcome">
      <div class="wicon">
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
          <rect x="11" y="4" width="6" height="20" rx="2.5" fill="white" opacity=".95"/>
          <rect x="4" y="11" width="20" height="6" rx="2.5" fill="white" opacity=".95"/>
          <circle cx="14" cy="14" r="3" fill="white" opacity=".45"/>
        </svg>
      </div>
      <h2>Welcome, ${eh(cName)}!</h2>
      <p>Ask me anything about Latin in medicine — anatomical terms, prescription abbreviations, Greek/Latin roots, and clinical context.</p>
      <div class="chips">
        <button class="chip" data-q="What does ad libitum mean?">What does <em>ad libitum</em> mean?</button>
        <button class="chip" data-q="Explain anatomical directional terms in Latin">Anatomical directional terms</button>
        <button class="chip" data-q="Common Latin prescription abbreviations like qd, bid, prn">Prescription abbreviations</button>
        <button class="chip" data-q="What is in situ in pathology?">What is <em>in situ</em>?</button>
        <button class="chip" data-q="Latin roots: cardio, pulmo, neuro — origins and examples">Latin roots: cardio, pulmo, neuro</button>
        <button class="chip" data-q="Origins and meaning of the word medicine">Origins of the word <em>medicine</em></button>
      </div>
    </div>`;
  a.querySelectorAll('.chip').forEach(b =>
    b.addEventListener('click', () => sendMsg(b.dataset.q))
  );
}

// ============================================================
// CHAT
// ============================================================
async function sendMsg(text) {
  if (!text?.trim() || busy) return;
  text = text.trim();
  document.getElementById('welcome')?.remove();
  busy = true;

  addBubble('user', text);
  convo.push({ role: 'user', text });
  qCount++;
  document.getElementById('qCount').textContent = qCount + ' question' + (qCount !== 1 ? 's' : '');
  hist.push({ role: 'user', parts: [{ text }] });

  const tid = addTyping();
  try {
    const sys = `You are LatinaMed AI, an expert educational assistant specializing in Latin and Greek terminology in medicine.

The user's name is "${cName}". Address them by name occasionally to personalize the conversation.

Focus areas:
- Latin & Greek roots, prefixes, suffixes in medical vocabulary
- Anatomical nomenclature (Terminologia Anatomica)
- Prescription abbreviations and their Latin origins (q.d., b.i.d., p.r.n., stat, etc.)
- Medical eponyms and etymology
- Historical context of Latin in medicine
- How roots help decode unfamiliar clinical terms

Guidelines:
- Every Latin/Greek term must be wrapped in a COMPLETE pair of single asterisks, e.g. *quaque die* — never leave an asterisk unpaired
- Bold the abbreviation itself and its core meaning using **double asterisks**, e.g. **qd (q.d.)** — *quaque die* — **"every day"**
- Format each abbreviation as its own line: **abbreviation** — *Latin phrase* — **"meaning"**, followed by a short note on usage
- Use "* " bullets only for plain lists (symptoms, examples), not for term definitions
- Write in clear short paragraphs, conversational and friendly
- Proactively mention related terms, etymology asides, or invite follow-up questions
- Be educational, clear, and engaging
- Do NOT diagnose or prescribe
- End any response touching symptoms, conditions, or treatments with:
  "⚠️ This information is for educational purposes only and is not a substitute for professional medical advice."`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents:          hist,
        systemInstruction: { parts: [{ text: sys }] },
        generationConfig:  { temperature: 0.7, maxOutputTokens: 900, topP: 0.9 },
      }),
    });

    removeTyping(tid);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      addBubble('ai', `⚠️ Error ${res.status}: ${err?.error?.message || 'Please try again.'}`);
    } else {
      const data  = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate a response.';
      hist.push({ role: 'model', parts: [{ text: reply }] });
      convo.push({ role: 'ai', text: reply });
      addBubble('ai', reply);
    }
  } catch (err) {
    removeTyping(tid);
    addBubble('ai', '⚠️ Network error. Check your connection and try again.');
    console.error(err);
  }
  busy = false;
}

// ============================================================
// SUMMARY
// ============================================================
async function endSession() {
  if (!convo.length) { alert('Start a conversation first!'); return; }
  const btn = document.getElementById('endBtn');
  const lbl = btn.querySelector('.endlbl');
  btn.disabled = true;
  if (lbl) lbl.textContent = 'Generating…';

  try {
    const ct = convo.map(m =>
      `${m.role === 'user' ? cName : 'LatinaMed AI'}: ${m.text}`
    ).join('\n\n');

    const prompt = `Summarize this medical Latin conversation as JSON only (no markdown fences):
{"topicsCovered":["..."],"latinTerms":[{"term":"...","meaning":"..."}],"keyTakeaways":["..."]}
${qCount} questions asked.
${ct}`;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents:         [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
    });

    const data = await res.json();
    let raw    = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    raw        = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    showModal(JSON.parse(raw));

  } catch {
    showModal({
      topicsCovered: ['Medical Latin terminology'],
      latinTerms:    [],
      keyTakeaways:  ['Latin is the foundation of medical vocabulary'],
    });
  }

  btn.disabled = false;
  if (lbl) lbl.textContent = 'End & Get Summary';
}

function showModal(s) {
  document.getElementById('sumSub').textContent =
    `${qCount} question${qCount !== 1 ? 's' : ''} • ${s.topicsCovered?.length || 0} topics`;
  let h = '';
  if (s.topicsCovered?.length) h += `<div class="ss"><h3>Topics Covered</h3><ul>${s.topicsCovered.map(t => `<li>${eh(t)}</li>`).join('')}</ul></div>`;
  if (s.latinTerms?.length)    h += `<div class="ss"><h3>Latin Terms</h3><ul>${s.latinTerms.map(t => `<li><strong><em>${eh(t.term)}</em></strong> — ${eh(t.meaning)}</li>`).join('')}</ul></div>`;
  if (s.keyTakeaways?.length)  h += `<div class="ss"><h3>Key Takeaways</h3><ul>${s.keyTakeaways.map(t => `<li>${eh(t)}</li>`).join('')}</ul></div>`;
  document.getElementById('sumBody').innerHTML = h;
  document.getElementById('backdrop').classList.add('open');
}

// ============================================================
// DOM HELPERS
// ============================================================
function addBubble(role, text) {
  const a   = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = `msg m${role}`;
  const av  = role === 'ai' ? '✚' : (cName || '?')[0].toUpperCase();
  const lb  = role === 'ai' ? 'LatinaMed AI' : eh(cName);
  div.innerHTML = `<div class="mav">${av}</div><div><div class="mlbl">${lb}</div><div class="mbub">${fmt(text)}</div></div>`;
  a.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function fmt(t) {
  let h = eh(t)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/^#{1,3} (.+)/gm, '<strong style="font-size:var(--base)">$1</strong>')
    .replace(/^[-•] (.+)/gm,   '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  return `<p>${h}</p>`;
}

function addTyping() {
  const id = 'ty' + Date.now();
  const a  = document.getElementById('chatArea');
  const d  = document.createElement('div');
  d.className = 'msg mai'; d.id = id;
  d.innerHTML = `<div class="mav">✚</div><div class="mbub" style="background:var(--surface);border:1px solid var(--border)"><div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
  a.appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return id;
}
function removeTyping(id) { document.getElementById(id)?.remove(); }
function eh(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// AUTH FORM HANDLERS
// ============================================================
window.doLogin = async function(e) {
  e.preventDefault();
  const ev  = document.getElementById('liEmail').value.trim();
  const pw  = document.getElementById('liPw').value;
  const btn = document.getElementById('loginBtn');
  setAlert('login', '');
  if (!ev || !pw) { setAlert('login', 'Please fill in all fields.'); return; }
  btn.disabled = true; btn.textContent = 'Logging in…';
  try {
    await logIn(ev, pw);
  } catch (err) {
    setAlert('login', friendly(err.message || ''));
    btn.disabled = false;
    btn.innerHTML = loginBtnHTML();
  }
};

window.doSignup = async function(e) {
  e.preventDefault();
  const un  = document.getElementById('suUser').value.trim();
  const em  = document.getElementById('suEmail').value.trim();
  const pw  = document.getElementById('suPw').value;
  const pw2 = document.getElementById('suPw2').value;
  const btn = document.getElementById('signupBtn');
  setAlert('signup', '');
  if (un.length < 3)                    return setAlert('signup', 'Username must be at least 3 characters.');
  if (!/^[a-zA-Z0-9_]+$/.test(un))     return setAlert('signup', 'Username: letters, numbers, underscores only.');
  if (!em.includes('@'))                return setAlert('signup', 'Enter a valid email address.');
  if (pw.length < 8)                    return setAlert('signup', 'Password must be at least 8 characters.');
  if (pw !== pw2)                       return setAlert('signup', 'Passwords do not match.');
  btn.disabled = true; btn.textContent = 'Creating account…';
  try {
    await signUp(un, em, pw);
  } catch (err) {
    setAlert('signup', friendly(err.message || ''));
    btn.disabled = false;
    btn.innerHTML = signupBtnHTML();
  }
};

window.doLogout = async function() {
  document.getElementById('pdrop').classList.remove('open');
  await logOut();
};

// ============================================================
// UI WIRING — exposed to HTML
// ============================================================
window.onSend = function(e) {
  e.preventDefault();
  const inp = document.getElementById('msgInput');
  const t   = inp.value.trim();
  if (!t) return;
  inp.value = ''; inp.style.height = 'auto';
  sendMsg(t);
};
window.endSession   = endSession;
window.closeMod     = () => document.getElementById('backdrop').classList.remove('open');
window.copySummary  = () => {
  const text = document.getElementById('sumBody').innerText;
  navigator.clipboard?.writeText(text).then(() => {
    const b = document.querySelector('.mftr .btn-p');
    b.textContent = 'Copied!';
    setTimeout(() => b.textContent = 'Copy Summary', 2000);
  });
};
window.switchTab = (tab) => {
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'flex' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'flex' : 'none';
  document.getElementById('tabLogin').classList.toggle('active',  tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
};
window.pwStrength = (pw) => {
  const b = document.getElementById('pwBar');
  let s = 0;
  if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
  b.style.width      = ['0%','30%','55%','80%','100%'][s];
  b.style.background = ['#dc2626','#f97316','#eab308','#22c55e','#16a34a'][s];
};
window.toggleDrop = () => document.getElementById('pdrop').classList.toggle('open');
document.addEventListener('click', e => {
  const w = document.getElementById('pwrap');
  if (w && !w.contains(e.target)) document.getElementById('pdrop').classList.remove('open');
});

// ============================================================
// HELPERS
// ============================================================
function setAlert(f, msg) {
  const el = document.getElementById(f + 'Alert');
  const sp = document.getElementById(f + 'AlertMsg');
  if (msg) { sp.textContent = msg; el.classList.add('show'); }
  else el.classList.remove('show');
}
function friendly(msg) {
  msg = String(msg);
  if (msg.includes('email-already-in-use'))    return 'That email is already registered. Try logging in.';
  if (msg.includes('weak-password'))            return 'Password too weak. Use at least 8 characters.';
  if (msg.includes('invalid-email'))            return 'Enter a valid email address.';
  if (msg.includes('INVALID_LOGIN_CREDENTIALS') ||
      msg.includes('wrong-password') ||
      msg.includes('invalid-credential'))       return 'Incorrect email/username or password.';
  if (msg.includes('user-not-found'))           return 'No account found with that email.';
  if (msg.includes('too-many-requests'))        return 'Too many attempts. Wait a few minutes.';
  if (msg.includes('network-request-failed'))   return 'Network error. Check your connection.';
  if (msg.includes('No account found'))         return msg;
  return msg.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?$/, '');
}
function loginBtnHTML() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Log In`;
}
function signupBtnHTML() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> Create Account`;
}
