import { defineConfig } from 'dumi';

export default defineConfig({
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    name: 'react-data-table',
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
    nav: [
      { title: 'Demo', link: '/demo/basic' },
      { title: 'API', link: '/api' },
      { title: '指南', link: '/guide' },
    ],
  },
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: '英文' },
  ],
  // title: 'react-data-table',
  // favicon:
  //   'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  // logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  // outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config
});
