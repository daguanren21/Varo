# Agent Attachment Composer

Select a real local file, transfer actual bytes, validate a service acknowledgement, then submit a text message with accepted attachments. These are four separate application states. Selection and upload progress are **not** upload success.

## Install and ownership

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-attachment-composer
pnpm dlx @varo-ui/cli add --target weapp components/agent-attachment-composer
```

Choose one target. Install the npm dependencies reported by the CLI; configure native global styles as described in [Wevu Registry](/en/guide/shadcn-mode). Only stable H5/Weapp are admitted. This optional unit composes `agent-conversation`, Button, primitives and `utils/attachment-transfer`; it does not add dependencies to AgentChat or import the full `agent-ui`/advanced aggregate. The transfer utility can also be installed independently.

- `src/components/agent-ui/AgentAttachmentComposer.vue`: presentation and guarded intents, not transfer state.
- `src/components/agent-ui/agent-attachment-composer.types.ts`: presentation contracts.
- `src/lib/attachment-transfer/attachment-transfer.ts`: metadata, policy, tasks, errors and pure validation.
- `src/lib/attachment-transfer/attachment-transfer.h5.ts`: browser adapter.
- `src/lib/attachment-transfer/attachment-transfer.weapp.ts`: native adapter. The installer copies only the selected adapter; distinct stems avoid collisions with common types.

Create one adapter per application owner. Keep File objects/native paths private to it, not in reactive UI snapshots. Application state owns items, attempt identity, accepted receipts, messages and draft updates. It decides URL, headers, browser credentials, response parsing, retry, cancellation, retention and remote deletion policy.

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

`MyReceipt` is your application's receipt type. Each `select()` and `upload(id, options)` returns `{ promise, cancel() }`. Invoke `select()` synchronously from a user gesture; await its promise in the application. It yields metadata `{ id, name, size, mime? }`. Native MIME is absent when the host does not provide it. `maxCount` bounds **all retained sources**, while `maxBytes` is per file. Both limits must be positive safe integers and the extension list explicit. Native rejects a count policy above the host's 100-file maximum. Over-limit/invalid selections are rejected as a whole, never sliced. The picker filter is only a hint; returned metadata is validated again. Extensions and MIME are not proof of content authenticity.

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

Failures reject with `AttachmentTransferError`: `validation`, `unavailable`, `permission`, `transport`, `http` (with status), `receipt`, `cancelled`, `disposed`, or `missing`. Native permission classification preserves the host message. Browser CORS/permission failures that XHR does not distinguish remain transport failures. A 2xx without a valid receipt is not accepted. Cancellation settles once and suppresses later progress/results. Native **cannot promise dismissal of an open OS chooser**: cancel invalidates the result; the user may still need to close the host UI. Cancellation does not promise remote rollback.

`release(id)` cancels active uploads for that ID and drops its retained source; `dispose()` cancels all owned tasks and drops all sources. Neither deletes remote objects or native host-owned temporary files. Drop application references too. Disposed adapters cannot be reused; create a fresh owner. The demos additionally guard every callback with attempt identity, so cancellation, removal, replacement and unmount cannot accept an obsolete result.

## Presentation and controlled text

`AttachmentItem<R>` supplies `file`, `status: ready | uploading | uploaded | failed | cancelled`, optional actual `progress`, `failure`, `receipt`, and `grants` for `upload`, `retry`, `cancel`, `remove`.

| Prop                 | Meaning                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| `items?`             | Current application items; empty by default                                     |
| `modelValue?`        | Optional controlled text; omission owns an initially empty local draft          |
| `disabled?`, `busy?` | Existing Composer editing/busy behavior; prevent new transfer actions           |
| `canChoose?`         | Explicit selection grant, default false                                         |
| `choosing?`          | Application has an active selection; blocks submission and exposes cancellation |
| `suggestions?`       | Forwarded to existing Composer; blocked while attachments are unresolved        |

Events are single-value/object payloads on both targets: `choose`, `cancelSelection`, `update:modelValue(string)`, `action({ id, action })`, and `submit({ prompt, attachments: [{ file, receipt }] })`. Actions re-find the current ID and current grant at activation; they do not mutate status optimistically. Cancel remains available during disabled/busy input, if granted and uploading. Removal during upload is forbidden: cancel first. Long names/errors wrap rather than disappearing into ellipses.

Submission requires nonempty trimmed text **and every selected item to be `uploaded` with a non-null receipt**. Ready, uploading, failed, cancelled or unacknowledged items block Send, Enter/native confirm and suggestions, but not otherwise editable draft input. The wrapper passes the shared `AgentComposer.submitDisabled` contract rather than duplicating its input/send controls. Applications must validate supplied receipts themselves and recheck state/grants when accepting intents. The wrapper never clears text or items automatically.

Optional text ownership follows `useControllableState`, not truthiness. Explicit `''` is controlled; native absent metadata is `null`, and required collections have explicit Array/[] metadata. Switching to uncontrolled ownership does not copy a controlled draft into a second owner.

## Real local service demonstration

- H5: `/?demo=attachments`, `apps/playground-h5/src/features/AttachmentDemo.vue` and `useAttachmentDemo.ts`.
- Native: `/blocks-lab/attachments/index`, with its own `useAttachmentDemo.ts`.
- Dev-only service: `apps/playground-h5/scripts/attachment-demo.ts`, exporting `attachmentDemoPlugin()` for H5 Vite configuration.
- Exact upload route: `POST /__varo_attachment_demo/upload`; no query, download or remote-delete route.

This is a **local file-transfer service, not a production backend or model**. It uses Node's built-in multipart parser, streams through an actual byte bound, accepts exactly one `file` part, checks .txt/.md plus UTF-8 without NUL bytes, and writes actual bytes under a generated UUID in a uniquely owned OS temporary directory. It returns HTTP 201 with `{ id, bytes, sha256 }` only after writing. The application validates ID, source byte count and SHA-256 shape; the browser E2E compares the digest to the actual test file. Never use client filenames as storage paths.

Limits: 8 MiB/file, 8 MiB + 64 KiB/multipart body, 4 concurrent requests, 64 stored files and 32 MiB reserved/stored quota. Invalid methods, paths, body shapes, content encodings, foreign Origin and unexpected Host are rejected. The request must explicitly carry `X-Varo-Attachment-Demo: local-transfer`; this is intent, **not authentication**. Native may omit Origin; browser Origin must match this server's resolved origin. No CORS bypass is installed. Keep the dev server private; do not deploy this service or expose private files/credentials. Quota exhaustion is an explicit 507 requiring dev-server restart/owned-storage cleanup, not silent deletion.

Each request has a 30-second total deadline. Shutdown destroys only this plugin's active requests before awaiting their settlement and removing its owned storage.

“Let local service reject uploads” sends `X-Varo-Demo-Mode: reject`; the real HTTP request is parsed/validated and receives 503 without storage. “Recover local service” changes subsequent requests to `accept`; retry makes a new HTTP request. Optional deliberate pacing (`X-Varo-Demo-Pacing: paced`) waits 40ms per 16 KiB using stream backpressure, not synthesized client progress. Browser/socket buffering can report 100% sent while the service is still reading; only its acknowledgement makes the item uploaded.

Removing an item releases local retention but keeps previously accepted messages and remote files. Closing the demo aborts tasks and disposes local state; closing the dev server cleans only its owned temporary directory. A client abort racing server acceptance may still leave a stored file until server shutdown. The service is session-local; it provides no production authorization, durable storage, malware scanner, model upload integration or remote deletion API.

## Native connected-device gate

The application starts with an **empty service URL**, not a developer IP or assumed device localhost. A source/artifact/headless run is not picker, permission or device certification. To certify the real path:

1. Use an authorized WeChat host/device and valid local AppID, with actual `wx.chooseMessageFile`, `wx.uploadFile`, UploadTask progress and abort support. Put known UTF-8 .txt/.md files in the host's selectable messages. Record fixture byte counts and SHA-256 independently.
2. Start the H5 dev service with an explicitly chosen device-reachable bind address. Enter the full device-reachable `/__varo_attachment_demo/upload` URL in the native page. Configure permitted upload domains/TLS in the authorized host; do not disable security or invent credentials. The plugin admits only its own resolved Host/origin, so an unconfigured proxy URL is not automatically accepted.
3. Open the real chooser; cancel it once, then choose real files. Confirm names/actual sizes, unknown MIME where absent, ready status and blocked send. Try denied permission and invalid/over-limit selection. Retain the actual host error; do not replace missing APIs with fixtures.
4. Enable deliberate pacing and upload a large allowed file. Observe real progress, blocked send/removal, disable input, then cancel. Close any still-open host chooser manually. Remove/reselect or retry and verify no late callback restores an obsolete item/receipt.
5. Exercise explicit 503 rejection/recovery/retry. Check service storage and exact acknowledged bytes/digest against the known fixture; only then accept uploaded status. Configure an unreachable service and record the actual transport/domain failure.
6. Submit nonempty text with accepted receipts; confirm retained text/items, external reset, revoked grants, and close/unmount disposal. Shut down the dev server and inspect that only its owned temp resources were removed.

Until those steps run on an authorized connected host, native picker/permission/progress/abort/upload certification remains **externally gated**, not passed by the authored implementation.

## Authored E2E boundaries

`apps/e2e/tests/h5/attachments.e2e.ts` creates/removes real owned temporary files, uses public `webRuntime.interceptFileChoosers()` to keep the real chooser pending, then calls `setInputFiles(selector, paths)` against its DOM input. Success cases compare actual uploaded bytes and digests. Other cases cover upload-state screenshots, whole-selection limits, real HTTP rejection/retry, server text validation, disabled cancellation/late results, disposal, grants and controlled text. No DataTransfer/evaluate is used. A separate fault-injection case deliberately returns 2xx bodies with missing fields, an invalid UUID, mismatched byte count or malformed digest and verifies that they cannot create a receipt or unlock submission; those responses are not evidence of successful upload.

`apps/e2e/tests/weapp-native/attachments.e2e.ts` certifies only reachable native composition: missing-service disclosure, no fabricated attachments/receipts, grants, optional-controlled text, disabled input and disposal. It does not skip a required device upload assertion or pretend headless fixtures can open an OS picker. The connected-device steps above are a separate required external gate. Authored scenarios and guides are not claims of execution; integration generation, type/build/install closure, service safety/cleanup, runtime screenshots and native package budget are independently verified by the integration owner.
