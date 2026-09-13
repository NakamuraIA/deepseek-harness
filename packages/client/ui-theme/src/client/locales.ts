/** `settings.theme` namespace dictionaries (the Appearance, font-size, and reading rows' copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'appearance.title': '外观',
  'appearance.light': '浅色',
  'appearance.dark': '深色',
  'appearance.system': '跟随系统',
  'fontSize.title': '字号大小',
  'fontSize.description': '仅影响会话内容的字号',
  'fontSize.unit': 'px',
  'fontSize.increase': '增大字号',
  'fontSize.decrease': '减小字号',
  'reading.title': '阅读',
  'reading.description': '会话文字的字体与间距',
  'reading.font.label': '阅读字体',
  'reading.font.system': '默认',
  'reading.font.verdana': 'Verdana',
  'reading.font.tahoma': 'Tahoma',
  'reading.font.comic': 'Comic Sans',
  'reading.spacing.label': '宽间距阅读',
  'reading.spacing.description': '增大字距、词距与行距',
  'write.failed': '未保存——仍在使用之前的值。',
} satisfies Record<string, string>

/** The settings.theme namespace key union. */
export type ThemeKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'appearance.title': 'Appearance',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'fontSize.title': 'Font size',
  'fontSize.description': 'Only affects conversation content',
  'fontSize.unit': 'px',
  'fontSize.increase': 'Increase font size',
  'fontSize.decrease': 'Decrease font size',
  'reading.title': 'Reading',
  'reading.description': 'Font and spacing for conversation text',
  'reading.font.label': 'Reading font',
  'reading.font.system': 'Default',
  'reading.font.verdana': 'Verdana',
  'reading.font.tahoma': 'Tahoma',
  'reading.font.comic': 'Comic Sans',
  'reading.spacing.label': 'Wide reading',
  'reading.spacing.description': 'More space between letters, words, and lines',
  'write.failed': 'Not saved — the previous value is still in effect.',
} satisfies Record<ThemeKey, string>
