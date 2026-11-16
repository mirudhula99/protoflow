# How to Use ProtoFlow

ProtoFlow is a **browser-based** tool. There's no server and no sign-up — everything runs locally and your files never leave your computer. This guide walks you through both modes from scratch.

---

## 1. Start the app

```bash
npm install     # first time only
npm run dev
```

Open **http://localhost:6001** in your browser (Chrome or Edge recommended).

Your work auto-saves to your browser (IndexedDB) every half-second, so you can close the tab and come back later.

---

## 2. The project listing

The first screen lists your projects. From here you can:

- **Create a project** — choose a mode:
  - **Standard** — wire navigation between screens (click a button → go to another screen).
  - **Enhancement** — build a "before vs. after" demo of a proposed change, wrapped in an app shell with a Current/Enhanced toggle.
- **Open** an existing project, or **delete** one.

---

## 3. Standard Mode — make screens clickable

**Goal:** turn a folder of separate HTML files into one clickable prototype.

1. **Upload screens.** Drag your `.html` files onto the upload zone in the left sidebar (or use the sample files in [`examples/`](examples/): `login.html`, `dashboard.html`, `settings.html`).
2. **Add them to the canvas.** Drag a screen from the sidebar onto the canvas, or use auto-layout to arrange them all at once.
3. **Draw a connection.** Hover over a screen node and drag from its edge handle to another screen. This opens the **trigger dialog**.
4. **Pick the trigger element.** The dialog shows a full preview of the source screen. **Click the exact button or link** that should cause the navigation (e.g. the *Sign in* button on `login.html`). ProtoFlow records that element — you never type CSS selectors by hand.
5. **Choose an animation** (optional) — instant, dissolve, slide, push, etc.
6. **Repeat** for every navigation you want. The same two screens can have multiple connections with different triggers.
7. **Preview** — press `Ctrl + P` (or the Preview button) to open the full-screen player and click through your prototype. Use the back button and history to navigate.
8. **Export** — press `Ctrl + E` (or the Export button) to download a **ZIP** of all your HTML files with navigation code injected. Unzip it and open any file in a browser — the links just work, no server needed.

> Tip: ProtoFlow never edits your original files. Injection happens only on the exported copies.

### Overlays (popups, toasts, modals)
When configuring a connection, you can change the **action type** from *Navigate to* to *Open overlay* or *Close overlay*. You can point an overlay at another screen or use one of the 5 built-in templates (filter dropdown, success/error toast, confirmation modal, info dialog).

---

## 4. Enhancement Mode — before/after change demos

**Goal:** show stakeholders what a screen looks like **today** vs. **after** a proposed change, inside a realistic app shell.

1. **Prepare content-only HTML.** Each uploaded screen should be just the page *content* — no sidebar/header/footer. ProtoFlow supplies the app shell for you. (If an uploaded file already has a shell, ProtoFlow strips it automatically.)
2. **Mark what changes** in your HTML using two attributes:
   - `data-enhanced` — an element that appears **only in the Enhanced view** (the new thing). It's hidden in Current view and glows in Enhanced view.
   - `data-current-only` — an element that appears **only in the Current view** (the thing being removed/replaced). Hidden in Enhanced view.
   - Anything unmarked always shows in both views.
3. **Upload** the marked HTML file(s). ProtoFlow auto-detects the markers.
4. **Add change-request metadata** (optional) in the inspector — a reference code (e.g. `CR-1024`), title, description, purpose, problem, and specific changes. This powers the Description button in the exported demo.
5. **Pick the module** each screen belongs to — the exported sidebar will highlight that module (Home, Dashboard, Projects, etc.).
6. **Preview** to see the shell with the **Current / Enhanced** toggle. Flip it to watch marked elements appear/disappear and glow.
7. **Export** — downloads a **single self-contained HTML file** with the full shell, the toggle, pagination across screens, glow highlights, and a Description modal. Share it with anyone; it opens in any browser.

---

## 5. Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Delete` / `Backspace` | Delete the selected screen or connection |
| `Escape` | Deselect / close panels |
| `Ctrl + E` | Export |
| `Ctrl + P` | Open preview |
| `Ctrl + S` | Nothing needed — it auto-saves |

---

## 6. Tips & troubleshooting

- **Nothing happens when I click in the preview?** Make sure the connection's trigger element was actually picked in the trigger dialog — a connection with no trigger won't fire.
- **My exported links don't work.** Open the file from the *unzipped* folder (all screens must sit in the same folder, as exported). Opening a single file pulled out of the ZIP breaks the relative links.
- **Enhancement screen looks double-framed.** Upload content-only HTML (no sidebar/header/footer). ProtoFlow adds the shell; it also strips an existing one, but content-only is cleanest.
- **I lost my work.** Projects live in your browser's storage for the site. Using a different browser, profile, or clearing site data starts fresh. Export regularly to keep a copy.

---

## 7. Build a production bundle

```bash
npm run build     # outputs a static site to dist/
npm run preview   # serve the built dist/ locally
```

The `dist/` folder is a plain static site you can host anywhere.
