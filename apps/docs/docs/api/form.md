# Classe `Form`

Importada de `@modern-form/renderer` (ou do pacote umbrella `modern-form`). É a API pública da biblioteca — deliberadamente próxima da API do form-js, para que uma migração troque o import e a folha de estilos, não a lógica de integração.

## Construtor

```ts
new Form(options: FormOptions)
```

```ts
interface FormOptions {
  container: HTMLElement
  schema?: FormSchema
  data?: FormData
  properties?: { readOnly?: boolean; [key: string]: unknown }
  additionalModules?: FieldTypeExtension[]
  classNames?: ClassNamesOption
}
```

Se `schema` for passado no construtor, `importSchema` é chamado automaticamente (sem precisares de a aguardar manualmente).

## Métodos

### `importSchema(schema, data?)`

```ts
importSchema(schema: FormSchema, data?: FormData): Promise<ImportResult>
```

Valida o schema (Zod + `SchemaLinter`) e renderiza a árvore de componentes. Rejeita a promise se houver um erro bloqueante de validação. Preenche valores por omissão (`defaultValue`) para chaves ainda não presentes em `data`.

```ts
interface ImportResult {
  schema: FormSchema
  data: FormData
  warnings: ImportWarning[]   // { code, path, message }[]
}
```

### `submit()`

```ts
submit(): { data: FormData; errors: ValidationErrors }
```

Corre o `Validator` sobre toda a árvore visível, re-renderiza com os erros atuais, e emite o evento `submit`.

### `validate()`

```ts
validate(): ValidationErrors
```

Igual a `submit()`, mas sem emitir o evento `submit` — útil para validar sem tentar enviar.

### `reset()`

```ts
reset(): void
```

Volta aos dados originalmente passados a `importSchema` (recalculando `defaultValue`), limpa os erros, e re-renderiza.

### `getData()`

```ts
getData(): FormData
```

### `setProperty(key, value)`

```ts
setProperty(key: string, value: unknown): void
```

Ex. `form.setProperty('readOnly', true)` torna todo o formulário só-leitura e re-renderiza.

### `attachTo(container)` / `detach()`

```ts
attachTo(container: HTMLElement): void
detach(): void
```

Move a raiz DOM do formulário entre contentores sem reimportar o schema.

### `destroy()`

```ts
destroy(): void
```

Destrói todas as instâncias de campo montadas, remove a raiz DOM, e limpa o `EventBus`. Chama sempre no cleanup do teu framework (`useEffect` return, `onBeforeUnmount`, etc.).

### `on(event, handler)` / `off(event, handler)`

```ts
on<E extends keyof FormEventMap>(event: E, handler: (payload: FormEventMap[E]) => void): void
off<E extends keyof FormEventMap>(event: E, handler: (payload: FormEventMap[E]) => void): void
```

## Eventos (`FormEventMap`)

| Evento | Payload | Quando |
| --- | --- | --- |
| `import.done` | `{ data, warnings }` | Depois de `importSchema` renderizar com sucesso. |
| `changed` | `{ data, field? }` | A cada alteração de valor por parte do utilizador. |
| `submit` | `{ data, errors }` | Em `submit()` (incl. via botão `action: "submit"`). |
| `field.errorsChanged` | `{ fieldId, errors }` | Quando os erros de um campo específico mudam. |
| `field.add` / `field.remove` | `{ field }` | Lifecycle de montagem/desmontagem de um componente. |
| `field.focus` / `field.blur` | `{ field }` | Foco entra/sai de um campo. |

## Tipos auxiliares

```ts
type FormData = Record<string, unknown>
type ValidationErrors = Record<string, string[]>
```
