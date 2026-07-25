"""Resolve app-owned data, database, log, and report paths."""

from __future__ import annotations

import os
from pathlib import Path

APP_DIR_NAME = "SmartFileOrganizerPro"
APPDATA_OVERRIDE_ENV = "SFO_APPDATA"


def base_app_data_path(create: bool = True) -> Path:
    """Return the per-user app data directory."""
    override = os.environ.get(APPDATA_OVERRIDE_ENV)
    if override:
        base = Path(override)
    else:
        appdata = os.environ.get("APPDATA")
        if appdata:
            base = Path(appdata) / APP_DIR_NAME
        else:
            base = Path.home() / "AppData" / "Roaming" / APP_DIR_NAME
    if create:
        base.mkdir(parents=True, exist_ok=True)
    return base


def database_path(create_parent: bool = True) -> Path:
    """Return the SQLite database path."""
    base = base_app_data_path(create=create_parent)
    return base / "smart_file_organizer.db"


def logs_dir(create: bool = True) -> Path:
    """Return the app log directory."""
    path = base_app_data_path(create=create) / "logs"
    if create:
        path.mkdir(parents=True, exist_ok=True)
    return path


def reports_dir(create: bool = True) -> Path:
    """Return the exported reports directory."""
    path = base_app_data_path(create=create) / "reports"
    if create:
        path.mkdir(parents=True, exist_ok=True)
    return path


def app_log_path(create_parent: bool = True) -> Path:
    """Return the main application log path."""
    return logs_dir(create=create_parent) / "app.log"


def ensure_app_directories() -> dict[str, Path]:
    """Create and return all app-owned directories and files' parent paths."""
    base = base_app_data_path(create=True)
    logs = logs_dir(create=True)
    reports = reports_dir(create=True)
    return {"base": base, "logs": logs, "reports": reports}
