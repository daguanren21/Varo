import manifest from '../app.manifest.json'

export default {
  ...manifest,
  ...(process.env.WEAPP_ROBOT_CHAT === '1'
    ? {
        pages: [...manifest.pages, 'pages/robot-chat-showcase/index', 'pages/web-preview-robot-chat/index'],
        plugins: {
          varoRobot: { version: '1.1.15', provider: 'wx8c631f7e9f2465e1' },
        },
      }
    : {}),
}
