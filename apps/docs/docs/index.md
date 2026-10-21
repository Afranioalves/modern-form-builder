---
layout: home

hero:
  name: modern-form
  text: Formulários dinâmicos, do schema ao DOM.
  tagline: Biblioteca TypeScript + Tailwind CSS para renderizar formulários a partir de um schema JSON compatível com Camunda 8 — com expressões FEEL, validação e um sistema de theming totalmente fluido.
  actions:
    - theme: brand
      text: Começar
      link: /guia/instalacao
    - theme: alt
      text: Ver no GitHub
      link: https://github.com/Afranioalves/modern-form-builder
    - theme: alt
      text: Referência de componentes
      link: /componentes/

features:
  - icon: 🧩
    title: Compatível com Camunda 8
    details: Importa diretamente o mesmo formato de schema JSON do form-js — sem transformação com perdas, sem campos proprietários no topo do schema.
  - icon: 🧠
    title: Expressões FEEL nativas
    details: Visibilidade condicional, valores computados e opções dinâmicas avaliados com @bpmn-io/feelin, a mesma linguagem que o Camunda usa em BPMN e DMN.
  - icon: 🎨
    title: Theming em 3 camadas
    details: Tokens CSS, atributos data-part e a prop classNames — customiza o visual sem forks e sem lutar contra especificidade.
  - icon: ✅
    title: Validação em duas velocidades
    details: Feedback em tempo real e validação autoritativa no submit, partilhando as mesmas regras puras — nunca divergem.
  - icon: ⚛️
    title: Agnóstico de framework
    details: Núcleo em TypeScript puro com uma API imperativa, mais wrappers finos para React e Vue.
  - icon: 🔌
    title: Totalmente extensível
    details: Regista os teus próprios tipos de campo — o registo usa "o último registo vence", o que te permite até substituir tipos nativos.
---

<div class="vp-doc" style="max-width: 960px; margin: 3rem auto 0; padding: 0 24px;">

## Um formulário, três linhas

```ts
import { Form } from '@modern-form/renderer'
import '@modern-form/renderer/styles.css'

const form = new Form({ container: document.getElementById('app')! })
await form.importSchema(schema, { approved: false })

form.on('submit', ({ data, errors }) => console.log(data, errors))
```

O `schema` é o mesmo JSON que o Camunda Modeler exporta para um User Task ou Start Event — consulta o [formato do schema](/conceitos/schema) para o catálogo completo de tipos de componente.

</div>
