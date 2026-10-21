# Início rápido

Esta página monta um formulário completo em poucos passos: um schema JSON, um contentor no DOM, e a classe `Form`.

## 1. Um elemento no DOM

```html
<div id="form-container"></div>
```

## 2. Um schema

O schema é **o mesmo formato** que o Camunda Modeler produz para um User Task — podes copiar um schema exportado do Modeler diretamente, sem conversão. Aqui está um exemplo mínimo escrito à mão:

```ts
import type { FormSchema } from '@modern-form/schema'

const schema: FormSchema = {
  type: 'default',
  id: 'InvoiceForm',
  schemaVersion: 12,
  components: [
    {
      id: 'f-creditor',
      key: 'creditor',
      label: 'Credor',
      type: 'textfield',
      validate: { required: true },
    },
    {
      id: 'f-amount',
      key: 'amount',
      label: 'Montante',
      type: 'number',
      validate: { min: 0, required: true },
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
      id: 'f-submit',
      type: 'button',
      label: 'Submeter',
      action: 'submit',
    },
  ],
}
```

Repara no campo `conditional.hide`: `=approved = false` é uma expressão **FEEL** (o prefixo `=` marca qualquer string como uma expressão dinâmica em vez de um valor literal — ver [expressões FEEL](/conceitos/expressoes-feel)). O campo "Aprovado por" só aparece quando o checkbox "Aprovado" está marcado.

## 3. Monta o formulário

```ts
import { Form } from '@modern-form/renderer'
import '@modern-form/renderer/styles.css'

const container = document.getElementById('form-container')!
const form = new Form({ container })

await form.importSchema(schema, { approved: false })
```

`importSchema` valida o schema (estruturalmente com Zod, semanticamente com o `SchemaLinter`) antes de renderizar — se houver um erro bloqueante (ex. uma chave de dados duplicada), a promise rejeita e nada é renderizado. Avisos não bloqueantes (ex. uma versão de schema mais recente do que a suportada) ficam disponíveis em `ImportResult.warnings`.

## 4. Reage aos eventos

```ts
form.on('changed', ({ data }) => {
  console.log('dados atuais:', data)
})

form.on('submit', ({ data, errors }) => {
  if (Object.keys(errors).length === 0) {
    console.log('submetido com sucesso:', data)
  } else {
    console.log('erros de validação:', errors)
  }
})
```

O botão `action: "submit"` do schema já chama `form.submit()` internamente — não precisas de ligar um `onClick` manualmente.

## 5. Lê ou define dados programaticamente

```ts
form.getData()                       // -> o objeto de dados atual
form.setProperty('readOnly', true)   // torna o formulário inteiro só-leitura
form.validate()                      // força uma passagem de validação sem submeter
form.reset()                         // volta aos dados originalmente importados
```

## A seguir

- [Formato do schema](/conceitos/schema) — o catálogo completo de tipos de componente.
- [Validação](/conceitos/validacao) — como funcionam as regras `validate` e os validadores customizados.
- [React](/frameworks/react) ou [Vue](/frameworks/vue) — se preferires um wrapper de componente em vez da API imperativa.
