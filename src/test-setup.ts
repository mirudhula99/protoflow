// Test environment shims. jsdom does not implement CSS.escape, which the
// selector builders rely on (it exists in every real browser), so provide a
// spec-approximating polyfill for the test environment only.
type CssLike = { escape?: (value: string) => string };
const g = globalThis as unknown as { CSS?: CssLike };

if (!g.CSS) g.CSS = {};
if (typeof g.CSS.escape !== 'function') {
  g.CSS.escape = (value: string): string =>
    String(value).replace(/[^\w-]/g, (ch) => '\\' + ch);
}
