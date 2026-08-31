import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { createApp } from 'vue'
import App from './App.vue'
import '@varo-ui/h5/source/style.css'
import './styles.css'

const theme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a',
})

createApp(App).use(VaroConfigProvider, { theme }).mount('#app')
