# Agent Attachment Composer

Submit attachments in four steps: select files, upload their bytes, validate service receipts, then submit a text message with accepted attachments. Selection and progress do not confirm upload success.

## Install and ownership

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-attachment-composer
pnpm dlx @varo-ui/cli add --target weapp components/agent-attachment-composer
```

Choose one target. Install the npm dependencies listed by the CLI; configure native global styles as described in [Wevu Registry](/en/guide/shadcn-mode). Only stable H5/Weapp are supported. This optional unit combines `agent-conversation`, Button, primitives, and `utils/attachment-transfer`; it does not add dependencies to AgentChat or import the full `agent-ui`/advanced suite. The transfer utility can also be installed independently.

- `src/components/agent-ui/AgentAttachmentComposer.vue`: displays attachments and checks actions before emitting requests; it does not manage transfer state.
- `src/components/agent-ui/agent-attachment-composer.types.ts`: presentation component types.
- `src/lib/attachment-transfer/attachment-transfer.ts`: metadata, policy, tasks, errors and pure validation.
- `src/lib/attachment-transfer/attachment-transfer.h5.ts`: browser adapter.
- `src/lib/attachment-transfer/attachment-transfer.weapp.ts`: native adapter. The installer copies only the selected adapter; its filename differs from the shared types file so neither overwrites the other.

Create a separate adapter wherever transfer state is managed independently; do not share a singleton. Keep File objects and native paths inside it, outside UI snapshots. The application manages items, attempt IDs, accepted receipts, messages, and drafts, and determines URL, headers, browser credentials, response parsing, retry, cancellation, retention, and remote deletion policy.

## Transfer API

```ts
import { createAttachmentTransfer } from './lib/attachment-transfer/attachment-transfer.h5'
// Native: import from './lib/attachment-transfer/attachment-transfer.weapp'

const transfer = createAttachmentTransfer<MyReceipt>({
  maxCount: 3,
  maxBytes: 8 * 1024 * 1024,
  extensions: ['.txt', '.md'],
})
```

`MyReceipt` is your application's receipt type. Each `select()` and `upload(id, options)` returns `{ promise, cancel() }`. Invoke `select()` synchronously from a user gesture, then await its promise in the application. The result contains metadata `{ id, name, size, mime? }`. Native MIME is absent when the host does not provide it.

`maxCount` limits all retained source files, while `maxBytes` applies to each file. Both must be positive safe integers, and the extension list must be explicit. Native rejects a count above the host's 100-file maximum. Invalid or over-limit selections are rejected as a whole; the adapter does not accept a subset. The picker filter is only a hint, so returned metadata is validated again. Extensions and MIME do not prove content authenticity.

Upload options:

| Option                     | Meaning                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `url`                      | Application-selected endpoint; POST multipart upload                                                          |
| `headers?`                 | Application-selected headers; let the host generate multipart Content-Type/boundary                           |
| `withCredentials?`         | Browser XHR credential flag, default false; native cookie policy belongs to wx.uploadFile                     |
| `fieldName?`               | Multipart file field, default `file`                                                                          |
| `parseReceipt(body, file)` | Synchronous application validation of a 2xx response; must return a non-null receipt or throw                 |
| `onProgress?`              | Actual host `{ sentBytes, totalBytes? }`; totals can include multipart framing and need not equal source size |

The browser uses an actual `input[type=file]` and XMLHttpRequest upload events/abort. While pending, the input remains identifiable as `input[type="file"][data-varo-attachment-input="true"]`; it is removed on settlement. A real chooser `cancel` event is not treated as file selection. Native calls actual `wx.chooseMessageFile` and `wx.uploadFile`, with UploadTask progress and abort. It does not need browser AbortController.

Failures reject with `AttachmentTransferError`: `validation`, `unavailable`, `permission`, `transport`, `http` (with status), `receipt`, `cancelled`, `disposed`, or `missing`. Native permission errors preserve the host message. Browser CORS/permission failures that XHR cannot distinguish remain transport failures. A 2xx response is accepted only with a valid receipt.

Cancellation settles once and suppresses later progress and results. On native, it invalidates the selection result but does not guarantee that an open OS chooser will close; the user may need to close it manually. Cancellation also does not guarantee remote rollback.

`release(id)` cancels that ID's uploads and releases its source file; `dispose()` cancels all tasks and releases all sources. Neither deletes remote objects or native host temporary files. Release application references too. Disposed adapters cannot be reused; create a new one. The demos check callback attempt IDs to prevent results from cancelled, removed, replaced, or unmounted transfers from updating current state.

## Presentation and controlled text

`AttachmentItem<R>` supplies `file`, `status: ready | uploading | uploaded | failed | cancelled`, optional actual `progress`, `failure`, `receipt`, and `grants` for `upload`, `retry`, `cancel`, `remove`.

| Prop                 | Meaning                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `items?`             | Current application items; empty by default                                                |
| `modelValue?`        | Optional controlled text; when omitted, the component keeps an initially empty local draft |
| `disabled?`, `busy?` | Existing Composer editing/busy behavior; prevent new transfer actions                      |
| `canChoose?`         | Explicit selection grant, default false                                                    |
| `choosing?`          | Application has an active selection; blocks submission and exposes cancellation            |
| `suggestions?`       | Forwarded to existing Composer; blocked while attachments are unresolved                   |

Both targets emit single values or objects: `choose`, `cancelSelection`, `update:modelValue(string)`, `action({ id, action })`, and `submit({ prompt, attachments: [{ file, receipt }] })`. Actions check the current ID and grant at activation without optimistic updates. Disabled/busy input still allows cancellation when uploading and granted. Cancel an upload before removing it. Long names and errors wrap in full.

Submission requires trimmed, nonempty text and every item to be `uploaded` with a non-null receipt. Ready, uploading, failed, cancelled, or unacknowledged items block Send, Enter/native confirm, and suggestions, while leaving normal draft editing available. The wrapper uses `AgentComposer.submitDisabled` and the existing input/send controls. Validate receipts and recheck state/grants when accepting requests. Text and items are never cleared automatically.

`useControllableState` determines whether text is controlled by whether the prop is supplied. Explicit `''` is controlled; native absent metadata is `null`, and required collections have explicit Array/[] metadata. Switching to uncontrolled mode does not copy the external draft into local state.

## Real local service demonstration

- H5: `/?demo=attachments`, `apps/playground-h5/src/features/AttachmentDemo.vue` and `useAttachmentDemo.ts`.
- Native: `/blocks-lab/attachments/index`, with its own `useAttachmentDemo.ts`.
- Dev-only service: `apps/playground-h5/scripts/attachment-demo.ts`, exporting `attachmentDemoPlugin()` for H5 Vite configuration.
- Exact upload route: `POST /__varo_attachment_demo/upload`; no query, download or remote-delete route.

The demo connects to a local file-transfer service, without a production backend or model. The service uses Node's built-in multipart parser and checks byte limits while reading the stream. It accepts exactly one `file` part, checks .txt/.md and UTF-8 content without NUL bytes, and writes the file under a generated UUID in its own OS temporary directory. Only after writing does it return HTTP 201 with `{ id, bytes, sha256 }`. The application validates the ID, exact source byte count, and SHA-256 format; the browser E2E compares the digest with the actual test file. Client filenames must never be used as storage paths.

The limits are 8 MiB/file, 8 MiB + 64 KiB/multipart body, 4 concurrent requests, 64 stored files, and a 32 MiB reserved/stored quota. The service rejects invalid methods, paths, body shapes, content encodings, foreign Origin, and unexpected Host. Requests must explicitly carry `X-Varo-Attachment-Demo: local-transfer` to indicate their purpose; the header does not authenticate them. Native may omit Origin; browser Origin must match the server's resolved origin. The service provides no CORS bypass. Keep the dev server private, and do not deploy this service or expose private files or credentials. When the quota is full, it returns 507. Restart the dev server to clear its storage; it will not delete files automatically to make room.

Each request has a 30-second total deadline. On shutdown, the plugin destroys its own active requests, waits for them to settle, then removes its storage.

“Let local service reject uploads” sends `X-Varo-Demo-Mode: reject`; the real HTTP request is parsed/validated and receives 503 without storage. “Recover local service” changes subsequent requests to `accept`; retry makes a new HTTP request. Optional deliberate pacing (`X-Varo-Demo-Pacing: paced`) waits 40ms per 16 KiB using stream backpressure, not synthesized client progress. Browser/socket buffering can report 100% sent while the service is still reading; only its acknowledgement makes the item uploaded.

Removing an item releases local retention but keeps previously accepted messages and remote files. Closing the demo aborts tasks and disposes local state; closing the dev server cleans only its owned temporary directory. A client abort racing server acceptance may still leave a stored file until server shutdown. The service is session-local; it provides no production authorization, durable storage, malware scanner, model upload integration or remote deletion API.

## Native connected-device gate

The service URL starts empty and must be entered manually. The application does not preset a developer IP or assume that the device can use localhost. Source code, build artifacts, and headless runs cannot verify picker, permission, or device behavior. Validate the connected-device flow as follows:

1. Use an authorized WeChat host/device and valid local AppID, with actual `wx.chooseMessageFile`, `wx.uploadFile`, UploadTask progress and abort support. Put known UTF-8 .txt/.md files in the host's selectable messages. Record fixture byte counts and SHA-256 independently.
2. Start the H5 dev service with an explicitly chosen device-reachable bind address. Enter the full device-reachable `/__varo_attachment_demo/upload` URL in the native page. Configure permitted upload domains/TLS in the authorized host; do not disable security or invent credentials. The plugin admits only its own resolved Host/origin, so an unconfigured proxy URL is not automatically accepted.
3. Open the real chooser; cancel it once, then choose real files. Confirm names/actual sizes, unknown MIME where absent, ready status and blocked send. Try denied permission and invalid/over-limit selection. Retain the actual host error; do not replace missing APIs with fixtures.
4. Enable deliberate pacing and upload a large allowed file. Observe real progress, blocked send/removal, disable input, then cancel. Close any still-open host chooser manually. Remove/reselect or retry and verify no late callback restores an obsolete item/receipt.
5. Exercise explicit 503 rejection/recovery/retry. Check service storage and exact acknowledged bytes/digest against the known fixture; only then accept uploaded status. Configure an unreachable service and record the actual transport/domain failure.
6. Submit nonempty text with accepted receipts; confirm retained text/items, external reset, revoked grants, and close/unmount disposal. Shut down the dev server and inspect that only its owned temp resources were removed.

These steps must run on an authorized connected host to verify native picker, permission, progress, abort, and upload behavior. Implementation code alone does not establish that they have passed.

## Authored E2E boundaries

`apps/e2e/tests/h5/attachments.e2e.ts` creates and removes exclusive temporary files, keeps the chooser pending with `webRuntime.interceptFileChoosers()`, and operates its DOM input through `setInputFiles(selector, paths)`, without DataTransfer/evaluate. Success cases compare uploaded bytes and actual file digests. Other cases cover upload screenshots, whole-selection limits, HTTP rejection/retry, server text validation, disabled cancellation/late results, disposal, grants, and controlled text. A separate fault-injection case returns 2xx bodies with missing fields, an invalid UUID, a mismatched byte count, or a malformed digest, verifying that they cannot create receipts or unlock submission. These responses do not demonstrate successful uploads.

`apps/e2e/tests/weapp-native/attachments.e2e.ts` checks reachable native components: missing-service messages, no fabricated attachments/receipts, grants, optional controlled text, disabled input, and disposal. It neither skips device-upload assertions nor treats headless fixtures as an OS picker; connected-device steps remain separately required. Authored scenarios and guides do not prove execution. Integration requires independent verification of generation, types, builds, installed dependencies, service safety/cleanup, runtime screenshots, and the native package budget.
