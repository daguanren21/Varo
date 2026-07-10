import { computed, getCurrentInstance, type Ref } from 'vue'

const hasOwn = Object.prototype.hasOwnProperty

export function usePropPresence(name: string): Ref<boolean> {
  const instance = getCurrentInstance()

  return computed(() => {
    const props = instance?.vnode.props
    return props ? hasOwn.call(props, name) : false
  })
}

export function callHandler(handler: unknown, event: Event) {
  if (Array.isArray(handler)) {
    handler.forEach((item) => callHandler(item, event))
    return
  }

  if (typeof handler === 'function') {
    handler(event)
  }
}

export function runInteractiveClick(
  event: MouseEvent,
  options: {
    action: () => unknown
    handler: unknown
    interactive: boolean
  }
) {
  if (!options.interactive) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation?.()
    return false
  }

  callHandler(options.handler, event)

  if (event.defaultPrevented) {
    return false
  }

  options.action()
  return true
}
