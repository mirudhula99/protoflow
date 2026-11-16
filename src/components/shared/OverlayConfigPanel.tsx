import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OVERLAY_POSITIONS, BUILT_IN_TEMPLATES } from '@/lib/constants';
import { getDefaultTemplateProps } from '@/lib/templates';
import { TemplateConfigurator } from './TemplateConfigurator';
import { TemplatePreview } from './TemplatePreview';
import type { OverlaySettings, OverlaySource, OverlayPosition, TemplateId, Screen } from '@/types/project';

interface OverlayConfigPanelProps {
  screens: Screen[];
  sourceScreenId: string;
  overlaySettings: OverlaySettings;
  overlaySource: OverlaySource;
  onSettingsChange: (settings: OverlaySettings) => void;
  onSourceChange: (source: OverlaySource) => void;
}

export function OverlayConfigPanel({
  screens,
  sourceScreenId,
  overlaySettings,
  overlaySource,
  onSettingsChange,
  onSourceChange,
}: OverlayConfigPanelProps) {
  const otherScreens = screens.filter((s) => s.id !== sourceScreenId);

  return (
    <div className="space-y-3">
      {/* Overlay Source */}
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">OVERLAY SOURCE</Label>
        <Select
          value={overlaySource.type}
          onValueChange={(v) => {
            if (v === 'template') {
              const templateId: TemplateId = 'filter_dropdown';
              onSourceChange({
                type: 'template',
                templateConfig: { templateId, props: getDefaultTemplateProps(templateId) },
              });
            } else {
              onSourceChange({ type: 'screen', screenId: otherScreens[0]?.id });
            }
          }}
        >
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="template">Built-in Template</SelectItem>
            <SelectItem value="screen">Existing Screen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template picker or screen picker */}
      {overlaySource.type === 'template' && overlaySource.templateConfig && (
        <>
          <div className="space-y-1">
            <Label className="text-[11px]">Template</Label>
            <Select
              value={overlaySource.templateConfig.templateId}
              onValueChange={(v) => {
                const tid = v as TemplateId;
                onSourceChange({
                  type: 'template',
                  templateConfig: { templateId: tid, props: getDefaultTemplateProps(tid) },
                });
              }}
            >
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUILT_IN_TEMPLATES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              {BUILT_IN_TEMPLATES.find((t) => t.value === overlaySource.templateConfig!.templateId)?.description}
            </p>
          </div>

          <Separator />
          <TemplateConfigurator
            templateId={overlaySource.templateConfig.templateId}
            props={overlaySource.templateConfig.props}
            onChange={(props) =>
              onSourceChange({
                ...overlaySource,
                templateConfig: { ...overlaySource.templateConfig!, props },
              })
            }
          />
          <TemplatePreview config={overlaySource.templateConfig} />
        </>
      )}

      {overlaySource.type === 'screen' && (
        <div className="space-y-1">
          <Label className="text-[11px]">Screen</Label>
          <Select
            value={overlaySource.screenId ?? ''}
            onValueChange={(v) => onSourceChange({ ...overlaySource, screenId: v ?? undefined })}
          >
            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Select screen" /></SelectTrigger>
            <SelectContent>
              {screens.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      {/* Position */}
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">POSITION</Label>
        <Select
          value={overlaySettings.position}
          onValueChange={(v) => onSettingsChange({ ...overlaySettings, position: v as OverlayPosition })}
        >
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {OVERLAY_POSITIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {overlaySettings.position === 'manual' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">X offset (px)</Label>
            <Input
              type="number"
              value={overlaySettings.manual_offset?.x ?? 0}
              onChange={(e) => onSettingsChange({ ...overlaySettings, manual_offset: { x: Number(e.target.value), y: overlaySettings.manual_offset?.y ?? 0 } })}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Y offset (px)</Label>
            <Input
              type="number"
              value={overlaySettings.manual_offset?.y ?? 0}
              onChange={(e) => onSettingsChange({ ...overlaySettings, manual_offset: { x: overlaySettings.manual_offset?.x ?? 0, y: Number(e.target.value) } })}
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}

      {/* Background dim */}
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={overlaySettings.background_dim}
          onChange={(e) => onSettingsChange({ ...overlaySettings, background_dim: e.target.checked })}
          className="accent-blue-600"
        />
        Background dim
      </label>
      {overlaySettings.background_dim && (
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Dim opacity</Label>
          <Input
            type="number"
            value={overlaySettings.dim_opacity}
            onChange={(e) => onSettingsChange({ ...overlaySettings, dim_opacity: Number(e.target.value) })}
            className="h-7 text-xs"
            min={0} max={1} step={0.1}
          />
        </div>
      )}

      {/* Close on outside click */}
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={overlaySettings.close_on_outside_click}
          onChange={(e) => onSettingsChange({ ...overlaySettings, close_on_outside_click: e.target.checked })}
          className="accent-blue-600"
        />
        Close on outside click
      </label>

      {/* Auto-dismiss */}
      <div className="space-y-1">
        <Label className="text-[11px]">Auto-dismiss (ms)</Label>
        <Input
          type="number"
          value={overlaySettings.auto_dismiss_ms ?? ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : undefined;
            onSettingsChange({ ...overlaySettings, auto_dismiss_ms: val });
          }}
          className="h-7 text-xs"
          placeholder="Never"
          min={0} step={500}
        />
      </div>
    </div>
  );
}
