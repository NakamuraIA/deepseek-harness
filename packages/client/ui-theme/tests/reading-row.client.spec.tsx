// @vitest-environment jsdom
/** ReadingRow behavior: font pills and the wide-spacing switch drive their
 * writes, selection follows the store mirror rather than the click echo. */
import type { GlobalStandardProps } from '@deepseek-ai/dsh-client-ui-slots'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import type { WorkspaceSnapshot } from '@deepseek-ai/dsh-api-workspace-controller/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-test-runtime'
import { ReadingRow } from '../src/client/ReadingRow.tsx'
import type { ReadingRowComponentProps } from '../src/client/ReadingRow.tsx'
import { createReadingRowStore } from '../src/client/settings-store.ts'
import type { FontFamily } from '../src/theme-settings.ts'

// Every fixture carries the resource hook the resources plugin merges into GlobalStandardProps.
const useResource = (() => ({ status: 'none' as const, value: undefined, failure: undefined, reload: () => {} })) as GlobalStandardProps['useResource']
const usePanelInfo: GlobalStandardProps['usePanelInfo'] = selector => selector({ activePanelId: null })

afterEach(cleanup)

const COPY: Record<string, string> = {
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
}

/** Empty global standard-kit hooks (the row reads neither). */
function emptySessions() {
  const store = createSnapshotStore<SessionListState>(
    { ids: [], byId: {}, current: undefined, phase: 'ready', subagentsByParent: {}, jobsBySession: {}, currentAddress: undefined })
  return bindSnapshotSelector(store)
}
function emptyWorkspaces() {
  const store = createSnapshotStore<WorkspaceSnapshot>({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready', error: null,
  })
  return bindSnapshotSelector(store)
}

type AttentionSnapshot = Parameters<Parameters<ReadingRowComponentProps['useSessionPendingInteraction']>[0]>[0]
const noAttention: AttentionSnapshot = new Map()
const useSessionPendingInteraction: ReadingRowComponentProps['useSessionPendingInteraction'] = selector => selector(noAttention)

function mount(fontFamily: FontFamily = 'system', wideSpacing = false) {
  // Real store instance — the sanctioned zero-machinery path for tests.
  const store = createReadingRowStore().create()
  store.actions.sync(fontFamily, wideSpacing, 0)
  const setFontFamily = vi.fn()
  const setWideSpacing = vi.fn()
  const props: ReadingRowComponentProps = {
    useSessions: emptySessions(),
    useSessionPendingInteraction,
    usePanelInfo, useResource,
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    setFontFamily,
    setWideSpacing,
  }
  render(<ReadingRow {...props} />)
  return { store, setFontFamily, setWideSpacing }
}

const pill = (name: string): HTMLButtonElement =>
  screen.getByRole('button', { name }) as HTMLButtonElement

describe('ReadingRow', () => {
  it('renders the title, one pill per family, and the switch state', () => {
    mount('verdana', true)
    expect(screen.getByText('Reading')).toBeDefined()
    expect(screen.getByText('Font and spacing for conversation text')).toBeDefined()
    expect(screen.getByText('Reading font')).toBeDefined()
    for (const label of ['Default', 'Verdana', 'Tahoma', 'Comic Sans']) {
      expect(pill(label)).toBeDefined()
    }
    expect(pill('Verdana').getAttribute('aria-pressed')).toBe('true')
    expect(pill('Default').getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('switch', { name: 'Wide reading' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByText('More space between letters, words, and lines')).toBeDefined()
  })

  it('pill clicks select the family while the selection follows the store mirror', () => {
    const b = mount('system', false)
    fireEvent.click(pill('Comic Sans'))
    expect(b.setFontFamily).toHaveBeenCalledWith('comic')
    // No store write yet: the mirror still reports the previous family.
    expect(pill('Default').getAttribute('aria-pressed')).toBe('true')
    act(() => { b.store.actions.sync('comic', false, 1) })
    expect(pill('Comic Sans').getAttribute('aria-pressed')).toBe('true')
    expect(pill('Default').getAttribute('aria-pressed')).toBe('false')
  })

  it('switch clicks ask for the opposite state and render the mirrored one', () => {
    const b = mount('system', false)
    const wide = screen.getByRole('switch', { name: 'Wide reading' })
    fireEvent.click(wide)
    expect(b.setWideSpacing).toHaveBeenCalledWith(true)
    expect(b.store.getSnapshot().wideSpacing).toBe(false)
    act(() => { b.store.actions.sync('system', true, 1) })
    expect(screen.getByRole('switch', { name: 'Wide reading' }).getAttribute('aria-checked')).toBe('true')
  })

  it('shows and clears the refused-write notice from the store mirror', () => {
    const b = mount('system', false)
    expect(screen.queryByRole('status')).toBeNull()
    act(() => { b.store.actions.markWriteFailed(true) })
    expect(screen.getByRole('status').textContent).toBe('Not saved — the previous value is still in effect.')
    act(() => { b.store.actions.markWriteFailed(false) })
    expect(screen.queryByRole('status')).toBeNull()
  })
})
