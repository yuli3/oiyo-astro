import { useEffect, useState } from 'react';

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

// 감정일기: 사건→생각→감정→행동→결과 5단 기록 + "관점 바꾸기"(생각 교체→감정 재평가).
// 데이터는 이 브라우저(localStorage)에만 저장된다.
const KEY = 'oiyo:emotion-diary:v1';

interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  event: string;
  thought: string;
  emotions: string[];
  action: string;
  outcome: string;
  reframedThought?: string;
  reframedEmotions?: string[];
}

const EMOTIONS: Record<Locale, string[]> = {
  ko: ['기쁨', '감사', '설렘', '평온', '뿌듯함', '슬픔', '불안', '분노', '짜증', '수치심', '죄책감', '외로움', '무기력', '질투', '두려움', '혼란'],
  en: ['Joy', 'Gratitude', 'Excitement', 'Calm', 'Pride', 'Sadness', 'Anxiety', 'Anger', 'Irritation', 'Shame', 'Guilt', 'Loneliness', 'Apathy', 'Jealousy', 'Fear', 'Confusion'],
  ja: ['喜び', '感謝', 'ときめき', '平穏', '誇らしさ', '悲しみ', '不安', '怒り', 'イライラ', '恥', '罪悪感', '孤独', '無気力', '嫉妬', '恐れ', '混乱'],
  zh: ['喜悦', '感恩', '心动', '平静', '自豪', '悲伤', '焦虑', '愤怒', '烦躁', '羞耻', '内疚', '孤独', '无力', '嫉妒', '恐惧', '困惑'],
  fr: ['Joie', 'Gratitude', 'Enthousiasme', 'Calme', 'Fierté', 'Tristesse', 'Anxiété', 'Colère', 'Irritation', 'Honte', 'Culpabilité', 'Solitude', 'Apathie', 'Jalousie', 'Peur', 'Confusion'],
  es: ['Alegría', 'Gratitud', 'Ilusión', 'Calma', 'Orgullo', 'Tristeza', 'Ansiedad', 'Ira', 'Irritación', 'Vergüenza', 'Culpa', 'Soledad', 'Apatía', 'Celos', 'Miedo', 'Confusión'],
};

const L: Record<Locale, {
  steps: [string, string, string, string, string];
  hints: [string, string, string, string, string];
  emotionsLabel: string; save: string; next: string; back: string; newEntry: string;
  reframeTitle: string; reframeHint: string; reframeEmotions: string; reframeSkip: string; reframeDone: string;
  listTitle: string; empty: string; privacy: string; deleted: string; delete_: string; saved: string;
  before: string; after: string;
}> = {
  ko: { steps: ['사건', '생각', '감정', '행동', '결과'], hints: ['오늘 있었던 일 중 하나를 골라 사실만 적어보세요.', '그 순간 머릿속을 스친 생각은 무엇이었나요?', '그때 느낀 감정을 골라보세요(여러 개 가능).', '그래서 나는 어떻게 행동했나요?', '그 행동의 결과는 어땠나요?'], emotionsLabel: '감정 선택', save: '기록 저장', next: '다음', back: '이전', newEntry: '새 기록 쓰기', reframeTitle: '관점 바꾸기', reframeHint: '같은 사건을 다르게 볼 수 있다면, 어떤 생각으로 바꿔볼 수 있을까요?', reframeEmotions: '바뀐 생각으로 보면 어떤 감정이 드나요?', reframeSkip: '건너뛰기', reframeDone: '완료', listTitle: '나의 감정일기', empty: '아직 기록이 없습니다. 오늘의 한 장면부터 시작해보세요.', privacy: '모든 기록은 이 브라우저에만 저장됩니다.', deleted: '삭제됨', delete_: '삭제', saved: '저장되었습니다', before: '처음 생각', after: '바꾼 생각' },
  en: { steps: ['Event', 'Thought', 'Emotion', 'Action', 'Outcome'], hints: ['Pick one thing that happened today — just the facts.', 'What thought crossed your mind in that moment?', 'Pick the emotions you felt (multiple OK).', 'So what did you do?', 'What was the outcome of that action?'], emotionsLabel: 'Pick emotions', save: 'Save entry', next: 'Next', back: 'Back', newEntry: 'Write a new entry', reframeTitle: 'Reframe it', reframeHint: 'If you could see the same event differently, what thought would you try instead?', reframeEmotions: 'With that new thought, what do you feel?', reframeSkip: 'Skip', reframeDone: 'Done', listTitle: 'My emotion diary', empty: 'No entries yet. Start with one scene from today.', privacy: 'Everything stays in this browser only.', deleted: 'Deleted', delete_: 'Delete', saved: 'Saved', before: 'First thought', after: 'Reframed thought' },
  ja: { steps: ['出来事', '考え', '感情', '行動', '結果'], hints: ['今日あったことを一つ選び、事実だけ書いてみましょう。', 'その瞬間、頭をよぎった考えは？', 'そのとき感じた感情を選んでください(複数可)。', 'それで、どう行動しましたか？', 'その行動の結果はどうでしたか？'], emotionsLabel: '感情を選ぶ', save: '記録を保存', next: '次へ', back: '前へ', newEntry: '新しく書く', reframeTitle: '見方を変える', reframeHint: '同じ出来事を違う角度で見るなら、どんな考えに置き換えられますか？', reframeEmotions: 'その考えで見ると、どんな感情になりますか？', reframeSkip: 'スキップ', reframeDone: '完了', listTitle: '私の感情日記', empty: 'まだ記録がありません。今日の一場面から始めましょう。', privacy: '記録はこのブラウザにのみ保存されます。', deleted: '削除済み', delete_: '削除', saved: '保存しました', before: '最初の考え', after: '変えた考え' },
  zh: { steps: ['事件', '想法', '情绪', '行动', '结果'], hints: ['选择今天发生的一件事，只写事实。', '那一刻你脑中闪过什么想法？', '选择当时的情绪(可多选)。', '于是你做了什么？', '那个行动的结果如何？'], emotionsLabel: '选择情绪', save: '保存记录', next: '下一步', back: '上一步', newEntry: '写新记录', reframeTitle: '换个角度', reframeHint: '如果换个角度看同一件事，你会换成什么想法？', reframeEmotions: '用新的想法来看，你有什么感受？', reframeSkip: '跳过', reframeDone: '完成', listTitle: '我的情绪日记', empty: '还没有记录。从今天的一个场景开始吧。', privacy: '所有记录仅保存在此浏览器中。', deleted: '已删除', delete_: '删除', saved: '已保存', before: '最初的想法', after: '换后的想法' },
  fr: { steps: ['Événement', 'Pensée', 'Émotion', 'Action', 'Résultat'], hints: ["Choisissez une chose arrivée aujourd'hui — les faits seulement.", 'Quelle pensée a traversé votre esprit à ce moment ?', 'Choisissez les émotions ressenties (plusieurs possibles).', "Qu'avez-vous fait alors ?", 'Quel a été le résultat de cette action ?'], emotionsLabel: 'Choisir les émotions', save: "Enregistrer", next: 'Suivant', back: 'Retour', newEntry: 'Nouvelle entrée', reframeTitle: 'Changer de regard', reframeHint: 'Si vous voyiez le même événement autrement, quelle pensée essaieriez-vous ?', reframeEmotions: 'Avec cette nouvelle pensée, que ressentez-vous ?', reframeSkip: 'Passer', reframeDone: 'Terminé', listTitle: 'Mon journal des émotions', empty: "Aucune entrée. Commencez par une scène d'aujourd'hui.", privacy: 'Tout reste uniquement dans ce navigateur.', deleted: 'Supprimé', delete_: 'Supprimer', saved: 'Enregistré', before: 'Première pensée', after: 'Pensée reformulée' },
  es: { steps: ['Evento', 'Pensamiento', 'Emoción', 'Acción', 'Resultado'], hints: ['Elige una cosa que pasó hoy: solo los hechos.', '¿Qué pensamiento cruzó tu mente en ese momento?', 'Elige las emociones que sentiste (varias OK).', '¿Y qué hiciste entonces?', '¿Cuál fue el resultado de esa acción?'], emotionsLabel: 'Elegir emociones', save: 'Guardar', next: 'Siguiente', back: 'Atrás', newEntry: 'Nueva entrada', reframeTitle: 'Cambia la mirada', reframeHint: 'Si vieras el mismo evento de otra forma, ¿qué pensamiento probarías?', reframeEmotions: 'Con ese nuevo pensamiento, ¿qué sientes?', reframeSkip: 'Omitir', reframeDone: 'Hecho', listTitle: 'Mi diario de emociones', empty: 'Aún no hay entradas. Empieza con una escena de hoy.', privacy: 'Todo queda solo en este navegador.', deleted: 'Eliminado', delete_: 'Eliminar', saved: 'Guardado', before: 'Primer pensamiento', after: 'Pensamiento reformulado' },
};

function load(): Entry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function persist(entries: Entry[]) {
  try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* quota — best effort */ }
}

export default function EmotionDiary({ locale = 'ko' }: { locale?: Locale }) {
  const t = L[locale] ?? L.en;
  const emotions = EMOTIONS[locale] ?? EMOTIONS.en;

  const [entries, setEntries] = useState<Entry[]>([]);
  const [mode, setMode] = useState<'list' | 'write' | 'reframe'>('list');
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ event: '', thought: '', emotions: [] as string[], action: '', outcome: '' });
  const [reframe, setReframe] = useState({ thought: '', emotions: [] as string[] });
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => { setEntries(load()); }, []);

  const startWrite = () => { setDraft({ event: '', thought: '', emotions: [], action: '', outcome: '' }); setStep(0); setMode('write'); };

  const toggleEmotion = (list: string[], e: string) =>
    list.includes(e) ? list.filter((x) => x !== e) : [...list, e];

  const saveDraft = () => {
    const entry: Entry = {
      id: `${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      ...draft,
    };
    const next = [entry, ...entries];
    setEntries(next);
    persist(next);
    setSavedId(entry.id);
    setReframe({ thought: '', emotions: [] });
    setMode('reframe');
  };

  const finishReframe = (skip: boolean) => {
    if (!skip && savedId && (reframe.thought.trim() || reframe.emotions.length)) {
      const next = entries.map((e) =>
        e.id === savedId ? { ...e, reframedThought: reframe.thought.trim() || undefined, reframedEmotions: reframe.emotions.length ? reframe.emotions : undefined } : e,
      );
      setEntries(next);
      persist(next);
    }
    setSavedId(null);
    setMode('list');
  };

  const remove = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    persist(next);
  };

  const stepValue = [draft.event, draft.thought, '', draft.action, draft.outcome][step];
  const stepOk = step === 2 ? draft.emotions.length > 0 : stepValue.trim().length > 0;

  if (mode === 'write') {
    return (
      <div className="space-y-4">
        <div className="flex gap-1.5">
          {t.steps.map((s, i) => (
            <span key={s} className={`flex-1 rounded-full py-1 text-center text-[11px] font-bold ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{s}</span>
          ))}
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <p className="text-sm font-bold">{t.steps[step]}</p>
          <p className="text-xs text-muted-foreground">{t.hints[step]}</p>
          {step === 2 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {emotions.map((e) => (
                <button key={e} type="button" onClick={() => setDraft((d) => ({ ...d, emotions: toggleEmotion(d.emotions, e) }))}
                  aria-pressed={draft.emotions.includes(e)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${draft.emotions.includes(e) ? 'border-primary bg-primary/10 font-bold text-primary' : 'bg-card hover:bg-accent'}`}>
                  {e}
                </button>
              ))}
            </div>
          ) : (
            <textarea rows={3} value={stepValue}
              onChange={(ev) => {
                const v = ev.target.value;
                setDraft((d) => step === 0 ? { ...d, event: v } : step === 1 ? { ...d, thought: v } : step === 3 ? { ...d, action: v } : { ...d, outcome: v });
              }}
              className="w-full rounded-xl border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          )}
        </div>
        <div className="flex gap-2">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="rounded-xl border bg-card px-4 py-2.5 text-sm font-bold hover:bg-accent">{t.back}</button>}
          {step < 4
            ? <button onClick={() => setStep(step + 1)} disabled={!stepOk} className="ml-auto rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40">{t.next}</button>
            : <button onClick={saveDraft} disabled={!stepOk} className="ml-auto rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40">{t.save}</button>}
        </div>
        <p className="text-center text-[11px] text-muted-foreground">{t.privacy}</p>
      </div>
    );
  }

  if (mode === 'reframe') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
          <p className="text-sm font-bold text-primary">💡 {t.reframeTitle}</p>
          <p className="text-xs text-muted-foreground">{t.reframeHint}</p>
          <textarea rows={2} value={reframe.thought} onChange={(e) => setReframe((r) => ({ ...r, thought: e.target.value }))}
            className="w-full rounded-xl border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          {reframe.thought.trim() && (
            <>
              <p className="text-xs text-muted-foreground pt-1">{t.reframeEmotions}</p>
              <div className="flex flex-wrap gap-2">
                {emotions.map((e) => (
                  <button key={e} type="button" onClick={() => setReframe((r) => ({ ...r, emotions: toggleEmotion(r.emotions, e) }))}
                    aria-pressed={reframe.emotions.includes(e)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${reframe.emotions.includes(e) ? 'border-primary bg-primary/10 font-bold text-primary' : 'bg-card hover:bg-accent'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => finishReframe(true)} className="rounded-xl border bg-card px-4 py-2.5 text-sm font-bold hover:bg-accent">{t.reframeSkip}</button>
          <button onClick={() => finishReframe(false)} className="ml-auto rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">{t.reframeDone}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={startWrite} className="w-full rounded-2xl bg-primary py-3.5 text-sm font-black text-primary-foreground hover:opacity-90 transition-opacity">
        ✏️ {t.newEntry}
      </button>
      <p className="text-center text-[11px] text-muted-foreground">{t.privacy}</p>
      <h2 className="pt-2 text-sm font-black uppercase tracking-wider text-muted-foreground">{t.listTitle}</h2>
      {entries.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{t.empty}</p>}
      <div className="space-y-3">
        {entries.map((e) => (
          <article key={e.id} className="rounded-2xl border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <time className="text-xs font-bold text-muted-foreground">{e.date}</time>
              <button onClick={() => remove(e.id)} aria-label={t.delete_} className="text-xs text-muted-foreground hover:text-destructive">{t.delete_}</button>
            </div>
            <p className="text-sm font-semibold">{e.event}</p>
            <div className="flex flex-wrap gap-1">
              {e.emotions.map((em) => <span key={em} className="rounded-full bg-muted px-2 py-0.5 text-xs">{em}</span>)}
            </div>
            <p className="text-xs text-muted-foreground"><b>{t.before}:</b> {e.thought}</p>
            {e.reframedThought && (
              <p className="rounded-lg bg-primary/5 px-2 py-1.5 text-xs text-primary">
                <b>{t.after}:</b> {e.reframedThought}
                {e.reframedEmotions?.length ? ` → ${e.reframedEmotions.join(', ')}` : ''}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
