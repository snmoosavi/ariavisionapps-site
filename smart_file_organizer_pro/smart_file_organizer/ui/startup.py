"""Windows startup registration helpers."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from PyQt6.QtCore import QSettings

RUN_KEY = r"HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run"
RUN_VALUE_NAME = "Smart File Organizer Pro"


def startup_command() -> str:
    """Return the command stored in HKCU Run for launching this app."""
    if getattr(sys, "frozen", False):
        return subprocess.list2cmdline([sys.executable, "--start-minimized"])
    main_path = Path(__file__).resolve().parents[2] / "main.py"
    return subprocess.list2cmdline([sys.executable, str(main_path), "--start-minimized"])


def is_startup_enabled() -> bool:
    """Return True when the app has a HKCU Run entry."""
    if os.name != "nt":
        return False
    settings = QSettings(RUN_KEY, QSettings.Format.NativeFormat)
    return bool(str(settings.value(RUN_VALUE_NAME, "")).strip())


def set_startup_enabled(enabled: bool) -> tuple[bool, str | None]:
    """Enable or disable launch at Windows sign-in for the current user."""
    if os.name != "nt":
        return False, "Start with Windows is only available on Windows."

    settings = QSettings(RUN_KEY, QSettings.Format.NativeFormat)
    if enabled:
        settings.setValue(RUN_VALUE_NAME, startup_command())
    else:
        settings.remove(RUN_VALUE_NAME)
    settings.sync()

    if settings.status() != QSettings.Status.NoError:
        return False, "Windows startup settings could not be updated."
    return True, None
