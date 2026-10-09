<script setup lang="ts">
import MobileOperations from '../components/blocks/mobile-operations.vue'
import { VButton } from '../components/ui/button'
import { VSwitch } from '../components/ui/switch'
import { useOperationsDemo } from './useOperationsDemo'

const { domainNames, domain, filters, page, selectedId, loading, busy, disabled, error, invalidPage, result, preview, removal, statuses, categories, records, total, title, workspaceError, suppliedPageSize, repairLabel, needsRepair, blocked, changeDomain, handleIntent, repair, confirmRemoval, revokeApproval } = useOperationsDemo()
</script>

<template>
  <section id="operations-demo" class="mx-auto grid w-full min-w-0 max-w-2xl gap-4" aria-label="Mobile operations local demo">
    <header>
      <h1 class="m-0 text-2xl font-semibold">
        Mobile operations
      </h1><p>Six local application scenarios. All records live in memory; reload resets them. No business API, auth, deployment, agent execution or device file access is connected.</p><p class="text-sm">
        Bounded pages, not virtualization: demo 2, default 20, maximum 50 records per page.
      </p>
    </header>
    <nav class="flex flex-wrap gap-2" aria-label="Operation domains">
      <VButton v-for="name in domainNames" :key="name" variant="outline" :aria-pressed="domain === name" :disabled="domain === name" @click="changeDomain(name)">
        Domain: {{ name }}
      </VButton>
    </nav>
    <div class="grid gap-3 border-y border-[var(--varo-ui-border)] py-3" aria-label="Injected workspace states">
      <div class="flex items-center justify-between gap-3">
        <span>Loading state</span><VSwitch v-model="loading" aria-label="Loading state" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <span>Pending decision</span><VSwitch v-model="busy" aria-label="Pending decision" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <span>Disable workspace</span><VSwitch v-model="disabled" aria-label="Disable workspace" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <span>Load error</span><VSwitch v-model="error" aria-label="Load error" />
      </div>
      <div class="flex items-center justify-between gap-3">
        <span>Invalid page size (51)</span><VSwitch v-model="invalidPage" aria-label="Invalid page size (51)" />
      </div>
    </div>
    <MobileOperations :items="records" :statuses="statuses" :categories="categories" :filters="filters" :page="page" :page-size="suppliedPageSize" :total="total" :selected-id="selectedId" :title="title" :loading="loading" :busy="busy" :disabled="disabled" :error="workspaceError" @intent="handleIntent" />
    <div v-if="selectedId" class="grid gap-2" aria-label="Application-owned record controls">
      <VButton v-if="needsRepair" variant="outline" :disabled="blocked" @click="repair">
        {{ repairLabel }}
      </VButton><VButton variant="outline" :disabled="blocked" @click="revokeApproval">
        Revoke approval grant
      </VButton>
    </div>
    <div v-if="removal" class="grid gap-2 border border-[var(--varo-ui-border)] p-3" role="group" aria-label="Confirm local removal">
      <p class="m-0">
        Remove this record from demo memory? This cannot be undone without reloading.
      </p><VButton tone="danger" :disabled="blocked" @click="confirmRemoval">
        Confirm local removal
      </VButton><VButton variant="ghost" @click="removal = null">
        Keep local record
      </VButton>
    </div>
    <output class="break-words" aria-live="polite" data-operations-result>{{ result }}</output>
    <section v-if="preview" class="grid gap-2 border-t border-[var(--varo-ui-border)] pt-3" aria-label="Application text preview">
      <h2 class="m-0 text-lg font-semibold">
        In-memory text preview
      </h2><pre class="m-0 whitespace-pre-wrap break-words font-sans" data-operations-preview>{{ preview }}</pre><VButton variant="ghost" @click="preview = ''">
        Close text preview
      </VButton>
    </section>
  </section>
</template>
