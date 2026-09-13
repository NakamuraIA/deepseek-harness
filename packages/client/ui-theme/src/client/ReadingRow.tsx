/**
 * Reading row registered into the General section item slot: title, the
 * reading-font pills over the persisted family, and the wide-reading spacing
 * switch. Registered by this package — the theme feature owns the reading
 * preferences the same way it owns the appearance and font-size ones.
 * Selection follows the persisted values, never the click echo.
 */
import { Pill, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { FONT_FAMILIES, type FontFamily } from '../theme-settings.ts'
import type { ThemeKey } from './locales.ts'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { createReadingRowStore } from './settings-store.ts'
import css from './ReadingRow.module.css'

/** Injected business face: the two preference writes (t rides the standard locale seat). */
export interface ReadingRowInjected {
  /** Select the reading font family. */
  setFontFamily: (family: FontFamily) => void
  /** Turn the wider letter, word, and line spacing on or off. */
  setWideSpacing: (wide: boolean) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type ReadingRowComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createReadingRowStore>>
  & PropsLocale<'settings.theme'> & ReadingRowInjected

/** Pill order and copy keys, one per selectable family id. */
const FAMILY_LABELS: Readonly<Record<FontFamily, ThemeKey>> = {
  system: 'reading.font.system',
  verdana: 'reading.font.verdana',
  tahoma: 'reading.font.tahoma',
  comic: 'reading.font.comic',
}

/**
 * Render the reading row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function ReadingRow({ t, setFontFamily, setWideSpacing, useStore }: ReadingRowComponentProps) {
  const fontFamily = useStore(s => s.fontFamily)
  const wideSpacing = useStore(s => s.wideSpacing)
  const writeFailed = useStore(s => s.writeFailed)
  return (
    <div className={css.group}>
      <div className={css.rowText}>
        <div className={css.title}>{t('reading.title')}</div>
        <div className={css.desc}>{t('reading.description')}</div>
      </div>
      <div className={css.field}>
        <div className={css.fieldLabel}>{t('reading.font.label')}</div>
        <div className={css.pills}>
          {FONT_FAMILIES.map(family => (
            <Pill
              key={family}
              active={fontFamily === family}
              aria-pressed={fontFamily === family}
              onClick={() => { setFontFamily(family) }}
            >
              {t(FAMILY_LABELS[family])}
            </Pill>
          ))}
        </div>
      </div>
      <div className={css.fieldRow}>
        <div className={css.fieldText}>
          <div className={css.fieldLabel}>{t('reading.spacing.label')}</div>
          <div className={css.desc}>{t('reading.spacing.description')}</div>
        </div>
        <Switch
          checked={wideSpacing}
          label={t('reading.spacing.label')}
          onChange={(next) => { setWideSpacing(next) }}
        />
      </div>
      {writeFailed && <div className={css.failure} role="status">{t('write.failed')}</div>}
    </div>
  )
}
