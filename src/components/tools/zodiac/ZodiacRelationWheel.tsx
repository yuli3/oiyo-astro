import { useState } from 'react';

import ExplainLab from '../../shared/ExplainLab';
import { gaEvent } from '@/lib/analytics/ga-event';
import { BRANCH_RELATIONS, relationsOf, type BranchRelation } from '@/lib/fortune/branch-relations';
import { ANIMAL_IMAGE, ANIMAL_NAMES } from '@/lib/fortune/zodiac-names';
import { YEAR_ANIMAL } from '@/lib/new-year-2027';

// 12띠 관계 원. 띠를 고르면 삼합·육합·충·해·형 선이 그려지고, 2027 양띠 해와의 관계를 말해 준다.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

interface Copy {
  title: string;
  intro: string;
  pick: string;
  rel: Record<BranchRelation, { name: string; line: string }>;
  none: string;
  with2027: (name: string, kinds: string) => string;
  free2027: (name: string) => string;
  same2027: string;
  note: string;
  join: string;
}

const C: Record<Locale, Copy> = {
  ko: {
    title: '12띠 관계 원',
    intro: '띠끼리도 잘 맞는 사이, 부딪히는 사이가 전해 내려와요. 띠를 하나 골라 보세요. 그 띠와 묶이는 띠로 선이 그려져요.',
    pick: '띠 고르기',
    rel: {
      trine: { name: '삼합', line: '셋이 한 팀이 되는 사이' },
      pair: { name: '육합', line: '둘이 짝을 이루는 사이' },
      clash: { name: '충', line: '정면으로 부딪히는 사이' },
      harm: { name: '해', line: '말끝에 서운해지기 쉬운 사이' },
      punish: { name: '형', line: '서로 긴장을 만드는 사이' },
    },
    none: '없음',
    with2027: (n, k) => `2027년은 양띠 해예요. ${n}는 양띠와 ${k} 관계예요.`,
    free2027: (n) => `2027년은 양띠 해예요. ${n}는 양띠와 따로 묶이지 않아서 내 페이스대로 가기 좋아요.`,
    same2027: '2027년은 양띠 해, 바로 내 띠의 해(본명년)예요.',
    note: '명리의 전통 관계표(삼합·육합·충·해·형)를 그린 거예요. 재미로 보는 상징이고 사람 사이를 정하지 않아요.',
    join: '·',
  },
  en: {
    title: 'The 12-animal relationship wheel',
    intro: 'Tradition says some zodiac animals get along and some clash. Pick an animal and lines are drawn to the animals it is tied to.',
    pick: 'Pick an animal',
    rel: {
      trine: { name: 'Trine', line: 'three animals that make a team' },
      pair: { name: 'Pair', line: 'two animals that make a match' },
      clash: { name: 'Clash', line: 'the animal straight across the wheel' },
      harm: { name: 'Harm', line: 'easy to hurt each other’s feelings' },
      punish: { name: 'Tension', line: 'a pairing that builds pressure' },
    },
    none: 'none',
    with2027: (n, k) => `2027 is the Year of the Goat. The ${n} has a ${k} tie with the Goat.`,
    free2027: (n) => `2027 is the Year of the Goat. The ${n} has no special tie with the Goat, so it can keep its own pace.`,
    same2027: '2027 is the Year of the Goat: your own animal’s year.',
    note: 'Drawn from the traditional table of branch relations (trine, pair, clash, harm, punishment). A symbol for fun, not a verdict on people.',
    join: ', ',
  },
  ja: {
    title: '十二支の関係図',
    intro: '十二支にも相性の良い組み合わせ、ぶつかる組み合わせが伝わっています。干支をひとつ選ぶと、結びつく干支へ線が引かれます。',
    pick: '干支を選ぶ',
    rel: {
      trine: { name: '三合', line: '3つでチームになる関係' },
      pair: { name: '支合', line: '2つで対になる関係' },
      clash: { name: '冲', line: '真正面からぶつかる関係' },
      harm: { name: '害', line: '言葉の端で傷つけ合いやすい関係' },
      punish: { name: '刑', line: '緊張を生みやすい関係' },
    },
    none: 'なし',
    with2027: (n, k) => `2027年は未年です。${n}は未と「${k}」の関係です。`,
    free2027: (n) => `2027年は未年です。${n}は未と特に結びつかないので、自分のペースで進めやすい年です。`,
    same2027: '2027年は未年、あなたの干支の年（年女・年男）です。',
    note: '四柱推命の伝統的な関係表（三合・支合・冲・害・刑）を描いたものです。楽しむための象徴で、人間関係を決めつけるものではありません。',
    join: '・',
  },
  zh: {
    title: '十二生肖关系图',
    intro: '传统上生肖之间有相合、相冲的说法。选一个生肖，就会连线到与它有关系的生肖。',
    pick: '选择生肖',
    rel: {
      trine: { name: '三合', line: '三个生肖组成一队' },
      pair: { name: '六合', line: '两个生肖结成一对' },
      clash: { name: '相冲', line: '正面相对的关系' },
      harm: { name: '相害', line: '容易因一句话生隙' },
      punish: { name: '相刑', line: '彼此容易紧张' },
    },
    none: '无',
    with2027: (n, k) => `2027年是羊年。属${n}与羊是「${k}」关系。`,
    free2027: (n) => `2027年是羊年。属${n}与羊没有特别关系，适合按自己的节奏走。`,
    same2027: '2027年是羊年，正是你的本命年。',
    note: '依据传统地支关系表（三合、六合、相冲、相害、相刑）绘制，仅作趣味象征，不决定人际关系。',
    join: '、',
  },
  fr: {
    title: 'La roue des 12 animaux',
    intro: 'La tradition dit que certains animaux s’entendent et que d’autres s’opposent. Choisissez un animal : des lignes le relient à ceux qui lui sont liés.',
    pick: 'Choisir un animal',
    rel: {
      trine: { name: 'Trigone', line: 'trois animaux qui font équipe' },
      pair: { name: 'Paire', line: 'deux animaux qui s’assortissent' },
      clash: { name: 'Opposition', line: 'l’animal juste en face' },
      harm: { name: 'Froissement', line: 'on se vexe facilement' },
      punish: { name: 'Tension', line: 'une relation qui crée de la pression' },
    },
    none: 'aucun',
    with2027: (n, k) => `2027 est l’année de la Chèvre. Le ${n} a un lien « ${k} » avec la Chèvre.`,
    free2027: (n) => `2027 est l’année de la Chèvre. Le ${n} n’a pas de lien particulier avec elle : il peut garder son rythme.`,
    same2027: '2027 est l’année de la Chèvre : l’année de votre propre animal.',
    note: 'D’après la table traditionnelle des relations entre branches terrestres. Un symbole pour le plaisir, pas un jugement sur les gens.',
    join: ', ',
  },
  es: {
    title: 'La rueda de los 12 animales',
    intro: 'La tradición dice que algunos animales se llevan bien y otros chocan. Elige un animal y se trazarán líneas hacia los que están ligados a él.',
    pick: 'Elige un animal',
    rel: {
      trine: { name: 'Trígono', line: 'tres animales que forman equipo' },
      pair: { name: 'Pareja', line: 'dos animales que hacen buena pareja' },
      clash: { name: 'Choque', line: 'el animal justo enfrente' },
      harm: { name: 'Roce', line: 'es fácil herirse con una palabra' },
      punish: { name: 'Tensión', line: 'una relación que crea presión' },
    },
    none: 'ninguno',
    with2027: (n, k) => `2027 es el año de la Cabra. El ${n} tiene un vínculo de «${k}» con la Cabra.`,
    free2027: (n) => `2027 es el año de la Cabra. El ${n} no tiene un vínculo especial con ella, así que puede ir a su ritmo.`,
    same2027: '2027 es el año de la Cabra: el año de tu propio animal.',
    note: 'Basado en la tabla tradicional de relaciones entre ramas terrestres. Un símbolo para divertirse, no un juicio sobre las personas.',
    join: ', ',
  },
};

// 선 색. 같은 색을 범례 칩에도 쓴다.
const STROKE: Record<BranchRelation, string> = {
  trine: 'stroke-primary',
  pair: 'stroke-chart-2',
  clash: 'stroke-destructive',
  harm: 'stroke-chart-4',
  punish: 'stroke-chart-5',
};
const SWATCH: Record<BranchRelation, string> = {
  trine: 'bg-primary',
  pair: 'bg-chart-2',
  clash: 'bg-destructive',
  harm: 'bg-chart-4',
  punish: 'bg-chart-5',
};
const DASH: Record<BranchRelation, string | undefined> = {
  trine: undefined,
  pair: undefined,
  clash: '8 6',
  harm: '2 6',
  punish: '12 6',
};

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 122;
const pos = (i: number) => {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  return { x: CENTER + RADIUS * Math.cos(a), y: CENTER + RADIUS * Math.sin(a) };
};

export default function ZodiacRelationWheel({ locale, initial = YEAR_ANIMAL }: { locale: Locale; initial?: number }) {
  const c = C[locale];
  const names = ANIMAL_NAMES[locale];
  const [sel, setSel] = useState(initial);
  const rel = relationsOf(sel);

  const pick = (i: number) => {
    setSel(i);
    gaEvent('explain_lab', { lab: 'zodiac-wheel', animal: String(i) });
  };

  const kindsWith2027 = BRANCH_RELATIONS.filter((k) => rel[k].includes(YEAR_ANIMAL)).map((k) => c.rel[k].name);
  const line2027 =
    sel === YEAR_ANIMAL ? c.same2027 : kindsWith2027.length ? c.with2027(names[sel], kindsWith2027.join(c.join)) : c.free2027(names[sel]);

  const lines = BRANCH_RELATIONS.flatMap((k) => rel[k].map((to) => ({ k, to })));
  const from = pos(sel);

  return (
    <ExplainLab
      locale={locale}
      title={c.title}
      intro={c.intro}
      note={c.note}
      conclusion={
        <>
          <p className="font-bold">{line2027}</p>
          <ul className="mt-2 space-y-1">
            {BRANCH_RELATIONS.map((k) => (
              <li key={k} className="flex items-start gap-2">
                <span className={`mt-1.5 inline-block size-2.5 shrink-0 rounded-full ${SWATCH[k]}`} aria-hidden="true" />
                <span>
                  <b>{c.rel[k].name}</b> {rel[k].length ? rel[k].map((i) => names[i]).join(c.join) : c.none}
                  <span className="text-muted-foreground"> · {c.rel[k].line}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto block w-full max-w-sm" role="img" aria-label={`${c.title}: ${names[sel]}`}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" className="stroke-border" strokeWidth="1" />
        {lines.map(({ k, to }) => {
          const p = pos(to);
          return (
            <line
              key={`${k}-${to}`}
              x1={from.x}
              y1={from.y}
              x2={p.x}
              y2={p.y}
              className={STROKE[k]}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={DASH[k]}
            />
          );
        })}
        {names.map((n, i) => {
          const p = pos(i);
          const active = i === sel;
          return (
            <g key={n} onClick={() => pick(i)} className="cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="24"
                className={active ? 'fill-card stroke-primary' : 'fill-card stroke-border'}
                strokeWidth={active ? 4 : 1.5}
              />
              <image href={ANIMAL_IMAGE[i]} x={p.x - 18} y={p.y - 18} width="36" height="36" />
              {i === YEAR_ANIMAL && (
                <text x={p.x} y={p.y + 38} textAnchor="middle" className="fill-primary text-xs font-black">
                  2027
                </text>
              )}
            </g>
          );
        })}
        <text x={CENTER} y={CENTER + 6} textAnchor="middle" className="fill-foreground text-base font-black">
          {names[sel]}
        </text>
      </svg>
      <fieldset className="mt-3">
        <legend className="sr-only">{c.pick}</legend>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {names.map((n, i) => (
            <button
              key={n}
              type="button"
              onClick={() => pick(i)}
              aria-pressed={i === sel}
              className={`min-h-11 rounded-lg border px-1 text-xs font-bold ${
                i === sel ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-primary/50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>
    </ExplainLab>
  );
}
