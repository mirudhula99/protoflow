import { useReactFlow } from '@xyflow/react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { autoLayout } from '@/lib/auto-layout';
import { Button } from '@/components/ui/button';

export function CanvasToolbar() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const screens = useProjectStore((s) => s.project.screens);
  const connections = useProjectStore((s) => s.project.connections);
  const batchSetNodePositions = useProjectStore((s) => s.batchSetNodePositions);
  const selectedNodeId = useProjectStore((s) => s.ui.selectedNodeId);
  const selectedEdgeId = useProjectStore((s) => s.ui.selectedEdgeId);
  const removeScreen = useProjectStore((s) => s.removeScreen);
  const removeConnection = useProjectStore((s) => s.removeConnection);

  const handleAutoLayout = () => {
    const positions = autoLayout(screens, connections);
    batchSetNodePositions(positions);
    setTimeout(() => fitView({ padding: 0.1 }), 50);
  };

  const handleDelete = () => {
    if (selectedNodeId) removeScreen(selectedNodeId);
    else if (selectedEdgeId) removeConnection(selectedEdgeId);
  };

  return (
    <div className="absolute top-3 right-3 z-10 flex gap-1 bg-background/80 backdrop-blur border border-border rounded-lg p-1">
      <Button variant="ghost" size="sm" onClick={handleAutoLayout} className="h-8 w-8 p-0" title="Auto Layout">
        <LayoutIcon />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => fitView({ padding: 0.1 })} className="h-8 w-8 p-0" title="Fit View">
        <FitIcon />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => zoomIn()} className="h-8 w-8 p-0" title="Zoom In">
        <span className="text-sm font-bold">+</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => zoomOut()} className="h-8 w-8 p-0" title="Zoom Out">
        <span className="text-sm font-bold">-</span>
      </Button>
      {(selectedNodeId || selectedEdgeId) && (
        <Button variant="ghost" size="sm" onClick={handleDelete} className="h-8 w-8 p-0 text-destructive" title="Delete Selected">
          <DeleteIcon />
        </Button>
      )}
    </div>
  );
}

function LayoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
