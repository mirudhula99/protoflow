import type { Node, Edge } from '@xyflow/react';
import type { Screen, TriggerConfig, AnimationConfig, ActionType, EnhancementScreen } from './project';

export interface ScreenNodeData extends Record<string, unknown> {
  screen: Screen;
}

export interface ConnectionEdgeData extends Record<string, unknown> {
  trigger: TriggerConfig;
  animation: AnimationConfig;
  connectionId: string;
  alertCode?: string;
  label?: string;
  actionType: ActionType;
}

export interface EnhancementScreenNodeData extends Record<string, unknown> {
  enhScreen: EnhancementScreen;
  screen: Screen;
  enhancementRef?: string;
}

export type ScreenFlowNode = Node<ScreenNodeData, 'screen'>;
export type ConnectionFlowEdge = Edge<ConnectionEdgeData>;
export type EnhancementScreenFlowNode = Node<EnhancementScreenNodeData, 'enhancementScreen'>;
