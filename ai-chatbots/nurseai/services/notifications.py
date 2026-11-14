"""Formatting and sending of group-chat notifications.

Messages use HTML parse mode. Members are mentioned via a `tg://user?id=`
link so they're pingable even if they have no @username set.
"""
from __future__ import annotations

from html import escape
from typing import Any

from aiogram import Bot


def mention_html(person: Any) -> str:
    """Build an HTML mention for anything with telegram_user_id/first_name."""
    name = escape(person.first_name)
    return f'<a href="tg://user?id={person.telegram_user_id}">{name}</a>'


async def send_reminder(
    bot: Bot,
    group_chat_id: int,
    item_name: str,
    buyer: Any,
    requester: Any,
) -> None:
    text = (
        "🛎️ <b>Purchase Reminder</b>\n\n"
        f"{mention_html(buyer)}, {escape(item_name)} needs to be purchased!\n\n"
        "You are currently responsible for this item.\n\n"
        f"Reminder requested by {mention_html(requester)}."
    )
    await bot.send_message(group_chat_id, text, parse_mode="HTML")


async def send_purchase_confirmation(
    bot: Bot,
    group_chat_id: int,
    item_name: str,
    old_buyer: Any,
    new_buyer: Any,
) -> None:
    text = (
        "✅ <b>Purchase Confirmed</b>\n\n"
        f"{mention_html(old_buyer)} has purchased {escape(item_name)}.\n\n"
        f"Next responsible person: {mention_html(new_buyer)}.\n\n"
        "The purchasing rotation has been updated."
    )
    await bot.send_message(group_chat_id, text, parse_mode="HTML")


async def send_registration_confirmation(bot: Bot, group_chat_id: int, member: Any) -> None:
    text = f"✅ {mention_html(member)} has been registered as a household member."
    await bot.send_message(group_chat_id, text, parse_mode="HTML")
