export interface AttachmentMetadata {
  readonly id: string
  readonly name: string
  readonly size: number
  readonly mime?: string
}

export interface AttachmentPolicy {
  /** Maximum retained selection count, not a truncation hint. */
  maxCount: number
  /** Maximum bytes per file. */
  maxBytes: number
  /** Explicit suffixes including the dot, e.g. ['.txt', '.md']. */
  extensions: readonly string[]
}

export type AttachmentFailureCode = 'validation' | 'unavailable' | 'permission' | 'transport' | 'http' | 'receipt' | 'cancelled' | 'disposed' | 'missing'
export class AttachmentTransferError extends Error {
  constructor(public readonly code: AttachmentFailureCode, message: string, public readonly status?: number) {
    super(message)
    this.name = 'AttachmentTransferError'
  }
}
export interface AttachmentTask<T> {
  promise: Promise<T>
  cancel: () => void
}
export interface AttachmentProgress {
  sentBytes: number
  totalBytes?: number
}
export interface AttachmentUploadOptions<R> {
  url: string
  headers?: Readonly<Record<string, string>>
  /** Browser credentials only; native host cookies follow wx.uploadFile policy. */
  withCredentials?: boolean
  fieldName?: string
  parseReceipt: (body: string, file: AttachmentMetadata) => R
  onProgress?: (progress: AttachmentProgress) => void
}
export interface AttachmentTransfer<R> {
  select: () => AttachmentTask<readonly AttachmentMetadata[]>
  upload: (id: string, options: AttachmentUploadOptions<R>) => AttachmentTask<R>
  release: (id: string) => void
  dispose: () => void
}

export function attachmentPolicy(policy: AttachmentPolicy): AttachmentPolicy {
  if (!Number.isSafeInteger(policy.maxCount) || policy.maxCount <= 0
    || !Number.isSafeInteger(policy.maxBytes) || policy.maxBytes <= 0
    || !Array.isArray(policy.extensions) || !policy.extensions.length
    || policy.extensions.some(extension => !/^\.[a-z0-9]+$/i.test(extension))) {
    throw new AttachmentTransferError('validation', 'Supply positive finite count/byte limits and explicit extensions.')
  }
  return { maxCount: policy.maxCount, maxBytes: policy.maxBytes, extensions: policy.extensions.map(extension => extension.toLowerCase()) }
}

export function validateAttachments(files: readonly Pick<AttachmentMetadata, 'name' | 'size'>[], retainedCount: number, policy: AttachmentPolicy): void {
  if (!files.length) { throw new AttachmentTransferError('cancelled', 'No files selected.') }
  if (files.length + retainedCount > policy.maxCount) {
    throw new AttachmentTransferError('validation', `At most ${policy.maxCount} files may be retained; no files from this selection were added.`)
  }
  for (const file of files) {
    if (!Number.isSafeInteger(file.size) || file.size < 0 || file.size > policy.maxBytes) {
      throw new AttachmentTransferError('validation', `${file.name}: maximum ${policy.maxBytes} bytes per file; selection rejected.`)
    }
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!policy.extensions.includes(extension)) {
      throw new AttachmentTransferError('validation', `${file.name}: allowed extensions ${policy.extensions.join(', ')}; selection rejected.`)
    }
  }
}

export function attachmentFailure(error: unknown): AttachmentTransferError {
  return error instanceof AttachmentTransferError ? error : new AttachmentTransferError('transport', error instanceof Error ? error.message : String(error))
}
