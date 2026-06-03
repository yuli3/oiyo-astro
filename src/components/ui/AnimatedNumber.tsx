import React, { useState, useEffect } from 'react'

interface Props {
  value: number
  suffix?: string
}

/* Lazy-loads @number-flow/react only in browser to avoid
   Cloudflare Workers SSR context crashing on HTMLElement. */
export default function AnimatedNumber({ value, suffix = '' }: Props) {
  const [NF, setNF] = useState<React.ComponentType<{ value: number }> | null>(null)

  useEffect(() => {
    import('@number-flow/react').then(m => setNF(() => m.default))
  }, [])

  if (!NF) return <span>{value}{suffix}</span>
  return <><NF value={value} />{suffix}</>
}
