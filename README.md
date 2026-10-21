# modern-form

Biblioteca **TypeScript + Tailwind CSS** para renderizar formulários dinâmicos a partir de um schema JSON — compatível com o mesmo formato usado pelo [Camunda 8 / Zeebe](https://camunda.com) (o formato do [bpmn-io/form-js](https://github.com/bpmn-io/form-js)). Expressões **FEEL** nativas, validação em duas velocidades, e um sistema de theming totalmente fluido em três camadas.

> Projeto em desenvolvimento ativo (v1). Ver [roadmap](#roadmap) e a [especificação técnica](./SPECIFICATION.md) completa.

## Um formulário, três linhas

```ts
import { Form } from '@modern-form/renderer'
import '@modern-form/renderer/styles.css'

const form = new Form({ container: document.getElementById('app')! })
await form.importSchema(schema, { approved: false })

form.on('submit', ({ data, errors }) => console.log(data, errors))
```

`schema` é o mesmo JSON que o Camunda Modeler exporta para um User Task — sem transformação, sem conversão.

## Porquê

- 🧩 **Compatível com Camunda 8** — importa diretamente o schema do form-js, sem campos proprietários no topo.
- 🧠 **Expressões FEEL nativas** — visibilidade condicional, valores computados e opções dinâmicas avaliados com [`@bpmn-io/feelin`](https://github.com/bpmn-io/feelin), a mesma linguagem que o Camunda usa em BPMN e DMN.
- 🎨 **Theming em 3 camadas** — tokens CSS, atributos `data-part` e a prop `classNames`: customiza sem forks e sem lutar contra especificidade.
- ✅ **Validação em duas velocidades** — feedback em tempo real e validação autoritativa no submit, partilhando sempre as mesmas regras puras.
- ⚛️ **Agnóstico de framework** — núcleo TypeScript puro com uma API imperativa, mais wrappers finos para React e Vue.
- 🔌 **Totalmente extensível** — regista os teus próprios tipos de campo; o registo usa "o último registo vence", permitindo até substituir tipos nativos.

## Instalação

```sh
pnpm add modern-form
# ou, com pacotes individuais:
pnpm add @modern-form/renderer @modern-form/schema
```

Ver [documentação completa de instalação](./apps/docs/docs/guia/instalacao.md).

## Documentação

📖 **[Documentação completa](./apps/docs)** (VitePress) — guia de instalação, conceitos (schema, FEEL, validação, extensibilidade, theming), integrações de framework, e referência de todos os componentes e da API.

```sh
cd apps/docs
npm install
npm run dev
```

📄 **[SPECIFICATION.md](./SPECIFICATION.md)** — a especificação técnica/arquitetural completa que serviu de base à implementação.

## Estrutura do monorepo

| Pacote | Descrição |
| --- | --- |
| [`@modern-form/schema`](./packages/schema) | Tipos TypeScript + validação Zod do schema de formulário. Sem dependência de DOM nem de FEEL. |
| [`@modern-form/tokens`](./packages/tokens) | Design tokens em CSS custom properties (`--mf-*`). |
| [`@modern-form/core`](./packages/core) | Motor de expressões FEEL, data-binding, validação e registo de tipos de campo. Sem DOM. |
| [`@modern-form/renderer`](./packages/renderer) | Motor de renderização DOM com Tailwind CSS + a classe pública `Form`. |
| [`@modern-form/react`](./packages/react) | Wrapper `<ModernForm>` para React. |
| [`@modern-form/vue`](./packages/vue) | Wrapper `<ModernForm>` para Vue 3. |
| [`modern-form`](./packages/umbrella) | Pacote de conveniência que reexporta `renderer` + `schema`. |
| [`apps/playground`](./apps/playground) | App Vite de demonstração. |
| [`apps/docs`](./apps/docs) | Site de documentação (VitePress). |

## Desenvolvimento

Requer **Node.js 20+** e **pnpm** (ativado via `corepack enable pnpm`).

```sh
pnpm install
pnpm build       # build de todos os pacotes (via Turborepo)
pnpm test        # testes (Vitest)
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit em todos os pacotes
pnpm dev         # modo watch
```

> `apps/docs` não faz parte do workspace pnpm — instala-se separadamente com `npm` (ver o motivo no [README do pacote](./apps/docs/README.md)).

## Roadmap

| Versão | Conteúdo |
| --- | --- |
| **v1** (atual) | Pacotes `schema`, `tokens`, `core`, `renderer`, `react`, `vue`; 13 tipos de campo (textfield, textarea, number, datetime, checkbox, radio, select, checklist, text, image, spacer, separator, button); motor FEEL completo; theming em 3 camadas; compatibilidade direta com o schema do Camunda 8 |
| **v1.1** | `taglist`, `dynamiclist`, `table`, `expression`, `html` |
| **v2** | `iframe`, `documentPreview`, `filepicker` (com adaptadores de upload plugáveis); i18n completo; possível editor visual |

Ver o catálogo completo de componentes e o roadmap detalhado em [SPECIFICATION.md](./SPECIFICATION.md#8-catálogo-de-componentes--v1-vs-v11v2).

## Licença

MIT
