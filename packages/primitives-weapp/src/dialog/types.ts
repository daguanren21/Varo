export type { DialogOpenChangeDetails, DialogOpenChangeReason } from '@varo-ui/headless'

export interface DialogPartProps {
  as?: string
  externalClasses?: string[]
}

export interface DialogRootProps {
  defaultOpen?: boolean
  open?: boolean
  disabled?: boolean
}
