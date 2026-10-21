import type { TextfieldComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import type { RenderEnv } from '../dom/shared.js';
import { createTextLikeFieldType } from './textLikeField.js';

export function createTextfieldFieldType(env: RenderEnv): FieldTypeExtension<TextfieldComponent> {
  return createTextLikeFieldType(env, {
    type: 'textfield',
    label: 'Text Field',
    inputTag: 'input',
    inputType: 'text',
    parseValue: (raw) => raw,
    formatValue: (value) => (typeof value === 'string' ? value : ''),
    create: (defaults) => ({ id: '', type: 'textfield', key: '', ...defaults }),
  });
}
