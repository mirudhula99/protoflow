/**
 * Minimal structured client-side logger for ProtoFlow.
 *
 * ProtoFlow runs entirely in the browser — there is no server, so no metrics,
 * traces, or pager alerts apply. This is the "why did it happen?" signal:
 * stable, machine-readable event names + structured fields, emitted to the
 * console. The user-facing "symptom" signal (the client analogue of a
 * symptom-based alert) is a `toast` at the call site — kept separate on purpose.
 *
 * Rules:
 *  - Event names are stable and kebab/snake_case (e.g. 'persist_failed'), so
 *    they can be grep'd/filtered — never build them by string interpolation.
 *  - Fields are structured; never log secrets, tokens, or full PII. Uploaded
 *    HTML content is user data — log sizes/hashes/names, not the content.
 *  - `debug`/`info` are dropped in production builds; `warn`/`error` always emit.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Fields = Record<string, unknown>;

const isDev = import.meta.env.DEV;

const LEVEL_METHOD: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

function logEvent(event: string, level: LogLevel, fields: Fields = {}): void {
  // In production, drop diagnostic noise; keep anything on-call would act on.
  if (!isDev && (level === 'debug' || level === 'info')) return;

  const payload: Fields = { event, level, ts: new Date().toISOString(), ...fields };
  // Serialize Error objects so they don't collapse to `[object Object]`.
  for (const key of Object.keys(payload)) {
    const v = payload[key];
    if (v instanceof Error) payload[key] = { name: v.name, message: v.message };
  }
  console[LEVEL_METHOD[level]](`[ProtoFlow] ${event}`, payload);
}

export const log = {
  debug: (event: string, fields?: Fields) => logEvent(event, 'debug', fields),
  info: (event: string, fields?: Fields) => logEvent(event, 'info', fields),
  warn: (event: string, fields?: Fields) => logEvent(event, 'warn', fields),
  error: (event: string, fields?: Fields) => logEvent(event, 'error', fields),
};
