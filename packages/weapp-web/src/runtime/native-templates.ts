export const nativeTemplates: Record<string, string> = {
  'view': '<slot />',
  'text': '<slot />',
  'button': '<button id="control" class="varo-native-button__control" type="button"><slot /></button>',
  'input': '<input id="control" class="varo-native-input__control" />',
  'textarea': '<textarea id="control" class="varo-native-textarea__control"></textarea>',
  'label': '<label id="control" class="varo-native-label__control"><slot /></label>',
  'image': '<img id="control" class="varo-native-image__control" />',
  'scroll-view': '<slot />',
  'rich-text': '<span id="control" class="varo-native-rich-text__content"></span><slot />',
  'map': '<div id="control" class="varo-native-map__surface" role="application"><div id="tiles" class="varo-native-map__tiles"></div><div id="canvas" class="varo-native-map__canvas"></div><div id="label" class="varo-native-map__label"></div><slot /></div>',
  'wechat-robot-chat': '<div id="control" class="varo-native-robot-chat__surface" role="log"><div id="messages" class="varo-native-robot-chat__messages"></div><operate-card class="varo-native-robot-chat__operate" /><slot /></div>',
}
