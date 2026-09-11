import AgentActivity from './components/agent-ui/AgentActivity.vue'
import AgentApproval from './components/agent-ui/AgentApproval.vue'
import AgentArtifact from './components/agent-ui/AgentArtifact.vue'
import AgentAttachmentList from './components/agent-ui/AgentAttachmentList.vue'
import AgentCitations from './components/agent-ui/AgentCitations.vue'
import AgentCodeBlock from './components/agent-ui/AgentCodeBlock.vue'
import AgentCommandSearch from './components/agent-ui/AgentCommandSearch.vue'
import AgentComposer from './components/agent-ui/AgentComposer.vue'
import AgentContextCard from './components/agent-ui/AgentContextCard.vue'
import AgentConversation from './components/agent-ui/AgentConversation.vue'
import AgentDiffTable from './components/agent-ui/AgentDiffTable.vue'
import AgentEventRenderer from './components/agent-ui/AgentEventRenderer.vue'
import AgentFileDiff from './components/agent-ui/AgentFileDiff.vue'
import AgentFilterTable from './components/agent-ui/AgentFilterTable.vue'
import AgentFineTune from './components/agent-ui/AgentFineTune.vue'
import AgentFlowchart from './components/agent-ui/AgentFlowchart.vue'
import AgentImageGeneration from './components/agent-ui/AgentImageGeneration.vue'
import AgentInsightCard from './components/agent-ui/AgentInsightCard.vue'
import AgentLoading from './components/agent-ui/AgentLoading.vue'
import AgentMarkdown from './components/agent-ui/AgentMarkdown.vue'
import AgentMessage from './components/agent-ui/AgentMessage.vue'
import AgentMessageScroller from './components/agent-ui/AgentMessageScroller.vue'
import AgentPromptSuggestions from './components/agent-ui/AgentPromptSuggestions.vue'
import AgentRadioGroup from './components/agent-ui/AgentRadioGroup.vue'
import AgentRecommendation from './components/agent-ui/AgentRecommendation.vue'
import AgentRecordsTable from './components/agent-ui/AgentRecordsTable.vue'
import AgentResponseActions from './components/agent-ui/AgentResponseActions.vue'
import AgentSelectionActions from './components/agent-ui/AgentSelectionActions.vue'
import AgentSidebar from './components/agent-ui/AgentSidebar.vue'
import AgentSourceList from './components/agent-ui/AgentSourceList.vue'
import AgentStream from './components/agent-ui/AgentStream.vue'
import AgentTaskList from './components/agent-ui/AgentTaskList.vue'
import AgentThinking from './components/agent-ui/AgentThinking.vue'
import AgentToolApproval from './components/agent-ui/AgentToolApproval.vue'
import AgentToolChip from './components/agent-ui/AgentToolChip.vue'
import AgentToolResult from './components/agent-ui/AgentToolResult.vue'
import AgentChat from './components/blocks/agent-chat.vue'
import { VForm } from './components/ui/form'
import VActionSheet from './components/ui/v-action-sheet.vue'
import VCellGroup from './components/ui/v-cell-group.vue'
import VCell from './components/ui/v-cell.vue'
import VCol from './components/ui/v-col.vue'
import VCollapseItem from './components/ui/v-collapse-item.vue'
import VCollapse from './components/ui/v-collapse.vue'
import VDialogClose from './components/ui/v-dialog-close.vue'
import VDialogContent from './components/ui/v-dialog-content.vue'
import VDialogOverlay from './components/ui/v-dialog-overlay.vue'
import VDialogRoot from './components/ui/v-dialog-root.vue'
import VDialogTrigger from './components/ui/v-dialog-trigger.vue'
import VDivider from './components/ui/v-divider.vue'
import VGridItem from './components/ui/v-grid-item.vue'
import VGrid from './components/ui/v-grid.vue'
import VIndicator from './components/ui/v-indicator.vue'
import VList from './components/ui/v-list.vue'
import VMenuItem from './components/ui/v-menu-item.vue'
import VMenu from './components/ui/v-menu.vue'
import VNavbar from './components/ui/v-navbar.vue'
import VNoticeBar from './components/ui/v-notice-bar.vue'
import VOverlay from './components/ui/v-overlay.vue'
import VPagination from './components/ui/v-pagination.vue'
import VPopoverClose from './components/ui/v-popover-close.vue'
import VPopoverContent from './components/ui/v-popover-content.vue'
import VPopoverRoot from './components/ui/v-popover-root.vue'
import VPopoverTrigger from './components/ui/v-popover-trigger.vue'
import VPopup from './components/ui/v-popup.vue'
import VRadioGroup from './components/ui/v-radio-group.vue'
import VRadio from './components/ui/v-radio.vue'
import VRate from './components/ui/v-rate.vue'
import VRow from './components/ui/v-row.vue'
import VSafeArea from './components/ui/v-safe-area.vue'
import VSearchbar from './components/ui/v-searchbar.vue'
import VSkeleton from './components/ui/v-skeleton.vue'
import VSpace from './components/ui/v-space.vue'
import VSteps from './components/ui/v-steps.vue'
import VSticky from './components/ui/v-sticky.vue'
import VSwipeCell from './components/ui/v-swipe-cell.vue'
import VTab from './components/ui/v-tab.vue'
import VTabbarItem from './components/ui/v-tabbar-item.vue'
import VTabbar from './components/ui/v-tabbar.vue'
import VTabs from './components/ui/v-tabs.vue'
import VTextarea from './components/ui/v-textarea.vue'
import VToast from './components/ui/v-toast.vue'

export const extendedRegistryComponentCount = [
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
  VCellGroup,
  VCollapse,
  VCollapseItem,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VDivider,
  VForm,
  VGrid,
  VGridItem,
  VIndicator,
  VCol,
  VRow,
  VList,
  VMenu,
  VMenuItem,
  VNavbar,
  VNoticeBar,
  VOverlay,
  VPagination,
  VPopoverClose,
  VPopoverContent,
  VPopoverRoot,
  VPopoverTrigger,
  VPopup,
  VRadio,
  VRadioGroup,
  VRate,
  VSafeArea,
  VSearchbar,
  VSkeleton,
  VSpace,
  VSteps,
  VSticky,
  VSwipeCell,
  VTab,
  VTabbar,
  VTabbarItem,
  VTabs,
  VTextarea,
  VToast,
  AgentChat,
].length
