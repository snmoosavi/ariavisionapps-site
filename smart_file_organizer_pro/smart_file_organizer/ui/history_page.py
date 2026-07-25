"""History and report export page."""

from __future__ import annotations

from PyQt6.QtWidgets import QHBoxLayout, QMessageBox, QPushButton, QSplitter, QTableWidget, QTableWidgetItem, QVBoxLayout, QWidget

from smart_file_organizer.core.db import Database
from smart_file_organizer.core.reporter import Reporter


class HistoryPage(QWidget):
    """Show batches and move history with export actions."""

    def __init__(self, db: Database, reporter: Reporter) -> None:
        super().__init__()
        self.db = db
        self.reporter = reporter
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        buttons = QHBoxLayout()
        for text, callback in (
            ("Refresh", self.refresh),
            ("Export CSV Report", self.export_csv),
            ("Export JSON Report", self.export_json),
        ):
            button = QPushButton(text)
            button.clicked.connect(callback)
            buttons.addWidget(button)
        buttons.addStretch(1)
        layout.addLayout(buttons)

        splitter = QSplitter()
        self.batches = QTableWidget(0, 5)
        self.batches.setHorizontalHeaderLabels(["ID", "Mode", "Started", "Finished", "Status"])
        self.batches.itemSelectionChanged.connect(self.load_selected_history)
        self.history = QTableWidget(0, 8)
        self.history.setHorizontalHeaderLabels(["File", "Source", "Destination", "Final", "Category", "Reason", "Status", "Error"])
        splitter.addWidget(self.batches)
        splitter.addWidget(self.history)
        splitter.setSizes([320, 820])
        layout.addWidget(splitter)
        self.refresh()

    def refresh(self) -> None:
        """Reload batches and selected history."""
        batches = self.db.get_batches()
        self.batches.setRowCount(len(batches))
        for row, batch in enumerate(batches):
            values = [batch["id"], batch["mode"], batch["started_at"], batch["finished_at"] or "", batch["status"]]
            for column, value in enumerate(values):
                self.batches.setItem(row, column, QTableWidgetItem(str(value)))
        self.batches.resizeColumnsToContents()
        self.load_selected_history()

    def load_selected_history(self) -> None:
        """Load move history for the selected batch."""
        batch_id = self._selected_batch_id()
        rows = self.db.get_move_history(batch_id) if batch_id else []
        self.history.setRowCount(len(rows))
        for row_index, row in enumerate(rows):
            values = [
                row["file_name"],
                row["source_path"],
                row["destination_path"],
                row["final_path"] or "",
                row["category"],
                row["move_reason"] or "",
                row["status"],
                row["error_message"] or "",
            ]
            for column, value in enumerate(values):
                self.history.setItem(row_index, column, QTableWidgetItem(str(value)))
        self.history.resizeColumnsToContents()

    def export_csv(self) -> None:
        """Export the selected batch as CSV."""
        self._export("csv")

    def export_json(self) -> None:
        """Export the selected batch as JSON."""
        self._export("json")

    def _export(self, format_name: str) -> None:
        batch_id = self._selected_batch_id()
        if batch_id is None:
            QMessageBox.information(self, "Export report", "Select a batch first.")
            return
        path = self.reporter.export_csv(self.db, batch_id) if format_name == "csv" else self.reporter.export_json(self.db, batch_id)
        QMessageBox.information(self, "Export report", f"Report saved:\n{path}")

    def _selected_batch_id(self) -> int | None:
        row = self.batches.currentRow()
        if row < 0:
            return None
        item = self.batches.item(row, 0)
        if not item:
            return None
        try:
            return int(item.text())
        except ValueError:
            return None
