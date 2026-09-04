"use client";

import { Network, Plus, Share2, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CITIES } from "@/lib/ontology/natal/signs";
import { comparisonFromCivil } from "@/lib/symbolic-tradition/circle-input";
import {
  allPairEdges,
  createSymbolicGroupSnapshot,
  decodeSymbolicGroupSnapshot,
  starEdges,
  symbolicGroupFragment,
  type SymbolicGroupParticipant,
} from "@/lib/symbolic-tradition/group-snapshot";
import { readSymbolicShareFragment } from "@/lib/symbolic-tradition/share-artifact";
import { readEncryptedShortShare } from "@/lib/symbolic-tradition/short-share";
import CompatibilityOrbit from "@/components/profile/CompatibilityOrbit";
import { scoreAgainstCenter } from "@/lib/symbolic-tradition/orbit-layout";
import type { CompatibilityLensId, SymbolicComparisonProfile } from "@/lib/symbolic-tradition";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY = {
  ko: {
    title: "우리 원",
    sub: "2명부터 10명까지. 생년월일을 적거나 친구 링크를 넣으면 이 브라우저에서만 원이 그려집니다.",
    me: "나",
    friend: "친구",
    alias: "별칭",
    date: "생년월일",
    time: "시각 · 모르면 비움",
    city: "도시 · 모르면 비움",
    add: "원에 넣기",
    link: "또는 친구 공유 링크",
    need: "원이 그려지려면 2명이 필요합니다.",
    star: "나 중심",
    all: "전체 연결",
    share: "이 원 공유",
    copied: "원 링크를 복사했어요",
    pair: "이 둘",
    help: "서로 돕는 점",
    care: "조심할 점",
    ask: "오늘 물어볼 것",
    noTotal: "모임 총점·순위 없음",
    disclaimer: "전통 상징을 대화 소재로 보는 놀이입니다. 관계의 성공을 예측하지 않습니다.",
    error: "날짜를 확인해 주세요.",
  },
  en: {
    title: "Our circle",
    sub: "Two to ten people. Add a birth date or a friend link. The circle stays in this browser.",
    me: "You",
    friend: "Friend",
    alias: "Nickname",
    date: "Birth date",
    time: "Time · leave blank if unknown",
    city: "City · leave blank if unknown",
    add: "Add to the circle",
    link: "Or a friend share link",
    need: "The circle needs 2 people to draw.",
    star: "Centered on you",
    all: "All links",
    share: "Share this circle",
    copied: "Circle link copied",
    pair: "These two",
    help: "How they help",
    care: "Watch for",
    ask: "Ask today",
    noTotal: "No group total or ranking",
    disclaimer: "A playful reading of traditional symbols. It does not predict a relationship.",
    error: "Check the date.",
  },
  ja: {
    title: "みんなの円",
    sub: "2人から10人まで。生年月日を入れるか友だちのリンクを貼ると、このブラウザの中だけで円が描かれます。",
    me: "わたし",
    friend: "友だち",
    alias: "ニックネーム",
    date: "生年月日",
    time: "時刻 · わからなければ空欄",
    city: "都市 · わからなければ空欄",
    add: "円に入れる",
    link: "または友だちの共有リンク",
    need: "円を描くには2人が必要です。",
    star: "わたし中心",
    all: "すべてのつながり",
    share: "この円を共有",
    copied: "円のリンクをコピーしました",
    pair: "この二人",
    help: "支え合えるところ",
    care: "気をつけるところ",
    ask: "今日たずねてみること",
    noTotal: "総合点・順位はありません",
    disclaimer: "伝統的な象徴を話のきっかけとして楽しむものです。関係の成否を予測するものではありません。",
    error: "日付を確認してください。",
  },
  zh: {
    title: "我们的圆",
    sub: "两人到十人。填写出生日期或粘贴朋友的链接，圆只会画在这个浏览器里。",
    me: "我",
    friend: "朋友",
    alias: "昵称",
    date: "出生日期",
    time: "时间 · 不清楚可留空",
    city: "城市 · 不清楚可留空",
    add: "加入圆中",
    link: "或朋友的分享链接",
    need: "要画出圆需要两个人。",
    star: "以我为中心",
    all: "全部连线",
    share: "分享这个圆",
    copied: "已复制圆的链接",
    pair: "这两位",
    help: "彼此帮得上的地方",
    care: "需要留意的地方",
    ask: "今天可以问问看",
    noTotal: "没有总分与排名",
    disclaimer: "这是把传统象征当作聊天话题的玩法，并不预测关系的成败。",
    error: "请检查日期。",
  },
  fr: {
    title: "Notre cercle",
    sub: "De deux à dix personnes. Saisissez une date de naissance ou collez le lien d'un ami : le cercle reste dans ce navigateur.",
    me: "Moi",
    friend: "Ami",
    alias: "Surnom",
    date: "Date de naissance",
    time: "Heure · laissez vide si inconnue",
    city: "Ville · laissez vide si inconnue",
    add: "Ajouter au cercle",
    link: "Ou le lien partagé d'un ami",
    need: "Il faut deux personnes pour tracer le cercle.",
    star: "Centré sur moi",
    all: "Tous les liens",
    share: "Partager ce cercle",
    copied: "Lien du cercle copié",
    pair: "Ces deux-là",
    help: "Ce qu'ils s'apportent",
    care: "À surveiller",
    ask: "À demander aujourd'hui",
    noTotal: "Ni total ni classement",
    disclaimer: "Une lecture ludique de symboles traditionnels. Elle ne prédit pas une relation.",
    error: "Vérifiez la date.",
  },
  es: {
    title: "Nuestro círculo",
    sub: "De dos a diez personas. Escribe una fecha de nacimiento o pega el enlace de una amistad: el círculo se queda en este navegador.",
    me: "Yo",
    friend: "Amistad",
    alias: "Apodo",
    date: "Fecha de nacimiento",
    time: "Hora · déjalo vacío si no la sabes",
    city: "Ciudad · déjalo vacío si no la sabes",
    add: "Añadir al círculo",
    link: "O el enlace compartido de una amistad",
    need: "Hacen falta dos personas para dibujar el círculo.",
    star: "Centrado en mí",
    all: "Todas las conexiones",
    share: "Compartir este círculo",
    copied: "Enlace del círculo copiado",
    pair: "Estas dos",
    help: "En qué se apoyan",
    care: "Qué vigilar",
    ask: "Qué preguntar hoy",
    noTotal: "Sin total ni clasificación",
    disclaimer: "Una lectura lúdica de símbolos tradicionales. No predice una relación.",
    error: "Revisa la fecha.",
  },
} as const;

const FALLBACK = COPY.en;

const LENS: Record<Lang, Record<CompatibilityLensId, string>> = {
  ko: { "five-elements": "오행", "yin-yang": "음양", "chinese-zodiac": "띠", "sun-sign": "태양궁" },
  en: { "five-elements": "Five elements", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiac", "sun-sign": "Sun sign" },
  ja: { "five-elements": "五行", "yin-yang": "陰陽", "chinese-zodiac": "干支", "sun-sign": "太陽星座" },
  zh: { "five-elements": "五行", "yin-yang": "阴阳", "chinese-zodiac": "生肖", "sun-sign": "太阳星座" },
  fr: { "five-elements": "Cinq éléments", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaque", "sun-sign": "Signe" },
  es: { "five-elements": "Cinco elementos", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaco", "sun-sign": "Signo" },
};

/**
 * 관계별 해설. 렌즈(관점)가 늘어나면 관계 키도 늘어난다.
 *
 * 2026-09-04: `Record<relation, copy>` 평면 맵이었다. 로케일과 무관하게
 * 렌더돼서 ja/zh/fr/es 사용자가 선을 누르면 한국어가 나왔다. 로케일을 바깥에
 * 두어 언어별로 빠진 관계가 드러나게 하고, PairCopy 타입으로 형태를 고정한다.
 *
 * 새 렌즈를 더할 때: 그 렌즈가 낼 수 있는 relation 을 여기 6개 언어에 모두
 * 넣는다. 빠지면 `PAIR[lang][relation] ?? PAIR[lang].distinct` 로 떨어지므로
 * 화면은 깨지지 않지만 해설이 뭉개진다.
 */
interface PairCopy { ask: string; care: string; help: string; label: string }

const PAIR: Record<Lang, Record<`${CompatibilityLensId}:${string}`, PairCopy>> = {
  ko: {
    "five-elements:generating-cycle": { label: "이어지는 생성", help: "한쪽이 피우면 다른 쪽이 키웁니다.", care: "속도가 다르면 답답해질 수 있습니다.", ask: "요즘 내가 너에게 넘기는 일은 뭐야?" },
    "five-elements:controlling-cycle": { label: "서로 조절", help: "한쪽이 과하면 다른 쪽이 줄을 잡습니다.", care: "잔소리로 들릴 수 있습니다.", ask: "내가 너무 말리는 순간이 있어?" },
    "five-elements:same": { label: "같은 기운", help: "같은 리듬이라 말이 잘 통합니다.", care: "같은 약점도 겹칩니다.", ask: "우리 둘 다 미루는 일은?" },
    "chinese-zodiac:same-trine": { label: "같은 삼합", help: "방향이 비슷해 함께 가기 쉽습니다.", care: "밖으로만 향하면 서로를 놓칩니다.", ask: "이번 달에 같이 하고 싶은 건?" },
    "chinese-zodiac:opposite": { label: "마주 보는 축", help: "빈 칸을 서로 채웁니다.", care: "부딪히면 오래갑니다.", ask: "의견이 갈릴 때 우리는 어떻게 쉬어?" },
    "yin-yang:same-balance": { label: "비슷한 음양", help: "속도가 비슷합니다.", care: "둘 다 같은 쪽으로 기울면 치우칩니다.", ask: "요즘 기운이 비슷한가?" },
    "yin-yang:near-balance": { label: "가까운 리듬", help: "조금 다른 박자가 대화를 엽니다.", care: "타이밍을 맞추려다 지칠 수 있습니다.", ask: "누가 먼저 말 거는 편이야?" },
    "yin-yang:contrasting-balance": { label: "대비되는 리듬", help: "한쪽이 밀면 다른 쪽이 받습니다.", care: "서로를 이해하지 못하면 거리로 남습니다.", ask: "내가 너무 빠른가, 느린가?" },
    "sun-sign:same-sign": { label: "같은 별자리", help: "계절이 같습니다.", care: "같은 함정에 같이 빠집니다.", ask: "올해 우리 테마는 뭐로 둘까?" },
    "sun-sign:same-element": { label: "같은 원소", help: "감정의 결이 비슷합니다.", care: "과하면 같이 과합니다.", ask: "요즘 기분을 한 색으로 말하면?" },
    "sun-sign:same-modality": { label: "같은 행동 양식", help: "일을 시작하는 방식이 닮았습니다.", care: "멈추는 타이밍도 겹칩니다.", ask: "우리 둘 다 끝을 못 내는 일은?" },
    "chinese-zodiac:distinct": { label: "다른 결", help: "겹치지 않는 시야가 있습니다.", care: "번역이 필요합니다.", ask: "내가 모르는 네 세계는 뭐야?" },
    "chinese-zodiac:same": { label: "같은 띠", help: "같은 해의 기운이라 서로를 설명할 필요가 적습니다.", care: "닮은 만큼 서로의 버릇도 못 봅니다.", ask: "우리가 서로 안 짚어주는 습관은?" },
    "sun-sign:distinct": { label: "다른 별자리 결", help: "계절도 원소도 달라 시야가 겹치지 않습니다.", care: "당연한 걸 설명해야 할 때가 옵니다.", ask: "너한테는 당연한데 나는 모르는 게 뭐야?" },

  },
  en: {
    "five-elements:generating-cycle": { label: "One feeds the other", help: "One of you starts it, the other grows it.", care: "Different speeds can feel like stalling.", ask: "What am I handing over to you lately?" },
    "five-elements:controlling-cycle": { label: "Mutual check", help: "When one goes too far, the other pulls the rein.", care: "It can land as nagging.", ask: "When do I hold you back too much?" },
    "five-elements:same": { label: "Same current", help: "Same rhythm, so talk comes easily.", care: "The same weak spots overlap too.", ask: "What do we both keep putting off?" },
    "chinese-zodiac:same-trine": { label: "Same trine", help: "Similar direction, easy to move together.", care: "Face outward only and you lose each other.", ask: "What do we want to do together this month?" },
    "chinese-zodiac:opposite": { label: "Facing axis", help: "You fill each other's blanks.", care: "A clash between you lasts.", ask: "How do we take a break when we disagree?" },
    "yin-yang:same-balance": { label: "Similar yin-yang", help: "Your pace is close.", care: "Lean the same way and you both tip.", ask: "Is our energy running alike right now?" },
    "yin-yang:near-balance": { label: "Near rhythm", help: "A slightly different beat opens the conversation.", care: "Chasing each other's timing gets tiring.", ask: "Who usually speaks first?" },
    "yin-yang:contrasting-balance": { label: "Contrasting rhythm", help: "One pushes, the other catches.", care: "Without understanding it stays as distance.", ask: "Am I too fast, or too slow?" },
    "sun-sign:same-sign": { label: "Same sign", help: "You share a season.", care: "You fall into the same traps together.", ask: "What theme should we set for this year?" },
    "sun-sign:same-element": { label: "Same element", help: "Your feelings run in a similar grain.", care: "When it is too much, it is too much for both.", ask: "If today's mood were one colour, which?" },
    "sun-sign:same-modality": { label: "Same modality", help: "You start things the same way.", care: "You also stop at the same moment.", ask: "What do we both fail to finish?" },
    "chinese-zodiac:distinct": { label: "Different grain", help: "You have views that do not overlap.", care: "It needs translating.", ask: "What part of your world do I not know?" },
    "chinese-zodiac:same": { label: "Same zodiac year", help: "The same year-energy, so you explain yourselves less.", care: "Being alike, you miss each other's habits.", ask: "What habit do we never point out to each other?" },
    "sun-sign:distinct": { label: "Different sign grain", help: "Different season and element, so your views do not overlap.", care: "You will have to explain the obvious.", ask: "What is obvious to you that I do not get?" },

  },
  ja: {
    "five-elements:generating-cycle": { label: "つながる生成", help: "片方が咲かせ、もう片方が育てます。", care: "速さが違うともどかしくなります。", ask: "最近わたしがあなたに渡していることは？" },
    "five-elements:controlling-cycle": { label: "たがいに調整", help: "片方が行きすぎると、もう片方が手綱を引きます。", care: "小言に聞こえることがあります。", ask: "わたしが止めすぎる場面はある？" },
    "five-elements:same": { label: "同じ気", help: "同じリズムなので話が通じます。", care: "弱いところも重なります。", ask: "二人とも先延ばしにしていることは？" },
    "chinese-zodiac:same-trine": { label: "同じ三合", help: "向きが似ていて、一緒に進みやすいです。", care: "外にばかり向くと互いを見失います。", ask: "今月いっしょにやりたいことは？" },
    "chinese-zodiac:opposite": { label: "向かい合う軸", help: "たがいの空白を埋めます。", care: "ぶつかると長引きます。", ask: "意見が割れたとき、どう休む？" },
    "yin-yang:same-balance": { label: "似た陰陽", help: "ペースが近いです。", care: "同じ方へ傾くと二人とも偏ります。", ask: "最近、気の流れは似ている？" },
    "yin-yang:near-balance": { label: "近いリズム", help: "少しずれた拍子が会話を開きます。", care: "タイミングを合わせようとして疲れます。", ask: "先に話しかけるのはどちら？" },
    "yin-yang:contrasting-balance": { label: "対照的なリズム", help: "片方が押し、もう片方が受けます。", care: "分かり合えないと距離のまま残ります。", ask: "わたしは速すぎる？ 遅すぎる？" },
    "sun-sign:same-sign": { label: "同じ星座", help: "季節が同じです。", care: "同じ落とし穴に一緒に落ちます。", ask: "今年のテーマは何にする？" },
    "sun-sign:same-element": { label: "同じ元素", help: "感情の手ざわりが似ています。", care: "過ぎるときは二人とも過ぎます。", ask: "今の気分を一色で言うなら？" },
    "sun-sign:same-modality": { label: "同じ行動様式", help: "始め方が似ています。", care: "止まる時も重なります。", ask: "二人とも終わらせられないことは？" },
    "chinese-zodiac:distinct": { label: "違う手ざわり", help: "重ならない視野があります。", care: "翻訳が要ります。", ask: "わたしの知らないあなたの世界は？" },
    "chinese-zodiac:same": { label: "同じ干支", help: "同じ年の気なので、説明しなくても通じます。", care: "似ている分、相手の癖が見えません。", ask: "おたがい指摘しない癖は？" },
    "sun-sign:distinct": { label: "違う星座の質", help: "季節も元素も違い、視野が重なりません。", care: "当たり前を説明する場面が来ます。", ask: "あなたには当然で、わたしが知らないことは？" },

  },
  zh: {
    "five-elements:generating-cycle": { label: "相生相续", help: "一方开花，另一方培育。", care: "步调不同时会觉得憋闷。", ask: "最近我交给你的事情是什么？" },
    "five-elements:controlling-cycle": { label: "彼此约束", help: "一方过头时，另一方拉住缰绳。", care: "听起来可能像唠叨。", ask: "我有拦你拦得太多的时候吗？" },
    "five-elements:same": { label: "同一股气", help: "节奏相同，说话容易通。", care: "弱点也一样重叠。", ask: "我们俩都在拖延的事是什么？" },
    "chinese-zodiac:same-trine": { label: "同一三合", help: "方向相近，容易一起走。", care: "只朝外看就会错过彼此。", ask: "这个月想一起做什么？" },
    "chinese-zodiac:opposite": { label: "相对的轴", help: "彼此填补空白。", care: "一旦冲突会拖很久。", ask: "意见不合时我们怎么休息？" },
    "yin-yang:same-balance": { label: "相近的阴阳", help: "步调相近。", care: "一起偏向同一边就会失衡。", ask: "最近彼此的状态相近吗？" },
    "yin-yang:near-balance": { label: "相近的节奏", help: "稍不同的拍子打开对话。", care: "为了对上节奏容易疲惫。", ask: "通常是谁先开口？" },
    "yin-yang:contrasting-balance": { label: "对比的节奏", help: "一方推，一方接。", care: "不理解就只剩距离。", ask: "我是太快，还是太慢？" },
    "sun-sign:same-sign": { label: "同一星座", help: "季节相同。", care: "会一起掉进同样的坑。", ask: "今年我们的主题定成什么？" },
    "sun-sign:same-element": { label: "同一元素", help: "情绪的质地相近。", care: "过头的时候两个人一起过头。", ask: "如果用一种颜色说最近的心情？" },
    "sun-sign:same-modality": { label: "同一行动方式", help: "开始事情的方式相像。", care: "停下来的时机也重叠。", ask: "我们俩都收不了尾的事是什么？" },
    "chinese-zodiac:distinct": { label: "不同的质地", help: "有彼此不重叠的视野。", care: "需要翻译。", ask: "你有哪一块世界是我不知道的？" },
    "chinese-zodiac:same": { label: "同一生肖", help: "同一年的气，彼此不太需要解释。", care: "越像，越看不见对方的习惯。", ask: "我们从不互相点破的习惯是什么？" },
    "sun-sign:distinct": { label: "不同星座的质地", help: "季节和元素都不同，视野不重叠。", care: "会有需要解释理所当然之事的时候。", ask: "对你理所当然、我却不懂的是什么？" },

  },
  fr: {
    "five-elements:generating-cycle": { label: "L'un nourrit l'autre", help: "L'un lance, l'autre fait grandir.", care: "Des rythmes différents donnent l'impression de piétiner.", ask: "Qu'est-ce que je te passe en ce moment ?" },
    "five-elements:controlling-cycle": { label: "Régulation mutuelle", help: "Quand l'un va trop loin, l'autre tient la bride.", care: "Cela peut sonner comme un reproche.", ask: "Quand est-ce que je te freine trop ?" },
    "five-elements:same": { label: "Même courant", help: "Même rythme : la parole passe facilement.", care: "Les mêmes points faibles se superposent.", ask: "Qu'est-ce qu'on repousse tous les deux ?" },
    "chinese-zodiac:same-trine": { label: "Même trigone", help: "Direction proche, facile d'avancer ensemble.", care: "Tournés seulement vers l'extérieur, vous vous perdez.", ask: "Qu'a-t-on envie de faire ensemble ce mois-ci ?" },
    "chinese-zodiac:opposite": { label: "Axe opposé", help: "Vous comblez les vides de l'autre.", care: "Un heurt entre vous dure longtemps.", ask: "Comment fait-on une pause quand on n'est pas d'accord ?" },
    "yin-yang:same-balance": { label: "Yin-yang proche", help: "Vos allures se ressemblent.", care: "Pencher du même côté vous déséquilibre tous les deux.", ask: "Nos énergies se ressemblent-elles en ce moment ?" },
    "yin-yang:near-balance": { label: "Rythme voisin", help: "Un tempo un peu différent ouvre la conversation.", care: "Vouloir se caler l'un sur l'autre épuise.", ask: "Qui parle en premier, d'habitude ?" },
    "yin-yang:contrasting-balance": { label: "Rythmes contrastés", help: "L'un pousse, l'autre reçoit.", care: "Sans compréhension, cela reste de la distance.", ask: "Suis-je trop rapide, ou trop lent ?" },
    "sun-sign:same-sign": { label: "Même signe", help: "Vous partagez une saison.", care: "Vous tombez ensemble dans les mêmes pièges.", ask: "Quel thème se donne-t-on cette année ?" },
    "sun-sign:same-element": { label: "Même élément", help: "Vos émotions ont un grain semblable.", care: "Quand c'est trop, c'est trop pour les deux.", ask: "Si l'humeur du jour était une couleur ?" },
    "sun-sign:same-modality": { label: "Même modalité", help: "Vous commencez les choses de la même façon.", care: "Vous vous arrêtez au même moment aussi.", ask: "Qu'est-ce qu'on n'arrive ni l'un ni l'autre à finir ?" },
    "chinese-zodiac:distinct": { label: "Grain différent", help: "Vous avez des vues qui ne se recouvrent pas.", care: "Il faut traduire.", ask: "Quelle part de ton monde m'échappe ?" },
    "chinese-zodiac:same": { label: "Même signe chinois", help: "La même énergie d'année : vous vous expliquez moins.", care: "À se ressembler, vous ne voyez plus vos manies.", ask: "Quelle habitude ne se signale-t-on jamais ?" },
    "sun-sign:distinct": { label: "Grain de signe différent", help: "Saison et élément différents : vos vues ne se recouvrent pas.", care: "Il faudra expliquer l'évidence.", ask: "Qu'est-ce qui est évident pour toi et m'échappe ?" },

  },
  es: {
    "five-elements:generating-cycle": { label: "Uno alimenta al otro", help: "Uno lo enciende y el otro lo hace crecer.", care: "Ritmos distintos pueden sentirse como un freno.", ask: "¿Qué te estoy pasando últimamente?" },
    "five-elements:controlling-cycle": { label: "Ajuste mutuo", help: "Cuando uno se pasa, el otro sujeta las riendas.", care: "Puede sonar a regaño.", ask: "¿Cuándo te freno demasiado?" },
    "five-elements:same": { label: "La misma corriente", help: "Mismo ritmo: hablar resulta fácil.", care: "También se solapan los mismos puntos débiles.", ask: "¿Qué estamos dejando para después los dos?" },
    "chinese-zodiac:same-trine": { label: "El mismo trígono", help: "Dirección parecida, fácil avanzar juntos.", care: "Si solo miráis afuera, os perdéis.", ask: "¿Qué queremos hacer juntos este mes?" },
    "chinese-zodiac:opposite": { label: "Eje opuesto", help: "Cada uno llena el hueco del otro.", care: "Un choque entre vosotros dura.", ask: "¿Cómo descansamos cuando no coincidimos?" },
    "yin-yang:same-balance": { label: "Yin-yang parecido", help: "Vuestro paso es similar.", care: "Si os inclináis al mismo lado, los dos os desequilibráis.", ask: "¿Andamos con una energía parecida ahora?" },
    "yin-yang:near-balance": { label: "Ritmo cercano", help: "Un compás algo distinto abre la conversación.", care: "Perseguir el ritmo del otro cansa.", ask: "¿Quién suele hablar primero?" },
    "yin-yang:contrasting-balance": { label: "Ritmos contrastados", help: "Uno empuja y el otro recoge.", care: "Sin entenderlo, queda como distancia.", ask: "¿Voy demasiado rápido o demasiado lento?" },
    "sun-sign:same-sign": { label: "El mismo signo", help: "Compartís una estación.", care: "Caéis juntos en las mismas trampas.", ask: "¿Qué tema le ponemos a este año?" },
    "sun-sign:same-element": { label: "El mismo elemento", help: "Vuestras emociones tienen una textura parecida.", care: "Cuando es demasiado, lo es para los dos.", ask: "Si el ánimo de hoy fuera un color, ¿cuál?" },
    "sun-sign:same-modality": { label: "La misma modalidad", help: "Empezáis las cosas igual.", care: "También paráis en el mismo momento.", ask: "¿Qué no terminamos ninguno de los dos?" },
    "chinese-zodiac:distinct": { label: "Otra textura", help: "Tenéis miradas que no se solapan.", care: "Hace falta traducir.", ask: "¿Qué parte de tu mundo no conozco?" },
    "chinese-zodiac:same": { label: "El mismo signo chino", help: "La misma energía de año: os explicáis menos.", care: "De tan parecidos, no veis las manías del otro.", ask: "¿Qué costumbre nunca nos señalamos?" },
    "sun-sign:distinct": { label: "Otra textura de signo", help: "Estación y elemento distintos: vuestras miradas no se solapan.", care: "Habrá que explicar lo evidente.", ask: "¿Qué es obvio para ti y yo no capto?" },

  },
};

function person(label: string, profile: SymbolicComparisonProfile): SymbolicGroupParticipant {
  return { id: `p-${Math.random().toString(36).slice(2, 8)}`, label: label.trim().slice(0, 24) || "?", profile };
}

export default function CircleGathering({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  // 2026-09-04: `lang === "ko" ? COPY.ko : FALLBACK` 이었다. COPY 에 ko·en 만
  // 있던 시절의 분기라, ja·zh·fr·es 를 채워도 영어가 나갔다. 이제 로케일을
  // 그대로 찾고, 없는 것만 영어로 떨군다.
  const copy = COPY[lang] ?? FALLBACK;
  const [people, setPeople] = useState<SymbolicGroupParticipant[]>([]);
  const [centerId, setCenterId] = useState("");
  const [lens, setLens] = useState<CompatibilityLensId>("five-elements");
  const [view, setView] = useState<"all" | "star">("star");
  const [alias, setAlias] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityId, setCityId] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<null | { from: string; to: string }>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const hash = window.location.hash;
      const group = new URLSearchParams(hash.replace(/^#/, "")).get("group");
      if (group) {
        const snapshot = decodeSymbolicGroupSnapshot(group);
        if (snapshot) {
          setPeople(snapshot.participants);
          setCenterId(snapshot.centerId);
          return;
        }
      }
      const direct = readSymbolicShareFragment(hash);
      let profile: SymbolicComparisonProfile | null = direct?.ok ? direct.artifact.profile : null;
      if (!profile) {
        const share = new URL(window.location.href).searchParams.get("share");
        if (share) {
          const encrypted = await readEncryptedShortShare(share, hash);
          if (encrypted.ok) profile = encrypted.artifact.profile;
        }
      }
      if (profile) setPeople([person(copy.friend, profile)]);
    };
    void boot();
  }, [copy.friend]);

  const snapshot = useMemo(
    () => (people.length >= 2 ? createSymbolicGroupSnapshot(people, { centerId: centerId || people[0]?.id }) : null),
    [centerId, people],
  );
  const edges = snapshot ? (view === "star" ? starEdges(snapshot, lens) : allPairEdges(snapshot, lens)) : [];

  const addByDate = () => {
    try {
      const profile = comparisonFromCivil({ cityId: cityId || undefined, date, time: time || undefined });
      const next = person(alias || copy.friend, profile);
      setPeople((current) => {
        if (current.length >= 10) return current;
        const list = [...current, next];
        if (!centerId) setCenterId(next.id);
        return list;
      });
      setAlias("");
      setDate("");
      setTime("");
      setError("");
    } catch {
      setError(copy.error);
    }
  };

  const addByLink = async () => {
    try {
      const url = new URL(link);
      const direct = readSymbolicShareFragment(url.hash);
      let profile: SymbolicComparisonProfile | null = direct?.ok ? direct.artifact.profile : null;
      if (!profile) {
        const id = url.searchParams.get("share") ?? url.pathname.match(/\/c\/([A-Za-z0-9_-]{22})/)?.[1];
        if (id) {
          const encrypted = await readEncryptedShortShare(id, url.hash);
          if (encrypted.ok) profile = encrypted.artifact.profile;
        }
      }
      if (!profile) throw new Error("bad");
      const next = person(alias || copy.friend, profile);
      setPeople((current) => (current.length >= 10 ? current : [...current, next]));
      setAlias("");
      setLink("");
      setError("");
    } catch {
      setError(copy.error);
    }
  };

  const share = async () => {
    if (!snapshot) return;
    const url = `${window.location.origin}/${locale}/profile/circle/${symbolicGroupFragment(snapshot)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: copy.title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  const positions = people.map((item) => {
    if (item.id === (centerId || people[0]?.id)) return { id: item.id, x: 50, y: 50 };
    const others = people.filter((row) => row.id !== (centerId || people[0]?.id));
    const angle = (Math.PI * 2 * others.findIndex((row) => row.id === item.id)) / Math.max(others.length, 1) - Math.PI / 2;
    return { id: item.id, x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 };
  });
  const at = (id: string) => positions.find((item) => item.id === id) ?? { id, x: 50, y: 50 };
  const pickedEdge = picked && snapshot
    ? snapshot.edges.find((edge) => edge.lens === lens && ((edge.from === picked.from && edge.to === picked.to) || (edge.from === picked.to && edge.to === picked.from)))
    : null;
  const pairCopy = pickedEdge
    ? PAIR[lang][`${pickedEdge.lens}:${pickedEdge.relation}`] ?? PAIR[lang]["sun-sign:distinct"]
    : null;

  const field = "h-12 w-full rounded-2xl border border-border bg-surface-subtle px-4 text-base font-semibold text-foreground";

  return <main>
    <header className="text-center">
      <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">{copy.title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.sub}</p>
    </header>

    {snapshot && <section className="mt-8 rounded-[2rem] border border-border bg-[var(--surface-subtle)] p-4 sm:p-7">
      <div className="flex gap-2 overflow-x-auto pb-1">{(Object.keys(LENS[lang]) as CompatibilityLensId[]).map((id) => (
        <button key={id} type="button" onClick={() => setLens(id)} className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-black ${lens === id ? "bg-primary-strong text-white" : "border border-border bg-card text-foreground"}`}>{LENS[lang][id]}</button>
      ))}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setView("star")} className={`min-h-11 rounded-xl text-xs font-black ${view === "star" ? "bg-accent text-foreground" : "bg-card text-muted-foreground"}`}><Star className="mr-1 inline h-4 w-4" />{copy.star}</button>
        <button type="button" onClick={() => setView("all")} className={`min-h-11 rounded-xl text-xs font-black ${view === "all" ? "bg-accent text-foreground" : "bg-card text-muted-foreground"}`}><Network className="mr-1 inline h-4 w-4" />{copy.all}</button>
      </div>
      <div className="mt-4 aspect-square max-h-[32rem] w-full overflow-hidden rounded-3xl border border-border bg-card">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {edges.map((edge) => {
            const from = at(edge.from);
            const to = at(edge.to);
            return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--primary)" strokeOpacity={0.45 + (edge.harmonyIndex / 100) * 0.55} strokeWidth={0.35 + (edge.harmonyIndex / 100) * 1.15} className="cursor-pointer" onClick={() => setPicked({ from: edge.from, to: edge.to })} />;
          })}
          {positions.map((point) => {
            const who = people.find((item) => item.id === point.id)!;
            const isCenter = point.id === (centerId || people[0]?.id);
            return <g key={point.id} onClick={() => setCenterId(point.id)} className="cursor-pointer">
              <circle cx={point.x} cy={point.y} r={isCenter ? 7 : 5.5} fill={isCenter ? "var(--primary-strong)" : "var(--accent)"} stroke="var(--primary-strong)" strokeWidth="0.6" />
              <text x={point.x} y={point.y + 0.8} textAnchor="middle" fontSize="3" fontWeight="800" fill={isCenter ? "white" : "var(--foreground)"}>{who.label.slice(0, 8)}</text>
            </g>;
          })}
        </svg>
      </div>
      <CompatibilityOrbit
        locale={locale}
        mode="system"
        centerId={centerId || people[0]?.id}
        people={people.map((item) => ({
          id: item.id,
          label: item.label,
          score: scoreAgainstCenter(snapshot.edges, centerId || people[0]?.id, item.id, lens),
        }))}
      />
      {pairCopy && pickedEdge && <article className="mt-4 rounded-3xl bg-card p-4">
        <p className="text-xs font-black uppercase tracking-wider text-primary">{copy.pair} · {pickedEdge.harmonyIndex}</p>
        <h2 className="mt-1 text-lg font-black text-foreground">{pairCopy.label}</h2>
        <p className="mt-2 text-sm"><span className="font-black">{copy.help}.</span> {pairCopy.help}</p>
        <p className="mt-1 text-sm"><span className="font-black">{copy.care}.</span> {pairCopy.care}</p>
        <p className="mt-1 text-sm"><span className="font-black">{copy.ask}.</span> {pairCopy.ask}</p>
      </article>}
      <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{copy.noTotal}</p>
      <button type="button" onClick={() => void share()} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-strong text-sm font-black text-white"><Share2 className="h-4 w-4" />{copy.share}</button>
      {copied && <p className="mt-2 text-center text-xs font-black text-primary">{copy.copied}</p>}
    </section>}

    {!snapshot && <p className="mt-8 rounded-2xl bg-surface-subtle px-4 py-3 text-center text-sm font-bold text-foreground">{copy.need}</p>}

    <ul className="mt-5 space-y-2">{people.map((item) => (
      <li key={item.id} className="flex min-h-12 items-center gap-3 rounded-2xl bg-card px-4">
        <button type="button" onClick={() => setCenterId(item.id)} className="min-w-0 flex-1 truncate text-left text-sm font-black text-foreground">{item.id === centerId ? "◎ " : "○ "}{item.label}</button>
        <button type="button" aria-label="remove" onClick={() => setPeople((current) => current.filter((row) => row.id !== item.id))} className="h-11 w-11 text-muted-foreground"><Trash2 className="mx-auto h-4 w-4" /></button>
      </li>
    ))}</ul>

    {people.length < 10 && <div className="mt-5 space-y-3 rounded-3xl border border-border bg-card p-4">
      <input aria-label={copy.alias} placeholder={copy.alias} value={alias} maxLength={24} onChange={(event) => setAlias(event.target.value)} className={field} />
      <input aria-label={copy.date} type="date" value={date} onChange={(event) => setDate(event.target.value)} className={field} />
      <input aria-label={copy.time} type="time" value={time} onChange={(event) => setTime(event.target.value)} className={field} />
      <select aria-label={copy.city} value={cityId} onChange={(event) => setCityId(event.target.value)} className={field}>
        <option value="">{copy.city}</option>
        {CITIES.map((city) => <option key={city.id} value={city.id}>{city.label[lang]}</option>)}
      </select>
      <button type="button" onClick={addByDate} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-strong text-sm font-black text-white"><Plus className="h-4 w-4" />{copy.add}</button>
      <input aria-label={copy.link} placeholder={copy.link} value={link} onChange={(event) => setLink(event.target.value)} className={field} />
      <button type="button" onClick={() => void addByLink()} className="min-h-11 w-full rounded-2xl border border-primary text-sm font-black text-primary">{copy.link}</button>
      {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
    </div>}

    <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-muted-foreground">{copy.disclaimer}</p>
  </main>;
}
