"""QSettings-backed desktop preferences."""

from __future__ import annotations

from PyQt6.QtCore import QSettings

ORGANIZATION_NAME = "Aria Vision"
APPLICATION_NAME = "Smart File Organizer Pro"

THEME_KEY = "appearance/theme"
RUN_IN_TRAY_KEY = "desktop/run_in_system_tray"
START_WITH_WINDOWS_KEY = "desktop/start_with_windows"


class Preferences:
    """Persist user interface preferences with QSettings."""

    def __init__(self) -> None:
        self.settings = QSettings(ORGANIZATION_NAME, APPLICATION_NAME)

    def theme(self, default: str = "Light") -> str:
        """Return the selected theme name."""
        value = str(self.settings.value(THEME_KEY, default))
        return value if value in {"Light", "Dark"} else default

    def set_theme(self, theme: str) -> None:
        """Persist the selected theme name."""
        self.settings.setValue(THEME_KEY, theme if theme in {"Light", "Dark"} else "Light")
        self.settings.sync()

    def run_in_system_tray(self) -> bool:
        """Return whether closing the window should keep the app in the tray."""
        return self._bool_value(RUN_IN_TRAY_KEY, False)

    def set_run_in_system_tray(self, enabled: bool) -> None:
        """Persist the system tray background preference."""
        self.settings.setValue(RUN_IN_TRAY_KEY, bool(enabled))
        self.settings.sync()

    def start_with_windows(self) -> bool:
        """Return whether the user requested Windows startup launch."""
        return self._bool_value(START_WITH_WINDOWS_KEY, False)

    def set_start_with_windows(self, enabled: bool) -> None:
        """Persist the Windows startup preference."""
        self.settings.setValue(START_WITH_WINDOWS_KEY, bool(enabled))
        self.settings.sync()

    def _bool_value(self, key: str, default: bool) -> bool:
        value = self.settings.value(key, default)
        if isinstance(value, bool):
            return value
        return str(value).lower() in {"1", "true", "yes", "on"}
