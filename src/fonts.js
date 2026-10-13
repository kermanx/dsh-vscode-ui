/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: Theme/platform
 * Adaptation: Platform UI/code defaults in DSH font roles; localized fallbacks retain user-selected font priority.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
/** Platform defaults from vscode-ui foundations; explicit DSH font lists take precedence. */
export function platformFonts(document) {
  const platform = document.documentElement.dataset.platform || document.defaultView?.navigator.platform || ''
  let text
  let code
  let localized
  if (/darwin|mac/i.test(platform)) {
    text = '-apple-system, BlinkMacSystemFont, sans-serif'
    code = '"SF Mono", Monaco, Menlo, Courier, monospace'
    localized = {
      'zh-CN,zh-Hans': '"PingFang SC", "Hiragino Sans GB"',
      'zh-TW,zh-HK,zh-Hant': '"PingFang TC"',
      ja: '"Hiragino Kaku Gothic Pro"',
      ko: '"Apple SD Gothic Neo", "Nanum Gothic", "AppleGothic"',
    }
  } else if (/win/i.test(platform)) {
    text = '"Segoe WPC", "Segoe UI", sans-serif'
    code = 'Consolas, "Courier New", monospace'
    localized = {
      'zh-CN,zh-Hans': '"Microsoft YaHei"',
      'zh-TW,zh-HK,zh-Hant': '"Microsoft Jhenghei"',
      ja: '"Yu Gothic UI", "Meiryo UI"',
      ko: '"Malgun Gothic", "Dotom"',
    }
  } else if (/linux/i.test(platform)) {
    text = 'system-ui, "Ubuntu", "Droid Sans", sans-serif'
    code = '"Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace'
    localized = {
      'zh-CN,zh-Hans': '"Source Han Sans SC", "Source Han Sans CN", "Source Han Sans"',
      'zh-TW,zh-HK,zh-Hant': '"Source Han Sans TC", "Source Han Sans TW", "Source Han Sans"',
      ja: '"Source Han Sans J", "Source Han Sans JP", "Source Han Sans"',
      ko: '"Source Han Sans K", "Source Han Sans KR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim"',
    }
  } else {
    return ''
  }
  return `body {
    --dsh-font-family-text-default: ${text};
    --dsh-font-family-code-default: ${code};
    font-family: var(--dsw-font-family);
  }
  ${Object.entries(localized).map(([languages, family]) => `${languages.split(',').map(language => `body:lang(${language})`).join(', ')} {
    --dsh-font-family-text-default: ${text.replace('sans-serif', `${family}, sans-serif`)};
    --dsh-font-family-code-default: ${code.replace('monospace', `${family}, monospace`)};
  }`).join('\n')}`
}
