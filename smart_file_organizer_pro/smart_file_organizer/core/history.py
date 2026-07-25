"""History queries and undo support."""

from __future__ import annotations

import shutil
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from smart_file_organizer.core.db import Database, utc_now_text
from smart_file_organizer.core.mover import make_unique_path
from smart_file_organizer.models import BatchSummary


class HistoryService:
    """Read move history and undo the latest applied batch."""

    def __init__(self, db: Database) -> None:
        self.db = db

    def undo_last_batch(self) -> BatchSummary:
        """Undo the newest applied batch where moved files still exist."""
        batch_id = self.db.get_latest_applied_batch_id()
        started_at = datetime.now(timezone.utc).replace(microsecond=0)
        if batch_id is None:
            return BatchSummary(batch_id=None, mode="undo", started_at=started_at, finished_at=started_at, status="SKIPPED")

        rows = [row for row in self.db.get_move_history(batch_id) if row["status"] == "MOVED"]
        restored_files: list[str] = []
        skipped_files: list[dict[str, str]] = []
        status_counts: Counter[str] = Counter()

        for row in rows:
            final_path = Path(row["final_path"] or row["destination_path"])
            original_path = Path(row["source_path"])
            if not final_path.exists():
                reason = "Moved file is missing from its destination"
                self.db.update_move_history_status(row["id"], "ERROR", reason, None)
                skipped_files.append({"source_path": str(original_path), "status": "ERROR", "reason": reason})
                status_counts["ERROR"] += 1
                continue

            try:
                target = make_unique_path(original_path)
                target.parent.mkdir(parents=True, exist_ok=True)
                restored = Path(shutil.move(str(final_path), str(target)))
                self.db.update_move_history_status(row["id"], "UNDONE", None, utc_now_text())
                restored_files.append(str(restored))
                status_counts["UNDONE"] += 1
            except PermissionError as exc:
                reason = f"Permission denied: {exc}"
                self.db.update_move_history_status(row["id"], "ERROR", reason, None)
                skipped_files.append({"source_path": str(original_path), "status": "ERROR", "reason": reason})
                status_counts["ERROR"] += 1
            except OSError as exc:
                reason = str(exc)
                self.db.update_move_history_status(row["id"], "ERROR", reason, None)
                skipped_files.append({"source_path": str(original_path), "status": "ERROR", "reason": reason})
                status_counts["ERROR"] += 1

        finished_at = datetime.now(timezone.utc).replace(microsecond=0)
        batch_status = "UNDONE" if status_counts.get("ERROR", 0) == 0 else "PARTIAL"
        self.db.finish_batch(
            batch_id,
            batch_status,
            {
                "undo_restored": len(restored_files),
                "undo_errors": status_counts.get("ERROR", 0),
                "restored_files": restored_files,
                "skipped_files": skipped_files,
            },
        )
        return BatchSummary(
            batch_id=batch_id,
            mode="undo",
            started_at=started_at,
            finished_at=finished_at,
            status=batch_status,
            total_files_scanned=len(rows),
            total_files_planned=len(rows),
            total_files_moved=len(restored_files),
            total_skipped=0,
            total_errors=status_counts.get("ERROR", 0),
            moved_files=restored_files,
            skipped_files=skipped_files,
        )
