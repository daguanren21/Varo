import type { AttachmentMetadata, AttachmentPolicy, AttachmentTask, AttachmentTransfer, AttachmentUploadOptions } from './attachment-transfer'
import { attachmentFailure, attachmentPolicy, AttachmentTransferError, validateAttachments } from './attachment-transfer'

interface HostFailure { errMsg?: string }
interface HostProgress { totalBytesSent: number, totalBytesExpectedToSend: number }
interface HostUploadTask {
  abort: () => void
  onProgressUpdate: (callback: (event: HostProgress) => void) => void
  offProgressUpdate?: (callback: (event: HostProgress) => void) => void
}
interface AttachmentHost {
  chooseMessageFile?: (options: {
    count: number
    type: 'file'
    extension: string[]
    success: (result: { tempFiles: { name: string, size: number, path: string }[] }) => void
    fail: (error: HostFailure) => void
  }) => void
  uploadFile?: (options: {
    url: string
    filePath: string
    name: string
    header?: Readonly<Record<string, string>>
    success: (result: { statusCode: number, data: string }) => void
    fail: (error: HostFailure) => void
  }) => HostUploadTask
}
// A target-local declaration, not an injected substitute for the actual host.
declare const wx: AttachmentHost | undefined

function hostFailure(error: HostFailure): AttachmentTransferError {
  const message = error.errMsg || 'Native attachment operation failed.'
  const code = /cancel/i.test(message) ? 'cancelled' : /auth|permission|denied|deny/i.test(message) ? 'permission' : 'transport'
  return new AttachmentTransferError(code, message)
}

/** Does not depend on DOM, AbortController, File, or browser lifecycle APIs. */
export function createAttachmentTransfer<R>(inputPolicy: AttachmentPolicy): AttachmentTransfer<R> {
  const policy = attachmentPolicy(inputPolicy)
  if (policy.maxCount > 100) { throw new AttachmentTransferError('validation', 'wx.chooseMessageFile supports at most 100 files; policy was not truncated.') }
  const sources = new Map<string, { path: string, metadata: AttachmentMetadata }>()
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
        if (typeof wx === 'undefined' || typeof wx.chooseMessageFile !== 'function') {
          throw new AttachmentTransferError('unavailable', 'wx.chooseMessageFile is unavailable on this host. A supported connected WeChat host and permission are required.')
        }
        if (sources.size >= policy.maxCount) { throw new AttachmentTransferError('validation', `At most ${policy.maxCount} files may be retained.`) }
        wx.chooseMessageFile({
          count: policy.maxCount,
          type: 'file',
          extension: policy.extensions.map(extension => extension.slice(1)),
          success(result) {
            if (!live()) { return }
            try {
              validateAttachments(result.tempFiles, sources.size, policy)
              if (result.tempFiles.some(file => !file.path)) { throw new AttachmentTransferError('transport', 'Native chooser returned no source path.') }
              const metadata = result.tempFiles.map(file => ({ id: `${owner}-${++sequence}`, name: file.name, size: file.size }))
              result.tempFiles.forEach((file, index) => sources.set(metadata[index]!.id, { path: file.path, metadata: metadata[index]! }))
              resolve(metadata)
            }
            catch (error) { reject(error) }
          },
          fail(error) { if (live()) { reject(hostFailure(error)) } },
        })
        // The OS chooser has no documented dismiss API. live() invalidates late results.
        return () => {}
      })
    },
    upload(id: string, options: AttachmentUploadOptions<R>) {
      return task<R>(id, (resolve, reject, live) => {
        const source = sources.get(id)
        if (!source) { throw new AttachmentTransferError('missing', 'The selected source has been released.') }
        if (typeof wx === 'undefined' || typeof wx.uploadFile !== 'function') {
          throw new AttachmentTransferError('unavailable', 'wx.uploadFile is unavailable on this host.')
        }
        const progress = (event: HostProgress) => {
          if (live()) { options.onProgress?.({ sentBytes: event.totalBytesSent, ...(event.totalBytesExpectedToSend > 0 ? { totalBytes: event.totalBytesExpectedToSend } : {}) }) }
        }
        let completed = false
        const upload = wx.uploadFile({
          url: options.url,
          filePath: source.path,
          name: options.fieldName ?? 'file',
          header: options.headers,
          success(result) {
            if (!live()) { return }
            completed = true
            if (result.statusCode < 200 || result.statusCode >= 300) {
              reject(new AttachmentTransferError('http', `Upload rejected: HTTP ${result.statusCode}.`, result.statusCode))
              return
            }
            try {
              const receipt = options.parseReceipt(result.data, source.metadata)
              if (receipt == null) { throw new Error('Missing acknowledgement.') }
              resolve(receipt)
            }
            catch (error) { reject(new AttachmentTransferError('receipt', error instanceof Error ? error.message : 'Invalid service receipt.')) }
          },
          fail(error) { if (live()) { completed = true; reject(hostFailure(error)) } },
        })
        if (!upload || typeof upload.abort !== 'function' || typeof upload.onProgressUpdate !== 'function') {
          upload?.abort?.()
          throw new AttachmentTransferError('unavailable', 'The host did not provide a cancellable progress-reporting UploadTask.')
        }
        try { upload.onProgressUpdate(progress) }
        catch (error) { upload.abort(); throw error }
        return () => {
          try { upload.offProgressUpdate?.(progress) }
          finally { if (!completed) { upload.abort() } }
        }
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
