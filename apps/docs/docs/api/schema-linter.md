# `SchemaLinter`

Importada de `@modern-form/schema`. Corre uma passagem semântica sobre um schema já validado estruturalmente pelo Zod, detetando problemas que a forma do JSON sozinha não consegue exprimir.

```ts
import { SchemaLinter } from '@modern-form/schema'

const linter = new SchemaLinter()
const issues = linter.lint(schema)
// issues: { severity: 'error' | 'warning'; code: string; path: string; message: string }[]
```

`Form.importSchema()` já chama o `SchemaLinter` internamente — a maioria das aplicações nunca precisa de o invocar diretamente. É útil para construir uma CLI de lint de schemas ou um linter de editor, usando apenas `@modern-form/schema` sem a biblioteca de renderização.

## Códigos

| Código | Severidade | Verificação |
| --- | --- | --- |
| `SCHEMA_VERSION_NEWER_THAN_SUPPORTED` | aviso | `schemaVersion` mais recente do que a versão suportada por este pacote. |
| `VALIDATE_MIN_GT_MAX` | erro | `validate.min > validate.max`. |
| `VALIDATE_MINLENGTH_GT_MAXLENGTH` | erro | `validate.minLength > validate.maxLength`. |
| `VALIDATE_PATTERN_INVALID` | erro | `validate.pattern` não compila como `RegExp`. |
| `KEY_DUPLICATE` | erro | Duas chaves de data-binding iguais no mesmo schema. |
| `KEY_MISSING_ON_KEYED_TYPE` | erro | Um tipo que exige `key` (ex. `textfield`) não a tem. |
| `DYNAMICLIST_PATH_MISSING` | erro | Um `dynamiclist` sem `path`. |
| `UNKNOWN_COMPONENT_TYPE` | aviso | `type` não reconhecido — degrada para um placeholder em vez de falhar a importação toda. |

**Erros** fazem `importSchema()` rejeitar a promise; **avisos** ficam disponíveis em `ImportResult.warnings` e a importação prossegue normalmente.
