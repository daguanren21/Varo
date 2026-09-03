import type { AgentThreadSnapshot } from '../src'
import { describe, expect, it, vi } from 'vitest'
import { createAgentThreadController } from '../src'

describe('agent thread controller', () => {
  it('appends a root version and publishes an immutable replacement snapshot', () => {
    const controller = createAgentThreadController()
    const emptySnapshot = controller.getSnapshot()

    controller.append({ id: 'root', label: 'Original answer' })

    const snapshot = controller.getSnapshot()
    expect(snapshot).not.toBe(emptySnapshot)
    expect(snapshot).toEqual({
      activeVersionId: 'root',
      versions: [{ id: 'root', label: 'Original answer' }],
    })
    expect(emptySnapshot).toEqual({ versions: [] })
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.versions)).toBe(true)
    expect(Object.isFrozen(snapshot.versions[0])).toBe(true)
  })

  it('preserves existing branches and activates appended and forked versions', () => {
    const controller = createAgentThreadController()
    controller.append({ id: 'root' })
    controller.append({ id: 'continuation', parentId: 'root' })
    expect(controller.getSnapshot().activeVersionId).toBe('continuation')

    controller.fork('root', { id: 'alternative', summary: 'Try another approach' })

    expect(controller.getSnapshot()).toEqual({
      activeVersionId: 'alternative',
      versions: [
        { id: 'root' },
        { id: 'continuation', parentId: 'root' },
        { id: 'alternative', parentId: 'root', summary: 'Try another approach' },
      ],
    })
  })

  it('selects an existing version and rejects an unknown version', () => {
    const controller = createAgentThreadController({
      activeVersionId: 'child',
      versions: [{ id: 'root' }, { id: 'child', parentId: 'root' }],
    })

    controller.select('root')
    expect(controller.getSnapshot().activeVersionId).toBe('root')
    expect(() => controller.select('missing')).toThrowError(
      'Agent thread version "missing" does not exist',
    )
  })

  it('rejects invalid initial graphs with deterministic errors', () => {
    expect(() => createAgentThreadController({
      versions: [{ id: '' }],
    })).toThrowError('Agent thread version id must not be empty')

    expect(() => createAgentThreadController({
      versions: [{ id: 'duplicate' }, { id: 'duplicate' }],
    })).toThrowError('Agent thread version "duplicate" is duplicated')

    expect(() => createAgentThreadController({
      versions: [{ id: 'child', parentId: 'missing' }],
    })).toThrowError('Agent thread parent version "missing" does not exist')

    expect(() => createAgentThreadController({
      versions: [{ id: 'self', parentId: 'self' }],
    })).toThrowError('Agent thread version "self" has a cyclic parent chain')

    expect(() => createAgentThreadController({
      versions: [
        { id: 'a', parentId: 'b' },
        { id: 'b', parentId: 'a' },
      ],
    })).toThrowError('Agent thread version "a" has a cyclic parent chain')


    expect(() => createAgentThreadController({
      activeVersionId: 'missing',
      versions: [{ id: 'root' }],
    })).toThrowError('Agent thread active version "missing" does not exist')
  })

  it('rejects empty or duplicate append and fork ids and missing parents', () => {
    const controller = createAgentThreadController({ versions: [{ id: 'root' }] })

    expect(() => controller.append({ id: '' })).toThrowError(
      'Agent thread version id must not be empty',
    )
    expect(() => controller.fork('root', { id: '' })).toThrowError(
      'Agent thread version id must not be empty',
    )
    expect(() => controller.append({ id: 'root' })).toThrowError(
      'Agent thread version "root" already exists',
    )
    expect(() => controller.append({ id: 'child', parentId: 'missing' })).toThrowError(
      'Agent thread parent version "missing" does not exist',
    )
    expect(() => controller.fork('root', { id: 'root' })).toThrowError(
      'Agent thread version "root" already exists',
    )
    expect(() => controller.fork('missing', { id: 'branch' })).toThrowError(
      'Agent thread parent version "missing" does not exist',
    )
  })

  it('notifies subscribers with replacement snapshots until they unsubscribe', () => {
    const controller = createAgentThreadController()
    const snapshots: AgentThreadSnapshot[] = []
    const unsubscribe = controller.subscribe(() => snapshots.push(controller.getSnapshot()))

    controller.append({ id: 'root' })
    const firstSnapshot = snapshots[0]
    controller.append({ id: 'second-root' })

    expect(snapshots).toHaveLength(2)
    expect(snapshots[1]).not.toBe(firstSnapshot)
    unsubscribe()
    controller.select('root')
    expect(snapshots).toHaveLength(2)
  })

  it('atomically resets to a validated immutable snapshot', () => {
    const controller = createAgentThreadController({
      activeVersionId: 'root',
      versions: [{ id: 'root' }],
    })
    const listener = vi.fn()
    controller.subscribe(listener)
    const resetInput = {
      activeVersionId: 'replacement',
      versions: [{ id: 'replacement', pinned: true }],
    }

    controller.reset(resetInput)

    const resetSnapshot = controller.getSnapshot()
    expect(resetSnapshot).toEqual(resetInput)
    expect(resetSnapshot).not.toBe(resetInput)
    expect(resetSnapshot.versions).not.toBe(resetInput.versions)
    expect(listener).toHaveBeenCalledOnce()

    expect(() => controller.reset({
      activeVersionId: 'missing',
      versions: [{ id: 'still-valid' }],
    })).toThrowError('Agent thread active version "missing" does not exist')

    expect(() => controller.reset({
      versions: [{ id: 'self', parentId: 'self' }],
    })).toThrowError('Agent thread version "self" has a cyclic parent chain')

    expect(() => controller.reset({
      versions: [{ id: '' }],
    })).toThrowError('Agent thread version id must not be empty')

    expect(controller.getSnapshot()).toBe(resetSnapshot)
    expect(listener).toHaveBeenCalledOnce()

    controller.reset()
    expect(controller.getSnapshot()).toEqual({ versions: [] })
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('clears subscribers on destroy and rejects later operations without changing state', () => {
    const controller = createAgentThreadController({ versions: [{ id: 'root' }] })
    const listener = vi.fn()
    controller.subscribe(listener)
    const finalSnapshot = controller.getSnapshot()

    controller.destroy()

    expect(() => controller.append({ id: 'later' })).toThrowError(
      'Agent thread controller is destroyed',
    )
    expect(() => controller.fork('root', { id: 'branch' })).toThrowError(
      'Agent thread controller is destroyed',
    )
    expect(() => controller.select('root')).toThrowError(
      'Agent thread controller is destroyed',
    )
    expect(() => controller.reset()).toThrowError('Agent thread controller is destroyed')
    expect(() => controller.subscribe(listener)).toThrowError(
      'Agent thread controller is destroyed',
    )
    expect(controller.getSnapshot()).toBe(finalSnapshot)
    expect(listener).not.toHaveBeenCalled()
    expect(() => controller.destroy()).not.toThrow()
  })
})
