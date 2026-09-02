import { useMemo, useState } from 'react';
import { reading, animalOf, elementOf, FIVE_ELEMENTS, type Locale, type Period } from '../../lib/fortune/periodic';

type Entry = { id: number; label: string; year: number };

const ELEM_COLOR: Record<string, string> = { wood: '#16a34a', fire: '#dc2626', earth: '#ca8a04', metal: '#64748b', water: '#2563eb' };

const L: Record<Locale, {
  title: string; subtitle: string; labelPlaceholder: string; yearPlaceholder: string;
  add: string; remove: string; empty: string; elements: Record<string, string>;
  animals: string[]; note: string;
}> = {
  ko: {
    title: '여러 명 함께 보기', subtitle: '태어난 해만 넣으면 여러 사람(가족·세대)의 오행·띠를 한 화면에서 비교합니다.',
    labelPlaceholder: '예: 나, 엄마, 아빠', yearPlaceholder: '태어난 해',
    add: '추가', remove: '삭제', empty: '아직 추가된 사람이 없습니다. 태어난 해를 입력해 보세요.',
    elements: { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' },
    animals: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'],
    note: '연도 기준 사주 오행·12지신 요약이며, 별자리는 월·일이 필요해 이 비교에서는 제외됩니다.',
  },
  en: {
    title: 'Compare several people', subtitle: 'Enter birth years to compare Saju elements and Chinese zodiac across family or generations at a glance.',
    labelPlaceholder: 'e.g. Me, Mom, Dad', yearPlaceholder: 'Birth year',
    add: 'Add', remove: 'Remove', empty: 'No one added yet. Enter a birth year to start.',
    elements: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
    animals: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
    note: 'Based on birth year only (Saju element + Chinese zodiac). Star sign needs month/day and is excluded here.',
  },
  ja: {
    title: '複数人まとめて比較', subtitle: '生まれた年を入れるだけで、家族や世代の五行・十二支を一画面で比較できます。',
    labelPlaceholder: '例: 自分、母、父', yearPlaceholder: '生まれた年',
    add: '追加', remove: '削除', empty: 'まだ誰も追加されていません。生まれた年を入力してください。',
    elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
    animals: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    note: '生まれた年だけを基準にした五行・十二支の要約です。星座は月日が必要なため対象外です。',
  },
  zh: {
    title: '多人一起比较', subtitle: '只需输入出生年份，即可在一屏内比较家人或不同世代的五行与生肖。',
    labelPlaceholder: '例：我、妈妈、爸爸', yearPlaceholder: '出生年份',
    add: '添加', remove: '删除', empty: '还没有添加任何人，请输入出生年份。',
    elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
    animals: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    note: '仅基于出生年份的四柱五行与生肖摘要，星座需要月日信息，本比较不包含。',
  },
  fr: {
    title: 'Comparer plusieurs personnes', subtitle: "Entrez des années de naissance pour comparer l'élément Saju et le zodiaque chinois entre proches ou générations.",
    labelPlaceholder: 'ex. Moi, Maman, Papa', yearPlaceholder: 'Année de naissance',
    add: 'Ajouter', remove: 'Retirer', empty: "Personne n'a encore été ajouté. Entrez une année de naissance.",
    elements: { wood: 'Bois', fire: 'Feu', earth: 'Terre', metal: 'Métal', water: 'Eau' },
    animals: ['Rat', 'Bœuf', 'Tigre', 'Lapin', 'Dragon', 'Serpent', 'Cheval', 'Chèvre', 'Singe', 'Coq', 'Chien', 'Cochon'],
    note: "Basé uniquement sur l'année de naissance (élément Saju + zodiaque chinois). Le signe astral nécessite mois/jour et est exclu ici.",
  },
  es: {
    title: 'Comparar varias personas', subtitle: 'Introduce años de nacimiento para comparar el elemento Saju y el zodiaco chino entre familiares o generaciones.',
    labelPlaceholder: 'ej. Yo, Mamá, Papá', yearPlaceholder: 'Año de nacimiento',
    add: 'Añadir', remove: 'Quitar', empty: 'Aún no se ha añadido a nadie. Introduce un año de nacimiento.',
    elements: { wood: 'Madera', fire: 'Fuego', earth: 'Tierra', metal: 'Metal', water: 'Agua' },
    animals: ['Rata', 'Buey', 'Tigre', 'Conejo', 'Dragón', 'Serpiente', 'Caballo', 'Cabra', 'Mono', 'Gallo', 'Perro', 'Cerdo'],
    note: 'Basado solo en el año de nacimiento (elemento Saju + zodiaco chino). El signo solar necesita mes/día y no se incluye aquí.',
  },
};

const MAX_ENTRIES = 6;
const FIELD_CLASS = 'h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-green-500 focus:bg-card focus:ring-4 focus:ring-green-500/10';

export default function GenerationCompare({ locale = 'ko', period = 'today' }: { locale?: Locale; period?: Period }) {
  const t = L[locale] ?? L.en;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [label, setLabel] = useState('');
  const [year, setYear] = useState('');
  const currentYear = new Date().getFullYear();

  const add = () => {
    const y = Number(year);
    if (!y || y < 1900 || y > currentYear) return;
    if (entries.length >= MAX_ENTRIES) return;
    setEntries((prev) => [...prev, { id: Date.now(), label: label.trim() || `${y}`, year: y }]);
    setLabel('');
    setYear('');
  };

  const remove = (id: number) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const results = useMemo(() => entries.map((e) => {
    const elemIdx = elementOf(e.year);
    const aIdx = animalOf(e.year);
    const r = reading(elemIdx, period, `gen-${e.year}`, locale);
    return { ...e, el: FIVE_ELEMENTS[elemIdx], animal: t.animals[aIdx], r };
  }), [entries, period, locale, t]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-foreground">{t.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t.labelPlaceholder}
          className={`${FIELD_CLASS} w-32`}
        />
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder={t.yearPlaceholder}
          min={1900}
          max={currentYear}
          className={`${FIELD_CLASS} w-28`}
        />
        <button
          onClick={add}
          disabled={entries.length >= MAX_ENTRIES}
          className="h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          {t.add}
        </button>
      </div>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((e) => (
            <div key={e.id} className="relative rounded-2xl border bg-card p-4" style={{ borderColor: ELEM_COLOR[e.el] + '55' }}>
              <button
                onClick={() => remove(e.id)}
                aria-label={t.remove}
                className="absolute right-3 top-3 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
              <h3 className="text-sm font-black">{e.label}</h3>
              <p className="text-xs text-muted-foreground">{e.year} · {t.elements[e.el]} · {e.animal}</p>
              <p className="mt-2 text-sm leading-relaxed">{e.r.opening}</p>
              <p className="mt-1 text-xs font-semibold text-primary">{e.r.advice}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">{t.note}</p>
    </div>
  );
}
