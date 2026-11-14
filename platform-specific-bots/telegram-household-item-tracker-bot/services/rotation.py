"""Purchasing rotation logic: who's turn is it, and advancing after a purchase.

Each item has its own independent rotation, defined by the `item_members`
table (participant + position). The current buyer is denormalized onto
`items.current_buyer_id` for fast lookups; this module is the only place
that is allowed to change it.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from database import Database


@dataclass
class Participant:
    member_id: int
    position: int
    telegram_user_id: int
    username: Optional[str]
    first_name: str


@dataclass
class ConfirmResult:
    success: bool
    reason: Optional[str] = None  # one of: item_not_found, item_inactive,
    # no_buyer, not_current_buyer, no_participants
    item_name: Optional[str] = None
    old_buyer: Optional[Participant] = None
    new_buyer: Optional[Participant] = None
    actual_buyer: Optional[Participant] = None  # set when reason=not_current_buyer


_PARTICIPANTS_QUERY = """
SELECT m.id AS member_id, im.position AS position,
       m.telegram_user_id AS telegram_user_id, m.username AS username,
       m.first_name AS first_name
FROM item_members im
JOIN members m ON m.id = im.member_id
WHERE im.item_id = ?
ORDER BY im.position ASC
"""


async def get_participants(db: Database, item_id: int) -> list[Participant]:
    rows = await db.fetchall(_PARTICIPANTS_QUERY, (item_id,))
    return [
        Participant(
            member_id=row["member_id"],
            position=row["position"],
            telegram_user_id=row["telegram_user_id"],
            username=row["username"],
            first_name=row["first_name"],
        )
        for row in rows
    ]


def next_in_rotation(participants: list[Participant], current_member_id: Optional[int]) -> Optional[Participant]:
    """Return the participant who comes after `current_member_id`.

    Rotation wraps around (last -> first). If the current buyer is not
    among the participants (e.g. they were removed), falls back to the
    first participant. Returns None if there are no participants.
    """
    if not participants:
        return None
    if current_member_id is None:
        return participants[0]
    for idx, p in enumerate(participants):
        if p.member_id == current_member_id:
            return participants[(idx + 1) % len(participants)]
    return participants[0]


def rotation_order_from(participants: list[Participant], current_member_id: Optional[int]) -> list[Participant]:
    """Return participants reordered to start right after the current buyer.

    Useful for displaying "Next: A -> B -> C" in /status.
    """
    if not participants:
        return []
    if current_member_id is None:
        return list(participants)
    idx = next(
        (i for i, p in enumerate(participants) if p.member_id == current_member_id),
        None,
    )
    if idx is None:
        return list(participants)
    return participants[idx + 1:] + participants[:idx]


async def confirm_purchase(db: Database, item_id: int, requester_telegram_id: int) -> ConfirmResult:
    """Atomically confirm a purchase and advance the rotation.

    Re-reads the current buyer from the database inside the transaction,
    so an outdated button (or a double-click after the rotation already
    advanced) is naturally rejected: the presser is simply no longer the
    current buyer.
    """
    async with db.transaction() as conn:
        item_row = await (await conn.execute(
            "SELECT id, name, is_active, current_buyer_id FROM items WHERE id = ?",
            (item_id,),
        )).fetchone()

        if item_row is None:
            return ConfirmResult(success=False, reason="item_not_found")
        if not item_row["is_active"]:
            return ConfirmResult(success=False, reason="item_inactive", item_name=item_row["name"])

        participants = [
            Participant(
                member_id=r["member_id"],
                position=r["position"],
                telegram_user_id=r["telegram_user_id"],
                username=r["username"],
                first_name=r["first_name"],
            )
            for r in await (await conn.execute(_PARTICIPANTS_QUERY, (item_id,))).fetchall()
        ]
        if not participants:
            return ConfirmResult(success=False, reason="no_participants", item_name=item_row["name"])

        current_buyer_id = item_row["current_buyer_id"]
        if current_buyer_id is None:
            return ConfirmResult(success=False, reason="no_buyer", item_name=item_row["name"])

        current_buyer = next((p for p in participants if p.member_id == current_buyer_id), None)
        if current_buyer is None:
            return ConfirmResult(success=False, reason="no_buyer", item_name=item_row["name"])

        if current_buyer.telegram_user_id != requester_telegram_id:
            return ConfirmResult(
                success=False,
                reason="not_current_buyer",
                item_name=item_row["name"],
                actual_buyer=current_buyer,
            )

        new_buyer = next_in_rotation(participants, current_buyer_id)
        assert new_buyer is not None  # participants is non-empty here

        await conn.execute(
            "INSERT INTO purchase_history (item_id, buyer_id, confirmed_by_telegram_id) "
            "VALUES (?, ?, ?)",
            (item_id, current_buyer_id, requester_telegram_id),
        )
        await conn.execute(
            "UPDATE items SET current_buyer_id = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') "
            "WHERE id = ?",
            (new_buyer.member_id, item_id),
        )

        return ConfirmResult(
            success=True,
            item_name=item_row["name"],
            old_buyer=current_buyer,
            new_buyer=new_buyer,
        )
