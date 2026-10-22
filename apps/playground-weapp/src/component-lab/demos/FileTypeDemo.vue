<script setup lang="ts">
import type { AgentAttachmentItem } from '../../components/agent-ui/advanced-types'
import { computed, shallowRef } from 'wevu'
import previewSource from '../../assets/retail/banner.jpg'
import AgentAttachmentList from '../../components/agent-ui/AgentAttachmentList.vue'
import VButton from '../../components/ui/v-button.vue'
import VFileType from '../../components/ui/v-file-type.vue'

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
const original: AgentAttachmentItem[] = [
  { id: 'report', name: '2026-第四季度产品设计评审与研究报告-final-revision.pdf', size: '248 KB', mimeType: 'application/pdf' },
  { id: 'preview', name: 'moodboard.jpg', size: '32 KB', mimeType: 'image/jpeg' },
  { id: 'unknown', name: 'download', size: '12 KB', mimeType: 'application/octet-stream' },
]
const attachments = shallowRef(original)
const previewVisible = shallowRef(true)
const notice = shallowRef('移除附件后，可用“恢复附件”重新开始。')
const displayedAttachments = computed(() => attachments.value.map(item => item.id === 'preview' && previewVisible.value ? { ...item, previewUrl: previewSource } : item))
const previewButtonLabel = computed(() => previewVisible.value ? '隐藏预览图' : '显示预览图')

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
  <view class="box-border grid min-h-screen w-full min-w-0 gap-6 bg-[var(--varo-ui-bg)] p-4 text-[var(--varo-ui-text)]">
    <view class="grid gap-2">
      <text class="text-2xl font-bold">
        文件类型
      </text>
      <text class="text-sm leading-6 text-[var(--varo-ui-text-regular)]">
        按文件名识别，未知扩展名再参考 MIME。图标只展示类型，附件是否允许上传由应用决定。
      </text>
    </view>

    <view class="grid min-w-0 gap-3">
      <text class="text-base font-semibold">
        紧凑文件列表
      </text>
      <view class="grid min-w-0 grid-cols-2 gap-3">
        <view v-for="filename in files" :key="filename" class="flex min-w-0 items-center gap-2">
          <VFileType :filename="filename" decorative />
          <text class="min-w-0 break-all text-xs leading-5">
            {{ filename }}
          </text>
        </view>
      </view>
    </view>

    <view class="grid gap-3">
      <text class="text-base font-semibold">
        独立图标与 MIME 识别
      </text>
      <view class="flex flex-wrap items-center gap-4">
        <VFileType filename="report.pdf" size="sm" label="PDF 报告" />
        <VFileType filename="download" mime-type="image/png" label="MIME 识别为图像" />
        <VFileType filename="unknown.custom" size="lg" label="未知文件类型" />
      </view>
      <text class="text-xs leading-5 text-[var(--varo-ui-text-regular)]">
        独立图标提供名称；文件名旁的图标不重复朗读。
      </text>
    </view>

    <view class="grid min-w-0 gap-3">
      <text class="text-base font-semibold">
        附件预览与移除
      </text>
      <view class="flex flex-wrap gap-2">
        <VButton variant="outline" tone="default" @click="previewVisible = !previewVisible">
          {{ previewButtonLabel }}
        </VButton>
        <VButton variant="outline" tone="default" @click="restore">
          恢复附件
        </VButton>
      </view>
      <AgentAttachmentList :attachments="displayedAttachments" @remove="remove" />
      <text v-if="!attachments.length" class="text-sm">
        附件已全部移除。
      </text>
      <text class="break-all text-xs leading-5 text-[var(--varo-ui-text-regular)]" role="status">
        {{ notice }}
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
