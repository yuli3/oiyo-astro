import type { ReactNode } from 'react';

// 만지면서 이해하기. 설명 한 문단 + 조작할 수 있는 그림 + 지금 상태를 말해 주는 한 줄.
// ChatGPT 시각 설명(2026-03)처럼 값을 바꾸면 그림과 결론이 바로 바뀌는 블록을 한 모양으로 쓴다.
// 조작은 설명용이다: 저장된 결과를 바꾸지 않는다.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

const EYEBROW: Record<Locale, string> = {
  ko: '만지면서 이해하기',
  en: 'Try it to see it',
  ja: 'さわって理解する',
  zh: '动手看懂',
  fr: 'Manipulez pour comprendre',
  es: 'Toca para entender',
};

interface Props {
  locale: Locale;
  title: string;
  /** 개념 설명. 짧게, 한두 문장. */
  intro: ReactNode;
  /** 조작할 수 있는 그림 */
  children: ReactNode;
  /** 지금 상태를 말로 풀어 쓴 결론. 값이 바뀌면 같이 바뀐다. */
  conclusion: ReactNode;
  /** 출처·한계 한 줄 */
  note?: ReactNode;
}

export default function ExplainLab({ locale, title, intro, children, conclusion, note }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-black tracking-widest text-primary">{EYEBROW[locale]}</p>
      <h2 className="mt-1.5 text-xl font-black text-foreground">{title}</h2>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{intro}</div>
      <div className="mt-4">{children}</div>
      <div className="mt-4 rounded-xl bg-surface-subtle p-4 text-sm leading-6 text-foreground" aria-live="polite">
        {conclusion}
      </div>
      {note && <p className="mt-3 text-xs leading-5 text-muted-foreground">{note}</p>}
    </section>
  );
}
