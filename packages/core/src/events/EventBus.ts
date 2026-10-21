import type { FormComponent } from '@modern-form/schema';
import type { FormData, ValidationErrors } from '../types.js';

export interface ImportWarning {
  code: string;
  path: string;
  message: string;
}

/** Every event modern-form emits, keyed by name, typed to its payload shape. */
export interface FormEventMap {
  'import.done': { data: FormData; warnings: ImportWarning[] };
  changed: { data: FormData; field?: { id: string; key?: string } };
  submit: { data: FormData; errors: ValidationErrors };
  'field.errorsChanged': { fieldId: string; errors: string[] };
  'field.add': { field: FormComponent };
  'field.remove': { field: FormComponent };
  'field.focus': { field: FormComponent };
  'field.blur': { field: FormComponent };
}

type Handler<T> = (payload: T) => void;

/**
 * Small, dependency-free, fully-typed event emitter. Deliberately not a dependency on
 * diagram-js's event bus (see SPECIFICATION.md section 6.2) - our service graph is small and
 * fixed, and a hand-written emitter lets every event payload be properly generic instead of `any`.
 */
export class EventBus {
  static $inject: string[] = [];

  private handlers = new Map<keyof FormEventMap, Set<Handler<unknown>>>();

  on<E extends keyof FormEventMap>(event: E, handler: Handler<FormEventMap[E]>): void {
    const set = this.handlers.get(event) ?? new Set();
    set.add(handler as Handler<unknown>);
    this.handlers.set(event, set);
  }

  off<E extends keyof FormEventMap>(event: E, handler: Handler<FormEventMap[E]>): void {
    this.handlers.get(event)?.delete(handler as Handler<unknown>);
  }

  emit<E extends keyof FormEventMap>(event: E, payload: FormEventMap[E]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    // Copy before iterating: a handler may unsubscribe itself (or another handler) mid-emit.
    for (const handler of [...set]) {
      handler(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
