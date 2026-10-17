// @vitest-environment jsdom

import type { DataGridProps, GridColumn } from './components/blocks/data-grid-actions'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { gridIntentAllowed } from './components/blocks/data-grid-actions'
import DataGrid from './components/blocks/data-grid.vue'

function gridProps(): DataGridProps {
  return {
    records: [{ id: 'alpha', primary: 'Alpha', cells: { title: 'Alpha', hours: '3', owner: 'Avery' }, detail: '', canEdit: true }],
    columns: [{ id: 'title', label: 'Title', editable: true }, { id: 'hours', label: 'Hours', editable: true }, { id: 'owner', label: 'Owner' }],
    columnIds: ['title', 'hours', 'owner'],
    expandedIds: [],
    query: '',
    grouped: false,
    page: 1,
    total: 1,
    draft: { rowId: 'alpha', values: { title: 'Alpha revised', hours: '4', owner: 'Avery' } },
  }
}

const revocations: Array<[string, (columns: GridColumn[]) => GridColumn[]]> = [
  ['disabled', columns => columns.map(column => column.id === 'hours' ? { ...column, disabled: true } : column)],
  ['readonly', columns => columns.map(column => column.id === 'hours' ? { ...column, editable: false } : column)],
  ['removed', columns => columns.filter(column => column.id !== 'hours')],
]

describe('data grid save permissions', () => {
  it.each(revocations)('retains the draft but rejects a save after a dirty column becomes %s', async (_name, revoke) => {
    const props = gridProps()
    const wrapper = mount(DataGrid, { props })
    try {
      expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
      const columns = revoke(props.columns)
      await wrapper.setProps({ columns, columnIds: columns.map(column => column.id) })
      expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
      expect(wrapper.get<HTMLInputElement>('input[placeholder="Edit Title"]').element.value).toBe('Alpha revised')
      await wrapper.get('form').trigger('submit')
      expect(wrapper.emitted('intent')).toBeUndefined()
      await wrapper.findAll('button').find(button => button.text() === 'Cancel edit')!.trigger('click')
      expect(wrapper.emitted('intent')).toEqual([[{ action: 'cancel', id: 'alpha' }]])

      await wrapper.setProps({ columns: props.columns, columnIds: props.columnIds })
      expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
      await wrapper.get('form').trigger('submit')
      expect(wrapper.emitted('intent')?.[1]).toEqual([{ action: 'save', id: 'alpha', values: props.draft!.values }])
    }
    finally { wrapper.unmount() }
  })

  it('checks the actual proposal and allows unchanged readonly values', () => {
    const props = gridProps()
    props.columns = props.columns.map(column => column.id === 'hours' ? { ...column, disabled: true } : column)
    const allowed = { title: 'Alpha revised', hours: '3', owner: 'Avery' }
    props.draft = { rowId: 'alpha', values: allowed }
    expect(gridIntentAllowed(props, { action: 'save', id: 'alpha', values: { ...allowed, hours: '4' } })).toBe(false)
    expect(gridIntentAllowed(props, { action: 'save', id: 'alpha', values: { ...allowed, owner: 'Bo' } })).toBe(false)
    expect(gridIntentAllowed(props, { action: 'save', id: 'alpha', values: allowed })).toBe(true)
    expect(gridIntentAllowed(props, { action: 'save', id: 'alpha', values: props.records[0].cells })).toBe(false)
  })
})
