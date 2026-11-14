export const CAREER_NOTES_KEY = 'oiyo:career-exploration:v1'
export type ActivityNote = { activityId: number; fields: string[]; done: boolean }
export type CareerNoteDraft = { careerIds: string[]; activities: ActivityNote[] }
export type CareerNoteRecord = CareerNoteDraft & { createdAt: string; updatedAt: string }
export type NoteStatus = 'ok' | 'empty' | 'unavailable' | 'corrupt' | 'future' | 'failed' | 'conflict' | 'limit' | 'invalid'
export type NoteRead = { status: NoteStatus; records: CareerNoteRecord[]; revision: string | null }
export type NoteStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
const MAX_BYTES = 256 * 1024
const byteLength = (value: string) => new TextEncoder().encode(value).length

export function careerPairKey(ids: readonly string[]) { return JSON.stringify([...ids].sort()) }

export function createCareerNoteStore(storage: NoteStorage | null, allowedIds: readonly string[]) {
  const allowed = new Set(allowedIds)
  const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
  function validDraft(value: unknown): value is CareerNoteDraft {
    if (!object(value) || !Array.isArray(value.careerIds) || value.careerIds.length !== 2 ||
      !value.careerIds.every(id => typeof id === 'string' && allowed.has(id)) || value.careerIds[0] === value.careerIds[1] ||
      !Array.isArray(value.activities) || value.activities.length !== 3) return false
    return value.activities.every((note, index) => object(note) && note.activityId === index && typeof note.done === 'boolean' &&
      Array.isArray(note.fields) && note.fields.length === 3 && note.fields.every(field => typeof field === 'string' && field.length <= 1000))
  }
  const result = (status: NoteStatus, revision: string | null = null, records: CareerNoteRecord[] = []): NoteRead => ({ status, revision, records })
  function read(): NoteRead {
    if (!storage) return result('unavailable')
    let revision: string | null
    try { revision = storage.getItem(CAREER_NOTES_KEY) } catch { return result('unavailable') }
    if (revision === null) return result('empty')
    try {
      const value: unknown = JSON.parse(revision)
      if (!object(value)) return result('corrupt', revision)
      if (typeof value.schemaVersion === 'number' && value.schemaVersion > 1) return result('future', revision)
      if (byteLength(revision) > MAX_BYTES || value.schemaVersion !== 1 || !Array.isArray(value.records) || value.records.length > 10 || !value.records.every(record =>
        object(record) && typeof record.createdAt === 'string' && Number.isFinite(Date.parse(record.createdAt)) &&
        typeof record.updatedAt === 'string' && Number.isFinite(Date.parse(record.updatedAt)) && validDraft(record))) return result('corrupt', revision)
      const records: CareerNoteRecord[] = value.records.map(record => ({
        careerIds: [...record.careerIds].sort(), createdAt: record.createdAt, updatedAt: record.updatedAt,
        activities: record.activities.map((note: ActivityNote) => ({ activityId: note.activityId, fields: [...note.fields], done: note.done })),
      }))
      if (new Set(records.map(row => careerPairKey(row.careerIds))).size !== records.length) return result('corrupt', revision)
      return result('ok', revision, records)
    } catch { return result('corrupt', revision) }
  }
  function save(draft: CareerNoteDraft, expected: string | null): NoteRead {
    const previous = read()
    if (!storage || !['ok', 'empty'].includes(previous.status)) return previous
    if (!validDraft(draft)) return result('invalid', previous.revision, previous.records)
    if (previous.revision !== expected) return result('conflict', previous.revision, previous.records)
    const now = new Date().toISOString()
    const key = careerPairKey(draft.careerIds)
    const existing = previous.records.find(row => careerPairKey(row.careerIds) === key)
    // 2026-10-12 approved storage contract: project only reflection fields, never assessment or profile payloads.
    const record = { careerIds: [...draft.careerIds].sort(), activities: draft.activities.map(note => ({ activityId: note.activityId, fields: [...note.fields], done: note.done })), createdAt: existing?.createdAt ?? now, updatedAt: now }
    return write([record, ...previous.records.filter(row => careerPairKey(row.careerIds) !== key)], previous)
  }
  function write(records: CareerNoteRecord[], previous: NoteRead): NoteRead {
    const raw = JSON.stringify({ schemaVersion: 1, records })
    if (records.length > 10 || byteLength(raw) > MAX_BYTES) return result('limit', previous.revision, previous.records)
    try { storage!.setItem(CAREER_NOTES_KEY, raw); return read() } catch { return result('failed', previous.revision, previous.records) }
  }
  function remove(ids: readonly string[], expected: string | null): NoteRead {
    const previous = read()
    if (!storage || !['ok', 'empty'].includes(previous.status)) return previous
    if (previous.revision !== expected) return result('conflict', previous.revision, previous.records)
    const records = previous.records.filter(row => careerPairKey(row.careerIds) !== careerPairKey(ids))
    return records.length ? write(records, previous) : clear(expected)
  }
  function clear(expected: string | null): NoteRead {
    const previous = read()
    if (!storage || previous.status === 'unavailable') return previous
    if (previous.revision !== expected) return result('conflict', previous.revision, previous.records)
    // 2026-10-12: explicit deletion is allowed even for damaged/future data; other domain keys remain untouched.
    try { storage.removeItem(CAREER_NOTES_KEY); return read() } catch { return result('failed', previous.revision, previous.records) }
  }
  return { read, save, remove, clear }
}
