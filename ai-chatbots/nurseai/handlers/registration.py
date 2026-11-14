"""Member registration: /start in private chat, /join in a group.

The bot is multi-tenant: any Telegram group it's added to can use it.
The group that /join is sent in becomes (or already is) that group's
household, via `services.items.get_or_create_household`, keyed on the
group's own chat ID - there's no single configured "the" group.
"""
from __future__ import annotations

import logging

from aiogram import F, Router
from aiogram.exceptions import TelegramAPIError
from aiogram.filters import Command, CommandStart
from aiogram.types import Message

from database import Database
from keyboards.private import main_menu_keyboard
from services import items as items_service
from services.notifications import send_registration_confirmation

logger = logging.getLogger(__name__)

router = Router(name="registration")


@router.message(CommandStart(), F.chat.type == "private")
async def start_private(message: Message, db: Database) -> None:
    member = await items_service.get_member_by_telegram_id(db, message.from_user.id)
    if member is not None:
        await message.answer(
            "👋 Welcome back! You're registered as a household member.\n\n"
            "<b>Apartment Tracker — Management</b>",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )
        return

    await message.answer(
        "👋 <b>Welcome to Apartment Tracker!</b>\n\n"
        "This bot keeps track of whose turn it is to buy shared household "
        "items (toilet paper, soap, cleaning supplies, etc.).\n\n"
        "To get started:\n"
        "1. Make sure the bot has been added to your apartment's Telegram group.\n"
        "2. Open that group and send /join there.\n"
        "3. Once registered, come back here and send /start again to manage items.",
        parse_mode="HTML",
    )


@router.message(Command("join"), F.chat.type.in_({"group", "supergroup"}))
async def join_group(message: Message, db: Database) -> None:
    user = message.from_user
    group_chat_id = message.chat.id

    existing = await items_service.get_member_by_telegram_id(db, user.id)
    if existing is not None:
        await message.reply("✅ You're already registered as a household member.")
        return

    # Defensively confirm the sender is actually a member of this chat
    # (guards against odd edge cases like forwarded/anonymous-admin messages).
    try:
        chat_member = await message.bot.get_chat_member(group_chat_id, user.id)
        if chat_member.status in ("left", "kicked"):
            await message.reply("⚠️ You must be a member of this group to register.")
            return
    except TelegramAPIError:
        logger.exception("Failed to verify group membership for user %s", user.id)
        await message.reply("⚠️ Couldn't verify your group membership right now. Please try again.")
        return

    household_id = await items_service.get_or_create_household(
        db, group_chat_id, message.chat.title or "Apartment"
    )

    try:
        member = await items_service.register_member(
            db,
            household_id=household_id,
            telegram_user_id=user.id,
            username=user.username,
            first_name=user.first_name or "there",
            last_name=user.last_name,
        )
    except items_service.ItemError:
        await message.reply("✅ You're already registered as a household member.")
        return

    await send_registration_confirmation(message.bot, group_chat_id, member)
