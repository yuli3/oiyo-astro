import { useEffect, useState } from 'react';

type Locale = 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'es';

interface Props { locale: string }

interface Item { id: string; label: string }

const T: Record<Locale, {
  heading: string; sub: string; placeholder: string; add: string;
  templates: { morning: string; evening: string }; remove: string;
  progress: (d: number, t: number) => string; empty: string; allDone: string;
  morningItems: string[]; eveningItems: string[];
}> = {
  ko: {
    heading: '나의 루틴 체크리스트', sub: '체크 상태는 매일 자동으로 리셋되고, 이 브라우저에만 저장됩니다.',
    placeholder: '루틴 항목 추가 (예: 물 한 잔 마시기)', add: '추가',
    templates: { morning: '☀️ 아침 템플릿', evening: '🌙 저녁 템플릿' }, remove: '삭제',
    progress: (d, t) => `오늘 ${d}/${t} 완료`, empty: '템플릿을 누르거나 직접 항목을 추가해 보세요.', allDone: '🎉 오늘 루틴 완주!',
    morningItems: ['기상 직후 물 한 잔', '5분 스트레칭', '오늘의 최우선 1가지 적기', '아침 햇빛 쐬기'],
    eveningItems: ['내일 할 일 3가지 메모', '10분 정리정돈', '취침 1시간 전 화면 끄기', '감사한 일 1가지 적기'],
  },
  en: {
    heading: 'My routine checklist', sub: 'Checks reset daily and are stored only in this browser.',
    placeholder: 'Add a routine item (e.g. drink a glass of water)', add: 'Add',
    templates: { morning: '☀️ Morning template', evening: '🌙 Evening template' }, remove: 'Remove',
    progress: (d, t) => `${d}/${t} done today`, empty: 'Tap a template or add your own items.', allDone: '🎉 Routine complete for today!',
    morningItems: ['Glass of water after waking', '5-minute stretch', 'Write today\'s #1 priority', 'Get morning sunlight'],
    eveningItems: ['Note 3 tasks for tomorrow', '10-minute tidy-up', 'Screens off 1h before bed', 'Write one gratitude'],
  },
  ja: {
    heading: '私のルーティンチェックリスト', sub: 'チェックは毎日自動リセットされ、このブラウザにのみ保存されます。',
    placeholder: 'ルーティン項目を追加(例:水を一杯飲む)', add: '追加',
    templates: { morning: '☀️ 朝テンプレート', evening: '🌙 夜テンプレート' }, remove: '削除',
    progress: (d, t) => `今日 ${d}/${t} 完了`, empty: 'テンプレートを押すか、自分で項目を追加しましょう。', allDone: '🎉 今日のルーティン完走!',
    morningItems: ['起床後に水を一杯', '5分ストレッチ', '今日の最優先1つを書く', '朝の日光を浴びる'],
    eveningItems: ['明日のタスクを3つメモ', '10分片付け', '就寝1時間前に画面オフ', '感謝を1つ書く'],
  },
  zh: {
    heading: '我的例程清单', sub: '勾选状态每天自动重置,仅保存在本浏览器。',
    placeholder: '添加例程项目(如:喝一杯水)', add: '添加',
    templates: { morning: '☀️ 晨间模板', evening: '🌙 晚间模板' }, remove: '删除',
    progress: (d, t) => `今天完成 ${d}/${t}`, empty: '点击模板或自行添加项目。', allDone: '🎉 今日例程完成!',
    morningItems: ['起床后喝杯水', '拉伸5分钟', '写下今天的第一要务', '晒晒早晨的阳光'],
    eveningItems: ['记下明天的3件事', '整理10分钟', '睡前1小时关闭屏幕', '写下一件感恩的事'],
  },
  fr: {
    heading: 'Ma liste de routine', sub: 'Les coches se réinitialisent chaque jour et restent dans ce navigateur.',
    placeholder: 'Ajouter un élément (ex. boire un verre d\'eau)', add: 'Ajouter',
    templates: { morning: '☀️ Modèle du matin', evening: '🌙 Modèle du soir' }, remove: 'Supprimer',
    progress: (d, t) => `${d}/${t} faits aujourd'hui`, empty: 'Choisissez un modèle ou ajoutez vos éléments.', allDone: '🎉 Routine du jour accomplie !',
    morningItems: ['Un verre d\'eau au réveil', '5 minutes d\'étirements', 'Noter la priorité n°1 du jour', 'Prendre la lumière du matin'],
    eveningItems: ['Noter 3 tâches pour demain', '10 minutes de rangement', 'Écrans éteints 1h avant le coucher', 'Écrire une gratitude'],
  },
  es: {
    heading: 'Mi lista de rutina', sub: 'Las marcas se reinician cada día y se guardan solo en este navegador.',
    placeholder: 'Añade un elemento (p. ej., beber un vaso de agua)', add: 'Añadir',
    templates: { morning: '☀️ Plantilla de mañana', evening: '🌙 Plantilla de noche' }, remove: 'Eliminar',
    progress: (d, t) => `${d}/${t} hechos hoy`, empty: 'Toca una plantilla o añade tus propios elementos.', allDone: '🎉 ¡Rutina de hoy completada!',
    morningItems: ['Vaso de agua al despertar', '5 minutos de estiramientos', 'Anotar la prioridad nº1 del día', 'Tomar luz de la mañana'],
    eveningItems: ['Anotar 3 tareas para mañana', '10 minutos de orden', 'Pantallas fuera 1h antes de dormir', 'Escribir una gratitud'],
  },
};

const ITEMS_KEY = 'oiyo-routine-items';
const CHECKS_KEY = 'oiyo-routine-checks';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Routine checklist with daily-reset localStorage persistence (#34). */
export default function RoutineChecklist({ locale }: Props) {
  const t = T[(locale as Locale)] ?? T.en;
  const [items, setItems] = useState<Item[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    try {
      const rawItems = localStorage.getItem(ITEMS_KEY);
      if (rawItems) setItems(JSON.parse(rawItems));
      const rawChecks = localStorage.getItem(CHECKS_KEY);
      if (rawChecks) {
        const { date, ids } = JSON.parse(rawChecks);
        if (date === todayStr()) setChecked(ids); // otherwise: new day, fresh checks
      }
    } catch { /* private mode etc. */ }
  }, []);

  const saveItems = (next: Item[]) => {
    setItems(next);
    try { localStorage.setItem(ITEMS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const saveChecks = (ids: string[]) => {
    setChecked(ids);
    try { localStorage.setItem(CHECKS_KEY, JSON.stringify({ date: todayStr(), ids })); } catch { /* ignore */ }
  };

  const addItem = (label: string) => {
    const clean = label.trim();
    if (!clean || items.some((i) => i.label === clean)) return;
    saveItems([...items, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: clean }]);
  };
  const addTemplate = (labels: string[]) => {
    const fresh = labels
      .filter((l) => !items.some((i) => i.label === l))
      .map((l, k) => ({ id: `${Date.now()}-${k}`, label: l }));
    if (fresh.length) saveItems([...items, ...fresh]);
  };
  const removeItem = (id: string) => {
    saveItems(items.filter((i) => i.id !== id));
    saveChecks(checked.filter((c) => c !== id));
  };
  const toggle = (id: string) =>
    saveChecks(checked.includes(id) ? checked.filter((c) => c !== id) : [...checked, id]);

  const doneCount = items.filter((i) => checked.includes(i.id)).length;

  return (
    <div className="mt-10 rounded-2xl border-2 border-green-200 bg-card p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-black text-slate-900">✅ {t.heading}</h2>
        {items.length > 0 && (
          <span className="text-xs font-bold text-green-700">{t.progress(doneCount, items.length)}</span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400">{t.sub}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => addTemplate(t.morningItems)}
          className="rounded-full border-2 border-green-300 bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-700 hover:text-white">
          {t.templates.morning}
        </button>
        <button type="button" onClick={() => addTemplate(t.eveningItems)}
          className="rounded-full border-2 border-green-300 bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-700 hover:text-white">
          {t.templates.evening}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{t.empty}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((i) => {
            const isDone = checked.includes(i.id);
            return (
              <li key={i.id} className="flex items-center gap-3">
                <button type="button" onClick={() => toggle(i.id)} aria-pressed={isDone} aria-label={i.label}
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition-colors ${
                    isDone ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 bg-card text-transparent hover:border-green-500'
                  }`}>
                  ✓
                </button>
                <span className={`flex-1 text-sm ${isDone ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{i.label}</span>
                <button type="button" onClick={() => removeItem(i.id)} aria-label={`${t.remove}: ${i.label}`}
                  className="text-xs text-slate-300 transition-colors hover:text-red-400">
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 && doneCount === items.length && (
        <p className="mt-4 text-sm font-bold text-green-700">{t.allDone}</p>
      )}

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); addItem(input); setInput(''); }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          maxLength={60}
          className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
        />
        <button type="submit" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700">
          {t.add}
        </button>
      </form>
    </div>
  );
}
