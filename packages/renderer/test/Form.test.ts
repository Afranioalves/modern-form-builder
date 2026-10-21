import { beforeEach, describe, expect, it } from 'vitest';
import type { FormSchema } from '@modern-form/schema';
import { Form } from '../src/Form.js';

const schema: FormSchema = {
  type: 'default',
  id: 'InvoiceForm',
  schemaVersion: 12,
  components: [
    {
      id: 'f1',
      key: 'creditor',
      label: 'Creditor',
      type: 'textfield',
      validate: { required: true },
    },
    {
      id: 'f2',
      key: 'approved',
      label: 'Approved',
      type: 'checkbox',
    },
    {
      id: 'f3',
      key: 'approvedBy',
      label: 'Approved By',
      type: 'textfield',
      conditional: { hide: '=approved = false' },
    },
    {
      id: 'f4',
      type: 'button',
      label: 'Submit',
      action: 'submit',
    },
  ],
};

describe('Form', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders labeled inputs for every visible component', async () => {
    const form = new Form({ container });
    await form.importSchema(schema, {});

    expect(container.querySelector('label')?.textContent).toContain('Creditor');
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
    expect(container.querySelector('input[type="checkbox"]')).toBeTruthy();
  });

  it('hides a conditionally-hidden field until its condition becomes true', async () => {
    const form = new Form({ container });
    await form.importSchema(schema, { approved: false });

    expect(container.textContent).not.toContain('Approved By');

    const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(container.textContent).toContain('Approved By');
  });

  it('reports a required-field error on submit and clears it once filled in', async () => {
    const form = new Form({ container });
    await form.importSchema(schema, {});

    const { errors } = form.submit();
    expect(errors.creditor).toBeDefined();

    const input = container.querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = 'ACME Corp';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const { errors: errorsAfter } = form.submit();
    expect(errorsAfter.creditor).toBeUndefined();
    expect(form.getData().creditor).toBe('ACME Corp');
  });

  it('emits a submit event with the current data and errors', async () => {
    const form = new Form({ container });
    await form.importSchema(schema, { creditor: 'ACME' });

    let captured: unknown;
    form.on('submit', (payload) => {
      captured = payload;
    });

    const button = container.querySelector<HTMLButtonElement>('button')!;
    button.click();

    expect(captured).toMatchObject({ data: { creditor: 'ACME' }, errors: {} });
  });

  it('resets to the originally imported data', async () => {
    const form = new Form({ container });
    await form.importSchema(schema, { creditor: 'ACME' });

    const input = container.querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = 'Changed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(form.getData().creditor).toBe('Changed');

    form.reset();
    expect(form.getData().creditor).toBe('ACME');
  });

  it('rejects a structurally invalid schema', async () => {
    const form = new Form({ container });
    await expect(
      form.importSchema({ ...schema, components: [{ id: 'bad', type: 'textfield' } as never] }),
    ).rejects.toThrow();
  });

  it('destroy() empties the container', async () => {
    const form = new Form({ container });
    await form.importSchema(schema, {});
    expect(container.children.length).toBeGreaterThan(0);

    form.destroy();
    expect(container.children.length).toBe(0);
  });
});
