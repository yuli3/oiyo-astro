import { useState, useEffect, useCallback } from 'react';
import type { Locale } from '../../i18n';

/**
 * Journaling tool — a daily reflective prompt + private journal saved to
 * localStorage. No account, no server; entries stay in the browser.
 * ko-first; other locales fall back to en prompts/labels.
 */

const PROMPTS: Partial<Record<Locale, string[]>> = {
  ko: [
    '오늘 가장 고마웠던 한 가지는?',
    '오늘 나를 웃게 한 작은 순간은?',
    '지금 마음에 남아 있는 감정은 무엇인가요?',
    '오늘의 나에게 잘했다고 말해줄 한 가지는?',
    '내일의 나에게 남기고 싶은 말은?',
    '요즘 나를 가장 지치게 하는 것은 무엇인가요?',
    '최근 새롭게 알게 된 나의 모습은?',
    '오늘 놓아주고 싶은 생각이나 걱정은?',
    '지금 내가 진짜 원하는 것은 무엇인가요?',
    '오늘 누군가에게 받은(혹은 준) 친절은?',
    '5년 뒤의 내가 지금의 나에게 한마디 한다면?',
    '오늘 하루를 색으로 표현하면? 왜 그 색인가요?',
  ],
  en: [
    'What is one thing you were grateful for today?',
    'What small moment made you smile today?',
    'What emotion is lingering with you right now?',
    'What is one thing you did well today?',
    'What would you like to tell tomorrow’s you?',
    'What has been draining you lately?',
    'What did you newly notice about yourself?',
    'What thought or worry would you like to let go of today?',
    'What is it that you truly want right now?',
    'What kindness did you give or receive today?',
    'If the you of 5 years from now spoke to you, what would they say?',
    'If today were a color, which one — and why?',
  ],
};

interface UiLabels {
  title: string;
  subtitle: string;
  todaysPrompt: string;
  shuffle: string;
  placeholder: string;
  save: string;
  saved: string;
  past: string;
  empty: string;
  delete: string;
  privacy: string;
}

const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '오늘의 저널',
    subtitle: '하루 한 질문에 답하며 마음을 정리하세요. 기록은 이 브라우저에만 저장됩니다.',
    todaysPrompt: '오늘의 질문',
    shuffle: '🎲 다른 질문',
    placeholder: '떠오르는 대로 자유롭게 적어보세요…',
    save: '저장하기',
    saved: '저장됐어요',
    past: '지난 기록',
    empty: '아직 기록이 없어요. 오늘 첫 줄을 남겨보세요.',
    delete: '삭제',
    privacy: '🔒 모든 기록은 이 브라우저(localStorage)에만 저장되며 서버로 전송되지 않습니다.',
  },
  en: {
    title: "Today's Journal",
    subtitle: 'Answer one question a day to settle your mind. Entries are saved only in this browser.',
    todaysPrompt: "Today's question",
    shuffle: '🎲 Another question',
    placeholder: 'Write freely, whatever comes to mind…',
    save: 'Save',
    saved: 'Saved',
    past: 'Past entries',
    empty: 'No entries yet. Leave your first line today.',
    delete: 'Delete',
    privacy: '🔒 All entries are stored only in this browser (localStorage) and never sent to a server.',
  },
};

interface Entry {
  date: string;
  prompt: string;
  text: string;
}

const STORAGE_KEY = 'oiyo-journal-entries';

interface Props {
  locale: Locale;
}

export default function JournalingTool({ locale }: Props) {
  const t = L[locale] ?? L.en!;
  const prompts = PROMPTS[locale] ?? PROMPTS.en!;

  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  // Daily prompt: deterministic by day-of-year, shuffle rotates.
  useEffect(() => {
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setPromptIdx(day % prompts.length);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [prompts.length]);

  const persist = useCallback((list: Entry[]) => {
    setEntries(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }, []);

  const save = () => {
    if (!text.trim()) return;
    const entry: Entry = {
      date: new Date().toISOString().slice(0, 10),
      prompt: prompts[promptIdx],
      text: text.trim(),
    };
    persist([entry, ...entries]);
    setText('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
  };

  const remove = (i: number) => persist(entries.filter((_, idx) => idx !== i));

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-5">
      <h1 className="text-2xl font-bold text-green-950">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>

      <div className="mt-5 rounded-xl bg-green-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700">{t.todaysPrompt}</span>
          <button
            type="button"
            onClick={() => setPromptIdx((i) => (i + 1) % prompts.length)}
            className="rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-semibold text-green-800 hover:border-green-400"
          >
            {t.shuffle}
          </button>
        </div>
        <p className="mt-2 text-lg font-semibold text-green-950">{prompts[promptIdx]}</p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        rows={6}
        className="mt-4 w-full rounded-xl border border-green-200 bg-white p-3 text-green-900 focus:outline-2 focus:outline-offset-2 focus:outline-green-500"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!text.trim()}
          className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {justSaved ? t.saved : t.save}
        </button>
      </div>

      <div className="mt-7 border-t border-green-100 pt-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-green-800">{t.past}</h2>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-green-600">{t.empty}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {entries.map((e, i) => (
              <li key={`${e.date}-${i}`} className="rounded-xl border border-green-100 bg-green-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-700">{e.date}</span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-xs text-green-500 hover:text-red-500"
                  >
                    {t.delete}
                  </button>
                </div>
                <p className="mt-1 text-xs italic text-green-600">{e.prompt}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-green-900">{e.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-xs leading-5 text-green-700">{t.privacy}</p>
    </div>
  );
}
