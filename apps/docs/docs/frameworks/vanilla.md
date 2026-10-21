# Vanilla / core API

`@modern-form/renderer` expõe uma classe `Form` imperativa — a forma mais direta de usar a biblioteca, e a que os wrappers de [React](/frameworks/react) e [Vue](/frameworks/vue) encapsulam internamente.

```ts
import { Form } from '@modern-form/renderer'
import '@modern-form/renderer/styles.css'

const form = new Form({ container: document.querySelector('#form')! })
await form.importSchema(schema, initialData)
```

## Mover o formulário entre contentores

```ts
form.detach()                 // remove do DOM, mantém o estado em memória
form.attachTo(outroContentor) // volta a montar noutro contentor, sem reimportar o schema
```

## Angular, Svelte, Solid, …

Como a API é uma classe TypeScript simples sem dependência de nenhum framework, integra-se em qualquer um deles da mesma forma: cria o `Form` no hook de ciclo de vida equivalente a "montado" (`ngAfterViewInit`, `onMount`, etc.), chama `form.destroy()` no equivalente a "desmontado", e `form.importSchema(...)` sempre que o schema/dados mudarem. É exatamente o que `@modern-form/react` e `@modern-form/vue` fazem — consulta o código-fonte de qualquer um deles como referência de poucas linhas.

## Referência completa

Ver [referência da classe `Form`](/api/form) para a lista completa de métodos, eventos e tipos.
