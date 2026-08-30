import type { Theme } from 'vitepress'
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
  VLoading,
  VNumberKeyboard,
  VPicker,
  VRadio,
  VRadioGroup,
  VRange,
  VRate,
  VSearchbar,
  VSelect,
  VShortPassword,
  VSwitch,
  VTextarea,
  VToast,
  VUploader,
} from '@varo-ui/h5'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import DefaultTheme from 'vitepress/theme'
import AgentComponentDemo from '../../src/components/AgentComponentDemo.vue'
import AgentComponentsDemo from '../../src/components/AgentComponentsDemo.vue'
import ComponentCatalog from '../../src/components/ComponentCatalog.vue'
import FormComponentDemo from '../../src/components/FormComponentDemo.vue'
import ExtendedComponentDemo from '../../src/components/ExtendedComponentDemo.vue'
import MiniProgramBlocksGallery from '../../src/components/MiniProgramBlocksGallery.vue'
import PlatformTabsDemo from '../../src/components/PlatformTabsDemo.vue'
import PrimitiveCatalog from '../../src/components/PrimitiveCatalog.vue'
import PrimitiveExample from '../../src/components/PrimitiveExample.vue'
import DocsLayout from './DocsLayout.vue'
import '@varo-ui/h5/source/style.css'
import './tailwind.css'
import './custom.css'

const docsTheme = createTheme({
  primary: '#0f766e',
  success: '#15803d',
  warning: '#c2410c',
  error: '#b91c1c',
  neutral: '#172033',
})

const theme: Theme = {
  extends: DefaultTheme,
  Layout: DocsLayout,
  enhanceApp({ app }) {
    VaroConfigProvider.install(app, { theme: docsTheme })
    app.component('AgentComponentsDemo', AgentComponentsDemo)
    app.component('AgentComponentDemo', AgentComponentDemo)
    app.component('FormComponentDemo', FormComponentDemo)
    app.component('ExtendedComponentDemo', ExtendedComponentDemo)
    app.component('ComponentCatalog', ComponentCatalog)
    app.component('MiniProgramBlocksGallery', MiniProgramBlocksGallery)
    app.component('PlatformTabsDemo', PlatformTabsDemo)
    app.component('PrimitiveCatalog', PrimitiveCatalog)
    app.component('PrimitiveExample', PrimitiveExample)
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
    app.component('VLoading', VLoading)
    app.component('VNumberKeyboard', VNumberKeyboard)
    app.component('VPicker', VPicker)
    app.component('VRadio', VRadio)
    app.component('VRadioGroup', VRadioGroup)
    app.component('VRange', VRange)
    app.component('VRate', VRate)
    app.component('VSearchbar', VSearchbar)
    app.component('VSelect', VSelect)
    app.component('VShortPassword', VShortPassword)
    app.component('VSwitch', VSwitch)
    app.component('VTextarea', VTextarea)
    app.component('VToast', VToast)
    app.component('VUploader', VUploader)
  },
}

export default theme
