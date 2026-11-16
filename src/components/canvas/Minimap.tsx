import { MiniMap } from '@xyflow/react';

export function CanvasMinimap() {
  return (
    <MiniMap
      nodeStrokeWidth={3}
      pannable
      zoomable
      className="!bg-background !border-border"
    />
  );
}
