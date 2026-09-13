/**
 * Theme bootstrap row for the browser's pre-plugin interval. Each index render
 * embeds the current durable theme section; the browser resolves only
 * `system`, then writes the same DOM fields ui-layout's ThemePresenter owns
 * after the client plugin tree activates.
 */

import type { IndexInjection } from '@deepseek-ai/dsh-host-webserver'
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from './theme-settings.ts'

/** Build the inline script body for one schema-validated durable theme section. */
function bootThemeScript(section: ThemeSettings): string {
  return `(() => {
  const preference = ${JSON.stringify(section.preference)}
  const systemDark = preference === 'system'
    && typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-color-scheme: dark)').matches
  const dark = preference === 'dark' || systemDark
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  document.body.toggleAttribute('data-ds-dark-theme', dark)
  document.body.style.setProperty('--dsh-content-font-size', ${JSON.stringify(`${section.fontSize}px`)})
  document.body.setAttribute('data-dsh-font-family', ${JSON.stringify(section.fontFamily)})
  document.body.toggleAttribute('data-dsh-wide-spacing', ${JSON.stringify(section.wideSpacing)})
})()`
}

/**
 * The theme bootstrap as an injection row: an inline script immediately after
 * the opening body tag, before the shell mount and module script.
 * @param section - Current Host-backed theme section (schema defaults when the settings provider is absent).
 * @returns the body script row.
 */
export function bootThemeInjection(section: ThemeSettings = DEFAULT_THEME_SETTINGS): IndexInjection {
  return { kind: 'script', placement: 'body', text: bootThemeScript(section) }
}
