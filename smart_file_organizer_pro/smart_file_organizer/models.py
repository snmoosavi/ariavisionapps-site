"""Shared dataclasses for core and UI layers."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Rule:
    """A file category rule backed by one or more extensions."""

    category: str
    extensions: tuple[str, ...]
    is_enabled: bool = True
    id: int | None = None


@dataclass(frozen=True)
class WatchedFolder:
    """A user-managed folder that can be scanned or monitored."""

    path: Path
    display_name: str | None = None
    is_enabled: bool = True
    id: int | None = None


@dataclass(frozen=True)
class FilePlan:
    """A planned or skipped file move shown in preview before execution."""

    source_path: Path
    watched_root: Path
    destination_path: Path
    category: str
    file_size: int
    last_modified_at: datetime
    reason: str
    status: str = "PLANNED"
    error_message: str | None = None

    @property
    def file_name(self) -> str:
        """Return the source file name."""
        return self.source_path.name


@dataclass(frozen=True)
class MoveResult:
    """The result of attempting to apply one FilePlan."""

    plan: FilePlan
    status: str
    final_path: Path | None = None
    error_message: str | None = None
    moved_at: datetime | None = None


@dataclass
class BatchSummary:
    """Aggregate details for a scan, apply, report, or undo batch."""

    batch_id: int | None
    mode: str
    started_at: datetime
    finished_at: datetime | None = None
    status: str = "PREVIEW"
    total_files_scanned: int = 0
    total_files_planned: int = 0
    total_files_moved: int = 0
    total_skipped: int = 0
    total_errors: int = 0
    category_breakdown: dict[str, int] = field(default_factory=dict)
    moved_files: list[str] = field(default_factory=list)
    skipped_files: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-serializable dictionary."""
        return {
            "batch_id": self.batch_id,
            "mode": self.mode,
            "started_at": self.started_at.isoformat(),
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "status": self.status,
            "total_files_scanned": self.total_files_scanned,
            "total_files_planned": self.total_files_planned,
            "total_files_moved": self.total_files_moved,
            "total_skipped": self.total_skipped,
            "total_errors": self.total_errors,
            "category_breakdown": self.category_breakdown,
            "moved_files": self.moved_files,
            "skipped_files": self.skipped_files,
        }
