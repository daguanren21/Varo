// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it, onTestFinished } from 'vitest'
import { effectScope } from 'wevu'
import { useApplicationBlocksDemo } from './blocks-lab/application/use-application-demo'
import LoginForm from './components/blocks/login-form.vue'
import OrderFilter from './components/blocks/order-filter.vue'
import ProductList from './components/blocks/product-list.vue'
import ProfileCard from './components/blocks/profile-card.vue'
import ProfileEdit from './components/blocks/profile-edit.vue'

describe('installed weapp registry blocks', () => {
  it('submits login credentials only after both fields are populated', async () => {
    const wrapper = mount(LoginForm)
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('13800138000')
    await inputs[1].setValue('secret')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      { phone: '13800138000', password: 'secret', remember: true },
    ])
  })

  it('emits profile edit and statistic actions', async () => {
    const wrapper = mount(ProfileCard, {
      props: {
        user: { name: 'Varo', fallback: 'VA' },
        stats: [{ label: 'Components', value: 56 }],
      },
    })

    const actions = wrapper.findAll('.varo-button')
    await actions.find(action => action.text() === '编辑资料')!.trigger('click')
    expect(wrapper.emitted('edit')).toHaveLength(1)
    expect(wrapper.emitted('selectStat')).toBeUndefined()
    await actions.find(action => action.text().includes('Components'))!.trigger('click')
    expect(wrapper.emitted('selectStat')?.[0]?.[0]).toMatchObject({ index: 0, stat: { value: 56 } })
  })

  it('keeps product selection and cart actions distinct', async () => {
    const item = { id: 'kit', name: 'Starter Kit', price: 9900, inventory: 3 }
    const wrapper = mount(ProductList, { props: { items: [item] } })

    await wrapper.get('button[aria-label="查看 Starter Kit"]').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ index: 0, item })
    await wrapper.findAll('.varo-button').at(-1)!.trigger('click')
    expect(wrapper.emitted('addToCart')?.[0]?.[0]).toMatchObject({ index: 0, item })
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('submits typed profile and order-filter values', async () => {
    const profile = mount(ProfileEdit, {
      props: { initialProfile: { name: 'Varo', phone: '13800138000' } },
    })
    await profile.get('form').trigger('submit')
    expect(profile.emitted('submit')?.[0]?.[0]).toMatchObject({ name: 'Varo', phone: '13800138000' })

    const filter = mount(OrderFilter, { props: { resultCount: 8 } })
    const buttons = filter.findAll('.varo-button')
    await buttons.at(-1)!.trigger('click')
    expect(filter.emitted('apply')?.[0]?.[0]).toEqual({ maxPrice: 9999, minPrice: 0, statuses: [] })
  })
})

const formInvalidations = [
  'disabled owner',
  'loading owner',
  'empty owner',
  'changed position',
  'replaced current step',
  'changed current step id',
  'disabled current step',
  'changed navigation eligibility',
  'in-place text edit',
  'in-place boolean edit',
  'equal-content value replacement',
  'added value key',
  'removed value key',
] as const

describe.each([
  { action: 'next', stepId: 'identity', position: 0 },
  { action: 'submit', stepId: 'consent', position: 1 },
] as const)('native application async $action acceptance', (request) => {
  function createDemo() {
    const scope = effectScope()
    const demo = scope.run(useApplicationBlocksDemo)!
    onTestFinished(() => { scope.stop() })
    demo.active.value = 'Form'
    demo.formPosition.value = request.position
    demo.formValues.value = { name: 'Arden', team: 'design', consent: true }
    return demo
  }

  async function expectDiscarded(invalidation: typeof formInvalidations[number], name = 'Arden') {
    const demo = createDemo()
    demo.formValues.value.name = name
    const rows = [...demo.visibleSummaries.value]
    const pending = demo.formIntent({ ...request, values: demo.formValues.value })
    expect(demo.formBusy.value).toBe(true)

    // Invalidate the exported owner before its real microtask validator resolves.
    switch (invalidation) {
      case 'disabled owner': demo.disabled.value = true; break
      case 'loading owner': demo.loading.value = true; break
      case 'empty owner': demo.empty.value = true; break
      case 'changed position': demo.formPosition.value = 1 - request.position; break
      case 'replaced current step': demo.visibleSteps.value[request.position] = { ...demo.visibleSteps.value[request.position] }; break
      case 'changed current step id': demo.visibleSteps.value[request.position].id = 'replacement'; break
      case 'disabled current step': demo.visibleSteps.value[request.position].disabled = true; break
      case 'changed navigation eligibility':
        if (request.action === 'next') { demo.visibleSteps.value.pop() }
        else { demo.visibleSteps.value.push({ id: 'extra', title: 'Additional review', fields: [] }) }
        break
      case 'in-place text edit': demo.formValues.value.name = 'Blair'; break
      case 'in-place boolean edit': demo.formValues.value.consent = false; break
      case 'equal-content value replacement': demo.formValues.value = { ...demo.formValues.value }; break
      case 'added value key': demo.formValues.value.note = 'New draft detail'; break
      case 'removed value key': delete demo.formValues.value.team; break
    }
    demo.formErrors.value = { name: 'Newer field error' }
    demo.formError.value = 'Newer form error'
    demo.formResult.value = 'Newer application result'
    const values = demo.formValues.value
    const errors = demo.formErrors.value
    const expected = {
      position: demo.formPosition.value,
      values: { ...values },
      errors: { ...errors },
      error: demo.formError.value,
      result: demo.formResult.value,
      disabled: demo.disabled.value,
      loading: demo.loading.value,
      empty: demo.empty.value,
      busy: false,
    }

    await pending

    expect({
      position: demo.formPosition.value,
      values: demo.formValues.value,
      errors: demo.formErrors.value,
      error: demo.formError.value,
      result: demo.formResult.value,
      disabled: demo.disabled.value,
      loading: demo.loading.value,
      empty: demo.empty.value,
      busy: demo.formBusy.value,
    }).toEqual(expected)
    expect(demo.formValues.value).toBe(values)
    expect(demo.formErrors.value).toBe(errors)
    // Empty hides the projection, not the ledger; reveal it to detect stale inserts.
    demo.empty.value = false
    expect(demo.visibleSummaries.value).toEqual(rows)
  }

  it.each(formInvalidations)('discards valid validation after %s', async (invalidation) => {
    await expectDiscarded(invalidation)
  })

  it.each(['in-place text edit', 'equal-content value replacement'] as const)('does not publish invalid errors after a newer draft %s', async (change) => {
    await expectDiscarded(change, '')
  })

  it('accepts an unchanged valid request and preserves its values', async () => {
    const demo = createDemo()
    const values = demo.formValues.value
    const rows = [...demo.visibleSummaries.value]
    demo.formErrors.value = { name: 'Previous field error' }
    demo.formError.value = 'Previous form error'
    const pending = demo.formIntent({ ...request, values })
    expect(demo.formBusy.value).toBe(true)

    await pending

    expect(demo.formBusy.value).toBe(false)
    expect(demo.formPosition.value).toBe(1)
    expect(demo.formValues.value).toBe(values)
    expect(demo.formValues.value).toEqual({ name: 'Arden', team: 'design', consent: true })
    expect(demo.formErrors.value).toEqual({})
    expect(demo.formError.value).toBe('')
    expect(demo.visibleSummaries.value).toEqual(request.action === 'submit'
      ? [...rows, { id: 'application-1', title: 'Arden', detail: 'Team: design; source: today' }]
      : rows)
    expect(demo.formResult.value).toBe(request.action === 'submit'
      ? 'Local application saved: Arden'
      : 'No local application submitted')
  })

  it('publishes current invalid errors without advancing or discarding the draft', async () => {
    const demo = createDemo()
    demo.formValues.value = { name: '', team: 'unknown', consent: false }
    const values = demo.formValues.value
    const rows = [...demo.visibleSummaries.value]

    await demo.formIntent({ ...request, values })

    expect(demo.formBusy.value).toBe(false)
    expect(demo.formPosition.value).toBe(request.position)
    expect(demo.formValues.value).toBe(values)
    expect(demo.formErrors.value).toEqual({
      name: 'Enter an applicant name.',
      team: 'Choose a team.',
      ...(request.action === 'submit' ? { consent: 'Consent is required for local processing.' } : {}),
    })
    expect(demo.formError.value).toBe('Correct the highlighted fields; your values are preserved.')
    expect(demo.visibleSummaries.value).toEqual(rows)
    expect(demo.formResult.value).toBe('No local application submitted')
  })

  it('checks duplicate names against rows added while validation is pending', async () => {
    const demo = createDemo()
    const values = demo.formValues.value
    const pending = demo.formIntent({ ...request, values })
    expect(demo.formBusy.value).toBe(true)
    demo.importName.value = 'arden'
    demo.timelineIntent({ action: 'retry', id: 'import' })
    const rows = [...demo.visibleSummaries.value]
    expect(rows).toHaveLength(2)

    await pending

    expect(demo.formBusy.value).toBe(false)
    expect(demo.formPosition.value).toBe(request.position)
    expect(demo.formValues.value).toBe(values)
    expect(demo.formErrors.value).toEqual({})
    expect(demo.formError.value).toBe('This name is reserved or already exists in the local application list.')
    expect(demo.visibleSummaries.value).toEqual(rows)
    expect(demo.formResult.value).toBe('No local application submitted')
  })
})
