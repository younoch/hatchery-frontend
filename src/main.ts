import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { i18n } from './shared/i18n'
import { getInitialLanguage } from './shared/composables/useLanguage'
import { router } from './router'

const initialLang = getInitialLanguage()
document.documentElement.lang = initialLang

const app = createApp(App)
app.use(i18n)
app.use(router)
i18n.global.locale.value = initialLang

app.mount('#app')
