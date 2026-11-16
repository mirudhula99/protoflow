# ProtoFlow

**Turn a folder of HTML screens into a working, clickable prototype — without writing any code.**

## The Problem

Imagine you're designing an app with **200+ screens** — login, dashboard, settings, forms, modals, and more. Each screen is a separate HTML file. Now you need to make them **clickable**: when someone clicks "Login", it should navigate to the Dashboard.

Doing this manually means writing navigation code in every single file. For 200 screens, that's a nightmare.

## The Solution

ProtoFlow is a visual tool that runs entirely in your browser. It has two modes:

### Standard Mode — Navigation Prototyping
Upload your HTML files, arrange them on a canvas, draw arrows between them, and ProtoFlow handles the rest.

```
Upload HTML files → Arrange on canvas → Draw connections → Pick trigger elements → Configure animations → Preview → Export ZIP
```

### Enhancement Mode — Change-Request Demos
Upload HTML screens with `data-enhanced` markers, fill in change-request metadata, and export a complete app-shelled demo with a Current/Enhanced toggle — useful for showing stakeholders "before vs. after" for a proposed change.

```
Upload marked HTML → Configure change-request metadata → Link enhancements to screens → Preview with toggle → Export standalone HTML
```

---

## Try It in 2 Minutes

> New here? See **[USAGE.md](USAGE.md)** for a full step-by-step guide to both modes.

Sample screens live in [`examples/`](examples/):

1. `npm install && npm run dev`, then open **http://localhost:6001**
2. Create a **Standard** project and upload `examples/login.html`, `examples/dashboard.html`, and `examples/settings.html`
3. Drag them onto the canvas and draw an arrow from **Login** to **Dashboard**
4. In the element picker, click the **Sign in** button as the trigger
5. Hit **Preview** to click through, or **Export** to download a linked ZIP you can open anywhere

---

## Features

### Standard Mode

| Feature | Description |
|---------|-------------|
| **Visual Canvas** | Drag, zoom, and pan a whiteboard with all your screens laid out as nodes |
| **Smart Connections** | Draw arrows between screens with configurable triggers (click, submit, close) |
| **Element Picker** | Full-screen preview lets you click on the exact button/link that triggers navigation |
| **Overlay System** | Support for popups, toasts, modals, and dialogs — not just page-to-page navigation |
| **Built-in Templates** | 5 ready-made overlay templates: filter dropdown, success/error toast, confirmation modal, info dialog |
| **Animation Config** | Choose transition animations: dissolve, slide, push, move-in, and more |
| **Preview Player** | Full-screen prototype player with navigation history and back button |
| **Auto Layout** | Automatically arrange screens in a clean layout with one click |
| **Validation** | Warns you about broken connections, missing triggers, or orphaned screens |

### Enhancement Mode

| Feature | Description |
|---------|-------------|
| **Dual-Marker System** | `data-enhanced` and `data-current-only` attributes control the Current/Enhanced toggle |
| **Auto Shell Stripping** | Uploaded HTML that already includes an app shell (sidebar, header, footer) is automatically cleaned at upload |
| **Change-Request Metadata** | Link enhancements with ref codes, descriptions, purpose, changes, and config settings |
| **App Export Shell** | Export wraps content in a full app shell with sidebar, header, footer, and toggle bar |
| **Current/Enhanced Toggle** | Exported HTML lets stakeholders switch between current and enhanced views |
| **Glow Highlights** | Enhanced elements get a blue glow animation in the Enhanced view |
| **Screen Pagination** | Multiple screens in a single export with arrow navigation |
| **Description Modal** | Change-request details (purpose, problem, changes, config) accessible via a toolbar button |
| **Individual Screen Preview** | Double-click any screen card to preview it standalone |
| **Module Selection** | Pick which sidebar module the exported shell highlights |

### Common

| Feature | Description |
|---------|-------------|
| **Project Listing** | Landing page to create, open, and manage projects |
| **Auto Save** | Saves to your browser automatically every 500ms — no data loss |
| **Local First** | Everything runs in your browser. Your files never leave your computer |
| **ZIP Export** | One-click export of all linked HTML files ready to share |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/mirudhula99/protoflow.git
cd protoflow

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open **http://localhost:6001** in your browser.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` / `Backspace` | Delete selected screen or connection |
| `Escape` | Deselect / close panels |
| `Ctrl + E` | Export linked HTML ZIP |
| `Ctrl + P` | Open preview player |
| `Ctrl + S` | No-op (auto-saved) |

---

## Tech Stack

| Technology | What it does |
|-----------|-------------|
| **React 19** | UI framework — builds all the interactive elements |
| **TypeScript 5** | Typed JavaScript with strict mode |
| **Vite 8** | Build tool — instant HMR during development |
| **@xyflow/react 12** | Canvas library — dragging nodes, drawing arrows, zooming |
| **Zustand 5 + Immer** | State management — single store for the entire project |
| **Tailwind CSS 4 + shadcn/ui** | Styling — clean, professional UI components |
| **IndexedDB (idb-keyval)** | Auto-saves project locally every 500ms |
| **JSZip + file-saver** | Bundles exported files into a downloadable ZIP |
| **Dagre** | Graph layout — powers the auto-layout feature |
| **html2canvas** | Generates thumbnail previews of each screen |

## Project Structure

```
src/
  app/            — Root app, 3-panel layout, project listing
  types/          — TypeScript types (Screen, Connection, Enhancement, Project)
  lib/
    injection.ts          — Navigation code injection engine (standard export)
    overlay-injection.ts  — Overlay export engine
    templates.ts          — Built-in overlay template renderers
    enhancement-export.ts — Enhancement mode export + shell detection/stripping
    enhancement-shell.ts  — App shell HTML/CSS/JS for enhancement exports
    enhancement-parser.ts — Dual-marker detection and parsing
    validation.ts         — Connection and enhancement validation
    auto-layout.ts        — Dagre-based automatic screen arrangement
    constants.ts          — App-wide constants, module list, defaults
  hooks/
    useProjectStore       — Zustand store (single source of truth)
    useAppStore           — Project listing and creation
    useUpload             — Standard mode file upload
    useEnhancementUpload  — Enhancement mode upload with shell stripping
    useExport             — Standard mode ZIP export
    useEnhancementExport  — Enhancement mode HTML export
    useThumbnail          — Screen thumbnail generation
    usePersistence        — IndexedDB auto-save
  components/
    canvas/       — FlowCanvas, ScreenNode, EnhancementCanvas, EnhancementScreenNode
    sidebar/      — AssetPanel, UploadZone, EnhancementSidebar
    inspector/    — InspectorPanel, NodeInspector, EnhancementInspector
    topbar/       — TopBar, EnhancementTopBar
    shared/       — TriggerDialog, ElementPicker, PreviewPlayer, EnhancementPreviewPlayer
    listing/      — ProjectListingPage
    ui/           — Reusable shadcn/ui components
```

## Key Design Decisions

- **Local-first**: No server, no accounts, no cloud. Everything stays in your browser.
- **Non-destructive**: Original HTML files are never changed. Injection only happens on export copies.
- **Single store**: One Zustand store holds the entire project state — simpler to save, load, and debug.
- **Shell stripping at upload**: Enhancement mode detects and strips any existing app shell from uploaded HTML immediately, preventing double-wrapping in exports.
- **Shell CSS filtering**: Uploaded style blocks are cleaned of shell-specific CSS rules so they don't conflict with ProtoFlow's export shell.
- **Edge creation requires a trigger**: You can't just draw an arrow — you must pick which element triggers the navigation.
- **Multiple connections allowed**: Same two screens can have multiple arrows with different triggers.

---

## Build for Production

```bash
npm run build    # Outputs to dist/
```

---

## Security Model

ProtoFlow runs entirely in your browser with no backend. Two things are worth knowing:

- **Opening an HTML file runs its JavaScript.** ProtoFlow previews and exports HTML you provide. When you preview a screen, any `<script>` inside that file executes in your browser. Only open HTML files you trust — treat a file from someone else the same way you'd treat any code you didn't write.
- **All projects share one local store.** Projects are saved in your browser's IndexedDB for this site. Clearing site data or switching browser/profile starts fresh, so export anything you want to keep.

There are no accounts, no servers, and no data leaves your machine through ProtoFlow itself.

## License

No license is currently granted. The source is published for viewing and reference; it is not licensed for reuse or redistribution.
