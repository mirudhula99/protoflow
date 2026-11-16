import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { EnhancementScreenNodeData } from '@/types/canvas';
import { useProjectStore } from '@/hooks/useProjectStore';

function EnhancementScreenNodeComponent({ data }: NodeProps) {
  const nodeData = data as EnhancementScreenNodeData;
  const { enhScreen, screen, enhancementRef } = nodeData;
  const selectedId = useProjectStore((s) => s.ui.selectedEnhancementScreenId);
  const isSelected = selectedId === enhScreen.id;

  const glowCount = enhScreen.enhancedSelectors.length;

  return (
    <div
      className={`bg-card border rounded-lg shadow-sm w-[260px] overflow-hidden transition-colors ${
        isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      }`}
    >
      {/* Thumbnail */}
      <div className="h-[140px] bg-muted flex items-center justify-center overflow-hidden relative">
        {screen.thumbnailDataUrl ? (
          <img
            src={screen.thumbnailDataUrl}
            alt={enhScreen.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="text-xs text-muted-foreground">No preview</span>
        )}

        {/* Order badge */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-background/90 border border-border flex items-center justify-center text-xs font-bold">
          {enhScreen.order}
        </div>

        {/* Glow count */}
        {glowCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-600/90 text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
            </svg>
            {glowCount}
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="p-2">
        <p className="text-xs font-medium truncate">{enhScreen.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-muted-foreground font-mono">{enhScreen.divId}</span>
          {enhancementRef && (
            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
              {enhancementRef}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const EnhancementScreenNode = memo(EnhancementScreenNodeComponent);
