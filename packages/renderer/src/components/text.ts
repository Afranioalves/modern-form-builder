import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { TextComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import { createFieldRoot, el, partClasses } from '../dom/shared.js';
import type { DomRenderResult, RenderEnv } from '../dom/shared.js';

/** Presentation-only: renders Markdown (sanitized with DOMPurify before insertion), matching
 * form-js's `text` component. Not `keyed` - it reads nothing from and writes nothing to form data. */
export function createTextFieldType(env: RenderEnv): FieldTypeExtension<TextComponent> {
  const scope = 'text';

  return {
    type: 'text',
    config: {
      label: 'Text',
      keyed: false,
      group: 'presentation',
      create: (defaults) => ({ id: '', type: 'text', text: '', ...defaults }),
    },
    render: ({ component }) => {
      const root = createFieldRoot(scope, env);
      const content = el('div', { 'data-part': 'content' });
      content.className = partClasses(env, scope, 'content', 'prose-sm max-w-none');
      content.innerHTML = DOMPurify.sanitize(marked.parse(String(component.text ?? ''), { async: false }));
      root.appendChild(content);

      const result: DomRenderResult = {
        el: root,
        update: ({ component: nextComponent }) => {
          const text = (nextComponent as TextComponent).text;
          content.innerHTML = DOMPurify.sanitize(marked.parse(String(text ?? ''), { async: false }));
        },
        destroy: () => root.remove(),
      };
      return result;
    },
  };
}
