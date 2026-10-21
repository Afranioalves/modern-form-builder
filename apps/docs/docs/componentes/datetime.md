# Datetime

Data, hora, ou ambos — escolhido pelo campo `subtype`. A v1 renderiza cada subtipo com o `<input>` nativo correspondente, garantindo entrada direta por teclado (não só por um seletor visual), conforme o padrão APG de datepicker.

## Schema

```json
{
  "id": "f-conversation",
  "key": "conversationAt",
  "label": "Data da conversa",
  "type": "datetime",
  "subtype": "date"
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `key` | `string` | Obrigatório. |
| `subtype` | `"date" \| "time" \| "datetime"` | Obrigatório — mapeia para `<input type="date">`, `"time"` ou `"datetime-local"`. |
| `dateLabel` / `timeLabel` | `string` | Rótulos separados para a parte de data/hora (reservado para uma futura UI combinada). |
| `timeInterval` | `number` | Minutos entre opções de hora — traduzido para o atributo `step` (`timeInterval * 60`). |
| `timeSerializingFormat` | `"utc_offset" \| "utc_normalized"` | Lido, mas a normalização de fuso horário ainda não é aplicada na v1 (ver nota abaixo). |
| `use24h` | `boolean` | Lido, mas o formato de exibição ainda segue o do `<input>` nativo do browser/SO. |
| `validate` | `Validate` | `required`. |

::: info Simplificação da v1
`timeSerializingFormat` e `use24h` são lidos do schema mas ainda não alteram o comportamento do input nativo — tratados como um refinamento de v1.1. Para a maioria dos casos (capturar uma data/hora local), o `<input>` nativo já é suficiente.
:::

## Saída HTML

```html
<div class="mf-field" data-scope="datetime" data-part="root">
  <label data-part="label" for="...">Data da conversa</label>
  <input type="date" data-part="input" />
  <p data-part="error" role="alert"></p>
</div>
```

## Classes customizáveis (`classNames.datetime`)

Mesmas partes de [Textfield](/componentes/textfield#classes-customizáveis-classnames-textfield): `root`, `label`, `input`, `description`, `error`.
