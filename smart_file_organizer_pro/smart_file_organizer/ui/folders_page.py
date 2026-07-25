"""Watched folders management page."""

from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QFileDialog, QHBoxLayout, QMessageBox, QPushButton, QTableWidget, QTableWidgetItem, QVBoxLayout, QWidget

from smart_file_organizer.core.db import Database


class FoldersPage(QWidget):
    """List, add, remove, and toggle watched folders."""

    folders_changed = pyqtSignal()

    def __init__(self, db: Database) -> None:
        super().__init__()
        self.db = db
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        buttons = QHBoxLayout()
        for text, callback in (
            ("Add Folder", self.add_folder),
            ("Remove Folder", self.remove_selected),
            ("Enable/Disable", self.toggle_selected),
            ("Refresh", self.refresh),
        ):
            button = QPushButton(text)
            button.clicked.connect(callback)
            buttons.addWidget(button)
        buttons.addStretch(1)
        layout.addLayout(buttons)

        self.table = QTableWidget(0, 4)
        self.table.setHorizontalHeaderLabels(["ID", "Folder", "Display name", "Enabled"])
        self.table.setColumnHidden(0, True)
        self.table.setAlternatingRowColors(True)
        layout.addWidget(self.table)
        self.refresh()

    def refresh(self) -> None:
        """Reload watched folders."""
        folders = self.db.get_watched_folders()
        self.table.setRowCount(len(folders))
        for row, folder in enumerate(folders):
            values = [str(folder.id or ""), str(folder.path), folder.display_name or folder.path.name, "Yes" if folder.is_enabled else "No"]
            for column, value in enumerate(values):
                self.table.setItem(row, column, QTableWidgetItem(value))
        self.table.resizeColumnsToContents()

    def add_folder(self) -> None:
        """Prompt for and add a watched folder."""
        folder = QFileDialog.getExistingDirectory(self, "Add watched folder")
        if not folder:
            return
        self.db.add_watched_folder(Path(folder), Path(folder).name, True)
        self.refresh()
        self.folders_changed.emit()

    def remove_selected(self) -> None:
        """Remove the selected watched folder."""
        folder_id = self._selected_folder_id()
        if folder_id is None:
            return
        if QMessageBox.question(self, "Remove folder", "Remove this watched folder?") != QMessageBox.StandardButton.Yes:
            return
        self.db.remove_watched_folder(folder_id)
        self.refresh()
        self.folders_changed.emit()

    def toggle_selected(self) -> None:
        """Enable or disable the selected watched folder."""
        row = self.table.currentRow()
        folder_id = self._selected_folder_id()
        if folder_id is None or row < 0:
            return
        enabled = self.table.item(row, 3).text() != "Yes"
        self.db.set_watched_folder_enabled(folder_id, enabled)
        self.refresh()
        self.folders_changed.emit()

    def _selected_folder_id(self) -> int | None:
        row = self.table.currentRow()
        if row < 0:
            return None
        item = self.table.item(row, 0)
        if not item:
            return None
        try:
            return int(item.text())
        except ValueError:
            return None
