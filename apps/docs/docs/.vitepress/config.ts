import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'modern-form',
  description: 'Biblioteca TypeScript + Tailwind CSS para formulários dinâmicos compatíveis com Camunda 8.',
  lang: 'pt-PT',
  lastUpdated: true,
  cleanUrls: true,

  head: [['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }]],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'modern-form',

    nav: [
      { text: 'Guia', link: '/guia/instalacao' },
      { text: 'Conceitos', link: '/conceitos/schema' },
      { text: 'Componentes', link: '/componentes/' },
      { text: 'API', link: '/api/form' },
      {
        text: '0.1.0',
        items: [
          { text: 'Especificação técnica', link: 'https://github.com/Afranioalves/modern-form-builder/blob/main/SPECIFICATION.md' },
          { text: 'Changelog', link: 'https://github.com/Afranioalves/modern-form-builder/releases' },
        ],
      },
    ],

    sidebar: {
      '/guia/': sidebarGuia(),
      '/conceitos/': sidebarConceitos(),
      '/frameworks/': sidebarConceitos(),
      '/componentes/': sidebarComponentes(),
      '/api/': sidebarApi(),
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/Afranioalves/modern-form-builder' }],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Lançado sob a licença MIT.',
      copyright: 'modern-form',
    },

    editLink: {
      pattern: 'https://github.com/Afranioalves/modern-form-builder/edit/main/apps/docs/docs/:path',
      text: 'Editar esta página no GitHub',
    },

    outline: {
      label: 'Nesta página',
    },

    docFooter: {
      prev: 'Anterior',
      next: 'Próximo',
    },

    returnToTopLabel: 'Voltar ao topo',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Aparência',
    lastUpdatedText: 'Atualizado em',
  },
});

function sidebarGuia() {
  return [
    {
      text: 'Primeiros passos',
      items: [
        { text: 'Instalação', link: '/guia/instalacao' },
        { text: 'Início rápido', link: '/guia/inicio-rapido' },
        { text: 'Compatibilidade com Camunda 8', link: '/guia/compatibilidade-camunda' },
      ],
    },
    {
      text: 'Integrações de framework',
      items: [
        { text: 'Vanilla / core API', link: '/frameworks/vanilla' },
        { text: 'React', link: '/frameworks/react' },
        { text: 'Vue', link: '/frameworks/vue' },
      ],
    },
  ];
}

function sidebarConceitos() {
  return [
    {
      text: 'Conceitos principais',
      items: [
        { text: 'Formato do schema', link: '/conceitos/schema' },
        { text: 'Expressões FEEL', link: '/conceitos/expressoes-feel' },
        { text: 'Validação', link: '/conceitos/validacao' },
        { text: 'Extensibilidade', link: '/conceitos/extensibilidade' },
        { text: 'Theming e customização', link: '/conceitos/theming' },
      ],
    },
    {
      text: 'Integrações de framework',
      items: [
        { text: 'Vanilla / core API', link: '/frameworks/vanilla' },
        { text: 'React', link: '/frameworks/react' },
        { text: 'Vue', link: '/frameworks/vue' },
      ],
    },
  ];
}

function sidebarComponentes() {
  return [
    {
      text: 'Referência de componentes',
      items: [{ text: 'Visão geral', link: '/componentes/' }],
    },
    {
      text: 'Input',
      items: [
        { text: 'Textfield', link: '/componentes/textfield' },
        { text: 'Textarea', link: '/componentes/textarea' },
        { text: 'Number', link: '/componentes/number' },
        { text: 'Datetime', link: '/componentes/datetime' },
      ],
    },
    {
      text: 'Seleção',
      items: [
        { text: 'Checkbox', link: '/componentes/checkbox' },
        { text: 'Radio', link: '/componentes/radio' },
        { text: 'Select', link: '/componentes/select' },
        { text: 'Checklist', link: '/componentes/checklist' },
      ],
    },
    {
      text: 'Apresentação',
      items: [
        { text: 'Text', link: '/componentes/text' },
        { text: 'Image', link: '/componentes/image' },
      ],
    },
    {
      text: 'Layout e ações',
      items: [
        { text: 'Spacer', link: '/componentes/spacer' },
        { text: 'Separator', link: '/componentes/separator' },
        { text: 'Button', link: '/componentes/button' },
      ],
    },
  ];
}

function sidebarApi() {
  return [
    {
      text: 'Referência da API',
      items: [
        { text: 'Classe Form', link: '/api/form' },
        { text: 'getSchemaVariables', link: '/api/get-schema-variables' },
        { text: 'SchemaLinter', link: '/api/schema-linter' },
      ],
    },
  ];
}
