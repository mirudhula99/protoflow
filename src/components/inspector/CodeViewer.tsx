import { useProjectStore } from '@/hooks/useProjectStore';
import type { Screen } from '@/types/project';

interface CodeViewerProps {
  screen: Screen;
}

export function CodeViewer({ screen }: CodeViewerProps) {
  const closeCodeView = useProjectStore((s) => s.closeCodeView);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{screen.name}</p>
          <p className="text-xs text-muted-foreground truncate">{screen.fileName}</p>
        </div>
        <button
          onClick={closeCodeView}
          className="flex-shrink-0 ml-2 w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <pre
          className="p-3 text-xs leading-relaxed whitespace-pre-wrap break-words font-mono"
          style={{ backgroundColor: '#1e1e2e', color: '#cdd6f4', minHeight: '100%' }}
        >
          {screen.htmlContent}
        </pre>
      </div>
    </div>
  );
}
