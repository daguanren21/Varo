import { expect } from 'e2e'
import { test } from '../../engines/web'

test.describe('H5 B2 Activity Block', { platforms: ['h5'] }, () => {
  test.beforeEach(async ({ app, browser }) => {
    await browser.setViewport({ width: 375, height: 812 })
    await app.open('/?demo=activity')
  })
  test.afterEach(async ({ webRuntime }) => {
    const diagnostics = await webRuntime.diagnostics()
    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.console.filter(message => message.type === 'error')).toEqual([])
  })

  test('six states have distinct labels and state-appropriate actions', async ({ app, browser }) => {
    const demo = browser.locator('#activity-demo')
    await expect(demo).toContainText('Deterministic local data only.')
    for (const [title, status, label] of [
      ['Draft report', 'queued', 'Queued'],
      ['Index notes', 'running', 'Running'],
      ['Review outline', 'waiting', 'Waiting'],
      ['Export summary', 'failed', 'Failed'],
      ['Cancelled run', 'cancelled', 'Cancelled'],
      ['Completed run', 'completed', 'Completed'],
    ] as const) {
      const row = browser.locator('#activity-demo .agent-activity__item').filter({ hasText: title })
      await expect(row).toHaveAttribute('data-status', status)
      await expect(row).toContainText(label)
    }
    for (const name of ['Start Draft report', 'Cancel Draft report', 'Cancel Index notes', 'Approve Review outline', 'Retry Export summary']) {
      await expect(demo.getByRole('button', { name, exact: true })).toBeEnabled()
    }
    await expect(demo.getByRole('button', { name: 'Start Index notes', exact: true })).toHaveCount(0)
    await expect(browser.locator('[data-activity-task="cancelled"] button')).toHaveCount(0)
    await expect(browser.locator('[data-activity-task="completed"] button')).toHaveCount(0)
    await app.screenshot('h5-activity-six-states')
  })

  test('controlled start approval retry completion and cancellation follow legal sequences', async ({ app, browser }) => {
    const demo = browser.locator('#activity-demo')
    const draft = browser.locator('#activity-demo .agent-activity__item').filter({ hasText: 'Draft report' })
    const state = browser.locator('[data-activity-demo="state"]')
    await demo.getByRole('button', { name: 'Start Draft report', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'running')
    await expect(demo.getByRole('button', { name: 'Start Draft report', exact: true })).toHaveCount(0)
    await demo.getByRole('button', { name: 'Require local approval', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'waiting')
    await demo.getByRole('button', { name: 'Approve Draft report', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'running')
    await expect(demo.getByRole('button', { name: 'Approve Draft report', exact: true })).toHaveCount(0)
    await demo.getByRole('button', { name: 'Mark local failure', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'failed')
    await demo.getByRole('button', { name: 'Retry Draft report', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'queued')
    await expect(demo.getByRole('button', { name: 'Retry Draft report', exact: true })).toHaveCount(0)
    await demo.getByRole('button', { name: 'Start Draft report', exact: true }).click()
    await demo.getByRole('button', { name: 'Mark local complete', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'completed')
    await expect(draft).toContainText('Completed')
    await expect(browser.locator('[data-activity-task="draft"] button')).toHaveCount(0)
    await demo.getByRole('button', { name: 'Cancel Index notes', exact: true }).click()
    await expect(browser.locator('#activity-demo .agent-activity__item').filter({ hasText: 'Index notes' })).toHaveAttribute('data-status', 'cancelled')
    await expect(demo.getByRole('button', { name: 'Cancel Index notes', exact: true })).toHaveCount(0)
    await expect(state).toHaveText('requests=5;accepted=5;last=cancel:index')
    await app.screenshot('h5-activity-completed-and-cancelled')
  })

  test('current prop eligibility disabled items and empty activity reject unavailable actions', async ({ browser }) => {
    const demo = browser.locator('#activity-demo')
    const state = browser.locator('[data-activity-demo="state"]')
    const start = demo.getByRole('button', { name: 'Start Draft report', exact: true })
    await expect(demo.getByRole('button', { name: 'Start Restricted task', exact: true })).toBeDisabled()
    await expect(demo.getByRole('button', { name: 'Start Locked task', exact: true })).toBeDisabled()
    await demo.getByRole('button', { name: 'Restrict start', exact: true }).click()
    await expect(start).toBeDisabled()
    await demo.getByRole('button', { name: 'Allow start', exact: true }).click()
    await expect(start).toBeEnabled()
    await demo.getByRole('button', { name: 'Disable actions', exact: true }).click()
    for (const name of ['Start Draft report', 'Cancel Index notes', 'Approve Review outline', 'Retry Export summary']) {
      await expect(demo.getByRole('button', { name, exact: true })).toBeDisabled()
    }
    await expect(state).toHaveText('requests=0;accepted=0;last=none')
    await demo.getByRole('button', { name: 'Enable actions', exact: true }).click()
    await demo.getByRole('button', { name: 'Unlock task', exact: true }).click()
    await demo.getByRole('button', { name: 'Start Locked task', exact: true }).click()
    await expect(state).toHaveText('requests=1;accepted=1;last=start:locked')
    await start.click()
    await expect(state).toHaveText('requests=2;accepted=2;last=start:draft')
    await demo.getByRole('button', { name: 'Cancel Draft report', exact: true }).click()
    await expect(browser.locator('#activity-demo .agent-activity__item').filter({ hasText: 'Draft report' })).toContainText('Cancelled')
    await expect(browser.locator('[data-activity-task="draft"] button')).toHaveCount(0)
    await demo.getByRole('button', { name: 'Clear activity', exact: true }).click()
    await expect(demo).toContainText('No activity yet')
    await expect(browser.locator('[data-activity-task]')).toHaveCount(0)
    await expect(state).toHaveText('requests=3;accepted=3;last=cancel:draft')
  })

  test('application rejection never optimistically changes controlled activity', async ({ browser }) => {
    const demo = browser.locator('#activity-demo')
    const draft = browser.locator('#activity-demo .agent-activity__item').filter({ hasText: 'Draft report' })
    const state = browser.locator('[data-activity-demo="state"]')
    await demo.getByRole('button', { name: 'Reject next request', exact: true }).click()
    await demo.getByRole('button', { name: 'Start Draft report', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'queued')
    await expect(draft).toContainText('Queued')
    await expect(state).toHaveText('requests=1;accepted=0;last=rejected:start:draft')
    await demo.getByRole('button', { name: 'Start Draft report', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'running')
    await expect(state).toHaveText('requests=2;accepted=1;last=start:draft')
    await demo.getByRole('button', { name: 'Reject next request', exact: true }).click()
    await demo.getByRole('button', { name: 'Cancel Draft report', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'running')
    await expect(state).toHaveText('requests=3;accepted=1;last=rejected:cancel:draft')
    await demo.getByRole('button', { name: 'Cancel Draft report', exact: true }).click()
    await expect(draft).toHaveAttribute('data-status', 'cancelled')
    await expect(state).toHaveText('requests=4;accepted=2;last=cancel:draft')
  })
})
