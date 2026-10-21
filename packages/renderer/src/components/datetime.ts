import type { DatetimeComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '@modern-form/core';
import type { RenderEnv } from '../dom/shared.js';
import { createTextLikeFieldType } from './textLikeField.js';

const NATIVE_INPUT_TYPE: Record<DatetimeComponent['subtype'], string> = {
  date: 'date',
  time: 'time',
  datetime: 'datetime-local',
};

/**
 * v1 renders every `datetime` subtype with the matching native `<input>` type (free keyboard
 * entry + a built-in picker, satisfying the APG requirement that date pickers remain operable by
 * direct text entry - SPECIFICATION.md section 10.6). `timeSerializingFormat`/`timeInterval`
 * (utc normalization, custom step) are read but not yet applied; tracked for v1.1.
 */
export function createDatetimeFieldType(env: RenderEnv): FieldTypeExtension<DatetimeComponent> {
  return createTextLikeFieldType(env, {
    type: 'datetime',
    label: 'Date Time',
    inputTag: 'input',
    inputType: 'text', // overridden per-instance below via extraAttrs' `type`
    parseValue: (raw) => raw,
    formatValue: (value) => (typeof value === 'string' ? value : ''),
    extraAttrs: (component) => ({
      type: NATIVE_INPUT_TYPE[component.subtype],
      ...(component.timeInterval ? { step: String(component.timeInterval * 60) } : {}),
    }),
    create: (defaults) => ({ id: '', type: 'datetime', key: '', subtype: 'date', ...defaults }),
  });
}
