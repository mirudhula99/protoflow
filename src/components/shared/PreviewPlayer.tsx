import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OverlayPreviewLayer } from './OverlayPreviewLayer';
import type { Connection, AnimationConfig } from '@/types/project';

function buildAnimationKeyframes(anim: AnimationConfig): string {
  const dir = anim.direction || 'left';
  const translateMap: Record<string, string> = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)',
  };
  const translate = translateMap[dir];
  return `
    @keyframes pfFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pfFadeOut { from { opacity: 1; } to { opacity: 0; } }
    @keyframes pfSlideIn { from { transform: ${translate}; } to { transform: translate(0); } }
    @keyframes pfSlideOut { from { transform: translate(0); } to { transform: ${translate}; } }
  `;
}

export function PreviewPlayer() {
  const previewOpen = useProjectStore((s) => s.ui.previewOpen);
  const startScreenId = useProjectStore((s) => s.ui.previewStartScreenId);
  const screens = useProjectStore((s) => s.project.screens);
  const connections = useProjectStore((s) => s.project.connections);
  const closePreview = useProjectStore((s) => s.closePreview);

  const [currentScreenId, setCurrentScreenId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentScreen = useMemo(() => screens.find((s) => s.id === currentScreenId) ?? null, [screens, currentScreenId]);
  const outgoingConnections = useMemo(() => connections.filter((c) => c.sourceScreenId === currentScreenId), [connections, currentScreenId]);
  const navigateConnections = useMemo(() => outgoingConnections.filter((c) => (c.actionType ?? 'navigate_to') === 'navigate_to'), [outgoingConnections]);
  const overlayConnections = useMemo(() => outgoingConnections.filter((c) => c.actionType === 'open_overlay'), [outgoingConnections]);
  const messageHandlersRef = useRef<Set<(type: string, data: Record<string, unknown>) => void>>(new Set());

  const onOverlayMessage = useCallback((handler: (type: string, data: Record<string, unknown>) => void) => {
    messageHandlersRef.current.add(handler);
    return () => { messageHandlersRef.current.delete(handler); };
  }, []);

  useEffect(() => {
    if (previewOpen && startScreenId) {
      setCurrentScreenId(startScreenId);
      setHistory([]);
    }
  }, [previewOpen, startScreenId]);

  const navigateTo = useCallback((targetId: string, conn: Connection) => {
    if (transitioning) return;
    const target = screens.find((s) => s.id === targetId);
    if (!target) return;

    if (conn.alertCode) window.alert(conn.alertCode);

    if (conn.animation.type !== 'instant') {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentScreenId(targetId);
        setHistory((prev) => [...prev, currentScreenId!]);
        setTransitioning(false);
      }, conn.animation.duration_ms || 300);
    } else {
      setCurrentScreenId(targetId);
      setHistory((prev) => [...prev, currentScreenId!]);
    }
  }, [transitioning, screens, currentScreenId]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentScreenId(prev);
  }, [history]);

  // Handle messages from iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Only accept messages from our own preview iframe (frames are sandboxed
      // to an opaque origin, so validate by window identity, not origin string).
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'protoflow-navigate') {
        const targetFileName = event.data.target;
        const target = screens.find((s) => s.fileName === targetFileName);
        const conn = navigateConnections.find((c) => {
          const t = screens.find((s) => s.id === c.targetScreenId);
          return t?.fileName === targetFileName;
        });
        if (target && conn) navigateTo(target.id, conn);
        else if (target) {
          setCurrentScreenId(target.id);
          setHistory((prev) => [...prev, currentScreenId!]);
        }
      }
      if (event.data?.type === 'protoflow-open-overlay' || event.data?.type === 'protoflow-close-overlay') {
        for (const h of messageHandlersRef.current) {
          h(event.data.type, event.data);
        }
      }
      if (event.data?.type === 'protoflow-back') goBack();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [screens, navigateConnections, navigateTo, goBack, currentScreenId]);

  // Build blob URL when screen changes (fixes rendering of complex HTML with 100vh layouts)
  useEffect(() => {
    if (!currentScreen) { setBlobUrl(null); return; }

    const routes = navigateConnections.map((conn) => {
      const target = screens.find((s) => s.id === conn.targetScreenId);
      return {
        selector: conn.trigger.selector,
        targetFileName: target?.fileName ?? '',
        alertCode: conn.alertCode ?? null,
      };
    });

    const overlayRoutes = overlayConnections.map((conn) => ({
      selector: conn.trigger.selector,
      connectionId: conn.id,
    }));

    // Build a lookup of all screen filenames for resolving existing links
    const allFileNames = screens.map((s) => s.fileName);

    const navScript = `
<style>${buildAnimationKeyframes(outgoingConnections[0]?.animation ?? { type: 'instant', duration_ms: 300, easing: 'ease_out' })}</style>
<script>
(function() {
  var routes = ${JSON.stringify(routes)};
  var overlayRoutes = ${JSON.stringify(overlayRoutes)};
  var allFiles = ${JSON.stringify(allFileNames)};

  // Helper: extract filename from a path like "../section/section-listing.html"
  function getFileName(path) {
    if (!path || path === '#' || path.startsWith('http') || path.startsWith('javascript')) return null;
    var parts = path.split('/');
    return parts[parts.length - 1].split('?')[0].split('#')[0];
  }

  // 1. ProtoFlow-wired elements get highest priority (capture phase)
  routes.forEach(function(route) {
    var els = document.querySelectorAll(route.selector);
    els.forEach(function(el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.parent.postMessage({ type: 'protoflow-navigate', target: route.targetFileName, alert: route.alertCode }, '*');
      }, true);
    });
  });

  // 1b. Overlay-wired elements
  overlayRoutes.forEach(function(route) {
    var els = document.querySelectorAll(route.selector);
    els.forEach(function(el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.parent.postMessage({ type: 'protoflow-open-overlay', connectionId: route.connectionId }, '*');
      }, true);
    });
  });

  // 2. Intercept ALL <a href> clicks — route through ProtoFlow if the file exists
  document.addEventListener('click', function(e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (a && a.href) {
      var href = a.getAttribute('href');
      var fileName = getFileName(href);
      if (fileName && allFiles.indexOf(fileName) !== -1) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'protoflow-navigate', target: fileName }, '*');
      }
      // If file not in project, just prevent (can't navigate blob iframe to relative path)
      else if (href && href !== '#' && !href.startsWith('http') && !href.startsWith('javascript')) {
        e.preventDefault();
      }
    }
  }, false);

  // 3. Intercept onclick="window.location.href='...'" by patching location.href
  var origDesc = Object.getOwnPropertyDescriptor(window.location.__proto__, 'href');
  if (origDesc && origDesc.set) {
    try {
      Object.defineProperty(window.location, 'href', {
        set: function(val) {
          var fileName = getFileName(val);
          if (fileName && allFiles.indexOf(fileName) !== -1) {
            window.parent.postMessage({ type: 'protoflow-navigate', target: fileName }, '*');
          } else if (val && val.startsWith('http')) {
            origDesc.set.call(window.location, val);
          }
          // else: relative path not in project, ignore
        },
        get: origDesc.get ? origDesc.get.bind(window.location) : undefined,
        configurable: true
      });
    } catch(ex) { /* security restriction in some browsers */ }
  }

  // 4. Highlight ProtoFlow hotspots
  routes.forEach(function(route) {
    var els = document.querySelectorAll(route.selector);
    els.forEach(function(el) {
      el.style.outline = '2px dashed rgba(13,153,255,0.4)';
      el.style.outlineOffset = '2px';
      el.addEventListener('mouseenter', function() { el.style.outline = '2px solid #0d99ff'; });
      el.addEventListener('mouseleave', function() { el.style.outline = '2px dashed rgba(13,153,255,0.4)'; });
    });
  });

  // 4b. Highlight overlay hotspots (purple)
  overlayRoutes.forEach(function(route) {
    var els = document.querySelectorAll(route.selector);
    els.forEach(function(el) {
      el.style.outline = '2px dashed rgba(139,92,246,0.4)';
      el.style.outlineOffset = '2px';
      el.addEventListener('mouseenter', function() { el.style.outline = '2px solid #8b5cf6'; });
      el.addEventListener('mouseleave', function() { el.style.outline = '2px dashed rgba(139,92,246,0.4)'; });
    });
  });
})();
</script>`;

    let content = currentScreen.htmlContent;
    const bodyClose = content.lastIndexOf('</body>');
    if (bodyClose !== -1) {
      content = content.slice(0, bodyClose) + navScript + content.slice(bodyClose);
    } else {
      content += navScript;
    }

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [currentScreen, outgoingConnections, navigateConnections, overlayConnections, screens]);

  // Keyboard
  useEffect(() => {
    if (!previewOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
      if (e.key === 'Backspace' && e.target === document.body) { e.preventDefault(); goBack(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewOpen, closePreview, goBack]);

  if (!previewOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#1e1e2e] flex flex-col">
      <div className="h-10 flex items-center px-4 gap-3 bg-[#181825] border-b border-[#313244] flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-7 text-[#cdd6f4] hover:text-white hover:bg-[#313244]" onClick={closePreview}>
          <XIcon /> <span className="ml-1 text-xs">Close</span>
        </Button>
        <div className="w-px h-5 bg-[#313244]" />
        <Button variant="ghost" size="sm" className="h-7 text-[#cdd6f4] hover:text-white hover:bg-[#313244]" onClick={goBack} disabled={history.length === 0}>
          <BackIcon /> <span className="ml-1 text-xs">Back</span>
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] text-[#a6adc8] border-[#313244]">
            {currentScreen?.name ?? 'No screen'}
          </Badge>
          <Badge variant="outline" className="text-[10px] text-[#a6adc8] border-[#313244]">
            {history.length + 1} / {screens.length}
          </Badge>
          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-800">
            {outgoingConnections.length} hotspot{outgoingConnections.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <div
          className={`relative bg-white rounded-lg shadow-2xl overflow-hidden transition-transform ${
            transitioning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
          }`}
          style={{ width: '100%', maxWidth: '1440px', height: 'calc(100vh - 80px)' }}
        >
          {blobUrl && (
            <iframe
              ref={iframeRef}
              src={blobUrl}
              title="Prototype Preview"
              sandbox="allow-scripts"
              className="w-full h-full border-0"
            />
          )}
          <OverlayPreviewLayer
            overlayConnections={overlayConnections}
            screens={screens}
            onMessage={onOverlayMessage}
          />
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" /><path d="M6 6l12 12" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}
