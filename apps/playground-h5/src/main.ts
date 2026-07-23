import { createApp } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo/theme'
import App from './App.vue'
import '@varo/ui-h5/source/style.css'
import './styles.css'

const theme = createTheme({
  primary: '#0f766e',
  success: '#15803d',
  warning: '#c2410c',
  error: '#b91c1c',
  neutral: '#172033'
})

createApp(App).use(VaroConfigProvider, { theme }).mount('#app')
