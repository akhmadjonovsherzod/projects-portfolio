"""Inline keyboards used in the private management chat.

Generic builders (multiselect / reorder / buyer-select / yes-cancel) are
shared between the "add new item" flow and the "edit existing item" flow.
Which flow is active is tracked by FSM state, not by the callback data
itself, so the callback_data stays short: toggle:<id>, up:<id>, down:<id>,
done, buyer:<id>, confirm, cancel.
"""
from __future__ import annotations

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from services.items import Item, Member


def main_menu_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="➕ Add New Item", callback_data="menu_add"))
    builder.row(InlineKeyboardButton(text="📋 Manage Existing Items", callback_data="menu_manage"))
    builder.row(InlineKeyboardButton(text="👥 View Members", callback_data="menu_members"))
    return builder.as_markup()


def members_view_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="➕ Add New Item", callback_data="menu_add"))
    builder.row(InlineKeyboardButton(text="📋 Manage Existing Items", callback_data="menu_manage"))
    return builder.as_markup()


def multiselect_keyboard(members: list[Member], selected_ids: set[int]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for member in members:
        mark = "☑" if member.id in selected_ids else "☐"
        builder.row(
            InlineKeyboardButton(text=f"{mark} {member.first_name}", callback_data=f"toggle:{member.id}")
        )
    builder.row(InlineKeyboardButton(text="➡️ Next", callback_data="done"))
    builder.row(InlineKeyboardButton(text="✖️ Cancel", callback_data="cancel"))
    return builder.as_markup()


def order_keyboard(ordered_members: list[Member]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for idx, member in enumerate(ordered_members, start=1):
        builder.row(
            InlineKeyboardButton(text=f"{idx}. {member.first_name}", callback_data="noop"),
            InlineKeyboardButton(text="⬆️", callback_data=f"up:{member.id}"),
            InlineKeyboardButton(text="⬇️", callback_data=f"down:{member.id}"),
        )
    builder.row(InlineKeyboardButton(text="➡️ Next", callback_data="done"))
    builder.row(InlineKeyboardButton(text="✖️ Cancel", callback_data="cancel"))
    return builder.as_markup()


def buyer_select_keyboard(ordered_members: list[Member], default_id: int | None = None) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for member in ordered_members:
        label = f"⭐ {member.first_name}" if member.id == default_id else member.first_name
        builder.row(InlineKeyboardButton(text=label, callback_data=f"buyer:{member.id}"))
    builder.row(InlineKeyboardButton(text="✖️ Cancel", callback_data="cancel"))
    return builder.as_markup()


def change_buyer_keyboard(item_id: int, members: list[Member], current_buyer_id: int | None) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for member in members:
        label = f"⭐ {member.first_name}" if member.id == current_buyer_id else member.first_name
        builder.row(InlineKeyboardButton(text=label, callback_data=f"setbuyer:{item_id}:{member.id}"))
    builder.row(InlineKeyboardButton(text="✖️ Cancel", callback_data=f"item_open:{item_id}"))
    return builder.as_markup()


def confirm_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="✅ Confirm", callback_data="confirm"),
        InlineKeyboardButton(text="✖️ Cancel", callback_data="cancel"),
    )
    return builder.as_markup()


def items_list_keyboard(items: list[Item]) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    for item in items:
        builder.row(InlineKeyboardButton(text=item.name, callback_data=f"item_open:{item.id}"))
    builder.row(InlineKeyboardButton(text="✖️ Close", callback_data="cancel"))
    return builder.as_markup()


def item_detail_keyboard(item_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="🔍 View Details", callback_data=f"item_action:view:{item_id}"))
    builder.row(InlineKeyboardButton(text="👥 Edit Participants", callback_data=f"item_action:editp:{item_id}"))
    builder.row(InlineKeyboardButton(text="🔀 Change Purchasing Order", callback_data=f"item_action:order:{item_id}"))
    builder.row(InlineKeyboardButton(text="🔁 Change Current Buyer", callback_data=f"item_action:buyer:{item_id}"))
    builder.row(InlineKeyboardButton(text="🗑️ Deactivate Item", callback_data=f"item_action:deactivate:{item_id}"))
    builder.row(InlineKeyboardButton(text="✖️ Cancel", callback_data="cancel"))
    return builder.as_markup()


def deactivate_confirm_keyboard(item_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="✅ Yes, deactivate", callback_data=f"deact_yes:{item_id}"),
        InlineKeyboardButton(text="✖️ No", callback_data=f"deact_no:{item_id}"),
    )
    return builder.as_markup()