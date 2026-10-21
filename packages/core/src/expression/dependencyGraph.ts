import { extractFeelIdentifiers, isFeelExpression } from '@modern-form/schema';
import type { FormComponent } from '@modern-form/schema';

/** Maps a variable name to the set of component ids whose FEEL expressions reference it. */
export type DependencyGraph = Map<string, Set<string>>;

function addDependency(graph: DependencyGraph, variable: string, componentId: string): void {
  const set = graph.get(variable) ?? new Set<string>();
  set.add(componentId);
  graph.set(variable, set);
}

function collect(value: unknown, componentId: string, graph: DependencyGraph): void {
  if (isFeelExpression(value)) {
    for (const id of extractFeelIdentifiers(value.slice(1))) {
      addDependency(graph, id, componentId);
    }
  }
}

function walk(components: FormComponent[], graph: DependencyGraph): void {
  for (const component of components) {
    collect(component.label, component.id, graph);
    collect(component.description, component.id, graph);
    collect(component.disabled, component.id, graph);
    collect(component.readonly, component.id, graph);
    collect(component.conditional?.hide, component.id, graph);

    switch (component.type) {
      case 'image':
        collect(component.source, component.id, graph);
        break;
      case 'text':
        collect(component.text, component.id, graph);
        break;
      case 'expression':
        collect(component.expression, component.id, graph);
        break;
      case 'radio':
      case 'select':
      case 'checklist':
      case 'taglist':
        collect(component.values, component.id, graph);
        collect(component.defaultValue, component.id, graph);
        break;
      case 'dynamiclist':
        collect(component.defaultRepetitions, component.id, graph);
        walk(component.components, graph);
        break;
      case 'group':
        walk(component.components, graph);
        break;
      default:
        if ('defaultValue' in component) {
          collect(component.defaultValue, component.id, graph);
        }
        break;
    }
  }
}

/** Builds the dependency graph once at import time so `changed` events only recompute the fields whose expressions actually reference the changed key (SPECIFICATION.md section 4.3). */
export function buildDependencyGraph(components: FormComponent[]): DependencyGraph {
  const graph: DependencyGraph = new Map();
  walk(components, graph);
  return graph;
}

/** Component ids that must be re-evaluated when `changedKey` changes. */
export function getDependentComponentIds(graph: DependencyGraph, changedKey: string): Set<string> {
  return graph.get(changedKey) ?? new Set();
}
