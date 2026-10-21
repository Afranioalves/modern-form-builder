import type { FormComponent } from '@modern-form/schema';
import type { DataContext } from './expression/DataContext.js';

export type FormData = Record<string, unknown>;
export type ValidationErrors = Record<string, string[]>;

export interface ValidationContext {
  data: DataContext;
}

/** A pure rule function: given a field's current value and definition, return error messages (empty = valid). */
export type FieldValidator<T extends FormComponent = FormComponent> = (
  value: unknown,
  component: T,
  ctx: ValidationContext,
) => string[];

/** Computes derived/reactive state for a field (e.g. resolved dynamic options, computed visibility). Hooked into the core Evaluator. */
export type FieldEvaluator<T extends FormComponent = FormComponent> = (
  component: T,
  ctx: ValidationContext,
) => void;

/** Pure render function: framework-agnostic, receives resolved props and an attach point. Implemented concretely in `@modern-form/renderer`. */
export type FieldRenderer<T extends FormComponent = FormComponent> = (props: {
  component: T;
  value: unknown;
  errors: string[];
}) => unknown;

export interface FieldTypeConfig<T extends FormComponent> {
  label: string;
  keyed: boolean;
  group: 'input' | 'selection' | 'presentation' | 'layout' | 'custom';
  create: (defaults?: Partial<T>) => T;
}

/**
 * A complete bundle registering a field type: its renderer, static config, and optional
 * evaluator/validator hooks. Passed via `additionalModules` at `Form` construction time.
 * See SPECIFICATION.md section 6.3.
 */
export interface FieldTypeExtension<T extends FormComponent = FormComponent> {
  type: string;
  config: FieldTypeConfig<T>;
  render: FieldRenderer<T>;
  evaluator?: FieldEvaluator<T>;
  validator?: FieldValidator<T>;
}
