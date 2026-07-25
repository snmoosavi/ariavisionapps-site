"""Settings page."""

from __future__ import annotations

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QFormLayout,
    QHBoxLayout,
    QMessageBox,
    QPushButton,
    QSpinBox,
    QVBoxLayout,
    QWidget,
)

from smart_file_organizer.core.db import Database
from smart_file_organizer.ui.preferences import Preferences
from smart_file_organizer.ui.startup import is_startup_enabled, set_startup_enabled


class SettingsPage(QWidget):
    """User settings for safety, archive, auto mode, and theme."""

    settings_changed = pyqtSignal()

    def __init__(self, db: Database) -> None:
        super().__init__()
        self.db = db
        self.preferences = Preferences()
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)

        form = QFormLayout()
        self.auto_mode = QCheckBox()
        self.run_in_tray = QCheckBox()
        self.start_with_windows = QCheckBox()
        self.archive_old = QCheckBox()
        self.archive_age = QSpinBox()
        self.archive_age.setRange(1, 3650)
        self.skip_hidden = QCheckBox()
        self.skip_shortcuts = QCheckBox()
        self.theme = QComboBox()
        self.theme.addItems(["Light", "Dark"])

        form.addRow("Auto organize mode", self.auto_mode)
        form.addRow("Run in system tray", self.run_in_tray)
        form.addRow("Start with Windows", self.start_with_windows)
        form.addRow("Archive old files", self.archive_old)
        form.addRow("Archive age days", self.archive_age)
        form.addRow("Skip hidden/system files", self.skip_hidden)
        form.addRow("Skip Desktop shortcuts", self.skip_shortcuts)
        form.addRow("Theme", self.theme)
        layout.addLayout(form)

        buttons = QHBoxLayout()
        save = QPushButton("Save Settings")
        save.clicked.connect(self.save)
        buttons.addWidget(save)
        buttons.addStretch(1)
        layout.addLayout(buttons)
        layout.addStretch(1)
        self.load()

    def load(self) -> None:
        """Load settings into controls."""
        self.auto_mode.setChecked(self.db.get_bool_setting("auto_mode_enabled", False))
        self.run_in_tray.setChecked(self.preferences.run_in_system_tray())
        self.start_with_windows.setChecked(is_startup_enabled() or self.preferences.start_with_windows())
        self.archive_old.setChecked(self.db.get_bool_setting("archive_old_files_enabled", True))
        self.archive_age.setValue(self.db.get_int_setting("archive_age_days", 90))
        self.skip_hidden.setChecked(self.db.get_bool_setting("skip_hidden_files", True))
        self.skip_shortcuts.setChecked(self.db.get_bool_setting("skip_desktop_shortcuts", True))
        theme = self.preferences.theme(self.db.get_setting("theme", "Light") or "Light")
        index = self.theme.findText(theme)
        self.theme.setCurrentIndex(index if index >= 0 else 0)

    def save(self) -> None:
        """Persist settings."""
        self.db.set_setting("auto_mode_enabled", self.auto_mode.isChecked())
        self.preferences.set_run_in_system_tray(self.run_in_tray.isChecked())
        startup_ok, startup_error = set_startup_enabled(self.start_with_windows.isChecked())
        if startup_ok:
            self.preferences.set_start_with_windows(self.start_with_windows.isChecked())
        else:
            self.start_with_windows.setChecked(False)
            self.preferences.set_start_with_windows(False)
            QMessageBox.warning(self, "Start with Windows", startup_error or "Startup could not be updated.")
        self.db.set_setting("archive_old_files_enabled", self.archive_old.isChecked())
        self.db.set_setting("archive_age_days", self.archive_age.value())
        self.db.set_setting("skip_hidden_files", self.skip_hidden.isChecked())
        self.db.set_setting("skip_desktop_shortcuts", self.skip_shortcuts.isChecked())
        self.preferences.set_theme(self.theme.currentText())
        self.db.set_setting("theme", self.theme.currentText())
        self.settings_changed.emit()
