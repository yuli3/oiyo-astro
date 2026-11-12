import { useState } from 'react';

import ShareResultButton from '../../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import { ANIMAL_IMAGE, ANIMAL_NAMES, SIGN_IMAGE, SIGN_NAMES } from '@/lib/fortune/zodiac-names';
import { newYearProfile, type NewYearProfile, type Relation } from '@/lib/new-year-2027';
import { PERSONAL_YEAR } from '@/lib/symbolic-tradition/numerology-copy';
import { recordTestResult } from '@/lib/user/test-results';

// 2027 신년운세 모음의 "내 2027 한눈에" 칸. 생년월일은 이 브라우저 밖으로 보내지 않는다.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

const ANIMAL_SLUG = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];

const T: Record<Locale, {
  heading: string; lead: string; year: string; month: string; day: string; go: string; again: string; invalid: string;
  animal: string; sign: string; py: string; pyNote: string; beforeLny: string; more: string; limit: string;
  shareHeading: string; tojeong?: string;
  relation: Record<Relation, string>;
}> = {
  ko: {
    heading: '내 2027 한눈에 보기', lead: '생년월일 하나로 띠·별자리·개인년 숫자를 함께 봐요.',
    year: '년', month: '월', day: '일', go: '내 2027 보기', again: '다른 생일로', invalid: '없는 날짜예요. 다시 골라 주세요.',
    animal: '내 띠와 2027 정미년', sign: '내 별자리', py: '2027 개인년 숫자', pyNote: '수비학의 개인년은 9년을 한 바퀴로 도는 주기예요.',
    beforeLny: '설 전에 태어나 앞 해 띠로 봤어요.', more: '자세히', shareHeading: '나의 2027',
    limit: '띠의 충·합 같은 관계는 전통 해석이에요. 앞일을 정하지 않으니 한 해를 시작하는 이야깃거리로 봐 주세요.',
    tojeong: '이 생일로 토정비결 보기',
    relation: {
      same: '2027년은 내 띠의 해예요. 전통적으로 나를 더 돌보라는 해로 봐요.',
      clash: '양과 소는 전통적으로 충(沖)이에요. 이사·이직처럼 움직임이 생기기 쉬운 해로 봐요.',
      harm: '양과 쥐는 전통적으로 해(害)·원진이에요. 가까운 사이의 말 한마디를 살피라는 해로 봐요.',
      punish: '양과 개는 전통적으로 형(刑)·파(破)예요. 약속과 서류를 꼼꼼히 보라는 해로 봐요.',
      harmony: '양과는 전통적으로 합(合)이 맞는 띠예요. 사람과 손잡기 좋은 해로 봐요.',
      none: '양과 특별히 부딪히거나 합하는 관계는 없어요. 하던 흐름대로 가면 되는 해로 봐요.',
    },
  },
  en: {
    heading: 'Your 2027 at a glance', lead: 'One birthday gives your Chinese zodiac animal, sun sign and personal year number.',
    year: 'Year', month: 'Month', day: 'Day', go: 'See my 2027', again: 'Try another birthday', invalid: 'That date does not exist. Please pick again.',
    animal: 'Your animal and the 2027 Fire Goat', sign: 'Your sun sign', py: '2027 personal year', pyNote: 'In numerology the personal year runs in a nine-year cycle.',
    beforeLny: 'Born before Lunar New Year, so you take the previous year’s animal.', more: 'More', shareHeading: 'My 2027',
    limit: 'Animal clashes and harmonies are traditional readings. They do not decide what happens, so treat them as a way to start the year.',
    relation: {
      same: '2027 is your own animal’s year. Tradition reads it as a year to look after yourself.',
      clash: 'Goat and Ox are a traditional “clash”. Read as a year when moves and changes come easily.',
      harm: 'Goat and Rat are a traditional “harm” pair. Read as a year to mind small words with close people.',
      punish: 'Goat and Dog are a traditional “punishment” pair. Read as a year to check promises and paperwork.',
      harmony: 'Your animal is in traditional harmony with the Goat. Read as a good year to team up.',
      none: 'No special clash or harmony with the Goat. Read as a year to keep your own pace.',
    },
  },
  ja: {
    heading: 'わたしの2027年をひと目で', lead: '生年月日ひとつで、干支・星座・パーソナルイヤーをまとめて見ます。',
    year: '年', month: '月', day: '日', go: '2027年を見る', again: '別の誕生日で', invalid: 'ない日付です。もう一度選んでください。',
    animal: 'わたしの干支と2027年（丁未・ひのとひつじ）', sign: 'わたしの星座', py: '2027年のパーソナルイヤー', pyNote: '数秘術のパーソナルイヤーは9年でひと回りする周期です。',
    beforeLny: '旧正月より前の生まれなので、前の年の干支で見ています。', more: '詳しく', shareHeading: 'わたしの2027年',
    limit: '干支の相性は伝統的な読み方で、先のことを決めるものではありません。新しい年の話のタネとしてどうぞ。',
    relation: {
      same: '2027年は自分の干支の年（年男・年女）です。自分をいたわる年と読みます。',
      clash: '未と丑は伝統的に「冲」の関係。引っ越しや転職など動きが出やすい年と読みます。',
      harm: '未と子は伝統的に「害」の関係。身近な人との一言に気をつける年と読みます。',
      punish: '未と戌は伝統的に「刑・破」の関係。約束や書類をよく確かめる年と読みます。',
      harmony: '未と「合」の関係にある干支です。人と手を組むのに向く年と読みます。',
      none: '未と特にぶつかる・合う関係はありません。自分のペースで進む年と読みます。',
    },
  },
  zh: {
    heading: '一眼看懂我的2027', lead: '输入生日，同时查看生肖、星座和个人年数字。',
    year: '年', month: '月', day: '日', go: '查看我的2027', again: '换个生日', invalid: '日期不存在，请重新选择。',
    animal: '我的生肖与2027丁未羊年', sign: '我的星座', py: '2027个人年数字', pyNote: '数字命理中的个人年以九年为一个循环。',
    beforeLny: '生于春节之前，按上一年的生肖计算。', more: '详情', shareHeading: '我的2027',
    limit: '犯太岁、六合三合都是传统说法，并不决定未来，请当作新年的话题来看。',
    relation: {
      same: '2027年是你的本命年（值太岁）。传统上提醒多照顾自己。',
      clash: '羊与牛相冲（冲太岁）。传统上看作搬家、换工作等变动较多的一年。',
      harm: '羊与鼠相害（害太岁）。传统上提醒与亲近的人说话多留心。',
      punish: '羊与狗相刑相破（刑太岁）。传统上提醒仔细核对约定和文件。',
      harmony: '你的生肖与羊相合。传统上看作适合与人合作的一年。',
      none: '与羊没有特别的冲合关系，按自己的节奏走就好。',
    },
  },
  fr: {
    heading: 'Votre 2027 en un coup d’œil', lead: 'Une date de naissance donne votre animal chinois, votre signe et votre année personnelle.',
    year: 'Année', month: 'Mois', day: 'Jour', go: 'Voir mon 2027', again: 'Une autre date', invalid: 'Cette date n’existe pas. Choisissez-en une autre.',
    animal: 'Votre animal et la Chèvre de Feu 2027', sign: 'Votre signe solaire', py: 'Année personnelle 2027', pyNote: 'En numérologie, l’année personnelle suit un cycle de neuf ans.',
    beforeLny: 'Né avant le Nouvel An lunaire : vous gardez l’animal de l’année précédente.', more: 'Détails', shareHeading: 'Mon 2027',
    limit: 'Les affinités entre animaux sont des lectures traditionnelles. Elles ne décident de rien : prenez-les comme un point de départ.',
    relation: {
      same: '2027 est l’année de votre propre animal. La tradition y voit une année pour prendre soin de soi.',
      clash: 'Chèvre et Bœuf forment une « opposition » traditionnelle : une année propice aux déménagements et changements.',
      harm: 'Chèvre et Rat forment un couple « nuisible » traditionnel : surveillez les petits mots avec vos proches.',
      punish: 'Chèvre et Chien forment un couple « punition » traditionnel : vérifiez promesses et papiers.',
      harmony: 'Votre animal est en harmonie traditionnelle avec la Chèvre : une bonne année pour s’associer.',
      none: 'Pas d’opposition ni d’harmonie particulière avec la Chèvre : gardez votre rythme.',
    },
  },
  es: {
    heading: 'Tu 2027 de un vistazo', lead: 'Con una fecha de nacimiento ves tu animal chino, tu signo y tu año personal.',
    year: 'Año', month: 'Mes', day: 'Día', go: 'Ver mi 2027', again: 'Otra fecha', invalid: 'Esa fecha no existe. Elige otra.',
    animal: 'Tu animal y la Cabra de Fuego 2027', sign: 'Tu signo solar', py: 'Año personal 2027', pyNote: 'En numerología el año personal sigue un ciclo de nueve años.',
    beforeLny: 'Naciste antes del Año Nuevo lunar, así que tomas el animal del año anterior.', more: 'Más', shareHeading: 'Mi 2027',
    limit: 'Los choques y armonías entre animales son lecturas tradicionales. No deciden nada: tómalas como un punto de partida.',
    relation: {
      same: '2027 es el año de tu propio animal. La tradición lo ve como un año para cuidarte.',
      clash: 'Cabra y Buey son un «choque» tradicional: un año en que llegan mudanzas y cambios.',
      harm: 'Cabra y Rata son una pareja «dañina» tradicional: cuida las palabras con la gente cercana.',
      punish: 'Cabra y Perro son una pareja de «castigo» tradicional: revisa promesas y papeles.',
      harmony: 'Tu animal está en armonía tradicional con la Cabra: buen año para aliarte.',
      none: 'Sin choque ni armonía especial con la Cabra: sigue tu propio ritmo.',
    },
  },
};

const YEARS = Array.from({ length: 2020 - 1930 + 1 }, (_, i) => 2020 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const selectClass = 'mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground';

export default function NewYear2027Hub({ locale }: { locale: string }) {
  const l = (locale in T ? locale : 'en') as Locale;
  const t = T[l];
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<NewYearProfile | null>(null);

  function show() {
    setError(null);
    try {
      const p = newYearProfile(year, month, day);
      setProfile(p);
      const animal = ANIMAL_NAMES[l][p.animal];
      const sign = SIGN_NAMES[l][p.sign];
      recordTestResult({
        kind: 'fortune',
        testId: 'new-year-2027',
        title: t.shareHeading,
        resultLabel: `${animal} · ${sign} · ${p.personalYear}`,
        result: { animal: p.animal, sign: p.sign, personalYear: p.personalYear },
        locale: l,
        sourcePath: `/${l}/new-year-2027/`,
      });
      gaEvent('new_year_2027_view', { relation: p.relation, py: String(p.personalYear) });
    } catch {
      setError(t.invalid);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="ny2027-me">
      <h2 id="ny2027-me" className="text-xl font-black text-foreground">{t.heading}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.lead}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <label className="text-xs font-semibold text-muted-foreground">
          {t.year}
          <select className={selectClass} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          {t.month}
          <select className={selectClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          {t.day}
          <select className={selectClass} value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>
      <button type="button" onClick={show} className="mt-4 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
        {profile ? t.again : t.go}
      </button>
      {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}

      {profile && (
        <div className="mt-5 space-y-3" aria-live="polite">
          <article className="animate-fadeInUp flex gap-4 rounded-xl border border-border p-4">
            <img src={ANIMAL_IMAGE[profile.animal]} alt="" width={64} height={64} className="size-16 shrink-0 rounded-xl" loading="lazy" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary">{t.animal}</p>
              <h3 className="mt-1 text-lg font-black text-foreground">{ANIMAL_NAMES[l][profile.animal]}</h3>
              <p className="mt-1 text-sm leading-6 text-foreground">{t.relation[profile.relation]}</p>
              {profile.beforeLunarNewYear && <p className="mt-1 text-xs text-muted-foreground">{t.beforeLny}</p>}
              <a href={`/${l}/chinese-zodiac/${ANIMAL_SLUG[profile.animal]}/`} className="mt-2 inline-block text-sm font-semibold text-primary underline underline-offset-4">{t.more}</a>
            </div>
          </article>
          <article className="animate-fadeInUp flex gap-4 rounded-xl border border-border p-4">
            <img src={SIGN_IMAGE[profile.sign]} alt="" width={64} height={64} className="size-16 shrink-0 rounded-xl" loading="lazy" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary">{t.sign}</p>
              <h3 className="mt-1 text-lg font-black text-foreground">{SIGN_NAMES[l][profile.sign]}</h3>
              <a href={`/${l}/zodiac/personality/`} className="mt-2 inline-block text-sm font-semibold text-primary underline underline-offset-4">{t.more}</a>
            </div>
          </article>
          <article className="animate-fadeInUp flex gap-4 rounded-xl border border-border p-4">
            <p className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-3xl font-black text-primary">{profile.personalYear}</p>
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary">{t.py}</p>
              <p className="mt-1 text-sm leading-6 text-foreground">{PERSONAL_YEAR[profile.personalYear]?.[l]}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.pyNote}</p>
              <a href={`/${l}/numerology/calculator/`} className="mt-2 inline-block text-sm font-semibold text-primary underline underline-offset-4">{t.more}</a>
            </div>
          </article>
          {t.tojeong && (
            <a href={`/${l}/tojeong-2027/`} className="flex min-h-12 items-center justify-between rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm font-bold text-foreground">
              <span>📜 {t.tojeong}</span><span aria-hidden="true">→</span>
            </a>
          )}
          <ShareResultButton
            locale={l}
            heading={t.shareHeading}
            resultTitle={`${ANIMAL_NAMES[l][profile.animal]} · ${SIGN_NAMES[l][profile.sign]} · ${profile.personalYear}`}
            emoji="🐑"
            description={t.relation[profile.relation]}
            analyticsId="new-year-2027"
          />
          <p className="text-xs leading-5 text-muted-foreground">{t.limit}</p>
        </div>
      )}
    </section>
  );
}
