# Instalação

## Pacote único

Para a maioria dos casos, instala o pacote umbrella `modern-form`, que reexporta tudo o que precisas de `@modern-form/renderer` e `@modern-form/schema`:

::: code-group

```sh [pnpm]
pnpm add modern-form
```

```sh [npm]
npm install modern-form
```

```sh [yarn]
yarn add modern-form
```

:::

A folha de estilos compilada (Tailwind + tokens) é um ficheiro separado, para que não sejas forçado a carregá-la se preferires os teus próprios estilos a partir de zero:

```ts
import '@modern-form/renderer/styles.css'
```

## Pacotes individuais

Se preferires controlar exatamente o que instalas (por exemplo, usar apenas o `@modern-form/schema` numa ferramenta de linha de comandos, sem o motor de renderização), instala os pacotes com scope diretamente:

| Pacote | Para quê |
| --- | --- |
| `@modern-form/schema` | Tipos TypeScript + validação Zod do schema. Sem dependência de DOM nem de FEEL. |
| `@modern-form/tokens` | Só os tokens CSS (`--mf-*`), para retematizar sem instalar o motor de renderização. |
| `@modern-form/core` | Motor de expressões FEEL, validação e registo de tipos de campo. Sem DOM. |
| `@modern-form/renderer` | O motor de renderização DOM + a classe pública `Form` + `dist/styles.css`. |
| `@modern-form/react` | Wrapper `<ModernForm>` para React (`react` como peer dependency). |
| `@modern-form/vue` | Wrapper `<ModernForm>` para Vue 3 (`vue` como peer dependency). |

```sh
pnpm add @modern-form/renderer @modern-form/schema
```

## Requisitos

- **Node.js 20+** (desenvolvimento/build apenas — a biblioteca em si corre no browser).
- **TypeScript 5.6+** recomendado, mas não obrigatório — a biblioteca é publicada com declarações `.d.ts` completas.
- Nenhuma dependência de Tailwind CSS no teu projeto: o `styles.css` já vem compilado. Se quiseres customizar visualmente, consulta [theming e customização](/conceitos/theming).

## Próximo passo

Continua para o [início rápido](/guia/inicio-rapido) para renderizar o teu primeiro formulário.
