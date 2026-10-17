import { expect } from 'e2e'
import { test } from '../../engines/web'

const scenarios = [
  { domain: 'CRM', first: 'Northwind renewal', second: 'Harbor prospect', archived: 'Closed account', field: 'Account owner', category: 'Leads', task: 'Assign local owner', changed: 'Avery — local account owner', approve: 'Qualify opportunity', approved: 'Qualified', reject: 'Decline opportunity', issue: 'Contact consent is missing.', repair: 'Record local contact consent' },
  { domain: 'AI Ops', first: 'Answer evaluation', second: 'Unlabelled evaluation', archived: 'Archived evaluation', field: 'Evaluation method', category: 'Dataset review', task: 'Evaluate local cases', changed: '2 / 3 exact matches', approve: 'Approve evaluation', approved: 'Evaluation approved', reject: 'Reject evaluation', issue: 'Expected labels are missing.', repair: 'Label local evaluation cases' },
  { domain: 'Dev Ops', first: 'Release candidate', second: 'Unchecked release', archived: 'Archived release', field: 'Commit reference', category: 'Release review', task: 'Stage local release plan', changed: 'Staged in local plan ledger; nothing deployed', approve: 'Approve release plan', approved: 'Release approved', reject: 'Reject release plan', issue: 'Rollback checklist is not reviewed.', repair: 'Review local rollback checklist' },
  { domain: 'Agents', first: 'Research assistant', second: 'Unrestricted assistant', archived: 'Retired assistant', field: 'Tool scope', category: 'Tool review', task: 'Enable local schedule', changed: 'Enabled in local schedule; no agent executed', approve: 'Approve agent configuration', approved: 'Configuration approved', reject: 'Reject agent configuration', issue: 'Wildcard tool scope is not allowed by the local application.', repair: 'Restrict local tool scope' },
  { domain: 'Analytics', first: 'Order totals report', second: 'Sparse sample report', archived: 'Archived report', field: 'Local order total', category: 'Sample review', task: 'Append local order', changed: '85', approve: 'Approve report snapshot', approved: 'Snapshot approved', reject: 'Reject report snapshot', issue: 'At least 3 local rows are required.', repair: 'Add missing local order rows' },
  { domain: 'Files', first: 'Handoff notes.txt', second: 'Unclassified notes.txt', archived: 'Archived notes.txt', field: 'MIME type', category: 'Classification review', task: 'Open local text preview', changed: 'Owner: Operations team', approve: 'Approve file classification', approved: 'Classification approved', reject: 'Reject file classification', issue: 'File classification is missing.', repair: 'Classify local sample text' },
]

test.describe('H5 B5 mobile operations', { platforms: ['h5'] }, () => {
  test.beforeEach(async ({ app, browser }) => {
    await browser.setViewport({ width: 375, height: 812 })
    await app.open('/?demo=operations')
    await expect(browser.locator('#operations-demo')).toContainText('Six local application scenarios.')
  })
  test.afterEach(async ({ webRuntime }) => {
    const diagnostics = await webRuntime.diagnostics()
    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.console.filter(message => message.type === 'error')).toEqual([])
  })

  for (const scenario of scenarios) {
    test(`${scenario.domain}: bounded pages, distinct local task, approval and filters`, async ({ app, browser }) => {
      const demo = browser.locator('#operations-demo')
      if (scenario.domain !== 'CRM') { await demo.getByRole('button', { name: `Domain: ${scenario.domain}`, exact: true }).click() }
      await expect(demo).toContainText('Page 1 of 2 · 3 records · up to 2 per page')
      await expect(demo.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled()
      await expect(demo.getByRole('button', { name: 'Status: Unavailable', exact: true })).toBeDisabled()
      await demo.getByRole('button', { name: 'Next page', exact: true }).click()
      await expect(demo).toContainText('Page 2 of 2')
      await expect(demo.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
      await demo.getByRole('button', { name: `View ${scenario.archived}`, exact: true }).click()
      await expect(demo.getByRole('button', { name: scenario.approve, exact: true })).toBeDisabled()
      await demo.getByRole('button', { name: 'Previous page', exact: true }).click()
      await expect(demo.getByRole('button', { name: 'Close details', exact: true })).toHaveCount(0)
      await demo.getByRole('button', { name: `View ${scenario.first}`, exact: true }).click()
      const detail = browser.locator('#operations-demo [data-operations-detail]')
      await expect(detail).toContainText(scenario.field)
      await expect(detail).toContainText('without hover or truncation')
      await expect(demo.getByRole('button', { name: 'Restricted action', exact: true })).toBeDisabled()
      await demo.getByRole('button', { name: scenario.task, exact: true }).click()
      await expect(scenario.domain === 'Files' ? browser.locator('#operations-demo [data-operations-preview]') : detail).toContainText(scenario.changed)
      if (scenario.domain !== 'Analytics' && scenario.domain !== 'Files') { await expect(demo.getByRole('button', { name: scenario.task, exact: true })).toBeDisabled() }
      if (scenario.domain === 'Files') {
        await demo.getByRole('button', { name: 'Request host download', exact: true }).click()
        await expect(detail).toContainText('No file was downloaded.')
        await expect(browser.locator('#operations-demo [data-operations-preview]')).toContainText('Owner: Operations team')
      }
      await demo.getByRole('button', { name: scenario.approve, exact: true }).click()
      await expect(detail).toContainText(`Status: ${scenario.approved}`)
      await expect(demo.getByRole('button', { name: scenario.approve, exact: true })).toBeDisabled()
      await expect(demo.getByRole('button', { name: scenario.reject, exact: true })).toBeDisabled()
      if (scenario.domain !== 'Files') { await expect(demo.getByRole('button', { name: scenario.task, exact: true })).toBeDisabled() }
      await app.screenshot(`h5-operations-${scenario.domain.replace(/ /g, '-').toLowerCase()}`)
      await demo.getByRole('button', { name: 'Status: Approved', exact: true }).click()
      await expect(demo).toContainText('Page 1 of 1 · 1 records')
      await expect(demo.getByRole('button', { name: `View ${scenario.second}`, exact: true })).toHaveCount(0)
      await demo.getByRole('button', { name: 'Status: All', exact: true }).click()
      await demo.getByRole('button', { name: `Category: ${scenario.category}`, exact: true }).click()
      await expect(demo.getByRole('button', { name: `View ${scenario.second}`, exact: true })).toBeEnabled()
      await expect(demo.getByRole('button', { name: `View ${scenario.first}`, exact: true })).toHaveCount(0)
      await demo.getByRole('button', { name: 'Category: All', exact: true }).click()
      await demo.getByPlaceholder('Search titles and summaries').fill(scenario.first)
      await expect(demo).toContainText('Page 1 of 1 · 1 records')
      await demo.getByPlaceholder('Search titles and summaries').fill('no matching local record')
      await expect(demo).toContainText('No records match these filters.')
      await expect(demo.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
    })

    test(`${scenario.domain}: application rejects invalid approval, repairs data and records a reviewer rejection`, async ({ browser }) => {
      const demo = browser.locator('#operations-demo')
      if (scenario.domain !== 'CRM') { await demo.getByRole('button', { name: `Domain: ${scenario.domain}`, exact: true }).click() }
      await demo.getByRole('button', { name: `View ${scenario.first}`, exact: true }).click()
      await demo.getByRole('button', { name: scenario.reject, exact: true }).click()
      await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText('Status: Rejected by local reviewer')
      await expect(demo.getByRole('button', { name: scenario.approve, exact: true })).toBeDisabled()
      await demo.getByRole('button', { name: `View ${scenario.second}`, exact: true }).click()
      await demo.getByRole('button', { name: scenario.approve, exact: true }).click()
      await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText(`Application rejected: ${scenario.issue}`)
      await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText('Status: Awaiting review')
      await demo.getByRole('button', { name: scenario.repair, exact: true }).click()
      await expect(browser.locator('#operations-demo [data-operations-detail]')).not.toContainText('Application rejected:')
      await demo.getByRole('button', { name: scenario.approve, exact: true }).click()
      await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText(`Status: ${scenario.approved}`)
      await demo.getByRole('button', { name: 'Status: Rejected', exact: true }).click()
      await expect(demo.getByRole('button', { name: `View ${scenario.first}`, exact: true })).toBeEnabled()
      await expect(demo.getByRole('button', { name: `View ${scenario.second}`, exact: true })).toHaveCount(0)
    })
  }

  test('current grants, stale removal confirmation and confirmed removal preserve correct records', async ({ browser }) => {
    const demo = browser.locator('#operations-demo')
    await demo.getByRole('button', { name: 'View Northwind renewal', exact: true }).click()
    await demo.getByRole('button', { name: 'Remove local record', exact: true }).click()
    await demo.getByRole('button', { name: 'Keep local record', exact: true }).click()
    await expect(demo).toContainText('Page 1 of 2 · 3 records')
    await demo.getByRole('button', { name: 'Remove local record', exact: true }).click()
    await demo.getByRole('button', { name: 'Revoke approval grant', exact: true }).click()
    await expect(demo.getByRole('button', { name: 'Qualify opportunity', exact: true })).toBeDisabled()
    await demo.getByRole('button', { name: 'Confirm local removal', exact: true }).click()
    await expect(demo).toContainText('Removal rejected because the record or grant changed.')
    await expect(demo.getByRole('button', { name: 'View Northwind renewal', exact: true })).toHaveCount(1)
    await demo.getByRole('button', { name: 'Remove local record', exact: true }).click()
    await demo.getByRole('button', { name: 'Confirm local removal', exact: true }).click()
    await expect(demo.getByRole('button', { name: 'View Northwind renewal', exact: true })).toHaveCount(0)
    await expect(demo).toContainText('Page 1 of 1 · 2 records')
    await expect(demo.getByRole('button', { name: 'View Harbor prospect', exact: true })).toBeEnabled()
  })

  test('analytics derives bounded samples and accepts a repaired sparse snapshot', async ({ browser }) => {
    const demo = browser.locator('#operations-demo')
    await demo.getByRole('button', { name: 'Domain: Analytics', exact: true }).click()
    await demo.getByRole('button', { name: 'View Order totals report', exact: true }).click()
    await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText('60')
    for (let index = 0; index < 9; index++) { await demo.getByRole('button', { name: 'Append local order', exact: true }).click() }
    await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText('285')
    await expect(demo).toContainText('Local sample limit of 12 reached.')
    await expect(demo.getByRole('button', { name: 'Append local order', exact: true })).toBeDisabled()
    await demo.getByRole('button', { name: 'View Sparse sample report', exact: true }).click()
    await demo.getByRole('button', { name: 'Approve report snapshot', exact: true }).click()
    await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText('Application rejected: At least 3 local rows are required.')
    await demo.getByRole('button', { name: 'Append local order', exact: true }).click()
    await demo.getByRole('button', { name: 'Append local order', exact: true }).click()
    await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText('62')
    await demo.getByRole('button', { name: 'Approve report snapshot', exact: true }).click()
    await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText('Status: Snapshot approved')
    await expect(demo.getByRole('button', { name: 'Append local order', exact: true })).toBeDisabled()
  })

  test('loading, busy, disabled, error and invalid bounds retain evidence and permit closing', async ({ browser }) => {
    const demo = browser.locator('#operations-demo')
    for (const state of ['Loading state', 'Pending decision', 'Disable workspace', 'Load error']) {
      await demo.getByRole('button', { name: 'View Northwind renewal', exact: true }).click()
      await demo.getByRole('switch', { name: state, exact: true }).click()
      await expect(browser.locator('#operations-demo [data-operations-detail]')).toContainText('Northwind renewal')
      await expect(demo.getByRole('button', { name: 'Qualify opportunity', exact: true })).toBeDisabled()
      await expect(demo.getByPlaceholder('Search titles and summaries')).toBeDisabled()
      await expect(demo.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled()
      await demo.getByRole('button', { name: 'Close details', exact: true }).click()
      await expect(demo.getByRole('button', { name: 'Close details', exact: true })).toHaveCount(0)
      await demo.getByRole('switch', { name: state, exact: true }).click()
    }
    await demo.getByRole('switch', { name: 'Invalid page size (51)', exact: true }).click()
    await expect(demo).toContainText('Page size must be an integer from 1 to 50.')
    await expect(demo.getByRole('button', { name: 'View Northwind renewal', exact: true })).toHaveCount(0)
    await demo.getByRole('switch', { name: 'Invalid page size (51)', exact: true }).click()
    await expect(demo.getByRole('button', { name: 'View Northwind renewal', exact: true })).toBeEnabled()
  })
})
