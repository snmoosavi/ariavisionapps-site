"""Scanner safety tests."""

from __future__ import annotations

from smart_file_organizer.core.rules_engine import RulesEngine
from smart_file_organizer.core.scanner import Scanner


def test_temporary_file_skip(tmp_path) -> None:
    file_path = tmp_path / "video.mp4.crdownload"
    file_path.write_text("partial", encoding="utf-8")

    plan = Scanner(RulesEngine()).plan_file(file_path, tmp_path)

    assert plan.status == "SKIPPED"
    assert "Temporary download" in plan.reason


def test_desktop_shortcut_skip(tmp_path) -> None:
    desktop = tmp_path / "Desktop"
    desktop.mkdir()
    shortcut = desktop / "app.lnk"
    shortcut.write_text("shortcut", encoding="utf-8")

    plan = Scanner(RulesEngine()).plan_file(shortcut, desktop)

    assert plan.status == "SKIPPED"
    assert "Desktop shortcut" in plan.reason
