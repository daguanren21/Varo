import type { Ref } from './reactive'

let activeLocks = 0
let previousOverflow: string | undefined

function getBody() {
  return typeof document === 'undefined' ? undefined : document.body
}

function acquireLock() {
  const body = getBody()

  if (!body) {
    return
  }

  if (activeLocks === 0) {
    previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
  }

  activeLocks += 1
}

function releaseLock() {
  const body = getBody()

  if (!body || activeLocks === 0) {
    return
  }

  activeLocks -= 1

  if (activeLocks === 0) {
    body.style.overflow = previousOverflow ?? ''
    previousOverflow = undefined
  }
}

export interface BodyScrollLockControls {
  sync: () => void
  dispose: () => void
}

export function useBodyScrollLock(visible: Ref<boolean>, enabled: Ref<boolean>): BodyScrollLockControls {
  let locked = false

  function syncLock() {
    const shouldLock = visible.value && enabled.value

    if (shouldLock && !locked) {
      acquireLock()
      locked = true
      return
    }

    if (!shouldLock && locked) {
      releaseLock()
      locked = false
    }
  }

  function dispose() {
    if (locked) {
      releaseLock()
      locked = false
    }
  }

  syncLock()

  return {
    sync: syncLock,
    dispose
  }
}
