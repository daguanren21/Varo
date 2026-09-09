---
"@varo-ui/cli": major
---

Support third-party local and HTTP registries and self-contained shadcn-vue exports. Registry resolution now returns a Promise; await resolveRegistryItems().

Reject lossy non-UTF-8 exports and conflicting file/ancestor destinations before emitting an export or writing consumer files, while preserving byte-for-byte binary installs.

Accept standard shadcn-vue catalog and item definitions for local/HTTP installation and self-contained export, resolve consumer aliases, and relocate imports between installed Vue/TypeScript files without requiring Varo-specific manifest fields.
