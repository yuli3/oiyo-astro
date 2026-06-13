import { useMemo, useState } from 'react';
import { SAGE_CARDS } from '../../data/sages-cards';

type Locale = 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'es';

interface Props {
  locale: string;
}

const DECK_EMOJI: Record<string, string> = {
  '그라시안 처세': '🎴',
  '스토아 평정': '🏛️',
  '손자병법': '⚔️',
  '노자 도덕경': '🌿',
  '한국 속담': '🪶',
};

const COPY: Record<Locale, {
  title: string;
  subtitle: string;
  todayLabel: string;
  draw: string;
  redraw: string;
  read: string;
  note: string;
}> = {
  ko: {
    title: '오늘의 현인의 카드',
    subtitle: '동서양 현인의 지혜 451장에서 오늘 한 장을 펼칩니다.',
    todayLabel: '오늘의 카드',
    draw: '오늘의 카드 펼치기',
    redraw: '다른 카드 뽑기',
    read: '전문 읽기 →',
    note: '운세가 아니라 사색의 출발점입니다. 한 줄을 오늘 내 상황에 비춰 보세요.',
  },
  en: {
    title: "Today's Sage Card",
    subtitle: 'Draw one of 451 cards of wisdom from East and West sages.',
    todayLabel: "Today's card",
    draw: "Reveal today's card",
    redraw: 'Draw another',
    read: 'Read in full →',
    note: 'Not fortune-telling, but a starting point for reflection. (Full text in Korean.)',
  },
  ja: {
    title: '今日の賢者カード',
    subtitle: '東西の賢者の知恵451枚から、今日の一枚をめくります。',
    todayLabel: '今日のカード',
    draw: '今日のカードをめくる',
    redraw: '別のカードを引く',
    read: '全文を読む →',
    note: '占いではなく、思索の出発点です。（全文は韓国語）',
  },
  zh: {
    title: '今日贤者卡',
    subtitle: '从东西方贤者的451张智慧卡中，翻开今天的一张。',
    todayLabel: '今日卡片',
    draw: '翻开今日卡片',
    redraw: '再抽一张',
    read: '阅读全文 →',
    note: '不是占卜，而是思考的起点。（全文为韩文）',
  },
  fr: {
    title: 'Carte du Sage du Jour',
    subtitle: "Tirez l'une des 451 cartes de sagesse des sages d'Orient et d'Occident.",
    todayLabel: 'Carte du jour',
    draw: 'Révéler la carte du jour',
    redraw: 'Tirer une autre',
    read: 'Lire en entier →',
    note: "Pas de la voyance, mais un point de départ pour la réflexion. (Texte en coréen.)",
  },
  es: {
    title: 'Carta del Sabio del Día',
    subtitle: 'Saca una de las 451 cartas de sabiduría de los sabios de Oriente y Occidente.',
    todayLabel: 'Carta del día',
    draw: 'Revelar la carta de hoy',
    redraw: 'Sacar otra',
    read: 'Leer completo →',
    note: 'No es adivinación, sino un punto de partida para la reflexión. (Texto en coreano.)',
  },
};

// Deterministic daily index from the date (YYYY-MM-DD) so the card is stable for the day.
function dailyIndex(len: number): number {
  const d = new Date();
  const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  // simple hash spread
  let h = key;
  h = (h ^ (h >>> 13)) * 0x5bd1e995;
  h = h ^ (h >>> 15);
  return Math.abs(h) % len;
}

export default function SagesCardDaily({ locale }: Props) {
  const t = COPY[(locale as Locale)] ?? COPY.en;
  const wikiLocale = 'ko'; // card text lives on the Korean wiki
  const todayCard = useMemo(() => SAGE_CARDS[dailyIndex(SAGE_CARDS.length)], []);
  const [card, setCard] = useState<typeof todayCard | null>(null);
  const [isDaily, setIsDaily] = useState(true);

  const reveal = () => { setCard(todayCard); setIsDaily(true); };
  const redraw = () => {
    let next = SAGE_CARDS[Math.floor(Math.random() * SAGE_CARDS.length)];
    if (card && SAGE_CARDS.length > 1) {
      while (next.slug === card.slug) next = SAGE_CARDS[Math.floor(Math.random() * SAGE_CARDS.length)];
    }
    setCard(next); setIsDaily(false);
  };

  return (
    <section className="mx-auto w-full max-w-xl">
      <header className="mb-5 text-center">
        <h2 className="text-2xl font-extrabold text-green-800">{t.title}</h2>
        <p className="mt-1 text-sm text-green-700/70">{t.subtitle}</p>
      </header>

      {!card ? (
        <button
          onClick={reveal}
          className="mx-auto block rounded-2xl border-2 border-dashed border-green-300 bg-green-50/60 px-8 py-12 text-lg font-bold text-green-700 transition-colors hover:bg-green-100"
        >
          ✨ {t.draw}
        </button>
      ) : (
        <article className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
              {DECK_EMOJI[card.deck] ?? '📜'} {card.deck}
            </span>
            {isDaily && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-green-600/70">{t.todayLabel}</span>
            )}
          </div>
          {card.short && (
            <p className="mt-5 text-center text-3xl font-black text-green-900">{card.short}</p>
          )}
          <p className="mt-3 text-center text-base font-semibold leading-relaxed text-green-800">{card.title}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <a
              href={`https://wiki.oiyo.net/${wikiLocale}/${card.slug}/`}
              className="inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-800"
            >
              {t.read}
            </a>
            <button
              onClick={redraw}
              className="inline-flex items-center justify-center rounded-lg border border-green-300 px-5 py-2.5 text-sm font-bold text-green-700 transition-colors hover:bg-green-50"
            >
              🔄 {t.redraw}
            </button>
          </div>
        </article>
      )}
      <p className="mt-4 text-center text-xs text-green-700/60">{t.note}</p>
    </section>
  );
}
