import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { createTheme, VaroConfigProvider } from '@varo/theme'
import InteractivePreview from '../../src/components/InteractivePreview.vue'
import './custom.css'

const docsTheme = createTheme({
  primary: '#0f766e',
  success: '#15803d',
  warning: '#c2410c',
  error: '#b91c1c',
  neutral: '#172033'
})

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(VaroConfigProvider, { theme: docsTheme })
    app.component('InteractivePreview', InteractivePreview)
  }
}

export default theme