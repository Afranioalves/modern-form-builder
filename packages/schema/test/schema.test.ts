import { describe, expect, it } from 'vitest';
import { FormSchemaSchema, SchemaLinter, getSchemaVariables } from '../src/index.js';
import type { FormSchema } from '../src/index.js';

const exampleSchema: FormSchema = {
  type: 'default',
  id: 'InvoiceForm',
  schemaVersion: 12,
  exporter: { name: 'Camunda Modeler', version: '5.18.0' },
  executionPlatform: 'Camunda Cloud',
  executionPlatformVersion: '8.5.0',
  components: [
    {
      id: 'f1',
      key: 'creditor',
      label: 'Creditor',
      type: 'textfield',
      validate: { required: true },
    },
    {
      id: 'f2',
      key: 'amount',
      label: 'Amount',
      type: 'number',
      validate: { min: 0, max: 1000 },
    },
    {
      id: 'f3',
      key: 'approved',
      label: 'Approved',
      type: 'checkbox',
    },
    {
      id: 'f4',
      key: 'approvedBy',
      label: 'Approved By',
      type: 'textfield',
      conditional: { hide: '=approved = false' },
    },
    {
      id: 'f5',
      type: 'group',
      label: 'Details',
      path: 'details',
      components: [
        {
          id: 'f5-1',
          key: 'details.note',
          label: 'Note',
          type: 'textarea',
        },
      ],
    },
  ],
};

describe('FormSchemaSchema', () => {
  it('parses a valid schema', () => {
    const result = FormSchemaSchema.safeParse(exampleSchema);
    expect(result.success).toBe(true);
  });

  it('rejects a component with an unknown type literal at the type level but still exercises the discriminated union', () => {
    const invalid = {
      ...exampleSchema,
      components: [{ id: 'bad', type: 'textfield', key: 123 }],
    };
    const result = FormSchemaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('SchemaLinter', () => {
  it('reports no errors for a well-formed schema', () => {
    const linter = new SchemaLinter();
    const issues = linter.lint(exampleSchema);
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
  });

  it('flags validate.min > validate.max', () => {
    const linter = new SchemaLinter();
    const issues = linter.lint({
      ...exampleSchema,
      components: [
        {
          id: 'f1',
          key: 'amount',
          type: 'number',
          validate: { min: 100, max: 10 },
        },
      ],
    });
    expect(issues.some((i) => i.code === 'VALIDATE_MIN_GT_MAX')).toBe(true);
  });

  it('flags duplicate keys across nested groups', () => {
    const linter = new SchemaLinter();
    const issues = linter.lint({
      ...exampleSchema,
      components: [
        { id: 'a', key: 'dup', type: 'textfield' },
        {
          id: 'b',
          type: 'group',
          components: [{ id: 'c', key: 'dup', type: 'textfield' }],
        },
      ],
    });
    expect(issues.some((i) => i.code === 'KEY_DUPLICATE')).toBe(true);
  });

  it('flags a dynamiclist missing a path', () => {
    const linter = new SchemaLinter();
    const issues = linter.lint({
      ...exampleSchema,
      components: [
        {
          id: 'dl',
          type: 'dynamiclist',
          isRepeating: true,
          components: [],
        } as never,
      ],
    });
    expect(issues.some((i) => i.code === 'DYNAMICLIST_PATH_MISSING')).toBe(true);
  });
});

describe('getSchemaVariables', () => {
  it('collects written keys as outputs and FEEL-referenced names as inputs', () => {
    const { inputs, outputs } = getSchemaVariables(exampleSchema);
    expect(outputs).toEqual(
      expect.arrayContaining(['creditor', 'amount', 'approved', 'approvedBy', 'details.note']),
    );
    expect(inputs).toEqual(expect.arrayContaining(['approved']));
  });
});
