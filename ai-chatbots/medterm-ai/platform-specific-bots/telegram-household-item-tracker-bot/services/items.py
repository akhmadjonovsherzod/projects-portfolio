"""CRUD operations for households, members, and items.

Design note: participant-list changes (add / remove / reorder) are all
implemented as "delete all item_members rows for this item, then reinsert
in the desired order". This keeps the UNIQUE(item_id, position) constraint
trivially satisfied (no intermediate renumbering collisions) and keeps the
code simple, at the cost of a few extra writes - a fine trade-off for a
small household dataset.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import aiosqlite

from database import Database


class ItemError(Exception):
    """Raised for user-facing, expected failures (not bugs)."""


MIN_PARTICIPANTS = 2


@dataclass
class Member:
    id: int
    household_id: int
    telegram_user_id: int
    username: Optional[str]
    first_name: str
    last_name: Optional[str]
    is_active: bool


@dataclass
class Item:
    id: int
    household_id: int
    name: str
    current_buyer_id: Optional[int]
    is_active: bool


# ---------------------------------------------------------------- households

async def get_or_create_household(db: Database, telegram_chat_id: int, name: str) -> int:
    row = await db.fetchone(
        "SELECT id FROM households WHERE telegram_chat_id = ?", (telegram_chat_id,)
    )
    if row is not None:
        return row["id"]
    return await db.execute(
        "INSERT INTO households (telegram_chat_id, name) VALUES (?, ?)",
        (telegram_chat_id, name),
    )


# -------------------------------------------------------------------- members

async def get_member_by_telegram_id(db: Database, telegram_user_id: int) -> Optional[Member]:
    row = await db.fetchone(
        "SELECT * FROM members WHERE telegram_user_id = ? AND is_active = 1",
        (telegram_user_id,),
    )
    return _row_to_member(row) if row else None


async def get_member(db: Database, member_id: int) -> Optional[Member]:
    row = await db.fetchone("SELECT * FROM members WHERE id = ?", (member_id,))
    return _row_to_member(row) if row else None


async def get_household_members(db: Database, household_id: int) -> list[Member]:
    rows = await db.fetchall(
        "SELECT * FROM members WHERE household_id = ? AND is_active = 1 ORDER BY first_name COLLATE NOCASE",
        (household_id,),
    )
    return [_row_to_member(r) for r in rows]


async def register_member(
    db: Database,
    household_id: int,
    telegram_user_id: int,
    username: Optional[str],
    first_name: str,
    last_name: Optional[str],
) -> Member:
    existing = await db.fetchone(
        "SELECT * FROM members WHERE telegram_user_id = ?", (telegram_user_id,)
    )
    if existing is not None:
        raise ItemError("already_registered")
    member_id = await db.execute(
        "INSERT INTO members (household_id, telegram_user_id, username, first_name, last_name) "
        "VALUES (?, ?, ?, ?, ?)",
        (household_id, telegram_user_id, username, first_name, last_name),
    )
    member = await get_member(db, member_id)
    assert member is not None
    return member


def _row_to_member(row: aiosqlite.Row) -> Member:
    return Member(
        id=row["id"],
        household_id=row["household_id"],
        telegram_user_id=row["telegram_user_id"],
        username=row["username"],
        first_name=row["first_name"],
        last_name=row["last_name"],
        is_active=bool(row["is_active"]),
    )


# ---------------------------------------------------------------------- items

async def get_active_items(db: Database, household_id: int) -> list[Item]:
    rows = await db.fetchall(
        "SELECT * FROM items WHERE household_id = ? AND is_active = 1 ORDER BY name COLLATE NOCASE",
        (household_id,),
    )
    return [_row_to_item(r) for r in rows]


async def get_item(db: Database, item_id: int) -> Optional[Item]:
    row = await db.fetchone("SELECT * FROM items WHERE id = ?", (item_id,))
    return _row_to_item(row) if row else None


async def get_active_item_by_name(db: Database, household_id: int, name: str) -> Optional[Item]:
    row = await db.fetchone(
        "SELECT * FROM items WHERE household_id = ? AND is_active = 1 "
        "AND LOWER(name) = LOWER(?)",
        (household_id, name.strip()),
    )
    return _row_to_item(row) if row else None


def _row_to_item(row: aiosqlite.Row) -> Item:
    return Item(
        id=row["id"],
        household_id=row["household_id"],
        name=row["name"],
        current_buyer_id=row["current_buyer_id"],
        is_active=bool(row["is_active"]),
    )


async def create_item(
    db: Database,
    household_id: int,
    name: str,
    ordered_member_ids: list[int],
    initial_buyer_id: int,
) -> int:
    name = name.strip()
    if not name:
        raise ItemError("empty_name")
    if len(set(ordered_member_ids)) < MIN_PARTICIPANTS:
        raise ItemError("min_participants")
    if initial_buyer_id not in ordered_member_ids:
        raise ItemError("invalid_initial_buyer")

    async with db.transaction() as conn:
        cursor = await conn.execute(
            "INSERT INTO items (household_id, name, current_buyer_id) VALUES (?, ?, ?)",
            (household_id, name, initial_buyer_id),
        )
        item_id = cursor.lastrowid
        await _replace_participants(conn, item_id, ordered_member_ids)
        return item_id


async def _replace_participants(conn: aiosqlite.Connection, item_id: int, ordered_member_ids: list[int]) -> None:
    await conn.execute("DELETE FROM item_members WHERE item_id = ?", (item_id,))
    for position, member_id in enumerate(ordered_member_ids, start=1):
        await conn.execute(
            "INSERT INTO item_members (item_id, member_id, position) VALUES (?, ?, ?)",
            (item_id, member_id, position),
        )


async def set_participants(db: Database, item_id: int, ordered_member_ids: list[int]) -> None:
    """Replace an item's participant list / order.

    If the current buyer is no longer in the list, the simplest reasonable
    fallback is used: the first participant in the new order becomes the
    current buyer. If they're still in the list, they're left unchanged
    regardless of their new position.
    """
    if len(set(ordered_member_ids)) < MIN_PARTICIPANTS:
        raise ItemError("min_participants")

    async with db.transaction() as conn:
        item_row = await (await conn.execute(
            "SELECT current_buyer_id FROM items WHERE id = ?", (item_id,)
        )).fetchone()
        if item_row is None:
            raise ItemError("item_not_found")

        await _replace_participants(conn, item_id, ordered_member_ids)

        current_buyer_id = item_row["current_buyer_id"]
        if current_buyer_id not in ordered_member_ids:
            new_buyer_id = ordered_member_ids[0]
            await conn.execute(
                "UPDATE items SET current_buyer_id = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') "
                "WHERE id = ?",
                (new_buyer_id, item_id),
            )


async def set_current_buyer(db: Database, item_id: int, member_id: int) -> None:
    participant = await db.fetchone(
        "SELECT 1 FROM item_members WHERE item_id = ? AND member_id = ?",
        (item_id, member_id),
    )
    if participant is None:
        raise ItemError("not_a_participant")
    await db.execute(
        "UPDATE items SET current_buyer_id = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        (member_id, item_id),
    )


async def deactivate_item(db: Database, item_id: int) -> None:
    await db.execute(
        "UPDATE items SET is_active = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        (item_id,),
    )
