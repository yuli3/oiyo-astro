import { useState } from 'react';

import ExplainLab from '../../shared/ExplainLab';
import ShareResultButton from '../../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import { ARCHETYPES, GUARDIANS, PANTHEONS, castGuardian, type Archetype, type Pantheon } from '@/lib/myth-guardian';
import { recordTestResult } from '@/lib/user/test-results';

// 나의 수호신 찾기. 문항 6개는 다섯 원형 중 하나에 점수를 주고, 마지막 문항이 신화를 고른다.
// 결과 설명은 인물 사전 글의 요약을 그대로 쓰고 글로 잇는다(글을 새로 쓰지 않는다).

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';
export interface Figure { name: string; description: string }

interface Copy {
  start: string; progress: (n: number, total: number) => string; back: string; restart: string;
  resultEyebrow: string; read: string; others: string; shareHeading: string; limit: string;
  why: { title: string; intro: string; points: (n: number) => string; picked: (a: string, p: string, f: string) => string; ifTop: (a: string, f: string) => string; tie: string };
  questions: { q: string; options: [string, string, string, string, string] }[];
  scenery: { q: string; options: [string, string, string, string] };
  archetype: Record<Archetype, { name: string; line: string }>;
  pantheon: Record<Pantheon, string>;
}

const C: Record<Locale, Copy> = {
  ko: {
    start: '수호신 찾기 시작', progress: (n, t) => `${n} / ${t}`, back: '이전', restart: '다시 하기',
    resultEyebrow: '나의 수호신', read: '이 신 이야기 읽기', others: '다른 신화 속 나', shareHeading: '나의 수호신',
    why: {
      title: '왜 이 수호신일까',
      intro: '앞의 여섯 문항은 다섯 성향 중 하나에 1점씩 줬어요. 가장 높은 성향과 마지막에 고른 풍경(신화)이 만나는 자리의 인물이 수호신이에요. 막대를 눌러 보세요.',
      points: (n) => `${n}점`,
      picked: (a, p, f) => `가장 높은 성향은 "${a}", 고른 풍경은 ${p}. 그래서 ${f}예요.`,
      ifTop: (a, f) => `"${a}" 점수가 가장 높았다면 같은 신화에서 ${f}가 나왔을 거예요.`,
      tie: '점수가 같으면 막대 순서상 위에 있는 성향을 골라요.',
    },
    limit: '신화 속 인물에 나를 비춰 보는 놀이예요. 성격 검사가 아니고, 종교적 의미도 담지 않아요.',
    questions: [
      { q: '친구들 사이에서 나는?', options: ['다들 무사한지 챙기는 사람', '고민을 들으면 답을 정리해 주는 사람', '새 계획을 먼저 꺼내는 사람', '힘든 사람 곁에 먼저 가는 사람', '분위기를 확 바꾸는 사람'] },
      { q: '하루가 통째로 비면?', options: ['내 공간을 정돈하고 지킨다', '궁금했던 걸 끝까지 파고든다', '안 가 본 곳으로 떠난다', '누군가에게 밥을 해 준다', '즉흥으로 재밌는 일을 벌인다'] },
      { q: '위기가 오면 나는?', options: ['앞에 서서 막는다', '한발 물러서 판을 읽는다', '일단 움직이며 길을 낸다', '다친 사람부터 살핀다', '아무도 생각 못 한 꾀를 낸다'] },
      { q: '가장 듣고 싶은 말은?', options: ['"네가 있어서 든든해"', '"그걸 어떻게 알았어?"', '"너 진짜 용감하다"', '"덕분에 살았어"', '"너랑 있으면 안 지루해"'] },
      { q: '하나만 가질 수 있다면?', options: ['단단한 방패', '오래된 책 한 권', '바람처럼 빠른 신발', '무엇이든 낫게 하는 약초', '어디든 여는 열쇠 꾸러미'] },
      { q: '제일 못 참는 것은?', options: ['약속을 어기는 것', '대충 아는 척하는 것', '제자리걸음', '힘든 사람을 외면하는 것', '이유 없는 규칙'] },
    ],
    scenery: { q: '마지막으로, 끌리는 풍경은?', options: ['올리브 나무와 흰 신전, 지중해', '눈 덮인 숲과 오로라', '나일강과 사막의 별', '안개 낀 산과 서낭당 고갯길'] },
    archetype: {
      guardian: { name: '지키는 사람', line: '경계를 지키고 약속을 지키는 수호자형이에요. 곁에 있으면 든든한 사람.' },
      sage: { name: '꿰뚫어 보는 사람', line: '한발 물러서 흐름을 읽는 현자형이에요. 남들이 못 본 답을 먼저 봐요.' },
      pioneer: { name: '길을 내는 사람', line: '먼저 움직여 길을 여는 개척자형이에요. 망설임보다 첫걸음이 빨라요.' },
      healer: { name: '살리는 사람', line: '다친 것을 돌보고 다시 일으키는 치유자형이에요. 곁에 있으면 숨이 놓여요.' },
      trickster: { name: '판을 뒤집는 사람', line: '뻔한 판에 웃음과 꾀를 던지는 장난꾼형이에요. 덕분에 새 길이 열려요.' },
    },
    pantheon: { greek: '그리스 신화', norse: '북유럽 신화', egyptian: '이집트 신화', korean: '한국 신화' },
  },
  en: {
    start: 'Find my guardian', progress: (n, t) => `${n} / ${t}`, back: 'Back', restart: 'Start again',
    resultEyebrow: 'Your guardian deity', read: 'Read this figure’s story', others: 'You in other mythologies', shareHeading: 'My guardian deity',
    why: {
      title: 'Why this guardian?',
      intro: 'Each of the first six questions gave one point to one of five types. The figure where your top type meets the scenery (mythology) you picked last is your guardian. Tap a bar.',
      points: (n) => `${n} pt`,
      picked: (a, p, f) => `Your top type is “${a}” and you picked ${p}. That gives ${f}.`,
      ifTop: (a, f) => `If “${a}” had scored highest, the same mythology would have given ${f}.`,
      tie: 'On a tie, the type higher in the list wins.',
    },
    limit: 'A game of seeing yourself in mythic figures. It is not a personality test and carries no religious meaning.',
    questions: [
      { q: 'Among your friends, you are the one who…', options: ['checks everyone got home safe', 'sorts out the answer when someone’s stuck', 'brings up the next plan first', 'goes to whoever is struggling', 'changes the mood in a second'] },
      { q: 'A whole free day. You…', options: ['tidy and secure your space', 'dig into something you’ve wondered about', 'head somewhere new', 'cook for someone', 'start something fun on a whim'] },
      { q: 'When trouble comes, you…', options: ['stand in front and block it', 'step back and read the board', 'move first and make a path', 'check on whoever got hurt', 'pull a trick nobody saw coming'] },
      { q: 'What would you most like to hear?', options: ['“I feel safe with you around.”', '“How did you know that?”', '“You’re really brave.”', '“You saved me.”', '“It’s never boring with you.”'] },
      { q: 'You can keep one thing:', options: ['a solid shield', 'an old book', 'shoes as fast as the wind', 'a herb that heals anything', 'keys that open any door'] },
      { q: 'What can you least stand?', options: ['broken promises', 'people faking knowledge', 'standing still', 'looking away from someone in need', 'rules with no reason'] },
    ],
    scenery: { q: 'Last one: which landscape pulls you in?', options: ['Olive trees, white temples, the Mediterranean', 'Snowy forest under the aurora', 'The Nile and desert stars', 'Misty mountains and a village shrine pass'] },
    archetype: {
      guardian: { name: 'The Guardian', line: 'You keep the boundaries and keep your word. People feel safe beside you.' },
      sage: { name: 'The Seer', line: 'You step back and read the flow, and see the answer before others do.' },
      pioneer: { name: 'The Pathfinder', line: 'You move first and open the way. Your first step beats your doubts.' },
      healer: { name: 'The Healer', line: 'You tend what is hurt and lift it back up. People breathe easier near you.' },
      trickster: { name: 'The Trickster', line: 'You toss laughter and wit into a stale game, and new paths open.' },
    },
    pantheon: { greek: 'Greek mythology', norse: 'Norse mythology', egyptian: 'Egyptian mythology', korean: 'Korean mythology' },
  },
  ja: {
    start: '守護神を探す', progress: (n, t) => `${n} / ${t}`, back: '戻る', restart: 'もう一度',
    resultEyebrow: 'わたしの守護神', read: 'この神の物語を読む', others: 'ほかの神話のわたし', shareHeading: 'わたしの守護神',
    why: {
      title: 'なぜこの守護神？',
      intro: '最初の6問は5つのタイプのどれかに1点ずつ入りました。いちばん高いタイプと、最後に選んだ風景（神話）が交わる人物が守護神です。バーを押してみてください。',
      points: (n) => `${n}点`,
      picked: (a, p, f) => `いちばん高いタイプは「${a}」、選んだ風景は${p}。だから${f}です。`,
      ifTop: (a, f) => `「${a}」がいちばん高ければ、同じ神話から${f}が出ていました。`,
      tie: '同点のときは、リストで上にあるタイプを選びます。',
    },
    limit: '神話の人物に自分を映してみる遊びです。性格診断ではなく、宗教的な意味もありません。',
    questions: [
      { q: '友だちの中でのわたしは？', options: ['みんな無事か気にかける人', '悩みを聞いて答えを整理する人', '次の計画を先に出す人', 'つらい人のそばに先に行く人', '空気をがらっと変える人'] },
      { q: '丸一日あいたら？', options: ['自分の場所を整えて守る', '気になっていたことをとことん調べる', '行ったことのない場所へ出かける', '誰かにごはんを作る', '思いつきで楽しいことを始める'] },
      { q: 'ピンチのとき、わたしは？', options: ['前に立って食い止める', '一歩引いて全体を読む', 'まず動いて道をつくる', 'けがをした人から見る', '誰も思いつかない手を出す'] },
      { q: 'いちばん言われたい言葉は？', options: ['「あなたがいると心強い」', '「どうして分かったの？」', '「本当に勇敢だね」', '「おかげで助かった」', '「一緒にいると退屈しない」'] },
      { q: 'ひとつだけ持てるなら？', options: ['頑丈な盾', '古い本', '風のように速い靴', '何でも治す薬草', 'どこでも開く鍵束'] },
      { q: 'いちばん我慢できないのは？', options: ['約束を破ること', '知ったかぶり', '足踏み', 'つらい人を見て見ぬふり', '理由のない決まり'] },
    ],
    scenery: { q: '最後に、惹かれる風景は？', options: ['オリーブの木と白い神殿、地中海', '雪の森とオーロラ', 'ナイル川と砂漠の星', '霧の山と峠のほこら'] },
    archetype: {
      guardian: { name: '守る人', line: '境界と約束を守る守護者タイプ。そばにいると心強い人です。' },
      sage: { name: '見抜く人', line: '一歩引いて流れを読む賢者タイプ。人より先に答えが見えます。' },
      pioneer: { name: '道をひらく人', line: '先に動いて道をひらく開拓者タイプ。迷うより一歩が早い人です。' },
      healer: { name: '癒やす人', line: '傷ついたものを手当てし立て直す癒やし手タイプ。そばにいるとほっとします。' },
      trickster: { name: '場をひっくり返す人', line: 'お決まりの場に笑いと知恵を投げ込むトリックスタータイプ。新しい道が開けます。' },
    },
    pantheon: { greek: 'ギリシャ神話', norse: '北欧神話', egyptian: 'エジプト神話', korean: '韓国神話' },
  },
  zh: {
    start: '寻找我的守护神', progress: (n, t) => `${n} / ${t}`, back: '上一题', restart: '重新测试',
    resultEyebrow: '我的守护神', read: '阅读这位神的故事', others: '其他神话里的我', shareHeading: '我的守护神',
    why: {
      title: '为什么是这位守护神？',
      intro: '前6题每题给五种类型之一加1分。得分最高的类型与最后选的风景（神话）交汇处的人物就是守护神。点一下柱条看看。',
      points: (n) => `${n}分`,
      picked: (a, p, f) => `最高的类型是「${a}」，选的风景是${p}，所以是${f}。`,
      ifTop: (a, f) => `如果「${a}」得分最高，同一神话会给出${f}。`,
      tie: '同分时，取列表中靠上的类型。',
    },
    limit: '这是把自己映照在神话人物身上的小游戏，不是性格测验，也不带宗教含义。',
    questions: [
      { q: '在朋友中，我是那个……', options: ['确认大家都平安的人', '听完烦恼帮忙理清答案的人', '先提出新计划的人', '先走到难过的人身边的人', '一下子改变气氛的人'] },
      { q: '整整一天空闲时，我会……', options: ['整理并守好自己的空间', '把好奇的事一查到底', '去没去过的地方', '给别人做一顿饭', '临时起意搞点好玩的事'] },
      { q: '遇到危机时，我会……', options: ['站在前面挡住', '退一步看清全局', '先行动，开出一条路', '先照看受伤的人', '想出谁都没想到的办法'] },
      { q: '最想听到的一句话？', options: ['“有你在真安心”', '“你怎么知道的？”', '“你真勇敢”', '“多亏了你”', '“和你在一起从不无聊”'] },
      { q: '只能带一样东西的话？', options: ['坚固的盾牌', '一本古书', '像风一样快的鞋', '能治百病的草药', '能打开任何门的钥匙串'] },
      { q: '最受不了的是？', options: ['不守约定', '不懂装懂', '原地踏步', '对难过的人视而不见', '毫无理由的规定'] },
    ],
    scenery: { q: '最后，最吸引你的风景是？', options: ['橄榄树、白色神殿与地中海', '雪林与极光', '尼罗河与沙漠星空', '雾中的山与山口的城隍庙'] },
    archetype: {
      guardian: { name: '守护的人', line: '守住边界、守住约定的守护者型。有你在就安心。' },
      sage: { name: '看透的人', line: '退一步读懂局势的智者型。总比别人先看到答案。' },
      pioneer: { name: '开路的人', line: '先行动、开辟道路的开拓者型。第一步总快过犹豫。' },
      healer: { name: '疗愈的人', line: '照料伤痛、让人重新站起来的疗愈者型。在你身边就能松口气。' },
      trickster: { name: '翻盘的人', line: '给老套局面带来笑声与巧思的捣蛋鬼型。新路因此打开。' },
    },
    pantheon: { greek: '希腊神话', norse: '北欧神话', egyptian: '埃及神话', korean: '韩国神话' },
  },
  fr: {
    start: 'Trouver ma divinité', progress: (n, t) => `${n} / ${t}`, back: 'Retour', restart: 'Recommencer',
    resultEyebrow: 'Votre divinité gardienne', read: 'Lire son histoire', others: 'Vous dans d’autres mythologies', shareHeading: 'Ma divinité gardienne',
    why: {
      title: 'Pourquoi ce gardien ?',
      intro: 'Chacune des six premières questions donnait un point à l’un des cinq types. La figure au croisement de votre type dominant et du paysage (mythologie) choisi en dernier est votre gardien. Touchez une barre.',
      points: (n) => `${n} pt`,
      picked: (a, p, f) => `Votre type dominant est « ${a} » et vous avez choisi : ${p}. D’où ${f}.`,
      ifTop: (a, f) => `Si « ${a} » avait dominé, la même mythologie aurait donné ${f}.`,
      tie: 'En cas d’égalité, le type le plus haut dans la liste l’emporte.',
    },
    limit: 'Un jeu pour se voir dans des figures mythiques. Ce n’est pas un test de personnalité et il n’a aucun sens religieux.',
    questions: [
      { q: 'Entre amis, vous êtes celui ou celle qui…', options: ['vérifie que tout le monde est bien rentré', 'met de l’ordre dans le problème d’un ami', 'propose le prochain plan', 'va d’abord vers celui qui souffre', 'change l’ambiance en une seconde'] },
      { q: 'Une journée entière libre. Vous…', options: ['rangez et protégez votre espace', 'creusez un sujet qui vous intrigue', 'partez vers un lieu inconnu', 'cuisinez pour quelqu’un', 'lancez un truc amusant sur un coup de tête'] },
      { q: 'Face à une crise, vous…', options: ['vous placez devant pour bloquer', 'reculez pour lire la situation', 'bougez d’abord pour ouvrir un chemin', 'regardez d’abord qui est blessé', 'sortez une ruse que personne n’a vue'] },
      { q: 'Ce que vous aimeriez le plus entendre :', options: ['« Avec toi, je me sens en sécurité. »', '« Comment tu savais ? »', '« Tu es vraiment courageux. »', '« Tu m’as sauvé. »', '« On ne s’ennuie jamais avec toi. »'] },
      { q: 'Vous gardez un seul objet :', options: ['un bouclier solide', 'un vieux livre', 'des chaussures rapides comme le vent', 'une herbe qui soigne tout', 'des clés qui ouvrent toutes les portes'] },
      { q: 'Ce que vous supportez le moins :', options: ['les promesses rompues', 'faire semblant de savoir', 'faire du surplace', 'détourner le regard', 'les règles sans raison'] },
    ],
    scenery: { q: 'Dernière : quel paysage vous attire ?', options: ['Oliviers, temples blancs et Méditerranée', 'Forêt enneigée sous l’aurore boréale', 'Le Nil et les étoiles du désert', 'Montagnes dans la brume et sanctuaire de col'] },
    archetype: {
      guardian: { name: 'Le Gardien', line: 'Vous tenez les limites et votre parole. On se sent en sécurité à vos côtés.' },
      sage: { name: 'Le Voyant', line: 'Vous prenez du recul, lisez le courant et voyez la réponse avant les autres.' },
      pioneer: { name: 'L’Éclaireur', line: 'Vous bougez le premier et ouvrez la voie. Votre premier pas devance vos doutes.' },
      healer: { name: 'Le Guérisseur', line: 'Vous soignez ce qui est blessé et le relevez. Près de vous, on respire.' },
      trickster: { name: 'Le Farceur', line: 'Vous jetez rire et ruse dans un jeu figé, et de nouveaux chemins s’ouvrent.' },
    },
    pantheon: { greek: 'Mythologie grecque', norse: 'Mythologie nordique', egyptian: 'Mythologie égyptienne', korean: 'Mythologie coréenne' },
  },
  es: {
    start: 'Encontrar mi deidad', progress: (n, t) => `${n} / ${t}`, back: 'Atrás', restart: 'Empezar de nuevo',
    resultEyebrow: 'Tu deidad guardiana', read: 'Leer su historia', others: 'Tú en otras mitologías', shareHeading: 'Mi deidad guardiana',
    why: {
      title: '¿Por qué este guardián?',
      intro: 'Cada una de las seis primeras preguntas dio un punto a uno de cinco tipos. La figura donde se cruzan tu tipo más alto y el paisaje (mitología) que elegiste al final es tu guardián. Toca una barra.',
      points: (n) => `${n} pt`,
      picked: (a, p, f) => `Tu tipo más alto es «${a}» y elegiste ${p}. Por eso sale ${f}.`,
      ifTop: (a, f) => `Si «${a}» hubiera sido el más alto, la misma mitología habría dado ${f}.`,
      tie: 'En caso de empate, gana el tipo que está más arriba en la lista.',
    },
    limit: 'Un juego para verte en figuras míticas. No es un test de personalidad ni tiene sentido religioso.',
    questions: [
      { q: 'Entre tus amigos, eres quien…', options: ['comprueba que todos llegaron bien', 'ordena la respuesta cuando alguien se atasca', 'propone el siguiente plan', 'va primero hacia quien lo pasa mal', 'cambia el ambiente en un segundo'] },
      { q: 'Un día entero libre. Tú…', options: ['ordenas y proteges tu espacio', 'investigas a fondo algo que te intriga', 'te vas a un sitio nuevo', 'cocinas para alguien', 'montas algo divertido sobre la marcha'] },
      { q: 'Cuando llega una crisis, tú…', options: ['te pones delante y la frenas', 'das un paso atrás y lees la situación', 'te mueves primero y abres camino', 'miras primero quién se ha hecho daño', 'sacas un truco que nadie vio venir'] },
      { q: 'Lo que más te gustaría oír:', options: ['«Contigo me siento seguro.»', '«¿Cómo lo sabías?»', '«Eres muy valiente.»', '«Me salvaste.»', '«Contigo nunca me aburro.»'] },
      { q: 'Solo puedes quedarte una cosa:', options: ['un escudo firme', 'un libro antiguo', 'zapatos rápidos como el viento', 'una hierba que lo cura todo', 'llaves que abren cualquier puerta'] },
      { q: 'Lo que menos soportas:', options: ['las promesas rotas', 'fingir que se sabe', 'quedarse quieto', 'apartar la mirada de quien sufre', 'las reglas sin motivo'] },
    ],
    scenery: { q: 'La última: ¿qué paisaje te atrae?', options: ['Olivos, templos blancos y el Mediterráneo', 'Bosque nevado bajo la aurora', 'El Nilo y las estrellas del desierto', 'Montañas con niebla y un santuario de paso'] },
    archetype: {
      guardian: { name: 'El Guardián', line: 'Cuidas los límites y cumples tu palabra. A tu lado la gente se siente segura.' },
      sage: { name: 'El Vidente', line: 'Das un paso atrás, lees la corriente y ves la respuesta antes que nadie.' },
      pioneer: { name: 'El Explorador', line: 'Te mueves primero y abres el camino. Tu primer paso gana a tus dudas.' },
      healer: { name: 'El Sanador', line: 'Cuidas lo herido y lo levantas. Cerca de ti se respira mejor.' },
      trickster: { name: 'El Embaucador', line: 'Echas risa e ingenio a un juego gastado y se abren caminos nuevos.' },
    },
    pantheon: { greek: 'Mitología griega', norse: 'Mitología nórdica', egyptian: 'Mitología egipcia', korean: 'Mitología coreana' },
  },
};

/** 보기 순서가 매 문항 같으면 패턴이 보이니, 문항마다 한 칸씩 돌려 보여 준다. */
/** 도감 허브 표에서 쓰는 원형·신화 이름. */
export function guardianLabels(locale: string) {
  const c = C[(locale in C ? locale : 'en') as Locale];
  return { archetype: c.archetype, pantheon: c.pantheon };
}

const PANTHEON_SEAL: Record<Pantheon, string> = { greek: '🏛️', norse: '❄️', egyptian: '☀️', korean: '🌙' };

function GuardianWhy({ c, l, result, figures }: { c: Copy; l: Locale; result: ReturnType<typeof castGuardian>; figures: Record<string, Figure> }) {
  const [focus, setFocus] = useState<Archetype>(result.archetype);
  const max = Math.max(1, ...result.scores);
  const nameOf = (id: string) => figures[id]?.name ?? id;
  return (
    <ExplainLab
      locale={l}
      title={c.why.title}
      intro={c.why.intro}
      note={c.why.tie}
      conclusion={
        <>
          <p className="font-bold">{c.why.picked(c.archetype[result.archetype].name, c.pantheon[result.pantheon], nameOf(result.id))}</p>
          {focus !== result.archetype && (
            <p className="mt-1">{c.why.ifTop(c.archetype[focus].name, nameOf(GUARDIANS[focus][result.pantheon]))}</p>
          )}
        </>
      }
    >
      <ul className="space-y-2">
        {ARCHETYPES.map((a, i) => {
          const score = result.scores[i];
          const on = a === focus;
          return (
            <li key={a}>
              <button
                type="button"
                onClick={() => { setFocus(a); gaEvent('explain_lab', { lab: 'myth-guardian-why', archetype: a }); }}
                aria-pressed={on}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 text-left text-sm ${on ? 'border-primary' : 'border-border'}`}
              >
                <span className="w-28 shrink-0 font-bold text-foreground">{c.archetype[a].name}</span>
                <svg viewBox="0 0 100 10" className="h-3 min-w-0 flex-1" aria-hidden="true" preserveAspectRatio="none">
                  <rect x="0" y="0" width="100" height="10" rx="5" className="fill-muted" />
                  <rect x="0" y="0" width={(score / max) * 100} height="10" rx="5" className={a === result.archetype ? 'fill-primary' : 'fill-chart-4'} />
                </svg>
                <span className="w-10 shrink-0 text-right text-muted-foreground">{c.why.points(score)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </ExplainLab>
  );
}

function displayOrder(q: number): number[] {
  return ARCHETYPES.map((_, i) => (i + q * 2) % ARCHETYPES.length);
}

export default function MythGuardianTest({ locale, figures }: { locale: string; figures: Record<string, Figure> }) {
  const l = (locale in C ? locale : 'en') as Locale;
  const c = C[l];
  const total = c.questions.length + 1;
  const [answers, setAnswers] = useState<number[]>([]);
  const [started, setStarted] = useState(false);

  const done = answers.length === total;
  const result = done ? castGuardian(answers) : null;

  function choose(value: number) {
    const next = [...answers, value];
    setAnswers(next);
    if (next.length === total) {
      const r = castGuardian(next);
      const name = figures[r.id]?.name ?? r.id;
      recordTestResult({
        kind: 'mystic',
        testId: 'myth-guardian',
        title: c.shareHeading,
        resultLabel: `${name} · ${c.archetype[r.archetype].name}`,
        result: { id: r.id, archetype: r.archetype, pantheon: r.pantheon },
        locale: l,
        sourcePath: `/${l}/myth/guardian/`,
      });
      gaEvent('myth_guardian_result', { id: r.id, archetype: r.archetype, pantheon: r.pantheon });
    }
  }

  if (!started) {
    return (
      <button type="button" onClick={() => { setStarted(true); gaEvent('myth_guardian_start'); }} className="min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
        {c.start}
      </button>
    );
  }

  if (result) {
    const fig = figures[result.id];
    const others = PANTHEONS.filter((p) => p !== result.pantheon).map((p) => ({ p, id: GUARDIANS[result.archetype][p] }));
    return (
      <section className="space-y-4" aria-live="polite">
        <div className="animate-guardianReveal rounded-2xl border border-border bg-card p-6 text-center">
          <div className="animate-sealGlow mx-auto flex size-16 items-center justify-center rounded-full border-2 border-primary text-3xl" aria-hidden="true">{PANTHEON_SEAL[result.pantheon]}</div>
          <p className="mt-3 text-xs font-bold tracking-widest text-primary">{c.resultEyebrow} · {c.pantheon[result.pantheon]}</p>
          <h2 className="mt-3 text-3xl font-black text-foreground">{fig?.name ?? result.id}</h2>
          <p className="mt-2 text-base font-bold text-foreground">{c.archetype[result.archetype].name}</p>
          <p className="mt-3 text-left text-base leading-7 text-foreground">{c.archetype[result.archetype].line}</p>
          {fig && <p className="mt-3 text-left text-sm leading-6 text-muted-foreground">{fig.description}</p>}
          <a href={`/${l}/meaning-of-myth-${result.id}/`} className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground">{c.read}</a>
        </div>
        <GuardianWhy c={c} l={l} result={result} figures={figures} />
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold text-foreground">{c.others}</h3>
          <ul className="mt-3 divide-y divide-border">
            {others.map((o) => (
              <li key={o.id}>
                <a href={`/${l}/meaning-of-myth-${o.id}/`} className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-muted-foreground">{c.pantheon[o.p]}</span>
                  <span className="font-bold text-foreground">{figures[o.id]?.name ?? o.id}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <ShareResultButton
          locale={l}
          heading={c.shareHeading}
          resultTitle={fig?.name ?? result.id}
          emoji="🏛️"
          description={`${c.pantheon[result.pantheon]} · ${c.archetype[result.archetype].name}`}
          analyticsId="myth-guardian"
        />
        <button type="button" onClick={() => setAnswers([])} className="min-h-11 w-full rounded-xl border border-border px-4 text-sm font-semibold text-foreground">{c.restart}</button>
        <p className="text-xs leading-5 text-muted-foreground">{c.limit}</p>
      </section>
    );
  }

  const step = answers.length;
  const isScenery = step === c.questions.length;
  const q = isScenery ? c.scenery.q : c.questions[step].q;
  const options = isScenery
    ? c.scenery.options.map((text, value) => ({ text, value }))
    : displayOrder(step).map((value) => ({ text: c.questions[step].options[value], value }));

  return (
    <section className="rounded-2xl border border-border bg-card p-5" aria-live="polite">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>{c.progress(step + 1, total)}</span>
        {step > 0 && <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} className="min-h-11 px-2 underline underline-offset-4">{c.back}</button>}
      </div>
      <h2 className="mt-2 text-xl font-black text-foreground">{q}</h2>
      <ul className="mt-4 space-y-2">
        {options.map((o) => (
          <li key={o.value}>
            <button type="button" onClick={() => choose(o.value)} className="min-h-12 w-full rounded-xl border border-border px-4 py-3 text-left text-base text-foreground hover:border-primary">
              {o.text}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
