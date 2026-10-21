# Histórico do projeto — modern-form

> Registo da conversa/sessão de desenvolvimento que deu origem a este repositório, para contexto em sessões futuras (com o Claude Code ou com qualquer outra pessoa/ferramenta que retome o projeto).

**Repositório:** https://github.com/Afranioalves/modern-form-builder
**Período:** 2026-10-21 (sessão única, de conceção a scaffold funcional + documentação)

---

## 1. Pedido inicial

> "pretendo criar uma lib semelhante ao bpmn-form-js (bpmn-io/form-js), com inputs, textarea, select modernos, e base de estilo deve ser o tailwindcss, usando também o typescript [...] essa lib consiste para a renderização de formulários dinâmicos provenientes de motores de orquestração como camunda, quero que cries um ficheiro de especificações depois de ler todos os requisitos necessários."

Decisões confirmadas pelo utilizador logo no início (via perguntas de clarificação):

| Decisão | Escolha |
| --- | --- |
| Arquitetura de renderização | Core agnóstico de framework + wrappers finos React/Vue |
| Motor/schema alvo | Camunda 8 / Zeebe (mesmo formato JSON do form-js) |
| Âmbito da v1 | Apenas o renderizador — sem editor visual drag-and-drop |
| Estilo | CSS pré-compilado, mas **fluido**: o consumidor tem de poder sobrepor estilos facilmente |
| Idioma da especificação | Português |
| Formato da especificação | Um único ficheiro `SPECIFICATION.md` |

## 2. Fase de investigação e especificação

Antes de escrever qualquer código, foram lançados 3 agentes de pesquisa/arquitetura em paralelo:

1. **Arquitetura do bpmn-io/form-js** — estrutura de pacotes, formato do schema, motor de renderização (Preact internamente, API pública imperativa), motor FEEL (`@bpmn-io/feelin`), validação, extensibilidade (field registry, DI via `didi`), API pública, integração Camunda 7 vs 8, licenciamento.
2. **Boas práticas 2025/2026 para libs TypeScript + Tailwind** — build tooling (tsdown/Rolldown como sucessor do tsup), Tailwind v4 (CSS-first, tokens como CSS custom properties, `@theme`), arquitetura framework-agnóstica (padrão Zag.js/floating-ui: core + adaptadores finos), monorepo (pnpm + Turborepo + Changesets), testes (Vitest + Testing Library + Storybook 9 + axe-core), acessibilidade (WAI-ARIA APG).
3. **Desenho de arquitetura concreto** — um agente "Plan" sintetizou as duas pesquisas acima nas decisões já confirmadas pelo utilizador, produzindo a estrutura de pacotes, o desenho do schema, do motor FEEL, da validação, da extensibilidade, da API pública, do catálogo de componentes (v1 vs v1.1/v2) e do sistema de theming em 3 camadas.

Resultado: **[`SPECIFICATION.md`](./SPECIFICATION.md)** (12 secções, ~700 linhas) — o documento de arquitetura que guiou toda a implementação a seguir. Secções principais:

1. Visão geral e objetivos
2. Estrutura do monorepo
3. Formato do schema (compatível com Camunda 8)
4. Motor de expressões e data-binding (FEEL)
5. Arquitetura de validação
6. Motor de renderização e extensibilidade
7. API pública (`@modern-form/renderer`)
8. Catálogo de componentes — v1 vs v1.1/v2
9. **Sistema de theming em 3 camadas** (a resposta direta ao requisito de "fluidez"): tokens CSS → atributos `data-part` → prop `classNames`
10. Tooling de build, testes e lint
11. Estratégia de compatibilidade com Camunda 8
12. Roadmap resumido

## 3. Implementação do scaffold v1

Depois de aprovado o plano, foi construído o monorepo completo (pnpm workspaces + Turborepo), com **9 pacotes/apps**, todos verificados (build + test + lint + typecheck em verde):

```
packages/
  schema/     @modern-form/schema    — tipos TS + Zod + SchemaLinter + getSchemaVariables
  tokens/     @modern-form/tokens    — tokens.css (--mf-*)
  core/       @modern-form/core      — EventBus, Injector, motor FEEL, Evaluator/Validator, FieldTypeRegistry
  renderer/   @modern-form/renderer  — classe Form + 13 componentes Tailwind + dist/styles.css
  react/      @modern-form/react    — wrapper <ModernForm> para React
  vue/        @modern-form/vue      — wrapper <ModernForm> para Vue 3
  umbrella/   modern-form            — reexporta renderer + schema
apps/
  playground/ @modern-form/playground — demo Vite (schema de fatura, eventos ao vivo)
  docs/       @modern-form/docs     — site de documentação VitePress
```

### Pontos de arquitetura notáveis implementados (não só especificados)

- **Motor FEEL real**, usando `@bpmn-io/feelin` — testado com expressões como `=approved = false` e `=this.quantidade * this.preco` (escopo `this` via `DataContext.pushScope`).
- **EventBus + Injector escritos à mão** (não `didi`/`diagram-js`) — decisão documentada e justificada no código.
- **`SchemaLinter`** com verificações semânticas em tempo de importação (`min > max`, chaves duplicadas, `dynamiclist` sem `path`, etc.) — uma melhoria deliberada face ao form-js, que só deteta esses erros em runtime.
- **13 tipos de campo da v1** (textfield, textarea, number, datetime, checkbox, radio, select, checklist, text, image, spacer, separator, button), com `group` tratado estruturalmente pelo próprio `Form` (não pelo `FieldTypeRegistry`, por ser recursivo).
- **Theming fluido** implementado nas 3 camadas: `tokens.css` → atributos `data-part`/`data-scope` → prop `classNames` com merge (nunca substituição).
- **Degradação graciosa**: tipos não suportados (`dynamiclist`, `table`, `taglist`, `expression`, `html` — adiados para v1.1) renderizam como placeholder inerte, sem bloquear o resto do formulário.

### Verificação real (não só compilação)

- `packages/schema/test`: parsing Zod, `SchemaLinter`, `getSchemaVariables` (7 testes).
- `packages/core/test`: avaliação FEEL, validação, merge-errors (13 testes).
- `packages/renderer/test`: **testes de ponta a ponta em jsdom** — render, visibilidade condicional via FEEL, erro de campo obrigatório, evento `submit`, `reset()`, `destroy()` (7 testes).
- `packages/react/test` e `packages/vue/test`: montagem e renderização dos wrappers (1 teste cada).
- `apps/playground`: `vite build` de produção validado (resolve toda a cadeia de pacotes do workspace + CSS compilado).

## 4. Git e primeiro push

Repositório git inicializado localmente, remote `origin` apontado para `https://github.com/Afranioalves/modern-form-builder.git` (repositório remoto estava vazio). Histórico criado em **10 commits lógicos**, um por pacote/preocupação, ordenados por dependência (tooling → spec → schema → tokens → core → renderer → react → vue → umbrella → playground), usando Conventional Commits com mensagens detalhadas em português. Branch `main` (renomeado de `master` antes do primeiro commit).

## 5. Documentação (VitePress) — e um bug de ambiente interessante

Pedido: *"cria a documentação da lib, siga o exemplo da doc do tailwind"*.

Construído `apps/docs` com **VitePress**: homepage com hero + grid de funcionalidades (como a home do Tailwind), sidebar categorizada, pesquisa local, dark mode, tema customizado (accent indigo). 28 páginas de conteúdo (guia, conceitos, frameworks, referência de componentes — uma página por tipo de campo, como o Tailwind faz por utility class —, referência da API), escritas a partir do código-fonte real e da especificação.

### Problema encontrado e resolvido: `ERR_REQUIRE_CYCLE_MODULE`

Ao tentar `vitepress build`, o Node.js 22.16 lançava consistentemente:

```
Error [ERR_REQUIRE_CYCLE_MODULE]: Cannot require() ES Module .../vitepress/bin/vitepress.js in a cycle.
```

**Diagnóstico** (por eliminação, com testes isolados):
- Reproduzia-se com vitepress 1.6.4 **e** 1.5.0 → não era um bug de versão do vitepress.
- Um projeto isolado com `npm install vitepress` (node_modules plano, sem symlinks) **não reproduzia o erro**.
- `--preserve-symlinks` evitava o erro de ciclo mas quebrava a resolução de `vite` (prova de que o problema está relacionado com o layout de symlinks do pnpm, não com o conteúdo do VitePress em si).

**Conclusão:** o CLI do `vitepress` (que faz `require()` de um módulo ESM a partir de um shim CJS) dispara uma deteção de ciclo do Node 22 especificamente sob o layout de `node_modules` com symlinks do `pnpm` — uma incompatibilidade pontual de ferramentas, não um problema do schema/renderer da nossa lib.

**Solução aplicada:** `apps/docs` foi **excluído do workspace pnpm** (`!apps/docs` em `pnpm-workspace.yaml`) e passou a instalar-se com `npm` próprio (node_modules plano, `package-lock.json` dedicado). Documentado em `apps/docs/README.md`, com nota para reverter se uma versão futura do vitepress resolver isto.

Build final validado: `npm run build` sem erros, incluindo a validação automática de links internos do VitePress (zero links quebrados nas ~30 páginas).

## 6. README e LICENSE

Pedido: *"criar o README e mete no github"*. Criados:
- `README.md` — apresentação, exemplo de 3 linhas, tabela da estrutura do monorepo, instruções de desenvolvimento, roadmap.
- `LICENSE` — MIT (consistente com o que já estava declarado em todos os `package.json`, mas sem ficheiro correspondente).
- Correção de bug no `.gitignore`: o padrão `.vitepress/cache` (com barra a meio) só apanhava a pasta na raiz do repo — corrigido para `**/.vitepress/cache`.

## 7. Estado atual do repositório

```
main
├── LICENSE
├── README.md
├── SPECIFICATION.md
├── HISTORICO-DO-PROJETO.md   (este ficheiro)
├── package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json, eslint.config.mjs, ...
├── packages/
│   ├── schema/   core/   tokens/   renderer/   react/   vue/   umbrella/
└── apps/
    ├── playground/
    └── docs/
```

Comandos principais:

```sh
pnpm install        # na raiz (apps/docs é instalado à parte, ver secção 5)
pnpm build / test / lint / typecheck    # via Turborepo, cobre os 9 pacotes
pnpm --filter @modern-form/playground dev   # demo interativa no browser
cd apps/docs && npm run dev                 # site de documentação local
```

## 8. O que falta (próximos passos conhecidos)

Do roadmap em `SPECIFICATION.md` secção 12 / `README.md`:

- **v1.1**: `taglist`, `dynamiclist`, `table`, `expression`, `html` — os tipos já reconhecidos pelo schema mas ainda renderizados como placeholder.
- **v2**: `iframe`, `documentPreview`, `filepicker` (precisa de adaptadores de upload plugáveis), i18n completo, possível editor visual (`@modern-form/editor`, fora do âmbito atual).
- Nenhum CI (GitHub Actions) configurado ainda — build/test/lint só correm localmente.
- `Evaluator` (feedback em tempo real por campo, usando o grafo de dependências já construído em `@modern-form/core`) está implementado mas o `Form.ts` da v1 ainda revalida a árvore toda a cada `changed` em vez de usar o grafo para recomputar só os campos dependentes — simplificação de performance deliberada, documentada no código (`Form.ts`), deixada como otimização futura.
- `datetime`: `timeSerializingFormat` e `use24h` são lidos do schema mas ainda não aplicados (usa o comportamento nativo do `<input>` do browser).
- `select.searchable` é lido mas ainda não implementa um combobox pesquisável (comporta-se como `<select>` normal).

## 9. Preferências e padrões observados nesta sessão (úteis para continuar o trabalho)

- Comunicação e commits sempre em **português**; nomes de código/tipos em inglês.
- Conventional Commits, um commit por pacote/preocupação lógica, sempre com plano apresentado e confirmação explícita ("sim") antes de commitar/fazer push.
- Preferência por verificação real (testes a correr, build de produção) em vez de apenas "parece correto" — sempre que possível, correr e mostrar o resultado real dos comandos.
- Pedidos tendem a ser curtos e diretos ("sim, avance", "cria a documentação", "guarda o histórico") — espera-se que eu tome decisões de implementação razoáveis sem pedir confirmação excessiva, mas que pergunte quando a decisão é de arquitetura/formato com custo significativo de refazer.
