import { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import type { ConnectionEdgeData } from '@/types/canvas';

function ConnectionEdgeComponent(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style } = props;
  const edgeData = data as ConnectionEdgeData | undefined;
  const isOverlay = edgeData?.actionType === 'open_overlay';
  const isCloseOverlay = edgeData?.actionType === 'close_overlay';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = edgeData?.label || edgeData?.trigger?.selector || '';
  const alertCode = edgeData?.alertCode;

  const edgeStyle = {
    ...style,
    ...(isOverlay ? { stroke: '#8b5cf6', strokeDasharray: '6 3', strokeWidth: 2 } : {}),
    ...(isCloseOverlay ? { stroke: '#f59e0b', strokeDasharray: '4 4', strokeWidth: 1.5 } : {}),
  };

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} />
      {(label || alertCode || isOverlay || isCloseOverlay) && (
        <EdgeLabelRenderer>
          <div
            className={`absolute border rounded px-2 py-0.5 text-[10px] pointer-events-auto flex items-center gap-1 ${
              isOverlay ? 'bg-purple-50 border-purple-300' : isCloseOverlay ? 'bg-amber-50 border-amber-300' : 'bg-background border-border'
            }`}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {isOverlay && <span className="text-purple-600 text-[9px]">overlay</span>}
            {isCloseOverlay && <span className="text-amber-600 text-[9px]">close</span>}
            {label && <span className="text-foreground">{label}</span>}
            {alertCode && (
              <Badge variant="secondary" className="text-[8px] px-1 py-0">
                {alertCode}
              </Badge>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ConnectionEdge = memo(ConnectionEdgeComponent);
