import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, Screen, Connection, EnhancementScreen, Enhancement, EnhancementProjectMeta } from '@/types/project';
import { DEFAULT_PROJECT_NAME, DEFAULT_ENHANCEMENT_META } from '@/lib/constants';
import { nanoid } from 'nanoid';
import { produce } from 'immer';

// ---- Undo/Redo history ----
const MAX_HISTORY = 50;
let undoStack: Project[] = [];
let redoStack: Project[] = [];

function pushUndo(project: Project) {
  // Deep clone via immer produce (structuredClone is too slow for large HTML)
  undoStack.push(produce(project, () => {}));
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack = []; // any new action clears redo
}

// ---- Types ----
interface PendingConnection {
  sourceId: string;
  targetId: string;
}

interface UIState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  triggerDialogOpen: boolean;
  pendingConnection: PendingConnection | null;
  previewOpen: boolean;
  previewStartScreenId: string | null;
  codeViewScreenId: string | null;
  searchOpen: boolean;
  searchQuery: string;
  // Enhancement mode UI
  selectedEnhancementScreenId: string | null;
  selectedEnhancementId: number | null;
  enhancementPreviewOpen: boolean;
  screenPreviewScreenId: string | null;  // individual screen preview (Screen.id)
}

interface ProjectState {
  project: Project;
  ui: UIState;
  canUndo: boolean;
  canRedo: boolean;

  loadProject: (project: Project) => void;
  setProjectName: (name: string) => void;

  addScreen: (screen: Screen) => void;
  updateScreen: (id: string, updates: Partial<Screen>) => void;
  removeScreen: (id: string) => void;
  setNodePosition: (id: string, x: number, y: number) => void;
  batchSetNodePositions: (positions: Map<string, { x: number; y: number }>) => void;

  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  removeConnection: (id: string) => void;

  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;

  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  openTriggerDialog: (pending: PendingConnection) => void;
  closeTriggerDialog: () => void;
  clearCanvas: () => void;
  openPreview: (startScreenId?: string | null) => void;
  closePreview: () => void;

  openCodeView: (screenId: string) => void;
  closeCodeView: () => void;

  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (q: string) => void;

  duplicateScreen: (screenId: string) => void;

  // Enhancement mode actions
  addEnhancementScreen: (es: EnhancementScreen) => void;
  updateEnhancementScreen: (id: string, updates: Partial<EnhancementScreen>) => void;
  removeEnhancementScreen: (id: string) => void;
  reorderEnhancementScreens: (orderedIds: string[]) => void;

  addEnhancement: (enh: Omit<Enhancement, 'id'>) => void;
  updateEnhancement: (id: number, updates: Partial<Enhancement>) => void;
  removeEnhancement: (id: number) => void;
  linkScreenToEnhancement: (enhScreenId: string, enhancementId: number) => void;
  unlinkScreenFromEnhancement: (enhScreenId: string, enhancementId: number) => void;

  setEnhancementMeta: (meta: Partial<EnhancementProjectMeta>) => void;
  selectEnhancementScreen: (id: string | null) => void;
  selectEnhancement: (id: number | null) => void;
  openEnhancementPreview: () => void;
  closeEnhancementPreview: () => void;
  openScreenPreview: (screenId: string) => void;
  closeScreenPreview: () => void;

  undo: () => void;
  redo: () => void;
}

const initialProject: Project = {
  id: nanoid(),
  name: DEFAULT_PROJECT_NAME,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  screens: [],
  connections: [],
  canvasViewport: { x: 0, y: 0, zoom: 1 },
  mode: 'standard',
};

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    project: initialProject,
    ui: {
      selectedNodeId: null,
      selectedEdgeId: null,
      triggerDialogOpen: false,
      pendingConnection: null,
      previewOpen: false,
      previewStartScreenId: null,
      codeViewScreenId: null,
      searchOpen: false,
      searchQuery: '',
      selectedEnhancementScreenId: null,
      selectedEnhancementId: null,
      enhancementPreviewOpen: false,
      screenPreviewScreenId: null,
    },
    canUndo: false,
    canRedo: false,

    loadProject: (project) =>
      set((state) => {
        undoStack = [];
        redoStack = [];
        state.project = project;
        state.canUndo = false;
        state.canRedo = false;
      }),

    setProjectName: (name) =>
      set((state) => {
        pushUndo(get().project);
        state.project.name = name;
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = undoStack.length > 0;
        state.canRedo = redoStack.length > 0;
      }),

    addScreen: (screen) =>
      set((state) => {
        pushUndo(get().project);
        state.project.screens.push(screen);
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    updateScreen: (id, updates) =>
      set((state) => {
        pushUndo(get().project);
        const idx = state.project.screens.findIndex((s) => s.id === id);
        if (idx !== -1) {
          Object.assign(state.project.screens[idx], updates);
          state.project.updatedAt = new Date().toISOString();
        }
        state.canUndo = true;
        state.canRedo = false;
      }),

    removeScreen: (id) =>
      set((state) => {
        pushUndo(get().project);
        state.project.screens = state.project.screens.filter((s) => s.id !== id);
        state.project.connections = state.project.connections.filter(
          (c) => c.sourceScreenId !== id && c.targetScreenId !== id
        );
        if (state.ui.selectedNodeId === id) state.ui.selectedNodeId = null;
        if (state.ui.codeViewScreenId === id) state.ui.codeViewScreenId = null;
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    setNodePosition: (id, x, y) =>
      set((state) => {
        // No undo for drag — too many intermediate states
        const screen = state.project.screens.find((s) => s.id === id);
        if (screen) screen.position = { x, y };
      }),

    batchSetNodePositions: (positions) =>
      set((state) => {
        pushUndo(get().project);
        for (const screen of state.project.screens) {
          const pos = positions.get(screen.id);
          if (pos) screen.position = pos;
        }
        state.canUndo = true;
        state.canRedo = false;
      }),

    addConnection: (connection) =>
      set((state) => {
        pushUndo(get().project);
        state.project.connections.push(connection);
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    updateConnection: (id, updates) =>
      set((state) => {
        pushUndo(get().project);
        const idx = state.project.connections.findIndex((c) => c.id === id);
        if (idx !== -1) {
          Object.assign(state.project.connections[idx], updates);
          state.project.updatedAt = new Date().toISOString();
        }
        state.canUndo = true;
        state.canRedo = false;
      }),

    removeConnection: (id) =>
      set((state) => {
        pushUndo(get().project);
        state.project.connections = state.project.connections.filter((c) => c.id !== id);
        if (state.ui.selectedEdgeId === id) state.ui.selectedEdgeId = null;
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    clearCanvas: () =>
      set((state) => {
        pushUndo(get().project);
        state.project.screens = [];
        state.project.connections = [];
        state.project.canvasViewport = { x: 0, y: 0, zoom: 1 };
        state.project.updatedAt = new Date().toISOString();
        state.ui.selectedNodeId = null;
        state.ui.selectedEdgeId = null;
        state.canUndo = true;
        state.canRedo = false;
      }),

    setViewport: (viewport) =>
      set((state) => {
        state.project.canvasViewport = viewport;
      }),

    selectNode: (id) =>
      set((state) => {
        state.ui.selectedNodeId = id;
        state.ui.selectedEdgeId = null;
        state.ui.codeViewScreenId = null;
      }),

    selectEdge: (id) =>
      set((state) => {
        state.ui.selectedEdgeId = id;
        state.ui.selectedNodeId = null;
        state.ui.codeViewScreenId = null;
      }),

    openTriggerDialog: (pending) =>
      set((state) => {
        state.ui.triggerDialogOpen = true;
        state.ui.pendingConnection = pending;
      }),

    closeTriggerDialog: () =>
      set((state) => {
        state.ui.triggerDialogOpen = false;
        state.ui.pendingConnection = null;
      }),

    openPreview: (startScreenId) =>
      set((state) => {
        state.ui.previewOpen = true;
        state.ui.previewStartScreenId = startScreenId ?? state.project.screens[0]?.id ?? null;
      }),

    closePreview: () =>
      set((state) => {
        state.ui.previewOpen = false;
        state.ui.previewStartScreenId = null;
      }),

    openCodeView: (screenId) =>
      set((state) => {
        state.ui.codeViewScreenId = screenId;
      }),

    closeCodeView: () =>
      set((state) => {
        state.ui.codeViewScreenId = null;
      }),

    openSearch: () =>
      set((state) => {
        state.ui.searchOpen = true;
        state.ui.searchQuery = '';
      }),

    closeSearch: () =>
      set((state) => {
        state.ui.searchOpen = false;
        state.ui.searchQuery = '';
      }),

    setSearchQuery: (q) =>
      set((state) => {
        state.ui.searchQuery = q;
      }),

    duplicateScreen: (screenId) =>
      set((state) => {
        const original = state.project.screens.find((s) => s.id === screenId);
        if (!original) return;
        pushUndo(get().project);
        const newId = nanoid();
        const baseName = original.name.replace(/ \(copy\)$/, '');
        const clone: Screen = {
          ...JSON.parse(JSON.stringify(original)),
          id: newId,
          name: `${baseName} (copy)`,
          fileName: `${baseName.toLowerCase().replace(/\s+/g, '-')}-copy.html`,
          position: {
            x: original.position.x + 40,
            y: original.position.y + 40,
          },
          metadata: {
            ...original.metadata,
            uploadedAt: new Date().toISOString(),
          },
        };
        state.project.screens.push(clone);
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    // ---- Enhancement mode actions ----

    addEnhancementScreen: (es) =>
      set((state) => {
        pushUndo(get().project);
        if (!state.project.enhancementScreens) state.project.enhancementScreens = [];
        state.project.enhancementScreens.push(es);
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    updateEnhancementScreen: (id, updates) =>
      set((state) => {
        pushUndo(get().project);
        const screens = state.project.enhancementScreens;
        if (!screens) return;
        const idx = screens.findIndex((s) => s.id === id);
        if (idx !== -1) {
          Object.assign(screens[idx], updates);
          state.project.updatedAt = new Date().toISOString();
        }
        state.canUndo = true;
        state.canRedo = false;
      }),

    removeEnhancementScreen: (id) =>
      set((state) => {
        pushUndo(get().project);
        if (state.project.enhancementScreens) {
          state.project.enhancementScreens = state.project.enhancementScreens.filter((s) => s.id !== id);
        }
        // Also unlink from any enhancements
        if (state.project.enhancements) {
          for (const enh of state.project.enhancements) {
            enh.linkedScreenIds = enh.linkedScreenIds.filter((sid) => sid !== id);
          }
        }
        // Remove the underlying Screen too
        state.project.screens = state.project.screens.filter((s) => {
          const es = (get().project.enhancementScreens ?? []).find((e) => e.id === id);
          return !es || s.id !== es.screenId;
        });
        if (state.ui.selectedEnhancementScreenId === id) state.ui.selectedEnhancementScreenId = null;
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    reorderEnhancementScreens: (orderedIds) =>
      set((state) => {
        pushUndo(get().project);
        const screens = state.project.enhancementScreens;
        if (!screens) return;
        orderedIds.forEach((id, idx) => {
          const s = screens.find((s) => s.id === id);
          if (s) s.order = idx + 1;
        });
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    addEnhancement: (enh) =>
      set((state) => {
        pushUndo(get().project);
        if (!state.project.enhancements) state.project.enhancements = [];
        const nextId = state.project.enhancements.length > 0
          ? Math.max(...state.project.enhancements.map((e) => e.id)) + 1
          : 1;
        state.project.enhancements.push({ ...enh, id: nextId });
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    updateEnhancement: (id, updates) =>
      set((state) => {
        pushUndo(get().project);
        const enhs = state.project.enhancements;
        if (!enhs) return;
        const idx = enhs.findIndex((e) => e.id === id);
        if (idx !== -1) {
          Object.assign(enhs[idx], updates);
          state.project.updatedAt = new Date().toISOString();
        }
        state.canUndo = true;
        state.canRedo = false;
      }),

    removeEnhancement: (id) =>
      set((state) => {
        pushUndo(get().project);
        if (!state.project.enhancements) return;
        state.project.enhancements = state.project.enhancements.filter((e) => e.id !== id);
        // Re-number sequentially
        state.project.enhancements.forEach((e, i) => { e.id = i + 1; });
        if (state.ui.selectedEnhancementId === id) state.ui.selectedEnhancementId = null;
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    linkScreenToEnhancement: (enhScreenId, enhancementId) =>
      set((state) => {
        pushUndo(get().project);
        const enh = state.project.enhancements?.find((e) => e.id === enhancementId);
        if (enh && !enh.linkedScreenIds.includes(enhScreenId)) {
          enh.linkedScreenIds.push(enhScreenId);
          state.project.updatedAt = new Date().toISOString();
        }
        state.canUndo = true;
        state.canRedo = false;
      }),

    unlinkScreenFromEnhancement: (enhScreenId, enhancementId) =>
      set((state) => {
        pushUndo(get().project);
        const enh = state.project.enhancements?.find((e) => e.id === enhancementId);
        if (enh) {
          enh.linkedScreenIds = enh.linkedScreenIds.filter((id) => id !== enhScreenId);
          state.project.updatedAt = new Date().toISOString();
        }
        state.canUndo = true;
        state.canRedo = false;
      }),

    setEnhancementMeta: (meta) =>
      set((state) => {
        pushUndo(get().project);
        state.project.enhancementMeta = {
          ...(state.project.enhancementMeta ?? DEFAULT_ENHANCEMENT_META),
          ...meta,
        };
        state.project.updatedAt = new Date().toISOString();
        state.canUndo = true;
        state.canRedo = false;
      }),

    selectEnhancementScreen: (id) =>
      set((state) => {
        state.ui.selectedEnhancementScreenId = id;
        state.ui.selectedEnhancementId = null;
      }),

    selectEnhancement: (id) =>
      set((state) => {
        state.ui.selectedEnhancementId = id;
        state.ui.selectedEnhancementScreenId = null;
      }),

    openEnhancementPreview: () =>
      set((state) => {
        state.ui.enhancementPreviewOpen = true;
      }),

    closeEnhancementPreview: () =>
      set((state) => {
        state.ui.enhancementPreviewOpen = false;
      }),

    openScreenPreview: (screenId) =>
      set((state) => {
        state.ui.screenPreviewScreenId = screenId;
      }),

    closeScreenPreview: () =>
      set((state) => {
        state.ui.screenPreviewScreenId = null;
      }),

    undo: () =>
      set((state) => {
        if (undoStack.length === 0) return;
        redoStack.push(produce(get().project, () => {}));
        const prev = undoStack.pop()!;
        state.project = prev;
        state.ui.selectedNodeId = null;
        state.ui.selectedEdgeId = null;
        state.ui.codeViewScreenId = null;
        state.canUndo = undoStack.length > 0;
        state.canRedo = true;
      }),

    redo: () =>
      set((state) => {
        if (redoStack.length === 0) return;
        undoStack.push(produce(get().project, () => {}));
        const next = redoStack.pop()!;
        state.project = next;
        state.ui.selectedNodeId = null;
        state.ui.selectedEdgeId = null;
        state.ui.codeViewScreenId = null;
        state.canUndo = true;
        state.canRedo = redoStack.length > 0;
      }),
  }))
);

// Selectors
export function useScreens(): Screen[] {
  return useProjectStore((state) => state.project.screens);
}

export function useConnections(): Connection[] {
  return useProjectStore((state) => state.project.connections);
}

export function useSelectedScreen(): Screen | null {
  return useProjectStore((state) => {
    const id = state.ui.selectedNodeId;
    if (!id) return null;
    return state.project.screens.find((s) => s.id === id) ?? null;
  });
}

export function useSelectedConnection(): Connection | null {
  return useProjectStore((state) => {
    const id = state.ui.selectedEdgeId;
    if (!id) return null;
    return state.project.connections.find((c) => c.id === id) ?? null;
  });
}

export function useCodeViewScreen(): Screen | null {
  return useProjectStore((state) => {
    const id = state.ui.codeViewScreenId;
    if (!id) return null;
    return state.project.screens.find((s) => s.id === id) ?? null;
  });
}
