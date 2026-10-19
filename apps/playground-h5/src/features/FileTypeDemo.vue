<script setup lang="ts">
import type { AgentAttachmentItem } from '../components/agent-ui/advanced-types'
import { computed, shallowRef } from 'vue'
import { AgentAttachmentList } from '../components/agent-ui/supplemental'
import { VButton } from '../components/ui/button'
import { VFileType } from '../components/ui/file-type'

const files = [
  '年度报告.PDF',
  'proposal.docx',
  'budget.xlsx',
  'slides.pptx',
  'photo.webp',
  'interview.mp3',
  'recording.mp4',
  'source.tar.gz',
  'component.vue',
  '.env.local',
  'Dockerfile.dev',
  '.gitignore',
  'LICENSE',
  'unknown.custom',
]
const previewSource = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="#e2e8f0"/><rect x="12" y="14" width="72" height="45" rx="7" fill="#0f766e"/><circle cx="68" cy="29" r="8" fill="#fde68a"/><path d="m12 59 24-22 17 14 13-9 18 17" fill="#5eead4"/><rect x="12" y="69" width="50" height="5" rx="2" fill="#334155"/><rect x="12" y="79" width="34" height="4" rx="2" fill="#64748b"/></svg>')}`
const original: AgentAttachmentItem[] = [
  { id: 'report', name: '2026-第四季度产品设计评审与研究报告-final-revision.pdf', size: '248 KB', mimeType: 'application/pdf' },
  { id: 'preview', name: 'moodboard.png', size: '32 KB', mimeType: 'image/png' },
  { id: 'unknown', name: 'download', size: '12 KB', mimeType: 'application/octet-stream' },
]
const attachments = shallowRef(original)
const previewVisible = shallowRef(true)
const notice = shallowRef('移除附件后，可用“恢复附件”重新开始。')
const displayedAttachments = computed(() => attachments.value.map(item => item.id === 'preview' && previewVisible.value ? { ...item, previewUrl: previewSource } : item))

function remove(item: AgentAttachmentItem) {
  attachments.value = attachments.value.filter(attachment => attachment.id !== item.id)
  notice.value = `已移除：${item.name}`
}

function restore() {
  attachments.value = original
  notice.value = '已恢复 3 个附件。'
}
</script>

<template>
  <main class="box-border min-h-screen w-full min-w-0 bg-[var(--varo-ui-bg)] p-4 text-[var(--varo-ui-text)]">
    <div class="mx-auto grid w-full max-w-2xl min-w-0 gap-6">
      <header class="grid gap-2">
        <h1 class="m-0 text-2xl font-bold">
          文件类型
        </h1>
        <p class="m-0 text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          按文件名识别，未知扩展名再参考 MIME。图标只展示类型，附件是否允许上传由应用决定。
        </p>
      </header>

      <section class="grid min-w-0 gap-3" aria-labelledby="file-type-list-heading">
        <h2 id="file-type-list-heading" class="m-0 text-base font-semibold">
          紧凑文件列表
        </h2>
        <ul class="m-0 grid min-w-0 list-none grid-cols-2 gap-3 p-0">
          <li v-for="filename in files" :key="filename" class="flex min-w-0 items-center gap-2">
            <VFileType :filename="filename" decorative />
            <span class="min-w-0 break-all text-xs leading-5">{{ filename }}</span>
          </li>
        </ul>
      </section>

      <section class="grid gap-3" aria-labelledby="file-type-accessibility-heading">
        <h2 id="file-type-accessibility-heading" class="m-0 text-base font-semibold">
          独立图标与 MIME 识别
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <VFileType filename="report.pdf" size="sm" label="PDF 报告" />
          <VFileType filename="download" mime-type="image/png" label="MIME 识别为图像" />
          <VFileType filename="unknown.custom" size="lg" label="未知文件类型" />
        </div>
        <p class="m-0 text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          独立图标提供名称；文件名旁的图标不重复朗读。
        </p>
      </section>

      <section class="grid min-w-0 gap-3" aria-labelledby="file-type-attachments-heading">
        <h2 id="file-type-attachments-heading" class="m-0 text-base font-semibold">
          附件预览与移除
        </h2>
        <div class="flex flex-wrap gap-2">
          <VButton variant="outline" tone="default" @click="previewVisible = !previewVisible">
            {{ previewVisible ? '隐藏预览图' : '显示预览图' }}
          </VButton>
          <VButton variant="outline" tone="default" @click="restore">
            恢复附件
          </VButton>
        </div>
        <AgentAttachmentList :attachments="displayedAttachments" @remove="remove" />
        <p v-if="!attachments.length" class="m-0 text-sm">
          附件已全部移除。
        </p>
        <p class="m-0 break-all text-xs leading-5 text-[var(--varo-ui-text-regular)]" role="status">
          {{ notice }}
        </p>
      </section>
    </div>
  </main>
</template>
