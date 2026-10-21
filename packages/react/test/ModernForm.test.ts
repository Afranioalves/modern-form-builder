import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import type { FormSchema } from '@modern-form/schema';
import { ModernForm } from '../src/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const schema: FormSchema = {
  type: 'default',
  id: 'TestForm',
  schemaVersion: 12,
  components: [
    { id: 'f1', key: 'name', label: 'Name', type: 'textfield', validate: { required: true } },
  ],
};

describe('ModernForm (React)', () => {
  it('mounts the underlying Form and renders the schema', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(ModernForm, { schema, data: {} }));
    });

    expect(container.querySelector('label')?.textContent).toContain('Name');
    expect(container.querySelector('input[type="text"]')).toBeTruthy();

    act(() => root.unmount());
  });
});
