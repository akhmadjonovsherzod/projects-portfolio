// app.js — renders unit navigation, vocabulary cards and exercises,
// and wires up the chatbot. Requires auth.js, units-data.js, exercises.js,
// chatbot.js to be loaded first.

let currentUnitId = 1;

function getCurrentUnit() {
  return UNITS.find(u => u.id === currentUnitId) || UNITS[0];
}

function renderUnitsNav() {
  const list = document.getElementById("units-list");
  list.innerHTML = "";
  UNITS.forEach(unit => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "unit-link" + (unit.id === currentUnitId ? " active" : "");
    btn.textContent = `${unit.id}. ${unit.titleRu}`;
    btn.addEventListener("click", () => selectUnit(unit.id));
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderVocab(unit) {
  const grid = document.getElementById("vocab-grid");
  grid.innerHTML = "";
  const extra = UNIT_LEARNING[unit.id - 1].phrases.map(en => ({ en, pos:"phrase", ru:phraseRu(en), ex:phraseExample(en), exRu:phraseExampleRu(en), source:UNIT_LEARNING[unit.id - 1].source }));
  const items = [...unit.vocab.map(item => ({...item, source:item.source || UNIT_LEARNING[unit.id - 1].source})), ...EXTRA_VOCAB[unit.id-1], ...extra];
  const search = (document.getElementById("vocab-search")?.value || "").toLowerCase().trim();
  const pos = document.getElementById("vocab-pos")?.value || "";
  items.filter(item => (!search || `${item.en} ${item.ru}`.toLowerCase().includes(search)) && (!pos || item.pos === pos || (pos === "phrase" && item.pos.includes("phrase")))).forEach(item => {
    const card = document.createElement("div");
    card.className = "vocab-card";
    card.innerHTML = `
      <div><span class="en">${item.en}</span><span class="pos">${item.pos}</span></div>
      <div class="ru">${item.ru}</div>
      <div class="ex">${item.ex}</div>
      <div class="ex-ru">${item.exRu}</div>
      <div class="source-ref">Источник: ${item.source}</div>
    `;
    grid.appendChild(card);
  });
}

function phraseRu(p) { return ({"work on a ward":"работать в отделении","be responsible for":"отвечать за","apply for a job":"подавать заявление на работу","fully qualified":"полностью квалифицированный","night shift":"ночная смена","go along the corridor":"идти по коридору","turn left at the lift":"повернуть налево у лифта","opposite the nurses’ station":"напротив поста медсестёр","take the patient to Radiology":"отвести пациента в рентгенологию","push a wheelchair":"везти кресло-коляску","fill in a patient record":"заполнять карту пациента","take a medical history":"собирать анамнез","be admitted to hospital":"быть госпитализированным","check the patient’s details":"проверить данные пациента","on arrival":"по прибытии","call for help":"позвать на помощь","apply pressure":"надавить","keep the patient warm":"согревать пациента","treat for shock":"оказывать помощь при шоке","give first aid":"оказывать первую помощь","a sharp pain":"острая боль","a dull ache":"тупая боль","pain comes and goes":"боль то появляется, то проходит","rate your pain":"оценить интенсивность боли","relieve the pain":"облегчить боль","suffer from a symptom":"страдать от симптома","come on suddenly":"начаться внезапно","get worse":"ухудшиться","have difficulty breathing":"испытывать затруднение дыхания","a runny nose":"насморк","care for an older person":"ухаживать за пожилым человеком","memory loss":"потеря памяти","daily routine":"распорядок дня","mobility aid":"средство для передвижения","move into a care home":"переехать в дом ухода","balanced diet":"сбалансированное питание","food intake":"потребление пищи","high in fibre":"с высоким содержанием клетчатки","cut down on":"сократить потребление","be allergic to":"иметь аллергию на","blood sample":"образец крови","blood group":"группа крови","blood clot":"сгусток крови","blood pressure":"артериальное давление","donate blood":"сдавать кровь","end-of-life care":"уход в конце жизни","break bad news":"сообщить плохие новости","make a decision":"принять решение","respect a patient’s wishes":"уважать пожелания пациента","care for the dying":"ухаживать за умирающими","wash your hands thoroughly":"тщательно мыть руки","wear protective equipment":"надевать средства защиты","spread an infection":"распространять инфекцию","resistant bacteria":"устойчивые бактерии","follow hygiene procedures":"соблюдать гигиенические процедуры","mental health condition":"психическое расстройство","suffer from":"страдать от","provide support":"оказывать поддержку","case conference":"обсуждение клинического случая","patient’s wellbeing":"благополучие пациента","take a reading":"снимать показания","measure the pulse":"измерять пульс","record the temperature":"записывать температуру","blood pressure reading":"показатель артериального давления","level of consciousness":"уровень сознания","take medication":"принимать лекарства","side effect":"побочный эффект","dosage instructions":"инструкция по дозировке","tablet form":"таблетированная форма","prescribe a medicine":"назначить лекарство","alternative treatment":"альтернативный метод лечения","herbal remedy":"растительное средство","mind and body":"разум и тело","complementary therapy":"дополнительная терапия","evidence for a treatment":"доказательства эффективности метода"})[p] || p; }
function phraseExample(p) { return ({"work on a ward":"She works on a busy surgical ward.","be responsible for":"The nurse is responsible for checking the equipment.","apply for a job":"He plans to apply for a nursing job.","fully qualified":"She is a fully qualified nurse.","night shift":"I’m working the night shift this weekend.","go along the corridor":"Go along the corridor to reach the clinic.","turn left at the lift":"Turn left at the lift and follow the signs.","opposite the nurses’ station":"The treatment room is opposite the nurses’ station.","take the patient to Radiology":"A porter will take the patient to Radiology.","push a wheelchair":"The porter pushed the wheelchair carefully.","fill in a patient record":"Please fill in the patient record clearly.","take a medical history":"The nurse took a medical history on admission.","be admitted to hospital":"He was admitted to hospital last night.","check the patient’s details":"Please check the patient’s details before the appointment.","on arrival":"On arrival, the patient was taken to the ward.","call for help":"Call for help if the patient feels faint.","apply pressure":"Apply pressure to the dressing as instructed.","keep the patient warm":"Keep the patient warm while you wait for help.","treat for shock":"The team assessed the patient and treated for shock.","give first aid":"Staff gave first aid until help arrived.","a sharp pain":"She described a sharp pain in her side.","a dull ache":"He has a dull ache in his shoulder.","pain comes and goes":"The pain comes and goes during the day.","rate your pain":"Please rate your pain from zero to ten.","relieve the pain":"The prescribed medicine may relieve the pain.","suffer from a symptom":"Some people suffer from this symptom for several days.","come on suddenly":"The headache came on suddenly.","get worse":"Tell us if the pain gets worse.","have difficulty breathing":"The patient has difficulty breathing when walking.","a runny nose":"A runny nose can accompany a cold.","care for an older person":"She helps care for an older person at home.","memory loss":"The family noticed gradual memory loss.","daily routine":"A familiar daily routine can be reassuring.","mobility aid":"He uses a mobility aid to walk safely.","move into a care home":"They discussed whether she should move into a care home.","balanced diet":"A balanced diet includes a variety of foods.","food intake":"The nurse recorded the patient’s food intake.","high in fibre":"Some vegetables are high in fibre.","cut down on":"He is trying to cut down on sugary drinks.","be allergic to":"Are you allergic to any medicines?","blood sample":"The nurse labelled the blood sample.","blood group":"The blood group was confirmed by the laboratory.","blood clot":"The scan showed a blood clot.","blood pressure":"The nurse checked her blood pressure.","donate blood":"He hopes to donate blood next month.","end-of-life care":"The team discussed end-of-life care with the family.","break bad news":"The doctor asked a colleague to support her when breaking bad news.","make a decision":"The patient needs time to make a decision.","respect a patient’s wishes":"Staff should respect a patient’s wishes.","care for the dying":"The team is trained to care for the dying.","wash your hands thoroughly":"Wash your hands thoroughly before patient contact.","wear protective equipment":"Staff wear protective equipment when required.","spread an infection":"Good hand hygiene can reduce the chance of spreading an infection.","resistant bacteria":"The laboratory identified resistant bacteria.","follow hygiene procedures":"Everyone must follow hygiene procedures.","mental health condition":"A mental health condition can affect daily life.","suffer from":"He suffers from anxiety.","provide support":"The nurse can provide support to the patient.","case conference":"The team discussed the plan at a case conference.","patient’s wellbeing":"The patient’s wellbeing is central to the plan.","take a reading":"The nurse took a reading before breakfast.","measure the pulse":"The nurse measured the pulse for one minute.","record the temperature":"Please record the temperature in the chart.","blood pressure reading":"The blood pressure reading was entered in the notes.","level of consciousness":"The team monitored his level of consciousness.","take medication":"She takes her medication with water.","side effect":"The patient reported a possible side effect.","dosage instructions":"Read the dosage instructions carefully.","tablet form":"The medicine is available in tablet form.","prescribe a medicine":"The clinician may prescribe a medicine after assessment.","alternative treatment":"The patient asked about an alternative treatment.","herbal remedy":"Tell your nurse if you use a herbal remedy.","mind and body":"The programme considers both mind and body.","complementary therapy":"Some patients ask about complementary therapy.","evidence for a treatment":"The team reviewed the evidence for a treatment."})[p] || `The phrase “${p}” is useful in this unit.`; }
function phraseExampleRu(p) { return ({"work on a ward":"Она работает в загруженном хирургическом отделении.","be responsible for":"Медсестра отвечает за проверку оборудования.","apply for a job":"Он планирует подать заявление на работу медсестрой.","fully qualified":"Она полностью квалифицированная медсестра.","night shift":"В эти выходные я работаю в ночную смену.","go along the corridor":"Идите по коридору, чтобы попасть в клинику.","turn left at the lift":"Поверните налево у лифта и следуйте указателям.","opposite the nurses’ station":"Процедурная находится напротив поста медсестёр.","take the patient to Radiology":"Санитар отведёт пациента в рентгенологию.","push a wheelchair":"Санитар осторожно вёз кресло-коляску.","fill in a patient record":"Пожалуйста, разборчиво заполните карту пациента.","take a medical history":"При поступлении медсестра собрала анамнез.","be admitted to hospital":"Его госпитализировали прошлой ночью.","check the patient’s details":"Пожалуйста, проверьте данные пациента перед приёмом.","on arrival":"По прибытии пациента отвели в отделение.","call for help":"Позовите на помощь, если пациент почувствует слабость.","apply pressure":"Надавливайте на повязку согласно инструкции.","keep the patient warm":"Согревайте пациента, пока ждёте помощи.","treat for shock":"Команда оценила состояние пациента и оказала помощь при шоке.","give first aid":"Персонал оказал первую помощь до прибытия специалистов.","a sharp pain":"Она описала острую боль в боку.","a dull ache":"У него тупая боль в плече.","pain comes and goes":"Боль то появляется, то проходит в течение дня.","rate your pain":"Оцените боль от нуля до десяти.","relieve the pain":"Назначенное лекарство может облегчить боль.","suffer from a symptom":"У некоторых людей этот симптом сохраняется несколько дней.","come on suddenly":"Головная боль началась внезапно.","get worse":"Скажите нам, если боль усилится.","have difficulty breathing":"Пациенту трудно дышать при ходьбе.","a runny nose":"Насморк может сопровождать простуду.","care for an older person":"Она помогает ухаживать за пожилым человеком дома.","memory loss":"Семья заметила постепенную потерю памяти.","daily routine":"Привычный распорядок дня может успокаивать.","mobility aid":"Он использует средство для передвижения, чтобы безопасно ходить.","move into a care home":"Они обсудили, следует ли ей переехать в дом ухода.","balanced diet":"Сбалансированный рацион включает разнообразные продукты.","food intake":"Медсестра записала, сколько пациент съел.","high in fibre":"Некоторые овощи богаты клетчаткой.","cut down on":"Он старается сократить потребление сладких напитков.","be allergic to":"У вас есть аллергия на лекарства?","blood sample":"Медсестра подписала образец крови.","blood group":"Группу крови подтвердили в лаборатории.","blood clot":"На снимке обнаружили сгусток крови.","blood pressure":"Медсестра измерила ей давление.","donate blood":"Он надеется сдать кровь в следующем месяце.","end-of-life care":"Команда обсудила с семьёй уход в конце жизни.","break bad news":"Врач попросил коллегу поддержать её при сообщении плохих новостей.","make a decision":"Пациенту нужно время, чтобы принять решение.","respect a patient’s wishes":"Персоналу следует уважать пожелания пациента.","care for the dying":"Команда обучена ухаживать за умирающими пациентами.","wash your hands thoroughly":"Тщательно мойте руки перед контактом с пациентом.","wear protective equipment":"Персонал использует средства защиты, когда это необходимо.","spread an infection":"Гигиена рук помогает снизить риск распространения инфекции.","resistant bacteria":"В лаборатории выявили устойчивые бактерии.","follow hygiene procedures":"Все должны соблюдать гигиенические процедуры.","mental health condition":"Психическое расстройство может влиять на повседневную жизнь.","suffer from":"Он страдает от тревожности.","provide support":"Медсестра может поддержать пациента.","case conference":"Команда обсудила план на клиническом совещании.","patient’s wellbeing":"Благополучие пациента — центральная часть плана.","take a reading":"Медсестра сняла показания до завтрака.","measure the pulse":"Медсестра измеряла пульс в течение минуты.","record the temperature":"Пожалуйста, запишите температуру в карту.","blood pressure reading":"Показатель давления внесли в записи.","level of consciousness":"Команда наблюдала за уровнем сознания пациента.","take medication":"Она принимает лекарство, запивая водой.","side effect":"Пациент сообщил о возможном побочном эффекте.","dosage instructions":"Внимательно прочитайте инструкцию по дозировке.","tablet form":"Лекарство выпускается в таблетированной форме.","prescribe a medicine":"Специалист может назначить лекарство после осмотра.","alternative treatment":"Пациент спросил об альтернативном методе лечения.","herbal remedy":"Сообщите медсестре, если используете растительное средство.","mind and body":"Программа рассматривает и разум, и тело.","complementary therapy":"Некоторые пациенты спрашивают о дополнительной терапии.","evidence for a treatment":"Команда изучила доказательства эффективности метода."})[p] || `Выражение «${p}» полезно в этом разделе.`; }

function renderUnitContent(unit) {
 const d=UNIT_LEARNING[unit.id-1], root=document.getElementById("unit-content-root");
 root.innerHTML=`<h3>Фразы и коллокации</h3><ul>${d.phrases.map(p=>`<li><b>${p}</b> — ${phraseRu(p)}. <span>${phraseExample(p)}</span><br><span class="ex-ru">${phraseExampleRu(p)}</span></li>`).join("")}</ul><h3>Грамматика и язык</h3><p>${d.grammar}</p><p class="ex-ru">${d.grammarRu}</p><h3>Профессиональное общение</h3><ul>${d.comm.map(p=>`<li>${p}</li>`).join("")}</ul><h3>Произношение</h3><p>${d.pronunciation}</p><h3>Итог юнита</h3><p>${d.summary}</p><p class="source-ref">Источник: ${d.source}</p>`;
}

function renderReadingBank(){const root=document.getElementById("reading-root");root.innerHTML=`<label for="reading-select">Выберите текст</label> <select id="reading-select">${READING_BANK.map((r,i)=>`<option value="${i}">${i+1}. ${r.title} — p. ${r.page}</option>`).join("")}</select><div id="reading-detail"></div>`;const select=document.getElementById("reading-select"),detail=document.getElementById("reading-detail");function show(){const r=READING_BANK[Number(select.value)];const vocabQs=r.words.slice(0,3).map(([en,ru],i)=>({q:`What does “${en}” mean?`,a:ru,why:`${en} — ${ru}.`}));const qs=[...r.questions,...vocabQs];detail.innerHTML=`<h3>${r.title}</h3><p>${r.summary}</p><h4>Слова и выражения</h4><ul>${r.words.map(([a,b])=>`<li><b>${a}</b> — ${b}</li>`).join("")}</ul><p><b>Example:</b> ${r.example}<br><span class="ex-ru">${r.exampleRu}</span></p><h4>Вопросы по тексту и словарю</h4><p class="score-box" id="reading-score">Счёт: 0 / 0</p>${qs.map((q,i)=>{const distractors=qs.map(x=>x.a).filter(x=>x!==q.a).slice(0,3);const options=[q.a,...distractors].sort(()=>Math.random()-.5);return `<div class="ex-item reading-question" data-answer="${encodeURIComponent(q.a)}" data-why="${encodeURIComponent(q.why)}"><p>${i+1}. ${q.q}</p><select><option value="">Выберите ответ</option>${options.map(o=>`<option>${o}</option>`).join("")}</select> <button type="button" class="reading-check">Проверить</button><p class="ex-feedback"></p></div>`;}).join("")}<p class="source-ref">Источник: Reading Bank, p. ${r.page}; задания и примеры составлены заново.</p>`;detail.querySelectorAll(".reading-check").forEach(b=>b.addEventListener("click",()=>{const box=b.closest(".reading-question");if(box.dataset.done)return;const selected=box.querySelector("select").value,answer=decodeURIComponent(box.dataset.answer),fb=box.querySelector(".ex-feedback"),correct=selected===answer;box.dataset.done="true";fb.textContent=correct?"Верно! ":`Неверно. Правильный ответ: ${answer}. `;fb.textContent+=decodeURIComponent(box.dataset.why);fb.classList.add(correct?"ok":"bad");const done=detail.querySelectorAll(".reading-question[data-done]").length,right=detail.querySelectorAll(".reading-question[data-done='true'] .ex-feedback.ok").length;detail.querySelector("#reading-score").textContent=`Счёт: ${right} / ${done} (ответов дано)`;box.querySelector("select").disabled=true;b.disabled=true;}));}select.addEventListener("change",show);show();}

function markButtonResult(btn, isCorrect) {
  btn.classList.add(isCorrect ? "correct" : "incorrect");
}

function renderMCQBlock(title, items, root, scoreState) {
  const wrap = document.createElement("div");
  wrap.className = "exercise-block";
  wrap.innerHTML = `<h3>${title}</h3>`;
  items.forEach(q => {
    const box = document.createElement("div");
    box.className = "ex-item";
    const p = document.createElement("div");
    p.textContent = q.prompt;
    box.appendChild(p);
    const optsWrap = document.createElement("div");
    optsWrap.className = "ex-options";
    const feedback = document.createElement("div");
    feedback.className = "ex-feedback";
    q.options.forEach(opt => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt;
      b.addEventListener("click", () => {
        if (box.dataset.answered) return;
        box.dataset.answered = "true";
        const correct = opt === q.answer;
        Array.from(optsWrap.children).forEach(c => c.classList.add("disabled"));
        markButtonResult(b, correct);
        if (!correct) {
          Array.from(optsWrap.children).find(c => c.textContent === q.answer)?.classList.add("correct");
        }
        feedback.textContent = correct ? "Верно!" : `Неверно. Правильный ответ: ${q.answer}`;
        feedback.className = "ex-feedback " + (correct ? "ok" : "bad");
        scoreState.answered++;
        if (correct) scoreState.correct++;
        updateScoreDisplay(scoreState);
        updateFinalScore(scoreState);
      });
      optsWrap.appendChild(b);
    });
    box.appendChild(optsWrap);
    box.appendChild(feedback);
    wrap.appendChild(box);
  });
  root.appendChild(wrap);
}

function renderFillBlock(title, items, root, scoreState) {
  const wrap = document.createElement("div");
  wrap.className = "exercise-block";
  wrap.innerHTML = `<h3>${title}</h3>`;
  items.forEach(q => {
    const box = document.createElement("div");
    box.className = "ex-item";
    const p = document.createElement("div");
    p.textContent = q.prompt + `  (подсказка: ${q.hint})`;
    box.appendChild(p);
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.marginTop = "8px";
    const input = document.createElement("input");
    input.type = "text";
    input.style.marginBottom = "0";
    input.style.flex = "1";
    const btn = document.createElement("button");
    btn.textContent = "Проверить";
    const feedback = document.createElement("div");
    feedback.className = "ex-feedback";
    btn.addEventListener("click", () => {
      const val = input.value.trim().toLowerCase();
      const correct = val === q.answer;
      feedback.textContent = correct ? "Верно!" : `Неверно. Правильный ответ: ${q.answer}`;
      feedback.className = "ex-feedback " + (correct ? "ok" : "bad");
      input.disabled = true;
      btn.disabled = true;
      scoreState.answered++;
      if (correct) scoreState.correct++;
      updateScoreDisplay(scoreState);
      updateFinalScore(scoreState);
    });
    row.appendChild(input);
    row.appendChild(btn);
    box.appendChild(row);
    box.appendChild(feedback);
    wrap.appendChild(box);
  });
  root.appendChild(wrap);
}

function renderDialogueBlock(title, items, root, scoreState) {
  const wrap = document.createElement("div");
  wrap.className = "exercise-block";
  wrap.innerHTML = `<h3>${title}</h3>`;
  items.forEach(q => {
    const box = document.createElement("div");
    box.className = "ex-item";
    const p = document.createElement("div");
    p.style.whiteSpace = "pre-wrap";
    p.textContent = q.context + `\n(подсказка: ${q.hint})`;
    box.appendChild(p);
    const optsWrap = document.createElement("div");
    optsWrap.className = "ex-options";
    const feedback = document.createElement("div");
    feedback.className = "ex-feedback";
    q.options.forEach(opt => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt;
      b.addEventListener("click", () => {
        if (box.dataset.answered) return;
        box.dataset.answered = "true";
        const correct = opt === q.answer;
        Array.from(optsWrap.children).forEach(c => c.classList.add("disabled"));
        markButtonResult(b, correct);
        if (!correct) {
          Array.from(optsWrap.children).find(c => c.textContent === q.answer)?.classList.add("correct");
        }
        feedback.textContent = correct ? "Верно!" : `Неверно. Правильный ответ: ${q.answer}`;
        feedback.className = "ex-feedback " + (correct ? "ok" : "bad");
        scoreState.answered++;
        if (correct) scoreState.correct++;
        updateScoreDisplay(scoreState);
        updateFinalScore(scoreState);
      });
      optsWrap.appendChild(b);
    });
    box.appendChild(optsWrap);
    box.appendChild(feedback);
    wrap.appendChild(box);
  });
  root.appendChild(wrap);
}

function renderMatchBlock(title, match, root, scoreState) {
  const wrap = document.createElement("div");
  wrap.className = "exercise-block";
  wrap.innerHTML = `<h3>${title}</h3>`;
  const box = document.createElement("div");
  box.className = "ex-item";
  const matchWrap = document.createElement("div");
  matchWrap.className = "match-wrap";
  const leftCol = document.createElement("div");
  leftCol.className = "match-col";
  const rightCol = document.createElement("div");
  rightCol.className = "match-col";

  let selectedLeft = null;
  let selectedRight = null;
  let matchedCount = 0;
  const feedback = document.createElement("div");
  feedback.className = "ex-feedback";

  function tryMatch() {
    if (selectedLeft === null || selectedRight === null) return;
    const enText = selectedLeft.dataset.val;
    const ruText = selectedRight.dataset.val;
    const isPair = match.pairs.some(p => p.en === enText && p.ru === ruText);
    if (isPair) {
      selectedLeft.classList.remove("selected");
      selectedRight.classList.remove("selected");
      selectedLeft.classList.add("matched");
      selectedRight.classList.add("matched");
      matchedCount++;
      scoreState.answered++;
      scoreState.correct++;
      updateScoreDisplay(scoreState);
      updateFinalScore(scoreState);
      if (matchedCount === match.pairs.length) {
        feedback.textContent = "Все пары найдены! Отлично!";
        feedback.className = "ex-feedback ok";
      }
    } else {
      selectedLeft.classList.add("wrong");
      selectedRight.classList.add("wrong");
      setTimeout(() => {
        matchWrap.querySelectorAll(".wrong, .selected").forEach(c=>c.classList.remove("selected", "wrong"));
      }, 350);
    }
    selectedLeft = null;
    selectedRight = null;
  }

  match.left.forEach(en => {
    const el = document.createElement("div");
    el.className = "match-item";
    el.textContent = en;
    el.dataset.val = en;
    el.addEventListener("click", () => {
      if (el.classList.contains("matched")) return;
      Array.from(leftCol.children).forEach(c => c.classList.remove("selected"));
      el.classList.add("selected");
      selectedLeft = el;
      tryMatch();
    });
    leftCol.appendChild(el);
  });
  match.right.forEach(ru => {
    const el = document.createElement("div");
    el.className = "match-item";
    el.textContent = ru;
    el.dataset.val = ru;
    el.addEventListener("click", () => {
      if (el.classList.contains("matched")) return;
      Array.from(rightCol.children).forEach(c => c.classList.remove("selected"));
      el.classList.add("selected");
      selectedRight = el;
      tryMatch();
    });
    rightCol.appendChild(el);
  });

  matchWrap.appendChild(leftCol);
  matchWrap.appendChild(rightCol);
  box.appendChild(matchWrap);
  box.appendChild(feedback);
  wrap.appendChild(box);
  root.appendChild(wrap);
}

function updateScoreDisplay(scoreState) {
  const el = document.getElementById("score-display");
  if (el) el.textContent = `Счёт: ${scoreState.correct} / ${scoreState.answered}`;
}
function updateFinalScore(scoreState) { const el=document.getElementById("final-score"); if(el){el.textContent=scoreState.answered===scoreState.total?`Итог: ${scoreState.correct} из ${scoreState.total} правильных ответов.`:`Отвечено: ${scoreState.answered} из ${scoreState.total}.`; } }

function renderExercises(unit) {
  const root = document.getElementById("exercises-root");
  root.innerHTML = "";
  const scoreBar = document.createElement("div");
  scoreBar.className = "score-box";
  scoreBar.id = "score-display";
  scoreBar.textContent = "Счёт: 0 / 0";
  root.appendChild(scoreBar);

  const data = generateExercises(unit);
  const scoreState = { correct: 0, answered: 0, total:data.total };
  renderMCQBlock("1. Выберите перевод (EN → RU)", data.mcqEnRu, root, scoreState);
  renderMCQBlock("2. Выберите слово (RU → EN)", data.mcqRuEn, root, scoreState);
  renderFillBlock("3. Заполните пропуск", data.fill, root, scoreState);
  renderMatchBlock("4. Сопоставьте слова и переводы", data.match, root, scoreState);
  renderDialogueBlock("5. Выберите подходящую фразу в диалоге", data.dialogue, root, scoreState);
  renderMCQBlock("6. Грамматика и язык", data.grammar, root, scoreState);
  renderMCQBlock("7. Фразы в контексте", data.phrases, root, scoreState);
  const total=document.createElement("p");total.className="score-box";total.id="final-score";root.appendChild(total);updateFinalScore(scoreState);
}

function selectUnit(id) {
  currentUnitId = id;
  const unit = getCurrentUnit();
  document.getElementById("unit-title").textContent = `${unit.id}. ${unit.title}`;
  document.getElementById("unit-intro").textContent = unit.intro;
  renderUnitsNav();
  renderVocab(unit);
  renderUnitContent(unit);
  renderExercises(unit);
  renderReadingBank();
  document.getElementById("chat-messages").innerHTML = "";
}

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.querySelectorAll(".tab-content").forEach(section=>section.style.display=section.id===`tab-${tab}`?"block":"none");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth(() => {
    initTabs();
    document.getElementById("vocab-search").addEventListener("input",()=>renderVocab(getCurrentUnit()));
    document.getElementById("vocab-pos").addEventListener("change",()=>renderVocab(getCurrentUnit()));
    selectUnit(1);
    initChatbot(getCurrentUnit);
  });
});
