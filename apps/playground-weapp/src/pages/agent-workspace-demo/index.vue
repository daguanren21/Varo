<script setup lang="ts">
import type { AgentThreadVersion, AgentToolPart } from '@varo-ui/ai'
import type { AgentConversationMessage, AgentTask } from '../../components/agent-ui/types'
import { computed, onUnload, onUnmounted, shallowRef } from 'wevu'
import AgentToolChip from '../../components/agent-ui/AgentToolChip.vue'
import AgentWorkspace from '../../components/blocks/agent-workspace.vue'
import VButton from '../../components/ui/v-button.vue'

const versions = shallowRef<AgentThreadVersion[]>([
  { id: 'root', label: '初始方案', summary: '本地草稿：先确认输入，再统计词数。' },
  { id: 'alternative', label: '备选方案', parentId: 'root', summary: '本地草稿：保留人工审批，再运行工具。' },
])
const activeVersionId = shallowRef('root')
const prompt = shallowRef('')
const disabled = shallowRef(false)
const approvalPending = shallowRef(false)
const task = shallowRef<AgentTask>({ id: 'word-count', title: '本地词数工具', status: 'waiting', requiresApproval: true, description: '只读取页面内的 8 条英文短句；首轮注入演示错误，重试后计算真实本地词数。' })
const tasks = computed(() => [task.value])
const busy = computed(() => task.value.status === 'running')
const workspaceDisabled = computed(() => disabled.value || approvalPending.value)
const disabledLabel = computed(() => disabled.value ? '启用工作区操作' : '禁用工作区操作')
const action = shallowRef('ready')
const intents = shallowRef(0)
const processed = shallowRef(0)
const words = shallowRef(0)
const input = ['keep decisions local', 'review before execution', 'choose a branch', 'pin the result', 'cancel running work', 'retry failed work', 'inspect tool status', 'preserve user ownership']
let timer: ReturnType<typeof setInterval> | undefined
let branchCount = 0
const messages = computed<AgentConversationMessage[]>(() => [{ id: activeVersionId.value, role: 'user', content: versions.value.find(version => version.id === activeVersionId.value)?.summary ?? '' }])
const tool = computed<AgentToolPart>(() => ({ id: task.value.id, name: task.value.title, status: task.value.status, summary: task.value.description }))
const diagnostic = computed(() => `version=${activeVersionId.value};versions=${versions.value.length};pinned=${versions.value.filter(version => version.pinned).map(version => version.id).join(',')};status=${task.value.status};processed=${processed.value};words=${words.value};intents=${intents.value};action=${action.value}`)

function record(value: string) {
  intents.value += 1
  action.value = value
}
function select(version: AgentThreadVersion) {
  activeVersionId.value = version.id
  record(`select:${version.id}`)
}
function branch(version: AgentThreadVersion) {
  const id = `branch-${++branchCount}`
  versions.value = [...versions.value, { id, parentId: version.id, label: `分支 ${branchCount}`, summary: version.summary }]
  activeVersionId.value = id
  record(`branch:${version.id}`)
}
function pin(version: AgentThreadVersion) {
  versions.value = versions.value.map(item => item.id === version.id ? { ...item, pinned: true } : item)
  record(`pin:${version.id}`)
}
function submit(value: string) {
  versions.value = versions.value.map(version => version.id === activeVersionId.value ? { ...version, summary: value } : version)
  prompt.value = ''
  record('draft-updated')
}
function requestApproval() {
  approvalPending.value = true
  record('approval-requested')
}
function clearWork() {
  clearInterval(timer)
  timer = undefined
}
function run(injectError: boolean) {
  clearWork()
  processed.value = 0
  words.value = 0
  task.value = { ...task.value, status: 'running', requiresApproval: false, retryable: false, progress: 0, description: '正在逐条统计页面内的短句；可随时取消。' }
  timer = setInterval(() => {
    if (injectError && processed.value === 1) {
      clearWork()
      task.value = { ...task.value, status: 'failed', retryable: true, description: '本地演示错误：第二条输入被故意拒绝。重试会重新计算全部输入。' }
      action.value = 'local-error'
      return
    }
    words.value += input[processed.value]!.split(/\s+/u).length
    processed.value += 1
    const completed = processed.value === input.length
    task.value = { ...task.value, status: completed ? 'completed' : 'running', progress: processed.value / input.length * 100, description: `本地已处理 ${processed.value}/${input.length} 条，累计 ${words.value} 个词。` }
    if (completed) {
      clearWork()
      action.value = 'local-completed'
    }
  }, 400)
}
function decide(approved: boolean) {
  if (!approvalPending.value || disabled.value) { return }
  approvalPending.value = false
  record(approved ? 'approval-accepted' : 'approval-declined')
  if (approved) { run(true) }
}
function retry() {
  record('retry')
  run(false)
}
function cancel() {
  clearWork()
  task.value = { ...task.value, status: 'waiting', requiresApproval: true, retryable: false, description: `已取消本地计算，停在第 ${processed.value} 条；重新运行需要再次批准。` }
  record('cancelled')
}
onUnload(clearWork)
onUnmounted(clearWork)
</script>

<template>
  <view class="box-border grid min-h-screen min-w-0 gap-4 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+80px)] text-[var(--varo-ui-text)]" aria-label="Workspace 演示">
    <view class="grid gap-2">
      <text class="text-xl font-semibold">
        分支、版本与执行决定
      </text>
      <text>确定性本地演示；不连接模型、网络或存储。分支和固定仅保存在当前页面，审批由本页应用决定。</text>
    </view>
    <VButton variant="outline" @click="disabled = !disabled">
      {{ disabledLabel }}
    </VButton>
    <text class="break-words text-xs" data-workspace-demo="state">
      {{ diagnostic }}
    </text>
    <view v-if="approvalPending" class="grid gap-2" role="group" aria-label="本地执行审批">
      <text>仅授权读取页面内短句。首轮会注入本地错误，用于演示重试；不会访问外部服务。</text>
      <view class="flex flex-wrap gap-2">
        <VButton :disabled="disabled" @click="decide(true)">
          批准本地执行
        </VButton>
        <VButton variant="outline" :disabled="disabled" @click="decide(false)">
          拒绝本地执行
        </VButton>
      </view>
    </view>
    <AgentToolChip :tool="tool" />
    <AgentWorkspace v-model:prompt="prompt" title="本地分支工作区" subtitle="任务、工具状态与审批来自本页应用；Block 只发送意图。" :active-version-id="activeVersionId" :versions="versions" :tasks="tasks" :messages="messages" :busy="busy" :disabled="workspaceDisabled" @selectVersion="select" @branchVersion="branch" @pinVersion="pin" @approveTask="requestApproval" @retryTask="retry" @cancelTask="cancel" @submit="submit" />
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "分支与执行工作区",
  "usingComponents": {}
}
</json>
