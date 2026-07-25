"""Mover and conflict handling tests."""

from __future__ import annotations

from smart_file_organizer.core.db import Database
from smart_file_organizer.core.mover import Mover
from smart_file_organizer.core.rules_engine import RulesEngine


def test_conflict_handling(tmp_path) -> None:
    source = tmp_path / "report.pdf"
    source.write_text("new", encoding="utf-8")
    destination_dir = tmp_path / "Documents"
    destination_dir.mkdir()
    existing = destination_dir / "report.pdf"
    existing.write_text("existing", encoding="utf-8")

    plan = RulesEngine(archive_old_files_enabled=False).build_plan(source, tmp_path)
    summary = Mover().apply_plans([plan])

    assert summary.total_files_moved == 1
    assert existing.read_text(encoding="utf-8") == "existing"
    assert (destination_dir / "report (1).pdf").read_text(encoding="utf-8") == "new"


def test_database_history_after_move(tmp_path) -> None:
    source = tmp_path / "invoice.pdf"
    source.write_text("invoice", encoding="utf-8")
    db = Database(tmp_path / "history.db")
    plan = RulesEngine(archive_old_files_enabled=False).build_plan(source, tmp_path)

    summary = Mover(db).apply_plans([plan])
    rows = db.get_move_history(summary.batch_id)

    assert rows[0]["status"] == "MOVED"
    assert rows[0]["file_name"] == "invoice.pdf"
    db.close()
