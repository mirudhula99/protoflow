import type { TemplateId, TemplateConfig } from '@/types/project';

const THEME = {
  navy: '#0D1E3D',
  green: '#217A52',
  red: '#dc3545',
  white: '#ffffff',
  lightGray: '#f5f5f5',
  border: '#dee2e6',
  text: '#333333',
  textMuted: '#6c757d',
  font: "'Source Sans Pro', 'Segoe UI', sans-serif",
};

/**
 * Escape a user-supplied value for safe interpolation into HTML — covers both
 * text content and double/single-quoted attribute values. Prevents a stray `"`
 * or `</div>` in a title/message/option from breaking the rendered markup.
 */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getStringProp(props: Record<string, string | boolean | string[]>, key: string, fallback: string): string {
  const v = props[key];
  return typeof v === 'string' ? v : fallback;
}

function getBoolProp(props: Record<string, string | boolean | string[]>, key: string, fallback: boolean): boolean {
  const v = props[key];
  return typeof v === 'boolean' ? v : fallback;
}

function getArrayProp(props: Record<string, string | boolean | string[]>, key: string, fallback: string[]): string[] {
  const v = props[key];
  return Array.isArray(v) ? v : fallback;
}

function renderFilterDropdown(props: Record<string, string | boolean | string[]>): string {
  const title = getStringProp(props, 'title', 'Filter');
  const options = getArrayProp(props, 'options', ['Option 1', 'Option 2', 'Option 3']);
  const multiSelect = getBoolProp(props, 'multiSelect', false);
  const inputType = multiSelect ? 'checkbox' : 'radio';

  const optionItems = options
    .map(
      (opt) =>
        `<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;border-bottom:1px solid ${THEME.border};font-size:14px;color:${THEME.text};">
          <input type="${inputType}" name="pf-filter" value="${esc(opt)}" style="accent-color:${THEME.green};" />${esc(opt)}
        </label>`
    )
    .join('\n');

  return `<div style="font-family:${THEME.font};background:${THEME.white};border:1px solid ${THEME.border};border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.12);min-width:220px;max-width:320px;overflow:hidden;">
  <div style="padding:10px 12px;background:${THEME.navy};color:${THEME.white};font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:space-between;">
    <span>${esc(title)}</span>
    <button data-pf-overlay-close style="background:none;border:none;color:${THEME.white};cursor:pointer;font-size:16px;line-height:1;">&times;</button>
  </div>
  <div>${optionItems}</div>
  <div style="padding:8px 12px;display:flex;justify-content:flex-end;gap:8px;">
    <button data-pf-overlay-close style="padding:6px 16px;border:1px solid ${THEME.border};border-radius:4px;background:${THEME.white};color:${THEME.text};cursor:pointer;font-size:13px;">Cancel</button>
    <button data-pf-overlay-close style="padding:6px 16px;border:none;border-radius:4px;background:${THEME.green};color:${THEME.white};cursor:pointer;font-size:13px;">Apply</button>
  </div>
</div>`;
}

function renderSuccessToast(props: Record<string, string | boolean | string[]>): string {
  const message = getStringProp(props, 'message', 'Operation completed successfully');
  const showIcon = getBoolProp(props, 'showIcon', true);
  const icon = showIcon
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${THEME.white}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : '';

  return `<div data-pf-overlay-close style="font-family:${THEME.font};display:flex;align-items:center;gap:10px;padding:12px 20px;background:${THEME.green};color:${THEME.white};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:300px;max-width:480px;font-size:14px;cursor:pointer;">
  ${icon}
  <span>${esc(message)}</span>
</div>`;
}

function renderErrorToast(props: Record<string, string | boolean | string[]>): string {
  const message = getStringProp(props, 'message', 'Something went wrong');
  const showIcon = getBoolProp(props, 'showIcon', true);
  const icon = showIcon
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${THEME.white}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
    : '';

  return `<div data-pf-overlay-close style="font-family:${THEME.font};display:flex;align-items:center;gap:10px;padding:12px 20px;background:${THEME.red};color:${THEME.white};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:300px;max-width:480px;font-size:14px;cursor:pointer;">
  ${icon}
  <span>${esc(message)}</span>
</div>`;
}

function renderConfirmationModal(props: Record<string, string | boolean | string[]>): string {
  const title = getStringProp(props, 'title', 'Confirm Action');
  const message = getStringProp(props, 'message', 'Are you sure you want to proceed?');
  const confirmLabel = getStringProp(props, 'confirmLabel', 'Confirm');
  const cancelLabel = getStringProp(props, 'cancelLabel', 'Cancel');
  const destructive = getBoolProp(props, 'destructive', false);
  const confirmColor = destructive ? THEME.red : THEME.green;

  return `<div style="font-family:${THEME.font};background:${THEME.white};border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.2);width:420px;max-width:90vw;overflow:hidden;">
  <div style="padding:20px 24px 0;">
    <h3 style="margin:0 0 8px;font-size:18px;font-weight:600;color:${THEME.navy};">${esc(title)}</h3>
    <p style="margin:0;font-size:14px;color:${THEME.textMuted};line-height:1.5;">${esc(message)}</p>
  </div>
  <div style="padding:20px 24px;display:flex;justify-content:flex-end;gap:8px;">
    <button data-pf-overlay-close style="padding:8px 20px;border:1px solid ${THEME.border};border-radius:4px;background:${THEME.white};color:${THEME.text};cursor:pointer;font-size:14px;">${esc(cancelLabel)}</button>
    <button data-pf-overlay-close style="padding:8px 20px;border:none;border-radius:4px;background:${confirmColor};color:${THEME.white};cursor:pointer;font-size:14px;font-weight:600;">${esc(confirmLabel)}</button>
  </div>
</div>`;
}

function renderInfoDialog(props: Record<string, string | boolean | string[]>): string {
  const title = getStringProp(props, 'title', 'Information');
  const message = getStringProp(props, 'message', 'Here is some important information.');
  const closeLabel = getStringProp(props, 'closeLabel', 'OK');

  return `<div style="font-family:${THEME.font};background:${THEME.white};border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.2);width:400px;max-width:90vw;overflow:hidden;">
  <div style="padding:20px 24px 0;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <h3 style="margin:0;font-size:18px;font-weight:600;color:${THEME.navy};">${esc(title)}</h3>
      <button data-pf-overlay-close style="background:none;border:none;cursor:pointer;font-size:20px;color:${THEME.textMuted};line-height:1;">&times;</button>
    </div>
    <p style="margin:12px 0 0;font-size:14px;color:${THEME.textMuted};line-height:1.5;">${esc(message)}</p>
  </div>
  <div style="padding:20px 24px;display:flex;justify-content:flex-end;">
    <button data-pf-overlay-close style="padding:8px 24px;border:none;border-radius:4px;background:${THEME.navy};color:${THEME.white};cursor:pointer;font-size:14px;font-weight:600;">${esc(closeLabel)}</button>
  </div>
</div>`;
}

const renderers: Record<TemplateId, (props: Record<string, string | boolean | string[]>) => string> = {
  filter_dropdown: renderFilterDropdown,
  success_toast: renderSuccessToast,
  error_toast: renderErrorToast,
  confirmation_modal: renderConfirmationModal,
  info_dialog: renderInfoDialog,
};

export function renderTemplate(config: TemplateConfig): string {
  const renderer = renderers[config.templateId];
  return renderer ? renderer(config.props) : '<div>Unknown template</div>';
}

export function getDefaultTemplateProps(templateId: TemplateId): Record<string, string | boolean | string[]> {
  switch (templateId) {
    case 'filter_dropdown':
      return { title: 'Filter', options: ['Option 1', 'Option 2', 'Option 3'], multiSelect: false };
    case 'success_toast':
      return { message: 'Operation completed successfully', showIcon: true, autoDismissMs: '3000' };
    case 'error_toast':
      return { message: 'Something went wrong', showIcon: true, autoDismissMs: '5000' };
    case 'confirmation_modal':
      return { title: 'Confirm Action', message: 'Are you sure you want to proceed?', confirmLabel: 'Confirm', cancelLabel: 'Cancel', destructive: false };
    case 'info_dialog':
      return { title: 'Information', message: 'Here is some important information.', closeLabel: 'OK' };
  }
}
