import type { Screen, Connection, Enhancement, EnhancementScreen } from '@/types/project';

export type WarningType =
  | 'orphan' | 'missing-selector' | 'duplicate-selector' | 'unreachable' | 'self-loop' | 'dead-end'
  | 'enh-no-markers' | 'enh-empty-fields' | 'enh-no-screens' | 'enh-duplicate-ref'
  | 'enh-order-gap' | 'enh-order-duplicate';

export interface ValidationWarning {
  type: WarningType;
  message: string;
  screenId?: string;
  connectionId?: string;
  enhancementId?: number;
  enhScreenId?: string;
}

export function validateGraph(screens: Screen[], connections: Connection[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Self-loops (suppress for template overlay connections — they are intentional self-loops)
  for (const conn of connections) {
    if (conn.sourceScreenId === conn.targetScreenId) {
      const isTemplateOverlay = conn.actionType === 'open_overlay'
        && conn.overlaySource?.type === 'template';
      if (!isTemplateOverlay) {
        warnings.push({
          type: 'self-loop',
          message: `Connection "${conn.label || conn.id}" is a self-loop`,
          connectionId: conn.id,
        });
      }
    }
  }

  // Missing selectors
  for (const conn of connections) {
    if (!conn.trigger.selector.trim()) {
      warnings.push({
        type: 'missing-selector',
        message: `Connection "${conn.label || conn.id}" has no CSS selector`,
        connectionId: conn.id,
      });
    }
  }

  // Duplicate selectors (same source, same selector)
  const selectorMap = new Map<string, Connection[]>();
  for (const conn of connections) {
    const key = `${conn.sourceScreenId}::${conn.trigger.selector}`;
    const existing = selectorMap.get(key) ?? [];
    existing.push(conn);
    selectorMap.set(key, existing);
  }
  for (const [, conns] of selectorMap) {
    if (conns.length > 1) {
      for (const conn of conns) {
        warnings.push({
          type: 'duplicate-selector',
          message: `Duplicate selector "${conn.trigger.selector}" on same source screen`,
          connectionId: conn.id,
          screenId: conn.sourceScreenId,
        });
      }
    }
  }

  // Orphan screens (no connections at all)
  const connectedIds = new Set<string>();
  for (const conn of connections) {
    connectedIds.add(conn.sourceScreenId);
    connectedIds.add(conn.targetScreenId);
  }
  for (const screen of screens) {
    if (!connectedIds.has(screen.id)) {
      warnings.push({
        type: 'orphan',
        message: `"${screen.name}" has no connections`,
        screenId: screen.id,
      });
    }
  }

  // Dead-end screens (has incoming but no outgoing)
  const hasOutgoing = new Set<string>();
  const hasIncoming = new Set<string>();
  for (const conn of connections) {
    hasOutgoing.add(conn.sourceScreenId);
    hasIncoming.add(conn.targetScreenId);
  }
  for (const screen of screens) {
    if (hasIncoming.has(screen.id) && !hasOutgoing.has(screen.id)) {
      warnings.push({
        type: 'dead-end',
        message: `"${screen.name}" is a dead-end (no outgoing connections)`,
        screenId: screen.id,
      });
    }
  }

  return warnings;
}

// ── Enhancement-specific validation ──

export function validateEnhancementProject(
  enhScreens: EnhancementScreen[],
  enhancements: Enhancement[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Screens with no enhancement markers detected
  for (const es of enhScreens) {
    if (es.enhancedSelectors.length === 0 && es.currentOnlySelectors.length === 0) {
      warnings.push({
        type: 'enh-no-markers',
        message: `"${es.name}" has no data-enhanced or data-current-only markers — toggle won't show differences`,
        enhScreenId: es.id,
      });
    }
  }

  // Enhancements with empty required fields
  for (const enh of enhancements) {
    const missing: string[] = [];
    if (!enh.title.trim()) missing.push('title');
    if (!enh.desc.trim()) missing.push('description');
    if (missing.length > 0) {
      warnings.push({
        type: 'enh-empty-fields',
        message: `Enhancement #${enh.id} is missing: ${missing.join(', ')}`,
        enhancementId: enh.id,
      });
    }
  }

  // Enhancements with no linked screens
  for (const enh of enhancements) {
    if (enh.linkedScreenIds.length === 0) {
      warnings.push({
        type: 'enh-no-screens',
        message: `Enhancement #${enh.id} "${enh.title || 'Untitled'}" has no linked screens`,
        enhancementId: enh.id,
      });
    }
  }

  // Duplicate CR refs
  const refMap = new Map<string, Enhancement[]>();
  for (const enh of enhancements) {
    if (!enh.ref.trim()) continue;
    const key = enh.ref.trim().toUpperCase();
    const existing = refMap.get(key) ?? [];
    existing.push(enh);
    refMap.set(key, existing);
  }
  for (const [ref, enhs] of refMap) {
    if (enhs.length > 1) {
      for (const enh of enhs) {
        warnings.push({
          type: 'enh-duplicate-ref',
          message: `Duplicate CR ref "${ref}" on enhancement #${enh.id}`,
          enhancementId: enh.id,
        });
      }
    }
  }

  // Screen order gaps or duplicates
  const orders = enhScreens.map((es) => es.order);
  const orderSet = new Set(orders);
  if (orderSet.size !== orders.length) {
    warnings.push({
      type: 'enh-order-duplicate',
      message: 'Some screens share the same order number — pagination may behave unexpectedly',
    });
  }
  const sorted = [...orders].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] > 1) {
      warnings.push({
        type: 'enh-order-gap',
        message: `Gap in screen ordering between #${sorted[i]} and #${sorted[i + 1]}`,
      });
      break;
    }
  }

  return warnings;
}
