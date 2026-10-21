import type { FormData } from '../types.js';

function getByPath(data: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, data);
}

function setByPath(data: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.');
  let cursor = data;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i]!;
    const next = cursor[segment];
    if (!next || typeof next !== 'object') {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]!] = value;
}

/**
 * Wraps the form's data object and, inside a `dynamiclist` iteration, a stack of row scopes
 * exposed to FEEL expressions as `this` (see SPECIFICATION.md section 4.5). Immutable: `pushScope`
 * returns a new `DataContext` sharing the same underlying data object, so popping a scope is just
 * discarding the returned instance when the renderer walks back out of a repeating row.
 */
export class DataContext {
  constructor(
    private readonly data: FormData = {},
    private readonly scopeStack: ReadonlyArray<Record<string, unknown>> = [],
    private readonly keyPrefix: string = '',
  ) {}

  getData(): FormData {
    return this.data;
  }

  getValue(key: string): unknown {
    return getByPath(this.data, this.prefixed(key));
  }

  setValue(key: string, value: unknown): void {
    setByPath(this.data, this.prefixed(key), value);
  }

  pushScope(row: Record<string, unknown>): DataContext {
    return new DataContext(this.data, [...this.scopeStack, row], this.keyPrefix);
  }

  /** Scopes subsequent `getValue`/`setValue` calls under `path` - used for a `group` component's
   * optional `path`, which nests its children's data under a sub-object (SPECIFICATION.md section 3.3). */
  withPrefix(path: string): DataContext {
    return new DataContext(this.data, this.scopeStack, this.prefixed(path));
  }

  /** The fully-qualified dot-path `key` resolves to under the current prefix - used when a caller
   * needs to key a result map (e.g. `ValidationErrors`) by the same path `getValue`/`setValue` use. */
  getFullKey(key: string): string {
    return this.prefixed(key);
  }

  private prefixed(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}.${key}` : key;
  }

  /** The flattened context object handed to the FEEL evaluator: global data plus the innermost `this`, if any. */
  toFeelContext(): Record<string, unknown> {
    const currentRow = this.scopeStack[this.scopeStack.length - 1];
    return currentRow ? { ...this.data, this: currentRow } : { ...this.data };
  }
}
