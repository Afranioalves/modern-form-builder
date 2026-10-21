import type { FormComponent, Validate } from '@modern-form/schema';
import type { DataContext } from '../expression/DataContext.js';
import type { FieldTypeRegistry } from '../registry/FieldTypeRegistry.js';
import { runBuiltInValidation } from './rules/index.js';

/**
 * Live, incremental feedback (SPECIFICATION.md section 5.1): computes errors for a single field
 * as the user types, typically driven by the dependency graph so only the changed field (and
 * its FEEL-dependents) are recomputed. Uses the exact same rule functions as `Validator`, so the
 * two can never disagree about whether a given value is valid - they only differ in *when* and
 * *which* fields they check.
 */
export class Evaluator {
  static $inject = ['fieldTypeRegistry'];

  constructor(private readonly registry: FieldTypeRegistry) {}

  evaluateField(component: FormComponent, ctx: DataContext): string[] {
    const key = (component as { key?: string }).key;
    if (!key) return [];

    const value = ctx.getValue(key);
    const validate = (component as { validate?: Validate }).validate;
    const builtIn = runBuiltInValidation(value, validate);

    const extension = this.registry.get(component.type);
    const custom = extension?.validator ? extension.validator(value, component, { data: ctx }) : [];

    return [...builtIn, ...custom];
  }
}
