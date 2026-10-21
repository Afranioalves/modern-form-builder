import { evaluate } from '@bpmn-io/feelin';
import { isFeelExpression } from '@modern-form/schema';
import type { ToggleOrFeel } from '@modern-form/schema';
import type { DataContext } from './DataContext.js';

export interface FeelWarning {
  message: string;
  type: string;
}

export interface FeelEvaluationResult {
  value: unknown;
  warnings: FeelWarning[];
}

/** `undefined` has no FEEL equivalent; feelin expects `null`. Applied one level deep, which covers every context we ever hand it (flat form data plus an optional `this` row). */
function coerceContextForFeel(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = value === undefined ? null : value;
  }
  return out;
}

/** Evaluates a raw FEEL expression (without the leading `=`) against a `DataContext`. */
export function evaluateFeelExpression(expression: string, ctx: DataContext): FeelEvaluationResult {
  const context = coerceContextForFeel(ctx.toFeelContext());
  const { value, warnings } = evaluate(expression, context) as {
    value: unknown;
    warnings: FeelWarning[];
  };
  return { value, warnings };
}

/**
 * Resolves the "toggle-or-FEEL" pattern used throughout the schema (SPECIFICATION.md section 3.4):
 * a literal value is returned as-is, a `=`-prefixed string is evaluated as FEEL against the
 * current data context. A `null`/`undefined` FEEL result falls back to `fallback`.
 */
export function evaluateToggleOrFeel<T>(
  value: ToggleOrFeel<T> | undefined,
  ctx: DataContext,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  if (isFeelExpression(value)) {
    const { value: result } = evaluateFeelExpression(value.slice(1), ctx);
    return result === null || result === undefined ? fallback : (result as T);
  }
  return value as T;
}

/** Specialization of `evaluateToggleOrFeel` for boolean conditions (`conditional.hide`, `disabled`, `readonly`): a missing/null result is treated as `false`. */
export function evaluateBooleanExpression(
  value: ToggleOrFeel<boolean> | undefined,
  ctx: DataContext,
): boolean {
  return evaluateToggleOrFeel(value, ctx, false);
}

/** Validates that a FEEL expression at least parses/evaluates without throwing - used by the import-time linter to catch `FEEL_EXPRESSION_UNPARSEABLE` before the form ever renders. */
export function isFeelExpressionValid(expression: string): boolean {
  try {
    evaluate(expression, {});
    return true;
  } catch {
    return false;
  }
}
