import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type OnNodesChange,
  type NodeChange,
  type Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useProjectStore } from '@/hooks/useProjectStore';
import { Button } from '@/components/ui/button';
import type { EnhancementScreenFlowNode } from '@/types/canvas';
import { EnhancementScreenNode } from './EnhancementScreenNode';

const nodeTypes = { enhancementScreen: EnhancementScreenNode };

export function EnhancementCanvas() {
  const screens = useProjectStore((s) => s.project.screens);
  const enhancementScreens = useProjectStore((s) => s.project.enhancementScreens ?? []);
  const enhancements = useProjectStore((s) => s.project.enhancements ?? []);
  const setNodePosition = useProjectStore((s) => s.setNodePosition);
  const setViewport = useProjectStore((s) => s.setViewport);
  const selectEnhancementScreen = useProjectStore((s) => s.selectEnhancementScreen);
  const openScreenPreview = useProjectStore((s) => s.openScreenPreview);
  const viewport = useProjectStore((s) => s.project.canvasViewport);

  // Build a map from enhScreen.id → first linked CR ref
  const enhRefMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const enh of enhancements) {
      for (const esId of enh.linkedScreenIds) {
        if (!map[esId] && enh.ref) {
          map[esId] = enh.ref;
        }
      }
    }
    return map;
  }, [enhancements]);

  const nodes: EnhancementScreenFlowNode[] = useMemo(() => {
    const sorted = [...enhancementScreens].sort((a, b) => a.order - b.order);
    return sorted.map((enhScreen) => {
      const screen = screens.find((s) => s.id === enhScreen.screenId);
      if (!screen) return null;

      return {
        id: enhScreen.screenId, // Use Screen.id as node ID for position tracking
        type: 'enhancementScreen' as const,
        position: screen.position,
        data: {
          enhScreen,
          screen,
          enhancementRef: enhRefMap[enhScreen.id],
        },
      };
    }).filter(Boolean) as EnhancementScreenFlowNode[];
  }, [enhancementScreens, screens, enhRefMap]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'position' && change.position && !change.dragging) {
          setNodePosition(change.id, change.position.x, change.position.y);
        }
        if (change.type === 'select' && change.selected) {
          // Find the enhancementScreen that corresponds to this screen node
          const enhScreen = enhancementScreens.find((es) => es.screenId === change.id);
          if (enhScreen) {
            selectEnhancementScreen(enhScreen.id);
          }
        }
      }
    },
    [setNodePosition, selectEnhancementScreen, enhancementScreens]
  );

  const onMoveEnd = useCallback(
    (_event: unknown, vp: Viewport) => {
      setViewport({ x: vp.x, y: vp.y, zoom: vp.zoom });
    },
    [setViewport]
  );

  const onPaneClick = useCallback(() => {
    selectEnhancementScreen(null);
  }, [selectEnhancementScreen]);

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: EnhancementScreenFlowNode) => {
      openScreenPreview(node.id); // node.id is Screen.id
    },
    [openScreenPreview]
  );

  const handleAutoLayout = useCallback(() => {
    const sorted = [...enhancementScreens].sort((a, b) => a.order - b.order);
    const cols = Math.max(1, Math.ceil(Math.sqrt(sorted.length)));
    const gapX = 320;
    const gapY = 260;
    for (let i = 0; i < sorted.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      setNodePosition(sorted[i].screenId, col * gapX + 50, row * gapY + 50);
    }
  }, [enhancementScreens, setNodePosition]);

  const defaultViewport = useMemo(
    () => ({ x: viewport.x, y: viewport.y, zoom: viewport.zoom }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="relative w-full h-full">
      {/* Top bar: screen count + auto layout */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-background/90 border border-border rounded-md px-2 py-1 text-xs text-muted-foreground shadow-sm">
          {enhancementScreens.length} screen{enhancementScreens.length !== 1 ? 's' : ''}
          {enhancements.length > 0 && (
            <span className="ml-1.5 text-primary font-medium">
              {enhancements.length} CR{enhancements.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {enhancementScreens.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs bg-background/90 shadow-sm"
            onClick={handleAutoLayout}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Auto Layout
          </Button>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDoubleClick={onNodeDoubleClick}
        onMoveEnd={onMoveEnd}
        onPaneClick={onPaneClick}
        defaultViewport={defaultViewport}
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode="Delete"
        nodesConnectable={false}
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
