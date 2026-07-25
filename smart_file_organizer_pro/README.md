# Smart File Organizer Pro

Smart File Organizer Pro is a safe Windows desktop app for organizing Downloads, Desktop, and user-selected folders by file type and file age. It previews planned moves before manual organization, never deletes files, never overwrites existing files, and records history so the latest applied batch can be undone.

## Features

- Manual folder scans with a full move preview
- Optional real-time folder monitoring with watchdog
- Default categories for images, documents, installers, archives, media, code, and more
- Optional old-file archiving to `Archive/YYYY-MM/<Category>`
- Conservative safety exclusions for temporary downloads, hidden/system files, desktop shortcuts, managed folders, and app data
- Safe conflict handling with `file (1).ext` style names
- SQLite settings, watched folders, rules, batches, and move history
- Undo for the latest applied batch
- CSV and JSON reports under AppData
- PyQt6 desktop UI with dashboard, preview, rules, folders, history, and settings pages
- Pytest coverage for core organizing behavior

## Installation

```powershell
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

## Run The App

```powershell
python main.py
```

## Run Tests

```powershell
pytest
```

## Folder Structure

```text
smart_file_organizer_pro/
    main.py
    requirements.txt
    README.md
    smart_file_organizer/
        app_paths.py
        config.py
        models.py
        core/
            db.py
            history.py
            mover.py
            reporter.py
            rules_engine.py
            safety.py
            scanner.py
            watcher.py
        ui/
            dashboard_page.py
            folders_page.py
            history_page.py
            main_window.py
            preview_page.py
            rules_page.py
            settings_page.py
            workers.py
    tests/
        test_db.py
        test_mover.py
        test_rules_engine.py
        test_scanner.py
        test_undo.py
```

## Safety Notes

The app never deletes user files. Manual organization requires preview and confirmation before files are moved. Existing destination files are not overwritten; the incoming file receives a numbered suffix. Failed or skipped files are recorded in SQLite and logs so one problematic file does not stop the rest of a batch.

User data is stored under:

```text
%APPDATA%/SmartFileOrganizerPro/
```

That folder contains the SQLite database, logs, and exported reports.
