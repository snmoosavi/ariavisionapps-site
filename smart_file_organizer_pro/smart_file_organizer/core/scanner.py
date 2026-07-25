"""Folder scanning and move preview generation."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from smart_file_organizer.models import FilePlan, WatchedFolder
from smart_file_organizer.core.rules_engine import RulesEngine, managed_folder_names
from smart_file_organizer.core.safety import safety_exclusion_reason


class Scanner:
    """Scan watched folders and produce FilePlan preview rows."""

    def __init__(
        self,
        rules_engine: RulesEngine,
        skip_hidden_files: bool = True,
        skip_desktop_shortcuts: bool = True,
        app_data_paths: Iterable[Path] | None = None,
    ) -> None:
        self.rules_engine = rules_engine
        self.skip_hidden_files = skip_hidden_files
        self.skip_desktop_shortcuts = skip_desktop_shortcuts
        self.app_data_paths = list(app_data_paths or [])

    def plan_file(self, file_path: Path, watched_root: Path) -> FilePlan:
        """Plan one file or return a skipped plan when a safety rule matches."""
        source = Path(file_path)
        root = Path(watched_root)
        reason = safety_exclusion_reason(
            source,
            root,
            managed_folder_names(self.rules_engine.rules),
            self.skip_hidden_files,
            self.skip_desktop_shortcuts,
            self.app_data_paths,
        )
        if reason:
            return self._skipped_plan(source, root, reason)
        return self.rules_engine.build_plan(source, root)

    def scan_folder(self, watched_folder: WatchedFolder | Path) -> list[FilePlan]:
        """Scan one watched folder recursively."""
        if isinstance(watched_folder, WatchedFolder):
            if not watched_folder.is_enabled:
                return []
            root = watched_folder.path
        else:
            root = Path(watched_folder)

        if not root.exists() or not root.is_dir():
            return []

        plans: list[FilePlan] = []
        for path in sorted(root.rglob("*"), key=lambda item: str(item).lower()):
            if path.is_dir():
                continue
            plans.append(self.plan_file(path, root))
        return plans

    def scan_watched_folders(self, watched_folders: Iterable[WatchedFolder]) -> list[FilePlan]:
        """Scan all enabled watched folders."""
        plans: list[FilePlan] = []
        for folder in watched_folders:
            if folder.is_enabled:
                plans.extend(self.scan_folder(folder))
        return plans

    def _skipped_plan(self, source: Path, watched_root: Path, reason: str) -> FilePlan:
        try:
            stat = source.stat()
            size = stat.st_size
            modified_at = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).replace(microsecond=0)
        except OSError:
            size = 0
            modified_at = datetime.now(timezone.utc).replace(microsecond=0)
        return FilePlan(
            source_path=source,
            watched_root=watched_root,
            destination_path=source,
            category="Skipped",
            file_size=size,
            last_modified_at=modified_at,
            reason=reason,
            status="SKIPPED",
            error_message=reason,
        )
