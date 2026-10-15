import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { i18n } from './shared/i18n'
import { getInitialLanguage } from '@/shared/composables/useLanguage'
import { cleanupSyncedReadings, requestPersistentStorage } from '@/shared/storage/readings'
import { router } from './router'
import { initPwa } from '@/shared/composables/usePwa'
import { useErrorStore } from '@/shared/stores/errorStore'

const initialLang = getInitialLanguage()
document.documentElement.lang = initialLang

const app = createApp(App)
app.use(i18n)
app.use(router)

const { report } = useErrorStore()
app.config.errorHandler = (err, _instance, info) => {
  report(err, `vue:${info}`)
}
window.addEventListener('unhandledrejection', event => {
  report(event.reason, 'unhandledrejection')
})
i18n.global.locale.value = initialLang

app.mount('#app')
void requestPersistentStorage()
void cleanupSyncedReadings()
initPwa()
