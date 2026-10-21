import type { CheckboxComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import {
  createDescription,
  createErrorContainer,
  createFieldRoot,
  describedByIds,
  el,
  partClasses,
  updateErrorContainer,
} from '../dom/shared.js';
import type { DomRenderResult, RenderEnv } from '../dom/shared.js';

export function createCheckboxFieldType(env: RenderEnv): FieldTypeExtension<CheckboxComponent> {
  const scope = 'checkbox';

  return {
    type: 'checkbox',
    config: {
      label: 'Checkbox',
      keyed: true,
      group: 'selection',
      create: (defaults) => ({ id: '', type: 'checkbox', key: '', ...defaults }),
    },
    render: ({ component, value, errors }) => {
      const inputId = `${env.idPrefix}-${component.id}`;
      const descId = component.description ? `${inputId}-desc` : undefined;
      const errorId = `${inputId}-error`;

      const root = createFieldRoot(scope, env);
      const row = el('div');
      row.className = 'flex items-center gap-(--mf-space-2)';

      const input = el('input', { type: 'checkbox', id: inputId, 'data-part': 'input' });
      input.className = partClasses(
        env,
        scope,
        'input',
        'h-4 w-4 rounded-(--mf-radius-sm) border-(--mf-color-border) text-(--mf-color-primary) focus:ring-(--mf-color-border-focus)',
      );
      input.checked = Boolean(value);
      input.disabled = Boolean(component.disabled);
      input.setAttribute('aria-describedby', describedByIds(descId, errorId));

      const label = el('label', { for: inputId, 'data-part': 'label' });
      label.className = partClasses(env, scope, 'label', 'text-(length:--mf-font-size-md) text-(--mf-color-text)');
      label.textContent = String(component.label ?? '');

      input.addEventListener('change', () => env.onChange(component.key, input.checked));
      input.addEventListener('focus', () => env.onFocus?.(component));
      input.addEventListener('blur', () => env.onBlur?.(component));

      row.append(input, label);
      root.appendChild(row);

      if (descId) root.appendChild(createDescription(scope, env, descId, String(component.description)));

      const errorEl = createErrorContainer(scope, env, errorId);
      updateErrorContainer(errorEl, errors);
      root.appendChild(errorEl);

      const result: DomRenderResult = {
        el: root,
        update: ({ value: nextValue, errors: nextErrors, disabled }) => {
          input.checked = Boolean(nextValue);
          if (disabled !== undefined) input.disabled = disabled;
          updateErrorContainer(errorEl, nextErrors);
        },
        destroy: () => root.remove(),
      };

      return result;
    },
  };
}
