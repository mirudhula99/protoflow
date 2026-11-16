import { useProjectStore } from '@/hooks/useProjectStore';
import { useAppStore } from '@/hooks/useAppStore';
import { useEnhancementExport } from '@/hooks/useEnhancementExport';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function EnhancementTopBar() {
  const projectName = useProjectStore((s) => s.project.name);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const screenCount = useProjectStore((s) => s.project.enhancementScreens?.length ?? 0);
  const enhCount = useProjectStore((s) => s.project.enhancements?.length ?? 0);
  const moduleName = useProjectStore((s) => s.project.enhancementMeta?.module ?? 'dashboard');
  const openPreview = useProjectStore((s) => s.openEnhancementPreview);
  const { exportHtml } = useEnhancementExport();

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
      <Badge variant="outline" className="text-[10px] h-5 uppercase tracking-wider font-semibold text-indigo-600 border-indigo-300 bg-indigo-50">
        ENH
      </Badge>
      <Separator orientation="vertical" className="h-6" />
      <Input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="h-7 w-48 text-sm border-none shadow-none focus-visible:ring-1"
      />

      <div className="flex items-center gap-2 ml-auto">
        <Badge variant="secondary" className="text-xs capitalize">
          {moduleName}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {screenCount} screen{screenCount !== 1 ? 's' : ''}
        </Badge>
        {enhCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {enhCount} CR{enhCount !== 1 ? 's' : ''}
          </Badge>
        )}

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="outline"
          size="sm"
          onClick={openPreview}
          className="h-7 text-xs"
          disabled={screenCount === 0}
        >
          Preview
        </Button>

        <Button
          size="sm"
          onClick={exportHtml}
          className="h-7 text-xs"
          disabled={screenCount === 0}
        >
          Export HTML
        </Button>
      </div>
    </div>
  );
}
