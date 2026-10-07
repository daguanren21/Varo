import 'vue'

declare module 'vue' {
  type UniLifecycleHooks = App.AppInstance & Page.PageInstance
  interface ComponentCustomOptions extends UniLifecycleHooks {}
}
