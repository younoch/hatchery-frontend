import { createI18n } from 'vue-i18n'
import bn from '../locales/bn.json'
import en from '../locales/en.json'

const messages = {
  bn,
  en,
}

export const i18n = createI18n({
  legacy: false,
  locale: 'bn',
  fallbackLocale: 'bn',
  messages,
  numberFormats: {
    bn: {
      decimal: {
        notation: 'standard',
        numberingSystem: 'latn',
      },
    },
    en: {
      decimal: {
        notation: 'standard',
        numberingSystem: 'latn',
      },
    },
  },
  datetimeFormats: {
    bn: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        numberingSystem: 'latn',
      },
    },
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        numberingSystem: 'latn',
      },
    },
  },
})
