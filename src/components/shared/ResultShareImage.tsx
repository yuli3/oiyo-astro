import { useState } from 'react'

// Client-side result share card. Draws a branded 1080x1080 PNG of the user's
// test result on a <canvas> and shares it via the Web Share API (files) or
// downloads it. Static-site compatible — results are computed client-side, so
// the shareable image must be generated in the browser. The viral loop the
// site previously lacked.
interface Props {
  title: string
  level: string
  score: number
  color: string
  icon: string
  locale?: string
}

const LABEL: Record<string, string> = {
  ko: '📸 결과 이미지 저장·공유',
  en: '📸 Save / share result image',
  ja: '📸 結果画像を保存・共有',
  zh: '📸 保存·分享结果图片',
  fr: '📸 Enregistrer / partager l\'image',
  es: '📸 Guardar / compartir imagen',
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export default function ResultShareImage({ title, level, score, color, icon, locale = 'ko' }: Props) {
  const [busy, setBusy] = useState(false)
  const label = LABEL[locale] ?? LABEL.en

  async function generate() {
    setBusy(true)
    try {
      const S = 1080
      const canvas = document.createElement('canvas')
      canvas.width = S
      canvas.height = S
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Background
      ctx.fillStyle = '#fbfaf7'
      ctx.fillRect(0, 0, S, S)
      // Top accent band
      ctx.fillStyle = color
      ctx.fillRect(0, 0, S, 16)

      // Card
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.08)'
      ctx.shadowBlur = 40
      ctx.shadowOffsetY = 12
      roundRect(ctx, 90, 150, S - 180, S - 320, 48)
      ctx.fill()
      ctx.shadowColor = 'transparent'

      ctx.textAlign = 'center'

      // Test title (small, muted)
      ctx.fillStyle = '#6b7280'
      ctx.font = '600 34px sans-serif'
      const tt = title.length > 26 ? title.slice(0, 25) + '…' : title
      ctx.fillText(tt, S / 2, 280)

      // Icon
      ctx.font = '160px sans-serif'
      ctx.fillText(icon, S / 2, 500)

      // Level title (big, colored)
      ctx.fillStyle = color
      ctx.font = '800 84px sans-serif'
      const lv = level.length > 14 ? level.slice(0, 13) + '…' : level
      ctx.fillText(lv, S / 2, 630)

      // Score bar
      const barW = S - 360
      const barX = 180
      const barY = 700
      ctx.fillStyle = '#eee'
      roundRect(ctx, barX, barY, barW, 28, 14)
      ctx.fill()
      ctx.fillStyle = color
      const pct = Math.max(0, Math.min(1, (score - 1) / 4))
      roundRect(ctx, barX, barY, Math.max(28, barW * pct), 28, 14)
      ctx.fill()

      // Score text
      ctx.fillStyle = '#111827'
      ctx.font = '800 64px sans-serif'
      ctx.fillText(`${score.toFixed(1)} / 5.0`, S / 2, 820)

      // Brand
      ctx.fillStyle = '#65a30d'
      ctx.font = '800 44px sans-serif'
      ctx.fillText('OIYO', S / 2, 905)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '500 30px sans-serif'
      ctx.fillText('oiyo.net', S / 2, 950)

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/png'))
      if (!blob) return
      const file = new File([blob], 'oiyo-result.png', { type: 'image/png' })
      const shareText = `${title} — ${level} ${score.toFixed(1)}/5.0`

      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean }
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text: shareText } as ShareData)
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'oiyo-result.png'
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch {
      // user cancelled share or unsupported — no-op
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={generate}
      disabled={busy}
      aria-label={label}
      className="w-full rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2.5 text-sm font-bold hover:bg-emerald-100 transition-colors disabled:opacity-60"
    >
      {label}
    </button>
  )
}
