import { DATA_ENHANCED_ATTR, DATA_CURRENT_ONLY_ATTR } from './constants';

export interface ParsedEnhancementHtml {
  /** CSS selectors for all elements with data-enhanced attribute */
  enhancedSelectors: string[];
  /** CSS selectors for all elements with data-current-only attribute */
  currentOnlySelectors: string[];
  /** Original HTML with data-enhanced attributes stripped (for current view) */
  currentHtml: string;
  /** HTML with glow highlights applied on data-enhanced elements (for enhanced view) */
  enhancedHtml: string;
}

/**
 * Build a CSS selector path for a DOM element.
 * Uses tag + nth-child for specificity.
 */
function buildSelector(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== current.ownerDocument?.documentElement) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${CSS.escape(current.id)}`;
      parts.unshift(selector);
      break;
    }

    const parent: Element | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c: Element) => c.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    parts.unshift(selector);
    current = parent;
  }

  return parts.join(' > ');
}

/**
 * Parse an HTML string that contains `data-enhanced` markers.
 *
 * Returns:
 * - enhancedSelectors: CSS selectors for every marked element
 * - currentHtml: the HTML with `data-enhanced` stripped (no glows)
 * - enhancedHtml: the HTML with glow CSS class injected on marked elements
 */
export function parseEnhancedHtml(htmlContent: string): ParsedEnhancementHtml {
  const parser = new DOMParser();

  // --- Build enhanced selectors ---
  const selectorDoc = parser.parseFromString(htmlContent, 'text/html');
  const markedElements = selectorDoc.querySelectorAll(`[${DATA_ENHANCED_ATTR}]`);
  const enhancedSelectors: string[] = [];

  markedElements.forEach((el) => {
    enhancedSelectors.push(buildSelector(el));
  });

  // --- Build current-only selectors ---
  const currentOnlyElements = selectorDoc.querySelectorAll(`[${DATA_CURRENT_ONLY_ATTR}]`);
  const currentOnlySelectors: string[] = [];

  currentOnlyElements.forEach((el) => {
    currentOnlySelectors.push(buildSelector(el));
  });

  // --- Build currentHtml (strip data-enhanced, no glows) ---
  const currentDoc = parser.parseFromString(htmlContent, 'text/html');
  currentDoc.querySelectorAll(`[${DATA_ENHANCED_ATTR}]`).forEach((el) => {
    el.removeAttribute(DATA_ENHANCED_ATTR);
  });
  const currentHtml = currentDoc.documentElement.outerHTML;

  // --- Build enhancedHtml (strip data-enhanced, add glow class) ---
  const enhancedDoc = parser.parseFromString(htmlContent, 'text/html');
  enhancedDoc.querySelectorAll(`[${DATA_ENHANCED_ATTR}]`).forEach((el) => {
    el.removeAttribute(DATA_ENHANCED_ATTR);
    el.classList.add('enh-highlight-c');
  });

  // Inject glow CSS into <head> if there are enhanced elements
  if (enhancedSelectors.length > 0) {
    const style = enhancedDoc.createElement('style');
    style.textContent = `
      .enh-highlight-c {
        outline: 2px solid #2563eb !important;
        outline-offset: 2px;
        border-radius: 4px;
        position: relative;
      }
      .enh-highlight-c::after {
        content: '';
        position: absolute;
        top: -4px;
        right: -4px;
        width: 8px;
        height: 8px;
        background: #2563eb;
        border-radius: 50%;
        animation: enh-pulse 1.5s ease-in-out infinite;
      }
      @keyframes enh-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.3); }
      }
    `;
    enhancedDoc.head.appendChild(style);
  }

  const enhancedHtml = enhancedDoc.documentElement.outerHTML;

  return { enhancedSelectors, currentOnlySelectors, currentHtml, enhancedHtml };
}

/**
 * Check if an HTML string contains any `data-enhanced` or `data-current-only` markers.
 */
export function hasEnhancedMarkers(htmlContent: string): boolean {
  return htmlContent.includes(DATA_ENHANCED_ATTR) || htmlContent.includes(DATA_CURRENT_ONLY_ATTR);
}
