import { useEffect, useState } from 'react';

import ShareResultButton from '../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import { listStoredTestResults } from '@/lib/user/test-results';
import { buildYearRecap, recapKeywordIndex, type YearRecap as Recap } from '@/lib/year-recap';

// 나의 한 해 결산 카드. 이 브라우저의 검사 기록만 읽어 카드 한 장으로 묶는다.
// 서버로 보내는 것은 없고, 공유는 사용자가 이미지 저장을 눌렀을 때만 일어난다.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

const YEAR = 2026;

const KEYWORDS: Record<Locale, string[]> = {
  ko: ['한 걸음씩', '가볍게', '깊게', '같이', '다시 시작', '나답게', '천천히', '넓게', '정리', '용기', '쉼', '호기심'],
  en: ['One step at a time', 'Lighter', 'Deeper', 'Together', 'Fresh start', 'True to me', 'Slowly', 'Wider', 'Clear out', 'Courage', 'Rest', 'Curiosity'],
  ja: ['一歩ずつ', '軽やかに', '深く', '一緒に', '再スタート', '自分らしく', 'ゆっくり', '広く', '整える', '勇気', '休む', '好奇心'],
  zh: ['一步一步', '轻装上阵', '更深一点', '一起', '重新开始', '做自己', '慢慢来', '更宽广', '整理', '勇气', '休息', '好奇心'],
  fr: ['Pas à pas', 'Plus léger', 'Plus profond', 'Ensemble', 'Nouveau départ', 'Fidèle à moi', 'Doucement', 'Plus large', 'Faire le tri', 'Courage', 'Repos', 'Curiosité'],
  es: ['Paso a paso', 'Más ligero', 'Más hondo', 'Juntos', 'Nuevo comienzo', 'Fiel a mí', 'Despacio', 'Más amplio', 'Ordenar', 'Valor', 'Descanso', 'Curiosidad'],
};

const T: Record<Locale, {
  heading: string;
  title: string;
  stats: (runs: number, tests: number) => string;
  keyword: string;
  keywordNote: string;
  emptyTitle: string;
  empty: string;
  privacy: string;
  open: string;
  suggest: { href: string; label: string }[];
}> = {
  ko: {
    heading: `나의 ${YEAR} 결산`, title: `${YEAR}년의 나`,
    stats: (runs, tests) => `올해 이 브라우저에서 검사를 ${runs}번 했고, 그중 ${tests}가지 결과가 카드에 담겼어요.`,
    keyword: `${YEAR + 1} 키워드`, keywordNote: '올해 결과에서 고른 마무리 한 단어예요. 앞일을 알려 주는 운세는 아니에요.',
    emptyTitle: '카드를 채울 결과가 아직 부족해요',
    empty: '결과가 2개 이상 모이면 카드가 만들어져요. 아래 검사 중 두 가지를 해 보세요.',
    privacy: '이 카드는 이 브라우저에 저장된 결과만 읽어요. 서버로 보내지 않아요.',
    open: '다시 보기',
    suggest: [
      { href: '/ko/mbti/test/', label: 'MBTI 테스트' },
      { href: '/ko/reincarnation-country/', label: '다시 태어나면 어느 나라?' },
      { href: '/ko/joseon-1426/', label: '600년 전 조선에서 나는?' },
      { href: '/ko/enneagram/test/', label: '에니어그램 테스트' },
    ],
  },
  en: {
    heading: `My ${YEAR} recap`, title: `Me in ${YEAR}`,
    stats: (runs, tests) => `You finished ${runs} tests in this browser this year; ${tests} results made it onto the card.`,
    keyword: `Word for ${YEAR + 1}`, keywordNote: 'A closing word picked from this year’s results. It is not a fortune.',
    emptyTitle: 'Not enough results for a card yet',
    empty: 'The card appears once you have two or more results. Try two of these.',
    privacy: 'This card reads only results saved in this browser. Nothing is sent to a server.',
    open: 'Open',
    suggest: [
      { href: '/en/mbti/test/', label: 'MBTI test' },
      { href: '/en/reincarnation-country/', label: 'Where would you be reborn?' },
      { href: '/en/europe-1426/', label: 'Who were you in 1426 Europe?' },
      { href: '/en/enneagram/test/', label: 'Enneagram test' },
    ],
  },
  ja: {
    heading: `わたしの${YEAR}年まとめ`, title: `${YEAR}年のわたし`,
    stats: (runs, tests) => `今年このブラウザでテストを${runs}回終え、そのうち${tests}つの結果がカードに入りました。`,
    keyword: `${YEAR + 1}年のキーワード`, keywordNote: '今年の結果から選んだ締めくくりの一言です。占いではありません。',
    emptyTitle: 'カードにする結果がまだ足りません',
    empty: '結果が2つ以上集まるとカードができます。下のテストから2つ試してみてください。',
    privacy: 'このカードはこのブラウザに保存された結果だけを読みます。サーバーには送りません。',
    open: '見る',
    suggest: [
      { href: '/ja/mbti/test/', label: 'MBTI性格テスト' },
      { href: '/ja/reincarnation-country/', label: '生まれ変わったらどの国？' },
      { href: '/ja/europe-1426/', label: '1426年のヨーロッパでわたしは？' },
      { href: '/ja/enneagram/test/', label: 'エニアグラムテスト' },
    ],
  },
  zh: {
    heading: `我的${YEAR}年总结`, title: `${YEAR}年的我`,
    stats: (runs, tests) => `今年你在这个浏览器里完成了${runs}次测验，其中${tests}个结果放进了卡片。`,
    keyword: `${YEAR + 1}年关键词`, keywordNote: '从今年的结果中挑出的收尾词，不是运势预测。',
    emptyTitle: '结果还不够生成卡片',
    empty: '有两个以上结果时就会生成卡片。试试下面任意两个测验吧。',
    privacy: '这张卡片只读取保存在本浏览器里的结果，不会发送到服务器。',
    open: '查看',
    suggest: [
      { href: '/zh/mbti/test/', label: 'MBTI 性格测试' },
      { href: '/zh/reincarnation-country/', label: '转世会生在哪个国家？' },
      { href: '/zh/europe-1426/', label: '1426 年的欧洲，我是谁？' },
      { href: '/zh/enneagram/test/', label: '九型人格测验' },
    ],
  },
  fr: {
    heading: `Mon bilan ${YEAR}`, title: `Moi en ${YEAR}`,
    stats: (runs, tests) => `Vous avez terminé ${runs} tests dans ce navigateur cette année ; ${tests} résultats figurent sur la carte.`,
    keyword: `Mot pour ${YEAR + 1}`, keywordNote: 'Un mot de conclusion tiré des résultats de l’année. Ce n’est pas une prédiction.',
    emptyTitle: 'Pas encore assez de résultats',
    empty: 'La carte apparaît à partir de deux résultats. Essayez-en deux ci-dessous.',
    privacy: 'Cette carte ne lit que les résultats enregistrés dans ce navigateur. Rien n’est envoyé à un serveur.',
    open: 'Voir',
    suggest: [
      { href: '/fr/mbti/test/', label: 'Test MBTI' },
      { href: '/fr/reincarnation-country/', label: 'Où renaîtriez-vous ?' },
      { href: '/fr/europe-1426/', label: 'Qui étiez-vous en 1426 ?' },
      { href: '/fr/enneagram/test/', label: 'Test de l’ennéagramme' },
    ],
  },
  es: {
    heading: `Mi resumen ${YEAR}`, title: `Yo en ${YEAR}`,
    stats: (runs, tests) => `Este año terminaste ${runs} tests en este navegador; ${tests} resultados entraron en la tarjeta.`,
    keyword: `Palabra para ${YEAR + 1}`, keywordNote: 'Una palabra de cierre elegida a partir de los resultados del año. No es una predicción.',
    emptyTitle: 'Aún no hay suficientes resultados',
    empty: 'La tarjeta aparece con dos o más resultados. Prueba dos de estos.',
    privacy: 'Esta tarjeta solo lee los resultados guardados en este navegador. No se envía nada a ningún servidor.',
    open: 'Ver',
    suggest: [
      { href: '/es/mbti/test/', label: 'Test MBTI' },
      { href: '/es/reincarnation-country/', label: '¿Dónde renacerías?' },
      { href: '/es/europe-1426/', label: '¿Quién eras en 1426?' },
      { href: '/es/enneagram/test/', label: 'Test del eneagrama' },
    ],
  },
};

export default function YearRecap({ locale }: { locale: string }) {
  const l = (locale in T ? locale : 'en') as Locale;
  const t = T[l];
  const [recap, setRecap] = useState<Recap | null>(null);

  useEffect(() => {
    const next = buildYearRecap(listStoredTestResults(), YEAR);
    setRecap(next);
    gaEvent('year_recap_view', { items: String(next.items.length) });
  }, []);

  if (!recap) return <div className="min-h-64" aria-busy="true" />;

  if (recap.items.length < 2) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-black text-foreground">{t.emptyTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.empty}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {t.suggest.map((s) => (
            <li key={s.href}>
              <a href={s.href} className="flex min-h-12 items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground hover:bg-surface-subtle">
                <span>{s.label}</span>
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{t.privacy}</p>
      </section>
    );
  }

  const keywords = KEYWORDS[l];
  const keyword = keywords[recapKeywordIndex(recap.items, keywords.length)];
  const description = recap.items.map((i) => (i.title ? `${i.title}: ${i.resultLabel}` : i.resultLabel)).join(' · ');

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{t.heading}</p>
        <h2 className="mt-2 text-3xl font-black text-foreground">{t.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.stats(recap.totalRuns, recap.distinctTests)}</p>
        <ul className="mt-5 space-y-2">
          {recap.items.map((item) => (
            <li key={item.testId} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <div className="min-w-0">
                {item.title && <p className="truncate text-xs text-muted-foreground">{item.title}</p>}
                <p className="text-base font-bold text-foreground">{item.resultLabel}</p>
              </div>
              {item.sourcePath && (
                <a href={item.sourcePath} className="shrink-0 text-sm font-semibold text-primary underline underline-offset-4">{t.open}</a>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl bg-surface-subtle p-4 text-center">
          <p className="text-xs font-bold text-muted-foreground">{t.keyword}</p>
          <p className="mt-1 text-2xl font-black text-foreground">{keyword}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{t.keywordNote}</p>
        </div>
      </div>
      <ShareResultButton
        locale={l}
        heading={t.heading}
        resultTitle={`${t.keyword}: ${keyword}`}
        emoji="🗓️"
        description={description}
        analyticsId="year-recap-2026"
      />
      <p className="text-xs leading-5 text-muted-foreground">{t.privacy}</p>
    </section>
  );
}
