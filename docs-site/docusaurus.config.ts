import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Catálogo de Widgets',
  tagline: 'Documentación + catálogo de widgets Angular y Flutter, unificados',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://widgets-docs.tuorg.dev',
  baseUrl: '/',

  organizationName: 'tuorg',
  projectName: 'poc-portal-widgets',

  // Los links a /docs/widgets/{id} se construyen en runtime; no los analiza el checker.
  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // editUrl: 'https://github.com/tuorg/poc-portal-widgets/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Catálogo de Widgets',
      logo: {
        alt: 'Catálogo de Widgets',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/catalog', label: 'Catálogo', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {
          href: 'https://github.com/sebazms07/poc-portal-widgets',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Sitio',
          items: [
            {label: 'Catálogo', to: '/catalog'},
            {label: 'Documentación', to: '/docs/intro'},
          ],
        },
        {
          title: 'Proyecto',
          items: [
            {label: 'GitHub', href: 'https://github.com/sebazms07/poc-portal-widgets'},
          ],
        },
      ],
      copyright: `POC exploratorio · ${new Date().getFullYear()} · Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
