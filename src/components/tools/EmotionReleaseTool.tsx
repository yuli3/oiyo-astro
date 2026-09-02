import { useState, useCallback } from 'react';
import { withTrailingSlash, type Locale } from '../../i18n';

/**
 * Emotion Release — a short guided flow to let a feeling pass:
 * name it → breathe → receive a calming line → let it go.
 * Combines OIYO's breathing/oracle/journal assets in one ritual. ko-first.
 */

interface Quote {
  text: string;
  author: string;
}

const QUOTES: Partial<Record<Locale, Quote[]>> = {
  ko: [
    { text: '우리를 괴롭히는 것은 사건이 아니라, 사건에 대한 우리의 생각이다.', author: '에픽테토스' },
    { text: '바꿀 수 있는 것은 바꾸고, 바꿀 수 없는 것은 받아들이는 평온을.', author: '스토아 격언' },
    { text: '이 또한 지나가리라.', author: '솔로몬의 격언' },
    { text: '강물은 흘러가야 강이다. 감정도 흘려보내야 마음이 된다.', author: '동양 잠언' },
    { text: '파도를 멈출 수는 없지만, 파도 타는 법은 배울 수 있다.', author: '존 카밧진' },
    { text: '가장 어두운 밤도 끝이 나고 해는 떠오른다.', author: '빅토르 위고' },
    { text: '고요한 물이 깊다. 흔들릴수록 가라앉기를 기다려라.', author: '노자에서' },
    { text: '지금 이 호흡 하나면 충분하다. 다음은 다음 호흡이 가져온다.', author: '선(禪) 잠언' },
    { text: '감정에 이름을 붙이는 순간, 그것은 나를 덜 휘두른다.', author: '심리학 격언' },
    { text: '완벽하지 않아도 괜찮다. 오늘은 여기까지로 충분하다.', author: '자기연민의 말' },
    { text: '구름은 하늘을 가리지만, 하늘을 없애지는 못한다.', author: '명상 잠언' },
    { text: '서두르지 않으나 멈추지도 않는다.', author: '괴테' },
  ],
  en: [
    { text: 'It is not events that disturb us, but our judgments about events.', author: 'Epictetus' },
    { text: 'The serenity to accept what cannot be changed, the courage to change what can.', author: 'Stoic maxim' },
    { text: 'This too shall pass.', author: 'Ancient proverb' },
    { text: "You can't stop the waves, but you can learn to surf.", author: 'Jon Kabat-Zinn' },
    { text: 'Even the darkest night will end and the sun will rise.', author: 'Victor Hugo' },
    { text: 'Still waters run deep. Wait for the shaken water to settle.', author: 'after Laozi' },
    { text: 'This one breath is enough. The next will bring the next.', author: 'Zen saying' },
    { text: 'The moment you name a feeling, it sways you less.', author: 'Psychology adage' },
    { text: 'Clouds hide the sky, but cannot erase it.', author: 'Meditation saying' },
    { text: 'Without haste, but without rest.', author: 'Goethe' },
  ],
};

interface UiLabels {
  title: string;
  subtitle: string;
  step1: string;
  emotions: string[];
  customPlaceholder: string;
  toBreath: string;
  step2: string;
  breatheIn: string;
  hold: string;
  breatheOut: string;
  toQuote: string;
  step3: string;
  toRelease: string;
  step4: string;
  releaseLead: string;
  releaseLine: string;
  restart: string;
  journalCta: string;
  breathCta: string;
}

const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '감정 흘려보내기',
    subtitle: '지금의 감정을 이름 붙이고, 한 번 호흡하고, 한 문장으로 마음을 내려놓는 2분 의식.',
    step1: '1. 지금 마음에 가장 큰 감정은?',
    emotions: ['불안', '분노', '슬픔', '외로움', '지침', '초조', '서운함', '두려움'],
    customPlaceholder: '직접 적기…',
    toBreath: '호흡하러 가기 →',
    step2: '2. 천천히 세 번 호흡해요',
    breatheIn: '들이쉬기',
    hold: '잠시 멈춤',
    breatheOut: '내쉬기 (길게)',
    toQuote: '글귀 받기 →',
    step3: '3. 오늘의 한 문장',
    toRelease: '놓아주기 →',
    step4: '4. 흘려보내기',
    releaseLead: '이 감정을 잠시 손에 올려두었다가, 숨과 함께 내려놓아요.',
    releaseLine: '나는 이 감정을 느꼈고, 이제 흘려보냅니다.',
    restart: '다시 하기',
    journalCta: '한 줄 더 적기',
    breathCta: '제대로 호흡하기',
  },
  en: {
    title: 'Let the Feeling Pass',
    subtitle: 'A 2-minute ritual: name the feeling, take a breath, set it down with one line.',
    step1: '1. What is the biggest feeling right now?',
    emotions: ['Anxious', 'Angry', 'Sad', 'Lonely', 'Drained', 'Restless', 'Hurt', 'Afraid'],
    customPlaceholder: 'Write your own…',
    toBreath: 'Go breathe →',
    step2: '2. Breathe slowly, three times',
    breatheIn: 'Breathe in',
    hold: 'Hold',
    breatheOut: 'Breathe out (long)',
    toQuote: 'Receive a line →',
    step3: '3. One line for today',
    toRelease: 'Let it go →',
    step4: '4. Release',
    releaseLead: 'Hold this feeling in your hand for a moment, then set it down with your breath.',
    releaseLine: 'I felt this, and now I let it pass.',
    restart: 'Start again',
    journalCta: 'Write one more line',
    breathCta: 'Breathe properly',
  },
};

interface Props {
  locale: Locale;
}

export default function EmotionReleaseTool({ locale }: Props) {
  const t = L[locale] ?? L.en!;
  const quotes = QUOTES[locale] ?? QUOTES.en!;

  const [step, setStep] = useState(1);
  const [emotion, setEmotion] = useState('');
  const [custom, setCustom] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);

  const localePath = (p: string) => withTrailingSlash(`/${locale}${p}`);

  const pickQuote = useCallback(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setStep(3);
  }, [quotes]);

  const chosen = custom.trim() || emotion;

  const chip = (e: string) => (
    <button
      key={e}
      type="button"
      onClick={() => { setEmotion(e); setCustom(''); }}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        emotion === e ? 'border-green-600 bg-green-600 text-white' : 'border-green-200 bg-card text-green-800 hover:border-green-400'
      }`}
    >
      {e}
    </button>
  );

  return (
    <div className="rounded-2xl border border-green-100 bg-card p-5">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>

      {/* Step 1 */}
      {step === 1 && (
        <div className="mt-6">
          <h2 className="font-semibold text-foreground">{t.step1}</h2>
          <div className="mt-3 flex flex-wrap gap-2">{t.emotions.map(chip)}</div>
          <input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setEmotion(''); }}
            placeholder={t.customPlaceholder}
            className="mt-3 w-full rounded-xl border border-green-200 bg-card px-3 py-2 text-green-900 focus:outline-2 focus:outline-green-500"
          />
          <button
            type="button"
            disabled={!chosen}
            onClick={() => setStep(2)}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {t.toBreath}
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="mt-6 text-center">
          <h2 className="font-semibold text-foreground">{t.step2}</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-surface-subtle py-3 text-green-800">🫁 {t.breatheIn}</div>
            <div className="rounded-xl bg-surface-subtle py-3 text-green-700">⏸️ {t.hold}</div>
            <div className="rounded-xl bg-green-100 py-3 font-semibold text-green-900">🌬️ {t.breatheOut}</div>
          </div>
          <button type="button" onClick={pickQuote} className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            {t.toQuote}
          </button>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && quote && (
        <div className="mt-6">
          <h2 className="font-semibold text-foreground">{t.step3}</h2>
          <blockquote className="mt-4 rounded-2xl border border-green-200 bg-surface-subtle p-6 text-center">
            <p className="text-lg font-semibold leading-8 text-foreground">“{quote.text}”</p>
            <footer className="mt-3 text-sm text-green-600">— {quote.author}</footer>
          </blockquote>
          <button type="button" onClick={() => setStep(4)} className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            {t.toRelease}
          </button>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="mt-6 text-center">
          <h2 className="font-semibold text-foreground">{t.step4}</h2>
          <p className="mt-3 leading-7 text-green-700">{t.releaseLead}</p>
          <p className="mt-5 text-xl font-bold text-green-800">{chosen ? `『${chosen}』 — ` : ''}{t.releaseLine}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => { setStep(1); setEmotion(''); setCustom(''); setQuote(null); }}
              className="rounded-full border border-green-200 bg-card px-4 py-2 text-sm font-medium text-green-800 hover:border-green-400"
            >
              {t.restart}
            </button>
            <a href={localePath('/journal/today')} className="rounded-full border border-green-200 bg-card px-4 py-2 text-sm font-medium text-green-800 hover:border-green-400">
              {t.journalCta}
            </a>
            <a href={localePath('/breathing/timer')} className="rounded-full border border-green-200 bg-card px-4 py-2 text-sm font-medium text-green-800 hover:border-green-400">
              {t.breathCta}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
