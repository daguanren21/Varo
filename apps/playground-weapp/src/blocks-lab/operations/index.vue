<script setup lang="ts">
import MobileOperations from '../../components/blocks/mobile-operations.vue'
import VButton from '../../components/ui/v-button.vue'
import VSwitch from '../../components/ui/v-switch.vue'
import { useOperationsDemo } from './use-operations-demo'

const { domainNames, domain, filters, page, selectedId, loading, busy, disabled, error, invalidPage, result, preview, removal, statuses, categories, records, total, title, workspaceError, suppliedPageSize, repairLabel, needsRepair, blocked, changeDomain, handleIntent, repair, confirmRemoval, revokeApproval } = useOperationsDemo()
</script>

<template>
  <view id="operations-demo" class="grid min-w-0 gap-4 bg-[var(--varo-ui-bg)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" aria-label="Mobile operations local demo">
    <view class="grid gap-3">
      <text class="block text-2xl font-semibold">
        Mobile operations
      </text><text class="block">
        Six local application scenarios. All records live in memory; reload resets them. No business API, auth, deployment, agent execution or device file access is connected.
      </text><text class="block text-sm">
        Bounded pages, not virtualization: demo 2, default 20, maximum 50 records per page.
      </text>
    </view>
    <view class="flex flex-wrap gap-2" aria-label="Operation domains">
      <VButton v-for="name in domainNames" :key="name" variant="outline" :aria-pressed="domain === name" :disabled="domain === name" @click="changeDomain(name)">
        Domain: {{ name }}
      </VButton>
    </view>
    <view class="grid gap-3 border-y border-[var(--varo-ui-border)] py-3" aria-label="Injected workspace states">
      <view class="flex items-center justify-between gap-3">
        <text>Loading state</text><VSwitch v-model="loading" aria-label="Loading state" />
      </view>
      <view class="flex items-center justify-between gap-3">
        <text>Pending decision</text><VSwitch v-model="busy" aria-label="Pending decision" />
      </view>
      <view class="flex items-center justify-between gap-3">
        <text>Disable workspace</text><VSwitch v-model="disabled" aria-label="Disable workspace" />
      </view>
      <view class="flex items-center justify-between gap-3">
        <text>Load error</text><VSwitch v-model="error" aria-label="Load error" />
      </view>
      <view class="flex items-center justify-between gap-3">
        <text>Invalid page size (51)</text><VSwitch v-model="invalidPage" aria-label="Invalid page size (51)" />
      </view>
    </view>
    <MobileOperations :items="records" :statuses="statuses" :categories="categories" :filters="filters" :page="page" :page-size="suppliedPageSize" :total="total" :selected-id="selectedId" :title="title" :loading="loading" :busy="busy" :disabled="disabled" :error="workspaceError" @intent="handleIntent" />
    <view v-if="selectedId" class="grid gap-2" aria-label="Application-owned record controls">
      <VButton v-if="needsRepair" variant="outline" :disabled="blocked" @click="repair">
        {{ repairLabel }}
      </VButton><VButton variant="outline" :disabled="blocked" @click="revokeApproval">
        Revoke approval grant
      </VButton>
    </view>
    <view v-if="removal" class="grid gap-2 border border-[var(--varo-ui-border)] p-3" role="group" aria-label="Confirm local removal">
      <text>Remove this record from demo memory? This cannot be undone without reloading.</text><VButton tone="danger" :disabled="blocked" @click="confirmRemoval">
        Confirm local removal
      </VButton><VButton variant="ghost" @click="removal = null">
        Keep local record
      </VButton>
    </view>
    <text class="block break-words" aria-live="polite" data-operations-result="true">
      {{ result }}
    </text>
    <view v-if="preview" class="grid gap-2 border-t border-[var(--varo-ui-border)] pt-3" aria-label="Application text preview">
      <text class="block text-lg font-semibold">
        In-memory text preview
      </text><text class="block whitespace-pre-wrap break-words" data-operations-preview="true">
        {{ preview }}
      </text><VButton variant="ghost" @click="preview = ''">
        Close text preview
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "navigationBarTitleText": "Mobile operations" }
</json>
