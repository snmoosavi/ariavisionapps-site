"""Apply planned moves safely and record results."""

from __future__ import annotations

import shutil
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from smart_file_organizer.core.db import Database
from smart_file_organizer.models import BatchSummary, FilePlan, MoveResult


def make_unique_path(path: Path) -> Path:
    """Return a non-existing path by appending a numeric suffix when needed."""
    candidate = Path(path)
    if not candidate.exists():
        return candidate
    parent = candidate.parent
    stem = candidate.stem
    suffix = candidate.suffix
    index = 1
    while True:
        next_candidate = parent / f"{stem} ({index}){suffix}"
        if not next_candidate.exists():
            return next_candidate
        index += 1


class Mover:
    """Execute FilePlan moves without deleting or overwriting files."""

    def __init__(self, db: Database | None = None) -> None:
        self.db = db

    def apply_plans(self, plans: Iterable[FilePlan], mode: str = "manual") -> BatchSummary:
        """Move planned files and persist a batch summary."""
        plan_list = list(plans)
        started_at = datetime.now(timezone.utc).replace(microsecond=0)
        batch_id = self.db.create_batch(mode=mode, status="PREVIEW") if self.db else None
        results = [self._apply_one(plan) for plan in plan_list]

        if self.db and batch_id is not None:
            self.db.bulk_record_results(batch_id, results)

        finished_at = datetime.now(timezone.utc).replace(microsecond=0)
        summary = self._summarize(batch_id, mode, started_at, finished_at, plan_list, results)

        if self.db and batch_id is not None:
            self.db.finish_batch(batch_id, summary.status, summary.to_dict())
        return summary

    def _apply_one(self, plan: FilePlan) -> MoveResult:
        if plan.status != "PLANNED":
            return MoveResult(plan=plan, status="SKIPPED", error_message=plan.error_message or plan.reason)

        source = plan.source_path
        if not source.exists():
            return MoveResult(plan=plan, status="SKIPPED", error_message="File no longer exists")
        if not source.is_file():
            return MoveResult(plan=plan, status="SKIPPED", error_message="Folders are not moved")

        try:
            destination = make_unique_path(plan.destination_path)
            if source.resolve() == destination.resolve():
                return MoveResult(plan=plan, status="SKIPPED", error_message="Source already matches destination")
            destination.parent.mkdir(parents=True, exist_ok=True)
            final_path = Path(shutil.move(str(source), str(destination)))
            return MoveResult(
                plan=plan,
                status="MOVED",
                final_path=final_path,
                moved_at=datetime.now(timezone.utc).replace(microsecond=0),
            )
        except PermissionError as exc:
            return MoveResult(plan=plan, status="ERROR", error_message=f"Permission denied: {exc}")
        except OSError as exc:
            return MoveResult(plan=plan, status="ERROR", error_message=str(exc))

    def _summarize(
        self,
        batch_id: int | None,
        mode: str,
        started_at: datetime,
        finished_at: datetime,
        plans: list[FilePlan],
        results: list[MoveResult],
    ) -> BatchSummary:
        status_counts = Counter(result.status for result in results)
        category_counts = Counter(result.plan.category for result in results)
        errors = status_counts.get("ERROR", 0)
        moved = status_counts.get("MOVED", 0)
        skipped = status_counts.get("SKIPPED", 0)
        if errors and moved:
            batch_status = "PARTIAL"
        elif errors:
            batch_status = "ERROR"
        else:
            batch_status = "APPLIED"

        return BatchSummary(
            batch_id=batch_id,
            mode=mode,
            started_at=started_at,
            finished_at=finished_at,
            status=batch_status,
            total_files_scanned=len(plans),
            total_files_planned=sum(1 for plan in plans if plan.status == "PLANNED"),
            total_files_moved=moved,
            total_skipped=skipped,
            total_errors=errors,
            category_breakdown=dict(category_counts),
            moved_files=[str(result.final_path) for result in results if result.status == "MOVED" and result.final_path],
            skipped_files=[
                {
                    "source_path": str(result.plan.source_path),
                    "status": result.status,
                    "reason": result.error_message or result.plan.reason,
                }
                for result in results
                if result.status in {"SKIPPED", "ERROR"}
            ],
        )
