/** Theme preferences stored in the Host user-settings document. */

import z from '@deepseek-ai/schemastery'

/** Built-in preferences accepted at the registry and settings boundaries. */
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const

/** Settings namespace owned by the theme plugin. */
export const THEME_SETTINGS_NAMESPACE = 'ui-theme'

/** Field carrying the selected built-in theme preference. */
export const THEME_PREFERENCE_FIELD = 'preference'

/** Field carrying the conversation content font size. */
export const FONT_SIZE_FIELD = 'fontSize'

/** Field carrying the reading font family. */
export const FONT_FAMILY_FIELD = 'fontFamily'

/** Field carrying the wide-reading spacing toggle. */
export const WIDE_SPACING_FIELD = 'wideSpacing'

/** Theme preference persisted by the product Appearance row. */
export type ThemePreference = typeof THEME_PREFERENCES[number]

/**
 * Reading font choices. Each id selects a stack in the theme stylesheets
 * (`--dsw-font-family`); `system` is the stylesheet default, so no rule
 * overrides it. Ids are persisted values: renaming one discards the user's
 * choice on the next read.
 */
export const FONT_FAMILIES = ['system', 'verdana', 'tahoma', 'comic'] as const

/** Reading font family persisted by the product Reading row. */
export type FontFamily = typeof FONT_FAMILIES[number]

/** Default preference when the user-settings document has no override. */
export const DEFAULT_PREFERENCE: ThemePreference = 'system'

/**
 * Smallest accepted content font size (px). The whole conversation axis scales
 * with this value, so the range is what a reader can actually work at, not a
 * safe upper bound for layout: every size-dependent measurement is expressed as
 * a delta from {@link DEFAULT_FONT_SIZE} rather than a fixed pixel value.
 */
export const FONT_SIZE_MIN = 12

/** Largest accepted content font size (px). */
export const FONT_SIZE_MAX = 28

/** Content font size when the user-settings document has no override (px). */
export const DEFAULT_FONT_SIZE = 14

/** Reading font when the user-settings document has no override. */
export const DEFAULT_FONT_FAMILY: FontFamily = 'system'

/** Wide-reading spacing when the user-settings document has no override. */
export const DEFAULT_WIDE_SPACING = false

/** Durable theme section shared by the Host schema and the browser scope. */
export interface ThemeSettings {
  /** Selected built-in preference. */
  preference: ThemePreference
  /** Conversation content font size in px (integer within {@link FONT_SIZE_MIN}..{@link FONT_SIZE_MAX}). */
  fontSize: number
  /** Reading font family for the conversation text. */
  fontFamily: FontFamily
  /** Whether the conversation text carries the wider letter, word, and line spacing. */
  wideSpacing: boolean
}

/** Durable theme schema; also the wire envelope the browser scope validates against. */
export const ThemeSettingsSchema: z<ThemeSettings> = z.object({
  [THEME_PREFERENCE_FIELD]: z.union([...THEME_PREFERENCES]).default(DEFAULT_PREFERENCE),
  [FONT_SIZE_FIELD]: z.number().step(1).min(FONT_SIZE_MIN).max(FONT_SIZE_MAX).default(DEFAULT_FONT_SIZE),
  [FONT_FAMILY_FIELD]: z.union([...FONT_FAMILIES]).default(DEFAULT_FONT_FAMILY),
  [WIDE_SPACING_FIELD]: z.boolean().default(DEFAULT_WIDE_SPACING),
})

/**
 * The complete section with every default filled in — the pre-plugin bootstrap
 * and the browser fallback path read a whole section, so neither repeats the
 * per-field defaults.
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = Object.freeze({
  preference: DEFAULT_PREFERENCE,
  fontSize: DEFAULT_FONT_SIZE,
  fontFamily: DEFAULT_FONT_FAMILY,
  wideSpacing: DEFAULT_WIDE_SPACING,
})

/**
 * Narrow one wire or registry value to a persistable preference.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in preference.
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.some(preference => preference === value)
}

/**
 * Narrow one wire or registry value to a persistable reading font.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value names a supported reading font.
 */
export function isFontFamily(value: unknown): value is FontFamily {
  return FONT_FAMILIES.some(family => family === value)
}
