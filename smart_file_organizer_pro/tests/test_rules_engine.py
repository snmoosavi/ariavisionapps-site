"""Rules engine tests."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

from smart_file_organizer.core.rules_engine import RulesEngine


def test_image_file_category() -> None:
    engine = RulesEngine()
    assert engine.category_for_extension("photo.jpg") == "Images"


def test_pdf_category() -> None:
    engine = RulesEngine()
    assert engine.category_for_extension("invoice.pdf") == "Documents"


def test_installer_category() -> None:
    engine = RulesEngine()
    assert engine.category_for_extension("setup.exe") == "Installers"


def test_unknown_extension() -> None:
    engine = RulesEngine()
    assert engine.category_for_extension("file.unknownext") == "Others"


def test_old_file_archive(tmp_path) -> None:
    old_file = tmp_path / "old_invoice.pdf"
    old_file.write_text("invoice", encoding="utf-8")
    old_time = datetime.now(timezone.utc) - timedelta(days=120)
    os.utime(old_file, (old_time.timestamp(), old_time.timestamp()))

    engine = RulesEngine(archive_old_files_enabled=True, archive_age_days=90)
    plan = engine.build_plan(old_file, tmp_path)

    assert "Archive" in plan.destination_path.parts
    assert old_time.strftime("%Y-%m") in plan.destination_path.parts
    assert "Documents" in plan.destination_path.parts
    assert plan.reason == "Old file archive rule"
