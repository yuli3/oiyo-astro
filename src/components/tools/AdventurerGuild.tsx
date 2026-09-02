import { useState, useEffect, useCallback } from 'react';
import { withTrailingSlash, type Locale } from '../../i18n';

/**
 * Adventurer's Guild — gamification hub. Existing self-care tools become
 * "quests"; complete them for XP, levels, streaks and badges. localStorage
 * only (private, no account). Honor-system check + deep links to tools.
 */

type QuestKind = 'daily' | 'weekly';
interface Quest { id: string; kind: QuestKind; xp: number; emoji: string; label: string; href: string; }

interface GuildState {
  name: string;
  xp: number;
  streak: number;
  lastActive: string;        // YYYY-MM-DD of last completion
  dailyDate: string;         // date the dailyDone set belongs to
  dailyDone: string[];       // quest ids done today
  weekKey: string;           // ISO-ish week key
  weeklyDone: string[];      // weekly quest ids done this week
  badges: string[];
}

const KEY = 'oiyo-guild';
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const weekKeyOf = () => {
  const d = new Date();
  const day = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return `${d.getFullYear()}-W${Math.floor(day / 7)}`;
};

const QUESTS: Partial<Record<Locale, Quest[]>> = {
  ko: [
    { id: 'journal', kind: 'daily', xp: 10, emoji: '📓', label: '오늘의 저널 한 줄', href: '/journal/today' },
    { id: 'emotion', kind: 'daily', xp: 10, emoji: '🌬️', label: '감정 흘려보내기 1회', href: '/emotion/release' },
    { id: 'breath', kind: 'daily', xp: 10, emoji: '🫁', label: '5분 호흡', href: '/breathing/timer' },
    { id: 'workout', kind: 'daily', xp: 15, emoji: '💪', label: '인터벌 운동 1세트', href: '/interval/timer' },
    { id: 'today', kind: 'daily', xp: 5, emoji: '✨', label: '오늘의 우주 확인', href: '/today' },
    { id: 'w-journal3', kind: 'weekly', xp: 30, emoji: '📚', label: '이번 주 저널 3회', href: '/journal/today' },
    { id: 'w-workout3', kind: 'weekly', xp: 40, emoji: '🏃', label: '이번 주 운동 3회', href: '/interval/timer' },
    { id: 'w-strength', kind: 'weekly', xp: 20, emoji: '⭐', label: '강점 키워드 정리', href: '/strengths/keywords' },
  ],
  en: [
    { id: 'journal', kind: 'daily', xp: 10, emoji: '📓', label: 'Write a journal line', href: '/journal/today' },
    { id: 'emotion', kind: 'daily', xp: 10, emoji: '🌬️', label: 'Let a feeling pass', href: '/emotion/release' },
    { id: 'breath', kind: 'daily', xp: 10, emoji: '🫁', label: '5-min breathing', href: '/breathing/timer' },
    { id: 'workout', kind: 'daily', xp: 15, emoji: '💪', label: 'One interval set', href: '/interval/timer' },
    { id: 'today', kind: 'daily', xp: 5, emoji: '✨', label: "Check today's universe", href: '/today' },
    { id: 'w-journal3', kind: 'weekly', xp: 30, emoji: '📚', label: 'Journal 3× this week', href: '/journal/today' },
    { id: 'w-workout3', kind: 'weekly', xp: 40, emoji: '🏃', label: 'Work out 3× this week', href: '/interval/timer' },
    { id: 'w-strength', kind: 'weekly', xp: 20, emoji: '⭐', label: 'Review strength keywords', href: '/strengths/keywords' },
  ],
  ja: [
    { id: 'journal', kind: 'daily', xp: 10, emoji: '📓', label: '今日のジャーナルを1行書く', href: '/journal/today' },
    { id: 'emotion', kind: 'daily', xp: 10, emoji: '🌬️', label: '感情を1回手放す', href: '/emotion/release' },
    { id: 'breath', kind: 'daily', xp: 10, emoji: '🫁', label: '5分の呼吸', href: '/breathing/timer' },
    { id: 'workout', kind: 'daily', xp: 15, emoji: '💪', label: 'インターバル運動を1セット', href: '/interval/timer' },
    { id: 'today', kind: 'daily', xp: 5, emoji: '✨', label: '今日の宇宙を確認', href: '/today' },
    { id: 'w-journal3', kind: 'weekly', xp: 30, emoji: '📚', label: '今週ジャーナル3回', href: '/journal/today' },
    { id: 'w-workout3', kind: 'weekly', xp: 40, emoji: '🏃', label: '今週運動3回', href: '/interval/timer' },
    { id: 'w-strength', kind: 'weekly', xp: 20, emoji: '⭐', label: '強みキーワードを見直す', href: '/strengths/keywords' },
  ],
  zh: [
    { id: 'journal', kind: 'daily', xp: 10, emoji: '📓', label: '写一行今日日志', href: '/journal/today' },
    { id: 'emotion', kind: 'daily', xp: 10, emoji: '🌬️', label: '释放一次情绪', href: '/emotion/release' },
    { id: 'breath', kind: 'daily', xp: 10, emoji: '🫁', label: '5分钟呼吸', href: '/breathing/timer' },
    { id: 'workout', kind: 'daily', xp: 15, emoji: '💪', label: '完成一组间歇运动', href: '/interval/timer' },
    { id: 'today', kind: 'daily', xp: 5, emoji: '✨', label: '查看今日宇宙', href: '/today' },
    { id: 'w-journal3', kind: 'weekly', xp: 30, emoji: '📚', label: '本周写日志3次', href: '/journal/today' },
    { id: 'w-workout3', kind: 'weekly', xp: 40, emoji: '🏃', label: '本周运动3次', href: '/interval/timer' },
    { id: 'w-strength', kind: 'weekly', xp: 20, emoji: '⭐', label: '回顾优势关键词', href: '/strengths/keywords' },
  ],
  fr: [
    { id: 'journal', kind: 'daily', xp: 10, emoji: '📓', label: 'Écrire une ligne de journal', href: '/journal/today' },
    { id: 'emotion', kind: 'daily', xp: 10, emoji: '🌬️', label: 'Laisser passer une émotion', href: '/emotion/release' },
    { id: 'breath', kind: 'daily', xp: 10, emoji: '🫁', label: 'Respirer 5 minutes', href: '/breathing/timer' },
    { id: 'workout', kind: 'daily', xp: 15, emoji: '💪', label: 'Faire une série d’intervalles', href: '/interval/timer' },
    { id: 'today', kind: 'daily', xp: 5, emoji: '✨', label: 'Consulter l’univers du jour', href: '/today' },
    { id: 'w-journal3', kind: 'weekly', xp: 30, emoji: '📚', label: 'Journal 3 fois cette semaine', href: '/journal/today' },
    { id: 'w-workout3', kind: 'weekly', xp: 40, emoji: '🏃', label: 'S’entraîner 3 fois cette semaine', href: '/interval/timer' },
    { id: 'w-strength', kind: 'weekly', xp: 20, emoji: '⭐', label: 'Revoir les mots-clés de forces', href: '/strengths/keywords' },
  ],
  es: [
    { id: 'journal', kind: 'daily', xp: 10, emoji: '📓', label: 'Escribe una línea de diario', href: '/journal/today' },
    { id: 'emotion', kind: 'daily', xp: 10, emoji: '🌬️', label: 'Deja pasar una emoción', href: '/emotion/release' },
    { id: 'breath', kind: 'daily', xp: 10, emoji: '🫁', label: 'Respiración de 5 min', href: '/breathing/timer' },
    { id: 'workout', kind: 'daily', xp: 15, emoji: '💪', label: 'Una serie de intervalos', href: '/interval/timer' },
    { id: 'today', kind: 'daily', xp: 5, emoji: '✨', label: 'Consulta el universo de hoy', href: '/today' },
    { id: 'w-journal3', kind: 'weekly', xp: 30, emoji: '📚', label: 'Diario 3 veces esta semana', href: '/journal/today' },
    { id: 'w-workout3', kind: 'weekly', xp: 40, emoji: '🏃', label: 'Entrena 3 veces esta semana', href: '/interval/timer' },
    { id: 'w-strength', kind: 'weekly', xp: 20, emoji: '⭐', label: 'Revisa palabras clave de fortalezas', href: '/strengths/keywords' },
  ],
};

const TIERS_KO = [
  { min: 0, title: '견습 모험가' }, { min: 50, title: '초보 모험가' }, { min: 150, title: '모험가' },
  { min: 350, title: '숙련 모험가' }, { min: 700, title: '베테랑' }, { min: 1200, title: '길드 마스터' },
];
const TIERS_EN = [
  { min: 0, title: 'Apprentice' }, { min: 50, title: 'Novice' }, { min: 150, title: 'Adventurer' },
  { min: 350, title: 'Skilled' }, { min: 700, title: 'Veteran' }, { min: 1200, title: 'Guild Master' },
];

const BADGES: Record<string, { ko: string; en: string }> = {
  first: { ko: '🎉 첫걸음', en: '🎉 First Step' },
  streak3: { ko: '🔥 3일 연속', en: '🔥 3-day streak' },
  streak7: { ko: '🔥 7일 연속', en: '🔥 7-day streak' },
  streak30: { ko: '👑 30일 연속', en: '👑 30-day streak' },
  xp100: { ko: '💯 XP 100', en: '💯 100 XP' },
  xp500: { ko: '🏆 XP 500', en: '🏆 500 XP' },
};

interface UiLabels {
  title: string; subtitle: string; namePlaceholder: string; level: string; streakUnit: string;
  daily: string; weekly: string; done: string; do: string; open: string; badgesTitle: string;
  noBadges: string; reset: string; toNext: string; honor: string; privacy: string;
}
const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '모험가 길드', subtitle: '매일의 작은 실천을 퀘스트로. 완료하고 경험치를 쌓아 성장하세요.',
    namePlaceholder: '모험가 이름(선택)', level: '레벨', streakUnit: '일 연속',
    daily: '일일 퀘스트', weekly: '주간 퀘스트', done: '완료', do: '도전', open: '바로가기',
    badgesTitle: '획득한 배지', noBadges: '첫 퀘스트를 완료하면 배지가 열려요.',
    reset: '기록 초기화', toNext: '다음 레벨까지', honor: '명예 체크: 실제로 하고 눌러요 🙂',
    privacy: '🔒 모든 기록은 이 브라우저에만 저장됩니다.',
  },
  en: {
    title: "Adventurer's Guild", subtitle: 'Turn small daily practices into quests. Complete them, gain XP, and grow.',
    namePlaceholder: 'Adventurer name (optional)', level: 'Level', streakUnit: '-day streak',
    daily: 'Daily quests', weekly: 'Weekly quests', done: 'Done', do: 'Do it', open: 'Open',
    badgesTitle: 'Earned badges', noBadges: 'Complete your first quest to unlock badges.',
    reset: 'Reset progress', toNext: 'To next level', honor: 'Honor check: do it for real, then tap 🙂',
    privacy: '🔒 All progress is stored only in this browser.',
  },
  ja: {
    title: '冒険者ギルド', subtitle: '毎日の小さな実践をクエストに。完了してXPを得て、成長しましょう。',
    namePlaceholder: '冒険者名（任意）', level: 'レベル', streakUnit: '日連続',
    daily: 'デイリークエスト', weekly: '週間クエスト', done: '完了', do: '挑戦', open: '開く',
    badgesTitle: '獲得したバッジ', noBadges: '最初のクエストを完了するとバッジが開放されます。',
    reset: '記録をリセット', toNext: '次のレベルまで', honor: '名誉チェック：本当にやってからタップ 🙂',
    privacy: '🔒 すべての記録はこのブラウザにのみ保存されます。',
  },
  zh: {
    title: '冒险者公会', subtitle: '把每天的小练习变成任务。完成它们，获得XP并成长。',
    namePlaceholder: '冒险者名称（可选）', level: '等级', streakUnit: '天连续',
    daily: '每日任务', weekly: '每周任务', done: '已完成', do: '去完成', open: '打开',
    badgesTitle: '已获得徽章', noBadges: '完成第一个任务即可解锁徽章。',
    reset: '重置进度', toNext: '距下一级', honor: '荣誉确认：真正完成后再点击 🙂',
    privacy: '🔒 所有进度只保存在此浏览器中。',
  },
  fr: {
    title: 'Guilde des aventuriers', subtitle: 'Transformez les petites pratiques du quotidien en quêtes. Terminez-les, gagnez de l’XP et progressez.',
    namePlaceholder: 'Nom d’aventurier (facultatif)', level: 'Niveau', streakUnit: ' jours de suite',
    daily: 'Quêtes quotidiennes', weekly: 'Quêtes hebdomadaires', done: 'Terminé', do: 'Faire', open: 'Ouvrir',
    badgesTitle: 'Badges gagnés', noBadges: 'Terminez votre première quête pour débloquer des badges.',
    reset: 'Réinitialiser', toNext: 'Jusqu’au niveau suivant', honor: 'Contrôle d’honneur : faites-le vraiment, puis touchez 🙂',
    privacy: '🔒 Toute la progression est stockée uniquement dans ce navigateur.',
  },
  es: {
    title: 'Gremio de aventureros', subtitle: 'Convierte pequeñas prácticas diarias en misiones. Complétalas, gana XP y crece.',
    namePlaceholder: 'Nombre de aventurero (opcional)', level: 'Nivel', streakUnit: ' días seguidos',
    daily: 'Misiones diarias', weekly: 'Misiones semanales', done: 'Hecho', do: 'Hacer', open: 'Abrir',
    badgesTitle: 'Insignias ganadas', noBadges: 'Completa tu primera misión para desbloquear insignias.',
    reset: 'Restablecer progreso', toNext: 'Para el siguiente nivel', honor: 'Control de honor: hazlo de verdad y luego toca 🙂',
    privacy: '🔒 Todo el progreso se guarda solo en este navegador.',
  },
};

function load(): GuildState {
  const blank: GuildState = { name: '', xp: 0, streak: 0, lastActive: '', dailyDate: todayStr(), dailyDone: [], weekKey: weekKeyOf(), weeklyDone: [], badges: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank;
    const s = { ...blank, ...JSON.parse(raw) } as GuildState;
    if (s.dailyDate !== todayStr()) { s.dailyDate = todayStr(); s.dailyDone = []; }
    if (s.weekKey !== weekKeyOf()) { s.weekKey = weekKeyOf(); s.weeklyDone = []; }
    if (s.lastActive && s.lastActive !== todayStr() && s.lastActive !== yesterdayStr()) s.streak = 0;
    return s;
  } catch { return blank; }
}

interface Props { locale: Locale; }

export default function AdventurerGuild({ locale }: Props) {
  const t = L[locale] ?? L.en!;
  const quests = QUESTS[locale] ?? QUESTS.en!;
  const tiers = locale === 'ko' ? TIERS_KO : TIERS_EN;

  const [s, setS] = useState<GuildState | null>(null);
  useEffect(() => { setS(load()); }, []);

  const persist = useCallback((next: GuildState) => {
    setS(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  if (!s) return <div className="rounded-2xl border border-green-100 bg-card p-5 text-green-700">…</div>;

  const tierIdx = tiers.reduce((acc, tr, i) => (s.xp >= tr.min ? i : acc), 0);
  const tier = tiers[tierIdx];
  const next = tiers[tierIdx + 1];
  const toNext = next ? next.min - s.xp : 0;
  const pct = next ? Math.min(100, ((s.xp - tier.min) / (next.min - tier.min)) * 100) : 100;

  const isDone = (q: Quest) => (q.kind === 'daily' ? s.dailyDone : s.weeklyDone).includes(q.id);

  const complete = (q: Quest) => {
    if (isDone(q)) return;
    const next2: GuildState = { ...s, badges: [...s.badges] };
    if (q.kind === 'daily') next2.dailyDone = [...s.dailyDone, q.id];
    else next2.weeklyDone = [...s.weeklyDone, q.id];
    next2.xp = s.xp + q.xp;
    // streak
    if (s.lastActive !== todayStr()) {
      next2.streak = s.lastActive === yesterdayStr() ? s.streak + 1 : 1;
      next2.lastActive = todayStr();
    }
    // badges
    const add = (b: string) => { if (!next2.badges.includes(b)) next2.badges.push(b); };
    add('first');
    if (next2.streak >= 3) add('streak3');
    if (next2.streak >= 7) add('streak7');
    if (next2.streak >= 30) add('streak30');
    if (next2.xp >= 100) add('xp100');
    if (next2.xp >= 500) add('xp500');
    persist(next2);
  };

  const reset = () => persist({ name: s.name, xp: 0, streak: 0, lastActive: '', dailyDate: todayStr(), dailyDone: [], weekKey: weekKeyOf(), weeklyDone: [], badges: [] });

  const questRow = (q: Quest) => {
    const done = isDone(q);
    return (
      <div key={q.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${done ? 'border-green-300 bg-surface-subtle' : 'border-green-100 bg-card'}`}>
        <div className="min-w-0">
          <div className={`font-semibold ${done ? 'text-green-700 line-through' : 'text-foreground'}`}>{q.emoji} {q.label}</div>
          <div className="text-xs text-green-600">+{q.xp} XP</div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <a href={withTrailingSlash(`/${locale}${q.href}`)} className="rounded-full border border-green-200 px-3 py-1 text-xs font-medium text-green-700 hover:border-green-400">{t.open}</a>
          <button type="button" onClick={() => complete(q)} disabled={done}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${done ? 'bg-green-200 text-green-700' : 'bg-green-700 text-white hover:opacity-90'}`}>
            {done ? '✓ ' + t.done : t.do}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-green-100 bg-card p-5">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>

      {/* Profile */}
      <div className="mt-5 rounded-2xl border border-green-200 bg-surface-subtle p-5">
        <input value={s.name} onChange={(e) => persist({ ...s, name: e.target.value })}
          placeholder={t.namePlaceholder}
          className="w-full bg-transparent text-lg font-bold text-foreground placeholder:text-green-400 focus:outline-none" />
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="text-sm font-semibold text-green-800">{tier.title}</span>
          <span className="text-xs text-green-600">{t.level} {tierIdx + 1} · {s.xp} XP</span>
          <span className="text-xs font-semibold text-orange-600">🔥 {s.streak}{t.streakUnit}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-green-200">
          <div className="h-full bg-green-600" style={{ width: `${pct}%` }}></div>
        </div>
        {next && <div className="mt-1 text-right text-xs text-green-600">{t.toNext}: {toNext} XP</div>}
      </div>

      {/* Daily */}
      <p className="mt-6 text-sm font-bold uppercase tracking-wider text-green-800">{t.daily}</p>
      <p className="text-xs text-green-500">{t.honor}</p>
      <div className="mt-2 space-y-2">{quests.filter((q) => q.kind === 'daily').map(questRow)}</div>

      {/* Weekly */}
      <p className="mt-6 text-sm font-bold uppercase tracking-wider text-green-800">{t.weekly}</p>
      <div className="mt-2 space-y-2">{quests.filter((q) => q.kind === 'weekly').map(questRow)}</div>

      {/* Badges */}
      <p className="mt-6 text-sm font-bold uppercase tracking-wider text-green-800">{t.badgesTitle}</p>
      {s.badges.length === 0 ? (
        <p className="mt-2 text-sm text-green-600">{t.noBadges}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {s.badges.map((b) => (
            <span key={b} className="rounded-full bg-green-700 px-3 py-1 text-sm font-semibold text-white">{BADGES[b]?.[locale === 'ko' ? 'ko' : 'en'] ?? b}</span>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-green-500">{t.privacy}</span>
        <button type="button" onClick={reset} className="text-xs text-green-400 hover:text-red-500">{t.reset}</button>
      </div>
    </div>
  );
}
