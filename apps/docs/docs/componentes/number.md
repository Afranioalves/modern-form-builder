# Number

Input numérico nativo (`<input type="number">`). `validate.min`/`validate.max` são também aplicados como atributos `min`/`max` do input (restrição nativa do browser, além da validação do `Validator`).

## Schema

```json
{
  "id": "f-amount",
  "key": "amount",
  "label": "Montante",
  "type": "number",
  "decimalDigits": 2,
  "validate": { "required": true, "min": 0, "max": 100000 }
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` | `string` | Obrigatório. |
| `defaultValue` | `ToggleOrFeel<number>` | Valor inicial. |
| `decimalDigits` | `number` | Casas decimais — traduzido para o atributo `step` do input (`10 ** -decimalDigits`). |
| `validate` | `Validate` | `required`, `min`, `max`. |

## Saída HTML

```html
<div class="mf-field" data-scope="number" data-part="root">
  <label data-part="label" for="...">Montante</label>
  <input type="number" min="0" max="100000" step="0.01" data-part="input" />
  <p data-part="error" role="alert"></p>
</div>
```

## Classes customizáveis (`classNames.number`)

Mesmas partes de [Textfield](/componentes/textfield#classes-customizáveis-classnames-textfield): `root`, `label`, `input`, `description`, `error`.

## Nota de implementação

Um campo de texto vazio converte para `undefined` (não `NaN`) — assim um `number` vazio e não-obrigatório não dispara nenhuma validação de tipo.
