// units-data.js
// Based on the unit structure, titles and key vocabulary of
// Oxford English for Careers: Nursing 1 (Oxford University Press).
// Vocabulary items, Russian explanations and example sentences in this
// file are original material written for this course website.

const UNITS = [
  {
    id: 1,
    title: "The hospital team",
    titleRu: "Команда больницы",
    intro: "Названия должностей и специальностей сотрудников больницы, глаголы для описания работы.",
    vocab: [
      { en: "anaesthetist", pos: "n", ru: "анестезиолог", ex: "The anaesthetist checked the patient before the operation.", exRu: "Анестезиолог осмотрел пациента перед операцией." },
      { en: "cardiologist", pos: "n", ru: "кардиолог", ex: "She saw a cardiologist about her heart problem.", exRu: "Она обратилась к кардиологу по поводу проблем с сердцем." },
      { en: "consultant", pos: "n", ru: "врач-консультант (высшей категории)", ex: "The consultant leads the medical team on the ward.", exRu: "Врач-консультант руководит медицинской командой в отделении." },
      { en: "lab technician", pos: "n", ru: "лаборант", ex: "The lab technician analysed the blood sample.", exRu: "Лаборант проанализировал образец крови." },
      { en: "midwife", pos: "n", ru: "акушерка", ex: "A midwife delivers babies and cares for new mothers.", exRu: "Акушерка принимает роды и ухаживает за новыми мамами." },
      { en: "paediatrician", pos: "n", ru: "педиатр", ex: "The paediatrician examined the sick child.", exRu: "Педиатр осмотрел больного ребёнка." },
      { en: "paramedic", pos: "n", ru: "фельдшер скорой помощи", ex: "The paramedic gave first aid at the scene.", exRu: "Фельдшер оказал первую помощь на месте." },
      { en: "physiotherapist", pos: "n", ru: "физиотерапевт", ex: "The physiotherapist designs exercises for patients.", exRu: "Физиотерапевт разрабатывает упражнения для пациентов." },
      { en: "porter", pos: "n", ru: "санитар-носильщик", ex: "The porter moves patients between departments.", exRu: "Санитар перевозит пациентов между отделениями." },
      { en: "radiologist", pos: "n", ru: "рентгенолог", ex: "The radiologist examines X-rays and scans.", exRu: "Рентгенолог изучает рентгеновские снимки и сканы." },
      { en: "scrub nurse", pos: "n", ru: "операционная медсестра", ex: "The scrub nurse prepares the instruments for surgery.", exRu: "Операционная медсестра готовит инструменты для операции." },
      { en: "to specialize in", pos: "v", ru: "специализироваться на", ex: "He specializes in heart surgery.", exRu: "Он специализируется на операциях на сердце." },
      { en: "to examine", pos: "v", ru: "осматривать, обследовать", ex: "The doctor examines every new patient.", exRu: "Врач осматривает каждого нового пациента." },
      { en: "to treat", pos: "v", ru: "лечить", ex: "Nurses treat patients with care and respect.", exRu: "Медсёстры лечат пациентов с заботой и уважением." }
    ]
  },
  {
    id: 2,
    title: "In and around the hospital",
    titleRu: "В больнице и вокруг неё",
    intro: "Названия отделений больницы и медицинского оборудования.",
    vocab: [
      { en: "pathology", pos: "n", ru: "патология (отделение)", ex: "Blood samples are sent to pathology for testing.", exRu: "Образцы крови отправляют в патологию на анализ." },
      { en: "cardiology", pos: "n", ru: "кардиология", ex: "Cardiology specializes in heart problems.", exRu: "Кардиология специализируется на проблемах с сердцем." },
      { en: "physiotherapy", pos: "n", ru: "физиотерапия (отделение)", ex: "Physiotherapy designs exercises for injured patients.", exRu: "Физиотерапия разрабатывает упражнения для травмированных пациентов." },
      { en: "renal unit", pos: "n", ru: "отделение нефрологии (почки)", ex: "The renal unit treats patients with kidney diseases.", exRu: "Отделение нефрологии лечит пациентов с болезнями почек." },
      { en: "pharmacy", pos: "n", ru: "аптека", ex: "You can collect your medicine from the pharmacy.", exRu: "Вы можете забрать лекарство в аптеке." },
      { en: "orthopaedics", pos: "n", ru: "ортопедия", ex: "Orthopaedics treats bones and joints.", exRu: "Ортопедия лечит кости и суставы." },
      { en: "neurology", pos: "n", ru: "неврология", ex: "Neurology deals with disorders of the nervous system.", exRu: "Неврология занимается нарушениями нервной системы." },
      { en: "paediatrics", pos: "n", ru: "педиатрия", ex: "Paediatrics specializes in sick children.", exRu: "Педиатрия специализируется на больных детях." },
      { en: "dermatology", pos: "n", ru: "дерматология", ex: "Dermatology treats diseases of the skin.", exRu: "Дерматология лечит заболевания кожи." },
      { en: "haematology", pos: "n", ru: "гематология", ex: "Haematology studies disorders of the blood.", exRu: "Гематология изучает заболевания крови." },
      { en: "obstetrics", pos: "n", ru: "акушерство", ex: "Obstetrics specializes in pregnancy and birth.", exRu: "Акушерство специализируется на беременности и родах." },
      { en: "microscope", pos: "n", ru: "микроскоп", ex: "She looked at the cells under a microscope.", exRu: "Она рассматривала клетки под микроскопом." },
      { en: "to dispense (medicine)", pos: "v", ru: "выдавать (лекарства)", ex: "The pharmacy dispenses medicines to patients.", exRu: "Аптека выдаёт лекарства пациентам." }
    ]
  },
  {
    id: 3,
    title: "Hospital admissions",
    titleRu: "Госпитализация",
    intro: "Процедура поступления пациента в больницу: регистрация, первичный осмотр, приоритетность.",
    vocab: [
      { en: "triage nurse", pos: "n", ru: "медсестра сортировки (приёмного покоя)", ex: "The triage nurse decides who needs to be seen first.", exRu: "Медсестра сортировки решает, кого нужно принять первым." },
      { en: "initial assessment", pos: "n", ru: "первичная оценка состояния", ex: "The nurse makes an initial assessment of every patient.", exRu: "Медсестра проводит первичную оценку состояния каждого пациента." },
      { en: "life-threatening", pos: "adj", ru: "угрожающий жизни", ex: "A life-threatening condition needs immediate treatment.", exRu: "Состояние, угрожающее жизни, требует немедленного лечения." },
      { en: "registration", pos: "n", ru: "регистрация", ex: "Registration takes your personal details.", exRu: "При регистрации записывают ваши личные данные." },
      { en: "waiting room", pos: "n", ru: "зал ожидания", ex: "Please take a seat in the waiting room.", exRu: "Пожалуйста, присядьте в зале ожидания." },
      { en: "cubicle", pos: "n", ru: "кабинка (для осмотра)", ex: "The doctor examined her in a cubicle.", exRu: "Врач осмотрел её в кабинке." },
      { en: "priority", pos: "n", ru: "приоритет, очерёдность", ex: "Patients with severe pain get priority.", exRu: "Пациенты с сильной болью получают приоритет." },
      { en: "to admit (a patient)", pos: "v", ru: "госпитализировать", ex: "She was admitted to hospital after a fall.", exRu: "Её госпитализировали после падения." },
      { en: "next of kin", pos: "n", ru: "ближайший родственник", ex: "Please give us the contact details of your next of kin.", exRu: "Пожалуйста, дайте контакты вашего ближайшего родственника." },
      { en: "allergic (to)", pos: "adj", ru: "аллергичный (на что-то)", ex: "He is allergic to nuts.", exRu: "У него аллергия на орехи." },
      { en: "fatal", pos: "adj", ru: "смертельный", ex: "Without treatment, the illness can be fatal.", exRu: "Без лечения болезнь может быть смертельной." },
      { en: "prescription", pos: "n", ru: "рецепт (на лекарство)", ex: "The doctor wrote a prescription for antibiotics.", exRu: "Врач выписал рецепт на антибиотики." }
    ]
  },
  {
    id: 4,
    title: "Accidents and emergencies",
    titleRu: "Несчастные случаи и неотложная помощь",
    intro: "Первая помощь: ожоги, кровотечения, волдыри и необходимые действия.",
    vocab: [
      { en: "to apply", pos: "v", ru: "наносить, прикладывать", ex: "Apply ice to reduce the swelling.", exRu: "Приложите лёд, чтобы уменьшить отёк." },
      { en: "to immobilize", pos: "v", ru: "обездвижить", ex: "Immobilize the injured leg before moving the patient.", exRu: "Обездвижьте повреждённую ногу, прежде чем перемещать пациента." },
      { en: "to sterilize", pos: "v", ru: "стерилизовать", ex: "Always sterilize the needle before use.", exRu: "Всегда стерилизуйте иглу перед использованием." },
      { en: "to squeeze", pos: "v", ru: "сжимать", ex: "Squeeze the artery to stop the bleeding.", exRu: "Сожмите артерию, чтобы остановить кровотечение." },
      { en: "to puncture", pos: "v", ru: "прокалывать", ex: "Use a sterile needle to puncture the blister.", exRu: "Используйте стерильную иглу, чтобы проколоть волдырь." },
      { en: "to remove", pos: "v", ru: "удалять, снимать", ex: "Remove any burnt clothing carefully.", exRu: "Осторожно снимите обгоревшую одежду." },
      { en: "to immerse", pos: "v", ru: "погружать (в жидкость)", ex: "Immerse the burn in cool water for ten minutes.", exRu: "Погрузите ожог в прохладную воду на десять минут." },
      { en: "blister", pos: "n", ru: "волдырь", ex: "A burn can cause a painful blister.", exRu: "Ожог может вызвать болезненный волдырь." },
      { en: "bandage", pos: "n", ru: "бинт, повязка", ex: "Cover the wound with a clean bandage.", exRu: "Накройте рану чистым бинтом." },
      { en: "tweezers", pos: "n", ru: "пинцет", ex: "Use tweezers to remove the glass from the wound.", exRu: "Используйте пинцет, чтобы удалить стекло из раны." },
      { en: "severe bleeding", pos: "n phrase", ru: "сильное кровотечение", ex: "Severe bleeding must be stopped immediately.", exRu: "Сильное кровотечение нужно остановить немедленно." },
      { en: "to treat for shock", pos: "v phrase", ru: "лечить от шока", ex: "Keep the patient warm and treat for shock.", exRu: "Согревайте пациента и лечите от шока." }
    ]
  },
  {
    id: 5,
    title: "Pain",
    titleRu: "Боль",
    intro: "Слова для описания типов и силы боли.",
    vocab: [
      { en: "throbbing pain", pos: "n phrase", ru: "пульсирующая боль", ex: "He has a throbbing pain in his head.", exRu: "У него пульсирующая боль в голове." },
      { en: "sharp pain", pos: "n phrase", ru: "острая, резкая боль", ex: "She felt a sharp pain in her side.", exRu: "Она почувствовала острую боль в боку." },
      { en: "burning pain", pos: "n phrase", ru: "жгучая боль", ex: "The burn caused a burning pain on his arm.", exRu: "Ожог вызвал жгучую боль в руке." },
      { en: "stabbing pain", pos: "n phrase", ru: "колющая боль", ex: "A stabbing pain in the chest can be serious.", exRu: "Колющая боль в груди может быть серьёзной." },
      { en: "shooting pain", pos: "n phrase", ru: "стреляющая боль", ex: "He felt a shooting pain down his leg.", exRu: "Он почувствовал стреляющую боль в ноге." },
      { en: "dull ache", pos: "n phrase", ru: "тупая, ноющая боль", ex: "She complained of a dull ache in her lower back.", exRu: "Она жаловалась на тупую боль в пояснице." },
      { en: "gnawing pain", pos: "n phrase", ru: "сосущая, изнуряющая боль", ex: "He had a gnawing pain in his stomach.", exRu: "У него была сосущая боль в желудке." },
      { en: "cramping pain", pos: "n phrase", ru: "спазматическая боль, спазм", ex: "She felt a cramping pain during her period.", exRu: "Она почувствовала спазматическую боль во время месячных." },
      { en: "agonizing", pos: "adj", ru: "мучительный, невыносимый", ex: "The injury caused agonizing pain.", exRu: "Травма вызвала мучительную боль." },
      { en: "mild", pos: "adj", ru: "лёгкий, слабый (о боли)", ex: "He only has mild pain now.", exRu: "Сейчас у него лишь слабая боль." },
      { en: "unbearable", pos: "adj", ru: "невыносимый", ex: "The pain became unbearable overnight.", exRu: "За ночь боль стала невыносимой." },
      { en: "to assess pain", pos: "v phrase", ru: "оценивать боль", ex: "Nurses assess pain using a pain scale.", exRu: "Медсёстры оценивают боль с помощью шкалы боли." }
    ]
  },
  {
    id: 6,
    title: "Symptoms",
    titleRu: "Симптомы",
    intro: "Существительные и прилагательные для описания симптомов заболеваний.",
    vocab: [
      { en: "deformity", pos: "n", ru: "деформация", ex: "The X-ray showed a deformity in the bone.", exRu: "Рентген показал деформацию кости." },
      { en: "bruising", pos: "n", ru: "синяки, кровоподтёки", ex: "There was bruising around the injury.", exRu: "Вокруг травмы были синяки." },
      { en: "swelling", pos: "n", ru: "отёк, опухоль", ex: "The swelling went down after the ice pack.", exRu: "Отёк уменьшился после прикладывания льда." },
      { en: "numbness", pos: "n", ru: "онемение", ex: "She felt numbness in her fingers.", exRu: "Она почувствовала онемение в пальцах." },
      { en: "fever", pos: "n", ru: "жар, высокая температура", ex: "The child has a high fever.", exRu: "У ребёнка высокая температура." },
      { en: "rash", pos: "n", ru: "сыпь", ex: "A rash appeared on his skin.", exRu: "На его коже появилась сыпь." },
      { en: "nausea", pos: "n", ru: "тошнота", ex: "She felt nausea after the medication.", exRu: "После лекарства она почувствовала тошноту." },
      { en: "dizziness", pos: "n", ru: "головокружение", ex: "He complained of dizziness when standing up.", exRu: "Он жаловался на головокружение при вставании." },
      { en: "constipation", pos: "n", ru: "запор", ex: "A diet with more fibre can help constipation.", exRu: "Диета с большим количеством клетчатки помогает при запоре." },
      { en: "sore throat", pos: "n phrase", ru: "боль в горле", ex: "He has a sore throat and a cough.", exRu: "У него болит горло и кашель." },
      { en: "vomiting", pos: "n", ru: "рвота", ex: "Vomiting is a common symptom of food poisoning.", exRu: "Рвота — частый симптом пищевого отравления." },
      { en: "tiredness", pos: "n", ru: "усталость", ex: "Tiredness can be a sign of anaemia.", exRu: "Усталость может быть признаком анемии." }
    ]
  },
  {
    id: 7,
    title: "Caring for the elderly",
    titleRu: "Уход за пожилыми людьми",
    intro: "Лексика для описания ухода за пожилыми пациентами в доме престарелых.",
    vocab: [
      { en: "care home", pos: "n", ru: "дом престарелых", ex: "Her grandmother lives in a care home.", exRu: "Её бабушка живёт в доме престарелых." },
      { en: "daily tasks", pos: "n phrase", ru: "повседневные задачи, бытовые дела", ex: "Elderly patients may need help with daily tasks.", exRu: "Пожилым пациентам может требоваться помощь в повседневных делах." },
      { en: "medication", pos: "n", ru: "лекарства, медикаменты", ex: "She takes several medications every morning.", exRu: "Она принимает несколько лекарств каждое утро." },
      { en: "getting around", pos: "n phrase", ru: "передвижение", ex: "Getting around becomes harder with age.", exRu: "С возрастом передвигаться становится труднее." },
      { en: "diagnosis", pos: "n", ru: "диагноз", ex: "The doctor explained the diagnosis to the family.", exRu: "Врач объяснил диагноз семье." },
      { en: "recovery", pos: "n", ru: "выздоровление", ex: "Her recovery was slow but steady.", exRu: "Её выздоровление было медленным, но стабильным." },
      { en: "complications", pos: "n", ru: "осложнения", ex: "Old age can lead to complications after surgery.", exRu: "Пожилой возраст может привести к осложнениям после операции." },
      { en: "attitude of staff", pos: "n phrase", ru: "отношение персонала", ex: "A kind attitude of staff makes patients feel safe.", exRu: "Доброе отношение персонала даёт пациентам чувство безопасности." },
      { en: "independence", pos: "n", ru: "самостоятельность", ex: "Many elderly people value their independence.", exRu: "Многие пожилые люди ценят свою самостоятельность." },
      { en: "privacy", pos: "n", ru: "личное пространство, приватность", ex: "Residents need privacy as well as company.", exRu: "Жильцам нужно и личное пространство, и общение." },
      { en: "stimulation", pos: "n", ru: "стимуляция (умственная/физическая активность)", ex: "Activities give elderly residents mental stimulation.", exRu: "Занятия дают пожилым людям умственную стимуляцию." }
    ]
  },
  {
    id: 8,
    title: "Nutrition and obesity",
    titleRu: "Питание и ожирение",
    intro: "Лексика питания: продукты, питательные вещества, диеты.",
    vocab: [
      { en: "protein", pos: "n", ru: "белок", ex: "Meat and beans are good sources of protein.", exRu: "Мясо и бобы — хорошие источники белка." },
      { en: "carbohydrate", pos: "n", ru: "углевод", ex: "Pasta and rice are high in carbohydrate.", exRu: "Паста и рис богаты углеводами." },
      { en: "dairy product", pos: "n phrase", ru: "молочный продукт", ex: "Cheese and yoghurt are dairy products.", exRu: "Сыр и йогурт — молочные продукты." },
      { en: "pulses", pos: "n", ru: "бобовые", ex: "Lentils and beans are pulses.", exRu: "Чечевица и фасоль — это бобовые." },
      { en: "junk food", pos: "n phrase", ru: "вредная еда, фастфуд", ex: "Too much junk food can cause obesity.", exRu: "Слишком много вредной еды может привести к ожирению." },
      { en: "vitamin deficiency", pos: "n phrase", ru: "дефицит витаминов", ex: "A poor diet can cause vitamin deficiency.", exRu: "Плохое питание может вызвать дефицит витаминов." },
      { en: "nutritious", pos: "adj", ru: "питательный, полезный", ex: "A nutritious meal includes vegetables and protein.", exRu: "Питательный приём пищи включает овощи и белок." },
      { en: "calories", pos: "n", ru: "калории", ex: "This meal has very few calories.", exRu: "В этом блюде очень мало калорий." },
      { en: "obesity", pos: "n", ru: "ожирение", ex: "Obesity increases the risk of diabetes.", exRu: "Ожирение повышает риск диабета." },
      { en: "to be high in / low in", pos: "v phrase", ru: "содержать много / мало (чего-либо)", ex: "This food is high in fat and low in fibre.", exRu: "Эта еда с высоким содержанием жира и низким содержанием клетчатки." },
      { en: "supplement", pos: "n", ru: "пищевая добавка", ex: "The doctor recommended a vitamin supplement.", exRu: "Врач порекомендовал витаминную добавку." }
    ]
  },
  {
    id: 9,
    title: "Blood",
    titleRu: "Кровь",
    intro: "Группы крови, донорство и анализы крови.",
    vocab: [
      { en: "blood group / blood type", pos: "n phrase", ru: "группа крови", ex: "What is your blood group?", exRu: "Какая у вас группа крови?" },
      { en: "donor", pos: "n", ru: "донор", ex: "A donor gave blood for the operation.", exRu: "Донор сдал кровь для операции." },
      { en: "receiver / recipient", pos: "n", ru: "реципиент, получатель", ex: "The recipient needed a blood transfusion.", exRu: "Реципиенту потребовалось переливание крови." },
      { en: "vein", pos: "n", ru: "вена", ex: "The nurse took blood from a vein in his arm.", exRu: "Медсестра взяла кровь из вены на руке." },
      { en: "syringe", pos: "n", ru: "шприц", ex: "She used a syringe to take the blood sample.", exRu: "Она использовала шприц, чтобы взять образец крови." },
      { en: "test tube", pos: "n phrase", ru: "пробирка", ex: "The blood was put into a test tube.", exRu: "Кровь поместили в пробирку." },
      { en: "slide", pos: "n", ru: "предметное стекло", ex: "A drop of blood was placed on a slide.", exRu: "Каплю крови нанесли на предметное стекло." },
      { en: "to mix (blood types)", pos: "v", ru: "смешивать", ex: "Not all blood types can be mixed together.", exRu: "Не все группы крови можно смешивать между собой." },
      { en: "transfusion", pos: "n", ru: "переливание (крови)", ex: "He needed an emergency blood transfusion.", exRu: "Ему срочно потребовалось переливание крови." },
      { en: "to donate", pos: "v", ru: "сдавать (кровь), жертвовать", ex: "She donates blood every few months.", exRu: "Она сдаёт кровь каждые несколько месяцев." }
    ]
  },
  {
    id: 10,
    title: "Death and dying",
    titleRu: "Смерть и умирание",
    intro: "Деликатная лексика для разговора о смерти, уходе за умирающими пациентами.",
    vocab: [
      { en: "terminal (illness)", pos: "adj", ru: "неизлечимый, терминальный", ex: "She has a terminal illness and receives palliative care.", exRu: "У неё неизлечимая болезнь, и она получает паллиативную помощь." },
      { en: "fatal", pos: "adj", ru: "смертельный, со смертельным исходом", ex: "The accident caused a fatal injury.", exRu: "Авария вызвала смертельную травму." },
      { en: "to go downhill", pos: "v phrase", ru: "резко ухудшаться (о состоянии)", ex: "After the stroke, he went downhill very fast.", exRu: "После инсульта его состояние резко ухудшилось." },
      { en: "coma", pos: "n", ru: "кома", ex: "He has been in a coma for a week.", exRu: "Он уже неделю находится в коме." },
      { en: "life-support (machine)", pos: "n phrase", ru: "аппарат жизнеобеспечения", ex: "The patient is now on a life-support machine.", exRu: "Пациент сейчас подключён к аппарату жизнеобеспечения." },
      { en: "to pass away", pos: "v phrase", ru: "уйти из жизни (вежливо)", ex: "Her father passed away peacefully in his sleep.", exRu: "Её отец тихо ушёл из жизни во сне." },
      { en: "mortuary", pos: "n", ru: "морг", ex: "The porter took the body to the mortuary.", exRu: "Санитар отвёз тело в морг." },
      { en: "post-mortem", pos: "n", ru: "вскрытие, аутопсия", ex: "A post-mortem showed the cause of death.", exRu: "Вскрытие показало причину смерти." },
      { en: "cremation", pos: "n", ru: "кремация", ex: "The family chose cremation rather than burial.", exRu: "Семья выбрала кремацию, а не погребение." },
      { en: "burial", pos: "n", ru: "погребение, захоронение", ex: "The burial took place at the local cemetery.", exRu: "Захоронение состоялось на местном кладбище." },
      { en: "grief", pos: "n", ru: "горе, скорбь", ex: "The family needed support to cope with their grief.", exRu: "Семье нужна была поддержка, чтобы справиться с горем." }
    ]
  },
  {
    id: 11,
    title: "Hygiene",
    titleRu: "Гигиена",
    intro: "Инфекционный контроль, гигиена рук и борьба с устойчивыми бактериями.",
    vocab: [
      { en: "MRSA", pos: "abbr", ru: "устойчивый к метициллину золотистый стафилококк (MRSA)", ex: "MRSA is a bacterium that is resistant to many antibiotics.", exRu: "MRSA — бактерия, устойчивая ко многим антибиотикам." },
      { en: "to infect / infection", pos: "v/n", ru: "заражать / инфекция", ex: "The wound became infected after the operation.", exRu: "Рана воспалилась после операции." },
      { en: "resistant / resistance", pos: "adj/n", ru: "устойчивый / устойчивость", ex: "This bacterium is resistant to penicillin.", exRu: "Эта бактерия устойчива к пенициллину." },
      { en: "susceptible / susceptibility", pos: "adj/n", ru: "восприимчивый / восприимчивость", ex: "Children are more susceptible to this infection.", exRu: "Дети более восприимчивы к этой инфекции." },
      { en: "to disinfect / disinfectant", pos: "v/n", ru: "дезинфицировать / дезинфицирующее средство", ex: "Nurses disinfect their hands between patients.", exRu: "Медсёстры дезинфицируют руки между пациентами." },
      { en: "contamination", pos: "n", ru: "загрязнение, контаминация", ex: "The ward was closed to avoid contamination.", exRu: "Отделение закрыли, чтобы избежать заражения." },
      { en: "to isolate / isolation", pos: "v/n", ru: "изолировать / изоляция", ex: "The patient was isolated in a separate room.", exRu: "Пациента изолировали в отдельной палате." },
      { en: "hand hygiene", pos: "n phrase", ru: "гигиена рук", ex: "Good hand hygiene prevents the spread of infection.", exRu: "Хорошая гигиена рук предотвращает распространение инфекции." },
      { en: "swab", pos: "n", ru: "мазок", ex: "The nurse took a swab to test for bacteria.", exRu: "Медсестра взяла мазок для анализа на бактерии." },
      { en: "pathogen", pos: "n", ru: "патоген, возбудитель", ex: "Pathogens can spread quickly in hospitals.", exRu: "Патогены могут быстро распространяться в больницах." }
    ]
  },
  {
    id: 12,
    title: "Mental health nursing",
    titleRu: "Психиатрическая помощь",
    intro: "Лексика для описания психических расстройств и ухода за пациентами психиатрического профиля.",
    vocab: [
      { en: "mental illness", pos: "n phrase", ru: "психическое заболевание", ex: "Mental illness can affect anyone at any age.", exRu: "Психическое заболевание может возникнуть у любого человека в любом возрасте." },
      { en: "placement", pos: "n", ru: "практика, стажировка", ex: "She did her first placement on a psychiatric ward.", exRu: "Свою первую практику она проходила в психиатрическом отделении." },
      { en: "psychotic episode", pos: "n phrase", ru: "психотический эпизод", ex: "He had a psychotic episode during the group session.", exRu: "У него случился психотический эпизод во время групповой сессии." },
      { en: "anxiety", pos: "n", ru: "тревожность, тревога", ex: "Anxiety can make patients avoid leaving home.", exRu: "Тревожность может заставлять пациентов избегать выхода из дома." },
      { en: "depression", pos: "n", ru: "депрессия", ex: "Depression is a common mental health condition.", exRu: "Депрессия — распространённое психическое расстройство." },
      { en: "schizophrenia", pos: "n", ru: "шизофрения", ex: "Schizophrenia can cause a person to hear voices.", exRu: "Шизофрения может заставлять человека слышать голоса." },
      { en: "compulsive (behaviour)", pos: "adj", ru: "навязчивый (о поведении)", ex: "She washes her hands with compulsive behaviour.", exRu: "Она моет руки с навязчивым поведением." },
      { en: "to reassure", pos: "v", ru: "успокаивать, заверять", ex: "The nurse tried to reassure the frightened patient.", exRu: "Медсестра пыталась успокоить испуганного пациента." },
      { en: "relaxation (technique)", pos: "n", ru: "техника релаксации", ex: "Relaxation techniques can calm anxious patients.", exRu: "Техники релаксации могут успокоить тревожных пациентов." },
      { en: "ward round", pos: "n phrase", ru: "обход отделения", ex: "The consultant does a ward round every morning.", exRu: "Врач-консультант делает обход отделения каждое утро." }
    ]
  },
  {
    id: 13,
    title: "Monitoring the patient",
    titleRu: "Наблюдение за пациентом",
    intro: "Жизненные показатели: пульс, давление, температура, дыхание.",
    vocab: [
      { en: "vital signs", pos: "n phrase", ru: "жизненные показатели", ex: "The nurse checked the patient's vital signs.", exRu: "Медсестра проверила жизненные показатели пациента." },
      { en: "heart rate", pos: "n phrase", ru: "частота сердечных сокращений, пульс", ex: "His heart rate was 120 beats per minute.", exRu: "Его пульс составлял 120 ударов в минуту." },
      { en: "blood pressure", pos: "n phrase", ru: "артериальное давление", ex: "Her blood pressure was 150 over 90.", exRu: "Её давление было 150 на 90." },
      { en: "temperature", pos: "n", ru: "температура тела", ex: "The nurse took his temperature with a thermometer.", exRu: "Медсестра измерила ему температуру термометром." },
      { en: "respiration", pos: "n", ru: "дыхание, частота дыхания", ex: "His respiration rate was 18 breaths per minute.", exRu: "Частота его дыхания составляла 18 вдохов в минуту." },
      { en: "pulse", pos: "n", ru: "пульс", ex: "Take the patient's pulse at the wrist.", exRu: "Измерьте пульс пациента на запястье." },
      { en: "bpm (beats per minute)", pos: "abbr", ru: "ударов в минуту", ex: "A normal resting heart rate is 60-100 bpm.", exRu: "Нормальный пульс в покое — 60-100 ударов в минуту." },
      { en: "to roll up (a sleeve)", pos: "v phrase", ru: "закатать (рукав)", ex: "Could you roll up your sleeve, please?", exRu: "Не могли бы вы закатать рукав, пожалуйста?" },
      { en: "to breathe normally", pos: "v phrase", ru: "дышать нормально", ex: "Please breathe normally while I listen to your chest.", exRu: "Пожалуйста, дышите нормально, пока я слушаю вашу грудную клетку." },
      { en: "reading", pos: "n", ru: "показание (прибора)", ex: "The nurse recorded the reading in the chart.", exRu: "Медсестра записала показание в карту." }
    ]
  },
  {
    id: 14,
    title: "Medication",
    titleRu: "Медикаменты",
    intro: "Виды лекарств и формы медикаментов.",
    vocab: [
      { en: "painkiller", pos: "n", ru: "обезболивающее", ex: "She took a painkiller for her headache.", exRu: "Она приняла обезболивающее от головной боли." },
      { en: "sedative", pos: "n", ru: "седативное средство, успокоительное", ex: "A sedative makes you relaxed and sleepy.", exRu: "Седативное средство расслабляет и вызывает сонливость." },
      { en: "anti-inflammatory", pos: "n/adj", ru: "противовоспалительное", ex: "The doctor prescribed an anti-inflammatory for the swelling.", exRu: "Врач назначил противовоспалительное от отёка." },
      { en: "inoculation", pos: "n", ru: "прививка", ex: "The inoculation protects you against infectious diseases.", exRu: "Прививка защищает от инфекционных заболеваний." },
      { en: "antibiotic", pos: "n", ru: "антибиотик", ex: "Antibiotics kill bacteria and other germs.", exRu: "Антибиотики убивают бактерии и другие микробы." },
      { en: "antihistamine", pos: "n", ru: "антигистаминное средство", ex: "He takes an antihistamine to treat his allergies.", exRu: "Он принимает антигистаминное средство от аллергии." },
      { en: "stimulant", pos: "n", ru: "стимулятор", ex: "A stimulant increases activity in the body.", exRu: "Стимулятор увеличивает активность в организме." },
      { en: "antidepressant", pos: "n", ru: "антидепрессант", ex: "Antidepressants reduce feelings of extreme sadness.", exRu: "Антидепрессанты уменьшают чувство сильной грусти." },
      { en: "laxative", pos: "n", ru: "слабительное", ex: "A laxative encourages bowel movements.", exRu: "Слабительное стимулирует работу кишечника." },
      { en: "dosage", pos: "n", ru: "дозировка", ex: "Always check the correct dosage before giving medicine.", exRu: "Всегда проверяйте правильную дозировку перед приёмом лекарства." }
    ]
  },
  {
    id: 15,
    title: "Alternative treatments",
    titleRu: "Альтернативные методы лечения",
    intro: "Названия нетрадиционных методов лечения: акупунктура, рефлексология, фитотерапия и др.",
    vocab: [
      { en: "traditional Chinese medicine", pos: "n phrase", ru: "традиционная китайская медицина", ex: "Traditional Chinese medicine uses herbs to balance the body.", exRu: "Традиционная китайская медицина использует травы для баланса организма." },
      { en: "acupuncture", pos: "n", ru: "акупунктура, иглоукалывание", ex: "Acupuncture uses needles to control the energy in the body.", exRu: "Акупунктура использует иглы для управления энергией в теле." },
      { en: "music therapy", pos: "n phrase", ru: "музыкальная терапия", ex: "Music therapy helps patients control pain.", exRu: "Музыкальная терапия помогает пациентам справляться с болью." },
      { en: "cupping", pos: "n", ru: "баночный массаж (вакуумные банки)", ex: "Cupping uses heated cups to draw out toxins.", exRu: "Баночный массаж использует нагретые банки, чтобы выводить токсины." },
      { en: "reflexology", pos: "n", ru: "рефлексология", ex: "Reflexology involves massaging the hands and feet.", exRu: "Рефлексология включает массаж рук и ног." },
      { en: "faith healing", pos: "n phrase", ru: "духовное исцеление", ex: "Faith healing uses prayer to help the patient.", exRu: "Духовное исцеление использует молитву для помощи пациенту." },
      { en: "reiki", pos: "n", ru: "рейки", ex: "In reiki, the therapist's hands bring energy into the body.", exRu: "В рейки руки терапевта привносят энергию в тело." },
      { en: "hydrotherapy", pos: "n", ru: "гидротерапия", ex: "Hydrotherapy uses water to stimulate the immune system.", exRu: "Гидротерапия использует воду для стимуляции иммунной системы." },
      { en: "herbs", pos: "n", ru: "травы, лекарственные растения", ex: "Herbs have been used to heal people for centuries.", exRu: "Травы веками использовались для лечения людей." },
      { en: "sceptical", pos: "adj", ru: "скептичный", ex: "Many doctors are sceptical about alternative treatments.", exRu: "Многие врачи скептически относятся к альтернативным методам лечения." }
    ]
  }
];

if (typeof module !== "undefined") { module.exports = UNITS; }
