import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '../../i18n';
import {
  MEAL_KEYS,
  SEASON_KEYS,
  WEATHER_KEYS,
  filterMenuOptions,
  pickMenuOption,
  pushRecentResult,
  type MealKey,
  type MenuFilters,
  type MenuOption,
  type SeasonKey,
  type WeatherKey,
} from '../../lib/menu-roulette';

type CuisineKey = 'korean' | 'chinese' | 'japanese' | 'western' | 'asian' | 'light' | 'cafe';

interface MenuItem extends MenuOption {
  cuisine: CuisineKey;
  emoji: string;
  names: Record<Locale, string>;
}

const menu = (
  id: string,
  emoji: string,
  cuisine: CuisineKey,
  meals: readonly MealKey[],
  names: Record<Locale, string>,
  seasons?: readonly SeasonKey[],
  weather?: readonly WeatherKey[],
): MenuItem => ({ id, emoji, cuisine, meals, names, seasons, weather });

const MENU_CATALOG: readonly MenuItem[] = [
  menu('kimchi-stew', '🍲', 'korean', ['lunch', 'dinner'], { ko: '김치찌개', en: 'Kimchi stew', ja: 'キムチチゲ', zh: '泡菜汤', fr: 'Ragoût de kimchi', es: 'Estofado de kimchi' }, ['autumn', 'winter'], ['rainy', 'cold']),
  menu('bibimbap', '🍚', 'korean', ['lunch', 'dinner'], { ko: '비빔밥', en: 'Bibimbap', ja: 'ビビンバ', zh: '韩式拌饭', fr: 'Bibimbap', es: 'Bibimbap' }),
  menu('bulgogi', '🥩', 'korean', ['lunch', 'dinner'], { ko: '불고기', en: 'Bulgogi', ja: 'プルコギ', zh: '韩式烤肉', fr: 'Bulgogi', es: 'Bulgogi' }),
  menu('samgyeopsal', '🥓', 'korean', ['dinner', 'lateNight'], { ko: '삼겹살', en: 'Korean pork belly', ja: 'サムギョプサル', zh: '韩式五花肉', fr: 'Poitrine de porc coréenne', es: 'Panceta coreana' }),
  menu('naengmyeon', '🍜', 'korean', ['lunch', 'dinner'], { ko: '냉면', en: 'Cold noodles', ja: '冷麺', zh: '冷面', fr: 'Nouilles froides', es: 'Fideos fríos' }, ['summer'], ['hot']),
  menu('samgyetang', '🍲', 'korean', ['lunch', 'dinner'], { ko: '삼계탕', en: 'Ginseng chicken soup', ja: '参鶏湯', zh: '参鸡汤', fr: 'Soupe de poulet au ginseng', es: 'Sopa de pollo con ginseng' }, ['summer'], ['hot']),
  menu('jjajangmyeon', '🍜', 'chinese', ['lunch', 'dinner'], { ko: '짜장면', en: 'Jjajangmyeon', ja: 'ジャージャー麺', zh: '炸酱面', fr: 'Nouilles jajang', es: 'Fideos jajang' }),
  menu('jjamppong', '🌶️', 'chinese', ['lunch', 'dinner', 'lateNight'], { ko: '짬뽕', en: 'Spicy seafood noodles', ja: 'チャンポン', zh: '韩式辣海鲜面', fr: 'Nouilles épicées aux fruits de mer', es: 'Fideos picantes con mariscos' }, ['autumn', 'winter'], ['rainy', 'cold']),
  menu('mala-tang', '🌶️', 'chinese', ['lunch', 'dinner', 'lateNight'], { ko: '마라탕', en: 'Mala soup', ja: '麻辣湯', zh: '麻辣烫', fr: 'Soupe mala', es: 'Sopa mala' }, ['autumn', 'winter'], ['rainy', 'cold']),
  menu('dim-sum', '🥟', 'chinese', ['lunch', 'dinner'], { ko: '딤섬', en: 'Dim sum', ja: '点心', zh: '点心', fr: 'Dim sum', es: 'Dim sum' }),
  menu('sushi', '🍣', 'japanese', ['lunch', 'dinner'], { ko: '초밥', en: 'Sushi', ja: '寿司', zh: '寿司', fr: 'Sushis', es: 'Sushi' }),
  menu('ramen', '🍜', 'japanese', ['lunch', 'dinner', 'lateNight'], { ko: '라멘', en: 'Ramen', ja: 'ラーメン', zh: '拉面', fr: 'Ramen', es: 'Ramen' }, ['autumn', 'winter'], ['rainy', 'cold']),
  menu('tonkatsu', '🍱', 'japanese', ['lunch', 'dinner'], { ko: '돈카츠', en: 'Tonkatsu', ja: 'とんかつ', zh: '日式炸猪排', fr: 'Tonkatsu', es: 'Tonkatsu' }),
  menu('soba', '🍜', 'japanese', ['lunch', 'dinner'], { ko: '메밀소바', en: 'Soba noodles', ja: 'そば', zh: '荞麦面', fr: 'Nouilles soba', es: 'Fideos soba' }, ['spring', 'summer'], ['hot']),
  menu('pasta', '🍝', 'western', ['lunch', 'dinner'], { ko: '파스타', en: 'Pasta', ja: 'パスタ', zh: '意大利面', fr: 'Pâtes', es: 'Pasta' }),
  menu('steak', '🥩', 'western', ['dinner'], { ko: '스테이크', en: 'Steak', ja: 'ステーキ', zh: '牛排', fr: 'Steak', es: 'Filete' }),
  menu('pizza', '🍕', 'western', ['lunch', 'dinner', 'lateNight'], { ko: '피자', en: 'Pizza', ja: 'ピザ', zh: '披萨', fr: 'Pizza', es: 'Pizza' }),
  menu('burger', '🍔', 'western', ['lunch', 'dinner', 'lateNight'], { ko: '햄버거', en: 'Burger', ja: 'ハンバーガー', zh: '汉堡', fr: 'Burger', es: 'Hamburguesa' }),
  menu('tacos', '🌮', 'western', ['lunch', 'dinner', 'lateNight'], { ko: '타코', en: 'Tacos', ja: 'タコス', zh: '塔可', fr: 'Tacos', es: 'Tacos' }, ['spring', 'summer'], ['clear', 'hot']),
  menu('tteokbokki', '🌶️', 'korean', ['lunch', 'dinner', 'lateNight'], { ko: '떡볶이', en: 'Tteokbokki', ja: 'トッポッキ', zh: '辣炒年糕', fr: 'Tteokbokki', es: 'Tteokbokki' }, ['autumn', 'winter'], ['rainy', 'cold']),
  menu('gimbap', '🍙', 'korean', ['lunch', 'dinner'], { ko: '김밥', en: 'Gimbap', ja: 'キンパ', zh: '紫菜包饭', fr: 'Gimbap', es: 'Gimbap' }, ['spring', 'summer', 'autumn'], ['clear']),
  menu('pho', '🍜', 'asian', ['lunch', 'dinner'], { ko: '쌀국수', en: 'Pho', ja: 'フォー', zh: '越南河粉', fr: 'Phở', es: 'Pho' }, ['autumn', 'winter'], ['rainy', 'cold']),
  menu('pad-thai', '🍜', 'asian', ['lunch', 'dinner'], { ko: '팟타이', en: 'Pad Thai', ja: 'パッタイ', zh: '泰式炒河粉', fr: 'Pad thaï', es: 'Pad thai' }),
  menu('curry', '🍛', 'asian', ['lunch', 'dinner'], { ko: '커리', en: 'Curry', ja: 'カレー', zh: '咖喱饭', fr: 'Curry', es: 'Curry' }, ['autumn', 'winter'], ['rainy', 'cold']),
  menu('poke', '🥗', 'light', ['lunch', 'dinner'], { ko: '포케', en: 'Poke bowl', ja: 'ポケボウル', zh: '夏威夷拌饭', fr: 'Poke bowl', es: 'Poke bowl' }, ['spring', 'summer'], ['clear', 'hot']),
  menu('salad', '🥗', 'light', ['lunch', 'dinner', 'cafe'], { ko: '샐러드', en: 'Salad', ja: 'サラダ', zh: '沙拉', fr: 'Salade', es: 'Ensalada' }, ['spring', 'summer'], ['clear', 'hot']),
  menu('sandwich', '🥪', 'light', ['lunch', 'cafe'], { ko: '샌드위치', en: 'Sandwich', ja: 'サンドイッチ', zh: '三明治', fr: 'Sandwich', es: 'Sándwich' }),
  menu('brunch', '🍳', 'cafe', ['lunch', 'cafe'], { ko: '브런치', en: 'Brunch', ja: 'ブランチ', zh: '早午餐', fr: 'Brunch', es: 'Brunch' }, ['spring', 'summer', 'autumn'], ['clear']),
  menu('croffle', '🧇', 'cafe', ['cafe'], { ko: '크로플', en: 'Croffle', ja: 'クロッフル', zh: '可颂华夫饼', fr: 'Croffle', es: 'Croffle' }),
  menu('cake', '🍰', 'cafe', ['cafe', 'lateNight'], { ko: '케이크와 차', en: 'Cake and tea', ja: 'ケーキと紅茶', zh: '蛋糕配茶', fr: 'Gâteau et thé', es: 'Pastel y té' }, ['spring', 'winter'], ['rainy', 'cold']),
  menu('bingsu', '🍧', 'cafe', ['cafe', 'lateNight'], { ko: '빙수', en: 'Shaved ice', ja: 'かき氷', zh: '刨冰', fr: 'Glace pilée', es: 'Hielo raspado' }, ['summer'], ['hot']),
  menu('hot-chocolate', '☕', 'cafe', ['cafe', 'lateNight'], { ko: '핫초코', en: 'Hot chocolate', ja: 'ホットチョコレート', zh: '热巧克力', fr: 'Chocolat chaud', es: 'Chocolate caliente' }, ['winter'], ['rainy', 'cold']),
  menu('fried-chicken', '🍗', 'korean', ['dinner', 'lateNight'], { ko: '치킨', en: 'Fried chicken', ja: 'フライドチキン', zh: '炸鸡', fr: 'Poulet frit', es: 'Pollo frito' }, ['spring', 'summer', 'autumn'], ['rainy', 'clear']),
];

interface UiLabels {
  title: string;
  subtitle: string;
  meal: string;
  meals: Record<MealKey, string>;
  cuisine: string;
  cuisines: Record<CuisineKey, string>;
  season: string;
  seasons: Record<SeasonKey, string>;
  weather: string;
  weatherOptions: Record<WeatherKey, string>;
  all: string;
  spin: string;
  again: string;
  result: string;
  empty: string;
  available: string;
  treatTitle: string;
  treatLead: string;
}

const L: Record<Locale, UiLabels> = {
  ko: { title: '월급날 메뉴 룰렛', subtitle: '끼니와 오늘의 분위기를 고르면 겹치지 않게 메뉴를 추천해 드려요.', meal: '언제 먹나요?', meals: { lunch: '점심', dinner: '저녁', lateNight: '야식', cafe: '카페' }, cuisine: '음식 종류', cuisines: { korean: '한식', chinese: '중식', japanese: '일식', western: '양식', asian: '아시안', light: '가벼운 메뉴', cafe: '카페' }, season: '계절', seasons: { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' }, weather: '날씨', weatherOptions: { clear: '맑음', rainy: '비', hot: '더움', cold: '추움' }, all: '상관없음', spin: '🎰 메뉴 뽑기', again: '다른 메뉴 뽑기', result: '오늘의 추천', empty: '조건에 맞는 메뉴가 없어요. 필터 하나를 풀어보세요.', available: '추천 후보', treatTitle: '🎁 작은 즐거움', treatLead: '한 끼에 더해 오늘 나에게 줄 작은 선물:' },
  en: { title: 'Payday Menu Roulette', subtitle: 'Choose a meal and today’s mood for a recommendation that avoids recent repeats.', meal: 'When are you eating?', meals: { lunch: 'Lunch', dinner: 'Dinner', lateNight: 'Late-night', cafe: 'Cafe' }, cuisine: 'Cuisine', cuisines: { korean: 'Korean', chinese: 'Chinese', japanese: 'Japanese', western: 'Western', asian: 'Asian', light: 'Light', cafe: 'Cafe' }, season: 'Season', seasons: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' }, weather: 'Weather', weatherOptions: { clear: 'Clear', rainy: 'Rainy', hot: 'Hot', cold: 'Cold' }, all: 'Any', spin: '🎰 Pick a menu', again: 'Pick another', result: "Today's pick", empty: 'No menu matches. Try relaxing one filter.', available: 'choices available', treatTitle: '🎁 A small treat', treatLead: 'A little gift for yourself alongside the meal:' },
  ja: { title: '給料日メニュールーレット', subtitle: '食事の時間と今日の気分を選ぶと、直前と重ならないメニューを提案します。', meal: 'いつ食べますか？', meals: { lunch: 'ランチ', dinner: '夕食', lateNight: '夜食', cafe: 'カフェ' }, cuisine: '料理の種類', cuisines: { korean: '韓国料理', chinese: '中華', japanese: '和食', western: '洋食', asian: 'アジア料理', light: '軽食', cafe: 'カフェ' }, season: '季節', seasons: { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }, weather: '天気', weatherOptions: { clear: '晴れ', rainy: '雨', hot: '暑い', cold: '寒い' }, all: '指定なし', spin: '🎰 メニューを選ぶ', again: '別のメニュー', result: '今日のおすすめ', empty: '条件に合うメニューがありません。フィルターを一つ外してください。', available: '件の候補', treatTitle: '🎁 小さなご褒美', treatLead: '食事と一緒に自分へ贈る小さなプレゼント：' },
  zh: { title: '发薪日菜单转盘', subtitle: '选择用餐时段和今天的氛围，推荐时会尽量避开刚刚出现的结果。', meal: '什么时候吃？', meals: { lunch: '午餐', dinner: '晚餐', lateNight: '夜宵', cafe: '咖啡馆' }, cuisine: '菜系', cuisines: { korean: '韩餐', chinese: '中餐', japanese: '日餐', western: '西餐', asian: '亚洲料理', light: '轻食', cafe: '咖啡甜点' }, season: '季节', seasons: { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }, weather: '天气', weatherOptions: { clear: '晴朗', rainy: '下雨', hot: '炎热', cold: '寒冷' }, all: '不限', spin: '🎰 抽取菜单', again: '换一个', result: '今日推荐', empty: '没有符合条件的菜单，请放宽一个筛选条件。', available: '个候选', treatTitle: '🎁 小小奖励', treatLead: '吃饭之外，今天也送自己一份小礼物：' },
  fr: { title: 'Roulette du menu de paie', subtitle: 'Choisissez le moment et l’ambiance du jour : les résultats récents seront évités.', meal: 'Quand mangez-vous ?', meals: { lunch: 'Déjeuner', dinner: 'Dîner', lateNight: 'En-cas de nuit', cafe: 'Café' }, cuisine: 'Cuisine', cuisines: { korean: 'Coréenne', chinese: 'Chinoise', japanese: 'Japonaise', western: 'Occidentale', asian: 'Asiatique', light: 'Légère', cafe: 'Café' }, season: 'Saison', seasons: { spring: 'Printemps', summer: 'Été', autumn: 'Automne', winter: 'Hiver' }, weather: 'Météo', weatherOptions: { clear: 'Beau temps', rainy: 'Pluie', hot: 'Chaud', cold: 'Froid' }, all: 'Peu importe', spin: '🎰 Choisir un menu', again: 'Autre idée', result: 'Suggestion du jour', empty: 'Aucun menu ne correspond. Retirez un filtre.', available: 'choix disponibles', treatTitle: '🎁 Un petit plaisir', treatLead: 'En plus du repas, un petit cadeau pour vous :' },
  es: { title: 'Ruleta del menú de pago', subtitle: 'Elige el momento y el ambiente de hoy; evitaremos repetir los resultados recientes.', meal: '¿Cuándo comes?', meals: { lunch: 'Almuerzo', dinner: 'Cena', lateNight: 'Tentempié nocturno', cafe: 'Café' }, cuisine: 'Tipo de comida', cuisines: { korean: 'Coreana', chinese: 'China', japanese: 'Japonesa', western: 'Occidental', asian: 'Asiática', light: 'Ligera', cafe: 'Café' }, season: 'Estación', seasons: { spring: 'Primavera', summer: 'Verano', autumn: 'Otoño', winter: 'Invierno' }, weather: 'Clima', weatherOptions: { clear: 'Despejado', rainy: 'Lluvia', hot: 'Calor', cold: 'Frío' }, all: 'Cualquiera', spin: '🎰 Elegir menú', again: 'Elegir otro', result: 'Recomendación de hoy', empty: 'No hay coincidencias. Prueba a quitar un filtro.', available: 'opciones disponibles', treatTitle: '🎁 Un pequeño capricho', treatLead: 'Además de la comida, un pequeño regalo para ti:' },
};

const TREATS: Record<Locale, readonly string[]> = {
  ko: ['좋아하는 디저트 하나', '산책하며 듣고 싶던 음악', '책 한 권', '꽃 한 송이', '친구에게 커피 한 잔'],
  en: ['a favorite dessert', 'a walk with music you love', 'a new book', 'a single flower', 'buy a friend a coffee'],
  ja: ['好きなデザート', '好きな音楽を聴く散歩', '新しい本を一冊', '花を一輪', '友達にコーヒーをごちそう'],
  zh: ['喜欢的甜点', '听着喜欢的音乐散步', '一本新书', '一枝花', '请朋友喝杯咖啡'],
  fr: ['votre dessert préféré', 'une promenade en musique', 'un nouveau livre', 'une fleur', 'un café offert à un ami'],
  es: ['tu postre favorito', 'un paseo con música', 'un libro nuevo', 'una flor', 'invitar a un amigo a un café'],
};

const CUISINE_KEYS = ['korean', 'chinese', 'japanese', 'western', 'asian', 'light', 'cafe'] as const;

interface Props { locale: Locale }

export default function MenuRoulette({ locale }: Props) {
  const t = L[locale];
  const treats = TREATS[locale];
  const [meal, setMeal] = useState<MealKey>('lunch');
  const [cuisine, setCuisine] = useState<CuisineKey | ''>('');
  const [season, setSeason] = useState<SeasonKey | ''>('');
  const [weather, setWeather] = useState<WeatherKey | ''>('');
  const [result, setResult] = useState<MenuItem | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [treat, setTreat] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filters: MenuFilters = { meal, cuisine, season, weather };
  const pool = useMemo(() => filterMenuOptions(MENU_CATALOG, filters), [meal, cuisine, season, weather]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => {
      clearTimer();
      media.removeEventListener('change', update);
    };
  }, [clearTimer]);

  const resetForFilter = useCallback(() => {
    clearTimer();
    setSpinning(false);
    setResult(null);
    setTreat(null);
    setAnnouncement('');
  }, [clearTimer]);

  const finishSpin = useCallback(() => {
    const picked = pickMenuOption(pool, recentIds);
    if (!picked) return;
    setResult(picked);
    setRecentIds((recent) => pushRecentResult(recent, picked.id));
    setTreat(treats[Math.floor(Math.random() * treats.length)] ?? null);
    setSpinning(false);
    setAnnouncement(`${t.result}: ${picked.names[locale]}`);
  }, [locale, pool, recentIds, t.result, treats]);

  const spin = useCallback(() => {
    if (pool.length === 0 || spinning) return;
    clearTimer();
    setSpinning(true);
    setAnnouncement('');

    if (reduceMotion) {
      finishSpin();
      return;
    }

    let ticks = 0;
    timerRef.current = setInterval(() => {
      const preview = pool[Math.floor(Math.random() * pool.length)] ?? null;
      setResult(preview);
      ticks += 1;
      if (ticks >= 10) {
        clearTimer();
        finishSpin();
      }
    }, 80);
  }, [clearTimer, finishSpin, pool, reduceMotion, spinning]);

  const optionClass = (active: boolean) =>
    `min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${
      active ? 'border-green-700 bg-green-700 text-white' : 'border-green-200 bg-white text-green-900 hover:border-green-500'
    }`;

  const choose = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    resetForFilter();
  };

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-green-950">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>

      <div className="mt-6 space-y-5">
        <fieldset>
          <legend className="text-sm font-bold text-green-900">{t.meal}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MEAL_KEYS.map((key) => <button key={key} type="button" aria-pressed={meal === key} className={optionClass(meal === key)} onClick={() => choose(setMeal, key)}>{t.meals[key]}</button>)}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-bold text-green-900">{t.cuisine}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" aria-pressed={!cuisine} className={optionClass(!cuisine)} onClick={() => choose(setCuisine, '')}>{t.all}</button>
            {CUISINE_KEYS.map((key) => <button key={key} type="button" aria-pressed={cuisine === key} className={optionClass(cuisine === key)} onClick={() => choose(setCuisine, key)}>{t.cuisines[key]}</button>)}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-bold text-green-900">{t.season}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" aria-pressed={!season} className={optionClass(!season)} onClick={() => choose(setSeason, '')}>{t.all}</button>
              {SEASON_KEYS.map((key) => <button key={key} type="button" aria-pressed={season === key} className={optionClass(season === key)} onClick={() => choose(setSeason, key)}>{t.seasons[key]}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold text-green-900">{t.weather}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" aria-pressed={!weather} className={optionClass(!weather)} onClick={() => choose(setWeather, '')}>{t.all}</button>
              {WEATHER_KEYS.map((key) => <button key={key} type="button" aria-pressed={weather === key} className={optionClass(weather === key)} onClick={() => choose(setWeather, key)}>{t.weatherOptions[key]}</button>)}
            </div>
          </fieldset>
        </div>
      </div>

      <p className="mt-5 text-sm text-green-700">{pool.length} {t.available}</p>
      <div className="mt-3 min-h-48 rounded-2xl border border-green-200 bg-green-50 p-6 text-center sm:p-8">
        {pool.length === 0 ? (
          <p className="mx-auto max-w-md py-10 font-semibold leading-7 text-amber-800">{t.empty}</p>
        ) : (
          <>
            <div aria-hidden="true" className={`text-6xl ${spinning ? 'motion-safe:animate-pulse' : ''}`}>{result?.emoji ?? '🍽️'}</div>
            <div className="mt-3 min-h-9 text-2xl font-extrabold text-green-950">{result ? result.names[locale] : '—'}</div>
            {result && !spinning && <p className="mt-1 text-sm font-semibold text-green-700">{t.result}</p>}
          </>
        )}
      </div>
      <output className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</output>

      <button type="button" onClick={spin} disabled={spinning || pool.length === 0} className="mt-5 min-h-12 w-full rounded-full bg-green-700 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-60">
        {result ? t.again : t.spin}
      </button>

      {treat && !spinning && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-white p-5">
          <h2 className="text-sm font-bold text-green-900">{t.treatTitle}</h2>
          <p className="mt-1 text-sm text-green-700">{t.treatLead}</p>
          <p className="mt-2 text-lg font-bold text-green-800">{treat}</p>
        </div>
      )}
    </div>
  );
}
