import type {
  AgentThreadController,
  AgentThreadSnapshot,
  AgentThreadVersion,
} from './types'

const DESTROYED_ERROR = 'Agent thread controller is destroyed'

function assertVersionId(id: string) {
  if (id.length === 0) throw new Error('Agent thread version id must not be empty')
}

function freezeVersion(version: AgentThreadVersion): AgentThreadVersion {
  return Object.freeze({ ...version })
}

function freezeSnapshot(
  versions: readonly AgentThreadVersion[],
  activeVersionId?: string,
): AgentThreadSnapshot {
  if (activeVersionId === undefined) return Object.freeze({ versions })
  return Object.freeze({ activeVersionId, versions })
}

function validateSnapshot(initial?: AgentThreadSnapshot): AgentThreadSnapshot {
  const sourceVersions = initial?.versions ?? []
  const versionsById = new Map<string, AgentThreadVersion>()

  for (const version of sourceVersions) {
    assertVersionId(version.id)
    if (versionsById.has(version.id)) {
      throw new Error(`Agent thread version "${version.id}" is duplicated`)
    }
    versionsById.set(version.id, version)
  }

  for (const version of sourceVersions) {
    if (version.parentId !== undefined && !versionsById.has(version.parentId)) {
      throw new Error(`Agent thread parent version "${version.parentId}" does not exist`)
    }
  }

  const resolvedIds = new Set<string>()
  for (const version of sourceVersions) {
    if (resolvedIds.has(version.id)) continue

    const path: string[] = []
    const pathIds = new Set<string>()
    let current: AgentThreadVersion | undefined = version
    while (current !== undefined && !resolvedIds.has(current.id)) {
      if (pathIds.has(current.id)) {
        throw new Error(`Agent thread version "${current.id}" has a cyclic parent chain`)
      }
      path.push(current.id)
      pathIds.add(current.id)
      current = current.parentId === undefined
        ? undefined
        : versionsById.get(current.parentId)
    }
    path.forEach(id => resolvedIds.add(id))
  }

  const activeVersionId = initial?.activeVersionId
  if (activeVersionId !== undefined && !versionsById.has(activeVersionId)) {
    throw new Error(`Agent thread active version "${activeVersionId}" does not exist`)
  }

  return freezeSnapshot(Object.freeze(sourceVersions.map(freezeVersion)), activeVersionId)
}

export function createAgentThreadController(
  initial?: AgentThreadSnapshot,
): AgentThreadController {
  const listeners = new Set<() => void>()
  let snapshot = validateSnapshot(initial)
  let destroyed = false

  function assertActive() {
    if (destroyed) throw new Error(DESTROYED_ERROR)
  }

  function findVersion(id: string) {
    return snapshot.versions.find(version => version.id === id)
  }

  function replace(nextSnapshot: AgentThreadSnapshot) {
    snapshot = nextSnapshot
    listeners.forEach(listener => listener())
  }

  function append(version: AgentThreadVersion) {
    assertActive()
    assertVersionId(version.id)
    if (findVersion(version.id)) {
      throw new Error(`Agent thread version "${version.id}" already exists`)
    }
    if (version.parentId !== undefined && !findVersion(version.parentId)) {
      throw new Error(`Agent thread parent version "${version.parentId}" does not exist`)
    }

    const versions = Object.freeze([...snapshot.versions, freezeVersion(version)])
    replace(freezeSnapshot(versions, version.id))
  }

  function fork(
    parentId: string,
    version: Omit<AgentThreadVersion, 'parentId'>,
  ) {
    assertActive()
    assertVersionId(version.id)
    if (findVersion(version.id)) {
      throw new Error(`Agent thread version "${version.id}" already exists`)
    }
    if (!findVersion(parentId)) {
      throw new Error(`Agent thread parent version "${parentId}" does not exist`)
    }

    const forkedVersion = freezeVersion({ ...version, parentId })
    const versions = Object.freeze([...snapshot.versions, forkedVersion])
    replace(freezeSnapshot(versions, forkedVersion.id))
  }

  function select(id: string) {
    assertActive()
    if (!findVersion(id)) {
      throw new Error(`Agent thread version "${id}" does not exist`)
    }
    replace(freezeSnapshot(snapshot.versions, id))
  }

  function reset(nextInitial?: AgentThreadSnapshot) {
    assertActive()
    const nextSnapshot = validateSnapshot(nextInitial)
    replace(nextSnapshot)
  }

  function subscribe(listener: () => void) {
    assertActive()
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  return {
    append,
    destroy() {
      if (destroyed) return
      destroyed = true
      listeners.clear()
    },
    fork,
    getSnapshot() {
      return snapshot
    },
    reset,
    select,
    subscribe,
  }
}
