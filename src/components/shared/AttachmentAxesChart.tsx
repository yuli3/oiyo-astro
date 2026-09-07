interface Props { anxiety: number; anxietyLabel: string; avoidance: number; avoidanceLabel: string; title: string }

export default function AttachmentAxesChart({ anxiety, anxietyLabel, avoidance, avoidanceLabel, title }: Props) {
  const x = 34 + Math.max(0, Math.min(100, avoidance)) * 2.22
  const y = 256 - Math.max(0, Math.min(100, anxiety)) * 2.22
  return <figure className="rounded-2xl border bg-card p-4">
    <figcaption className="mb-3 text-center text-sm font-bold">{title}</figcaption>
    <svg viewBox="0 0 290 290" role="img" aria-label={`${anxietyLabel} ${Math.round(anxiety)}%, ${avoidanceLabel} ${Math.round(avoidance)}%`} className="mx-auto block h-auto w-full" style={{ maxWidth: 340 }}>
      <rect x="34" y="34" width="222" height="222" rx="16" fill="#f7f7f2" stroke="#d6d3d1" />
      <line x1="145" y1="34" x2="145" y2="256" stroke="#a8a29e" strokeDasharray="5 5" />
      <line x1="34" y1="145" x2="256" y2="145" stroke="#a8a29e" strokeDasharray="5 5" />
      <circle cx={x} cy={y} r="15" fill="#435d31" opacity="0.16" />
      <circle cx={x} cy={y} r="7" fill="#435d31" stroke="white" strokeWidth="3" />
      <text x="145" y="282" textAnchor="middle" fontSize="12" fontWeight="700" fill="#44403c" textLength="190" lengthAdjust="spacingAndGlyphs">{avoidanceLabel} →</text>
      <text x="12" y="145" textAnchor="middle" fontSize="12" fontWeight="700" fill="#44403c" textLength="190" lengthAdjust="spacingAndGlyphs" transform="rotate(-90 12 145)">{anxietyLabel} →</text>
    </svg>
  </figure>
}
