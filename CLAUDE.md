# ProtoFlow — CLAUDE.md

## What is ProtoFlow?
A local-first browser app that takes standalone HTML prototype files, lets users visually wire navigation between them on a React Flow canvas, and exports the files with all navigation JS auto-injected. Eliminates manual `window.location.href` / `onclick` wiring across large prototype sets.

## Tech Stack
Vite 8 · React 19 · TypeScript 5 (strict) · @xyflow/react 12 · shadcn/ui + Tailwind CSS 4 · Zustand 5 + immer · idb-keyval (IndexedDB) · JSZip + file-saver · @dagrejs/dagre (auto-layout) · html2canvas (thumbnails) · nanoid.

## Two Modes
- **Standard** — upload HTML screens, draw connections, pick trigger elements, export a linked ZIP.
- **Enhancement** — upload HTML with `data-enhanced` / `data-current-only` markers, add change-request metadata, and export a single self-contained HTML file wrapped in a generic app shell with a Current/Enhanced toggle.

## Project Structure
```
src/
  app/           — App.tsx (root), layout.tsx (3-panel shell)
  types/         — project.ts, canvas.ts
  lib/           — injection, overlay-injection, templates, enhancement-export,
                   enhancement-shell, enhancement-parser, validation, auto-layout,
                   flow-to-json, constants, utils, log
  hooks/         — useProjectStore (Zustand), useAppStore, useUpload,
                   useEnhancementUpload, useExport, useEnhancementExport,
                   usePersistence, useThumbnail, useKeyboardShortcuts
  components/    — canvas/ sidebar/ inspector/ topbar/ shared/ listing/ ui/
```

## Key Architecture Notes
- Single Zustand store (immer) — simple persistence.
- React Flow node/edge data derived via `useMemo`; `nodeTypes`/`edgeTypes` defined outside components to avoid re-render storms.
- Original uploaded HTML is never mutated — injection runs on copies at export time.
- **Never use DOMParser to transform HTML for export** — it normalizes/mangles structure. Use string/regex ops for export mutation; DOMParser is fine only for read-only detection and throwaway rendering (thumbnails, element-picker iframe).
- Enhancement export places uploaded screen `<style>` blocks **before** the shell CSS so the cascade lets shell CSS win for shell elements while screen styles still apply to content.
- Enhancement mode expects **content-only** HTML; any app shell in an uploaded file is detected and stripped at upload and again as an export safety net.

## Build & Run
```bash
npm install
npm run dev      # http://localhost:6001
npm run build    # tsc -b && vite build -> dist/
npm run lint     # eslint .
```
