import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const STORAGE_KEY = 'hatchery-lang'

export function useLanguage() {
  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value)

  const setLanguage = (lang: 'bn' | 'en') => {
    locale.value = lang
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Ignore localStorage errors (e.g., cookies disabled)
    }
  }

  const toggleLanguage = () => {
    setLanguage(locale.value === 'bn' ? 'en' : 'bn')
  }

  return {
    locale: currentLocale,
    setLanguage,
    toggleLanguage,
  }
}

export function getInitialLanguage(): 'bn' | 'en' {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'bn' || stored === 'en') {
      return stored
    }
  } catch {
    // Ignore localStorage errors
  }
  return 'bn'
}
