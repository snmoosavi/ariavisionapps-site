"""Category matching and destination path generation."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable

from smart_file_organizer.config import ARCHIVE_FOLDER_NAME, DEFAULT_RULES
from smart_file_organizer.models import FilePlan, Rule


def default_rules() -> list[Rule]:
    """Return default category rules."""
    return [Rule(category=category, extensions=tuple(extensions), is_enabled=True) for category, extensions in DEFAULT_RULES.items()]


def normalize_extension(extension: str) -> str:
    """Normalize a file extension for matching."""
    value = extension.strip().lower()
    if value and not value.startswith("."):
        value = f".{value}"
    return value


def managed_folder_names(rules: Iterable[Rule] | None = None) -> set[str]:
    """Return folder names managed by the organizer."""
    source_rules = list(rules) if rules is not None else default_rules()
    names = {rule.category for rule in source_rules}
    names.add(ARCHIVE_FOLDER_NAME)
    return names


class RulesEngine:
    """Decide categories, archive status, and destination paths."""

    def __init__(
        self,
        rules: Iterable[Rule] | None = None,
        archive_old_files_enabled: bool = True,
        archive_age_days: int = 90,
    ) -> None:
        self.rules = list(rules) if rules is not None else default_rules()
        self.archive_old_files_enabled = archive_old_files_enabled
        self.archive_age_days = archive_age_days

    def category_for_extension(self, path_or_extension: Path | str) -> str:
        """Return the category for a file path or extension."""
        if isinstance(path_or_extension, Path):
            extension = path_or_extension.suffix.lower()
        else:
            text = str(path_or_extension)
            extension = normalize_extension(Path(text).suffix if "." in text and not text.startswith(".") else text)

        for rule in self.rules:
            if not rule.is_enabled:
                continue
            normalized = {normalize_extension(item) for item in rule.extensions}
            if extension in normalized:
                return rule.category
        return "Others"

    def is_old_file(self, modified_at: datetime, now: datetime | None = None) -> bool:
        """Return True when a modified time is older than the configured threshold."""
        if not self.archive_old_files_enabled:
            return False
        current = now or datetime.now(timezone.utc)
        if modified_at.tzinfo is None:
            modified_at = modified_at.replace(tzinfo=timezone.utc)
        return modified_at <= current - timedelta(days=self.archive_age_days)

    def get_destination_path(
        self,
        source_file: Path,
        watched_root: Path,
        category: str,
        is_old: bool,
        modified_at: datetime | None = None,
    ) -> Path:
        """Return the desired destination path for a file."""
        if is_old:
            timestamp = modified_at
            if timestamp is None:
                timestamp = datetime.fromtimestamp(source_file.stat().st_mtime, tz=timezone.utc)
            month = timestamp.strftime("%Y-%m")
            return watched_root / ARCHIVE_FOLDER_NAME / month / category / source_file.name
        return watched_root / category / source_file.name

    def build_plan(self, source_file: Path, watched_root: Path) -> FilePlan:
        """Build a planned move for a safe file."""
        stat = source_file.stat()
        modified_at = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).replace(microsecond=0)
        category = self.category_for_extension(source_file)
        is_old = self.is_old_file(modified_at)
        destination = self.get_destination_path(source_file, watched_root, category, is_old, modified_at)
        reason = "Old file archive rule" if is_old else f"Matched {category} extension rule"
        if category == "Others" and not is_old:
            reason = "No category rule matched"
        return FilePlan(
            source_path=source_file,
            watched_root=watched_root,
            destination_path=destination,
            category=category,
            file_size=stat.st_size,
            last_modified_at=modified_at,
            reason=reason,
            status="PLANNED",
        )
