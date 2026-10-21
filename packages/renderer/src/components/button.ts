import type { ButtonComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import { el, partClasses } from '../dom/shared.js';
import type { DomRenderResult, RenderEnv } from '../dom/shared.js';

export function createButtonFieldType(env: RenderEnv): FieldTypeExtension<ButtonComponent> {
  const scope = 'button';

  return {
    type: 'button',
    config: {
      label: 'Button',
      keyed: false,
      group: 'custom',
      create: (defaults) => ({ id: '', type: 'button', action: 'submit', ...defaults }),
    },
    render: ({ component }) => {
      const button = el('button', { type: 'button', 'data-scope': scope, 'data-part': 'root' });
      const variant =
        component.action === 'submit'
          ? 'bg-(--mf-color-primary) text-white hover:bg-(--mf-color-primary-hover)'
          : 'border border-(--mf-color-border) text-(--mf-color-text) hover:bg-(--mf-color-bg-disabled)';
      button.className = partClasses(
        env,
        scope,
        'root',
        `inline-flex items-center justify-center rounded-(--mf-radius-md) px-(--mf-space-4) py-(--mf-space-2) ` +
          `text-(length:--mf-font-size-md) font-(--mf-font-weight-medium) transition-colors duration-(--mf-transition-duration) ` +
          `focus:outline-none focus:ring-2 focus:ring-(--mf-color-border-focus) ${variant}`,
      );
      button.textContent = String(component.label ?? (component.action === 'submit' ? 'Submit' : 'Reset'));
      button.addEventListener('click', () => {
        if (component.action === 'submit') env.onSubmit?.();
        else env.onReset?.();
      });

      const result: DomRenderResult = {
        el: button,
        update: () => undefined,
        destroy: () => button.remove(),
      };
      return result;
    },
  };
}
