"""Preview page for planned file moves."""

from __future__ import annotations

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QHBoxLayout, QLabel, QPushButton, QTableWidget, QTableWidgetItem, QVBoxLayout, QWidget

from smart_file_organizer.models import FilePlan


class PreviewPage(QWidget):
    """Table of planned and skipped organization items."""

    apply_requested = pyqtSignal()
    clear_requested = pyqtSignal()

    HEADERS = [
        "File name",
        "Current folder",
        "Suggested destination",
        "Category",
        "Size",
        "Last modified date",
        "Reason / matched rule",
        "Status",
    ]

    def __init__(self) -> None:
        super().__init__()
        self.plans: list[FilePlan] = []
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        top = QHBoxLayout()
        self.summary_label = QLabel("No preview yet")
        self.summary_label.setObjectName("sectionTitle")
        top.addWidget(self.summary_label)
        top.addStretch(1)
        apply_button = QPushButton("Apply Organization")
        apply_button.clicked.connect(self.apply_requested.emit)
        clear_button = QPushButton("Clear Preview")
        clear_button.clicked.connect(self.clear)
        clear_button.clicked.connect(self.clear_requested.emit)
        top.addWidget(apply_button)
        top.addWidget(clear_button)
        layout.addLayout(top)

        self.table = QTableWidget(0, len(self.HEADERS))
        self.table.setHorizontalHeaderLabels(self.HEADERS)
        self.table.setAlternatingRowColors(True)
        self.table.setSortingEnabled(True)
        layout.addWidget(self.table)

    def set_plans(self, plans: list[FilePlan]) -> None:
        """Display preview plans."""
        self.plans = plans
        planned = sum(1 for plan in plans if plan.status == "PLANNED")
        skipped = sum(1 for plan in plans if plan.status == "SKIPPED")
        self.summary_label.setText(f"{planned} planned, {skipped} skipped")
        self.table.setSortingEnabled(False)
        self.table.setRowCount(len(plans))
        for row, plan in enumerate(plans):
            values = [
                plan.file_name,
                str(plan.source_path.parent),
                str(plan.destination_path),
                plan.category,
                self._format_size(plan.file_size),
                plan.last_modified_at.strftime("%Y-%m-%d %H:%M"),
                plan.reason,
                plan.status,
            ]
            for column, value in enumerate(values):
                self.table.setItem(row, column, QTableWidgetItem(value))
        self.table.resizeColumnsToContents()
        self.table.setSortingEnabled(True)

    def clear(self) -> None:
        """Clear the preview table."""
        self.plans = []
        self.table.setRowCount(0)
        self.summary_label.setText("No preview yet")

    def _format_size(self, size: int) -> str:
        value = float(size)
        for unit in ("B", "KB", "MB", "GB"):
            if value < 1024 or unit == "GB":
                return f"{value:.0f} {unit}" if unit == "B" else f"{value:.1f} {unit}"
            value /= 1024
        return f"{size} B"
