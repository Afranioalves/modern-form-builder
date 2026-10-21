import type { FormComponent } from '@modern-form/schema';
import { el } from '../dom/shared.js';

/** Rendered in place of a component whose `type` the registry doesn't recognize, or that is
 * acknowledged but not yet implemented (v1.1/v2 types: `dynamiclist`, `table`, `taglist`,
 * `expression`, `html`). Matches the graceful-degradation posture in SPECIFICATION.md section
 * 11.4: importing a form is never all-or-nothing - every sibling/ancestor still renders. */
export function renderUnsupportedField(component: FormComponent): HTMLElement {
  const root = el('div', { 'data-scope': 'unsupported', 'data-part': 'root', role: 'note' });
  root.className =
    'rounded-(--mf-radius-md) border border-dashed border-(--mf-color-border) ' +
    'px-(--mf-space-3) py-(--mf-space-2) text-(length:--mf-font-size-sm) text-(--mf-color-text-muted)';
  root.textContent = `Unsupported field type: "${component.type}"`;
  console.warn(`[modern-form] Unsupported component type "${component.type}" (id: ${component.id}); rendered as a placeholder.`);
  return root;
}
