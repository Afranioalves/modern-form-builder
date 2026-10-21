import type { ImageComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import { createFieldRoot, el, partClasses } from '../dom/shared.js';
import type { DomRenderResult, RenderEnv } from '../dom/shared.js';

export function createImageFieldType(env: RenderEnv): FieldTypeExtension<ImageComponent> {
  const scope = 'image';

  return {
    type: 'image',
    config: {
      label: 'Image',
      keyed: false,
      group: 'presentation',
      create: (defaults) => ({ id: '', type: 'image', source: '', ...defaults }),
    },
    render: ({ component }) => {
      const root = createFieldRoot(scope, env);
      const img = el('img', { 'data-part': 'image', src: String(component.source ?? ''), alt: component.alt ?? '' });
      img.className = partClasses(env, scope, 'image', 'max-w-full rounded-(--mf-radius-md)');
      root.appendChild(img);

      const result: DomRenderResult = {
        el: root,
        update: ({ component: nextComponent }) => {
          const next = nextComponent as ImageComponent;
          img.src = String(next.source ?? '');
          img.alt = next.alt ?? '';
        },
        destroy: () => root.remove(),
      };
      return result;
    },
  };
}
