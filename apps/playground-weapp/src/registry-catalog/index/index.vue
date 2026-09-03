<script setup lang="ts">
import { shallowRef } from 'wevu'
import VActionSheet from '../../components/ui/v-action-sheet.vue'
import VCell from '../../components/ui/v-cell.vue'
import VCellGroup from '../../components/ui/v-cell-group.vue'
import VCollapse from '../../components/ui/v-collapse.vue'
import VCollapseItem from '../../components/ui/v-collapse-item.vue'
import VCol from '../../components/ui/v-col.vue'
import VDivider from '../../components/ui/v-divider.vue'
import VGrid from '../../components/ui/v-grid.vue'
import VGridItem from '../../components/ui/v-grid-item.vue'
import VIcon from '../../components/ui/v-icon.vue'
import VIndicator from '../../components/ui/v-indicator.vue'
import VInput from '../../components/ui/v-input.vue'
import VLoading from '../../components/ui/v-loading.vue'
import VList from '../../components/ui/v-list.vue'
import VMenu from '../../components/ui/v-menu.vue'
import VMenuItem from '../../components/ui/v-menu-item.vue'
import VNavbar from '../../components/ui/v-navbar.vue'
import VNoticeBar from '../../components/ui/v-notice-bar.vue'
import VOverlay from '../../components/ui/v-overlay.vue'
import VPagination from '../../components/ui/v-pagination.vue'
import VPopoverClose from '../../components/ui/v-popover-close.vue'
import VPopoverContent from '../../components/ui/v-popover-content.vue'
import VPopoverRoot from '../../components/ui/v-popover-root.vue'
import VPopoverTrigger from '../../components/ui/v-popover-trigger.vue'
import VPopup from '../../components/ui/v-popup.vue'
import VRadio from '../../components/ui/v-radio.vue'
import VRadioGroup from '../../components/ui/v-radio-group.vue'
import VRate from '../../components/ui/v-rate.vue'
import VRow from '../../components/ui/v-row.vue'
import VSafeArea from '../../components/ui/v-safe-area.vue'
import VSearchbar from '../../components/ui/v-searchbar.vue'
import VSpace from '../../components/ui/v-space.vue'
import VSteps from '../../components/ui/v-steps.vue'
import VTab from '../../components/ui/v-tab.vue'
import VSticky from '../../components/ui/v-sticky.vue'
import VSwipeCell from '../../components/ui/v-swipe-cell.vue'
import VTabs from '../../components/ui/v-tabs.vue'
import VTabbar from '../../components/ui/v-tabbar.vue'
import VTabbarItem from '../../components/ui/v-tabbar-item.vue'
import VTextarea from '../../components/ui/v-textarea.vue'
import VToast from '../../components/ui/v-toast.vue'

const renderCatalog = shallowRef(false)
const actions = [{ name: 'Inspect', value: 'inspect' }]
const steps = ['Start', 'Complete']
</script>

<template>
  <view v-if="renderCatalog" class="varo-registry-catalog">
    <VActionSheet :actions="actions" />
    <VCellGroup><VCell title="Cell" /></VCellGroup>
    <VCollapse><VCollapseItem title="Item" value="item">Content</VCollapseItem></VCollapse>
    <VDivider>Divider</VDivider>
    <VGrid><VGridItem text="Grid" /></VGrid>
    <VIcon name="check" />
    <VIndicator :count="2" />
    <VInput value="Input" />
    <VRow><VCol :span="12">Column</VCol></VRow>
    <VLoading />
    <VList :immediate="false"><view>List</view></VList>
    <VMenu><VMenuItem name="item" title="Menu" /></VMenu>
    <VNavbar title="Navigation" />
    <VNoticeBar text="Notice" />
    <VOverlay />
    <VPagination :total="2" />
    <VPopoverRoot>
      <VPopoverTrigger>Open</VPopoverTrigger>
      <VPopoverContent><VPopoverClose>Close</VPopoverClose></VPopoverContent>
    </VPopoverRoot>
    <VPopup />
    <VRadioGroup value="one"><VRadio value="one">Radio</VRadio></VRadioGroup>
    <VRate />
    <VSafeArea />
    <VSearchbar />
    <VTabs><VTab name="one" title="One">Tab</VTab></VTabs>
    <VSpace><text>Space</text></VSpace>
    <VSteps :items="steps" />
    <VSticky><view>Sticky</view></VSticky>
    <VSwipeCell><view>Swipe</view></VSwipeCell>
    <VTabbar model-value="home"><VTabbarItem name="home">Home</VTabbarItem></VTabbar>
    <VTextarea />
    <VToast />
  </view>
</template>
