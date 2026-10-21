import type { FieldTypeExtension } from '@modern-form/core';
import type { RenderEnv } from '../dom/shared.js';
import { createButtonFieldType } from './button.js';
import { createChecklistFieldType } from './checklist.js';
import { createCheckboxFieldType } from './checkbox.js';
import { createDatetimeFieldType } from './datetime.js';
import { createImageFieldType } from './image.js';
import { createNumberFieldType } from './number.js';
import { createRadioFieldType } from './radio.js';
import { createSelectFieldType } from './select.js';
import { createSeparatorFieldType } from './separator.js';
import { createSpacerFieldType } from './spacer.js';
import { createTextFieldType } from './text.js';
import { createTextareaFieldType } from './textarea.js';
import { createTextfieldFieldType } from './textfield.js';

/**
 * The v1 field-type catalog (SPECIFICATION.md section 8). `group` is handled directly by `Form`'s
 * tree walker, not through this registry, since it is structural (it recurses into nested
 * `components`) rather than a leaf value-bearing field. `dynamiclist`, `table`, `taglist`,
 * `expression` and `html` are deferred to v1.1/v2.
 */
export function createBuiltInFieldTypes(
  env: RenderEnv,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): FieldTypeExtension<any>[] {
  return [
    createTextfieldFieldType(env),
    createTextareaFieldType(env),
    createNumberFieldType(env),
    createDatetimeFieldType(env),
    createCheckboxFieldType(env),
    createRadioFieldType(env),
    createSelectFieldType(env),
    createChecklistFieldType(env),
    createTextFieldType(env),
    createImageFieldType(env),
    createSpacerFieldType(env),
    createSeparatorFieldType(env),
    createButtonFieldType(env),
  ];
}
