import '@modern-form/renderer/styles.css';
import './page.css';
import { Form } from '@modern-form/renderer';
import { invoiceSchema } from './schema.js';

const containerEl = document.getElementById('app');
const outputEl = document.getElementById('output');
if (!containerEl || !outputEl) {
  throw new Error('playground: expected #app and #output elements in index.html');
}
const container: HTMLElement = containerEl;
const output: HTMLElement = outputEl;

function printEvent(label: string, payload: unknown): void {
  output.textContent = `[${label}]\n${JSON.stringify(payload, null, 2)}`;
}

const form = new Form({ container });

form.on('submit', (result) => printEvent('submit', result));
form.on('changed', (result) => printEvent('changed', result));
form.on('import.done', (result) => printEvent('import.done', result));

await form.importSchema(invoiceSchema, { approved: false });
