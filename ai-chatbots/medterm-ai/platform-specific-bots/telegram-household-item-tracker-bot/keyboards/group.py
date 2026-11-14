"""Inline keyboards used in the apartment group chat."""
from __future__ import annotations

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from services.items import Item


def status_keyboard(items: list[Item]) -> InlineKeyboardMarkup:
    """One 'Notify buyer' + 'I've bought it' row per active item.

    Callback data identifies the item by its database ID, never by name.
    """
    builder = InlineKeyboardBuilder()
    for item in items:
        builder.row(
            InlineKeyboardButton(text=f"🔔 Notify: {item.name}", callback_data=f"notify:{item.id}"),
        )
        builder.row(
            InlineKeyboardButton(text=f"✅ I've bought: {item.name}", callback_data=f"confirm:{item.id}"),
        )
    return builder.as_markup()
