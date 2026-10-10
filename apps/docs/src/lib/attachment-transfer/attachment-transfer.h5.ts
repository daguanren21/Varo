import type { AttachmentMetadata, AttachmentPolicy, AttachmentTask, AttachmentTransfer, AttachmentUploadOptions } from './attachment-transfer'
import { attachmentFailure, attachmentPolicy, AttachmentTransferError, validateAttachments } from './attachment-transfer'

/** One owner per application. Call select directly from a user gesture. */
export function createAttachmentTransfer<R>(inputPolicy: AttachmentPolicy): AttachmentTransfer<R> {
  const policy = attachmentPolicy(inputPolicy)
  const sources = new Map<string, { file: File, metadata: AttachmentMetadata }>()
  const active = new Map<AttachmentTask<unknown>, string | undefined>()
  let disposed = false
  let sequence = 0
  const owner = Math.random().toString(36).slice(2)

  function task<T>(id: string | undefined, start: (resolve: (value: T) => void, reject: (error: unknown) => void, live: () => boolean) => (() => void)): AttachmentTask<T> {
    let settled = false
    let cleanup: (() => void) | undefined
    let rejectPromise: (error: unknown) => void = () => {}
    let resolvePromise: (value: T) => void = () => {}
    const promise = new Promise<T>((resolve, reject) => { resolvePromise = resolve; rejectPromise = reject })
    const finish = (error: unknown, value?: T) => {
      if (settled) { return }
      settled = true
      active.delete(result)
      try { cleanup?.() }
      catch (cleanupError) {
        const original = error ? attachmentFailure(error) : undefined
        rejectPromise(new AttachmentTransferError(original?.code ?? 'transport', `${original?.message ?? 'Transfer cleanup failed.'} Cleanup: ${attachmentFailure(cleanupError).message}`, original?.status))
        return
      }
      if (error) { rejectPromise(attachmentFailure(error)) }
      else { resolvePromise(value as T) }
    }
    const result: AttachmentTask<T> = { promise, cancel: () => finish(new AttachmentTransferError('cancelled', 'Transfer cancelled; remote rollback is not guaranteed.')) }
    active.set(result, id)
    if (disposed) { finish(new AttachmentTransferError('disposed', 'Attachment adapter is disposed.')) }
    else {
      try {
        cleanup = start(value => finish(undefined, value), error => finish(error), () => !settled)
        if (settled) { cleanup() }
      }
      catch (error) { finish(error) }
    }
    return result
  }

  return {
    select() {
      return task<readonly AttachmentMetadata[]>(undefined, (resolve, reject, live) => {
        if (typeof document === 'undefined') { throw new AttachmentTransferError('unavailable', 'A browser file chooser is required.') }
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = policy.maxCount > 1
        input.accept = policy.extensions.join(',')
        input.dataset.varoAttachmentInput = 'true'
        input.setAttribute('aria-label', '选择附件文件')
        input.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0'
        const change = () => {
          if (!live()) { return }
          try {
            const files = Array.from(input.files ?? [])
            validateAttachments(files, sources.size, policy)
            const metadata = files.map(file => ({ id: `${owner}-${++sequence}`, name: file.name, size: file.size, ...(file.type ? { mime: file.type } : {}) }))
            files.forEach((file, index) => sources.set(metadata[index]!.id, { file, metadata: metadata[index]! }))
            resolve(metadata)
          }
          catch (error) { reject(error) }
        }
        const cancel = () => reject(new AttachmentTransferError('cancelled', 'File chooser cancelled.'))
        input.addEventListener('change', change)
        input.addEventListener('cancel', cancel)
        document.body.append(input)
        const cleanup = () => {
          input.removeEventListener('change', change)
          input.removeEventListener('cancel', cancel)
          input.remove()
        }
        try { input.click() }
        catch (error) { cleanup(); throw new AttachmentTransferError('permission', error instanceof Error ? error.message : 'File chooser could not open.') }
        return cleanup
      })
    },
    upload(id: string, options: AttachmentUploadOptions<R>) {
      return task<R>(id, (resolve, reject, live) => {
        const source = sources.get(id)
        if (!source) { throw new AttachmentTransferError('missing', 'The selected source has been released.') }
        const xhr = new XMLHttpRequest()
        const cleanup = () => {
          xhr.onload = xhr.onerror = xhr.onabort = null
          xhr.upload.onprogress = null
          if (xhr.readyState !== XMLHttpRequest.DONE) { xhr.abort() }
        }
        try {
          xhr.open('POST', options.url)
          xhr.withCredentials = options.withCredentials ?? false
          for (const [name, value] of Object.entries(options.headers ?? {})) { xhr.setRequestHeader(name, value) }
          xhr.upload.onprogress = (event) => {
            if (live()) { options.onProgress?.({ sentBytes: event.loaded, ...(event.lengthComputable ? { totalBytes: event.total } : {}) }) }
          }
          xhr.onerror = () => reject(new AttachmentTransferError('transport', 'Upload transport failed.'))
          xhr.onabort = () => reject(new AttachmentTransferError('cancelled', 'Upload aborted.'))
          xhr.onload = () => {
            if (!live()) { return }
            if (xhr.status < 200 || xhr.status >= 300) {
              reject(new AttachmentTransferError('http', `Upload rejected: HTTP ${xhr.status}.`, xhr.status))
              return
            }
            try {
              const receipt = options.parseReceipt(xhr.responseText, source.metadata)
              if (receipt == null) { throw new Error('Missing acknowledgement.') }
              resolve(receipt)
            }
            catch (error) { reject(new AttachmentTransferError('receipt', error instanceof Error ? error.message : 'Invalid service receipt.')) }
          }
          const body = new FormData()
          body.append(options.fieldName ?? 'file', source.file, source.file.name)
          xhr.send(body)
        }
        catch (error) { cleanup(); throw error }
        return cleanup
      })
    },
    release(id) {
      for (const [pending, sourceId] of active) { if (sourceId === id) { pending.cancel() } }
      sources.delete(id)
    },
    dispose() {
      disposed = true
      for (const pending of active.keys()) { pending.cancel() }
      sources.clear()
    },
  }
}
