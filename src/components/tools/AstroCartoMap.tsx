import { useMemo, useState } from 'react';
import type { NatalLocale } from '../../lib/ontology/natal/signs';
import type { City } from '../../lib/ontology/natal/signs';
import type { CartoBody, CartoMeridian, CartoHorizon } from '../../lib/ontology/natal/astrocartography';
import AstroCartoGlobe from './AstroCartoGlobe';

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

const COPY: Record<
  NatalLocale,
  { heading: string; hint: string; disclaimer: string; mc: string; ic: string; asc: string; dsc: string; mapView: string; globeView: string }
> = {
  ko: {
    heading: '아스트로카토그래피 — MC·ASC 선',
    hint: '세로선은 중천(MC)·천저(IC). 곡선은 떠오름(ASC)·짐(DSC). 거주 추천이 아닙니다.',
    disclaimer: '상징 지도입니다. 이주·여행 결정을 대신하지 않습니다.',
    mc: 'MC', ic: 'IC', asc: 'ASC', dsc: 'DSC',
    mapView: '지도', globeView: '지구본',
  },
  en: {
    heading: 'Astrocartography — MC & ASC lines',
    hint: 'Verticals are MC/IC meridians. Curves are rising (ASC) and setting (DSC). Not a relocation ranking.',
    disclaimer: 'A symbolic map. It does not replace a move or travel decision.',
    mc: 'MC', ic: 'IC', asc: 'ASC', dsc: 'DSC',
    mapView: 'Map', globeView: 'Globe',
  },
  ja: {
    heading: 'アストロカートグラフィー — MC・ASC線',
    hint: '縦線は中天(MC)と天底(IC)。曲線は上昇(ASC)と下降(DSC)。移住の推薦ではありません。',
    disclaimer: '象徴の地図です。移住・旅行の判断の代わりにはなりません。',
    mc: 'MC', ic: 'IC', asc: 'ASC', dsc: 'DSC',
    mapView: '地図', globeView: '地球儀',
  },
  zh: {
    heading: '星图地理 — MC·ASC 线',
    hint: '竖线是中天(MC)与天底(IC)。曲线是升起(ASC)与落下(DSC)。不是移居排名。',
    disclaimer: '象征地图。不能代替迁居或旅行决定。',
    mc: 'MC', ic: 'IC', asc: 'ASC', dsc: 'DSC',
    mapView: '地图', globeView: '地球仪',
  },
  fr: {
    heading: 'Astrocartographie — lignes MC et ASC',
    hint: 'Les verticales sont MC/IC. Les courbes sont l’ASC (lever) et le DSC (coucher). Pas un classement de villes.',
    disclaimer: 'Carte symbolique. Elle ne remplace pas une décision de déménagement.',
    mc: 'MC', ic: 'IC', asc: 'ASC', dsc: 'DSC',
    mapView: 'Carte', globeView: 'Globe',
  },
  es: {
    heading: 'Astrocartografía — líneas MC y ASC',
    hint: 'Las verticales son MC/IC. Las curvas son ASC (salida) y DSC (puesta). No es un ranking de mudanza.',
    disclaimer: 'Mapa simbólico. No sustituye una decisión de viaje o mudanza.',
    mc: 'MC', ic: 'IC', asc: 'ASC', dsc: 'DSC',
    mapView: 'Mapa', globeView: 'Globo',
  },
};

function xOf(lon: number): number {
  return ((lon + 180) / 360) * W;
}
function yOf(lat: number): number {
  return ((90 - lat) / 180) * H;
}
function curvePaths(pts: { lat: number; lon: number }[]): string[] {
  const segs: { lat: number; lon: number }[][] = [];
  let cur: { lat: number; lon: number }[] = [];
  for (const p of pts) {
    if (cur.length && Math.abs(p.lon - cur[cur.length - 1].lon) > 180) {
      segs.push(cur);
      cur = [p];
    } else {
      cur.push(p);
    }
  }
  if (cur.length) segs.push(cur);
  return segs.filter((s) => s.length >= 2).map((s) =>
    s.map((p, i) => `${i ? 'L' : 'M'}${xOf(p.lon).toFixed(1)},${yOf(p.lat).toFixed(1)}`).join(' '),
  );
}

const DEFAULT_ON: CartoBody[] = ['sun', 'moon', 'venus'];

// NASA Visible Earth "Blue Marble" land surface — a real equirectangular
// photograph (2048×1024, same 2:1 aspect as this chart), public domain.
// https://visibleearth.nasa.gov/images/57752/blue-marble-land-surface-shallow-water-and-shaded-topography
const EARTH_TEXTURE = '/textures/earth-blue-marble.jpg';

export default function AstroCartoMap({
  locale,
  lines,
  curves,
  city,
}: {
  locale: NatalLocale;
  lines: CartoMeridian[];
  curves: CartoHorizon[];
  city: City;
}) {
  const t = COPY[locale] ?? COPY.en;
  const [on, setOn] = useState<Record<CartoBody, boolean>>(() => {
    const init = {} as Record<CartoBody, boolean>;
    for (const l of lines) init[l.body] = DEFAULT_ON.includes(l.body);
    return init;
  });
  const [view, setView] = useState<'flat' | 'globe'>('flat');
  const visible = useMemo(() => lines.filter((l) => on[l.body]), [lines, on]);
  const colors = useMemo(() => {
    const c = {} as Record<CartoBody, string>;
    for (const l of lines) c[l.body] = LINE[l.body].color;
    return c;
  }, [lines]);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-card p-4">
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
      <div className="mt-2 flex justify-center gap-1.5">
        {(['flat', 'globe'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
              view === v ? 'border-green-800 bg-green-800 text-white' : 'border-slate-200 text-slate-400'
            }`}
          >
            {v === 'flat' ? t.mapView : t.globeView}
          </button>
        ))}
      </div>
      {view === 'flat' ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full rounded-xl" role="img" aria-label={t.heading}>
          <image href={EARTH_TEXTURE} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />
          <rect width={W} height={H} fill="#020617" opacity="0.14" />
          {visible.map((l) => {
            const c = LINE[l.body].color;
            const xm = xOf(l.mcLon);
            const xi = xOf(l.icLon);
            const hz = curves.find((h) => h.body === l.body);
            return (
              <g key={l.body}>
                <line x1={xm} y1={0} x2={xm} y2={H} stroke={c} strokeWidth="2.5" />
                <line x1={xi} y1={0} x2={xi} y2={H} stroke={c} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />
                {hz?.asc && curvePaths(hz.asc).map((d, i) => (
                  <path key={`a${i}`} d={d} fill="none" stroke={c} strokeWidth="1.6" />
                ))}
                {hz?.dsc && curvePaths(hz.dsc).map((d, i) => (
                  <path key={`d${i}`} d={d} fill="none" stroke={c} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.75" />
                ))}
                <text x={xm + 4} y={14} fill={c} stroke="#fff" strokeWidth="3" paintOrder="stroke" fontSize="10" fontWeight="700">
                  {LINE[l.body].label[locale]} {t.mc}
                </text>
                <text x={xi + 4} y={H - 8} fill={c} stroke="#fff" strokeWidth="2.5" paintOrder="stroke" fontSize="9" opacity="0.9">
                  {t.ic}
                </text>
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
      ) : (
        <div className="mt-3">
          <AstroCartoGlobe lines={visible} curves={curves} city={city} colors={colors} />
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-slate-400">
        {t.disclaimer}
        {view === 'globe' && (
          <>
            {' · '}
            <a
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
              href="https://visibleearth.nasa.gov/images/57752/blue-marble-land-surface-shallow-water-and-shaded-topography"
            >
              NASA Blue Marble
            </a>
          </>
        )}
      </p>
    </section>
  );
}
