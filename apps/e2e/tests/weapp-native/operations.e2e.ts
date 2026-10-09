import { expect } from 'e2e'
import { expectRoute, nativePlatforms, test } from './fixtures'

const scenarios = [
  { domain: 'CRM', first: 'Northwind renewal', second: 'Harbor prospect', archived: 'Closed account', field: 'Account owner', category: 'Leads', task: 'Assign local owner', changed: 'Avery — local account owner', approve: 'Qualify opportunity', approved: 'Qualified', reject: 'Decline opportunity', issue: 'Contact consent is missing.', repair: 'Record local contact consent' },
  { domain: 'AI Ops', first: 'Answer evaluation', second: 'Unlabelled evaluation', archived: 'Archived evaluation', field: 'Evaluation method', category: 'Dataset review', task: 'Evaluate local cases', changed: '2 / 3 exact matches', approve: 'Approve evaluation', approved: 'Evaluation approved', reject: 'Reject evaluation', issue: 'Expected labels are missing.', repair: 'Label local evaluation cases' },
  { domain: 'Dev Ops', first: 'Release candidate', second: 'Unchecked release', archived: 'Archived release', field: 'Commit reference', category: 'Release review', task: 'Stage local release plan', changed: 'Staged in local plan ledger; nothing deployed', approve: 'Approve release plan', approved: 'Release approved', reject: 'Reject release plan', issue: 'Rollback checklist is not reviewed.', repair: 'Review local rollback checklist' },
  { domain: 'Agents', first: 'Research assistant', second: 'Unrestricted assistant', archived: 'Retired assistant', field: 'Tool scope', category: 'Tool review', task: 'Enable local schedule', changed: 'Enabled in local schedule; no agent executed', approve: 'Approve agent configuration', approved: 'Configuration approved', reject: 'Reject agent configuration', issue: 'Wildcard tool scope is not allowed by the local application.', repair: 'Restrict local tool scope' },
  { domain: 'Analytics', first: 'Order totals report', second: 'Sparse sample report', archived: 'Archived report', field: 'Local order total', category: 'Sample review', task: 'Append local order', changed: '85', approve: 'Approve report snapshot', approved: 'Snapshot approved', reject: 'Reject report snapshot', issue: 'At least 3 local rows are required.', repair: 'Add missing local order rows' },
  { domain: 'Files', first: 'Handoff notes.txt', second: 'Unclassified notes.txt', archived: 'Archived notes.txt', field: 'MIME type', category: 'Classification review', task: 'Open local text preview', changed: 'Owner: Operations team', approve: 'Approve file classification', approved: 'Classification approved', reject: 'Reject file classification', issue: 'File classification is missing.', repair: 'Classify local sample text' },
]

const root = '//*[@id="operations-demo"]'
const detailSelector = '//*[@data-operations-detail="true"]'

test.describe('native B5 mobile operations', { platforms: nativePlatforms, requires: ['miniProgram'] }, () => {
  test.beforeEach(async ({ miniProgram }) => {
    await miniProgram.reLaunch('/blocks-lab/operations/index')
    await expectRoute(miniProgram, '/blocks-lab/operations/index')
    await expect(miniProgram.locator(root)).toContainText('Six local application scenarios.')
  })
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  for (const scenario of scenarios) {
    test(`${scenario.domain}: bounded pages, distinct local task, approval and filters`, async ({ miniProgram, screen }) => {
      const demo = miniProgram.locator(root)
      if (scenario.domain !== 'CRM') { await screen.getByRole('button', { name: `Domain: ${scenario.domain}`, exact: true }).tap() }
      await expect(demo).toContainText('Page 1 of 2 · 3 records · up to 2 per page')
      await expect(screen.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled()
      await expect(screen.getByRole('button', { name: 'Status: Unavailable', exact: true })).toBeDisabled()
      await screen.getByRole('button', { name: 'Next page', exact: true }).tap()
      await expect(demo).toContainText('Page 2 of 2')
      await expect(screen.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
      await screen.getByRole('button', { name: `View ${scenario.archived}`, exact: true }).tap()
      await expect(screen.getByRole('button', { name: scenario.approve, exact: true })).toBeDisabled()
      await screen.getByRole('button', { name: 'Previous page', exact: true }).tap()
      await expect(screen.getByRole('button', { name: 'Close details', exact: true })).toHaveCount(0)
      await screen.getByRole('button', { name: `View ${scenario.first}`, exact: true }).tap()
      const detail = miniProgram.locator(detailSelector)
      await expect(detail).toContainText(scenario.field)
      await expect(detail).toContainText('without hover or truncation')
      await expect(screen.getByRole('button', { name: 'Restricted action', exact: true })).toBeDisabled()
      await screen.getByRole('button', { name: scenario.task, exact: true }).tap()
      await expect(scenario.domain === 'Files' ? miniProgram.locator('//*[@data-operations-preview="true"]') : detail).toContainText(scenario.changed)
      if (scenario.domain !== 'Analytics' && scenario.domain !== 'Files') { await expect(screen.getByRole('button', { name: scenario.task, exact: true })).toBeDisabled() }
      if (scenario.domain === 'Files') {
        await screen.getByRole('button', { name: 'Request host download', exact: true }).tap()
        await expect(detail).toContainText('No file was downloaded.')
        await expect(miniProgram.locator('//*[@data-operations-preview="true"]')).toContainText('Owner: Operations team')
      }
      await screen.getByRole('button', { name: scenario.approve, exact: true }).tap()
      await expect(detail).toContainText(`Status: ${scenario.approved}`)
      await expect(screen.getByRole('button', { name: scenario.approve, exact: true })).toBeDisabled()
      await expect(screen.getByRole('button', { name: scenario.reject, exact: true })).toBeDisabled()
      if (scenario.domain !== 'Files') { await expect(screen.getByRole('button', { name: scenario.task, exact: true })).toBeDisabled() }
      await screen.getByRole('button', { name: 'Status: Approved', exact: true }).tap()
      await expect(demo).toContainText('Page 1 of 1 · 1 records')
      await expect(screen.getByRole('button', { name: `View ${scenario.second}`, exact: true })).toHaveCount(0)
      await screen.getByRole('button', { name: 'Status: All', exact: true }).tap()
      await screen.getByRole('button', { name: `Category: ${scenario.category}`, exact: true }).tap()
      await expect(screen.getByRole('button', { name: `View ${scenario.second}`, exact: true })).toBeEnabled()
      await expect(screen.getByRole('button', { name: `View ${scenario.first}`, exact: true })).toHaveCount(0)
      await screen.getByRole('button', { name: 'Category: All', exact: true }).tap()
      await screen.getByPlaceholder('Search titles and summaries').fill(scenario.first)
      await expect(demo).toContainText('Page 1 of 1 · 1 records')
      await screen.getByPlaceholder('Search titles and summaries').fill('no matching local record')
      await expect(demo).toContainText('No records match these filters.')
      await expect(screen.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
    })

    test(`${scenario.domain}: application rejects invalid approval, repairs data and records a reviewer rejection`, async ({ miniProgram, screen }) => {
      const demo = miniProgram.locator(root)
      if (scenario.domain !== 'CRM') { await screen.getByRole('button', { name: `Domain: ${scenario.domain}`, exact: true }).tap() }
      await screen.getByRole('button', { name: `View ${scenario.first}`, exact: true }).tap()
      await screen.getByRole('button', { name: scenario.reject, exact: true }).tap()
      await expect(miniProgram.locator(detailSelector)).toContainText('Status: Rejected by local reviewer')
      await expect(screen.getByRole('button', { name: scenario.approve, exact: true })).toBeDisabled()
      await screen.getByRole('button', { name: `View ${scenario.second}`, exact: true }).tap()
      await screen.getByRole('button', { name: scenario.approve, exact: true }).tap()
      await expect(miniProgram.locator(detailSelector)).toContainText(`Application rejected: ${scenario.issue}`)
      await expect(miniProgram.locator(detailSelector)).toContainText('Status: Awaiting review')
      await screen.getByRole('button', { name: scenario.repair, exact: true }).tap()
      await expect(miniProgram.locator(detailSelector)).not.toContainText('Application rejected:')
      await screen.getByRole('button', { name: scenario.approve, exact: true }).tap()
      await expect(miniProgram.locator(detailSelector)).toContainText(`Status: ${scenario.approved}`)
      await screen.getByRole('button', { name: 'Status: Rejected', exact: true }).tap()
      await expect(screen.getByRole('button', { name: `View ${scenario.first}`, exact: true })).toBeEnabled()
      await expect(screen.getByRole('button', { name: `View ${scenario.second}`, exact: true })).toHaveCount(0)
      await expect(demo).toContainText('Page 1 of 1 · 1 records')
    })
  }

  test('current grants, stale removal confirmation and confirmed removal preserve correct records', async ({ miniProgram, screen }) => {
    const demo = miniProgram.locator(root)
    await screen.getByRole('button', { name: 'View Northwind renewal', exact: true }).tap()
    await screen.getByRole('button', { name: 'Remove local record', exact: true }).tap()
    await screen.getByRole('button', { name: 'Keep local record', exact: true }).tap()
    await expect(demo).toContainText('Page 1 of 2 · 3 records')
    await screen.getByRole('button', { name: 'Remove local record', exact: true }).tap()
    await screen.getByRole('button', { name: 'Revoke approval grant', exact: true }).tap()
    await expect(screen.getByRole('button', { name: 'Qualify opportunity', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'Confirm local removal', exact: true }).tap()
    await expect(demo).toContainText('Removal rejected because the record or grant changed.')
    await expect(screen.getByRole('button', { name: 'View Northwind renewal', exact: true })).toHaveCount(1)
    await screen.getByRole('button', { name: 'Remove local record', exact: true }).tap()
    await screen.getByRole('button', { name: 'Confirm local removal', exact: true }).tap()
    await expect(screen.getByRole('button', { name: 'View Northwind renewal', exact: true })).toHaveCount(0)
    await expect(demo).toContainText('Page 1 of 1 · 2 records')
    await expect(screen.getByRole('button', { name: 'View Harbor prospect', exact: true })).toBeEnabled()
  })

  test('analytics derives bounded samples and accepts a repaired sparse snapshot', async ({ miniProgram, screen }) => {
    const demo = miniProgram.locator(root)
    await screen.getByRole('button', { name: 'Domain: Analytics', exact: true }).tap()
    await screen.getByRole('button', { name: 'View Order totals report', exact: true }).tap()
    await expect(miniProgram.locator(detailSelector)).toContainText('60')
    for (let index = 0; index < 9; index++) { await screen.getByRole('button', { name: 'Append local order', exact: true }).tap() }
    await expect(miniProgram.locator(detailSelector)).toContainText('285')
    await expect(demo).toContainText('Local sample limit of 12 reached.')
    await expect(screen.getByRole('button', { name: 'Append local order', exact: true })).toBeDisabled()
    await screen.getByRole('button', { name: 'View Sparse sample report', exact: true }).tap()
    await screen.getByRole('button', { name: 'Approve report snapshot', exact: true }).tap()
    await expect(miniProgram.locator(detailSelector)).toContainText('Application rejected: At least 3 local rows are required.')
    await screen.getByRole('button', { name: 'Append local order', exact: true }).tap()
    await screen.getByRole('button', { name: 'Append local order', exact: true }).tap()
    await expect(miniProgram.locator(detailSelector)).toContainText('62')
    await screen.getByRole('button', { name: 'Approve report snapshot', exact: true }).tap()
    await expect(miniProgram.locator(detailSelector)).toContainText('Status: Snapshot approved')
    await expect(screen.getByRole('button', { name: 'Append local order', exact: true })).toBeDisabled()
  })

  test('loading, busy, disabled, error and invalid bounds retain evidence and permit closing', async ({ miniProgram, screen }) => {
    const demo = miniProgram.locator(root)
    for (const state of ['Loading state', 'Pending decision', 'Disable workspace', 'Load error']) {
      await screen.getByRole('button', { name: 'View Northwind renewal', exact: true }).tap()
      await screen.getByRole('switch', { name: state, exact: true }).tap()
      await expect(miniProgram.locator(detailSelector)).toContainText('Northwind renewal')
      await expect(screen.getByRole('button', { name: 'Qualify opportunity', exact: true })).toBeDisabled()
      await expect(screen.getByPlaceholder('Search titles and summaries')).toBeDisabled()
      await expect(screen.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
      await screen.getByRole('button', { name: 'Close details', exact: true }).tap()
      await expect(screen.getByRole('button', { name: 'Close details', exact: true })).toHaveCount(0)
      await screen.getByRole('switch', { name: state, exact: true }).tap()
    }
    await screen.getByRole('switch', { name: 'Invalid page size (51)', exact: true }).tap()
    await expect(demo).toContainText('Page size must be an integer from 1 to 50.')
    await expect(screen.getByRole('button', { name: 'View Northwind renewal', exact: true })).toHaveCount(0)
    await screen.getByRole('switch', { name: 'Invalid page size (51)', exact: true }).tap()
    await expect(screen.getByRole('button', { name: 'View Northwind renewal', exact: true })).toBeEnabled()
  })
})

test.describe('native operations screenshot', { platforms: ['weapp-devtools'], requires: ['miniProgram', 'artifacts'] }, () => {
  test('capture real local CRM detail', async ({ miniProgram, screen }) => {
    await miniProgram.reLaunch('/blocks-lab/operations/index')
    await expectRoute(miniProgram, '/blocks-lab/operations/index')
    await screen.getByRole('button', { name: 'View Northwind renewal', exact: true }).tap()
    await screen.getByRole('button', { name: 'Assign local owner', exact: true }).tap()
    await expect(miniProgram.locator(detailSelector)).toContainText('Avery — local account owner')
    expect(await miniProgram.screenshot('operations-crm-detail')).toMatch(/\.png$/)
    expect(await miniProgram.errors()).toEqual([])
  })
})
