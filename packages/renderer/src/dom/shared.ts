import type { FormComponent } from '@modern-form/schema';

/** Per-field-type `classNames` overrides, keyed by "part" (root/label/input/description/error/...). Tier 3 of the theming model, SPECIFICATION.md section 9.3. */
export type PartClassNames = Record<string, string>;
export type ClassNamesOption = Record<string, PartClassNames>;

export interface RenderEnv {
  /** Called by a field renderer whenever the user changes its value; wires into Form's data + `changed` event. */
  onChange: (key: string, value: unknown) => void;
  /** Called when a field gains/loses focus, for the `formField.focus`/`formField.blur` events. */
  onFocus?: (component: FormComponent) => void;
  onBlur?: (component: FormComponent) => void;
  /** Triggered by a `button` field with `action: "submit"` / `action: "reset"`. */
  onSubmit?: () => void;
  onReset?: () => void;
  /** Global `classNames` overrides passed to `new Form({ classNames })`. */
  classNames?: ClassNamesOption;
  /** Stable id prefix so multiple `Form` instances on one page never collide on element ids. */
  idPrefix: string;
}

export interface DomRenderResult {
  el: HTMLElement;
  update(props: {
    component: FormComponent;
    value: unknown;
    errors: string[];
    disabled?: boolean;
    readonly?: boolean;
  }): void;
  destroy(): void;
}

let uidCounter = 0;
export function nextUid(): string {
  uidCounter += 1;
  return `mf-${uidCounter}`;
}

/** Merges the renderer's default classes for a part with any consumer-provided override (tier 3) - concatenated, never replaced, so overrides add to (and can use `!` Tailwind modifiers to beat) the defaults rather than requiring the consumer to re-specify everything. */
export function partClasses(
  env: RenderEnv,
  scope: string,
  part: string,
  defaults: string,
): string {
  const override = env.classNames?.[scope]?.[part];
  return override ? `${defaults} ${override}` : defaults;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

export function createFieldRoot(scope: string, env: RenderEnv, extraClass = ''): HTMLDivElement {
  const root = el('div', { 'data-scope': scope, 'data-part': 'root' });
  root.className = partClasses(env, scope, 'root', `mf-field flex flex-col gap-(--mf-space-1) ${extraClass}`.trim());
  return root;
}

export function createLabel(
  scope: string,
  env: RenderEnv,
  forId: string,
  text: string,
  required: boolean,
): HTMLLabelElement {
  const label = el('label', { 'data-part': 'label', for: forId });
  label.className = partClasses(
    env,
    scope,
    'label',
    'text-(length:--mf-font-size-sm) font-(--mf-font-weight-medium) text-(--mf-color-text)',
  );
  label.textContent = text;
  if (required) {
    const asterisk = el('span', { 'aria-hidden': 'true' });
    asterisk.className = 'text-(--mf-color-error) ml-(--mf-space-1)';
    asterisk.textContent = '*';
    label.appendChild(asterisk);
  }
  return label;
}

export function createDescription(
  scope: string,
  env: RenderEnv,
  id: string,
  text: string,
): HTMLParagraphElement {
  const description = el('p', { 'data-part': 'description', id });
  description.className = partClasses(
    env,
    scope,
    'description',
    'text-(length:--mf-font-size-sm) text-(--mf-color-text-muted)',
  );
  description.textContent = text;
  return description;
}

export function createErrorContainer(scope: string, env: RenderEnv, id: string): HTMLParagraphElement {
  const error = el('p', { 'data-part': 'error', id, role: 'alert' });
  error.className = partClasses(
    env,
    scope,
    'error',
    'text-(length:--mf-font-size-sm) text-(--mf-color-error) hidden',
  );
  return error;
}

export function updateErrorContainer(errorEl: HTMLElement, errors: string[]): void {
  if (errors.length === 0) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
    return;
  }
  errorEl.textContent = errors.join(' ');
  errorEl.classList.remove('hidden');
}

/** Base classes shared by every native text-like input (textfield, textarea, number, datetime, select). */
export const BASE_INPUT_CLASSES =
  'w-full border border-(--mf-color-border) rounded-(--mf-radius-md) ' +
  'px-(--mf-space-3) py-(--mf-space-2) text-(length:--mf-font-size-md) text-(--mf-color-text) ' +
  'bg-(--mf-color-bg) transition-colors duration-(--mf-transition-duration) ' +
  'focus:outline-none focus:ring-2 focus:ring-(--mf-color-border-focus) focus:border-(--mf-color-border-focus) ' +
  'disabled:bg-(--mf-color-bg-disabled) disabled:cursor-not-allowed ' +
  'aria-invalid:border-(--mf-color-error) aria-invalid:focus:ring-(--mf-color-error)';

export function describedByIds(...ids: (string | undefined)[]): string {
  return ids.filter(Boolean).join(' ');
}
