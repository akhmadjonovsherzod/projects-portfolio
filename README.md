# Nursing English — учебный сайт

Простой сайт для изучения английского языка для медсестёр (Pre-Intermediate,
на основе юнитов учебника *Oxford English for Careers: Nursing 1*): 15 юнитов
со словарём, оригинальными интерактивными упражнениями и AI-репетитором на
базе Google Gemini.

Стек: чистый HTML / CSS / JavaScript (без фреймворков), Firebase Authentication,
Google Gemini API через прокси-сервер на Cloudflare Worker.

## Структура проекта

```
nursing-app/
├── index.html              # вход / регистрация
├── app.html                 # юниты, словарь, упражнения, AI-чат
├── profile.html              # профиль пользователя
├── css/style.css
├── js/
│   ├── firebase-config.example.js   # скопируйте в firebase-config.js и заполните
│   ├── auth.js               # вход/регистрация/выход через Firebase
│   ├── theme.js               # светлая/тёмная тема + RU/EN переключатель интерфейса
│   ├── units-data.js           # данные 15 юнитов (словарь, примеры, перевод)
│   ├── exercises.js            # генерация упражнений из словаря юнита
│   ├── chatbot.js             # обращения к Cloudflare Worker (AI-репетитор)
│   └── app.js                # рендеринг интерфейса обучения
└── worker/
    ├── worker.js               # Cloudflare Worker — прокси к Gemini API
    └── wrangler.toml
```

## 1. Настройка Firebase (регистрация и вход)

1. Создайте проект на https://console.firebase.google.com
2. В разделе **Authentication → Sign-in method** включите **Email/Password**.
3. В **Project settings → General → Your apps** добавьте веб-приложение и
   скопируйте объект конфигурации.
4. Скопируйте `js/firebase-config.example.js` в `js/firebase-config.js` и
   вставьте туда свои значения:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

`js/firebase-config.js` не должен попадать в публичный репозиторий с реальными
ключами, если вы не хотите, чтобы их видели другие (ключи Firebase Web API не
секретны сами по себе, но ограничьте домены в настройках Firebase).

## 2. Настройка Cloudflare Worker (AI-репетитор на Gemini)

Ключ Gemini API **никогда** не хранится в коде сайта — только в Cloudflare
Worker как секрет.

1. Получите ключ Gemini API на https://aistudio.google.com/app/apikey
2. Установите Wrangler (CLI Cloudflare): `npm install -g wrangler`
3. Перейдите в папку `worker/` и залогиньтесь: `wrangler login`
4. Задайте секрет:
   ```
   wrangler secret put GEMINI_API_KEY
   ```
   (вставьте свой ключ, когда попросят)
5. Разверните воркер:
   ```
   wrangler deploy
   ```
6. Скопируйте URL вида `https://nursing-english-chatbot.<ваш-поддомен>.workers.dev`
   и вставьте его в `js/firebase-config.js`:
   ```js
   const WORKER_URL = "https://nursing-english-chatbot.xxxx.workers.dev";
   ```

Если `WORKER_URL` не настроен, чат-бот покажет понятное сообщение об ошибке
вместо падения сайта.

## 3. Запуск сайта локально

Так как сайт не использует сборщики, достаточно любого локального статического
сервера (прямое открытие `index.html` через `file://` может не работать из-за
CORS-ограничений Firebase):

```bash
# Python
python3 -m http.server 8080

# или Node (npx)
npx serve .
```

Откройте `http://localhost:8080` в браузере.

## 4. Деплой

Папку сайта можно развернуть на любом статическом хостинге (Firebase Hosting,
Netlify, Vercel, GitHub Pages и т.д.) — она не требует серверной части, кроме
уже отдельно развёрнутого Cloudflare Worker.

## Возможности сайта

- Регистрация и вход по email/паролю (Firebase Authentication).
- 15 юнитов, соответствующих структуре учебника: названия, порядок и тематика
  юнитов сохранены.
- Для каждого юнита — подборка лексики (10-14 единиц) с переводом на русский,
  частью речи, оригинальным примером на английском и его переводом.
- Пять типов оригинальных автоматически проверяемых упражнений на юнит:
  выбор перевода EN→RU, выбор слова RU→EN, заполнение пропуска, сопоставление
  пар, выбор подходящей фразы в диалоге. Показывается счёт по мере ответов.
- Кнопка **"Резюме юнита"** — Gemini создаёт краткое резюме юнита на русском.
- AI-чат — объясняет слова и грамматику преимущественно на русском,
  с учётом текущего юнита.
- Переключатель языка интерфейса RU/EN и переключатель светлой/тёмной темы.
- Профиль пользователя (имя, email, фото), выход из аккаунта.
- Все страницы обучения и профиля защищены — неавторизованные пользователи
  перенаправляются на страницу входа.

## Примечание о содержании

Структура юнитов (названия, порядок, 15 юнитов) взята из содержания учебника
*Oxford English for Careers: Nursing 1*. Лексика, примеры предложений,
переводы и все упражнения написаны заново для этого сайта и не являются
копией текста учебника.
# Learning content update

This version keeps the original 15-unit application structure and adds `js/learning-data.js` for unit language notes, original phrase examples, added vocabulary and the separate 15-text Reading Bank. The extension records printed textbook page references; Reading Bank summaries and review questions are original paraphrases and exercises.

Unit tabs now include vocabulary search and part-of-speech filtering, language/communication notes, expanded interactive practice, and the independent Reading Bank selector. Chat and unit summary requests send the structured unit data to the existing Cloudflare Worker. The Gemini key remains a Worker secret.

To run the site, configure Firebase using the existing setup instructions and serve `app.html` over HTTP. Configure `WORKER_URL` as described below to enable Gemini. Authentication and Gemini were not live-tested as they require the owner's external credentials and deployed Worker.
