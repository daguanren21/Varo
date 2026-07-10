import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useAccordionRoot } from '../src/accordion'
import { useCollapsibleRoot } from '../src/collapsible'
import { usePopoverRoot } from '../src/popover'

describe('p1 disclosure and floating primitives', () => {
  it('toggles collapsible state with controlled and disabled contracts', () => {
    const uncontrolled = useCollapsibleRoot({ defaultOpen: false })

    expect(uncontrolled.attrs.trigger['data-state']).toBe('closed')
    expect(uncontrolled.events.toggle()).toBe(true)
    expect(uncontrolled.state.open.value).toBe(true)
    expect(uncontrolled.attrs.content['data-state']).toBe('open')

    const open = ref<boolean | undefined>(false)
    const onOpenChange = vi.fn()
    const controlled = useCollapsibleRoot({ open, onOpenChange })

    expect(controlled.events.toggle()).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(controlled.state.open.value).toBe(false)

    const disabled = ref(true)
    const blocked = useCollapsibleRoot({ disabled })

    expect(blocked.events.toggle()).toBe(false)
    expect(blocked.attrs.trigger['data-disabled']).toBe('true')
  })

  it('supports single accordion values and collapsible items', () => {
    const accordion = useAccordionRoot({
      collapsible: true,
      defaultValue: 'details',
      type: 'single'
    })

    expect(accordion.api.getTriggerAttrs('details')).toMatchObject({
      'aria-expanded': true,
      'data-state': 'open'
    })

    expect(accordion.events.toggle('details')).toBe(true)
    expect(accordion.state.value.value).toBeUndefined()

    expect(accordion.events.toggle('advanced')).toBe(true)
    expect(accordion.state.value.value).toBe('advanced')
    expect(accordion.api.getContentAttrs('advanced')['data-state']).toBe('open')
  })

  it('supports multiple accordion values and item disabled state', () => {
    const accordion = useAccordionRoot({
      defaultValue: ['account'],
      type: 'multiple'
    })

    expect(accordion.events.toggle('security')).toBe(true)
    expect(accordion.state.value.value).toEqual(['account', 'security'])

    expect(accordion.events.toggle('account')).toBe(true)
    expect(accordion.state.value.value).toEqual(['security'])

    expect(accordion.api.toggle('blocked', true)).toBe(false)
    expect(accordion.api.getItemAttrs('blocked', true)).toMatchObject({
      'data-disabled': 'true',
      'data-state': 'closed'
    })
  })

  it('keeps accordion trigger and content ids unique per root', () => {
    const first = useAccordionRoot()
    const second = useAccordionRoot()
    const firstTrigger = first.api.getTriggerAttrs('details')
    const firstContent = first.api.getContentAttrs('details')
    const secondTrigger = second.api.getTriggerAttrs('details')

    expect(firstTrigger.id).not.toBe(secondTrigger.id)
    expect(firstTrigger['aria-controls']).toBe(firstContent.id)
    expect(firstContent['aria-labelledby']).toBe(firstTrigger.id)
  })

  it('keeps accordion ids distinct for values with similar punctuation', () => {
    const accordion = useAccordionRoot({ id: 'settings' })

    expect(accordion.api.getTriggerAttrs('a b').id).not.toBe(
      accordion.api.getTriggerAttrs('a@b').id
    )
  })

  it('opens and closes popover through a stable root contract', () => {
    const popover = usePopoverRoot({ defaultOpen: false })

    expect(popover.attrs.trigger['aria-expanded']).toBe(false)
    expect(popover.events.open()).toBe(true)
    expect(popover.state.open.value).toBe(true)
    expect(popover.attrs.content['data-state']).toBe('open')
    expect(popover.events.onEscapeKeyDown()).toBe(true)
    expect(popover.state.open.value).toBe(false)

    const open = ref<boolean | undefined>(false)
    const onOpenChange = vi.fn()
    const controlled = usePopoverRoot({ open, onOpenChange })

    expect(controlled.events.toggle()).toBe(true)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(controlled.state.open.value).toBe(false)
  })
})
