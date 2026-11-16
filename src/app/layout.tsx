import { ReactFlowProvider } from '@xyflow/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useProjectStore } from '@/hooks/useProjectStore';
import { TopBar } from '@/components/topbar/TopBar';
import { AssetPanel } from '@/components/sidebar/AssetPanel';
import { FlowCanvas } from '@/components/canvas/FlowCanvas';
import { InspectorPanel } from '@/components/inspector/InspectorPanel';
import { PreviewPlayer } from '@/components/shared/PreviewPlayer';
import { EnhancementTopBar } from '@/components/topbar/EnhancementTopBar';
import { EnhancementSidebar } from '@/components/sidebar/EnhancementSidebar';
import { EnhancementCanvas } from '@/components/canvas/EnhancementCanvas';
import { EnhancementInspector } from '@/components/inspector/EnhancementInspector';
import { EnhancementPreviewPlayer } from '@/components/shared/EnhancementPreviewPlayer';

export function AppLayout() {
  const isEnhancement = useProjectStore((s) => s.project.mode === 'enhancement');

  return (
    <TooltipProvider>
      <ReactFlowProvider>
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
          {isEnhancement ? <EnhancementTopBar /> : <TopBar />}
          <div className="flex flex-1 overflow-hidden">
            <div className="w-[280px] border-r border-border flex-shrink-0 overflow-hidden flex flex-col">
              {isEnhancement ? <EnhancementSidebar /> : <AssetPanel />}
            </div>
            <div className="flex-1 overflow-hidden">
              {isEnhancement ? <EnhancementCanvas /> : <FlowCanvas />}
            </div>
            <div className="w-[320px] border-l border-border flex-shrink-0 overflow-hidden">
              {isEnhancement ? <EnhancementInspector /> : <InspectorPanel />}
            </div>
          </div>
        </div>
        {isEnhancement ? <EnhancementPreviewPlayer /> : <PreviewPlayer />}
      </ReactFlowProvider>
    </TooltipProvider>
  );
}
