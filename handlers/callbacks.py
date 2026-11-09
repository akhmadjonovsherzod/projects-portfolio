"""Inline-button callbacks from a group chat: notify buyer / confirm purchase.

Both buttons carry only the item's database ID. All authorization is
re-checked server-side against the current database state - the callback
data itself is never trusted as proof of who's turn it is. The group a
button was pressed in determines which household's items are valid there.
"""
from __future__ import annotations

from aiogram import F, Router
from aiogram.types import CallbackQuery

from database import Database
from services import items as items_service
from services import rotation
from services.notifications import send_purchase_confirmation, send_reminder

router = Router(name="group_callbacks")
router.callback_query.filter(F.message.chat.type.in_({"group", "supergroup"}))


@router.callback_query(F.data.startswith("notify:"))
async def notify_callback(callback: CallbackQuery, db: Database) -> None:
    group_chat_id = callback.message.chat.id
    household_id = await items_service.get_or_create_household(
        db, group_chat_id, callback.message.chat.title or "Apartment"
    )

    requester = await items_service.get_member_by_telegram_id(db, callback.from_user.id)
    if requester is None or requester.household_id != household_id:
        await callback.answer("Register with /join first.", show_alert=True)
        return

    item_id = int(callback.data.split(":", 1)[1])
    item = await items_service.get_item(db, item_id)
    if item is None or not item.is_active or item.household_id != household_id:
        await callback.answer("This item is no longer available.", show_alert=True)
        return

    participants = await rotation.get_participants(db, item.id)
    buyer = next((p for p in participants if p.member_id == item.current_buyer_id), None)
    if buyer is None:
        await callback.answer("No current buyer is set for this item.", show_alert=True)
        return

    await send_reminder(callback.bot, group_chat_id, item.name, buyer, requester)
    await callback.answer("Reminder sent!")


@router.callback_query(F.data.startswith("confirm:"))
async def confirm_callback(callback: CallbackQuery, db: Database) -> None:
    group_chat_id = callback.message.chat.id
    household_id = await items_service.get_or_create_household(
        db, group_chat_id, callback.message.chat.title or "Apartment"
    )

    requester = await items_service.get_member_by_telegram_id(db, callback.from_user.id)
    if requester is None or requester.household_id != household_id:
        await callback.answer("Register with /join first.", show_alert=True)
        return

    item_id = int(callback.data.split(":", 1)[1])
    item = await items_service.get_item(db, item_id)
    if item is None or item.household_id != household_id:
        await callback.answer("This item is no longer available.", show_alert=True)
        return

    result = await rotation.confirm_purchase(db, item_id, callback.from_user.id)

    if not result.success:
        messages = {
            "item_not_found": "This item no longer exists.",
            "item_inactive": "This item has been deactivated.",
            "no_participants": "This item has no participants configured.",
            "no_buyer": "This item has no current buyer set.",
        }
        if result.reason == "not_current_buyer" and result.actual_buyer is not None:
            await callback.answer(
                f"It's not your turn. {result.actual_buyer.first_name} is currently responsible.",
                show_alert=True,
            )
            return
        await callback.answer(messages.get(result.reason, "Couldn't confirm this purchase."), show_alert=True)
        return

    await callback.answer("Purchase confirmed!")
    await send_purchase_confirmation(callback.bot, group_chat_id, result.item_name, result.old_buyer, result.new_buyer)
