import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { CareerExample } from '@/lib/career-exploration'
import { CAREER_NOTES_KEY, careerPairKey, createCareerNoteStore, type CareerNoteDraft, type CareerNoteRecord, type NoteRead, type NoteStatus } from '@/lib/career-exploration-storage'
import { CAREER_STORAGE_COPY } from './career-note-storage-copy'

type Props = { locale: keyof typeof CAREER_STORAGE_COPY; draft: CareerNoteDraft; catalog: readonly CareerExample[]; onRestore: (record: CareerNoteRecord) => void }
type Pending = { kind: 'restore'; record: CareerNoteRecord } | { kind: 'remove'; ids: string[] } | { kind: 'clear' | 'save' }
const fingerprint = (draft: CareerNoteDraft) => JSON.stringify({ careerIds: [...draft.careerIds].sort(), activities: draft.activities })

export default function CareerNoteStorage({ locale, draft, catalog, onRestore }: Props) {
  const copy = CAREER_STORAGE_COPY[locale]
  const id = useId()
  const reloadButton = useRef<HTMLButtonElement>(null)
  const confirmButton = useRef<HTMLButtonElement>(null)
  const catalogKey = JSON.stringify(catalog.map(row => row.id))
  const store = useMemo(() => {
    let storage: Storage | null = null
    try { if (typeof window !== 'undefined') storage = window.localStorage ?? null } catch { /* 2026-10-12: private-mode denial must leave temporary reflection available. */ }
    return createCareerNoteStore(storage, JSON.parse(catalogKey))
  }, [catalogKey])
  const [snapshot, setSnapshot] = useState<NoteRead>({ status: 'empty', revision: null, records: [] })
  const [message, setMessage] = useState<NoteStatus | 'saved' | 'restored' | 'deleted'>('empty')
  const [consent, setConsent] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const [baseline, setBaseline] = useState<string | null>(null)
  const current = snapshot.records.find(row => careerPairKey(row.careerIds) === careerPairKey(draft.careerIds))
  const signature = fingerprint(draft)
  useEffect(() => {
    const value = store.read()
    setSnapshot(value); setMessage(value.status)
    const changed = (event: StorageEvent) => {
      if (event.key !== CAREER_NOTES_KEY && event.key !== null) return
      // 2026-10-12 contract: another tab must never silently replace an in-progress reflection.
      reloadButton.current?.focus()
      setMessage('conflict'); setPending(null)
    }
    window.addEventListener('storage', changed)
    return () => window.removeEventListener('storage', changed)
  }, [store])
  useEffect(() => { if (pending) confirmButton.current?.focus() }, [pending])
  function accept(value: NoteRead, success: 'saved' | 'deleted') {
    setSnapshot(value)
    setMessage(['ok', 'empty'].includes(value.status) ? success : value.status)
    if (['ok', 'empty'].includes(value.status)) setBaseline(success === 'saved' ? signature : null)
  }
  function confirm() {
    if (!pending) return
    reloadButton.current?.focus()
    if (pending.kind === 'restore') {
      const fresh = store.read()
      if (!['ok', 'empty'].includes(fresh.status) || fresh.revision !== snapshot.revision) {
        setMessage(['ok', 'empty'].includes(fresh.status) ? 'conflict' : fresh.status)
      } else {
        onRestore(pending.record); setBaseline(fingerprint(pending.record)); setMessage('restored')
      }
    } else if (pending.kind === 'save') accept(store.save(draft, snapshot.revision), 'saved')
    else if (pending.kind === 'remove') accept(store.remove(pending.ids, snapshot.revision), 'deleted')
    else accept(store.clear(snapshot.revision), 'deleted')
    setPending(null)
  }
  const healthy = ['ok', 'empty'].includes(snapshot.status) && message !== 'conflict'
  const statusText = baseline !== null && baseline !== signature && ['saved', 'restored', 'ok'].includes(message)
    ? copy.dirty : message === 'saved' ? copy.saved : message === 'restored' ? copy.restored : message === 'deleted' ? copy.deleted : copy.status[message]
  return <section aria-labelledby={`${id}-title`} className="space-y-3 border-t border-border pt-5">
    <h6 id={`${id}-title`} className="text-base font-semibold">{copy.title}</h6>
    <p id={`${id}-privacy`} className="text-sm leading-relaxed text-muted-foreground">{copy.privacy}</p>
    <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
      <input data-career-storage-consent type="checkbox" className="mt-1 size-5 shrink-0 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" checked={consent} aria-describedby={`${id}-privacy`} onChange={event => { setConsent(event.target.checked); setPending(null) }} />{copy.consent}
    </label>
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
      <Button type="button" className="h-auto min-h-11 max-w-full whitespace-normal" disabled={!consent || !healthy} onClick={() => {
        if (current) setPending({ kind: 'save' })
        else accept(store.save(draft, snapshot.revision), 'saved')
      }}>{copy.save}</Button>
      {current && <Button type="button" variant="outline" className="h-auto min-h-11 max-w-full whitespace-normal" disabled={!healthy} onClick={() => setPending({ kind: 'restore', record: current })}>{copy.restore}</Button>}
      <Button ref={reloadButton} type="button" variant="outline" className="h-auto min-h-11 max-w-full whitespace-normal" onClick={() => { const value = store.read(); setSnapshot(value); setMessage(value.status); setPending(null) }}>{copy.reload}</Button>
    </div>
    <p role="status" aria-atomic="true" className="text-sm leading-relaxed">{statusText}</p>
    {snapshot.records.length > 0 && <div className="space-y-3">
      <p className="text-sm font-medium">{copy.list} · {snapshot.records.length} / 10</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{copy.hint}</p>
      <ul className="space-y-3">{snapshot.records.map(record => <li key={careerPairKey(record.careerIds)} className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="min-w-0 break-words text-sm">{record.careerIds.map(careerId => catalog.find(row => row.id === careerId)?.title ?? careerId).join(' / ')}</span>
        <Button type="button" variant="outline" className="h-auto min-h-11 max-w-full shrink-0 whitespace-normal" disabled={message === 'conflict'} aria-label={`${copy.remove}: ${record.careerIds.map(careerId => catalog.find(row => row.id === careerId)?.title ?? careerId).join(' / ')}`} onClick={() => setPending({ kind: 'remove', ids: record.careerIds })}>{copy.remove}</Button>
      </li>)}</ul>
    </div>}
    {snapshot.revision !== null && <Button type="button" variant="outline" className="h-auto min-h-11 max-w-full whitespace-normal" disabled={message === 'conflict'} onClick={() => setPending({ kind: 'clear' })}>{copy.clear}</Button>}
    {pending && <div role="group" aria-label={pending.kind === 'restore' ? copy.confirmRestore : pending.kind === 'save' ? copy.confirmSave : copy.confirmRemove} className="space-y-3 rounded-md border border-border p-4">
      <p className="text-sm leading-relaxed">{pending.kind === 'restore' ? copy.confirmRestore : pending.kind === 'save' ? copy.confirmSave : copy.confirmRemove}</p>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
        <Button ref={confirmButton} type="button" className="h-auto min-h-11 max-w-full whitespace-normal" onClick={confirm}>{pending.kind === 'restore' ? copy.replace : pending.kind === 'save' ? copy.overwrite : copy.confirmDelete}</Button>
        <Button type="button" variant="outline" className="h-auto min-h-11 max-w-full whitespace-normal" onClick={() => { reloadButton.current?.focus(); setPending(null) }}>{copy.cancel}</Button>
      </div>
    </div>}
  </section>
}
