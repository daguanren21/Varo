import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { Readable } from 'node:stream'
import { text } from 'node:stream/consumers'
import { pipeline } from 'node:stream/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { toHttpResponse } from '@tanstack/ai'
import { ChatClient, fetchHttpStream } from '@tanstack/ai-client'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { createPickupRunner, pickupReceiptEvent, pickupSurfaceEvent } from '../src/pages/agent-a2ui/pickup-run.ts'

async function verifyPickup(page, runtime, source, requests) {
  const nodes = xpath => page.getElementsByXpath(xpath)
  const attribute = (node, name) => typeof node.attr === 'function' ? node.attr(name) : node.attribute(name)
  async function element(xpath) {
    const matches = await nodes(xpath)
    assert.equal(matches.length, 1, xpath)
    return matches[0]
  }
  async function until(check) {
    const deadline = Date.now() + 6000
    while (true) {
      try {
        return await check()
      }
      catch (error) {
        if (Date.now() >= deadline) {
          const [failure] = await nodes('//*[@id="a2ui-error"]')
          if (failure) { throw new Error(await failure.text(), { cause: error }) }
          throw error
        }
        await delay(75)
      }
    }
  }
  async function tap(label) {
    const button = await until(async () => {
      const node = await element(`//button[@aria-label="${label}"]`)
      assert.notEqual(String(await attribute(node, 'disabled')), 'true')
      return node
    })
    await button.tap()
  }

  const surface = '//*[@data-a2ui-surface="pickup-time"]'
  const field = '//*[@data-a2ui-field="time"]'
  const inputSelector = runtime === 'devtools' ? '//input' : `${field}//input`
  const input = () => element(inputSelector)
  async function inputValue() {
    const node = await input()
    return typeof node.value === 'function' ? node.value() : node.attr('value')
  }
  const description = '//*[@data-a2ui-text="description"]'
  const nestedCard = '//*[@data-a2ui-card="schedule"]'
  const receiptCount = new RegExp(`${source}收到 action：1 次`)
  async function confirmButton() {
    if (runtime === 'headless') { return element('//*[@data-a2ui-button="save"]//button') }
    const matches = []
    for (const button of await nodes('//button')) {
      if ((await button.text()).trim() === '确认取件时间') { matches.push(button) }
    }
    assert.equal(matches.length, 1, '唯一的取件确认按钮')
    return matches[0]
  }

  for (const [layout, nested] of [['布局 A', false], ['布局 B', true]]) {
    const requestOffset = requests?.length
    await tap(layout)
    await until(async () => assert.equal(await inputValue(), '周五 10:00'))
    if (runtime === 'headless') {
      assert.equal((await nodes(`//*[@aria-label="A2UI 取件会话"]${surface}`)).length, 1)
      assert.equal((await nodes(nestedCard)).length, Number(nested))
      if (nested) {
        assert.equal((await nodes(`${nestedCard}${field}`)).length, 1)
      }
      const siblings = await nodes('//*[@data-a2ui-field="time" or @data-a2ui-text="description"]')
      assert.equal(siblings.length, 2)
      assert.equal(await attribute(siblings[0], nested ? 'data-a2ui-field' : 'data-a2ui-text'), nested ? 'time' : 'description')
      assert.match(await (await element(description)).text(), /确认前可修改/)
    }

    await tap('下发数据更新')
    await until(async () => assert.equal(await inputValue(), '周五 14:00'))
    await (await input()).input('周五 16:30')
    await until(async () => assert.equal(await inputValue(), '周五 16:30'))
    await (await until(confirmButton)).tap()
    const message = await until(async () => JSON.parse(await (await element('//*[@id="a2ui-action-payload"]')).text()))
    assert.equal(message.version, '1.0')
    assert.equal(message.action.name, 'savePickupTime')
    assert.equal(message.action.surfaceId, 'pickup-time')
    assert.equal(message.action.sourceComponentId, 'save')
    assert.deepEqual(message.action.context, { pickupTime: '周五 16:30' })
    assert.match(await (await element('//*[@id="a2ui-action-count"]')).text(), receiptCount)

    await tap('删除卡片')
    await until(async () => assert.equal((await nodes(inputSelector)).length, 0))
    assert.match(await (await element('//*[@id="a2ui-action-count"]')).text(), receiptCount)
    if (requests) {
      assert.deepEqual(requests.slice(requestOffset), [
        { type: 'create', layout: nested ? 'nested' : 'flat' },
        { type: 'update' },
        { type: 'action', message },
        { type: 'delete' },
      ])
    }
    process.stdout.write(`WeChat ${runtime} ${source} ${layout}: context 插槽、创建、更新、编辑、单次 action、删除通过\n`)
  }
}

async function startPickupServer() {
  const requests = []
  const run = createPickupRunner()
  async function handle(request, response) {
    if (request.method !== 'POST' || request.url !== '/a2ui') {
      response.writeHead(404).end()
      return
    }
    const input = JSON.parse(await text(request))
    requests.push(input.forwardedProps?.pickup)
    const result = toHttpResponse(run(input))
    response.writeHead(result.status, Object.fromEntries(result.headers))
    await pipeline(Readable.fromWeb(result.body), response)
  }
  const server = createServer((request, response) => {
    void handle(request, response).catch((error) => {
      if (response.headersSent) { response.destroy(error) }
      else { response.writeHead(400).end(String(error)) }
    })
  })
  await new Promise((ready, fail) => {
    server.once('error', fail)
    server.listen(0, '127.0.0.1', ready)
  })
  return {
    port: server.address().port,
    requests,
    close: () => new Promise((done, fail) => server.close(error => error ? fail(error) : done())),
  }
}

async function verifyHttpConnection(server) {
  const events = []
  const client = new ChatClient({
    threadId: 'varo-a2ui-http-smoke',
    connection: fetchHttpStream(`http://127.0.0.1:${server.port}/a2ui`),
    onCustomEvent(name, value) { events.push({ name, value }) },
  })
  try {
    const message = {
      version: '1.0',
      action: {
        name: 'savePickupTime',
        surfaceId: 'pickup-time',
        sourceComponentId: 'save',
        timestamp: new Date().toISOString(),
        context: { pickupTime: '周五 16:30' },
      },
    }
    const commands = [
      { type: 'create', layout: 'nested' },
      { type: 'update' },
      { type: 'action', message },
      { type: 'delete' },
    ]
    for (const pickup of commands) {
      await client.sendMessage(`测试 ${pickup.type}`, { pickup })
      assert.equal(client.getSnapshot().error, undefined)
    }
    assert.deepEqual(server.requests, commands)
    assert.deepEqual(events.map(({ name }) => name), [
      pickupSurfaceEvent,
      pickupSurfaceEvent,
      pickupSurfaceEvent,
      pickupReceiptEvent,
      pickupSurfaceEvent,
    ])
    assert.deepEqual(events[3].value, { count: 1, message })
    process.stdout.write('Node ChatClient HTTP/NDJSON: 测试服务端只收到一条 action\n')
  }
  finally {
    client.dispose()
  }
}

async function main() {
  const projectPath = resolve(process.argv[2] ?? 'devtools/build')
  const runtime = process.env.WEAPP_A2UI_DEVTOOLS === '1' ? 'devtools' : 'headless'
  const server = await startPickupServer()
  try {
    const program = await new Launcher().launch({ platform: 'wechat', runtimeProvider: runtime, projectPath, timeout: 25_000 })
    try {
      if (runtime === 'headless') {
        await verifyPickup(await program.reLaunch('/pages/agent-a2ui/index'), runtime, '本地连接')
        await verifyHttpConnection(server)
      }
      else {
        const page = await program.reLaunch(`/pages/agent-a2ui/index?testPort=${server.port}`)
        await verifyPickup(page, runtime, '测试服务端', server.requests)
      }
    }
    finally {
      if (runtime === 'devtools') { await program.disconnect() }
      else { await program.close() }
    }
  }
  finally {
    await server.close()
  }
}

void main()
