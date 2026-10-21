# React

```sh
pnpm add @modern-form/react react
```

`@modern-form/react` é um wrapper **fino**: monta a classe `Form` imperativa dentro de um `<div>` via `useEffect`, e reimporta o schema quando as props mudam. Nenhuma lógica de renderização, validação ou FEEL vive no React — tudo continua em `@modern-form/renderer`.

```tsx
import '@modern-form/renderer/styles.css'
import { ModernForm } from '@modern-form/react'
import type { FormSchema } from '@modern-form/schema'

const schema: FormSchema = {
  /* ... */
}

export function InvoicePage() {
  return (
    <ModernForm
      schema={schema}
      data={{ approved: false }}
      onSubmit={({ data, errors }) => {
        if (Object.keys(errors).length === 0) submitToZeebe(data)
      }}
      onChanged={({ data }) => console.log(data)}
    />
  )
}
```

## Props

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `schema` | `FormSchema` | Obrigatório. Reimporta automaticamente quando muda de referência. |
| `data` | `FormData` | Dados iniciais (ou para controlar o formulário ao mudar a referência). |
| `additionalModules` | `FieldTypeExtension[]` | Tipos de campo customizados — ver [extensibilidade](/conceitos/extensibilidade). |
| `classNames` | `ClassNamesOption` | Overrides de classe por tipo de campo — ver [theming](/conceitos/theming). |
| `properties` | `FormOptions['properties']` | Ex. `{ readOnly: true }`. |
| `className` | `string` | Classe aplicada ao `<div>` contentor. |
| `onSubmit` | `(payload: FormEventMap['submit']) => void` | Disparado pelo evento `submit` do `Form`. |
| `onChanged` | `(payload: FormEventMap['changed']) => void` | Disparado pelo evento `changed`. |
| `formRef` | `(form: Form \| null) => void` | Dá acesso direto à instância imperativa (`form.getData()`, `form.validate()`, …). |

## Aceder à instância `Form` diretamente

```tsx
import { useRef } from 'react'
import type { Form } from '@modern-form/react'

function Page() {
  const formRef = useRef<Form | null>(null)

  return (
    <>
      <ModernForm schema={schema} formRef={(f) => (formRef.current = f)} />
      <button onClick={() => formRef.current?.submit()}>Submeter</button>
    </>
  )
}
```
