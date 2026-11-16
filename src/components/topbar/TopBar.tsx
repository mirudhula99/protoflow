import { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { useAppStore } from '@/hooks/useAppStore';
import { useExport } from '@/hooks/useExport';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const projectName = useProjectStore((s) => s.project.name);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const screenCount = useProjectStore((s) => s.project.screens.length);
  const connectionCount = useProjectStore((s) => s.project.connections.length);
  const clearCanvas = useProjectStore((s) => s.clearCanvas);
  const openPreview = useProjectStore((s) => s.openPreview);
  const { exportJson, exportZip, exportIndividualFiles, exportSingleFile } = useExport();

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Project auto-saves to IndexedDB — this is just visual confirmation
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleClear = () => {
    if (screenCount === 0) return;
    if (window.confirm(`Clear all ${screenCount} screens and ${connectionCount} connections? This cannot be undone.`)) {
      clearCanvas();
    }
  };

  return (
    <div className="h-12 border-b border-border flex items-center px-4 gap-3 bg-background flex-shrink-0">
      <button
        onClick={() => useAppStore.getState().goToListing()}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        title="Back to projects"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>
      <span className="font-semibold text-sm tracking-tight">ProtoFlow</span>
      <Separator orientation="vertical" className="h-6" />
      <Input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="h-7 w-48 text-sm border-none shadow-none focus-visible:ring-1"
      />

      <div className="flex items-center gap-2 ml-auto">
        <Badge variant="secondary" className="text-xs">
          {screenCount} screen{screenCount !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
        </Badge>

        <Separator orientation="vertical" className="h-6" />

        {/* Clear Canvas */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-7 text-xs text-destructive hover:text-destructive"
          disabled={screenCount === 0}
        >
          Clear
        </Button>

        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="h-7 text-xs"
        >
          {saved ? 'Saved!' : 'Save'}
        </Button>

        {/* Preview */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => openPreview()}
          className="h-7 text-xs"
          disabled={screenCount === 0}
        >
          Preview
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-7 px-3 text-xs font-medium shadow-xs hover:bg-primary/90 cursor-pointer">
            Export <ChevronIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportSingleFile}>
              <div>
                <p className="text-sm font-medium">Full Prototype (Single HTML)</p>
                <p className="text-xs text-muted-foreground">All screens in one file with built-in navigation</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportZip}>
              <div>
                <p className="text-sm font-medium">Linked HTML (ZIP)</p>
                <p className="text-xs text-muted-foreground">Individual files with injected navigation + flow.json</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportIndividualFiles}>
              <div>
                <p className="text-sm font-medium">Individual Files (Separate Downloads)</p>
                <p className="text-xs text-muted-foreground">Each linked HTML file downloaded separately</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportJson}>
              <div>
                <p className="text-sm font-medium">Flow JSON</p>
                <p className="text-xs text-muted-foreground">Canvas structure only (no HTML content)</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
