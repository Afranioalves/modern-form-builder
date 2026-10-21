import type { Validate } from '@modern-form/schema';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9()\-.\s]{6,}$/;

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Pure, side-effect-free validation rule functions. Both the live `Evaluator` and the
 * submit-time `Validator` call the SAME functions (SPECIFICATION.md section 5.1) - they differ
 * only in which fields they run and when, never in rule logic, so live feedback and submit-time
 * enforcement can never drift out of sync.
 */

export function validateRequired(value: unknown, required: boolean | undefined): string[] {
  if (required && isEmpty(value)) {
    return ['This field is required.'];
  }
  return [];
}

export function validateMin(value: unknown, min: number | undefined): string[] {
  if (min === undefined || typeof value !== 'number') return [];
  return value < min ? [`Must be at least ${min}.`] : [];
}

export function validateMax(value: unknown, max: number | undefined): string[] {
  if (max === undefined || typeof value !== 'number') return [];
  return value > max ? [`Must be at most ${max}.`] : [];
}

export function validateMinLength(value: unknown, minLength: number | undefined): string[] {
  if (minLength === undefined || typeof value !== 'string') return [];
  return value.length < minLength ? [`Must be at least ${minLength} characters.`] : [];
}

export function validateMaxLength(value: unknown, maxLength: number | undefined): string[] {
  if (maxLength === undefined || typeof value !== 'string') return [];
  return value.length > maxLength ? [`Must be at most ${maxLength} characters.`] : [];
}

export function validatePattern(value: unknown, pattern: string | undefined): string[] {
  if (!pattern || typeof value !== 'string' || value === '') return [];
  try {
    return new RegExp(pattern).test(value) ? [] : ['Value does not match the required format.'];
  } catch {
    // An invalid pattern is caught at import time by SchemaLinter; at runtime we fail open.
    return [];
  }
}

export function validateValidationType(
  value: unknown,
  validationType: Validate['validationType'] | undefined,
): string[] {
  if (!validationType || typeof value !== 'string' || value === '') return [];
  if (validationType === 'email' && !EMAIL_PATTERN.test(value)) {
    return ['Must be a valid email address.'];
  }
  if (validationType === 'phone' && !PHONE_PATTERN.test(value)) {
    return ['Must be a valid phone number.'];
  }
  return [];
}

/** Runs every applicable built-in rule for a field's `validate` config and concatenates the errors. */
export function runBuiltInValidation(value: unknown, validate: Validate | undefined): string[] {
  if (!validate) return [];
  return [
    ...validateRequired(value, validate.required),
    ...validateMin(value, validate.min),
    ...validateMax(value, validate.max),
    ...validateMinLength(value, validate.minLength),
    ...validateMaxLength(value, validate.maxLength),
    ...validatePattern(value, validate.pattern),
    ...validateValidationType(value, validate.validationType),
  ];
}
