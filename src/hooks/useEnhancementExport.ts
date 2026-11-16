import { useCallback } from 'react';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { useProjectStore } from './useProjectStore';
import { exportEnhancementHtml } from '@/lib/enhancement-export';
import { log } from '@/lib/log';

export function useEnhancementExport() {
  const project = useProjectStore((s) => s.project);

  const exportHtml = useCallback(() => {
    try {
      const html = exportEnhancementHtml(project);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const fileName = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-enhancements.html`;
      saveAs(blob, fileName);
      log.info('export_succeeded', {
        kind: 'enhancement',
        enhancements: project.enhancements?.length ?? 0,
        enhancementScreens: project.enhancementScreens?.length ?? 0,
      });
      toast.success('Exported the enhancement demo as an HTML file.');
    } catch (err) {
      log.error('export_failed', { kind: 'enhancement', error: err });
      toast.error('Enhancement export failed. See the console for details.');
    }
  }, [project]);

  const getPreviewBlobUrl = useCallback((): string => {
    const html = exportEnhancementHtml(project);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    return URL.createObjectURL(blob);
  }, [project]);

  return { exportHtml, getPreviewBlobUrl };
}
