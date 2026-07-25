"""Rules management page."""

from __future__ import annotations

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QHBoxLayout, QInputDialog, QMessageBox, QPushButton, QTableWidget, QTableWidgetItem, QVBoxLayout, QWidget

from smart_file_organizer.core.db import Database


class RulesPage(QWidget):
    """Display and edit category extension rules."""

    rules_changed = pyqtSignal()

    def __init__(self, db: Database) -> None:
        super().__init__()
        self.db = db
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        buttons = QHBoxLayout()
        for text, callback in (
            ("Enable/Disable", self.toggle_selected),
            ("Add Extension", self.add_extension),
            ("Remove Extension", self.remove_extension),
            ("Restore Defaults", self.restore_defaults),
            ("Refresh", self.refresh),
        ):
            button = QPushButton(text)
            button.clicked.connect(callback)
            buttons.addWidget(button)
        buttons.addStretch(1)
        layout.addLayout(buttons)

        self.table = QTableWidget(0, 4)
        self.table.setHorizontalHeaderLabels(["ID", "Category", "Extensions", "Enabled"])
        self.table.setColumnHidden(0, True)
        self.table.setAlternatingRowColors(True)
        layout.addWidget(self.table)
        self.refresh()

    def refresh(self) -> None:
        """Reload rules."""
        rules = self.db.get_rules()
        self.table.setRowCount(len(rules))
        for row, rule in enumerate(rules):
            values = [
                str(rule.id or ""),
                rule.category,
                ", ".join(rule.extensions) if rule.extensions else "(fallback)",
                "Yes" if rule.is_enabled else "No",
            ]
            for column, value in enumerate(values):
                self.table.setItem(row, column, QTableWidgetItem(value))
        self.table.resizeColumnsToContents()

    def toggle_selected(self) -> None:
        """Enable or disable the selected rule."""
        row = self.table.currentRow()
        rule_id = self._selected_rule_id()
        if rule_id is None or row < 0:
            return
        enabled = self.table.item(row, 3).text() != "Yes"
        self.db.set_rule_enabled(rule_id, enabled)
        self.refresh()
        self.rules_changed.emit()

    def add_extension(self) -> None:
        """Add an extension to the selected category."""
        rule_id = self._selected_rule_id()
        if rule_id is None:
            return
        extension, ok = QInputDialog.getText(self, "Add extension", "Extension:")
        if ok and extension.strip():
            self.db.add_extension_to_rule(rule_id, extension)
            self.refresh()
            self.rules_changed.emit()

    def remove_extension(self) -> None:
        """Remove an extension from the selected category."""
        rule_id = self._selected_rule_id()
        if rule_id is None:
            return
        extension, ok = QInputDialog.getText(self, "Remove extension", "Extension:")
        if ok and extension.strip():
            self.db.remove_extension_from_rule(rule_id, extension)
            self.refresh()
            self.rules_changed.emit()

    def restore_defaults(self) -> None:
        """Restore default rules after confirmation."""
        if QMessageBox.question(self, "Restore rules", "Restore the default category rules?") != QMessageBox.StandardButton.Yes:
            return
        self.db.restore_default_rules()
        self.refresh()
        self.rules_changed.emit()

    def _selected_rule_id(self) -> int | None:
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
