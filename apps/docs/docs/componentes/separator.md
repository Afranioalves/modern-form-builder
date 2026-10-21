# Separator

Linha divisória visual entre secções de um formulário.

## Schema

```json
{ "id": "f-sep", "type": "separator" }
```

## Props

Nenhuma além dos [campos comuns](/conceitos/schema#campos-comuns-a-todos-os-componentes) (que, para um separador, raramente fazem sentido além de `conditional`).

## Saída HTML

```html
<hr data-scope="separator" data-part="root" />
```

## Classes customizáveis (`classNames.separator`)

| Parte | Elemento |
| --- | --- |
| `root` | `<hr>` |
