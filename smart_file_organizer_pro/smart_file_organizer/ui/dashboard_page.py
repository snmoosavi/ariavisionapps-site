"""Dashboard page widgets."""

from __future__ import annotations

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QListWidget,
    QPushButton,
    QVBoxLayout,
    QWidget,
)


class DashboardPage(QWidget):
    """Top-level dashboard with summary cards and main commands."""

    scan_requested = pyqtSignal()
    preview_requested = pyqtSignal()
    apply_requested = pyqtSignal()
    undo_requested = pyqtSignal()
    open_reports_requested = pyqtSignal()

    def __init__(self) -> None:
        super().__init__()
        self.cards: dict[str, QLabel] = {}
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 20, 24, 24)
        layout.setSpacing(18)

        card_grid = QGridLayout()
        card_grid.setSpacing(12)
        for index, title in enumerate(("Watched folders", "Files moved today", "Files skipped", "Errors", "Last scan time")):
            frame, value_label = self._card(title, "0")
            self.cards[title] = value_label
            card_grid.addWidget(frame, index // 3, index % 3)
        layout.addLayout(card_grid)

        button_row = QHBoxLayout()
        buttons = [
            ("Scan Now", self.scan_requested),
            ("Preview Organization", self.preview_requested),
            ("Apply Organization", self.apply_requested),
            ("Undo Last Batch", self.undo_requested),
            ("Open Reports Folder", self.open_reports_requested),
        ]
        for text, signal in buttons:
            button = QPushButton(text)
            button.setMinimumHeight(36)
            button.clicked.connect(signal.emit)
            button_row.addWidget(button)
        layout.addLayout(button_row)

        activity_label = QLabel("Recent activity")
        activity_label.setObjectName("sectionTitle")
        layout.addWidget(activity_label)
        self.activity = QListWidget()
        self.activity.setMinimumHeight(180)
        layout.addWidget(self.activity)
        layout.addStretch(1)

    def update_summary(self, values: dict[str, str | int]) -> None:
        """Update dashboard card values."""
        for title, value in values.items():
            label = self.cards.get(title)
            if label:
                label.setText(str(value))

    def add_activity(self, text: str) -> None:
        """Add recent activity text."""
        self.activity.insertItem(0, text)
        while self.activity.count() > 50:
            self.activity.takeItem(self.activity.count() - 1)

    def _card(self, title: str, value: str) -> tuple[QFrame, QLabel]:
        frame = QFrame()
        frame.setObjectName("summaryCard")
        frame.setMinimumHeight(96)
        layout = QVBoxLayout(frame)
        layout.setContentsMargins(16, 14, 16, 14)
        title_label = QLabel(title)
        title_label.setObjectName("cardTitle")
        value_label = QLabel(value)
        value_label.setObjectName("cardValue")
        layout.addWidget(title_label)
        layout.addWidget(value_label)
        layout.addStretch(1)
        return frame, value_label
