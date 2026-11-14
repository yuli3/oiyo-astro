import { expect, it } from 'vitest'
import { createCareerNoteStore, CAREER_NOTES_KEY } from './career-exploration-storage'

const draft = { careerIds: ['z', 'a'], activities: Array.from({ length: 3 }, (_, activityId) => ({ activityId, fields: ['An interesting task', '', ''], done: false })) }
function memory() {
  const data = new Map<string, string>()
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => { data.delete(key) } }
}

it('saves only on request and restores the same pair independent of order', () => {
  const store = createCareerNoteStore(memory(), ['a', 'z'])
  expect(store.read().status).toBe('empty')
  const saved = store.save(draft, null)
  expect(saved.status).toBe('ok')
  expect(store.read().records[0]).toMatchObject({ careerIds: ['a', 'z'], activities: draft.activities })
})

it('preserves damaged and future data and rejects malformed drafts without writing', () => {
  const storage = memory()
  const store = createCareerNoteStore(storage, ['a', 'z'])
  for (const [raw, status] of [['{broken', 'corrupt'], ['{"schemaVersion":2,"records":[]}', 'future']] as const) {
    storage.setItem(CAREER_NOTES_KEY, raw)
    expect(store.read().status).toBe(status)
    expect(store.save(draft, raw).status).toBe(status)
    expect(storage.getItem(CAREER_NOTES_KEY)).toBe(raw)
  }
  storage.removeItem(CAREER_NOTES_KEY)
  for (const invalid of [
    { ...draft, careerIds: ['a', 'a'] }, { ...draft, careerIds: ['a', 'unknown'] },
    { ...draft, activities: [] },
    { ...draft, activities: draft.activities.map(row => ({ ...row, fields: ['x'.repeat(1001), '', ''] })) },
  ]) expect(store.save(invalid, null).status).toBe('invalid')
  expect(store.read().status).toBe('empty')
})

it('detects stale writes, preserves other pairs, and deletes only exploration records', () => {
  const storage = memory()
  storage.setItem('oiyo:assessment-results:v2', 'untouched')
  const store = createCareerNoteStore(storage, ['a', 'z', 'm'])
  const first = store.save(draft, null)
  expect(store.save({ ...draft, careerIds: ['a', 'm'] }, null).status).toBe('conflict')
  const second = store.save({ ...draft, careerIds: ['a', 'm'] }, first.revision)
  expect(second.records).toHaveLength(2)
  const removed = store.remove(['z', 'a'], second.revision)
  expect(removed.records.map(row => row.careerIds)).toEqual([['a', 'm']])
  expect(store.clear(removed.revision).status).toBe('empty')
  expect(storage.getItem('oiyo:assessment-results:v2')).toBe('untouched')
})

it('reports blocked access and quota failure without pretending to save', () => {
  expect(createCareerNoteStore(null, ['a', 'z']).read().status).toBe('unavailable')
  const denied = { getItem() { throw new Error('denied') }, setItem() {}, removeItem() {} }
  expect(createCareerNoteStore(denied, ['a', 'z']).save(draft, null).status).toBe('unavailable')
  const storage = memory()
  const full = createCareerNoteStore({ ...storage, setItem() { throw new Error('quota') } }, ['a', 'z'])
  expect(full.save(draft, null).status).toBe('failed')
  expect(full.read().status).toBe('empty')
})

it('limits pairs and bytes without silently evicting previous notes', () => {
  const ids = Array.from({ length: 12 }, (_, i) => String(i))
  const store = createCareerNoteStore(memory(), ids)
  let state = store.read()
  for (let i = 1; i <= 10; i++) state = store.save({ ...draft, careerIds: ['0', String(i)] }, state.revision)
  expect(state.records).toHaveLength(10)
  expect(store.save({ ...draft, careerIds: ['0', '11'] }, state.revision).status).toBe('limit')
  const heavy = { ...draft, activities: draft.activities.map(note => ({ ...note, fields: Array(3).fill('한'.repeat(1000)) })) }
  const bytes = createCareerNoteStore(memory(), ids)
  let snapshot = bytes.read()
  for (let i = 1; i <= 9; i++) snapshot = bytes.save({ ...heavy, careerIds: ['0', String(i)] }, snapshot.revision)
  expect(snapshot.records).toHaveLength(9)
  expect(bytes.save({ ...heavy, careerIds: ['0', '10'] }, snapshot.revision).status).toBe('limit')
  expect(bytes.read().records).toHaveLength(9)
})

it('validates stored shapes and projects reflection data without importing profile fields', () => {
  const storage = memory()
  const store = createCareerNoteStore(storage, ['a', 'z'])
  const record = { ...draft, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z', birthCity: 'not part of this schema', scores: { R: 20 } }
  for (const broken of [
    { ...record, careerIds: ['a', 'missing'] }, { ...record, createdAt: null },
    { ...record, activities: [{ activityId: 0, fields: [1, '', ''], done: false }] },
    { ...record, activities: draft.activities.map(note => ({ ...note, done: 'yes' })) },
  ]) {
    storage.setItem(CAREER_NOTES_KEY, JSON.stringify({ schemaVersion: 1, records: [broken] }))
    expect(store.read().status).toBe('corrupt')
  }
  storage.setItem(CAREER_NOTES_KEY, JSON.stringify({ schemaVersion: 1, records: [record, record] }))
  expect(store.read().status).toBe('corrupt')
  storage.setItem(CAREER_NOTES_KEY, JSON.stringify({ schemaVersion: 1, records: [record] }))
  const before = store.read()
  expect(before.records[0]).not.toHaveProperty('birthCity')
  const after = store.save({ ...draft, activities: draft.activities.map(note => ({ ...note, fields: ['新しいメモ', '', ''] })) }, before.revision)
  expect(after.records[0].createdAt).toBe('2026-10-10T00:00:00.000Z')
  expect(storage.getItem(CAREER_NOTES_KEY)).not.toContain('scores')
  expect(store.clear(after.revision).status).toBe('empty')
})
