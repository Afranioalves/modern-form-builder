# Referência de componentes

Os 13 tipos de componente que a v1 do `@modern-form/renderer` sabe renderizar, organizados como no [catálogo do schema](/conceitos/schema#catálogo-de-tipos-de-componente).

## Input

- [Textfield](/componentes/textfield)
- [Textarea](/componentes/textarea)
- [Number](/componentes/number)
- [Datetime](/componentes/datetime)

## Seleção

- [Checkbox](/componentes/checkbox)
- [Radio](/componentes/radio)
- [Select](/componentes/select)
- [Checklist](/componentes/checklist)

## Apresentação

- [Text](/componentes/text)
- [Image](/componentes/image)

## Layout e ações

- [Spacer](/componentes/spacer)
- [Separator](/componentes/separator)
- [Button](/componentes/button)

## `group` (estrutural)

`group` não aparece nesta lista porque não passa pelo `FieldTypeRegistry` — é tratado diretamente pela árvore de renderização do `Form`, já que aninha uma subárvore `components` em vez de ter um único valor. Ver [formato do schema](/conceitos/schema#input).

## Roadmap

| Tipo | Estado | Nota |
| --- | --- | --- |
| `taglist` | v1.1 | Exige o padrão APG combobox completo (navegação por teclado, `aria-activedescendant`) — mais trabalho de acessibilidade do que `checklist`. |
| `dynamiclist` | v1.1 | Requer o motor de escopo `this` por linha já descrito em [expressões FEEL](/conceitos/expressoes-feel#o-escopo-this-dentro-de-group-e-listas). |
| `table` | v1.1 | Orientado a leitura, bind a um array via `path`. |
| `expression` | v1.1 | Campo computado via FEEL, com timing configurável (`computeOn: "change" \| "blur" \| "presubmit"`). |
| `html` | v1.1 | Exige sanitização (DOMPurify), tal como `text`. |
| `iframe`, `documentPreview` | v2 | Considerações próprias de segurança/sandboxing. |
| `filepicker` | v2 | Precisa de uma história de adaptadores de upload plugáveis. |

Até lá, qualquer um destes tipos é reconhecido pelo schema (`@modern-form/schema` tipa-os e valida-os sem erro) mas renderiza como um placeholder inerte no `@modern-form/renderer` — ver [degradação graciosa](/guia/compatibilidade-camunda#degradação-graciosa).
