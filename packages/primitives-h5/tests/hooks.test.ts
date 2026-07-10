import { describe, expect, it } from 'vitest'
import {
  useAccordionRoot,
  useCheckboxRoot,
  useCollapsibleRoot,
  usePopoverRoot,
  useRadioGroup,
  useSelectRoot,
  useSwitchRoot,
  useTabsRoot
} from '../src/hooks'

describe('primitives-h5 hooks entry', () => {
  it('exports interactive primitive hooks', () => {
    ;[
      useAccordionRoot,
      useCheckboxRoot,
      useCollapsibleRoot,
      usePopoverRoot,
      useRadioGroup,
      useSelectRoot,
      useSwitchRoot,
      useTabsRoot
    ].forEach((hook) => {
      expect(hook).toEqual(expect.any(Function))
    })
  })
})
