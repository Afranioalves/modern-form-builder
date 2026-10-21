# Theming e customização

O requisito central do `modern-form` é ser **fluido**: deve ser possível customizar o visual sem fazer fork da biblioteca nem lutar contra especificidade CSS. Isto é resolvido em três camadas, da mais abrangente à mais granular.

## Tier 1 — Tokens CSS (`--mf-*`)

Toda decisão visual (cor, raio, espaçamento, tipografia, foco) é uma CSS custom property, definida em `@modern-form/tokens`:

```css
:root {
  --mf-color-primary: #2563eb;
  --mf-color-primary-hover: #1d4ed8;
  --mf-color-border: #d1d5db;
  --mf-color-border-focus: #3b82f6;
  --mf-color-error: #dc2626;
  --mf-color-text: #111827;
  --mf-color-text-muted: #6b7280;
  --mf-color-bg: #ffffff;
  --mf-color-bg-disabled: #f3f4f6;

  --mf-radius-sm: 0.25rem;
  --mf-radius-md: 0.375rem;
  --mf-radius-lg: 0.5rem;

  --mf-space-1: 0.25rem; /* … até --mf-space-8 */

  --mf-font-family: ui-sans-serif, system-ui, sans-serif;
  --mf-font-size-sm: 0.875rem;
  --mf-font-size-md: 1rem;
}
```

Retematiza a biblioteca inteira sem instalar nada e sem tocar em Tailwind:

```css
/* no teu CSS global, depois de importar @modern-form/renderer/styles.css */
:root {
  --mf-color-primary: #6d28d9;
  --mf-radius-md: 0.125rem;
}
```

Internamente, as classes Tailwind compiladas em `dist/styles.css` **referenciam** estas variáveis (ex. `border-(--mf-color-border)`) — nunca um valor literal fixo. É essa regra única que torna o sistema fluido: o teu override alcança todos os componentes de uma só vez.

## Tier 2 — Atributos `data-part` (sem JavaScript)

Cada elemento renderizado por cada componente carrega um `data-part` estável (e um `data-scope` com o tipo de campo), documentados caso a caso em cada [página de referência de componente](/componentes/):

```html
<div class="mf-field" data-scope="textfield" data-part="root">
  <label data-part="label" for="...">Nome</label>
  <input data-part="input" aria-describedby="..." />
  <p data-part="description">…</p>
  <p data-part="error" role="alert">…</p>
</div>
```

```css
[data-scope="textfield"][data-part="input"] {
  border-color: tomato;
}
```

Isto permite restyling preciso com CSS puro — sem passar por nenhuma API JavaScript.

## Tier 3 — Prop `classNames` (override ao nível de JS)

Para controlo exato por tipo de campo, passa um mapa de classes na construção do `Form`, indexado por tipo e por "parte":

```ts
new Form({
  container,
  classNames: {
    textfield: { input: 'focus:ring-2 focus:ring-purple-600' },
    button: { root: 'rounded-full' },
  },
})
```

As classes são **mescladas** com as classes internas por defeito, nunca substituídas — por isso as classes internas mantêm-se deliberadamente de baixa especificidade (utilitários Tailwind planos, nunca `!important`, nunca seletores aninhados), para que um override externo ganhe sem luta.

## Qual camada usar?

| Preciso de... | Usa |
| --- | --- |
| Mudar a cor/raio/espaçamento em toda a aplicação | Tier 1 — tokens CSS |
| Estilizar um tipo de elemento sem tocar em JS (ex. um CSS Module, um ficheiro `.css` à parte) | Tier 2 — `data-part` |
| Injetar classes utilitárias exatas por tipo de campo, vindas de código TypeScript | Tier 3 — `classNames` |

As três camadas são complementares, não mutuamente exclusivas — a maioria dos projetos só precisa da Tier 1.
