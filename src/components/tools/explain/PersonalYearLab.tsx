import { useState } from 'react';

import ExplainLab from '../../shared/ExplainLab';
import { gaEvent } from '@/lib/analytics/ga-event';
import { PERSONAL_YEAR } from '@/lib/symbolic-tradition/numerology-copy';
import { personalYearOf } from '@/lib/symbolic-tradition/numerology';

// 개인년 숫자가 나오는 과정을 단계별로 보여 준다. 계산은 numerology.ts 의 personalYearOf 와 같다.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

/** 한 자리가 될 때까지 자릿수를 더하는 과정. 25 → ["2+5=7"] */
export function digitSteps(n: number): { text: string; value: number }[] {
  const steps: { text: string; value: number }[] = [];
  let x = n;
  while (x > 9) {
    const digits = String(x).split('').map(Number);
    const next = digits.reduce((s, d) => s + d, 0);
    steps.push({ text: `${digits.join('+')}=${next}`, value: next });
    x = next;
  }
  return steps;
}

const C: Record<Locale, { title: string; intro: string; month: string; day: string; year: string; total: string; result: (n: number, y: number) => string; note: string }> = {
  ko: { title: '개인년 숫자는 이렇게 나와요', intro: '태어난 달과 날, 그리고 보고 싶은 해를 각각 한 자리로 줄인 뒤 더하고, 다시 한 자리로 줄여요. 값을 바꿔 보세요.', month: '태어난 달', day: '태어난 날', year: '보고 싶은 해', total: '셋을 더하면', result: (n, y) => `${y}년의 개인년은 ${n}이에요.`, note: '수비학의 전통 계산법이에요. 재미로 보는 상징이에요.' },
  en: { title: 'How your personal year number is made', intro: 'Reduce your birth month, birth day and the year you want to see to one digit each, add them, then reduce again. Change the values.', month: 'Birth month', day: 'Birth day', year: 'Year to see', total: 'Add the three', result: (n, y) => `Your personal year for ${y} is ${n}.`, note: 'The traditional numerology method. A symbol for fun.' },
  ja: { title: '個人年の数はこうして出ます', intro: '生まれた月・日と、見たい年をそれぞれ1桁にしてから足し、もう一度1桁にします。値を変えてみてください。', month: '生まれた月', day: '生まれた日', year: '見たい年', total: '3つを足すと', result: (n, y) => `${y}年の個人年は${n}です。`, note: '数秘術の伝統的な計算法です。楽しむための象徴です。' },
  zh: { title: '个人年数字是这样算的', intro: '把出生月、出生日和想看的年份各自化为一位数，相加后再化为一位数。改改数值试试。', month: '出生月', day: '出生日', year: '想看的年份', total: '三者相加', result: (n, y) => `${y}年的个人年是${n}。`, note: '数字命理的传统算法，仅作趣味象征。' },
  fr: { title: 'Comment se calcule votre année personnelle', intro: 'Réduisez à un chiffre le mois, le jour de naissance et l’année voulue, additionnez, puis réduisez encore. Changez les valeurs.', month: 'Mois de naissance', day: 'Jour de naissance', year: 'Année à voir', total: 'Somme des trois', result: (n, y) => `Votre année personnelle ${y} est ${n}.`, note: 'La méthode traditionnelle de numérologie. Un symbole pour le plaisir.' },
  es: { title: 'Así se calcula tu año personal', intro: 'Reduce a un dígito el mes y el día de nacimiento y el año que quieres ver, súmalos y vuelve a reducir. Cambia los valores.', month: 'Mes de nacimiento', day: 'Día de nacimiento', year: 'Año a ver', total: 'Suma de los tres', result: (n, y) => `Tu año personal ${y} es ${n}.`, note: 'El método tradicional de numerología. Un símbolo para divertirse.' },
};

const YEARS = [2026, 2027, 2028];
const selectCls = 'min-h-11 w-full rounded-lg border border-border bg-background px-2 text-base';

function Row({ label, raw, steps }: { label: string; raw: number; steps: { text: string; value: number }[] }) {
  const final = steps.length ? steps[steps.length - 1].value : raw;
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border px-3 py-2 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-mono">{raw}</span>
      {steps.map((s) => (
        <span key={s.text} className="font-mono text-muted-foreground">→ {s.text}</span>
      ))}
      <span className="ml-auto inline-flex size-8 items-center justify-center rounded-full bg-primary font-black text-primary-foreground">{final}</span>
    </li>
  );
}

export default function PersonalYearLab({ locale, defaultYear = 2027 }: { locale: Locale; defaultYear?: number }) {
  const c = C[locale];
  const [m, setM] = useState(6);
  const [d, setD] = useState(15);
  const [y, setY] = useState(defaultYear);
  const track = () => gaEvent('explain_lab', { lab: 'personal-year' });

  const mSteps = digitSteps(m);
  const dSteps = digitSteps(d);
  const ySteps = digitSteps(y);
  const last = (raw: number, s: { value: number }[]) => (s.length ? s[s.length - 1].value : raw);
  const sum = last(m, mSteps) + last(d, dSteps) + last(y, ySteps);
  const pad = (n: number) => String(n).padStart(2, '0');
  const py = personalYearOf(`2000-${pad(m)}-${pad(d)}`, `${y}-06-01`);

  return (
    <ExplainLab
      locale={locale}
      title={c.title}
      intro={c.intro}
      note={c.note}
      conclusion={
        <>
          <p className="font-bold">{c.result(py, y)}</p>
          <p className="mt-1">{PERSONAL_YEAR[py]?.[locale]}</p>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs text-muted-foreground">{c.month}
          <select className={selectCls} value={m} onChange={(e) => { setM(Number(e.target.value)); track(); }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">{c.day}
          <select className={selectCls} value={d} onChange={(e) => { setD(Number(e.target.value)); track(); }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">{c.year}
          <select className={selectCls} value={y} onChange={(e) => { setY(Number(e.target.value)); track(); }}>
            {YEARS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      </div>
      <ol className="mt-3 space-y-2">
        <Row label={c.month} raw={m} steps={mSteps} />
        <Row label={c.day} raw={d} steps={dSteps} />
        <Row label={c.year} raw={y} steps={ySteps} />
        <Row label={c.total} raw={sum} steps={digitSteps(sum)} />
      </ol>
    </ExplainLab>
  );
}
