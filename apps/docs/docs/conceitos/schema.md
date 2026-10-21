# Formato do schema

Um formulário é descrito por um objeto JSON plano: metadados no topo, e uma árvore de `components`.

```json
{
  "type": "default",
  "id": "InvoiceForm",
  "schemaVersion": 12,
  "exporter": { "name": "Camunda Modeler", "version": "5.18.0" },
  "executionPlatform": "Camunda Cloud",
  "executionPlatformVersion": "8.5.0",
  "components": []
}
```

| Campo | Descrição |
| --- | --- |
| `type` | Sempre `"default"` — variante do formato do schema em si. |
| `id` | Identificador do formulário. |
| `schemaVersion` | Versão (inteira) do formato do schema, para migração futura. |
| `exporter` | Ferramenta que gerou o schema (ex. Camunda Modeler). Metadado de passagem. |
| `executionPlatform` / `executionPlatformVersion` | Motor alvo — `"Camunda Cloud"` para Zeebe/Camunda 8. |
| `components` | Array de componentes (ver abaixo). |

## Campos comuns a todos os componentes

```ts
type FeelString = `=${string}`
type ToggleOrFeel<T> = T | FeelString

interface ComponentBase {
  id: string
  key?: string                       // chave de data-binding (suporta "." para nesting)
  label?: ToggleOrFeel<string>
  layout?: { columns?: number | null; row?: string }
  conditional?: { hide?: FeelString }
  description?: ToggleOrFeel<string>
  disabled?: ToggleOrFeel<boolean>
  readonly?: ToggleOrFeel<boolean>
  properties?: Record<string, unknown>  // bag livre, ver "Extensões"
}
```

Qualquer campo do tipo `ToggleOrFeel<T>` aceita ou um valor literal (`"Nome"`, `true`) ou uma expressão FEEL dinâmica (`"=nome"`, `"=idade >= 18"`) — ver [expressões FEEL](/conceitos/expressoes-feel).

## Catálogo de tipos de componente

### Input

| Tipo | Campos próprios |
| --- | --- |
| [`textfield`](/componentes/textfield) | `key`, `defaultValue?`, `validate?` |
| [`textarea`](/componentes/textarea) | `key`, `defaultValue?`, `validate?` |
| [`number`](/componentes/number) | `key`, `defaultValue?`, `decimalDigits?`, `validate?` |
| [`datetime`](/componentes/datetime) | `key`, `subtype: "date" \| "time" \| "datetime"`, `dateLabel?`, `timeLabel?`, `timeSerializingFormat?`, `use24h?` |

### Seleção

| Tipo | Campos próprios |
| --- | --- |
| [`checkbox`](/componentes/checkbox) | `key`, `defaultValue?: boolean` |
| [`radio`](/componentes/radio) | `key`, `values: SelectionOption[]`, `defaultValue?: string` |
| [`select`](/componentes/select) | `key`, `values`, `searchable?`, `defaultValue?: string` |
| [`checklist`](/componentes/checklist) | `key`, `values`, `defaultValue?: string[]` |

### Apresentação

| Tipo | Campos próprios |
| --- | --- |
| [`text`](/componentes/text) | `text: ToggleOrFeel<string>` (markdown, sanitizado) |
| [`image`](/componentes/image) | `source: ToggleOrFeel<string>`, `alt?` |

### Layout e ações

| Tipo | Campos próprios |
| --- | --- |
| [`spacer`](/componentes/spacer) | `height?: number` |
| [`separator`](/componentes/separator) | — |
| [`button`](/componentes/button) | `action: "submit" \| "reset"` |
| `group` | `path?`, `components: FormComponent[]`, `showOutline?` |

`group` é estrutural: aninha uma subárvore de `components` e, se tiver `path`, aninha também os dados dos seus filhos sob esse caminho (ex. `path: "endereco"` + um filho com `key: "rua"` lê/escreve em `data.endereco.rua`).

::: tip Roadmap v1.1 / v2
`dynamiclist`, `table`, `taglist`, `expression` e `html` são reconhecidos pelo schema (`@modern-form/schema` tipa-os e valida-os), mas ainda renderizam como um placeholder na v1 do `@modern-form/renderer` — ver [roadmap de componentes](/componentes/#roadmap).
:::

## Validação em duas fases

`importSchema()` valida o schema antes de renderizar, em duas fases:

1. **Estrutural (Zod)** — forma do schema, tipos de cada campo. Erros aqui rejeitam a importação imediatamente, com uma mensagem apontando o caminho exato (`components[3].validate.max: esperado número`).
2. **Semântica (`SchemaLinter`)** — regras que o Zod sozinho não exprime: `validate.min > validate.max`, chaves de data-binding duplicadas, um `dynamiclist` sem `path`, um `pattern` regex inválido, um `type` desconhecido. Produz uma lista de `{ severity, code, path, message }` — **erros** bloqueiam a importação, **avisos** não (ver [`SchemaLinter`](/api/schema-linter)).

## Extensões próprias (`properties`)

Todo componente tem um `properties: Record<string, unknown>` livre, não interpretado pelo núcleo do `modern-form`. É aí que vivem metadados de extensões customizadas, sempre com um namespace para não colidir com o schema original — ver [compatibilidade com Camunda 8](/guia/compatibilidade-camunda#extensões-próprias-sempre-em-properties).
