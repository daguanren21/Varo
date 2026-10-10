export interface BoardColumn { id: string, label: string, disabled?: boolean }
export interface BoardCard {
  id: string
  title: string
  detail?: string
  columnId: string
  allowedDestinationIds: string[]
  canApprove?: boolean
  disabled?: boolean
  busy?: boolean
}
export interface TaskBoardProps {
  columns: BoardColumn[]
  cards: BoardCard[]
  selectedId?: string
  title?: string
  loading?: boolean
  busy?: boolean
  disabled?: boolean
  error?: string
}
export type BoardIntent
  = | { action: 'select', id: string }
    | { action: 'move', id: string, fromColumnId: string, toColumnId: string }
    | { action: 'approve', id: string, columnId: string }

export function boardConfigurationError(columns: BoardColumn[], cards: BoardCard[]): string {
  if (!columns.length || columns.length > 6 || cards.length > 50) { return 'Board configuration rejected: supply 1–6 columns and at most 50 cards.' }
  const columnIds = new Set(columns.map(column => column.id))
  if (columnIds.size !== columns.length || columns.some(column => !column.id || !column.label.trim())) { return 'Board configuration rejected: columns need unique IDs and labels.' }
  const cardIds = new Set<string>()
  for (const card of cards) {
    if (!card.id || cardIds.has(card.id) || !card.title.trim() || !columnIds.has(card.columnId)
      || card.allowedDestinationIds.some(id => !columnIds.has(id))) {
      return 'Board configuration rejected: cards need unique IDs, titles and known column grants.'
    }
    cardIds.add(card.id)
  }
  return ''
}
export function canActOnCard(props: TaskBoardProps, id: string): boolean {
  const card = props.cards.find(item => item.id === id)
  return !props.loading && !props.busy && !props.disabled && !!card && !card.disabled && !card.busy
    && props.columns.some(column => column.id === card.columnId && !column.disabled)
}
export function canMoveCard(props: TaskBoardProps, id: string, destination: string): boolean {
  const card = props.cards.find(item => item.id === id)
  return canActOnCard(props, id) && !!card && card.columnId !== destination
    && card.allowedDestinationIds.includes(destination)
    && props.columns.some(column => column.id === destination && !column.disabled)
}
