import { useProjectStore, useSelectedScreen } from '@/hooks/useProjectStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function NodeInspector() {
  const screen = useSelectedScreen();
  const updateScreen = useProjectStore((s) => s.updateScreen);
  const removeScreen = useProjectStore((s) => s.removeScreen);
  const connections = useProjectStore((s) => s.project.connections);
  const screens = useProjectStore((s) => s.project.screens);
  const openPreview = useProjectStore((s) => s.openPreview);

  if (!screen) return null;

  const outgoing = connections.filter((c) => c.sourceScreenId === screen.id);
  const incoming = connections.filter((c) => c.targetScreenId === screen.id);
  const getScreenName = (id: string) => screens.find((s) => s.id === id)?.name ?? 'Unknown';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Screen Properties</h3>
        {screen.thumbnailDataUrl && (
          <img
            src={screen.thumbnailDataUrl}
            alt={screen.name}
            className="w-full h-32 rounded border border-border object-cover mb-3"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={screen.name}
          onChange={(e) => updateScreen(screen.id, { name: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>File</Label>
        <p className="text-sm text-muted-foreground">{screen.fileName}</p>
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-muted-foreground">Outgoing ({outgoing.length})</Label>
        <div className="space-y-1 mt-1">
          {outgoing.map((c) => (
            <div key={c.id} className="text-xs flex items-center gap-1">
              <span>→ {getScreenName(c.targetScreenId)}</span>
              <span className="text-muted-foreground">({c.trigger.selector})</span>
            </div>
          ))}
          {outgoing.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Incoming ({incoming.length})</Label>
        <div className="space-y-1 mt-1">
          {incoming.map((c) => (
            <div key={c.id} className="text-xs flex items-center gap-1">
              <span>← {getScreenName(c.sourceScreenId)}</span>
              <span className="text-muted-foreground">({c.trigger.selector})</span>
            </div>
          ))}
          {incoming.length === 0 && <p className="text-xs text-muted-foreground">None</p>}
        </div>
      </div>

      <Separator />

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => openPreview(screen.id)}
      >
        Preview from this screen
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => useProjectStore.getState().duplicateScreen(screen.id)}
      >
        Duplicate
      </Button>

      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => removeScreen(screen.id)}
      >
        Delete Screen
      </Button>
    </div>
  );
}
