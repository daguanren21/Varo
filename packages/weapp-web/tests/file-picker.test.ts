// @vitest-environment jsdom

import type { PreviewFilePicker } from '../src/runtime/file-picker.ts'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPreviewFilePicker } from '../src/runtime/file-picker.ts'

const selector = 'input[type="file"][data-weapp-web-file-picker]'
const createObjectURL = vi.fn<(file: Blob) => string>()
const revokeObjectURL = vi.fn<(url: string) => void>()
let picker: PreviewFilePicker

function pendingInput() {
  const input = document.querySelector<HTMLInputElement>(selector)
  if (!input) { throw new Error('Expected a pending file input') }
  return input
}

function selectFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { configurable: true, value: files })
  input.dispatchEvent(new Event('change'))
}

beforeEach(() => {
  let nextUrl = 0
  createObjectURL.mockReset().mockImplementation(() => `blob:preview-${nextUrl++}`)
  revokeObjectURL.mockReset()
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = createObjectURL
    static revokeObjectURL = revokeObjectURL
  })
  picker = createPreviewFilePicker()
})

afterEach(() => {
  picker.dispose()
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('preview message file picker', () => {
  it('clicks a real input synchronously and returns selected File metadata exactly once', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click')
    const calls: string[] = []
    const success = vi.fn((_result: unknown) => calls.push('success'))
    const complete = vi.fn((_result: unknown) => calls.push('complete'))
    const fail = vi.fn()
    const files = [
      new File(['document'], 'notes.pdf', { type: 'application/pdf', lastModified: 1720000000123 }),
      new File(['image'], 'photo.png', { type: 'image/png', lastModified: 1720000001456 }),
      new File(['video'], 'clip.mp4', { type: 'video/mp4', lastModified: 1720000002789 }),
    ]

    picker.chooseMessageFile({ success, complete, fail })
    const input = pendingInput()
    expect(click).toHaveBeenCalledOnce()
    expect(input.multiple).toBe(true)
    expect(input.accept).toBe('')
    selectFiles(input, files)
    input.dispatchEvent(new Event('cancel'))
    input.dispatchEvent(new Event('change'))
    expect(document.querySelector(selector)).toBeNull()
    expect(success).not.toHaveBeenCalled()
    await Promise.resolve()

    expect(calls).toEqual(['success', 'complete'])
    expect(success).toHaveBeenCalledExactlyOnceWith({
      errMsg: 'chooseMessageFile:ok',
      tempFiles: [
        { path: 'blob:preview-0', name: 'notes.pdf', size: 8, type: 'file', time: 1720000000 },
        { path: 'blob:preview-1', name: 'photo.png', size: 5, type: 'image', time: 1720000001 },
        { path: 'blob:preview-2', name: 'clip.mp4', size: 5, type: 'video', time: 1720000002 },
      ],
    })
    expect(complete.mock.calls[0]?.[0]).toBe(success.mock.calls[0]?.[0])
    expect(fail).not.toHaveBeenCalled()
    files.forEach((file, index) => expect(createObjectURL).toHaveBeenNthCalledWith(index + 1, file))
    expect(revokeObjectURL).not.toHaveBeenCalled()
    picker.dispose()
    expect(revokeObjectURL.mock.calls).toEqual([['blob:preview-0'], ['blob:preview-1'], ['blob:preview-2']])
  })

  it.each(['cancel', 'change'])('routes an empty %s event through fail and complete without replacing existing files', async (event) => {
    const selected = vi.fn()
    picker.chooseMessageFile({ success: selected })
    selectFiles(pendingInput(), [new File(['previous'], 'previous.txt')])
    await Promise.resolve()
    const success = vi.fn()
    const fail = vi.fn()
    const complete = vi.fn()
    picker.chooseMessageFile({ success, fail, complete })
    const input = pendingInput()
    input.dispatchEvent(new Event(event))
    input.dispatchEvent(new Event(event))
    await Promise.resolve()

    expect(success).not.toHaveBeenCalled()
    expect(fail).toHaveBeenCalledExactlyOnceWith({ errMsg: 'chooseMessageFile:fail cancel' })
    expect(complete).toHaveBeenCalledExactlyOnceWith(fail.mock.calls[0]?.[0])
    expect(document.querySelector(selector)).toBeNull()
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(revokeObjectURL).not.toHaveBeenCalled()
  })

  it.each([
    { type: 'all', accept: '' },
    { type: 'file', accept: '' },
    { type: 'image', accept: 'image/*' },
    { type: 'video', accept: 'video/*' },
  ])('sets the $type browser filter and single selection limit', ({ type, accept }) => {
    picker.chooseMessageFile({ count: 1, type })
    const input = pendingInput()
    expect(input.multiple).toBe(false)
    expect(input.accept).toBe(accept)
  })

  it('honors extensions and rolls back new object URLs when a selected file violates the filter', async () => {
    const success = vi.fn()
    const fail = vi.fn()
    picker.chooseMessageFile({ type: 'file', extension: ['pdf', '.TXT'], success, fail })
    const input = pendingInput()
    expect(input.accept).toBe('.pdf,.txt')
    selectFiles(input, [new File(['yes'], 'report.PDF'), new File(['no'], 'photo.png')])
    await Promise.resolve()

    expect(success).not.toHaveBeenCalled()
    expect(fail).toHaveBeenCalledExactlyOnceWith({ errMsg: 'chooseMessageFile:fail selected file does not match extension' })
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:preview-0')
    picker.dispose()
    expect(revokeObjectURL).toHaveBeenCalledOnce()
  })

  it('rejects selections beyond the native default of 100 files', async () => {
    const success = vi.fn()
    const fail = vi.fn()
    picker.chooseMessageFile({ success, fail })
    selectFiles(pendingInput(), Array.from({ length: 101 }, (_, index) => new File([], `${index}.txt`)))
    await Promise.resolve()

    expect(success).not.toHaveBeenCalled()
    expect(fail).toHaveBeenCalledExactlyOnceWith({ errMsg: 'chooseMessageFile:fail maximum file count is 100' })
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('routes opening errors through fail and complete and removes the input', async () => {
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => { throw new Error('picker blocked') })
    const success = vi.fn()
    const fail = vi.fn()
    const complete = vi.fn()
    picker.chooseMessageFile({ success, fail, complete })
    await Promise.resolve()

    expect(success).not.toHaveBeenCalled()
    expect(fail).toHaveBeenCalledExactlyOnceWith({ errMsg: 'chooseMessageFile:fail picker blocked' })
    expect(complete).toHaveBeenCalledExactlyOnceWith(fail.mock.calls[0]?.[0])
    expect(document.querySelector(selector)).toBeNull()
  })

  it('disposes pending inputs and object URLs without invoking queued or late callbacks', async () => {
    const success = vi.fn()
    const fail = vi.fn()
    const complete = vi.fn()
    picker.chooseMessageFile({ success, fail, complete })
    selectFiles(pendingInput(), [new File(['selected'], 'selected.txt')])
    picker.chooseMessageFile({ success, fail, complete })
    const pending = pendingInput()
    picker.dispose()
    selectFiles(pending, [new File(['late'], 'late.txt')])
    pending.dispatchEvent(new Event('cancel'))
    picker.chooseMessageFile({ success, fail, complete })
    await Promise.resolve()

    expect(document.querySelector(selector)).toBeNull()
    expect(success).not.toHaveBeenCalled()
    expect(fail).not.toHaveBeenCalled()
    expect(complete).not.toHaveBeenCalled()
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:preview-0')
    picker.dispose()
    expect(revokeObjectURL).toHaveBeenCalledOnce()
  })

  it('does not call complete after a success callback disposes the runtime', async () => {
    const complete = vi.fn()
    const success = vi.fn(() => picker.dispose())
    picker.chooseMessageFile({ success, complete })
    selectFiles(pendingInput(), [new File(['selected'], 'selected.txt')])
    await Promise.resolve()

    expect(success).toHaveBeenCalledOnce()
    expect(complete).not.toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:preview-0')
  })
})
