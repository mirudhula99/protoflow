import { useMemo } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { validateEnhancementProject } from '@/lib/validation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ENHANCEMENT_MODULES, getModuleLabel } from '@/lib/constants';
import type { Enhancement, EnhancementScreen } from '@/types/project';

// ---- Screen Inspector ----

function ScreenInspector({ enhScreen }: { enhScreen: EnhancementScreen }) {
  const updateEnhancementScreen = useProjectStore((s) => s.updateEnhancementScreen);
  const removeEnhancementScreen = useProjectStore((s) => s.removeEnhancementScreen);
  const screens = useProjectStore((s) => s.project.screens);
  const enhancements = useProjectStore((s) => s.project.enhancements ?? []);

  const screen = screens.find((s) => s.id === enhScreen.screenId);
  const linkedEnhs = enhancements.filter((e) => e.linkedScreenIds.includes(enhScreen.id));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Screen Properties</h3>
        {screen?.thumbnailDataUrl && (
          <img
            src={screen.thumbnailDataUrl}
            alt={enhScreen.name}
            className="w-full h-32 rounded border border-border object-cover mb-3"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={enhScreen.name}
          onChange={(e) => updateEnhancementScreen(enhScreen.id, { name: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Div ID</Label>
        <Input
          value={enhScreen.divId}
          onChange={(e) => updateEnhancementScreen(enhScreen.id, { divId: e.target.value })}
          className="h-8 text-sm font-mono"
          placeholder="e.g. dashboard-overview"
        />
        <p className="text-[10px] text-muted-foreground">Used as container ID in exported HTML</p>
      </div>

      <div className="space-y-2">
        <Label>Order</Label>
        <Input
          type="number"
          min={1}
          value={enhScreen.order}
          onChange={(e) => updateEnhancementScreen(enhScreen.id, { order: parseInt(e.target.value) || 1 })}
          className="h-8 text-sm w-20"
        />
      </div>

      <div className="space-y-2">
        <Label>Module</Label>
        <select
          value={enhScreen.module ?? 'dashboard'}
          onChange={(e) => updateEnhancementScreen(enhScreen.id, { module: e.target.value })}
          className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {ENHANCEMENT_MODULES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <p className="text-[10px] text-muted-foreground">
          Sidebar highlights "{getModuleLabel(enhScreen.module ?? 'dashboard')}" in export
        </p>
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-muted-foreground">
          Enhanced Elements ({enhScreen.enhancedSelectors.length})
        </Label>
        {enhScreen.enhancedSelectors.length > 0 ? (
          <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
            {enhScreen.enhancedSelectors.map((sel, i) => (
              <div key={i} className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded truncate" title={sel}>
                {sel}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            No data-enhanced markers detected
          </p>
        )}
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-muted-foreground">
          Linked Enhancements ({linkedEnhs.length})
        </Label>
        <div className="mt-1 space-y-1">
          {linkedEnhs.map((enh) => (
            <div key={enh.id} className="text-xs flex items-center gap-1">
              <Badge variant="secondary" className="text-[9px] h-4 px-1">{enh.id}</Badge>
              <span className="truncate">{enh.ref ? `${enh.ref} — ` : ''}{enh.title}</span>
            </div>
          ))}
          {linkedEnhs.length === 0 && (
            <p className="text-xs text-muted-foreground">None</p>
          )}
        </div>
      </div>

      <Separator />

      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => {
          if (window.confirm(`Remove "${enhScreen.name}"?`)) {
            removeEnhancementScreen(enhScreen.id);
          }
        }}
      >
        Remove Screen
      </Button>
    </div>
  );
}

// ---- Enhancement Inspector ----

function EnhancementForm({ enhancement }: { enhancement: Enhancement }) {
  const updateEnhancement = useProjectStore((s) => s.updateEnhancement);
  const removeEnhancement = useProjectStore((s) => s.removeEnhancement);
  const linkScreen = useProjectStore((s) => s.linkScreenToEnhancement);
  const unlinkScreen = useProjectStore((s) => s.unlinkScreenFromEnhancement);
  const enhancementScreens = useProjectStore((s) => s.project.enhancementScreens ?? []);

  const linkedScreens = enhancementScreens.filter((es) =>
    enhancement.linkedScreenIds.includes(es.id)
  );
  const unlinkedScreens = enhancementScreens.filter(
    (es) => !enhancement.linkedScreenIds.includes(es.id)
  );

  const update = (updates: Partial<Enhancement>) => {
    updateEnhancement(enhancement.id, updates);
  };

  const addChange = () => {
    update({ changes: [...enhancement.changes, { label: '', text: '' }] });
  };

  const updateChange = (idx: number, field: 'label' | 'text', value: string) => {
    const changes = [...enhancement.changes];
    changes[idx] = { ...changes[idx], [field]: value };
    update({ changes });
  };

  const removeChange = (idx: number) => {
    update({ changes: enhancement.changes.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">Enhancement #{enhancement.id}</h3>
      </div>

      <div className="space-y-2">
        <Label>CR Ref</Label>
        <Input
          value={enhancement.ref}
          onChange={(e) => update({ ref: e.target.value })}
          className="h-8 text-sm font-mono"
          placeholder="CR-1024"
        />
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={enhancement.title}
          onChange={(e) => update({ title: e.target.value })}
          className="h-8 text-sm"
          placeholder="Short title for toolbar"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <textarea
          value={enhancement.desc}
          onChange={(e) => update({ desc: e.target.value })}
          className="w-full h-20 text-sm rounded-md border border-input bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="The system should..."
        />
      </div>

      <div className="space-y-2">
        <Label>Purpose</Label>
        <textarea
          value={enhancement.purpose}
          onChange={(e) => update({ purpose: e.target.value })}
          className="w-full h-16 text-sm rounded-md border border-input bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Allows users to..."
        />
      </div>

      <div className="space-y-2">
        <Label>Problem</Label>
        <textarea
          value={enhancement.problem}
          onChange={(e) => update({ problem: e.target.value })}
          className="w-full h-16 text-sm rounded-md border border-input bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Current system does not..."
        />
      </div>

      <div className="space-y-2">
        <Label>Client</Label>
        <Input
          value={enhancement.client}
          onChange={(e) => update({ client: e.target.value })}
          className="h-8 text-sm"
          placeholder="Client name or Multiple"
        />
      </div>

      <div className="space-y-2">
        <Label>Section</Label>
        <Input
          value={enhancement.section ?? ''}
          onChange={(e) => update({ section: e.target.value || null })}
          className="h-8 text-sm"
          placeholder="Optional section name"
        />
      </div>

      <Separator />

      {/* Changes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Changes ({enhancement.changes.length})</Label>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={addChange}>
            + Add
          </Button>
        </div>
        <div className="space-y-2">
          {enhancement.changes.map((change, idx) => (
            <div key={idx} className="flex gap-1 items-start">
              <div className="flex-1 space-y-1">
                <Input
                  value={change.label}
                  onChange={(e) => updateChange(idx, 'label', e.target.value)}
                  className="h-7 text-xs"
                  placeholder="Label"
                />
                <Input
                  value={change.text}
                  onChange={(e) => updateChange(idx, 'text', e.target.value)}
                  className="h-7 text-xs"
                  placeholder="Change description"
                />
              </div>
              <button
                onClick={() => removeChange(idx)}
                className="mt-1 w-5 h-5 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Config setting */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Config Setting</Label>
          {!enhancement.config ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => update({ config: { path: '', setting: '' } })}
            >
              + Add
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-destructive"
              onClick={() => update({ config: null })}
            >
              Remove
            </Button>
          )}
        </div>
        {enhancement.config && (
          <div className="space-y-2">
            <Input
              value={enhancement.config.path}
              onChange={(e) => update({ config: { ...enhancement.config!, path: e.target.value } })}
              className="h-7 text-xs"
              placeholder="Home > Settings > Module"
            />
            <Input
              value={enhancement.config.setting}
              onChange={(e) => update({ config: { ...enhancement.config!, setting: e.target.value } })}
              className="h-7 text-xs"
              placeholder="Enable Feature Name"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Linked screens */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Linked Screens ({linkedScreens.length})
        </Label>
        <div className="space-y-1">
          {linkedScreens.map((es) => (
            <div key={es.id} className="flex items-center justify-between text-xs bg-accent/50 rounded px-2 py-1">
              <span className="truncate">{es.name}</span>
              <button
                onClick={() => unlinkScreen(es.id, enhancement.id)}
                className="text-muted-foreground hover:text-destructive ml-1"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        {unlinkedScreens.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] text-muted-foreground mb-1">Add screen:</p>
            <div className="space-y-1">
              {unlinkedScreens.map((es) => (
                <button
                  key={es.id}
                  onClick={() => linkScreen(es.id, enhancement.id)}
                  className="w-full text-left text-xs px-2 py-1 rounded hover:bg-accent transition-colors truncate"
                >
                  + {es.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => {
          if (window.confirm(`Delete enhancement #${enhancement.id}?`)) {
            removeEnhancement(enhancement.id);
          }
        }}
      >
        Delete Enhancement
      </Button>
    </div>
  );
}

// ---- Project Settings ----

function ProjectSettings() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Project Settings</h3>
      <p className="text-xs text-muted-foreground">
        Module is configured per screen — select a screen and set its module in the Properties tab. The sidebar active item and page title are derived automatically from the module.
      </p>
    </div>
  );
}

// ---- Main Inspector ----

export function EnhancementInspector() {
  const selectedEnhScreenId = useProjectStore((s) => s.ui.selectedEnhancementScreenId);
  const selectedEnhId = useProjectStore((s) => s.ui.selectedEnhancementId);
  const enhancementScreens = useProjectStore((s) => s.project.enhancementScreens ?? []);
  const enhancements = useProjectStore((s) => s.project.enhancements ?? []);

  const selectedScreen = selectedEnhScreenId
    ? enhancementScreens.find((es) => es.id === selectedEnhScreenId) ?? null
    : null;

  const selectedEnhancement = selectedEnhId
    ? enhancements.find((e) => e.id === selectedEnhId) ?? null
    : null;

  const warnings = useMemo(
    () => validateEnhancementProject(enhancementScreens, enhancements),
    [enhancementScreens, enhancements]
  );

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="properties" className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b flex-shrink-0">
          <TabsTrigger value="properties" className="flex-1 text-xs">
            Properties
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 text-xs">
            Settings
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex-1 text-xs">
            Checks {warnings.length > 0 && `(${warnings.length})`}
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="properties" className="p-3 mt-0">
            {selectedScreen && <ScreenInspector enhScreen={selectedScreen} />}
            {selectedEnhancement && <EnhancementForm enhancement={selectedEnhancement} />}
            {!selectedScreen && !selectedEnhancement && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Select a screen or enhancement to view properties
              </p>
            )}
          </TabsContent>
          <TabsContent value="settings" className="p-3 mt-0">
            <ProjectSettings />
          </TabsContent>
          <TabsContent value="validation" className="p-3 mt-0">
            {warnings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No issues found
              </p>
            ) : (
              <div className="space-y-2">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 flex-shrink-0 mt-0.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span className="text-xs text-amber-800 dark:text-amber-200">{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
