import { isFeelExpression } from '@modern-form/schema';
import type { FormComponent, SelectionOption } from '@modern-form/schema';
import type { DataContext } from './DataContext.js';
import { evaluateBooleanExpression, evaluateFeelExpression, evaluateToggleOrFeel } from './evaluateExpression.js';

/**
 * Produces a shallow copy of `component` with every "toggle-or-FEEL" field (label, description,
 * disabled, readonly, and the handful of type-specific ones: `text`, `image.source`, dynamic
 * `values`) resolved to a plain literal value against the current `DataContext`. The DOM
 * rendering layer (`@modern-form/renderer`) only ever sees resolved, literal values - it does
 * not need to know FEEL/expressions exist at all (SPECIFICATION.md sections 4.1 and 6).
 */
export function resolveComponentForRender<T extends FormComponent>(component: T, ctx: DataContext): T {
  const resolved: FormComponent = {
    ...component,
    label: component.label !== undefined ? evaluateToggleOrFeel(component.label, ctx, '') : undefined,
    description:
      component.description !== undefined ? evaluateToggleOrFeel(component.description, ctx, '') : undefined,
    disabled: evaluateBooleanExpression(component.disabled, ctx),
    readonly: evaluateBooleanExpression(component.readonly, ctx),
  };

  if (resolved.type === 'text') {
    resolved.text = evaluateToggleOrFeel(resolved.text, ctx, '');
  }

  if (resolved.type === 'image') {
    resolved.source = evaluateToggleOrFeel(resolved.source, ctx, '');
  }

  if (
    resolved.type === 'radio' ||
    resolved.type === 'select' ||
    resolved.type === 'checklist' ||
    resolved.type === 'taglist'
  ) {
    if (isFeelExpression(resolved.values)) {
      const { value } = evaluateFeelExpression(resolved.values.slice(1), ctx);
      resolved.values = Array.isArray(value) ? (value as SelectionOption[]) : [];
    }
  }

  return resolved as T;
}
