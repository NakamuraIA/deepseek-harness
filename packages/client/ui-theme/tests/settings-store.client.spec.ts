/** Appearance, font-size, and reading row stores: snapshot-mirror actions and the revision guards. */
import { describe, expect, it } from 'vitest'
import {
  createAppearanceRowStore, createFontSizeRowStore, createReadingRowStore,
} from '../src/client/settings-store.ts'

describe('createAppearanceRowStore', () => {
  it('init shape: system preference with revision at -1 and no failed write', () => {
    const store = createAppearanceRowStore().create()
    expect(store.getSnapshot()).toEqual({ preference: 'system', revision: -1, writeFailed: false })
  })

  it('sync mirrors the preference and advances the revision', () => {
    const store = createAppearanceRowStore().create()
    store.actions.sync('dark', 0)
    expect(store.getSnapshot()).toEqual({ preference: 'dark', revision: 0, writeFailed: false })
    store.actions.sync('light', 2)
    expect(store.getSnapshot().preference).toBe('light')
    expect(store.getSnapshot().revision).toBe(2)
  })

  it('revision guard drops stale and duplicate writes', () => {
    const store = createAppearanceRowStore().create()
    store.actions.sync('dark', 3)
    store.actions.sync('system', 2)
    store.actions.sync('system', 3)
    expect(store.getSnapshot().preference).toBe('dark')
    expect(store.getSnapshot().revision).toBe(3)
  })

  it('markWriteFailed records a refused write outside the revision guard', () => {
    const store = createAppearanceRowStore().create()
    store.actions.markWriteFailed(true)
    store.actions.sync('dark', 3)
    expect(store.getSnapshot()).toEqual({ preference: 'dark', revision: 3, writeFailed: true })
    store.actions.markWriteFailed(false)
    expect(store.getSnapshot().writeFailed).toBe(false)
  })
})

describe('createFontSizeRowStore', () => {
  it('init shape: default size with revision at -1 and no failed write', () => {
    const store = createFontSizeRowStore().create()
    expect(store.getSnapshot()).toEqual({ fontSize: 14, revision: -1, writeFailed: false })
  })

  it('sync mirrors the size; the revision guard drops stale and duplicate writes', () => {
    const store = createFontSizeRowStore().create()
    store.actions.sync(16, 3)
    expect(store.getSnapshot()).toEqual({ fontSize: 16, revision: 3, writeFailed: false })
    store.actions.sync(12, 2)
    store.actions.sync(12, 3)
    expect(store.getSnapshot().fontSize).toBe(16)
    expect(store.getSnapshot().revision).toBe(3)
  })

  it('markWriteFailed records a refused write outside the revision guard', () => {
    const store = createFontSizeRowStore().create()
    store.actions.markWriteFailed(true)
    store.actions.sync(16, 3)
    expect(store.getSnapshot()).toEqual({ fontSize: 16, revision: 3, writeFailed: true })
  })
})

describe('createReadingRowStore', () => {
  it('init shape: default family, spacing off, revision at -1, no failed write', () => {
    const store = createReadingRowStore().create()
    expect(store.getSnapshot()).toEqual({ fontFamily: 'system', wideSpacing: false, revision: -1, writeFailed: false })
  })

  it('sync mirrors both facts on one revision; the guard drops stale and duplicate writes', () => {
    const store = createReadingRowStore().create()
    store.actions.sync('verdana', true, 3)
    expect(store.getSnapshot()).toEqual({ fontFamily: 'verdana', wideSpacing: true, revision: 3, writeFailed: false })
    store.actions.sync('comic', false, 2)
    store.actions.sync('comic', false, 3)
    expect(store.getSnapshot().fontFamily).toBe('verdana')
    expect(store.getSnapshot().wideSpacing).toBe(true)
    expect(store.getSnapshot().revision).toBe(3)
  })

  it('markWriteFailed records a refused write outside the revision guard', () => {
    const store = createReadingRowStore().create()
    store.actions.markWriteFailed(true)
    store.actions.sync('comic', true, 3)
    expect(store.getSnapshot()).toEqual({ fontFamily: 'comic', wideSpacing: true, revision: 3, writeFailed: true })
  })
})
