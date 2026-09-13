/** Host registration for the browser theme preference and pre-plugin palette. */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-settings'
import { bootThemeInjection } from './boot-theme.ts'
import {
  DEFAULT_THEME_SETTINGS, THEME_SETTINGS_NAMESPACE, ThemeSettingsSchema,
  type ThemeSettings,
} from './theme-settings.ts'

export {
  DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_PREFERENCE, DEFAULT_THEME_SETTINGS,
  DEFAULT_WIDE_SPACING, FONT_FAMILIES, FONT_FAMILY_FIELD, FONT_SIZE_FIELD, FONT_SIZE_MAX,
  FONT_SIZE_MIN, THEME_PREFERENCE_FIELD, THEME_PREFERENCES, THEME_SETTINGS_NAMESPACE,
  WIDE_SPACING_FIELD, isFontFamily, isThemePreference,
  type FontFamily, type ThemePreference, type ThemeSettings,
} from './theme-settings.ts'

const THEME_NAMESPACE = THEME_SETTINGS_NAMESPACE

/** Read the registered theme section or the schema defaults without a settings provider. */
function readSection(ctx: Context): ThemeSettings {
  const settings = ctx.get('settings')
  if (settings === undefined) return DEFAULT_THEME_SETTINGS
  const section = settings.get(THEME_NAMESPACE) as ThemeSettings | undefined
  return section ?? DEFAULT_THEME_SETTINGS
}

/**
 * Register the durable theme section when the optional settings service is
 * composed, and answer every index injection collection with the current
 * theme bootstrap row.
 * @param ctx - Host context that may acquire the settings service.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(THEME_NAMESPACE, ThemeSettingsSchema)
  })
  ctx.on('webserver/index-inject', (table) => {
    table.push(bootThemeInjection(readSection(ctx)))
  })
}
