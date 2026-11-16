/**
 * The copy-paste prompt shown by the in-app "How to prepare screens" dialog.
 *
 * Enhancement Mode only detects the Current/Enhanced toggle from the invisible
 * `data-enhanced` / `data-current-only` markers in the uploaded HTML. The reliable
 * way to get correctly-marked, content-only HTML is to have an AI assistant
 * (e.g. Claude) generate it from this prompt — so we surface the prompt in-app.
 *
 * NOTE: no backticks inside the string — it is itself a template literal.
 */
export const ENHANCEMENT_GUIDELINES_PROMPT = `You are generating standalone HTML screens for "ProtoFlow" Enhancement Mode.
Each screen shows a "before vs. after" of a proposed change. ProtoFlow switches
between the two states using two invisible HTML markers, so you MUST add them.

## The dual-marker system

| Attribute            | Current view            | Enhanced view                 |
|----------------------|-------------------------|-------------------------------|
| data-enhanced        | hidden                  | visible (ProtoFlow adds glow) |
| data-current-only    | visible (marker removed)| hidden                        |
| (no marker)          | visible                 | visible                       |

- Mark brand-new elements (only in the "after") with  data-enhanced
- Mark originals that are being replaced with  data-current-only , and add the
  replacement right after it marked with  data-enhanced  (a pair)
- Leave anything unchanged with NO marker

## Hard rules

1. Output ONE complete HTML file per screen. You may generate several screens at once.
2. Content ONLY — do NOT include a sidebar, top header, footer, or any app shell.
   Generate just the page content (what would sit inside the main content area).
   ProtoFlow wraps it in the app shell automatically; a shell here breaks layout.
3. Markers are invisible. Do NOT add visible "NEW" badges/labels to show a change.
4. Do NOT add CSS classes like "enh-highlight-c" and do NOT add any toggle buttons
   or mode switchers — ProtoFlow generates the toolbar and the glow.
5. Put all CSS inline in a <style> tag and all JS in a <script> tag so each file
   works when opened directly in a browser. ProtoFlow preserves your <script> blocks.
6. Give real ids or stable classes to buttons/links you expect to wire up later, so
   ProtoFlow's element picker can target them reliably.
7. Name files descriptively, e.g. orders-list.html, order-detail.html.

## Marker patterns (generic examples)

New element (exists only in the enhanced version):
   <tr>Existing row</tr>
   <tr data-enhanced><td>Brand new row added by the enhancement</td></tr>

Replaced element (original swapped for a new version):
   <!-- original: shown in Current, hidden in Enhanced -->
   <div data-current-only class="field"><label>Status</label><span>Open</span></div>
   <!-- replacement: hidden in Current, shown (with glow) in Enhanced -->
   <div data-enhanced class="field"><label>Status</label><select><option>Open</option><option>On hold</option></select></div>

New section/panel:
   <div data-enhanced class="panel"><h3>New summary panel</h3><p>Whole panel is new.</p></div>

Unchanged element (no marker):
   <div class="field"><label>Owner</label><span>Alex Kim</span></div>

## Do NOT
- Add data-enhanced to every child when marking the wrapper is enough (avoids overlapping glows).
- Use data-current-only without a matching data-enhanced replacement (the content would just vanish in Enhanced view).

## Now tell me your screens
Describe each screen's CURRENT state and what the ENHANCEMENT changes. Example:

   Screen 1 — Orders List (orders-list.html)
   Current: a table of orders with columns Order #, Customer, Status, Total.
   Enhancement: add a new "Priority" column (new column).

   Screen 2 — Order Detail (order-detail.html)
   Current: read-only order fields + an activity log table.
   Enhancement: make the Status field an editable dropdown (replaces the read-only value),
   and add a new "SLA due" row in the activity log.

Then generate the HTML file(s) following every rule above.`;
