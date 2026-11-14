# Apartment Tracker

A Telegram bot that keeps track of whose turn it is to buy shared
household items (toilet paper, soap, cleaning supplies, etc.) in a shared
apartment, and lets roommates confirm purchases and request reminders.

The bot is **multi-tenant**: it isn't tied to one configured group. Add
it to any Telegram group and that group automatically becomes its own
independent "household" — members, items, and purchasing rotations are
all scoped per-group, so the same bot deployment can serve any number of
unrelated apartments at once.

## Features

- **Works in any group** — no group ID to configure. Whoever adds the
  bot to a group, and whoever `/join`s there, can use it; each group's
  data stays completely separate from every other group's.
- **Member registration** via `/join` in a group, validated against
  actual group membership.
- **Item management** through a conversational private chat menu: add
  items, pick participants, set the purchasing order and initial buyer,
  edit participants/order/buyer later, and deactivate items.
- **Group commands**: `/status`, `/items`, `/who`, `/notify <item>`.
- **Reminders** (inline button or `/notify`) that ping the current buyer
  without touching the rotation or purchase history.
- **Purchase confirmation** via an inline `✅ I've bought it` button,
  restricted server-side to the actual current buyer and applied as one
  atomic database transaction so double-clicks or stale buttons can never
  advance the rotation twice.
- Every item has its own independent purchasing rotation, stored in
  SQLite and surviving restarts.

## Project structure

```
apartment-tracker/
├── bot.py                  # Entry point: bot/dispatcher setup, polling
├── config.py                # Env var loading/validation
├── database.py               # SQLite schema, connection, transactions
├── handlers/
│   ├── group.py              # /start, /help, /status, /items, /who, /notify
│   ├── private.py            # Private management menu + FSM flows
│   ├── registration.py       # /start (private) + /join (any group)
│   └── callbacks.py          # Group inline buttons: notify / confirm purchase
├── services/
│   ├── rotation.py           # Rotation logic + atomic purchase confirmation
│   ├── items.py               # Household/member/item CRUD
│   └── notifications.py       # Group message formatting + sending
├── keyboards/
│   ├── group.py               # /status inline keyboard
│   └── private.py             # Management menu keyboards
├── database/tracker.db        # SQLite file (created on first run)
├── requirements.txt
├── .env.example
└── .gitignore
```

## Installation

1. **Python 3.11+** is required.
2. Create a virtual environment and install dependencies:

   ```bash
   cd apartment-tracker
   python3 -m venv .venv
   source .venv/bin/activate        # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

## Creating the bot with BotFather

1. Open a chat with [@BotFather](https://t.me/BotFather) on Telegram.
2. Send `/newbot` and follow the prompts (choose a name and a username
   ending in `bot`).
3. BotFather will give you a token like
   `123456789:AAExampleTokenDoNotShare`. Keep it secret.
4. (Optional but recommended) send `/setprivacy` to BotFather, select
   your bot, and choose **Disable** so the bot can see commands sent in
   groups. Since all interactions are command- or button-based, this
   isn't strictly required, but it makes `/join`, `/status`, etc. more
   reliable in larger groups.

## Configuration

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

```
BOT_TOKEN=123456789:AAExampleTokenDoNotShare
DATABASE_PATH=database/tracker.db
```

- `BOT_TOKEN` — from BotFather. Never commit this file or share the token.
- `DATABASE_PATH` — where the SQLite file lives (created automatically).
- There's no `GROUP_CHAT_ID` to set — the bot works in every group it's
  added to.

## Running the bot

```bash
source .venv/bin/activate
python bot.py
```

The bot starts polling Telegram for updates. Leave it running (use
`tmux`, `screen`, a systemd service, or similar for continuous operation
on a server).

## Using it for your apartment

1. Add the bot to your apartment's Telegram group (as you would any
   bot) — nothing else to configure. The group becomes its own household
   automatically the first time someone interacts with the bot there.
2. Each roommate sends `/join` **in that group** to register. The bot
   verifies they're actually a member of the group before registering
   them.
3. Each roommate also opens a **private chat** with the bot and sends
   `/start` to open the management menu (➕ Add New Item,
   📋 Manage Existing Items, 👥 View Members).

Any other group that adds the same bot gets its own, completely
separate set of members, items, and rotations — nothing is shared
between groups.

## Everyday usage

**In the group:**
- `/status` — full status with "Notify buyer" / "I've bought it" buttons.
- `/items` — list of active items.
- `/who` — concise current-buyer list.
- `/notify <item>` — e.g. `/notify toilet paper`.

**In private chat:**
- Add a new item: name → select ≥2 participants → set order → pick
  initial buyer → confirm.
- Manage an existing item: view details, edit participants, change
  order, change current buyer, or deactivate it (purchase history is
  kept).

## Implementation notes & decisions

- **One household per user.** A registered Telegram user belongs to
  exactly one group's household (whichever group they first `/join`ed
  in). This keeps the private-chat menu unambiguous — no household
  switcher is needed. If someone needs to move apartments, that's a
  manual DB change in this MVP.
- **Initial participant order** for a new item defaults to the
  household's registration order (simplest sensible default); it can be
  rearranged with ⬆️/⬇️ before confirming.
- **If the current buyer is removed** from an item's participants (via
  "Edit Participants"), the first participant in the *new* order
  automatically becomes the current buyer.
- **Reordering** an item's participants never changes who the current
  buyer is, as long as they're still a participant.
- **Outdated/double-pressed confirmation buttons**: the confirm handler
  re-reads the current buyer from the database inside an atomic
  transaction before accepting the press, so a second press (by the
  person who just bought it) is simply rejected as "not your turn" —
  no separate token/versioning scheme was needed.
- FSM conversation state (for the multi-step "add item" / "edit
  participants" / "change order" flows) is kept in memory
  (`MemoryStorage`). It resets if the bot restarts mid-conversation, but
  all committed data (members, items, rotations, purchase history) is
  persisted in SQLite and survives restarts.

## Known limitations (MVP v1.0)

- One household per Telegram user (see above) — a person can't be an
  active member of two different apartment groups at once.
- No scheduled/automatic recurring reminders — reminders are manual
  (`/notify` or the inline button).
- No reactivation of deactivated items.
- No separate "admin" role — any registered member can manage any item
  in their own household.
- Conversational (multi-step) state does not survive a bot restart mid-flow.
