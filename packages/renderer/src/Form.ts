import {
  DataContext,
  Evaluator,
  EventBus,
  FieldTypeRegistry,
  Validator,
  evaluateBooleanExpression,
  evaluateFeelExpression,
  resolveComponentForRender,
} from '@modern-form/core';
import type { FieldTypeExtension, FormData, FormEventMap, ImportWarning, ValidationErrors } from '@modern-form/core';
import { FormSchemaSchema, SchemaLinter, isFeelExpression } from '@modern-form/schema';
import type { FormComponent, FormSchema } from '@modern-form/schema';
import { createBuiltInFieldTypes } from './components/index.js';
import { renderUnsupportedField } from './components/unsupported.js';
import { createFieldRoot, el } from './dom/shared.js';
import type { ClassNamesOption, DomRenderResult, RenderEnv } from './dom/shared.js';

export interface FormOptions {
  container: HTMLElement;
  schema?: FormSchema;
  data?: FormData;
  properties?: { readOnly?: boolean; [key: string]: unknown };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalModules?: FieldTypeExtension<any>[];
  /** Tier 3 of the theming model (SPECIFICATION.md section 9.3): per-field-type class overrides. */
  classNames?: ClassNamesOption;
}

export interface ImportResult {
  schema: FormSchema;
  data: FormData;
  warnings: ImportWarning[];
}

export interface SubmitResult {
  data: FormData;
  errors: ValidationErrors;
}

/** Component types rendered structurally by the tree walker itself rather than through the
 * field-type registry, because they recurse into a nested `components` tree instead of owning a
 * single value (SPECIFICATION.md section 6.1). */
const STRUCTURAL_TYPES = new Set(['group']);
/** Acknowledged but not yet implemented - see SPECIFICATION.md section 8 (v1.1/v2 roadmap). */
const DEFERRED_TYPES = new Set(['dynamiclist', 'table', 'taglist', 'expression', 'html', 'iframe', 'filepicker', 'documentPreview']);

const linter = new SchemaLinter();

/**
 * The public API (SPECIFICATION.md section 7). Deliberately mirrors form-js's `Form` class shape
 * (`importSchema`/`submit`/`validate`/`reset`/`attachTo`/`detach`/`destroy`/`on`) so teams
 * migrating from form-js change an import and a stylesheet, not their integration code.
 *
 * Rendering strategy note: v1 re-renders the entire visible tree on every data change rather than
 * incrementally patching only the fields whose FEEL expressions actually depend on the changed
 * key. The dependency-graph primitives for that optimization already exist in `@modern-form/core`
 * (`buildDependencyGraph`/`getDependentComponentIds`) and the live `Evaluator` is wired in below;
 * wiring up fully incremental re-rendering is deferred as a follow-up performance pass - full
 * re-render is simpler and, for the field counts real task forms have, fast enough.
 */
export class Form {
  private readonly container: HTMLElement;
  private readonly registry = new FieldTypeRegistry();
  private readonly eventBus = new EventBus();
  private readonly validator: Validator;
  private readonly evaluator: Evaluator;
  private readonly idPrefix = `mf${Math.random().toString(36).slice(2, 8)}`;
  private readonly env: RenderEnv;

  private rootEl: HTMLElement | null = null;
  private schema: FormSchema | null = null;
  private dataContext = new DataContext();
  private errors: ValidationErrors = {};
  private initialData: FormData = {};
  private properties: Record<string, unknown>;
  private mounted: DomRenderResult[] = [];

  constructor(options: FormOptions) {
    this.container = options.container;
    this.properties = { readOnly: false, ...options.properties };

    this.env = {
      onChange: (key, value) => this.handleChange(key, value),
      onFocus: (component) => this.eventBus.emit('field.focus', { field: component }),
      onBlur: (component) => this.eventBus.emit('field.blur', { field: component }),
      onSubmit: () => this.submit(),
      onReset: () => this.reset(),
      classNames: options.classNames,
      idPrefix: this.idPrefix,
    };

    for (const extension of createBuiltInFieldTypes(this.env)) {
      this.registry.register(extension);
    }
    for (const extension of options.additionalModules ?? []) {
      this.registry.register(extension);
    }

    this.validator = new Validator(this.registry);
    this.evaluator = new Evaluator(this.registry);

    if (options.schema) {
      void this.importSchema(options.schema, options.data);
    }
  }

  async importSchema(schema: FormSchema, data: FormData = {}): Promise<ImportResult> {
    const parsed = FormSchemaSchema.safeParse(schema);
    if (!parsed.success) {
      throw new Error(`Invalid form schema: ${parsed.error.message}`);
    }

    const issues = linter.lint(parsed.data);
    const blockingErrors = issues.filter((issue) => issue.severity === 'error');
    if (blockingErrors.length > 0) {
      throw new Error(
        `Invalid form schema:\n${blockingErrors.map((e) => `[${e.code}] ${e.path}: ${e.message}`).join('\n')}`,
      );
    }
    const warnings: ImportWarning[] = issues
      .filter((issue) => issue.severity === 'warning')
      .map(({ code, path, message }) => ({ code, path, message }));

    this.schema = parsed.data;
    this.initialData = structuredClone(data);
    this.dataContext = new DataContext({ ...data });
    this.populateDefaultValues(this.schema.components, this.dataContext);

    this.render();

    const result: ImportResult = { schema: this.schema, data: this.dataContext.getData(), warnings };
    this.eventBus.emit('import.done', { data: result.data, warnings });
    return result;
  }

  submit(): SubmitResult {
    this.errors = this.schema ? this.validator.validate(this.schema.components, this.dataContext) : {};
    this.render();
    const result: SubmitResult = { data: this.dataContext.getData(), errors: this.errors };
    this.eventBus.emit('submit', result);
    return result;
  }

  validate(): ValidationErrors {
    this.errors = this.schema ? this.validator.validate(this.schema.components, this.dataContext) : {};
    this.render();
    return this.errors;
  }

  reset(): void {
    if (!this.schema) return;
    this.dataContext = new DataContext(structuredClone(this.initialData));
    this.populateDefaultValues(this.schema.components, this.dataContext);
    this.errors = {};
    this.render();
  }

  getData(): FormData {
    return this.dataContext.getData();
  }

  setProperty(key: string, value: unknown): void {
    this.properties[key] = value;
    this.render();
  }

  attachTo(container: HTMLElement): void {
    if (this.rootEl) container.appendChild(this.rootEl);
  }

  detach(): void {
    this.rootEl?.remove();
  }

  destroy(): void {
    this.mounted.forEach((instance) => instance.destroy());
    this.mounted = [];
    this.rootEl?.remove();
    this.rootEl = null;
    this.eventBus.clear();
  }

  on<E extends keyof FormEventMap>(event: E, handler: (payload: FormEventMap[E]) => void): void {
    this.eventBus.on(event, handler);
  }

  off<E extends keyof FormEventMap>(event: E, handler: (payload: FormEventMap[E]) => void): void {
    this.eventBus.off(event, handler);
  }

  // -- internals ------------------------------------------------------------------------------

  private handleChange(key: string, value: unknown): void {
    this.dataContext.setValue(key, value);
    if (this.schema) {
      this.errors = this.validator.validate(this.schema.components, this.dataContext);
    }
    this.render();
    this.eventBus.emit('changed', { data: this.dataContext.getData() });
  }

  private populateDefaultValues(components: FormComponent[], ctx: DataContext): void {
    for (const component of components) {
      if (component.type === 'group') {
        const nestedCtx = component.path ? ctx.withPrefix(component.path) : ctx;
        this.populateDefaultValues(component.components, nestedCtx);
        continue;
      }
      if (DEFERRED_TYPES.has(component.type)) continue;

      const key = (component as { key?: string }).key;
      const defaultValue = (component as { defaultValue?: unknown }).defaultValue;
      if (!key || defaultValue === undefined) continue;
      if (ctx.getValue(key) !== undefined) continue;

      const resolved =
        typeof defaultValue === 'string' && isFeelExpression(defaultValue)
          ? evaluateFeelExpression(defaultValue.slice(1), ctx).value
          : defaultValue;
      if (resolved !== undefined) ctx.setValue(key, resolved);
    }
  }

  private render(): void {
    this.mounted.forEach((instance) => instance.destroy());
    this.mounted = [];

    if (!this.rootEl) {
      this.rootEl = el('div', { 'data-modern-form': 'root' });
      this.rootEl.className = 'flex flex-col gap-(--mf-space-4)';
      this.container.appendChild(this.rootEl);
    } else {
      this.rootEl.replaceChildren();
    }

    if (!this.schema) return;

    this.renderTree(this.schema.components, this.dataContext, this.rootEl);
  }

  private renderTree(components: FormComponent[], ctx: DataContext, parent: HTMLElement): void {
    for (const component of components) {
      if (evaluateBooleanExpression(component.conditional?.hide, ctx)) {
        continue;
      }

      if (component.type === 'group') {
        const groupEl = createFieldRoot('group', this.env, 'border-l-2 border-(--mf-color-border) pl-(--mf-space-4)');
        if (component.label) {
          const resolved = resolveComponentForRender(component, ctx);
          const heading = el('div', { 'data-part': 'label' });
          heading.className = 'font-(--mf-font-weight-medium) text-(--mf-color-text)';
          heading.textContent = String(resolved.label ?? '');
          groupEl.appendChild(heading);
        }
        parent.appendChild(groupEl);
        const nestedCtx = component.path ? ctx.withPrefix(component.path) : ctx;
        this.renderTree(component.components, nestedCtx, groupEl);
        continue;
      }

      if (STRUCTURAL_TYPES.has(component.type) || DEFERRED_TYPES.has(component.type) || !this.registry.has(component.type)) {
        parent.appendChild(renderUnsupportedField(component));
        continue;
      }

      const resolved = resolveComponentForRender(component, ctx);
      const key = (resolved as { key?: string }).key;
      const value = key ? ctx.getValue(key) : undefined;
      const fieldErrors = key ? (this.errors[ctx.getFullKey(key)] ?? []) : [];

      const extension = this.registry.get(resolved.type)!;
      const mounted = extension.render({ component: resolved, value, errors: fieldErrors }) as DomRenderResult;
      this.mounted.push(mounted);
      parent.appendChild(mounted.el);
    }
  }
}
