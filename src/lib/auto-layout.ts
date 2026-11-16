import dagre from '@dagrejs/dagre';
import type { Screen, Connection } from '@/types/project';
import { DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT } from './constants';

export function autoLayout(
  screens: Screen[],
  connections: Connection[]
): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 120 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const screen of screens) {
    g.setNode(screen.id, { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT });
  }

  for (const conn of connections) {
    g.setEdge(conn.sourceScreenId, conn.targetScreenId);
  }

  dagre.layout(g);

  const positions = new Map<string, { x: number; y: number }>();
  for (const screen of screens) {
    const node = g.node(screen.id);
    if (node) {
      positions.set(screen.id, {
        x: node.x - DEFAULT_NODE_WIDTH / 2,
        y: node.y - DEFAULT_NODE_HEIGHT / 2,
      });
    }
  }

  return positions;
}
