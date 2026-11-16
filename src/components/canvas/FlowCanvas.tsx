import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeChange,
  type Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useProjectStore, useScreens, useConnections } from '@/hooks/useProjectStore';
import type { ScreenFlowNode, ConnectionFlowEdge } from '@/types/canvas';
import { ScreenNode } from './ScreenNode';
import { ConnectionEdge } from './ConnectionEdge';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasMinimap } from './Minimap';
import { CanvasSearch } from './CanvasSearch';
import { TriggerConfigDialog } from '@/components/shared/TriggerConfigDialog';

const nodeTypes = { screen: ScreenNode };
const edgeTypes = { connection: ConnectionEdge };

export function FlowCanvas() {
  const screens = useScreens();
  const connections = useConnections();
  const setNodePosition = useProjectStore((s) => s.setNodePosition);
  const setViewport = useProjectStore((s) => s.setViewport);
  const selectNode = useProjectStore((s) => s.selectNode);
  const selectEdge = useProjectStore((s) => s.selectEdge);
  const openTriggerDialog = useProjectStore((s) => s.openTriggerDialog);
  const viewport = useProjectStore((s) => s.project.canvasViewport);

  const nodes: ScreenFlowNode[] = useMemo(
    () =>
      screens.map((screen) => ({
        id: screen.id,
        type: 'screen' as const,
        position: screen.position,
        data: { screen },
      })),
    [screens]
  );

  const edges: ConnectionFlowEdge[] = useMemo(
    () =>
      connections.map((conn) => ({
        id: conn.id,
        source: conn.sourceScreenId,
        target: conn.targetScreenId,
        type: 'connection' as const,
        data: {
          trigger: conn.trigger,
          animation: conn.animation,
          connectionId: conn.id,
          alertCode: conn.alertCode,
          label: conn.label,
          actionType: conn.actionType ?? 'navigate_to',
        },
      })),
    [connections]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'position' && change.position && !change.dragging) {
          setNodePosition(change.id, change.position.x, change.position.y);
        }
        if (change.type === 'select' && change.selected) {
          selectNode(change.id);
        }
      }
    },
    [setNodePosition, selectNode]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      for (const change of changes) {
        if (change.type === 'select' && change.selected) {
          selectEdge(change.id);
        }
      }
    },
    [selectEdge]
  );

  // Multiple connections between same screens are allowed
  const onConnect: OnConnect = useCallback(
    (params) => {
      if (params.source && params.target) {
        openTriggerDialog({ sourceId: params.source, targetId: params.target });
      }
    },
    [openTriggerDialog]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const screenId = event.dataTransfer.getData('application/protoflow-screen');
      if (!screenId) return;

      const reactFlowBounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const x = (event.clientX - reactFlowBounds.left - viewport.x) / viewport.zoom;
      const y = (event.clientY - reactFlowBounds.top - viewport.y) / viewport.zoom;

      setNodePosition(screenId, x, y);
    },
    [setNodePosition, viewport]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onMoveEnd = useCallback(
    (_event: unknown, vp: Viewport) => {
      setViewport({ x: vp.x, y: vp.y, zoom: vp.zoom });
    },
    [setViewport]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  const defaultViewport = useMemo(
    () => ({ x: viewport.x, y: viewport.y, zoom: viewport.zoom }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="relative w-full h-full">
      <CanvasToolbar />
      <CanvasSearch />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMoveEnd={onMoveEnd}
        onPaneClick={onPaneClick}
        defaultViewport={defaultViewport}
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode="Delete"
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
        <CanvasMinimap />
      </ReactFlow>
      <TriggerConfigDialog />
    </div>
  );
}
