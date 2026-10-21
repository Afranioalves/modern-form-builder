import { isFeelExpression } from './types.js';
import type { FormComponent, FormSchema } from './types.js';

export interface GetSchemaVariablesOptions {
  /** Include variables referenced only by FEEL expressions (hide conditions, computed values, dynamic option sources). Defaults to true. */
  inputs?: boolean;
  /** Include variables written by keyed fields (their `key`, dot-path-aware). Defaults to true. */
  outputs?: boolean;
}

export interface SchemaVariables {
  inputs: string[];
  outputs: string[];
}

/** Very small FEEL identifier scanner: good enough to collect `name`/`this.name` references for variable-wiring and dependency-tracking purposes, without a full parser. Exported for reuse by `@modern-form/core`'s dependency graph. */
export function extractFeelIdentifiers(expression: string): string[] {
  const withoutStrings = expression.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  const matches = withoutStrings.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) ?? [];
  const KEYWORDS = new Set(['and', 'or', 'not', 'null', 'true', 'false', 'this', 'in']);
  return [...new Set(matches.filter((m) => !KEYWORDS.has(m)))];
}

function collectFromValue(value: unknown, inputs: Set<string>): void {
  if (isFeelExpression(value)) {
    extractFeelIdentifiers(value.slice(1)).forEach((id) => inputs.add(id));
  }
}

function walk(components: FormComponent[], inputs: Set<string>, outputs: Set<string>): void {
  for (const component of components) {
    collectFromValue(component.label, inputs);
    collectFromValue(component.description, inputs);
    collectFromValue(component.disabled, inputs);
    collectFromValue(component.readonly, inputs);
    collectFromValue(component.conditional?.hide, inputs);

    switch (component.type) {
      case 'image':
        collectFromValue(component.source, inputs);
        break;
      case 'text':
        collectFromValue(component.text, inputs);
        break;
      case 'expression':
        collectFromValue(component.expression, inputs);
        outputs.add(component.key);
        break;
      case 'radio':
      case 'select':
      case 'checklist':
      case 'taglist':
        collectFromValue(component.values, inputs);
        if (component.valuesKey) inputs.add(component.valuesKey);
        outputs.add(component.key);
        break;
      case 'textfield':
      case 'textarea':
      case 'number':
      case 'datetime':
      case 'checkbox':
        collectFromValue(component.defaultValue, inputs);
        outputs.add(component.key);
        break;
      case 'filepicker':
      case 'documentPreview':
        outputs.add(component.key);
        break;
      case 'group':
        walk(component.components, inputs, outputs);
        break;
      case 'dynamiclist':
        collectFromValue(component.defaultRepetitions, inputs);
        walk(component.components, inputs, outputs);
        break;
      default:
        break;
    }
  }
}

/**
 * Statically analyzes a schema (without evaluating it against real data) to produce the list
 * of variable names it reads (`inputs`) and writes (`outputs`) - useful for wiring Zeebe/Camunda
 * process variables into and out of a user task without running the form.
 */
export function getSchemaVariables(
  schema: FormSchema,
  options: GetSchemaVariablesOptions = {},
): SchemaVariables {
  const { inputs: wantInputs = true, outputs: wantOutputs = true } = options;
  const inputs = new Set<string>();
  const outputs = new Set<string>();

  walk(schema.components, inputs, outputs);

  return {
    inputs: wantInputs ? [...inputs].sort() : [],
    outputs: wantOutputs ? [...outputs].sort() : [],
  };
}
