// eslint-disable-next-line import/no-unassigned-import
import '@mdi/font/css/materialdesignicons.css'
// eslint-disable-next-line import/no-unassigned-import
import 'vuetify/styles'
import { I18n, useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { aliases as mdiAliases } from 'vuetify/iconsets/mdi'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'

import { aliases as customAliases } from '#assets/icons'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (i18n: I18n<any, NonNullable<unknown>, NonNullable<unknown>, string, false>) =>
  createVuetify({
    locale: {
      adapter: createVueI18nAdapter({ i18n, useI18n }),
    },
    ssr: true,
    icons: {
      aliases: { ...mdiAliases, ...customAliases },
    },
  })
