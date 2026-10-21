import { createApp, nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import type { FormSchema } from '@modern-form/schema';
import { ModernForm } from '../src/index.js';

const schema: FormSchema = {
  type: 'default',
  id: 'TestForm',
  schemaVersion: 12,
  components: [
    { id: 'f1', key: 'name', label: 'Name', type: 'textfield', validate: { required: true } },
  ],
};

describe('ModernForm (Vue)', () => {
  it('mounts the underlying Form and renders the schema', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(ModernForm, { schema, data: {} });
    app.mount(container);
    await nextTick();

    expect(container.querySelector('label')?.textContent).toContain('Name');
    expect(container.querySelector('input[type="text"]')).toBeTruthy();

    app.unmount();
  });
});
