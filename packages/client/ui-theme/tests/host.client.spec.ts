import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import type { IndexInjection } from '@deepseek-ai/dsh-host-webserver'
import { SettingsProvider, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import {
  DEFAULT_FONT_FAMILY, DEFAULT_PREFERENCE, DEFAULT_WIDE_SPACING, THEME_SETTINGS_NAMESPACE, apply,
} from '@deepseek-ai/dsh-client-ui-theme'

class MemorySettings extends SettingsProvider {
  readonly writable = true
  protected load(): Promise<Record<string, unknown>> { return Promise.resolve({}) }
  protected persist(_ns: SettingsNamespace, _section: Record<string, unknown>): Promise<void> {
    return Promise.resolve()
  }
}

/** Collect the injection table the way an index render or boot payload does. */
function collect(ctx: Context): IndexInjection[] {
  const table: IndexInjection[] = []
  ctx.emit('webserver/index-inject', table)
  return table
}

/** Narrow the theme row and return its script body. */
function scriptText(row: IndexInjection | undefined): string {
  if (row?.kind !== 'script') throw new Error('expected a script row')
  return row.text
}

describe('ui-theme host', () => {
  it('registers, validates, and disposes the durable theme namespace with its fiber', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    const fiber = ctx.plugin({ apply })
    await fiber.await()
    const ns = THEME_SETTINGS_NAMESPACE
    expect(ctx.settings.get(ns)).toEqual({
      preference: DEFAULT_PREFERENCE,
      fontSize: 14,
      fontFamily: DEFAULT_FONT_FAMILY,
      wideSpacing: DEFAULT_WIDE_SPACING,
    })
    await ctx.settings.update(ns, { preference: 'dark', fontSize: 16, fontFamily: 'verdana', wideSpacing: true })
    expect(ctx.settings.get(ns)).toEqual({ preference: 'dark', fontSize: 16, fontFamily: 'verdana', wideSpacing: true })
    await expect(ctx.settings.update(ns, { preference: 'sepia' })).rejects.toThrow()
    await expect(ctx.settings.update(ns, { fontSize: 11 })).rejects.toThrow()
    await expect(ctx.settings.update(ns, { fontSize: 29 })).rejects.toThrow()
    await expect(ctx.settings.update(ns, { fontFamily: 'papyrus' })).rejects.toThrow()
    await expect(ctx.settings.update(ns, { wideSpacing: 'yes' })).rejects.toThrow()
    await fiber.dispose()
    expect(ctx.settings.describe().map(row => row.ns)).not.toContain(ns)
  })

  it('answers each collection with the current durable section until disposal', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    const fiber = ctx.plugin({ apply })
    await fiber.await()
    const rows = collect(ctx)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ kind: 'script', placement: 'body' })
    expect(scriptText(rows[0])).toContain('const preference = "system"')
    expect(scriptText(rows[0])).toContain('"14px"')
    expect(scriptText(rows[0])).toContain('setAttribute(\'data-dsh-font-family\', "system")')
    expect(scriptText(rows[0])).toContain('toggleAttribute(\'data-dsh-wide-spacing\', false)')
    await ctx.settings.update(THEME_SETTINGS_NAMESPACE, {
      preference: 'dark', fontSize: 28, fontFamily: 'comic', wideSpacing: true,
    })
    expect(scriptText(collect(ctx)[0])).toContain('const preference = "dark"')
    expect(scriptText(collect(ctx)[0])).toContain('"28px"')
    expect(scriptText(collect(ctx)[0])).toContain('setAttribute(\'data-dsh-font-family\', "comic")')
    expect(scriptText(collect(ctx)[0])).toContain('toggleAttribute(\'data-dsh-wide-spacing\', true)')
    await fiber.dispose()
    expect(collect(ctx)).toEqual([])
  })

  it('uses the system preference without a settings provider', async () => {
    const ctx = new Context()
    await ctx.plugin({ apply }).await()
    expect(scriptText(collect(ctx)[0])).toContain('const preference = "system"')
  })

  it('falls back to the schema default while the theme namespace holds no section', async () => {
    // A settings provider whose namespace read comes back empty (registration
    // still pending or a provider without schema defaults).
    const ctx = new Context()
    ctx.provide('settings', { register: () => () => {}, get: () => undefined } as never)
    await ctx.plugin({ apply }).await()
    expect(scriptText(collect(ctx)[0])).toContain('const preference = "system"')
  })
})
