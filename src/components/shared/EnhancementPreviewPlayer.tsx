import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { useEnhancementExport } from '@/hooks/useEnhancementExport';
import { Button } from '@/components/ui/button';
import { log } from '@/lib/log';

/**
 * Extracts just the filename from a path.
 * "../section/section-listing.html?toast=approved" → "section-listing.html"
 */
function extractFilename(href: string): string {
  const clean = href.split('?')[0].split('#')[0];
  const parts = clean.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || '';
}

/**
 * Build the nav-interceptor script that gets injected into preview iframes.
 * Takes a JSON map of filename→screenId so it can resolve links.
 *
 * Strategy: rewrite every `window.location.href = '...'` and
 * `window.location = '...'` to a postMessage call at the STRING level,
 * then inject a click listener for <a> tags as a second layer.
 */
function buildInterceptedHtml(html: string): string {
  // ── Layer 1: rewrite location assignments in the HTML string ──
  // Catches onclick="window.location.href='...'" AND assignments inside <script> functions
  let result = html.replace(
    /window\.location(?:\.href)?\s*=\s*(['"])([\s\S]*?)\1/g,
    (_m, _q, href) => {
      const safeHref = href.replace(/'/g, "\\'");
      return `window.parent.postMessage({type:'protoflow-nav',href:'${safeHref}'},'*')`;
    }
  );

  // ── Layer 2: inject a click listener for <a href="file.html"> tags ──
  // Only intercepts links pointing to .html/.htm files — leaves javascript:, #, and
  // other in-page links completely untouched so existing onclick handlers work.
  const listenerScript = `
<script data-protoflow-nav>
(function(){
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if(!a) return;
    var h = a.getAttribute('href');
    if(!h) return;
    // Only intercept links to .html/.htm files
    var clean = h.split('?')[0].split('#')[0].toLowerCase();
    if(clean.match(/\.html?$/)) {
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({type:'protoflow-nav', href:h},'*');
    }
  }, true);
})();
</script>`;

  // Inject before </body> to avoid interfering with page scripts
  const bodyCloseIdx = result.lastIndexOf('</body>');
  if (bodyCloseIdx !== -1) {
    return result.slice(0, bodyCloseIdx) + listenerScript + result.slice(bodyCloseIdx);
  }
  // Fallback: append at end
  return result + listenerScript;
}

export function EnhancementPreviewPlayer() {
  const isFullPreviewOpen = useProjectStore((s) => s.ui.enhancementPreviewOpen);
  const screenPreviewId = useProjectStore((s) => s.ui.screenPreviewScreenId);
  const closePreview = useProjectStore((s) => s.closeEnhancementPreview);
  const closeScreenPreview = useProjectStore((s) => s.closeScreenPreview);
  const openScreenPreview = useProjectStore((s) => s.openScreenPreview);
  const screens = useProjectStore((s) => s.project.screens);
  const enhancementScreens = useProjectStore((s) => s.project.enhancementScreens ?? []);
  const { getPreviewBlobUrl } = useEnhancementExport();

  const isOpen = isFullPreviewOpen || !!screenPreviewId;

  // filename → Screen.id lookup
  const filenameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of screens) {
      map[s.fileName.toLowerCase()] = s.id;
      // Also map by title-derived name
      const derived = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.html';
      if (!map[derived]) map[derived] = s.id;
    }
    return map;
  }, [screens]);

  const previewScreen = useMemo(
    () => (screenPreviewId ? screens.find((s) => s.id === screenPreviewId) ?? null : null),
    [screenPreviewId, screens]
  );

  const previewScreenName = useMemo(() => {
    if (!screenPreviewId) return null;
    const es = enhancementScreens.find((e) => e.screenId === screenPreviewId);
    return es?.name ?? previewScreen?.name ?? 'Screen';
  }, [screenPreviewId, enhancementScreens, previewScreen]);

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Handle navigation postMessages from the iframe
  const handleMessage = useCallback(
    (e: MessageEvent) => {
      // Only accept messages from our own preview iframe (sandboxed → opaque
      // origin, so validate by window identity rather than origin string).
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.type !== 'protoflow-nav') return;
      const href: string = e.data.href;
      if (!href) return;

      const filename = extractFilename(href).toLowerCase();
      if (!filename) return;

      const targetId = filenameMap[filename];
      if (targetId) {
        // Don't revoke here — let the useEffect handle cleanup after the new blob is ready
        openScreenPreview(targetId);
      }
    },
    [filenameMap, openScreenPreview]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, handleMessage]);

  // Build blob URL — revoke the previous blob AFTER the new one is set to avoid race conditions
  useEffect(() => {
    const oldUrl = prevUrlRef.current;

    if (!isOpen) {
      setBlobUrl(null);
      prevUrlRef.current = null;
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      return;
    }

    let url: string;
    try {
      if (isFullPreviewOpen) {
        url = getPreviewBlobUrl();
      } else if (previewScreen) {
        const html = buildInterceptedHtml(previewScreen.htmlContent);
        url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      } else {
        return;
      }
    } catch (err) {
      log.warn('preview_blob_failed', { error: err });
      return;
    }

    // Set new URL first, then revoke old one so the iframe never has a gap
    setBlobUrl(url);
    prevUrlRef.current = url;
    if (oldUrl && oldUrl !== url) URL.revokeObjectURL(oldUrl);
  }, [isOpen, isFullPreviewOpen, previewScreen, getPreviewBlobUrl]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  if (!isOpen || !blobUrl) return null;

  const handleClose = () => {
    if (isFullPreviewOpen) closePreview();
    if (screenPreviewId) closeScreenPreview();
  };

  const label = isFullPreviewOpen
    ? 'Enhancement Preview'
    : `Screen Preview — ${previewScreenName}`;

  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col">
      <div className="h-10 bg-zinc-900 flex items-center justify-between px-4 flex-shrink-0">
        <span className="text-xs text-zinc-400">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-7 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
          Close
        </Button>
      </div>

      <iframe
        ref={iframeRef}
        src={blobUrl}
        sandbox="allow-scripts"
        className="flex-1 w-full border-none bg-white"
        title={label}
      />
    </div>
  );
}
