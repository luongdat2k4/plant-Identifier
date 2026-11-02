import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './shared/styles/global.css'
import './shared/styles/theme.css'
createApp(App).use(router).mount('#app')
