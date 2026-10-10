<script setup lang="ts">
import MarketingArticles from '../../components/blocks/marketing-articles.vue'
import MarketingContact from '../../components/blocks/marketing-contact.vue'
import MarketingFaq from '../../components/blocks/marketing-faq.vue'
import MarketingHero from '../../components/blocks/marketing-hero.vue'
import MarketingPricing from '../../components/blocks/marketing-pricing.vue'
import MarketingProcess from '../../components/blocks/marketing-process.vue'
import VButton from '../../components/ui/v-button.vue'
import { useMarketingBlocksDemo } from './useMarketingBlocksDemo'

const { modes, mode, setMode, loading, disabled, sourceError, available, hero, articles, openedArticle, guide, openHero, openArticle, periods, features, plans, periodId, selectedPlanId, pendingChoice, pricingError, pricingMessage, changePeriod, choosePlan, decidePlan, expandedIds, faqs, values, errors, pendingContact, receipts, contactMessage, acknowledgement, updateContact, submitContact, decideContact, cancelContact, steps, processAction, diagnostic } = useMarketingBlocksDemo()
</script>

<template>
  <view class="box-border grid min-h-screen min-w-0 gap-8 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+80px)] text-[var(--varo-ui-text)]" aria-label="Marketing Blocks lab">
    <view class="grid gap-3">
      <text class="text-2xl font-semibold">
        Marketing Blocks lab
      </text>
      <text class="text-sm">
        Local data only. Prices are illustrative, not Varo offers. No billing, email service or external navigation is connected. Accepting a request mutates this page's memory only.
      </text>
      <view class="flex flex-wrap gap-2" aria-label="Content scenarios">
        <VButton v-for="item in modes" :key="item" variant="outline" :aria-pressed="mode === item" @click="setMode(item)">
          {{ item }}
        </VButton>
      </view>
      <text data-marketing-demo="state" role="status" class="break-words text-xs">
        {{ diagnostic }}
      </text>
    </view>
    <MarketingHero :content="hero" :loading="loading" :error="sourceError" :disabled="disabled" @action="openHero" />
    <view v-if="guide" aria-label="Local guide" class="grid gap-3 rounded-lg border border-[var(--varo-ui-border)] p-4">
      <text class="text-lg font-semibold">
        Local guide
      </text>
      <text class="whitespace-pre-wrap text-sm">
        {{ guide }}
      </text>
      <VButton variant="outline" @click="guide = ''">
        Close guide
      </VButton>
    </view>
    <MarketingArticles :items="articles" :loading="loading" :error="sourceError" :disabled="disabled" @open="openArticle" />
    <view v-if="openedArticle" aria-label="Article detail" class="grid gap-3 rounded-lg border border-[var(--varo-ui-border)] p-4" data-marketing-demo="article">
      <text class="text-lg font-semibold">
        {{ openedArticle.title }}
      </text>
      <text class="whitespace-pre-wrap text-sm leading-relaxed">
        {{ openedArticle.body }}
      </text>
      <VButton variant="outline" @click="openedArticle = null">
        Close article
      </VButton>
    </view>
    <MarketingPricing :plans="plans" :features="features" :periods="periods" :period-id="periodId" :selected-plan-id="selectedPlanId" :loading="loading" :error="pricingMessage" :pending="!!pendingChoice" :disabled="disabled" @period-change="changePeriod" @choose="choosePlan" />
    <view v-if="pendingChoice" class="grid gap-3" aria-label="Local plan decision">
      <text class="text-sm">
        The host is holding your choice for a local decision. This does not start a subscription.
      </text>
      <VButton @click="decidePlan(true)">
        Accept local plan choice
      </VButton>
      <VButton variant="outline" @click="decidePlan(false)">
        Reject local plan choice
      </VButton>
    </view>
    <VButton v-if="pricingError" variant="outline" @click="pricingError = ''">
      Clear plan error
    </VButton>
    <MarketingFaq id-prefix="marketing-demo" :items="faqs" :expanded-ids="expandedIds" :loading="loading" :error="sourceError" :disabled="disabled" @update:expandedIds="expandedIds = $event" />
    <MarketingContact :values="values" :can-submit="available" :errors="errors" :loading="loading" :pending="!!pendingContact" :disabled="disabled || !available" :error="contactMessage" :acknowledgement="acknowledgement" description="All fields are required. Use at least 10 message characters. A valid request awaits your explicit local accept/reject decision; no email is sent." @update:values="updateContact" @submit="submitContact" @cancel="cancelContact" />
    <view v-if="pendingContact" class="grid gap-3" aria-label="Local contact decision">
      <text class="text-sm">
        Draft pending: {{ pendingContact.name }} / {{ pendingContact.email }}
      </text>
      <VButton @click="decideContact(true)">
        Accept local contact receipt
      </VButton>
      <VButton variant="outline" @click="decideContact(false)">
        Reject local contact receipt
      </VButton>
    </view>
    <view v-if="receipts.length" aria-label="Local receipts" class="grid gap-2" data-marketing-demo="receipts">
      <text class="text-lg font-semibold">
        In-memory contact receipts
      </text>
      <view v-for="(receipt, index) in receipts" :key="index" class="grid gap-1 break-words border-b border-[var(--varo-ui-border)] pb-3">
        <text class="text-sm">
          {{ receipt.name }} / {{ receipt.email }}
        </text>
        <text class="whitespace-pre-wrap text-sm">
          {{ receipt.message }}
        </text>
      </view>
    </view>
    <MarketingProcess :steps="steps" :loading="loading" :error="sourceError" :disabled="disabled" @action="processAction" />
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Marketing Blocks",
  "usingComponents": {}
}
</json>
