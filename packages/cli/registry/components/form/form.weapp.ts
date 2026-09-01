import type { UseFormReturn } from '@varo-ui/headless'
import '../../styles/varo.css'

export { default as VFormItem } from './v-form-item.vue'
export { default as VForm } from './v-form.vue'
export type { FieldRule, FormRules, FormValues, UseFormReturn } from '@varo-ui/headless'
export type FormSubmitPayload = Parameters<ReturnType<UseFormReturn['handleSubmit']>>[0]
