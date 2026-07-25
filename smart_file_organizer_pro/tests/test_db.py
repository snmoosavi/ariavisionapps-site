"""Database default and settings tests."""

from __future__ import annotations

from smart_file_organizer.core.db import Database


def test_db_defaults(tmp_path) -> None:
    db = Database(tmp_path / "app.db")
    db.seed_defaults()

    assert db.get_bool_setting("archive_old_files_enabled") is True
    assert db.get_int_setting("archive_age_days", 0) == 90
    assert any(rule.category == "Images" for rule in db.get_rules())
    db.close()
