import { useProjectStore, useSelectedConnection } from '@/hooks/useProjectStore';
import { TriggerSelect } from '@/components/shared/TriggerSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ANIMATION_TYPES, EASING_TYPES, DIRECTIONAL_ANIMATIONS, ACTION_TYPES, DEFAULT_OVERLAY_SETTINGS, OVERLAY_POSITIONS, BUILT_IN_TEMPLATES } from '@/lib/constants';
import type { TriggerType, AnimationType, AnimationDirection, EasingType, ActionType } from '@/types/project';

export function EdgeInspector() {
  const connection = useSelectedConnection();
  const updateConnection = useProjectStore((s) => s.updateConnection);
  const removeConnection = useProjectStore((s) => s.removeConnection);
  const screens = useProjectStore((s) => s.project.screens);

  if (!connection) return null;

  const source = screens.find((s) => s.id === connection.sourceScreenId);
  const target = screens.find((s) => s.id === connection.targetScreenId);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Connection</h3>
        <div className="text-sm flex items-center gap-1 text-muted-foreground">
          <span className="font-medium text-foreground">{source?.name ?? '?'}</span>
          <span>→</span>
          <span className="font-medium text-foreground">{target?.name ?? '?'}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">TRIGGER</Label>
        <TriggerSelect
          value={connection.trigger.type}
          onValueChange={(v: TriggerType) =>
            updateConnection(connection.id, {
              trigger: { ...connection.trigger, type: v },
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>CSS Selector</Label>
        <Input
          value={connection.trigger.selector}
          onChange={(e) =>
            updateConnection(connection.id, {
              trigger: { ...connection.trigger, selector: e.target.value },
            })
          }
          className="h-8 text-sm font-mono"
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">ACTION TYPE</Label>
        <Select
          value={connection.actionType ?? 'navigate_to'}
          onValueChange={(v) =>
            updateConnection(connection.id, {
              actionType: v as ActionType,
              ...(v === 'open_overlay' && !connection.overlaySettings
                ? { overlaySettings: { ...DEFAULT_OVERLAY_SETTINGS } }
                : {}),
            })
          }
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {connection.actionType === 'open_overlay' && connection.overlaySettings && (
        <>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">OVERLAY</Label>
            <div className="text-xs space-y-1 p-2 rounded bg-purple-50 border border-purple-200">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">
                  {connection.overlaySource?.type === 'template'
                    ? BUILT_IN_TEMPLATES.find((t) => t.value === connection.overlaySource?.templateConfig?.templateId)?.label ?? 'Template'
                    : screens.find((s) => s.id === connection.overlaySource?.screenId)?.name ?? 'Screen'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position</span>
                <span className="font-medium">
                  {OVERLAY_POSITIONS.find((p) => p.value === connection.overlaySettings?.position)?.label ?? 'Center'}
                </span>
              </div>
              {connection.overlaySettings.auto_dismiss_ms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-dismiss</span>
                  <span className="font-medium">{connection.overlaySettings.auto_dismiss_ms}ms</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">ANIMATION</Label>
        <Select
          value={connection.animation.type}
          onValueChange={(v) =>
            updateConnection(connection.id, {
              animation: { ...connection.animation, type: v as AnimationType },
            })
          }
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_TYPES.map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {DIRECTIONAL_ANIMATIONS.includes(connection.animation.type) && (
          <div className="grid grid-cols-4 gap-1">
            {(['left', 'right', 'top', 'bottom'] as AnimationDirection[]).map((dir) => (
              <Button
                key={dir}
                variant={connection.animation.direction === dir ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-[11px] capitalize"
                onClick={() =>
                  updateConnection(connection.id, {
                    animation: { ...connection.animation, direction: dir },
                  })
                }
              >
                {dir}
              </Button>
            ))}
          </div>
        )}

        {connection.animation.type !== 'instant' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Duration (ms)</Label>
              <Input
                type="number"
                value={connection.animation.duration_ms}
                onChange={(e) =>
                  updateConnection(connection.id, {
                    animation: { ...connection.animation, duration_ms: Number(e.target.value) },
                  })
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Easing</Label>
              <Select
                value={connection.animation.easing}
                onValueChange={(v) =>
                  updateConnection(connection.id, {
                    animation: { ...connection.animation, easing: v as EasingType },
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EASING_TYPES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Alert Code</Label>
        <Input
          value={connection.alertCode ?? ''}
          onChange={(e) =>
            updateConnection(connection.id, { alertCode: e.target.value || undefined })
          }
          className="h-8 text-sm"
          placeholder="Optional"
        />
      </div>

      <div className="space-y-2">
        <Label>Label</Label>
        <Input
          value={connection.label ?? ''}
          onChange={(e) =>
            updateConnection(connection.id, { label: e.target.value || undefined })
          }
          className="h-8 text-sm"
          placeholder="Optional"
        />
      </div>

      <Separator />

      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => removeConnection(connection.id)}
      >
        Delete Connection
      </Button>
    </div>
  );
}
