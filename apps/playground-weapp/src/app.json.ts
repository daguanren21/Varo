import manifest from '../app.manifest.json'

export default {
  ...manifest,
  ...(process.env.WEAPP_A2UI_DEMO === '1'
    // WeChat DevTools can fail to start when A2UI follows the built-in subpackages.
    ? { subPackages: [{ root: 'pages/agent-a2ui', pages: ['index'] }, ...manifest.subPackages] }
    : {}),
  ...(process.env.WEAPP_ROBOT_CHAT === '1'
    ? {
        pages: [...manifest.pages, 'pages/robot-chat-showcase/index', 'pages/web-preview-robot-chat/index', 'pages/docs-robot-chat/index'],
        plugins: {
          varoRobot: { version: '1.1.15', provider: 'wx8c631f7e9f2465e1' },
        },
      }
    : {}),
}
