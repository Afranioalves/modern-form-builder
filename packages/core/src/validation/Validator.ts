import type { FormComponent, Validate } from '@modern-form/schema';
import type { DataContext } from '../expression/DataContext.js';
import { evaluateBooleanExpression } from '../expression/evaluateExpression.js';
import type { FieldTypeRegistry } from '../registry/FieldTypeRegistry.js';
import type { ValidationErrors } from '../types.js';
import { mergeErrors } from './mergeErrors.js';
import { runBuiltInValidation } from './rules/index.js';

/**
 * The authoritative, submit-time validator (SPECIFICATION.md section 5.1). Walks the *entire
 * visible* field tree - skipping anything currently `conditional.hide === true`, matching
 * form-js semantics: a hidden field is never required - and produces one ValidationErrors map.
 * Shares its rule logic with `Evaluator`; the two differ only in scope and timing.
 */
export class Validator {
  static $inject = ['fieldTypeRegistry'];

  constructor(private readonly registry: FieldTypeRegistry) {}

  validate(components: FormComponent[], ctx: DataContext): ValidationErrors {
    let errors: ValidationErrors = {};
    this.walk(components, ctx, (key, fieldErrors) => {
      if (fieldErrors.length > 0) {
        errors = mergeErrors(errors, { [key]: fieldErrors });
      }
    });
    return errors;
  }

  private walk(
    components: FormComponent[],
    ctx: DataContext,
    report: (key: string, errors: string[]) => void,
  ): void {
    for (const component of components) {
      if (evaluateBooleanExpression(component.conditional?.hide, ctx)) {
        continue;
      }

      if (component.type === 'group') {
        const nestedCtx = component.path ? ctx.withPrefix(component.path) : ctx;
        this.walk(component.components, nestedCtx, report);
        continue;
      }

      if (component.type === 'dynamiclist') {
        const rows = (ctx.getValue(component.path) as Record<string, unknown>[] | undefined) ?? [];
        rows.forEach((row) => {
          this.walk(component.components, ctx.pushScope(row), report);
        });
        continue;
      }

      const key = (component as { key?: string }).key;
      if (!key) continue;

      report(ctx.getFullKey(key), this.validateField(component, key, ctx));
    }
  }

  private validateField(component: FormComponent, key: string, ctx: DataContext): string[] {
    const value = ctx.getValue(key);
    const validate = (component as { validate?: Validate }).validate;
    const builtIn = runBuiltInValidation(value, validate);

    const extension = this.registry.get(component.type);
    const custom = extension?.validator ? extension.validator(value, component, { data: ctx }) : [];

    return [...builtIn, ...custom];
  }
}
