import { create } from 'zustand';
import { get, set, del } from 'idb-keyval';
import { toast } from 'sonner';
import { useProjectStore } from './useProjectStore';
import { nanoid } from 'nanoid';
import type { Project, ProjectMode } from '@/types/project';
import { DEFAULT_PROJECT_NAME, DEFAULT_ENHANCEMENT_META } from '@/lib/constants';
import { log } from '@/lib/log';

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  screenCount: number;
  thumbnailDataUrl?: string;
  mode: ProjectMode;
}

const PROJECTS_KEY = 'protoflow-projects';
const PROJECT_PREFIX = 'protoflow-project-';
const LEGACY_KEY = 'protoflow-project';

interface AppState {
  currentView: 'listing' | 'editor';
  projectList: ProjectSummary[];
  currentProjectId: string | null;
  initialized: boolean;

  init: () => Promise<void>;
  loadProjectList: () => Promise<void>;
  openProject: (id: string) => Promise<void>;
  createNewProject: () => void;
  createNewEnhancementProject: () => void;
  deleteProject: (id: string) => Promise<void>;
  goToListing: () => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  updateProjectSummary: () => Promise<void>;
}

export const useAppStore = create<AppState>()((setState, getState) => ({
  currentView: 'listing',
  projectList: [],
  currentProjectId: null,
  initialized: false,

  init: async () => {
    if (getState().initialized) return;

    // Migration: check for legacy single-project key
    const legacyRaw = await get<string>(LEGACY_KEY);
    if (legacyRaw) {
      try {
        const saved: Project = typeof legacyRaw === 'string' ? JSON.parse(legacyRaw) : legacyRaw;
        if (saved && saved.screens) {
          // Migrate connections
          for (const conn of saved.connections) {
            if (!conn.actionType) conn.actionType = 'navigate_to';
          }
          if (!saved.mode) saved.mode = 'standard';
          // Save under new key (with mode set, so the persisted copy is complete)
          await set(`${PROJECT_PREFIX}${saved.id}`, JSON.stringify(saved));
          const summary: ProjectSummary = {
            id: saved.id,
            name: saved.name,
            updatedAt: saved.updatedAt,
            screenCount: saved.screens.length,
            thumbnailDataUrl: saved.screens[0]?.thumbnailDataUrl,
            mode: saved.mode ?? 'standard',
          };
          await set(PROJECTS_KEY, JSON.stringify([summary]));
          await del(LEGACY_KEY);
          log.info('legacy_migration_succeeded', { projectId: saved.id });
        }
      } catch (err) {
        // Legacy record unreadable — keep the old key so no data is destroyed.
        log.error('legacy_migration_failed', { error: err });
      }
    }

    await getState().loadProjectList();
    setState({ initialized: true });
  },

  loadProjectList: async () => {
    const raw = await get<string>(PROJECTS_KEY);
    if (raw) {
      try {
        const list: ProjectSummary[] = typeof raw === 'string' ? JSON.parse(raw) : raw;
        // Migration: add mode to existing summaries
        for (const s of list) {
          if (!s.mode) s.mode = 'standard';
        }
        setState({ projectList: list });
      } catch (err) {
        log.error('project_list_parse_failed', { error: err });
        setState({ projectList: [] });
      }
    } else {
      setState({ projectList: [] });
    }
  },

  openProject: async (id: string) => {
    const raw = await get<string>(`${PROJECT_PREFIX}${id}`);
    if (!raw) {
      log.warn('project_load_missing', { projectId: id });
      toast.error("Couldn't open this project — its saved data was not found.");
      return;
    }
    try {
      const project: Project = typeof raw === 'string' ? JSON.parse(raw) : raw;
      // Migration
      for (const conn of project.connections) {
        if (!conn.actionType) conn.actionType = 'navigate_to';
      }
      if (!project.mode) project.mode = 'standard';
      useProjectStore.getState().loadProject(project);
      setState({ currentView: 'editor', currentProjectId: id });
    } catch (err) {
      log.error('project_load_failed', { projectId: id, error: err });
      toast.error("Couldn't open this project — its saved data appears to be corrupted.");
    }
  },

  createNewProject: () => {
    const id = nanoid();
    const project: Project = {
      id,
      name: DEFAULT_PROJECT_NAME,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      screens: [],
      connections: [],
      canvasViewport: { x: 0, y: 0, zoom: 1 },
      mode: 'standard',
    };
    useProjectStore.getState().loadProject(project);
    setState({ currentView: 'editor', currentProjectId: id });
  },

  createNewEnhancementProject: () => {
    const id = nanoid();
    const project: Project = {
      id,
      name: 'Untitled Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      screens: [],
      connections: [],
      canvasViewport: { x: 0, y: 0, zoom: 1 },
      mode: 'enhancement',
      enhancementMeta: { ...DEFAULT_ENHANCEMENT_META },
      enhancementScreens: [],
      enhancements: [],
    };
    useProjectStore.getState().loadProject(project);
    setState({ currentView: 'editor', currentProjectId: id });
  },

  deleteProject: async (id: string) => {
    await del(`${PROJECT_PREFIX}${id}`);
    const { projectList } = getState();
    const updated = projectList.filter((p) => p.id !== id);
    await set(PROJECTS_KEY, JSON.stringify(updated));
    setState({ projectList: updated });
  },

  goToListing: async () => {
    await getState().saveCurrentProject();
    await getState().loadProjectList();
    setState({ currentView: 'listing', currentProjectId: null });
  },

  saveCurrentProject: async () => {
    const { currentProjectId } = getState();
    if (!currentProjectId) return;
    const project = useProjectStore.getState().project;
    await set(`${PROJECT_PREFIX}${currentProjectId}`, JSON.stringify(project));
    await getState().updateProjectSummary();
  },

  updateProjectSummary: async () => {
    const { currentProjectId, projectList } = getState();
    if (!currentProjectId) return;
    const project = useProjectStore.getState().project;
    const summary: ProjectSummary = {
      id: currentProjectId,
      name: project.name,
      updatedAt: project.updatedAt,
      screenCount: project.screens.length,
      thumbnailDataUrl: project.screens[0]?.thumbnailDataUrl,
      mode: project.mode ?? 'standard',
    };
    const idx = projectList.findIndex((p) => p.id === currentProjectId);
    const updated = [...projectList];
    if (idx >= 0) {
      updated[idx] = summary;
    } else {
      updated.push(summary);
    }
    await set(PROJECTS_KEY, JSON.stringify(updated));
    setState({ projectList: updated });
  },
}));
