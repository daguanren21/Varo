import type { Component } from 'vue'
import AgentChat from './components/blocks/agent-chat.vue'
import AgentArtifact from './components/agent-ui/AgentArtifact.vue'
import AgentAttachmentList from './components/agent-ui/AgentAttachmentList.vue'
import AgentConversation from './components/agent-ui/AgentConversation.vue'
import AgentRecommendation from './components/agent-ui/AgentRecommendation.vue'
import AgentResponseActions from './components/agent-ui/AgentResponseActions.vue'
import AgentSourceList from './components/agent-ui/AgentSourceList.vue'
import AgentApproval from './components/agent-ui/AgentApproval.vue'
import AgentComposer from './components/agent-ui/AgentComposer.vue'
import AgentEventRenderer from './components/agent-ui/AgentEventRenderer.vue'
import AgentLoading from './components/agent-ui/AgentLoading.vue'
import AgentMarkdown from './components/agent-ui/AgentMarkdown.vue'
import AgentMessage from './components/agent-ui/AgentMessage.vue'
import AgentPromptSuggestions from './components/agent-ui/AgentPromptSuggestions.vue'
import AgentStream from './components/agent-ui/AgentStream.vue'
import AgentTaskList from './components/agent-ui/AgentTaskList.vue'
import AgentThinking from './components/agent-ui/AgentThinking.vue'
import AgentToolChip from './components/agent-ui/AgentToolChip.vue'
import AgentActivity from './components/agent-ui/AgentActivity.vue'
import AgentCitations from './components/agent-ui/AgentCitations.vue'
import AgentCodeBlock from './components/agent-ui/AgentCodeBlock.vue'
import AgentCommandSearch from './components/agent-ui/AgentCommandSearch.vue'
import AgentContextCard from './components/agent-ui/AgentContextCard.vue'
import AgentDiffTable from './components/agent-ui/AgentDiffTable.vue'
import AgentFileDiff from './components/agent-ui/AgentFileDiff.vue'
import AgentFilterTable from './components/agent-ui/AgentFilterTable.vue'
import AgentFineTune from './components/agent-ui/AgentFineTune.vue'
import AgentFlowchart from './components/agent-ui/AgentFlowchart.vue'
import AgentImageGeneration from './components/agent-ui/AgentImageGeneration.vue'
import AgentInsightCard from './components/agent-ui/AgentInsightCard.vue'
import AgentMessageScroller from './components/agent-ui/AgentMessageScroller.vue'
import AgentRadioGroup from './components/agent-ui/AgentRadioGroup.vue'
import AgentRecordsTable from './components/agent-ui/AgentRecordsTable.vue'
import AgentSelectionActions from './components/agent-ui/AgentSelectionActions.vue'
import AgentSidebar from './components/agent-ui/AgentSidebar.vue'
import AgentToolApproval from './components/agent-ui/AgentToolApproval.vue'
import AgentToolResult from './components/agent-ui/AgentToolResult.vue'
import { VActionSheet } from './components/ui/action-sheet'
import { VCell } from './components/ui/cell'
import { VCollapse } from './components/ui/collapse'
import { VDialogRoot } from './components/ui/dialog'
import { VDivider } from './components/ui/divider'
import { VForm } from './components/ui/form'
import { VGrid } from './components/ui/grid'
import { VIndicator } from './components/ui/indicator'
import { VRow } from './components/ui/layout'
import { VList } from './components/ui/list'
import { VMenu } from './components/ui/menu'
import { VNavbar } from './components/ui/navbar'
import { VNoticeBar } from './components/ui/notice-bar'
import { VOverlay } from './components/ui/overlay'
import { VPagination } from './components/ui/pagination'
import { VPopoverRoot } from './components/ui/popover'
import { VPopup } from './components/ui/popup'
import { VRadio } from './components/ui/radio'
import { VRate } from './components/ui/rate'
import { VSafeArea } from './components/ui/safe-area'
import { VSearchbar } from './components/ui/searchbar'
import { VSkeleton } from './components/ui/skeleton'
import { VSpace } from './components/ui/space'
import { VSteps } from './components/ui/steps'
import { VSticky } from './components/ui/sticky'
import { VSwipeCell } from './components/ui/swipe-cell'
import { VTabbar } from './components/ui/tabbar'
import { VTabs } from './components/ui/tabs'
import { VTextarea } from './components/ui/textarea'
import { VToast } from './components/ui/toast'

export const extendedRegistryComponents: readonly Component[] = [
  AgentActivity,
  AgentCitations,
  AgentArtifact,
  AgentAttachmentList,
  AgentConversation,
  AgentRecommendation,
  AgentResponseActions,
  AgentSourceList,
  AgentApproval,
  AgentComposer,
  AgentEventRenderer,
  AgentLoading,
  AgentMarkdown,
  AgentMessage,
  AgentPromptSuggestions,
  AgentStream,
  AgentTaskList,
  AgentThinking,
  AgentToolChip,
  AgentCodeBlock,
  AgentCommandSearch,
  AgentContextCard,
  AgentDiffTable,
  AgentFileDiff,
  AgentFilterTable,
  AgentFineTune,
  AgentFlowchart,
  AgentImageGeneration,
  AgentInsightCard,
  AgentMessageScroller,
  AgentRadioGroup,
  AgentRecordsTable,
  AgentSelectionActions,
  AgentSidebar,
  AgentToolApproval,
  AgentToolResult,
  VActionSheet,
  VCell,
  VCollapse,
  VDialogRoot,
  VDivider,
  VForm,
  VGrid,
  VIndicator,
  VRow,
  VList,
  VMenu,
  VNavbar,
  VNoticeBar,
  VOverlay,
  VPagination,
  VPopoverRoot,
  VPopup,
  VRadio,
  VRate,
  VSafeArea,
  VSearchbar,
  VSkeleton,
  VSpace,
  VSteps,
  VSticky,
  VSwipeCell,
  VTabbar,
  VTabs,
  VTextarea,
  VToast,
  AgentChat
]
