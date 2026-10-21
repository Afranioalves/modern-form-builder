/**
 * Minimal constructor-injection container. Deliberately not `didi` (see SPECIFICATION.md section
 * 6.2): the service graph here is small and fixed, so a hand-written ~50-line container is easier
 * to keep fully typed than a general-purpose reflective DI library, and avoids a dependency whose
 * surface area (designed for diagram editors) we would not use.
 *
 * The `$inject` static-array convention is preserved so a developer porting a form-js
 * `additionalModules` plugin recognizes the shape immediately - but this container is our own code.
 */

export type Injectable<T> = T & { $inject?: string[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = new (...args: any[]) => unknown;

export class Injector {
  private instances = new Map<string, unknown>();
  private factories = new Map<string, Injectable<Constructor>>();

  registerValue(name: string, value: unknown): void {
    this.instances.set(name, value);
  }

  register(name: string, factory: Injectable<Constructor>): void {
    this.factories.set(name, factory);
  }

  get<T>(name: string): T {
    if (this.instances.has(name)) {
      return this.instances.get(name) as T;
    }

    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`No provider registered for "${name}"`);
    }

    const deps = (factory.$inject ?? []).map((dep) => this.get(dep));
    const instance = new factory(...deps);
    this.instances.set(name, instance);
    return instance as T;
  }

  has(name: string): boolean {
    return this.instances.has(name) || this.factories.has(name);
  }
}
