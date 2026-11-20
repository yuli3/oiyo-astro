/**
 * "1795 화성 행차 반차도 속 나" — find your place among the 1,779 people drawn in the 반차도 of
 * 『원행을묘정리의궤』 (King Jeongjo's 8-day trip to Hwaseong with Lady Hyegyeong, 윤2월 9일 1795).
 *
 * Counts: 1,779 people and 779 horses drawn (Hankook Ilbo 2000-09-08; Munhwa Jeonmun 21), of which the flag
 * bearers number 238 (Hankook) and the mounted band 115 (Hankook), 28 veiled court ladies ride horses, and each
 * of the four palanquins has 11 bearers/attendants front and back (반차도 해설). The rest — officials, guards,
 * soldiers and servants — is the remainder, so the slots always add up to 1,779.
 * 정조 himself is not drawn (only his saddled horse, 좌마), so the king slot is outside the 1,779.
 * Retinue on the lists: about 6,000 people (경기일보 2015). 배다리: 36 boats, 340 m, 11 days (경기일보 2015).
 */

export type Bi = { ko: string; en: string };
export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };

export const DRAWN = 1779;
export const HORSES = 779;
export const RETINUE = 6000;

export type SlotId = "flag" | "band" | "nain" | "gama" | "rest" | "king";
export type Slot = { id: SlotId; n: number; name: Six; does: Six; horse: boolean | null };

const FLAG = 238;
const BAND = 115;
const NAIN = 28;
const GAMA = 4 * 11;

export const SLOTS: Slot[] = [
  {
    id: "flag", n: FLAG, horse: null,
    name: { ko: "깃발 든 군사", en: "Flag bearer", ja: "旗持ちの兵", zh: "擎旗兵", fr: "Porte-étendard", es: "Abanderado" },
    does: { ko: "용기·주작기·백택기 같은 깃발을 들고 행렬 앞을 열어요. 큰 용기 하나는 다섯 명이 함께 들어요.", en: "You carry one of the banners (dragon, vermilion bird, baekttaek…) that open the procession. The great dragon flag takes five men.", ja: "龍旗・朱雀旗・白沢旗などの旗を掲げて行列の先を開きます。大きな龍旗は5人で持ちます。", zh: "举着龙旗、朱雀旗、白泽旗等旗帜开道。大龙旗要五个人一起举。", fr: "Vous portez l'une des bannières (dragon, oiseau vermillon…) qui ouvrent le cortège. Le grand étendard du dragon demande cinq hommes.", es: "Llevas uno de los estandartes (dragón, ave bermellón…) que abren el cortejo. El gran estandarte del dragón requiere cinco hombres." },
  },
  {
    id: "band", n: BAND, horse: true,
    name: { ko: "말 탄 악대(취타대)", en: "Mounted bandsman", ja: "騎馬の楽隊", zh: "骑马乐手", fr: "Musicien à cheval", es: "Músico a caballo" },
    does: { ko: "장용영 소속 악대예요. 말 위에서 대각·북·징·피리·해금을 연주하며 용기 바로 뒤를 따라가요.", en: "Part of the Jangyongyeong band: horn, drum, gong, pipe and fiddle, played on horseback right behind the dragon flag.", ja: "壮勇営の楽隊。馬上で大角・太鼓・鉦・笛・奚琴を奏で、龍旗のすぐ後ろを進みます。", zh: "壮勇营乐队，在马上吹奏大角、击鼓鸣钲、吹笛拉奚琴，紧随龙旗之后。", fr: "Musicien du Jangyongyeong : cor, tambour, gong, flûte et vièle, joués à cheval derrière l'étendard du dragon.", es: "Músico del Jangyongyeong: cuerno, tambor, gong, flauta y violín, tocados a caballo tras el estandarte del dragón." },
  },
  {
    id: "nain", n: NAIN, horse: true,
    name: { ko: "말 탄 나인", en: "Court lady on horseback", ja: "馬に乗る内人", zh: "骑马宫女", fr: "Dame de cour à cheval", es: "Dama de la corte a caballo" },
    does: { ko: "얼굴을 가리개로 가리고 말을 타요. 혜경궁 가마 가까이에서 시중을 들어요. 그림 속 여성은 혜경궁과 두 군주를 빼면 나인 28명이 전부예요.", en: "You ride veiled, close to Lady Hyegyeong's palanquin. Apart from her and two princesses, these 28 are the only women in the picture.", ja: "顔を覆って馬に乗り、恵慶宮の輿のそばで仕えます。絵の女性は恵慶宮と二人の郡主のほかはこの28人だけ。", zh: "遮着面纱骑马，在惠庆宫轿旁侍候。画中女性除惠庆宫和两位郡主外，只有这28名宫女。", fr: "Voilée, à cheval, près du palanquin de Dame Hyegyeong. Hormis elle et deux princesses, ce sont les seules femmes du tableau.", es: "Montas velada junto al palanquín de la dama Hyegyeong. Aparte de ella y dos princesas, son las únicas mujeres del cuadro." },
  },
  {
    id: "gama", n: GAMA, horse: false,
    name: { ko: "가마 곁 수행원", en: "Palanquin attendant", ja: "輿のそばの随行員", zh: "轿旁随从", fr: "Porteur de palanquin", es: "Porteador del palanquín" },
    does: { ko: "가마 네 대(혜경궁, 두 군주, 비어 있는 왕의 가마) 앞뒤에 11명씩 붙어 메고 지켜요. 혜경궁 가마는 이 여행의 한가운데예요.", en: "Eleven of you surround each of the four palanquins (Lady Hyegyeong's, two princesses', and the king's empty one). Hers is the heart of the trip.", ja: "4台の輿（恵慶宮・二人の郡主・空の王の輿）の前後に11人ずつ付いて担ぎ守ります。", zh: "四顶轿子（惠庆宫、两位郡主、空着的王轿）前后各11人抬轿护卫。", fr: "Onze par palanquin, autour des quatre (celui de Dame Hyegyeong, des deux princesses et celui, vide, du roi).", es: "Once por palanquín, alrededor de los cuatro (el de la dama Hyegyeong, los de dos princesas y el del rey, vacío)." },
  },
  {
    id: "rest", n: DRAWN - FLAG - BAND - NAIN - GAMA, horse: null,
    name: { ko: "관원·호위 군사", en: "Official or guard", ja: "官員・護衛の兵", zh: "官员或护卫", fr: "Officier ou garde", es: "Oficial o guardia" },
    does: { ko: "문무백관이 품계 순서대로, 장용영·금군·별군관 같은 호위 부대가 줄지어 가요. 그림에는 실제 부대의 일부만 그렸어요.", en: "Officials in order of rank and guard units (Jangyongyeong, royal guards) march in file. Only part of each real unit is drawn.", ja: "文武百官が品階順に、壮勇営・禁軍などの護衛部隊が列をなして進みます。絵には実際の部隊の一部だけが描かれています。", zh: "文武百官按品级排列，壮勇营、禁军等护卫部队列队而行。画中只画了实际部队的一部分。", fr: "Officiers par rang et unités de garde en file. Le tableau ne montre qu'une partie de chaque unité.", es: "Oficiales por rango y unidades de guardia en fila. El cuadro solo muestra parte de cada unidad." },
  },
  {
    id: "king", n: 1, horse: true,
    name: { ko: "정조 임금", en: "King Jeongjo himself", ja: "正祖その人", zh: "正祖本人", fr: "Le roi Jeongjo lui-même", es: "El propio rey Jeongjo" },
    does: { ko: "반차도에 임금은 그려지지 않아요. 주인 없는 말(좌마)만 그려 자리를 보여 줘요. 그림 속 1,779명 어디에도 내 얼굴은 없어요.", en: "The king is never drawn: only his saddled horse marks his place. Your face is nowhere among the 1,779.", ja: "班次図に王は描かれません。主のいない馬（座馬）だけがその位置を示します。", zh: "班次图中不画国王，只画一匹空鞍马（座马）表示他的位置。", fr: "Le roi n'est jamais dessiné : seul son cheval sellé marque sa place.", es: "El rey nunca se dibuja: solo su caballo ensillado marca su lugar." },
  },
];

export const TOTAL_SLOTS = SLOTS.reduce((s, x) => s + x.n, 0); // 1,780 = 1,779 drawn + the king

export function drawSlot(rand: () => number = Math.random): Slot {
  let r = Math.floor(rand() * TOTAL_SLOTS);
  for (const s of SLOTS) {
    if (r < s.n) return s;
    r -= s.n;
  }
  return SLOTS[SLOTS.length - 2];
}

export const oneIn = (s: Slot) => Math.round(TOTAL_SLOTS / s.n);
export const slotById = (id: string) => SLOTS.find((s) => s.id === id) ?? null;

/** 7박 8일, from 경기일보 2015 day-by-day account. */
export const DAYS: Bi[] = [
  { ko: "창덕궁을 나서 노량 배다리로 한강을 건너 시흥행궁에서 자요.", en: "Leave Changdeokgung, cross the Han on the boat bridge at Noryang, sleep at Siheung." },
  { ko: "낮에 비를 맞으며 걸어 저녁에 화성행궁에 닿아요.", en: "Walk on through midday rain and reach the Hwaseong palace by evening." },
  { ko: "수원향교에 참배하고, 화성에서 특별 과거(별시)가 열려요.", en: "Rites at the Suwon Confucian school; a special exam is held in Hwaseong." },
  { ko: "아침엔 사도세자 묘(현륭원)에 가서 혜경궁이 울고, 오후엔 서장대에서 밤낮 군사 훈련을 해요.", en: "Morning at Crown Prince Sado's tomb, where Lady Hyegyeong weeps; afternoon and night drills at Seojangdae." },
  { ko: "봉수당에서 혜경궁 회갑 잔치가 열려요.", en: "Lady Hyegyeong's sixtieth-birthday banquet at Bongsudang." },
  { ko: "백성에게 쌀을 나눠 주고, 낙남헌에서 노인 384명에게 잔치를 베풀어요.", en: "Rice for the people, and a feast for 384 elders at Naknamheon." },
  { ko: "돌아오는 길, 정조가 고개에서 자꾸 뒤돌아봐 '지지대'라는 이름이 붙어요.", en: "On the way back the king keeps looking behind him from a pass, later named Jijidae." },
  { ko: "시흥행궁에서 하루 더 묵고 한양으로 돌아와요.", en: "One more night at Siheung, then home to Hanyang." },
];

export function formatBanchado(id: SlotId): string {
  return new URLSearchParams({ s: id }).toString();
}

export function parseBanchado(search: string): Slot | null {
  const id = new URLSearchParams(search).get("s");
  return id ? slotById(id) : null;
}
