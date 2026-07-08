import { describe, expect, it } from 'vitest'
import {
  clearSelectValue,
  createSelectDisplay,
  filterSelectOptions,
  normalizeSelectArray,
  toggleSelectValue,
  type VSelectOption
} from '../src'

const options: VSelectOption[] = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Hangzhou', value: 'hangzhou' },
  { label: 'Suzhou', value: 'suzhou', disabled: true }
]

describe('select helpers', () => {
  it('normalizes single and multiple model values', () => {
    expect(normalizeSelectArray(undefined)).toEqual([])
    expect(normalizeSelectArray('shanghai')).toEqual(['shanghai'])
    expect(normalizeSelectArray(['shanghai', 'hangzhou'])).toEqual(['shanghai', 'hangzhou'])
  })

  it('toggles multiple values and blocks disabled options', () => {
    expect(toggleSelectValue(['shanghai'], options[1], { multiple: true })).toEqual({
      changed: true,
      limited: false,
      value: ['shanghai', 'hangzhou']
    })
    expect(toggleSelectValue(['shanghai'], options[0], { multiple: true })).toEqual({
      changed: true,
      limited: false,
      value: []
    })
    expect(toggleSelectValue(['shanghai'], options[2], { multiple: true })).toEqual({
      changed: false,
      limited: false,
      value: ['shanghai']
    })
  })

  it('limits multiple selections by max', () => {
    expect(toggleSelectValue(['shanghai'], options[1], { max: 1, multiple: true })).toEqual({
      changed: false,
      limited: true,
      value: ['shanghai']
    })
  })

  it('commits single values immediately', () => {
    expect(toggleSelectValue(undefined, options[1], { multiple: false })).toEqual({
      changed: true,
      limited: false,
      value: 'hangzhou'
    })
  })

  it('filters locally by label and supports a custom filter', () => {
    expect(filterSelectOptions(options, 'zhou').map((item) => item.value)).toEqual(['hangzhou', 'suzhou'])
    expect(filterSelectOptions(options, 'disabled', (_query, option) => Boolean(option.disabled))).toEqual([options[2]])
  })

  it('creates layout-safe selected text', () => {
    expect(createSelectDisplay(options, undefined, 'Select city')).toBe('Select city')
    expect(createSelectDisplay(options, 'shanghai', 'Select city')).toBe('Shanghai')
    expect(createSelectDisplay(options, ['shanghai', 'hangzhou'], 'Select city')).toBe('Shanghai, Hangzhou')
    expect(createSelectDisplay(options, ['shanghai', 'hangzhou', 'suzhou'], 'Select city')).toBe('已选 3 项')
  })

  it('clears single and multiple values', () => {
    expect(clearSelectValue(false)).toBeUndefined()
    expect(clearSelectValue(true)).toEqual([])
  })
})
