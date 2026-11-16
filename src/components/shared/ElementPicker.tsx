import { useEffect, useRef, useCallback, useState } from 'react';

export interface ElementInfo {
  selector: string;
  elementText: string;
  tag: string;
  id: string;
  classes: string[];
  dimensions: { width: number; height: number };
  htmlSnippet: string;
  breadcrumb: string[];
  computedStyles: {
    color: string;
    backgroundColor: string;
    fontSize: string;
    fontFamily: string;
    display: string;
    position: string;
  };
}

interface ElementPickerProps {
  htmlContent: string;
  onSelect: (info: ElementInfo) => void;
  onHover?: (info: ElementInfo | null) => void;
  selectedSelector?: string;
}

const PICKER_SCRIPT = `
<script>
(function() {
  var currentHighlight = null;

  var overlay = document.createElement('div');
  overlay.id = '__pf_overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99998;cursor:crosshair;';
  document.body.appendChild(overlay);

  var highlightBox = document.createElement('div');
  highlightBox.id = '__pf_highlight';
  highlightBox.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;border:2px solid #0d99ff;background:rgba(13,153,255,0.08);border-radius:2px;transition:all 0.04s ease;display:none;';
  document.body.appendChild(highlightBox);

  var sizeLabel = document.createElement('div');
  sizeLabel.id = '__pf_sizelabel';
  sizeLabel.style.cssText = 'position:fixed;z-index:100000;pointer-events:none;background:#0d99ff;color:#fff;font:10px/1 monospace;padding:2px 5px;border-radius:2px;display:none;white-space:nowrap;';
  document.body.appendChild(sizeLabel);

  var hintBadge = document.createElement('div');
  hintBadge.id = '__pf_hint';
  hintBadge.textContent = 'Click a button or link to pick it  ·  hold Alt to pick the exact element under the cursor';
  hintBadge.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:100001;background:rgba(20,21,26,0.92);color:#fff;font:11px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;padding:6px 12px;border-radius:6px;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,0.3);';
  document.body.appendChild(hintBadge);

  // Snap the hovered element up to the nearest clickable ancestor (button, link,
  // etc.) so picking the icon/text inside a button targets the button itself.
  // Holding Alt bypasses this to pick the exact element under the cursor.
  var INTERACTIVE_SEL = 'a, button, [role="button"], [onclick], input, select, textarea, label, summary, [data-action], [data-target], [data-page], [data-navigate], [data-link], [data-route], [data-bs-toggle], [data-bs-target]';
  function resolveTarget(el, exact) {
    if (exact || !el || !el.closest) return el;
    try {
      var hit = el.closest(INTERACTIVE_SEL);
      if (hit && hit !== document.body && hit !== document.documentElement) return hit;
    } catch (e) {}
    return el;
  }

  function getSelector(el) {
    // Prefer id / data-attr / class selectors, but only if they resolve to
    // THIS exact element (a non-unique selector would attach nav to the wrong node).
    if (el.id) {
      var idSel = '#' + CSS.escape(el.id);
      try { if (document.querySelector(idSel) === el) return idSel; } catch(e) {}
    }
    var dataAttrs = ['data-action','data-target','data-page','data-navigate','data-link','data-route','data-bs-toggle','data-bs-target'];
    for (var i = 0; i < dataAttrs.length; i++) {
      var val = el.getAttribute(dataAttrs[i]);
      if (val) {
        var attrSel = el.tagName.toLowerCase() + '[' + dataAttrs[i] + '="' + val.replace(/"/g, '\\\\"') + '"]';
        try { if (document.querySelector(attrSel) === el) return attrSel; } catch(e) {}
      }
    }
    if (el.className && typeof el.className === 'string') {
      var classes = el.className.trim().split(/\\s+/).filter(function(c) { return c && !c.startsWith('__pf'); });
      if (classes.length > 0) {
        var classSelector = el.tagName.toLowerCase() + '.' + classes.map(function(c) { return CSS.escape(c); }).join('.');
        try { if (document.querySelector(classSelector) === el) return classSelector; } catch(e) {}
        var justClasses = '.' + classes.map(function(c) { return CSS.escape(c); }).join('.');
        try { if (document.querySelector(justClasses) === el) return justClasses; } catch(e) {}
      }
    }
    // Structural path — use :nth-of-type (matches the same-tag index we compute)
    // and verify each candidate resolves back to el.
    var path = [];
    var current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      if (current.id) {
        path.unshift('#' + CSS.escape(current.id));
        var idPath = path.join(' > ');
        try { if (document.querySelector(idPath) === el) return idPath; } catch(e) {}
        break;
      }
      var tag = current.tagName.toLowerCase();
      var parent = current.parentElement;
      if (parent) {
        var siblings = Array.from(parent.children).filter(function(s) { return s.tagName === current.tagName; });
        if (siblings.length > 1) {
          tag += ':nth-of-type(' + (siblings.indexOf(current) + 1) + ')';
        }
      }
      path.unshift(tag);
      var testSelector = path.join(' > ');
      try { if (document.querySelector(testSelector) === el) return testSelector; } catch(e) {}
      current = parent;
    }
    return path.join(' > ');
  }

  function getBreadcrumb(el) {
    var parts = [];
    var cur = el;
    while (cur && cur !== document.documentElement) {
      var tag = cur.tagName.toLowerCase();
      if (cur.id) tag += '#' + cur.id;
      else if (cur.className && typeof cur.className === 'string') {
        var cls = cur.className.trim().split(/\\s+/).filter(function(c) { return !c.startsWith('__pf'); }).slice(0, 2);
        if (cls.length) tag += '.' + cls.join('.');
      }
      parts.unshift(tag);
      cur = cur.parentElement;
    }
    return parts;
  }

  function getHtmlSnippet(el) {
    var clone = el.cloneNode(false);
    var outer = clone.outerHTML;
    if (outer.length > 300) outer = outer.substring(0, 300) + '...';
    // Add inner content preview
    var inner = el.innerHTML;
    if (inner.length > 200) inner = inner.substring(0, 200) + '...';
    if (inner.length > 0) {
      var closeIdx = outer.indexOf('>');
      if (closeIdx !== -1 && !outer.endsWith('/>')) {
        return outer.substring(0, closeIdx + 1) + '\\n  ' + inner + '\\n</' + el.tagName.toLowerCase() + '>';
      }
    }
    return outer;
  }

  function buildInfo(el) {
    var cs = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    var classes = [];
    if (el.className && typeof el.className === 'string') {
      classes = el.className.trim().split(/\\s+/).filter(function(c) { return c && !c.startsWith('__pf'); });
    }
    return {
      selector: getSelector(el),
      elementText: (el.textContent || '').trim().substring(0, 80),
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      classes: classes,
      dimensions: { width: Math.round(rect.width), height: Math.round(rect.height) },
      htmlSnippet: getHtmlSnippet(el),
      breadcrumb: getBreadcrumb(el),
      computedStyles: {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily.split(',')[0].trim().replace(/['"]/g, ''),
        display: cs.display,
        position: cs.position
      }
    };
  }

  overlay.addEventListener('mousemove', function(e) {
    overlay.style.pointerEvents = 'none';
    var raw = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'auto';
    if (!raw || (raw.id && raw.id.startsWith('__pf')) || raw === document.body || raw === document.documentElement) {
      highlightBox.style.display = 'none';
      sizeLabel.style.display = 'none';
      currentHighlight = null;
      window.parent.postMessage({ type: 'protoflow-element-hover', info: null }, '*');
      return;
    }
    var target = resolveTarget(raw, e.altKey);
    currentHighlight = target;
    var rect = target.getBoundingClientRect();
    highlightBox.style.display = 'block';
    highlightBox.style.left = rect.left + 'px';
    highlightBox.style.top = rect.top + 'px';
    highlightBox.style.width = rect.width + 'px';
    highlightBox.style.height = rect.height + 'px';

    sizeLabel.textContent = Math.round(rect.width) + ' x ' + Math.round(rect.height);
    sizeLabel.style.display = 'block';
    sizeLabel.style.left = rect.left + 'px';
    sizeLabel.style.top = (rect.bottom + 4) + 'px';

    var info = buildInfo(target);
    window.parent.postMessage({ type: 'protoflow-element-hover', info: info }, '*');
  });

  overlay.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentHighlight) return;
    var info = buildInfo(currentHighlight);
    window.parent.postMessage({ type: 'protoflow-element-picked', info: info }, '*');
  });

  // Draw the "selected element" outline from inside the frame, so the parent
  // never needs same-origin access to the iframe document.
  window.addEventListener('message', function(e) {
    if (!e.data || e.data.type !== 'protoflow-highlight') return;
    var old = document.getElementById('__pf_selected');
    if (old) old.remove();
    var sel = e.data.selector;
    if (!sel) return;
    var el = null;
    try { el = document.querySelector(sel); } catch (err) { return; }
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var div = document.createElement('div');
    div.id = '__pf_selected';
    div.style.cssText = 'position:fixed;left:' + rect.left + 'px;top:' + rect.top + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;border:2px solid #22c55e;background:rgba(34,197,94,0.12);border-radius:2px;z-index:99997;pointer-events:none;';
    document.body.appendChild(div);
  });
})();
</script>`;

export function ElementPicker({ htmlContent, onSelect, onHover, selectedSelector }: ElementPickerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Only accept messages from our own picker iframe (sandboxed → opaque
      // origin, so validate by window identity rather than origin string).
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'protoflow-element-picked' && event.data.info) {
        onSelect(event.data.info);
      }
      if (event.data?.type === 'protoflow-element-hover') {
        onHover?.(event.data.info);
      }
    },
    [onSelect, onHover]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Use blob URL instead of doc.write() — fixes rendering issues with complex HTML
  useEffect(() => {
    if (!htmlContent) return;

    let content = htmlContent;
    // Inject nav interceptor
    const intercept = `<script>
      document.addEventListener('click', function(e) { var a = e.target.closest && e.target.closest('a'); if (a) { e.preventDefault(); e.stopPropagation(); } }, true);
      window.addEventListener('submit', function(e) { e.preventDefault(); }, true);
    </script>`;
    const headClose = content.indexOf('</head>');
    if (headClose !== -1) {
      content = content.slice(0, headClose) + intercept + content.slice(headClose);
    }
    // Inject picker script
    const bodyClose = content.lastIndexOf('</body>');
    if (bodyClose !== -1) {
      content = content.slice(0, bodyClose) + PICKER_SCRIPT + content.slice(bodyClose);
    } else {
      content += PICKER_SCRIPT;
    }

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [htmlContent]);

  // Ask the (sandboxed) frame to draw the selected-element outline itself.
  const postHighlight = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'protoflow-highlight', selector: selectedSelector || '' },
      '*'
    );
  }, [selectedSelector]);

  // Re-send when the selection changes without an iframe reload.
  useEffect(() => {
    postHighlight();
  }, [postHighlight]);

  if (!blobUrl) return null;

  return (
    <iframe
      ref={iframeRef}
      src={blobUrl}
      title="Element Picker"
      sandbox="allow-scripts"
      className="w-full h-full border-0 bg-white"
      onLoad={postHighlight}
    />
  );
}
