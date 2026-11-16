/**
 * HTML-escaping helpers shared across the export / injection paths.
 *
 * Centralizing these prevents the "some sites escape, some don't" drift:
 * every place that interpolates a user value into exported HTML or into a
 * <script> block must route it through one of these.
 */

/** Escape a value for safe interpolation into HTML text or double-/single-quoted attributes. */
export function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * JSON.stringify that is safe to embed inside a <script> block.
 * Neutralizes </script> so a string value cannot break out of the tag.
 */
export function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/<\/script>/gi, '<\\/script>');
}

/**
 * Source for an ES5 HTML-escape function, embedded into generated (exported)
 * scripts so runtime values assigned via innerHTML can't inject markup.
 * Defines `pfEscapeHtml` in the exported file's scope.
 */
export const ES5_ESCAPE_HTML_FN =
  "function pfEscapeHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');}";
