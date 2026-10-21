# @modern-form/docs

Site de documentação (VitePress). Serve o conteúdo em `docs/`.

```sh
npm install
npm run dev     # http://localhost:5173
npm run build   # gera docs/.vitepress/dist
npm run preview # serve o build estático
```

## Porque é que este pacote não usa pnpm/workspace:\*

Ao contrário dos restantes pacotes do monorepo, `apps/docs` está **excluído** de `pnpm-workspace.yaml` e instala as suas dependências com `npm` (ficheiro próprio `package-lock.json`), não com o `pnpm` do resto do repositório.

Motivo: o CLI do `vitepress` (`bin/vitepress.js`, um módulo ESM invocado via `require()`) dispara um `ERR_REQUIRE_CYCLE_MODULE` no Node 22 especificamente quando resolvido através do layout de `node_modules` com symlinks do pnpm — reproduzido de forma consistente neste monorepo, e ausente numa instalação isolada com `npm` (node_modules plano, sem symlinks). Isto não é um problema do conteúdo do site nem do `modern-form` em si; é uma incompatibilidade pontual entre o CLI do `vitepress` e o `node-linker` por defeito do pnpm.

Se uma versão futura do `vitepress` resolver isto, basta voltar a incluir `apps/docs` em `pnpm-workspace.yaml`, apagar `package-lock.json` e `node_modules`, e correr `pnpm install` a partir da raiz.
