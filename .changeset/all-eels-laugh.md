---
"@varo-ui/ai": major
"@varo-ui/cli": major
"@varo-ui/weapp": major
---

Replace the private Agent event protocol, SSE transport, and stream controller with direct TanStack AI / AG-UI consumption. Registry Agent renderers and Blocks now accept TanStack ChatClientSnapshot; applications own the ChatClient and interrupt resolution. Keep Markdown, text presentation pacing, and thread-version helpers in @varo-ui/ai. Upgrade the native compiler and Wevu to 7.10.0 and use the published Web API runtime for standard streaming Fetch and cancellation.

Keep trusted native-preview host bindings in an outer lexical scope so compiler-provided Web API declarations can shadow them without duplicate-binding parse failures.

Verify the 7.10.0 native slot integration with execution-slot parent reactivity and child events, cancelable Dialog composition, Menu selection, and form-array runtime scenarios. Remove stale documentation claiming that plain-slot context is still blocked upstream, while retaining explicit opt-in and host/device evidence boundaries.

Remove obsolete management-chunk relocation after the 7.10.0 compiler bundles those helpers into page/shared chunks. Validate actual emitted synchronous script dependencies and package ownership instead of requiring removed standalone files; keep native page, style, asset and package-size gates.

Let comparison applications supply confirmed completion/cancellation outcomes independently of the TanStack ready state, preserving truthful result labels and side-specific stop/retry behavior.

Preserve SDK message parts and historical tool receipts, keep failed tool states authoritative, and surface interrupt validation/transport errors with application-owned resubmission, retry, and cancellation. Bind approval intents to the rendered interrupt transaction, validate edited mall tool arguments before execution, complete documentation tool-result events, and preserve CommonJS parameters inside the native-preview isolation wrapper.

Keep native approval controls scoped to keyed WXML list items so replaced transactions cannot reuse captured identities, and derive cancellation availability from serializable SDK metadata rather than methods removed by native property transport.
