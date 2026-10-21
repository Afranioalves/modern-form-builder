import { KEYED_COMPONENT_TYPES, SUPPORTED_SCHEMA_VERSION } from './types.js';
import type { FormComponent, FormSchema, Validate } from './types.js';

export type LintSeverity = 'error' | 'warning';

export interface LintIssue {
  severity: LintSeverity;
  code: string;
  path: string;
  message: string;
}

const KNOWN_TYPES = new Set<FormComponent['type']>([
  'textfield',
  'textarea',
  'number',
  'datetime',
  'checkbox',
  'radio',
  'select',
  'checklist',
  'taglist',
  'text',
  'html',
  'image',
  'table',
  'group',
  'dynamiclist',
  'spacer',
  'separator',
  'iframe',
  'expression',
  'filepicker',
  'documentPreview',
  'button',
]);

function isRegexValid(pattern: string): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const regex = new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

/**
 * Walks the full component tree and reports semantic issues that structural (Zod) validation
 * cannot express - e.g. `validate.min > validate.max`. Errors should block `importSchema`;
 * warnings should not (graceful degradation, see SPECIFICATION.md section 11.4).
 */
export class SchemaLinter {
  lint(schema: FormSchema): LintIssue[] {
    const issues: LintIssue[] = [];
    const seenKeys = new Set<string>();

    if (schema.schemaVersion > SUPPORTED_SCHEMA_VERSION) {
      issues.push({
        severity: 'warning',
        code: 'SCHEMA_VERSION_NEWER_THAN_SUPPORTED',
        path: 'schemaVersion',
        message: `Schema version ${schema.schemaVersion} is newer than the supported version ${SUPPORTED_SCHEMA_VERSION}; rendering will proceed on a best-effort basis.`,
      });
    }

    this.walk(schema.components, 'components', issues, seenKeys);

    return issues;
  }

  private walk(
    components: FormComponent[],
    pathPrefix: string,
    issues: LintIssue[],
    seenKeys: Set<string>,
  ): void {
    components.forEach((component, index) => {
      const path = `${pathPrefix}[${index}]`;
      this.checkComponent(component, path, issues, seenKeys);

      if (component.type === 'group' || component.type === 'dynamiclist') {
        if (component.type === 'dynamiclist' && !component.path) {
          issues.push({
            severity: 'error',
            code: 'DYNAMICLIST_PATH_MISSING',
            path,
            message: 'A "dynamiclist" component must declare a "path" to bind its repeated rows to.',
          });
        }
        this.walk(component.components, `${path}.components`, issues, seenKeys);
      }
    });
  }

  private checkComponent(
    component: FormComponent,
    path: string,
    issues: LintIssue[],
    seenKeys: Set<string>,
  ): void {
    if (!KNOWN_TYPES.has(component.type)) {
      issues.push({
        severity: 'warning',
        code: 'UNKNOWN_COMPONENT_TYPE',
        path: `${path}.type`,
        message: `Unknown component type "${component.type}"; it will render as a placeholder.`,
      });
    }

    if (KEYED_COMPONENT_TYPES.includes(component.type as (typeof KEYED_COMPONENT_TYPES)[number])) {
      const key = (component as { key?: string }).key;
      if (!key) {
        issues.push({
          severity: 'error',
          code: 'KEY_MISSING_ON_KEYED_TYPE',
          path: `${path}.key`,
          message: `Component of type "${component.type}" requires a "key" for data binding.`,
        });
      } else if (seenKeys.has(key)) {
        issues.push({
          severity: 'error',
          code: 'KEY_DUPLICATE',
          path: `${path}.key`,
          message: `Duplicate data-binding key "${key}".`,
        });
      } else {
        seenKeys.add(key);
      }
    }

    const validate = (component as { validate?: Validate }).validate;
    if (validate) {
      if (
        typeof validate.min === 'number' &&
        typeof validate.max === 'number' &&
        validate.min > validate.max
      ) {
        issues.push({
          severity: 'error',
          code: 'VALIDATE_MIN_GT_MAX',
          path: `${path}.validate`,
          message: `"min" (${validate.min}) is greater than "max" (${validate.max}).`,
        });
      }
      if (
        typeof validate.minLength === 'number' &&
        typeof validate.maxLength === 'number' &&
        validate.minLength > validate.maxLength
      ) {
        issues.push({
          severity: 'error',
          code: 'VALIDATE_MINLENGTH_GT_MAXLENGTH',
          path: `${path}.validate`,
          message: `"minLength" (${validate.minLength}) is greater than "maxLength" (${validate.maxLength}).`,
        });
      }
      if (validate.pattern && !isRegexValid(validate.pattern)) {
        issues.push({
          severity: 'error',
          code: 'VALIDATE_PATTERN_INVALID',
          path: `${path}.validate.pattern`,
          message: `"pattern" is not a valid regular expression: ${validate.pattern}`,
        });
      }
    }
  }
}
