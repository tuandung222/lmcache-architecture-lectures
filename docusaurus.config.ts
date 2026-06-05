import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'LMCache Internals',
  tagline: 'Chuỗi bài giảng phân tích chi tiết kiến trúc & hiện thực hệ thống chia sẻ KV Cache LMCache',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://tuandung222.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/lmcache-architecture-lectures/',

  // GitHub pages deployment config.
  organizationName: 'tuandung222', // GitHub org/user name.
  projectName: 'lmcache-architecture-lectures', // Repo name.

  onBrokenLinks: 'warn',

  // Internationalization settings
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl:
            'https://github.com/tuandung222/lmcache-architecture-lectures/tree/main/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false, // Vô hiệu hóa blog để tập trung vào tài liệu bài học
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig: {
    metadata: [
      {name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet'},
    ],
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'LMCache Internals',
      logo: {
        alt: 'LMCache Internals Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Bài học (Lectures)',
        },
        {
          href: 'https://github.com/tuandung222/lmcache-architecture-lectures',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Bài học',
          items: [
            {
              label: 'Bài 0: Tổng quan KV Cache Sharing',
              to: '/docs/lesson_0_kv_cache_sharing_fundamentals',
            },
            {
              label: 'Bài 1: Kiến trúc LMCache',
              to: '/docs/lesson_1_lmcache_architecture',
            },
            {
              label: 'Bài 2: Bộ nhớ phân tầng (Hierarchical Storage)',
              to: '/docs/lesson_2_hierarchical_storage',
            },
          ],
        },
        {
          title: 'Tài nguyên',
          items: [
            {
              label: 'GitHub Repository',
              href: 'https://github.com/tuandung222/lmcache-architecture-lectures',
            },
            {
              label: 'LMCache GitHub',
              href: 'https://github.com/LMCache/LMCache',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} LMCache Internals. Biên soạn bởi tuandung222. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'json', 'yaml', 'markdown'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
