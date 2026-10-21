# Vue

```sh
pnpm add @modern-form/vue vue
```

`@modern-form/vue` segue o mesmo princípio do wrapper React: monta a classe `Form` imperativa e reage a mudanças de props, sem reimplementar nenhuma lógica.

```vue
<script setup lang="ts">
import '@modern-form/renderer/styles.css'
import { ModernForm } from '@modern-form/vue'
import type { FormSchema } from '@modern-form/schema'

const schema: FormSchema = {
  /* ... */
}

function onSubmit({ data, errors }: { data: Record<string, unknown>; errors: Record<string, string[]> }) {
  if (Object.keys(errors).length === 0) submitToZeebe(data)
}
</script>

<template>
  <ModernForm :schema="schema" :data="{ approved: false }" @submit="onSubmit" />
</template>
```

## Props e eventos

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `schema` | `FormSchema` | Obrigatório. |
| `data` | `FormData` | Dados iniciais. |
| `additional-modules` | `FieldTypeExtension[]` | Tipos de campo customizados. |
| `class-names` | `ClassNamesOption` | Overrides de classe por tipo de campo. |
| `properties` | `FormOptions['properties']` | Ex. `{ readOnly: true }`. |

| Evento | Payload |
| --- | --- |
| `submit` | `{ data, errors }` |
| `changed` | `{ data, field? }` |

## Aceder à instância `Form` diretamente

```vue
<script setup lang="ts">
import { ref } from 'vue'

const modernFormRef = ref()

function submitProgramaticamente() {
  modernFormRef.value?.getForm()?.submit()
}
</script>

<template>
  <ModernForm ref="modernFormRef" :schema="schema" />
</template>
```

O componente expõe `getForm()` via `defineExpose`, devolvendo a instância `Form` atual (ou `null` antes de montar).
