# Checkbox

Um único toggle booleano (`<input type="checkbox">` nativo).

## Schema

```json
{
  "id": "f-approved",
  "key": "approved",
  "label": "Aprovado",
  "type": "checkbox"
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` | `string` | Obrigatório. |
| `defaultValue` | `ToggleOrFeel<boolean>` | Valor inicial. |
| `validate` | `Validate` | `required` (exige que esteja marcado). |

## Saída HTML

```html
<div class="mf-field" data-scope="checkbox" data-part="root">
  <div>
    <input type="checkbox" data-part="input" aria-describedby="..." />
    <label data-part="label" for="...">Aprovado</label>
  </div>
  <p data-part="description">…</p>
  <p data-part="error" role="alert"></p>
</div>
```

## Classes customizáveis (`classNames.checkbox`)

| Parte | Elemento |
| --- | --- |
| `root` | `<div>` raiz |
| `input` | `<input type="checkbox">` |
| `label` | `<label>` |
| `description` | `<p>` de ajuda |
| `error` | `<p role="alert">` de erro |

## Usado em visibilidade condicional

`checkbox` é o tipo mais comum para controlar `conditional.hide` de outro campo — ver o exemplo em [início rápido](/guia/inicio-rapido#2-um-schema) e em [expressões FEEL](/conceitos/expressoes-feel#visibilidade-condicional).
