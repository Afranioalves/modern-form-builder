import type { SelectComponent, SelectionOption } from '@modern-form/schema';
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

function resolvedOptions(values: SelectComponent['values']): SelectionOption[] {
  return Array.isArray(values) ? values : [];
}

/** Native `<select>` for v1 - free ARIA/keyboard support (SPECIFICATION.md section 10.6). A
 * searchable combobox variant (`searchable: true`) is deferred to v1.1 alongside `taglist`, which
 * needs the full APG combobox pattern. */
export function createSelectFieldType(env: RenderEnv): FieldTypeExtension<SelectComponent> {
  const scope = 'select';

  return {
    type: 'select',
    config: {
      label: 'Select',
      keyed: true,
      group: 'selection',
      create: (defaults) => ({ id: '', type: 'select', key: '', values: [], ...defaults }),
    },
    render: ({ component, value, errors }) => {
      const inputId = `${env.idPrefix}-${component.id}`;
      const descId = component.description ? `${inputId}-desc` : undefined;
      const errorId = `${inputId}-error`;
      const required = Boolean(component.validate?.required);

      const root = createFieldRoot(scope, env);
      if (component.label) {
        root.appendChild(createLabel(scope, env, inputId, String(component.label), required));
      }

      const select = el('select', { id: inputId, 'data-part': 'input' });
      select.className = partClasses(env, scope, 'input', BASE_INPUT_CLASSES);
      select.disabled = Boolean(component.disabled);
      if (required) select.setAttribute('aria-required', 'true');
      select.setAttribute('aria-describedby', describedByIds(descId, errorId));

      const placeholder = el('option', { value: '' });
      placeholder.textContent = '—';
      select.appendChild(placeholder);

      for (const option of resolvedOptions(component.values)) {
        const optionEl = el('option', { value: option.value });
        optionEl.textContent = option.label;
        select.appendChild(optionEl);
      }
      select.value = typeof value === 'string' ? value : '';

      select.addEventListener('change', () => env.onChange(component.key, select.value || undefined));
      select.addEventListener('focus', () => env.onFocus?.(component));
      select.addEventListener('blur', () => env.onBlur?.(component));

      root.appendChild(select);

      if (descId) root.appendChild(createDescription(scope, env, descId, String(component.description)));

      const errorEl = createErrorContainer(scope, env, errorId);
      updateErrorContainer(errorEl, errors);
      root.appendChild(errorEl);

      const result: DomRenderResult = {
        el: root,
        update: ({ value: nextValue, errors: nextErrors, disabled }) => {
          select.value = typeof nextValue === 'string' ? nextValue : '';
          if (disabled !== undefined) select.disabled = disabled;
          updateErrorContainer(errorEl, nextErrors);
        },
        destroy: () => root.remove(),
      };

      return result;
    },
  };
}
