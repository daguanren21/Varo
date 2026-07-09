import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { createTheme, VaroConfigProvider } from '@varo/theme'
import {
  VCalendar,
  VCalendarCard,
  VCascader,
  VCheckbox,
  VCheckboxGroup,
  VDatePicker,
  VForm,
  VFormItem,
  VInput,
  VInputNumber,
  VNumberKeyboard,
  VPicker,
  VRadio,
  VRadioGroup,
  VRange,
  VRate,
  VSearchbar,
  VShortPassword,
  VTextarea,
  VUploader
} from '@varo/ui-h5'
import '@varo/ui-h5/source/style.css'
import InteractivePreview from '../../src/components/InteractivePreview.vue'
import FormComponentDemo from '../../src/components/FormComponentDemo.vue'
import MiniProgramBlocksGallery from '../../src/components/MiniProgramBlocksGallery.vue'
import PlatformTabsDemo from '../../src/components/PlatformTabsDemo.vue'
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
    app.component('FormComponentDemo', FormComponentDemo)
    app.component('InteractivePreview', InteractivePreview)
    app.component('MiniProgramBlocksGallery', MiniProgramBlocksGallery)
    app.component('PlatformTabsDemo', PlatformTabsDemo)
    app.component('VCalendar', VCalendar)
    app.component('VCalendarCard', VCalendarCard)
    app.component('VCascader', VCascader)
    app.component('VCheckbox', VCheckbox)
    app.component('VCheckboxGroup', VCheckboxGroup)
    app.component('VDatePicker', VDatePicker)
    app.component('VForm', VForm)
    app.component('VFormItem', VFormItem)
    app.component('VInput', VInput)
    app.component('VInputNumber', VInputNumber)
    app.component('VNumberKeyboard', VNumberKeyboard)
    app.component('VPicker', VPicker)
    app.component('VRadio', VRadio)
    app.component('VRadioGroup', VRadioGroup)
    app.component('VRange', VRange)
    app.component('VRate', VRate)
    app.component('VSearchbar', VSearchbar)
    app.component('VShortPassword', VShortPassword)
    app.component('VTextarea', VTextarea)
    app.component('VUploader', VUploader)
  }
}

export default theme
