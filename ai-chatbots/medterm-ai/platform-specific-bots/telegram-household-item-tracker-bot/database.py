"""SQLite database setup, connection management, and low-level query helpers.

This module owns the schema and the connection. Domain-specific queries
(rotation logic, item CRUD, etc.) live in the `services/` package and use
the `Database` object exposed here.
"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Optional, Sequence

import aiosqlite

logger = logging.getLogger(__name__)

SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS households (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_chat_id INTEGER NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS members (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    household_id    INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    telegram_user_id INTEGER NOT NULL UNIQUE,
    username        TEXT,
    first_name      TEXT NOT NULL,
    last_name       TEXT,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    is_active       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    household_id    INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    current_buyer_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS item_members (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id         INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    member_id       INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    position        INTEGER NOT NULL,
    UNIQUE (item_id, member_id),
    UNIQUE (item_id, position)
);

CREATE TABLE IF NOT EXISTS purchase_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id         INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    buyer_id        INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    purchased_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    confirmed_by_telegram_id INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_members_household ON members(household_id);
CREATE INDEX IF NOT EXISTS idx_items_household ON items(household_id);
CREATE INDEX IF NOT EXISTS idx_items_active ON items(household_id, is_active);
CREATE INDEX IF NOT EXISTS idx_item_members_item ON item_members(item_id);
CREATE INDEX IF NOT EXISTS idx_item_members_member ON item_members(member_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_item ON purchase_history(item_id);
"""


class Database:
    """Thin async wrapper around a single aiosqlite connection.

    One Database instance is created at startup and shared across the
    application (aiosqlite serializes access on a single connection, and
    WAL mode plus `BEGIN IMMEDIATE` transactions keep rotation advancement
    safe under concurrent callback presses).
    """

    def __init__(self, path: str) -> None:
        self._path = path
        self._conn: Optional[aiosqlite.Connection] = None

    async def connect(self) -> None:
        os.makedirs(os.path.dirname(self._path) or ".", exist_ok=True)
        self._conn = await aiosqlite.connect(self._path)
        self._conn.row_factory = aiosqlite.Row
        await self._conn.execute("PRAGMA foreign_keys = ON;")
        await self._conn.execute("PRAGMA journal_mode = WAL;")
        await self._conn.commit()
        await self._conn.executescript(SCHEMA)
        await self._conn.commit()
        logger.info("Database connected and schema ensured at %s", self._path)

    async def close(self) -> None:
        if self._conn is not None:
            await self._conn.close()
            self._conn = None

    @property
    def conn(self) -> aiosqlite.Connection:
        if self._conn is None:
            raise RuntimeError("Database is not connected. Call connect() first.")
        return self._conn

    async def fetchone(self, query: str, params: Sequence[Any] = ()) -> Optional[aiosqlite.Row]:
        async with self.conn.execute(query, params) as cursor:
            return await cursor.fetchone()

    async def fetchall(self, query: str, params: Sequence[Any] = ()) -> list[aiosqlite.Row]:
        async with self.conn.execute(query, params) as cursor:
            return list(await cursor.fetchall())

    async def execute(self, query: str, params: Sequence[Any] = ()) -> int:
        """Run a single INSERT/UPDATE/DELETE and commit. Returns lastrowid."""
        cursor = await self.conn.execute(query, params)
        await self.conn.commit()
        return cursor.lastrowid or 0

    @asynccontextmanager
    async def transaction(self) -> AsyncIterator[aiosqlite.Connection]:
        """Run a block of statements atomically with an immediate write lock.

        Usage:
            async with db.transaction() as conn:
                await conn.execute(...)
                await conn.execute(...)
        On success the transaction is committed; on any exception it is
        rolled back and the exception re-raised.
        """
        await self.conn.execute("BEGIN IMMEDIATE;")
        try:
            yield self.conn
        except Exception:
            await self.conn.rollback()
            raise
        else:
            await self.conn.commit()
