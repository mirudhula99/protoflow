import type { Connection, Screen } from '@/types/project';
import { renderTemplate } from './templates';
import { safeJson } from './html-escape';

const OVERLAY_START = '<!-- PROTOFLOW:OVERLAY:START -->';
const OVERLAY_END = '<!-- PROTOFLOW:OVERLAY:END -->';

export function injectOverlays(
  htmlContent: string,
  overlayConnections: Connection[],
  screenMap: Map<string, Screen>
): string {
  if (overlayConnections.length === 0) return htmlContent;

  // Strip old overlay block
  const startIdx = htmlContent.indexOf(OVERLAY_START);
  const endIdx = htmlContent.indexOf(OVERLAY_END);
  let cleaned = htmlContent;
  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    cleaned = htmlContent.slice(0, startIdx) + htmlContent.slice(endIdx + OVERLAY_END.length);
  }

  // Build overlay data
  const overlays: {
    id: string;
    selector: string;
    html: string;
    position: string;
    offsetX: number;
    offsetY: number;
    dim: boolean;
    dimOpacity: number;
    closeOnOutside: boolean;
    autoDismissMs: number | null;
  }[] = [];

  for (const conn of overlayConnections) {
    if (!conn.overlaySource || !conn.overlaySettings) continue;

    let overlayHtml = '';
    if (conn.overlaySource.type === 'template' && conn.overlaySource.templateConfig) {
      overlayHtml = renderTemplate(conn.overlaySource.templateConfig);
    } else if (conn.overlaySource.type === 'screen' && conn.overlaySource.screenId) {
      const screen = screenMap.get(conn.overlaySource.screenId);
      if (screen) {
        // For screen overlays, wrap in an iframe-like container
        overlayHtml = `<div style="width:600px;max-width:90vw;max-height:80vh;overflow:auto;background:white;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">${screen.htmlContent}</div>`;
      }
    }

    if (!overlayHtml) continue;

    overlays.push({
      id: conn.id,
      selector: conn.trigger.selector,
      html: overlayHtml,
      position: conn.overlaySettings.position,
      offsetX: conn.overlaySettings.manual_offset?.x ?? 0,
      offsetY: conn.overlaySettings.manual_offset?.y ?? 0,
      dim: conn.overlaySettings.background_dim,
      dimOpacity: conn.overlaySettings.dim_opacity,
      closeOnOutside: conn.overlaySettings.close_on_outside_click,
      autoDismissMs: conn.overlaySettings.auto_dismiss_ms ?? null,
    });
  }

  if (overlays.length === 0) return cleaned;

  // Generate overlay HTML containers (hidden by default) + JS to show/hide
  const overlayDivs = overlays
    .map((o) => {
      const posStyle = getPositionCSS(o.position, o.offsetX, o.offsetY);
      return `<div id="pf-overlay-${o.id}" class="pf-overlay-container" style="display:none;position:fixed;inset:0;z-index:10000;${posStyle}${o.dim ? `background:rgba(0,0,0,${o.dimOpacity});` : 'pointer-events:none;'}" data-close-outside="${o.closeOnOutside}" data-auto-dismiss="${o.autoDismissMs || ''}">${`<div style="pointer-events:auto;">${o.html}</div>`}</div>`;
    })
    .join('\n');

  const overlayScript = `
${OVERLAY_START}
${overlayDivs}
<script>
(function() {
  var overlays = ${safeJson(overlays.map((o) => ({ id: o.id, selector: o.selector, autoDismissMs: o.autoDismissMs, closeOnOutside: o.closeOnOutside })))};

  overlays.forEach(function(cfg) {
    var container = document.getElementById('pf-overlay-' + cfg.id);
    if (!container) return;

    // Wire trigger elements
    var els = document.querySelectorAll(cfg.selector);
    for (var i = 0; i < els.length; i++) {
      (function(el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          container.style.display = 'flex';
          if (cfg.autoDismissMs) {
            setTimeout(function() { container.style.display = 'none'; }, cfg.autoDismissMs);
          }
        }, true);
      })(els[i]);
    }

    // Close on outside click
    if (cfg.closeOnOutside) {
      container.addEventListener('click', function(e) {
        if (e.target === container) container.style.display = 'none';
      });
    }

    // Close buttons
    var closeBtns = container.querySelectorAll('[data-pf-overlay-close]');
    for (var j = 0; j < closeBtns.length; j++) {
      closeBtns[j].addEventListener('click', function() {
        container.style.display = 'none';
      });
    }
  });
})();
</script>
${OVERLAY_END}`;

  // Insert before </body> or at end
  const bodyCloseIdx = cleaned.lastIndexOf('</body>');
  if (bodyCloseIdx !== -1) {
    return cleaned.slice(0, bodyCloseIdx) + overlayScript + '\n' + cleaned.slice(bodyCloseIdx);
  }
  return cleaned + overlayScript;
}

/**
 * Returns flex alignment/padding for a container position.
 * IMPORTANT: does NOT include `display` — the container keeps `display:none`
 * inline until the trigger fires, then the show handler sets `display:flex`.
 * (Emitting `display:flex` here would be a second `display` declaration after
 * `display:none` and — last-wins — render every overlay visible on page load.)
 */
function getPositionCSS(position: string, offsetX: number, offsetY: number): string {
  switch (position) {
    case 'center':
      return 'align-items:center;justify-content:center;';
    case 'top_left':
      return 'align-items:flex-start;justify-content:flex-start;padding:20px;';
    case 'top_right':
      return 'align-items:flex-start;justify-content:flex-end;padding:20px;';
    case 'bottom_left':
      return 'align-items:flex-end;justify-content:flex-start;padding:20px;';
    case 'bottom_right':
      return 'align-items:flex-end;justify-content:flex-end;padding:20px;';
    case 'manual':
      return `align-items:flex-start;justify-content:flex-start;padding-left:${offsetX}px;padding-top:${offsetY}px;`;
    default:
      return 'align-items:center;justify-content:center;';
  }
}
