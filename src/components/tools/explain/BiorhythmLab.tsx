import { useState } from 'react';

import ExplainLab from '../../shared/ExplainLab';
import { gaEvent } from '@/lib/analytics/ga-event';

// 바이오리듬 세 곡선이 왜 엇갈리는지 보여 준다. 23·28·33일 주기는 BiorhythmCalculator 와 같다.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';
const CYCLES = [
  { key: 'physical', days: 23, stroke: 'stroke-destructive', swatch: 'bg-destructive' },
  { key: 'emotional', days: 28, stroke: 'stroke-primary', swatch: 'bg-primary' },
  { key: 'intellectual', days: 33, stroke: 'stroke-chart-2', swatch: 'bg-chart-2' },
] as const;
type Key = (typeof CYCLES)[number]['key'];
const SPAN = 66;

const C: Record<Locale, { title: string; intro: string; slider: string; names: Record<Key, string>; now: (d: number) => string; every: string; note: string }> = {
  ko: { title: '세 곡선은 왜 엇갈릴까', intro: '바이오리듬은 태어난 날부터 신체 23일, 감정 28일, 지성 33일 주기로 오르내리는 곡선이에요. 주기가 달라서 셋이 같은 자리에 모이는 날은 드물어요. 날짜를 움직여 보세요.', slider: '태어난 지 며칠째', names: { physical: '신체', emotional: '감정', intellectual: '지성' }, now: (d) => `태어난 지 ${d}일째`, every: '셋이 동시에 처음 자리로 돌아오는 건 23×28×33 = 21,252일(약 58년) 뒤예요.', note: '바이오리듬은 과학적으로 검증된 이론이 아니에요. 리듬을 떠올려 보는 놀이로 보세요.' },
  en: { title: 'Why the three curves drift apart', intro: 'Biorhythms are curves that rise and fall from your birth date: physical every 23 days, emotional 28, intellectual 33. With different periods, all three rarely line up. Move the day.', slider: 'Days since birth', names: { physical: 'Physical', emotional: 'Emotional', intellectual: 'Intellectual' }, now: (d) => `Day ${d} since birth`, every: 'All three return to their starting point together only after 23×28×33 = 21,252 days (about 58 years).', note: 'Biorhythm theory is not scientifically supported. Treat it as a playful way to think about rhythm.' },
  ja: { title: '3つの曲線はなぜずれる？', intro: 'バイオリズムは誕生日から身体23日・感情28日・知性33日の周期で上下する曲線です。周期が違うので、3つがそろう日はまれです。日数を動かしてみてください。', slider: '生まれてから何日目', names: { physical: '身体', emotional: '感情', intellectual: '知性' }, now: (d) => `生まれて${d}日目`, every: '3つが同時に最初の位置へ戻るのは 23×28×33 = 21,252日（約58年）後です。', note: 'バイオリズムは科学的に裏づけられた理論ではありません。リズムを考える遊びとして見てください。' },
  zh: { title: '三条曲线为什么错开？', intro: '生物节律是从出生日起按体力23天、情绪28天、智力33天周期起伏的曲线。周期不同，三者很少重合。拖动天数看看。', slider: '出生后第几天', names: { physical: '体力', emotional: '情绪', intellectual: '智力' }, now: (d) => `出生后第${d}天`, every: '三者同时回到起点要等 23×28×33 = 21,252天（约58年）。', note: '生物节律理论并未得到科学证实，当作思考节奏的小游戏即可。' },
  fr: { title: 'Pourquoi les trois courbes se décalent', intro: 'Les biorythmes montent et descendent depuis la naissance : physique tous les 23 jours, émotionnel 28, intellectuel 33. Avec des périodes différentes, elles s’alignent rarement. Déplacez le jour.', slider: 'Jours depuis la naissance', names: { physical: 'Physique', emotional: 'Émotionnel', intellectual: 'Intellectuel' }, now: (d) => `Jour ${d} depuis la naissance`, every: 'Les trois ne reviennent ensemble à leur départ qu’après 23×28×33 = 21 252 jours (environ 58 ans).', note: 'La théorie des biorythmes n’est pas validée scientifiquement. Voyez-la comme un jeu sur le rythme.' },
  es: { title: '¿Por qué se desfasan las tres curvas?', intro: 'Los biorritmos suben y bajan desde tu nacimiento: físico cada 23 días, emocional 28, intelectual 33. Con periodos distintos, rara vez coinciden. Mueve el día.', slider: 'Días desde el nacimiento', names: { physical: 'Físico', emotional: 'Emocional', intellectual: 'Intelectual' }, now: (d) => `Día ${d} desde el nacimiento`, every: 'Las tres vuelven juntas a su punto de partida solo tras 23×28×33 = 21.252 días (unos 58 años).', note: 'La teoría de los biorritmos no tiene respaldo científico. Tómala como un juego sobre el ritmo.' },
};

const W = 320;
const H = 140;
const x = (d: number) => (d / SPAN) * W;
const yOf = (v: number) => H / 2 - v * (H / 2 - 8);
const wave = (days: number) => (d: number) => Math.sin((2 * Math.PI * d) / days);

function path(days: number): string {
  const f = wave(days);
  const pts: string[] = [];
  for (let d = 0; d <= SPAN; d += 0.5) pts.push(`${pts.length ? 'L' : 'M'}${x(d).toFixed(1)},${yOf(f(d)).toFixed(1)}`);
  return pts.join(' ');
}

export default function BiorhythmLab({ locale }: { locale: Locale }) {
  const c = C[locale];
  const [day, setDay] = useState(10);
  const values = CYCLES.map((cy) => ({ ...cy, v: Math.round(wave(cy.days)(day) * 100) }));
  return (
    <ExplainLab
      locale={locale}
      title={c.title}
      intro={c.intro}
      note={c.note}
      conclusion={
        <>
          <p className="font-bold">{c.now(day)}</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {values.map((v) => (
              <li key={v.key} className="flex items-center gap-1.5">
                <span className={`inline-block size-2.5 rounded-full ${v.swatch}`} aria-hidden="true" />
                {c.names[v.key]} {v.v > 0 ? '+' : ''}{v.v}%
              </li>
            ))}
          </ul>
          <p className="mt-2">{c.every}</p>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={c.title}>
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} className="stroke-border" strokeWidth="1" />
        {CYCLES.map((cy) => (
          <path key={cy.key} d={path(cy.days)} fill="none" className={cy.stroke} strokeWidth="2.5" />
        ))}
        <line x1={x(day)} y1="0" x2={x(day)} y2={H} className="stroke-foreground" strokeWidth="1.5" strokeDasharray="4 4" />
        {values.map((v) => (
          <circle key={v.key} cx={x(day)} cy={yOf(v.v / 100)} r="5" className={`fill-card ${v.stroke}`} strokeWidth="2.5" />
        ))}
      </svg>
      <label className="mt-3 block text-xs text-muted-foreground">
        {c.slider}: <b className="text-foreground">{day}</b>
        <input
          type="range"
          min={0}
          max={SPAN}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          onPointerUp={() => gaEvent('explain_lab', { lab: 'biorhythm' })}
          className="mt-1 block min-h-11 w-full accent-primary"
        />
      </label>
    </ExplainLab>
  );
}
