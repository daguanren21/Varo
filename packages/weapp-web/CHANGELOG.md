# @varo/weapp-web

## 0.0.0

### Patch Changes

- Support component-scoped Canvas2D node queries through both native instances and `wx.createSelectorQuery()`. Query results expose the attached HTML canvas and layout size, preserve existing adapter geometry/scroll fields, and reject stale detached selections. Canvas2D bitmap dimensions and transforms remain caller-owned so native property updates and resize observation do not clear drawings.

- Replace input-number ASCII steppers with named VIcon plus/minus controls and restore its compact inline geometry, pin textarea word-limit to the bottom-right, use a circular cancel-x on Input/Select without stretching Select on focus, avoid the native Input `focus` prop/handler collision, add dual-target multi-column Picker, DateField, PullRefresh, Signature, and Watermark Registry components while keeping Calendar independent, add shared motion tokens and Spectrum-inspired Button, Switch, Radio, Toast card, and VToastRegion interactions without changing the Varo palette, teach weapp-web native controls to preserve hover and ARIA semantics without Glass-Easel property warnings, pad docs API tables, preview compiled mini-program artifacts through weapp-web, and add a root `docs:dev` command with in-page H5 and Weapp primitive previews.
