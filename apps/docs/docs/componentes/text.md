# Text

Conteúdo puramente apresentacional — **não** tem `key`, não lê nem escreve dados. Renderiza Markdown, sanitizado com DOMPurify antes de ser inserido no DOM.

## Schema

```json
{
  "id": "intro",
  "type": "text",
  "text": "# Fatura\nPreencha os dados abaixo. O campo **Aprovado por** só aparece depois de marcar \"Aprovado\"."
}
```

## Props

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `text` | `ToggleOrFeel<string>` | Obrigatório. Conteúdo Markdown — processado por `marked` e sanitizado por `DOMPurify` antes de ser inserido via `innerHTML`. |

## Saída HTML

```html
<div class="mf-field" data-scope="text" data-part="root">
  <div data-part="content"><!-- HTML do Markdown já sanitizado --></div>
</div>
```

## Classes customizáveis (`classNames.text`)

| Parte | Elemento |
| --- | --- |
| `root` | `<div>` raiz |
| `content` | `<div>` com o HTML renderizado |

## Segurança

O conteúdo passa sempre por `DOMPurify.sanitize()` antes de ser inserido — mesmo que `text` venha de uma expressão FEEL dinâmica ou de um schema não confiável, não é possível injetar `<script>` nem atributos de evento (`onclick`, etc.).
