"""CSV and JSON report export."""

from __future__ import annotations

import csv
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from smart_file_organizer.app_paths import reports_dir
from smart_file_organizer.core.db import Database
from smart_file_organizer.models import BatchSummary


class Reporter:
    """Build and export batch reports."""

    def __init__(self, output_dir: Path | None = None) -> None:
        self.output_dir = output_dir or reports_dir()
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def build_summary(self, db: Database, batch_id: int) -> BatchSummary:
        """Build a summary from persisted batch and move rows."""
        batch = db.get_batch(batch_id)
        if not batch:
            raise ValueError(f"Batch {batch_id} does not exist")
        rows = db.get_move_history(batch_id)
        status_counts = Counter(row["status"] for row in rows)
        category_counts = Counter(row["category"] for row in rows)
        started_at = datetime.fromisoformat(batch["started_at"])
        finished_at = datetime.fromisoformat(batch["finished_at"]) if batch["finished_at"] else None
        return BatchSummary(
            batch_id=batch_id,
            mode=batch["mode"],
            started_at=started_at,
            finished_at=finished_at,
            status=batch["status"],
            total_files_scanned=len(rows),
            total_files_planned=sum(1 for row in rows if row["status"] in {"PLANNED", "MOVED", "UNDONE"}),
            total_files_moved=status_counts.get("MOVED", 0) + status_counts.get("UNDONE", 0),
            total_skipped=status_counts.get("SKIPPED", 0),
            total_errors=status_counts.get("ERROR", 0),
            category_breakdown=dict(category_counts),
            moved_files=[row["final_path"] for row in rows if row["final_path"] and row["status"] in {"MOVED", "UNDONE"}],
            skipped_files=[
                {"source_path": row["source_path"], "status": row["status"], "reason": row["error_message"] or row["move_reason"]}
                for row in rows
                if row["status"] in {"SKIPPED", "ERROR"}
            ],
        )

    def export_json(self, db: Database, batch_id: int) -> Path:
        """Export a JSON report and return its path."""
        rows = db.get_move_history(batch_id)
        summary = self.build_summary(db, batch_id)
        payload: dict[str, Any] = {"summary": summary.to_dict(), "items": rows}
        path = self.output_dir / f"batch_{batch_id}_{self._timestamp()}.json"
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return path

    def export_csv(self, db: Database, batch_id: int) -> Path:
        """Export a CSV report and return its path."""
        rows = db.get_move_history(batch_id)
        path = self.output_dir / f"batch_{batch_id}_{self._timestamp()}.csv"
        columns = [
            "id",
            "batch_id",
            "file_name",
            "source_path",
            "destination_path",
            "final_path",
            "category",
            "file_size",
            "last_modified_at",
            "move_reason",
            "status",
            "error_message",
            "moved_at",
            "undone_at",
        ]
        with path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=columns, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)
        return path

    def _timestamp(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
