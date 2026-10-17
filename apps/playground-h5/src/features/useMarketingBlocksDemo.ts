import type { MarketingArticle } from '../components/blocks/marketing-articles.types'
import type { MarketingContactErrors, MarketingContactValues } from '../components/blocks/marketing-contact.types'
import type { MarketingFaqItem } from '../components/blocks/marketing-faq.types'
import type { MarketingHeroAction, MarketingHeroContent } from '../components/blocks/marketing-hero.types'
import type { MarketingPricingChoice, MarketingPricingFeature, MarketingPricingPeriod, MarketingPricingPlan } from '../components/blocks/marketing-pricing.types'
import type { MarketingProcessStep } from '../components/blocks/marketing-process.types'
import { computed, shallowRef } from 'vue'
import sourceFlow from './marketing-source-flow.svg'

export function useMarketingBlocksDemo() {
  const modes = ['Ready', 'Loading', 'Empty', 'Error', 'Disabled', 'Long content'] as const
  type Mode = typeof modes[number]
  const mode = shallowRef<Mode>('Ready')
  const loading = computed(() => mode.value === 'Loading')
  const disabled = computed(() => mode.value === 'Disabled')
  const sourceError = computed(() => mode.value === 'Error' ? 'Local content is unavailable. Choose Ready to restore it.' : '')
  const available = computed(() => !loading.value && !disabled.value && !sourceError.value && mode.value !== 'Empty')
  const longCopy = 'Keep ownership visible: editable source stays in your application, while navigation, validation, permissions and delivery remain with the host. Long text should wrap without hiding the decision or requiring a hover gesture. '
  const image = { src: sourceFlow, alt: 'Varo source flows from Registry into an H5 application and a native application.' }
  const hero = computed<MarketingHeroContent | null>(() => mode.value === 'Empty'
    ? null
    : ({
        eyebrow: 'VARO / EDITABLE MOBILE INTERFACES',
        title: 'Build the interface. Keep the source.',
        description: `Start with a portable page slice, then connect your own data and decisions.${mode.value === 'Long content' ? ` ${longCopy.repeat(3)}` : ''}`,
        image,
        actions: [
          { id: 'guide', label: 'Explore the local guide', allowed: true, description: 'Opens instructions on this page. No external navigation.' },
          { id: 'purchase', label: 'Purchase service', allowed: false, description: 'No paid service is connected.' },
        ],
      }))
  const journal = [
    { id: 'source', title: 'A source-first workflow', summary: 'Choose one block, install its dependencies and keep edits in your own tree.', body: 'Start with a target-specific Registry install. Review the files in src/components/blocks and their typed inputs. Your application supplies records and handles emitted intents. Source ownership means those edits stay with your project.', canOpen: true },
    { id: 'native', title: 'Native actions belong to the host', summary: 'An action ID is not a browser URL. Decide how it maps to your mini-program.', body: 'A native host can map an action ID to wx.navigateTo for a registered page, a permitted clipboard operation, or an in-page panel. Validate the target and host permission before executing it. The block does not call window.location or claim that a page opened.', canOpen: true },
    { id: 'draft', title: 'Unpublished field notes', summary: 'This draft is visible as a card but is not available to open.', body: '', canOpen: false },
    { id: 'states', title: 'Design beyond the happy path', summary: 'Preserve evidence while loading, reject unavailable actions and keep exits usable.', body: 'A pending action does not prove completion. Keep the previous content visible and make the host decision explicit. Empty collections need a useful message. A rejected contact request must preserve the draft and must not claim external delivery.', canOpen: true },
  ]
  const articles = computed<MarketingArticle[]>(() => mode.value === 'Empty'
    ? []
    : journal.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary + (mode.value === 'Long content' ? ` ${longCopy.repeat(3)}` : ''),
        category: 'Varo notes',
        readingTime: '2 min read',
        canOpen: item.canOpen,
        image,
      })))
  const openedArticle = shallowRef<{ title: string, body: string } | null>(null)
  const guide = shallowRef('')
  const hostRequests = shallowRef(0)
  function openHero(action: MarketingHeroAction) {
    const current = hero.value?.actions.find(item => item.id === action.id)
    if (!available.value || !current?.allowed || current.disabled) { return }
    hostRequests.value += 1
    guide.value = 'Choose your deployment target, install one Registry block, then bind application-owned data and typed events. This local guide does not install packages or navigate to another application.'
  }
  function openArticle(article: MarketingArticle) {
    const current = journal.find(item => item.id === article.id)
    if (!available.value || !current?.canOpen) { return }
    openedArticle.value = { title: current.title, body: current.body }
  }
  const periods: MarketingPricingPeriod[] = [{ id: 'month', label: 'Monthly' }, { id: 'year', label: 'Yearly' }, { id: 'legacy', label: 'Legacy period', disabled: true }]
  const features: MarketingPricingFeature[] = [{ id: 'source', label: 'Editable source' }, { id: 'review', label: 'Review responsibility' }]
  const plans = computed<MarketingPricingPlan[]>(() => mode.value === 'Empty'
    ? []
    : [
        { id: 'self', name: 'Self-guided example', description: 'Illustrative local plan, not a Varo commercial offer.', prices: { month: '$0 / month', year: '$0 / year' }, features: { source: 'Included', review: 'Your application team' }, canChoose: true },
        { id: 'team', name: 'Team example', description: `Illustrative comparison only; choosing records a local preference.${mode.value === 'Long content' ? ` ${longCopy}` : ''}`, prices: { month: '$20 / month', year: '$240 / year' }, features: { source: 'Included', review: 'A review session described by your application; no service is purchased here.' }, canChoose: true },
        { id: 'closed', name: 'Unavailable example', description: 'This application has not granted selection.', prices: { month: 'Not offered', year: 'Not offered' }, features: { source: 'Not specified', review: 'Not available' }, canChoose: false },
      ])
  const periodId = shallowRef('month')
  const selectedPlanId = shallowRef('')
  const pendingChoice = shallowRef<MarketingPricingChoice | null>(null)
  const pricingError = shallowRef('')
  const pricingMessage = computed(() => sourceError.value || pricingError.value)
  function changePeriod(id: string) {
    const period = periods.find(item => item.id === id)
    if (!available.value || pendingChoice.value || !period || period.disabled || periodId.value === id) { return }
    periodId.value = id
    selectedPlanId.value = ''
  }
  function choosePlan(choice: MarketingPricingChoice) {
    const plan = plans.value.find(item => item.id === choice.planId)
    if (!available.value || pendingChoice.value || !plan?.canChoose || plan.disabled || choice.periodId !== periodId.value || !plan.prices[choice.periodId] || selectedPlanId.value === plan.id) { return }
    pendingChoice.value = { ...choice }
    pricingError.value = ''
  }
  function decidePlan(accept: boolean) {
    const choice = pendingChoice.value
    if (!choice) { return }
    const plan = plans.value.find(item => item.id === choice.planId)
    if (accept && available.value && plan?.canChoose && !plan.disabled && choice.periodId === periodId.value) {
      selectedPlanId.value = choice.planId
      pricingError.value = ''
    }
    else { pricingError.value = 'Local plan choice rejected. No charge was made. Clear the error to choose again.' }
    pendingChoice.value = null
  }
  const expandedIds = shallowRef<string[]>([])
  const faqs = computed<MarketingFaqItem[]>(() => mode.value === 'Empty'
    ? []
    : [
        { id: 'ownership', question: 'Who owns the application decisions?', answer: `Your application owns data, permissions, navigation and persistence. Blocks render the current state and emit guarded requests. ${longCopy.repeat(mode.value === 'Long content' ? 6 : 2)}` },
        { id: 'delivery', question: 'Does this form send an email?', answer: 'No. This demonstration validates your input and saves a receipt only in page memory after you explicitly accept it. Reloading clears every receipt.' },
        { id: 'restricted', question: 'Restricted question', answer: 'This item is disabled by its host.', disabled: true },
      ])
  const values = shallowRef<MarketingContactValues>({ name: '', email: '', message: '' })
  const errors = shallowRef<MarketingContactErrors>({})
  const pendingContact = shallowRef<MarketingContactValues | null>(null)
  const receipts = shallowRef<MarketingContactValues[]>([])
  const contactError = shallowRef('')
  const contactMessage = computed(() => sourceError.value || contactError.value)
  const acknowledgement = shallowRef('')
  function updateContact(next: MarketingContactValues) {
    if (!available.value || pendingContact.value) { return }
    values.value = next
    errors.value = {}
    contactError.value = ''
    acknowledgement.value = ''
  }
  function submitContact(draft: MarketingContactValues) {
    if (!available.value || pendingContact.value) { return }
    const nextErrors: MarketingContactErrors = {}
    if (!draft.name.trim()) { nextErrors.name = 'Enter your name.' }
    if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(draft.email.trim())) { nextErrors.email = 'Enter a valid email address.' }
    if (draft.message.trim().length < 10) { nextErrors.message = 'Write at least 10 characters.' }
    errors.value = nextErrors
    acknowledgement.value = ''
    contactError.value = ''
    if (Object.keys(nextErrors).length) { return }
    pendingContact.value = { name: draft.name.trim(), email: draft.email.trim(), message: draft.message.trim() }
  }
  function decideContact(accept: boolean) {
    const draft = pendingContact.value
    if (!draft) { return }
    if (accept && available.value) {
      receipts.value = [...receipts.value, draft]
      acknowledgement.value = `Local receipt ${receipts.value.length} saved for ${draft.name}. No email was sent; this page keeps the receipt only until reload.`
    }
    else { contactError.value = 'Local request rejected. Your draft is preserved; no email was sent.' }
    pendingContact.value = null
  }
  function cancelContact() {
    pendingContact.value = null
    contactError.value = 'Local request cancelled. Your draft is preserved.'
  }
  const processPosition = shallowRef(0)
  const steps = computed<MarketingProcessStep[]>(() => mode.value === 'Empty'
    ? []
    : [
        { id: 'inspect', title: 'Explore the source workflow', description: 'Open the guide to inspect the local workflow. Completion here means only that you opened these instructions.', state: processPosition.value > 0 ? 'completed' : 'active', action: { label: 'Open workflow instructions', allowed: processPosition.value === 0 } },
        { id: 'contact', title: 'Review the contact boundary', description: `Read how local acknowledgement differs from external delivery.${mode.value === 'Long content' ? ` ${longCopy.repeat(3)}` : ''}`, state: processPosition.value > 1 ? 'completed' : processPosition.value === 1 ? 'active' : 'upcoming', action: { label: 'Open contact instructions', allowed: processPosition.value === 1 } },
      ])
  function processAction(step: MarketingProcessStep) {
    const current = steps.value.find(item => item.id === step.id)
    if (!available.value || !current?.action?.allowed) { return }
    guide.value = step.id === 'inspect'
      ? 'Inspect the installed source, bind your data and handle typed requests. Opening these instructions completes only this local exploration step; it does not install or publish anything.'
      : 'The contact form below validates locally. Submit a valid draft, then explicitly accept or reject it. An accepted receipt is stored only in page memory; there is no email transport.'
    processPosition.value += 1
  }
  const diagnostic = computed(() => `host=${hostRequests.value};plan=${selectedPlanId.value || 'none'};period=${periodId.value};receipts=${receipts.value.length};steps=${processPosition.value}`)
  function setMode(next: Mode) { mode.value = next }
  return { modes, mode, setMode, loading, disabled, sourceError, available, hero, articles, openedArticle, guide, openHero, openArticle, periods, features, plans, periodId, selectedPlanId, pendingChoice, pricingError, pricingMessage, changePeriod, choosePlan, decidePlan, expandedIds, faqs, values, errors, pendingContact, receipts, contactMessage, acknowledgement, updateContact, submitContact, decideContact, cancelContact, steps, processAction, diagnostic }
}
