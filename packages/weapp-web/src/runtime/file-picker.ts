export interface PreviewFilePicker {
  chooseMessageFile: (options: unknown) => void
  dispose: () => void
}

interface PreviewFile {
  path: string
  name: string
  size: number
  type: 'file' | 'image' | 'video'
  time: number
}

function callback(options: Record<string, unknown> | undefined, name: string, value: unknown) {
  const handler = options?.[name]
  if (typeof handler === 'function') { Reflect.apply(handler, undefined, [value]) }
}

export function createPreviewFilePicker(): PreviewFilePicker {
  const objectUrls = new Set<string>()
  let pending: (() => void) | undefined
  let disposed = false

  const notify = (options: Record<string, unknown> | undefined, outcome: 'success' | 'fail', result: unknown) => {
    queueMicrotask(() => {
      if (disposed) { return }
      try {
        callback(options, outcome, result)
      }
      finally {
        if (!disposed) { callback(options, 'complete', result) }
      }
    })
  }

  return {
    chooseMessageFile(value) {
      if (disposed) { return }
      const options = value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : undefined
      const fail = (reason: string) => notify(options, 'fail', { errMsg: `chooseMessageFile:fail ${reason}` })
      const count = options?.count === undefined ? 100 : options.count
      const type = options?.type === undefined ? 'all' : options.type
      const extension = options?.extension

      if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > 100) {
        fail('count must be an integer between 1 and 100')
        return
      }
      if (type !== 'all' && type !== 'file' && type !== 'image' && type !== 'video') {
        fail('type must be all, file, image or video')
        return
      }
      if (extension !== undefined && (!Array.isArray(extension) || extension.some(item => typeof item !== 'string' || !/^\.?[^.,/\\\s]+$/.test(item)))) {
        fail('extension must be an array of file extensions')
        return
      }
      if (pending) {
        fail('file picker is already open')
        return
      }

      const extensions = (extension as string[] | undefined)?.map(item => `.${item.replace(/^\./, '').toLowerCase()}`) ?? []
      const input = document.createElement('input')
      input.type = 'file'
      input.hidden = true
      input.dataset.weappWebFilePicker = ''
      input.multiple = count > 1
      input.accept = extensions.length ? extensions.join(',') : type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : ''
      let settled = false

      const cleanup = () => {
        settled = true
        input.removeEventListener('change', onChange)
        input.removeEventListener('cancel', onCancel)
        input.remove()
        if (pending === cleanup) { pending = undefined }
      }
      const finish = (outcome: 'success' | 'fail', result: unknown) => {
        if (settled || disposed) { return }
        cleanup()
        notify(options, outcome, result)
      }
      const onCancel = () => finish('fail', { errMsg: 'chooseMessageFile:fail cancel' })
      const onChange = () => {
        if (settled || disposed) { return }
        const files = input.files
        if (!files?.length) {
          onCancel()
          return
        }
        if (files.length > count) {
          finish('fail', { errMsg: `chooseMessageFile:fail maximum file count is ${count}` })
          return
        }
        const tempFiles: PreviewFile[] = []
        try {
          for (const file of files) {
            const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file'
            if ((type === 'image' || type === 'video') && fileType !== type) {
              throw new Error(`selected file is not ${type}`)
            }
            if (extensions.length && !extensions.some(extension => file.name.toLowerCase().endsWith(extension))) {
              throw new Error('selected file does not match extension')
            }
            const path = URL.createObjectURL(file)
            objectUrls.add(path)
            tempFiles.push({
              path,
              name: file.name,
              size: file.size,
              type: fileType,
              time: Math.floor(file.lastModified / 1000),
            })
          }
        }
        catch (error) {
          for (const file of tempFiles) {
            URL.revokeObjectURL(file.path)
            objectUrls.delete(file.path)
          }
          finish('fail', { errMsg: `chooseMessageFile:fail ${error instanceof Error ? error.message : String(error)}` })
          return
        }
        finish('success', { errMsg: 'chooseMessageFile:ok', tempFiles })
      }

      input.addEventListener('change', onChange)
      input.addEventListener('cancel', onCancel)
      pending = cleanup
      try {
        document.body.append(input)
        input.click()
      }
      catch (error) {
        finish('fail', { errMsg: `chooseMessageFile:fail ${error instanceof Error ? error.message : String(error)}` })
      }
    },
    dispose() {
      if (disposed) { return }
      disposed = true
      pending?.()
      for (const url of objectUrls) { URL.revokeObjectURL(url) }
      objectUrls.clear()
    },
  }
}
