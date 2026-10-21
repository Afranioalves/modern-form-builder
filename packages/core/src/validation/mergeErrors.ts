import type { ValidationErrors } from '../types.js';

/**
 * Custom validators (registered via `additionalModules`) must never replace the built-in error
 * map - only merge into it. Enforcing this structurally means a plugin author cannot accidentally
 * silence a built-in "required" error by registering their own validator for the same key
 * (SPECIFICATION.md section 5.2).
 */
export function mergeErrors(base: ValidationErrors, extra: ValidationErrors): ValidationErrors {
  const out: ValidationErrors = { ...base };
  for (const key of Object.keys(extra)) {
    out[key] = [...(out[key] ?? []), ...extra[key]!];
  }
  return out;
}
