import type { ChecklistComponent, SelectionOption } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import {
  createDescription,
  createErrorContainer,
  createFieldRoot,
  el,
  partClasses,
  updateErrorContainer,
} from '../dom/shared.js';
import type { DomRenderResult, RenderEnv } from '../dom/shared.js';

function resolvedOptions(values: ChecklistComponent['values']): SelectionOption[] {
  return Array.isArray(values) ? values : [];
}

export function createChecklistFieldType(env: RenderEnv): FieldTypeExtension<ChecklistComponent> {
  const scope = 'checklist';

  return {
    type: 'checklist',
    config: {
      label: 'Checklist',
      keyed: true,
      group: 'selection',
      create: (defaults) => ({ id: '', type: 'checklist', key: '', values: [], ...defaults }),
    },
    render: ({ component, value, errors }) => {
      const groupId = `${env.idPrefix}-${component.id}`;
      const descId = component.description ? `${groupId}-desc` : undefined;
      const errorId = `${groupId}-error`;
      const selected = new Set(Array.isArray(value) ? (value as string[]) : []);

      const root = createFieldRoot(scope, env);

      if (component.label) {
        const legend = el('div', { id: `${groupId}-label`, 'data-part': 'label' });
        legend.className = partClasses(
          env,
          scope,
          'label',
          'text-(length:--mf-font-size-sm) font-(--mf-font-weight-medium) text-(--mf-color-text)',
        );
        legend.textContent = String(component.label);
        root.appendChild(legend);
      }

      const group = el('div', {
        role: 'group',
        'aria-labelledby': `${groupId}-label`,
        'aria-describedby': [descId, errorId].filter(Boolean).join(' '),
      });
      group.className = 'flex flex-col gap-(--mf-space-2)';

      const inputs: HTMLInputElement[] = [];
      for (const option of resolvedOptions(component.values)) {
        const optionId = `${groupId}-${option.value}`;
        const row = el('div');
        row.className = 'flex items-center gap-(--mf-space-2)';

        const input = el('input', { type: 'checkbox', id: optionId, value: option.value });
        input.className = partClasses(
          env,
          scope,
          'input',
          'h-4 w-4 rounded-(--mf-radius-sm) border-(--mf-color-border) text-(--mf-color-primary) focus:ring-(--mf-color-border-focus)',
        );
        input.checked = selected.has(option.value);
        input.disabled = Boolean(component.disabled);
        input.addEventListener('change', () => {
          if (input.checked) selected.add(option.value);
          else selected.delete(option.value);
          env.onChange(component.key, [...selected]);
        });
        input.addEventListener('focus', () => env.onFocus?.(component));
        input.addEventListener('blur', () => env.onBlur?.(component));
        inputs.push(input);

        const optionLabel = el('label', { for: optionId });
        optionLabel.className = 'text-(length:--mf-font-size-md) text-(--mf-color-text)';
        optionLabel.textContent = option.label;

        row.append(input, optionLabel);
        group.appendChild(row);
      }

      root.appendChild(group);

      if (descId) root.appendChild(createDescription(scope, env, descId, String(component.description)));

      const errorEl = createErrorContainer(scope, env, errorId);
      updateErrorContainer(errorEl, errors);
      root.appendChild(errorEl);

      const result: DomRenderResult = {
        el: root,
        update: ({ value: nextValue, errors: nextErrors, disabled }) => {
          const nextSelected = new Set(Array.isArray(nextValue) ? (nextValue as string[]) : []);
          inputs.forEach((input) => {
            input.checked = nextSelected.has(input.value);
            if (disabled !== undefined) input.disabled = disabled;
          });
          updateErrorContainer(errorEl, nextErrors);
        },
        destroy: () => root.remove(),
      };

      return result;
    },
  };
}
