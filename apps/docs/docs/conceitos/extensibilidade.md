# Extensibilidade

## O registo de tipos de campo

Cada tipo de componente (`textfield`, `select`, ...) é um `type` string ligado a um bundle de renderização no `FieldTypeRegistry`. Registar um novo bundle sob um `type` existente **sobrepõe completamente** o tipo nativo — "o último registo vence", sem nenhuma API especial para esse caso.

```ts
import type { FieldTypeExtension } from '@modern-form/core'
import type { FormComponent } from '@modern-form/schema'

interface RatingComponent extends FormComponent {
  type: 'rating'
  key: string
  max?: number
}

const ratingFieldType: FieldTypeExtension<RatingComponent> = {
  type: 'rating',
  config: {
    label: 'Classificação',
    keyed: true,
    group: 'custom',
    create: (defaults) => ({ id: '', type: 'rating', key: '', ...defaults }),
  },
  render: ({ component, value, errors }) => {
    // devolve o que o teu motor de renderização espera (ver nota abaixo)
  },
  validator: (value, component, ctx) => {
    return typeof value === 'number' && value >= 1 ? [] : ['Escolhe uma classificação.']
  },
}
```

## Registar a extensão

```ts
import { Form } from '@modern-form/renderer'

const form = new Form({
  container,
  additionalModules: [ratingFieldType],
})
```

`additionalModules` é passado na construção do `Form` — cada extensão é registada no `FieldTypeRegistry` interno, e o seu `evaluator`/`validator` (se existirem) são ligados aos serviços partilhados `Evaluator`/`Validator`.

::: warning `render` é específico do `@modern-form/renderer`
O contrato de `render` em `@modern-form/core` é deliberadamente genérico (`(props) => unknown`) para não acoplar o núcleo a nenhuma tecnologia de DOM. O `@modern-form/renderer` espera que `render` devolva um objeto `{ el, update, destroy }` (um "mount result" DOM) — consulta o código-fonte de um componente nativo (ex. `packages/renderer/src/components/checkbox.ts`) como referência exata do contrato interno antes de escrever um tipo de campo customizado.
:::

## EventBus e Injector próprios

O `modern-form` usa um `EventBus` e um `Injector` (container de injeção de dependências) escritos à mão, em vez de adotar `didi`/`diagram-js` como o form-js faz. Essa infraestrutura foi desenhada para **editores de diagramas** (command stack, undo/redo, viewport) — um renderizador de formulários não precisa de nada disso. A convenção `$inject` (`MinhaClasse.$inject = ['eventBus', 'form']`) é preservada por familiaridade com quem já portou plugins do form-js, mas o container é código próprio e pequeno.

## Eventos disponíveis

```ts
interface FormEventMap {
  'import.done': { data: FormData; warnings: ImportWarning[] }
  changed: { data: FormData; field?: { id: string; key?: string } }
  submit: { data: FormData; errors: ValidationErrors }
  'field.errorsChanged': { fieldId: string; errors: string[] }
  'field.add': { field: FormComponent }
  'field.remove': { field: FormComponent }
  'field.focus': { field: FormComponent }
  'field.blur': { field: FormComponent }
}
```

```ts
form.on('field.focus', ({ field }) => console.log('em foco:', field.id))
```

## O que vive em `@modern-form/schema` vs `@modern-form/core`

| Pacote | Responsabilidade |
| --- | --- |
| `@modern-form/schema` | Apenas o contrato de dados (tipos + Zod + `SchemaLinter`). Zero DOM, zero FEEL. |
| `@modern-form/core` | EventBus, Injector, motor FEEL, `DataContext`, `Evaluator`/`Validator`, `FieldTypeRegistry`. Zero DOM. |
| `@modern-form/renderer` | A única camada que sabe criar elementos DOM. Consome `core` + `tokens`, expõe a classe `Form`. |

Esta separação permite, por exemplo, construir uma CLI de lint de schemas dependendo só de `@modern-form/schema`, sem arrastar o motor FEEL nem nenhum código de DOM.
