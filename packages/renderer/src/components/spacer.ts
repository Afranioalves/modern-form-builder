import type { SpacerComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import { el } from '../dom/shared.js';
import type { DomRenderResult, RenderEnv } from '../dom/shared.js';

export function createSpacerFieldType(_env: RenderEnv): FieldTypeExtension<SpacerComponent> {
  return {
    type: 'spacer',
    config: {
      label: 'Spacer',
      keyed: false,
      group: 'layout',
      create: (defaults) => ({ id: '', type: 'spacer', ...defaults }),
    },
    render: ({ component }) => {
      const root = el('div', { 'data-scope': 'spacer', 'data-part': 'root', 'aria-hidden': 'true' });
      root.style.height = `${component.height ?? 16}px`;

      const result: DomRenderResult = {
        el: root,
        update: () => undefined,
        destroy: () => root.remove(),
      };
      return result;
    },
  };
}
