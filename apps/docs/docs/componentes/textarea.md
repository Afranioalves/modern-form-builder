# Textarea

Input de texto multi-linha. Partilha a implementação com [Textfield](/componentes/textfield), [Number](/componentes/number) e [Datetime](/componentes/datetime) através da mesma fábrica interna (`createTextLikeFieldType`) — só muda a tag (`<textarea>`) e a (de)serialização de valor.

## Schema

```json
{
  "id": "f-note",
  "key": "note",
  "label": "Nota interna",
  "type": "textarea"
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` | `string` | Obrigatório. |
| `defaultValue` | `ToggleOrFeel<string>` | Valor inicial. |
| `validate` | `Validate` | `required`, `minLength`, `maxLength`, `pattern`. |

## Saída HTML

```html
<div class="mf-field" data-scope="textarea" data-part="root">
  <label data-part="label" for="...">Nota interna</label>
  <textarea rows="4" data-part="input" aria-describedby="..."></textarea>
  <p data-part="error" role="alert"></p>
</div>
```

## Classes customizáveis (`classNames.textarea`)

| Parte | Elemento |
| --- | --- |
| `root` | `<div>` raiz |
| `label` | `<label>` |
| `input` | `<textarea>` |
| `description` | `<p>` de ajuda |
| `error` | `<p role="alert">` de erro |
