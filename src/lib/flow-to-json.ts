import type { Project } from '@/types/project';

export interface ExportedProject {
  name: string;
  screens: {
    id: string;
    name: string;
    fileName: string;
    type: string;
    position: { x: number; y: number };
    tags: string[];
  }[];
  connections: {
    id: string;
    sourceScreenId: string;
    targetScreenId: string;
    trigger: { type: string; selector: string; eventName?: string };
    animation: { type: string; direction?: string; duration_ms: number; easing: string };
    alertCode?: string;
    label?: string;
    actionType: string;
    overlaySettings?: Record<string, unknown>;
    overlaySource?: Record<string, unknown>;
  }[];
  canvasViewport: { x: number; y: number; zoom: number };
}

export function projectToJson(project: Project): ExportedProject {
  return {
    name: project.name,
    screens: project.screens.map((s) => ({
      id: s.id,
      name: s.name,
      fileName: s.fileName,
      type: s.type,
      position: s.position,
      tags: s.metadata.tags,
    })),
    connections: project.connections.map((c) => ({
      id: c.id,
      sourceScreenId: c.sourceScreenId,
      targetScreenId: c.targetScreenId,
      trigger: {
        type: c.trigger.type,
        selector: c.trigger.selector,
        eventName: c.trigger.eventName,
      },
      animation: {
        type: c.animation.type,
        direction: c.animation.direction,
        duration_ms: c.animation.duration_ms,
        easing: c.animation.easing,
      },
      alertCode: c.alertCode,
      label: c.label,
      actionType: c.actionType ?? 'navigate_to',
      overlaySettings: c.overlaySettings as Record<string, unknown> | undefined,
      overlaySource: c.overlaySource as Record<string, unknown> | undefined,
    })),
    canvasViewport: project.canvasViewport,
  };
}
