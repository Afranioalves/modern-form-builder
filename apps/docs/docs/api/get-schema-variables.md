# `getSchemaVariables`

Importada de `@modern-form/schema`. Analisa estaticamente um schema (sem o renderizar nem avaliar contra dados reais) para produzir a lista de variáveis que ele **lê** e **escreve** — útil para ligar variáveis de processo do Zeebe a um User Task sem correr o formulário.

```ts
function getSchemaVariables(
  schema: FormSchema,
  options?: { inputs?: boolean; outputs?: boolean },
): { inputs: string[]; outputs: string[] }
```

```ts
import { getSchemaVariables } from '@modern-form/schema'

const { inputs, outputs } = getSchemaVariables(schema)
```

- **`outputs`** — a `key` de cada componente que escreve um valor (`textfield`, `number`, `checkbox`, `select`, …), incluindo chaves totalmente qualificadas dentro de um `group` com `path` (ex. `"endereco.rua"`).
- **`inputs`** — nomes de variáveis referenciados por qualquer expressão FEEL no schema (`conditional.hide`, `label`, `description`, `disabled`, `readonly`, `image.source`, `values` dinâmicos). A extração usa um scanner leve de identificadores FEEL — suficiente para wiring de variáveis, não um parser FEEL completo.

## Opções

Passa `{ inputs: false }` ou `{ outputs: false }` para pedir só um dos dois conjuntos (por omissão ambos são calculados).
