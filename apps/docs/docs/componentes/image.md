# Image

Exibe uma imagem — sem `key`, puramente apresentacional. `source` suporta a convenção [toggle-or-FEEL](/conceitos/expressoes-feel#a-convenção-), para uma origem calculada (ex. um logótipo vindo de uma variável de processo).

## Schema

```json
{
  "id": "f-logo",
  "type": "image",
  "source": "=logo",
  "alt": "Logótipo da empresa"
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `source` | `ToggleOrFeel<string>` | Obrigatório. URL ou, se prefixado com `=`, uma expressão FEEL resolvida para a URL/base64. |
| `alt` | `string` | Texto alternativo. |

## Saída HTML

```html
<div class="mf-field" data-scope="image" data-part="root">
  <img data-part="image" src="..." alt="Logótipo da empresa" />
</div>
```

## Classes customizáveis (`classNames.image`)

| Parte | Elemento |
| --- | --- |
| `root` | `<div>` raiz |
| `image` | `<img>` |
