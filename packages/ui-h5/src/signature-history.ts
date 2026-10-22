// Generated from registry/components/signature/signature-history.ts; edit the Registry source.
export interface SignaturePoint {
  x: number
  y: number
}

export interface SignatureStroke {
  points: SignaturePoint[]
}

export interface SignatureInstance {
  clear: () => void
  undo: () => void
  redo: () => void
  readonly canUndo: boolean
  readonly canRedo: boolean
}

export function cloneStrokes(strokes: SignatureStroke[]): SignatureStroke[] {
  return strokes.map(stroke => ({ points: stroke.points.map(point => ({ ...point })) }))
}

function equalStrokes(left: SignatureStroke[], right: SignatureStroke[]): boolean {
  return left.length === right.length && left.every((stroke, index) => {
    const other = right[index]
    return stroke.points.length === other.points.length && stroke.points.every((point, pointIndex) => {
      const otherPoint = other.points[pointIndex]
      return point.x === otherPoint.x && point.y === otherPoint.y
    })
  })
}

function checkedLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError('VSignature historyLimit must be a positive integer')
  }
  return limit
}

/** Pure accepted-state history. Proposals never move the cursor. */
export function createSignatureHistory(initial: SignatureStroke[], historyLimit = 100) {
  let limit = checkedLimit(historyLimit)
  let entries = [cloneStrokes(initial)]
  let cursor = 0
  let proposals: Array<{ value: SignatureStroke[], target?: SignatureStroke[] }> = []

  function trim() {
    const excess = entries.length - limit - 1
    if (excess > 0) {
      // Keep the current state and the closest undo/redo entries when the limit shrinks.
      const before = Math.min(cursor, excess)
      entries.splice(0, before)
      cursor -= before
      entries.splice(entries.length - (excess - before), excess - before)
    }
    if (proposals.length > limit) {
      proposals.splice(0, proposals.length - limit)
    }
  }

  function propose(value: SignatureStroke[], target?: SignatureStroke[]) {
    if (equalStrokes(value, entries[cursor])) {
      return undefined
    }
    const proposal = { value: cloneStrokes(value), target }
    proposals.push(proposal)
    trim()
    return proposal.value
  }

  return {
    get value() { return entries[cursor] },
    get canUndo() { return cursor > 0 },
    get canRedo() { return cursor < entries.length - 1 },
    propose(value: SignatureStroke[]) { return propose(value) },
    undo() { return cursor > 0 ? propose(entries[cursor - 1], entries[cursor - 1]) : undefined },
    redo() { return cursor < entries.length - 1 ? propose(entries[cursor + 1], entries[cursor + 1]) : undefined },
    accept(value: SignatureStroke[]): boolean {
      if (equalStrokes(value, entries[cursor])) {
        return false
      }
      let proposal: (typeof proposals)[number] | undefined
      for (let index = proposals.length - 1; index >= 0; index -= 1) {
        if (equalStrokes(value, proposals[index].value)) {
          proposal = proposals[index]
          break
        }
      }
      const targetIndex = proposal?.target ? entries.indexOf(proposal.target) : -1
      if (targetIndex >= 0) {
        cursor = targetIndex
      }
      else if (proposal && !proposal.target) {
        entries.splice(cursor + 1)
        entries.push(proposal.value)
        cursor += 1
      }
      else {
        entries = [cloneStrokes(value)]
        cursor = 0
      }
      proposals = []
      trim()
      return true
    },
    setLimit(value: number) {
      limit = checkedLimit(value)
      trim()
    },
  }
}
