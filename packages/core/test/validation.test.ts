import { describe, expect, it } from 'vitest';
import type { FormComponent } from '@modern-form/schema';
import { DataContext } from '../src/expression/DataContext.js';
import { FieldTypeRegistry } from '../src/registry/FieldTypeRegistry.js';
import { Validator } from '../src/validation/Validator.js';
import { mergeErrors } from '../src/validation/mergeErrors.js';
import { runBuiltInValidation } from '../src/validation/rules/index.js';

describe('runBuiltInValidation', () => {
  it('flags a missing required value', () => {
    expect(runBuiltInValidation('', { required: true })).toHaveLength(1);
    expect(runBuiltInValidation('ok', { required: true })).toHaveLength(0);
  });

  it('flags out-of-range numbers', () => {
    expect(runBuiltInValidation(150, { min: 0, max: 100 })).toHaveLength(1);
    expect(runBuiltInValidation(50, { min: 0, max: 100 })).toHaveLength(0);
  });

  it('flags a pattern mismatch', () => {
    expect(runBuiltInValidation('abc', { pattern: '^[0-9]+$' })).toHaveLength(1);
  });
});

describe('mergeErrors', () => {
  it('concatenates rather than replacing', () => {
    const merged = mergeErrors({ name: ['required'] }, { name: ['too short'] });
    expect(merged.name).toEqual(['required', 'too short']);
  });
});

describe('Validator', () => {
  const components: FormComponent[] = [
    {
      id: 'f1',
      key: 'name',
      type: 'textfield',
      validate: { required: true },
    },
    {
      id: 'f2',
      key: 'secret',
      type: 'textfield',
      conditional: { hide: '=true' },
      validate: { required: true },
    },
  ];

  it('validates visible required fields', () => {
    const validator = new Validator(new FieldTypeRegistry());
    const errors = validator.validate(components, new DataContext({ name: '' }));
    expect(errors.name).toBeDefined();
  });

  it('skips hidden fields entirely', () => {
    const validator = new Validator(new FieldTypeRegistry());
    const errors = validator.validate(components, new DataContext({ name: 'ok', secret: '' }));
    expect(errors.secret).toBeUndefined();
  });
});
