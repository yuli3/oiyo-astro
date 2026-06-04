import { useState, useRef, useCallback } from 'react'
import type { Locale } from '../../i18n'

type L = Locale | 'cn'

/* ─── ORACLE CARDS ─────────────────────────────────────────── */
interface OracleCard {
  id: number
  glyph: string
  title: Record<L, string>
  wisdom: Record<L, string>
  reflection: Record<L, string>
}

const DECK: OracleCard[] = [
  {
    id: 1, glyph: '✦',
    title: { ko: '탁월함', en: 'Excellence', ja: '卓越', cn: '卓越', fr: 'Excellence', es: 'Excelencia' },
    wisdom: {
      ko: '모든 것이 극치에 달한 세상에서, 평범함은 더 이상 선택지가 아니다. 인격과 지성을 함께 갈고닦아라.',
      en: 'In a world where everything reaches its peak, mediocrity is no longer an option. Cultivate both character and intellect.',
      ja: 'すべてが極みに達した世界では、平凡はもはや選択肢ではない。人格と知性を共に磨け。',
      cn: '在一切都达到极致的世界里，平庸不再是选项。同时磨砺品格与智慧。',
      fr: 'Dans un monde où tout atteint son apogée, la médiocrité n\'est plus une option. Cultivez à la fois le caractère et l\'intellect.',
      es: 'En un mundo donde todo alcanza su cima, la mediocridad ya no es opción. Cultiva el carácter y el intelecto juntos.',
    },
    reflection: {
      ko: '지금 내가 더 키워야 할 것은 인격인가, 지성인가?',
      en: 'What do I need to cultivate more right now — character or intellect?',
      ja: '今、私がより磨くべきものは人格か、知性か?',
      cn: '现在，我更需要磨砺的是品格还是智慧?',
      fr: 'Qu\'ai-je besoin de cultiver davantage maintenant — le caractère ou l\'intellect?',
      es: '¿Qué necesito cultivar más ahora — el carácter o el intelecto?',
    },
  },
  {
    id: 2, glyph: '⬡',
    title: { ko: '강직함', en: 'Integrity', ja: '剛直', cn: '刚直', fr: 'Intégrité', es: 'Integridad' },
    wisdom: {
      ko: '강직한 사람은 이익이 되지 않아도, 인기 없는 선택이어도 자신의 원칙을 지킨다. 이것이 신뢰의 뿌리다.',
      en: 'A person of integrity upholds their principles even when it is unprofitable or unpopular. This is the root of trust.',
      ja: '剛直な人は、利益にならなくても、不人気な選択でも自分の原則を守る。これが信頼の根だ。',
      cn: '刚直的人即使无利可图、不受欢迎，也坚守自己的原则。这是信任的根基。',
      fr: 'Une personne d\'intégrité maintient ses principes même quand ce n\'est pas profitable ou populaire. C\'est la racine de la confiance.',
      es: 'Una persona íntegra mantiene sus principios incluso cuando no es rentable ni popular. Esta es la raíz de la confianza.',
    },
    reflection: {
      ko: '최근 원칙과 이익 사이에서 어떤 선택을 했는가?',
      en: 'What choice have I made recently between principle and profit?',
      ja: '最近、原則と利益の間でどんな選択をしたか?',
      cn: '最近，我在原则与利益之间做了什么选择?',
      fr: 'Quel choix ai-je fait récemment entre le principe et le profit?',
      es: '¿Qué elección he hecho recientemente entre principio y beneficio?',
    },
  },
  {
    id: 3, glyph: '◯',
    title: { ko: '침묵의 힘', en: 'Power of Silence', ja: '沈黙の力', cn: '沉默之力', fr: 'Pouvoir du Silence', es: 'Poder del Silencio' },
    wisdom: {
      ko: '말이 많으면 약점이 드러난다. 현명한 자는 적게 말하고 많이 관찰한다. 침묵은 힘이자 방패다.',
      en: 'Too many words reveal weakness. The wise speak little and observe much. Silence is both power and shield.',
      ja: '言葉が多いと弱点が露わになる。賢者は少なく話し、多く観察する。沈黙は力であり盾でもある。',
      cn: '话多则露弱点。智者少言多观察。沉默既是力量，也是盾牌。',
      fr: 'Trop de mots révèlent la faiblesse. Les sages parlent peu et observent beaucoup. Le silence est à la fois pouvoir et bouclier.',
      es: 'Demasiadas palabras revelan debilidad. Los sabios hablan poco y observan mucho. El silencio es poder y escudo.',
    },
    reflection: {
      ko: '오늘 말하지 않아도 되었을 것을 나는 말했는가?',
      en: 'Did I say today what could have been left unsaid?',
      ja: '今日、言わなくてもよかったことを言ったか?',
      cn: '今天，我是否说了本可不说的话?',
      fr: 'Ai-je dit aujourd\'hui ce qui aurait pu rester non-dit?',
      es: '¿Dije hoy lo que podría haberse dejado sin decir?',
    },
  },
  {
    id: 4, glyph: '◈',
    title: { ko: '신중함', en: 'Prudence', ja: '慎重', cn: '谨慎', fr: 'Prudence', es: 'Prudencia' },
    wisdom: {
      ko: '행동하기 전에 두 번 생각하라. 신중함은 용기의 반대가 아니라, 용기를 더 오래 유지하는 방법이다.',
      en: 'Think twice before acting. Prudence is not the opposite of courage — it is the way to sustain courage longer.',
      ja: '行動する前に二度考えよ。慎重さは勇気の反対ではなく、勇気をより長く保つ方法だ。',
      cn: '行动前三思而后行。谨慎不是勇气的对立面，而是让勇气更持久的方法。',
      fr: 'Réfléchissez deux fois avant d\'agir. La prudence n\'est pas l\'opposé du courage — c\'est le moyen de maintenir le courage plus longtemps.',
      es: 'Piensa dos veces antes de actuar. La prudencia no es lo opuesto al coraje — es la forma de sostenerlo más tiempo.',
    },
    reflection: {
      ko: '지금 서두르고 있는 결정이 있다면, 무엇이 나를 재촉하는가?',
      en: 'If I am rushing a decision, what is driving my haste?',
      ja: '今急いで決めようとしていることがあれば、何が私を急かせているのか?',
      cn: '如果我正在匆忙做决定，是什么在催促我?',
      fr: 'Si je précipite une décision, qu\'est-ce qui me pousse à me dépêcher?',
      es: '¿Si estoy apresurando una decisión, qué me impulsa a hacerlo?',
    },
  },
  {
    id: 5, glyph: '⌛',
    title: { ko: '때를 아는 지혜', en: 'Knowing the Moment', ja: '時を知る知恵', cn: '识时务', fr: 'Sagesse du Moment', es: 'Sabiduría del Momento' },
    wisdom: {
      ko: '가장 훌륭한 행동도 잘못된 시간에 행해지면 실패한다. 기다릴 줄 아는 것이 가장 어려운 기술이다.',
      en: 'Even the finest action fails if done at the wrong time. Knowing when to wait is the hardest skill.',
      ja: '最も優れた行動も、間違った時に行えば失敗する。待つことを知るのが最も難しい技術だ。',
      cn: '即使最优秀的行动，在错误的时机也会失败。知道何时等待是最难的技艺。',
      fr: 'Même la meilleure action échoue si elle est faite au mauvais moment. Savoir quand attendre est la compétence la plus difficile.',
      es: 'Incluso la mejor acción fracasa si se hace en el momento equivocado. Saber cuándo esperar es la habilidad más difícil.',
    },
    reflection: {
      ko: '지금 나는 때를 기다리고 있는가, 아니면 때가 지났는가?',
      en: 'Am I waiting for the right moment, or has my moment already passed?',
      ja: '今、私は時を待っているのか、それとも時は過ぎてしまったのか?',
      cn: '我现在是在等待时机，还是时机已经过去?',
      fr: 'Est-ce que j\'attends le bon moment, ou mon moment est-il déjà passé?',
      es: '¿Estoy esperando el momento correcto, o mi momento ya ha pasado?',
    },
  },
  {
    id: 6, glyph: '☽',
    title: { ko: '자기 이해', en: 'Self-Knowledge', ja: '自己理解', cn: '自知', fr: 'Connaissance de Soi', es: 'Autoconocimiento' },
    wisdom: {
      ko: '자신의 강점과 약점을 아는 자는 결코 오판하지 않는다. 자기 이해는 모든 지혜의 시작이다.',
      en: 'One who knows their strengths and weaknesses never misjudges themselves. Self-knowledge is the beginning of all wisdom.',
      ja: '自分の強みと弱みを知る者は決して判断を誤らない。自己理解はすべての知恵の始まりだ。',
      cn: '了解自己优势与弱点的人永不误判自己。自知是所有智慧的开始。',
      fr: 'Celui qui connaît ses forces et faiblesses ne se juge jamais mal. La connaissance de soi est le début de toute sagesse.',
      es: 'Quien conoce sus fortalezas y debilidades nunca se juzga mal. El autoconocimiento es el inicio de toda sabiduría.',
    },
    reflection: {
      ko: '내가 가장 과소평가하는 나의 강점은 무엇인가?',
      en: 'What strength of mine do I most underestimate?',
      ja: '私が最も過小評価している自分の強みは何か?',
      cn: '我最低估的自身优势是什么?',
      fr: 'Quelle est la force que je sous-estime le plus en moi?',
      es: '¿Cuál es la fortaleza que más subestimo en mí?',
    },
  },
  {
    id: 7, glyph: '◇',
    title: { ko: '평판의 관리', en: 'Reputation', ja: '評判の管理', cn: '声誉管理', fr: 'Gestion de la Réputation', es: 'Gestión de la Reputación' },
    wisdom: {
      ko: '평판은 쌓는 데 평생이 걸리고 잃는 데는 한 순간이다. 그러나 평판을 두려워하지 말고, 그것을 자유롭게 하는 데 써라.',
      en: 'Reputation takes a lifetime to build and a moment to lose. But do not fear it — use it to set yourself free.',
      ja: '評判を築くには一生かかり、失うには一瞬だ。しかし評判を恐れるな――それを自分を解放するために使え。',
      cn: '建立声誉需要一生，失去只需一瞬。但不要畏惧声誉，而要用它来获得自由。',
      fr: 'Construire une réputation prend une vie, la perdre ne prend qu\'un instant. Mais ne la craignez pas — utilisez-la pour vous libérer.',
      es: 'Construir una reputación toma toda una vida; perderla, solo un momento. Pero no la temas — úsala para liberarte.',
    },
    reflection: {
      ko: '나의 평판이 내가 원하는 방향으로 형성되고 있는가?',
      en: 'Is my reputation forming in the direction I want?',
      ja: '私の評判は望む方向に形成されているか?',
      cn: '我的声誉正在向我希望的方向发展吗?',
      fr: 'Ma réputation se forme-t-elle dans la direction que je souhaite?',
      es: '¿Mi reputación se está formando en la dirección que quiero?',
    },
  },
  {
    id: 8, glyph: '∞',
    title: { ko: '인내', en: 'Endurance', ja: '忍耐', cn: '忍耐', fr: 'Endurance', es: 'Perseverancia' },
    wisdom: {
      ko: '인내는 시간을 이긴다. 서두르지 않아도 되는 일에 서두르는 것이 가장 큰 낭비다. 기다림도 행동이다.',
      en: 'Patience conquers time. Rushing what need not be rushed is the greatest waste. Waiting is also action.',
      ja: '忍耐は時間に勝つ。急ぐ必要のないことを急ぐのが最大の浪費だ。待つことも行動だ。',
      cn: '忍耐征服时间。急于不必急的事是最大的浪费。等待也是行动。',
      fr: 'La patience conquiert le temps. Se précipiter là où ce n\'est pas nécessaire est le plus grand gaspillage. Attendre, c\'est aussi agir.',
      es: 'La paciencia conquista el tiempo. Apresurarse en lo que no requiere prisa es el mayor desperdicio. Esperar también es acción.',
    },
    reflection: {
      ko: '나는 지금 기다려야 할 것을 서두르고 있지 않은가?',
      en: 'Am I rushing something that deserves patience?',
      ja: '今、私は待つべきことを急いでいないか?',
      cn: '我现在是否在急于本应等待的事情?',
      fr: 'Est-ce que je précipite quelque chose qui mérite de la patience?',
      es: '¿Estoy apresurando algo que merece paciencia?',
    },
  },
  {
    id: 9, glyph: '⌾',
    title: { ko: '단순함', en: 'Simplicity', ja: '単純さ', cn: '简单', fr: 'Simplicité', es: 'Simplicidad' },
    wisdom: {
      ko: '복잡함은 종종 무지의 다른 이름이다. 진정으로 이해한 것은 단순하게 설명할 수 있다. 단순함이 숙달의 증거다.',
      en: 'Complexity is often another name for ignorance. What is truly understood can be explained simply. Simplicity is the mark of mastery.',
      ja: '複雑さはしばしば無知の別名だ。真に理解されたことはシンプルに説明できる。単純さが習得の証拠だ。',
      cn: '复杂往往是无知的另一个名字。真正理解的事情可以简单解释。简单是精通的标志。',
      fr: 'La complexité est souvent un autre nom pour l\'ignorance. Ce qui est vraiment compris peut être expliqué simplement. La simplicité est la marque de la maîtrise.',
      es: 'La complejidad es a menudo otro nombre para la ignorancia. Lo que se comprende verdaderamente puede explicarse simplemente. La simplicidad es la marca del dominio.',
    },
    reflection: {
      ko: '지금 내가 복잡하게 만들고 있는 것이 실은 단순한 문제는 아닌가?',
      en: 'Am I complicating something that is actually simple?',
      ja: '今、私は実はシンプルな問題を複雑にしていないか?',
      cn: '我现在是否把一个简单的问题复杂化了?',
      fr: 'Est-ce que je complique quelque chose qui est en fait simple?',
      es: '¿Estoy complicando algo que en realidad es simple?',
    },
  },
  {
    id: 10, glyph: '◉',
    title: { ko: '사람을 아는 법', en: 'Knowing People', ja: '人を知る法', cn: '识人之道', fr: 'Connaitre les Gens', es: 'Conocer a las Personas' },
    wisdom: {
      ko: '사람을 말이 아닌 행동으로 판단하라. 말은 포장이고, 행동이 진실이다. 위기의 순간에 진짜 사람이 드러난다.',
      en: 'Judge people by their actions, not their words. Words are wrapping; actions are the truth. Who someone truly is emerges in moments of crisis.',
      ja: '人を言葉ではなく行動で判断せよ。言葉は包装紙であり、行動が真実だ。危機の瞬間に本当の人が現れる。',
      cn: '以行为而非言语判断人。话语是包装，行动才是真相。危机时刻才能看出真正的人。',
      fr: 'Jugez les gens par leurs actes, pas leurs mots. Les mots sont l\'emballage; les actes sont la vérité. La vraie personnalité émerge dans les moments de crise.',
      es: 'Juzga a las personas por sus acciones, no sus palabras. Las palabras son el envoltorio; las acciones son la verdad. Quién es alguien realmente emerge en momentos de crisis.',
    },
    reflection: {
      ko: '최근 내가 행동보다 말에 더 주의를 기울인 상황이 있었는가?',
      en: 'Have I recently paid more attention to words than actions?',
      ja: '最近、行動よりも言葉に注意を向けすぎた状況があったか?',
      cn: '最近，我是否在某些情况下更关注言语而非行动?',
      fr: 'Ai-je récemment accordé plus d\'attention aux mots qu\'aux actes?',
      es: '¿He prestado recientemente más atención a las palabras que a las acciones?',
    },
  },
  {
    id: 11, glyph: '⟁',
    title: { ko: '역경의 의미', en: 'Meaning in Adversity', ja: '逆境の意味', cn: '逆境之意', fr: 'Sens dans l\'Adversité', es: 'Significado en la Adversidad' },
    wisdom: {
      ko: '역경은 사람의 진가를 드러내는 시험대다. 쉬운 상황에서 발휘된 능력은 평범하지만, 어려운 상황을 극복한 능력은 위대하다.',
      en: 'Adversity is the testing ground that reveals a person\'s true worth. Ability shown in easy times is ordinary; ability that overcomes hardship is great.',
      ja: '逆境は人の真価を明らかにする試練の場だ。容易な状況で発揮された能力は平凡だが、困難を乗り越えた能力は偉大だ。',
      cn: '逆境是显示人真正价值的试金石。在顺境中展现的能力是平凡的，但克服困难的能力是伟大的。',
      fr: 'L\'adversité est l\'épreuve qui révèle la vraie valeur d\'une personne. La capacité montrée en temps facile est ordinaire; la capacité qui surmonte les difficultés est grande.',
      es: 'La adversidad es la prueba que revela el verdadero valor de una persona. La capacidad mostrada en tiempos fáciles es ordinaria; la que supera dificultades es grande.',
    },
    reflection: {
      ko: '지금의 어려움이 나에게 어떤 능력을 키워주고 있는가?',
      en: 'What capacity is my current difficulty building in me?',
      ja: '今の困難は、私にどんな能力を育てているか?',
      cn: '当前的困难正在培养我哪方面的能力?',
      fr: 'Quelle capacité ma difficulté actuelle construit-elle en moi?',
      es: '¿Qué capacidad está construyendo en mí mi dificultad actual?',
    },
  },
  {
    id: 12, glyph: '⬢',
    title: { ko: '감정의 통제', en: 'Mastering Emotions', ja: '感情の統制', cn: '情绪掌控', fr: 'Maîtrise des Émotions', es: 'Control de Emociones' },
    wisdom: {
      ko: '감정을 통제하는 자가 상황을 통제한다. 화는 독이고, 냉정함은 무기다. 가장 강한 자는 감정을 숨기는 자가 아니라, 다스리는 자다.',
      en: 'Those who master their emotions master situations. Anger is poison; composure is a weapon. The strongest are not those who hide their feelings, but those who govern them.',
      ja: '感情を制する者が状況を制する。怒りは毒であり、冷静さは武器だ。最も強い者は感情を隠す者ではなく、それを統治する者だ。',
      cn: '掌控情绪者掌控局势。愤怒是毒药，冷静是武器。最强的人不是隐藏情感的人，而是驾驭情感的人。',
      fr: 'Ceux qui maîtrisent leurs émotions maîtrisent les situations. La colère est un poison; la sérénité est une arme. Les plus forts ne sont pas ceux qui cachent leurs sentiments, mais ceux qui les gouvernent.',
      es: 'Quienes dominan sus emociones dominan las situaciones. La ira es veneno; la calma es un arma. Los más fuertes no son quienes ocultan sus sentimientos, sino quienes los gobiernan.',
    },
    reflection: {
      ko: '오늘 어떤 감정이 나의 판단을 흐리게 했는가?',
      en: 'What emotion clouded my judgment today?',
      ja: '今日、どんな感情が自分の判断を曇らせたか?',
      cn: '今天，哪种情绪影响了我的判断?',
      fr: 'Quelle émotion a obscurci mon jugement aujourd\'hui?',
      es: '¿Qué emoción nubló mi juicio hoy?',
    },
  },
  {
    id: 13, glyph: '⊕',
    title: { ko: '선택의 기술', en: 'Art of Choice', ja: '選択の技術', cn: '选择之道', fr: 'Art du Choix', es: 'Arte de Elegir' },
    wisdom: {
      ko: '삶은 선택의 연속이다. 좋은 선택은 두 번 이상 생각하고, 나쁜 선택은 한 번만 생각하는 데서 갈린다. 포기하는 것도 선택이다.',
      en: 'Life is a series of choices. Good choices come from thinking twice; poor ones from thinking once. Even renouncing is a choice.',
      ja: '人生は選択の連続だ。良い選択は二度以上考え、悪い選択は一度しか考えないところから分かれる。諦めることも選択だ。',
      cn: '生命是一系列的选择。好的选择来自深思熟虑，差的选择来自一时冲动。放弃也是一种选择。',
      fr: 'La vie est une série de choix. Les bons viennent de réfléchir deux fois; les mauvais de n\'y réfléchir qu\'une fois. Même renoncer est un choix.',
      es: 'La vida es una serie de elecciones. Las buenas vienen de pensar dos veces; las malas, de pensar solo una. Incluso renunciar es una elección.',
    },
    reflection: {
      ko: '지금 내가 피하고 있는 선택은 무엇이고, 왜 피하고 있는가?',
      en: 'What choice am I avoiding, and why?',
      ja: '今、私が避けている選択は何で、なぜ避けているのか?',
      cn: '我现在在回避什么选择，为什么?',
      fr: 'Quel choix est-ce que j\'évite, et pourquoi?',
      es: '¿Qué elección estoy evitando y por qué?',
    },
  },
  {
    id: 14, glyph: '⟐',
    title: { ko: '관계의 지혜', en: 'Wisdom in Bonds', ja: '人間関係の知恵', cn: '关系之道', fr: 'Sagesse des Liens', es: 'Sabiduría en Vínculos' },
    wisdom: {
      ko: '좋은 관계는 많은 것을 주고받는 것이 아니라, 서로의 최선을 끌어내는 것이다. 주변 사람이 나를 만든다.',
      en: 'Good relationships are not about giving and receiving much — they are about drawing out the best in each other. Those around us shape who we are.',
      ja: '良い関係は多くを与え受けることではなく、お互いの最善を引き出すことだ。周りの人が自分を形成する。',
      cn: '好的关系不在于给予和索取，而在于激发彼此的最佳状态。周围的人塑造了你。',
      fr: 'Les bonnes relations ne consistent pas à donner et recevoir beaucoup — elles consistent à faire ressortir le meilleur de l\'autre. Notre entourage façonne qui nous sommes.',
      es: 'Las buenas relaciones no se tratan de dar y recibir mucho — se tratan de sacar lo mejor de cada uno. Quienes nos rodean nos moldean.',
    },
    reflection: {
      ko: '내 주변 사람들이 나의 어떤 모습을 이끌어내고 있는가?',
      en: 'What side of me are the people around me drawing out?',
      ja: '周りの人は、私のどんな面を引き出しているか?',
      cn: '我周围的人正在激发我哪方面的特质?',
      fr: 'Quel aspect de moi les personnes qui m\'entourent font-elles ressortir?',
      es: '¿Qué lado de mí están sacando las personas que me rodean?',
    },
  },
  {
    id: 15, glyph: '⟲',
    title: { ko: '변화', en: 'Transformation', ja: '変容', cn: '变化', fr: 'Transformation', es: 'Transformación' },
    wisdom: {
      ko: '변화를 두려워하는 자는 성장하지 못한다. 그러나 변해야 할 것과 지켜야 할 것을 구분하는 것이 지혜다.',
      en: 'Those who fear change cannot grow. But wisdom lies in discerning what must change and what must be preserved.',
      ja: '変化を恐れる者は成長できない。しかし、変えるべきことと守るべきことを見分けることが知恵だ。',
      cn: '惧怕变化的人无法成长。但智慧在于辨别什么必须改变，什么必须保留。',
      fr: 'Ceux qui craignent le changement ne peuvent grandir. Mais la sagesse réside dans la distinction entre ce qui doit changer et ce qui doit être préservé.',
      es: 'Quienes temen el cambio no pueden crecer. Pero la sabiduría está en discernir qué debe cambiar y qué debe preservarse.',
    },
    reflection: {
      ko: '지금 내 삶에서 변화가 필요한 것과 지켜야 할 것은 무엇인가?',
      en: 'In my life right now, what needs to change and what needs to be preserved?',
      ja: '今の私の生活で、変える必要があるものと守るべきものは何か?',
      cn: '在我现在的生活中，什么需要改变，什么需要保留?',
      fr: 'Dans ma vie en ce moment, qu\'est-ce qui doit changer et qu\'est-ce qui doit être préservé?',
      es: '¿Qué necesita cambiar en mi vida y qué necesita preservarse?',
    },
  },
  {
    id: 16, glyph: '⌂',
    title: { ko: '내면의 질서', en: 'Inner Order', ja: '内なる秩序', cn: '内在秩序', fr: 'Ordre Intérieur', es: 'Orden Interior' },
    wisdom: {
      ko: '외부 세계를 통제하려면 먼저 내면의 질서를 확립하라. 내면이 혼란한 자는 환경을 탓하지만, 내면이 정돈된 자는 환경을 만든다.',
      en: 'To control the outer world, first establish inner order. Those in inner chaos blame their environment; those with inner order shape it.',
      ja: '外の世界を制するには、まず内面の秩序を確立せよ。内面が混乱している者は環境を責めるが、内面が整っている者は環境を作り出す。',
      cn: '要控制外部世界，首先建立内在秩序。内心混乱的人怨天尤人，内心有序的人创造环境。',
      fr: 'Pour contrôler le monde extérieur, établissez d\'abord l\'ordre intérieur. Ceux en chaos intérieur blâment leur environnement; ceux avec un ordre intérieur le façonnent.',
      es: 'Para controlar el mundo exterior, establece primero el orden interior. Quienes tienen caos interior culpan a su entorno; quienes tienen orden interior lo moldean.',
    },
    reflection: {
      ko: '나의 내면은 지금 얼마나 정돈되어 있는가?',
      en: 'How ordered is my inner world right now?',
      ja: '今、私の内面はどれだけ整っているか?',
      cn: '我现在的内心有多有序?',
      fr: 'À quel point mon monde intérieur est-il ordonné en ce moment?',
      es: '¿Qué tan ordenado está mi mundo interior en este momento?',
    },
  },
  {
    id: 17, glyph: '✧',
    title: { ko: '말의 힘', en: 'Power of Words', ja: '言葉の力', cn: '言语之力', fr: 'Pouvoir des Mots', es: 'Poder de las Palabras' },
    wisdom: {
      ko: '말은 창이기도 하고 방패이기도 하다. 말로 사람을 세울 수도, 무너뜨릴 수도 있다. 한 번 뱉은 말은 주울 수 없다.',
      en: 'Words are both spear and shield. They can build or destroy a person. Once spoken, words cannot be retrieved.',
      ja: '言葉は槍でもあり盾でもある。言葉で人を立てることも、壊すこともできる。一度発した言葉は取り戻せない。',
      cn: '语言既是矛也是盾。话语可以成就一个人，也可以摧毁一个人。说出的话无法收回。',
      fr: 'Les mots sont à la fois lance et bouclier. Ils peuvent construire ou détruire une personne. Une fois prononcés, les mots ne peuvent être repris.',
      es: 'Las palabras son tanto lanza como escudo. Pueden construir o destruir a una persona. Una vez dichas, las palabras no pueden recuperarse.',
    },
    reflection: {
      ko: '오늘 내가 한 말 중에서 취소하고 싶은 말이 있는가?',
      en: 'Is there something I said today that I wish I could take back?',
      ja: '今日言ったことの中で、取り消したいことはあるか?',
      cn: '今天，我说了什么希望可以收回的话?',
      fr: 'Y a-t-il quelque chose que j\'ai dit aujourd\'hui que je voudrais reprendre?',
      es: '¿Hay algo que dije hoy que desearía poder retirar?',
    },
  },
  {
    id: 18, glyph: '⊿',
    title: { ko: '미래를 위한 준비', en: 'Preparing for Tomorrow', ja: '明日への準備', cn: '为未来做准备', fr: 'Se Préparer pour Demain', es: 'Prepararse para el Mañana' },
    wisdom: {
      ko: '오늘의 준비가 내일의 기회를 만든다. 성공한 사람들은 운이 좋은 게 아니라, 준비가 되어 있었을 때 기회가 왔을 뿐이다.',
      en: 'Today\'s preparation creates tomorrow\'s opportunity. Successful people are not luckier — they were simply prepared when opportunity arrived.',
      ja: '今日の準備が明日の機会を作る。成功した人は運が良かったのではなく、準備ができているときに機会が来ただけだ。',
      cn: '今天的准备创造明天的机会。成功的人并不是运气好，只是机会来临时他们已经做好了准备。',
      fr: 'La préparation d\'aujourd\'hui crée l\'opportunité de demain. Les gens qui réussissent ne sont pas plus chanceux — ils étaient simplement préparés quand l\'opportunité est arrivée.',
      es: 'La preparación de hoy crea la oportunidad de mañana. Las personas exitosas no tienen más suerte — simplemente estaban preparadas cuando llegó la oportunidad.',
    },
    reflection: {
      ko: '나는 다가올 기회를 위해 지금 무엇을 준비하고 있는가?',
      en: 'What am I preparing now for the opportunities ahead?',
      ja: '今、来る機会に備えて何を準備しているか?',
      cn: '我现在正在为即将到来的机会做什么准备?',
      fr: 'Que suis-je en train de préparer maintenant pour les opportunités à venir?',
      es: '¿Qué estoy preparando ahora para las oportunidades que vienen?',
    },
  },
  {
    id: 19, glyph: '☀',
    title: { ko: '승리의 품격', en: 'Grace in Victory', ja: '勝利の品格', cn: '胜利之格', fr: 'Grâce dans la Victoire', es: 'Gracia en la Victoria' },
    wisdom: {
      ko: '적을 완전히 굴복시키려 하지 마라. 패배한 자에게도 존엄을 허하라. 관대함이 더 오래가는 승리를 만든다.',
      en: 'Do not seek to utterly crush your opponent. Allow even the defeated their dignity. Generosity creates a victory that lasts longer.',
      ja: '敵を完全に屈服させようとするな。敗れた者にも尊厳を許せ。寛大さがより長続きする勝利を生む。',
      cn: '不要试图彻底击垮对手。即使是失败者也应保留尊严。慷慨创造持久的胜利。',
      fr: 'Ne cherchez pas à écraser complètement votre adversaire. Accordez même aux vaincus leur dignité. La générosité crée une victoire qui dure plus longtemps.',
      es: 'No busques aplastar completamente a tu oponente. Permite incluso a los vencidos conservar su dignidad. La generosidad crea una victoria que dura más.',
    },
    reflection: {
      ko: '나는 최근 승리했을 때 상대를 어떻게 대했는가?',
      en: 'How did I treat those I overcame in a recent victory?',
      ja: '最近、勝利したとき、相手をどのように扱ったか?',
      cn: '最近我胜利时，是如何对待对手的?',
      fr: 'Comment ai-je traité ceux que j\'ai dépassés lors d\'une récente victoire?',
      es: '¿Cómo traté a quienes superé en una victoria reciente?',
    },
  },
  {
    id: 20, glyph: '⚡',
    title: { ko: '진정한 용기', en: 'True Courage', ja: '真の勇気', cn: '真正的勇气', fr: 'Vrai Courage', es: 'Verdadero Valor' },
    wisdom: {
      ko: '용기는 두려움의 부재가 아니다. 두려움을 느끼면서도 옳은 일을 하는 것이 진정한 용기다. 겁쟁이와 영웅은 같은 두려움을 느낀다.',
      en: 'Courage is not the absence of fear. Doing what is right while feeling afraid — that is true courage. Cowards and heroes feel the same fear.',
      ja: '勇気は恐れの不在ではない。恐れを感じながらも正しいことをすること――それが真の勇気だ。臆病者と英雄は同じ恐れを感じる。',
      cn: '勇气不是没有恐惧。在感到害怕的同时做正确的事——那才是真正的勇气。懦夫和英雄感受着同样的恐惧。',
      fr: 'Le courage n\'est pas l\'absence de peur. Faire ce qui est juste malgré la peur — c\'est le vrai courage. Les lâches et les héros ressentent la même peur.',
      es: 'El valor no es la ausencia de miedo. Hacer lo correcto mientras se siente miedo — eso es el verdadero valor. Los cobardes y los héroes sienten el mismo miedo.',
    },
    reflection: {
      ko: '지금 두려움 때문에 미루고 있는 옳은 행동이 있는가?',
      en: 'Is there a right action I am postponing because of fear?',
      ja: '今、恐れのために先延ばしにしている正しい行動はあるか?',
      cn: '现在，有什么正确的行动因为恐惧而被推迟吗?',
      fr: 'Y a-t-il une action juste que je reporte à cause de la peur?',
      es: '¿Hay alguna acción correcta que esté posponiendo por miedo?',
    },
  },
  {
    id: 21, glyph: '⊚',
    title: { ko: '조화', en: 'Harmony', ja: '調和', cn: '和谐', fr: 'Harmonie', es: 'Armonía' },
    wisdom: {
      ko: '극단은 언제나 위험하다. 너무 많아도, 너무 적어도 문제다. 조화 속에 지혜가 있고, 균형 속에 아름다움이 있다.',
      en: 'Extremes are always dangerous. Too much or too little both cause problems. Wisdom lives in harmony; beauty lives in balance.',
      ja: '極端は常に危険だ。多すぎても少なすぎても問題だ。調和の中に知恵があり、均衡の中に美がある。',
      cn: '极端总是危险的。太多或太少都会产生问题。智慧存在于和谐之中，美存在于平衡之中。',
      fr: 'Les extrêmes sont toujours dangereux. Trop ou trop peu posent tous deux problème. La sagesse vit dans l\'harmonie; la beauté vit dans l\'équilibre.',
      es: 'Los extremos siempre son peligrosos. Demasiado o muy poco ambos causan problemas. La sabiduría vive en la armonía; la belleza vive en el equilibrio.',
    },
    reflection: {
      ko: '지금 내 삶에서 어느 영역이 균형을 잃고 있는가?',
      en: 'In what area of my life is balance being lost right now?',
      ja: '今、私の生活のどの領域が均衡を失っているか?',
      cn: '我生活中哪个领域正在失去平衡?',
      fr: 'Dans quel domaine de ma vie l\'équilibre se perd-il en ce moment?',
      es: '¿En qué área de mi vida se está perdiendo el equilibrio ahora?',
    },
  },
  {
    id: 22, glyph: '⟳',
    title: { ko: '귀환', en: 'Return', ja: '帰還', cn: '回归', fr: 'Retour', es: 'Regreso' },
    wisdom: {
      ko: '모든 위대한 여정은 출발점으로 돌아온다. 그러나 같은 곳으로 돌아오는 것이 아니라, 더 넓은 시야를 가진 사람으로 돌아온다.',
      en: 'Every great journey returns to its starting point. But you do not return to the same place — you return as a person with a wider view.',
      ja: 'すべての偉大な旅は出発点に戻る。しかし同じ場所に戻るのではなく、より広い視野を持った人として戻る。',
      cn: '每一段伟大的旅程都回到起点。但你不是回到同一个地方——而是以一个视野更宽广的人的身份回来。',
      fr: 'Tout grand voyage revient à son point de départ. Mais vous ne retournez pas au même endroit — vous revenez en tant que personne avec une vue plus large.',
      es: 'Todo gran viaje regresa a su punto de partida. Pero no regresas al mismo lugar — regresas como una persona con una visión más amplia.',
    },
    reflection: {
      ko: '내가 떠나왔던 곳으로 지금 돌아간다면, 나는 어떻게 달라져 있는가?',
      en: 'If I returned to where I started, how would I be different now?',
      ja: '出発した場所に今戻るとすれば、自分はどう変わっているか?',
      cn: '如果我现在回到出发的地方，我有什么不同?',
      fr: 'Si je retournais à mon point de départ, en quoi serais-je différent maintenant?',
      es: '¿Si volviera a donde empecé, en qué sería diferente ahora?',
    },
  },
]

/* ─── SPREAD CONFIG ──────────────────────────────────────────── */
type SpreadKey = 'single' | 'past-present-future' | 'body-mind-spirit'

const SPREADS: Record<SpreadKey, { roles: Record<L, string[]>; label: Record<L, string> }> = {
  single: {
    label: { ko: '한 장 뽑기', en: 'One Card', ja: '一枚引き', cn: '单张', fr: 'Une Carte', es: 'Una Carta' },
    roles: {
      ko: ['지금 이 순간'], en: ['This Moment'], ja: ['今この瞬間'],
      cn: ['此刻'], fr: ['Ce Moment'], es: ['Este Momento'],
    },
  },
  'past-present-future': {
    label: { ko: '과거·현재·미래', en: 'Past · Present · Future', ja: '過去·現在·未来', cn: '过去·现在·未来', fr: 'Passé · Présent · Futur', es: 'Pasado · Presente · Futuro' },
    roles: {
      ko: ['과거', '현재', '미래'], en: ['Past', 'Present', 'Future'], ja: ['過去', '現在', '未来'],
      cn: ['过去', '现在', '未来'], fr: ['Passé', 'Présent', 'Futur'], es: ['Pasado', 'Presente', 'Futuro'],
    },
  },
  'body-mind-spirit': {
    label: { ko: '몸·마음·정신', en: 'Body · Mind · Spirit', ja: '体·心·精神', cn: '身·心·灵', fr: 'Corps · Esprit · Âme', es: 'Cuerpo · Mente · Espíritu' },
    roles: {
      ko: ['몸', '마음', '정신'], en: ['Body', 'Mind', 'Spirit'], ja: ['体', '心', '精神'],
      cn: ['身', '心', '灵'], fr: ['Corps', 'Esprit', 'Âme'], es: ['Cuerpo', 'Mente', 'Espíritu'],
    },
  },
}

/* ─── LABELS ─────────────────────────────────────────────────── */
const UI: Record<L, {
  title: string; subtitle: string; shuffle: string; reset: string
  tapToReveal: string; revealed: string; awaiting: string
  meaning: string; reflect: string; synthesis: string
  chooseSpread: string; synthText: (roles: string[], titles: string[]) => string
}> = {
  ko: {
    title: '오라클 카드 뽑기',
    subtitle: '발타자르 그라시안의 지혜 — 22장의 오라클',
    shuffle: '카드 뽑기',
    reset: '다시 뽑기',
    tapToReveal: '클릭하여 펼치기',
    revealed: '공개됨',
    awaiting: '아직 공개되지 않음',
    meaning: '지혜',
    reflect: '성찰의 질문',
    chooseSpread: '배열 선택',
    synthesis: '종합 해석',
    synthText: (roles, titles) =>
      `${roles[0]}의 ${titles[0]}${roles.length > 1 ? `에서 ${roles[1]}의 ${titles[1]}으로, 그리고 ${roles[2] ? `${roles[2]}의 ${titles[2]}으로` : ''}` : ''}. 이 카드들은 하나의 흐름을 이루며 지금 당신의 여정을 비춥니다.`,
  },
  en: {
    title: 'Oracle Card Reading',
    subtitle: 'Wisdom of Baltasar Gracián — 22 Oracle Cards',
    shuffle: 'Draw Cards',
    reset: 'Draw Again',
    tapToReveal: 'Click to reveal',
    revealed: 'Revealed',
    awaiting: 'Awaiting reveal',
    meaning: 'Wisdom',
    reflect: 'Reflection',
    chooseSpread: 'Choose Spread',
    synthesis: 'Reading Synthesis',
    synthText: (roles, titles) =>
      `${titles[0]} in ${roles[0]}${roles.length > 1 ? `, ${titles[1]} in ${roles[1]}` : ''}${roles.length > 2 ? `, and ${titles[2]} in ${roles[2]}` : ''}. These cards form one continuous thread, illuminating the arc of your present journey.`,
  },
  ja: {
    title: 'オラクルカードリーディング',
    subtitle: 'バルタサル・グラシアンの知恵 — 22枚のオラクル',
    shuffle: 'カードを引く',
    reset: 'もう一度引く',
    tapToReveal: 'クリックして開く',
    revealed: '公開済み',
    awaiting: '未公開',
    meaning: '知恵',
    reflect: '内省の問い',
    chooseSpread: '配置を選ぶ',
    synthesis: '総合解釈',
    synthText: (roles, titles) =>
      `${roles[0]}の${titles[0]}${roles.length > 1 ? `から${roles[1]}の${titles[1]}へ` : ''}${roles.length > 2 ? `、そして${roles[2]}の${titles[2]}へ` : ''}。これらのカードは一つの流れを形成し、今あなたの旅を照らしています。`,
  },
  cn: {
    title: '神谕牌占卜',
    subtitle: '巴尔塔萨·格拉西安的智慧 — 22张神谕牌',
    shuffle: '抽牌',
    reset: '重新抽牌',
    tapToReveal: '点击揭示',
    revealed: '已揭示',
    awaiting: '待揭示',
    meaning: '智慧',
    reflect: '反思问题',
    chooseSpread: '选择阵型',
    synthesis: '综合解读',
    synthText: (roles, titles) =>
      `${roles[0]}的${titles[0]}${roles.length > 1 ? `，${roles[1]}的${titles[1]}` : ''}${roles.length > 2 ? `，以及${roles[2]}的${titles[2]}` : ''}。这些牌形成了一条连续的线索，照亮了您当前旅程的弧线。`,
  },
  fr: {
    title: 'Tirage Oracle',
    subtitle: 'Sagesse de Baltasar Gracián — 22 Cartes Oracle',
    shuffle: 'Tirer les Cartes',
    reset: 'Tirer à Nouveau',
    tapToReveal: 'Cliquer pour révéler',
    revealed: 'Révélé',
    awaiting: 'En attente',
    meaning: 'Sagesse',
    reflect: 'Réflexion',
    chooseSpread: 'Choisir la Disposition',
    synthesis: 'Synthèse de la Lecture',
    synthText: (roles, titles) =>
      `${titles[0]} en ${roles[0]}${roles.length > 1 ? `, ${titles[1]} en ${roles[1]}` : ''}${roles.length > 2 ? `, et ${titles[2]} en ${roles[2]}` : ''}. Ces cartes forment un fil continu, illuminant l\'arc de votre voyage présent.`,
  },
  es: {
    title: 'Lectura de Cartas Oráculo',
    subtitle: 'Sabiduría de Baltasar Gracián — 22 Cartas Oráculo',
    shuffle: 'Sacar Cartas',
    reset: 'Sacar de Nuevo',
    tapToReveal: 'Clic para revelar',
    revealed: 'Revelado',
    awaiting: 'Esperando',
    meaning: 'Sabiduría',
    reflect: 'Reflexión',
    chooseSpread: 'Elegir Tirada',
    synthesis: 'Síntesis de la Lectura',
    synthText: (roles, titles) =>
      `${titles[0]} en ${roles[0]}${roles.length > 1 ? `, ${titles[1]} en ${roles[1]}` : ''}${roles.length > 2 ? `, y ${titles[2]} en ${roles[2]}` : ''}. Estas cartas forman un hilo continuo, iluminando el arco de tu viaje presente.`,
  },
}

/* ─── IRIDESCENT CARD COMPONENT ─────────────────────────────── */
interface CardProps {
  card: OracleCard | null
  role: string
  index: number
  flipped: boolean
  onFlip: () => void
  locale: L
}

function IridescentCard({ card, role, index, flipped, onFlip, locale }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const glow2Ref = useRef<HTMLDivElement>(null)
  const specRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const ui = UI[locale]

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const ry = (px - 0.5) * 28
    const rx = -(py - 0.5) * 28
    const angle = Math.atan2(py - 0.5, px - 0.5) * 180 / Math.PI + 180
    const mx = (px * 100).toFixed(1) + '%'
    const my = (py * 100).toFixed(1) + '%'

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (innerRef.current) {
        innerRef.current.style.setProperty('--rx', rx + 'deg')
        innerRef.current.style.setProperty('--ry', ry + 'deg')
      }
      const updateGlow = (el: HTMLDivElement | null) => {
        if (!el) return
        el.style.setProperty('--mx', mx)
        el.style.setProperty('--my', my)
        el.style.setProperty('--iri-angle', angle + 'deg')
      }
      updateGlow(glowRef.current)
      updateGlow(glow2Ref.current)
      updateGlow(specRef.current)
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (innerRef.current) {
      innerRef.current.style.setProperty('--rx', '0deg')
      innerRef.current.style.setProperty('--ry', '0deg')
    }
    const resetGlow = (el: HTMLDivElement | null) => {
      if (!el) return
      el.style.setProperty('--mx', '50%')
      el.style.setProperty('--my', '50%')
    }
    resetGlow(glowRef.current)
    resetGlow(glow2Ref.current)
    resetGlow(specRef.current)
  }, [])

  const glowBase = { position: 'absolute' as const, inset: 0, pointerEvents: 'none' as const }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: 'rgba(239,233,218,0.45)',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ border: '1px solid rgba(239,233,218,0.2)', borderRadius: '50%', width: 18, height: 18, display: 'inline-grid', placeItems: 'center', marginRight: 8, fontFamily: 'ui-monospace', fontSize: 9 }}>{index + 1}</span>
        {role}
      </div>

      <div
        ref={cardRef}
        onClick={onFlip}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: 200, height: 320, perspective: '1200px', cursor: 'pointer', position: 'relative' }}
      >
        <div
          ref={innerRef}
          style={{
            position: 'absolute', inset: 0,
            transformStyle: 'preserve-3d',
            transition: `transform 1.1s cubic-bezier(0.22, 0.92, 0.18, 1)`,
            transform: `rotateX(var(--rx, 0deg)) rotateY(${flipped ? 'calc(180deg + var(--ry, 0deg))' : 'var(--ry, 0deg)'})`,
            // @ts-ignore CSS custom props
            '--rx': '0deg', '--ry': '0deg',
          }}
        >
          {/* ── BACK FACE ── */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            borderRadius: 8, overflow: 'hidden',
            background: 'linear-gradient(180deg, #0e0a1c 0%, #0a0716 60%, #07040e 100%)',
            border: '1px solid rgba(232,236,255,0.14)',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.9), 0 8px 16px -4px rgba(0,0,0,0.7)',
          }}>
            <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(232,236,255,0.22)', borderRadius: 3, display: 'grid', placeItems: 'center' }}>
              <div style={{ position: 'absolute', inset: 24, border: '1px solid rgba(232,236,255,0.14)', borderRadius: 2 }} />
              <div style={{ position: 'relative', width: '58%', aspectRatio: '1', border: '1px solid rgba(232,236,255,0.28)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                <div style={{ position: 'absolute', inset: '14%', border: '1px solid rgba(232,236,255,0.18)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: '32%', border: '1px solid rgba(232,236,255,0.32)', borderRadius: '50%' }} />
                <span style={{ fontFamily: 'serif', fontSize: 28, color: 'rgba(232,236,255,0.65)', position: 'absolute' }}>✦</span>
              </div>
              <span style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', fontFamily: 'ui-monospace', fontSize: 8, letterSpacing: '0.3em', color: 'rgba(232,236,255,0.4)', textTransform: 'uppercase' }}>· ORACLE ·</span>
              <span style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontFamily: 'ui-monospace', fontSize: 8, letterSpacing: '0.3em', color: 'rgba(232,236,255,0.4)', textTransform: 'uppercase' }}>· GRACIÁN ·</span>
            </div>

            {/* Iridescence on back */}
            <div ref={glowRef} style={{ ...glowBase, mixBlendMode: 'screen', opacity: 0.5,
              background: 'conic-gradient(from var(--iri-angle, 220deg) at var(--mx, 50%) var(--my, 50%), #b8e8ff, #f4d4ff, #ffe4d0, #d0fff4, #e0d4ff, #b8e8ff)',
              filter: 'blur(14px) saturate(1.2)',
              // @ts-ignore
              '--mx': '50%', '--my': '50%', '--iri-angle': '220deg',
            }} />
            <div ref={glow2Ref} style={{ ...glowBase, mixBlendMode: 'overlay', opacity: 0.35,
              background: 'radial-gradient(120% 140% at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.6), transparent 38%)',
              filter: 'blur(18px)',
              // @ts-ignore
              '--mx': '50%', '--my': '50%',
            }} />
            <div ref={specRef} style={{ ...glowBase, mixBlendMode: 'screen', opacity: 0.6,
              background: 'radial-gradient(180px 240px at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 30%, transparent 60%)',
              // @ts-ignore
              '--mx': '50%', '--my': '50%',
            }} />

            {/* Grain */}
            <div style={{ ...glowBase, opacity: 0.18, mixBlendMode: 'overlay',
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
            }} />
          </div>

          {/* ── FRONT FACE ── */}
          {card && (
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: 8, overflow: 'hidden',
              background: 'linear-gradient(180deg, #100a22 0%, #0a0716 60%, #08050f 100%)',
              border: '1px solid rgba(232,236,255,0.22)',
              boxShadow: '0 24px 48px -12px rgba(0,0,0,0.9)',
            }}>
              <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(232,236,255,0.22)', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(232,236,255,0.14)' }}>
                  <span style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(232,236,255,0.45)' }}>
                    {String(card.id).padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: 'serif', fontSize: 11, letterSpacing: '0.3em', color: 'rgba(232,236,255,0.7)', textTransform: 'uppercase' }}>
                    {card.title[locale]}
                  </span>
                  <span style={{ fontFamily: 'ui-monospace', fontSize: 9, color: 'rgba(232,236,255,0.45)' }}>·</span>
                </div>

                {/* Glyph center */}
                <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontSize: 44, color: 'rgba(232,236,255,0.65)', fontFamily: 'serif', lineHeight: 1 }}>{card.glyph}</span>
                </div>

                {/* Footer */}
                <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(232,236,255,0.14)', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.4em', color: 'rgba(232,236,255,0.45)', textTransform: 'uppercase' }}>
                    {role}
                  </span>
                </div>
              </div>

              {/* Iridescence on front */}
              <div style={{ ...glowBase, mixBlendMode: 'screen', opacity: 0.45,
                background: 'conic-gradient(from 200deg at 50% 50%, #b8e8ff, #f4d4ff, #ffe4d0, #d0fff4, #e0d4ff, #b8e8ff)',
                filter: 'blur(12px) saturate(1.2)',
              }} />
              <div style={{ ...glowBase, mixBlendMode: 'overlay', opacity: 0.25,
                background: 'radial-gradient(120% 140% at 50% 40%, rgba(255,255,255,0.5), transparent 38%)',
                filter: 'blur(18px)',
              }} />

              {/* Grain */}
              <div style={{ ...glowBase, opacity: 0.15, mixBlendMode: 'overlay',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
              }} />
            </div>
          )}
        </div>
      </div>

      <div style={{
        fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.3em',
        color: flipped ? 'rgba(239,233,218,0.3)' : 'rgba(239,233,218,0.5)',
        textTransform: 'uppercase',
      }}>
        {flipped ? `— ${ui.revealed} —` : ui.tapToReveal}
      </div>
    </div>
  )
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */
interface Props { locale: Locale }

interface DrawnCard { card: OracleCard; role: string; flipped: boolean }

function getDeckLocale(locale: Locale): L {
  return locale === 'zh' ? 'cn' : locale
}

export default function OracleCardDraw({ locale }: Props) {
  const l = getDeckLocale(locale)
  const ui = UI[l]
  const [spread, setSpread] = useState<SpreadKey>('past-present-future')
  const [drawn, setDrawn] = useState<DrawnCard[]>([])

  const spreadCfg = SPREADS[spread]
  const roles = spreadCfg.roles[l]

  function drawCards() {
    const shuffled = [...DECK].sort(() => Math.random() - 0.5)
    setDrawn(roles.map((role, i) => ({ card: shuffled[i], role, flipped: false })))
  }

  function flipCard(i: number) {
    if (!drawn[i]) return
    setDrawn(prev => prev.map((d, idx) => idx === i ? { ...d, flipped: true } : d))
  }

  function reset() { setDrawn([]) }

  const allFlipped = drawn.length > 0 && drawn.every(d => d.flipped)
  const anyDrawn = drawn.length > 0

  return (
    <div style={{
      minHeight: '80vh',
      background: `
        radial-gradient(1200px 800px at 75% -10%, rgba(86,52,140,0.20), transparent 60%),
        radial-gradient(900px 700px at 10% 110%, rgba(28,80,110,0.20), transparent 60%),
        linear-gradient(180deg, #07050d 0%, #05030a 100%)
      `,
      color: '#efe9da',
      padding: '40px 24px 60px',
      borderRadius: 12,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Starfield */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.6,
        backgroundImage: [
          'radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,.6), transparent 60%)',
          'radial-gradient(1px 1px at 28% 72%, rgba(255,255,255,.4), transparent 60%)',
          'radial-gradient(1px 1px at 42% 28%, rgba(255,255,255,.5), transparent 60%)',
          'radial-gradient(1px 1px at 65% 14%, rgba(255,255,255,.7), transparent 60%)',
          'radial-gradient(1px 1px at 78% 56%, rgba(255,255,255,.4), transparent 60%)',
          'radial-gradient(1px 1px at 88% 80%, rgba(255,255,255,.5), transparent 60%)',
          'radial-gradient(1px 1px at 6% 50%, rgba(255,255,255,.4), transparent 60%)',
          'radial-gradient(1px 1px at 50% 8%, rgba(255,255,255,.5), transparent 60%)',
        ].join(', '),
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(239,233,218,0.12)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(239,233,218,0.28)', display: 'grid', placeItems: 'center' }}>
                <span style={{ fontSize: 14 }}>✦</span>
              </div>
              <h2 style={{ margin: 0, fontFamily: 'serif', fontSize: 18, fontWeight: 600, letterSpacing: '0.06em', color: '#efe9da' }}>
                {ui.title}
              </h2>
            </div>
            <p style={{ margin: 0, fontFamily: 'ui-monospace', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(239,233,218,0.45)', textTransform: 'uppercase' }}>
              {ui.subtitle}
            </p>
          </div>
        </div>

        {/* Spread selector + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: 'ui-monospace', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(239,233,218,0.45)', textTransform: 'uppercase', marginBottom: 8 }}>
              {ui.chooseSpread}
            </div>
            <div style={{ display: 'flex', gap: 6, border: '1px solid rgba(239,233,218,0.12)', padding: 4, borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
              {(Object.keys(SPREADS) as SpreadKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => { setSpread(key); setDrawn([]) }}
                  style={{
                    background: spread === key ? 'rgba(239,233,218,0.07)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: spread === key ? '#efe9da' : 'rgba(239,233,218,0.45)',
                    fontFamily: 'ui-monospace', fontSize: 11, letterSpacing: '0.06em',
                    padding: '8px 14px', borderRadius: 1, transition: 'all 0.25s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.18em', color: spread === key ? '#c9a55c' : 'rgba(239,233,218,0.3)', textTransform: 'uppercase', marginBottom: 2 }}>
                    {SPREADS[key].roles[l].length === 1 ? 'I' : key === 'past-present-future' ? 'II' : 'III'}
                  </div>
                  {SPREADS[key].label[l]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {anyDrawn && (
              <button
                onClick={reset}
                style={{
                  background: 'transparent', border: '1px solid rgba(239,233,218,0.28)',
                  color: '#efe9da', fontFamily: 'ui-monospace', fontSize: 10,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  padding: '10px 16px', cursor: 'pointer', borderRadius: 2,
                }}
              >
                {ui.reset}
              </button>
            )}
            <button
              onClick={drawCards}
              style={{
                background: 'linear-gradient(180deg, #1b1530, #0c0918)',
                border: '1px solid #c9a55c', color: '#c9a55c',
                fontFamily: 'ui-monospace', fontSize: 10,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                padding: '10px 20px', cursor: 'pointer', borderRadius: 2,
                transition: 'all 0.25s',
              }}
            >
              {ui.shuffle}
            </button>
          </div>
        </div>

        {/* Card stage + Reading panel */}
        <div style={{ display: 'grid', gridTemplateColumns: drawn.length > 0 ? '1fr 360px' : '1fr', gap: 48, alignItems: 'start' }}>
          {/* Cards */}
          <div style={{ display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap', minHeight: 380 }}>
            {anyDrawn ? (
              drawn.map((d, i) => (
                <IridescentCard
                  key={i}
                  card={d.card}
                  role={d.role}
                  index={i}
                  flipped={d.flipped}
                  onFlip={() => flipCard(i)}
                  locale={l}
                />
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, height: 380, color: 'rgba(239,233,218,0.35)', textAlign: 'center' }}>
                <span style={{ fontSize: 40, opacity: 0.4 }}>✦</span>
                <p style={{ margin: 0, fontFamily: 'serif', fontStyle: 'italic', fontSize: 16, lineHeight: 1.6, maxWidth: 280 }}>
                  {l === 'ko' ? '배열을 선택하고 카드를 뽑아보세요.' :
                   l === 'ja' ? '配置を選んでカードを引いてください。' :
                   l === 'cn' ? '选择阵型并抽取卡片。' :
                   l === 'fr' ? 'Choisissez une disposition et tirez les cartes.' :
                   l === 'es' ? 'Elige una tirada y saca las cartas.' :
                   'Choose a spread and draw your cards.'}
                </p>
              </div>
            )}
          </div>

          {/* Reading panel */}
          {anyDrawn && (
            <div style={{
              border: '1px solid rgba(239,233,218,0.12)',
              background: 'linear-gradient(180deg, rgba(20,16,36,0.55), rgba(8,6,16,0.55))',
              backdropFilter: 'blur(8px)',
              borderRadius: 3, padding: '22px 24px 24px',
              position: 'relative',
            }}>
              {/* Gold line top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #c9a55c, transparent)', opacity: 0.45 }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(239,233,218,0.12)', paddingBottom: 12, marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontFamily: 'serif', fontSize: 12, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#efe9da' }}>
                  {l === 'ko' ? '해석' : l === 'ja' ? '解釈' : l === 'cn' ? '解读' : l === 'fr' ? 'Interprétation' : l === 'es' ? 'Interpretación' : 'Reading'}
                </h3>
                <div style={{ fontFamily: 'ui-monospace', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(239,233,218,0.45)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a55c', boxShadow: '0 0 8px #c9a55c', display: 'inline-block' }} />
                  {drawn.filter(d => d.flipped).length}/{drawn.length}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {drawn.map((d, i) => (
                  <div key={i} style={{ paddingBottom: 18, borderBottom: i < drawn.length - 1 ? '1px dashed rgba(239,233,218,0.1)' : 'none' }}>
                    <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.28em', color: '#c9a55c', textTransform: 'uppercase', marginBottom: 5 }}>
                      {String(i + 1).padStart(2, '0')} · {d.role}
                    </div>

                    {d.flipped && d.card ? (
                      <>
                        <h4 style={{ margin: '0 0 10px', fontFamily: 'serif', fontSize: 18, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#efe9da', display: 'flex', alignItems: 'baseline', gap: 10 }}>
                          {d.card.glyph} {d.card.title[l]}
                        </h4>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.25em', color: 'rgba(239,233,218,0.45)', textTransform: 'uppercase', marginBottom: 4 }}>
                            {ui.meaning}
                          </div>
                          <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, lineHeight: 1.6, color: '#efe9da' }}>
                            {d.card.wisdom[l]}
                          </p>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.25em', color: 'rgba(239,233,218,0.45)', textTransform: 'uppercase', marginBottom: 4 }}>
                            {ui.reflect}
                          </div>
                          <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.55, color: 'rgba(239,233,218,0.8)' }}>
                            {d.card.reflection[l]}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: 'rgba(239,233,218,0.4)' }}>
                          {ui.awaiting}…
                        </p>
                      </>
                    )}
                  </div>
                ))}

                {/* Synthesis */}
                {allFlipped && drawn.length > 1 && (
                  <div style={{ marginTop: 4, padding: '14px 16px', border: '1px solid rgba(201,165,92,0.28)', borderRadius: 2, background: 'linear-gradient(180deg, rgba(201,165,92,0.06), rgba(201,165,92,0.02))' }}>
                    <div style={{ fontFamily: 'ui-monospace', fontSize: 9, letterSpacing: '0.28em', color: '#c9a55c', textTransform: 'uppercase', marginBottom: 8 }}>
                      {ui.synthesis}
                    </div>
                    <p style={{ margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, lineHeight: 1.6, color: '#f0e6c8' }}>
                      {ui.synthText(drawn.map(d => d.role), drawn.map(d => d.card.title[l]))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
