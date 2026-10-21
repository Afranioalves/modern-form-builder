# Compatibilidade com Camunda 8

## Princípio

`FormSchema` **é** o schema de formulário do Camunda 8/Zeebe (o mesmo formato que o form-js usa). `importSchema` não transforma o schema — apenas o valida e renderiza diretamente. Isto significa:

- Um schema desenhado no **Camunda Modeler** (drag-and-drop) pode ser copiado para o `modern-form` sem qualquer conversão.
- Um schema renderizado pelo `modern-form` continua 100% válido e re-editável nas ferramentas originais da Camunda (Modeler, Tasklist).
- `getSchemaVariables` extrai as mesmas variáveis de entrada/saída que uma integração com o Zeebe precisa para ligar variáveis de processo.

## Onde um formulário se liga a um processo

No Camunda 8, um formulário associa-se a um **User Task** ou a um **Start Event**, de duas formas:

- **Embutido** diretamente no XML do BPMN, como uma extensão `zeebe:userTaskForm`.
- **Ligado** como um recurso `.form` implementado separadamente e referenciado pelo id do formulário.

Em qualquer dos casos, o JSON do schema é idêntico ao que o `modern-form` consome.

## Mapeamento campo a campo

| Campo do Camunda | Tratamento no modern-form |
| --- | --- |
| `schemaVersion` | Validado contra a versão suportada pelo `SchemaLinter`; uma versão mais recente gera um **aviso**, não um erro — a renderização continua com o melhor esforço. |
| `exporter` | Metadado de passagem, devolvido em `ImportResult.schema`, sem uso funcional. |
| `executionPlatform` / `executionPlatformVersion` | Passado adiante sem alteração. |
| `components` (árvore, incl. `group`/`dynamiclist` aninhados) | Travessia recursiva, sem achatamento — a mesma forma de árvore do schema original. |
| `properties` (bag livre) | Totalmente preservado; é também onde vivem quaisquer extensões próprias do `modern-form`. |

## Extensões próprias — sempre em `properties`

O `modern-form` **não introduz nenhum campo de topo novo** no schema. Qualquer capacidade específica da biblioteca (por exemplo, um override de `classNames` definido diretamente no schema, em vez de passado na construção do `Form`) fica sempre dentro do bag livre `properties`, com um namespace próprio:

```json
{
  "properties": {
    "modernForm:classNames": { "input": "ring-2 ring-purple-600" }
  }
}
```

Isto garante que o schema permanece válido e re-importável na cadeia de ferramentas Camunda original — um consumidor apenas-Camunda simplesmente ignora as chaves `properties['modernForm:*']` como metadado inerte.

## Degradação graciosa

Um tipo de componente que o `modern-form` ainda não suporta (ou nunca veio a suportar) nunca bloqueia a importação do resto do formulário:

- `SchemaLinter` emite um **aviso** (`UNKNOWN_COMPONENT_TYPE`), não um erro.
- O renderizador substitui esse nó por um placeholder visível mas inerte (`Unsupported field type: "..."`, com aviso na consola), continuando a renderizar normalmente todos os irmãos/ancestrais.

Isto cobre tanto um `type` totalmente desconhecido como os tipos já reconhecidos mas ainda não implementados — ver [roadmap de componentes](/componentes/#roadmap).

## Ligar variáveis de processo com `getSchemaVariables`

```ts
import { getSchemaVariables } from '@modern-form/schema'

const { inputs, outputs } = getSchemaVariables(schema)
// inputs:  variáveis que o schema LÊ (ex. referenciadas em expressões FEEL)
// outputs: variáveis que o schema ESCREVE (as `key` dos campos com dados)
```

Útil para determinar, sem executar o formulário, que variáveis de processo do Zeebe uma tarefa precisa de receber e vai devolver.
