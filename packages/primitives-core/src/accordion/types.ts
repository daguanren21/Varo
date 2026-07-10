import type { MaybeRef, ReactiveRuntime, Ref } from '../reactive'

export type AccordionType = 'single' | 'multiple'
export type AccordionValue = string | string[] | undefined

export interface AccordionRootOptions {
  runtime?: ReactiveRuntime
  collapsible?: MaybeRef<boolean | undefined>
  defaultValue?: AccordionValue
  disabled?: Ref<boolean | undefined>
  id?: MaybeRef<string | undefined>
  type?: MaybeRef<AccordionType | undefined>
  value?: Ref<AccordionValue>
  valueControlled?: Ref<boolean | undefined>
  onValueChange?: (value: AccordionValue) => void
}

export interface AccordionRootState {
  collapsible: Ref<boolean>
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  type: Ref<AccordionType>
  value: Ref<AccordionValue>
}

export interface AccordionRootAttrs {
  root: Record<string, unknown>
}

export interface AccordionRootEvents {
  toggle: (value: string, disabled?: boolean) => boolean
}

export interface AccordionRootApi {
  getContentAttrs: (value: string) => Record<string, unknown>
  getItemAttrs: (value: string, disabled?: boolean) => Record<string, unknown>
  getTriggerAttrs: (value: string, disabled?: boolean) => Record<string, unknown>
  isOpen: (value: string) => boolean
  toggle: (value: string, disabled?: boolean) => boolean
}

export interface UseAccordionRootResult {
  api: AccordionRootApi
  attrs: AccordionRootAttrs
  events: AccordionRootEvents
  state: AccordionRootState
}
