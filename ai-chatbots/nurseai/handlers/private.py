"""Private chat: management menu, item creation, and item editing.

Multi-step flows (add item, edit participants, change order) are modeled
as aiogram FSM states. Single-step actions (change buyer, deactivate,
view members) are handled directly from callback data without any FSM
state.
"""
from __future__ import annotations

from html import escape
from typing import Optional

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from database import Database
from keyboards.private import (
    change_buyer_keyboard,
    confirm_keyboard,
    deactivate_confirm_keyboard,
    item_detail_keyboard,
    items_list_keyboard,
    main_menu_keyboard,
    members_view_keyboard,
    multiselect_keyboard,
    order_keyboard,
    buyer_select_keyboard,
)
from services import items as items_service
from services import rotation

router = Router(name="private")
router.message.filter(F.chat.type == "private")
router.callback_query.filter(F.message.chat.type == "private")


class AddItem(StatesGroup):
    waiting_name = State()
    selecting_participants = State()
    ordering_participants = State()
    selecting_buyer = State()
    confirming = State()


class EditParticipants(StatesGroup):
    selecting = State()


class EditOrder(StatesGroup):
    ordering = State()


# ------------------------------------------------------------------ helpers

async def _member_or_none(message_or_cb, db: Database) -> Optional[items_service.Member]:
    user_id = message_or_cb.from_user.id
    return await items_service.get_member_by_telegram_id(db, user_id)


NOT_REGISTERED_TEXT = (
    "⚠️ You need to register first. Join the apartment group's chat and "
    "send /join there, then come back and send /start here."
)


def _display_name(member: items_service.Member) -> str:
    return f"@{member.username}" if member.username else member.first_name


# -------------------------------------------------------------------- menu

@router.callback_query(F.data == "menu_add")
async def menu_add(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    await state.clear()
    await state.set_state(AddItem.waiting_name)
    await callback.message.edit_text("What's the name of the new item? (e.g. Toilet Paper)")
    await callback.answer()


@router.callback_query(F.data == "menu_manage")
async def menu_manage(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    await state.clear()
    active_items = await items_service.get_active_items(db, member.household_id)
    if not active_items:
        await callback.message.edit_text(
            "No items are registered yet. Use ➕ Add New Item from the main menu.",
            reply_markup=main_menu_keyboard(),
        )
        await callback.answer()
        return
    await callback.message.edit_text("📋 Select an item to manage:", reply_markup=items_list_keyboard(active_items))
    await callback.answer()


@router.callback_query(F.data == "menu_members")
async def menu_members(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    await state.clear()
    members = await items_service.get_household_members(db, member.household_id)
    lines = ["<b>👥 Household Members</b>", ""]
    for m in members:
        handle = f" (@{escape(m.username)})" if m.username else ""
        lines.append(f"• {escape(m.first_name)}{handle}")
    await callback.message.edit_text("\n".join(lines), parse_mode="HTML", reply_markup=members_view_keyboard())
    await callback.answer()


@router.callback_query(StateFilter(None), F.data == "cancel")
async def close_menu(callback: CallbackQuery) -> None:
    await callback.message.edit_text("Closed.", reply_markup=main_menu_keyboard())
    await callback.answer()


# -------------------------------------------------------------- add item

@router.message(AddItem.waiting_name)
async def add_item_name(message: Message, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(message, db)
    if member is None:
        await state.clear()
        await message.answer(NOT_REGISTERED_TEXT)
        return

    name = (message.text or "").strip()
    if not name:
        await message.answer("Please send a text name for the item.")
        return

    household_members = await items_service.get_household_members(db, member.household_id)
    if len(household_members) < 2:
        await state.clear()
        await message.answer(
            "⚠️ At least two registered household members are needed before "
            "you can add a shared item. Have your roommates /join the group first."
        )
        return

    await state.update_data(name=name, selected=[])
    await state.set_state(AddItem.selecting_participants)
    await message.answer(
        f"<b>{escape(name)}</b>\nSelect at least two participants for this item's rotation:",
        parse_mode="HTML",
        reply_markup=multiselect_keyboard(household_members, set()),
    )


@router.callback_query(AddItem.selecting_participants, F.data.startswith("toggle:"))
async def add_item_toggle(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    member_id = int(callback.data.split(":", 1)[1])
    data = await state.get_data()
    selected: list[int] = data.get("selected", [])
    if member_id in selected:
        selected.remove(member_id)
    else:
        selected.append(member_id)
    await state.update_data(selected=selected)

    household_members = await items_service.get_household_members(db, member.household_id)
    await callback.message.edit_reply_markup(reply_markup=multiselect_keyboard(household_members, set(selected)))
    await callback.answer()


@router.callback_query(AddItem.selecting_participants, F.data == "done")
async def add_item_participants_done(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    data = await state.get_data()
    selected: list[int] = data.get("selected", [])
    if len(selected) < items_service.MIN_PARTICIPANTS:
        await callback.answer("Select at least two participants.", show_alert=True)
        return

    # Initial order follows registration order, as the simplest sensible default.
    household_members = await items_service.get_household_members(db, member.household_id)
    order = [m.id for m in household_members if m.id in selected]
    await state.update_data(order=order)
    await state.set_state(AddItem.ordering_participants)

    ordered_members = [m for m in household_members if m.id in order]
    await callback.message.edit_text(
        "Set the purchasing order (use ⬆️/⬇️ to rearrange):",
        reply_markup=order_keyboard(ordered_members),
    )
    await callback.answer()


async def _reorder(order: list[int], member_id: int, direction: int) -> list[int]:
    idx = order.index(member_id)
    new_idx = idx + direction
    if 0 <= new_idx < len(order):
        order[idx], order[new_idx] = order[new_idx], order[idx]
    return order


@router.callback_query(AddItem.ordering_participants, F.data.startswith("up:"))
async def add_item_order_up(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    await _handle_reorder(callback, state, db, direction=-1)


@router.callback_query(AddItem.ordering_participants, F.data.startswith("down:"))
async def add_item_order_down(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    await _handle_reorder(callback, state, db, direction=1)


async def _handle_reorder(callback: CallbackQuery, state: FSMContext, db: Database, direction: int) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    member_id = int(callback.data.split(":", 1)[1])
    data = await state.get_data()
    order: list[int] = data.get("order", [])
    order = await _reorder(order, member_id, direction)
    await state.update_data(order=order)

    members_by_id = {m.id: m for m in await items_service.get_household_members(db, member.household_id)}
    ordered_members = [members_by_id[mid] for mid in order]
    await callback.message.edit_reply_markup(reply_markup=order_keyboard(ordered_members))
    await callback.answer()


@router.callback_query(AddItem.ordering_participants, F.data == "done")
async def add_item_order_done(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    data = await state.get_data()
    order: list[int] = data.get("order", [])
    await state.set_state(AddItem.selecting_buyer)

    members_by_id = {m.id: m for m in await items_service.get_household_members(db, member.household_id)}
    ordered_members = [members_by_id[mid] for mid in order]
    await callback.message.edit_text(
        "Who is the initial buyer? (⭐ = default, the first in the order)",
        reply_markup=buyer_select_keyboard(ordered_members, default_id=order[0]),
    )
    await callback.answer()


@router.callback_query(AddItem.selecting_buyer, F.data.startswith("buyer:"))
async def add_item_select_buyer(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    buyer_id = int(callback.data.split(":", 1)[1])
    data = await state.get_data()
    order: list[int] = data.get("order", [])
    name: str = data.get("name", "")
    await state.update_data(buyer_id=buyer_id)
    await state.set_state(AddItem.confirming)

    members_by_id = {m.id: m for m in await items_service.get_household_members(db, member.household_id)}
    participant_lines = "\n".join(f"{i}. {escape(members_by_id[mid].first_name)}" for i, mid in enumerate(order, start=1))
    buyer_name = escape(members_by_id[buyer_id].first_name)
    text = (
        "<b>New Item Configuration</b>\n\n"
        f"Item: {escape(name)}\n\n"
        f"Participants:\n{participant_lines}\n\n"
        f"Initial buyer: {buyer_name}"
    )
    await callback.message.edit_text(text, parse_mode="HTML", reply_markup=confirm_keyboard())
    await callback.answer()


@router.callback_query(AddItem.confirming, F.data == "confirm")
async def add_item_confirm(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    data = await state.get_data()
    try:
        await items_service.create_item(
            db,
            household_id=member.household_id,
            name=data.get("name", ""),
            ordered_member_ids=data.get("order", []),
            initial_buyer_id=data.get("buyer_id"),
        )
    except items_service.ItemError:
        await callback.message.edit_text("⚠️ Couldn't create the item. Please try again.", reply_markup=main_menu_keyboard())
        await state.clear()
        await callback.answer()
        return

    await state.clear()
    await callback.message.edit_text(
        f"✅ \"{escape(data.get('name', ''))}\" has been added! Announce it in the group with /status.",
        parse_mode="HTML",
        reply_markup=main_menu_keyboard(),
    )
    await callback.answer()


@router.callback_query(AddItem.selecting_participants, F.data == "cancel")
@router.callback_query(AddItem.ordering_participants, F.data == "cancel")
@router.callback_query(AddItem.selecting_buyer, F.data == "cancel")
@router.callback_query(AddItem.confirming, F.data == "cancel")
@router.callback_query(EditParticipants.selecting, F.data == "cancel")
@router.callback_query(EditOrder.ordering, F.data == "cancel")
async def cancel_flow(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await callback.message.edit_text("Cancelled.", reply_markup=main_menu_keyboard())
    await callback.answer()


# -------------------------------------------------------------- manage items

@router.callback_query(F.data.startswith("item_open:"))
async def item_open(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    await state.clear()
    item_id = int(callback.data.split(":", 1)[1])
    item = await items_service.get_item(db, item_id)
    if item is None or not item.is_active or item.household_id != member.household_id:
        await callback.answer("This item is no longer available.", show_alert=True)
        return
    await callback.message.edit_text(f"📦 <b>{escape(item.name)}</b>\nWhat would you like to do?", parse_mode="HTML", reply_markup=item_detail_keyboard(item.id))
    await callback.answer()


@router.callback_query(F.data.startswith("item_action:view:"))
async def item_view(callback: CallbackQuery, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    item_id = int(callback.data.split(":")[2])
    item = await items_service.get_item(db, item_id)
    if item is None:
        await callback.answer("This item no longer exists.", show_alert=True)
        return
    participants = await rotation.get_participants(db, item_id)
    current = next((p for p in participants if p.member_id == item.current_buyer_id), None)
    lines = [f"📦 <b>{escape(item.name)}</b>", ""]
    lines.append("Participants (purchasing order):")
    for i, p in enumerate(participants, start=1):
        marker = " ⭐ (current buyer)" if current and p.member_id == current.member_id else ""
        lines.append(f"{i}. {escape(p.first_name)}{marker}")
    await callback.message.edit_text("\n".join(lines), parse_mode="HTML", reply_markup=item_detail_keyboard(item_id))
    await callback.answer()


@router.callback_query(F.data.startswith("item_action:editp:"))
async def item_edit_participants(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    item_id = int(callback.data.split(":")[2])
    participants = await rotation.get_participants(db, item_id)
    selected = [p.member_id for p in participants]
    await state.set_state(EditParticipants.selecting)
    await state.update_data(item_id=item_id, selected=selected)

    household_members = await items_service.get_household_members(db, member.household_id)
    await callback.message.edit_text(
        "Select participants for this item (at least two):",
        reply_markup=multiselect_keyboard(household_members, set(selected)),
    )
    await callback.answer()


@router.callback_query(EditParticipants.selecting, F.data.startswith("toggle:"))
async def edit_participants_toggle(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    member_id = int(callback.data.split(":", 1)[1])
    data = await state.get_data()
    selected: list[int] = data.get("selected", [])
    if member_id in selected:
        selected.remove(member_id)
    else:
        selected.append(member_id)
    await state.update_data(selected=selected)

    household_members = await items_service.get_household_members(db, member.household_id)
    await callback.message.edit_reply_markup(reply_markup=multiselect_keyboard(household_members, set(selected)))
    await callback.answer()


@router.callback_query(EditParticipants.selecting, F.data == "done")
async def edit_participants_done(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    data = await state.get_data()
    selected: list[int] = data.get("selected", [])
    item_id: int = data.get("item_id")
    if len(selected) < items_service.MIN_PARTICIPANTS:
        await callback.answer("Select at least two participants.", show_alert=True)
        return

    household_members = await items_service.get_household_members(db, member.household_id)
    order = [m.id for m in household_members if m.id in selected]
    try:
        await items_service.set_participants(db, item_id, order)
    except items_service.ItemError:
        await callback.answer("Couldn't update participants.", show_alert=True)
        return

    await state.clear()
    item = await items_service.get_item(db, item_id)
    await callback.message.edit_text(
        f"✅ Participants updated for \"{escape(item.name)}\".", parse_mode="HTML",
        reply_markup=item_detail_keyboard(item_id),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("item_action:order:"))
async def item_change_order(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    item_id = int(callback.data.split(":")[2])
    participants = await rotation.get_participants(db, item_id)
    order = [p.member_id for p in participants]
    await state.set_state(EditOrder.ordering)
    await state.update_data(item_id=item_id, order=order)

    members_by_id = {m.id: m for m in await items_service.get_household_members(db, member.household_id)}
    ordered_members = [members_by_id[mid] for mid in order]
    await callback.message.edit_text(
        "Rearrange the purchasing order (use ⬆️/⬇️):", reply_markup=order_keyboard(ordered_members)
    )
    await callback.answer()


@router.callback_query(EditOrder.ordering, F.data.startswith("up:"))
async def edit_order_up(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    await _handle_edit_reorder(callback, state, db, direction=-1)


@router.callback_query(EditOrder.ordering, F.data.startswith("down:"))
async def edit_order_down(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    await _handle_edit_reorder(callback, state, db, direction=1)


async def _handle_edit_reorder(callback: CallbackQuery, state: FSMContext, db: Database, direction: int) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    member_id = int(callback.data.split(":", 1)[1])
    data = await state.get_data()
    order: list[int] = data.get("order", [])
    order = await _reorder(order, member_id, direction)
    await state.update_data(order=order)

    members_by_id = {m.id: m for m in await items_service.get_household_members(db, member.household_id)}
    ordered_members = [members_by_id[mid] for mid in order]
    await callback.message.edit_reply_markup(reply_markup=order_keyboard(ordered_members))
    await callback.answer()


@router.callback_query(EditOrder.ordering, F.data == "done")
async def edit_order_done(callback: CallbackQuery, state: FSMContext, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    data = await state.get_data()
    item_id: int = data.get("item_id")
    order: list[int] = data.get("order", [])
    try:
        await items_service.set_participants(db, item_id, order)
    except items_service.ItemError:
        await callback.answer("Couldn't update the order.", show_alert=True)
        return
    await state.clear()
    item = await items_service.get_item(db, item_id)
    await callback.message.edit_text(
        f"✅ Purchasing order updated for \"{escape(item.name)}\".", parse_mode="HTML",
        reply_markup=item_detail_keyboard(item_id),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("item_action:buyer:"))
async def item_change_buyer(callback: CallbackQuery, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    item_id = int(callback.data.split(":")[2])
    item = await items_service.get_item(db, item_id)
    participants = await rotation.get_participants(db, item_id)
    members = [items_service.Member(id=p.member_id, household_id=member.household_id, telegram_user_id=p.telegram_user_id, username=p.username, first_name=p.first_name, last_name=None, is_active=True) for p in participants]
    await callback.message.edit_text(
        "Who should be the current buyer?", reply_markup=change_buyer_keyboard(item_id, members, item.current_buyer_id)
    )
    await callback.answer()


@router.callback_query(F.data.startswith("setbuyer:"))
async def set_buyer(callback: CallbackQuery, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    _, item_id_str, member_id_str = callback.data.split(":")
    item_id, member_id = int(item_id_str), int(member_id_str)
    try:
        await items_service.set_current_buyer(db, item_id, member_id)
    except items_service.ItemError:
        await callback.answer("That person isn't a participant for this item.", show_alert=True)
        return
    item = await items_service.get_item(db, item_id)
    await callback.message.edit_text(
        f"✅ Current buyer updated for \"{escape(item.name)}\".", parse_mode="HTML",
        reply_markup=item_detail_keyboard(item_id),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("item_action:deactivate:"))
async def item_deactivate_confirm(callback: CallbackQuery, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    item_id = int(callback.data.split(":")[2])
    item = await items_service.get_item(db, item_id)
    await callback.message.edit_text(
        f"⚠️ Deactivate \"{escape(item.name)}\"? It will no longer appear in /status or accept reminders. "
        "Purchase history is kept.",
        parse_mode="HTML",
        reply_markup=deactivate_confirm_keyboard(item_id),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("deact_yes:"))
async def item_deactivate_yes(callback: CallbackQuery, db: Database) -> None:
    member = await _member_or_none(callback, db)
    if member is None:
        await callback.answer(NOT_REGISTERED_TEXT, show_alert=True)
        return
    item_id = int(callback.data.split(":", 1)[1])
    item = await items_service.get_item(db, item_id)
    await items_service.deactivate_item(db, item_id)
    await callback.message.edit_text(f"✅ \"{escape(item.name)}\" has been deactivated.", parse_mode="HTML", reply_markup=main_menu_keyboard())
    await callback.answer()


@router.callback_query(F.data.startswith("deact_no:"))
async def item_deactivate_no(callback: CallbackQuery, db: Database) -> None:
    item_id = int(callback.data.split(":", 1)[1])
    await callback.message.edit_text("Okay, not deactivated.", reply_markup=item_detail_keyboard(item_id))
    await callback.answer()


@router.callback_query(F.data == "noop")
async def noop(callback: CallbackQuery) -> None:
    await callback.answer()