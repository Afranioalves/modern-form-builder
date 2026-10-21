import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { PropType } from 'vue';
import { Form } from '@modern-form/renderer';
import type { ClassNamesOption, FieldTypeExtension, FormData, FormOptions } from '@modern-form/renderer';
import type { FormSchema } from '@modern-form/schema';

/**
 * Thin Vue 3 wrapper (SPECIFICATION.md section 2): mounts the framework-agnostic `Form` class
 * into a plain `<div>` and re-imports the schema when `schema`/`data` change. All rendering,
 * validation and FEEL evaluation still happens inside `@modern-form/renderer`.
 */
export const ModernForm = defineComponent({
  name: 'ModernForm',
  props: {
    schema: { type: Object as PropType<FormSchema>, required: true },
    data: { type: Object as PropType<FormData>, default: () => ({}) },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    additionalModules: { type: Array as PropType<FieldTypeExtension<any>[]>, default: () => [] },
    classNames: { type: Object as PropType<ClassNamesOption>, default: undefined },
    properties: { type: Object as PropType<FormOptions['properties']>, default: undefined },
  },
  emits: ['submit', 'changed'],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    let form: Form | null = null;

    onMounted(() => {
      if (!containerRef.value) return;
      form = new Form({
        container: containerRef.value,
        additionalModules: props.additionalModules,
        classNames: props.classNames,
        properties: props.properties,
      });
      form.on('submit', (payload) => emit('submit', payload));
      form.on('changed', (payload) => emit('changed', payload));
      void form.importSchema(props.schema, props.data);
    });

    watch(
      () => [props.schema, props.data],
      () => {
        void form?.importSchema(props.schema, props.data ?? {});
      },
    );

    onBeforeUnmount(() => {
      form?.destroy();
      form = null;
    });

    expose({ getForm: () => form });

    return () => h('div', { ref: containerRef });
  },
});

export type { Form };
