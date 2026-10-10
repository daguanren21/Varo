import { expect } from 'e2e'
import { classXPath, expectRoute, nativePlatforms, test } from './fixtures'

const stateXPath = '//*[@data-activity-demo="state"]'
const activityXPath = classXPath('agent-activity__item')

test.describe('native B2 Activity Block', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/pages/agent-activity-demo/index')
    await expectRoute(miniProgram, '/pages/agent-activity-demo/index')
    await expect(miniProgram.locator(stateXPath)).toHaveText('requests=0;accepted=0;last=none')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('six states have distinct labels and state-appropriate actions', async ({ miniProgram, screen }) => {
    for (const [title, status, label] of [
      ['Draft report', 'queued', 'Queued'],
      ['Index notes', 'running', 'Running'],
      ['Review outline', 'waiting', 'Waiting'],
      ['Export summary', 'failed', 'Failed'],
      ['Cancelled run', 'cancelled', 'Cancelled'],
      ['Completed run', 'completed', 'Completed'],
    ] as const) {
      const row = miniProgram.locator(activityXPath).filter({ hasText: title })
      await expect(row).toHaveAttribute('data-status', status)
      await expect(row).toContainText(label)
    }
    for (const name of ['Start Draft report', 'Cancel Draft report', 'Cancel Index notes', 'Approve Review outline', 'Retry Export summary']) {
      await expect(screen.getByRole('button', { name, exact: true })).toBeEnabled()
    }
    await expect(screen.getByRole('button', { name: 'Start Index notes', exact: true })).toHaveCount(0)
    await expect(miniProgram.locator('//*[@data-activity-task="cancelled"]//button')).toHaveCount(0)
    await expect(miniProgram.locator('//*[@data-activity-task="completed"]//button')).toHaveCount(0)
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('activity-six-states') }
  })

  test('controlled start approval retry completion and cancellation follow legal sequences', async ({ miniProgram, screen }) => {
    const draft = miniProgram.locator(activityXPath).filter({ hasText: 'Draft report' })
    const state = miniProgram.locator(stateXPath)
    await screen.getByRole('button', { name: 'Start Draft report', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'running')
    await expect(screen.getByRole('button', { name: 'Start Draft report', exact: true })).toHaveCount(0)
    await screen.getByRole('button', { name: 'Require local approval', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'waiting')
    await screen.getByRole('button', { name: 'Approve Draft report', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'running')
    await expect(screen.getByRole('button', { name: 'Approve Draft report', exact: true })).toHaveCount(0)
    await screen.getByRole('button', { name: 'Mark local failure', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'failed')
    await screen.getByRole('button', { name: 'Retry Draft report', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'queued')
    await expect(screen.getByRole('button', { name: 'Retry Draft report', exact: true })).toHaveCount(0)
    await screen.getByRole('button', { name: 'Start Draft report', exact: true }).tap()
    await screen.getByRole('button', { name: 'Mark local complete', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'completed')
    await expect(draft).toContainText('Completed')
    await expect(miniProgram.locator('//*[@data-activity-task="draft"]//button')).toHaveCount(0)
    await screen.getByRole('button', { name: 'Cancel Index notes', exact: true }).tap()
    await expect(miniProgram.locator(activityXPath).filter({ hasText: 'Index notes' })).toHaveAttribute('data-status', 'cancelled')
    await expect(screen.getByRole('button', { name: 'Cancel Index notes', exact: true })).toHaveCount(0)
    await expect(state).toHaveText('requests=5;accepted=5;last=cancel:index')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('activity-completed-and-cancelled') }
  })

  test('current prop eligibility disabled items and empty activity reject unavailable actions', async ({ miniProgram, screen }) => {
    const state = miniProgram.locator(stateXPath)
    const start = screen.getByRole('button', { name: 'Start Draft report', exact: true })
    await expect(screen.getByRole('button', { name: 'Start Restricted task', exact: true })).toBeDisabled()
    await expect(screen.getByRole('button', { name: 'Start Locked task', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Restrict start', exact: true }).tap()
    await expect(start).toBeDisabled()
    await screen.getByRole('button', { name: 'Allow start', exact: true }).tap()
    await expect(start).toBeEnabled()
    await screen.getByRole('button', { name: 'Disable actions', exact: true }).tap()
    for (const name of ['Start Draft report', 'Cancel Index notes', 'Approve Review outline', 'Retry Export summary']) {
      await expect(screen.getByRole('button', { name, exact: true })).toBeDisabled()
    }
    await expect(state).toHaveText('requests=0;accepted=0;last=none')
    await screen.getByRole('button', { name: 'Enable actions', exact: true }).tap()
    await screen.getByRole('button', { name: 'Unlock task', exact: true }).tap()
    await screen.getByRole('button', { name: 'Start Locked task', exact: true }).tap()
    await expect(state).toHaveText('requests=1;accepted=1;last=start:locked')
    await start.tap()
    await expect(state).toHaveText('requests=2;accepted=2;last=start:draft')
    await screen.getByRole('button', { name: 'Cancel Draft report', exact: true }).tap()
    await expect(miniProgram.locator(activityXPath).filter({ hasText: 'Draft report' })).toContainText('Cancelled')
    await expect(miniProgram.locator('//*[@data-activity-task="draft"]//button')).toHaveCount(0)
    await screen.getByRole('button', { name: 'Clear activity', exact: true }).tap()
    await expect(screen.getByRole('status')).toContainText('No activity yet')
    await expect(miniProgram.locator('//*[@data-activity-task]')).toHaveCount(0)
    await expect(state).toHaveText('requests=3;accepted=3;last=cancel:draft')
  })

  test('application rejection never optimistically changes controlled activity', async ({ miniProgram, screen }) => {
    const draft = miniProgram.locator(activityXPath).filter({ hasText: 'Draft report' })
    const state = miniProgram.locator(stateXPath)
    await screen.getByRole('button', { name: 'Reject next request', exact: true }).tap()
    await screen.getByRole('button', { name: 'Start Draft report', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'queued')
    await expect(draft).toContainText('Queued')
    await expect(state).toHaveText('requests=1;accepted=0;last=rejected:start:draft')
    await screen.getByRole('button', { name: 'Start Draft report', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'running')
    await expect(state).toHaveText('requests=2;accepted=1;last=start:draft')
    await screen.getByRole('button', { name: 'Reject next request', exact: true }).tap()
    await screen.getByRole('button', { name: 'Cancel Draft report', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'running')
    await expect(state).toHaveText('requests=3;accepted=1;last=rejected:cancel:draft')
    await screen.getByRole('button', { name: 'Cancel Draft report', exact: true }).tap()
    await expect(draft).toHaveAttribute('data-status', 'cancelled')
    await expect(state).toHaveText('requests=4;accepted=2;last=cancel:draft')
  })
})
