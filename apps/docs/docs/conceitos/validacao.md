# Validação

## Regras nativas

Qualquer componente com `key` pode ter um objeto `validate`:

```ts
interface Validate {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string                       // regex
  validationType?: 'phone' | 'email'
}
```

```json
{
  "key": "montante",
  "type": "number",
  "validate": { "required": true, "min": 0, "max": 100000 }
}
```

Todas as regras são funções puras (`validateRequired`, `validateMin`, `validateMax`, `validateMinLength`, `validateMaxLength`, `validatePattern`, `validateValidationType`), expostas por `@modern-form/core` caso precises de as reutilizar fora do fluxo normal de um `Form`.

## Evaluator vs. Validator

O motor separa dois papéis, para evitar uma classe inteira de bugs de UX onde o feedback em tempo real mostra um erro mas o submit continua a passar:

- **`Evaluator`** — feedback em tempo real: calcula os erros de **um campo** quando ele muda.
- **`Validator`** — autoritativo: chamado por `form.validate()` e `form.submit()`, percorre **toda a árvore visível** (ignorando campos atualmente escondidos por `conditional.hide`) e produz o mapa `ValidationErrors` final.

Os dois chamam exatamente as mesmas funções de regra — nunca podem divergir sobre se um valor é válido, só diferem em *quando* e *quais* campos correm.

```ts
const { data, errors } = form.submit()
// errors: Record<string, string[]>  — chave do campo → lista de mensagens
```

Um campo dentro de um `group` com `path` é reportado pela sua chave **totalmente qualificada** (ex. `"endereco.rua"`, não `"rua"`), igual à forma como aparece em `form.getData()`.

## Campos escondidos nunca são obrigatórios

Se `conditional.hide` resolve para `true`, esse componente (e a sua subárvore) é ignorado tanto pelo `Validator` como pelo resultado de `submit()` — um campo `required` que está escondido nunca bloqueia o envio do formulário.

## Validadores customizados — o padrão "merge-errors"

Um tipo de campo customizado (ver [extensibilidade](/conceitos/extensibilidade)) pode fornecer o seu próprio `validator`:

```ts
import type { FieldValidator } from '@modern-form/core'
import type { FormComponent } from '@modern-form/schema'

const validateNif: FieldValidator<FormComponent> = (value, component, ctx) => {
  if (typeof value === 'string' && !/^\d{9}$/.test(value)) {
    return ['NIF deve ter 9 dígitos.']
  }
  return []
}
```

O resultado é sempre **mesclado** com os erros nativos (`required`, `pattern`, etc.) através de `mergeErrors` — nunca os substitui. Isto significa que um autor de uma extensão não consegue, por acidente, silenciar um erro de `required` nativo ao registar o seu próprio validador para a mesma chave.

## Verificação em tempo de importação

Uma configuração de `validate` inconsistente (ex. `min: 100, max: 10`) é detetada pelo `SchemaLinter` **em `importSchema()`**, não apenas quando um utilizador final escreve um valor que dispara a verificação quebrada — ver [`SchemaLinter`](/api/schema-linter).
