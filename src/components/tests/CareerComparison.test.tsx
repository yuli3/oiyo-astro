// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, expect, it } from 'vitest'
// @ts-expect-error jsdom is loaded by vitest environment
import { JSDOM } from 'jsdom'
import { CAREER_STORAGE_COPY } from '../career/career-note-storage-copy'
import { CAREER_NOTES_KEY, createCareerNoteStore } from '@/lib/career-exploration-storage'
import CareerComparison from '../career/CareerComparison'
import RiasecCareerTest from './RiasecCareerTest'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => {
  // Node 26 exposes its own localStorage getter; use a real origin-scoped DOM storage instead.
  Object.defineProperty(window, 'localStorage', { configurable: true, value: new JSDOM('', { url: 'https://oiyo.net' }).window.localStorage })
})

it('saves only by explicit choice, restores after confirmation and deletes only saved exploration notes', async () => {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const button = (text: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === text)!
  try {
    window.localStorage.setItem('unrelated', 'keep')
    await act(async () => root.render(<CareerComparison locale="en" careers={[
      { id: 'a', title: 'Alpha work', code: 'I', description: 'Explore' },
      { id: 'z', title: 'Zebra work', code: 'R', description: 'Build' },
    ]} onRemove={() => {}} />))
    await act(async () => button('Find tasks in a listing · about 15 min').click())
    const field = host.querySelector('textarea')!
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(field, 'My private reflection')
      field.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(window.localStorage.getItem(CAREER_NOTES_KEY)).toBeNull()
    expect(button('Save in this browser').disabled).toBe(true)
    await act(async () => host.querySelector<HTMLInputElement>('input[data-career-storage-consent]')!.click())
    await act(async () => button('Save in this browser').click())
    expect(host.textContent).toContain('Saved in this browser.')
    await act(async () => button('Clear notes for this activity').click())
    expect(host.textContent).toContain('Changed since saving.')
    await act(async () => button('Restore this pair').click())
    expect(host.querySelector('textarea')!.value).toBe('')
    await act(async () => button('Replace current notes').click())
    expect(host.querySelector('textarea')!.value).toBe('My private reflection')
    await act(async () => button('Delete all saved exploration notes').click())
    await act(async () => button('Confirm deletion').click())
    expect(window.localStorage.getItem(CAREER_NOTES_KEY)).toBeNull()
    expect(window.localStorage.getItem('unrelated')).toBe('keep')
    expect(host.querySelector('textarea')!.value).toBe('My private reflection')
  } finally { await act(async () => root.unmount()); host.remove() }
})

it('shows storage failure without losing the draft and detects changes in another tab', async () => {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const button = (text: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === text)!
  const real = window.localStorage
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: real.getItem.bind(real), removeItem: real.removeItem.bind(real),
    setItem() { throw new DOMException('Quota exceeded', 'QuotaExceededError') },
  } })
  try {
    await act(async () => root.render(<CareerComparison locale="en" careers={[
      { id: 'a', title: 'Alpha work', code: 'I', description: 'Explore' },
      { id: 'z', title: 'Zebra work', code: 'R', description: 'Build' },
    ]} onRemove={() => {}} />))
    await act(async () => button('Find tasks in a listing · about 15 min').click())
    const field = host.querySelector('textarea')!
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(field, 'Keep this draft')
      field.dispatchEvent(new Event('input', { bubbles: true }))
      host.querySelector<HTMLInputElement>('input[data-career-storage-consent]')!.click()
    })
    await act(async () => button('Save in this browser').click())
    expect(host.textContent).toContain('The storage change failed.')
    expect(host.querySelector('textarea')!.value).toBe('Keep this draft')
    await act(async () => window.dispatchEvent(new StorageEvent('storage', { key: CAREER_NOTES_KEY })))
    expect(host.textContent).toContain('Another tab changed the records.')
    expect(document.activeElement).toBe(button('Reload saved list'))
    expect(button('Save in this browser').disabled).toBe(true)
  } finally { await act(async () => root.unmount()); host.remove() }
})

it.each(Object.keys(CAREER_STORAGE_COPY) as (keyof typeof CAREER_STORAGE_COPY)[])('provides explicit storage and damaged-data recovery in %s', async locale => {
  const host = document.createElement('div')
  const root = createRoot(host)
  const copy = CAREER_STORAGE_COPY[locale]
  window.localStorage.setItem(CAREER_NOTES_KEY, '{broken')
  try {
    await act(async () => root.render(<CareerComparison locale={locale} careers={[
      { id: 'a', title: 'Alpha work', code: 'I', description: 'Explore' },
      { id: 'z', title: 'Zebra work', code: 'R', description: 'Build' },
    ]} onRemove={() => {}} />))
    expect(host.textContent).toContain(copy.status.corrupt)
    const button = (text: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === text)!
    expect(button(copy.save).disabled).toBe(true)
    await act(async () => button(copy.clear).click())
    expect(window.localStorage.getItem(CAREER_NOTES_KEY)).toBe('{broken')
    await act(async () => button(copy.confirmDelete).click())
    expect(window.localStorage.getItem(CAREER_NOTES_KEY)).toBeNull()
    expect(host.textContent).toContain(copy.deleted)
  } finally { await act(async () => root.unmount()); host.remove() }
})

it('restores saved original-language notes after remounting in another locale, never automatically', async () => {
  const store = createCareerNoteStore(window.localStorage, ['a', 'z'])
  store.save({ careerIds: ['z', 'a'], activities: Array.from({ length: 3 }, (_, activityId) => ({ activityId, fields: ['한국어로 남긴 메모', '', ''], done: true })) }, null)
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const button = (text: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === text)!
  try {
    await act(async () => root.render(<CareerComparison locale="ja" careers={[
      { id: 'a', title: '研究職', code: 'I', description: '研究する' },
      { id: 'z', title: '制作職', code: 'A', description: '作る' },
    ]} onRemove={() => {}} />))
    expect(host.querySelectorAll('textarea')).toHaveLength(0)
    expect(host.textContent).not.toContain('한국어로 남긴 메모')
    await act(async () => button(CAREER_STORAGE_COPY.ja.restore).click())
    await act(async () => button(CAREER_STORAGE_COPY.ja.replace).click())
    expect(host.querySelector('textarea')!.value).toBe('한국어로 남긴 메모')
    expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true)
    expect(document.activeElement).toBe(button(CAREER_STORAGE_COPY.ja.reload))
  } finally { await act(async () => root.unmount()); host.remove() }
})

it('returns focus to the selected activity when the reader skips it', async () => {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  try {
    await act(async () => root.render(<CareerComparison locale="en" careers={[
      { id: 'a', title: 'Alpha work', code: 'I', description: 'Explore questions' },
      { id: 'z', title: 'Zebra work', code: 'R', description: 'Build things' },
    ]} onRemove={() => {}} />))
    const button = (text: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === text)!
    const activity = button('Find tasks in a listing · about 15 min')
    await act(async () => activity.click())
    const skip = button('Skip for now')
    skip.focus()
    await act(async () => skip.click())
    expect(host.querySelectorAll('textarea')).toHaveLength(0)
    expect(document.activeElement).toBe(activity)
  } finally {
    await act(async () => root.unmount())
    host.remove()
  }
})

it('keeps separate activity notes, clears only the current activity and resets notes when careers change', async () => {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const careers = [
    { id: 'a', title: 'Alpha work', code: 'I', description: 'Explore questions' },
    { id: 'z', title: 'Zebra work', code: 'R', description: 'Build things' },
  ]
  const render = (chosen = careers) => root.render(<CareerComparison locale="en" careers={chosen} onRemove={() => {}} />)
  const button = (text: string) => [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === text)!
  const write = async (value: string) => {
    const field = host.querySelector('textarea')!
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(field, value)
      field.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }
  try {
    await act(async () => render())
    await act(async () => button('Find tasks in a listing · about 15 min').click())
    await write('I compared three daily tasks.')
    await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click())
    await act(async () => button('Make a private draft · about 20 min').click())
    await write('I drafted a diagram.')
    await act(async () => button('Find tasks in a listing · about 15 min').click())
    expect(host.querySelector('textarea')!.value).toBe('I compared three daily tasks.')
    expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true)
    await act(async () => button('Clear notes for this activity').click())
    expect(host.querySelector('textarea')!.value).toBe('')
    expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(false)
    await act(async () => button('Make a private draft · about 20 min').click())
    expect(host.querySelector('textarea')!.value).toBe('I drafted a diagram.')
    await act(async () => render([careers[0], { id: 'm', title: 'Middle work', code: 'S', description: 'Help people' }]))
    expect(host.querySelectorAll('textarea')).toHaveLength(0)
    await act(async () => button('Make a private draft · about 20 min').click())
    expect(host.querySelector('textarea')!.value).toBe('')
    expect(host.textContent).toContain('no automatic saving')
  } finally {
    await act(async () => root.unmount())
    host.remove()
  }
})

it('compares two chosen careers and lets the reader remove either without losing the other', async () => {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  try {
    await act(async () => root.render(<CareerComparison locale="en" careers={[
      { id: 'a', title: 'Alpha work', code: 'I', description: 'Explore questions' },
      { id: 'z', title: 'Zebra work', code: 'R', description: 'Build things' },
    ]} onRemove={() => root.render(<CareerComparison locale="en" careers={[
      { id: 'z', title: 'Zebra work', code: 'R', description: 'Build things' },
    ]} onRemove={() => {}} />)} />))
    expect(host.textContent).toContain('Alpha work')
    expect(host.textContent).toContain('Build things')
    const remove = host.querySelector<HTMLButtonElement>('button[aria-label="Remove Alpha work"]')!
    expect(remove).not.toBeNull()
    await act(async () => remove.click())
    expect(host.textContent).not.toContain('Alpha work')
    expect(host.textContent).toContain('Zebra work')
    expect(host.textContent).toContain('Choose one more career')
  } finally {
    await act(async () => root.unmount())
    host.remove()
  }
})

it('selects only two careers through the real result list and restores focus after removal', async () => {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  try {
    await act(async () => root.render(<RiasecCareerTest locale="en" careerExamples={[
      { id: 'a', title: 'Alpha work', code: 'I', description: 'Explore questions' },
      { id: 'z', title: 'Zebra work', code: 'R', description: 'Build things' },
      { id: 'm', title: 'Middle work', code: 'S', description: 'Help people' },
    ]} />))
    // A complete tied response fixture exercises the same result surface as a real reader.
    for (let q = 0; q < 24; q++) {
      const option = host.querySelector<HTMLButtonElement>('button[aria-pressed]')!
      expect(option).not.toBeNull()
      await act(async () => option.click())
    }
    const add = (title: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="Add to comparison: ${title}"]`)!
    await act(async () => add('Alpha work').click())
    await act(async () => add('Zebra work').click())
    expect(add('Middle work').disabled).toBe(true)
    expect(host.querySelectorAll('article')).toHaveLength(2)
    expect(host.textContent).toContain('Your interest scores are close')
    await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="Remove Alpha work"]')!.click())
    expect(add('Middle work').disabled).toBe(false)
    expect(host.querySelectorAll('article')).toHaveLength(1)
    expect(document.activeElement).toBe(add('Alpha work'))
  } finally {
    await act(async () => root.unmount())
    host.remove()
  }
})
