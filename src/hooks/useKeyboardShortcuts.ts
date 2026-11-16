import { useEffect } from 'react';
import { useProjectStore } from './useProjectStore';
import { useExport } from './useExport';

export function useKeyboardShortcuts() {
  const removeScreen = useProjectStore((s) => s.removeScreen);
  const removeConnection = useProjectStore((s) => s.removeConnection);
  const selectedNodeId = useProjectStore((s) => s.ui.selectedNodeId);
  const selectedEdgeId = useProjectStore((s) => s.ui.selectedEdgeId);
  const selectNode = useProjectStore((s) => s.selectNode);
  const selectEdge = useProjectStore((s) => s.selectEdge);
  const openPreview = useProjectStore((s) => s.openPreview);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const { exportZip } = useExport();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Ctrl+Z / Cmd+Z: Undo — but let inputs keep their native text undo
      if (!isInput && (e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y / Cmd+Shift+Z: Redo — but let inputs keep their native text redo
      if (!isInput && (e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        if (selectedNodeId) { removeScreen(selectedNodeId); e.preventDefault(); }
        else if (selectedEdgeId) { removeConnection(selectedEdgeId); e.preventDefault(); }
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        selectNode(null);
        selectEdge(null);
      }

      // Ctrl+E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportZip();
      }

      // Ctrl+P: Preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        openPreview();
      }

      // Ctrl+F: Search screens
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        useProjectStore.getState().openSearch();
        return;
      }

      // Ctrl+S: No-op (auto-saved)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, selectedEdgeId, removeScreen, removeConnection, selectNode, selectEdge, exportZip, openPreview, undo, redo]);
}
