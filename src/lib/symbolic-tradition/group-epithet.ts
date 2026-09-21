/**
 * 모임에 이름을 붙인다 — "브레이크 없는 폭주기관차" 처럼.
 *
 * 왜 런타임 LLM 이 아닌가. oiyo 는 정적 사이트다. 런타임 생성은 워커·키·비용·
 * 지연을 부르고, 무엇보다 같은 입력에 같은 출력이라는 이 코드베이스의 원칙을
 * 깬다 — 공유 링크로 연 친구가 나와 다른 문구를 본다. 조합도 많지 않다.
 * 기억에 남는 별명은 상태 전체가 아니라 **가장 두드러진 한 가지**에 걸린다.
 *
 * 그래서 축을 하나로 줄였다: 기저 비율에서 가장 크게 벗어난 오행과 그 방향.
 * 어느 쪽으로도 크게 벗어나지 않았으면 flat 이다. 열한 칸 전부 실제로 나온다
 * (1960~2010 에서 9,000 모임, 2~8인):
 *
 *   flat 20.0 · earth+ 12.2 · metal+ 11.3 · wood+ 10.0 · fire+ 8.8 · water+ 8.0
 *   water- 6.8 · metal- 6.5 · fire- 6.4 · earth- 5.7 · wood- 4.3
 *
 * 문구는 강점과 대가를 함께 말한다. 강점만 말하면 아첨이고, 모두에게 같은
 * 칭찬을 하는 것은 관찰이 아니다.
 */
import type { Locale } from "@/i18n";
import { FiveElement } from "../ontology/saju/types";
import { GROUP_ELEMENT_ORDER, type GroupSynthesis } from "./group-synthesis";

/** 이보다 덜 벗어났으면 두드러지는 쪽이 없다고 본다. */
const FLAT_BELOW = 1;

export type GroupEpithetKey =
  | "flat"
  | `${FiveElement}-rich`
  | `${FiveElement}-thin`;

export interface GroupEpithet {
  /** 한 줄 별명 */
  title: string;
  /** 왜 그런지, 그리고 그 대가 */
  line: string;
}

export function groupEpithetKey(synthesis: GroupSynthesis): GroupEpithetKey {
  let peak = GROUP_ELEMENT_ORDER[0];
  for (const element of GROUP_ELEMENT_ORDER) {
    if (Math.abs(synthesis.elements.deviation[element]) > Math.abs(synthesis.elements.deviation[peak])) {
      peak = element;
    }
  }
  const off = synthesis.elements.deviation[peak];
  if (Math.abs(off) < FLAT_BELOW) return "flat";
  return off > 0 ? `${peak}-rich` : `${peak}-thin`;
}

const K = {
  flat: "flat",
  woodRich: `${FiveElement.WOOD}-rich`,
  woodThin: `${FiveElement.WOOD}-thin`,
  fireRich: `${FiveElement.FIRE}-rich`,
  fireThin: `${FiveElement.FIRE}-thin`,
  earthRich: `${FiveElement.EARTH}-rich`,
  earthThin: `${FiveElement.EARTH}-thin`,
  metalRich: `${FiveElement.METAL}-rich`,
  metalThin: `${FiveElement.METAL}-thin`,
  waterRich: `${FiveElement.WATER}-rich`,
  waterThin: `${FiveElement.WATER}-thin`,
} as const;

export const GROUP_EPITHET: Record<Locale, Record<GroupEpithetKey, GroupEpithet>> = {
  ko: {
    [K.flat]: { title: "좋은 게 좋은 사람들", line: "다섯 기운이 고르게 퍼져 누구도 튀지 않아요. 편한 대신, 판을 흔들 사람도 없어요." },
    [K.woodRich]: { title: "일단 벌이고 보는 모임", line: "새 판을 여는 데 거리낌이 없어요. 벌여 놓은 걸 맺어 줄 사람이 필요해요." },
    [K.woodThin]: { title: "시작 버튼이 없는 방", line: "다들 잘하는데 아무도 먼저 안 움직여요. 누가 총대를 멜지 미리 정해 두세요." },
    [K.fireRich]: { title: "브레이크 없는 폭주기관차", line: "불이 세서 금방 달아올라요. 금방 식기도 하니 쉬는 때를 정해 두세요." },
    [K.fireThin]: { title: "불 꺼진 난롯가", line: "차분한데 달아오르는 순간이 잘 안 와요. 분위기를 띄울 사람이 한 명은 필요해요." },
    [K.earthRich]: { title: "웬만해선 안 흔들리는 사람들", line: "무슨 일이 있어도 중심이 잡혀요. 대신 새로 시작할 때를 놓치기 쉬워요." },
    [K.earthThin]: { title: "벌여만 놓고 수습이 없는 모임", line: "아이디어는 넘치는데 받쳐 줄 바닥이 얇아요. 살림을 맡을 사람이 필요해요." },
    [K.metalRich]: { title: "원칙주의자 연합", line: "정리하고 맺는 힘이 확실해요. 서로 날이 서면 오래가니 조심해요." },
    [K.metalThin]: { title: "아무도 끊지 못하는 회의", line: "다들 배려하다 결론이 안 나요. 마무리를 맡을 사람을 정해 두세요." },
    [K.waterRich]: { title: "생각만 하다 밤새우는 모임", line: "깊이 보는 힘이 커요. 대신 결정을 자꾸 미루게 돼요." },
    [K.waterThin]: { title: "일단 지르고 보는 사람들", line: "추진력은 좋은데 한 번 더 생각할 자리가 비어요. 속도를 늦출 사람이 필요해요." },
  },
  en: {
    [K.flat]: { title: "Everyone gets along", line: "All five spread evenly, so nobody sticks out. Comfortable — and nobody to shake the table." },
    [K.woodRich]: { title: "Start first, ask later", line: "No hesitation about opening something new. You need someone to close what you open." },
    [K.woodThin]: { title: "A room with no start button", line: "Everyone is capable and nobody moves first. Decide in advance who takes the lead." },
    [K.fireRich]: { title: "A train with no brakes", line: "The fire runs hot fast — and cools just as fast. Agree on when you rest." },
    [K.fireThin]: { title: "A hearth gone cold", line: "Calm, but the moment rarely catches fire. You need one person to raise the temperature." },
    [K.earthRich]: { title: "Hard to knock over", line: "The centre holds no matter what. The cost is missing the moment to begin." },
    [K.earthThin]: { title: "All opening, no keeping", line: "Ideas everywhere, thin ground beneath them. Someone has to keep house." },
    [K.metalRich]: { title: "The society of principles", line: "Strong at sorting and concluding. Watch the edges — they cut and they last." },
    [K.metalThin]: { title: "A meeting nobody can end", line: "So much consideration that nothing concludes. Name who closes it." },
    [K.waterRich]: { title: "Up all night thinking", line: "Great depth of looking. The cost is decisions that keep sliding." },
    [K.waterThin]: { title: "Act now, think later", line: "Plenty of drive, but the second thought is missing. You need someone who slows it down." },
  },
  ja: {
    [K.flat]: { title: "まあまあで収まる人たち", line: "五つの気が均等で、誰も突出しません。楽な代わりに場を揺らす人もいません。" },
    [K.woodRich]: { title: "とりあえず広げる集まり", line: "新しく始めることに迷いがありません。広げたものを締める人が要ります。" },
    [K.woodThin]: { title: "スタートボタンのない部屋", line: "みな有能なのに誰も先に動きません。誰が先頭に立つか決めておきましょう。" },
    [K.fireRich]: { title: "ブレーキのない暴走機関車", line: "火が強く、すぐ熱くなりすぐ冷めます。休む時を決めておきましょう。" },
    [K.fireThin]: { title: "火の消えた囲炉裏", line: "穏やかですが、盛り上がる瞬間が来にくいです。場を温める人が一人要ります。" },
    [K.earthRich]: { title: "まず揺るがない人たち", line: "何があっても中心が保たれます。その分、始める時機を逃しがちです。" },
    [K.earthThin]: { title: "広げるだけで片づかない集まり", line: "案は溢れるのに支える土台が薄いです。切り盛りする人が要ります。" },
    [K.metalRich]: { title: "原則主義者の連合", line: "整理し締める力が確かです。互いに角が立つと長引くので注意を。" },
    [K.metalThin]: { title: "誰も終われない会議", line: "気遣いばかりで結論が出ません。締める役を決めておきましょう。" },
    [K.waterRich]: { title: "考えるうちに夜が明ける集まり", line: "深く見る力が大きいです。その分、決定を先送りしがちです。" },
    [K.waterThin]: { title: "まず動いてしまう人たち", line: "推進力はありますが、もう一度考える席が空いています。速度を落とす人が要ります。" },
  },
  zh: {
    [K.flat]: { title: "和和气气的一群人", line: "五行分布均匀，谁也不突出。舒服，但也没人来掀桌子。" },
    [K.woodRich]: { title: "先开场再说的组合", line: "开新局毫不犹豫。需要有人来收尾。" },
    [K.woodThin]: { title: "没有启动键的房间", line: "各个都行，却没人先动。先说好谁来带头。" },
    [K.fireRich]: { title: "没有刹车的火车", line: "火旺，热得快也凉得快。先约好什么时候休息。" },
    [K.fireThin]: { title: "熄了火的炉边", line: "沉静，却少了热起来的那一刻。需要有人把气氛带起来。" },
    [K.earthRich]: { title: "轻易撼不动的人们", line: "无论如何中心都稳。代价是容易错过起步的时机。" },
    [K.earthThin]: { title: "只铺开不收拾的组合", line: "点子很多，托底的却薄。需要有人管家。" },
    [K.metalRich]: { title: "原则派联盟", line: "整理与收束的力量很足。彼此起棱角会拖很久，留意。" },
    [K.metalThin]: { title: "没人能结束的会议", line: "都在体谅，结论出不来。指定一个收尾的人。" },
    [K.waterRich]: { title: "想着想着就天亮的组合", line: "看得深。代价是决定一再往后推。" },
    [K.waterThin]: { title: "先做了再说的人们", line: "冲劲够，却少了再想一遍的位置。需要有人把速度放慢。" },
  },
  fr: {
    [K.flat]: { title: "Tout le monde s'entend", line: "Les cinq se répartissent également, personne ne dépasse. Confortable — et personne pour bousculer." },
    [K.woodRich]: { title: "On lance d'abord", line: "Aucune hésitation à ouvrir du neuf. Il faut quelqu'un pour refermer." },
    [K.woodThin]: { title: "Une pièce sans bouton marche", line: "Tous capables, personne ne bouge en premier. Décidez d'avance qui ouvre la marche." },
    [K.fireRich]: { title: "Un train sans freins", line: "Le feu monte vite et retombe aussi vite. Convenez du moment où l'on souffle." },
    [K.fireThin]: { title: "Un âtre éteint", line: "Calme, mais l'étincelle vient rarement. Il faut quelqu'un pour monter la température." },
    [K.earthRich]: { title: "Difficiles à faire vaciller", line: "Le centre tient quoi qu'il arrive. Le prix : manquer le moment de commencer." },
    [K.earthThin]: { title: "On ouvre tout, on ne range rien", line: "Des idées partout, un sol mince dessous. Quelqu'un doit tenir la maison." },
    [K.metalRich]: { title: "La ligue des principes", line: "Fort pour trier et conclure. Attention aux angles : ils coupent et ils durent." },
    [K.metalThin]: { title: "Une réunion que nul ne clôt", line: "Tant d'égards que rien ne se conclut. Nommez qui ferme." },
    [K.waterRich]: { title: "On y pense jusqu'à l'aube", line: "Grande profondeur de regard. Le prix : des décisions qui glissent." },
    [K.waterThin]: { title: "On agit, on pensera après", line: "De l'élan, mais la seconde pensée manque. Il faut quelqu'un qui ralentisse." },
  },
  es: {
    [K.flat]: { title: "Aquí se lleva bien todo el mundo", line: "Los cinco se reparten por igual y nadie destaca. Cómodo, y sin nadie que mueva la mesa." },
    [K.woodRich]: { title: "Primero se empieza, luego se ve", line: "Ninguna duda en abrir algo nuevo. Hace falta quien cierre lo abierto." },
    [K.woodThin]: { title: "Una sala sin botón de arranque", line: "Todos capaces y nadie se mueve primero. Decidid de antemano quién abre paso." },
    [K.fireRich]: { title: "Un tren sin frenos", line: "El fuego sube rápido y baja igual de rápido. Pactad cuándo se descansa." },
    [K.fireThin]: { title: "Un hogar apagado", line: "Calma, pero la chispa rara vez prende. Hace falta alguien que suba la temperatura." },
    [K.earthRich]: { title: "Difíciles de tumbar", line: "El centro aguanta pase lo que pase. El precio: perder el momento de empezar." },
    [K.earthThin]: { title: "Se abre todo y no se recoge nada", line: "Ideas por todas partes y poco suelo debajo. Alguien tiene que llevar la casa." },
    [K.metalRich]: { title: "La liga de los principios", line: "Fuertes para ordenar y concluir. Cuidado con los filos: cortan y duran." },
    [K.metalThin]: { title: "Una reunión que nadie cierra", line: "Tanta consideración que no se concluye. Nombrad a quien cierra." },
    [K.waterRich]: { title: "Pensando hasta el amanecer", line: "Gran hondura de mirada. El precio: decisiones que se aplazan." },
    [K.waterThin]: { title: "Se actúa y luego se piensa", line: "Hay empuje, pero falta el segundo pensamiento. Hace falta quien baje la velocidad." },
  },
};

export function groupEpithet(synthesis: GroupSynthesis, locale: string): GroupEpithet {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Locale;
  return GROUP_EPITHET[lang][groupEpithetKey(synthesis)];
}
