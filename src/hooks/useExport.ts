import { useCallback } from 'react';
import { toast } from 'sonner';
import { useProjectStore } from './useProjectStore';
import { projectToJson } from '@/lib/flow-to-json';
import { injectNavigation } from '@/lib/injection';
import { injectOverlays } from '@/lib/overlay-injection';
import { escapeHtml } from '@/lib/html-escape';
import type { Screen } from '@/types/project';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { log } from '@/lib/log';

type Connection = import('@/types/project').Connection;

function injectAll(htmlContent: string, connections: Connection[], screenMap: Map<string, Screen>): string {
  const navConnections = connections.filter((c) => !c.actionType || c.actionType === 'navigate_to');
  const overlayConnections = connections.filter((c) => c.actionType === 'open_overlay');
  let result = injectNavigation(htmlContent, navConnections, screenMap);
  result = injectOverlays(result, overlayConnections, screenMap);
  return result;
}

/**
 * Group connections by source screen id in a single pass (O(connections)),
 * so per-screen export loops don't re-scan all connections (was O(screens × connections)).
 */
function bucketOutgoing(connections: Connection[]): Map<string, Connection[]> {
  const map = new Map<string, Connection[]>();
  for (const conn of connections) {
    const list = map.get(conn.sourceScreenId);
    if (list) list.push(conn);
    else map.set(conn.sourceScreenId, [conn]);
  }
  return map;
}

export function useExport() {
  const project = useProjectStore((s) => s.project);

  const exportJson = useCallback(() => {
    try {
      const json = projectToJson(project);
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      saveAs(blob, `${project.name || 'protoflow'}-flow.json`);
      log.info('export_succeeded', { kind: 'json', screens: project.screens.length });
    } catch (err) {
      log.error('export_failed', { kind: 'json', error: err });
      toast.error('Export failed while writing flow.json. See the console for details.');
    }
  }, [project]);

  // Download as ZIP with individual linked HTML files + flow.json
  const exportZip = useCallback(async () => {
    if (project.screens.length === 0) {
      toast.info('Nothing to export yet — add a screen first.');
      return;
    }
    try {
    const zip = new JSZip();
    const screenMap = new Map<string, Screen>();
    for (const screen of project.screens) {
      screenMap.set(screen.id, screen);
    }
    const outgoingByScreen = bucketOutgoing(project.connections);

    for (const screen of project.screens) {
      const outgoing = outgoingByScreen.get(screen.id) ?? [];
      const injected = injectAll(screen.htmlContent, outgoing, screenMap);
      zip.file(screen.fileName, injected);
    }

    const json = projectToJson(project);
    zip.file('flow.json', JSON.stringify(json, null, 2));

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${project.name || 'protoflow'}-linked.zip`);
      log.info('export_succeeded', { kind: 'zip', screens: project.screens.length, connections: project.connections.length });
      toast.success(`Exported ${project.screens.length} linked screen${project.screens.length !== 1 ? 's' : ''} as a ZIP.`);
    } catch (err) {
      log.error('export_failed', { kind: 'zip', screens: project.screens.length, error: err });
      toast.error('Export failed — could not build the ZIP. See the console for details.');
    }
  }, [project]);

  // Download each linked HTML as a separate file (triggers multiple downloads)
  const exportIndividualFiles = useCallback(() => {
    if (project.screens.length === 0) {
      toast.info('Nothing to export yet — add a screen first.');
      return;
    }
    try {
      const screenMap = new Map<string, Screen>();
      for (const screen of project.screens) {
        screenMap.set(screen.id, screen);
      }
      const outgoingByScreen = bucketOutgoing(project.connections);

      for (const screen of project.screens) {
        const outgoing = outgoingByScreen.get(screen.id) ?? [];
        const injected = injectAll(screen.htmlContent, outgoing, screenMap);
        const blob = new Blob([injected], { type: 'text/html' });
        saveAs(blob, screen.fileName);
      }
      log.info('export_succeeded', { kind: 'individual', screens: project.screens.length });
    } catch (err) {
      log.error('export_failed', { kind: 'individual', screens: project.screens.length, error: err });
      toast.error('Export failed while writing files. See the console for details.');
    }
  }, [project]);

  // Export entire flow as a single self-contained HTML file with embedded navigation
  const exportSingleFile = useCallback(() => {
    if (project.screens.length === 0) {
      toast.info('Nothing to export yet — add a screen first.');
      return;
    }
    try {
    const screenMap = new Map<string, Screen>();
    for (const screen of project.screens) {
      screenMap.set(screen.id, screen);
    }

    // Build all screens data
    const outgoingByScreen = bucketOutgoing(project.connections);
    const screensData: { fileName: string; html: string }[] = [];
    for (const screen of project.screens) {
      const outgoing = outgoingByScreen.get(screen.id) ?? [];
      const injected = injectAll(screen.htmlContent, outgoing, screenMap);
      screensData.push({ fileName: screen.fileName, html: injected });
    }

    const firstScreen = screensData[0]?.fileName ?? '';
    const json = projectToJson(project);

    // Build a single HTML that embeds all screens and switches between them
    const singleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(project.name || 'ProtoFlow')} - Full Prototype</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #1e1e2e; font-family: system-ui, sans-serif; }
  .pf-topbar { height: 40px; background: #181825; border-bottom: 1px solid #313244; display: flex; align-items: center; padding: 0 16px; gap: 12px; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
  .pf-topbar span { color: #cdd6f4; font-size: 12px; }
  .pf-topbar .pf-title { font-weight: 600; }
  .pf-topbar button { background: #313244; color: #cdd6f4; border: none; padding: 4px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; }
  .pf-topbar button:hover { background: #45475a; }
  .pf-topbar .pf-badge { background: #313244; padding: 2px 8px; border-radius: 10px; font-size: 10px; color: #a6adc8; }
  .pf-frame { position: fixed; top: 40px; left: 0; right: 0; bottom: 0; border: none; width: 100%; height: calc(100vh - 40px); }
  .pf-frame.pf-hidden { display: none; }
</style>
</head>
<body>
<div class="pf-topbar">
  <span class="pf-title">${escapeHtml(project.name || 'ProtoFlow')}</span>
  <button onclick="pfBack()">Back</button>
  <span class="pf-badge" id="pf-screen-name"></span>
</div>

${screensData.map((s, i) => `<iframe id="pf-frame-${i}" class="pf-frame pf-hidden" sandbox="allow-scripts allow-same-origin" data-filename="${escapeHtml(s.fileName)}"></iframe>`).join('\n')}

<script>
var pfScreens = ${JSON.stringify(screensData.map((s) => ({ fileName: s.fileName, html: s.html })))};
var pfHistory = [];
var pfCurrentIdx = -1;
var pfFlow = ${JSON.stringify(json)};

function pfNavigate(fileName) {
  var idx = pfScreens.findIndex(function(s) { return s.fileName === fileName; });
  if (idx === -1) return;
  if (pfCurrentIdx >= 0) pfHistory.push(pfCurrentIdx);
  pfShow(idx);
}

function pfBack() {
  if (pfHistory.length === 0) return;
  var idx = pfHistory.pop();
  pfShow(idx);
}

function pfShow(idx) {
  // Hide all
  for (var i = 0; i < pfScreens.length; i++) {
    document.getElementById('pf-frame-' + i).classList.add('pf-hidden');
  }
  pfCurrentIdx = idx;
  var frame = document.getElementById('pf-frame-' + idx);
  frame.classList.remove('pf-hidden');
  document.getElementById('pf-screen-name').textContent = pfScreens[idx].fileName;

  // Write content if not already loaded
  if (!frame.dataset.loaded) {
    var doc = frame.contentDocument;
    doc.open();
    doc.write(pfScreens[idx].html);
    doc.close();
    frame.dataset.loaded = '1';

    // Override navigation in iframe
    frame.contentWindow.addEventListener('message', function() {});
    var origLocation = Object.getOwnPropertyDescriptor(window, 'location');
    // Intercept location.href changes
    doc.addEventListener('click', function(e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (a && a.href) {
        var href = a.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('javascript')) {
          e.preventDefault();
          pfNavigate(href);
        }
      }
    }, true);

    // Patch window.location.href assignments
    var iframeWindow = frame.contentWindow;
    var origHref = Object.getOwnPropertyDescriptor(iframeWindow.location.__proto__, 'href');
    if (origHref && origHref.set) {
      try {
        Object.defineProperty(iframeWindow.location, 'href', {
          set: function(val) {
            if (val && !val.startsWith('http')) {
              pfNavigate(val);
            } else {
              origHref.set.call(iframeWindow.location, val);
            }
          },
          get: origHref.get ? origHref.get.bind(iframeWindow.location) : undefined
        });
      } catch(e) { /* security restriction, fall back */ }
    }
  }
}

// Start with first screen
if (pfScreens.length > 0) {
  var startFile = ${JSON.stringify(firstScreen)};
  pfNavigate(startFile);
}

// Listen for navigation messages from injected ProtoFlow scripts
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'protoflow-navigate') {
    pfNavigate(e.data.target);
  }
});
</script>
</body>
</html>`;

    const blob = new Blob([singleHtml], { type: 'text/html' });
    saveAs(blob, `${project.name || 'protoflow'}-prototype.html`);
      log.info('export_succeeded', { kind: 'single-file', screens: project.screens.length });
      toast.success('Exported the full prototype as a single HTML file.');
    } catch (err) {
      log.error('export_failed', { kind: 'single-file', screens: project.screens.length, error: err });
      toast.error('Export failed while building the single-file prototype. See the console for details.');
    }
  }, [project]);

  return { exportJson, exportZip, exportIndividualFiles, exportSingleFile };
}
