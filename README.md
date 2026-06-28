# Aria Vision Product Showcase Website

This is a static, backend-free product showcase for Aria Vision Windows apps.

## Source Data

Data was extracted on 2026-06-18 from Microsoft Store publisher search and product detail API responses for:

- https://apps.microsoft.com/search/publisher?name=Aria+Vision&hl=en-US&gl=IN
- Publisher query `Aria Vision`: 22 apps
- Publisher query `aria vision`: 6 additional Store listings exposed by Microsoft under a lowercase publisher name

The generated site includes 28 apps total. Availability, release dates, and metadata can change in Microsoft Store after this extraction date. Store cost information is intentionally omitted from the website and product data files.

Microsoft Store does not expose explicit "target users" or "benefits" fields. Those sections were derived editorially from the Store descriptions, categories, and feature lists. Original Store descriptions, features, links, icons, and screenshots are preserved in each app folder's `app-data.json`, with Store cost fields omitted.

## Included Apps

- Trading Journal Pro (9mv5cqv5wl5h) - `apps/trading-journal-pro/index.html`
- Xml to Json Converter pro (9p6pfjvgdmlx) - `apps/xml-to-json-converter-pro/index.html`
- PyInstaller (9mzclvf2dfc4) - `apps/pyinstaller/index.html`
- Audio Enhancer Pro (9p9hv5brvfs1) - `apps/audio-enhancer-pro/index.html`
- AI Image Character Generator (9nm8lrn4c79m) - `apps/ai-image-character-generator/index.html`
- Pomodoro Pro (9p48jvgz4dkf) - `apps/pomodoro-pro/index.html`
- Voice To Text Converter Pro (9pgbj5b0f1s9) - `apps/voice-to-text-converter-pro/index.html`
- Git Automation (9nv6zj5ql54v) - `apps/git-automation/index.html`
- Speed Test Live (9njxnb3j0j9w) - `apps/speed-test-live/index.html`
- SVN AutoCommit (9ns8t816hvb3) - `apps/svn-autocommit/index.html`
- image encryption (9nt0vl81g1ds) - `apps/image-encryption/index.html`
- Crypto Encoder Pro (9nqzqq4fh0x6) - `apps/crypto-encoder-pro/index.html`
- Trading Assistant Pro (9ntzhs8bbjdt) - `apps/trading-assistant-pro/index.html`
- Clipboard Universal (9msvp97jmm53) - `apps/clipboard-universal/index.html`
- Noise Remover (9pdb44g3wq5j) - `apps/noise-remover/index.html`
- Python Quick Installer Pro (9pljlf4q3ht6) - `apps/python-quick-installer-pro/index.html`
- Puzzle Fuzzle (9p0st0d9804t) - `apps/puzzle-fuzzle/index.html`
- QR Code Studio (9p294zgd4nv9) - `apps/qr-code-studio/index.html`
- Ora TNSNames Manager (9n1dhfnzghkl) - `apps/ora-tnsnames-manager/index.html`
- Markdown to HTML Converter (9mzkf0q8mfdf) - `apps/markdown-to-html-converter/index.html`
- JSON Parser Pro (9n4q97szn9zr) - `apps/json-parser-pro/index.html`
- Internet Downloader Pro (9nh5mrqbvc9d) - `apps/internet-downloader-pro/index.html`
- Email Signature Builder (9n1j1802r4wc) - `apps/email-signature-builder/index.html`
- Gaming Mode (9pfphmp7wvft) - `apps/gaming-mode/index.html`
- Chemical Structure Viewer (9p04l1zt2mbw) - `apps/chemical-structure-viewer/index.html`
- Video Downloader Pro (9nq0223f2bd5) - `apps/video-downloader-pro/index.html`
- FILE Auto Backup (9p90bzvpgx75) - `apps/file-auto-backup/index.html`
- Media Downloader pro (9nsc6k5j8c67) - `apps/media-downloader-pro/index.html`

## How To Run

Open `website/index.html` directly in a browser. No backend, package install, or build step is required for viewing the generated site.

For best local testing, you can also serve the folder with any static server:

```powershell
cd website
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Folder Structure

```text
website/
|-- index.html
|-- css/
|   `-- style.css
|-- js/
|   `-- main.js
|-- assets/
|   |-- data/
|   |   `-- apps-index.json
|   |-- images/
|   `-- icons/
|-- apps/
|   `-- app-name/
|       |-- index.html
|       |-- icon.png
|       |-- app-data.json
|       `-- screenshots/
|           |-- screenshot-1.jpg
|           `-- screenshot-2.png
`-- README.md
```

Screenshot files keep the source format returned by Microsoft Store. Many screenshots are served as JPEG, so some files use `.jpg` instead of `.png`.

## Updating One App

1. Open that app's folder under `apps/`.
2. Edit `app-data.json` for structured product data.
3. Edit the same folder's `index.html` if you want the static page content to immediately reflect the data change.
4. Replace `icon.png` or files inside `screenshots/` as needed.

Files for different apps are intentionally not mixed. Each app owns its icon, screenshots, data file, and page.

## Replacing Screenshots

Replace files only inside the app's `screenshots/` folder. If file names stay the same, the page will keep working. If names change, update that app's `index.html` and `app-data.json`.

Users can click screenshots on product pages to open a large preview lightbox.

## Adding A New App

1. Create a new folder under `apps/`, using a URL-safe slug such as `my-new-app`.
2. Add `index.html`, `icon.png`, `app-data.json`, and a `screenshots/` folder.
3. Copy an existing app page as a starting point and update the content.
4. Add a new product card to the home page product grid in `index.html`.

## Maintenance Guidance

- Shared Material-inspired visual design lives in `css/style.css`.
- Search, filtering, and screenshot lightbox behavior live in `js/main.js`.
- Product-specific content stays in `apps/{app-slug}/`.
- Product card detail links point directly to `index.html` files so browsers do not show directory listings.
- Microsoft Store buttons use direct product links with `hl=en-US&gl=IN`.
