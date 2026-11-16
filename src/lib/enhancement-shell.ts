/**
 * App Enhancement Shell — CSS, HTML, and JS template strings.
 * A generic app shell used to frame exported enhancement demos.
 */

import { ES5_ESCAPE_HTML_FN } from './html-escape';

// ─── CSS ───────────────────────────────────────────────────────────

export const SHELL_CSS = `
  :root {
    --brand:    #FFC01F;
    --brand-lt: #FFD24D;
    --brand-dk: #E5A100;
    --amber:    #F5A623;
    --amber-dk: #B9770A;
    --ink:      #2A2410;
    --ink-2:    rgba(42,36,16,0.62);
    --ink-3:    rgba(42,36,16,0.40);
    --surface:  #FFFFFF;
    --canvas:   #FAFAF7;
    --border:   #ECEBE3;
    --text-1:   #1A1D24;
    --text-2:   #4A5568;
    --text-3:   #8A96A8;
    --link:     #B9770A;
    --header-h: 56px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--canvas); overflow: hidden; }
  body { display: flex; flex-direction: column; }

  /* TOGGLE BAR — modern dark bar */
  #toggle-bar {
    height: 40px;
    background: #14151A;
    display: flex; align-items: center; justify-content: flex-end;
    padding: 0 16px; flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    gap: 10px;
  }
  .tgl-label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 500; letter-spacing: 0.4px; }
  .tgl-right { display: flex; align-items: center; gap: 10px; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.08); }
  .tgl-hint  { font-size: 10px; color: rgba(255,255,255,0.32); letter-spacing: 0.2px; }
  .tgl-pill  { display: flex; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 100px; padding: 3px; gap: 2px; }
  .tgl-pill button { border: none; border-radius: 100px; padding: 5px 15px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.22s cubic-bezier(.4,0,.2,1); letter-spacing: 0.3px; display: flex; align-items: center; gap: 5px; white-space: nowrap; font-family: inherit; }
  #btn-current.on   { background: #FFFFFF; color: #14151A; box-shadow: 0 1px 6px rgba(0,0,0,0.35); }
  #btn-current.off  { background: transparent; color: rgba(255,255,255,0.4); }
  #btn-enhanced.on  { background: linear-gradient(135deg, #FFD24D 0%, #FFB300 100%); color: #201A08; box-shadow: 0 2px 12px rgba(255,183,0,0.45); }
  #btn-enhanced.off { background: transparent; color: rgba(255,255,255,0.4); }
  #btn-current.off:hover, #btn-enhanced.off:hover { color: rgba(255,255,255,0.7); }
  .tgl-dot  { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.6; flex-shrink: 0; }
  .tgl-spark { width: 12px; height: 12px; opacity: 0.9; flex-shrink: 0; }

  /* ENHANCEMENT TITLE SECTION */
  .enh-title-section { display: none; align-items: center; gap: 8px; margin-right: auto; min-width: 0; overflow: hidden; }
  .enh-title-section.visible { display: flex; }
  .enh-title-text { font-size: 11.5px; color: rgba(255,255,255,0.92); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px; }
  .enh-ref-tag { font-size: 9px; color: #FFD24D; font-weight: 600; background: rgba(255,183,0,0.12); border: 1px solid rgba(255,183,0,0.30); border-radius: 4px; padding: 2px 8px; white-space: nowrap; letter-spacing: 0.4px; }
  .enh-desc-btn { border: 1px solid rgba(255,183,0,0.45); border-radius: 5px; background: rgba(255,183,0,0.12); color: #FFD24D; font-size: 10px; font-weight: 600; padding: 4px 11px; cursor: pointer; white-space: nowrap; letter-spacing: 0.2px; transition: all 0.15s; font-family: inherit; }
  .enh-desc-btn:hover { background: rgba(255,183,0,0.25); color: #FFE08A; border-color: rgba(255,183,0,0.7); }

  /* PAGINATION */
  #pagination-bar { display: none; align-items: center; gap: 6px; margin-left: 6px; padding-left: 12px; border-left: 1px solid rgba(255,255,255,0.14); }
  #pagination-bar.visible { display: flex; }
  .pgn-label { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 500; letter-spacing: 0.2px; }
  .pgn-arrow { width: 24px; height: 24px; border: none; border-radius: 6px; background: rgba(255,183,0,0.14); color: #FFD24D; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; font-weight: 600; transition: all 0.15s; }
  .pgn-arrow:hover { background: rgba(255,183,0,0.28); color: #FFE08A; }
  .pgn-arrow:disabled { opacity: 0.25; cursor: default; }
  .pgn-arrow:disabled:hover { background: rgba(255,183,0,0.14); color: #FFD24D; }
  .pgn-input { width: 32px; height: 24px; border: 1px solid rgba(255,183,0,0.30); border-radius: 6px; background: rgba(255,183,0,0.10); color: #FFE08A; text-align: center; font-size: 12px; font-weight: 700; outline: none; font-family: inherit; }
  .pgn-input:focus { border-color: #FFC01F; background: rgba(255,183,0,0.18); }

  /* SHELL */
  #shell { flex: 1; display: flex; overflow: hidden; min-height: 0; }

  /* SIDEBAR — modern yellow */
  #sidebar { width: 60px; background: linear-gradient(180deg, #FFD24D 0%, #FFC01F 100%); display: flex; flex-direction: column; align-items: stretch; flex-shrink: 0; overflow: hidden; transition: width 0.22s cubic-bezier(.4,0,.2,1); z-index: 100; position: relative; box-shadow: 1px 0 3px rgba(0,0,0,0.06); }
  #sidebar:hover { width: 216px; }
  #sidebar::-webkit-scrollbar { display: none; }
  .sb-inner { display: flex; flex-direction: column; height: 100%; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; width: 216px; padding: 8px; gap: 2px; }
  .sb-inner::-webkit-scrollbar { display: none; }
  .sb-hamburger { height: 40px; min-height: 40px; display: flex; align-items: center; padding-left: 10px; color: rgba(42,36,16,0.7); cursor: pointer; flex-shrink: 0; margin-bottom: 4px; }
  .sb-hamburger:hover { color: var(--ink); }
  .sb-hamburger svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; flex-shrink: 0; }
  .si { height: 40px; display: flex; align-items: center; padding: 0 0 0 10px; gap: 13px; cursor: pointer; color: rgba(42,36,16,0.72); transition: background .15s, color .15s; flex-shrink: 0; white-space: nowrap; border-radius: 9px; }
  .si:hover { background: rgba(0,0,0,0.06); color: var(--ink); }
  .si.active { background: rgba(0,0,0,0.11); color: var(--ink); font-weight: 600; }
  .si svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
  .si-label { font-size: 12.5px; font-weight: 500; letter-spacing: 0.1px; opacity: 0; transition: opacity 0.1s; pointer-events: none; white-space: nowrap; }
  .si.active .si-label { font-weight: 600; }
  #sidebar:hover .si-label { opacity: 1; transition: opacity 0.15s 0.12s; }
  .sdiv { height: 1px; background: rgba(0,0,0,0.08); margin: 4px 8px; flex-shrink: 0; }
  .sb-bottom-arrow { height: 36px; display: flex; align-items: center; justify-content: center; color: rgba(42,36,16,0.5); cursor: pointer; flex-shrink: 0; border-top: 1px solid rgba(0,0,0,0.07); margin-top: auto; }
  .sb-bottom-arrow svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

  /* MAIN */
  #main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

  /* HEADER — modern yellow */
  #header { height: var(--header-h); background: linear-gradient(180deg, #FFD24D 0%, #FFC01F 100%); display: flex; align-items: center; padding: 0 18px; gap: 14px; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
  .logo { display: flex; align-items: center; gap: 9px; text-decoration: none; flex-shrink: 0; }
  .logo-mark { width: 30px; height: 30px; border-radius: 9px; background: var(--ink); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.18); }
  .logo-mark svg { width: 16px; height: 16px; fill: #FFC01F; }
  .logo-wm { font-size: 18px; font-weight: 800; color: var(--ink); letter-spacing: 1px; font-style: normal; line-height: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .logo-tm { font-size: 8px; color: rgba(42,36,16,0.55); vertical-align: super; line-height: 1; font-weight: 500; margin-top: 1px; }
  .srch { flex: 1; max-width: 500px; position: relative; display: flex; align-items: center; margin: 0 auto; }
  .srch input { width: 100%; height: 34px; background: rgba(255,255,255,0.35); border: 1.5px solid rgba(42,36,16,0.28); border-radius: 20px; padding: 0 34px 0 14px; color: var(--ink); font-size: 12.5px; outline: none; transition: border-color .2s, background .2s; }
  .srch input::placeholder { color: rgba(42,36,16,0.5); font-size: 12.5px; }
  .srch input:focus { border-color: rgba(42,36,16,0.55); background: rgba(255,255,255,0.6); }
  .srch-icons { position: absolute; right: 10px; display: flex; align-items: center; gap: 6px; color: rgba(42,36,16,0.6); pointer-events: none; }
  .srch-icons svg { width: 13px; height: 13px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .hdr-r { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .hib { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid rgba(42,36,16,0.4); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink); font-size: 13px; font-weight: 600; transition: border-color .2s, background .2s; flex-shrink: 0; }
  .hib:hover { border-color: var(--ink); background: rgba(0,0,0,0.08); }
  .hib svg { width: 13px; height: 13px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .loc { line-height: 1.25; text-align: right; }
  .loc-c { font-size: 11.5px; font-weight: 600; color: var(--ink); }
  .loc-t { font-size: 10px; color: rgba(42,36,16,0.6); letter-spacing: 0.2px; }
  .av { width: 34px; height: 34px; border-radius: 50%; background: var(--ink); display: flex; align-items: center; justify-content: center; color: #FFC01F; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .ub { line-height: 1.3; }
  .ub-n { font-size: 11.5px; font-weight: 600; color: var(--ink); }
  .ub-r { font-size: 10px; color: rgba(42,36,16,0.6); }
  .chv { color: rgba(42,36,16,0.55); display: flex; align-items: center; cursor: pointer; margin-left: -4px; }
  .chv svg { width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

  /* CONTENT */
  #content { flex: 1; overflow-y: auto; background: var(--surface); min-height: 0; display: flex; flex-direction: column; }

  /* VIEW TOGGLE — single DOM, CSS-based visibility */
  #content:not(.view-enhanced) [data-enhanced] { display: none !important; }
  #content.view-enhanced [data-current-only] { display: none !important; }

  /* FOOTER */
  #footer { height: 26px; background: var(--surface); border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 18px; flex-shrink: 0; position: relative; }
  .fl { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-3); font-weight: 500; }
  .fl-logo { font-size: 10px; font-weight: 800; color: var(--ink); letter-spacing: 0.4px; font-style: normal; }
  .fl-tm { font-size: 7px; vertical-align: super; color: var(--text-3); }
  .fc { position: absolute; left: 50%; transform: translateX(-50%); font-size: 10px; color: var(--text-3); white-space: nowrap; }
  .fr { font-size: 10px; font-weight: 600; color: var(--amber-dk); letter-spacing: 0.2px; }

  /* GLOW SYSTEM — only visible in Enhanced view */
  #content.view-enhanced .enh-highlight-c {
    transition: border-left 0.25s, background 0.25s;
    position: relative;
    border-left: 3px solid rgba(245,166,35,0.45) !important;
    background: rgba(255,200,31,0.12) !important;
  }
  #content.view-enhanced .enh-highlight-c > td { background: rgba(255,200,31,0.12) !important; }
  /* Active glow — stronger when the specific enhancement is selected */
  #content.view-enhanced .enh-highlight-c.active { border-left: 3px solid #F5A623 !important; background: rgba(255,200,31,0.28) !important; }
  #content.view-enhanced .enh-highlight-c.active > td { background: rgba(255,200,31,0.28) !important; }
  #content.view-enhanced .enh-highlight-c.active::before {
    content: '';
    position: absolute;
    left: -12px; top: 50%;
    transform: translateY(-50%);
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #F5A623;
    z-index: 5;
    box-shadow: 0 0 0 0 rgba(245,166,35,0.5);
    animation: enhPulse 2s ease-in-out infinite;
  }
  @keyframes enhPulse {
    0%   { box-shadow: 0 0 0 0 rgba(245,166,35,0.5); }
    50%  { box-shadow: 0 0 0 18px rgba(245,166,35,0); }
    100% { box-shadow: 0 0 0 0 rgba(245,166,35,0); }
  }
  #content.view-enhanced tr.enh-highlight-c.active::before { display: none; }
  #content.view-enhanced tr.enh-highlight-c.active > td:first-child { position: relative; }
  #content.view-enhanced tr.enh-highlight-c.active > td:first-child::before {
    content: '';
    position: absolute;
    left: -12px; top: 50%;
    transform: translateY(-50%);
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #F5A623;
    z-index: 5;
    box-shadow: 0 0 0 0 rgba(245,166,35,0.5);
    animation: enhPulse 2s ease-in-out infinite;
  }

  /* DESCRIPTION MODAL */
  .enh-desc-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 800; align-items: center; justify-content: center; }
  .enh-desc-backdrop.open { display: flex; }
  .enh-desc-modal { background: #fff; border-radius: 12px; width: 480px; max-width: 92vw; box-shadow: 0 20px 60px rgba(0,0,0,0.25); overflow: hidden; animation: enhDescIn 0.2s ease-out; }
  @keyframes enhDescIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
  .enh-desc-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; background: #FFF8E6; border-bottom: 1px solid #FBE7B5; }
  .enh-desc-header-icon { width: 28px; height: 28px; border-radius: 7px; background: #F5A623; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .enh-desc-header-icon svg { width: 15px; height: 15px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .enh-desc-header-title { font-size: 14px; font-weight: 600; color: var(--ink); flex: 1; min-width: 0; }
  .enh-desc-header-ref { font-size: 10px; font-weight: 600; color: #B9770A; background: #FFF4D6; border: 1px solid #FBE0A0; border-radius: 4px; padding: 2px 8px; white-space: nowrap; }
  .enh-desc-close { width: 28px; height: 28px; border: none; border-radius: 6px; background: rgba(0,0,0,0.06); color: var(--text-2); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; font-weight: 600; flex-shrink: 0; transition: background 0.15s; }
  .enh-desc-close:hover { background: rgba(0,0,0,0.12); }
  .enh-desc-body { padding: 20px; }
  .enh-desc-text { font-size: 13px; line-height: 1.65; color: var(--text-1); margin-bottom: 16px; }
  .enh-desc-field { margin-bottom: 12px; }
  .enh-desc-field-label { font-size: 10px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .enh-desc-field-value { font-size: 12.5px; line-height: 1.6; color: var(--text-2); }
  .enh-desc-changes-title { margin: 0 0 8px; font-size: 11px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: 0.5px; }
  .enh-desc-changes-list { margin: 0 0 14px; padding: 0; list-style: none; }
  .enh-desc-changes-list li { font-size: 12px; line-height: 1.55; color: var(--text-2); margin-bottom: 5px; }
  .enh-desc-changes-list li strong { color: var(--text-1); }
  .enh-desc-config { margin: 12px 0 0; border: 1px solid #FBE7B5; border-radius: 6px; overflow: hidden; }
  .enh-desc-config-path { background: #FFFBF0; padding: 5px 12px; font-size: 10px; color: var(--text-3); border-bottom: 1px solid #FBE7B5; }
  .enh-desc-config-row { padding: 7px 12px; display: flex; align-items: center; gap: 8px; background: #fff; }
  .enh-desc-config-label { font-size: 11px; color: var(--text-1); font-weight: 500; flex: 1; }
  .enh-desc-config-info { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid #F5A623; color: #B9770A; font-size: 8px; font-weight: 700; font-style: italic; font-family: Georgia, serif; }
  .enh-desc-config-toggle { display: flex; gap: 0; }
  .enh-desc-config-yes { display: inline-flex; align-items: center; padding: 2px 8px; font-size: 9px; font-weight: 700; background: #F5A623; color: #201A08; border-radius: 3px 0 0 3px; }
  .enh-desc-config-no  { display: inline-flex; align-items: center; padding: 2px 8px; font-size: 9px; font-weight: 600; background: #fff; color: var(--text-2); border: 1px solid #E4D9BE; border-left: none; border-radius: 0 3px 3px 0; }
  .enh-desc-footer { padding: 12px 20px; background: #FFFBF0; border-top: 1px solid var(--border); font-size: 11px; color: var(--text-3); }
  .enh-desc-footer strong { color: var(--text-2); }

  .hidden { display: none !important; }
`;

// ─── SIDEBAR HTML (with dynamic active item) ───────────────────────

interface SidebarItem { label: string; icon: string; }

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Home', icon: '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/>' },
  { label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
  { label: 'Projects', icon: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>' },
  { label: 'Inventory', icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' },
  { label: 'Reports', icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
  { label: 'Tasks', icon: '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>' },
  { label: 'Documents', icon: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>' },
  { label: 'Workflows', icon: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>' },
  { label: 'Users', icon: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
  { label: 'Schedule', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { label: 'Analytics', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><polyline points="2 20 22 20"/>' },
  { label: 'Settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
];

export function buildSidebarHtml(activeItem: string): string {
  const items = SIDEBAR_ITEMS.map((si) => {
    const cls = si.label === activeItem ? 'si active' : 'si';
    return `<div class="${cls}"><svg viewBox="0 0 24 24">${si.icon}</svg><span class="si-label">${si.label}</span></div>`;
  }).join('\n      ');

  return `
  <nav id="sidebar">
    <div class="sb-inner">
      <div class="sb-hamburger">
        <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </div>
      ${items}
      <div class="sb-bottom-arrow">
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
  </nav>`;
}

// ─── TOGGLE BAR HTML ───────────────────────────────────────────────

export const TOGGLE_BAR_HTML = `
<div id="toggle-bar">
  <div class="enh-title-section" id="enh-title-section">
    <span class="enh-title-text" id="enh-title-text"></span>
    <span class="enh-ref-tag" id="enh-ref-tag"></span>
    <button class="enh-desc-btn" onclick="openEnhDescModal()">Description</button>
  </div>
  <div id="pagination-bar">
    <button class="pgn-arrow" onclick="pgnPrev()" id="pgn-prev" title="Previous enhancement">&#8249;</button>
    <span class="pgn-label">Enhancement</span>
    <input class="pgn-input" id="pgn-input" type="text" value="1" onkeydown="if(event.key==='Enter')pgnGo()">
    <span class="pgn-label">of <span id="pgn-total"></span></span>
    <button class="pgn-arrow" onclick="pgnNext()" id="pgn-next" title="Next enhancement">&#8250;</button>
  </div>
  <span class="tgl-label" id="screen-label"></span>
  <div class="tgl-right">
    <span class="tgl-hint">Prototype view</span>
    <div class="tgl-pill">
      <button id="btn-current" class="on" onclick="setView('current')">
        <span class="tgl-dot"></span>
        Current
      </button>
      <button id="btn-enhanced" class="off" onclick="setView('enhanced')">
        <svg class="tgl-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        Enhanced
      </button>
    </div>
  </div>
</div>`;

// ─── HEADER HTML ───────────────────────────────────────────────────

export const HEADER_HTML = `
    <header id="header">
      <div class="logo">
        <span class="logo-mark"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg></span>
        <span class="logo-wm">LOGO</span>
      </div>
      <div class="srch">
        <input type="text" placeholder="Search...">
        <span class="srch-icons">
          <svg viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
      </div>
      <div class="hdr-r">
        <div class="hib">?</div>
        <div class="hib">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="loc">
          <div class="loc-c">New York</div>
          <div class="loc-t" id="clock">--:-- --</div>
        </div>
        <div class="av">AK</div>
        <div class="ub">
          <div class="ub-n">Alex Kim</div>
          <div class="ub-r">Product Analyst</div>
        </div>
        <div class="chv"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
    </header>`;

// ─── FOOTER HTML ───────────────────────────────────────────────────

export const FOOTER_HTML = `
<div id="footer">
  <div class="fl"><span class="fl-logo">LOGO</span></div>
  <div class="fc">&copy; 2026 Company Name. All rights reserved.</div>
  <div class="fr">Prototype</div>
</div>`;

// ─── DESCRIPTION MODAL HTML ───────────────────────────────────────

export const DESC_MODAL_HTML = `
<div class="enh-desc-backdrop" id="enh-desc-backdrop" onclick="if(event.target===this)closeEnhDescModal()">
  <div class="enh-desc-modal">
    <div class="enh-desc-header">
      <span class="enh-desc-header-icon">
        <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </span>
      <span class="enh-desc-header-title" id="enh-desc-title"></span>
      <span class="enh-desc-header-ref"   id="enh-desc-ref"></span>
      <button class="enh-desc-close" onclick="closeEnhDescModal()">&times;</button>
    </div>
    <div class="enh-desc-body">
      <div class="enh-desc-text" id="enh-desc-text"></div>
      <div id="enh-desc-changes-wrap"></div>
      <div class="enh-desc-field">
        <div class="enh-desc-field-label">Purpose</div>
        <div class="enh-desc-field-value" id="enh-desc-purpose"></div>
      </div>
      <div class="enh-desc-field">
        <div class="enh-desc-field-label">Problem Solved</div>
        <div class="enh-desc-field-value" id="enh-desc-problem"></div>
      </div>
      <div id="enh-desc-config-wrap"></div>
    </div>
    <div class="enh-desc-footer" id="enh-desc-client"></div>
  </div>
</div>`;

// ─── CORE JS (ES5/var for max browser compat) ─────────────────────

export function buildCoreJs(enhancementsJson: string, allScreenIds: string[]): string {
  const screenIdsStr = allScreenIds.map((id) => `'${id}'`).join(', ');

  return `
  ${ES5_ESCAPE_HTML_FN}

  var currentView = 'current';

  function updateClock() {
    var now = new Date();
    var h = now.getHours(), m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (!h) h = 12;
    var ms = m < 10 ? '0' + m : '' + m;
    document.getElementById('clock').textContent = h + ':' + ms + ' ' + ampm + '\\u00A0\\u00A0IST';
  }
  updateClock();
  setInterval(updateClock, 30000);

  function setView(mode) {
    currentView = mode;
    document.getElementById('btn-current').className  = mode === 'current'  ? 'on' : 'off';
    document.getElementById('btn-enhanced').className = mode === 'enhanced' ? 'on' : 'off';
    applyEnhancedMode();
  }

  function applyEnhancedMode() {
    var isEnhanced = (currentView === 'enhanced');
    var hasEnh = ENHANCEMENTS.length > 0;
    var pgnBar   = document.getElementById('pagination-bar');
    var enhTitle = document.getElementById('enh-title-section');
    if (pgnBar)   { (isEnhanced && hasEnh) ? pgnBar.classList.add('visible')   : pgnBar.classList.remove('visible'); }
    if (enhTitle) { (isEnhanced && hasEnh) ? enhTitle.classList.add('visible') : enhTitle.classList.remove('visible'); }

    /* Toggle view-enhanced class on #content — CSS handles show/hide of markers */
    var contentEl = document.getElementById('content');
    if (contentEl) {
      if (isEnhanced) contentEl.classList.add('view-enhanced');
      else contentEl.classList.remove('view-enhanced');
    }

    if (isEnhanced) {
      pgnUpdateUI();
    } else {
      var activeH = document.querySelectorAll('.enh-highlight-c.active');
      for (var j = 0; j < activeH.length; j++) { activeH[j].classList.remove('active'); }
    }
  }

  var ENHANCEMENTS = ${enhancementsJson};

  document.getElementById('pgn-total').textContent = ENHANCEMENTS.length;

  var pgnCurrentEnh = 1;

  function pgnUpdateUI() {
    var enh = ENHANCEMENTS[pgnCurrentEnh - 1];
    if (!enh) return;
    var inp = document.getElementById('pgn-input');
    if (inp) inp.value = pgnCurrentEnh;
    var prev = document.getElementById('pgn-prev');
    var next = document.getElementById('pgn-next');
    if (prev) prev.disabled = (pgnCurrentEnh <= 1);
    if (next) next.disabled = (pgnCurrentEnh >= ENHANCEMENTS.length);
    var titleEl = document.getElementById('enh-title-text');
    var refEl   = document.getElementById('enh-ref-tag');
    if (titleEl) titleEl.textContent = enh.title;
    if (refEl)   refEl.textContent   = enh.ref;
    pgnNavigateToScreen(enh);
    applyHighlights(enh.id);
  }

  function pgnPrev() {
    if (pgnCurrentEnh > 1) { pgnCurrentEnh--; pgnUpdateUI(); }
  }

  function pgnNext() {
    if (pgnCurrentEnh < ENHANCEMENTS.length) { pgnCurrentEnh++; pgnUpdateUI(); }
  }

  function pgnGo() {
    var inp = document.getElementById('pgn-input');
    var val = parseInt(inp.value, 10);
    if (isNaN(val) || val < 1 || val > ENHANCEMENTS.length) { inp.value = pgnCurrentEnh; return; }
    pgnCurrentEnh = val;
    pgnUpdateUI();
  }

  function pgnNavigateToScreen(enh) {
    var allScreenIds = [${screenIdsStr}];
    for (var i = 0; i < allScreenIds.length; i++) {
      var el = document.getElementById(allScreenIds[i]);
      if (el) el.style.display = 'none';
    }
    var target = document.getElementById(enh.screen);
    if (target) target.style.display = 'flex';
  }

  function applyHighlights(enhNum) {
    var all = document.querySelectorAll('.enh-highlight-c.active');
    for (var i = 0; i < all.length; i++) { all[i].classList.remove('active'); }
    var targets = document.querySelectorAll('.enh-highlight-c[data-enh="' + enhNum + '"]');
    for (var j = 0; j < targets.length; j++) { targets[j].classList.add('active'); }
    if (targets.length) {
      var scrollTarget = targets[0];
      for (var k = 0; k < targets.length; k++) {
        if (targets[k].offsetParent !== null) { scrollTarget = targets[k]; break; }
      }
      setTimeout(function() {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }

  function openEnhDescModal() {
    var enh = ENHANCEMENTS[pgnCurrentEnh - 1];
    if (!enh) return;
    document.getElementById('enh-desc-title').textContent   = enh.title;
    document.getElementById('enh-desc-ref').textContent     = enh.ref;
    document.getElementById('enh-desc-text').textContent    = enh.desc;
    document.getElementById('enh-desc-purpose').textContent = enh.purpose;
    document.getElementById('enh-desc-problem').textContent = enh.problem;
    document.getElementById('enh-desc-client').innerHTML    = '<strong>Client:</strong> ' + pfEscapeHtml(enh.client);
    var changesWrap = document.getElementById('enh-desc-changes-wrap');
    if (enh.changes && enh.changes.length) {
      var html = '<div class="enh-desc-changes-title">What changes from current behavior:</div><ol class="enh-desc-changes-list">';
      for (var i = 0; i < enh.changes.length; i++) {
        html += '<li><strong>' + (i + 1) + '. ' + pfEscapeHtml(enh.changes[i].label) + '</strong> ' + pfEscapeHtml(enh.changes[i].text) + '</li>';
      }
      html += '</ol>';
      changesWrap.innerHTML = html;
      changesWrap.style.display = '';
    } else {
      changesWrap.innerHTML = '';
      changesWrap.style.display = 'none';
    }
    var configWrap = document.getElementById('enh-desc-config-wrap');
    if (enh.config) {
      configWrap.innerHTML =
        '<div class="enh-desc-config">' +
          '<div class="enh-desc-config-path"><span style="opacity:0.7">Configuration:</span> ' + pfEscapeHtml(enh.config.path) + '</div>' +
          '<div class="enh-desc-config-row">' +
            '<span class="enh-desc-config-label">' + pfEscapeHtml(enh.config.setting) + '</span>' +
            '<span class="enh-desc-config-info">i</span>' +
            '<div class="enh-desc-config-toggle"><span class="enh-desc-config-yes">Yes</span><span class="enh-desc-config-no">No</span></div>' +
          '</div>' +
        '</div>';
      configWrap.style.display = '';
    } else {
      configWrap.innerHTML = '';
      configWrap.style.display = 'none';
    }
    document.getElementById('enh-desc-backdrop').classList.add('open');
  }

  function closeEnhDescModal() {
    document.getElementById('enh-desc-backdrop').classList.remove('open');
  }
`;
}
