import type { TextareaComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import type { RenderEnv } from '../dom/shared.js';
import { createTextLikeFieldType } from './textLikeField.js';

export function createTextareaFieldType(env: RenderEnv): FieldTypeExtension<TextareaComponent> {
  return createTextLikeFieldType(env, {
    type: 'textarea',
    label: 'Text Area',
    inputTag: 'textarea',
    parseValue: (raw) => raw,
    formatValue: (value) => (typeof value === 'string' ? value : ''),
    extraAttrs: () => ({ rows: '4' }),
    create: (defaults) => ({ id: '', type: 'textarea', key: '', ...defaults }),
  });
}
