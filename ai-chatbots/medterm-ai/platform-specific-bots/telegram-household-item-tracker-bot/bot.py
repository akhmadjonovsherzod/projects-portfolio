"""Apartment Tracker bot entry point."""
from __future__ import annotations

import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.fsm.storage.memory import MemoryStorage

from config import load_config
from database import Database
from handlers import callbacks, group, private, registration

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def main() -> None:
    config = load_config()

    db = Database(config.database_path)
    await db.connect()

    bot = Bot(token=config.bot_token, default=DefaultBotProperties(parse_mode=None))
    dp = Dispatcher(storage=MemoryStorage())

    dp.include_router(registration.router)
    dp.include_router(group.router)
    dp.include_router(callbacks.router)
    dp.include_router(private.router)

    try:
        logger.info("Starting Apartment Tracker bot...")
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot, db=db, config=config)
    finally:
        await db.close()
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Apartment Tracker bot stopped.")
