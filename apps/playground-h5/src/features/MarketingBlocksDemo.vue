<script setup lang="ts">
import MarketingArticles from '../components/blocks/marketing-articles.vue'
import MarketingContact from '../components/blocks/marketing-contact.vue'
import MarketingFaq from '../components/blocks/marketing-faq.vue'
import MarketingHero from '../components/blocks/marketing-hero.vue'
import MarketingPricing from '../components/blocks/marketing-pricing.vue'
import MarketingProcess from '../components/blocks/marketing-process.vue'
import { VButton } from '../components/ui/button'
import { useMarketingBlocksDemo } from './useMarketingBlocksDemo'

const { modes, mode, setMode, loading, disabled, sourceError, available, hero, articles, openedArticle, guide, openHero, openArticle, periods, features, plans, periodId, selectedPlanId, pendingChoice, pricingError, pricingMessage, changePeriod, choosePlan, decidePlan, expandedIds, faqs, values, errors, pendingContact, receipts, contactMessage, acknowledgement, updateContact, submitContact, decideContact, cancelContact, steps, processAction, diagnostic } = useMarketingBlocksDemo()
</script>

<template>
  <main id="marketing-blocks-demo" class="mx-auto grid w-full max-w-2xl min-w-0 gap-8 p-4 text-[var(--varo-ui-text)]">
    <header class="grid gap-3">
      <h1 class="m-0 text-2xl font-semibold">
        Marketing Blocks lab
      </h1>
      <p class="m-0 text-sm">
        Local data only. Prices are illustrative, not Varo offers. No billing, email service or external navigation is connected. Accepting a request mutates this page's memory only.
      </p>
      <div class="flex flex-wrap gap-2" aria-label="Content scenarios">
        <VButton v-for="item in modes" :key="item" variant="outline" :aria-pressed="mode === item" @click="setMode(item)">
          {{ item }}
        </VButton>
      </div>
      <p data-marketing-demo="state" role="status" class="m-0 break-words text-xs">
        {{ diagnostic }}
      </p>
    </header>
    <MarketingHero :content="hero" :loading="loading" :error="sourceError" :disabled="disabled" @action="openHero" />
    <section v-if="guide" aria-label="Local guide" class="grid gap-3 rounded-lg border border-[var(--varo-ui-border)] p-4">
      <h2 class="m-0 text-lg font-semibold">
        Local guide
      </h2>
      <p class="m-0 whitespace-pre-wrap text-sm">
        {{ guide }}
      </p>
      <VButton variant="outline" @click="guide = ''">
        Close guide
      </VButton>
    </section>
    <MarketingArticles :items="articles" :loading="loading" :error="sourceError" :disabled="disabled" @open="openArticle" />
    <section v-if="openedArticle" aria-label="Article detail" class="grid gap-3 rounded-lg border border-[var(--varo-ui-border)] p-4" data-marketing-demo="article">
      <h2 class="m-0 text-lg font-semibold">
        {{ openedArticle.title }}
      </h2>
      <p class="m-0 whitespace-pre-wrap text-sm leading-relaxed">
        {{ openedArticle.body }}
      </p>
      <VButton variant="outline" @click="openedArticle = null">
        Close article
      </VButton>
    </section>
    <MarketingPricing :plans="plans" :features="features" :periods="periods" :period-id="periodId" :selected-plan-id="selectedPlanId" :loading="loading" :error="pricingMessage" :pending="!!pendingChoice" :disabled="disabled" @period-change="changePeriod" @choose="choosePlan" />
    <div v-if="pendingChoice" class="grid gap-3" aria-label="Local plan decision">
      <p class="m-0 text-sm">
        The host is holding your choice for a local decision. This does not start a subscription.
      </p>
      <VButton @click="decidePlan(true)">
        Accept local plan choice
      </VButton>
      <VButton variant="outline" @click="decidePlan(false)">
        Reject local plan choice
      </VButton>
    </div>
    <VButton v-if="pricingError" variant="outline" @click="pricingError = ''">
      Clear plan error
    </VButton>
    <MarketingFaq id-prefix="marketing-demo" :items="faqs" :expanded-ids="expandedIds" :loading="loading" :error="sourceError" :disabled="disabled" @update:expanded-ids="expandedIds = $event" />
    <MarketingContact :values="values" :can-submit="available" :errors="errors" :loading="loading" :pending="!!pendingContact" :disabled="disabled || !available" :error="contactMessage" :acknowledgement="acknowledgement" description="All fields are required. Use at least 10 message characters. A valid request awaits your explicit local accept/reject decision; no email is sent." @update:values="updateContact" @submit="submitContact" @cancel="cancelContact" />
    <div v-if="pendingContact" class="grid gap-3" aria-label="Local contact decision">
      <p class="m-0 text-sm">
        Draft pending: {{ pendingContact.name }} / {{ pendingContact.email }}
      </p>
      <VButton @click="decideContact(true)">
        Accept local contact receipt
      </VButton>
      <VButton variant="outline" @click="decideContact(false)">
        Reject local contact receipt
      </VButton>
    </div>
    <section v-if="receipts.length" aria-label="Local receipts" class="grid gap-2" data-marketing-demo="receipts">
      <h2 class="m-0 text-lg font-semibold">
        In-memory contact receipts
      </h2>
      <article v-for="(receipt, index) in receipts" :key="index" class="grid gap-1 break-words border-b border-[var(--varo-ui-border)] pb-3">
        <p class="m-0 text-sm">
          {{ receipt.name }} / {{ receipt.email }}
        </p>
        <p class="m-0 whitespace-pre-wrap text-sm">
          {{ receipt.message }}
        </p>
      </article>
    </section>
    <MarketingProcess :steps="steps" :loading="loading" :error="sourceError" :disabled="disabled" @action="processAction" />
  </main>
</template>
