// ============================================================
// sections-data.js — content for the 4 educational sections.
// Used to render cards AND as the text sent to Gemini when the
// user clicks "Summarize section".
// ============================================================

export const SECTIONS = [
  {
    id: "formation",
    title: { en: "Latin Term Formation", uz: "Lotin tilida termin yasash" },
    content: {
      en: `Clinical Latin terms are usually built by combining a ROOT (the core meaning, often from a body part or
process) with a PREFIX (added before the root to modify meaning, e.g. location, number, negation) and/or a
SUFFIX (added after the root to indicate a condition, procedure, or specialty).

Pattern: [prefix] + root + [suffix]

Examples:
- gastr(o) + itis → gastritis — inflammation of the stomach
- hepat(o) + itis → hepatitis — inflammation of the liver
- cardi(o) + logy → cardiology — the study of the heart
- hypo + derm + ic → hypodermic — under the skin

Combining vowels (usually "o") are inserted between root and suffix/prefix when needed for pronunciation,
e.g. gastr-o-enteritis.`,
      uz: `Klinik lotin terminlari odatda ILDIZ (asosiy ma'no, ko'pincha tana a'zosi yoki jarayon nomi) ni
PREFIKS (ildizdan oldin qo'shilib, joylashuv, son, inkor kabi ma'noni o'zgartiradi) va/yoki
SUFFIKS (ildizdan keyin qo'shilib, holat, muolaja yoki sohani bildiradi) bilan birlashtirish orqali yasaladi.

Andoza: [prefiks] + ildiz + [suffiks]

Misollar:
- gastr(o) + itis → gastritis — oshqozon yallig'lanishi
- hepat(o) + itis → hepatitis — jigar yallig'lanishi
- cardi(o) + logy → cardiology — yurak haqidagi fan
- hypo + derm + ic → hypodermic — teri ostiga oid

Talaffuz uchun zarur bo'lganda ildiz va suffiks/prefiks orasiga bog'lovchi unli (odatda "o") qo'shiladi,
masalan: gastr-o-enteritis.`
    },
    examples: ["gastritis", "hepatitis", "cardiology", "hypodermic"]
  },
  {
    id: "prefixes",
    title: { en: "Prefixes", uz: "Prefikslar" },
    content: {
      en: `A prefix attaches to the beginning of a root to change or add meaning — often location, direction,
quantity, size, or negation.

Common clinical prefixes:
- a-, an- = without, absence (anemia — without blood/iron)
- brady- = slow (bradycardia — slow heart rate)
- tachy- = fast (tachycardia — fast heart rate)
- hyper- = above, excessive (hypertension — high blood pressure)
- hypo- = below, deficient (hypoglycemia — low blood sugar)
- peri- = around (pericardium — around the heart)
- sub- = under, below (subcutaneous — under the skin)
- inter- = between (intercostal — between the ribs)`,
      uz: `Prefiks ildizning boshiga qo'shilib, ma'noni o'zgartiradi yoki qo'shimcha ma'no beradi — ko'pincha
joylashuv, yo'nalish, miqdor, hajm yoki inkorni bildiradi.

Keng tarqalgan klinik prefikslar:
- a-, an- = yo'qlik, mavjud emaslik (anemia — qon/temir yetishmasligi)
- brady- = sekin (bradycardia — yurak urishining sekinlashishi)
- tachy- = tez (tachycardia — yurak urishining tezlashishi)
- hyper- = yuqori, ortiqcha (hypertension — yuqori qon bosimi)
- hypo- = past, yetishmovchilik (hypoglycemia — qondagi shakar pastligi)
- peri- = atrofida (pericardium — yurak atrofidagi parda)
- sub- = ostida (subcutaneous — teri ostida)
- inter- = orasida (intercostal — qovurg'alar orasida)`
    },
    examples: ["anemia", "bradycardia", "hypertension", "pericardium"]
  },
  {
    id: "suffixes",
    title: { en: "Suffixes", uz: "Suffikslar" },
    content: {
      en: `A suffix attaches to the end of a root to indicate a condition, disease process, procedure, or
medical specialty.

Common clinical suffixes:
- -itis = inflammation (arthritis — joint inflammation)
- -osis = abnormal condition (necrosis — tissue death)
- -ectomy = surgical removal (appendectomy — removal of the appendix)
- -otomy = surgical incision (tracheotomy — incision into the trachea)
- -ostomy = creating an opening (colostomy — opening into the colon)
- -algia = pain (neuralgia — nerve pain)
- -emia = blood condition (anemia — deficient blood condition)
- -logy = study of (cardiology — study of the heart)`,
      uz: `Suffiks ildizning oxiriga qo'shilib, holat, kasallik jarayoni, muolaja yoki tibbiy sohani bildiradi.

Keng tarqalgan klinik suffikslar:
- -itis = yallig'lanish (arthritis — bo'g'im yallig'lanishi)
- -osis = g'ayritabiiy holat (necrosis — to'qima o'limi)
- -ectomy = jarrohlik yo'li bilan olib tashlash (appendectomy — chuvalchangsimon o'simtani olib tashlash)
- -otomy = jarrohlik kesimi (tracheotomy — traxeyaga kesim)
- -ostomy = teshik hosil qilish (colostomy — yo'g'on ichakka teshik)
- -algia = og'riq (neuralgia — asab og'rig'i)
- -emia = qon holati (anemia — qon yetishmovchiligi holati)
- -logy = fan, o'rganish (cardiology — yurak haqidagi fan)`
    },
    examples: ["arthritis", "appendectomy", "tracheotomy", "neuralgia"]
  },
  {
    id: "roots",
    title: { en: "Roots", uz: "Ildizlar" },
    content: {
      en: `The root carries the core meaning of a term, usually naming a body part, tissue, or substance.
Roots are combined with prefixes and suffixes to form full clinical terms.

Common clinical roots:
- cardi(o) = heart (cardiology, myocardium)
- derm(a/o) = skin (dermatitis, epidermis)
- gastr(o) = stomach (gastritis, gastroenteritis)
- hepat(o) = liver (hepatitis, hepatomegaly)
- nephr(o) = kidney (nephritis, nephrectomy)
- neur(o) = nerve (neuralgia, neurology)
- oste(o) = bone (osteoporosis, osteotomy)
- pulmon(o) = lung (pulmonary, pulmonology)`,
      uz: `Ildiz terminning asosiy ma'nosini tashiydi, odatda tana a'zosi, to'qima yoki moddani bildiradi.
Ildizlar prefiks va suffikslar bilan birikib, to'liq klinik terminlarni hosil qiladi.

Keng tarqalgan klinik ildizlar:
- cardi(o) = yurak (cardiology, myocardium)
- derm(a/o) = teri (dermatitis, epidermis)
- gastr(o) = oshqozon (gastritis, gastroenteritis)
- hepat(o) = jigar (hepatitis, hepatomegaly)
- nephr(o) = buyrak (nephritis, nephrectomy)
- neur(o) = asab (neuralgia, neurology)
- oste(o) = suyak (osteoporosis, osteotomy)
- pulmon(o) = o'pka (pulmonary, pulmonology)`
    },
    examples: ["cardiology", "dermatitis", "nephrectomy", "osteoporosis"]
  }
];

export function getSection(id) {
  return SECTIONS.find((s) => s.id === id);
}
