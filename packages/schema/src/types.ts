/**
 * Hand-authored TypeScript types for the modern-form schema.
 * These are the canonical types; `zod-schemas.ts` provides runtime validators
 * typed against these same interfaces (`z.ZodType<T>`) so the two can never drift silently.
 */

export type FeelString = `=${string}`;
export type ToggleOrFeel<T> = T | FeelString;

export function isFeelExpression(value: unknown): value is FeelString {
  return typeof value === 'string' && value.startsWith('=');
}

export interface SelectionOption {
  label: string;
  value: string;
}

export interface Layout {
  columns?: number | null;
  row?: string;
}

export interface Conditional {
  hide?: FeelString;
}

export interface Validate {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  validationType?: 'phone' | 'email';
}

export interface ComponentBase {
  id: string;
  key?: string;
  label?: ToggleOrFeel<string>;
  layout?: Layout;
  conditional?: Conditional;
  description?: ToggleOrFeel<string>;
  disabled?: ToggleOrFeel<boolean>;
  readonly?: ToggleOrFeel<boolean>;
  properties?: Record<string, unknown>;
}

// -- Input ------------------------------------------------------------------

export interface TextfieldComponent extends ComponentBase {
  type: 'textfield';
  key: string;
  defaultValue?: ToggleOrFeel<string>;
  validate?: Validate;
}

export interface TextareaComponent extends ComponentBase {
  type: 'textarea';
  key: string;
  defaultValue?: ToggleOrFeel<string>;
  validate?: Validate;
}

export interface NumberComponent extends ComponentBase {
  type: 'number';
  key: string;
  defaultValue?: ToggleOrFeel<number>;
  decimalDigits?: number;
  validate?: Validate;
}

export interface DatetimeComponent extends ComponentBase {
  type: 'datetime';
  key: string;
  subtype: 'date' | 'time' | 'datetime';
  dateLabel?: string;
  timeLabel?: string;
  timeSerializingFormat?: 'utc_offset' | 'utc_normalized';
  timeInterval?: number;
  use24h?: boolean;
  defaultValue?: ToggleOrFeel<string>;
  validate?: Validate;
}

// -- Selection ----------------------------------------------------------------

export interface CheckboxComponent extends ComponentBase {
  type: 'checkbox';
  key: string;
  defaultValue?: ToggleOrFeel<boolean>;
  validate?: Validate;
}

export interface RadioComponent extends ComponentBase {
  type: 'radio';
  key: string;
  values: SelectionOption[] | FeelString;
  valuesKey?: string;
  defaultValue?: ToggleOrFeel<string>;
  validate?: Validate;
}

export interface SelectComponent extends ComponentBase {
  type: 'select';
  key: string;
  values: SelectionOption[] | FeelString;
  valuesKey?: string;
  searchable?: boolean;
  defaultValue?: ToggleOrFeel<string>;
  validate?: Validate;
}

export interface ChecklistComponent extends ComponentBase {
  type: 'checklist';
  key: string;
  values: SelectionOption[] | FeelString;
  valuesKey?: string;
  defaultValue?: ToggleOrFeel<string[]>;
  validate?: Validate;
}

export interface TaglistComponent extends ComponentBase {
  type: 'taglist';
  key: string;
  values: SelectionOption[] | FeelString;
  valuesKey?: string;
  defaultValue?: ToggleOrFeel<string[]>;
  validate?: Validate;
}

// -- Presentation -------------------------------------------------------------

export interface TextComponent extends ComponentBase {
  type: 'text';
  text: ToggleOrFeel<string>;
}

export interface HtmlComponent extends ComponentBase {
  type: 'html';
  content: ToggleOrFeel<string>;
}

export interface ImageComponent extends ComponentBase {
  type: 'image';
  source: ToggleOrFeel<string>;
  alt?: string;
}

export interface TableColumn {
  label: string;
  key: string;
}

export interface TableComponent extends ComponentBase {
  type: 'table';
  path: string;
  columns: TableColumn[];
}

// -- Layout / structure ---------------------------------------------------------

export interface GroupComponent extends ComponentBase {
  type: 'group';
  path?: string;
  components: FormComponent[];
  showOutline?: boolean;
}

export interface DynamiclistComponent extends ComponentBase {
  type: 'dynamiclist';
  path: string;
  components: FormComponent[];
  isRepeating: true;
  allowAddRemove?: boolean;
  defaultRepetitions?: number | FeelString;
}

export interface SpacerComponent extends ComponentBase {
  type: 'spacer';
  height?: number;
}

export interface SeparatorComponent extends ComponentBase {
  type: 'separator';
}

// -- Specialized ----------------------------------------------------------------

export interface IframeComponent extends ComponentBase {
  type: 'iframe';
  url: ToggleOrFeel<string>;
  height?: number;
}

export interface ExpressionComponent extends ComponentBase {
  type: 'expression';
  key: string;
  expression: FeelString;
  computeOn: 'presubmit' | 'change' | 'blur';
}

export interface FilepickerComponent extends ComponentBase {
  type: 'filepicker';
  key: string;
  multiple?: boolean;
  validate?: Validate;
}

export interface DocumentPreviewComponent extends ComponentBase {
  type: 'documentPreview';
  key: string;
}

export interface ButtonComponent extends ComponentBase {
  type: 'button';
  action: 'submit' | 'reset';
}

export type FormComponent =
  | TextfieldComponent
  | TextareaComponent
  | NumberComponent
  | DatetimeComponent
  | CheckboxComponent
  | RadioComponent
  | SelectComponent
  | ChecklistComponent
  | TaglistComponent
  | TextComponent
  | HtmlComponent
  | ImageComponent
  | TableComponent
  | GroupComponent
  | DynamiclistComponent
  | SpacerComponent
  | SeparatorComponent
  | IframeComponent
  | ExpressionComponent
  | FilepickerComponent
  | DocumentPreviewComponent
  | ButtonComponent;

/** Component types that always carry a data-binding `key` and write a value. */
export const KEYED_COMPONENT_TYPES = [
  'textfield',
  'textarea',
  'number',
  'datetime',
  'checkbox',
  'radio',
  'select',
  'checklist',
  'taglist',
  'expression',
  'filepicker',
  'documentPreview',
] as const satisfies readonly FormComponent['type'][];

/** Component types that nest a `components` tree. */
export const CONTAINER_COMPONENT_TYPES = ['group', 'dynamiclist'] as const satisfies readonly FormComponent['type'][];

export interface FormSchemaExporter {
  name: string;
  version: string;
}

export interface FormSchema {
  type: 'default';
  id: string;
  schemaVersion: number;
  exporter?: FormSchemaExporter;
  executionPlatform?: 'Camunda Cloud';
  executionPlatformVersion?: string;
  components: FormComponent[];
}

/** Current schema format version this package was written against. */
export const SUPPORTED_SCHEMA_VERSION = 12;
