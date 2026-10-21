# Checklist

Seleção múltipla a partir de uma lista pequena, renderizada como um grupo de `<input type="checkbox">`. O valor é sempre um array de strings.

## Schema

```json
{
  "id": "f-mailto",
  "key": "mailto",
  "label": "Enviar dados para",
  "type": "checklist",
  "values": [
    { "label": "Aprovador", "value": "approver" },
    { "label": "Gestor", "value": "manager" },
    { "label": "Gestor regional", "value": "regional-manager" }
  ]
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` | `string` | Obrigatório. |
| `values` | `SelectionOption[] \| FeelString` | Lista estática, ou expressão FEEL dinâmica. |
| `valuesKey` | `string` | Alternativa a `values`. |
| `defaultValue` | `ToggleOrFeel<string[]>` | Valores pré-selecionados. |
| `validate` | `Validate` | `required` (exige pelo menos uma opção marcada). |

## Saída HTML

```html
<div class="mf-field" data-scope="checklist" data-part="root">
  <div data-part="label">Enviar dados para</div>
  <div role="group" aria-labelledby="...">
    <div><input type="checkbox" data-part="input" value="approver" /><label>Aprovador</label></div>
    <div><input type="checkbox" data-part="input" value="manager" /><label>Gestor</label></div>
    <div><input type="checkbox" data-part="input" value="regional-manager" /><label>Gestor regional</label></div>
  </div>
  <p data-part="error" role="alert"></p>
</div>
```

## Classes customizáveis (`classNames.checklist`)

| Parte | Elemento |
| --- | --- |
| `root` | `<div>` raiz |
| `label` | legenda do grupo |
| `input` | cada `<input type="checkbox">` |
| `description` | `<p>` de ajuda |
| `error` | `<p role="alert">` de erro |

::: tip Para listas grandes
`checklist` é pensado para poucas opções visíveis de uma vez. Para conjuntos maiores com seleção múltipla, o tipo `taglist` (v1.1) oferece uma UI em formato de tags — ver [roadmap](/componentes/#roadmap).
:::
