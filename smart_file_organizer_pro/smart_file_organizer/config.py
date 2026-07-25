"""Default settings and category configuration."""

from __future__ import annotations

DEFAULT_SETTINGS: dict[str, str] = {
    "auto_mode_enabled": "false",
    "archive_old_files_enabled": "true",
    "archive_age_days": "90",
    "skip_hidden_files": "true",
    "skip_desktop_shortcuts": "true",
    "theme": "Light",
}

DEFAULT_RULES: dict[str, tuple[str, ...]] = {
    "Images": (
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".tif",
        ".tiff",
        ".heic",
        ".svg",
    ),
    "Documents": (".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt", ".md"),
    "Spreadsheets": (".xls", ".xlsx", ".csv", ".ods"),
    "Presentations": (".ppt", ".pptx", ".odp"),
    "Installers": (".exe", ".msi", ".msix", ".appx", ".appxbundle"),
    "Archives": (".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"),
    "Videos": (".mp4", ".mov", ".avi", ".mkv", ".wmv", ".webm", ".m4v"),
    "Audio": (".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma"),
    "Code": (
        ".py",
        ".js",
        ".ts",
        ".html",
        ".css",
        ".json",
        ".xml",
        ".sql",
        ".cs",
        ".java",
        ".cpp",
        ".c",
        ".h",
        ".php",
    ),
    "Others": (),
}

TEMP_DOWNLOAD_EXTENSIONS = {".crdownload", ".part", ".tmp", ".download"}
ARCHIVE_FOLDER_NAME = "Archive"
