/**
 * Appearance, font-size, and reading row slot stores: mirrors of the theme
 * service snapshot. The plugin's apply-world change listener is the only
 * writer; the row components read via props.useStore. Each store also carries
 * the settlement of the last write its own row asked for, so a refused or lost
 * write shows beside the control instead of silently snapping back.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import {
  DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, DEFAULT_WIDE_SPACING,
  type FontFamily, type ThemePreference,
} from '../theme-settings.ts'

/** Store state mirrored from the theme snapshot. */
export interface AppearanceRowState {
  /** Persisted preference (selection state reads this, never the resolved active theme). */
  preference: ThemePreference
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
  /** Whether the last theme write this row asked for was refused or lost. */
  writeFailed: boolean
}

/** Declared action shape giving the exported factory a stable return type. */
type AppearanceRowActions = {
  sync: (draft: AppearanceRowState, preference: ThemePreference, revision: number) => void
  markWriteFailed: (draft: AppearanceRowState, failed: boolean) => void
}

/**
 * Declares the Appearance row state and write surface.
 * @returns the store handle.
 */
export function createAppearanceRowStore(): EngineStoreHandle<AppearanceRowState, AppearanceRowActions> {
  return defineStore({
    init: (): AppearanceRowState => ({ preference: 'system', revision: -1, writeFailed: false }),
    actions: {
      sync: (d, preference: ThemePreference, revision: number) => {
        if (revision <= d.revision) return
        d.preference = preference
        d.revision = revision
      },
      // Deliberately outside the revision guard: a refused write publishes no
      // snapshot, so its settlement is the only fact that can carry it.
      markWriteFailed: (d, failed: boolean) => { d.writeFailed = failed },
    },
  })
}

/** Store state mirrored from the theme snapshot's font size. */
export interface FontSizeRowState {
  /** Persisted content font size in px. */
  fontSize: number
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
  /** Whether the last font-size write this row asked for was refused or lost. */
  writeFailed: boolean
}

/** Declared action shape giving the exported factory a stable return type. */
type FontSizeRowActions = {
  sync: (draft: FontSizeRowState, fontSize: number, revision: number) => void
  markWriteFailed: (draft: FontSizeRowState, failed: boolean) => void
}

/**
 * Declares the font-size row state and write surface.
 * @returns the store handle.
 */
export function createFontSizeRowStore(): EngineStoreHandle<FontSizeRowState, FontSizeRowActions> {
  return defineStore({
    init: (): FontSizeRowState => ({ fontSize: DEFAULT_FONT_SIZE, revision: -1, writeFailed: false }),
    actions: {
      sync: (d, fontSize: number, revision: number) => {
        if (revision <= d.revision) return
        d.fontSize = fontSize
        d.revision = revision
      },
      markWriteFailed: (d, failed: boolean) => { d.writeFailed = failed },
    },
  })
}

/** Store state mirrored from the theme snapshot's reading preferences. */
export interface ReadingRowState {
  /** Persisted reading font family. */
  fontFamily: FontFamily
  /** Persisted wide-reading spacing toggle. */
  wideSpacing: boolean
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
  /** Whether the last reading write this row asked for was refused or lost. */
  writeFailed: boolean
}

/** Declared action shape giving the exported factory a stable return type. */
type ReadingRowActions = {
  sync: (draft: ReadingRowState, fontFamily: FontFamily, wideSpacing: boolean, revision: number) => void
  markWriteFailed: (draft: ReadingRowState, failed: boolean) => void
}

/**
 * Declares the reading row state and write surface.
 * @returns the store handle.
 */
export function createReadingRowStore(): EngineStoreHandle<ReadingRowState, ReadingRowActions> {
  return defineStore({
    init: (): ReadingRowState => ({
      fontFamily: DEFAULT_FONT_FAMILY,
      wideSpacing: DEFAULT_WIDE_SPACING,
      revision: -1,
      writeFailed: false,
    }),
    actions: {
      // Both facts travel on one revision: they change together on adoption, and
      // a consumer reading them from separate stores could render a mixed pair.
      sync: (d, fontFamily: FontFamily, wideSpacing: boolean, revision: number) => {
        if (revision <= d.revision) return
        d.fontFamily = fontFamily
        d.wideSpacing = wideSpacing
        d.revision = revision
      },
      markWriteFailed: (d, failed: boolean) => { d.writeFailed = failed },
    },
  })
}
