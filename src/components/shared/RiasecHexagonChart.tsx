import type { RiasecScores, RiasecType } from '@/lib/riasec-profile'

const TYPES: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C']
const COLORS: Record<RiasecType, string> = { R: '#b45309', I: '#2563eb', A: '#be185d', S: '#15803d', E: '#c2410c', C: '#475569' }

interface Props { labels: Record<RiasecType, string>; scores: RiasecScores; title: string }

function point(index: number, radius: number) {
  const angle = (Math.PI * 2 * index) / TYPES.length - Math.PI / 2
  return [150 + Math.cos(angle) * radius, 150 + Math.sin(angle) * radius] as const
}

export default function RiasecHexagonChart({ labels, scores, title }: Props) {
  const values = TYPES.map((type) => Math.max(0, Math.min(100, scores[type])))
  const polygon = values.map((value, index) => point(index, 18 + value * 0.92).join(',')).join(' ')
  return <figure className="rounded-xl border bg-card p-4">
    <figcaption className="mb-2 text-center text-sm font-bold">{title}</figcaption>
    <svg viewBox="0 0 300 300" role="img" aria-label={`${title}: ${TYPES.map((type, i) => `${labels[type]} ${Math.round(values[i])}%`).join(', ')}`} className="mx-auto block h-auto w-full" style={{ maxWidth: 320 }}>
      {[46, 74, 110].map((radius) => <polygon key={radius} points={TYPES.map((_, i) => point(i, radius).join(',')).join(' ')} fill="none" stroke="#d6d3d1" />)}
      {TYPES.map((type, index) => { const [x2, y2] = point(index, 110); return <line key={type} x1="150" y1="150" x2={x2} y2={y2} stroke="#e7e5e4" /> })}
      <polygon points={polygon} fill="#657a4b" fillOpacity="0.22" stroke="#435d31" strokeWidth="3" strokeLinejoin="round" />
      {values.map((value, index) => { const [cx, cy] = point(index, 18 + value * 0.92); return <circle key={TYPES[index]} cx={cx} cy={cy} r="4" fill={COLORS[TYPES[index]]} /> })}
      {TYPES.map((type, index) => { const [x, y] = point(index, 130); return <text key={type} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={COLORS[type]} fontSize="13" fontWeight="700">{type} · {Math.round(values[index])}</text> })}
    </svg>
  </figure>
}
