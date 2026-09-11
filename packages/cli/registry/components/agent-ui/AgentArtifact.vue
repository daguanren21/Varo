<script setup lang="ts">
export interface AgentArtifactItem {
  content?: string
  id: string
  kind?: 'code' | 'document' | 'file' | 'image'
  language?: string
  previewUrl?: string
  title: string
  url?: string
}

defineProps<{
  artifact: AgentArtifactItem
}>()

const emit = defineEmits<{
  open: [artifact: AgentArtifactItem]
}>()

function kindLabel(kind?: AgentArtifactItem['kind']) {
  if (kind === 'code') { return '代码产物' }
  if (kind === 'image') { return '图像产物' }
  if (kind === 'file') { return '文件产物' }
  return '文档产物'
}
</script>

<template>
  <view class="agent-artifact" :data-kind="artifact.kind || 'document'">
    <view class="agent-artifact__header">
      <view class="agent-artifact__heading">
        <text class="agent-artifact__kind">
          {{ kindLabel(artifact.kind) }}
        </text>
        <text class="agent-artifact__title">
          {{ artifact.title }}
        </text>
        <text v-if="artifact.language" class="agent-artifact__lang">
          {{ artifact.language }}
        </text>
      </view>
      <button class="agent-native-button agent-artifact__open" type="button" @click="emit('open', artifact)">
        打开
      </button>
    </view>
    <scroll-view v-if="artifact.content" class="agent-artifact__scroll" scroll-x scroll-y>
      <text class="agent-artifact__body">
        {{ artifact.content }}
      </text>
    </scroll-view>
    <image v-if="artifact.previewUrl" class="agent-artifact__preview" :src="artifact.previewUrl" :alt="artifact.title" mode="aspectFit" />
  </view>
</template>

<style>
.agent-artifact {
  overflow: hidden;
  color: #dbeafe;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
}

.agent-artifact__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 52px;
  padding: 12px 14px 11px;
  background: #111c30;
  border-bottom: 1px solid #26334a;
}

.agent-artifact__heading {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  align-items: center;
  min-width: 0;
}

.agent-artifact__kind {
  font-size: 10px;
  font-weight: 800;
  color: #5eead4;
  letter-spacing: 0.12em;
}

.agent-artifact__title {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 650;
  color: #f8fafc;
  white-space: nowrap;
}

.agent-artifact__lang {
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 750;
  color: #94a3b8;
  background: rgb(148 163 184 / 12%);
  border-radius: 999px;
}

.agent-artifact__open {
  flex: none;
  min-height: 32px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 750;
  color: #cbd5e1;
  background: rgb(148 163 184 / 10%);
  border: 1px solid rgb(148 163 184 / 22%);
  border-radius: 9px;
}

.agent-artifact__scroll {
  max-height: 288px;
  background: #0f172a;
}

.agent-artifact__body {
  display: block;
  padding: 14px 16px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #cbd5e1;
  white-space: pre-wrap;
}

.agent-artifact__preview {
  display: block;
  width: 100%;
  height: 240px;
  background: #0b1220;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
