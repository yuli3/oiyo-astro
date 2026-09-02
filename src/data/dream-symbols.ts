// 꿈 상징 사전 SSOT.
//
// 설계 방침(2026-09-02 세운 지시): 상징 하나에 긴 글 한 편씩 붙이는 대신
// **짧은 항목을 넓게** 모은다. 사람들이 실제로 꾸는 꿈의 폭을 몇 화면 안에
// 담는 것이 목표이고, 이 데이터가 해몽 도구의 입력이자 우리 데이터셋이 된다.
//
// 로케일별 텍스트를 필드마다 흩지 않고 l10n 아래 한 덩어리로 묶는다. 필드마다
// Record<Locale, ...> 를 쓰면 상징이 늘 때 같은 상징의 문장들이 파일 곳곳으로
// 흩어져 번역을 맞춰 보기 어렵다.
//
// 태도: 해몽은 문화적 상징 해석이지 예측이 아니다. traditional 과 psych 를
// 필드로 나눠 두는 것이 이 사전의 핵심이다 — 섞이면 관습이 근거처럼,
// 연구가 점술처럼 읽힌다.
import type { Locale } from '../i18n';

export type DreamCategory = 'body' | 'nature' | 'motion' | 'creature' | 'life' | 'place';

export interface DreamScene {
  /** 꿈의 장면. "맑은 물이 흐른다" 처럼 짧게. */
  when: string;
  /** 그 장면에 붙어 온 전통적 읽기. */
  reads: string;
}

export interface DreamReading {
  name: string;
  keywords: string[];
  /** 해몽서 계열의 읽기. 관찰이 아니라 유비에서 온 것이라는 전제 위에 쓴다. */
  traditional: string;
  /** 꿈 내용 연구의 관점. 단정하지 않는다. */
  psych: string;
  scenes: DreamScene[];
}

export interface DreamSymbol {
  /** 라우트 세그먼트. /{locale}/dream/{id} */
  id: string;
  emoji: string;
  category: DreamCategory;
  /** 함께 보면 좋은 상징 id. 상호 참조는 양방향으로 맞춘다. */
  related: string[];
  /** 긴 해설이 explainers 컬렉션에 따로 있는 상징. 없으면 이 데이터만 보여 준다. */
  hasArticle?: boolean;
  l10n: Record<Locale, DreamReading>;
}

export const DREAM_CATEGORY_LABELS: Record<DreamCategory, Record<Locale, string>> = {
  body: { ko: '몸', en: 'Body', ja: '身体', zh: '身体', fr: 'Corps', es: 'Cuerpo' },
  nature: { ko: '자연', en: 'Nature', ja: '自然', zh: '自然', fr: 'Nature', es: 'Naturaleza' },
  motion: { ko: '움직임', en: 'Motion', ja: '動き', zh: '动作', fr: 'Mouvement', es: 'Movimiento' },
  creature: { ko: '생물', en: 'Creatures', ja: '生き物', zh: '生物', fr: 'Créatures', es: 'Criaturas' },
  life: { ko: '삶의 사건', en: 'Life events', ja: '人生の出来事', zh: '人生事件', fr: 'Événements de vie', es: 'Sucesos vitales' },
  place: { ko: '장소·사물', en: 'Places & things', ja: '場所・物', zh: '场所与物', fr: 'Lieux et objets', es: 'Lugares y objetos' },
};

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    id: 'water', emoji: '💧', category: 'nature', related: ['falling', 'snake', 'fire'], hasArticle: true,
    l10n: {
      ko: {
        name: '물', keywords: ['감정', '정화', '흐름', '홍수'],
        traditional: '해몽서에서 물은 감정·재물·정화로 읽혔습니다. 물 자체보다 맑은지 탁한지, 알맞은지 넘치는지가 해석을 가릅니다.',
        psych: '꿈 내용 연구는 물에 고정된 뜻을 붙이지 않습니다. 요즘 무엇에 잠겨 있는지와 이어질 가능성이 있는 장면으로 봅니다.',
        scenes: [
          { when: '맑은 물이 넉넉히 흐른다', reads: '일이 순조롭게 풀리고 재물이 든다고 보았습니다.' },
          { when: '탁한 물에 빠진다', reads: '분명치 않은 문제에 휘말린다는 경고로 읽혔습니다.' },
          { when: '강이나 바다를 건넌다', reads: '한 단계에서 다음 단계로 넘어가는 통과의례로 보았습니다.' },
        ],
      },
      en: {
        name: 'Water', keywords: ['emotion', 'cleansing', 'flow', 'flood'],
        traditional: 'Dream manuals read water as emotion, fortune and cleansing. What decides the reading is its state — clear or murky, ample or overflowing.',
        psych: 'Content research attaches no fixed meaning to water. It treats the scene as possibly continuous with what currently absorbs you.',
        scenes: [
          { when: 'Clear water flows abundantly', reads: 'Taken as things running smoothly and fortune arriving.' },
          { when: 'You fall into murky water', reads: 'Read as a warning about being drawn into something unclear.' },
          { when: 'You cross a river or sea', reads: 'Seen as a rite of passage from one stage to the next.' },
        ],
      },
      ja: {
        name: '水', keywords: ['感情', '浄化', '流れ', '洪水'],
        traditional: '夢占書では水を感情・財・浄化として読みました。水そのものより、澄んでいるか濁っているか、適量か溢れているかが解釈を分けます。',
        psych: '夢内容の研究は水に固定した意味を与えません。いま何に浸っているかと繋がりうる場面として扱います。',
        scenes: [
          { when: '澄んだ水が豊かに流れる', reads: '物事が順調に運び、財が入ると見ました。' },
          { when: '濁った水に落ちる', reads: 'はっきりしない問題に巻き込まれる警告と読まれました。' },
          { when: '川や海を渡る', reads: '次の段階へ移る通過儀礼と見ました。' },
        ],
      },
      zh: {
        name: '水', keywords: ['情绪', '净化', '流动', '洪水'],
        traditional: '解梦书把水读作情绪、财运与净化。真正分出解释的不是水本身，而是清是浊、适量还是泛滥。',
        psych: '内容研究不给水固定含义，而把它看作可能与你当下所沉浸之事相连的场景。',
        scenes: [
          { when: '清水充沛流动', reads: '视为诸事顺遂、财运将至。' },
          { when: '落入浊水', reads: '读作卷入不明之事的警示。' },
          { when: '渡河或渡海', reads: '看作由一个阶段进入下一阶段的过渡。' },
        ],
      },
      fr: {
        name: "L'eau", keywords: ['émotion', 'purification', 'flux', 'inondation'],
        traditional: "Les manuels lisent l'eau comme émotion, fortune et purification. Ce qui décide, c'est son état : claire ou trouble, mesurée ou débordante.",
        psych: "La recherche sur le contenu n'attache aucun sens fixe à l'eau ; elle y voit une scène possiblement continue avec ce qui vous absorbe.",
        scenes: [
          { when: "Une eau claire coule en abondance", reads: 'Tenu pour des affaires qui coulent bien et une fortune qui vient.' },
          { when: 'Vous tombez dans une eau trouble', reads: "Lu comme un avertissement : être entraîné dans une affaire confuse." },
          { when: 'Vous traversez un fleuve ou la mer', reads: "Vu comme un rite de passage vers l'étape suivante." },
        ],
      },
      es: {
        name: 'El agua', keywords: ['emoción', 'purificación', 'flujo', 'inundación'],
        traditional: 'Los manuales leen el agua como emoción, fortuna y purificación. Lo que decide la lectura es su estado: clara o turbia, justa o desbordada.',
        psych: 'La investigación de contenido no le asigna un sentido fijo; la trata como escena posiblemente continua con lo que ahora te absorbe.',
        scenes: [
          { when: 'Agua clara fluye en abundancia', reads: 'Se tomaba como asuntos que marchan y fortuna que llega.' },
          { when: 'Caes en agua turbia', reads: 'Leído como aviso de verse envuelto en algo poco claro.' },
          { when: 'Cruzas un río o el mar', reads: 'Visto como rito de paso a la etapa siguiente.' },
        ],
      },
    },
  },
  {
    id: 'falling', emoji: '🕳️', category: 'motion', related: ['water', 'teeth', 'chased', 'flying'], hasArticle: true,
    l10n: {
      ko: {
        name: '추락', keywords: ['통제 상실', '불안', '놓침', '높은 곳'],
        traditional: '해몽서에서 추락은 지위·기반·통제력의 상실로 읽혔습니다.',
        psych: '잠들 무렵 떨어지는 느낌은 꿈이 아니라 수면 경련입니다. 서사가 있는 추락 꿈은 통제감이 흔들리는 상태와 이어질 수 있습니다.',
        scenes: [
          { when: '높은 곳에서 떨어진다', reads: '자리나 평판이 흔들린다고 보았습니다.' },
          { when: '떨어지다 깨어난다', reads: '결말이 정해지지 않은 걱정으로 읽혔습니다.' },
          { when: '떨어졌는데 다치지 않는다', reads: '위기를 넘긴다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Falling', keywords: ['loss of control', 'anxiety', 'letting go', 'heights'],
        traditional: 'Manuals read falling as the loss of standing, footing or control.',
        psych: 'The jolt as you drift off is a hypnic jerk, not a dream. A falling dream with a story may track a shaken sense of control.',
        scenes: [
          { when: 'You fall from a height', reads: 'Taken as position or reputation being shaken.' },
          { when: 'You wake mid-fall', reads: 'Read as a worry whose ending is not yet settled.' },
          { when: 'You land unhurt', reads: 'Taken as coming through a crisis.' },
        ],
      },
      ja: {
        name: '落下', keywords: ['制御の喪失', '不安', '手放し', '高所'],
        traditional: '夢占書では落下を地位・基盤・制御の喪失として読みました。',
        psych: '寝入りばなの落ちる感覚は夢ではなくジャーキング（睡眠時痙攣）です。物語のある落下夢は、制御感の揺らぎと繋がりうる場面です。',
        scenes: [
          { when: '高い所から落ちる', reads: '地位や評判が揺らぐと見ました。' },
          { when: '落ちる途中で目が覚める', reads: '結末の定まらない心配と読まれました。' },
          { when: '落ちても無傷', reads: '危機を越えると見ました。' },
        ],
      },
      zh: {
        name: '坠落', keywords: ['失控', '焦虑', '放手', '高处'],
        traditional: '解梦书把坠落读作地位、根基与控制力的丧失。',
        psych: '入睡时的下坠感不是梦，而是入睡抽动。有情节的坠落梦可能与当下控制感的动摇相连。',
        scenes: [
          { when: '从高处坠落', reads: '视为地位或名声动摇。' },
          { when: '坠落途中惊醒', reads: '读作结局未定的忧虑。' },
          { when: '坠落却毫发无伤', reads: '视为渡过危机。' },
        ],
      },
      fr: {
        name: 'La chute', keywords: ['perte de contrôle', 'anxiété', 'lâcher prise', 'hauteur'],
        traditional: 'Les manuels lisent la chute comme perte de rang, d’assise ou de contrôle.',
        psych: "La secousse à l'endormissement est une myoclonie, pas un rêve. Une chute avec récit peut suivre un sentiment de contrôle ébranlé.",
        scenes: [
          { when: "Vous tombez d'une hauteur", reads: 'Tenu pour une position ou une réputation ébranlée.' },
          { when: 'Vous vous réveillez en pleine chute', reads: "Lu comme un souci dont l'issue n'est pas fixée." },
          { when: 'Vous atterrissez indemne', reads: 'Tenu pour une crise surmontée.' },
        ],
      },
      es: {
        name: 'La caída', keywords: ['pérdida de control', 'ansiedad', 'soltar', 'altura'],
        traditional: 'Los manuales leen la caída como pérdida de posición, base o control.',
        psych: 'La sacudida al dormirse es una mioclonía, no un sueño. Una caída con relato puede seguir a una sensación de control quebrada.',
        scenes: [
          { when: 'Caes desde una altura', reads: 'Se tomaba como posición o reputación en peligro.' },
          { when: 'Despiertas en plena caída', reads: 'Leído como una preocupación sin desenlace fijado.' },
          { when: 'Caes sin hacerte daño', reads: 'Se tomaba como superar una crisis.' },
        ],
      },
    },
  },
  {
    id: 'teeth', emoji: '🦷', category: 'body', related: ['falling', 'snake', 'death', 'naked', 'blood'], hasArticle: true,
    l10n: {
      ko: {
        name: '이빨 빠짐', keywords: ['상실', '노화', '말', '가족'],
        traditional: '거의 모든 해몽 전통이 상실로 읽습니다. 한국에서는 어느 이가 빠졌는지로 가족의 일을 나누어 보는 관습이 더해졌습니다.',
        psych: '이갈이로 생긴 턱·치아 압박 감각이 꿈 장면에 섞여 들 수 있습니다. 자주 꾸고 아침에 턱이 뻐근하면 치과가 먼저입니다.',
        scenes: [
          { when: '앞니가 빠진다', reads: '가까운 사람의 일로 보았습니다.' },
          { when: '피가 나며 빠진다', reads: '손실이나 다툼에 대한 경고로 읽혔습니다.' },
          { when: '새 이가 난다', reads: '잃은 자리를 대신할 것이 온다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Teeth falling out', keywords: ['loss', 'aging', 'speech', 'family'],
        traditional: 'Almost every tradition reads this as loss. Korean practice adds a family reading keyed to which tooth fell.',
        psych: 'Jaw and tooth pressure from night-time grinding can bleed into the dream. Frequent dreams plus a sore jaw point to a dentist first.',
        scenes: [
          { when: 'A front tooth falls out', reads: 'Taken as concerning someone close.' },
          { when: 'It falls out bleeding', reads: 'Read as a warning of loss or conflict.' },
          { when: 'A new tooth grows in', reads: 'Taken as something arriving to replace what was lost.' },
        ],
      },
      ja: {
        name: '歯が抜ける', keywords: ['喪失', '老い', '発話', '家族'],
        traditional: 'ほとんどの伝統が喪失として読みます。韓国ではどの歯が抜けたかで家族の出来事を分ける慣習が加わりました。',
        psych: '歯ぎしりによる顎や歯の圧迫感が夢の場面に混じることがあります。頻繁に見て朝に顎が重いなら、まず歯科です。',
        scenes: [
          { when: '前歯が抜ける', reads: '身近な人の出来事と見ました。' },
          { when: '血が出て抜ける', reads: '損失や争いの警告と読まれました。' },
          { when: '新しい歯が生える', reads: '失った場所を埋めるものが来ると見ました。' },
        ],
      },
      zh: {
        name: '牙齿脱落', keywords: ['丧失', '衰老', '言语', '家人'],
        traditional: '几乎所有传统都读作丧失。朝鲜半岛还添了按脱落位置对应家人的读法。',
        psych: '夜间磨牙造成的颌与牙压迫感可能混入梦境。常做此梦且晨起颌部酸胀，应先看牙医。',
        scenes: [
          { when: '门牙脱落', reads: '视为身边亲近之人的事。' },
          { when: '带血脱落', reads: '读作损失或争执的警示。' },
          { when: '长出新牙', reads: '视为有物来补所失之位。' },
        ],
      },
      fr: {
        name: 'Perdre ses dents', keywords: ['perte', 'vieillissement', 'parole', 'famille'],
        traditional: 'Presque toutes les traditions y lisent une perte. L’usage coréen y ajoute une lecture familiale selon la dent tombée.',
        psych: "La pression sur mâchoire et dents due au bruxisme peut s'infiltrer dans le rêve. Rêve fréquent et mâchoire douloureuse : voyez d'abord un dentiste.",
        scenes: [
          { when: 'Une incisive tombe', reads: 'Tenu pour concerner un proche.' },
          { when: 'Elle tombe en saignant', reads: "Lu comme l'annonce d'une perte ou d'un conflit." },
          { when: 'Une dent nouvelle pousse', reads: 'Tenu pour ce qui vient remplacer le perdu.' },
        ],
      },
      es: {
        name: 'Perder los dientes', keywords: ['pérdida', 'envejecimiento', 'habla', 'familia'],
        traditional: 'Casi toda tradición lo lee como pérdida. El uso coreano añade una lectura familiar según qué diente cayó.',
        psych: 'La presión en mandíbula y dientes por bruxismo puede colarse en el sueño. Si se repite y amaneces con la mandíbula dolorida, primero el dentista.',
        scenes: [
          { when: 'Se cae un incisivo', reads: 'Se tomaba como algo relativo a alguien cercano.' },
          { when: 'Cae sangrando', reads: 'Leído como aviso de pérdida o conflicto.' },
          { when: 'Sale un diente nuevo', reads: 'Se tomaba como algo que viene a ocupar lo perdido.' },
        ],
      },
    },
  },
  {
    id: 'snake', emoji: '🐍', category: 'creature', related: ['water', 'teeth', 'baby', 'pig'], hasArticle: true,
    l10n: {
      ko: {
        name: '뱀', keywords: ['재물', '태몽', '변화', '허물벗기'],
        traditional: '동아시아 해몽에서 뱀은 재물과 태몽으로 읽혔습니다. 곳간을 지키던 동물이라는 배경이 재물 해석에 깔려 있습니다.',
        psych: '같은 뱀 꿈이라도 편안히 지나간 꿈과 쫓긴 꿈은 전혀 다른 경험입니다. 상징의 뜻보다 꿈에서 느낀 감정이 읽을 만합니다.',
        scenes: [
          { when: '뱀이 집에 들어온다', reads: '재물이 들어온다고 보았습니다.' },
          { when: '뱀이 몸을 감는다', reads: '태몽으로 자주 꼽혔습니다.' },
          { when: '뱀이 허물을 벗는다', reads: '묵은 것을 벗고 달라진다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Snake', keywords: ['fortune', 'conception dream', 'change', 'shedding'],
        traditional: 'East Asian manuals read the snake as fortune and as a conception dream — behind it lies the snake that guarded granaries.',
        psych: 'A snake that passes calmly and a snake that chases you are different experiences. The feeling in the dream reads better than the symbol.',
        scenes: [
          { when: 'A snake enters the house', reads: 'Taken as fortune coming in.' },
          { when: 'A snake coils around you', reads: 'Often counted as a conception dream.' },
          { when: 'A snake sheds its skin', reads: 'Taken as shedding the old and changing.' },
        ],
      },
      ja: {
        name: '蛇', keywords: ['財', '胎夢', '変化', '脱皮'],
        traditional: '東アジアの夢占書では蛇を財と胎夢として読みました。蔵を守る生き物だった背景が財の解釈にあります。',
        psych: '穏やかに通り過ぎる蛇と追ってくる蛇はまったく別の体験です。象徴の意味より、夢で感じた感情のほうが読む価値があります。',
        scenes: [
          { when: '蛇が家に入ってくる', reads: '財が入ると見ました。' },
          { when: '蛇が体に巻きつく', reads: '胎夢としてよく挙げられました。' },
          { when: '蛇が脱皮する', reads: '古いものを脱いで変わると見ました。' },
        ],
      },
      zh: {
        name: '蛇', keywords: ['财运', '胎梦', '变化', '蜕皮'],
        traditional: '东亚解梦书把蛇读作财运与胎梦，背后是蛇曾看守粮仓的生活经验。',
        psych: '安然游过的蛇与追赶你的蛇是两种体验。比起象征含义，梦中感受更值得读。',
        scenes: [
          { when: '蛇进家门', reads: '视为财运临门。' },
          { when: '蛇缠绕身体', reads: '常被列为胎梦。' },
          { when: '蛇蜕皮', reads: '视为褪去旧物而更新。' },
        ],
      },
      fr: {
        name: 'Le serpent', keywords: ['fortune', 'rêve de conception', 'changement', 'mue'],
        traditional: "Les manuels d'Asie orientale lisent le serpent comme fortune et rêve de conception — derrière, le serpent qui gardait les greniers.",
        psych: "Un serpent qui passe calmement et un serpent qui poursuit sont deux expériences. L'émotion du rêve se lit mieux que le symbole.",
        scenes: [
          { when: 'Un serpent entre dans la maison', reads: 'Tenu pour la fortune qui arrive.' },
          { when: "Un serpent s'enroule autour de vous", reads: 'Souvent compté comme rêve de conception.' },
          { when: 'Un serpent mue', reads: "Tenu pour se défaire de l'ancien et changer." },
        ],
      },
      es: {
        name: 'La serpiente', keywords: ['fortuna', 'sueño de concepción', 'cambio', 'muda'],
        traditional: 'Los manuales de Asia oriental leen la serpiente como fortuna y sueño de concepción; detrás está la serpiente que guardaba los graneros.',
        psych: 'Una serpiente que pasa tranquila y una que persigue son experiencias distintas. La emoción del sueño se lee mejor que el símbolo.',
        scenes: [
          { when: 'Una serpiente entra en casa', reads: 'Se tomaba como fortuna que llega.' },
          { when: 'Una serpiente se enrosca en tu cuerpo', reads: 'A menudo contado como sueño de concepción.' },
          { when: 'Una serpiente muda la piel', reads: 'Se tomaba como despojarse de lo viejo y cambiar.' },
        ],
      },
    },
  },
  {
    id: 'fire', emoji: '🔥', category: 'nature', related: ['water', 'chased'],
    l10n: {
      ko: {
        name: '불', keywords: ['재물', '분노', '소멸', '정화'],
        traditional: '해몽서에서 불은 크게 번지면 재물, 사람이나 집을 태우면 다툼과 손실로 갈려 읽혔습니다.',
        psych: '불은 강한 정서가 실리는 장면이라 기억에 잘 남습니다. 자주 꾼다는 인상이 실제 빈도보다 클 수 있습니다.',
        scenes: [
          { when: '불길이 크게 번진다', reads: '기세가 오르고 재물이 인다고 보았습니다.' },
          { when: '집이 탄다', reads: '기반이 흔들리는 일로 읽혔습니다.' },
          { when: '불을 끈다', reads: '갈등을 가라앉힌다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Fire', keywords: ['fortune', 'anger', 'consumption', 'cleansing'],
        traditional: 'Manuals split it: fire spreading wide reads as fortune, fire burning a person or house as conflict and loss.',
        psych: 'Fire scenes carry strong affect and are well remembered, so they can feel more frequent than they are.',
        scenes: [
          { when: 'Flames spread widely', reads: 'Taken as momentum rising and fortune building.' },
          { when: 'A house burns', reads: 'Read as the ground under you being shaken.' },
          { when: 'You put the fire out', reads: 'Taken as settling a conflict.' },
        ],
      },
      ja: {
        name: '火', keywords: ['財', '怒り', '焼失', '浄化'],
        traditional: '夢占書では、大きく燃え広がる火は財、人や家を焼く火は争いと損失として分けて読みました。',
        psych: '火は強い情動を伴う場面で記憶に残りやすく、実際の頻度より「よく見る」と感じられがちです。',
        scenes: [
          { when: '炎が大きく広がる', reads: '勢いが増し財が起こると見ました。' },
          { when: '家が燃える', reads: '基盤が揺らぐ出来事と読まれました。' },
          { when: '火を消す', reads: '争いを鎮めると見ました。' },
        ],
      },
      zh: {
        name: '火', keywords: ['财运', '愤怒', '焚毁', '净化'],
        traditional: '解梦书分而读之：火势大张为财，焚人焚屋则为争执与损失。',
        psych: '火的场面情绪强烈、易被记住，因而"常做"的印象可能高于实际频率。',
        scenes: [
          { when: '火势大张', reads: '视为气势上扬、财运兴起。' },
          { when: '房屋起火', reads: '读作根基动摇之事。' },
          { when: '把火扑灭', reads: '视为平息争端。' },
        ],
      },
      fr: {
        name: 'Le feu', keywords: ['fortune', 'colère', 'consumation', 'purification'],
        traditional: "Les manuels distinguent : un feu qui s'étend se lit comme fortune, un feu qui brûle une personne ou une maison comme conflit et perte.",
        psych: "Les scènes de feu portent un affect fort et se retiennent bien : elles paraissent plus fréquentes qu'elles ne le sont.",
        scenes: [
          { when: "Les flammes s'étendent largement", reads: "Tenu pour un élan qui monte et une fortune qui se bâtit." },
          { when: 'Une maison brûle', reads: 'Lu comme le sol qui se dérobe sous vous.' },
          { when: 'Vous éteignez le feu', reads: "Tenu pour l'apaisement d'un conflit." },
        ],
      },
      es: {
        name: 'El fuego', keywords: ['fortuna', 'ira', 'consumación', 'purificación'],
        traditional: 'Los manuales lo dividen: fuego que se extiende se lee como fortuna; fuego que quema a alguien o una casa, como conflicto y pérdida.',
        psych: 'Las escenas de fuego cargan mucho afecto y se recuerdan bien, así que parecen más frecuentes de lo que son.',
        scenes: [
          { when: 'Las llamas se extienden', reads: 'Se tomaba como impulso que sube y fortuna que crece.' },
          { when: 'Arde una casa', reads: 'Leído como el suelo que se mueve bajo tus pies.' },
          { when: 'Apagas el fuego', reads: 'Se tomaba como calmar un conflicto.' },
        ],
      },
    },
  },
  {
    id: 'chased', emoji: '🏃', category: 'motion', related: ['falling', 'fire', 'exam'],
    l10n: {
      ko: {
        name: '쫓기는 꿈', keywords: ['회피', '압박', '마감', '두려움'],
        traditional: '해몽서는 쫓기는 꿈을 피하고 있는 일이나 갚아야 할 것이 있다는 뜻으로 읽었습니다.',
        psych: '꿈 내용 연구에서 가장 자주 보고되는 유형 가운데 하나입니다. 무엇에게 쫓기는지보다 도망치는 상황 자체가 반복되는 것이 특징입니다.',
        scenes: [
          { when: '누군가에게 쫓긴다', reads: '미뤄 둔 일이나 회피하는 관계로 읽혔습니다.' },
          { when: '달리는데 몸이 안 움직인다', reads: '뜻대로 되지 않는 상황을 가리킨다고 보았습니다.' },
          { when: '숨어서 들키지 않는다', reads: '고비를 넘긴다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Being chased', keywords: ['avoidance', 'pressure', 'deadline', 'fear'],
        traditional: 'Manuals read being chased as something you are avoiding, or a debt of some kind coming due.',
        psych: 'One of the most commonly reported dream types. What recurs is the situation of fleeing rather than the identity of the pursuer.',
        scenes: [
          { when: 'Someone chases you', reads: 'Read as postponed work or an avoided relationship.' },
          { when: 'You run but cannot move', reads: 'Taken as a situation that will not go your way.' },
          { when: 'You hide and are not found', reads: 'Taken as getting past the hard part.' },
        ],
      },
      ja: {
        name: '追われる夢', keywords: ['回避', '圧迫', '締切', '恐れ'],
        traditional: '夢占書は追われる夢を、避けている事柄や返すべきものがあることとして読みました。',
        psych: '夢内容研究で最も多く報告される型の一つです。追う者の正体より、逃げるという状況自体が反復されるのが特徴です。',
        scenes: [
          { when: '誰かに追われる', reads: '先延ばしにした事や避けている関係と読まれました。' },
          { when: '走っても体が動かない', reads: '思うようにならない状況を指すと見ました。' },
          { when: '隠れて見つからない', reads: '山場を越えると見ました。' },
        ],
      },
      zh: {
        name: '被追赶', keywords: ['回避', '压力', '期限', '恐惧'],
        traditional: '解梦书把被追赶读作有事在躲、有债要还。',
        psych: '这是内容研究中报告最多的梦型之一。反复出现的是"逃"这一处境，而非追赶者是谁。',
        scenes: [
          { when: '被人追赶', reads: '读作拖延之事或回避的关系。' },
          { when: '想跑却动不了', reads: '视为力不从心的处境。' },
          { when: '躲起来没被发现', reads: '视为过了难关。' },
        ],
      },
      fr: {
        name: 'Être poursuivi', keywords: ['évitement', 'pression', 'échéance', 'peur'],
        traditional: "Les manuels y lisent une chose que vous fuyez, ou une dette qui arrive à échéance.",
        psych: "L'un des types de rêve les plus rapportés. Ce qui revient, c'est la situation de fuite, non l'identité du poursuivant.",
        scenes: [
          { when: "Quelqu'un vous poursuit", reads: 'Lu comme un travail remis à plus tard ou une relation évitée.' },
          { when: 'Vous courez sans avancer', reads: 'Tenu pour une situation qui ne cède pas.' },
          { when: 'Vous vous cachez sans être trouvé', reads: 'Tenu pour un passage difficile franchi.' },
        ],
      },
      es: {
        name: 'Ser perseguido', keywords: ['evitación', 'presión', 'plazo', 'miedo'],
        traditional: 'Los manuales lo leen como algo que estás evitando, o una deuda que vence.',
        psych: 'Uno de los tipos de sueño más reportados. Lo que se repite es la situación de huir, no quién persigue.',
        scenes: [
          { when: 'Alguien te persigue', reads: 'Leído como trabajo aplazado o relación evitada.' },
          { when: 'Corres y no avanzas', reads: 'Se tomaba como una situación que no cede.' },
          { when: 'Te escondes y no te encuentran', reads: 'Se tomaba como superar el tramo difícil.' },
        ],
      },
    },
  },
  {
    id: 'death', emoji: '⚰️', category: 'life', related: ['teeth', 'flying', 'baby'],
    l10n: {
      ko: {
        name: '죽음', keywords: ['전환', '끝맺음', '역몽', '두려움'],
        traditional: '한국 해몽에서 죽는 꿈은 흔히 역몽(逆夢)으로 읽혀 새로 태어남·장수·경사로 보았습니다. 나쁜 꿈이 아니라는 쪽이 우세합니다.',
        psych: '죽음 꿈이 실제 죽음과 이어진다는 근거는 없습니다. 큰 변화를 앞둔 시기에 보고가 늘어난다는 관찰이 있을 뿐입니다.',
        scenes: [
          { when: '자신이 죽는다', reads: '새로 시작한다는 역몽으로 보았습니다.' },
          { when: '남이 죽는 것을 본다', reads: '그 사람과의 관계가 달라진다고 읽혔습니다.' },
          { when: '장례를 치른다', reads: '한 시기를 매듭짓는다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Death', keywords: ['transition', 'ending', 'reverse dream', 'fear'],
        traditional: 'Korean practice often reads a death dream as a reverse dream — rebirth, long life, an auspicious event. The reading is mostly not ominous.',
        psych: 'There is no evidence linking death dreams to actual death. What is observed is that reports rise around periods of major change.',
        scenes: [
          { when: 'You die', reads: 'Taken as a reverse dream: a fresh start.' },
          { when: 'You watch someone else die', reads: 'Read as a change in that relationship.' },
          { when: 'You hold a funeral', reads: 'Taken as closing out a chapter.' },
        ],
      },
      ja: {
        name: '死', keywords: ['転換', '区切り', '逆夢', '恐れ'],
        traditional: '韓国の夢解きでは死ぬ夢を逆夢として読み、生まれ変わり・長寿・慶事と見ることが多くあります。凶ではないとする読みが優勢です。',
        psych: '死の夢が実際の死と結びつくという根拠はありません。大きな変化の時期に報告が増えるという観察があるだけです。',
        scenes: [
          { when: '自分が死ぬ', reads: '新しく始まる逆夢と見ました。' },
          { when: '他人が死ぬのを見る', reads: 'その人との関係が変わると読まれました。' },
          { when: '葬儀を行う', reads: '一つの時期を区切ると見ました。' },
        ],
      },
      zh: {
        name: '死亡', keywords: ['转变', '收束', '反梦', '恐惧'],
        traditional: '朝鲜半岛的解梦常把死亡之梦读作反梦——重生、长寿、喜事。多数读法并不视为凶兆。',
        psych: '没有证据表明死亡之梦与真实死亡相连。只有一项观察：重大变动期的报告会增多。',
        scenes: [
          { when: '梦见自己死去', reads: '视为重新开始的反梦。' },
          { when: '看见他人死去', reads: '读作与那人的关系将变。' },
          { when: '办丧事', reads: '视为为一个时期收尾。' },
        ],
      },
      fr: {
        name: 'La mort', keywords: ['transition', 'clôture', 'rêve inversé', 'peur'],
        traditional: "L'usage coréen lit souvent le rêve de mort comme un rêve inversé : renaissance, longue vie, événement heureux. La lecture n'est majoritairement pas funeste.",
        psych: "Rien ne relie les rêves de mort à une mort réelle. On observe seulement que les récits augmentent autour des grands changements.",
        scenes: [
          { when: 'Vous mourez', reads: 'Tenu pour un rêve inversé : un nouveau départ.' },
          { when: "Vous voyez quelqu'un mourir", reads: 'Lu comme un changement dans cette relation.' },
          { when: 'Vous menez des funérailles', reads: "Tenu pour la clôture d'un chapitre." },
        ],
      },
      es: {
        name: 'La muerte', keywords: ['transición', 'cierre', 'sueño inverso', 'miedo'],
        traditional: 'La práctica coreana suele leer el sueño de muerte como sueño inverso: renacer, larga vida, suceso feliz. La lectura en general no es aciaga.',
        psych: 'No hay evidencia que ligue los sueños de muerte con la muerte real. Solo se observa que los relatos aumentan en épocas de gran cambio.',
        scenes: [
          { when: 'Mueres tú', reads: 'Se tomaba como sueño inverso: un comienzo nuevo.' },
          { when: 'Ves morir a alguien', reads: 'Leído como un cambio en esa relación.' },
          { when: 'Celebras un funeral', reads: 'Se tomaba como cerrar una etapa.' },
        ],
      },
    },
  },
  {
    id: 'flying', emoji: '🕊️', category: 'motion', related: ['falling', 'death'],
    l10n: {
      ko: {
        name: '나는 꿈', keywords: ['자유', '해방', '성취', '통제'],
        traditional: '해몽서에서 나는 꿈은 뜻을 펴고 이름을 얻는 일로 읽혔습니다. 높이 오를수록 좋게 보았습니다.',
        psych: '자각몽(꿈인 줄 알면서 꾸는 꿈)에서 자주 보고되는 장면입니다. 통제감이 높은 상태와 함께 나타나는 경향이 있습니다.',
        scenes: [
          { when: '높이 자유롭게 난다', reads: '뜻을 펴고 좋은 일이 있다고 보았습니다.' },
          { when: '날다가 자꾸 내려온다', reads: '뜻과 여건이 어긋난다고 읽혔습니다.' },
          { when: '날고 싶은데 못 난다', reads: '막혀 있는 상황을 가리킨다고 보았습니다.' },
        ],
      },
      en: {
        name: 'Flying', keywords: ['freedom', 'release', 'achievement', 'control'],
        traditional: 'Manuals read flying as ambition realised and a name made. The higher, the better the reading.',
        psych: 'A scene frequently reported in lucid dreams — dreams in which you know you are dreaming. It tends to co-occur with a high sense of control.',
        scenes: [
          { when: 'You fly high and freely', reads: 'Taken as ambition unfolding, good news coming.' },
          { when: 'You keep sinking while flying', reads: 'Read as intention and circumstance out of step.' },
          { when: 'You want to fly but cannot', reads: 'Taken as a situation that is blocked.' },
        ],
      },
      ja: {
        name: '空を飛ぶ夢', keywords: ['自由', '解放', '達成', '制御'],
        traditional: '夢占書では飛ぶ夢を、志を広げ名を得ることとして読みました。高く上がるほど良いと見ました。',
        psych: '明晰夢（夢と気づいて見る夢）でよく報告される場面です。制御感の高い状態と共に現れる傾向があります。',
        scenes: [
          { when: '高く自由に飛ぶ', reads: '志が広がり良い事があると見ました。' },
          { when: '飛んでも下がってしまう', reads: '志と条件が噛み合わないと読まれました。' },
          { when: '飛びたいのに飛べない', reads: '塞がった状況を指すと見ました。' },
        ],
      },
      zh: {
        name: '飞翔', keywords: ['自由', '解脱', '成就', '掌控'],
        traditional: '解梦书把飞翔读作施展抱负、扬名立身。飞得越高，读法越好。',
        psych: '这是清明梦（知道自己在做梦）中常被报告的场景，往往与较高的掌控感同时出现。',
        scenes: [
          { when: '高高地自在飞翔', reads: '视为抱负得展、有喜事将至。' },
          { when: '飞着却不断下坠', reads: '读作心志与条件不合。' },
          { when: '想飞却飞不起来', reads: '视为处境受阻。' },
        ],
      },
      fr: {
        name: 'Voler', keywords: ['liberté', 'libération', 'accomplissement', 'contrôle'],
        traditional: "Les manuels lisent le vol comme une ambition qui se déploie et un nom qui se fait. Plus haut, meilleure est la lecture.",
        psych: "Scène souvent rapportée dans les rêves lucides — ceux où l'on sait qu'on rêve. Elle accompagne volontiers un fort sentiment de contrôle.",
        scenes: [
          { when: 'Vous volez haut et librement', reads: "Tenu pour une ambition qui se déploie et de bonnes nouvelles." },
          { when: 'Vous redescendez sans cesse en volant', reads: 'Lu comme un décalage entre intention et circonstances.' },
          { when: 'Vous voulez voler sans y parvenir', reads: 'Tenu pour une situation bloquée.' },
        ],
      },
      es: {
        name: 'Volar', keywords: ['libertad', 'liberación', 'logro', 'control'],
        traditional: 'Los manuales leen el vuelo como ambición que se despliega y nombre que se gana. Cuanto más alto, mejor la lectura.',
        psych: 'Escena muy reportada en sueños lúcidos —aquellos en que sabes que sueñas—. Suele acompañar a una alta sensación de control.',
        scenes: [
          { when: 'Vuelas alto y libre', reads: 'Se tomaba como ambición que se despliega y buenas nuevas.' },
          { when: 'Vuelas pero te hundes', reads: 'Leído como desajuste entre intención y circunstancias.' },
          { when: 'Quieres volar y no puedes', reads: 'Se tomaba como una situación bloqueada.' },
        ],
      },
    },
  },
  {
    id: 'house', emoji: '🏠', category: 'place', related: ['money', 'lost'],
    l10n: {
      ko: {
        name: '집', keywords: ['기반', '가정', '자기 자신', '상태'],
        traditional: '해몽서에서 집은 나 자신과 가정의 형편으로 읽혔습니다. 집의 상태가 곧 그 사람의 형편이라는 유비입니다.',
        psych: '집은 꿈에 자주 나오는 배경입니다. 특정한 뜻보다 그 집이 어디였는지(어릴 적 집인지 지금 집인지)가 더 많은 것을 말해 줍니다.',
        scenes: [
          { when: '넓고 밝은 집에 있다', reads: '형편이 펴진다고 보았습니다.' },
          { when: '집이 무너지거나 새어 든다', reads: '기반이 흔들린다는 경고로 읽혔습니다.' },
          { when: '모르는 방을 발견한다', reads: '몰랐던 몫이 생긴다고 보았습니다.' },
        ],
      },
      en: {
        name: 'House', keywords: ['foundation', 'family', 'the self', 'condition'],
        traditional: 'Manuals read the house as yourself and the state of your household — the condition of the house standing in for the condition of the person.',
        psych: 'Houses are a frequent dream setting. Which house it was — childhood or current — usually tells you more than any fixed meaning.',
        scenes: [
          { when: 'You are in a large, bright house', reads: 'Taken as circumstances opening up.' },
          { when: 'The house collapses or leaks', reads: 'Read as a warning that your footing is unsteady.' },
          { when: 'You find a room you did not know', reads: 'Taken as a share you did not know you had.' },
        ],
      },
      ja: {
        name: '家', keywords: ['基盤', '家庭', '自分自身', '状態'],
        traditional: '夢占書では家を自分自身と家庭の有様として読みました。家の状態がその人の状態だという類比です。',
        psych: '家は夢によく出る舞台です。固定した意味より、それがどの家だったか（幼い頃の家か今の家か）のほうが多くを語ります。',
        scenes: [
          { when: '広く明るい家にいる', reads: '暮らし向きが開けると見ました。' },
          { when: '家が崩れる・雨漏りする', reads: '基盤が揺らぐ警告と読まれました。' },
          { when: '知らない部屋を見つける', reads: '知らなかった分け前ができると見ました。' },
        ],
      },
      zh: {
        name: '房子', keywords: ['根基', '家庭', '自我', '状态'],
        traditional: '解梦书把房子读作自身与家庭的状况——屋况即人况的类比。',
        psych: '房子是梦中常见的场景。比起固定含义，那是哪一处房子（童年的还是现在的）往往说明更多。',
        scenes: [
          { when: '身处宽敞明亮的房子', reads: '视为境况转好。' },
          { when: '房屋倒塌或漏雨', reads: '读作根基不稳的警示。' },
          { when: '发现从不知道的房间', reads: '视为多出一份未知的份额。' },
        ],
      },
      fr: {
        name: 'La maison', keywords: ['fondation', 'famille', 'le soi', 'état'],
        traditional: "Les manuels lisent la maison comme vous-même et l'état de votre foyer : l'état de la maison vaut pour celui de la personne.",
        psych: "La maison est un décor fréquent. Laquelle c'était — celle de l'enfance ou celle d'aujourd'hui — en dit souvent plus qu'un sens fixe.",
        scenes: [
          { when: 'Vous êtes dans une maison vaste et claire', reads: 'Tenu pour une situation qui se dégage.' },
          { when: "La maison s'effondre ou prend l'eau", reads: 'Lu comme un avertissement sur votre assise.' },
          { when: 'Vous découvrez une pièce inconnue', reads: 'Tenu pour une part que vous ignoriez avoir.' },
        ],
      },
      es: {
        name: 'La casa', keywords: ['base', 'familia', 'el yo', 'estado'],
        traditional: 'Los manuales leen la casa como uno mismo y el estado del hogar: el estado de la casa vale por el de la persona.',
        psych: 'La casa es un escenario frecuente. Cuál era —la de la infancia o la actual— suele decir más que cualquier sentido fijo.',
        scenes: [
          { when: 'Estás en una casa amplia y luminosa', reads: 'Se tomaba como circunstancias que se abren.' },
          { when: 'La casa se derrumba o gotea', reads: 'Leído como aviso sobre tu base.' },
          { when: 'Encuentras una habitación desconocida', reads: 'Se tomaba como una parte que no sabías que tenías.' },
        ],
      },
    },
  },
  {
    id: 'money', emoji: '💰', category: 'place', related: ['house', 'pig', 'blood'],
    l10n: {
      ko: {
        name: '돈', keywords: ['재물', '가치', '역몽', '불안'],
        traditional: '해몽에서 돈은 자주 역몽으로 읽혔습니다. 돈을 줍는 꿈은 오히려 나가는 일로, 잃는 꿈은 드는 일로 보는 관습이 있습니다.',
        psych: '돈 꿈이 실제 수입과 이어진다는 근거는 없습니다. 다만 돈 걱정이 큰 시기에 보고가 늘어나는 것은 연속성 가설로 설명됩니다.',
        scenes: [
          { when: '돈을 줍는다', reads: '역몽으로 보아 지출을 조심하라고 읽혔습니다.' },
          { when: '돈을 잃어버린다', reads: '오히려 들어올 일이 있다고 보았습니다.' },
          { when: '돈을 세고 또 센다', reads: '마음이 놓이지 않는 상태로 읽혔습니다.' },
        ],
      },
      en: {
        name: 'Money', keywords: ['fortune', 'value', 'reverse dream', 'worry'],
        traditional: 'Money is often read in reverse: picking money up is taken as money going out, losing it as money coming in.',
        psych: 'No evidence links money dreams to actual income. That reports rise when money worries are heavy fits the continuity hypothesis.',
        scenes: [
          { when: 'You pick up money', reads: 'Read in reverse as a warning to watch spending.' },
          { when: 'You lose money', reads: 'Taken as something coming in instead.' },
          { when: 'You count it over and over', reads: 'Read as a mind that will not settle.' },
        ],
      },
      ja: {
        name: 'お金', keywords: ['財', '価値', '逆夢', '不安'],
        traditional: '夢解きでお金はしばしば逆夢として読まれます。拾う夢は出ていく事、失う夢は入る事と見る慣習があります。',
        psych: 'お金の夢が実際の収入と結びつく根拠はありません。金銭の心配が重い時期に報告が増えるのは連続性仮説で説明されます。',
        scenes: [
          { when: 'お金を拾う', reads: '逆夢と見て出費に気をつけよと読まれました。' },
          { when: 'お金を失くす', reads: 'むしろ入る事があると見ました。' },
          { when: '何度も数え直す', reads: '心が落ち着かない状態と読まれました。' },
        ],
      },
      zh: {
        name: '钱', keywords: ['财运', '价值', '反梦', '忧虑'],
        traditional: '解梦中钱常作反梦读：拾钱视为破财，丢钱反视为进财。',
        psych: '没有证据表明梦见钱与实际收入相关。金钱压力大时报告增多，可用连续性假说解释。',
        scenes: [
          { when: '捡到钱', reads: '作反梦读，提醒留心开支。' },
          { when: '丢了钱', reads: '反而视为有进项。' },
          { when: '反复数钱', reads: '读作心神难安。' },
        ],
      },
      fr: {
        name: "L'argent", keywords: ['fortune', 'valeur', 'rêve inversé', 'souci'],
        traditional: "L'argent se lit souvent à l'envers : le ramasser vaut pour de l'argent qui sort, le perdre pour de l'argent qui entre.",
        psych: "Rien ne relie les rêves d'argent aux revenus réels. Que les récits augmentent en période de soucis d'argent relève de l'hypothèse de continuité.",
        scenes: [
          { when: "Vous ramassez de l'argent", reads: 'Lu à rebours : surveillez vos dépenses.' },
          { when: "Vous perdez de l'argent", reads: "Tenu au contraire pour une rentrée." },
          { when: 'Vous le recomptez sans fin', reads: "Lu comme un esprit qui ne se pose pas." },
        ],
      },
      es: {
        name: 'El dinero', keywords: ['fortuna', 'valor', 'sueño inverso', 'preocupación'],
        traditional: 'El dinero suele leerse al revés: recogerlo vale por dinero que sale; perderlo, por dinero que entra.',
        psych: 'Nada liga los sueños de dinero con los ingresos reales. Que los relatos aumenten en épocas de apuros encaja con la hipótesis de continuidad.',
        scenes: [
          { when: 'Recoges dinero', reads: 'Leído al revés: vigila los gastos.' },
          { when: 'Pierdes dinero', reads: 'Se tomaba, al contrario, como un ingreso.' },
          { when: 'Lo cuentas una y otra vez', reads: 'Leído como una mente que no se asienta.' },
        ],
      },
    },
  },
  {
    id: 'pig', emoji: '🐷', category: 'creature', related: ['money', 'snake'],
    l10n: {
      ko: {
        name: '돼지', keywords: ['재물', '복', '태몽', '풍요'],
        traditional: '한국에서 돼지꿈은 재물의 대표 상징입니다. 돼지를 안거나 집에 들이는 꿈을 특히 좋게 보았습니다.',
        psych: '돼지꿈과 실제 재물이 이어진다는 근거는 없습니다. 이 상징이 유독 강한 것은 한국 문화 안에서의 위치 때문입니다.',
        scenes: [
          { when: '돼지를 안는다', reads: '재물이 들어온다고 보았습니다.' },
          { when: '돼지가 집에 들어온다', reads: '복이 들어온다고 읽혔습니다.' },
          { when: '돼지를 놓친다', reads: '기회를 흘린다는 경고로 보았습니다.' },
        ],
      },
      en: {
        name: 'Pig', keywords: ['fortune', 'luck', 'conception dream', 'abundance'],
        traditional: 'In Korea the pig is the headline symbol of fortune. Holding one, or letting one into the house, was read especially well.',
        psych: 'No evidence connects pig dreams to actual gain. The symbol is unusually strong because of its place in Korean culture, not because of the animal.',
        scenes: [
          { when: 'You hold a pig', reads: 'Taken as fortune coming in.' },
          { when: 'A pig enters the house', reads: 'Read as good luck arriving.' },
          { when: 'A pig gets away from you', reads: 'Taken as letting an opportunity slip.' },
        ],
      },
      ja: {
        name: '豚', keywords: ['財', '福', '胎夢', '豊かさ'],
        traditional: '韓国では豚の夢が財の代表的な象徴です。豚を抱く、家に入れる夢を特に良いと見ました。',
        psych: '豚の夢と実際の利得が結びつく根拠はありません。この象徴が際立って強いのは韓国文化の中での位置によります。',
        scenes: [
          { when: '豚を抱く', reads: '財が入ると見ました。' },
          { when: '豚が家に入ってくる', reads: '福が入ると読まれました。' },
          { when: '豚を逃がす', reads: '機会を逃す警告と見ました。' },
        ],
      },
      zh: {
        name: '猪', keywords: ['财运', '福气', '胎梦', '丰饶'],
        traditional: '在朝鲜半岛，猪梦是财运的头号象征。抱猪、猪入门的梦尤被视为吉。',
        psych: '没有证据把猪梦与实际获利相连。这个象征之所以格外有力，来自它在韩国文化中的位置，而非动物本身。',
        scenes: [
          { when: '抱住猪', reads: '视为财运临门。' },
          { when: '猪进家门', reads: '读作福气进门。' },
          { when: '让猪跑掉', reads: '视为错失机会的警示。' },
        ],
      },
      fr: {
        name: 'Le cochon', keywords: ['fortune', 'chance', 'rêve de conception', 'abondance'],
        traditional: "En Corée, le cochon est le symbole phare de la fortune. Le tenir, ou le faire entrer chez soi, se lisait particulièrement bien.",
        psych: "Rien ne relie les rêves de cochon à un gain réel. Le symbole est si fort à cause de sa place dans la culture coréenne, non de l'animal.",
        scenes: [
          { when: 'Vous tenez un cochon', reads: 'Tenu pour une fortune qui arrive.' },
          { when: 'Un cochon entre dans la maison', reads: 'Lu comme une chance qui vient.' },
          { when: "Un cochon vous échappe", reads: 'Tenu pour une occasion laissée filer.' },
        ],
      },
      es: {
        name: 'El cerdo', keywords: ['fortuna', 'suerte', 'sueño de concepción', 'abundancia'],
        traditional: 'En Corea el cerdo es el símbolo estrella de la fortuna. Sostenerlo, o dejarlo entrar en casa, se leía especialmente bien.',
        psych: 'Nada conecta los sueños de cerdo con una ganancia real. El símbolo es tan fuerte por su lugar en la cultura coreana, no por el animal.',
        scenes: [
          { when: 'Sostienes un cerdo', reads: 'Se tomaba como fortuna que llega.' },
          { when: 'Un cerdo entra en casa', reads: 'Leído como suerte que viene.' },
          { when: 'Se te escapa un cerdo', reads: 'Se tomaba como dejar escapar una oportunidad.' },
        ],
      },
    },
  },
  {
    id: 'baby', emoji: '👶', category: 'life', related: ['snake', 'death'],
    l10n: {
      ko: {
        name: '아기', keywords: ['태몽', '시작', '돌봄', '책임'],
        traditional: '아기 꿈은 태몽으로 자주 읽혔고, 그 밖에는 새로 시작하는 일이나 돌봐야 할 것이 생긴다는 뜻으로 보았습니다.',
        psych: '태몽의 힘은 적중률이 아니라 가족이 아이를 맞이하는 이야기를 만드는 데 있습니다. 그 기능은 꿈이 맞든 아니든 작동합니다.',
        scenes: [
          { when: '아기를 안는다', reads: '새로 맡을 일이 생긴다고 보았습니다.' },
          { when: '아기가 웃는다', reads: '좋은 시작으로 읽혔습니다.' },
          { when: '아기가 우는데 달랠 수 없다', reads: '감당하기 벅찬 책임으로 보았습니다.' },
        ],
      },
      en: {
        name: 'Baby', keywords: ['conception dream', 'beginning', 'care', 'responsibility'],
        traditional: 'Baby dreams were often read as conception dreams; otherwise as something new starting, or something arriving that needs care.',
        psych: 'The power of a conception dream is not accuracy but the story it gives a family for welcoming a child. That works whether or not the dream is right.',
        scenes: [
          { when: 'You hold a baby', reads: 'Taken as a new charge coming to you.' },
          { when: 'The baby smiles', reads: 'Read as a good beginning.' },
          { when: 'The baby cries and will not settle', reads: 'Taken as a responsibility beyond your capacity.' },
        ],
      },
      ja: {
        name: '赤ん坊', keywords: ['胎夢', '始まり', '世話', '責任'],
        traditional: '赤ん坊の夢は胎夢としてよく読まれ、それ以外では新しく始まる事や世話すべきものができる意と見ました。',
        psych: '胎夢の力は的中率ではなく、家族が子を迎える物語を作る点にあります。その働きは夢が当たるかどうかと関係なく生じます。',
        scenes: [
          { when: '赤ん坊を抱く', reads: '新たに引き受ける事ができると見ました。' },
          { when: '赤ん坊が笑う', reads: '良い始まりと読まれました。' },
          { when: '泣き止ませられない', reads: '抱えきれない責任と見ました。' },
        ],
      },
      zh: {
        name: '婴儿', keywords: ['胎梦', '开始', '照料', '责任'],
        traditional: '婴儿之梦常读作胎梦；此外也视为新事将起，或有需要照料之物到来。',
        psych: '胎梦的力量不在准不准，而在于它为家庭迎接孩子提供了一段故事。这一功能与梦是否应验无关。',
        scenes: [
          { when: '抱着婴儿', reads: '视为将有新的担子。' },
          { when: '婴儿在笑', reads: '读作好的开端。' },
          { when: '婴儿哭闹哄不住', reads: '视为力不能及的责任。' },
        ],
      },
      fr: {
        name: 'Le bébé', keywords: ['rêve de conception', 'commencement', 'soin', 'responsabilité'],
        traditional: "Les rêves de bébé se lisaient souvent comme rêves de conception ; sinon comme un commencement, ou quelque chose qui arrive et demande des soins.",
        psych: "La force d'un rêve de conception n'est pas son exactitude mais le récit qu'il donne à une famille pour accueillir un enfant. Cela opère qu'il dise vrai ou non.",
        scenes: [
          { when: 'Vous tenez un bébé', reads: 'Tenu pour une charge nouvelle qui vous revient.' },
          { when: 'Le bébé sourit', reads: 'Lu comme un bon commencement.' },
          { when: 'Le bébé pleure sans se calmer', reads: 'Tenu pour une responsabilité au-dessus de vos forces.' },
        ],
      },
      es: {
        name: 'El bebé', keywords: ['sueño de concepción', 'comienzo', 'cuidado', 'responsabilidad'],
        traditional: 'Los sueños de bebé se leían a menudo como sueños de concepción; si no, como algo que empieza o que llega y pide cuidado.',
        psych: 'La fuerza del sueño de concepción no está en acertar, sino en el relato que da a una familia para recibir a un hijo. Eso funciona acierte o no.',
        scenes: [
          { when: 'Sostienes a un bebé', reads: 'Se tomaba como un nuevo encargo que te llega.' },
          { when: 'El bebé sonríe', reads: 'Leído como un buen comienzo.' },
          { when: 'El bebé llora y no se calma', reads: 'Se tomaba como una responsabilidad que te supera.' },
        ],
      },
    },
  },
  {
    id: 'exam', emoji: '📝', category: 'life', related: ['chased', 'lost', 'naked'],
    l10n: {
      ko: {
        name: '시험', keywords: ['평가', '준비 부족', '압박', '오래된 기억'],
        traditional: '해몽서는 시험 꿈을 앞둔 관문과 남의 평가로 읽었습니다.',
        psych: '학교를 떠난 지 오래인 사람도 자주 꾸는 대표적인 꿈입니다. 지금 평가받는다고 느끼는 상황이 옛 장면을 빌려 나타나는 것으로 봅니다.',
        scenes: [
          { when: '준비 없이 시험장에 앉는다', reads: '준비 부족에 대한 경고로 읽혔습니다.' },
          { when: '시험지가 백지다', reads: '내놓을 것이 없다는 압박으로 보았습니다.' },
          { when: '시간이 모자란다', reads: '쫓기는 일정과 겹쳐 읽혔습니다.' },
        ],
      },
      en: {
        name: 'Exam', keywords: ['assessment', 'unprepared', 'pressure', 'old memory'],
        traditional: 'Manuals read the exam dream as a gate ahead and the judgement of others.',
        psych: 'A classic dream reported by people who left school decades ago. It is treated as a present feeling of being judged borrowing an old scene.',
        scenes: [
          { when: 'You sit down unprepared', reads: 'Read as a warning about being unready.' },
          { when: 'The paper is blank', reads: 'Taken as the pressure of having nothing to show.' },
          { when: 'You run out of time', reads: 'Read alongside a schedule that is chasing you.' },
        ],
      },
      ja: {
        name: '試験', keywords: ['評価', '準備不足', '重圧', '古い記憶'],
        traditional: '夢占書は試験の夢を、前に控えた関門と他者の評価として読みました。',
        psych: '学校を離れて久しい人もよく見る代表的な夢です。いま評価されていると感じる状況が、古い場面を借りて現れると見ます。',
        scenes: [
          { when: '準備なしで席に着く', reads: '準備不足への警告と読まれました。' },
          { when: '答案が白紙', reads: '出せるものが無い重圧と見ました。' },
          { when: '時間が足りない', reads: '追われる日程と重ねて読まれました。' },
        ],
      },
      zh: {
        name: '考试', keywords: ['评价', '准备不足', '压力', '旧记忆'],
        traditional: '解梦书把考试之梦读作眼前的关口与他人的评断。',
        psych: '离开学校多年的人也常做的典型梦。它被视为当下"被评价"之感借用了旧场景。',
        scenes: [
          { when: '毫无准备地坐进考场', reads: '读作准备不足的警示。' },
          { when: '试卷一片空白', reads: '视为拿不出东西的压力。' },
          { when: '时间不够用', reads: '与被追赶的日程叠着读。' },
        ],
      },
      fr: {
        name: "L'examen", keywords: ['évaluation', 'impréparation', 'pression', 'vieux souvenir'],
        traditional: "Les manuels lisent le rêve d'examen comme une porte à franchir et le jugement d'autrui.",
        psych: "Un classique, rapporté par des gens sortis de l'école depuis des décennies. On y voit un sentiment présent d'être jugé qui emprunte une vieille scène.",
        scenes: [
          { when: "Vous vous asseyez sans avoir révisé", reads: "Lu comme un avertissement sur votre impréparation." },
          { when: 'La copie est blanche', reads: "Tenu pour la pression de n'avoir rien à montrer." },
          { when: 'Le temps vous manque', reads: 'Lu avec un agenda qui vous poursuit.' },
        ],
      },
      es: {
        name: 'El examen', keywords: ['evaluación', 'falta de preparación', 'presión', 'recuerdo antiguo'],
        traditional: 'Los manuales leen el sueño de examen como una puerta por pasar y el juicio ajeno.',
        psych: 'Un clásico que reportan personas que dejaron la escuela hace décadas. Se ve como una sensación actual de ser juzgado que toma prestada una escena vieja.',
        scenes: [
          { when: 'Te sientas sin haber estudiado', reads: 'Leído como aviso sobre tu falta de preparación.' },
          { when: 'La hoja está en blanco', reads: 'Se tomaba como la presión de no tener qué mostrar.' },
          { when: 'Se te acaba el tiempo', reads: 'Leído junto a una agenda que te persigue.' },
        ],
      },
    },
  },
  {
    id: 'lost', emoji: '🧭', category: 'motion', related: ['house', 'exam'],
    l10n: {
      ko: {
        name: '길 잃음', keywords: ['방향', '선택', '지연', '낯섦'],
        traditional: '해몽서는 길을 잃는 꿈을 갈피를 못 잡는 형편과 늦어지는 일로 읽었습니다.',
        psych: '목적지에 닿지 못하는 꿈은 자주 보고되는 형태입니다. 어디로 가려 했는지가 그 사람의 관심사를 드러냅니다.',
        scenes: [
          { when: '아는 길인데 낯설다', reads: '익숙하던 일이 달라졌다고 보았습니다.' },
          { when: '가도 가도 도착하지 못한다', reads: '지연되는 일로 읽혔습니다.' },
          { when: '길을 물어도 통하지 않는다', reads: '도움을 청하기 어려운 처지로 보았습니다.' },
        ],
      },
      en: {
        name: 'Getting lost', keywords: ['direction', 'choice', 'delay', 'unfamiliarity'],
        traditional: 'Manuals read losing your way as circumstances you cannot get a grip on, and as things running late.',
        psych: 'Never arriving is a frequently reported dream shape. Where you were trying to get to says more about you than the being-lost does.',
        scenes: [
          { when: 'A familiar road feels strange', reads: 'Taken as something familiar having changed.' },
          { when: 'You walk on and never arrive', reads: 'Read as a matter being delayed.' },
          { when: 'You ask directions and are not understood', reads: 'Taken as being in a place where help is hard to reach.' },
        ],
      },
      ja: {
        name: '道に迷う', keywords: ['方向', '選択', '遅れ', '不慣れ'],
        traditional: '夢占書は道に迷う夢を、見当がつかない状況と遅れる物事として読みました。',
        psych: '目的地に着けない夢はよく報告される型です。どこへ行こうとしていたかが、その人の関心を映します。',
        scenes: [
          { when: '知っている道なのに見知らぬ', reads: '慣れた事が変わったと見ました。' },
          { when: '行っても行っても着かない', reads: '遅れる物事と読まれました。' },
          { when: '道を尋ねても通じない', reads: '助けを求めにくい立場と見ました。' },
        ],
      },
      zh: {
        name: '迷路', keywords: ['方向', '选择', '延迟', '陌生'],
        traditional: '解梦书把迷路读作摸不着头绪的处境与拖延之事。',
        psych: '"到不了目的地"是常见的梦型。你本想去哪里，比"迷路"本身更能说明你的关切。',
        scenes: [
          { when: '熟路却觉陌生', reads: '视为熟悉之事已然改变。' },
          { when: '走了又走仍到不了', reads: '读作事情被拖延。' },
          { when: '问路却说不通', reads: '视为难以求助的处境。' },
        ],
      },
      fr: {
        name: 'Se perdre', keywords: ['direction', 'choix', 'retard', 'étrangeté'],
        traditional: "Les manuels lisent l'égarement comme une situation qu'on ne maîtrise pas et des affaires qui traînent.",
        psych: "Ne jamais arriver est une forme fréquemment rapportée. Où vous vouliez aller en dit plus que le fait d'être perdu.",
        scenes: [
          { when: 'Une route connue devient étrange', reads: "Tenu pour du familier qui a changé." },
          { when: "Vous marchez sans jamais arriver", reads: 'Lu comme une affaire qui prend du retard.' },
          { when: "Vous demandez votre chemin sans être compris", reads: "Tenu pour un endroit où l'aide est hors de portée." },
        ],
      },
      es: {
        name: 'Perderse', keywords: ['dirección', 'elección', 'retraso', 'extrañeza'],
        traditional: 'Los manuales leen perderse como una situación que no logras asir y asuntos que se demoran.',
        psych: 'No llegar nunca es una forma muy reportada. Adónde ibas dice más de ti que el hecho de estar perdido.',
        scenes: [
          { when: 'Un camino conocido se vuelve extraño', reads: 'Se tomaba como algo familiar que cambió.' },
          { when: 'Andas y andas sin llegar', reads: 'Leído como un asunto que se retrasa.' },
          { when: 'Preguntas y no te entienden', reads: 'Se tomaba como estar donde la ayuda no alcanza.' },
        ],
      },
    },
  },
  {
    id: 'naked', emoji: '🫥', category: 'body', related: ['teeth', 'exam'],
    l10n: {
      ko: {
        name: '알몸', keywords: ['수치', '드러남', '준비 부족', '평가'],
        traditional: '해몽서는 남 앞에서 벗은 꿈을 감추던 것이 드러나는 일로 읽었습니다.',
        psych: '문화를 가리지 않고 보고되는 꿈입니다. 특징은 꿈속 남들이 대개 무심하다는 점인데, 수치는 보는 쪽이 아니라 꾸는 쪽에서 나옵니다.',
        scenes: [
          { when: '남들 앞에서 벗고 있다', reads: '감추던 것이 드러난다고 보았습니다.' },
          { when: '아무도 신경 쓰지 않는다', reads: '걱정이 실제보다 크다는 뜻으로 읽혔습니다.' },
          { when: '가릴 것을 찾는다', reads: '준비가 덜 됐다는 신호로 보았습니다.' },
        ],
      },
      en: {
        name: 'Being naked', keywords: ['shame', 'exposure', 'unprepared', 'judgement'],
        traditional: 'Manuals read being undressed in public as something hidden coming to light.',
        psych: 'Reported across cultures. What is telling is that the onlookers are usually indifferent — the shame comes from the dreamer, not the crowd.',
        scenes: [
          { when: 'You are undressed in front of others', reads: 'Taken as something concealed being revealed.' },
          { when: 'Nobody seems to notice', reads: 'Read as the worry being larger than the reality.' },
          { when: 'You search for something to cover up', reads: 'Taken as a sign of not being ready.' },
        ],
      },
      ja: {
        name: '裸', keywords: ['羞恥', '露見', '準備不足', '評価'],
        traditional: '夢占書は人前で裸の夢を、隠していたものが露わになる事として読みました。',
        psych: '文化を問わず報告される夢です。特徴は夢の中の他人がたいてい無関心なことで、羞恥は見る側でなく見る本人から出ています。',
        scenes: [
          { when: '人前で裸でいる', reads: '隠していたものが露わになると見ました。' },
          { when: '誰も気にしていない', reads: '心配が実際より大きいと読まれました。' },
          { when: '隠すものを探す', reads: '準備が足りない印と見ました。' },
        ],
      },
      zh: {
        name: '赤身', keywords: ['羞耻', '暴露', '准备不足', '评价'],
        traditional: '解梦书把当众赤身之梦读作所藏之事被揭。',
        psych: '这是跨文化都会报告的梦。值得注意的是梦里旁人多半毫不在意——羞耻来自做梦者，而非人群。',
        scenes: [
          { when: '在人前赤身', reads: '视为所藏之事被揭。' },
          { when: '没人在意', reads: '读作忧虑大过实情。' },
          { when: '四处找东西遮挡', reads: '视为尚未准备好的信号。' },
        ],
      },
      fr: {
        name: 'Être nu', keywords: ['honte', 'exposition', 'impréparation', 'jugement'],
        traditional: "Les manuels lisent la nudité en public comme une chose cachée qui vient au jour.",
        psych: "Rapporté dans toutes les cultures. Fait notable : les témoins y sont le plus souvent indifférents — la honte vient du rêveur, pas de la foule.",
        scenes: [
          { when: 'Vous êtes nu devant les autres', reads: 'Tenu pour du dissimulé qui se révèle.' },
          { when: "Personne n'y prête attention", reads: "Lu comme un souci plus grand que la réalité." },
          { when: 'Vous cherchez de quoi vous couvrir', reads: "Tenu pour un signe que vous n'êtes pas prêt." },
        ],
      },
      es: {
        name: 'Estar desnudo', keywords: ['vergüenza', 'exposición', 'falta de preparación', 'juicio'],
        traditional: 'Los manuales leen la desnudez en público como algo oculto que sale a la luz.',
        psych: 'Se reporta en todas las culturas. Lo llamativo es que los presentes suelen ser indiferentes: la vergüenza viene del soñante, no del público.',
        scenes: [
          { when: 'Estás desnudo ante otros', reads: 'Se tomaba como lo escondido que se revela.' },
          { when: 'Nadie parece notarlo', reads: 'Leído como una preocupación mayor que la realidad.' },
          { when: 'Buscas con qué cubrirte', reads: 'Se tomaba como señal de no estar listo.' },
        ],
      },
    },
  },
  {
    id: 'blood', emoji: '🩸', category: 'body', related: ['teeth', 'money'],
    l10n: {
      ko: {
        name: '피', keywords: ['재물', '생명력', '손상', '역몽'],
        traditional: '한국 해몽에서 피는 흔히 재물로 읽혔습니다. 피를 보는 꿈을 나쁘게만 보지 않는 것이 이 전통의 특징입니다.',
        psych: '피는 강한 정서를 부르는 이미지라 잘 기억됩니다. 몸 어딘가가 아픈 상태가 꿈에 섞여 드는 경우도 있습니다.',
        scenes: [
          { when: '피를 많이 본다', reads: '재물이 든다고 보았습니다.' },
          { when: '피가 옷에 묻는다', reads: '뜻밖의 이득으로 읽히기도 했습니다.' },
          { when: '피가 멎지 않는다', reads: '기운이 새어 나가는 상태로 보았습니다.' },
        ],
      },
      en: {
        name: 'Blood', keywords: ['fortune', 'vitality', 'injury', 'reverse dream'],
        traditional: 'Korean practice often reads blood as fortune. That the sight of blood is not taken as simply bad is distinctive to this tradition.',
        psych: 'Blood is a high-affect image and is well remembered. Pain somewhere in the body can also bleed into the dream.',
        scenes: [
          { when: 'You see a great deal of blood', reads: 'Taken as fortune coming in.' },
          { when: 'Blood stains your clothes', reads: 'Sometimes read as an unexpected gain.' },
          { when: 'The bleeding will not stop', reads: 'Taken as vitality draining away.' },
        ],
      },
      ja: {
        name: '血', keywords: ['財', '生命力', '損傷', '逆夢'],
        traditional: '韓国の夢解きでは血をしばしば財として読みます。血を見る夢を悪いとだけ見ないのがこの伝統の特徴です。',
        psych: '血は強い情動を呼ぶ像で記憶に残りやすいものです。体のどこかの痛みが夢に混じることもあります。',
        scenes: [
          { when: '血をたくさん見る', reads: '財が入ると見ました。' },
          { when: '血が服につく', reads: '思わぬ利得と読まれることもありました。' },
          { when: '血が止まらない', reads: '気力が漏れ出る状態と見ました。' },
        ],
      },
      zh: {
        name: '血', keywords: ['财运', '生命力', '损伤', '反梦'],
        traditional: '朝鲜半岛的解梦常把血读作财。见血之梦不被一概视为凶，是这一传统的特点。',
        psych: '血是情绪强度高的意象，容易被记住。身体某处的疼痛也可能混入梦境。',
        scenes: [
          { when: '见到大量的血', reads: '视为财运进门。' },
          { when: '血沾到衣服上', reads: '有时读作意外之得。' },
          { when: '血止不住', reads: '视为气力外泄之状。' },
        ],
      },
      fr: {
        name: 'Le sang', keywords: ['fortune', 'vitalité', 'blessure', 'rêve inversé'],
        traditional: "L'usage coréen lit souvent le sang comme fortune. Que la vue du sang ne soit pas tenue pour simplement néfaste est propre à cette tradition.",
        psych: "Le sang est une image à forte charge, bien mémorisée. Une douleur quelque part dans le corps peut aussi s'infiltrer dans le rêve.",
        scenes: [
          { when: 'Vous voyez beaucoup de sang', reads: 'Tenu pour une fortune qui arrive.' },
          { when: 'Du sang tache vos vêtements', reads: 'Parfois lu comme un gain inattendu.' },
          { when: "Le saignement ne s'arrête pas", reads: 'Tenu pour une vitalité qui se vide.' },
        ],
      },
      es: {
        name: 'La sangre', keywords: ['fortuna', 'vitalidad', 'herida', 'sueño inverso'],
        traditional: 'La práctica coreana suele leer la sangre como fortuna. Que ver sangre no se tome como simplemente malo distingue a esta tradición.',
        psych: 'La sangre es una imagen de alta carga y se recuerda bien. Un dolor en alguna parte del cuerpo también puede colarse en el sueño.',
        scenes: [
          { when: 'Ves mucha sangre', reads: 'Se tomaba como fortuna que llega.' },
          { when: 'La sangre mancha tu ropa', reads: 'A veces leído como una ganancia inesperada.' },
          { when: 'La hemorragia no para', reads: 'Se tomaba como vitalidad que se escapa.' },
        ],
      },
    },
  },
];

export const DREAM_SYMBOL_BY_ID: Record<string, DreamSymbol> = Object.fromEntries(
  DREAM_SYMBOLS.map((s) => [s.id, s]),
);
