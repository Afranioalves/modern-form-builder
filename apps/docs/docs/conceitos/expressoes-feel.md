# Expressões FEEL

## Porquê FEEL

FEEL (*Friendly Enough Expression Language*) é a linguagem de expressões padronizada pela OMG, usada pelo Camunda em condições de BPMN e em tabelas de decisão DMN. O `modern-form` avalia expressões FEEL através do **`@bpmn-io/feelin`** — a mesma biblioteca que as próprias ferramentas Camunda usam.

A escolha não é arbitrária: uma expressão escrita por um autor de BPMN/DMN no Camunda Modeler tem de se comportar de forma **idêntica** quer seja avaliada no Zeebe Tasklist quer no `modern-form`. Reutilizar a biblioteca exata elimina divergências subtis de tratamento de `null`, aritmética de datas, etc.

## A convenção `=`

Qualquer string prefixada com `=` é tratada como uma expressão FEEL dinâmica em vez de um valor literal — o chamado padrão **"toggle-or-FEEL"**:

```json
{ "conditional": { "hide": "=aprovado = false" } }
```

Isto aplica-se uniformemente a:

- `conditional.hide` — visibilidade condicional
- `label`, `description` — texto dinâmico
- `disabled`, `readonly` — estado dinâmico
- `image.source` — origem de imagem calculada
- `values` de `radio`/`select`/`checklist` — opções dinâmicas, resolvidas para um array de `{ label, value }`

## Visibilidade condicional

```json
{
  "key": "aprovadoPor",
  "label": "Aprovado por",
  "type": "textfield",
  "conditional": { "hide": "=aprovado = false" }
}
```

O campo é reavaliado a cada evento `changed`; quando `hide` resolve para `true`, o componente (e toda a sua subárvore, se for um `group`) é excluído da renderização, da validação e do resultado de `submit()`. Internamente, um **grafo de dependências** estático (construído uma vez em `importSchema`) garante que só os campos cuja expressão referencia a chave alterada são reavaliados.

## Contexto de dados

Uma expressão FEEL é avaliada contra o objeto de dados atual do formulário — qualquer `key` existente nos dados está disponível como variável:

```json
{ "label": "=\"Olá, \" + nome" }
```

### `undefined` → `null`

FEEL não tem conceito de `undefined`; o `modern-form` coage automaticamente qualquer valor `undefined` do contexto de dados para `null` antes de avaliar a expressão.

## O escopo `this` dentro de `group` e listas

Dentro de um `group` com `path`, os dados dos filhos ficam aninhados sob esse caminho — mas as expressões FEEL continuam a referenciar os dados completos do formulário, não um sub-escopo isolado.

Numa futura `dynamiclist` (v1.1), cada linha repetida recebe o seu próprio frame de dados — `{ ...dadosGlobais, this: dadosDaLinha } `— permitindo expressões como:

```json
{ "expression": "=this.quantidade * this.preco" }
```

## Erros e avisos de avaliação

`@bpmn-io/feelin` nunca lança uma exceção para uma expressão malformada em runtime — devolve `{ value: null, warnings: [...] }`. O `SchemaLinter` tenta compilar cada expressão `=...` em **tempo de importação** (`FEEL_EXPRESSION_UNPARSEABLE`), para detetar um erro de sintaxe antes do formulário ser sequer mostrado a um utilizador final, em vez de o descobrir silenciosamente mais tarde.
