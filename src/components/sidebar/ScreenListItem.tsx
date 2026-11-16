import { useProjectStore } from '@/hooks/useProjectStore';
import type { Screen } from '@/types/project';

interface ScreenListItemProps {
  screen: Screen;
}

export function ScreenListItem({ screen }: ScreenListItemProps) {
  const selectNode = useProjectStore((s) => s.selectNode);
  const selectedNodeId = useProjectStore((s) => s.ui.selectedNodeId);
  const isSelected = selectedNodeId === screen.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/protoflow-screen', screen.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-accent ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={() => selectNode(screen.id)}
      draggable
      onDragStart={handleDragStart}
    >
      {screen.thumbnailDataUrl ? (
        <img
          src={screen.thumbnailDataUrl}
          alt={screen.name}
          className="w-12 h-8 rounded border border-border object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-8 rounded border border-border bg-muted flex-shrink-0 flex items-center justify-center">
          <span className="text-[8px] text-muted-foreground">HTML</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{screen.name}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          useProjectStore.getState().duplicateScreen(screen.id);
        }}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-accent/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        title="Duplicate screen"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
    </div>
  );
}
