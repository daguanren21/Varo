import type { AttachmentMetadata, AttachmentProgress, AttachmentTransferError } from '../../lib/attachment-transfer/attachment-transfer'

export type AttachmentStatus = 'ready' | 'uploading' | 'uploaded' | 'failed' | 'cancelled'
export type AttachmentAction = 'upload' | 'retry' | 'cancel' | 'remove'
export interface AttachmentItem<R = unknown> {
  file: AttachmentMetadata
  status: AttachmentStatus
  progress?: AttachmentProgress
  failure?: AttachmentTransferError
  receipt?: R
  grants: Partial<Record<AttachmentAction, boolean>>
}
export interface AttachmentActionIntent { id: string, action: AttachmentAction }
export interface AttachmentSubmitIntent {
  prompt: string
  attachments: { file: AttachmentMetadata, receipt: unknown }[]
}

export function attachmentCanSubmit(items: readonly AttachmentItem[]): boolean {
  return items.every(item => item.status === 'uploaded' && item.receipt != null)
}
export function attachmentActionAllowed(item: AttachmentItem, action: AttachmentAction, disabled: boolean): boolean {
  if (!item.grants[action]) { return false }
  if (action === 'cancel') { return item.status === 'uploading' }
  if (disabled) { return false }
  if (action === 'upload') { return item.status === 'ready' }
  if (action === 'retry') { return item.status === 'failed' || item.status === 'cancelled' }
  return item.status !== 'uploading'
}
export function attachmentPresentation(item: AttachmentItem, disabled: boolean) {
  const statuses: Record<AttachmentStatus, string> = {
    ready: '已选择，尚未上传',
    uploading: '上传中，等待服务确认',
    uploaded: '服务已确认',
    failed: '上传失败',
    cancelled: '已取消',
  }
  const labels: Record<AttachmentAction, string> = { upload: '上传', retry: '重试', cancel: '取消上传', remove: '移除' }
  const actions: AttachmentAction[] = ['upload', 'retry', 'cancel', 'remove']
  return {
    ...item,
    statusLabel: item.status === 'uploaded' && item.receipt == null ? '缺少服务确认，不能发送' : statuses[item.status],
    progressLabel: item.progress
      ? `实际已发送 ${item.progress.sentBytes} 字节${item.progress.totalBytes == null ? '（总量未知）' : ` / ${item.progress.totalBytes} 字节（含传输封装）`}`
      : '尚无传输进度',
    actions: actions.filter(action => item.grants[action]).map(action => ({ action, label: `${labels[action]} ${item.file.name}`, disabled: !attachmentActionAllowed(item, action, disabled) })),
    failureLabel: item.failure ? `${item.failure.code}: ${item.failure.message}` : '',
  }
}
