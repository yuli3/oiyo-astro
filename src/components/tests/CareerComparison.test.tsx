// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import CareerComparison from '../career/CareerComparison'
import RiasecCareerTest from './RiasecCareerTest'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

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
