import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'ZS-ui',
  tagline: 'ReactNative Expo - UI Toolkit',
  favicon: 'img/favicon.ico',

  url: 'https://0610studio.github.io',
  baseUrl: '/zs-ui/',

  organizationName: '0610studio', // Usually your GitHub org/user name.
  projectName: 'zs-ui', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/0610studio/zs-ui/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/0610studio/zs-ui/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Expo ZS-ui',
      logo: {
        alt: 'Expo ZS-ui Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '문서',
        },
        {to: '/blog', label: '블로그', position: 'left'},
        {
          type: 'search', // Algolia 검색바 추가
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
          title: 'Docs',
          items: [
            {
              label: '문서',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/0610studio/zs-ui',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 0610studio, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    trailingSlash: true,
    algolia: {
      // 알골리아에서 제공한 appId를 사용하세요.
      appId: 'NXL3O5WL1V',

      // 공개 API 키: 커밋해도 문제가 생기지 않습니다.
      apiKey: 'bf99a76d14d820e1bdb58e173f75c02a',

      indexName: '0610studioio',

      // 옵션: 아래 문서를 참고
      contextualSearch: true,

      // 옵션: history.push 대신 window.location을 통해 탐색해야 하는 도메인을 지정합니다. 여러 문서 사이트를 크롤링하고 window.location.href를 사용하여 해당 사이트로 이동하려는 경우에 유용한 알골리아 설정입니다.
      // externalUrlRegex: 'external\\.com|domain\\.com',

      // 옵션: 알골리아에서 URL 일부를 바꿉니다. 다른 baseUrl을 사용하는 여러 배포본에 대해 같은 검색 인덱스를 사용할 경우 유용합니다. `from` 파라미터에 정규식이나 문자열을 사용할 수 있습니다. For example: localhost:3000 vs myCompany.com/docs
      // replaceSearchResultPathname: {
      //   from: '/docs/', // or as RegExp: /\/docs\//
      //   to: '/',
      // },

      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false,

      //... other Algolia params
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
