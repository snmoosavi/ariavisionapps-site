"""Conservative safety exclusions used before planning moves."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable

from smart_file_organizer.config import TEMP_DOWNLOAD_EXTENSIONS

WINDOWS_FILE_ATTRIBUTE_HIDDEN = 0x2
WINDOWS_FILE_ATTRIBUTE_SYSTEM = 0x4


def is_within_path(path: Path, parent: Path) -> bool:
    """Return True when path is inside parent."""
    try:
        path.resolve().relative_to(parent.resolve())
        return True
    except ValueError:
        return False


def _windows_attributes(path: Path) -> int:
    if os.name != "nt":
        return 0
    try:
        import ctypes

        attrs = ctypes.windll.kernel32.GetFileAttributesW(str(path))
    except Exception:
        return 0
    return 0 if attrs == -1 else int(attrs)


def is_hidden_or_system(path: Path) -> bool:
    """Return True for dot-prefixed, hidden, or system files."""
    if any(part.startswith(".") for part in path.parts if part not in {path.anchor, ""}):
        return True
    attrs = _windows_attributes(path)
    return bool(attrs & WINDOWS_FILE_ATTRIBUTE_HIDDEN or attrs & WINDOWS_FILE_ATTRIBUTE_SYSTEM)


def is_temporary_download(path: Path) -> bool:
    """Return True for temporary download suffixes."""
    return path.suffix.lower() in TEMP_DOWNLOAD_EXTENSIONS


def is_desktop_folder(path: Path) -> bool:
    """Return True when a watched root looks like Desktop."""
    return path.name.lower() == "desktop"


def is_desktop_shortcut(path: Path, watched_root: Path) -> bool:
    """Return True for Desktop .lnk files."""
    return is_desktop_folder(watched_root) and path.suffix.lower() == ".lnk"


def is_inside_managed_folder(path: Path, watched_root: Path, managed_names: Iterable[str]) -> bool:
    """Return True when a file already lives under a managed category or archive folder."""
    try:
        relative = path.resolve().relative_to(watched_root.resolve())
    except ValueError:
        return False
    if len(relative.parts) < 2:
        return False
    managed = {name.lower() for name in managed_names}
    return relative.parts[0].lower() in managed


def is_inside_any_app_data_path(path: Path, app_data_paths: Iterable[Path] | None) -> bool:
    """Return True when path is inside an app-owned data directory."""
    if not app_data_paths:
        return False
    return any(is_within_path(path, app_path) for app_path in app_data_paths)


def safety_exclusion_reason(
    path: Path,
    watched_root: Path,
    managed_names: Iterable[str],
    skip_hidden_files: bool = True,
    skip_desktop_shortcuts: bool = True,
    app_data_paths: Iterable[Path] | None = None,
) -> str | None:
    """Return a human-readable skip reason, or None when the file is eligible."""
    if not path.exists():
        return "File no longer exists"
    if not path.is_file():
        return "Folders are not moved"
    if is_inside_any_app_data_path(path, app_data_paths):
        return "App data files are protected"
    if is_temporary_download(path):
        return "Temporary download file"
    if skip_hidden_files and is_hidden_or_system(path):
        return "Hidden or system file"
    if skip_desktop_shortcuts and is_desktop_shortcut(path, watched_root):
        return "Desktop shortcut"
    if is_inside_managed_folder(path, watched_root, managed_names):
        return "Already inside a managed destination folder"
    return None
