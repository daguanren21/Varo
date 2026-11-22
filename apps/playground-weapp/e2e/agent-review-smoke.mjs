import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { Launcher } from '@weapp-vite/miniprogram-automator'

async function verifyDecisions(program) {
  const page = await program.reLaunch('/pages/agent-inbox-demo/index')
  const find = async xpath => (await page.getElementsByXpath(xpath))[0]
  await (await find('//button[@aria-label="打开 确认报告格式"]')).tap()
  const inputSelector = '//input[@placeholder="请输入你的回答"]'
  const submitSelector = '//button[contains(@class,"agent-decision__submit")]'
  const oldInput = await find(inputSelector)
  const oldSubmit = await find(submitSelector)
  await program.evaluate(() => {
    const vm = globalThis.getCurrentPages().at(-1).__wevu.proxy
    vm.decision.value = { ...vm.decision.value, id: 'replacement', title: 'Replacement question' }
    vm.tasks.value = vm.tasks.value.map(task => task.id === 'format' ? { ...task, id: 'replacement' } : task)
    vm.activeId.value = 'replacement'
  })
  await Promise.allSettled([oldInput.input('late-A-text'), oldSubmit.tap()])
  assert.equal(await (await find(inputSelector)).attr('value'), '')
  assert.equal(String(await (await find(submitSelector)).attr('disabled')), 'true')
  await (await find(inputSelector)).input('B answer')
  await (await find(submitSelector)).tap()
  const decision = await program.evaluate(() => globalThis.getCurrentPages().at(-1).__wevu.proxy.decision.value)
  assert.equal(decision.answer.kind, 'text')
  assert.equal(decision.answer.text, 'B answer')
  process.stdout.write('PASS: stale native editor events cannot answer a replacement decision\n')
}

async function verifyCompare(program) {
  const page = await program.reLaunch('/blocks-lab/model-compare/index')
  const buttons = await page.getElementsByXpath('//button')
  const byText = async (text) => {
    for (const button of buttons) { if ((await button.text()).trim() === text) { return button } }
    throw new Error(`Missing button: ${text}`)
  }
  const example = await byText('载入工具示例')
  const close = await byText('关闭并清理比较')
  const before = await program.evaluate(() => {
    const vm = globalThis.getCurrentPages().at(-1).__wevu.proxy
    return [vm.leftState.value.sessionId, vm.rightState.value.sessionId]
  })
  await close.tap()
  await Promise.allSettled([example.tap()])
  const after = await program.evaluate(() => {
    const vm = globalThis.getCurrentPages().at(-1).__wevu.proxy
    return { ids: [vm.leftState.value.sessionId, vm.rightState.value.sessionId], visible: vm.visible.value }
  })
  assert.deepEqual(after.ids, before)
  assert.equal(after.visible, false)
  process.stdout.write('PASS: closing comparison prevents queued taps from replacing clients\n')
}

async function main() {
  const projectPath = resolve(process.argv[2] ?? 'devtools/build')
  const program = await new Launcher().launch({ platform: 'wechat', runtimeProvider: 'headless', projectPath })
  try {
    await verifyDecisions(program)
    await verifyCompare(program)
  }
  finally { await program.close() }
}

void main()
