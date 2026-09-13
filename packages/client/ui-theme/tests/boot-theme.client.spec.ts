// @vitest-environment jsdom
/** The theme bootstrap injection row and the resulting pre-plugin browser theme. */
import { runInNewContext } from 'node:vm'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { bootThemeInjection } from '../src/boot-theme.ts'
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from '../src/theme-settings.ts'

const DARK_ATTRIBUTE = 'data-ds-dark-theme'
const FONT_FAMILY_ATTRIBUTE = 'data-dsh-font-family'
const WIDE_SPACING_ATTRIBUTE = 'data-dsh-wide-spacing'

function mockSystemDark(matches: boolean): void {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches }) as MediaQueryList))
}

function executeBootstrap(section: Partial<ThemeSettings> = {}): void {
  const row = bootThemeInjection({ ...DEFAULT_THEME_SETTINGS, ...section })
  if (row.kind !== 'script') throw new Error('theme bootstrap row is not a script')
  runInNewContext(row.text, { document, matchMedia: globalThis.matchMedia })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.style.removeProperty('color-scheme')
  document.body.removeAttribute(DARK_ATTRIBUTE)
  document.body.removeAttribute(FONT_FAMILY_ATTRIBUTE)
  document.body.removeAttribute(WIDE_SPACING_ATTRIBUTE)
  document.body.style.removeProperty('--dsh-content-font-size')
})

describe('theme bootstrap row', () => {
  it('is a body script row, so it runs before the shell mount', () => {
    mockSystemDark(false)
    const row = bootThemeInjection({ ...DEFAULT_THEME_SETTINGS, preference: 'dark' })
    expect(row).toMatchObject({ kind: 'script', placement: 'body' })
    executeBootstrap({ preference: 'dark' })
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.body.hasAttribute(DARK_ATTRIBUTE)).toBe(true)
  })

  it('lets durable light override a dark OS and clears stale dark state', () => {
    document.body.setAttribute(DARK_ATTRIBUTE, '')
    mockSystemDark(true)
    executeBootstrap({ preference: 'light' })
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.body.hasAttribute(DARK_ATTRIBUTE)).toBe(false)
  })

  it.each([
    [true, 'dark', true],
    [false, 'light', false],
  ] as const)('resolves system=%s to %s', (matches, colorScheme, dark) => {
    mockSystemDark(matches)
    executeBootstrap({ preference: 'system' })
    expect(document.documentElement.style.colorScheme).toBe(colorScheme)
    expect(document.body.hasAttribute(DARK_ATTRIBUTE)).toBe(dark)
  })

  it('defaults to system and falls back to light when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    executeBootstrap()
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.body.hasAttribute(DARK_ATTRIBUTE)).toBe(false)
  })

  it('writes the durable content font size and defaults it to 14px', () => {
    mockSystemDark(false)
    executeBootstrap({ fontSize: 28 })
    expect(document.body.style.getPropertyValue('--dsh-content-font-size')).toBe('28px')
    executeBootstrap()
    expect(document.body.style.getPropertyValue('--dsh-content-font-size')).toBe('14px')
  })

  it('writes the reading font family and the wide-spacing toggle before first paint', () => {
    mockSystemDark(false)
    executeBootstrap({ fontFamily: 'verdana', wideSpacing: true })
    expect(document.body.getAttribute(FONT_FAMILY_ATTRIBUTE)).toBe('verdana')
    expect(document.body.hasAttribute(WIDE_SPACING_ATTRIBUTE)).toBe(true)
  })

  it('clears a stale wide-spacing attribute when the durable section has it off', () => {
    document.body.setAttribute(WIDE_SPACING_ATTRIBUTE, '')
    mockSystemDark(false)
    executeBootstrap({ wideSpacing: false })
    expect(document.body.hasAttribute(WIDE_SPACING_ATTRIBUTE)).toBe(false)
    expect(document.body.getAttribute(FONT_FAMILY_ATTRIBUTE)).toBe('system')
  })
})
