import { writeFileSync } from 'node:fs'
import { createServer } from 'node:http'

const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.end(request.url === '/second'
    ? '<!doctype html><h1>Second required page</h1>'
    : '<!doctype html><button onclick="count.textContent=String(Number(count.textContent)+1)">Increment</button><output id="count" role="status">0</output>')
})
server.listen(Number(process.argv[2]), '127.0.0.1', () => {
  writeFileSync(process.env.VARO_GUARD_SERVER_FILE, JSON.stringify({ pid: process.pid, port: server.address().port }))
})
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
