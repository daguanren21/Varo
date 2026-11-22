import { execFileSync } from 'node:child_process'

if (process.env.GITHUB_ACTIONS === 'true') {
  const verified = process.env.VARO_VERIFIED_RELEASE_SHA
  if (!verified) {
    console.error('Missing verified release commit. Run the Release workflow before uploading.')
    process.exitCode = 1
  }
  else {
    const current = execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { encoding: 'utf8' }).trim()
    if (current !== verified) {
      console.error(`Release commit ${current} does not match verified commit ${verified}. Start a new Release run from the version commit.`)
      process.exitCode = 1
    }
  }
}
