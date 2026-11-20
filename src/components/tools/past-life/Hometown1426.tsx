import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { gloss } from "../../../data/hometown-1426-gloss";
import {
  COUNTED, ODD_PER_HOUSEHOLD, PRINT_YEAR, PROVINCES, REAL_POP_ESTIMATE, SURVEY_YEAR, TOTAL_PEOPLE, byId, findGoeul, formatHometown,
  inProvince, parseHometown, peopleRank, perHousehold, roughReal, sourceUrl, type Goeul, type HometownQuery, type Match,
} from "../../../lib/hometown-1426";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "hometown-1426" as const;

const PROVINCE: Record<string, Six & { now: Six }> = {
  경도: { ko: "한성(서울)", en: "Hanseong, the capital", ja: "漢城（都）", zh: "汉城（京都）", fr: "Hanseong, la capitale", es: "Hanseong, la capital", now: { ko: "지금의 서울", en: "today's Seoul", ja: "今のソウル", zh: "今首尔", fr: "Séoul actuel", es: "la actual Seúl" } },
  구도: { ko: "개성(옛 도읍)", en: "Gaeseong, the old capital", ja: "開城（旧都）", zh: "开城（旧都）", fr: "Gaeseong, l'ancienne capitale", es: "Gaeseong, la antigua capital", now: { ko: "지금의 개성", en: "today's Kaesong", ja: "今の開城", zh: "今开城", fr: "Kaesong actuel", es: "la actual Kaesong" } },
  경기: { ko: "경기도", en: "Gyeonggi", ja: "京畿道", zh: "京畿道", fr: "Gyeonggi", es: "Gyeonggi", now: { ko: "경기·인천·서울 둘레", en: "Gyeonggi, Incheon", ja: "京畿・仁川", zh: "京畿·仁川", fr: "Gyeonggi, Incheon", es: "Gyeonggi, Incheon" } },
  충청: { ko: "충청도", en: "Chungcheong", ja: "忠清道", zh: "忠清道", fr: "Chungcheong", es: "Chungcheong", now: { ko: "충북·충남·대전·세종", en: "Chungbuk, Chungnam, Daejeon, Sejong", ja: "忠北・忠南・大田・世宗", zh: "忠北·忠南·大田·世宗", fr: "Chungbuk, Chungnam, Daejeon, Sejong", es: "Chungbuk, Chungnam, Daejeon, Sejong" } },
  경상: { ko: "경상도", en: "Gyeongsang", ja: "慶尚道", zh: "庆尚道", fr: "Gyeongsang", es: "Gyeongsang", now: { ko: "경북·경남·부산·대구·울산", en: "Gyeongbuk, Gyeongnam, Busan, Daegu, Ulsan", ja: "慶北・慶南・釜山・大邱・蔚山", zh: "庆北·庆南·釜山·大邱·蔚山", fr: "Gyeongbuk, Gyeongnam, Busan, Daegu, Ulsan", es: "Gyeongbuk, Gyeongnam, Busan, Daegu, Ulsan" } },
  전라: { ko: "전라도", en: "Jeolla", ja: "全羅道", zh: "全罗道", fr: "Jeolla", es: "Jeolla", now: { ko: "전북·전남·광주·제주", en: "Jeonbuk, Jeonnam, Gwangju, Jeju", ja: "全北・全南・光州・済州", zh: "全北·全南·光州·济州", fr: "Jeonbuk, Jeonnam, Gwangju, Jeju", es: "Jeonbuk, Jeonnam, Gwangju, Jeju" } },
  황해: { ko: "황해도", en: "Hwanghae", ja: "黄海道", zh: "黄海道", fr: "Hwanghae", es: "Hwanghae", now: { ko: "북한 황해도", en: "Hwanghae, North Korea", ja: "北朝鮮の黄海道", zh: "朝鲜黄海道", fr: "Hwanghae (Corée du Nord)", es: "Hwanghae (Corea del Norte)" } },
  강원: { ko: "강원도", en: "Gangwon", ja: "江原道", zh: "江原道", fr: "Gangwon", es: "Gangwon", now: { ko: "강원(남·북)", en: "Gangwon, both Koreas", ja: "南北の江原道", zh: "南北江原道", fr: "Gangwon (deux Corées)", es: "Gangwon (ambas Coreas)" } },
  평안: { ko: "평안도", en: "Pyeongan", ja: "平安道", zh: "平安道", fr: "Pyeongan", es: "Pyeongan", now: { ko: "북한 평안도", en: "Pyongan, North Korea", ja: "北朝鮮の平安道", zh: "朝鲜平安道", fr: "Pyongan (Corée du Nord)", es: "Pyongan (Corea del Norte)" } },
  함길: { ko: "함길도", en: "Hamgil", ja: "咸吉道", zh: "咸吉道", fr: "Hamgil", es: "Hamgil", now: { ko: "북한 함경도", en: "Hamgyong, North Korea", ja: "北朝鮮の咸鏡道", zh: "朝鲜咸镜道", fr: "Hamgyong (Corée du Nord)", es: "Hamgyong (Corea del Norte)" } },
};

const RANK: Record<string, Six> = {
  府: { ko: "부", en: "prefecture", ja: "府", zh: "府", fr: "préfecture", es: "prefectura" },
  大都護府: { ko: "대도호부", en: "grand protectorate", ja: "大都護府", zh: "大都护府", fr: "grand protectorat", es: "gran protectorado" },
  都護府: { ko: "도호부", en: "protectorate", ja: "都護府", zh: "都护府", fr: "protectorat", es: "protectorado" },
  牧: { ko: "목", en: "mok (major county)", ja: "牧", zh: "牧", fr: "mok (grand district)", es: "mok (gran distrito)" },
  郡: { ko: "군", en: "county", ja: "郡", zh: "郡", fr: "comté", es: "condado" },
  縣: { ko: "현", en: "district", ja: "県", zh: "县", fr: "district", es: "distrito" },
  留後司: { ko: "유후사", en: "old-capital office", ja: "留後司", zh: "留后司", fr: "office de l'ancienne capitale", es: "oficina de la antigua capital" },
};

const C = {
  searchLabel: { ko: "지금 사는 곳(또는 고향)은?", en: "Where do you live (or come from) in Korea?", ja: "韓国のどこに住んでいますか（出身地）？", zh: "你住在（或来自）韩国哪里？", fr: "Où vivez-vous (ou d'où venez-vous) en Corée ?", es: "¿Dónde vives (o de dónde eres) en Corea?" },
  placeholder: { ko: "예: 포항, 성남시, 전주", en: "In Korean, e.g. 포항, 서울, 전주", ja: "韓国語で 例：포항, 서울", zh: "用韩文，如 포항、서울", fr: "En coréen, ex. 포항, 서울", es: "En coreano, p. ej. 포항, 서울" },
  find: { ko: "고을 찾기", en: "Find my county", ja: "郡県を探す", zh: "查找郡县", fr: "Trouver", es: "Buscar" },
  examples: { ko: "많이 찾는 곳", en: "Try", ja: "例", zh: "例如", fr: "Essayez", es: "Prueba" },
  none: { ko: "'{q}'에 맞는 고을을 못 찾았어요. 시·군 이름으로 다시 찾거나, 아래에서 도를 골라 보세요. 서울의 구 이름은 '서울'로 찾아 주세요.", en: "No county found for '{q}'. Try a city or county name in Korean, or browse by province below.", ja: "「{q}」に合う郡県が見つかりません。市・郡の名前で探すか、下の道から選んでください。", zh: "没有找到与“{q}”对应的郡县。请用市、郡名称搜索，或在下方按道浏览。", fr: "Aucun district pour « {q} ». Essayez un nom de ville en coréen ou parcourez les provinces.", es: "No hay distrito para «{q}». Prueba un nombre de ciudad en coreano o explora por provincia." },
  pickOne: { ko: "여러 고을에 걸쳐 있어요. 하나를 고르세요.", en: "Several counties match. Pick one.", ja: "複数の郡県にまたがります。一つ選んでください。", zh: "对应多个郡县，请选一个。", fr: "Plusieurs districts correspondent : choisissez.", es: "Varios distritos coinciden: elige uno." },
  browse: { ko: "도에서 바로 고르기", en: "Or browse by province", ja: "道から選ぶ", zh: "或按道浏览", fr: "Ou parcourir par province", es: "O explorar por provincia" },
  heroKicker: { ko: "{year}년 무렵, 당신의 동네는", en: "Around {year}, your town was", ja: "{year}年ごろ、あなたの町は", zh: "约{year}年，你的家乡是", fr: "Vers {year}, votre ville était", es: "Hacia {year}, tu ciudad era" },
  via: { ko: "'{q}'은(는) 그때 {list} 땅이었어요. 경계가 지금과 달라 대략 맞춘 거예요.", en: "'{q}' was then the land of {list}. Borders differ, so this is approximate.", ja: "「{q}」は当時{list}の地でした。境界が違うため目安です。", zh: "“{q}”当时属于{list}。边界与今天不同，仅为大致对应。", fr: "« {q} » correspondait alors à {list}. Les limites diffèrent : c'est approximatif.", es: "«{q}» era entonces tierra de {list}. Los límites difieren: es aproximado." },
  nowArea: { ko: "도 범위: {now}", en: "Province today: {now}", ja: "道の範囲：{now}", zh: "道的范围：{now}", fr: "Aujourd'hui : {now}", es: "Hoy: {now}" },
  censusTitle: { ko: "지리지에 적힌 고을 살림", en: "What the gazetteer recorded", ja: "地理志に記された郡県", zh: "地理志记载的郡县", fr: "Ce que note le registre", es: "Lo que anota el registro" },
  households: { ko: "호(戶)", en: "households (戶)", ja: "戸", zh: "户", fr: "foyers (戶)", es: "hogares (戶)" },
  people: { ko: "구(口)", en: "registered people (口)", ja: "口", zh: "口", fr: "personnes inscrites (口)", es: "personas registradas (口)" },
  unreadable: { ko: "판독 불가", en: "unreadable", ja: "判読不能", zh: "无法辨读", fr: "illisible", es: "ilegible" },
  notRecorded: { ko: "기록 없음", en: "not recorded", ja: "記録なし", zh: "未记载", fr: "non noté", es: "no anotado" },
  perHouse: { ko: "한 집에 평균 {x}명", en: "{x} people per household", ja: "一戸あたり平均{x}人", zh: "平均每户{x}人", fr: "{x} personnes par foyer", es: "{x} personas por hogar" },
  odd: { ko: "한 집에 사람이 유난히 많아요. 원문을 옮겨 적다 생긴 오류일 수도 있어요.", en: "Unusually many people per household: possibly a copying error in the text.", ja: "一戸あたりの人数が多すぎます。写本の誤りかもしれません。", zh: "每户人数异常多，可能是传抄错误。", fr: "Nombre inhabituel par foyer : peut-être une erreur de copie.", es: "Demasiadas personas por hogar: quizá un error de copia." },
  rank: { ko: "구(口)가 읽히는 {n}개 고을 중 {r}번째로 사람이 많아요.", en: "Number {r} of {n} counties by registered people.", ja: "口が読める{n}郡県のうち{r}番目に多い。", zh: "在可辨读口数的{n}个郡县中排第{r}。", fr: "{r}e sur {n} districts par nombre d'inscrits.", es: "Puesto {r} de {n} distritos por personas registradas." },
  share: { ko: "지리지 전체 口 {total}명 가운데 {n}명 중 1명이 이 고을 사람이에요.", en: "1 in every {n} of the {total} people in the whole gazetteer.", ja: "地理志全体の口{total}人のうち{n}人に1人がこの郡県の人。", zh: "地理志全部{total}口中，每{n}人有1人属于这里。", fr: "1 sur {n} des {total} inscrits du registre.", es: "1 de cada {n} de las {total} personas del registro." },
  capitalNote: { ko: "한성은 다섯 부(五部)의 호(戶)만 적혀 있고 구(口)는 없어요.", en: "For Hanseong only households of the five wards are given, no head count.", ja: "漢城は五部の戸だけが記され、口はありません。", zh: "汉城只记五部户数，未记口数。", fr: "Pour Hanseong, seuls les foyers des cinq quartiers sont notés.", es: "Para Hanseong solo constan los hogares de los cinco barrios." },
  realTitle: { ko: "실제로는 몇 명이 살았을까?", en: "How many really lived there?", ja: "実際には何人住んでいた？", zh: "实际住了多少人？", fr: "Combien y vivaient vraiment ?", es: "¿Cuántos vivían realmente?" },
  realBody: { ko: "지리지 口를 다 더해도 {total}명인데, 그때 조선 인구는 약 {pop}명으로 추정돼요. 군역을 질 사람 위주로 적어서 여자·아이·노비가 많이 빠졌어요. 모든 고을이 똑같이 빠졌다고 치면 이 고을에는 약 {x}명이 살았을 거예요.", en: "All the gazetteer's head counts add up to {total}, but Joseon had an estimated {pop} people. Registers focused on men liable for service, so many women, children and slaves are missing. If every county was equally under-counted, about {x} people lived here.", ja: "地理志の口を全部足しても{total}人ですが、当時の朝鮮の人口は約{pop}人と推定されます。軍役を負う人中心に記したためです。どの郡県も同じだけ漏れたとすると、ここには約{x}人が住んでいたはずです。", zh: "地理志的口数合计只有{total}人，而当时朝鲜人口估计约{pop}人。登记以服役男子为主，很多女性、儿童和奴婢未计入。若各郡县漏记比例相同，这里约住了{x}人。", fr: "Le registre totalise {total} inscrits, pour une population estimée à {pop}. Il visait surtout les hommes astreints au service : femmes, enfants et esclaves manquent. À sous-comptage égal partout, environ {x} personnes vivaient ici.", es: "El registro suma {total} personas, pero Joseon tenía unos {pop} habitantes. Se anotaba sobre todo a los hombres sujetos a servicio: faltan mujeres, niños y esclavos. Si todos los distritos estuvieran igual de incompletos, aquí vivían unas {x} personas." },
  realNote: { ko: "아주 거친 짐작이에요. 고을마다 빠진 정도는 달랐어요.", en: "A very rough guess: under-counting varied by county.", ja: "とても大まかな推測です。漏れ方は郡県ごとに違いました。", zh: "这只是非常粗略的推测，各郡县漏记程度不同。", fr: "Estimation très grossière : le sous-comptage variait.", es: "Estimación muy aproximada: la omisión variaba." },
  tusanTitle: { ko: "이 고을의 토산(土産)", en: "Local specialties (土産)", ja: "この郡県の土産", zh: "本地土产", fr: "Spécialités locales (土産)", es: "Productos locales (土産)" },
  tusanNote: { ko: "지리지는 귀한 토산만 고을마다 적었어요.", en: "The gazetteer lists only notable local products under each county.", ja: "地理志は珍しい土産だけを郡県ごとに記しました。", zh: "地理志只在各郡县下记载珍贵土产。", fr: "Le registre ne note que les produits remarquables.", es: "El registro anota solo los productos destacados." },
  togongTitle: { ko: "토산 대신, 나라에 바친 토공(土貢)", en: "No specialties listed: tribute instead (土貢)", ja: "土産の代わりに、国に納めた土貢", zh: "未记土产，改看上贡（土贡）", fr: "Pas de spécialités : le tribut (土貢)", es: "Sin productos: el tributo (土貢)" },
  togongNote: { ko: "이 고을은 토산 항목이 없어서, 나라에 바친 물건 앞 다섯 가지를 대신 보여줘요.", en: "This county has no specialties entry, so here are the first five tribute items it paid.", ja: "土産の項目がないため、国に納めた品の最初の5つを示します。", zh: "此郡县没有土产条目，这里列出它上贡物品的前五项。", fr: "Pas d'entrée « spécialités » : voici les cinq premiers tributs.", es: "Sin entrada de productos: estos son los cinco primeros tributos." },
  nothing: { ko: "이 고을은 토산도 토공도 따로 적히지 않았어요.", en: "Neither specialties nor tribute are listed for this county.", ja: "この郡県は土産も土貢も記されていません。", zh: "此郡县既无土产也无土贡记载。", fr: "Ni spécialités ni tribut notés ici.", es: "No constan productos ni tributos." },
  neighborsTitle: { ko: "같은 도에서 사람 많은 고을", en: "Biggest counties in the same province", ja: "同じ道で人の多い郡県", zh: "同道人口最多的郡县", fr: "Plus grands districts de la province", es: "Distritos más grandes de la provincia" },
  you: { ko: "우리 고을", en: "yours", ja: "わが郡県", zh: "你的郡县", fr: "le vôtre", es: "el tuyo" },
  frontier: { ko: "세종 때 북쪽 국경에 새로 둔 고을이라 도 합계 뒤에 덧붙어 있어요.", en: "A frontier county founded under Sejong, appended after the province total.", ja: "世宗の時に北の国境に新設された郡県で、道の合計の後に付け加えられています。", zh: "世宗时在北部边境新设，附在道合计之后。", fr: "District frontalier créé sous Sejong, ajouté après le total provincial.", es: "Distrito fronterizo creado con Sejong, añadido tras el total provincial." },
  sourceLabel: { ko: "『세종실록』 지리지 {v}권 원문(위키문헌)", en: "Sejong Sillok gazetteer, vol. {v} (Wikisource text)", ja: "『世宗実録』地理志 {v}巻（ウィキソース）", zh: "《世宗实录·地理志》卷{v}（维基文库）", fr: "Annales de Sejong, géographie, vol. {v} (Wikisource)", es: "Anales de Sejong, geografía, vol. {v} (Wikisource)" },
  popSource: { ko: "인구 추정: 김재호, 「조선시대의 인구」", en: "Population estimate: Kim Jae-ho (2014)", ja: "人口推計：金在昊（2014）", zh: "人口估计：金在昊（2014）", fr: "Population : Kim Jae-ho (2014)", es: "Población: Kim Jae-ho (2014)" },
  cardKicker: { ko: "{year} · 내 동네는 어느 고을?", en: "{year} · My town in Joseon", ja: "{year}・わが町はどの郡県？", zh: "{year}·我的家乡是哪个郡县？", fr: "{year} · Ma ville à Joseon", es: "{year} · Mi ciudad en Joseon" },
  cardPeople: { ko: "호 {hh} · 구 {pp}", en: "{hh} households · {pp} people", ja: "戸{hh}・口{pp}", zh: "户{hh}·口{pp}", fr: "{hh} foyers · {pp} inscrits", es: "{hh} hogares · {pp} personas" },
  cardRank: { ko: "{n}개 고을 중 {r}위", en: "#{r} of {n} counties", ja: "{n}郡県中{r}位", zh: "{n}个郡县中第{r}", fr: "{r}e sur {n}", es: "n.º {r} de {n}" },
  cardBadge: { ko: "세종실록 지리지", en: "Sejong Sillok gazetteer", ja: "世宗実録地理志", zh: "世宗实录地理志", fr: "Registre de Sejong", es: "Registro de Sejong" },
} satisfies Record<string, Six>;

const EXAMPLES = ["서울", "부산", "포항", "성남", "전주", "제주"];

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

const provinceName = (p: string, l: L) => pick(PROVINCE[p], l);
const rankName = (r: string, l: L) => r.split("、").map((x) => (RANK[x] ? pick(RANK[x], l) : x)).join("·");

/** "경상도 영일현" / "한성부" in Korean; "Yeongil 迎日 (district, Gyeongsang)" style elsewhere. */
function placeName(g: Goeul, l: L): string {
  const rk = g.rk.replace("、", "·");
  if (l === "ko") return g.p === "경도" || g.p === "구도" ? `${g.k} ${rk}` : `${provinceName(g.p, l)} ${g.k}${rk}`;
  if (l === "ja" || l === "zh") return `${provinceName(g.p, l)} ${g.h}${g.r.replace("、", "·")}`;
  return `${g.k} ${g.h}`;
}

function itemLabel(item: string, l: L): string {
  if (l === "ja" || l === "zh") return item;
  const gl = gloss(item);
  if (!gl) return item;
  return `${l === "ko" ? gl.ko : gl.en} ${item}`;
}

function MatchButton({ m, l, onPick }: { m: Match; l: L; onPick: (m: Match) => void }) {
  return (
    <Button variant="outline" className="min-h-11 h-auto justify-start whitespace-normal text-left" onClick={() => onPick(m)}>
      <span>
        <span className="font-bold">{placeName(m.goeul, l)}</span>{" "}
        <span className="text-muted-foreground">{m.goeul.h} · {rankName(m.goeul.r, l)}</span>
      </span>
    </Button>
  );
}

function Neighbors({ g, l, fmt }: { g: Goeul; l: L; fmt: Intl.NumberFormat }) {
  const list = inProvince(g.p).filter((x) => x.pp !== null).sort((a, b) => (b.pp ?? 0) - (a.pp ?? 0));
  const top = list.slice(0, 5);
  const rows = top.some((x) => x.id === g.id) || g.pp === null ? top : [...top, g];
  const max = list[0]?.pp ?? 1;
  return (
    <ol className="space-y-2">
      {rows.map((x) => {
        const mine = x.id === g.id;
        return (
          <li key={x.id} className="space-y-1">
            <div className="flex justify-between gap-2 text-sm">
              <span className={mine ? "font-black text-primary" : "font-bold"}>
                {list.indexOf(x) + 1}. {l === "ja" || l === "zh" ? x.h : `${x.k} ${x.h}`}
                {mine && ` · ${pick(C.you, l)}`}
              </span>
              <span className="tabular-nums text-muted-foreground">{fmt.format(x.pp ?? 0)}</span>
            </div>
            <Progress value={Math.max(2, ((x.pp ?? 0) / max) * 100)} aria-label={`${x.k} ${x.h}`} />
          </li>
        );
      })}
    </ol>
  );
}

export default function Hometown1426({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [searched, setSearched] = useState("");
  const [province, setProvince] = useState<string | null>(null);
  const [query, setQuery] = useState<HometownQuery | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseHometown(window.location.search);
    if (shared) setQuery(shared);
  }, []);

  function choose(m: Match) {
    funnel("pick");
    const next = { id: m.goeul.id, via: m.via };
    warp.start(() => {
      setQuery(next);
      setRound((r) => r + 1);
      setShareQuery(formatHometown(next));
      stampEpisode(EP);
    });
  }

  function search(q: string) {
    setText(q);
    const found = findGoeul(q);
    setSearched(q.trim());
    setMatches(found);
    if (found.length === 1) choose(found[0]);
  }

  const g = query ? byId(query.id) : null;
  const viaList = query?.via ? findGoeul(query.via).filter((m) => m.via !== null || m.goeul.id === query.id) : [];
  const rank = g ? peopleRank(g) : null;
  const ph = g ? perHousehold(g) : null;
  const real = g ? roughReal(g) : null;
  const items = g ? (g.t.length ? g.t : g.g) : [];

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={SURVEY_YEAR} l={l} onDone={warp.finish} />}

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            search(text);
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-bold text-foreground">{pick(C.searchLabel, l)}</span>
            <input
              type="search"
              value={text}
              placeholder={pick(C.placeholder, l)}
              onChange={(e) => setText(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base"
            />
          </label>
          <Button type="submit" size="lg" className="w-full" disabled={!text.trim()}>
            {pick(C.find, l)}
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">{pick(C.examples, l)}</span>
          {EXAMPLES.map((x) => (
            <Button key={x} variant="secondary" size="sm" className="min-h-11" onClick={() => search(x)}>
              {x}
            </Button>
          ))}
        </div>
        {matches && matches.length === 0 && <p className="text-sm text-muted-foreground">{fill(pick(C.none, l), { q: searched })}</p>}
        {matches && matches.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-foreground">{pick(C.pickOne, l)}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {matches.map((m) => <MatchButton key={m.goeul.id} m={m} l={l} onPick={choose} />)}
            </div>
          </div>
        )}
        <details className="pt-2" open={province !== null}>
          <summary className="cursor-pointer text-sm font-bold text-foreground">{pick(C.browse, l)}</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROVINCES.map((p) => (
              <Button key={p} variant={p === province ? "default" : "outline"} aria-pressed={p === province} className="min-h-11" onClick={() => setProvince(p)}>
                {provinceName(p, l)}
              </Button>
            ))}
          </div>
          {province && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">{fill(pick(C.nowArea, l), { now: pick(PROVINCE[province].now, l) })}</p>
              <div className="flex flex-wrap gap-2">
                {inProvince(province).map((x) => (
                  <Button key={x.id} variant="outline" size="sm" className="min-h-11" onClick={() => choose({ goeul: x, via: null })}>
                    {l === "ja" || l === "zh" ? x.h : `${x.k} ${x.h}`}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </details>
      </section>

      {g && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{fill(pick(C.heroKicker, l), { year: SURVEY_YEAR })}</p>
            <p className="mt-3 font-serif text-5xl font-black text-foreground">{g.h}</p>
            <p className="mt-2 text-2xl font-black text-primary">{placeName(g, l)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {rankName(g.r, l)} · {provinceName(g.p, l)} · {fill(pick(C.nowArea, l), { now: pick(PROVINCE[g.p].now, l) })}
            </p>
            {query?.via && viaList.length > 0 && (
              <p className="mt-3 text-sm text-foreground">
                {fill(pick(C.via, l), { q: query.via, list: viaList.map((m) => (l === "ja" || l === "zh" ? m.goeul.h : m.goeul.k)).join("·") })}
              </p>
            )}
            {g.f && <p className="mt-2 text-xs text-muted-foreground">{pick(C.frontier, l)}</p>}
          </section>

          <Panel label={pick(C.censusTitle, l)}>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs font-bold text-muted-foreground">{pick(C.households, l)}</p>
                <p className="text-2xl font-black tabular-nums">{g.hh === null ? pick(C.unreadable, l) : fmt.format(g.hh)}</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs font-bold text-muted-foreground">{pick(C.people, l)}</p>
                <p className="text-2xl font-black tabular-nums">{g.pp === null ? pick(g.id === 1 ? C.notRecorded : C.unreadable, l) : fmt.format(g.pp)}</p>
              </div>
            </div>
            {ph !== null && <p className="pt-2">{fill(pick(C.perHouse, l), { x: ph.toFixed(1) })}</p>}
            {ph !== null && ph > ODD_PER_HOUSEHOLD && <p className="text-xs text-muted-foreground">{pick(C.odd, l)}</p>}
            {rank !== null && g.pp !== null && (
              <>
                <p className="text-lg font-bold">{fill(pick(C.rank, l), { n: COUNTED, r: rank })}</p>
                <p>{fill(pick(C.share, l), { total: fmt.format(TOTAL_PEOPLE), n: fmt.format(Math.round(TOTAL_PEOPLE / g.pp)) })}</p>
              </>
            )}
            {g.id === 1 && <p className="text-xs text-muted-foreground">{pick(C.capitalNote, l)}</p>}
          </Panel>

          <Panel label={g.t.length || !g.g.length ? pick(C.tusanTitle, l) : pick(C.togongTitle, l)}>
            {items.length ? (
              <ul className="flex flex-wrap gap-2">
                {items.map((x) => (
                  <li key={x} className="rounded-full border border-border bg-background px-3 py-1 text-sm font-bold">{itemLabel(x, l)}</li>
                ))}
              </ul>
            ) : (
              <p>{pick(C.nothing, l)}</p>
            )}
            <p className="pt-2 text-xs text-muted-foreground">{g.t.length ? pick(C.tusanNote, l) : g.g.length ? pick(C.togongNote, l) : ""}</p>
          </Panel>

          {g.pp !== null && (
            <Panel label={pick(C.neighborsTitle, l)}>
              <Neighbors g={g} l={l} fmt={fmt} />
            </Panel>
          )}

          {real !== null && (
            <Panel label={pick(C.realTitle, l)}>
              <p className="text-3xl font-black tabular-nums">≈ {fmt.format(real)}</p>
              <p>{fill(pick(C.realBody, l), { total: fmt.format(TOTAL_PEOPLE), pop: fmt.format(REAL_POP_ESTIMATE), x: fmt.format(real) })}</p>
              <p className="pt-2 text-xs text-muted-foreground">{pick(C.realNote, l)}</p>
            </Panel>
          )}

          <Sources
            l={l}
            items={[
              { label: fill(pick(C.sourceLabel, l), { v: g.v }), url: sourceUrl(g) },
              { label: pick(C.popSource, l), url: "https://sgsg.hankyung.com/article/2014051670741" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-hometown-1426-${g.id}`}
            spec={{
              kicker: fill(pick(C.cardKicker, l), { year: SURVEY_YEAR }),
              title: `${g.h} ${l === "ja" || l === "zh" ? "" : g.k}`.trim(),
              subtitle: `${provinceName(g.p, l)} · ${rankName(g.r, l)}`,
              badge: pick(C.cardBadge, l),
              lines: [
                fill(pick(C.cardPeople, l), { hh: g.hh === null ? "?" : fmt.format(g.hh), pp: g.pp === null ? "?" : fmt.format(g.pp) }),
                rank !== null ? fill(pick(C.cardRank, l), { n: COUNTED, r: rank }) : "",
                items.slice(0, 3).map((x) => itemLabel(x, l)).join(" · "),
              ].filter(Boolean),
              footer: `oiyo.net · ${SURVEY_YEAR}/${PRINT_YEAR}`,
              accent: "#5b4a2f",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
