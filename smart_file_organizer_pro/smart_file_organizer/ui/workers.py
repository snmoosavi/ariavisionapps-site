"""Background workers for keeping the PyQt UI responsive."""

from __future__ import annotations

from PyQt6.QtCore import QThread, pyqtSignal

from smart_file_organizer.core.history import HistoryService
from smart_file_organizer.core.mover import Mover
from smart_file_organizer.core.scanner import Scanner
from smart_file_organizer.models import BatchSummary, FilePlan, WatchedFolder


class ScanWorker(QThread):
    """Scan watched folders in a worker thread."""

    completed = pyqtSignal(list)
    failed = pyqtSignal(str)

    def __init__(self, scanner: Scanner, folders: list[WatchedFolder]) -> None:
        super().__init__()
        self.scanner = scanner
        self.folders = folders

    def run(self) -> None:
        try:
            self.completed.emit(self.scanner.scan_watched_folders(self.folders))
        except Exception as exc:
            self.failed.emit(str(exc))


class MoveWorker(QThread):
    """Apply file moves in a worker thread."""

    completed = pyqtSignal(object)
    failed = pyqtSignal(str)

    def __init__(self, mover: Mover, plans: list[FilePlan], mode: str = "manual") -> None:
        super().__init__()
        self.mover = mover
        self.plans = plans
        self.mode = mode

    def run(self) -> None:
        try:
            summary: BatchSummary = self.mover.apply_plans(self.plans, self.mode)
            self.completed.emit(summary)
        except Exception as exc:
            self.failed.emit(str(exc))


class UndoWorker(QThread):
    """Undo the latest applied batch in a worker thread."""

    completed = pyqtSignal(object)
    failed = pyqtSignal(str)

    def __init__(self, history: HistoryService) -> None:
        super().__init__()
        self.history = history

    def run(self) -> None:
        try:
            self.completed.emit(self.history.undo_last_batch())
        except Exception as exc:
            self.failed.emit(str(exc))
