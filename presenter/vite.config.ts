import path from 'path'

import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'
import { UserConfig } from 'vite'
import { checker } from 'vite-plugin-checker'

const isStorybook = () =>
  ['storybook', 'storybook:build'].includes(process.env.npm_lifecycle_event as string)

const config: UserConfig = {
  plugins: [
    vue(),
    !isStorybook() && vike({ prerender: true }), // SSR only when storybook is not running
    vueI18n({
      ssr: true,
      include: path.resolve(__dirname, './src/locales/**'),
    }),
    checker({
      typescript: true,
      vueTsc: true,
    }),
  ],
  build: {
    outDir: './build',
  },
  ssr: { noExternal: ['vuetify'] },
  resolve: {
    alias: {
      '#components': path.join(__dirname, '/src/components'),
      '#pages': path.join(__dirname, '/src/pages'),
      '#assets': path.join(__dirname, '/src/assets'),
      '#layouts': path.join(__dirname, '/src/layouts'),
      '#stores': path.join(__dirname, '/src/stores'),
      '#mutations': path.join(__dirname, '/src/graphql/mutations'),
      '#src': path.join(__dirname, '/src'),
      '#plugins': path.join(__dirname, '/renderer/plugins'),
      '#context': path.join(__dirname, '/renderer/context'),
      '#types': path.join(__dirname, '/types'),
      '#root': __dirname,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "./src/assets/sass/style.scss";
        `,
      },
    },
  },
}

export default config
