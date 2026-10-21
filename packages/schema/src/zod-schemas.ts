/**
 * Zod validators for the modern-form schema. Each schema is checked against the hand-authored
 * interfaces in `types.ts` via `satisfies z.ZodType<T>` (not a `: z.ZodType<T>` annotation) so
 * structural drift between the runtime validator and the compile-time type surfaces as a type
 * error, while preserving each schema's precise literal/discriminant type - required for
 * `z.discriminatedUnion` to work correctly in zod v4.
 */
import { z } from 'zod';
import type {
  ButtonComponent,
  CheckboxComponent,
  ChecklistComponent,
  Conditional,
  DatetimeComponent,
  DocumentPreviewComponent,
  DynamiclistComponent,
  ExpressionComponent,
  FeelString,
  FilepickerComponent,
  FormComponent,
  FormSchema,
  GroupComponent,
  HtmlComponent,
  IframeComponent,
  ImageComponent,
  Layout,
  NumberComponent,
  RadioComponent,
  SelectComponent,
  SelectionOption,
  SeparatorComponent,
  SpacerComponent,
  TableComponent,
  TaglistComponent,
  TextComponent,
  TextareaComponent,
  TextfieldComponent,
  Validate,
} from './types.js';

const FeelStringSchema = z.custom<FeelString>(
  (value) => typeof value === 'string' && value.startsWith('='),
  { message: 'Expected a FEEL expression string starting with "="' },
);

function toggleOrFeel<T extends z.ZodTypeAny>(schema: T) {
  return z.union([schema, FeelStringSchema]);
}

const SelectionOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
}) satisfies z.ZodType<SelectionOption>;

const ValuesSchema = z.union([z.array(SelectionOptionSchema), FeelStringSchema]);

const LayoutSchema = z.object({
  columns: z.number().nullable().optional(),
  row: z.string().optional(),
}) satisfies z.ZodType<Layout>;

const ConditionalSchema = z.object({
  hide: FeelStringSchema.optional(),
}) satisfies z.ZodType<Conditional>;

const ValidateSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  validationType: z.enum(['phone', 'email']).optional(),
}) satisfies z.ZodType<Validate>;

const ComponentBaseShape = {
  id: z.string(),
  key: z.string().optional(),
  label: toggleOrFeel(z.string()).optional(),
  layout: LayoutSchema.optional(),
  conditional: ConditionalSchema.optional(),
  description: toggleOrFeel(z.string()).optional(),
  disabled: toggleOrFeel(z.boolean()).optional(),
  readonly: toggleOrFeel(z.boolean()).optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
};

// -- Input --------------------------------------------------------------------

const TextfieldSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('textfield'),
  key: z.string(),
  defaultValue: toggleOrFeel(z.string()).optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<TextfieldComponent>;

const TextareaSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('textarea'),
  key: z.string(),
  defaultValue: toggleOrFeel(z.string()).optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<TextareaComponent>;

const NumberSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('number'),
  key: z.string(),
  defaultValue: toggleOrFeel(z.number()).optional(),
  decimalDigits: z.number().optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<NumberComponent>;

const DatetimeSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('datetime'),
  key: z.string(),
  subtype: z.enum(['date', 'time', 'datetime']),
  dateLabel: z.string().optional(),
  timeLabel: z.string().optional(),
  timeSerializingFormat: z.enum(['utc_offset', 'utc_normalized']).optional(),
  timeInterval: z.number().optional(),
  use24h: z.boolean().optional(),
  defaultValue: toggleOrFeel(z.string()).optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<DatetimeComponent>;

// -- Selection ------------------------------------------------------------------

const CheckboxSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('checkbox'),
  key: z.string(),
  defaultValue: toggleOrFeel(z.boolean()).optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<CheckboxComponent>;

const RadioSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('radio'),
  key: z.string(),
  values: ValuesSchema,
  valuesKey: z.string().optional(),
  defaultValue: toggleOrFeel(z.string()).optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<RadioComponent>;

const SelectSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('select'),
  key: z.string(),
  values: ValuesSchema,
  valuesKey: z.string().optional(),
  searchable: z.boolean().optional(),
  defaultValue: toggleOrFeel(z.string()).optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<SelectComponent>;

const ChecklistSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('checklist'),
  key: z.string(),
  values: ValuesSchema,
  valuesKey: z.string().optional(),
  defaultValue: toggleOrFeel(z.array(z.string())).optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<ChecklistComponent>;

const TaglistSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('taglist'),
  key: z.string(),
  values: ValuesSchema,
  valuesKey: z.string().optional(),
  defaultValue: toggleOrFeel(z.array(z.string())).optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<TaglistComponent>;

// -- Presentation ---------------------------------------------------------------

const TextSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('text'),
  text: toggleOrFeel(z.string()),
}) satisfies z.ZodType<TextComponent>;

const HtmlSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('html'),
  content: toggleOrFeel(z.string()),
}) satisfies z.ZodType<HtmlComponent>;

const ImageSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('image'),
  source: toggleOrFeel(z.string()),
  alt: z.string().optional(),
}) satisfies z.ZodType<ImageComponent>;

const TableSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('table'),
  path: z.string(),
  columns: z.array(z.object({ label: z.string(), key: z.string() })),
}) satisfies z.ZodType<TableComponent>;

// -- Layout / structure (recursive) ----------------------------------------------

// The lazy callback's return type is annotated explicitly to break the circular inference
// between this schema and `FormComponentSchema` (which in turn references this one) - without
// it, TypeScript cannot resolve either side's type.
const GroupSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('group'),
  path: z.string().optional(),
  components: z.array(z.lazy((): z.ZodType<FormComponent> => FormComponentSchema)),
  showOutline: z.boolean().optional(),
}) satisfies z.ZodType<GroupComponent>;

const DynamiclistSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('dynamiclist'),
  path: z.string(),
  components: z.array(z.lazy((): z.ZodType<FormComponent> => FormComponentSchema)),
  isRepeating: z.literal(true),
  allowAddRemove: z.boolean().optional(),
  defaultRepetitions: toggleOrFeel(z.number()).optional(),
}) satisfies z.ZodType<DynamiclistComponent>;

const SpacerSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('spacer'),
  height: z.number().optional(),
}) satisfies z.ZodType<SpacerComponent>;

const SeparatorSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('separator'),
}) satisfies z.ZodType<SeparatorComponent>;

// -- Specialized ------------------------------------------------------------------

const IframeSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('iframe'),
  url: toggleOrFeel(z.string()),
  height: z.number().optional(),
}) satisfies z.ZodType<IframeComponent>;

const ExpressionSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('expression'),
  key: z.string(),
  expression: FeelStringSchema,
  computeOn: z.enum(['presubmit', 'change', 'blur']),
}) satisfies z.ZodType<ExpressionComponent>;

const FilepickerSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('filepicker'),
  key: z.string(),
  multiple: z.boolean().optional(),
  validate: ValidateSchema.optional(),
}) satisfies z.ZodType<FilepickerComponent>;

const DocumentPreviewSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('documentPreview'),
  key: z.string(),
}) satisfies z.ZodType<DocumentPreviewComponent>;

const ButtonSchema = z.object({
  ...ComponentBaseShape,
  type: z.literal('button'),
  action: z.enum(['submit', 'reset']),
}) satisfies z.ZodType<ButtonComponent>;

export const FormComponentSchema = z.discriminatedUnion('type', [
  TextfieldSchema,
  TextareaSchema,
  NumberSchema,
  DatetimeSchema,
  CheckboxSchema,
  RadioSchema,
  SelectSchema,
  ChecklistSchema,
  TaglistSchema,
  TextSchema,
  HtmlSchema,
  ImageSchema,
  TableSchema,
  GroupSchema,
  DynamiclistSchema,
  SpacerSchema,
  SeparatorSchema,
  IframeSchema,
  ExpressionSchema,
  FilepickerSchema,
  DocumentPreviewSchema,
  ButtonSchema,
]) satisfies z.ZodType<FormComponent>;

export const FormSchemaSchema = z.object({
  type: z.literal('default'),
  id: z.string(),
  schemaVersion: z.number(),
  exporter: z.object({ name: z.string(), version: z.string() }).optional(),
  executionPlatform: z.literal('Camunda Cloud').optional(),
  executionPlatformVersion: z.string().optional(),
  components: z.array(FormComponentSchema),
}) satisfies z.ZodType<FormSchema>;

export { FeelStringSchema, toggleOrFeel };
