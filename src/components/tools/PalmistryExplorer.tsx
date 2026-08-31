import { useState } from 'react';
import { PALM_LINES, type PalmLineId, type PalmLocale } from '../../lib/ontology/palmistry/palm-lines';
import PalmLines3D from './palmistry/PalmLines3D';

interface Props {
  locale: string;
}

const COPY: Record<PalmLocale, {
  title: string;
  subtitle: string;
  tapHint: string;
  imageAlt: string;
  variationsLabel: string;
  guideLink: string;
  zodiacLink: string;
}> = {
  ko: {
    title: '손금 탐색기 — 4대 주요 선',
    subtitle: '손 위의 선을 눌러 생명선·감정선·두뇌선·운명선의 의미를 살펴보세요.',
    tapHint: '👆 선을 눌러 보세요',
    imageAlt: '오른손 손바닥 위에 네 가지 주요 손금 선이 표시된 안내 그림',
    variationsLabel: '이런 특징이라면',
    guideLink: '손금 보는 법 완전 가이드 →',
    zodiacLink: '별자리 성격도 보기 →',
  },
  en: {
    title: 'Palm Explorer — The Four Major Lines',
    subtitle: 'Tap a line on the palm to explore the Heart, Head, Life, and Fate lines.',
    tapHint: '👆 Tap a line',
    imageAlt: 'Guide illustration of a right palm with four major palm lines',
    variationsLabel: 'If your line looks like this',
    guideLink: 'Complete palm-reading guide →',
    zodiacLink: 'See zodiac personality too →',
  },
  ja: {
    title: '手相エクスプローラー — 四大主要線',
    subtitle: '手のひらの線をタップして、感情線・頭脳線・生命線・運命線の意味を見てみましょう。',
    tapHint: '👆 線をタップ',
    imageAlt: '右手のひらに四大主要線を示したガイド画像',
    variationsLabel: 'こんな特徴なら',
    guideLink: '手相の見方 完全ガイド →',
    zodiacLink: '星座の性格も見る →',
  },
  zh: {
    title: '手相探索器 — 四大主线',
    subtitle: '点按手掌上的线，了解感情线、智慧线、生命线与命运线的含义。',
    tapHint: '👆 点按一条线',
    imageAlt: '右手手掌四大主线示意图',
    variationsLabel: '若你的线是这样',
    guideLink: '手相完全指南 →',
    zodiacLink: '也看看星座性格 →',
  },
  fr: {
    title: 'Explorateur de paume — Les quatre lignes majeures',
    subtitle: 'Touchez une ligne de la paume pour explorer les lignes de cœur, de tête, de vie et de destin.',
    tapHint: '👆 Touchez une ligne',
    imageAlt: 'Illustration d’une paume droite avec les quatre lignes majeures',
    variationsLabel: 'Si votre ligne ressemble à ceci',
    guideLink: 'Guide complet de la chiromancie →',
    zodiacLink: 'Voir aussi la personnalité du signe →',
  },
  es: {
    title: 'Explorador de la palma — Las cuatro líneas principales',
    subtitle: 'Toca una línea de la palma para explorar las líneas del corazón, la cabeza, la vida y el destino.',
    tapHint: '👆 Toca una línea',
    imageAlt: 'Ilustración de una palma derecha con las cuatro líneas principales',
    variationsLabel: 'Si tu línea se ve así',
    guideLink: 'Guía completa de quiromancia →',
    zodiacLink: 'Ver también la personalidad del signo →',
  },
};

export default function PalmistryExplorer({ locale }: Props) {
  const loc = (Object.prototype.hasOwnProperty.call(COPY, locale) ? locale : 'en') as PalmLocale;
  const t = COPY[loc];
  const [active, setActive] = useState<PalmLineId>('heart');
  const line = PALM_LINES.find((l) => l.id === active)!;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">{t.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.subtitle}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Natural hand illustration with accessible interactive SVG overlays. */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 300 375" className="w-full max-w-[300px] overflow-hidden rounded-[2rem] border border-primary/15 bg-[#fbf7ef] shadow-sm" role="group" aria-label={t.imageAlt}>
            <image
              href="/images/palmistry/palm-guide-hand-v1.webp"
              x="0"
              y="0"
              width="300"
              height="375"
              preserveAspectRatio="xMidYMid slice"
            />
            {PALM_LINES.map((l) => {
              const isActive = l.id === active;
              return (
                <path
                  key={l.id}
                  d={l.path}
                  fill="none"
                  stroke={l.color}
                  strokeWidth={isActive ? 7 : 4}
                  strokeLinecap="round"
                  opacity={isActive ? 1 : 0.45}
                  className="cursor-pointer transition-all"
                  onClick={() => setActive(l.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={l.name[loc]}
                  aria-pressed={isActive}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(l.id); } }}
                />
              );
            })}
          </svg>
          <p className="mt-2 text-xs text-slate-400">{t.tapHint}</p>
          <PalmLines3D locale={loc} lines={PALM_LINES} active={active} />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {PALM_LINES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActive(l.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  l.id === active ? 'text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
                style={l.id === active ? { backgroundColor: l.color } : undefined}
              >
                {l.name[loc]}
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: line.color }} aria-hidden="true" />
            <h3 className="text-xl font-black text-slate-900">{line.name[loc]}</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{line.meaning[loc]}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">{t.variationsLabel}</p>
          <ul className="mt-2 space-y-2">
            {line.variations[loc].map((v) => (
              <li key={v} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 font-bold" style={{ color: line.color }}>•</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm">
        <a href="https://blog.oiyo.net/ko/palm-reading-complete-guide/" className="font-bold text-rose-700 hover:underline">{t.guideLink}</a>
        <a href={`/${loc}/zodiac/personality/`} className="font-semibold text-slate-600 hover:underline">{t.zodiacLink}</a>
      </div>
    </section>
  );
}
