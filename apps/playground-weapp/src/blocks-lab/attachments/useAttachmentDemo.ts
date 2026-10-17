import type { AttachmentActionIntent, AttachmentItem, AttachmentSubmitIntent } from '../../components/agent-ui/agent-attachment-composer.types'
import type { AttachmentMetadata, AttachmentTask } from '../../lib/attachment-transfer/attachment-transfer'
import { computed, onBeforeUnmount, shallowRef } from 'wevu'
import { attachmentActionAllowed, attachmentCanSubmit } from '../../components/agent-ui/agent-attachment-composer.types'
import { attachmentFailure } from '../../lib/attachment-transfer/attachment-transfer'
import { createAttachmentTransfer } from '../../lib/attachment-transfer/attachment-transfer.weapp'

interface LocalReceipt { id: string, bytes: number, sha256: string }
function parseReceipt(body: string, file: AttachmentMetadata): LocalReceipt {
  const value: unknown = JSON.parse(body)
  if (!value || typeof value !== 'object' || !('id' in value) || typeof value.id !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value.id)
    || !('bytes' in value) || value.bytes !== file.size || !('sha256' in value) || typeof value.sha256 !== 'string' || !/^[\da-f]{64}$/i.test(value.sha256)) {
    throw new Error('The service did not acknowledge this file with an ID, exact byte count and SHA-256 digest.')
  }
  return { id: value.id, bytes: value.bytes, sha256: value.sha256 }
}

export function useAttachmentDemo() {
  const policy = { maxCount: 3, maxBytes: 8 * 1024 * 1024, extensions: ['.txt', '.md'] }
  const adapter = createAttachmentTransfer<LocalReceipt>(policy)
  const rawItems = shallowRef<Omit<AttachmentItem<LocalReceipt>, 'grants'>[]>([])
  const prompt = shallowRef('请查看这些附件')
  const uncontrolled = shallowRef(false)
  const rejectPrompt = shallowRef(false)
  const disabled = shallowRef(false)
  const grantsEnabled = shallowRef(true)
  const rejectService = shallowRef(false)
  const paced = shallowRef(true)
  const choosing = shallowRef(false)
  const visible = shallowRef(true)
  const serviceUrl = shallowRef('')
  const serviceConfigured = computed(() => /^https?:\/\/[^\s/?#]+\/__varo_attachment_demo\/upload$/.test(serviceUrl.value))
  const serviceNotice = computed(() => serviceConfigured.value ? '已配置应用服务地址；可达性、合法域名、TLS 与上传权限仍由实际宿主验证。' : '尚未配置可达服务 URL；上传不可用。请填写完整 /__varo_attachment_demo/upload 地址，不会假装 localhost 是设备后端。')
  const notice = shallowRef('需要真实 wx.chooseMessageFile / wx.uploadFile 与宿主权限；此页不会生成附件或上传成功数据。')
  const messages = shallowRef<{ id: number, prompt: string, receipts: LocalReceipt[] }[]>([])
  let disposed = false
  let selection: AttachmentTask<readonly AttachmentMetadata[]> | undefined
  const attempts = new Map<string, { task?: AttachmentTask<LocalReceipt> }>()
  const boundPrompt = computed(() => uncontrolled.value ? undefined : prompt.value)
  const items = computed<AttachmentItem<LocalReceipt>[]>(() => rawItems.value.map(item => ({
    ...item,
    grants: { upload: grantsEnabled.value && serviceConfigured.value, retry: grantsEnabled.value && serviceConfigured.value, cancel: true, remove: true },
  })))
  const running = computed(() => rawItems.value.some(item => item.status === 'uploading'))
  const lifecycle = computed(() => `retained=${rawItems.value.length};uploading=${rawItems.value.filter(item => item.status === 'uploading').length};choosing=${choosing.value};disposed=${!visible.value}`)
  const acknowledgements = computed(() => rawItems.value.flatMap(item => item.receipt ? [{ name: item.file.name, ...item.receipt }] : []))

  async function choose() {
    if (disposed || disabled.value || choosing.value || !grantsEnabled.value) { return }
    choosing.value = true
    const current = adapter.select()
    selection = current
    try {
      const files = await current.promise
      if (disposed || selection !== current) { files.forEach(file => adapter.release(file.id)); return }
      rawItems.value = [...rawItems.value, ...files.map(file => ({ file, status: 'ready' as const }))]
      notice.value = '已选择真实宿主文件；尚未发送任何文件字节。MIME 未提供时保持未知。'
    }
    catch (error) { if (!disposed && selection === current) { const failure = attachmentFailure(error); notice.value = `${failure.code}: ${failure.message}` } }
    finally { if (selection === current) { selection = undefined; choosing.value = false } }
  }
  function cancelSelection() {
    const current = selection
    selection = undefined
    choosing.value = false
    current?.cancel()
    notice.value = '已作废选择结果；原生系统选择器没有承诺可用的关闭 API，请自行关闭。'
  }
  function updatePrompt(value: string) {
    if (!disabled.value && !rejectPrompt.value) { prompt.value = value }
  }
  function updateService(value: unknown) {
    if (!disposed && !running.value && typeof value === 'string') { serviceUrl.value = value.trim() }
  }
  function patch(id: string, change: Partial<Omit<AttachmentItem<LocalReceipt>, 'grants'>>) {
    rawItems.value = rawItems.value.map(item => item.file.id === id ? { ...item, ...change } : item)
  }
  async function upload(id: string) {
    const attempt: { task?: AttachmentTask<LocalReceipt> } = {}
    attempts.set(id, attempt)
    patch(id, { status: 'uploading', progress: undefined, failure: undefined, receipt: undefined })
    const task = adapter.upload(id, {
      url: serviceUrl.value,
      headers: { 'X-Varo-Attachment-Demo': 'local-transfer', 'X-Varo-Demo-Mode': rejectService.value ? 'reject' : 'accept', ...(paced.value ? { 'X-Varo-Demo-Pacing': 'paced' } : {}) },
      parseReceipt,
      onProgress(progress) { if (!disposed && attempts.get(id) === attempt) { patch(id, { progress }) } },
    })
    attempt.task = task
    try {
      const receipt = await task.promise
      if (!disposed && attempts.get(id) === attempt) { patch(id, { status: 'uploaded', receipt }); notice.value = '本地服务已保存实际字节并返回确认；尚未发送消息。' }
    }
    catch (error) {
      if (!disposed && attempts.get(id) === attempt) {
        const failure = attachmentFailure(error)
        patch(id, { status: failure.code === 'cancelled' ? 'cancelled' : 'failed', failure })
      }
    }
    finally { if (attempts.get(id) === attempt) { attempts.delete(id) } }
  }
  function action(intent: AttachmentActionIntent) {
    if (disposed) { return }
    const item = items.value.find(candidate => candidate.file.id === intent.id)
    if (!item || !attachmentActionAllowed(item, intent.action, disabled.value)) { return }
    if (intent.action === 'upload' || intent.action === 'retry') { void upload(intent.id); return }
    if (intent.action === 'cancel') {
      const attempt = attempts.get(intent.id)
      attempts.delete(intent.id)
      attempt?.task?.cancel()
      patch(intent.id, { status: 'cancelled', receipt: undefined })
      notice.value = '已取消；不承诺远端回滚。取消后的回调不能修改此条目。'
      return
    }
    adapter.release(intent.id)
    rawItems.value = rawItems.value.filter(candidate => candidate.file.id !== intent.id)
    notice.value = '已释放本地源句柄；不会删除宿主临时文件或已确认的服务文件。'
  }
  function submit(intent: AttachmentSubmitIntent) {
    if (disposed || disabled.value || choosing.value || !intent.prompt.trim() || !attachmentCanSubmit(items.value)
      || intent.attachments.length !== items.value.length || intent.attachments.some((item, index) => item.file.id !== items.value[index]?.file.id)) { return }
    const receipts: LocalReceipt[] = []
    for (const item of rawItems.value) { if (item.receipt) { receipts.push(item.receipt) } }
    messages.value = [...messages.value, { id: messages.value.length + 1, prompt: intent.prompt.trim(), receipts }]
    notice.value = '应用已接受消息及当前服务确认；文本和附件均保留。'
  }
  function close() {
    if (disposed) { return }
    disposed = true
    selection = undefined
    attempts.clear()
    adapter.dispose()
    choosing.value = false
    rawItems.value = []
    visible.value = false
    notice.value = '已关闭并释放全部本地文件句柄与活动任务；服务文件仅在开发服务器关闭时清理。'
  }
  onBeforeUnmount(close)
  return { policy, prompt, boundPrompt, uncontrolled, rejectPrompt, disabled, grantsEnabled, rejectService, paced, choosing, visible, notice, items, messages, acknowledgements, lifecycle, serviceUrl, serviceNotice, running, updateService, choose, cancelSelection, updatePrompt, action, submit, close }
}
