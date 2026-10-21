import type { FormComponent, Validate } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import {
  BASE_INPUT_CLASSES,
  createDescription,
  createErrorContainer,
  createFieldRoot,
  createLabel,
  describedByIds,
  el,
  partClasses,
  updateErrorContainer,
} from '../dom/shared.js';
import type { DomRenderResult, RenderEnv } from '../dom/shared.js';

type KeyedTextLike = FormComponent & { key: string; validate?: Validate; defaultValue?: unknown };

export interface TextLikeFieldTypeOptions<T extends KeyedTextLike> {
  type: T['type'];
  label: string;
  inputTag: 'input' | 'textarea';
  inputType?: string;
  parseValue: (raw: string) => unknown;
  formatValue: (value: unknown) => string;
  extraAttrs?: (component: T) => Record<string, string>;
  create: (defaults?: Partial<T>) => T;
}

/**
 * Shared factory behind `textfield`, `textarea`, `number` and `datetime` (the `date`/`time`
 * subtypes): all four are "a native text-entry control bound to a single scalar value," differing
 * only in tag/input-type and value (de)serialization. Reduces four near-duplicate renderers to one
 * parameterized implementation plus a few lines per concrete type.
 */
export function createTextLikeFieldType<T extends KeyedTextLike>(
  env: RenderEnv,
  options: TextLikeFieldTypeOptions<T>,
): FieldTypeExtension<T> {
  const { type, label, inputTag, inputType, parseValue, formatValue, extraAttrs, create } = options;

  return {
    type,
    config: { label, keyed: true, group: 'input', create },
    render: ({ component, value, errors }) => {
      const scope = type;
      const inputId = `${env.idPrefix}-${component.id}`;
      const hasDescription = Boolean(component.description);
      const descId = hasDescription ? `${inputId}-desc` : undefined;
      const errorId = `${inputId}-error`;
      const required = Boolean(component.validate?.required);

      const root = createFieldRoot(scope, env);
      if (component.label) {
        root.appendChild(createLabel(scope, env, inputId, String(component.label), required));
      }

      const input = el(inputTag, { id: inputId, 'data-part': 'input' });
      if (inputTag === 'input' && inputType) {
        input.setAttribute('type', inputType);
      }
      input.className = partClasses(env, scope, 'input', BASE_INPUT_CLASSES);
      (input as HTMLInputElement).value = formatValue(value);
      (input as HTMLInputElement).disabled = Boolean(component.disabled);
      (input as HTMLInputElement).readOnly = Boolean(component.readonly);
      if (required) input.setAttribute('aria-required', 'true');
      input.setAttribute('aria-describedby', describedByIds(descId, errorId));
      if (errors.length > 0) input.setAttribute('aria-invalid', 'true');

      for (const [attrName, attrValue] of Object.entries(extraAttrs?.(component) ?? {})) {
        input.setAttribute(attrName, attrValue);
      }

      input.addEventListener(inputTag === 'textarea' ? 'input' : 'input', () => {
        env.onChange(component.key, parseValue((input as HTMLInputElement).value));
      });
      input.addEventListener('focus', () => env.onFocus?.(component));
      input.addEventListener('blur', () => env.onBlur?.(component));

      root.appendChild(input);

      if (descId) {
        root.appendChild(createDescription(scope, env, descId, String(component.description)));
      }

      const errorEl = createErrorContainer(scope, env, errorId);
      updateErrorContainer(errorEl, errors);
      root.appendChild(errorEl);

      const result: DomRenderResult = {
        el: root,
        update: ({ value: nextValue, errors: nextErrors, disabled, readonly }) => {
          if (document.activeElement !== input) {
            (input as HTMLInputElement).value = formatValue(nextValue);
          }
          if (nextErrors.length > 0) input.setAttribute('aria-invalid', 'true');
          else input.removeAttribute('aria-invalid');
          if (disabled !== undefined) (input as HTMLInputElement).disabled = disabled;
          if (readonly !== undefined) (input as HTMLInputElement).readOnly = readonly;
          updateErrorContainer(errorEl, nextErrors);
        },
        destroy: () => root.remove(),
      };

      return result;
    },
  };
}
