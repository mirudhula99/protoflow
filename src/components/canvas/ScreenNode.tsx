import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { ScreenNodeData } from '@/types/canvas';
import { useProjectStore } from '@/hooks/useProjectStore';

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ScreenNodeComponent({ data }: NodeProps) {
  const nodeData = data as ScreenNodeData;
  const { screen } = nodeData;

  const handleCodeView = (e: React.MouseEvent) => {
    e.stopPropagation();
    useProjectStore.getState().openCodeView(screen.id);
  };

  return (
    <div className="group bg-card border border-border rounded-lg shadow-sm w-[240px] overflow-hidden relative">
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-primary" />
      <button
        onClick={handleCodeView}
        className="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center rounded bg-background/70 text-muted-foreground hover:text-foreground hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        title="View source"
      >
        <CodeIcon />
      </button>
      <div className="h-[120px] bg-muted flex items-center justify-center overflow-hidden">
        {screen.thumbnailDataUrl ? (
          <img
            src={screen.thumbnailDataUrl}
            alt={screen.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="text-xs text-muted-foreground">No preview</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium truncate">{screen.name}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-primary" />
    </div>
  );
}

export const ScreenNode = memo(ScreenNodeComponent);
