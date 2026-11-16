import { useMemo } from 'react';
import { renderTemplate } from '@/lib/templates';
import type { TemplateConfig } from '@/types/project';

interface TemplatePreviewProps {
  config: TemplateConfig;
}

export function TemplatePreview({ config }: TemplatePreviewProps) {
  const html = useMemo(() => {
    const rendered = renderTemplate(config);
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f0f0f0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
</style></head>
<body>${rendered}</body></html>`;
  }, [config]);

  const blobUrl = useMemo(() => {
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [html]);

  return (
    <div className="border border-border rounded-md overflow-hidden bg-muted/30">
      <div className="px-2 py-1 border-b border-border bg-muted/50">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Preview</span>
      </div>
      <iframe
        src={blobUrl}
        title="Template Preview"
        sandbox="allow-scripts"
        className="w-full border-0"
        style={{ height: '180px' }}
      />
    </div>
  );
}
