# Spacer

Espaço em branco entre campos — útil para reservar espaço de layout mesmo quando um campo vizinho está condicionalmente escondido, evitando que o grid "salte".

## Schema

```json
{
  "id": "f-gap",
  "type": "spacer",
  "height": 24
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `height` | `number` | Altura em pixels. Por omissão, `16`. |

## Saída HTML

```html
<div data-scope="spacer" data-part="root" aria-hidden="true" style="height: 24px"></div>
```

::: info
Ao contrário dos outros componentes, `spacer` ainda não expõe uma `classNames.spacer.root` — é um elemento puramente dimensional, sem texto nem interação, pelo que normalmente basta a prop `height`.
:::
