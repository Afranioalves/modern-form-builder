# Radio

Escolha única entre uma lista pequena de opções, renderizada com `<input type="radio">` nativos partilhando o mesmo `name` — isso dá navegação por setas e roving-tabindex "de graça", sem nenhum JavaScript extra de acessibilidade.

## Schema

```json
{
  "id": "f-product",
  "key": "product",
  "label": "Produto",
  "type": "radio",
  "values": [
    { "label": "Camunda Platform", "value": "camunda-platform" },
    { "label": "Camunda Cloud", "value": "camunda-cloud" }
  ]
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` | `string` | Obrigatório. |
| `values` | `SelectionOption[] \| FeelString` | Lista estática, ou uma expressão FEEL que resolve para um array de `{ label, value }`. |
| `valuesKey` | `string` | Alternativa a `values`: referencia uma variável externa com as opções (por resolver no contexto de dados). |
| `defaultValue` | `ToggleOrFeel<string>` | `value` pré-selecionado. |
| `validate` | `Validate` | `required`. |

## Saída HTML

```html
<div class="mf-field" data-scope="radio" data-part="root">
  <div data-part="label">Produto</div>
  <div role="radiogroup" aria-labelledby="...">
    <div><input type="radio" data-part="input" name="..." value="camunda-platform" /><label>Camunda Platform</label></div>
    <div><input type="radio" data-part="input" name="..." value="camunda-cloud" /><label>Camunda Cloud</label></div>
  </div>
  <p data-part="error" role="alert"></p>
</div>
```

## Classes customizáveis (`classNames.radio`)

| Parte | Elemento |
| --- | --- |
| `root` | `<div>` raiz |
| `label` | legenda do grupo |
| `input` | cada `<input type="radio">` |
| `description` | `<p>` de ajuda |
| `error` | `<p role="alert">` de erro |

::: tip Precisas de mais do que algumas opções?
Para listas grandes com pesquisa, usa [Select](/componentes/select) em vez de `radio`. Para seleção múltipla, ver [Checklist](/componentes/checklist).
:::
