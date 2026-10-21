# Button

Aciona `form.submit()` ou `form.reset()` — não precisas de ligar um handler manualmente, o clique já invoca o método correspondente na instância `Form`.

## Schema

```json
{ "id": "f-submit", "type": "button", "label": "Submeter", "action": "submit" }
```

```json
{ "id": "f-reset", "type": "button", "label": "Repor", "action": "reset" }
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `action` | `"submit" \| "reset"` | Obrigatório. |
| `label` | `ToggleOrFeel<string>` | Texto do botão — por omissão `"Submit"`/`"Reset"` se omitido. |

## Saída HTML

```html
<button type="button" data-scope="button" data-part="root">Submeter</button>
```

Um botão com `action: "submit"` ganha a cor primária (`--mf-color-primary`); um `"reset"` ganha um estilo neutro com contorno — ambos legíveis por tema claro/escuro através dos mesmos tokens.

## Classes customizáveis (`classNames.button`)

| Parte | Elemento |
| --- | --- |
| `root` | `<button>` |

## Múltiplos botões

Um schema pode ter vários botões (ex. "Submeter" e "Repor" lado a lado, como no [início rápido](/guia/inicio-rapido)) — cada um independentemente ligado à sua `action`.
