import type { Project, Enhancement, EnhancementScreen } from '@/types/project';
import {
  SHELL_CSS,
  TOGGLE_BAR_HTML,
  HEADER_HTML,
  FOOTER_HTML,
  DESC_MODAL_HTML,
  buildSidebarHtml,
  buildCoreJs,
} from './enhancement-shell';
import { getModuleLabel } from './constants';
import { escapeHtml, safeJson } from './html-escape';

/**
 * Build the ENHANCEMENTS JS array from project data.
 */
function buildEnhancementsArray(
  enhancements: Enhancement[],
  enhScreens: EnhancementScreen[]
): string {
  const screenMap = new Map(enhScreens.map((es) => [es.id, es.divId]));

  const items = enhancements.map((enh) => {
    const screenDivId = enh.linkedScreenIds.length > 0
      ? screenMap.get(enh.linkedScreenIds[0]) ?? ''
      : enhScreens[0]?.divId ?? '';

    return {
      id: enh.id,
      ref: enh.ref || `ENH-${enh.id}`,
      title: enh.title,
      desc: enh.desc,
      purpose: enh.purpose,
      problem: enh.problem,
      client: enh.client || 'N/A',
      screen: screenDivId,
      section: enh.section,
      changes: enh.changes.length > 0 ? enh.changes : null,
      config: enh.config,
    };
  });

  return safeJson(items);
}

/**
 * Detect whether uploaded HTML contains a app shell (sidebar, header, footer).
 * Reuses the same regex patterns as extractScreenContent().
 */
export function detectAppShell(html: string): { hasShell: boolean; shellType: 'id-based' | 'class-based' | 'none' } {
  // ID-based: id="content", id="shell", or id="sidebar" (any tag — <div>, <nav>, etc.)
  if (/<[a-z][a-z0-9]*[^>]*\bid=["'](?:content|shell|sidebar)["'][^>]*>/i.test(html)) {
    return { hasShell: true, shellType: 'id-based' };
  }

  // Class-based: class="sidebar" (exact match, any tag)
  if (/<[a-z][a-z0-9]*[^>]*\bclass=["']sidebar["'][^>]*>/i.test(html)) {
    return { hasShell: true, shellType: 'class-based' };
  }

  return { hasShell: false, shellType: 'none' };
}

/**
 * Walk a div tag to find its matching </div>, returning the innerHTML.
 * Uses depth counting — handles nested divs correctly.
 */
function extractDivInnerHtml(html: string, openTagMatch: RegExpMatchArray): string | null {
  const startTag = openTagMatch[0];
  const tagPos = html.indexOf(startTag);
  if (tagPos === -1) return null;
  const startIdx = tagPos + startTag.length;

  let depth = 1;
  let pos = startIdx;
  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);

    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      const charAfter = html[nextOpen + 4];
      if (charAfter === ' ' || charAfter === '>' || charAfter === '\n' || charAfter === '\t' || charAfter === '/') {
        depth++;
      }
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        return html.substring(startIdx, nextClose).trim();
      }
      pos = nextClose + 6;
    }
  }
  return null;
}

/**
 * Shell CSS selectors to strip from uploaded HTML styles.
 * These target shell elements (sidebar, header, footer, shell wrapper) that ProtoFlow
 * provides its own version of. Keeping them causes double-styling.
 */
const SHELL_SELECTOR_PATTERNS = [
  /^#shell\b/,
  /^#sidebar\b/,
  /^#header\b/,
  /^#footer\b/,
  /^#main\b/,
  /^#content\b/,
  /^\.sidebar\b/,
  /^\.header\b/,
  /^\.footer\b/,
  /^\.sb-inner\b/,
  /^\.si-item\b/,
  /^\.si-icon\b/,
  /^\.si-label\b/,
  /^\.si\b/,
  /^\.hdr-/,
  /^\.logo\b/,
  /^\.srch\b/,
  /^\.loc\b/,
  /^\.av\b/,
  /^\.ub\b/,
  /^\.chv\b/,
  /^\.hib\b/,
  /^\.sb-hamburger\b/,
  /^\.sb-bottom-arrow\b/,
  /^nav#sidebar\b/,
  /^header#header\b/,
  // NOTE: Do NOT strip :root, body, html, or * rules — they contain
  // CSS variables, font-family, box-sizing resets that screens need.
];

/**
 * Filter out shell-related CSS rules from style blocks.
 * Keeps screen-specific styles (content area), strips shell layout/sidebar/header/footer rules.
 */
function filterShellCss(stylesHtml: string): string {
  return stylesHtml.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_match, openTag: string, cssContent: string, closeTag: string) => {
      // Split CSS into individual rule blocks and filter
      const filtered = cssContent.replace(
        // Match CSS rule blocks: selector(s) { ... }
        /([^{}]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
        (ruleMatch, selectorPart: string) => {
          const selector = selectorPart.trim();

          // Skip @-rules (keep @media, @keyframes, etc.)
          if (selector.startsWith('@')) return ruleMatch;

          // Check if any selector in a comma-separated list is a shell selector
          const selectors = selector.split(',').map((s: string) => s.trim());
          const isShell = selectors.every((sel: string) =>
            SHELL_SELECTOR_PATTERNS.some((pattern) => pattern.test(sel))
          );

          return isShell ? '' : ruleMatch;
        }
      );

      const trimmed = filtered.trim();
      return trimmed ? `${openTag}\n${trimmed}\n${closeTag}` : '';
    }
  );
}

/**
 * Extract ONLY the screen content from uploaded HTML, stripping any existing app shell.
 * Also extracts <style> blocks so screen-specific CSS is preserved.
 *
 * Detects two shell patterns:
 *  - ID-based:    id="content" (new app template)
 *  - Class-based: class="sidebar" + class="main" or class="container" (standalone HTML files)
 *
 * IMPORTANT: Uses string/regex operations — NOT DOMParser — to preserve original HTML exactly.
 */
export function extractScreenContent(htmlContent: string): { styles: string; content: string; scripts: string } {
  // 1. Extract all <style> blocks from the HTML, then filter out shell CSS rules
  const styleMatches = htmlContent.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const styles = filterShellCss(styleMatches.join('\n'));

  // 1b. Extract all <script> blocks from the HTML (preserves inline JS for interactivity)
  const scriptMatches = htmlContent.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  const scripts = scriptMatches.join('\n');

  // 2a. ID-based app shell: look for id="content"
  const idContentMatch = htmlContent.match(/<div[^>]*\bid=["']content["'][^>]*>/i);
  if (idContentMatch) {
    const content = extractDivInnerHtml(htmlContent, idContentMatch);
    if (content !== null) return { styles, content, scripts };
  }

  // 2b. Class-based app shell (legacy fallback for older standalone HTML files):
  //     Signal: a <div> whose class is exactly "sidebar" (not "nav-sidebar", "form-sidebar", etc.)
  //     Content: extract from <div class="main"> or <div class="container">
  //     NOTE: Exact-match only to avoid false positives. New HTML should use id="content" (rule 7 in guidelines).
  const hasClassSidebar = /<div[^>]*\bclass=["']sidebar["'][^>]*>/i.test(htmlContent);
  if (hasClassSidebar) {
    // Try class="main" first (exact), then class="container" (exact)
    const mainMatch = htmlContent.match(/<div[^>]*\bclass=["']main["'][^>]*>/i);
    if (mainMatch) {
      const content = extractDivInnerHtml(htmlContent, mainMatch);
      if (content !== null) return { styles, content, scripts };
    }
    const containerMatch = htmlContent.match(/<div[^>]*\bclass=["']container["'][^>]*>/i);
    if (containerMatch) {
      const content = extractDivInnerHtml(htmlContent, containerMatch);
      if (content !== null) return { styles, content, scripts };
    }
  }

  // 3. No app shell — extract <body> content
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) return { styles, content: bodyMatch[1].trim(), scripts };

  // 4. Fallback — return as-is
  return { styles, content: htmlContent, scripts };
}


/**
 * Prepare screen content for single-DOM export:
 *  1. Strip <script> blocks (scripts are placed once at the bottom of the export)
 *  2. Add enh-highlight-c class + data-enh="N" on data-enhanced elements (for glow)
 *  3. Keep both data-enhanced and data-current-only attributes intact (CSS handles toggle)
 * Uses string replacement — does NOT run through DOMParser.
 */
function prepareScreenContent(content: string, enhId: number): string {
  // Step 1: Strip <script> blocks — they go to uniqueScripts at the bottom of the export
  let result = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Step 2: Add glow class + data-enh on data-enhanced elements
  // For plain wrapper divs (no original class, no inline style), also add
  // style="display:contents" so they don't break parent flex/grid layouts.
  // Styled elements (with classes or inline styles) keep their natural display.
  result = result.replace(
    /(<[a-z][a-z0-9]*)((?:\s+[^>]*?)?)(\s+data-enhanced(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*))?)((?:\s+[^>]*?)?)(\/?>)/gi,
    (_match, tagStart: string, beforeAttr: string, _dataEnhAttr: string, afterAttr: string, tagEnd: string) => {
      const fullAttrs = beforeAttr + afterAttr;

      const classMatch = fullAttrs.match(/class\s*=\s*["']([^"']*)["']/i);
      const hasStyle = /style\s*=/i.test(fullAttrs);
      const isDiv = /^<div$/i.test(tagStart);
      const hadOriginalClass = !!classMatch;

      let newAttrs: string;
      if (classMatch) {
        newAttrs = fullAttrs.replace(
          /class\s*=\s*["']([^"']*)["']/i,
          `class="${classMatch[1]} enh-highlight-c"`
        );
      } else {
        newAttrs = fullAttrs + ` class="enh-highlight-c"`;
      }

      // Plain wrapper divs: add display:contents so they're layout-transparent.
      // This prevents a bare <div data-enhanced> from inserting display:block
      // into a parent flex/grid container and breaking the layout.
      // Divs WITH classes or inline styles are left alone — their CSS handles display.
      if (isDiv && !hadOriginalClass && !hasStyle) {
        newAttrs += ` style="display:contents"`;
      }

      return `${tagStart}${newAttrs} data-enhanced data-enh="${enhId}"${tagEnd}`;
    }
  );

  return result;
}

/**
 * Export a complete enhancement HTML file from project data.
 * Returns a self-contained HTML string matching the app enhancement template.
 */
export function exportEnhancementHtml(project: Project): string {
  const allEnhScreens = [...(project.enhancementScreens ?? [])].sort((a, b) => a.order - b.order);
  const allEnhancements = project.enhancements ?? [];
  const screens = project.screens;

  // Only include enhancements that have linked screens
  const enhancements = allEnhancements.filter((enh) => enh.linkedScreenIds.length > 0);

  // Only include screens that are linked to at least one enhancement
  const linkedScreenIds = new Set(enhancements.flatMap((enh) => enh.linkedScreenIds));
  const enhScreens = allEnhScreens.filter((es) => linkedScreenIds.has(es.id));

  // Derive module from the first linked screen (per-screen module)
  const firstScreenModule = enhScreens[0]?.module ?? 'dashboard';
  const moduleLabel = getModuleLabel(firstScreenModule);
  const meta = {
    module: firstScreenModule,
    pageTitle: `${moduleLabel} – Enhancement Demo`,
    sidebarActiveItem: moduleLabel,
  };

  const allScreenIds = enhScreens.map((es) => es.divId);

  // Build ENHANCEMENTS array — only linked enhancements
  const enhancementsJson = enhancements.length > 0
    ? buildEnhancementsArray(enhancements, enhScreens)
    : '[]';

  // Build screen content — extract from originals, strip shells, preserve HTML + scripts
  const screenStyles: string[] = [];
  const screenScripts: string[] = [];
  const screenParts: string[] = [];

  for (const es of enhScreens) {
    const screen = screens.find((s) => s.id === es.screenId);
    if (!screen) continue;

    const { styles, content, scripts } = extractScreenContent(screen.htmlContent);
    if (styles) screenStyles.push(styles);
    if (scripts) screenScripts.push(scripts);

    const linkedEnhs = enhancements.filter((enh) =>
      enh.linkedScreenIds.includes(es.id)
    );
    const enhId = linkedEnhs.length > 0 ? linkedEnhs[0].id : 1;

    // Single DOM — CSS class toggle handles Current/Enhanced visibility
    const prepared = prepareScreenContent(content, enhId);

    const displayStyle = es.order === 1 ? 'flex' : 'none';

    screenParts.push(`
      <!-- Screen: ${es.name.replace(/[<>]/g, '').replace(/--+/g, '-')} -->
      <div id="${es.divId}" style="display:${displayStyle}; flex-direction:column; height:100%;">
        ${prepared}
      </div>`);
  }

  const sidebarHtml = buildSidebarHtml(meta.sidebarActiveItem);
  const coreJs = buildCoreJs(enhancementsJson, allScreenIds);

  // Deduplicate screen styles and scripts
  const uniqueStyles = [...new Set(screenStyles)].join('\n');
  const uniqueScripts = [...new Set(screenScripts)].join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(meta.pageTitle)}</title>
${uniqueStyles}
<style>
${SHELL_CSS}
</style>
</head>
<body>

${TOGGLE_BAR_HTML}

<div id="shell">
  ${sidebarHtml}
  <div id="main">
    ${HEADER_HTML}
    <div id="content">
${screenParts.join('\n')}
    </div>
  </div>
</div>

${FOOTER_HTML}

${DESC_MODAL_HTML}

${uniqueScripts}

<script>
${coreJs}
</script>
</body>
</html>`;
}

