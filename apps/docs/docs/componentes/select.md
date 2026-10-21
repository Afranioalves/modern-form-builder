# Select

Escolha única, renderizada com `<select>` nativo — suporte a teclado e leitor de ecrã "de graça", sem reimplementar o padrão ARIA combobox.

## Schema

```json
{
  "id": "f-language",
  "key": "language",
  "label": "Idioma",
  "type": "select",
  "values": [
    { "label": "Português", "value": "pt" },
    { "label": "Inglês", "value": "en" }
  ]
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` | `string` | Obrigatório. |
| `values` | `SelectionOption[] \| FeelString` | Lista estática, ou expressão FEEL dinâmica. |
| `valuesKey` | `string` | Alternativa a `values`. |
| `searchable` | `boolean` | Lido do schema; a v1 ainda não implementa um combobox pesquisável — comporta-se como um `<select>` normal (ver roadmap em [visão geral de componentes](/componentes/#roadmap), próximo de `taglist`). |
| `defaultValue` | `ToggleOrFeel<string>` | `value` pré-selecionado. |
| `validate` | `Validate` | `required`. |

## Saída HTML

```html
<div class="mf-field" data-scope="select" data-part="root">
  <label data-part="label" for="...">Idioma</label>
  <select data-part="input">
    <option value="">—</option>
    <option value="pt">Português</option>
    <option value="en">Inglês</option>
  </select>
  <p data-part="error" role="alert"></p>
</div>
```

## Classes customizáveis (`classNames.select`)

Mesmas partes de [Textfield](/componentes/textfield#classes-customizáveis-classnames-textfield): `root`, `label`, `input`, `description`, `error`.
