import type { ScreenType, TriggerType, AnimationType, EasingType, AnimationConfig, ActionType, OverlayPosition, TemplateId, OverlaySettings, ProjectMode, EnhancementProjectMeta } from '@/types/project';

export const SCREEN_TYPES: { value: ScreenType; label: string; color: string }[] = [
  { value: 'form', label: 'Form', color: '#3b82f6' },
  { value: 'list', label: 'List', color: '#8b5cf6' },
  { value: 'modal', label: 'Modal', color: '#ec4899' },
  { value: 'slider', label: 'Slider', color: '#f59e0b' },
  { value: 'toast', label: 'Toast', color: '#ef4444' },
  { value: 'dialog', label: 'Dialog', color: '#10b981' },
  { value: 'table', label: 'Table', color: '#06b6d4' },
  { value: 'custom', label: 'Custom', color: '#6b7280' },
];

export const TRIGGER_TYPES: { value: TriggerType; label: string }[] = [
  { value: 'click', label: 'On Click' },
  { value: 'submit', label: 'On Submit' },
  { value: 'close', label: 'On Close' },
  { value: 'dismiss', label: 'On Dismiss' },
  { value: 'custom', label: 'Custom' },
];

export const ANIMATION_TYPES: { value: AnimationType; label: string }[] = [
  { value: 'instant', label: 'Instant' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'smart_animate', label: 'Smart Animate' },
  { value: 'move_in', label: 'Move In' },
  { value: 'move_out', label: 'Move Out' },
  { value: 'push', label: 'Push' },
  { value: 'slide_in', label: 'Slide In' },
  { value: 'slide_out', label: 'Slide Out' },
];

export const EASING_TYPES: { value: EasingType; label: string }[] = [
  { value: 'ease_in', label: 'Ease In' },
  { value: 'ease_out', label: 'Ease Out' },
  { value: 'ease_in_out', label: 'Ease In Out' },
  { value: 'linear', label: 'Linear' },
  { value: 'spring', label: 'Spring' },
];

export const DIRECTIONAL_ANIMATIONS: AnimationType[] = ['move_in', 'move_out', 'push', 'slide_in', 'slide_out'];

export const DEFAULT_ANIMATION: AnimationConfig = {
  type: 'instant',
  duration_ms: 300,
  easing: 'ease_out',
};

export const PROTOFLOW_START = '<!-- PROTOFLOW:START -->';
export const PROTOFLOW_END = '<!-- PROTOFLOW:END -->';

export const DEFAULT_NODE_WIDTH = 240;
export const DEFAULT_NODE_HEIGHT = 180;

export const DEFAULT_PROJECT_NAME = 'Untitled Project';

export function inferScreenType(fileName: string): ScreenType {
  const lower = fileName.toLowerCase();
  if (lower.includes('modal')) return 'modal';
  if (lower.includes('dialog')) return 'dialog';
  if (lower.includes('toast')) return 'toast';
  if (lower.includes('list') || lower.includes('listing')) return 'list';
  if (lower.includes('table')) return 'table';
  if (lower.includes('slider')) return 'slider';
  if (lower.includes('form') || lower.includes('create') || lower.includes('edit')) return 'form';
  return 'custom';
}

export function getScreenTypeConfig(type: ScreenType) {
  return SCREEN_TYPES.find((t) => t.value === type) ?? SCREEN_TYPES[7];
}

export const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 'navigate_to', label: 'Navigate To' },
  { value: 'open_overlay', label: 'Open Overlay' },
  { value: 'close_overlay', label: 'Close Overlay' },
];

export const OVERLAY_POSITIONS: { value: OverlayPosition; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top_left', label: 'Top Left' },
  { value: 'top_right', label: 'Top Right' },
  { value: 'bottom_left', label: 'Bottom Left' },
  { value: 'bottom_right', label: 'Bottom Right' },
  { value: 'manual', label: 'Manual' },
];

export const BUILT_IN_TEMPLATES: { value: TemplateId; label: string; description: string }[] = [
  { value: 'filter_dropdown', label: 'Filter Dropdown', description: 'Styled dropdown with selectable options' },
  { value: 'success_toast', label: 'Success Toast', description: 'Green success notification banner' },
  { value: 'error_toast', label: 'Error Toast', description: 'Red error notification banner' },
  { value: 'confirmation_modal', label: 'Confirmation Modal', description: 'Confirm/Cancel dialog' },
  { value: 'info_dialog', label: 'Info Dialog', description: 'Simple informational popup' },
];

export const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
  position: 'center',
  close_on_outside_click: true,
  background_dim: true,
  dim_opacity: 0.5,
};

// ---- Enhancement Project Mode constants ----

export const PROJECT_MODES: { value: ProjectMode; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Canvas prototyping with navigation linking' },
  { value: 'enhancement', label: 'Enhancement', description: 'Change-request enhancement demos with toolbar & toggle' },
];

export const ENHANCEMENT_MODULES: { value: string; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'projects', label: 'Projects' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'reports', label: 'Reports' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'documents', label: 'Documents' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'users', label: 'Users' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'settings', label: 'Settings' },
];

/** Get the sidebar label for a module value — used to auto-set sidebar active item */
export function getModuleLabel(moduleValue: string): string {
  return ENHANCEMENT_MODULES.find((m) => m.value === moduleValue)?.label ?? 'Home';
}

export const DEFAULT_ENHANCEMENT_META: EnhancementProjectMeta = {
  module: 'dashboard',
  pageTitle: 'Enhancement Demo',
  sidebarActiveItem: 'Dashboard',
};

export const DATA_ENHANCED_ATTR = 'data-enhanced';
export const DATA_CURRENT_ONLY_ATTR = 'data-current-only';
