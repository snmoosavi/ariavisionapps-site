"""Optional watchdog-powered auto organization."""

from __future__ import annotations

import logging
import threading
import time
from pathlib import Path
from typing import Iterable

from smart_file_organizer.core.mover import Mover
from smart_file_organizer.core.scanner import Scanner
from smart_file_organizer.models import WatchedFolder

LOGGER = logging.getLogger(__name__)


class AutoOrganizer:
    """Monitor folders and safely organize stable new files."""

    def __init__(self, scanner: Scanner, mover: Mover, stability_seconds: int = 3) -> None:
        self.scanner = scanner
        self.mover = mover
        self.stability_seconds = stability_seconds
        self._observer = None
        self._timers: dict[Path, threading.Timer] = {}
        self._roots: list[Path] = []

    def start(self, watched_folders: Iterable[WatchedFolder]) -> None:
        """Start watchdog observers for enabled watched folders."""
        try:
            from watchdog.events import FileSystemEventHandler
            from watchdog.observers import Observer
        except ImportError as exc:
            raise RuntimeError("watchdog is not installed") from exc

        auto_organizer = self

        class Handler(FileSystemEventHandler):
            def on_created(self, event) -> None:  # type: ignore[no-untyped-def]
                if not event.is_directory:
                    auto_organizer.queue_path(Path(event.src_path))

            def on_modified(self, event) -> None:  # type: ignore[no-untyped-def]
                if not event.is_directory:
                    auto_organizer.queue_path(Path(event.src_path))

        self.stop()
        observer = Observer()
        self._roots = [folder.path for folder in watched_folders if folder.is_enabled and folder.path.exists()]
        for root in self._roots:
            observer.schedule(Handler(), str(root), recursive=True)
        observer.start()
        self._observer = observer
        LOGGER.info("Auto organizer started for %s folders", len(self._roots))

    def stop(self) -> None:
        """Stop observers and pending timers."""
        for timer in self._timers.values():
            timer.cancel()
        self._timers.clear()
        if self._observer is not None:
            self._observer.stop()
            self._observer.join(timeout=5)
            self._observer = None
            LOGGER.info("Auto organizer stopped")

    def queue_path(self, path: Path) -> None:
        """Debounce a changed file path before stability checks."""
        existing = self._timers.pop(path, None)
        if existing:
            existing.cancel()
        timer = threading.Timer(self.stability_seconds, self._process_if_stable, args=(path,))
        timer.daemon = True
        self._timers[path] = timer
        timer.start()

    def _process_if_stable(self, path: Path) -> None:
        self._timers.pop(path, None)
        if not path.exists() or not path.is_file():
            return
        try:
            first_size = path.stat().st_size
            time.sleep(self.stability_seconds)
            second_size = path.stat().st_size
        except OSError as exc:
            LOGGER.warning("Skipping unstable file %s: %s", path, exc)
            return
        if first_size != second_size:
            LOGGER.info("Skipping changing file %s", path)
            return

        root = self._matching_root(path)
        if root is None:
            return
        plan = self.scanner.plan_file(path, root)
        self.mover.apply_plans([plan], mode="auto")

    def _matching_root(self, path: Path) -> Path | None:
        for root in self._roots:
            try:
                path.resolve().relative_to(root.resolve())
                return root
            except ValueError:
                continue
        return None
