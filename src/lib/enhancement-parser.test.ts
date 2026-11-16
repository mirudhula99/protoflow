import { describe, it, expect } from 'vitest';
import { parseEnhancedHtml, hasEnhancedMarkers } from './enhancement-parser';

/** Query the ORIGINAL html string with a generated selector. */
function queryAll(html: string, selector: string): NodeListOf<Element> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelectorAll(selector);
}

describe('hasEnhancedMarkers', () => {
  it('detects a data-enhanced marker', () => {
    expect(hasEnhancedMarkers('<div data-enhanced>x</div>')).toBe(true);
  });

  it('detects a data-current-only marker', () => {
    expect(hasEnhancedMarkers('<div data-current-only>x</div>')).toBe(true);
  });

  it('returns false when there are no markers', () => {
    expect(hasEnhancedMarkers('<div class="field">plain</div>')).toBe(false);
  });
});

describe('parseEnhancedHtml', () => {
  it('collects one selector per data-enhanced element', () => {
    const html = '<ul><li>a</li><li data-enhanced>b</li><li data-enhanced>c</li></ul>';
    const { enhancedSelectors } = parseEnhancedHtml(html);
    expect(enhancedSelectors).toHaveLength(2);
  });

  it('collects current-only selectors separately', () => {
    const html = '<div data-current-only>old</div><div data-enhanced>new</div>';
    const { enhancedSelectors, currentOnlySelectors } = parseEnhancedHtml(html);
    expect(enhancedSelectors).toHaveLength(1);
    expect(currentOnlySelectors).toHaveLength(1);
  });

  it('generates a selector resolving to the EXACT marked element among same-tag siblings', () => {
    // Second of three <li> is marked — the selector must match only that one.
    const html = '<ul><li>first</li><li data-enhanced>second</li><li>third</li></ul>';
    const { enhancedSelectors } = parseEnhancedHtml(html);

    expect(enhancedSelectors).toHaveLength(1);
    // Uses :nth-of-type (matches the same-tag index), not a fragile :nth-child.
    expect(enhancedSelectors[0]).toContain(':nth-of-type(2)');

    const matches = queryAll(html, enhancedSelectors[0]);
    expect(matches).toHaveLength(1);
    expect(matches[0].textContent).toBe('second');
  });

  it('prefers an id selector when the element has an id', () => {
    const { enhancedSelectors } = parseEnhancedHtml('<div id="hero" data-enhanced>x</div>');
    expect(enhancedSelectors[0]).toBe('#hero');
  });

  it('strips data-enhanced from currentHtml (element hidden in current view)', () => {
    const { currentHtml } = parseEnhancedHtml('<div data-enhanced>x</div>');
    expect(currentHtml).not.toContain('data-enhanced');
  });

  it('adds the glow class and injects the glow keyframes in enhancedHtml', () => {
    const { enhancedHtml } = parseEnhancedHtml('<div data-enhanced>x</div>');
    expect(enhancedHtml).toContain('enh-highlight-c');
    expect(enhancedHtml).toContain('@keyframes enh-pulse');
    // the raw marker attribute is replaced by the class
    expect(enhancedHtml).not.toContain('data-enhanced');
  });

  it('injects no glow style when there are no enhanced elements', () => {
    const { enhancedHtml } = parseEnhancedHtml('<div data-current-only>x</div>');
    expect(enhancedHtml).not.toContain('@keyframes enh-pulse');
  });
});
