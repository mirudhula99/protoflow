export type ScreenType = 'form' | 'list' | 'modal' | 'slider' | 'toast' | 'dialog' | 'table' | 'custom';

export type TriggerType = 'click' | 'submit' | 'close' | 'dismiss' | 'custom';

export type AnimationType = 'instant' | 'dissolve' | 'smart_animate' | 'move_in' | 'move_out' | 'push' | 'slide_in' | 'slide_out';

export type AnimationDirection = 'left' | 'right' | 'top' | 'bottom';

export type EasingType = 'ease_in' | 'ease_out' | 'ease_in_out' | 'linear' | 'spring';

export type ActionType = 'navigate_to' | 'open_overlay' | 'close_overlay';

export type OverlayPosition = 'center' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'manual';

export type TemplateId = 'filter_dropdown' | 'success_toast' | 'error_toast' | 'confirmation_modal' | 'info_dialog';

export interface OverlaySettings {
  position: OverlayPosition;
  manual_offset?: { x: number; y: number };
  close_on_outside_click: boolean;
  background_dim: boolean;
  dim_opacity: number;
  auto_dismiss_ms?: number;
}

export interface TemplateConfig {
  templateId: TemplateId;
  props: Record<string, string | boolean | string[]>;
}

export interface OverlaySource {
  type: 'screen' | 'template';
  screenId?: string;
  templateConfig?: TemplateConfig;
}

export interface TriggerConfig {
  type: TriggerType;
  selector: string;
  eventName?: string;
}

export interface AnimationConfig {
  type: AnimationType;
  direction?: AnimationDirection;
  duration_ms: number;
  easing: EasingType;
}

export interface Screen {
  id: string;
  name: string;
  fileName: string;
  htmlContent: string;
  thumbnailDataUrl?: string;
  type: ScreenType;
  position: { x: number; y: number };
  metadata: {
    uploadedAt: string;
    fileHash: string;
    tags: string[];
  };
}

export interface Connection {
  id: string;
  sourceScreenId: string;
  targetScreenId: string;
  trigger: TriggerConfig;
  animation: AnimationConfig;
  alertCode?: string;
  label?: string;
  actionType: ActionType;
  overlaySettings?: OverlaySettings;
  overlaySource?: OverlaySource;
}

// ---- Enhancement Project Mode types ----

export type ProjectMode = 'standard' | 'enhancement';

export interface EnhancementChange {
  label: string;
  text: string;
}

export interface EnhancementConfigSetting {
  path: string;       // e.g. "Home > Settings > System Settings > Module"
  setting: string;    // e.g. "Enable Decision Tree"
}

export interface Enhancement {
  id: number;                           // 1-based sequential
  ref: string;                          // 'CR-1024' — optional, can be empty
  title: string;                        // shown in toolbar
  desc: string;                         // "The system should..."
  purpose: string;                      // verb-first user benefit
  problem: string;                      // "Current system..."
  client: string;                       // client name or "Multiple"
  linkedScreenIds: string[];            // EnhancementScreen IDs linked to this change request
  section: string | null;
  changes: EnhancementChange[];
  config: EnhancementConfigSetting | null;
}

export interface EnhancementScreen {
  id: string;                           // nanoid
  name: string;                         // e.g. "Dashboard Overview"
  divId: string;                        // export div ID, e.g. "perform"
  order: number;                        // pagination order (1-based)
  screenId: string;                     // -> Screen.id (the uploaded HTML file)
  enhancedSelectors: string[];          // CSS selectors auto-detected from data-enhanced markers
  currentOnlySelectors: string[];      // CSS selectors auto-detected from data-current-only markers
  shellDetected?: 'id-based' | 'class-based';  // set at upload if app shell found in HTML
  module?: string;                      // app module for this screen (e.g. 'dashboard') — determines sidebar active item
}

export interface EnhancementProjectMeta {
  module: string;                       // 'dashboard', 'projects', etc.
  pageTitle: string;                    // <title> for export
  sidebarActiveItem: string;            // which sidebar item is active
}

// ---- Project ----

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  screens: Screen[];
  connections: Connection[];
  canvasViewport: { x: number; y: number; zoom: number };
  mode: ProjectMode;
  enhancementMeta?: EnhancementProjectMeta;
  enhancementScreens?: EnhancementScreen[];
  enhancements?: Enhancement[];
}
