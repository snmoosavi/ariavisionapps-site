"""Undo tests."""

from __future__ import annotations

from smart_file_organizer.core.db import Database
from smart_file_organizer.core.history import HistoryService
from smart_file_organizer.core.mover import Mover
from smart_file_organizer.core.rules_engine import RulesEngine


def test_undo_batch(tmp_path) -> None:
    source = tmp_path / "photo.jpg"
    source.write_text("image", encoding="utf-8")
    db = Database(tmp_path / "undo.db")
    plan = RulesEngine(archive_old_files_enabled=False).build_plan(source, tmp_path)
    move_summary = Mover(db).apply_plans([plan])

    moved_path = tmp_path / "Images" / "photo.jpg"
    assert moved_path.exists()
    assert not source.exists()

    undo_summary = HistoryService(db).undo_last_batch()

    assert undo_summary.batch_id == move_summary.batch_id
    assert undo_summary.status == "UNDONE"
    assert source.exists()
    assert not moved_path.exists()
    rows = db.get_move_history(move_summary.batch_id)
    assert rows[0]["status"] == "UNDONE"
    db.close()
