import type { NumberComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import type { RenderEnv } from '../dom/shared.js';
import { createTextLikeFieldType } from './textLikeField.js';

export function createNumberFieldType(env: RenderEnv): FieldTypeExtension<NumberComponent> {
  return createTextLikeFieldType(env, {
    type: 'number',
    label: 'Number',
    inputTag: 'input',
    inputType: 'number',
    parseValue: (raw) => (raw === '' ? undefined : Number(raw)),
    formatValue: (value) => (typeof value === 'number' && !Number.isNaN(value) ? String(value) : ''),
    extraAttrs: (component) => {
      const attrs: Record<string, string> = {};
      if (component.validate?.min !== undefined) attrs.min = String(component.validate.min);
      if (component.validate?.max !== undefined) attrs.max = String(component.validate.max);
      if (component.decimalDigits !== undefined) attrs.step = String(10 ** -component.decimalDigits);
      return attrs;
    },
    create: (defaults) => ({ id: '', type: 'number', key: '', ...defaults }),
  });
}
