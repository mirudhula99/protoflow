import { describe, it, expect } from 'vitest';
import { escapeHtml, safeJson } from './html-escape';

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml('&')).toBe('&amp;');
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('>')).toBe('&gt;');
    expect(escapeHtml('"')).toBe('&quot;');
    expect(escapeHtml("'")).toBe('&#39;');
  });

  it('escapes ampersand first so emitted entities are not double-escaped', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('<a href="x">')).toBe('&lt;a href=&quot;x&quot;&gt;');
  });

  it('neutralizes an attribute-injection payload (single + double quotes)', () => {
    expect(escapeHtml(`<img src=x onerror='alert(1)'>`)).toBe(
      '&lt;img src=x onerror=&#39;alert(1)&#39;&gt;'
    );
  });

  it('is null/undefined-safe and returns an empty string', () => {
    expect(escapeHtml(null as unknown as string)).toBe('');
    expect(escapeHtml(undefined as unknown as string)).toBe('');
  });

  it('leaves ordinary text unchanged', () => {
    expect(escapeHtml('Order #1024 shipped')).toBe('Order #1024 shipped');
  });
});

describe('safeJson', () => {
  it('produces valid JSON that round-trips', () => {
    const value = { a: 1, b: ['x', 'y'], c: { d: true } };
    expect(JSON.parse(safeJson(value))).toEqual(value);
  });

  it('neutralizes a closing </script> inside a string value', () => {
    const out = safeJson({ title: 'evil</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('<\\/script>');
    // ...but the original text is still recoverable by a JSON parser.
    expect(JSON.parse(out).title).toBe('evil</script><script>alert(1)</script>');
  });

  it('is case-insensitive about the closing script tag', () => {
    const out = safeJson({ x: '</SCRIPT >'.replace(' ', '') });
    expect(out).not.toMatch(/<\/script>/i);
  });
});
