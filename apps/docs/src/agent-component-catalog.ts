export interface AgentDemoDefinition {
  code: string
  example: string
  importPath: string
  name: string
}

export const agentDemoCatalog: Record<string, AgentDemoDefinition> = {
  "loading": {
    "name": "AgentLoading",
    "importPath": "@/components/agent-ui",
    "example": "<AgentLoading label=\"正在分析\" variant=\"grid\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentLoading } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentLoading label=\"正在分析\" variant=\"grid\" />\n</template>"
  },
  "thinking": {
    "name": "AgentThinking",
    "importPath": "@/components/agent-ui",
    "example": "<AgentThinking label=\"推理过程\" :steps=\"steps\" default-open />",
    "code": "<script setup lang=\"ts\">\nimport { AgentThinking } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentThinking label=\"推理过程\" :steps=\"steps\" default-open />\n</template>"
  },
  "markdown": {
    "name": "AgentMarkdown",
    "importPath": "@/components/agent-ui",
    "example": "<AgentMarkdown :content=\"markdownContent\" final />",
    "code": `<script setup lang="ts">
import { AgentMarkdown } from '@/components/agent-ui'

const markdownContent = '## Result\\n\\n**Ready**'
</script>

<template>
  <AgentMarkdown :content="markdownContent" final />
</template>`
  },
  "stream": {
    "name": "AgentStream",
    "importPath": "@/components/agent-ui",
    "example": "<AgentStream content=\"正在生成…\" status=\"streaming\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentStream } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentStream content=\"正在生成…\" status=\"streaming\" />\n</template>"
  },
  "message": {
    "name": "AgentMessage",
    "importPath": "@/components/agent-ui",
    "example": "<AgentMessage role=\"assistant\" label=\"Varo Agent\">回答内容</AgentMessage>",
    "code": "<script setup lang=\"ts\">\nimport { AgentMessage } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentMessage role=\"assistant\" label=\"Varo Agent\">回答内容</AgentMessage>\n</template>"
  },
  "conversation": {
    "name": "AgentConversation",
    "importPath": "@/components/agent-ui",
    "example": "<AgentConversation :messages=\"messages\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentConversation } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentConversation :messages=\"messages\" />\n</template>"
  },
  "tool-chip": {
    "name": "AgentToolChip",
    "importPath": "@/components/agent-ui",
    "example": "<AgentToolChip :tool=\"tool\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentToolChip } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentToolChip :tool=\"tool\" />\n</template>"
  },
  "task-list": {
    "name": "AgentTaskList",
    "importPath": "@/components/agent-ui",
    "example": "<AgentTaskList title=\"执行计划\" :tasks=\"tasks\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentTaskList } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentTaskList title=\"执行计划\" :tasks=\"tasks\" />\n</template>"
  },
  "radio-group": {
    "name": "AgentRadioGroup",
    "importPath": "@/components/agent-ui",
    "example": "<AgentRadioGroup v-model:value=\"value\" :choices=\"choices\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentRadioGroup } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentRadioGroup v-model:value=\"value\" :choices=\"choices\" />\n</template>"
  },
  "approval": {
    "name": "AgentApproval",
    "importPath": "@/components/agent-ui",
    "example": "<AgentApproval v-model:value=\"value\" title=\"确认发布\" :choices=\"choices\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentApproval } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentApproval v-model:value=\"value\" title=\"确认发布\" :choices=\"choices\" />\n</template>"
  },
  "recommendation": {
    "name": "AgentRecommendation",
    "importPath": "@/components/agent-ui",
    "example": "<AgentRecommendation title=\"推荐统一协议\" :confidence=\"96\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentRecommendation } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentRecommendation title=\"推荐统一协议\" :confidence=\"96\" />\n</template>"
  },
  "prompt-suggestions": {
    "name": "AgentPromptSuggestions",
    "importPath": "@/components/agent-ui",
    "example": "<AgentPromptSuggestions :suggestions=\"suggestions\" @select=\"send\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentPromptSuggestions } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentPromptSuggestions :suggestions=\"suggestions\" @select=\"send\" />\n</template>"
  },
  "composer": {
    "name": "AgentComposer",
    "importPath": "@/components/agent-ui",
    "example": "<AgentComposer v-model=\"prompt\" :suggestions=\"suggestions\" @submit=\"send\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentComposer } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentComposer v-model=\"prompt\" :suggestions=\"suggestions\" @submit=\"send\" />\n</template>"
  },
  "response-actions": {
    "name": "AgentResponseActions",
    "importPath": "@/components/agent-ui",
    "example": "<AgentResponseActions :content=\"answer\" @retry=\"retry\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentResponseActions } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentResponseActions :content=\"answer\" @retry=\"retry\" />\n</template>"
  },
  "artifact": {
    "name": "AgentArtifact",
    "importPath": "@/components/agent-ui",
    "example": "<AgentArtifact :artifact=\"artifact\" @open=\"openArtifact\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentArtifact } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentArtifact :artifact=\"artifact\" @open=\"openArtifact\" />\n</template>"
  },
  "sources": {
    "name": "AgentSourceList",
    "importPath": "@/components/agent-ui",
    "example": "<AgentSourceList title=\"来源\" :sources=\"sources\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentSourceList } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentSourceList title=\"来源\" :sources=\"sources\" />\n</template>"
  },
  "attachments": {
    "name": "AgentAttachmentList",
    "importPath": "@/components/agent-ui",
    "example": "<AgentAttachmentList :attachments=\"attachments\" @remove=\"remove\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentAttachmentList } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentAttachmentList :attachments=\"attachments\" @remove=\"remove\" />\n</template>"
  },
  "event-renderer": {
    "name": "AgentEventRenderer",
    "importPath": "@/components/agent-ui",
    "example": "<AgentEventRenderer :snapshot=\"snapshot\" @approve=\"approve\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentEventRenderer } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentEventRenderer :snapshot=\"snapshot\" @approve=\"approve\" />\n</template>"
  },
  "message-scroller": {
    "name": "AgentMessageScroller",
    "importPath": "@/components/agent-ui",
    "example": "<AgentMessageScroller :at-live-edge=\"false\" @follow=\"follow\"><AgentConversation :messages=\"messages\" /></AgentMessageScroller>",
    "code": "<script setup lang=\"ts\">\nimport { AgentMessageScroller } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentMessageScroller :at-live-edge=\"false\" @follow=\"follow\"><AgentConversation :messages=\"messages\" /></AgentMessageScroller>\n</template>"
  },
  "code-block": {
    "name": "AgentCodeBlock",
    "importPath": "@/components/agent-ui",
    "example": "<AgentCodeBlock filename=\"agent.ts\" language=\"TypeScript\" :code=\"code\" :focused-lines=\"[2]\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentCodeBlock } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentCodeBlock filename=\"agent.ts\" language=\"TypeScript\" :code=\"code\" :focused-lines=\"[2]\" />\n</template>"
  },
  "file-diff": {
    "name": "AgentFileDiff",
    "importPath": "@/components/agent-ui",
    "example": "<AgentFileDiff filename=\"src/runtime/create-agent-stream.ts\" :lines=\"lines\" default-view=\"unified\" />",
    "code": `<script setup lang="ts">
import { AgentFileDiff } from '@/components/agent-ui'

const lines = [
  { content: '@@ -16,5 +16,6 @@ createAgentStream', type: 'hunk' },
  { content: "  const status = shallowRef<'idle' | 'done'>('idle')", oldNumber: 17, type: 'remove' },
  { content: "  const status = shallowRef<AgentStreamStatus>('streaming')", newNumber: 17, type: 'add' },
  { content: "  const scheduler = target === 'weapp' ? 'time-slice' : 'raf'", newNumber: 18, type: 'add' }
]
</script>

<template>
  <AgentFileDiff
    filename="src/runtime/create-agent-stream.ts"
    :lines="lines"
    default-view="unified"
  />
</template>`
  },
  "tool-result": {
    "name": "AgentToolResult",
    "importPath": "@/components/agent-ui",
    "example": "<AgentToolResult name=\"pnpm test\" output=\"38 tests passed\" status=\"completed\" default-open />",
    "code": "<script setup lang=\"ts\">\nimport { AgentToolResult } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentToolResult name=\"pnpm test\" output=\"38 tests passed\" status=\"completed\" default-open />\n</template>"
  },
  "image-generation": {
    "name": "AgentImageGeneration",
    "importPath": "@/components/agent-ui",
    "example": "<AgentImageGeneration status=\"generating\" :progress=\"68\" prompt=\"Generate an Agent UI\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentImageGeneration } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentImageGeneration status=\"generating\" :progress=\"68\" prompt=\"Generate an Agent UI\" />\n</template>"
  },
  "tool-approval": {
    "name": "AgentToolApproval",
    "importPath": "@/components/agent-ui",
    "example": "<AgentToolApproval tool=\"npm.publish\" :details=\"details\" @allow=\"allow\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentToolApproval } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentToolApproval tool=\"npm.publish\" :details=\"details\" @allow=\"allow\" />\n</template>"
  },
  "citations": {
    "name": "AgentCitations",
    "importPath": "@/components/agent-ui",
    "example": "<AgentCitations title=\"来源\" :items=\"citations\" default-open />",
    "code": "<script setup lang=\"ts\">\nimport { AgentCitations } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentCitations title=\"来源\" :items=\"citations\" default-open />\n</template>"
  },
  "activity": {
    "name": "AgentActivity",
    "importPath": "@/components/agent-ui",
    "example": "<AgentActivity title=\"Agent 活动\" :items=\"activity\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentActivity } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentActivity title=\"Agent 活动\" :items=\"activity\" />\n</template>"
  },
  "sidebar": {
    "name": "AgentSidebar",
    "importPath": "@/components/agent-ui",
    "example": "<AgentSidebar v-model:active-id=\"active\" :groups=\"groups\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentSidebar } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentSidebar v-model:active-id=\"active\" :groups=\"groups\" />\n</template>"
  },
  "context-card": {
    "name": "AgentContextCard",
    "importPath": "@/components/agent-ui",
    "example": "<AgentContextCard title=\"检索上下文\" :chunks=\"chunks\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentContextCard } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentContextCard title=\"检索上下文\" :chunks=\"chunks\" />\n</template>"
  },
  "insight-card": {
    "name": "AgentInsightCard",
    "importPath": "@/components/agent-ui",
    "example": "<AgentInsightCard v-model:current=\"current\" :insights=\"insights\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentInsightCard } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentInsightCard v-model:current=\"current\" :insights=\"insights\" />\n</template>"
  },
  "selection-actions": {
    "name": "AgentSelectionActions",
    "importPath": "@/components/agent-ui",
    "example": "<AgentSelectionActions :text=\"selectedText\" :actions=\"actions\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentSelectionActions } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentSelectionActions :text=\"selectedText\" :actions=\"actions\" />\n</template>"
  },
  "diff-table": {
    "name": "AgentDiffTable",
    "importPath": "@/components/agent-ui",
    "example": "<AgentDiffTable :columns=\"columns\" :rows=\"changedRows\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentDiffTable } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentDiffTable :columns=\"columns\" :rows=\"changedRows\" />\n</template>"
  },
  "records-table": {
    "name": "AgentRecordsTable",
    "importPath": "@/components/agent-ui",
    "example": "<AgentRecordsTable :columns=\"columns\" :rows=\"rows\" @sort=\"sort\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentRecordsTable } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentRecordsTable :columns=\"columns\" :rows=\"rows\" @sort=\"sort\" />\n</template>"
  },
  "filter-table": {
    "name": "AgentFilterTable",
    "importPath": "@/components/agent-ui",
    "example": "<AgentFilterTable v-model:filter=\"filter\" :filters=\"filters\" :columns=\"columns\" :rows=\"rows\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentFilterTable } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentFilterTable v-model:filter=\"filter\" :filters=\"filters\" :columns=\"columns\" :rows=\"rows\" />\n</template>"
  },
  "command-search": {
    "name": "AgentCommandSearch",
    "importPath": "@/components/agent-ui",
    "example": "<AgentCommandSearch v-model=\"query\" :items=\"commands\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentCommandSearch } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentCommandSearch v-model=\"query\" :items=\"commands\" />\n</template>"
  },
  "flowchart": {
    "name": "AgentFlowchart",
    "importPath": "@/components/agent-ui",
    "example": "<AgentFlowchart title=\"发布工作流\" :nodes=\"nodes\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentFlowchart } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentFlowchart title=\"发布工作流\" :nodes=\"nodes\" />\n</template>"
  },
  "fine-tune": {
    "name": "AgentFineTune",
    "importPath": "@/components/agent-ui",
    "example": "<AgentFineTune v-model:controls=\"controls\" title=\"调整卡片\" />",
    "code": "<script setup lang=\"ts\">\nimport { AgentFineTune } from '@/components/agent-ui'\n</script>\n\n<template>\n  <AgentFineTune v-model:controls=\"controls\" title=\"调整卡片\" />\n</template>"
  },
  "agent-chat": {
    "name": "AgentChat",
    "importPath": "@/components/blocks/agent-chat.vue",
    "example": "<AgentChat v-model=\"prompt\" :messages=\"messages\" :snapshot=\"snapshot\" @submit=\"send\" />",
    "code": "<script setup lang=\"ts\">\nimport AgentChat from '@/components/blocks/agent-chat.vue'\n</script>\n\n<template>\n  <AgentChat v-model=\"prompt\" :messages=\"messages\" :snapshot=\"snapshot\" @submit=\"send\" />\n</template>"
  }
}
