export type AgentDiffIndicators = 'bars' | 'classic' | 'none'
export type AgentDiffView = 'split' | 'unified'

export interface AgentDiffLine {
  collapsedLines?: number
  content: string
  id?: number | string
  newNumber?: number
  oldNumber?: number
  type: 'add' | 'context' | 'hunk' | 'remove'
}

export interface AgentDiffSelection {
  index: number
  line: AgentDiffLine
  side: 'new' | 'old' | 'unified'
}

export interface AgentFileDiffLabels {
  accept: string
  additions: string
  changed: string
  collapse: string
  deletions: string
  display: string
  empty: string
  expand: string
  line: string
  lineNumbers: string
  new: string
  old: string
  reject: string
  split: string
  unchanged: string
  unified: string
  wrap: string
}

export interface IndexedAgentDiffLine {
  index: number
  line: AgentDiffLine
}

export interface AgentDiffSplitRow {
  addition?: IndexedAgentDiffLine
  deletion?: IndexedAgentDiffLine
  hunk?: IndexedAgentDiffLine
}

export const defaultAgentFileDiffLabels: Readonly<AgentFileDiffLabels> = {
  accept: 'Accept',
  additions: 'additions',
  changed: 'changed lines',
  collapse: 'Collapse file',
  deletions: 'deletions',
  display: 'Diff display',
  empty: 'No changes',
  expand: 'Expand unchanged lines',
  line: 'line',
  lineNumbers: 'Lines',
  new: 'New',
  old: 'Old',
  reject: 'Reject',
  split: 'Split',
  unchanged: 'unchanged lines',
  unified: 'Unified',
  wrap: 'Wrap'
}

export function createAgentDiffSplitRows(lines: AgentDiffLine[]) {
  const rows: AgentDiffSplitRow[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (line.type === 'hunk') {
      rows.push({ hunk: { index, line } })
      index += 1
      continue
    }
    if (line.type === 'context') {
      const entry = { index, line }
      rows.push({ addition: entry, deletion: entry })
      index += 1
      continue
    }

    const additions: IndexedAgentDiffLine[] = []
    const deletions: IndexedAgentDiffLine[] = []
    while (index < lines.length && lines[index].type !== 'context' && lines[index].type !== 'hunk') {
      const entry = { index, line: lines[index] }
      if (entry.line.type === 'add') additions.push(entry)
      else deletions.push(entry)
      index += 1
    }

    const rowCount = Math.max(additions.length, deletions.length)
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      rows.push({
        addition: additions[rowIndex],
        deletion: deletions[rowIndex]
      })
    }
  }

  return rows
}

export function createAgentDiffInlinePairs(rows: AgentDiffSplitRow[]) {
  const pairs = new Map<number, string>()
  for (const row of rows) {
    if (row.addition?.line.type !== 'add' || row.deletion?.line.type !== 'remove') continue
    pairs.set(row.addition.index, row.deletion.line.content)
    pairs.set(row.deletion.index, row.addition.line.content)
  }
  return pairs
}

export function splitAgentDiffContent(content: string, comparison: string) {
  let start = 0
  const sharedLength = Math.min(content.length, comparison.length)
  while (start < sharedLength && content.charCodeAt(start) === comparison.charCodeAt(start)) start += 1

  let contentEnd = content.length
  let comparisonEnd = comparison.length
  while (
    contentEnd > start &&
    comparisonEnd > start &&
    content.charCodeAt(contentEnd - 1) === comparison.charCodeAt(comparisonEnd - 1)
  ) {
    contentEnd -= 1
    comparisonEnd -= 1
  }

  return [content.slice(0, start), content.slice(start, contentEnd), content.slice(contentEnd)] as const
}

export function agentDiffMarker(type: AgentDiffLine['type']) {
  if (type === 'add') return '+'
  if (type === 'remove') return '−'
  return ' '
}
