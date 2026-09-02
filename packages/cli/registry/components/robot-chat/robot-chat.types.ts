export interface VaroRobotChatOptions {
  appid: string
  background?: string
  guideCardHeight?: number
  guideList?: Array<Record<string, unknown>>
  history?: boolean
  historySize?: number
  navHeight?: number
  openid?: string
  operateCardHeight?: number
  robotHeader?: string
  textToSpeech?: boolean
  userHeader?: string
  userName?: string
  welcome?: string
  [key: string]: unknown
}

export interface VaroRobotChatController {
  backHome: () => void
  inputVoiceEnd: () => void
  inputVoiceStart: () => void
  send: (query: string) => void
}

export interface VaroRobotChatPlugin {
  getChatComponent: () => VaroRobotChatController
  init: (options: VaroRobotChatOptions & {
    fail: (error: unknown) => void
    success: () => void
  }) => void
}
