import { useMemo, useState } from 'react';
import type { NatalLocale } from '../../lib/ontology/natal/signs';
import type { City } from '../../lib/ontology/natal/signs';
import type { CartoBody, CartoMeridian } from '../../lib/ontology/natal/astrocartography';

const W = 720;
const H = 360;

const LINE: Record<CartoBody, { color: string; label: Record<NatalLocale, string> }> = {
  sun: { color: '#b45309', label: { ko: '태양', en: 'Sun', ja: '太陽', zh: '太阳', fr: 'Soleil', es: 'Sol' } },
  moon: { color: '#475569', label: { ko: '달', en: 'Moon', ja: '月', zh: '月亮', fr: 'Lune', es: 'Luna' } },
  mercury: { color: '#64748b', label: { ko: '수성', en: 'Mercury', ja: '水星', zh: '水星', fr: 'Mercure', es: 'Mercurio' } },
  venus: { color: '#3f6212', label: { ko: '금성', en: 'Venus', ja: '金星', zh: '金星', fr: 'Vénus', es: 'Venus' } },
  mars: { color: '#9a3412', label: { ko: '화성', en: 'Mars', ja: '火星', zh: '火星', fr: 'Mars', es: 'Marte' } },
  jupiter: { color: '#854d0e', label: { ko: '목성', en: 'Jupiter', ja: '木星', zh: '木星', fr: 'Jupiter', es: 'Júpiter' } },
  saturn: { color: '#44403c', label: { ko: '토성', en: 'Saturn', ja: '土星', zh: '土星', fr: 'Saturne', es: 'Saturno' } },
};

const COPY: Record<NatalLocale, { heading: string; hint: string; disclaimer: string; mc: string; ic: string }> = {
  ko: {
    heading: '아스트로카토그래피 — 중천(MC) 선',
    hint: '세로선은 출생 순간에 그 행성이 중천(MC) 또는 천저(IC)에 있던 경도입니다. 거주 추천이 아닙니다.',
    disclaimer: '상징 지도입니다. 이주·여행 결정을 대신하지 않습니다.',
    mc: 'MC',
    ic: 'IC',
  },
  en: {
    heading: 'Astrocartography — Midheaven (MC) lines',
    hint: 'Vertical lines are longitudes where that planet was on the MC or IC at birth. Not a relocation ranking.',
    disclaimer: 'A symbolic map. It does not replace a move or travel decision.',
    mc: 'MC',
    ic: 'IC',
  },
  ja: {
    heading: 'アストロカートグラフィー — 中天(MC)線',
    hint: '縦線は出生瞬間にその惑星が中天(MC)または天底(IC)にあった経度です。移住の推薦ではありません。',
    disclaimer: '象徴の地図です。移住・旅行の判断の代わりにはなりません。',
    mc: 'MC',
    ic: 'IC',
  },
  zh: {
    heading: '星图地理 — 中天(MC)线',
    hint: '竖线是出生瞬间该行星位于中天(MC)或天底(IC)的经度。不是移居排名。',
    disclaimer: '象征地图。不能代替迁居或旅行决定。',
    mc: 'MC',
    ic: 'IC',
  },
  fr: {
    heading: 'Astrocartographie — lignes du Milieu du Ciel (MC)',
    hint: 'Les verticales sont les longitudes où la planète était au MC ou à l’IC à la naissance. Pas un classement de villes.',
    disclaimer: 'Carte symbolique. Elle ne remplace pas une décision de déménagement.',
    mc: 'MC',
    ic: 'IC',
  },
  es: {
    heading: 'Astrocartografía — líneas del Medio Cielo (MC)',
    hint: 'Las verticales son longitudes donde ese planeta estaba en el MC o IC al nacer. No es un ranking de mudanza.',
    disclaimer: 'Mapa simbólico. No sustituye una decisión de viaje o mudanza.',
    mc: 'MC',
    ic: 'IC',
  },
};

function xOf(lon: number): number {
  return ((lon + 180) / 360) * W;
}

const DEFAULT_ON: CartoBody[] = ['sun', 'moon', 'venus'];

export default function AstroCartoMap({
  locale,
  lines,
  city,
}: {
  locale: NatalLocale;
  lines: CartoMeridian[];
  city: City;
}) {
  const t = COPY[locale] ?? COPY.en;
  const [on, setOn] = useState<Record<CartoBody, boolean>>(() => {
    const init = {} as Record<CartoBody, boolean>;
    for (const l of lines) init[l.body] = DEFAULT_ON.includes(l.body);
    return init;
  });
  const visible = useMemo(() => lines.filter((l) => on[l.body]), [lines, on]);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-center text-sm font-bold text-green-900">{t.heading}</h3>
      <p className="mt-1 text-center text-xs text-slate-500">{t.hint}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {lines.map((l) => {
          const meta = LINE[l.body];
          return (
            <button
              key={l.body}
              type="button"
              onClick={() => setOn((s) => ({ ...s, [l.body]: !s[l.body] }))}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                on[l.body] ? 'border-slate-800 text-slate-900' : 'border-slate-200 text-slate-400'
              }`}
              style={on[l.body] ? { borderColor: meta.color, color: meta.color } : undefined}
            >
              {meta.label[locale]}
            </button>
          );
        })}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full rounded-xl" role="img" aria-label={t.heading}>
        <rect width={W} height={H} fill="#eef2e6" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`g${i}`} x1={(i * W) / 12} y1={0} x2={(i * W) / 12} y2={H} stroke="#d6dcc8" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i * H) / 6} x2={W} y2={(i * H) / 6} stroke="#d6dcc8" strokeWidth="1" />
        ))}
        {visible.map((l) => {
          const c = LINE[l.body].color;
          const xm = xOf(l.mcLon);
          const xi = xOf(l.icLon);
          return (
            <g key={l.body}>
              <line x1={xm} y1={0} x2={xm} y2={H} stroke={c} strokeWidth="2.5" />
              <line x1={xi} y1={0} x2={xi} y2={H} stroke={c} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />
              <text x={xm + 4} y={14} fill={c} fontSize="10" fontWeight="700">{LINE[l.body].label[locale]} {t.mc}</text>
              <text x={xi + 4} y={H - 8} fill={c} fontSize="9" opacity="0.8">{t.ic}</text>
            </g>
          );
        })}
        <circle
          cx={xOf(city.lon)}
          cy={((90 - city.lat) / 180) * H}
          r="5"
          fill="#14532d"
          stroke="#fff"
          strokeWidth="1.5"
        />
      </svg>
      <p className="mt-2 text-center text-[11px] text-slate-400">{t.disclaimer}</p>
    </section>
  );
}
