import type { Connection, Screen } from '@/types/project';
import { PROTOFLOW_START, PROTOFLOW_END } from './constants';
import { safeJson } from './html-escape';

export function injectNavigation(
  htmlContent: string,
  connections: Connection[],
  screenMap: Map<string, Screen>
): string {
  // 1. Strip existing PROTOFLOW block (idempotent re-export)
  const startIdx = htmlContent.indexOf(PROTOFLOW_START);
  const endIdx = htmlContent.indexOf(PROTOFLOW_END);
  let cleaned = htmlContent;
  if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    cleaned = htmlContent.slice(0, startIdx) + htmlContent.slice(endIdx + PROTOFLOW_END.length);
  }

  // 2. Build routes — only for navigate_to connections
  const routes: { selector: string; target: string; alert: string | null }[] = [];
  for (const conn of connections) {
    // Skip overlay connections — they are handled by overlay-injection
    if (conn.actionType && conn.actionType !== 'navigate_to') continue;
    const target = screenMap.get(conn.targetScreenId);
    if (!target) continue;
    routes.push({
      selector: conn.trigger.selector,
      target: target.fileName,
      alert: conn.alertCode ?? null,
    });
  }

  if (routes.length === 0) return cleaned;

  // 3. Generate script (ES5 compatible)
  // IMPORTANT: Only overrides the specific selectors wired in ProtoFlow.
  // All other existing links, onclick handlers, and navigation remain untouched.
  const routeEntries = routes
    .map((r) => {
      const alert = r.alert ? safeJson(r.alert) : 'null';
      return `    { sel: ${safeJson(r.selector)}, target: ${safeJson(r.target)}, alert: ${alert} }`;
    })
    .join(',\n');

  const script = `
${PROTOFLOW_START}
<script>
(function() {
  var routes = [
${routeEntries}
  ];
  for (var i = 0; i < routes.length; i++) {
    (function(route) {
      var els = document.querySelectorAll(route.sel);
      for (var j = 0; j < els.length; j++) {
        els[j].addEventListener('click', function(e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (route.alert) { window.alert(route.alert); }
          window.location.href = route.target;
        }, true);
      }
    })(routes[i]);
  }
})();
</script>
${PROTOFLOW_END}`;

  // 4. Insert before </body> or at end
  const bodyCloseIdx = cleaned.lastIndexOf('</body>');
  if (bodyCloseIdx !== -1) {
    return cleaned.slice(0, bodyCloseIdx) + script + '\n' + cleaned.slice(bodyCloseIdx);
  }
  return cleaned + script;
}
