import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { Form } from '@modern-form/renderer';
import type { FieldTypeExtension, FormData, FormEventMap, FormOptions, ClassNamesOption } from '@modern-form/renderer';
import type { FormSchema } from '@modern-form/schema';

export interface ModernFormProps {
  schema: FormSchema;
  data?: FormData;
  /** Forwarded as `additionalModules` to `Form` - see SPECIFICATION.md section 6.3. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalModules?: FieldTypeExtension<any>[];
  classNames?: ClassNamesOption;
  properties?: FormOptions['properties'];
  className?: string;
  onSubmit?: (payload: FormEventMap['submit']) => void;
  onChanged?: (payload: FormEventMap['changed']) => void;
  /** Called once after mount with the underlying imperative `Form` instance, for callers who
   * need `form.getData()` / `form.validate()` / `form.setProperty(...)` directly. */
  formRef?: (form: Form | null) => void;
}

/**
 * Thin React wrapper (SPECIFICATION.md section 2): mounts the framework-agnostic `Form` class
 * into a plain `<div>` via `useEffect` and re-imports the schema when it changes. All rendering,
 * validation and FEEL evaluation still happens inside `@modern-form/renderer` - this component
 * owns no form logic of its own.
 */
export function ModernForm(props: ModernFormProps): ReactElement {
  const { schema, data, additionalModules, classNames, properties, className, onSubmit, onChanged, formRef } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const formInstanceRef = useRef<Form | null>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const form = new Form({
      container: containerRef.current,
      additionalModules,
      classNames,
      properties,
    });
    formInstanceRef.current = form;
    formRef?.(form);

    if (onSubmit) form.on('submit', onSubmit);
    if (onChanged) form.on('changed', onChanged);

    return () => {
      form.destroy();
      formInstanceRef.current = null;
      formRef?.(null);
    };
    // Deliberately empty: the Form instance is constructed once on mount and torn down on
    // unmount; schema/data changes are handled by the effect below via importSchema, not by
    // recreating the Form itself.
  }, []);

  useEffect(() => {
    void formInstanceRef.current?.importSchema(schema, data);
  }, [schema, data]);

  return <div ref={containerRef} className={className} />;
}

export type { Form };
