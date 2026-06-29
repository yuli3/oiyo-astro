import { Copy, Download, FileText, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/lib/user/store/user-store';

type Locale = 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'es';

interface ProfileForm {
  name: string;
  birthDate: string;
  birthTime: string;
  bloodType: string;
  zodiacSign: string;
  mbtiType: string;
  sajuMemo: string;
  tarotMemo: string;
  favoriteKeywords: string;
  preferredActivities: string;
  hobbies: string;
  favoriteDrinks: string;
  happyThings: string;
  sensoryComforts: string;
  peopleToMeet: string;
  currentTendencies: string;
  recentChanges: string;
  stableTraits: string;
  nextExperiments: string;
}

interface Props {
  locale: string;
}

const INITIAL: ProfileForm = {
  name: '',
  birthDate: '',
  birthTime: '',
  bloodType: '',
  zodiacSign: '',
  mbtiType: '',
  sajuMemo: '',
  tarotMemo: '',
  favoriteKeywords: '말하기, 설득하기, 경청하기, 조립하기, 관찰하기',
  preferredActivities: '좋아하는 것들로 하루 채우기, 주변 꾸미기',
  hobbies: '',
  favoriteDrinks: '음료를 마시다, 식혜를 마시다',
  happyThings: '식혜 마시기, 샤워하고 바람맞기, 따뜻한 빨래 냄새',
  sensoryComforts: '따뜻한 빨래 냄새',
  peopleToMeet: '아버지, 어머니, 할머니, 선생님',
  currentTendencies: '성향은 계속 바뀐다. 지금의 나는 최근의 환경, 컨디션, 관심사에 영향을 받는다.',
  recentChanges: '최근 더 자주 찾는 것, 덜 끌리는 것, 새로 생긴 관심사를 적어 둔다.',
  stableTraits: '시간이 지나도 여전히 나답다고 느끼는 말이나 행동을 적어 둔다.',
  nextExperiments: '내일 하루를 좋아하는 것들로 채우기, 주변 한 곳 꾸미기, 편안한 감각 하나 만들기',
};

const COPY: Record<Locale, { title: string; desc: string; profile: string; inputs: string; output: string; copy: string; download: string; reset: string; copied: string; saved: string; privacy: string }> = {
  ko: {
    title: '내 프로필을 Markdown으로 정리',
    desc: '생년월일, 혈액형, 별자리, MBTI, 좋아하는 키워드와 요즘 성향을 한 장의 .md 노트로 만듭니다.',
    profile: '기본 정보',
    inputs: '좋아하는 것과 현재 성향',
    output: 'Markdown 미리보기',
    copy: '복사',
    download: '다운로드',
    reset: '초기화',
    copied: '복사됨',
    saved: '이 브라우저에 자동 저장됨',
    privacy: '입력값은 이 브라우저의 localStorage에만 저장되며 서버로 전송되지 않습니다.',
  },
  en: {
    title: 'Export My Profile as Markdown',
    desc: 'Turn birth data, blood type, zodiac, MBTI, favorite keywords, and current tendencies into one .md note.',
    profile: 'Profile',
    inputs: 'Favorites and current tendencies',
    output: 'Markdown preview',
    copy: 'Copy',
    download: 'Download',
    reset: 'Reset',
    copied: 'Copied',
    saved: 'Auto-saved in this browser',
    privacy: 'Inputs are stored only in this browser localStorage and are not sent to a server.',
  },
  ja: {
    title: 'プロフィールをMarkdownで整理',
    desc: '生年月日、血液型、星座、MBTI、好きなキーワード、今の傾向を1つの.mdノートにします。',
    profile: '基本情報',
    inputs: '好きなものと現在の傾向',
    output: 'Markdownプレビュー',
    copy: 'コピー',
    download: 'ダウンロード',
    reset: 'リセット',
    copied: 'コピー済み',
    saved: 'このブラウザに自動保存',
    privacy: '入力内容はこのブラウザのlocalStorageにのみ保存され、サーバーには送信されません。',
  },
  zh: {
    title: '将我的资料导出为 Markdown',
    desc: '把出生信息、血型、星座、MBTI、喜欢的关键词和当前倾向整理成一份 .md 笔记。',
    profile: '基本信息',
    inputs: '喜欢的事物与当前倾向',
    output: 'Markdown 预览',
    copy: '复制',
    download: '下载',
    reset: '重置',
    copied: '已复制',
    saved: '已自动保存在此浏览器',
    privacy: '输入内容仅保存在此浏览器的 localStorage 中，不会发送到服务器。',
  },
  fr: {
    title: 'Exporter mon profil en Markdown',
    desc: 'Rassemblez naissance, groupe sanguin, signe, MBTI, mots-clés favoris et tendances actuelles dans une note .md.',
    profile: 'Profil',
    inputs: 'Favoris et tendances',
    output: 'Aperçu Markdown',
    copy: 'Copier',
    download: 'Télécharger',
    reset: 'Réinitialiser',
    copied: 'Copié',
    saved: 'Enregistré automatiquement dans ce navigateur',
    privacy: 'Les saisies restent dans le localStorage de ce navigateur et ne sont pas envoyées au serveur.',
  },
  es: {
    title: 'Exportar mi perfil como Markdown',
    desc: 'Convierte nacimiento, grupo sanguíneo, signo, MBTI, palabras favoritas y tendencias actuales en una nota .md.',
    profile: 'Perfil',
    inputs: 'Favoritos y tendencias',
    output: 'Vista Markdown',
    copy: 'Copiar',
    download: 'Descargar',
    reset: 'Reiniciar',
    copied: 'Copiado',
    saved: 'Guardado automáticamente en este navegador',
    privacy: 'Los datos se guardan solo en el localStorage de este navegador y no se envían al servidor.',
  },
};

const FIELD_LABELS: Record<Locale, Record<keyof ProfileForm, string>> = {
  ko: {
    name: '이름',
    birthDate: '생년월일',
    birthTime: '태어난 시간',
    bloodType: '혈액형',
    zodiacSign: '별자리',
    mbtiType: 'MBTI',
    sajuMemo: '사주 메모',
    tarotMemo: '타로 메모',
    favoriteKeywords: '좋아하는 키워드',
    preferredActivities: '하고 싶은 활동',
    hobbies: '취미',
    favoriteDrinks: '좋아하는 음료',
    happyThings: '나를 행복하게 하는 것',
    sensoryComforts: '감각적으로 편안한 것',
    peopleToMeet: '만나고 싶은 사람',
    currentTendencies: '요즘 성향',
    recentChanges: '최근 바뀐 점',
    stableTraits: '계속 남아 있는 나다움',
    nextExperiments: '다음 자기실험',
  },
  en: {
    name: 'Name',
    birthDate: 'Birth date',
    birthTime: 'Birth time',
    bloodType: 'Blood type',
    zodiacSign: 'Zodiac sign',
    mbtiType: 'MBTI',
    sajuMemo: 'Saju notes',
    tarotMemo: 'Tarot notes',
    favoriteKeywords: 'Favorite keywords',
    preferredActivities: 'Preferred activities',
    hobbies: 'Hobbies',
    favoriteDrinks: 'Favorite drinks',
    happyThings: 'Things that make me happy',
    sensoryComforts: 'Sensory comforts',
    peopleToMeet: 'People I want to meet',
    currentTendencies: 'Current tendencies',
    recentChanges: 'Recent changes',
    stableTraits: 'Stable traits',
    nextExperiments: 'Next experiments',
  },
  ja: {
    name: '名前',
    birthDate: '生年月日',
    birthTime: '出生時刻',
    bloodType: '血液型',
    zodiacSign: '星座',
    mbtiType: 'MBTI',
    sajuMemo: '四柱メモ',
    tarotMemo: 'タロットメモ',
    favoriteKeywords: '好きなキーワード',
    preferredActivities: 'やりたい活動',
    hobbies: '趣味',
    favoriteDrinks: '好きな飲み物',
    happyThings: '幸せにしてくれるもの',
    sensoryComforts: '感覚的に落ち着くもの',
    peopleToMeet: '会いたい人',
    currentTendencies: '最近の傾向',
    recentChanges: '最近変わったこと',
    stableTraits: '変わらず自分らしいこと',
    nextExperiments: '次の自己実験',
  },
  zh: {
    name: '姓名',
    birthDate: '出生日期',
    birthTime: '出生时间',
    bloodType: '血型',
    zodiacSign: '星座',
    mbtiType: 'MBTI',
    sajuMemo: '四柱笔记',
    tarotMemo: '塔罗笔记',
    favoriteKeywords: '喜欢的关键词',
    preferredActivities: '想做的活动',
    hobbies: '兴趣',
    favoriteDrinks: '喜欢的饮品',
    happyThings: '让我开心的事',
    sensoryComforts: '感官上的舒适',
    peopleToMeet: '想见的人',
    currentTendencies: '当前倾向',
    recentChanges: '最近的变化',
    stableTraits: '稳定的自我特征',
    nextExperiments: '下一次自我实验',
  },
  fr: {
    name: 'Nom',
    birthDate: 'Date de naissance',
    birthTime: 'Heure de naissance',
    bloodType: 'Groupe sanguin',
    zodiacSign: 'Signe astrologique',
    mbtiType: 'MBTI',
    sajuMemo: 'Notes Saju',
    tarotMemo: 'Notes tarot',
    favoriteKeywords: 'Mots-clés favoris',
    preferredActivities: 'Activités préférées',
    hobbies: 'Loisirs',
    favoriteDrinks: 'Boissons préférées',
    happyThings: 'Ce qui me rend heureux',
    sensoryComforts: 'Conforts sensoriels',
    peopleToMeet: 'Personnes à rencontrer',
    currentTendencies: 'Tendances actuelles',
    recentChanges: 'Changements récents',
    stableTraits: 'Traits stables',
    nextExperiments: 'Prochaines expériences',
  },
  es: {
    name: 'Nombre',
    birthDate: 'Fecha de nacimiento',
    birthTime: 'Hora de nacimiento',
    bloodType: 'Grupo sanguíneo',
    zodiacSign: 'Signo zodiacal',
    mbtiType: 'MBTI',
    sajuMemo: 'Notas Saju',
    tarotMemo: 'Notas de tarot',
    favoriteKeywords: 'Palabras favoritas',
    preferredActivities: 'Actividades preferidas',
    hobbies: 'Aficiones',
    favoriteDrinks: 'Bebidas favoritas',
    happyThings: 'Cosas que me hacen feliz',
    sensoryComforts: 'Comodidades sensoriales',
    peopleToMeet: 'Personas que quiero ver',
    currentTendencies: 'Tendencias actuales',
    recentChanges: 'Cambios recientes',
    stableTraits: 'Rasgos estables',
    nextExperiments: 'Próximos experimentos',
  },
};

const STORAGE_KEY = 'oiyo:profile-markdown-export:v2';

function listLines(value: string) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join('\n') || '- ';
}

function field(label: string, value: string) {
  return `| ${label} | ${value.trim() || '-'} |`;
}

function countItems(value: string) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

export default function ProfileMarkdownExport({ locale }: Props) {
  const L = (['en', 'ko', 'ja', 'zh', 'fr', 'es'].includes(locale) ? locale : 'en') as Locale;
  const text = COPY[L] ?? COPY.en;
  const labels = FIELD_LABELS[L] ?? FIELD_LABELS.en;
  const [form, setForm] = useState<ProfileForm>(INITIAL);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [format, setFormat] = useState<'md' | 'json' | 'csv' | 'soul'>('md');
  // 실제 사용자 프로필(zustand, oiyo_user_state) — 테스트로 수집된 데이터
  const storeProfile = useUserStore((s) => s.profile);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setForm({ ...INITIAL, ...JSON.parse(saved) });
      }
    } catch {
      // Keep the default form if local storage is unavailable or malformed.
    } finally {
      setHydrated(true);
    }
  }, []);

  // 자동 프리필: 비어있는 프로필 필드를 실제 수집 데이터로 채운다(수동 입력은 보존).
  useEffect(() => {
    if (!hydrated || !storeProfile) return;
    const PREFILL: (keyof ProfileForm)[] = ['name', 'birthDate', 'birthTime', 'bloodType', 'zodiacSign', 'mbtiType'];
    setForm((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const k of PREFILL) {
        const v = (storeProfile as Record<string, unknown>)[k];
        if (!prev[k] && v) { next[k] = String(v); changed = true; }
      }
      return changed ? next : prev;
    });
  }, [hydrated, storeProfile]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // Ignore private-mode or quota failures; export still works.
    }
  }, [form, hydrated]);

  const markdown = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const summaryRows = [
      [labels.favoriteKeywords, countItems(form.favoriteKeywords)],
      [labels.preferredActivities, countItems(form.preferredActivities)],
      [labels.hobbies, countItems(form.hobbies)],
      [labels.favoriteDrinks, countItems(form.favoriteDrinks)],
      [labels.happyThings, countItems(form.happyThings)],
      [labels.sensoryComforts, countItems(form.sensoryComforts)],
      [labels.peopleToMeet, countItems(form.peopleToMeet)],
    ]
      .map(([label, count]) => `| ${label} | ${count} |`)
      .join('\n');

    return `# ${form.name.trim() || 'My OIYO Profile'}

> Exported from OIYO on ${today}
> This profile is a snapshot. Preferences and tendencies can change over time.

## Basic Profile

| Field | Value |
|---|---|
${field(labels.name, form.name)}
${field(labels.birthDate, form.birthDate)}
${field(labels.birthTime, form.birthTime)}
${field(labels.bloodType, form.bloodType)}
${field(labels.zodiacSign, form.zodiacSign)}
${field(labels.mbtiType, form.mbtiType)}

## Self-Knowledge Index

| Area | Items |
|---|---:|
${summaryRows}

## Saju / Astrology / Tarot Notes

### Saju
${form.sajuMemo.trim() || '-'}

### Tarot
${form.tarotMemo.trim() || '-'}

## Favorite Keywords

${listLines(form.favoriteKeywords)}

## Activities, Hobbies, and Drinks

### Preferred Activities
${listLines(form.preferredActivities)}

### Hobbies
${listLines(form.hobbies)}

### Favorite Drinks
${listLines(form.favoriteDrinks)}

## Things That Make Me Happy

${listLines(form.happyThings)}

## Sensory Comforts

${listLines(form.sensoryComforts)}

## People I Want To Meet

${listLines(form.peopleToMeet)}

## Current Tendencies

${form.currentTendencies.trim() || '-'}

## Change Log

### ${labels.recentChanges}
${listLines(form.recentChanges)}

### ${labels.stableTraits}
${listLines(form.stableTraits)}

### ${labels.nextExperiments}
${listLines(form.nextExperiments)}

## Next Reflection

- What changed recently?
- What still feels true?
- What do I want to fill tomorrow with?
`;
  }, [form, labels]);

  // 멀티 포맷 export: md / json / csv / SOUL.md (AI 페르소나). 전부 로컬 생성·다운로드(서버 전송 없음).
  const json = useMemo(() => JSON.stringify(
    { exportedAt: new Date().toISOString(), source: 'OIYO', note: 'local-only snapshot', profile: form }, null, 2,
  ), [form]);

  const csv = useMemo(() => {
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = (Object.keys(form) as (keyof ProfileForm)[]).map((k) => `${esc(labels[k] ?? k)},${esc(form[k])}`);
    return ['field,value', ...rows].join('\n');
  }, [form, labels]);

  const soul = useMemo(() => {
    const v = (s: string) => s.trim() || '-';
    return `# SOUL.md — ${form.name.trim() || 'Me'}

> AI 비서가 "나"를 이해하고 돕기 위한 페르소나 카드. OIYO에서 로컬 생성(${new Date().toISOString().slice(0, 10)}). 스냅샷이며 변할 수 있음.

## 정체성
- 이름/호칭: ${v(form.name)}
- MBTI: ${v(form.mbtiType)} · 별자리: ${v(form.zodiacSign)} · 혈액형: ${v(form.bloodType)}
- 생년월일: ${v(form.birthDate)} ${form.birthTime.trim() ? `(${form.birthTime})` : ''}

## 나를 움직이는 것
- 좋아하는 키워드: ${form.favoriteKeywords.trim().replace(/\n/g, ', ') || '-'}
- 행복한 순간: ${form.happyThings.trim().replace(/\n/g, ', ') || '-'}
- 감각적 위안: ${form.sensoryComforts.trim().replace(/\n/g, ', ') || '-'}

## 지금의 나
- 현재 성향: ${v(form.currentTendencies)}
- 최근 변화: ${form.recentChanges.trim().replace(/\n/g, ', ') || '-'}
- 안정적 특질: ${form.stableTraits.trim().replace(/\n/g, ', ') || '-'}
- 다음 실험: ${form.nextExperiments.trim().replace(/\n/g, ', ') || '-'}

## AI가 나를 도울 때 (지침)
- 위 성향·위안을 고려해 제안한다.
- 스냅샷임을 인지하고, 단정하지 말고 확인하며 돕는다.
- 개인정보는 외부로 보내지 않는다(local-first).
`;
  }, [form]);

  const FORMATS = { md: { content: markdown, ext: 'md', mime: 'text/markdown' }, json: { content: json, ext: 'json', mime: 'application/json' }, csv: { content: csv, ext: 'csv', mime: 'text/csv' }, soul: { content: soul, ext: 'md', mime: 'text/markdown' } } as const;
  const active = FORMATS[format];

  function update(key: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(active.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadMarkdown() {
    const blob = new Blob([active.content], { type: `${active.mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.name.trim() || 'oiyo'}-profile${format === 'soul' ? '-SOUL' : ''}.${active.ext}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetForm() {
    setForm(INITIAL);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }

  const profileFields: Array<{ key: keyof ProfileForm; type: string }> = [
    { key: 'name', type: 'text' },
    { key: 'birthDate', type: 'date' },
    { key: 'birthTime', type: 'time' },
    { key: 'bloodType', type: 'text' },
    { key: 'zodiacSign', type: 'text' },
    { key: 'mbtiType', type: 'text' },
  ];

  const narrativeFields: Array<{ key: keyof ProfileForm; rows: number }> = [
    { key: 'favoriteKeywords', rows: 2 },
    { key: 'preferredActivities', rows: 2 },
    { key: 'hobbies', rows: 2 },
    { key: 'favoriteDrinks', rows: 2 },
    { key: 'happyThings', rows: 2 },
    { key: 'sensoryComforts', rows: 2 },
    { key: 'peopleToMeet', rows: 2 },
    { key: 'currentTendencies', rows: 3 },
    { key: 'recentChanges', rows: 3 },
    { key: 'stableTraits', rows: 3 },
    { key: 'nextExperiments', rows: 3 },
    { key: 'sajuMemo', rows: 3 },
    { key: 'tarotMemo', rows: 3 },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-green-700">Markdown Export</p>
        <h1 className="mt-2 text-3xl font-black text-green-950">{text.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">{text.desc}</p>
        <p className="mt-3 inline-flex rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
          {text.saved}
        </p>
        <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">{text.privacy}</p>
      </div>

      {(() => {
        const m = ({
          ko: { title: '내 데이터 수집 현황', done: '수집됨', go: '테스트 하러가기', hint: '테스트를 하면 아래 항목이 자동으로 채워집니다.' },
          en: { title: 'Your data collected', done: 'collected', go: 'Take the test', hint: 'Taking tests auto-fills the fields below.' },
        } as Record<string, { title: string; done: string; go: string; hint: string }>)[L] ?? ({ title: 'Your data collected', done: 'collected', go: 'Take the test', hint: 'Taking tests auto-fills the fields below.' });
        const items = [
          { key: 'birthDate', label: L === 'ko' ? '생년월일·사주' : 'Birth · Saju', href: `/${L}/saju` },
          { key: 'mbtiType', label: 'MBTI', href: `/${L}/mbti` },
          { key: 'zodiacSign', label: L === 'ko' ? '별자리' : 'Zodiac', href: `/${L}/zodiac-fortune` },
          { key: 'bloodType', label: L === 'ko' ? '혈액형' : 'Blood type', href: null as string | null },
        ];
        const filled = items.filter((it) => form[it.key as keyof ProfileForm]).length;
        const pct = Math.round((filled / items.length) * 100);
        return (
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50/50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-black text-green-950"><Sparkles className="h-4 w-4" /> {m.title}</span>
              <span className="text-xs font-bold text-green-700">{filled}/{items.length} · {pct}%</span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-green-100">
              <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((it) => {
                const has = !!form[it.key as keyof ProfileForm];
                if (has) return <span key={it.key} className="rounded-md bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-800">✓ {it.label}</span>;
                return it.href
                  ? <a key={it.key} href={it.href} className="rounded-md border border-green-300 bg-white px-2 py-1 text-[11px] font-semibold text-green-700 hover:bg-green-50">{it.label} · {m.go} →</a>
                  : <span key={it.key} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-400">{it.label}</span>;
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">{m.hint}</p>
          </div>
        );
      })()}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-green-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-green-950">
              <FileText className="h-5 w-5" /> {text.profile}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {profileFields.map(({ key, type }) => (
                <label key={key} className="text-sm font-semibold text-slate-700">
                  {labels[key]}
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(event) => update(key, event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-green-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black text-green-950">{text.inputs}</h2>
            {narrativeFields.map(({ key, rows }) => (
              <label key={key} className="mb-3 block text-sm font-semibold text-slate-700">
                {labels[key]}
                <textarea
                  value={form[key]}
                  onChange={(event) => update(key, event.target.value)}
                  rows={rows}
                  className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-green-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-green-950">{text.output}</h2>
            <div className="flex gap-2">
              <button onClick={copyMarkdown} className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-sm font-bold text-green-800 hover:bg-green-50">
                <Copy className="h-4 w-4" /> {copied ? text.copied : text.copy}
              </button>
              <button onClick={downloadMarkdown} className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-sm font-bold text-white hover:bg-green-800">
                <Download className="h-4 w-4" /> {text.download}
              </button>
              <button onClick={resetForm} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <RotateCcw className="h-4 w-4" /> {text.reset}
              </button>
            </div>
          </div>
          {/* 포맷 선택 — 전부 브라우저에서 로컬 생성·다운로드(서버 전송 없음) */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {([['md', 'Markdown'], ['json', 'JSON'], ['csv', 'CSV'], ['soul', 'SOUL.md (AI)']] as const).map(([f, lbl]) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${format === f ? 'bg-green-700 text-white' : 'border border-green-200 text-green-800 hover:bg-green-50'}`}>
                {lbl}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-slate-400">🔒 {locale === 'ko' ? '로컬에서만 생성 · 서버 전송 없음' : 'generated locally · never uploaded'}</span>
          </div>
          <pre className="max-h-[720px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">{active.content}</pre>
        </div>
      </div>
    </section>
  );
}
