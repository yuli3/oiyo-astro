// Time-slip series quick wins (2026-11-03): birthday seed, rarity badge, time-warp intro,
// saved ID card image, friend comparison and the series stamp board.
// Design: company-brain projects/oiyo-ecosystem/past-life-series-design-2026-11-03.md
import { TIMESLIP_CARD_ART, TIMESLIP_UI_ROOT, TIMESLIP_ART_NOTE } from "../../../data/timeslip-ui-art";
import { layoutCard } from "../../../lib/timeslip-card-layout";
import { useEffect, useRef, useState } from "react";
import { localePath, type Locale } from "../../../i18n";
import { gaEvent } from "../../../lib/analytics/ga-event";
import { EPISODES, isValidBirthday, rarityTier, type EpisodeId, type Rarity } from "../../../lib/past-life-1426";
import { LIVES_KEY, cleanLives, type Lives } from "../../../lib/timeslip-lives";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { oneInText, pick, type L, type Six } from "./shared";

export type Mode = "random" | "birthday" | "trait";

const BIRTHDAY_KEY = "oiyo:past-life-birthday";
const STAMP_KEY = "oiyo:timeslip-stamps";
const OWN_KEY = "oiyo:timeslip-own";

// Storage can throw in private windows or with blocked site data; every read/write is best effort.
function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* best effort */
  }
}

const T = {
  random: { ko: "랜덤", en: "Random", ja: "ランダム", zh: "随机", fr: "Hasard", es: "Azar" },
  birthday: { ko: "내 생일로", en: "My birthday", ja: "誕生日で", zh: "按生日", fr: "Ma date", es: "Mi cumpleaños" },
  trait: { ko: "내 성향", en: "My traits", ja: "性格で", zh: "按性格", fr: "Mon profil", es: "Mi perfil" },
  modeNote: {
    ko: "랜덤은 매번 다른 평행세계, 생일은 언제 와도 같은 나의 전생이에요.",
    en: "Random opens a new parallel world each time. Your birthday always gives the same past life.",
    ja: "ランダムは毎回別の並行世界、誕生日はいつ来ても同じ前世です。",
    zh: "随机每次都是不同的平行世界，生日则每次都是同一个前世。",
    fr: "Le hasard ouvre un monde parallèle à chaque fois ; votre date de naissance donne toujours la même vie.",
    es: "El azar abre un mundo paralelo cada vez; tu cumpleaños siempre da la misma vida.",
  },
  birthLabel: { ko: "생년월일", en: "Date of birth", ja: "生年月日", zh: "出生日期", fr: "Date de naissance", es: "Fecha de nacimiento" },
  birthGo: { ko: "나의 전생 확인", en: "Reveal my past life", ja: "わたしの前世を見る", zh: "查看我的前世", fr: "Révéler ma vie passée", es: "Ver mi vida pasada" },
  birthNote: {
    ko: "생일은 결과를 고정하는 데만 쓰고 이 브라우저에만 저장해요. 공유 링크에는 들어가지 않아요.",
    en: "Your birthday only fixes the draw. It stays in this browser and is never put in the share link.",
    ja: "誕生日は結果の固定にだけ使い、このブラウザにのみ保存します。共有リンクには入りません。",
    zh: "生日只用于固定结果，只保存在此浏览器，不会放进分享链接。",
    fr: "La date ne sert qu'à fixer le tirage, reste dans ce navigateur et n'apparaît jamais dans le lien.",
    es: "La fecha solo fija el sorteo, se queda en este navegador y nunca va en el enlace.",
  },
  warping: { ko: "시간을 거슬러 가는 중", en: "Travelling through time", ja: "時をさかのぼっています", zh: "正在穿越时空", fr: "Voyage dans le temps", es: "Viajando en el tiempo" },
  save: { ko: "신분증 이미지로 저장", en: "Save as an image", ja: "画像で保存", zh: "保存为图片", fr: "Enregistrer l'image", es: "Guardar imagen" },
  saved: { ko: "저장했어요", en: "Saved", ja: "保存しました", zh: "已保存", fr: "Enregistré", es: "Guardado" },
  friendBanner: {
    ko: "친구가 보낸 결과예요. 나도 뽑으면 둘을 비교해 드려요.",
    en: "A friend sent you this result. Draw yours to compare.",
    ja: "友だちから届いた結果です。自分も引くと比べられます。",
    zh: "这是朋友发来的结果。你也抽一次就能比较。",
    fr: "Un ami vous a envoyé ce résultat. Tirez le vôtre pour comparer.",
    es: "Un amigo te envió este resultado. Saca el tuyo para comparar.",
  },
  compare: { ko: "친구와 비교", en: "You vs your friend", ja: "友だちと比較", zh: "与朋友比较", fr: "Vous et votre ami", es: "Tú y tu amigo" },
  sameFate: { ko: "둘이 같은 결과예요. 같은 시대, 같은 자리에서 만났겠네요.", en: "You got the same result: you would have met there.", ja: "同じ結果です。同じ時代、同じ場所で会っていたかも。", zh: "你们结果相同，也许曾在同一时代相遇。", fr: "Même résultat : vous vous seriez croisés.", es: "El mismo resultado: os habríais cruzado." },
  you: { ko: "나", en: "You", ja: "わたし", zh: "我", fr: "Vous", es: "Tú" },
  friend: { ko: "친구", en: "Friend", ja: "友だち", zh: "朋友", fr: "Ami", es: "Amigo" },
  rarerMe: { ko: "내 운명이 더 드물어요.", en: "Your fate is the rarer one.", ja: "わたしの運命のほうが珍しい。", zh: "我的命运更稀有。", fr: "Votre destin est le plus rare.", es: "Tu destino es el más raro." },
  rarerFriend: { ko: "친구의 운명이 더 드물어요.", en: "Your friend's fate is rarer.", ja: "友だちの運命のほうが珍しい。", zh: "朋友的命运更稀有。", fr: "Le destin de votre ami est plus rare.", es: "El destino de tu amigo es más raro." },
  rarerSame: { ko: "둘의 확률이 같아요.", en: "Same odds for both of you.", ja: "二人とも同じ確率です。", zh: "两人的概率相同。", fr: "Mêmes chances pour vous deux.", es: "Las mismas probabilidades." },
  series: { ko: "타임슬립 시리즈 도장판", en: "Time-slip series stamps", ja: "タイムスリップ・シリーズのスタンプ", zh: "时空穿越系列印章", fr: "Tampons de la série", es: "Sellos de la serie" },
  done: { ko: "도장 받음", en: "Stamped", ja: "スタンプ済み", zh: "已盖章", fr: "Tamponné", es: "Sellado" },
  next: { ko: "다음 여행", en: "Next trip", ja: "次の旅", zh: "下一站", fr: "Prochain voyage", es: "Próximo viaje" },
  allDone: { ko: "모든 시대를 다녀왔어요. 시간여행자 인증!", en: "Every era visited. Certified time traveller!", ja: "すべての時代を巡りました。時間旅行者に認定！", zh: "所有时代都去过了。认证时间旅行者！", fr: "Toutes les époques visitées. Voyageur du temps certifié !", es: "Todas las épocas visitadas. ¡Viajero del tiempo certificado!" },
  lives: { ko: "나의 평행 인생 연표 보기", en: "See my parallel-lives timeline", ja: "わたしの並行人生年表を見る", zh: "查看我的平行人生年表", fr: "Voir ma frise des vies parallèles", es: "Ver mi línea de vidas paralelas" },
  reincarnation: { ko: "다음 생엔 어느 나라에서 태어날까?", en: "Where will you be born next life?", ja: "来世はどの国に生まれる？", zh: "下辈子会出生在哪个国家？", fr: "Où renaîtrez-vous ?", es: "¿Dónde nacerás en tu próxima vida?" },
} satisfies Record<string, Six>;

const RARITY: Record<Rarity, { label: Six; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  legendary: { label: { ko: "전설", en: "Legendary", ja: "伝説", zh: "传说", fr: "Légendaire", es: "Legendario" }, variant: "destructive" },
  rare: { label: { ko: "희귀", en: "Rare", ja: "レア", zh: "稀有", fr: "Rare", es: "Raro" }, variant: "default" },
  uncommon: { label: { ko: "드묾", en: "Uncommon", ja: "珍しい", zh: "少见", fr: "Peu commun", es: "Poco común" }, variant: "secondary" },
  common: { label: { ko: "흔함", en: "Common", ja: "よくある", zh: "常见", fr: "Commun", es: "Común" }, variant: "outline" },
};

export const rarityLabel = (n: number, l: L) => pick(RARITY[rarityTier(n)].label, l);

export const EPISODE_LABELS: Record<EpisodeId, { icon: string; label: Six }> = {
  "sillok-name-hanja": { icon: "🖋️", label: { ko: "실록 속 내 이름 한자", en: "My name in the 1426 Annals", ja: "実録の中の私の名前の漢字", zh: "实录里我名字的汉字", fr: "Mon nom dans les Annales de 1426", es: "Mi nombre en los Anales de 1426" } },
  "night-sky-1426": { icon: "🌌", label: { ko: "내 생일 밤 1426 하늘", en: "The 1426 sky on my birthday", ja: "誕生日の夜の1426年の空", zh: "生日那晚的1426年星空", fr: "Le ciel de 1426 à mon anniversaire", es: "El cielo de 1426 en mi cumpleaños" } },
  "gyeonggongjang": { icon: "🔨", label: { ko: "경공장 장적 속 나", en: "Me in the royal artisan register", ja: "京工匠の匠籍の中の私", zh: "京工匠匠籍里的我", fr: "Moi, artisan royal de Joseon", es: "Yo, artesano real de Joseon" } },
  "joseon-time": { icon: "🕰️", label: { ko: "지금 시각을 조선 시각으로", en: "Now, in Joseon time", ja: "今を朝鮮の時刻で", zh: "此刻的朝鲜时刻", fr: "Maintenant, à l'heure de Joseon", es: "Ahora, en hora de Joseon" } },
  "future-2626": { icon: "🏛️", label: { ko: "2626 미래 박물관 속 내 물건", en: "Your things in a museum, 2626", ja: "2626年の博物館の私の物", zh: "2626年博物馆里的我的东西", fr: "Vos affaires au musée en 2626", es: "Tus cosas en un museo en 2626" } },
  "joseon-names": { icon: "🖌️", label: { ko: "조선 시대 내 이름 짓기", en: "My names in Joseon Korea", ja: "朝鮮時代の私の名前", zh: "我在朝鲜时代的名字", fr: "Mes noms dans la Corée de Joseon", es: "Mis nombres en la Corea de Joseon" } },
  "jinshin-1872": { icon: "🏮", label: { ko: "1872 임신호적 속 우리 집", en: "Your household in the 1872 Jinshin koseki", ja: "壬申戸籍の中のわが家", zh: "1872年壬申户籍里的我家", fr: "Votre foyer au koseki Jinshin de 1872", es: "Tu hogar en el koseki Jinshin de 1872" } },
  "huangce-1391": { icon: "📒", label: { ko: "1391 명나라 황책 속 우리 집", en: "Your household in the 1391 Ming Yellow Register", ja: "1391年明の黄冊の中のわが家", zh: "1391年明代黄册里的我家", fr: "Votre foyer au registre jaune Ming de 1391", es: "Tu hogar en el registro amarillo Ming de 1391" } },
  "census-1911": { icon: "📜", label: { ko: "1911 영국 센서스 속 나", en: "You in the 1911 census", ja: "1911年英国国勢調査の中の私", zh: "1911年英国人口普查中的我", fr: "Vous au recensement anglais de 1911", es: "Tú en el censo inglés de 1911" } },
  "ellis-1907": { icon: "🚢", label: { ko: "1907 엘리스섬 승객 명부 속 나", en: "You on a 1907 Ellis Island manifest", ja: "1907年エリス島の乗客名簿の中の私", zh: "1907年埃利斯岛乘客名单中的我", fr: "Vous à Ellis Island en 1907", es: "Tú en Ellis Island en 1907" } },
  "birthday-calendars": { icon: "📅", label: { ko: "내 생일, 옛 달력 7개로", en: "My birthday in 7 old calendars", ja: "誕生日を7つの暦で", zh: "我的生日，7种历法", fr: "Mon anniversaire en 7 calendriers", es: "Mi cumpleaños en 7 calendarios" } },
  "hoebinghwan-1789": { icon: "🌀", label: { ko: "회빙환 시뮬레이터", en: "Isekai simulator: 1789", ja: "転生シミュレーター 1789", zh: "穿越模拟器 1789", fr: "Simulateur d'isekai : 1789", es: "Simulador isekai: 1789" } },
  "domesday-1086": { icon: "📖", label: { ko: "1086 둠즈데이 북 속 나", en: "You in Domesday Book, 1086", ja: "1086年ドゥームズデイ・ブックの中の私", zh: "1086年末日审判书中的我", fr: "Vous dans le Domesday Book (1086)", es: "Tú en el Domesday Book (1086)" } },
  "census-1850": { icon: "🗽", label: { ko: "1850 미국 센서스 속 나", en: "You in the 1850 U.S. census", ja: "1850年アメリカ国勢調査の中の私", zh: "1850年美国普查中的我", fr: "Vous dans le recensement américain de 1850", es: "Tú en el censo de EE. UU. de 1850" } },
  "ninbetsu-edo": { icon: "🏯", label: { ko: "에도 인별장 속 나", en: "You in an Edo temple register", ja: "江戸の人別帳の中の私", zh: "江户人别帐中的我", fr: "Vous dans un registre d'Edo", es: "Tú en un registro de Edo" } },
  "tongsinsa-1763": { icon: "⛵", label: { ko: "조선통신사 일행 속 나", en: "You in the 1763 embassy to Japan", ja: "朝鮮通信使一行の中の私", zh: "朝鲜通信使团中的我", fr: "Vous dans l'ambassade de 1763", es: "Tú en la embajada de 1763" } },
  "banchado-1795": { icon: "🐎", label: { ko: "1795 화성 행차 반차도 속 나", en: "You in the 1795 royal procession", ja: "1795年 華城行幸の班次図の中の私", zh: "1795华城行幸班次图中的我", fr: "Vous dans le cortège royal de 1795", es: "Tú en el cortejo real de 1795" } },
  "gwageo-1426": { icon: "📜", label: { ko: "과거시험 보러 가기", en: "Sit the 1426 civil exam", ja: "科挙を受けに行く", zh: "去考科举", fr: "Passer l'examen de 1426", es: "Presentar el examen de 1426" } },
  "lunch-1426": { icon: "🍚", label: { ko: "오늘 점심을 600년 전으로", en: "Your lunch in 1426", ja: "今日のランチを600年前へ", zh: "把午餐带回600年前", fr: "Votre déjeuner en 1426", es: "Tu almuerzo en 1426" } },
  "sillok-1426": { icon: "📖", label: { ko: "내 생일의 실록", en: "Your birthday in the 1426 annals", ja: "誕生日の実録", zh: "我生日那天的实录", fr: "Votre anniversaire en 1426", es: "Tu cumpleaños en 1426" } },
  "hometown-1426": { icon: "🗺️", label: { ko: "내 동네는 600년 전 어느 고을?", en: "Your town in 1432 Joseon", ja: "600年前、わが町はどの郡県？", zh: "600年前我家乡是哪个郡县？", fr: "Votre ville dans la Corée de 1432", es: "Tu ciudad en la Corea de 1432" } },
  "ancestors-1426": { icon: "🌳", label: { ko: "600년 전 내 조상은 몇 명?", en: "How many ancestors in 1426?", ja: "600年前の祖先は何人？", zh: "600年前我有多少祖先？", fr: "Combien d'ancêtres en 1426 ?", es: "¿Cuántos antepasados en 1426?" } },
  "silla-golpum": { icon: "🏛️", label: { ko: "1300년 전 신라의 나 (골품)", en: "You in Silla: bone rank", ja: "新羅のわたし（骨品）", zh: "新罗的我（骨品）", fr: "Vous à Silla : rang d'os", es: "Tú en Silla: rango de hueso" } },
  "joseon-1789": { icon: "📜", label: { ko: "1789년 호적 속 나", en: "You in Joseon's 1789 register", ja: "1789年戸籍の中のわたし", zh: "1789年户籍里的我", fr: "Vous au registre de 1789", es: "Tú en el registro de 1789" } },
  "france-1789": { icon: "🇫🇷", label: { ko: "1789년 프랑스의 나", en: "You in France, 1789", ja: "1789年フランスのわたし", zh: "1789年法国的我", fr: "Vous en 1789", es: "Tú en Francia, 1789" } },
  "joseon-1426": { icon: "🏯", label: { ko: "600년 전 조선의 나", en: "You in Joseon, 1426", ja: "1426年朝鮮のわたし", zh: "1426年朝鲜的我", fr: "Vous à Joseon, 1426", es: "Tú en Joseon, 1426" } },
  "europe-1426": { icon: "👑", label: { ko: "600년 전 유럽의 왕좌", en: "Your throne in 1426 Europe", ja: "1426年欧州の玉座", zh: "1426年欧洲王座", fr: "Votre trône en 1426", es: "Tu trono en 1426" } },
  "us-birth-state": { icon: "🇺🇸", label: { ko: "지금 미국에서 태어난다면", en: "Born in the US today", ja: "いまアメリカで生まれたら", zh: "如果今天出生在美国", fr: "Né aux États-Unis aujourd'hui", es: "Nacer hoy en EE. UU." } },
};

// ── Mode tabs + birthday ─────────────────────────────────────────────────────

export function ModeTabs3({ mode, onMode, l, modes = ["random", "birthday", "trait"] }: { mode: Mode; onMode: (m: Mode) => void; l: L; modes?: readonly Mode[] }) {
  return (
    <div className="space-y-2">
      <div className={modes.length === 3 ? "grid grid-cols-3 gap-2" : "grid grid-cols-2 gap-2"} role="tablist">
        {modes.map((m) => (
          <Button key={m} role="tab" aria-selected={mode === m} variant={mode === m ? "default" : "outline"} onClick={() => onMode(m)}>
            {pick(T[m], l)}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{pick(T.modeNote, l)}</p>
    </div>
  );
}

export function BirthdayPicker({ l, onSubmit, cta }: { l: L; onSubmit: (birthday: string) => void; cta?: string }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const saved = readJson<string>(BIRTHDAY_KEY, "");
    if (isValidBirthday(saved)) setValue(saved);
  }, []);
  const ok = isValidBirthday(value);
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <label className="block space-y-2">
        <span className="text-sm font-bold text-foreground">{pick(T.birthLabel, l)}</span>
        <input
          type="date"
          min="1900-01-01"
          max={new Date().toISOString().slice(0, 10)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base"
        />
      </label>
      <Button
        size="lg"
        className="w-full"
        disabled={!ok}
        onClick={() => {
          writeJson(BIRTHDAY_KEY, value);
          onSubmit(value);
        }}
      >
        {cta ?? pick(T.birthGo, l)}
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">{pick(T.birthNote, l)}</p>
    </div>
  );
}

// ── Rarity badge ─────────────────────────────────────────────────────────────

export function RarityBadge({ n, l, fmt }: { n: number; l: L; fmt: Intl.NumberFormat }) {
  const r = RARITY[rarityTier(n)];
  return (
    <div className="flex items-center justify-center gap-2">
      <Badge variant={r.variant}>
        ★ {pick(r.label, l)}
      </Badge>
      <span className="text-xs text-muted-foreground">{oneInText(n, l, fmt)}</span>
    </div>
  );
}

// ── Time warp ────────────────────────────────────────────────────────────────

const WARP_MS = 1300;

/** Counts the year from `from` to `to`, then calls onDone. Skipped when the user prefers reduced motion. */
export function TimeWarp({ from, to, l, onDone }: { from: number; to: number; l: L; onDone: () => void }) {
  const [year, setYear] = useState(from);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      done.current();
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / WARP_MS);
      const eased = 1 - (1 - t) ** 3;
      setYear(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else done.current();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [from, to]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/95 backdrop-blur-sm" role="status" aria-live="polite">
      <p className="text-sm font-bold tracking-widest text-muted-foreground">{pick(T.warping, l)}</p>
      <p className="font-serif text-7xl font-black tabular-nums text-foreground">{year}</p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-full origin-left animate-pulse bg-primary" />
      </div>
    </div>
  );
}

/** Wraps a draw: shows the warp first, then reveals. URL-loaded results never warp. */
export function useWarp() {
  const [pending, setPending] = useState<(() => void) | null>(null);
  return {
    warping: pending !== null,
    start: (reveal: () => void) => setPending(() => reveal),
    finish: () => {
      if (pending) pending();
      setPending(null);
    },
  };
}

// ── Saved ID card (canvas, no DOM screenshot: Tailwind v4 oklch colours break html2canvas) ──

export interface CardSpec {
  kicker: string;
  title: string;
  subtitle?: string;
  lines: string[];
  badge: string;
  footer: string;
  accent: string;
  art?: string;
}

export function renderCard(spec: CardSpec, paper?: HTMLImageElement, artImage?: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 960;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const serif = "'Gowun Batang', 'Noto Serif KR', Georgia, serif";
  // 2026-11-06: fixed parchment colours keep exported results independent of theme.
  ctx.fillStyle = "#efe4cc";
  ctx.fillRect(0, 0, 720, 960);
  if (paper) ctx.drawImage(paper, 0, 0, 720, 960);
  else {
    ctx.strokeStyle = spec.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, 640, 880);
  }

  const hasArt = Boolean(artImage && artImage.naturalWidth > 0 && artImage.naturalHeight > 0);
  if (hasArt && artImage) {
    const boxX = 120, boxY = 90, boxW = 480, boxH = 380;
    const imgRatio = artImage.naturalWidth / artImage.naturalHeight;
    const boxRatio = boxW / boxH;
    let dw = boxW, dh = boxH;
    if (imgRatio > boxRatio) {
      dh = boxW / imgRatio;
    } else {
      dw = boxH * imgRatio;
    }
    const dx = boxX + (boxW - dw) / 2;
    const dy = boxY + (boxH - dh) / 2;
    try {
      ctx.drawImage(artImage, dx, dy, dw, dh);
    } catch {
      /* crossOrigin fallback */
    }
  }

  const lines = layoutCard({ ...spec, hasArt }, (text, size, bold) => {
    ctx.font = `${bold ? 700 : 400} ${size}px ${serif}`;
    return ctx.measureText(text).width;
  });
  ctx.textAlign = "center";
  for (const line of lines) {
    ctx.font = `${line.bold ? 700 : 400} ${line.size}px ${serif}`;
    ctx.fillStyle = line.accent ? spec.accent : "#2b1708";
    ctx.fillText(line.text, line.x, line.y);
  }
  return canvas;
}

export function SaveCard({ l, testId, spec, filename }: { l: L; testId: EpisodeId; spec: CardSpec; filename: string }) {
  const [saved, setSaved] = useState(false);
  const [friendView, setFriendView] = useState<{ friend: CardSpec; mine: boolean } | null>(null);
  useEffect(() => {
    // Only a result the reader drew here goes on their timeline, never a friend's shared link.
    const fresh = freshDraws.has(testId);
    const q = window.location.search;
    if (fresh) {
      recordLife(testId, spec);
      if (q && !LEGACY_COMPARE.has(testId)) rememberOwn(testId, q);
    } else if (q && !isOwn(testId, q) && !friendSpecs.has(testId)) friendSpecs.set(testId, spec);
    // Season 3 #8 (2026-11-22): every episode gets a friend comparison. Episodes with their own
    // rarity-based FriendCompare keep it, so the generic one is skipped there.
    const friend = LEGACY_COMPARE.has(testId) ? undefined : friendSpecs.get(testId);
    setFriendView(friend ? { friend, mine: fresh } : null);
  }, [testId, spec.title, spec.subtitle, spec.kicker]);
  const [failedPaper, setFailedPaper] = useState(false);
  const [failedArt, setFailedArt] = useState(false);
  const paper = TIMESLIP_CARD_ART[testId];
  const paperRef = useRef<HTMLImageElement>(null);
  const artRef = useRef<HTMLImageElement>(null);
  const artSrc = spec.art ? (spec.art.startsWith("/") ? spec.art : TIMESLIP_UI_ROOT + spec.art) : undefined;
  const hasArt = Boolean(artSrc && !failedArt);

  return (
    <div className="space-y-3">
      {friendView && !friendView.mine && <FriendBanner l={l} />}
      {friendView?.mine && <CardCompare l={l} testId={testId} mine={spec} friend={friendView.friend} />}
      {paper && <figure className="space-y-2" data-timeslip-card={testId}>
        <div className="timeslip-card-preview">
          {!failedPaper && <img ref={paperRef} src={TIMESLIP_UI_ROOT + paper} alt="" width={720} height={960}
            loading="lazy" decoding="async" className="timeslip-card-paper" onError={() => setFailedPaper(true)} />}
          {hasArt && <img ref={artRef} src={artSrc} alt="" width={480} height={380}
            loading="lazy" decoding="async" className="timeslip-card-art" onError={() => setFailedArt(true)} />}
          <div className={`timeslip-card-copy ${hasArt ? "has-art" : ""}`}>
            <p>{spec.kicker}</p><strong>{spec.title}</strong>
            {spec.subtitle && <p>{spec.subtitle}</p>}
            <p>{spec.badge}</p>
            {spec.lines.map((line, i) => <p key={i}>{line}</p>)}
            <small>{spec.footer}</small>
          </div>
        </div>
        <figcaption className="text-center text-xs text-muted-foreground">{TIMESLIP_ART_NOTE[l]}</figcaption>
      </figure>}
    <Button
      variant="outline"
      className="w-full"
      onClick={async () => {
        if (document.fonts?.ready) await document.fonts.ready;
        // Reuse the displayed same-origin image; awaiting a new fetch here can
        // expire mobile Web Share activation (2026-11-06). A failed image falls back.
        const paperImage = paperRef.current;
        const artImage = artRef.current;
        const validArt = artImage?.complete && artImage.naturalWidth > 0 ? artImage : undefined;
        const canvas = renderCard(
          spec,
          paperImage?.complete && paperImage.naturalWidth > 0 ? paperImage : undefined,
          validArt
        );
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob) return;
        const file = new File([blob], `${filename}.png`, { type: "image/png" });
        let surface = "download";
        try {
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: spec.title });
            surface = "share";
          } else throw new Error("no share");
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        setSaved(true);
        gaEvent("card_saved", { test_id: testId, share_surface: surface });
      }}
    >
      {pick(saved ? T.saved : T.save, l)}
    </Button>
    </div>
  );
}

// ── Friend comparison ────────────────────────────────────────────────────────

/** A friend's shared result seen in this page session, kept until the reader draws their own. */
const friendSpecs = new Map<EpisodeId, CardSpec>();
const LEGACY_COMPARE = new Set<EpisodeId>(["europe-1426", "france-1789", "joseon-1789", "joseon-1426", "silla-golpum", "us-birth-state"]);

export function CardCompare({ l, testId, mine, friend }: { l: L; testId: EpisodeId; mine: CardSpec; friend: CardSpec }) {
  useEffect(() => {
    gaEvent("friend_compare_view", { test_id: testId });
  }, [testId]);
  const same = mine.title === friend.title && mine.subtitle === friend.subtitle;
  return (
    <section className="rounded-2xl border-2 border-primary/40 bg-card p-5 shadow-sm" data-friend-compare={testId}>
      <h2 className="text-sm font-bold text-muted-foreground">{pick(T.compare, l)}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 text-center">
        {[
          { who: T.you, side: mine },
          { who: T.friend, side: friend },
        ].map(({ who, side }) => (
          <div key={pick(who, l)} className="space-y-1 rounded-xl bg-muted p-3">
            <p className="text-xs font-bold text-muted-foreground">{pick(who, l)}</p>
            <p className="text-lg font-black text-foreground">{side.title}</p>
            {side.subtitle && <p className="text-xs text-muted-foreground">{side.subtitle}</p>}
            {side.lines[0] && <p className="text-xs text-muted-foreground">{side.lines[0]}</p>}
          </div>
        ))}
      </div>
      {same && <p className="mt-3 text-center text-sm font-bold text-foreground">{pick(T.sameFate, l)}</p>}
    </section>
  );
}

/** Remember the query of my own last result so reopening my own link is not treated as a friend's. */
export function rememberOwn(episode: EpisodeId, query: string) {
  const own = readJson<Record<string, string>>(OWN_KEY, {});
  own[episode] = query;
  writeJson(OWN_KEY, own);
}
export function isOwn(episode: EpisodeId, query: string): boolean {
  return readJson<Record<string, string>>(OWN_KEY, {})[episode] === query;
}

export function FriendBanner({ l }: { l: L }) {
  return <p className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm font-bold text-foreground">{pick(T.friendBanner, l)}</p>;
}

export function FriendCompare({
  l,
  fmt,
  testId,
  mine,
  friend,
  verdict,
}: {
  l: L;
  fmt: Intl.NumberFormat;
  testId: EpisodeId;
  mine: { label: string; n: number };
  friend: { label: string; n: number };
  verdict?: string | null;
}) {
  useEffect(() => {
    gaEvent("friend_compare_view", { test_id: testId });
  }, [testId]);
  const rarer = mine.n > friend.n ? T.rarerMe : mine.n < friend.n ? T.rarerFriend : T.rarerSame;
  return (
    <section className="rounded-2xl border-2 border-primary/40 bg-card p-5 shadow-sm">
      <h2 className="text-sm font-bold text-muted-foreground">{pick(T.compare, l)}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 text-center">
        {[
          { who: T.you, side: mine },
          { who: T.friend, side: friend },
        ].map(({ who, side }) => (
          <div key={pick(who, l)} className="space-y-1 rounded-xl bg-muted p-3">
            <p className="text-xs font-bold text-muted-foreground">{pick(who, l)}</p>
            <p className="text-lg font-black text-foreground">{side.label}</p>
            <p className="text-xs text-muted-foreground">
              {rarityLabel(side.n, l)} · {oneInText(side.n, l, fmt)}
            </p>
          </div>
        ))}
      </div>
      {verdict && <p className="mt-3 text-center text-lg font-black text-foreground">{verdict}</p>}
      <p className="mt-2 text-center text-sm text-foreground">{pick(rarer, l)}</p>
    </section>
  );
}

// ── Series stamps + next episode ─────────────────────────────────────────────

const freshDraws = new Set<EpisodeId>();

export function readLives(): Lives {
  return cleanLives(readJson<unknown>(LIVES_KEY, {}));
}
export function recordLife(ep: EpisodeId, spec: CardSpec) {
  const lives = readLives();
  lives[ep] = { ep, title: spec.title, subtitle: spec.subtitle, kicker: spec.kicker, query: window.location.search, accent: spec.accent, at: Date.now() };
  writeJson(LIVES_KEY, lives);
}

export function stampEpisode(episode: EpisodeId) {
  freshDraws.add(episode);
  const stamps = readJson<string[]>(STAMP_KEY, []);
  if (!stamps.includes(episode)) writeJson(STAMP_KEY, [...stamps, episode]);
}

export function SeriesNext({ l, locale, current, round }: { l: L; locale: Locale; current: EpisodeId; round: number }) {
  const [stamps, setStamps] = useState<string[]>([]);
  useEffect(() => {
    setStamps(readJson<string[]>(STAMP_KEY, []));
  }, [current, round]);
  const count = EPISODES.filter((e) => stamps.includes(e)).length;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-muted-foreground">{pick(T.series, l)}</h2>
        <span className="text-sm font-black text-foreground">
          {count}/{EPISODES.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {EPISODES.map((e) => {
          const stamped = stamps.includes(e);
          const info = EPISODE_LABELS[e];
          return (
            <li key={e}>
              <a
                href={localePath(locale, `/${e}`)}
                aria-current={e === current ? "page" : undefined}
                className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 hover:bg-muted"
              >
                <span className="font-bold text-foreground">
                  <span aria-hidden="true">{info.icon}</span> {pick(info.label, l)}
                </span>
                <span className="shrink-0 text-xs font-bold text-muted-foreground">{stamped ? `◉ ${pick(T.done, l)}` : e === current ? "" : `${pick(T.next, l)} →`}</span>
              </a>
            </li>
          );
        })}
        <li>
          <a href={localePath(locale, "/parallel-lives")} className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-primary underline">
            <span aria-hidden="true">🧬</span> {pick(T.lives, l)}
          </a>
        </li>
        <li>
          <a href={localePath(locale, "/reincarnation-country")} className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-primary underline">
            <span aria-hidden="true">🌍</span> {pick(T.reincarnation, l)}
          </a>
        </li>
      </ul>
      {count === EPISODES.length && <p className="mt-3 text-center text-sm font-black text-foreground">{pick(T.allDone, l)}</p>}
    </section>
  );
}
