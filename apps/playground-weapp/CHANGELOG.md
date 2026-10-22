# @varo/playground-weapp

## Unreleased

- Keep the four retail tabs in the main package and load the fourteen existing non-tab demo directories, the native button preview, and the documentation previews as ordinary subpackages, without changing route URLs or removing existing subpackages. Register the new `blocks-lab/attachments/index` demo. Robot pages remain opt-in through the browser-preview profile.
- Keep shared retail image URL modules at their main-owned asset paths through the compiler's scoped shared-chunk policy. Give compiler-injected Oxc runtime helpers and their dependency closure a main-owned chunk before demo common groups can absorb them. Other modules retain the compiler's default package strategy.
- Package subpackage-only native components beside their consumers, including template and stylesheet dependency ownership. Reject file/directory destination conflicts before writing and check streaming scoped-slot boundaries in localized copies.
- Reserve a 1.5 MB compiled main-package budget for real-debug overhead and enforce 2 MiB per subpackage. Reject missing page/component/script dependencies and synchronous main-to-subpackage or cross-subpackage references. Recursive style checks remain part of the same verifier. These artifact checks do not certify DevTools upload accounting or device execution; on-demand subpackage navigation latency is not measured.

## 0.1.0

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@2.2.0
  - @varo-ui/theme@2.2.0
  - @varo-ui/weapp@2.2.0

## 0.1.0

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@2.1.0
  - @varo-ui/theme@2.1.0
  - @varo-ui/weapp@2.1.0

## 0.1.0

### Patch Changes

- Updated dependencies:
  - @varo-ui/ai@2.0.0
  - @varo-ui/headless@2.0.0
  - @varo-ui/theme@2.0.0
  - @varo-ui/weapp@2.0.0

## 0.1.0

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@1.2.0
  - @varo-ui/theme@1.2.0
  - @varo-ui/weapp@1.2.0

## 0.1.0

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@1.1.0
  - @varo-ui/theme@1.1.0
  - @varo-ui/weapp@1.1.0

## 0.1.0

### Patch Changes

- Updated dependencies:
  - @varo-ui/headless@1.0.1
  - @varo-ui/theme@1.0.1
  - @varo-ui/weapp@1.0.1

## 0.1.0

### Patch Changes

- Updated dependencies:
  - @varo-ui/ai@1.0.0
  - @varo-ui/theme@1.0.0
  - @varo-ui/weapp@1.0.0
