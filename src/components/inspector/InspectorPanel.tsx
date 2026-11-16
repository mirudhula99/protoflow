import { useProjectStore, useCodeViewScreen } from '@/hooks/useProjectStore';
import { NodeInspector } from './NodeInspector';
import { EdgeInspector } from './EdgeInspector';
import { ValidationPanel } from './ValidationPanel';
import { CodeViewer } from './CodeViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function InspectorPanel() {
  const selectedNodeId = useProjectStore((s) => s.ui.selectedNodeId);
  const selectedEdgeId = useProjectStore((s) => s.ui.selectedEdgeId);
  const codeViewScreen = useCodeViewScreen();

  if (codeViewScreen) {
    return (
      <div className="flex flex-col h-full">
        <CodeViewer screen={codeViewScreen} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="properties" className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b flex-shrink-0">
          <TabsTrigger value="properties" className="flex-1 text-xs">
            Properties
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex-1 text-xs">
            Validation
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="properties" className="p-3 mt-0">
            {selectedNodeId && <NodeInspector />}
            {selectedEdgeId && <EdgeInspector />}
            {!selectedNodeId && !selectedEdgeId && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Select a screen or connection to view properties
              </p>
            )}
          </TabsContent>
          <TabsContent value="validation" className="p-3 mt-0">
            <ValidationPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
