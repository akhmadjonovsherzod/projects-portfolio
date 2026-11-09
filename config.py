"""Load and validate configuration from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Config:
    bot_token: str
    database_path: str


def load_config() -> Config:
    """Load configuration from environment variables and validate it.

    The bot is multi-tenant: it works in any group it's added to, each
    group becoming its own independent "household" (see
    `services.items.get_or_create_household`). There is no group
    allow-list to configure.

    Raises:
        RuntimeError: if a required variable is missing or malformed.
    """
    bot_token = os.getenv("BOT_TOKEN", "").strip()
    if not bot_token:
        raise RuntimeError(
            "BOT_TOKEN is not set. Create a bot with @BotFather and put the "
            "token in your .env file (see .env.example)."
        )

    database_path = os.getenv("DATABASE_PATH", "database/tracker.db").strip()

    return Config(
        bot_token=bot_token,
        database_path=database_path,
    )
