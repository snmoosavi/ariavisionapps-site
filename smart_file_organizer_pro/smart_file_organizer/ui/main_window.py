"""Main PyQt6 window for Smart File Organizer Pro."""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

from PyQt6.QtCore import QUrl
from PyQt6.QtGui import QAction, QDesktopServices
from PyQt6.QtWidgets import (
    QApplication,
    QLabel,
    QMainWindow,
    QMenu,
    QMessageBox,
    QProgressBar,
    QStyle,
    QSystemTrayIcon,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from smart_file_organizer import __version__
from smart_file_organizer.app_paths import app_log_path, ensure_app_directories, reports_dir
from smart_file_organizer.core.db import Database
from smart_file_organizer.core.history import HistoryService
from smart_file_organizer.core.mover import Mover
from smart_file_organizer.core.reporter import Reporter
from smart_file_organizer.core.rules_engine import RulesEngine
from smart_file_organizer.core.scanner import Scanner
from smart_file_organizer.models import BatchSummary, FilePlan
from smart_file_organizer.ui.dashboard_page import DashboardPage
from smart_file_organizer.ui.folders_page import FoldersPage
from smart_file_organizer.ui.history_page import HistoryPage
from smart_file_organizer.ui.preferences import APPLICATION_NAME, ORGANIZATION_NAME, Preferences
from smart_file_organizer.ui.preview_page import PreviewPage
from smart_file_organizer.ui.rules_page import RulesPage
from smart_file_organizer.ui.settings_page import SettingsPage
from smart_file_organizer.ui.workers import MoveWorker, ScanWorker, UndoWorker

LOGGER = logging.getLogger(__name__)


def setup_logging() -> None:
    """Configure file logging."""
    logging.basicConfig(
        filename=app_log_path(),
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


class MainWindow(QMainWindow):
    """Main desktop application window."""

    def __init__(self) -> None:
        super().__init__()
        ensure_app_directories()
        setup_logging()
        LOGGER.info("App start")

        self.db = Database()
        self.db.seed_defaults()
        self.preferences = Preferences()
        self.reporter = Reporter()
        self.current_plans: list[FilePlan] = []
        self.worker = None
        self._allow_quit = False
        self._tray_notice_shown = False

        self.setWindowTitle("Smart File Organizer Pro")
        self.resize(1240, 800)
        self.setMinimumSize(980, 640)
        self._setup_tray()

        shell = QWidget()
        layout = QVBoxLayout(shell)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        header = self._build_header()
        layout.addWidget(header)

        self.tabs = QTabWidget()
        self.dashboard = DashboardPage()
        self.preview = PreviewPage()
        self.rules = RulesPage(self.db)
        self.folders = FoldersPage(self.db)
        self.history = HistoryPage(self.db, self.reporter)
        self.settings = SettingsPage(self.db)

        self.tabs.addTab(self.dashboard, "Dashboard")
        self.tabs.addTab(self.preview, "Preview")
        self.tabs.addTab(self.rules, "Rules")
        self.tabs.addTab(self.folders, "Folders")
        self.tabs.addTab(self.history, "History")
        self.tabs.addTab(self.settings, "Settings")
        layout.addWidget(self.tabs)

        self.progress = QProgressBar()
        self.progress.setMaximumHeight(8)
        self.progress.setTextVisible(False)
        self.progress.hide()
        layout.addWidget(self.progress)

        self.setCentralWidget(shell)
        self.statusBar().showMessage("Ready")
        self._connect_signals()
        self._apply_theme()
        self._sync_tray_icon()
        self.refresh_dashboard()

    def _build_header(self) -> QWidget:
        header = QWidget()
        header.setObjectName("appHeader")
        layout = QVBoxLayout(header)
        layout.setContentsMargins(24, 18, 24, 18)
        title = QLabel("Smart File Organizer Pro")
        title.setObjectName("appTitle")
        subtitle = QLabel("Organize Downloads, Desktop, and folders automatically.")
        subtitle.setObjectName("appSubtitle")
        layout.addWidget(title)
        layout.addWidget(subtitle)
        return header

    def _connect_signals(self) -> None:
        self.dashboard.scan_requested.connect(self.scan_now)
        self.dashboard.preview_requested.connect(lambda: self.tabs.setCurrentWidget(self.preview))
        self.dashboard.apply_requested.connect(self.apply_organization)
        self.dashboard.undo_requested.connect(self.undo_last_batch)
        self.dashboard.open_reports_requested.connect(self.open_reports_folder)
        self.preview.apply_requested.connect(self.apply_organization)
        self.rules.rules_changed.connect(self.refresh_dashboard)
        self.folders.folders_changed.connect(self.refresh_dashboard)
        self.settings.settings_changed.connect(self.on_settings_changed)

    def _setup_tray(self) -> None:
        """Create the system tray icon and menu."""
        icon = self.style().standardIcon(QStyle.StandardPixmap.SP_DirHomeIcon)
        self.setWindowIcon(icon)
        self.tray_icon = QSystemTrayIcon(icon, self)
        self.tray_icon.setToolTip("Smart File Organizer Pro")

        menu = QMenu(self)
        show_action = QAction("Show", self)
        show_action.triggered.connect(self._show_from_tray)
        hide_action = QAction("Hide to tray", self)
        hide_action.triggered.connect(self._hide_to_tray)
        quit_action = QAction("Quit", self)
        quit_action.triggered.connect(self._quit_from_tray)
        menu.addAction(show_action)
        menu.addAction(hide_action)
        menu.addSeparator()
        menu.addAction(quit_action)
        self.tray_icon.setContextMenu(menu)
        self.tray_icon.activated.connect(self._on_tray_activated)

    def make_scanner(self) -> Scanner:
        """Create a scanner from current settings and rules."""
        engine = RulesEngine(
            self.db.get_rules(),
            archive_old_files_enabled=self.db.get_bool_setting("archive_old_files_enabled", True),
            archive_age_days=self.db.get_int_setting("archive_age_days", 90),
        )
        return Scanner(
            engine,
            skip_hidden_files=self.db.get_bool_setting("skip_hidden_files", True),
            skip_desktop_shortcuts=self.db.get_bool_setting("skip_desktop_shortcuts", True),
            app_data_paths=[Path(path) for path in ensure_app_directories().values()],
        )

    def scan_now(self) -> None:
        """Start a manual scan."""
        folders = self.db.get_watched_folders(only_enabled=True)
        if not folders:
            QMessageBox.information(self, "Scan", "Add or enable a watched folder first.")
            return
        self._set_busy("Scanning...")
        worker = ScanWorker(self.make_scanner(), folders)
        worker.completed.connect(self.on_scan_completed)
        worker.failed.connect(self.on_worker_failed)
        worker.finished.connect(self._clear_busy)
        self.worker = worker
        worker.start()

    def on_scan_completed(self, plans: list[FilePlan]) -> None:
        """Handle scan results."""
        self.current_plans = plans
        self.preview.set_plans(plans)
        self.tabs.setCurrentWidget(self.preview)
        planned = sum(1 for plan in plans if plan.status == "PLANNED")
        skipped = sum(1 for plan in plans if plan.status == "SKIPPED")
        self.statusBar().showMessage("Preview ready")
        self.dashboard.add_activity(f"Scan finished: {planned} planned, {skipped} skipped")
        self.dashboard.update_summary({"Last scan time": "Just now"})

    def apply_organization(self) -> None:
        """Confirm and apply current preview."""
        planned_count = sum(1 for plan in self.current_plans if plan.status == "PLANNED")
        if planned_count == 0:
            QMessageBox.information(self, "Apply organization", "There are no planned moves to apply.")
            return
        if QMessageBox.question(self, "Apply organization", f"Move {planned_count} files now?") != QMessageBox.StandardButton.Yes:
            return
        self._set_busy("Moving files...")
        worker = MoveWorker(Mover(self.db), self.current_plans, "manual")
        worker.completed.connect(self.on_move_completed)
        worker.failed.connect(self.on_worker_failed)
        worker.finished.connect(self._clear_busy)
        self.worker = worker
        worker.start()

    def on_move_completed(self, summary: BatchSummary) -> None:
        """Handle completed move batch."""
        self.statusBar().showMessage("Finished")
        report_path = None
        if summary.batch_id is not None:
            report_path = self.reporter.export_json(self.db, summary.batch_id)
        self.dashboard.add_activity(
            f"Batch {summary.batch_id}: {summary.total_files_moved} moved, "
            f"{summary.total_skipped} skipped, {summary.total_errors} errors"
        )
        self.current_plans = []
        self.preview.clear()
        self.refresh_dashboard()
        self.history.refresh()
        message = f"Moved {summary.total_files_moved} files."
        if report_path:
            message += f"\nReport saved:\n{report_path}"
        QMessageBox.information(self, "Organization complete", message)

    def undo_last_batch(self) -> None:
        """Confirm and undo the latest applied batch."""
        if QMessageBox.question(self, "Undo last batch", "Undo the latest applied batch?") != QMessageBox.StandardButton.Yes:
            return
        self._set_busy("Undoing last batch...")
        worker = UndoWorker(HistoryService(self.db))
        worker.completed.connect(self.on_undo_completed)
        worker.failed.connect(self.on_worker_failed)
        worker.finished.connect(self._clear_busy)
        self.worker = worker
        worker.start()

    def on_undo_completed(self, summary: BatchSummary) -> None:
        """Handle completed undo."""
        self.refresh_dashboard()
        self.history.refresh()
        self.dashboard.add_activity(f"Undo batch {summary.batch_id}: {summary.total_files_moved} restored")
        self.statusBar().showMessage("Finished")
        QMessageBox.information(self, "Undo complete", f"Restored {summary.total_files_moved} files.")

    def on_worker_failed(self, message: str) -> None:
        """Show friendly worker failure message."""
        LOGGER.exception("Worker failed: %s", message)
        self.statusBar().showMessage("Error details available")
        QMessageBox.warning(self, "Operation could not finish", "The operation could not finish. Details were saved to the log.")

    def open_reports_folder(self) -> None:
        """Open the reports folder."""
        folder = reports_dir()
        if os.name == "nt":
            os.startfile(folder)  # type: ignore[attr-defined]
        else:
            QDesktopServices.openUrl(QUrl.fromLocalFile(str(folder)))

    def on_settings_changed(self) -> None:
        """Apply changed settings."""
        self._apply_theme()
        self._sync_tray_icon()
        self.refresh_dashboard()
        self.statusBar().showMessage("Settings saved")

    def refresh_dashboard(self) -> None:
        """Refresh dashboard counts."""
        self.dashboard.update_summary(
            {
                "Watched folders": len(self.db.get_watched_folders(only_enabled=True)),
                "Files moved today": self.db.files_moved_today(),
                "Files skipped": self.db.count_move_history_by_status("SKIPPED"),
                "Errors": self.db.count_move_history_by_status("ERROR"),
            }
        )
        self.folders.refresh()
        self.rules.refresh()

    def _set_busy(self, message: str) -> None:
        self.statusBar().showMessage(message)
        self.progress.setRange(0, 0)
        self.progress.show()

    def _clear_busy(self) -> None:
        self.progress.hide()
        if self.statusBar().currentMessage() in {"Scanning...", "Moving files...", "Undoing last batch..."}:
            self.statusBar().showMessage("Ready")

    def _apply_theme(self) -> None:
        theme = self.preferences.theme(self.db.get_setting("theme", "Light") or "Light")
        if theme == "Dark":
            self.setStyleSheet(DARK_STYLESHEET)
        else:
            self.setStyleSheet(LIGHT_STYLESHEET)

    def _sync_tray_icon(self) -> None:
        """Show or hide the tray icon based on the saved preference."""
        tray_enabled = self.preferences.run_in_system_tray()
        tray_available = QSystemTrayIcon.isSystemTrayAvailable()
        should_show = tray_enabled and tray_available
        self.tray_icon.setVisible(should_show)
        app = QApplication.instance()
        if app is not None:
            app.setQuitOnLastWindowClosed(not should_show)
        if tray_enabled and not tray_available:
            self.statusBar().showMessage("System tray is not available")

    def can_start_hidden(self) -> bool:
        """Return True when startup can open directly into the tray."""
        return self.preferences.run_in_system_tray() and self.tray_icon.isVisible()

    def _show_from_tray(self) -> None:
        self.show()
        self.raise_()
        self.activateWindow()

    def _hide_to_tray(self) -> None:
        if self.tray_icon.isVisible():
            self.hide()

    def _quit_from_tray(self) -> None:
        self._allow_quit = True
        QApplication.quit()

    def _on_tray_activated(self, reason: QSystemTrayIcon.ActivationReason) -> None:
        if reason in {QSystemTrayIcon.ActivationReason.Trigger, QSystemTrayIcon.ActivationReason.DoubleClick}:
            if self.isVisible():
                self.hide()
            else:
                self._show_from_tray()

    def closeEvent(self, event) -> None:  # type: ignore[no-untyped-def]
        if not self._allow_quit and self.preferences.run_in_system_tray() and self.tray_icon.isVisible():
            event.ignore()
            self.hide()
            if not self._tray_notice_shown:
                self.tray_icon.showMessage(
                    "Smart File Organizer Pro",
                    "The app is still running in the system tray.",
                    QSystemTrayIcon.MessageIcon.Information,
                    3500,
                )
                self._tray_notice_shown = True
            return
        LOGGER.info("App close")
        self.db.close()
        super().closeEvent(event)


LIGHT_STYLESHEET = """
QMainWindow, QWidget {
    background: #f5f7fb;
    color: #1f2937;
    font-family: Segoe UI, Arial, sans-serif;
    font-size: 10pt;
}
#appHeader {
    background: #ffffff;
    border-bottom: 1px solid #d8dee9;
}
#appTitle {
    font-size: 22pt;
    font-weight: 700;
}
#appSubtitle {
    color: #667085;
}
#summaryCard {
    background: #ffffff;
    border: 1px solid #dde3ee;
    border-radius: 8px;
}
#cardTitle {
    color: #667085;
    font-size: 9pt;
}
#cardValue {
    font-size: 21pt;
    font-weight: 700;
}
#sectionTitle {
    font-size: 13pt;
    font-weight: 700;
}
QPushButton {
    background: #2563eb;
    color: white;
    border: 0;
    border-radius: 6px;
    padding: 8px 12px;
}
QPushButton:hover {
    background: #1d4ed8;
}
QTableWidget, QListWidget {
    background: white;
    border: 1px solid #d8dee9;
    gridline-color: #edf1f7;
}
QHeaderView::section {
    background: #eef2f7;
    padding: 7px;
    border: 0;
    font-weight: 600;
}
QTabWidget::pane {
    border: 0;
}
QTabBar::tab {
    padding: 10px 16px;
}
QTabBar::tab:selected {
    background: #ffffff;
    border-bottom: 2px solid #2563eb;
}
"""

DARK_STYLESHEET = """
QMainWindow, QWidget {
    background: #161a22;
    color: #e5e7eb;
    font-family: Segoe UI, Arial, sans-serif;
    font-size: 10pt;
}
#appHeader, #summaryCard, QTableWidget, QListWidget {
    background: #202633;
    border: 1px solid #343d4f;
}
#appTitle {
    font-size: 22pt;
    font-weight: 700;
}
#appSubtitle, #cardTitle {
    color: #a8b3c7;
}
#cardValue {
    font-size: 21pt;
    font-weight: 700;
}
#sectionTitle {
    font-size: 13pt;
    font-weight: 700;
}
QPushButton {
    background: #3b82f6;
    color: white;
    border: 0;
    border-radius: 6px;
    padding: 8px 12px;
}
QPushButton:hover {
    background: #2563eb;
}
QHeaderView::section {
    background: #2a3242;
    padding: 7px;
    border: 0;
    font-weight: 600;
}
QTabWidget::pane {
    border: 0;
}
QTabBar::tab {
    padding: 10px 16px;
}
QTabBar::tab:selected {
    background: #202633;
    border-bottom: 2px solid #60a5fa;
}
"""


def run() -> int:
    """Run the PyQt application."""
    QApplication.setOrganizationName(ORGANIZATION_NAME)
    QApplication.setApplicationName(APPLICATION_NAME)
    QApplication.setApplicationVersion(__version__)
    app = QApplication(sys.argv)
    window = MainWindow()
    if "--start-minimized" in sys.argv and window.can_start_hidden():
        window.hide()
    else:
        window.show()
    return app.exec()
