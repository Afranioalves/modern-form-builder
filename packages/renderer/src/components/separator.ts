import type { SeparatorComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import { el, partClasses } from '../dom/shared.js';
import type { DomRenderResult, RenderEnv } from '../dom/shared.js';

export function createSeparatorFieldType(env: RenderEnv): FieldTypeExtension<SeparatorComponent> {
  const scope = 'separator';

  return {
    type: 'separator',
    config: {
      label: 'Separator',
      keyed: false,
      group: 'layout',
      create: (defaults) => ({ id: '', type: 'separator', ...defaults }),
    },
    render: () => {
      const root = el('hr', { 'data-scope': scope, 'data-part': 'root' });
      root.className = partClasses(env, scope, 'root', 'border-t border-(--mf-color-border)');

      const result: DomRenderResult = {
        el: root,
        update: () => undefined,
        destroy: () => root.remove(),
      };
      return result;
    },
  };
}
