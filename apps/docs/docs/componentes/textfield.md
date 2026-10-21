# Textfield

Input de texto de uma linha. O tipo de campo mais básico — a maioria dos schemas reais usa-o para nomes, identificadores, campos de texto livre curto.

## Schema

```json
{
  "id": "f-creditor",
  "key": "creditor",
  "label": "Credor",
  "type": "textfield",
  "description": "Nome legal da entidade",
  "defaultValue": "",
  "validate": { "required": true, "pattern": "^[A-Za-zÀ-ÿ ]+$" }
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` | `string` | Obrigatório — chave de data-binding. |
| `defaultValue` | `ToggleOrFeel<string>` | Valor inicial se os dados importados não tiverem esta chave. |
| `validate` | `Validate` | `required`, `minLength`, `maxLength`, `pattern`, `validationType: "email" \| "phone"`. |

Além destes, aceita todos os [campos comuns](/conceitos/schema#campos-comuns-a-todos-os-componentes) (`label`, `description`, `disabled`, `readonly`, `conditional`, `layout`).

## Saída HTML

```html
<div class="mf-field" data-scope="textfield" data-part="root">
  <label data-part="label" for="...">Credor</label>
  <input type="text" data-part="input" aria-describedby="..." />
  <p data-part="description">Nome legal da entidade</p>
  <p data-part="error" role="alert"></p>
</div>
```

## Classes customizáveis (`classNames.textfield`)

| Parte | Elemento |
| --- | --- |
| `root` | `<div>` raiz |
| `label` | `<label>` |
| `input` | `<input type="text">` |
| `description` | `<p>` de ajuda |
| `error` | `<p role="alert">` de erro |

## Acessibilidade

`<label for>` associado ao `id` do input; `aria-describedby` liga a descrição e a mensagem de erro; `aria-required="true"` quando `validate.required`; `aria-invalid="true"` quando há erros.
