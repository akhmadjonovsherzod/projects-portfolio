"""Commands available in any apartment group chat the bot is added to.

The bot is multi-tenant: every group is its own independent household,
looked up (and auto-created) by that group's own Telegram chat ID via
`services.items.get_or_create_household`. There's no single configured
group - whichever group the bot is added to, and whoever /join's there,
can use it.
"""
from __future__ import annotations

from html import escape

from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import Message

from database import Database
from keyboards.group import status_keyboard
from services import items as items_service
from services import rotation
from services.notifications import send_reminder

router = Router(name="group")
router.message.filter(F.chat.type.in_({"group", "supergroup"}))

HELP_TEXT = (
    "<b>Apartment Tracker — Commands</b>\n\n"
    "/join — register yourself as a household member\n"
    "/status — show all items and their current buyers\n"
    "/items — list all registered items\n"
    "/who — show whose turn it is for each item\n"
    "/notify &lt;item&gt; — remind the current buyer about an item\n"
    "/help — show this message"
)


def _display_name(person) -> str:
    return f"@{person.username}" if person.username else person.first_name


async def _household_id(db: Database, message: Message) -> int:
    return await items_service.get_or_create_household(
        db, message.chat.id, message.chat.title or "Apartment"
    )


@router.message(CommandStart())
async def start_group(message: Message) -> None:
    await message.answer(
        "👋 <b>Apartment Tracker</b> is here to help track shared household "
        "purchases.\n\nTo register, send /join in this group. Then open a "
        "private chat with me to add and manage items.\n\n" + HELP_TEXT,
        parse_mode="HTML",
    )


@router.message(Command("help"))
async def help_cmd(message: Message) -> None:
    await message.answer(HELP_TEXT, parse_mode="HTML")


async def _build_status_text(db: Database, household_id: int) -> tuple[str, list[items_service.Item]]:
    active_items = await items_service.get_active_items(db, household_id)
    if not active_items:
        return (
            "<b>Apartment Tracker — Current Status</b>\n\n"
            "No items are registered yet. Open a private chat with me and "
            "use <b>➕ Add New Item</b> to add the first one.",
            [],
        )

    lines = ["<b>Apartment Tracker — Current Status</b>", ""]
    for item in active_items:
        participants = await rotation.get_participants(db, item.id)
        current = next((p for p in participants if p.member_id == item.current_buyer_id), None)
        upcoming = rotation.rotation_order_from(participants, item.current_buyer_id)
        lines.append(f"📦 <b>{escape(item.name)}</b>")
        if current is not None:
            lines.append(f"Current buyer: {_display_name(current)}")
        else:
            lines.append("Current buyer: (none set)")
        if upcoming:
            lines.append("Next: " + " → ".join(_display_name(p) for p in upcoming))
        lines.append("")

    return "\n".join(lines).rstrip(), active_items


@router.message(Command("status"))
async def status_cmd(message: Message, db: Database) -> None:
    household_id = await _household_id(db, message)
    text, active_items = await _build_status_text(db, household_id)
    markup = status_keyboard(active_items) if active_items else None
    await message.answer(text, parse_mode="HTML", reply_markup=markup)


@router.message(Command("items"))
async def items_cmd(message: Message, db: Database) -> None:
    household_id = await _household_id(db, message)
    active_items = await items_service.get_active_items(db, household_id)
    if not active_items:
        await message.answer(
            "No items are registered yet. Open a private chat with me and "
            "use ➕ Add New Item to add the first one."
        )
        return
    lines = ["<b>Registered Household Items</b>", ""]
    lines += [f"📦 {escape(item.name)}" for item in active_items]
    await message.answer("\n".join(lines), parse_mode="HTML")


@router.message(Command("who"))
async def who_cmd(message: Message, db: Database) -> None:
    household_id = await _household_id(db, message)
    active_items = await items_service.get_active_items(db, household_id)
    if not active_items:
        await message.answer(
            "No items are registered yet. Open a private chat with me and "
            "use ➕ Add New Item to add the first one."
        )
        return
    lines = ["<b>Whose Turn Is It?</b>", ""]
    for item in active_items:
        participants = await rotation.get_participants(db, item.id)
        current = next((p for p in participants if p.member_id == item.current_buyer_id), None)
        who = _display_name(current) if current else "(none set)"
        lines.append(f"📦 {escape(item.name)}: {who}")
    await message.answer("\n".join(lines), parse_mode="HTML")


@router.message(Command("notify"))
async def notify_cmd(message: Message, db: Database) -> None:
    household_id = await _household_id(db, message)

    requester = await items_service.get_member_by_telegram_id(db, message.from_user.id)
    if requester is None or requester.household_id != household_id:
        await message.reply("⚠️ You need to /join this group first before requesting reminders.")
        return

    args = message.text.split(maxsplit=1)
    item_name = args[1].strip() if len(args) > 1 else ""
    if not item_name:
        await message.reply("Usage: /notify <item name>\nExample: /notify toilet paper")
        return

    item = await items_service.get_active_item_by_name(db, household_id, item_name)
    if item is None:
        active_items = await items_service.get_active_items(db, household_id)
        if active_items:
            available = "\n".join(f"• {i.name}" for i in active_items)
            await message.reply(
                f"⚠️ Couldn't find an item called \"{escape(item_name)}\".\n\n"
                f"Available items:\n{available}",
                parse_mode="HTML",
            )
        else:
            await message.reply("⚠️ No items are registered yet.")
        return

    participants = await rotation.get_participants(db, item.id)
    buyer = next((p for p in participants if p.member_id == item.current_buyer_id), None)
    if buyer is None:
        await message.reply(f"⚠️ \"{escape(item.name)}\" doesn't have a current buyer set.", parse_mode="HTML")
        return

    await send_reminder(message.bot, message.chat.id, item.name, buyer, requester)
