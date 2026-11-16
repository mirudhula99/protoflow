import { useState, useCallback, useRef } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { useEnhancementUpload } from '@/hooks/useEnhancementUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { GuidelinesDialog } from '@/components/shared/GuidelinesDialog';

export function EnhancementSidebar() {
  const enhancementScreens = useProjectStore((s) => s.project.enhancementScreens ?? []);
  const enhancements = useProjectStore((s) => s.project.enhancements ?? []);
  const screens = useProjectStore((s) => s.project.screens);
  const selectedEnhScreenId = useProjectStore((s) => s.ui.selectedEnhancementScreenId);
  const selectedEnhId = useProjectStore((s) => s.ui.selectedEnhancementId);
  const selectEnhancementScreen = useProjectStore((s) => s.selectEnhancementScreen);
  const selectEnhancement = useProjectStore((s) => s.selectEnhancement);
  const addEnhancement = useProjectStore((s) => s.addEnhancement);
  const removeEnhancementScreen = useProjectStore((s) => s.removeEnhancementScreen);

  const { uploadEnhancementFiles } = useEnhancementUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filter, setFilter] = useState('');

  const sortedScreens = [...enhancementScreens].sort((a, b) => a.order - b.order);

  const filteredScreens = filter
    ? sortedScreens.filter((es) =>
        es.name.toLowerCase().includes(filter.toLowerCase()) ||
        es.divId.toLowerCase().includes(filter.toLowerCase())
      )
    : sortedScreens;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        uploadEnhancementFiles(e.dataTransfer.files);
      }
    },
    [uploadEnhancementFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadEnhancementFiles(e.target.files);
        e.target.value = '';
      }
    },
    [uploadEnhancementFiles]
  );

  const handleAddEnhancement = () => {
    addEnhancement({
      ref: '',
      title: 'New Enhancement',
      desc: '',
      purpose: '',
      problem: '',
      client: '',
      linkedScreenIds: [],
      section: null,
      changes: [],
      config: null,
    });
  };

  const getScreenThumbnail = (screenId: string) => {
    return screens.find((s) => s.id === screenId)?.thumbnailDataUrl;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload zone */}
      <div className="p-3">
        <h2 className="text-sm font-semibold mb-2">Enhancement Screens</h2>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".html,.htm"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground mb-1">
            Drop HTML files with data-enhanced markers
          </p>
          <Button variant="outline" size="sm" type="button">
            Browse Files
          </Button>
        </div>
        <div className="mt-2 flex justify-center">
          <GuidelinesDialog />
        </div>
      </div>

      <Separator />

      {/* Screen filter */}
      <div className="px-3 pt-2">
        <Input
          placeholder="Search screens..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* Screen list */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden px-3 py-2">
        <div className="space-y-1">
          {filteredScreens.map((es) => {
            const thumb = getScreenThumbnail(es.screenId);
            const isSelected = selectedEnhScreenId === es.id;
            return (
              <div
                key={es.id}
                className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-accent ${
                  isSelected ? 'bg-accent' : ''
                }`}
                onClick={() => selectEnhancementScreen(es.id)}
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={es.name}
                    className="w-12 h-8 rounded border border-border object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-8 rounded border border-border bg-muted flex-shrink-0 flex items-center justify-center">
                    <span className="text-[8px] text-muted-foreground">HTML</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{es.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">#{es.order}</span>
                    {es.enhancedSelectors.length > 0 && (
                      <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                        {es.enhancedSelectors.length} glow{es.enhancedSelectors.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Remove "${es.name}"?`)) {
                      removeEnhancementScreen(es.id);
                    }
                  }}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove screen"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}

          {enhancementScreens.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Upload HTML files to get started
            </p>
          )}
        </div>

        {/* Enhancements section */}
        <Separator className="my-3" />

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Enhancements</h3>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleAddEnhancement}>
            + Add
          </Button>
        </div>

        <div className="space-y-1">
          {enhancements.map((enh) => {
            const isSelected = selectedEnhId === enh.id;
            return (
              <div
                key={enh.id}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors hover:bg-accent ${
                  isSelected ? 'bg-accent' : ''
                }`}
                onClick={() => selectEnhancement(enh.id)}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {enh.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {enh.ref ? `${enh.ref} — ` : ''}{enh.title || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {enh.client && (
                      <span className="text-[10px] text-muted-foreground truncate">{enh.client}</span>
                    )}
                    <Badge variant="outline" className="text-[9px] h-3.5 px-1">
                      {enh.linkedScreenIds.length} screen{enh.linkedScreenIds.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}

          {enhancements.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              Add enhancements to link change-request metadata (optional)
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
