import type { FormComponent } from '@modern-form/schema';
import type { FieldTypeExtension } from '../types.js';

/**
 * Maps a component `type` string to its rendering/evaluation/validation bundle. "Last
 * registration wins": registering a new extension under an existing built-in's `type` fully
 * overrides it, with no special API for that case (SPECIFICATION.md section 6.1).
 */
export class FieldTypeRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private types = new Map<string, FieldTypeExtension<any>>();

  register<T extends FormComponent>(extension: FieldTypeExtension<T>): void {
    this.types.set(extension.type, extension);
  }

  get<T extends FormComponent = FormComponent>(type: string): FieldTypeExtension<T> | undefined {
    return this.types.get(type) as FieldTypeExtension<T> | undefined;
  }

  has(type: string): boolean {
    return this.types.has(type);
  }

  list(): FieldTypeExtension[] {
    return [...this.types.values()];
  }
}
