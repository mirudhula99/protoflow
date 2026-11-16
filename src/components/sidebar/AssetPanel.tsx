import { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { UploadZone } from './UploadZone';
import { ScreenListItem } from './ScreenListItem';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function AssetPanel() {
  const screens = useProjectStore((s) => s.project.screens);
  const [filter, setFilter] = useState('');

  const filtered = filter
    ? screens.filter(
        (s) =>
          s.name.toLowerCase().includes(filter.toLowerCase()) ||
          s.fileName.toLowerCase().includes(filter.toLowerCase())
      )
    : screens;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <h2 className="text-sm font-semibold mb-2">Screens</h2>
        <UploadZone />
      </div>
      <Separator />
      <div className="px-3 pt-2">
        <Input
          placeholder="Search screens..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {filtered.map((screen) => (
            <ScreenListItem key={screen.id} screen={screen} />
          ))}
          {screens.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Upload HTML files to get started
            </p>
          )}
          {screens.length > 0 && filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No screens match your filter
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
