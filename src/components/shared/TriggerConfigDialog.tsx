import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useProjectStore } from '@/hooks/useProjectStore';
import { TriggerSelect } from './TriggerSelect';
import { ElementPicker, type ElementInfo } from './ElementPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ANIMATION_TYPES,
  EASING_TYPES,
  DIRECTIONAL_ANIMATIONS,
  DEFAULT_ANIMATION,
  ACTION_TYPES,
  DEFAULT_OVERLAY_SETTINGS,
} from '@/lib/constants';
import { getDefaultTemplateProps } from '@/lib/templates';
import { OverlayConfigPanel } from './OverlayConfigPanel';
import type { TriggerType, AnimationType, AnimationDirection, EasingType, ActionType, OverlaySettings, OverlaySource, Screen } from '@/types/project';

export function TriggerConfigDialog() {
  const open = useProjectStore((s) => s.ui.triggerDialogOpen);
  const pending = useProjectStore((s) => s.ui.pendingConnection);
  const screens = useProjectStore((s) => s.project.screens);
  const closeTriggerDialog = useProjectStore((s) => s.closeTriggerDialog);
  const addConnection = useProjectStore((s) => s.addConnection);

  const [triggerType, setTriggerType] = useState<TriggerType>('click');
  const [selector, setSelector] = useState('');
  const [pickedText, setPickedText] = useState('');
  const [alertCode, setAlertCode] = useState('');
  const [label, setLabel] = useState('');
  const [animType, setAnimType] = useState<AnimationType>(DEFAULT_ANIMATION.type);
  const [animDirection, setAnimDirection] = useState<AnimationDirection>('left');
  const [animDuration, setAnimDuration] = useState(DEFAULT_ANIMATION.duration_ms);
  const [animEasing, setAnimEasing] = useState<EasingType>(DEFAULT_ANIMATION.easing);
  const [actionType, setActionType] = useState<ActionType>('navigate_to');
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>({ ...DEFAULT_OVERLAY_SETTINGS });
  const [overlaySource, setOverlaySource] = useState<OverlaySource>({
    type: 'template',
    templateConfig: { templateId: 'filter_dropdown', props: getDefaultTemplateProps('filter_dropdown') },
  });
  const [hoveredElement, setHoveredElement] = useState<ElementInfo | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  // Right panel mode: 'inspect' (element details) or 'config' (connection settings)
  const [rightPanel, setRightPanel] = useState<'inspect' | 'config'>('inspect');

  const sourceScreen = pending ? screens.find((s) => s.id === pending.sourceId) : null;
  const targetScreen = pending ? screens.find((s) => s.id === pending.targetId) : null;

  const handleElementPicked = useCallback((info: ElementInfo) => {
    setSelector(info.selector);
    setPickedText(info.elementText);
    setSelectedElement(info);
    if (!label && info.elementText) setLabel(info.elementText.substring(0, 40));
    setRightPanel('config');
  }, [label]);

  const handleElementHover = useCallback((info: ElementInfo | null) => {
    setHoveredElement(info);
  }, []);

  const handleConfirm = () => {
    if (!pending || !selector.trim()) return;

    const isOverlay = actionType === 'open_overlay';
    // For template overlays, self-loop (source === target)
    const targetId = isOverlay && overlaySource.type === 'template'
      ? pending.sourceId
      : pending.targetId;

    addConnection({
      id: nanoid(),
      sourceScreenId: pending.sourceId,
      targetScreenId: targetId,
      trigger: { type: triggerType, selector: selector.trim() },
      animation: {
        type: animType,
        direction: DIRECTIONAL_ANIMATIONS.includes(animType) ? animDirection : undefined,
        duration_ms: animDuration,
        easing: animEasing,
      },
      alertCode: alertCode.trim() || undefined,
      label: label.trim() || undefined,
      actionType,
      overlaySettings: isOverlay ? overlaySettings : undefined,
      overlaySource: isOverlay ? overlaySource : undefined,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setTriggerType('click');
    setSelector('');
    setPickedText('');
    setAlertCode('');
    setLabel('');
    setAnimType(DEFAULT_ANIMATION.type);
    setAnimDirection('left');
    setAnimDuration(DEFAULT_ANIMATION.duration_ms);
    setAnimEasing(DEFAULT_ANIMATION.easing);
    setActionType('navigate_to');
    setOverlaySettings({ ...DEFAULT_OVERLAY_SETTINGS });
    setOverlaySource({ type: 'template', templateConfig: { templateId: 'filter_dropdown', props: getDefaultTemplateProps('filter_dropdown') } });
    setHoveredElement(null);
    setSelectedElement(null);
    setRightPanel('inspect');
    closeTriggerDialog();
  };

  if (!open) return null;

  // Show hovered element info, fall back to selected
  const displayElement = hoveredElement || selectedElement;

  return (
    <div className="fixed inset-0 z-50 bg-background flex">
      {/* Left: Full-size HTML Preview */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0">
        <div className="h-10 flex items-center px-4 border-b border-border bg-muted/50 gap-3 flex-shrink-0">
          <span className="text-xs font-semibold">{sourceScreen?.name ?? '?'}</span>
          <span className="text-muted-foreground text-xs">→</span>
          <span className="text-xs">{targetScreen?.name ?? '?'}</span>
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 ml-auto">
            Click element to select trigger
          </Badge>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          {sourceScreen && (
            <ElementPicker
              htmlContent={sourceScreen.htmlContent}
              onSelect={handleElementPicked}
              onHover={handleElementHover}
              selectedSelector={selector}
            />
          )}
        </div>
        {/* Breadcrumb bar at bottom */}
        {displayElement && (
          <div className="h-7 flex items-center px-3 border-t border-border bg-[#1e1e2e] overflow-x-auto flex-shrink-0">
            {displayElement.breadcrumb.map((part, i) => (
              <span key={i} className="flex items-center">
                {i > 0 && <span className="text-[#6b7280] mx-1 text-[10px]">›</span>}
                <span className="text-[#569cd6] text-[11px] font-mono whitespace-nowrap">{part}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right: Element Inspector + Config */}
      <div className="w-[380px] flex flex-col bg-background overflow-hidden">
        {/* Tab bar */}
        <div className="h-10 flex items-center border-b border-border flex-shrink-0">
          <button
            className={`flex-1 h-full text-xs font-medium border-b-2 transition-colors ${
              rightPanel === 'inspect' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setRightPanel('inspect')}
          >
            Elements
          </button>
          <button
            className={`flex-1 h-full text-xs font-medium border-b-2 transition-colors ${
              rightPanel === 'config' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setRightPanel('config')}
          >
            Interaction
          </button>
          <button
            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={resetAndClose}
          >
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rightPanel === 'inspect' ? (
            <InspectPanel element={displayElement} />
          ) : (
            <ConfigPanel
              selector={selector}
              setSelector={setSelector}
              pickedText={pickedText}
              setPickedText={setPickedText}
              selectedElement={selectedElement}
              triggerType={triggerType}
              setTriggerType={setTriggerType}
              targetName={targetScreen?.name ?? 'Unknown'}
              animType={animType}
              setAnimType={setAnimType}
              animDirection={animDirection}
              setAnimDirection={setAnimDirection}
              animDuration={animDuration}
              setAnimDuration={setAnimDuration}
              animEasing={animEasing}
              setAnimEasing={setAnimEasing}
              label={label}
              setLabel={setLabel}
              alertCode={alertCode}
              setAlertCode={setAlertCode}
              actionType={actionType}
              setActionType={setActionType}
              overlaySettings={overlaySettings}
              setOverlaySettings={setOverlaySettings}
              overlaySource={overlaySource}
              setOverlaySource={setOverlaySource}
              screens={screens}
              sourceScreenId={pending?.sourceId ?? ''}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="flex-1" onClick={resetAndClose}>Cancel</Button>
          <Button size="sm" className="flex-1" onClick={handleConfirm} disabled={!selector.trim()}>
            Create Connection
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Element Inspector Panel (DevTools-style) ---------- */

function InspectPanel({ element }: { element: ElementInfo | null }) {
  if (!element) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-8 text-center">
        Hover over an element in the preview to inspect it
      </div>
    );
  }

  return (
    <div className="text-xs">
      {/* Element info card */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[#569cd6] font-semibold">{element.tag}</span>
          {element.id && <span className="font-mono text-[#d19a66]">#{element.id}</span>}
          {element.dimensions.width > 0 && (
            <span className="text-muted-foreground ml-auto">
              {element.dimensions.width} × {element.dimensions.height}
            </span>
          )}
        </div>
        {element.classes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {element.classes.map((cls, i) => (
              <Badge key={i} variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-[#2d2d3d] text-[#ce9178] border-[#3e3e4e]">
                .{cls}
              </Badge>
            ))}
          </div>
        )}
        {element.elementText && (
          <p className="text-muted-foreground truncate">"{element.elementText}"</p>
        )}
      </div>

      {/* Computed Styles */}
      <div className="p-3 border-b border-border">
        <h4 className="font-semibold text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">Styles</h4>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
          <StyleRow label="Color" value={element.computedStyles.color} isColor />
          <StyleRow label="Background" value={element.computedStyles.backgroundColor} isColor />
          <StyleRow label="Font" value={element.computedStyles.fontSize + ' ' + element.computedStyles.fontFamily} />
          <StyleRow label="Display" value={element.computedStyles.display} />
          <StyleRow label="Position" value={element.computedStyles.position} />
        </div>
      </div>

      {/* HTML Source */}
      <div className="p-3 border-b border-border">
        <h4 className="font-semibold text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">HTML</h4>
        <pre className="p-2 rounded bg-[#1e1e2e] text-[#d4d4d4] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-[200px] overflow-y-auto">
          <HtmlHighlight html={element.htmlSnippet} />
        </pre>
      </div>

      {/* Selector */}
      <div className="p-3">
        <h4 className="font-semibold text-muted-foreground mb-2 uppercase tracking-wider text-[10px]">Selector</h4>
        <code className="block p-2 rounded bg-muted font-mono text-[11px] break-all">{element.selector}</code>
      </div>
    </div>
  );
}

function StyleRow({ label, value, isColor }: { label: string; value: string; isColor?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 ml-auto">
        {isColor && (
          <span
            className="w-3 h-3 rounded-sm border border-border inline-block flex-shrink-0"
            style={{ backgroundColor: value }}
          />
        )}
        <span className="font-mono text-[10px] truncate max-w-[100px]">{value}</span>
      </div>
    </div>
  );
}

function HtmlHighlight({ html }: { html: string }) {
  // Simple syntax highlighting for HTML
  const parts = html.split(/(<[^>]+>)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('<')) {
          // It's a tag
          return <span key={i} className="text-[#569cd6]">{part}</span>;
        }
        // Text content
        return <span key={i} className="text-[#d4d4d4]">{part}</span>;
      })}
    </>
  );
}

/* ---------- Connection Config Panel ---------- */

interface ConfigPanelProps {
  selector: string;
  setSelector: (v: string) => void;
  pickedText: string;
  setPickedText: (v: string) => void;
  selectedElement: ElementInfo | null;
  triggerType: TriggerType;
  setTriggerType: (v: TriggerType) => void;
  targetName: string;
  animType: AnimationType;
  setAnimType: (v: AnimationType) => void;
  animDirection: AnimationDirection;
  setAnimDirection: (v: AnimationDirection) => void;
  animDuration: number;
  setAnimDuration: (v: number) => void;
  animEasing: EasingType;
  setAnimEasing: (v: EasingType) => void;
  label: string;
  setLabel: (v: string) => void;
  alertCode: string;
  setAlertCode: (v: string) => void;
  actionType: ActionType;
  setActionType: (v: ActionType) => void;
  overlaySettings: OverlaySettings;
  setOverlaySettings: (v: OverlaySettings) => void;
  overlaySource: OverlaySource;
  setOverlaySource: (v: OverlaySource) => void;
  screens: Screen[];
  sourceScreenId: string;
}

function ConfigPanel(props: ConfigPanelProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Selected element */}
      {props.selector ? (
        <div className="p-2.5 rounded-md bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-[10px]">Selected</Badge>
            {props.selectedElement && (
              <span className="text-[10px] text-green-700 font-mono">&lt;{props.selectedElement.tag}&gt;</span>
            )}
          </div>
          <p className="text-[11px] font-mono text-green-900 break-all">{props.selector}</p>
          {props.pickedText && <p className="text-[10px] text-green-700 truncate mt-0.5">"{props.pickedText}"</p>}
        </div>
      ) : (
        <div className="p-2.5 rounded-md bg-muted/50 border border-dashed border-border text-center">
          <p className="text-xs text-muted-foreground">Click an element in the preview to select it</p>
        </div>
      )}

      {/* Manual selector */}
      <div className="space-y-1">
        <Label className="text-[11px]">CSS Selector</Label>
        <Input
          placeholder="#submit-btn, .nav-link"
          value={props.selector}
          onChange={(e) => { props.setSelector(e.target.value); props.setPickedText(''); }}
          className="h-7 text-xs font-mono"
        />
      </div>

      <Separator />

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">TRIGGER</Label>
        <TriggerSelect value={props.triggerType} onValueChange={props.setTriggerType} />
      </div>

      <Separator />

      {/* Action Type */}
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">ACTION TYPE</Label>
        <Select value={props.actionType} onValueChange={(v) => props.setActionType(v as ActionType)}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overlay Config - shown when action is open_overlay */}
      {props.actionType === 'open_overlay' && (
        <>
          <Separator />
          <OverlayConfigPanel
            screens={props.screens}
            sourceScreenId={props.sourceScreenId}
            overlaySettings={props.overlaySettings}
            overlaySource={props.overlaySource}
            onSettingsChange={props.setOverlaySettings}
            onSourceChange={props.setOverlaySource}
          />
        </>
      )}

      {/* Destination - only for navigate_to */}
      {props.actionType === 'navigate_to' && (
        <>
          <Separator />
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">DESTINATION</Label>
            <div className="h-7 flex items-center px-3 rounded-md border border-border bg-muted/50 text-xs">
              {props.targetName}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-2">
        <Label className="text-[11px] text-muted-foreground">ANIMATION</Label>
        <Select value={props.animType} onValueChange={(v) => props.setAnimType(v as AnimationType)}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ANIMATION_TYPES.map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {DIRECTIONAL_ANIMATIONS.includes(props.animType) && (
          <div className="grid grid-cols-4 gap-1">
            {(['left', 'right', 'top', 'bottom'] as AnimationDirection[]).map((dir) => (
              <Button
                key={dir}
                variant={props.animDirection === dir ? 'default' : 'outline'}
                size="sm"
                className="h-6 text-[10px] capitalize"
                onClick={() => props.setAnimDirection(dir)}
              >
                {dir}
              </Button>
            ))}
          </div>
        )}

        {props.animType !== 'instant' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Duration (ms)</Label>
              <Input type="number" value={props.animDuration} onChange={(e) => props.setAnimDuration(Number(e.target.value))} className="h-7 text-xs" min={0} max={5000} step={50} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Easing</Label>
              <Select value={props.animEasing} onValueChange={(v) => props.setAnimEasing(v as EasingType)}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EASING_TYPES.map((e) => (<SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-[11px]">Label</Label>
          <Input placeholder="Edge label" value={props.label} onChange={(e) => props.setLabel(e.target.value)} className="h-7 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Alert Code</Label>
          <Input placeholder="Optional alert message" value={props.alertCode} onChange={(e) => props.setAlertCode(e.target.value)} className="h-7 text-xs" />
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" /><path d="M6 6l12 12" />
    </svg>
  );
}
