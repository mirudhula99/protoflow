import { useMemo } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { validateGraph } from '@/lib/validation';
import { Badge } from '@/components/ui/badge';

export function ValidationPanel() {
  const screens = useProjectStore((s) => s.project.screens);
  const connections = useProjectStore((s) => s.project.connections);

  const warnings = useMemo(() => validateGraph(screens, connections), [screens, connections]);

  if (warnings.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No validation issues found</p>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    orphan: 'bg-yellow-100 text-yellow-800',
    'missing-selector': 'bg-red-100 text-red-800',
    'duplicate-selector': 'bg-orange-100 text-orange-800',
    unreachable: 'bg-blue-100 text-blue-800',
    'self-loop': 'bg-purple-100 text-purple-800',
    'dead-end': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground">
        {warnings.length} issue{warnings.length !== 1 ? 's' : ''}
      </h4>
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <Badge variant="outline" className={`text-[10px] px-1 py-0 flex-shrink-0 ${typeColors[w.type] ?? ''}`}>
            {w.type}
          </Badge>
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
