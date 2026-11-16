import { useEffect } from 'react';
import { set } from 'idb-keyval';
import { toast } from 'sonner';
import { useProjectStore } from './useProjectStore';
import { useAppStore } from './useAppStore';
import { log } from '@/lib/log';

const PROJECT_PREFIX = 'protoflow-project-';
const DEBOUNCE_MS = 500;

export function usePersistence() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // Only surface the save-failure toast once per outage, not on every
    // debounced attempt — otherwise a full disk spams a toast every 500ms.
    let saveFailed = false;

    const unsub = useProjectStore.subscribe((state) => {
      const projectId = useAppStore.getState().currentProjectId;
      if (!projectId) return;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          await set(`${PROJECT_PREFIX}${projectId}`, JSON.stringify(state.project));
          await useAppStore.getState().updateProjectSummary();
          if (saveFailed) {
            saveFailed = false;
            log.info('persist_recovered', { projectId });
            toast.success('Saved — storage is working again.');
          }
        } catch (err) {
          const quotaExceeded = err instanceof Error && err.name === 'QuotaExceededError';
          // 'why?' signal — structured, greppable, no HTML content logged.
          log.error('persist_failed', {
            projectId,
            screens: state.project.screens.length,
            quotaExceeded,
            error: err,
          });
          // 'symptom the user feels' signal — sticky so it can't be missed.
          if (!saveFailed) {
            saveFailed = true;
            toast.error(
              quotaExceeded
                ? 'Could not save — browser storage is full. Export your project now to avoid losing work.'
                : 'Could not save your latest changes. Export your project as a backup.',
              { duration: Infinity }
            );
          }
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
  }, []);
}
