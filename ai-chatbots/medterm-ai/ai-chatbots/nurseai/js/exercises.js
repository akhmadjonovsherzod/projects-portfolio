// exercises.js — generates original, auto-checked exercises for a unit
// from its vocabulary list (UNITS in units-data.js). Exercise text/sentences
// are newly written here (not copied from the textbook).

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(unit, correctItem, field, count) {
  const pool = unit.vocab.filter(v => v.en !== correctItem.en).map(v => v[field]);
  return shuffle(pool).slice(0, count);
}

function blankSentence(item) {
  // Replace the vocab word (case-insensitive, allowing simple variants) with a blank.
  const word = item.en.replace(/^to\s+/i, "");
  const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (re.test(item.ex)) {
    return item.ex.replace(re, "_____");
  }
  return item.ex + " (_____)";
}

function genMultipleChoiceEnToRu(unit, n) {
  const items = shuffle(unit.vocab).slice(0, n);
  return items.map((item, i) => {
    const distractors = pickDistractors(unit, item, "ru", 3);
    const options = shuffle([item.ru, ...distractors]);
    return {
      type: "mcq",
      id: `mcq-${unit.id}-${i}`,
      prompt: `Что означает слово "${item.en}"?`,
      options,
      answer: item.ru
    };
  });
}

function genMultipleChoiceRuToEn(unit, n) {
  const items = shuffle(unit.vocab).slice(0, n);
  return items.map((item, i) => {
    const distractors = pickDistractors(unit, item, "en", 3);
    const options = shuffle([item.en, ...distractors]);
    return {
      type: "mcq",
      id: `mcq-ru-${unit.id}-${i}`,
      prompt: `Как по-английски "${item.ru}"?`,
      options,
      answer: item.en
    };
  });
}

function genFillBlank(unit, n) {
  const items = shuffle(unit.vocab).slice(0, n);
  return items.map((item, i) => ({
    type: "fill",
    id: `fill-${unit.id}-${i}`,
    prompt: `Заполните пропуск (англ.): ${blankSentence(item)}`,
    hint: item.ru,
    answer: item.en.replace(/^to\s+/i, "").toLowerCase()
  }));
}

function genMatching(unit, n) {
  const items = shuffle(unit.vocab).slice(0, n);
  return {
    type: "match",
    id: `match-${unit.id}`,
    left: items.map(i => i.en),
    right: shuffle(items.map(i => i.ru)),
    pairs: items.map(i => ({ en: i.en, ru: i.ru }))
  };
}

function genDialogueChoice(unit, n) {
  // "Choose the correct phrase in a short nursing conversation" —
  // builds a short original two-line exchange using the vocab item.
  const items = shuffle(unit.vocab).slice(0, n);
  return items.map((item, i) => {
    const distractors = pickDistractors(unit, item, "en", 2);
    const options = shuffle([item.en, ...distractors]);
    return {
      type: "dialogue",
      id: `dlg-${unit.id}-${i}`,
      context: `Nurse: Can you tell me more about the patient's condition?\nColleague: Yes, I think we should mention "____" in the notes.`,
      hint: item.ru,
      options,
      answer: item.en
    };
  });
}

function generateExercises(unit) {
  const learning = UNIT_LEARNING[unit.id - 1];
  const pool = [...unit.vocab, ...learning.phrases.map(en => ({en,ru:phraseRu(en),ex:phraseExample(en),exRu:phraseExampleRu(en)}))];
  const expandedUnit = {...unit, vocab:pool};
  const grammarBank = [
    [["A midwife ___ babies every day.","delivers","is delivering"],["The nurse ___ a patient at the moment.","is examining","examines"]],
    [["The clinic is ___ the ward and the lift.","between","through"],["Walk ___ the corridor.","along","opposite"]],
    [["While the nurse ___ the record, the patient arrived.","was checking","checked"],["The patient ___ at 8 a.m.","arrived","was arriving"]],
    [["___ still, please.","Stay","Stays"],["___ touch the wound.","Don’t","Doesn’t"]],
    [["This pain is ___ than yesterday.","milder","more mild"],["The ache is as ___ as before.","painful","more painful"]],
    [["How long ___ you had the cough?","have","do"],["Where ___ it hurt?","does","is"]],
    [["I ___ help you with that bag.","will","am"],["She ___ call the nurse if she needs help.","will","does"]],
    [["You ___ drink enough water.","should","should to"],["You ___ skip meals.","shouldn’t","don’t should"]],
    [["If blood is exposed to air, it ___.","clots","will clot"],["If the result is abnormal, the doctor ___ call.","will","would"]],
    [["The patient ___ need time to decide.","may","mustn’t"],["Staff ___ respect the patient’s wishes.","must","might"]],
    [["She ___ worked here for five years.","has","is"],["Have you ___ your hands?","washed","wash"]],
    [["Staff ___ follow the safety procedure.","must","mustn’t"],["You ___ enter; the area is restricted.","mustn’t","don’t have to"]],
    [["The temperature ___ every four hours.","is recorded","records"],["The pulse ___ by the nurse.","was measured","measured"]],
    [["We ___ check the medication chart now.","are going to","going"],["I ___ the patient at ten; it is arranged.","am seeing","will seeing"]],
    [["She chose the therapy ___ it was gentle.","because","so"],["The method was gentle, ___ she chose it.","so","because"]]
  ][unit.id - 1];
  const grammar = grammarBank.map(([prompt,answer,wrong],i)=>({type:"mcq",id:`grammar-${unit.id}-${i}`,prompt,options:shuffle([answer,wrong]),answer}));
  const phrases = learning.phrases.slice(0,3).map((p,i)=>({type:"mcq",id:`phrase-${unit.id}-${i}`,prompt:`Choose the useful expression for this unit: ${p}`,options:shuffle([p,...learning.phrases.filter(x=>x!==p).slice(0,2)]),answer:p}));
  return {
    mcqEnRu: genMultipleChoiceEnToRu(expandedUnit, 5),
    mcqRuEn: genMultipleChoiceRuToEn(expandedUnit, 5),
    fill: genFillBlank(expandedUnit, 4),
    match: genMatching(expandedUnit, 6),
    dialogue: genDialogueChoice(expandedUnit, 3),
    grammar,
    phrases,
    total: 5+5+4+6+3+grammar.length+phrases.length
  };
}
