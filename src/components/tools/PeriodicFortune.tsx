import { useMemo, useState, useEffect } from 'react';
import { reading, periodKey, animalOf, signOf, elementOf, FIVE_ELEMENTS, type Locale, type Period } from '../../lib/fortune/periodic';
import { AXES, scores, flow, delta, grade, lucky, animalRanking, signRanking, type Axis, type Grade } from '../../lib/fortune/score';
import { useProfilePrefill } from '../../lib/user/useProfilePrefill';
import { BirthDateField } from '../shared/BirthDateField';

type Focus = 'trinity' | 'saju' | 'zodiac';

const L: Record<Locale, {
  birthPrompt: string; birthDate: string; see: string;
  saju: string; animal: string; sign: string; period: Record<Period, string>;
  periodTag: Record<Period, string>; elements: Record<string, string>;
  animals: string[]; signs: string[]; savedHint: string; focusIntro: Record<Focus, string>;
  axes: Record<Axis, string>; grades: Record<Grade, string>;
  flowTitle: string; rankTitle: Record<'animal' | 'sign', string>;
  luckyTitle: string; luckyColor: string; luckyNumber: string; luckyDir: string; luckyTime: string; luckyItem: string;
  vsPrev: Record<Period, string>; myRank: string; rankUnit: string; keywordLabel: string;
  streakOne: string; streakMany: (n: number) => string; again: string; showAll: string; hideAll: string;
}> = {
  ko: { birthPrompt: '생년월일을 입력하면 사주 오행·12지신·별자리 세 관점의 운세가 나옵니다.', birthDate: '생년월일', see: '운세 보기',
    saju: '사주 오행', animal: '12지신', sign: '별자리',
    period: { today: '오늘의 운세', weekly: '이번 주 운세', monthly: '이번 달 운세', yearly: '올해의 운세' },
    periodTag: { today: '오늘', weekly: '이번 주', monthly: '이번 달', yearly: '올해' },
    elements: { wood: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' },
    animals: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'],
    signs: ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '궁수자리', '염소자리', '물병자리', '물고기자리'], savedHint: '저장됨',
    focusIntro: { trinity: '세 관점을 함께 비교합니다.', saju: '사주 오행 흐름에 집중해 주기별 키워드를 봅니다.', zodiac: '태양 별자리 흐름에 집중해 주기별 키워드를 봅니다.' },
    axes: { overall: '총운', love: '애정운', money: '금전운', work: '직장·학업운', health: '건강운' },
    grades: { great: '대길', good: '길', normal: '평', careful: '주의' },
    flowTitle: '운세 흐름', rankTitle: { animal: '12지신 순위', sign: '별자리 순위' },
    luckyTitle: '행운 아이템', luckyColor: '행운의 색', luckyNumber: '행운의 숫자', luckyDir: '행운의 방향', luckyTime: '행운의 시간', luckyItem: '행운의 물건',
    vsPrev: { today: '어제 대비', weekly: '지난주 대비', monthly: '지난달 대비', yearly: '작년 대비' }, myRank: '내 순위', rankUnit: '위', keywordLabel: '키워드',
    streakOne: '첫 방문이에요', streakMany: (n: number) => `${n}일 연속 확인 중`, again: '다시 입력', showAll: '전체 순위 보기', hideAll: '접기' },
  en: { birthPrompt: 'Enter your birth date to see fortune from three angles: Saju five elements, Chinese zodiac, and star sign.', birthDate: 'Birth date', see: 'See fortune',
    saju: 'Saju Five Elements', animal: 'Chinese Zodiac', sign: 'Star Sign',
    period: { today: "Today's Fortune", weekly: 'This Week', monthly: 'This Month', yearly: 'This Year' },
    periodTag: { today: 'today', weekly: 'this week', monthly: 'this month', yearly: 'this year' },
    elements: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
    animals: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
    signs: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'], savedHint: 'saved',
    focusIntro: { trinity: 'Compare the three symbolic lenses together.', saju: 'Focus on the Saju five-element rhythm for this cycle.', zodiac: 'Focus on your Sun-sign rhythm for this cycle.' },
    axes: { overall: 'Overall', love: 'Love', money: 'Money', work: 'Work & study', health: 'Health' },
    grades: { great: 'Excellent', good: 'Good', normal: 'Fair', careful: 'Take care' },
    flowTitle: 'Fortune trend', rankTitle: { animal: 'Chinese zodiac ranking', sign: 'Star sign ranking' },
    luckyTitle: 'Lucky items', luckyColor: 'Lucky colour', luckyNumber: 'Lucky number', luckyDir: 'Lucky direction', luckyTime: 'Lucky hour', luckyItem: 'Lucky object',
    vsPrev: { today: 'vs yesterday', weekly: 'vs last week', monthly: 'vs last month', yearly: 'vs last year' }, myRank: 'Your rank', rankUnit: '', keywordLabel: 'Keyword',
    streakOne: 'First visit', streakMany: (n: number) => `${n}-day streak`, again: 'Change date', showAll: 'See full ranking', hideAll: 'Collapse' },
  ja: { birthPrompt: '生年月日を入力すると四柱五行・十二支・星座の3つの視点で運勢が出ます。', birthDate: '生年月日', see: '運勢を見る',
    saju: '四柱の五行', animal: '十二支', sign: '星座',
    period: { today: '今日の運勢', weekly: '今週の運勢', monthly: '今月の運勢', yearly: '今年の運勢' },
    periodTag: { today: '今日', weekly: '今週', monthly: '今月', yearly: '今年' },
    elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
    animals: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    signs: ['牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座', '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'], savedHint: '保存済み',
    focusIntro: { trinity: '三つの象徴体系を一緒に比較します。', saju: '四柱五行の周期的な流れに集中して読みます。', zodiac: '太陽星座の周期的な流れに集中して読みます。' },
    axes: { overall: '総合運', love: '恋愛運', money: '金運', work: '仕事・学業運', health: '健康運' },
    grades: { great: '大吉', good: '吉', normal: '平', careful: '注意' },
    flowTitle: '運勢の流れ', rankTitle: { animal: '十二支ランキング', sign: '星座ランキング' },
    luckyTitle: 'ラッキーアイテム', luckyColor: 'ラッキーカラー', luckyNumber: 'ラッキーナンバー', luckyDir: 'ラッキー方位', luckyTime: 'ラッキータイム', luckyItem: 'ラッキーアイテム',
    vsPrev: { today: '昨日比', weekly: '先週比', monthly: '先月比', yearly: '昨年比' }, myRank: 'あなたの順位', rankUnit: '位', keywordLabel: 'キーワード',
    streakOne: '初めての訪問です', streakMany: (n: number) => `${n}日連続チェック中`, again: '入力し直す', showAll: '全順位を見る', hideAll: '閉じる' },
  zh: { birthPrompt: '输入出生日期，从四柱五行、生肖、星座三个角度查看运势。', birthDate: '出生日期', see: '查看运势',
    saju: '四柱五行', animal: '生肖', sign: '星座',
    period: { today: '今日运势', weekly: '本周运势', monthly: '本月运势', yearly: '今年运势' },
    periodTag: { today: '今日', weekly: '本周', monthly: '本月', yearly: '今年' },
    elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
    animals: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    signs: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'], savedHint: '已保存',
    focusIntro: { trinity: '同时比较三个象征视角。', saju: '聚焦四柱五行在本周期的关键词。', zodiac: '聚焦太阳星座在本周期的关键词。' },
    axes: { overall: '总运', love: '爱情运', money: '财运', work: '事业学业运', health: '健康运' },
    grades: { great: '大吉', good: '吉', normal: '平', careful: '注意' },
    flowTitle: '运势走向', rankTitle: { animal: '生肖排行', sign: '星座排行' },
    luckyTitle: '幸运物', luckyColor: '幸运色', luckyNumber: '幸运数字', luckyDir: '幸运方位', luckyTime: '幸运时段', luckyItem: '幸运物品',
    vsPrev: { today: '较昨日', weekly: '较上周', monthly: '较上月', yearly: '较去年' }, myRank: '你的排名', rankUnit: '名', keywordLabel: '关键词',
    streakOne: '第一次来', streakMany: (n: number) => `已连续查看 ${n} 天`, again: '重新输入', showAll: '查看完整排行', hideAll: '收起' },
  fr: { birthPrompt: 'Entrez votre date de naissance pour voir la fortune sous trois angles : cinq éléments Saju, zodiaque chinois et signe astral.', birthDate: 'Date de naissance', see: 'Voir',
    saju: 'Cinq éléments Saju', animal: 'Zodiaque chinois', sign: 'Signe astral',
    period: { today: "Aujourd'hui", weekly: 'Cette semaine', monthly: 'Ce mois', yearly: 'Cette année' },
    periodTag: { today: "aujourd'hui", weekly: 'cette semaine', monthly: 'ce mois', yearly: 'cette année' },
    elements: { wood: 'Bois', fire: 'Feu', earth: 'Terre', metal: 'Métal', water: 'Eau' },
    animals: ['Rat', 'Bœuf', 'Tigre', 'Lapin', 'Dragon', 'Serpent', 'Cheval', 'Chèvre', 'Singe', 'Coq', 'Chien', 'Cochon'],
    signs: ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'], savedHint: 'enregistré',
    focusIntro: { trinity: 'Comparez les trois lectures symboliques ensemble.', saju: 'Concentrez-vous sur le rythme Saju des cinq éléments pour ce cycle.', zodiac: 'Concentrez-vous sur le rythme de votre signe solaire pour ce cycle.' },
    axes: { overall: 'Général', love: 'Amour', money: 'Argent', work: 'Travail & études', health: 'Santé' },
    grades: { great: 'Excellent', good: 'Bon', normal: 'Moyen', careful: 'Prudence' },
    flowTitle: 'Tendance', rankTitle: { animal: 'Classement du zodiaque chinois', sign: 'Classement des signes' },
    luckyTitle: 'Porte-bonheur', luckyColor: 'Couleur', luckyNumber: 'Nombre', luckyDir: 'Direction', luckyTime: 'Heure', luckyItem: 'Objet',
    vsPrev: { today: 'vs hier', weekly: 'vs semaine dernière', monthly: 'vs mois dernier', yearly: 'vs an dernier' }, myRank: 'Votre rang', rankUnit: 'e', keywordLabel: 'Mot-clé',
    streakOne: 'Première visite', streakMany: (n: number) => `${n} jours d'affilée`, again: 'Modifier la date', showAll: 'Voir le classement complet', hideAll: 'Réduire' },
  es: { birthPrompt: 'Introduce tu fecha de nacimiento para ver la fortuna desde tres ángulos: cinco elementos Saju, zodiaco chino y signo.', birthDate: 'Fecha de nacimiento', see: 'Ver',
    saju: 'Cinco elementos Saju', animal: 'Zodiaco chino', sign: 'Signo',
    period: { today: 'Hoy', weekly: 'Esta semana', monthly: 'Este mes', yearly: 'Este año' },
    periodTag: { today: 'hoy', weekly: 'esta semana', monthly: 'este mes', yearly: 'este año' },
    elements: { wood: 'Madera', fire: 'Fuego', earth: 'Tierra', metal: 'Metal', water: 'Agua' },
    animals: ['Rata', 'Buey', 'Tigre', 'Conejo', 'Dragón', 'Serpiente', 'Caballo', 'Cabra', 'Mono', 'Gallo', 'Perro', 'Cerdo'],
    signs: ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'], savedHint: 'guardado',
    focusIntro: { trinity: 'Compara las tres lecturas simbólicas juntas.', saju: 'Enfócate en el ritmo Saju de cinco elementos para este ciclo.', zodiac: 'Enfócate en el ritmo de tu signo solar para este ciclo.' },
    axes: { overall: 'General', love: 'Amor', money: 'Dinero', work: 'Trabajo y estudio', health: 'Salud' },
    grades: { great: 'Excelente', good: 'Bueno', normal: 'Regular', careful: 'Precaución' },
    flowTitle: 'Tendencia', rankTitle: { animal: 'Ranking del zodiaco chino', sign: 'Ranking de signos' },
    luckyTitle: 'Amuletos', luckyColor: 'Color', luckyNumber: 'Número', luckyDir: 'Dirección', luckyTime: 'Hora', luckyItem: 'Objeto',
    vsPrev: { today: 'vs ayer', weekly: 'vs semana pasada', monthly: 'vs mes pasado', yearly: 'vs año pasado' }, myRank: 'Tu puesto', rankUnit: 'º', keywordLabel: 'Palabra clave',
    streakOne: 'Primera visita', streakMany: (n: number) => `${n} días seguidos`, again: 'Cambiar fecha', showAll: 'Ver ranking completo', hideAll: 'Contraer' },
};

const ELEM_COLOR: Record<string, string> = { wood: '#16a34a', fire: '#dc2626', earth: '#ca8a04', metal: '#64748b', water: '#2563eb' };
const GRADE_COLOR: Record<Grade, string> = { great: '#d97706', good: '#16a34a', normal: '#0891b2', careful: '#7c3aed' };
const ANIMAL_EMOJI = ['🐭', '🐮', '🐯', '🐰', '🐉', '🐍', '🐎', '🐑', '🐒', '🐓', '🐕', '🐷'];
const SIGN_EMOJI = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

/** 총운 점수 도넛. 숫자만 있으면 "그래서 좋은 건가"가 읽히지 않아 등급과 함께 보여준다. */
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const R = 34, C = 2 * Math.PI * R;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={R} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted" opacity="0.25" />
        <circle
          cx="40" cy="40" r={R} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black leading-none" style={{ color }}>{score}</span>
        <span className="mt-0.5 text-[10px] font-bold" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

/** 운세 흐름 꺾은선. 오늘 지점을 강조해 "어제보다 오르는 중인지"가 한눈에 보이게 한다. */
function FlowChart({ points, color, unit }: { points: { offset: number; score: number; label: string }[]; color: string; unit: string }) {
  const W = 300, H = 92, PAD = 14;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (points.length - 1);
  const y = (v: number) => H - PAD - ((v - 0) / 100) * (H - PAD * 2);
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`;
  const now = points.findIndex((p) => p.offset === 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${unit} ${points.map((p) => `${p.label} ${p.score}`).join(', ')}`}>
      <path d={area} fill={color} opacity="0.1" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.offset}>
          <circle cx={x(i)} cy={y(p.score)} r={p.offset === 0 ? 5 : 3} fill={p.offset === 0 ? color : 'white'} stroke={color} strokeWidth="2" />
          <text x={x(i)} y={H - 3} textAnchor="middle" fontSize="9" fill="currentColor" opacity={p.offset === 0 ? 0.95 : 0.5} fontWeight={p.offset === 0 ? 800 : 400}>{p.label}</text>
        </g>
      ))}
      {now >= 0 && (
        <text x={x(now)} y={y(points[now].score) - 10} textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>{points[now].score}</text>
      )}
    </svg>
  );
}

export default function PeriodicFortune({ locale = 'ko', period = 'today', focus = 'trinity' }: { locale?: Locale; period?: Period; focus?: Focus }) {
  const t = L[locale] ?? L.en;
  const [birth, setBirth] = useState<{ y: number; m: number; d: number } | null>(null);
  const [dateInput, setDateInput] = useState('');
  const [flowAxis, setFlowAxis] = useState<Axis>('overall');
  const [openRank, setOpenRank] = useState(false);
  const [streak, setStreak] = useState(0);

  // 온톨로지 프로필(생년월일)에서 자동 채움 — 재입력 제거.
  const { parsed, saveBirth } = useProfilePrefill();
  useEffect(() => {
    if (parsed) setBirth({ y: parsed.year, m: parsed.month, d: parsed.day });
  }, [parsed]);

  // 연속 방문 기록. 서버로 나가지 않고 이 브라우저에만 남는 가벼운 재방문 장치다.
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem('oiyo:fortune-streak');
      const prev = raw ? (JSON.parse(raw) as { last: string; n: number }) : null;
      if (prev?.last === today) { setStreak(prev.n); return; }
      const yday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const n = prev?.last === yday ? prev.n + 1 : 1;
      localStorage.setItem('oiyo:fortune-streak', JSON.stringify({ last: today, n }));
      setStreak(n);
    } catch { /* 프라이빗 모드 등에서 저장이 막혀도 운세 자체는 그대로 보여준다 */ }
  }, []);

  // 2026-08-25 impeccable critique P1: "See fortune" gave zero feedback when
  // clicked with no/invalid birth date — silent no-op. Disable the button
  // instead so the failure state is visible rather than discoverable only
  // by clicking and nothing happening.
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateInput);

  const submit = () => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInput);
    if (!match) return;
    const y = Number(match[1]), m = Number(match[2]), d = Number(match[3]);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      setBirth({ y, m, d });
      saveBirth({ year: y, month: m, day: d }); // 다른 도구로 전파
    }
  };

  const result = useMemo(() => {
    if (!birth) return null;
    const elemIdx = elementOf(birth.y);
    const aIdx = animalOf(birth.y);
    const sIdx = signOf(birth.m, birth.d);
    // 시드에 월·일까지 넣는다. 생년만 쓰면 같은 해에 태어난 모든 사람이
    // 글자 하나까지 같은 사주 카드를 받았다. (2026-09-09)
    const seed = `saju-${birth.y}-${birth.m}-${birth.d}`;
    // 세 카드는 시드가 다르지만 같은 문장 풀을 쓰므로 이따금 같은 문장을 집는다.
    // 나란히 놓인 카드에 같은 줄이 두 번 뜨면 코퍼스가 얕아 보이므로, 겹치면
    // 소금을 쳐서 다시 뽑는다.
    const used = new Set<string>();
    // 카드마다 자기 점수 등급을 넘겨, 85점 카드에 소모적인 문장이 뜨는 모순을 막는다.
    const distinct = (el: number, base: string, g: Grade) => {
      for (let salt = 0; salt < 8; salt++) {
        const r = reading(el, period, salt === 0 ? base : `${base}~${salt}`, locale, new Date(), g);
        if (!used.has(r.opening)) { used.add(r.opening); return r; }
      }
      return reading(el, period, base, locale, new Date(), g);
    };
    const sc = scores(seed, period);
    const aRank = animalRanking(period);
    const sRank = signRanking(period);
    const aScore = aRank.find((r) => r.idx === aIdx)!.score;
    const sScore = sRank.find((r) => r.idx === sIdx)!.score;
    return {
      pk: periodKey(period),
      seed,
      saju: { el: FIVE_ELEMENTS[elemIdx], r: distinct(elemIdx, seed, grade(sc.overall)) },
      // 12지신·별자리도 오행에 매핑해 어조를 달리(축을 바꿔 다른 문장이 나오게 base 다르게)
      animal: { idx: aIdx, r: distinct((aIdx * 2 + 1) % 5, `animal-${aIdx}`, grade(aScore)) },
      sign: { idx: sIdx, r: distinct((sIdx + 2) % 5, `sign-${sIdx}`, grade(sScore)) },
      sc,
      dl: delta(seed, period),
      lk: lucky(seed, period, locale),
      animalRank: aRank,
      signRank: sRank,
    };
  }, [birth, period, locale]);

  const flowPoints = useMemo(
    () => (result ? flow(result.seed, period, flowAxis, 3, 3, new Date(), locale) : []),
    [result, period, flowAxis, locale],
  );

  const Card = ({ title, color, r }: { title: string; color?: string; r: { opening: string; focus: string; advice: string; caution: string; keyword: string } }) => (
    <div className="rounded-2xl border bg-card p-4" style={color ? { borderColor: color + '55' } : undefined}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black" style={color ? { color } : undefined}>{title}</h3>
        <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold" style={color ? { borderColor: color + '55', color } : undefined}>
          {t.keywordLabel} · {r.keyword}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed">{r.opening}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.focus}</p>
      <p className="mt-2 text-xs font-semibold text-primary">{r.advice}</p>
      <p className="mt-1 text-xs text-muted-foreground">{r.caution}</p>
    </div>
  );

  const Ranking = ({ kind, rows, mine, names, emoji }: {
    kind: 'animal' | 'sign'; rows: { idx: number; rank: number; score: number }[];
    mine: number; names: string[]; emoji: string[];
  }) => {
    const myRow = rows.find((r) => r.idx === mine)!;
    const shown = openRank ? rows : rows.slice(0, 3);
    return (
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-black">{t.periodTag[period]} {t.rankTitle[kind]}</h3>
          <span className="text-xs font-bold text-muted-foreground">
            {t.myRank} {myRow.rank}{t.rankUnit}
          </span>
        </div>
        <ol className="mt-2.5 space-y-1.5">
          {shown.map((r) => {
            const isMine = r.idx === mine;
            return (
              <li key={r.idx} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${isMine ? 'bg-primary/10 font-bold' : ''}`}>
                <span className="w-6 shrink-0 text-xs font-black tabular-nums text-muted-foreground">{r.rank}</span>
                <span aria-hidden="true">{emoji[r.idx]}</span>
                <span className="flex-1 truncate text-sm">{names[r.idx]}</span>
                <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <span className="block h-full rounded-full" style={{ width: `${r.score}%`, background: GRADE_COLOR[grade(r.score)] }} />
                </span>
                <span className="w-7 shrink-0 text-right text-xs font-bold tabular-nums">{r.score}</span>
              </li>
            );
          })}
          {!openRank && myRow.rank > 3 && (
            <li className="flex items-center gap-2 rounded-lg bg-primary/10 px-2 py-1.5 font-bold">
              <span className="w-6 shrink-0 text-xs font-black tabular-nums text-muted-foreground">{myRow.rank}</span>
              <span aria-hidden="true">{emoji[mine]}</span>
              <span className="flex-1 truncate text-sm">{names[mine]}</span>
              <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <span className="block h-full rounded-full" style={{ width: `${myRow.score}%`, background: GRADE_COLOR[grade(myRow.score)] }} />
              </span>
              <span className="w-7 shrink-0 text-right text-xs font-bold tabular-nums">{myRow.score}</span>
            </li>
          )}
        </ol>
        <button onClick={() => setOpenRank((v) => !v)} className="mt-2 w-full rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-accent">
          {openRank ? t.hideAll : t.showAll}
        </button>
      </div>
    );
  };

  if (!result) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{focus === 'trinity' ? t.birthPrompt : t.focusIntro[focus]}</p>
        <div className="space-y-3">
          <BirthDateField
            id="periodic-birth-date"
            locale={locale}
            label={t.birthDate}
            value={dateInput}
            onChange={setDateInput}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full"
          />
          <button
            onClick={submit}
            disabled={!isValidDate}
            className="h-12 w-full rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >{t.see}</button>
        </div>
      </div>
    );
  }

  const g = grade(result.sc.overall);
  const gColor = GRADE_COLOR[g];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-black">{t.period[period]}</h2>
        <span className="text-xs font-bold text-muted-foreground">{result.pk}</span>
      </div>

      {/* 총운 점수 + 5축 막대 — 숫자가 있어야 오늘과 어제를 비교할 수 있다. */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-4">
          <ScoreRing score={result.sc.overall} label={t.grades[g]} color={gColor} />
          <div className="min-w-0 flex-1 space-y-1.5">
            {AXES.filter((a) => a !== 'overall').map((a) => (
              <div key={a} className="flex items-center gap-2">
                <span className="w-16 shrink-0 truncate text-[11px] font-bold text-muted-foreground">{t.axes[a]}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${result.sc[a]}%`, background: GRADE_COLOR[grade(result.sc[a])] }} />
                </span>
                <span className="w-6 shrink-0 text-right text-[11px] font-bold tabular-nums">{result.sc[a]}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-muted-foreground">
          <span>
            {t.vsPrev[period]}{' '}
            <span style={{ color: result.dl > 0 ? '#16a34a' : result.dl < 0 ? '#dc2626' : undefined }}>
              {result.dl > 0 ? '▲' : result.dl < 0 ? '▼' : '—'}{result.dl !== 0 && Math.abs(result.dl)}
            </span>
          </span>
          {streak > 0 && <span>{streak === 1 ? t.streakOne : t.streakMany(streak)}</span>}
        </p>
      </div>

      {/* 운세 흐름 — 오늘 하루만 보는 대신 앞뒤 흐름을 보여 다시 오게 만든다. */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-black">{t.flowTitle}</h3>
          <div className="flex flex-wrap gap-1">
            {AXES.map((a) => (
              <button
                key={a}
                onClick={() => setFlowAxis(a)}
                aria-pressed={flowAxis === a}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${flowAxis === a ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}
              >{t.axes[a]}</button>
            ))}
          </div>
        </div>
        <div className="mt-2 text-muted-foreground">
          <FlowChart points={flowPoints} color={gColor} unit={t.flowTitle} />
        </div>
      </div>

      {/* 행운 아이템 — 하루 단위로 바뀌는 구체적 조각. 공유·기록 유인이 된다. */}
      <div className="rounded-2xl border bg-card p-4">
        <h3 className="text-sm font-black">{t.luckyTitle}</h3>
        <dl className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border p-2.5">
            <dt className="text-[11px] font-bold text-muted-foreground">{t.luckyColor}</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-bold">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border" style={{ background: result.lk.colorHex }} aria-hidden="true" />
              {result.lk.colorName}
            </dd>
          </div>
          {([[t.luckyNumber, String(result.lk.number)], [t.luckyDir, result.lk.direction], [t.luckyTime, result.lk.time], [t.luckyItem, result.lk.item]] as const).map(([k, v]) => (
            <div key={k} className="rounded-xl border p-2.5">
              <dt className="text-[11px] font-bold text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-sm font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {(focus === 'trinity' || focus === 'saju') && <Card title={`${t.saju} · ${t.elements[result.saju.el]}`} color={ELEM_COLOR[result.saju.el]} r={result.saju.r} />}
      {focus === 'trinity' && <Card title={`${t.animal} · ${t.animals[result.animal.idx]}`} r={result.animal.r} />}
      {(focus === 'trinity' || focus === 'zodiac') && <Card title={`${t.sign} · ${t.signs[result.sign.idx]}`} r={result.sign.r} />}

      {/* 순위 — "나는 오늘 몇 위인가"는 가장 강한 재방문 동기다. */}
      {focus !== 'zodiac' && <Ranking kind="animal" rows={result.animalRank} mine={result.animal.idx} names={t.animals} emoji={ANIMAL_EMOJI} />}
      {focus !== 'saju' && <Ranking kind="sign" rows={result.signRank} mine={result.sign.idx} names={t.signs} emoji={SIGN_EMOJI} />}

      <button onClick={() => setBirth(null)} className="w-full rounded-xl border bg-card px-4 py-2.5 text-sm font-bold hover:bg-accent">{t.again}</button>
    </div>
  );
}
