import type { FormSchema } from '@modern-form/schema';

/** The invoice example from SPECIFICATION.md section 3.1, adapted to the v1 component catalog. */
export const invoiceSchema: FormSchema = {
  type: 'default',
  id: 'InvoiceForm',
  schemaVersion: 12,
  exporter: { name: 'Camunda Modeler', version: '5.18.0' },
  executionPlatform: 'Camunda Cloud',
  executionPlatformVersion: '8.5.0',
  components: [
    {
      id: 'intro',
      type: 'text',
      text: '# Fatura\nPreencha os dados abaixo. O campo **Aprovado por** só aparece depois de marcar "Aprovado".',
    },
    {
      id: 'f-creditor',
      key: 'creditor',
      label: 'Credor',
      type: 'textfield',
      validate: { required: true },
    },
    {
      id: 'f-invoice-number',
      key: 'invoiceNumber',
      label: 'Número da fatura',
      description: 'Formato: C-123',
      type: 'textfield',
      validate: { pattern: '^C-[0-9]+$', required: true },
    },
    {
      id: 'f-amount',
      key: 'amount',
      label: 'Montante',
      type: 'number',
      validate: { min: 0, max: 100000, required: true },
    },
    {
      id: 'f-approved',
      key: 'approved',
      label: 'Aprovado',
      type: 'checkbox',
    },
    {
      id: 'f-approved-by',
      key: 'approvedBy',
      label: 'Aprovado por',
      type: 'textfield',
      conditional: { hide: '=approved = false' },
    },
    {
      id: 'f-product',
      key: 'product',
      label: 'Produto',
      type: 'radio',
      values: [
        { label: 'Camunda Platform', value: 'camunda-platform' },
        { label: 'Camunda Cloud', value: 'camunda-cloud' },
      ],
    },
    {
      id: 'f-language',
      key: 'language',
      label: 'Idioma',
      type: 'select',
      values: [
        { label: 'Português', value: 'pt' },
        { label: 'Inglês', value: 'en' },
      ],
    },
    {
      id: 'f-group',
      type: 'group',
      label: 'Detalhes adicionais',
      path: 'details',
      components: [
        {
          id: 'f-note',
          key: 'note',
          label: 'Nota interna',
          type: 'textarea',
        },
        {
          id: 'f-conversation',
          key: 'conversationAt',
          type: 'datetime',
          subtype: 'date',
          label: 'Data da conversa',
        },
      ],
    },
    { id: 'f-separator', type: 'separator' },
    {
      id: 'f-submit',
      type: 'button',
      label: 'Submeter',
      action: 'submit',
    },
    {
      id: 'f-reset',
      type: 'button',
      label: 'Repor',
      action: 'reset',
    },
  ],
};
