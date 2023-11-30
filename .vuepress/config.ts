import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  title: 'Dreammall.earth Documentation',
  description: 'Dreammall.earth Documentation',
  dest: 'build/docs',
  pagePatterns: ['**/*.md', '!**/.vuepress', '!**/node_modules'],
  base: process.env.VUEPRESS_BASE ?? '/',
})
