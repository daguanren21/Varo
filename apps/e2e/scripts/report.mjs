/**
 * @typedef {object} RequiredPair
 * @property {string} file
 * @property {string[]} titlePath
 * @property {string} target
 * @property {'run' | 'skip'} disposition
 * @property {string} [skipReason]
 */

function pairKey(file, titlePath, target) {
  return JSON.stringify([file, titlePath, target])
}

/**
 * @param {unknown} selection
 * @param {string[]} targets
 * @param {RequiredPair[]} requiredPairs
 * @returns {RequiredPair[]}
 */
export function validateSelection(selection, targets, requiredPairs) {
  if (!Array.isArray(selection?.pairs) || selection.pairs.length === 0) {
    throw new Error('The required test-target selection is empty')
  }
  const requiredKeys = new Set(requiredPairs.map(pair => pairKey(pair.file, pair.titlePath, pair.target)))
  if (requiredKeys.size === 0 || requiredKeys.size !== requiredPairs.length) {
    throw new Error('The required test-target contract is empty or contains duplicates')
  }
  const keys = new Set()
  const selectedTargets = new Set()
  for (const pair of selection.pairs) {
    if (typeof pair.file !== 'string' || !Array.isArray(pair.titlePath)
      || pair.titlePath.length === 0 || !pair.titlePath.every(title => typeof title === 'string')
      || !targets.includes(pair.target)) {
      throw new Error('The test listing contains an invalid test-target identity')
    }
    const key = pairKey(pair.file, pair.titlePath, pair.target)
    if (keys.has(key)) {
      throw new Error(`The test listing repeats ${pair.file} › ${pair.titlePath.join(' › ')} [${pair.target}]`)
    }
    if (!requiredKeys.has(key)) {
      throw new Error(`Unregistered test-target pair: ${pair.file} › ${pair.titlePath.join(' › ')} [${pair.target}]`)
    }
    keys.add(key)
    selectedTargets.add(pair.target)
    if (pair.disposition !== 'run') {
      throw new Error(`A required test is not runnable: ${pair.file} [${pair.target}]: ${pair.skipReason ?? pair.disposition}`)
    }
  }
  for (const target of targets) {
    if (!selectedTargets.has(target)) {
      throw new Error(`No required tests were selected for ${target}`)
    }
  }
  for (const pair of requiredPairs) {
    if (!keys.has(pairKey(pair.file, pair.titlePath, pair.target))) {
      throw new Error(`Missing required test selection: ${pair.file} › ${pair.titlePath.join(' › ')} [${pair.target}]`)
    }
  }
  return selection.pairs
}

/**
 * @param {unknown} report
 * @param {RequiredPair[]} requiredPairs
 * @param {{ startedAt: string, exitCode: number }} context
 */
export function inspectReport(report, requiredPairs, { startedAt, exitCode }) {
  const errors = []
  if (exitCode !== 0) {
    errors.push(`E2E exited with code ${exitCode}`)
  }
  if (report?.schemaVersion !== 'report-1' || !report.run) {
    return [...errors, 'The invocation did not produce a report-1 document']
  }
  const { run } = report
  if (run.status !== 'passed' || run.exitCode !== 0) {
    errors.push(`E2E reported ${run.status} (exit ${run.exitCode})`)
  }
  const reportStarted = Date.parse(run.startedAt)
  const reportFinished = Date.parse(run.finishedAt)
  if (!Number.isFinite(reportStarted) || reportStarted < Date.parse(startedAt)
    || !Number.isFinite(reportFinished) || reportFinished < reportStarted
    || reportFinished > Date.now()) {
    errors.push('The report does not belong to this invocation time window')
  }
  if (!Array.isArray(run.errors) || run.errors.length !== 0) {
    errors.push('The run contains runner or cleanup errors')
  }
  if (!Array.isArray(run.results)) {
    return [...errors, 'The report has no test results']
  }
  const required = new Map(requiredPairs.map(pair => [pairKey(pair.file, pair.titlePath, pair.target), pair]))
  const seen = new Set()
  for (const result of run.results) {
    const key = pairKey(result.file, result.titlePath, result.targetId)
    const label = `${result.file} › ${result.titlePath?.join(' › ')} [${result.targetId}]`
    if (!required.has(key)) {
      // The framework includes the other platform's deliberately inapplicable
      // pairs. Focus, tags, grep, shards and missing capabilities are not that.
      if (result.selected === false && result.skip?.cause === 'platform-unavailable') {
        continue
      }
      errors.push(`Unexpected or filtered test-target pair: ${label}`)
      continue
    }
    if (seen.has(key)) {
      errors.push(`Duplicate result: ${label}`)
    }
    seen.add(key)
    if (result.selected === false || result.status !== 'passed') {
      errors.push(`Required test did not pass: ${label} (${result.status})`)
      continue
    }
    const attempts = result.attempts
    if (!Array.isArray(attempts) || attempts.length !== 1 || attempts[0].index !== 0) {
      errors.push(`Required test must pass its only attempt: ${label}`)
      continue
    }
    const attempt = attempts[0]
    if (attempt.status !== 'passed' || attempt.cleanup !== 'complete'
      || attempt.error || !Array.isArray(attempt.secondaryErrors) || attempt.secondaryErrors.length !== 0) {
      errors.push(`Required test has a failed attempt or incomplete cleanup: ${label}`)
    }
  }
  for (const [key, pair] of required) {
    if (!seen.has(key)) {
      errors.push(`Missing required result: ${pair.file} › ${pair.titlePath.join(' › ')} [${pair.target}]`)
    }
  }
  if (required.size === 0) {
    errors.push('A run without required tests cannot pass')
  }
  return errors
}
