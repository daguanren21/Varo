import { expect } from 'e2e'
import { expectRoute, nativePlatforms, test } from './fixtures'

const stateXPath = '//*[@data-marketing-demo="state"]'
const demoXPath = '//*[@aria-label="Marketing Blocks lab"]'

test.describe('native B4 Marketing Blocks', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/blocks-lab/marketing/index')
    await expectRoute(miniProgram, '/blocks-lab/marketing/index')
    await expect(miniProgram.locator(stateXPath)).toHaveText('host=0;plan=none;period=month;receipts=0;steps=0')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  test('hero grants open a real local guide and reject unavailable actions', async ({ miniProgram, screen }) => {
    await expect(screen.getByRole('button', { name: 'Purchase service', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Explore the local guide', exact: true }).tap()
    await expect(miniProgram.locator('//*[@aria-label="Local guide"]')).toContainText('bind application-owned data and typed events')
    await expect(miniProgram.locator(stateXPath)).toContainText('host=1;')
    await screen.getByRole('button', { name: 'Disabled', exact: true }).tap()
    await expect(screen.getByRole('button', { name: 'Explore the local guide', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Close guide', exact: true }).tap()
    await expect(miniProgram.locator('//*[@aria-label="Local guide"]')).toHaveCount(0)
    await expect(miniProgram.locator(stateXPath)).toContainText('host=1;')
    await expectRoute(miniProgram, '/blocks-lab/marketing/index')
  })

  test('articles paginate without truncation and open eligible current details', async ({ miniProgram, screen }) => {
    await expect(miniProgram.locator('//*[@data-article]')).toHaveCount(3)
    await expect(screen.getByRole('button', { name: 'Previous articles', exact: true })).toBeDisabled()
    await expect(screen.getByRole('button', { name: 'Read Unpublished field notes', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Read A source-first workflow', exact: true }).tap()
    await expect(miniProgram.locator('//*[@data-marketing-demo="article"]')).toContainText('Your application supplies records and handles emitted intents.')
    await screen.getByRole('button', { name: 'Close article', exact: true }).tap()
    await screen.getByRole('button', { name: 'Next articles', exact: true }).tap()
    await expect(miniProgram.locator('//*[@data-article]')).toHaveCount(1)
    await expect(screen.getByRole('button', { name: 'Next articles', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Read Design beyond the happy path', exact: true }).tap()
    await expect(miniProgram.locator('//*[@data-marketing-demo="article"]')).toContainText('must not claim external delivery')
    await screen.getByRole('button', { name: 'Loading', exact: true }).tap()
    await expect(screen.getByRole('button', { name: 'Read Design beyond the happy path', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Close article', exact: true }).tap()
    await expect(miniProgram.locator('//*[@data-marketing-demo="article"]')).toHaveCount(0)
  })

  test('plan selection waits for host acceptance and preserves rejection evidence', async ({ miniProgram, screen }) => {
    const state = miniProgram.locator(stateXPath)
    await expect(screen.getByRole('button', { name: 'Choose Unavailable example', exact: true })).toBeDisabled()
    await expect(screen.getByRole('button', { name: 'Legacy period', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Yearly', exact: true }).tap()
    await expect(miniProgram.locator('//*[@data-plan="team"]')).toContainText('$240 / year')
    await expect(miniProgram.locator('//*[@data-plan="team"]')).toContainText('Review responsibility')
    await screen.getByRole('button', { name: 'Choose Team example', exact: true }).tap()
    await expect(state).toContainText('plan=none;period=year;')
    await expect(screen.getByRole('button', { name: 'Monthly', exact: true })).toBeDisabled()
    await expect(screen.getByRole('button', { name: 'Choose Self-guided example', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Reject local plan choice', exact: true }).tap()
    await expect(miniProgram.locator(demoXPath)).toContainText('Local plan choice rejected. No charge was made.')
    await expect(state).toContainText('plan=none;')
    await screen.getByRole('button', { name: 'Clear plan error', exact: true }).tap()
    await screen.getByRole('button', { name: 'Choose Team example', exact: true }).tap()
    await screen.getByRole('button', { name: 'Accept local plan choice', exact: true }).tap()
    await expect(state).toContainText('plan=team;period=year;')
    await expect(miniProgram.locator('//*[@data-plan="team"]')).toContainText('Selected')
    await expect(screen.getByRole('button', { name: 'Choose Team example', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Monthly', exact: true }).tap()
    await expect(state).toContainText('plan=none;period=month;')
  })

  test('FAQ supports native tap disclosure stable IDs and long answers', async ({ miniProgram, screen }) => {
    const expandName = 'Who owns the application decisions? — Expand answer'
    const collapseName = 'Who owns the application decisions? — Collapse answer'
    await expect(screen.getByRole('button', { name: expandName, exact: true })).toHaveAttribute('aria-pressed', 'false')
    await expect(screen.getByRole('button', { name: 'Restricted question — Expand answer', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: expandName, exact: true }).tap()
    await expect(screen.getByRole('button', { name: collapseName, exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(miniProgram.locator('//*[@id="marketing-demo-answer-ownership"]')).toContainText('Your application owns data, permissions, navigation and persistence.')
    await screen.getByRole('button', { name: 'Long content', exact: true }).tap()
    await expect(miniProgram.locator('//*[@id="marketing-demo-answer-ownership"]')).toContainText('requiring a hover gesture.')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('native-marketing-long-content') }
    await screen.getByRole('button', { name: collapseName, exact: true }).tap()
    await expect(miniProgram.locator('//*[@id="marketing-demo-answer-ownership"]')).toHaveCount(0)
  })

  test('contact validates actual input and saves only explicitly accepted local receipts', async ({ miniProgram, screen }) => {
    const state = miniProgram.locator(stateXPath)
    const demo = miniProgram.locator(demoXPath)
    await screen.getByRole('button', { name: 'Submit contact request', exact: true }).tap()
    await expect(demo).toContainText('Enter your name.')
    await expect(demo).toContainText('Enter a valid email address.')
    await expect(demo).toContainText('Write at least 10 characters.')
    await screen.getByLabel('Name', { exact: true }).fill('Varo Reader')
    await screen.getByLabel('Email', { exact: true }).fill('invalid-address')
    await screen.getByLabel('Message', { exact: true }).fill('Please explain native source ownership.')
    await screen.getByRole('button', { name: 'Submit contact request', exact: true }).tap()
    await expect(demo).toContainText('Enter a valid email address.')
    await expect(state).toContainText('receipts=0;')
    await screen.getByLabel('Email', { exact: true }).fill('reader@example.com')
    await screen.getByRole('button', { name: 'Submit contact request', exact: true }).tap()
    await expect(screen.getByLabel('Name', { exact: true })).toBeDisabled()
    await expect(screen.getByRole('button', { name: 'Awaiting acknowledgement…', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Reject local contact receipt', exact: true }).tap()
    await expect(demo).toContainText('Local request rejected. Your draft is preserved; no email was sent.')
    await expect(screen.getByLabel('Message', { exact: true })).toHaveValue('Please explain native source ownership.')
    await screen.getByRole('button', { name: 'Submit contact request', exact: true }).tap()
    await screen.getByRole('button', { name: 'Cancel request', exact: true }).tap()
    await expect(state).toContainText('receipts=0;')
    await screen.getByRole('button', { name: 'Submit contact request', exact: true }).tap()
    await screen.getByRole('button', { name: 'Accept local contact receipt', exact: true }).tap()
    await expect(state).toContainText('receipts=1;')
    await expect(demo).toContainText('Local receipt 1 saved for Varo Reader. No email was sent;')
    await expect(miniProgram.locator('//*[@data-marketing-demo="receipts"]')).toContainText('Please explain native source ownership.')
    if (miniProgram.mode === 'devtools') { await miniProgram.screenshot('native-marketing-local-receipt') }
  })

  test('process actions advance only the local instruction exploration', async ({ miniProgram, screen }) => {
    await expect(screen.getByRole('button', { name: 'Open contact instructions', exact: true })).toBeDisabled()
    await expect(miniProgram.locator('//*[@data-process-step="inspect"]')).toHaveAttribute('data-state', 'active')
    await screen.getByRole('button', { name: 'Open workflow instructions', exact: true }).tap()
    await expect(miniProgram.locator('//*[@aria-label="Local guide"]')).toContainText('does not install or publish anything')
    await expect(miniProgram.locator('//*[@data-process-step="inspect"]')).toHaveAttribute('data-state', 'completed')
    await expect(screen.getByRole('button', { name: 'Open workflow instructions', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Open contact instructions', exact: true }).tap()
    await expect(miniProgram.locator('//*[@aria-label="Local guide"]')).toContainText('there is no email transport')
    await expect(miniProgram.locator('//*[@data-process-step="contact"]')).toHaveAttribute('data-state', 'completed')
    await expect(miniProgram.locator(stateXPath)).toContainText('steps=2')
  })

  test('loading empty error and disabled states retain content and recover through real controls', async ({ miniProgram, screen }) => {
    const demo = miniProgram.locator(demoXPath)
    for (const mode of ['Loading', 'Error', 'Disabled']) {
      await screen.getByRole('button', { name: mode, exact: true }).tap()
      for (const name of ['Explore the local guide', 'Read A source-first workflow', 'Choose Team example', 'Who owns the application decisions? — Expand answer', 'Submit contact request', 'Open workflow instructions']) {
        await expect(screen.getByRole('button', { name, exact: true })).toBeDisabled()
      }
      await expect(demo).toContainText('Build the interface. Keep the source.')
      await expect(miniProgram.locator(stateXPath)).toHaveText('host=0;plan=none;period=month;receipts=0;steps=0')
    }
    await screen.getByRole('button', { name: 'Empty', exact: true }).tap()
    for (const text of ['No introduction available.', 'No articles available.', 'No plans available.', 'No questions available.', 'No process steps available.']) {
      await expect(demo).toContainText(text)
    }
    await expect(screen.getByRole('button', { name: 'Submit contact request', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Ready', exact: true }).tap()
    await expect(screen.getByRole('button', { name: 'Explore the local guide', exact: true })).toBeEnabled()
    await expect(miniProgram.locator('//*[@data-article]')).toHaveCount(3)
  })
})
