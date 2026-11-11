import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import packageMetadata from '../package.json';

const config: Config = {
  url: 'https://0610studio.github.io',

  baseUrl: '/zs-ui/',

  organizationName: '0610studio',
  projectName: 'zs-ui',

  title: 'zs-ui',
  tagline: 'Expo용 iOS·Android UI 라이브러리',
  favicon: 'img/favicon.ico',

  customFields: {
    zsUiVersion: packageMetadata.version,
  },

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['ko', 'en'],
      },
    ],
  ],

  themeConfig: {
    image: 'img/zs-banner.png',
    navbar: {
      title: 'zs-ui',
      logo: {
        alt: 'zs-ui',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '문서',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://github.com/0610studio/zs-ui',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: '문서',
          items: [
            {
              label: '문서',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: '링크',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/0610studio/zs-ui',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 0610studio. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'google-site-verification',
        content: 'H9nzKXqTA1-fjx7PbVQk7uvveM5wI5xbdblzHVHzOYQ',
      },
    },
  ],
};

export default config;
