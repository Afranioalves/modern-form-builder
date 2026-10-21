# modern-form — Especificação Técnica

> Biblioteca TypeScript + Tailwind CSS para renderização de formulários dinâmicos provenientes de motores de orquestração (Camunda 8 / Zeebe), inspirada na arquitetura do [bpmn-io/form-js](https://github.com/bpmn-io/form-js).

**Versão do documento:** 1.0
**Estado:** Proposta de arquitetura — base para implementação da v1

---

## Índice

1. [Visão geral e objetivos](#1-visão-geral-e-objetivos)
2. [Estrutura do monorepo](#2-estrutura-do-monorepo)
3. [Formato do schema](#3-formato-do-schema-compatível-com-camunda-8)
4. [Motor de expressões e data-binding](#4-motor-de-expressões-e-data-binding)
5. [Arquitetura de validação](#5-arquitetura-de-validação)
6. [Motor de renderização e extensibilidade](#6-motor-de-renderização-e-extensibilidade)
7. [API pública](#7-api-pública-modern-formrenderer)
8. [Catálogo de componentes — v1 vs v1.1/v2](#8-catálogo-de-componentes--v1-vs-v11v2)
9. [Sistema de theming e customização](#9-sistema-de-theming-e-customização-fluidez)
10. [Tooling de build, testes e lint](#10-tooling-de-build-testes-e-lint)
11. [Estratégia de compatibilidade com Camunda 8](#11-estratégia-de-compatibilidade-com-camunda-8)
12. [Roadmap resumido](#12-roadmap-resumido)

---

## 1. Visão geral e objetivos

### 1.1 O que é

`modern-form` é uma biblioteca que lê um **schema JSON** descrevendo um formulário (tipicamente gerado pelo Camunda Modeler para um User Task ou Start Event do Camunda 8/Zeebe) e o renderiza como um formulário HTML interativo, com:

- Componentes de input modernos (text, textarea, select, checkbox, radio, date/time, etc.) estilizados com **Tailwind CSS**.
- Vínculo de dados (*data-binding*) bidirecional entre os campos e um objeto de dados JavaScript.
- Avaliação de expressões **FEEL** para visibilidade condicional, valores computados e opções dinâmicas — a mesma linguagem usada pelo Camunda em condições de BPMN e tabelas de decisão DMN.
- Validação em tempo real e no submit.
- Extensibilidade total: qualquer tipo de campo pode ser substituído ou adicionado por quem consome a biblioteca.

### 1.2 Porquê

O `form-js` da bpmn.io já resolve este problema, mas:
- É estilizado com CSS próprio (BEM + tokens `--bio-*`), sem integração nativa com Tailwind.
- O seu motor interno (Preact + `didi`/`diagram-js`) traz bagagem de ferramentas de diagramação que um renderizador de formulários não precisa.
- A customização visual exige sobrepor variáveis CSS globais; não há um mecanismo granular por componente.

`modern-form` propõe-se a ser **compatível com o mesmo formato de schema** (para que formulários criados no Camunda Modeler funcionem sem alterações), mas com:
- Um motor interno mais leve e totalmente tipado em TypeScript.
- Tailwind CSS como base visual, com um sistema de temas **fluido** (ver secção 9) que permite ao consumidor sobrepor estilos com o mínimo de atrito.
- Uma API pública moderna, com tipos genéricos corretos (sem `any`).

### 1.3 Público-alvo

- Equipas que constroem interfaces de Tasklist/Inbox customizadas sobre o Camunda 8 e querem controlo total sobre o visual dos formulários de tarefas.
- Equipas que já usam Tailwind CSS no seu produto e querem uma biblioteca de formulários que se integre visualmente sem duplicar sistemas de design.
- Por extensão, qualquer motor de orquestração (ou ferramenta própria) que produza o mesmo formato de schema JSON pode usar a biblioteca, já que o motor de renderização não depende de nenhuma API específica do Camunda — apenas do formato do schema.

### 1.4 Não-objetivos da v1

- **Sem editor visual (drag-and-drop)** de formulários — equivalente ao `form-js-editor`. Pode vir a ser um pacote separado no futuro.
- **Sem backend de upload de ficheiros** embutido — o componente `filepicker` fica para a v2 e exigirá um adaptador de upload plugável.
- **Sem suporte nativo a Camunda 7** (Generated Task Forms / Embedded Forms) — o alvo primário é o formato de schema do Camunda 8, embora o motor seja agnóstico do motor de orquestração em si.
- **Sem i18n embutido na v1** — strings de erro/validação em inglês por defeito, com possibilidade de override via opções (i18n completo fica para iteração futura).

---

## 2. Estrutura do monorepo

**Scope npm:** `@modern-form`

| Pacote | Caminho | Responsabilidade | Depende de |
|---|---|---|---|
| `@modern-form/schema` | `packages/schema` | Schemas Zod + tipos TS inferidos para o schema de formulário; `getSchemaVariables()`; type guards | — |
| `@modern-form/tokens` | `packages/tokens` | Fonte única dos design tokens: `tokens.css` (CSS custom properties) + fragmento `@theme` do Tailwind v4 | — |
| `@modern-form/core` | `packages/core` | Motor agnóstico de DOM/framework: EventBus, Injector, avaliação FEEL, data-binding, Evaluator/Validator, `FieldTypeRegistry`, `SchemaLinter` | `@modern-form/schema`, `@bpmn-io/feelin` |
| `@modern-form/renderer` | `packages/renderer` | Camada de renderização DOM: conjunto de componentes Tailwind por defeito, `dist/styles.css` compilado, classe pública `Form` | `@modern-form/core`, `@modern-form/tokens` |
| `@modern-form/react` | `packages/react` | Wrapper fino para React (`<Form>` + hooks) | `@modern-form/renderer`, `react` (peer) |
| `@modern-form/vue` | `packages/vue` | Wrapper fino para Vue (`<Form>` + composable) | `@modern-form/renderer`, `vue` (peer) |
| `modern-form` | `packages/umbrella` | Pacote de conveniência que reexporta `@modern-form/renderer` + `@modern-form/schema`, para quem quer instalar um único pacote | `@modern-form/renderer`, `@modern-form/schema` |
| `apps/playground` | `apps/playground` | Storybook 9 para desenvolvimento visual dos componentes; não publicado | pacotes do workspace |

### 2.1 Grafo de dependências

```
schema  ──┐
tokens ───┼──► core ──► renderer ──► react
          │                     └──► vue
          └────────────────────► renderer (input do build CSS)
```

### 2.2 Porquê separar `schema` e `tokens` do `core`

- **`@modern-form/schema`** é útil de forma independente — por exemplo, um futuro editor visual, uma CLI de *lint* de schemas, ou testes de integração com o Camunda Tasklist podem depender apenas do contrato de dados, sem precisar do motor FEEL nem do event bus.
- **`@modern-form/tokens`** permite a quem só quer sobrepor variáveis CSS (ex.: um embed estático, sem JavaScript do motor) instalar um pacote minúsculo, sem o peso do `renderer`.

---

## 3. Formato do schema (compatível com Camunda 8)

### 3.1 Raiz do schema

```ts
interface FormSchema {
  type: 'default';
  id: string;
  schemaVersion: number;
  exporter?: { name: string; version: string };
  executionPlatform?: 'Camunda Cloud';
  executionPlatformVersion?: string;
  components: FormComponent[];
}
```

Exemplo JSON mínimo:

```json
{
  "type": "default",
  "id": "InvoiceForm",
  "schemaVersion": 12,
  "exporter": { "name": "Camunda Modeler", "version": "5.18.0" },
  "executionPlatform": "Camunda Cloud",
  "executionPlatformVersion": "8.5.0",
  "components": [
    { "id": "f1", "key": "creditor", "label": "Credor", "type": "textfield",
      "validate": { "required": true } }
  ]
}
```

### 3.2 Campos comuns a todos os componentes

```ts
type FeelString = `=${string}`;
type ToggleOrFeel<T> = T | FeelString;

interface ComponentBase {
  id: string;
  key?: string;                      // chave de data-binding; suporta nesting por "." (ex: "address.street")
  label?: ToggleOrFeel<string>;
  layout?: { columns?: number | null; row?: string };
  conditional?: { hide?: FeelString };
  description?: ToggleOrFeel<string>;
  disabled?: ToggleOrFeel<boolean>;
  readonly?: ToggleOrFeel<boolean>;
  properties?: Record<string, unknown>; // bag livre para extensões (ver secção 11)
}

interface Validate {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  validationType?: 'phone' | 'email';
}
```

### 3.3 Catálogo de tipos de componente

**Input**

```ts
interface TextfieldComponent extends ComponentBase { type: 'textfield'; key: string; defaultValue?: ToggleOrFeel<string>; validate?: Validate; }
interface TextareaComponent  extends ComponentBase { type: 'textarea';  key: string; defaultValue?: ToggleOrFeel<string>; validate?: Validate; }
interface NumberComponent    extends ComponentBase { type: 'number';    key: string; defaultValue?: ToggleOrFeel<number>; validate?: Validate; decimalDigits?: number; }
interface DatetimeComponent  extends ComponentBase {
  type: 'datetime'; key: string; subtype: 'date' | 'time' | 'datetime';
  dateLabel?: string; timeLabel?: string;
  timeSerializingFormat?: 'utc_offset' | 'utc_normalized';
  use24h?: boolean; defaultValue?: ToggleOrFeel<string>; validate?: Validate;
}
```

**Seleção**

```ts
interface SelectionOption { label: string; value: string; }

interface CheckboxComponent extends ComponentBase { type: 'checkbox'; key: string; defaultValue?: ToggleOrFeel<boolean>; validate?: Validate; }
interface RadioComponent    extends ComponentBase { type: 'radio';    key: string; values: SelectionOption[] | FeelString; defaultValue?: ToggleOrFeel<string>;   validate?: Validate; }
interface SelectComponent   extends ComponentBase { type: 'select';   key: string; values: SelectionOption[] | FeelString; searchable?: boolean; defaultValue?: ToggleOrFeel<string>; validate?: Validate; }
interface ChecklistComponent extends ComponentBase { type: 'checklist'; key: string; values: SelectionOption[] | FeelString; defaultValue?: ToggleOrFeel<string[]>; validate?: Validate; }
interface TaglistComponent  extends ComponentBase { type: 'taglist';  key: string; values: SelectionOption[] | FeelString; defaultValue?: ToggleOrFeel<string[]>; validate?: Validate; }
```

**Apresentação**

```ts
interface TextComponent  extends ComponentBase { type: 'text'; text: ToggleOrFeel<string>; }      // markdown
interface HtmlComponent  extends ComponentBase { type: 'html'; content: ToggleOrFeel<string>; }    // sanitizado (DOMPurify)
interface ImageComponent extends ComponentBase { type: 'image'; source: ToggleOrFeel<string>; alt?: string; }
interface TableComponent extends ComponentBase { type: 'table'; path: string; columns: { label: string; key: string }[]; }
```

**Layout / estrutura**

```ts
interface GroupComponent extends ComponentBase {
  type: 'group'; path?: string; components: FormComponent[]; showOutline?: boolean;
}
interface DynamiclistComponent extends ComponentBase {
  type: 'dynamiclist'; path: string; components: FormComponent[];
  isRepeating: true; allowAddRemove?: boolean; defaultRepetitions?: number | FeelString;
}
interface SpacerComponent    extends ComponentBase { type: 'spacer'; height?: number; }
interface SeparatorComponent extends ComponentBase { type: 'separator'; }
```

**Especializados**

```ts
interface IframeComponent extends ComponentBase { type: 'iframe'; url: ToggleOrFeel<string>; height?: number; }
interface ExpressionComponent extends ComponentBase {
  type: 'expression'; key: string; expression: FeelString;
  computeOn: 'presubmit' | 'change' | 'blur';
}
interface FilepickerComponent      extends ComponentBase { type: 'filepicker'; key: string; multiple?: boolean; validate?: Validate; }
interface DocumentPreviewComponent extends ComponentBase { type: 'documentPreview'; key: string; }
interface ButtonComponent          extends ComponentBase { type: 'button'; action: 'submit' | 'reset'; }
```

**União discriminada final:**

```ts
type FormComponent =
  | TextfieldComponent | TextareaComponent | NumberComponent | DatetimeComponent
  | CheckboxComponent | RadioComponent | SelectComponent | ChecklistComponent | TaglistComponent
  | TextComponent | HtmlComponent | ImageComponent | TableComponent
  | GroupComponent | DynamiclistComponent | SpacerComponent | SeparatorComponent
  | IframeComponent | ExpressionComponent | FilepickerComponent | DocumentPreviewComponent | ButtonComponent;
```

`group` e `dynamiclist` aninham `components: FormComponent[]` diretamente (árvore real), tal como o Camunda Modeler serializa — isto mantém `importSchema` como uma travessia recursiva simples.

### 3.4 Convenção "toggle-or-FEEL"

Qualquer string prefixada com `=` é tratada como uma expressão FEEL dinâmica em vez de um valor literal. Aplica-se uniformemente a `label`, `description`, `disabled`, `readonly`, `defaultValue`, `conditional.hide`, `image.source`, `expression.expression`, etc. — um único helper central resolve este padrão em todo o motor:

```ts
function evaluateToggleOrFeel<T>(
  value: ToggleOrFeel<T> | undefined,
  ctx: DataContext,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  if (typeof value === 'string' && value.startsWith('=')) {
    return evaluateExpression(value.slice(1), ctx) as T;
  }
  return value as T;
}
```

### 3.5 Validação do schema — duas fases

**Fase 1 — estrutural (Zod).** Cada interface acima tem um `z.object(...)` correspondente, composto num `z.discriminatedUnion('type', [...])`. Isto dá, de forma gratuita:
- Erros de parsing precisos e localizados (`components[3].validate.max: esperado número`), detetados em `importSchema()` em vez de falharem silenciosamente ou rebentarem numa chamada de render.
- *Type guards* em tempo de execução em todas as fronteiras de extensibilidade.
- Fonte única de verdade para tipos de compilação (`z.infer<...>`) e verificação em runtime — sem divergência entre os dois.

**Fase 2 — semântica (`SchemaLinter`).** Corre depois do parsing Zod ter sucesso, percorrendo a árvore toda e produzindo uma lista de `{ severity: 'error' | 'warning', code, path, message }`. Esta é a resposta concreta a uma lacuna conhecida do form-js: lá, uma configuração de validação inválida (ex. `min > max`) só é detetada quando um utilizador final escreve um valor que dispara a verificação quebrada. Aqui, deteta-se em `importSchema()`, antes do formulário ser sequer mostrado.

| Código | Verificação |
|---|---|
| `VALIDATE_MIN_GT_MAX` | `validate.min > validate.max` |
| `VALIDATE_MINLENGTH_GT_MAXLENGTH` | `validate.minLength > validate.maxLength` |
| `VALIDATE_PATTERN_INVALID` | `validate.pattern` não compila como `RegExp` |
| `KEY_DUPLICATE` | duas chaves de data-binding iguais no mesmo escopo |
| `KEY_MISSING_ON_KEYED_TYPE` | tipo que exige `key` (conforme `config.keyed` no registo) não a tem |
| `DYNAMICLIST_PATH_MISSING` | `dynamiclist`/`table` sem `path` |
| `UNKNOWN_COMPONENT_TYPE` | `type` não reconhecido — degrada para placeholder (aviso, não erro) |
| `FEEL_EXPRESSION_UNPARSEABLE` | expressão `=...` não compila com `feelin` em tempo de importação |

`importSchema()` só rejeita em **erros**; **avisos** são recolhidos em `ImportResult.warnings` e o formulário continua a renderizar — esta postura de degradação graciosa é importante para formulários Camunda reais que possam usar funcionalidades ainda não suportadas (ver secção 11.3).

---

## 4. Motor de expressões e data-binding

### 4.1 Escolha: `@bpmn-io/feelin`, não um FEEL próprio

Expressões FEEL escritas por um autor de BPMN/DMN no Camunda Modeler têm de ser avaliadas de forma idêntica quer renderizadas no Zeebe Tasklist quer no `modern-form` — qualquer divergência semântica (tratamento de `null`, aritmética de datas, etc.) seria um bug de correção, não apenas cosmético. Reutilizar a mesma biblioteca que as próprias ferramentas Camunda usam elimina uma classe inteira de incompatibilidades subtis, ao custo de uma dependência bem mantida.

### 4.2 Regras de coerção de tipos

| Direção | Regra |
|---|---|
| Entrada: `undefined` → FEEL | coagido para `null` (FEEL não tem `undefined`) |
| Entrada: string numérica (de input de texto) → FEEL | coagida para `number` apenas em campos `number`/`datetime` |
| Entrada: `"true"`/`"false"` → FEEL | coagida para `boolean` apenas em campos `checkbox` |
| Saída: `null` FEEL → JS | convertido para `undefined` ao escrever de volta nos dados do formulário |
| Sempre | remover o prefixo `=` antes de passar a expressão ao parser FEEL |

### 4.3 Visibilidade condicional

`conditional.hide` é avaliado em cada evento `changed`, contra o `DataContext` atual; se `true`, o componente (e a sua subárvore, se for um grupo) é excluído da renderização, da validação e do resultado de `submit()`. A reavaliação é incremental: apenas os componentes cuja expressão referencia uma chave alterada são recalculados, usando um grafo de dependências construído uma vez em `importSchema`, analisando estaticamente o AST de cada expressão FEEL.

### 4.4 Campos computados (`expression`)

`computeOn` controla quando `expression.expression` é (re)avaliado:

- `'change'` — recalculado em cada evento `changed` relevante.
- `'blur'` — recalculado quando um campo do qual depende perde o foco.
- `'presubmit'` — recalculado uma única vez, imediatamente antes de `submit()`/`validate()` construir o resultado (valor por defeito, para evitar tempestades de recálculo a cada tecla pressionada em expressões caras).

### 4.5 Escopo `this` em `dynamiclist`

Cada linha de um `dynamiclist` recebe o seu próprio frame de dados: `{ ...globalData, this: rowData }`. Os componentes dentro da árvore `components` desse `dynamiclist` avaliam todas as expressões FEEL (hide, defaultValue, limites de validação, etc.) contra este frame por linha, permitindo escrever `=this.quantidade * this.preco`. A pilha de escopos é implementada como uma stack simples (`pushScope`/`popScope`), não um grafo persistente de contextos aninhados — mantém o recálculo barato e eficiente em listas grandes.

---

## 5. Arquitetura de validação

### 5.1 Separação Evaluator vs Validator

- **Evaluator** (tempo real): subscreve `field.changed` no event bus; recalcula apenas os erros do campo alterado (e dos seus dependentes FEEL); emite `field.errorsChanged` para feedback inline. Leve, incremental, com debounce por campo.
- **Validator** (autoritativo, no submit): invocado por `form.validate()`/`form.submit()`; percorre toda a árvore de campos **visíveis** (ignorando os que estão `conditional.hide === true` — campos escondidos não são obrigatórios) e produz um mapa único de erros, `ValidationErrors`.

Ambos são construídos a partir das **mesmas funções de regra puras** (`validateRequired`, `validateMin`, `validatePattern`, …); diferem apenas em *quais* campos correm e *quando*, nunca na lógica da regra — eliminando qualquer divergência entre feedback em tempo real e o que realmente bloqueia o submit.

### 5.2 Padrão "merge-errors" para validadores customizados

Validadores customizados (registados como parte de uma extensão de tipo de campo, secção 6.3) nunca substituem o objeto de erros nativo — recebem-no e têm de o mesclar:

```ts
type FieldValidator<T extends FormComponent> = (
  value: unknown,
  component: T,
  ctx: ValidationContext,
) => string[]; // mensagens de erro para este campo; vazio = válido

function mergeErrors(
  base: Record<string, string[]>,
  extra: Record<string, string[]>,
): Record<string, string[]> {
  const out = { ...base };
  for (const key of Object.keys(extra)) {
    out[key] = [...(out[key] ?? []), ...extra[key]];
  }
  return out;
}
```

Isto é imposto estruturalmente: validadores de `additionalModules` são sempre compostos com `mergeErrors`, nunca trocados — um autor de plugin não consegue silenciar acidentalmente um erro nativo (ex. campo obrigatório) ao registar o seu próprio validador para a mesma chave.

### 5.3 Sanidade da configuração em tempo de importação

Tratada pelo `SchemaLinter` (secção 3.5) — a melhoria deliberada face ao form-js, que só descobre, por exemplo, `min > max` quando um utilizador escreve um valor que dispara essa verificação quebrada.

---

## 6. Motor de renderização e extensibilidade

### 6.1 Registo de tipos de campo

```ts
class FieldTypeRegistry {
  private types = new Map<string, FieldTypeExtension<any>>();

  register(extension: FieldTypeExtension<any>) {
    this.types.set(extension.type, extension); // o último registo vence — permite sobrepor tipos nativos
  }

  get(type: string): FieldTypeExtension<any> | undefined {
    return this.types.get(type);
  }
}
```

### 6.2 Decisão: EventBus + Injector próprios, não `didi`/`diagram-js`

O `form-js` usa `didi` (container de DI) e convenções do `diagram-js` — infraestrutura pensada para **editores de diagramas** (command stack, undo/redo, viewport, seleção). Um renderizador de formulários não precisa de nada disso; trazer essa dependência só acrescentaria peso de bundle e uma superfície de API que seria maioritariamente ignorada.

O grafo de serviços do núcleo é pequeno e fixo (`EventBus`, `DataContext`, `ExpressionEvaluator`, `Evaluator`, `Validator`, `FieldTypeRegistry`) — não precisa de um container genérico reflexivo; uma raiz de composição escrita à mão, com fábricas explícitas, é mais fácil de tipar corretamente de ponta a ponta (sem arrays `$inject` tipados como `any`) e mais fácil de fazer *tree-shake*.

Preserva-se, por convenção (não por dependência), a ergonomia `$inject` (`MyService.$inject = ['eventBus', 'form']`), apenas para que quem porta um plugin do form-js reconheça imediatamente a forma — mas o container é código próprio, de poucas linhas:

```ts
type Injectable<T> = T & { $inject?: string[] };

class Injector {
  private instances = new Map<string, unknown>();
  private factories = new Map<string, Injectable<Function>>();

  register(name: string, factory: Injectable<Function>) {
    this.factories.set(name, factory);
  }

  get<T>(name: string): T {
    if (this.instances.has(name)) return this.instances.get(name) as T;
    const factory = this.factories.get(name);
    if (!factory) throw new Error(`Nenhum provider para "${name}"`);
    const deps = (factory.$inject ?? []).map((d) => this.get(d));
    const instance = new (factory as any)(...deps);
    this.instances.set(name, instance);
    return instance;
  }
}
```

O `EventBus` é um emissor tipado sobre um mapa de eventos genérico, para que `form.on('changed', handler)` infira o tipo do payload sem *casts*:

```ts
interface FormEventMap {
  'import.done': { schema: FormSchema; warnings: ImportWarning[] };
  changed: { data: FormData; field?: { id: string; key: string } };
  submit: { data: FormData; errors: ValidationErrors };
  'field.errorsChanged': { fieldId: string; errors: string[] };
  'field.add': { field: FormComponent };
  'field.remove': { field: FormComponent };
  'field.focus': { field: FormComponent };
  'field.blur': { field: FormComponent };
}
```

### 6.3 Bundle de extensão de tipo de campo customizado

```ts
interface FieldTypeExtension<T extends FormComponent> {
  type: string;
  config: {
    label: string;
    keyed: boolean;
    group: 'input' | 'selection' | 'presentation' | 'layout' | 'custom';
    create(defaults?: Partial<T>): T;
  };
  render: FieldRenderer<T>;        // função pura (props) => saída renderizada; nenhum framework assumido
  evaluator?: FieldEvaluator<T>;   // estado derivado/visibilidade, ligado ao Evaluator do núcleo
  validator?: FieldValidator<T>;   // mesclado via mergeErrors, ligado ao Validator do núcleo
}

// Uso:
new Form({
  container,
  additionalModules: [myRatingFieldExtension, mySignaturePadExtension],
});
```

O registo acontece na construção do `Form`: a raiz de composição itera `additionalModules`, chama `registry.register(ext)` e liga `ext.evaluator`/`ext.validator` às instâncias partilhadas de `Evaluator`/`Validator`.

---

## 7. API pública (`@modern-form/renderer`)

```ts
interface FormOptions {
  container: HTMLElement;
  schema?: FormSchema;
  data?: FormData;
  properties?: { readOnly?: boolean; [key: string]: unknown };
  additionalModules?: FieldTypeExtension<any>[];
  classNames?: Partial<Record<string, Record<string, string>>>; // ver secção 9.3
}

type FormData = Record<string, unknown>;
type ValidationErrors = Record<string, string[]>;

interface ImportWarning { code: string; path: string; message: string; }
interface ImportResult { schema: FormSchema; data: FormData; warnings: ImportWarning[]; }
interface SubmitResult { data: FormData; errors: ValidationErrors; }

class Form {
  constructor(options: FormOptions);

  importSchema(schema: FormSchema, data?: FormData): Promise<ImportResult>;

  submit(): SubmitResult;
  validate(): ValidationErrors;
  reset(): void;

  getData(): FormData;
  setProperty<K extends string>(key: K, value: unknown): void;

  attachTo(container: HTMLElement): void;
  detach(): void;
  destroy(): void;

  on<E extends keyof FormEventMap>(event: E, handler: (payload: FormEventMap[E]) => void): void;
  off<E extends keyof FormEventMap>(event: E, handler: (payload: FormEventMap[E]) => void): void;
}

// utilitário, reexportado de @modern-form/schema
function getSchemaVariables(
  schema: FormSchema,
  options?: { outputs?: boolean },
): { inputs: string[]; outputs: string[] };
```

### 7.1 Exemplo de uso

```ts
import { Form } from '@modern-form/renderer';

const form = new Form({ container: document.querySelector('#form')! });

const { warnings } = await form.importSchema(schema, { creditor: 'ACME Corp' });
if (warnings.length) console.warn('Avisos ao importar o schema:', warnings);

form.on('submit', ({ data, errors }) => {
  if (Object.keys(errors).length === 0) {
    sendToZeebe(data);
  }
});

document.querySelector('#btn-submit')!.addEventListener('click', () => form.submit());
```

### 7.2 Nota sobre a API

Esta API espelha deliberadamente a do `form-js` (`new Form`, `importSchema`, `submit`, `validate`, `reset`, `attachTo`/`detach`, `destroy`, `on`) — é uma forma já comprovada para este domínio de problema, e maximiza a facilidade de migração de equipas que já usam form-js (basta trocar o import e o CSS, não a lógica de integração). As diferenças intencionais são ao nível dos tipos: todo o payload de evento e retorno de método é corretamente genérico/tipado, e `additionalModules` é tipado como `FieldTypeExtension<T>` em vez de objetos de DI fracamente tipados.

---

## 8. Catálogo de componentes — v1 vs v1.1/v2

| Tipo | Versão | Justificação |
|---|---|---|
| `textfield`, `textarea`, `number` | **v1** | Entrada de dados básica, sem complexidade adiável |
| `select`, `radio`, `checkbox`, `checklist` | **v1** | Suportados por elementos nativos, menor custo de acessibilidade, cobrem a maioria dos formulários Camunda reais |
| `datetime` (date/time/datetime) | **v1** | Necessário na maioria dos formulários de variáveis de processo; `<input type="date/time">` nativo aceitável para a v1 |
| `group` | **v1** | Necessário estruturalmente — a maioria dos schemas reais usa grupos para layout/scoping |
| `button` (submit/reset) | **v1** | Trivial, necessário para ter um formulário funcional |
| `text` (markdown), `image` | **v1** | Puramente apresentacionais, sem lógica, comuns para instruções/branding |
| `spacer`, `separator` | **v1** | Sem lógica, custo de implementação quase nulo |
| `taglist` | **v1.1** | Exige um widget completo do padrão APG combobox (navegação por teclado, `aria-activedescendant`) — mais trabalho de acessibilidade que `checklist` |
| `dynamiclist` | **v1.1** | Requer o motor de escopo `this` (secção 4.5) validado primeiro; alto valor, mas alta complexidade |
| `table` | **v1.1** | Orientado a leitura, menos frequente em formulários reais do que os tipos de entrada de dados |
| `expression` | **v1.1** | Precisa do motor de timing `computeOn` estabilizado; adiar até a separação Evaluator/Validator (secção 5) estar testada |
| `html` | **v1.1** | Exige um passo de sanitização (DOMPurify) — revisão de segurança deliberada, não apressada para o MVP |
| `iframe`, `documentPreview` | **v2** | Casos de uso mais estreitos, com considerações próprias de segurança/sandboxing (política de atributo `sandbox`, orientação de CSP) |
| `filepicker` | **v2** | Precisa de uma história de integração de armazenamento/upload — design próprio para adaptadores de upload plugáveis |

---

## 9. Sistema de theming e customização ("fluidez")

Este é o requisito explícito do utilizador: a biblioteca deve ser **fluida**, permitindo sobrepor/adicionar estilos próprios com facilidade. O design responde com um modelo em **três camadas**, da mais abrangente à mais granular.

### 9.1 Tier 1 — Tokens via CSS custom properties

Convenção de nomenclatura: `--mf-<categoria>-<nome>[-<passo>]`.

| Categoria | Exemplos |
|---|---|
| Cor (primitiva) | `--mf-color-blue-500`, `--mf-color-gray-100` … (escala completa, raramente tocada diretamente) |
| Cor (semântica — a que o consumidor sobrepõe) | `--mf-color-primary`, `--mf-color-primary-hover`, `--mf-color-border`, `--mf-color-border-focus`, `--mf-color-error`, `--mf-color-text`, `--mf-color-text-muted`, `--mf-color-bg`, `--mf-color-bg-disabled` |
| Raio | `--mf-radius-sm`, `--mf-radius-md`, `--mf-radius-lg`, `--mf-radius-full` |
| Espaçamento | `--mf-space-1` … `--mf-space-8` (escala baseada em 4px) |
| Tipografia | `--mf-font-family`, `--mf-font-size-sm/md/lg`, `--mf-font-weight-normal/medium/bold`, `--mf-line-height` |
| Borda / foco | `--mf-border-width`, `--mf-focus-ring-width`, `--mf-focus-ring-color` |
| Movimento | `--mf-transition-duration`, `--mf-transition-easing` |

`tokens.css` define todas estas variáveis em `:root`; o `styles.css` compilado do `renderer` **referencia** estas variáveis (`color: var(--mf-color-text)`), nunca valores literais fixos — esta é a regra única que torna todo o sistema fluido. Um consumidor pode retematizar o formulário inteiro sem qualquer ferramenta de build:

```css
:root {
  --mf-color-primary: #6d28d9;
  --mf-radius-md: 0.25rem;
}
```

### 9.2 Tier 2 — Atributos `data-part` (override sem JS)

Cada elemento renderizado, em cada tipo de campo, carrega um `data-part` estável e documentado (e um `data-scope="<tipo-de-campo>"` na raiz), para que consumidores que não tocam na API JS possam ainda assim fazer *targeting* preciso via CSS puro:

```html
<div class="mf-field" data-scope="textfield" data-part="root">
  <label data-part="label" for="...">…</label>
  <input data-part="input" aria-describedby="..." />
  <p data-part="description">…</p>
  <p data-part="error" role="alert">…</p>
</div>
```

```css
[data-scope="textfield"][data-part="input"] { border-color: tomato; }
```

### 9.3 Tier 3 — Prop `classNames` (override ao nível de JS)

Por tipo de campo, uma prop tipada e indexada por "parte", mesclada (nunca substituída) com as classes internas por defeito:

```ts
interface TextfieldClassNames {
  root?: string;
  label?: string;
  input?: string;
  description?: string;
  error?: string;
}

new Form({
  container,
  classNames: {
    textfield: { input: 'focus:ring-2 focus:ring-purple-600' },
  },
});
```

### 9.4 Regra interna de especificidade

Este modelo em três camadas (tokens → `data-part` → `classNames`) é a resposta concreta e estrutural ao requisito de fluidez: um consumidor pode retematizar globalmente sem código (tier 1), sobrepor tipos de elemento específicos sem JS usando seletores de atributo CSS (tier 2), ou injetar classes utilitárias exatas por tipo de campo através da API (tier 3) — sem nunca precisar de fazer fork da biblioteca ou lutar contra especificidade CSS. Para que isto funcione na prática, as classes internas mantêm-se deliberadamente de baixa especificidade: utilitários Tailwind planos, sem seletores aninhados, nunca `!important`.

---

## 10. Tooling de build, testes e lint

### 10.1 Build

- **`tsdown`** (baseado em Rolldown) por pacote, para saída dual ESM/CJS + `.d.ts`. Validação pós-build com `publint` e `@arethetypeswrong/cli` em CI.
- `@modern-form/schema` e `@modern-form/core` são TS puro — um único passo `tsdown build`.

### 10.2 Pipeline CSS do `renderer`

O `renderer` é o único pacote com um passo de build adicional, dividido em duas tarefas:

1. **`build:css`** — o CLI do Tailwind v4 compila `src/styles/*.css` (que importa `@modern-form/tokens/tokens.css` e declara um bloco `@theme` que mapeia os tokens `--mf-*` para a geração de utilitários Tailwind) para `dist/styles.css`. Isto mantém os tokens como fonte única de verdade — o tema do Tailwind referencia as mesmas CSS custom properties que a Tier 1 expõe, sem duplicar a definição de cor/espaçamento entre "o tema que o consumidor pode sobrepor" e "o tema de onde o Tailwind compila os utilitários".
2. **`build:js`** — `tsdown` empacota o runtime TS.

Ambas ligadas como tarefas do `turbo.json` (`build` depende de `build:css` e `build:js`), para que o Turborepo faça *cache* independente de cada uma.

### 10.3 Monorepo

- **pnpm workspaces** + **Turborepo** (`build` depende de `^build`; `test` depende de `build`; `lint`/`typecheck` independentes e em paralelo).
- **Changesets** para versionamento/changelog por pacote, com publicação via **OIDC trusted publishing** do GitHub Actions (sem token npm de longa duração).

### 10.4 Testes

- **Vitest** workspace (`vitest.workspace.ts` na raiz), ambiente `jsdom` para `renderer`/`react`/`vue`, ambiente `node` para `core`/`schema`.
- **Testing Library** (`@testing-library/dom` + adaptadores React/Vue) — consultas por `getByRole`/`getByLabelText` servem também como teste de fumo de acessibilidade.
- **Storybook 9** em `apps/playground`, com `addon-vitest` (testes de interação ao nível de componente) e `addon-a11y` (axe-core), este último a correr em CI como *gate*, não apenas como painel local.
- **Regressão visual**: *screenshots* do Playwright contra as stories do Storybook.

### 10.5 Lint

- **ESLint 9/10** flat config na raiz do repositório.
- **typescript-eslint v8**, preset estrito.
- **eslint-config-prettier**, fixado em `>=10.1.8` (segurança de supply-chain).

### 10.6 Checklist de acessibilidade (base, por tipo de componente)

Aplicável a todos os campos:
- Label visível e associado programaticamente (`<label for>` real, nunca apenas `placeholder`).
- `aria-invalid="true"` + `aria-describedby` a apontar para uma mensagem de erro visível, quando inválido.
- `aria-required`/`required` nativo, comunicado também no texto do label (não só por cor).
- Indicador de foco visível, ordem de tabulação lógica.

| Componente | Requisitos específicos |
|---|---|
| Text input / textarea | `autocomplete` quando aplicável; nunca usar `placeholder` como único label |
| Select | preferir `<select>` nativo sempre que possível (acessibilidade "de graça") |
| Combobox/Taglist customizado | seguir o padrão APG Combobox: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, navegação por setas, `Escape` fecha |
| Checkbox | `<input type="checkbox">` nativo preferido; custom: `role="checkbox"`, `aria-checked="true|false|mixed"` |
| Radio group | `role="radiogroup"` com nome acessível; apenas um rádio na sequência de tabulação, setas movem a seleção |
| Date picker | deve permanecer operável por teclado e entrada direta de texto, nunca só por rato; seguir o modelo de teclado do padrão APG datepicker |

---

## 11. Estratégia de compatibilidade com Camunda 8

### 11.1 Princípio

`FormSchema` **é** o schema do Camunda 8 — `importSchema` não o transforma, apenas o valida e renderiza diretamente. Sem round-trip com perdas, sem campos de topo proprietários.

### 11.2 Mapeamento campo a campo

| Campo Camunda | Tratamento |
|---|---|
| `schemaVersion` | Validado contra versões suportadas conhecidas pelo `SchemaLinter`; versões mais recentes do que as suportadas geram um **aviso**, não um erro, e a renderização prossegue com o melhor esforço |
| `exporter` | Metadado de passagem pura, ecoado em `ImportResult.schema`, sem uso funcional |
| `executionPlatform` / `executionPlatformVersion` | Passado adiante; pode futuramente controlar a disponibilidade de funções FEEL nativas, alinhando com o dialeto FEEL exato do Zeebe alvo |
| `components` (árvore, incl. `group`/`dynamiclist` aninhados) | Travessia recursiva, mesma forma de árvore, sem achatamento |
| `properties` (bag livre) | Totalmente preservado e passado ao re-serializar; é também onde vivem as **extensões próprias** (ver abaixo) |

### 11.3 Desvios deliberados — explicitamente assinalados como não-padrão

A biblioteca **não introduz nenhum novo campo de topo** no schema. Qualquer capacidade específica do `modern-form` (ex.: um override de `classNames` definido diretamente no schema, em vez de passado na construção do `Form`) é sempre colocada dentro do bag livre `properties`, já legal no formato original, com namespace próprio:

```json
{ "properties": { "modernForm:classNames": { "input": "ring-2 ring-purple-600" } } }
```

Isto garante que o schema permanece 100% válido e re-importável nas ferramentas originais (Camunda Modeler / Tasklist) — nada que a biblioteca adicione pode quebrar o round-trip pela cadeia de ferramentas canónica. Um consumidor apenas-Camunda simplesmente ignora as chaves `properties['modernForm:*']` como metadado inerte.

### 11.4 Degradação graciosa para tipos desconhecidos/não suportados

Tanto "um `type` de componente que o `modern-form` não reconhece de todo" como "um tipo adiado para v1.1/v2 encontrado num formulário Camunda real antes de o suportarmos" são tratados da mesma forma: o `SchemaLinter` emite um **aviso** (não um erro), e o renderizador substitui o nó por um placeholder visível mas inerte (`"Tipo de campo não suportado: dynamiclist"`, com aviso na consola), continuando a renderizar normalmente todos os irmãos/ancestrais. Importar um formulário nunca é uma operação tudo-ou-nada.

---

## 12. Roadmap resumido

| Versão | Conteúdo |
|---|---|
| **v1 (MVP)** | Pacotes `schema`, `tokens`, `core`, `renderer`; tipos textfield/textarea/number/select/radio/checkbox/checklist/datetime/group/button/text/image/spacer/separator; motor FEEL completo (incl. `conditional.hide`); validação Evaluator+Validator; sistema de theming em 3 tiers; compatibilidade direta com schema Camunda 8 |
| **v1.1** | `taglist`, `dynamiclist`, `table`, `expression`, `html`; wrappers `@modern-form/react` e `@modern-form/vue` |
| **v2** | `iframe`, `documentPreview`, `filepicker` (com adaptadores de upload plugáveis); i18n completo; possível pacote de editor visual (`@modern-form/editor`), fora do âmbito atual |

---

## Referências

- [bpmn-io/form-js](https://github.com/bpmn-io/form-js) — biblioteca de referência/inspiração arquitetural
- [Camunda — Form Element Library](https://docs.camunda.io/docs/components/modeler/forms/form-element-library/) — catálogo oficial de tipos de campo
- [Camunda — Introdução a formulários](https://docs.camunda.io/docs/next/apis-tools/frontend-development/forms/introduction-to-forms/)
- [@bpmn-io/feelin](https://github.com/nikku/feelin) — parser/interpretador FEEL usado para compatibilidade de expressões
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) — configuração CSS-first (`@theme`)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) — padrões de acessibilidade para combobox, radiogroup, checkbox, datepicker
