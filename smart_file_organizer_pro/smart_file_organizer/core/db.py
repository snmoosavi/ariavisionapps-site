"""SQLite persistence for settings, rules, watched folders, and history."""

from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from smart_file_organizer.app_paths import database_path
from smart_file_organizer.config import DEFAULT_RULES, DEFAULT_SETTINGS
from smart_file_organizer.models import FilePlan, MoveResult, Rule, WatchedFolder


def utc_now() -> datetime:
    """Return the current UTC time without microseconds."""
    return datetime.now(timezone.utc).replace(microsecond=0)


def utc_now_text() -> str:
    """Return an ISO 8601 UTC timestamp."""
    return utc_now().isoformat()


class Database:
    """Small SQLite data layer for app state and move history."""

    def __init__(self, db_path: Path | str | None = None) -> None:
        self.db_path = Path(db_path) if db_path else database_path()
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._connection = sqlite3.connect(self.db_path, check_same_thread=False)
        self._connection.row_factory = sqlite3.Row
        self._connection.execute("PRAGMA foreign_keys = ON")
        self.init_schema()

    def close(self) -> None:
        """Close the database connection."""
        with self._lock:
            self._connection.close()

    def init_schema(self) -> None:
        """Create database tables if they do not exist."""
        schema = """
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS watched_folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE,
            display_name TEXT,
            is_enabled INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL UNIQUE,
            extensions_json TEXT NOT NULL,
            is_enabled INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS batches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mode TEXT NOT NULL,
            started_at TEXT NOT NULL,
            finished_at TEXT,
            status TEXT NOT NULL,
            summary_json TEXT
        );

        CREATE TABLE IF NOT EXISTS move_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_id INTEGER NOT NULL,
            source_path TEXT NOT NULL,
            destination_path TEXT NOT NULL,
            final_path TEXT,
            file_name TEXT NOT NULL,
            category TEXT NOT NULL,
            file_size INTEGER,
            last_modified_at TEXT,
            move_reason TEXT,
            status TEXT NOT NULL,
            error_message TEXT,
            moved_at TEXT,
            undone_at TEXT,
            FOREIGN KEY(batch_id) REFERENCES batches(id)
        );
        """
        with self._lock:
            self._connection.executescript(schema)
            self._connection.commit()

    def seed_defaults(self) -> None:
        """Insert default settings, rules, and existing user folders."""
        now = utc_now_text()
        with self._lock:
            for key, value in DEFAULT_SETTINGS.items():
                self._connection.execute(
                    """
                    INSERT OR IGNORE INTO settings(key, value, updated_at)
                    VALUES (?, ?, ?)
                    """,
                    (key, value, now),
                )
            existing_rule_count = self._connection.execute("SELECT COUNT(*) FROM rules").fetchone()[0]
            if existing_rule_count == 0:
                for category, extensions in DEFAULT_RULES.items():
                    self._connection.execute(
                        """
                        INSERT INTO rules(category, extensions_json, is_enabled, created_at, updated_at)
                        VALUES (?, ?, 1, ?, ?)
                        """,
                        (category, json.dumps(list(extensions)), now, now),
                    )
            self._connection.commit()
        self.seed_default_watched_folders()

    def seed_default_watched_folders(self) -> None:
        """Add Downloads and Desktop if they exist."""
        home = Path.home()
        for folder in (home / "Downloads", home / "Desktop"):
            if folder.exists():
                self.add_watched_folder(folder, folder.name, True)

    def get_setting(self, key: str, default: str | None = None) -> str | None:
        """Return a setting value."""
        with self._lock:
            row = self._connection.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else default

    def get_bool_setting(self, key: str, default: bool = False) -> bool:
        """Return a boolean setting value."""
        value = self.get_setting(key)
        if value is None:
            return default
        return value.lower() in {"1", "true", "yes", "on"}

    def get_int_setting(self, key: str, default: int) -> int:
        """Return an integer setting value."""
        value = self.get_setting(key)
        if value is None:
            return default
        try:
            return int(value)
        except ValueError:
            return default

    def set_setting(self, key: str, value: str | bool | int) -> None:
        """Create or update a setting."""
        if isinstance(value, bool):
            value_text = "true" if value else "false"
        else:
            value_text = str(value)
        now = utc_now_text()
        with self._lock:
            self._connection.execute(
                """
                INSERT INTO settings(key, value, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """,
                (key, value_text, now),
            )
            self._connection.commit()

    def get_settings(self) -> dict[str, str]:
        """Return all settings as a dictionary."""
        with self._lock:
            rows = self._connection.execute("SELECT key, value FROM settings ORDER BY key").fetchall()
        return {row["key"]: row["value"] for row in rows}

    def get_rules(self) -> list[Rule]:
        """Return all category rules."""
        with self._lock:
            rows = self._connection.execute("SELECT * FROM rules ORDER BY category").fetchall()
        return [
            Rule(
                id=row["id"],
                category=row["category"],
                extensions=tuple(json.loads(row["extensions_json"])),
                is_enabled=bool(row["is_enabled"]),
            )
            for row in rows
        ]

    def restore_default_rules(self) -> None:
        """Replace all rules with defaults."""
        now = utc_now_text()
        with self._lock:
            self._connection.execute("DELETE FROM rules")
            for category, extensions in DEFAULT_RULES.items():
                self._connection.execute(
                    """
                    INSERT INTO rules(category, extensions_json, is_enabled, created_at, updated_at)
                    VALUES (?, ?, 1, ?, ?)
                    """,
                    (category, json.dumps(list(extensions)), now, now),
                )
            self._connection.commit()

    def set_rule_enabled(self, rule_id: int, enabled: bool) -> None:
        """Enable or disable a category rule."""
        with self._lock:
            self._connection.execute(
                "UPDATE rules SET is_enabled = ?, updated_at = ? WHERE id = ?",
                (1 if enabled else 0, utc_now_text(), rule_id),
            )
            self._connection.commit()

    def add_extension_to_rule(self, rule_id: int, extension: str) -> None:
        """Add an extension to a rule."""
        extension = extension.strip().lower()
        if not extension:
            return
        if not extension.startswith("."):
            extension = f".{extension}"
        with self._lock:
            row = self._connection.execute("SELECT extensions_json FROM rules WHERE id = ?", (rule_id,)).fetchone()
            if not row:
                return
            extensions = list(dict.fromkeys(json.loads(row["extensions_json"]) + [extension]))
            self._connection.execute(
                "UPDATE rules SET extensions_json = ?, updated_at = ? WHERE id = ?",
                (json.dumps(extensions), utc_now_text(), rule_id),
            )
            self._connection.commit()

    def remove_extension_from_rule(self, rule_id: int, extension: str) -> None:
        """Remove an extension from a rule."""
        extension = extension.strip().lower()
        if extension and not extension.startswith("."):
            extension = f".{extension}"
        with self._lock:
            row = self._connection.execute("SELECT extensions_json FROM rules WHERE id = ?", (rule_id,)).fetchone()
            if not row:
                return
            extensions = [item for item in json.loads(row["extensions_json"]) if item != extension]
            self._connection.execute(
                "UPDATE rules SET extensions_json = ?, updated_at = ? WHERE id = ?",
                (json.dumps(extensions), utc_now_text(), rule_id),
            )
            self._connection.commit()

    def add_watched_folder(self, path: Path | str, display_name: str | None = None, enabled: bool = True) -> None:
        """Add or update a watched folder."""
        folder = Path(path).expanduser().resolve()
        now = utc_now_text()
        with self._lock:
            self._connection.execute(
                """
                INSERT INTO watched_folders(path, display_name, is_enabled, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(path) DO UPDATE SET
                    display_name = excluded.display_name,
                    is_enabled = excluded.is_enabled,
                    updated_at = excluded.updated_at
                """,
                (str(folder), display_name or folder.name, 1 if enabled else 0, now, now),
            )
            self._connection.commit()

    def remove_watched_folder(self, folder_id: int) -> None:
        """Remove a watched folder by id."""
        with self._lock:
            self._connection.execute("DELETE FROM watched_folders WHERE id = ?", (folder_id,))
            self._connection.commit()

    def set_watched_folder_enabled(self, folder_id: int, enabled: bool) -> None:
        """Enable or disable a watched folder."""
        with self._lock:
            self._connection.execute(
                "UPDATE watched_folders SET is_enabled = ?, updated_at = ? WHERE id = ?",
                (1 if enabled else 0, utc_now_text(), folder_id),
            )
            self._connection.commit()

    def get_watched_folders(self, only_enabled: bool = False) -> list[WatchedFolder]:
        """Return watched folders."""
        query = "SELECT * FROM watched_folders"
        params: tuple[Any, ...] = ()
        if only_enabled:
            query += " WHERE is_enabled = 1"
        query += " ORDER BY path"
        with self._lock:
            rows = self._connection.execute(query, params).fetchall()
        return [
            WatchedFolder(
                id=row["id"],
                path=Path(row["path"]),
                display_name=row["display_name"],
                is_enabled=bool(row["is_enabled"]),
            )
            for row in rows
        ]

    def create_batch(self, mode: str, status: str = "PREVIEW") -> int:
        """Create a batch and return its id."""
        with self._lock:
            cursor = self._connection.execute(
                "INSERT INTO batches(mode, started_at, status) VALUES (?, ?, ?)",
                (mode, utc_now_text(), status),
            )
            self._connection.commit()
            return int(cursor.lastrowid)

    def finish_batch(self, batch_id: int, status: str, summary: dict[str, Any] | None = None) -> None:
        """Mark a batch finished with optional summary JSON."""
        with self._lock:
            self._connection.execute(
                "UPDATE batches SET finished_at = ?, status = ?, summary_json = ? WHERE id = ?",
                (utc_now_text(), status, json.dumps(summary or {}), batch_id),
            )
            self._connection.commit()

    def record_move_result(self, batch_id: int, result: MoveResult) -> None:
        """Persist one move result."""
        plan = result.plan
        with self._lock:
            self._connection.execute(
                """
                INSERT INTO move_history(
                    batch_id,
                    source_path,
                    destination_path,
                    final_path,
                    file_name,
                    category,
                    file_size,
                    last_modified_at,
                    move_reason,
                    status,
                    error_message,
                    moved_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    batch_id,
                    str(plan.source_path),
                    str(plan.destination_path),
                    str(result.final_path) if result.final_path else None,
                    plan.file_name,
                    plan.category,
                    plan.file_size,
                    plan.last_modified_at.isoformat(),
                    plan.reason,
                    result.status,
                    result.error_message,
                    result.moved_at.isoformat() if result.moved_at else None,
                ),
            )
            self._connection.commit()

    def update_move_history_status(
        self,
        history_id: int,
        status: str,
        error_message: str | None = None,
        undone_at: str | None = None,
    ) -> None:
        """Update one move history row status."""
        with self._lock:
            self._connection.execute(
                """
                UPDATE move_history
                SET status = ?, error_message = ?, undone_at = ?
                WHERE id = ?
                """,
                (status, error_message, undone_at, history_id),
            )
            self._connection.commit()

    def get_latest_applied_batch_id(self) -> int | None:
        """Return the newest batch that can be undone."""
        with self._lock:
            row = self._connection.execute(
                """
                SELECT id FROM batches
                WHERE status IN ('APPLIED', 'PARTIAL')
                ORDER BY id DESC
                LIMIT 1
                """
            ).fetchone()
        return int(row["id"]) if row else None

    def get_batch(self, batch_id: int) -> dict[str, Any] | None:
        """Return one batch as a dictionary."""
        with self._lock:
            row = self._connection.execute("SELECT * FROM batches WHERE id = ?", (batch_id,)).fetchone()
        return dict(row) if row else None

    def get_batches(self, limit: int = 100) -> list[dict[str, Any]]:
        """Return recent batches."""
        with self._lock:
            rows = self._connection.execute(
                "SELECT * FROM batches ORDER BY id DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(row) for row in rows]

    def get_move_history(self, batch_id: int | None = None) -> list[dict[str, Any]]:
        """Return move history rows."""
        with self._lock:
            if batch_id is None:
                rows = self._connection.execute("SELECT * FROM move_history ORDER BY id DESC").fetchall()
            else:
                rows = self._connection.execute(
                    "SELECT * FROM move_history WHERE batch_id = ? ORDER BY id",
                    (batch_id,),
                ).fetchall()
        return [dict(row) for row in rows]

    def count_move_history_by_status(self, status: str) -> int:
        """Return the number of move history rows with a status."""
        with self._lock:
            row = self._connection.execute("SELECT COUNT(*) FROM move_history WHERE status = ?", (status,)).fetchone()
        return int(row[0])

    def files_moved_today(self) -> int:
        """Return how many files were moved on the current UTC date."""
        today = utc_now().date().isoformat()
        with self._lock:
            row = self._connection.execute(
                "SELECT COUNT(*) FROM move_history WHERE status = 'MOVED' AND moved_at LIKE ?",
                (f"{today}%",),
            ).fetchone()
        return int(row[0])

    def bulk_record_results(self, batch_id: int, results: Iterable[MoveResult]) -> None:
        """Persist several move results."""
        for result in results:
            self.record_move_result(batch_id, result)
