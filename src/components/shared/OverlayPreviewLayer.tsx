import { useState, useEffect, useCallback, useRef } from 'react';
import { renderTemplate } from '@/lib/templates';
import type { Connection, Screen, OverlaySettings } from '@/types/project';

interface ActiveOverlay {
  id: string;
  connection: Connection;
  htmlContent: string;
}

interface OverlayPreviewLayerProps {
  overlayConnections: Connection[];
  screens: Screen[];
  onMessage: (handler: (type: string, data: Record<string, unknown>) => void) => () => void;
}

function getPositionStyle(settings: OverlaySettings): React.CSSProperties {
  switch (settings.position) {
    case 'center':
      return { display: 'flex', alignItems: 'center', justifyContent: 'center' };
    case 'top_left':
      return { display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '20px' };
    case 'top_right':
      return { display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '20px' };
    case 'bottom_left':
      return { display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: '20px' };
    case 'bottom_right':
      return { display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '20px' };
    case 'manual':
      return {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingLeft: `${settings.manual_offset?.x ?? 0}px`,
        paddingTop: `${settings.manual_offset?.y ?? 0}px`,
      };
    default:
      return { display: 'flex', alignItems: 'center', justifyContent: 'center' };
  }
}

export function OverlayPreviewLayer({ overlayConnections, screens, onMessage }: OverlayPreviewLayerProps) {
  const [activeOverlays, setActiveOverlays] = useState<ActiveOverlay[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const openOverlay = useCallback((connId: string) => {
    const conn = overlayConnections.find((c) => c.id === connId);
    if (!conn || !conn.overlaySource || !conn.overlaySettings) return;

    let htmlContent = '';
    if (conn.overlaySource.type === 'template' && conn.overlaySource.templateConfig) {
      htmlContent = renderTemplate(conn.overlaySource.templateConfig);
    } else if (conn.overlaySource.type === 'screen' && conn.overlaySource.screenId) {
      const screen = screens.find((s) => s.id === conn.overlaySource!.screenId);
      if (screen) htmlContent = screen.htmlContent;
    }

    if (!htmlContent) return;

    setActiveOverlays((prev) => {
      if (prev.some((o) => o.id === connId)) return prev;
      return [...prev, { id: connId, connection: conn, htmlContent }];
    });

    // Auto-dismiss — clear any prior timer for this overlay before scheduling a new one
    if (conn.overlaySettings.auto_dismiss_ms) {
      const existing = timersRef.current.get(connId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        closeOverlay(connId);
      }, conn.overlaySettings.auto_dismiss_ms);
      timersRef.current.set(connId, timer);
    }
  }, [overlayConnections, screens]);

  const closeOverlay = useCallback((connId: string) => {
    setActiveOverlays((prev) => prev.filter((o) => o.id !== connId));
    const timer = timersRef.current.get(connId);
    if (timer) { clearTimeout(timer); timersRef.current.delete(connId); }
  }, []);

  const closeAllOverlays = useCallback(() => {
    setActiveOverlays([]);
    for (const timer of timersRef.current.values()) clearTimeout(timer);
    timersRef.current.clear();
  }, []);

  // Flush any pending auto-dismiss timers when the layer unmounts
  // (e.g. the preview player closes) so they don't fire on an unmounted tree.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  // Listen for overlay messages from the iframe
  useEffect(() => {
    return onMessage((type, data) => {
      if (type === 'protoflow-open-overlay') {
        openOverlay(data.connectionId as string);
      } else if (type === 'protoflow-close-overlay') {
        if (data.connectionId) closeOverlay(data.connectionId as string);
        else closeAllOverlays();
      }
    });
  }, [onMessage, openOverlay, closeOverlay, closeAllOverlays]);

  if (activeOverlays.length === 0) return null;

  return (
    <>
      {activeOverlays.map((overlay) => {
        const settings = overlay.connection.overlaySettings!;
        const isScreenOverlay = overlay.connection.overlaySource?.type === 'screen';

        return (
          <div
            key={overlay.id}
            className="absolute inset-0 z-10"
            style={{
              ...getPositionStyle(settings),
              backgroundColor: settings.background_dim ? `rgba(0,0,0,${settings.dim_opacity})` : 'transparent',
              pointerEvents: settings.background_dim ? 'auto' : 'none',
            }}
            onClick={(e) => {
              if (settings.close_on_outside_click && e.target === e.currentTarget) {
                closeOverlay(overlay.id);
              }
            }}
          >
            <div
              className="relative"
              style={{ pointerEvents: 'auto' }}
            >
              {isScreenOverlay ? (
                <iframe
                  srcDoc={overlay.htmlContent}
                  title="Overlay"
                  sandbox="allow-scripts"
                  className="border-0 rounded-lg shadow-2xl"
                  style={{ width: '600px', height: '400px', background: 'white' }}
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: overlay.htmlContent }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.hasAttribute('data-pf-overlay-close') || target.closest('[data-pf-overlay-close]')) {
                      closeOverlay(overlay.id);
                    }
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export type { ActiveOverlay };
