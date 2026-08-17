import type { Locale } from '../../../i18n';
import { localePath } from '../../../i18n';
import { blogUrl, wikiUrl } from './types';
import type { JourneyContent } from './types';

export function luckContent(locale: Locale): JourneyContent {
  const l = (p: string) => localePath(locale, p);
  const b = (s: string) => blogUrl(locale, s);
  const w = (s: string) => wikiUrl(locale, s);

  switch (locale) {
    case 'ko':
      return {
        badge: '🍀 존재 탐구 · 4단계',
        title: '나에게 행운을 가져다주는 것',
        intro: '행운색·숫자·방향 같은 상징 레이어와, 수면·루틴·관계·시간대 같은 행동 레이어를 함께 보는 페이지입니다. 행운은 미신이 아니라 설계할 수 있는 확률입니다.',
        question: {
          heading: '이 페이지가 답하는 질문',
          body: [
            '"왜 어떤 날은 모든 게 풀리고 어떤 날은 모든 게 꼬일까?" — 심리학자 리처드 와이즈먼의 연구에 따르면 스스로 운이 좋다고 믿는 사람들은 실제로 기회를 더 많이 알아챕니다. 행운의 절반은 "기회가 보이는 상태"를 만드는 것이고, 그 상태는 수면·리듬·기분·환경으로 설계할 수 있습니다.',
            '나머지 절반이 상징의 역할입니다. 행운색을 입고 행운 숫자를 고르는 행위는 우주를 바꾸지 않지만, 나의 주의(attention)와 자신감을 바꿉니다. 이 페이지는 두 레이어를 함께 쓰는 법을 안내합니다.',
          ],
        },
        concepts: {
          heading: '행운의 두 레이어',
          items: [
            { title: '🎴 상징 레이어 — 색·숫자·방향·날짜', body: '사주의 용신 색, 수비학의 행운 숫자, 별자리의 수호성. 과학이 아니라 "주의를 모으는 장치"로 쓸 때 가장 강력합니다.' },
            { title: '🛏️ 행동 레이어 — 수면·루틴·시간대', body: '수면 부족은 기회 인지 능력을 직접 깎아냅니다. 나의 크로노타입에 맞는 황금 시간대를 아는 것이 어떤 부적보다 효과적입니다.' },
            { title: '🔭 준비된 우연 — 세렌디피티', body: '운 좋은 사람들의 공통점은 새로운 사람·장소·정보에 자신을 자주 노출시킨다는 것. 우연은 노출 면적에 비례합니다.' },
            { title: '🌀 동시성 — 의미 있는 우연', body: '융이 말한 싱크로니시티는 인과 없이 의미로 연결되는 사건들. 우연에서 의미를 읽는 능력 자체가 자기 이해의 도구가 됩니다.' },
          ],
        },
        tools: {
          heading: '직접 탐구하기',
          desc: '매일 바뀌는 기운(오늘의 우주)과 고정된 상징(사주·수비학)을 함께 확인해 보세요.',
          items: [
            { href: l('/today'), emoji: '🌌', label: '오늘의 우주', desc: '오늘의 일진·별자리·타로' },
            { href: l('/saju/fortune'), emoji: '🀄', label: '사주 운세', desc: '오행 기반 행운 요소' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: '수비학 계산기', desc: '나의 행운 숫자' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: '바이오리듬 계산기', desc: '신체·감정·지성 리듬' },
          ],
        },
        interpret: {
          heading: '행운을 설계하는 법',
          steps: [
            { title: '나의 상징 세트를 만드세요', body: '사주의 보완 오행 색, 수비학 행운 숫자, 끌리는 방향을 한 세트로 정리하세요. 중요한 날의 옷·소품·자리 선택에 쓰는 "주의 집중 장치"입니다.' },
            { title: '황금 시간대를 찾아 지키세요', body: '수면 유형 검사와 바이오리듬으로 컨디션이 가장 좋은 시간대를 찾고, 그 시간을 가장 중요한 일에 배정하세요. 이것이 행동 레이어의 핵심입니다.' },
            { title: '우연 노출량을 늘리세요', body: '일주일에 한 번, 새로운 길·새로운 사람·새로운 콘텐츠 중 하나를 의도적으로 선택하세요. 기회의 모수가 늘어나야 행운의 확률도 늘어납니다.' },
          ],
        },
        tests: {
          heading: '이어서 해볼 탐구',
          items: [
            { href: l('/tarot/daily'), emoji: '🃏', label: '오늘의 타로' },
            { href: l('/zodiac/fortune'), emoji: '✨', label: '별자리 운세' },
            { href: l('/blood-type/fortune'), emoji: '🩸', label: '혈액형 운세' },
            { href: l('/tarot/daily'), emoji: '🃏', label: '오늘의 타로 카드' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: '수면 유형 검사' },
          ],
        },
        blog: {
          heading: '📖 더 깊이 읽기 (blog.oiyo.net)',
          items: [
            { href: b('lucky-numbers-by-birth-guide'), label: '생년월일로 보는 행운 숫자', external: true },
            { href: b('entrance-wealth-luck'), label: '현관과 재물운 — 풍수의 지혜', external: true },
            { href: b('science-synchronicity-jung-pauli'), label: '동시성의 과학 — 융과 파울리', external: true },
            { href: b('semun-yearly-luck-strategy'), label: '세운 — 한 해 운의 전략', external: true },
            { href: b('lotto-luck-science'), label: '로또와 행운의 과학', external: true },
          ],
        },
        wiki: {
          heading: '📚 개념 사전 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-saju-dictionary'), label: '사주 대사전 — 천간·지지·십신', external: true },
            { href: w('meaning-of-tarot-major-arcana'), label: '타로 메이저 아르카나', external: true },
            { href: w('meaning-of-numerology'), label: '수비학이란 무엇인가', external: true },
            { href: w('meaning-of-color-psychology'), label: '색채 심리학이란', external: true },
          ],
        },
        faq: {
          heading: '자주 묻는 질문',
          items: [
            { q: '행운색이나 행운 숫자가 정말 효과가 있나요?', a: '인과적 효과의 증거는 없지만, 심리적 효과는 실재합니다. 행운의 상징을 지닌 사람은 자신감이 올라가고 기회에 더 적극적으로 반응한다는 연구들이 있습니다. "우주를 바꾸는 장치"가 아니라 "나를 바꾸는 장치"로 쓰세요.' },
            { q: '오늘의 운세는 매일 확인할 가치가 있나요?', a: '운세의 가치는 적중이 아니라 리듬에 있습니다. 하루를 시작하며 1분간 자신의 상태와 계획을 점검하는 의식(ritual)으로 쓰면, 내용과 무관하게 메타인지가 올라갑니다.' },
            { q: '나쁜 운세가 나오면 어떻게 해야 하나요?', a: '나쁜 운세는 "조심하라"는 명령이 아니라 "오늘은 점검 모드"라는 제안으로 읽으세요. 실제로 신중함이 필요한 날이 주기적으로 오며, 그것을 미리 가정하는 것은 손해가 아닙니다.' },
            { q: '사주의 행운 요소와 수비학이 다르게 나오면요?', a: '서로 다른 상징 체계라 다른 답이 정상입니다. 골라 쓰면 됩니다 — 둘 중 자신의 직관에 더 와닿는 상징이 주의 집중 장치로서 더 잘 작동합니다.' },
          ],
        },
        next: {
          heading: '다음 탐구',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '나의 존재 지도' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '내가 좋아하는 것' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: '나의 존재론적 목표' },
            { href: l('/today'), emoji: '🌌', label: '오늘의 나' },
          ],
        },
      };

    case 'ja':
      return {
        badge: '🍀 存在の探求 · ステップ4',
        title: '私に幸運をもたらすもの',
        intro: 'ラッキーカラー・数字・方角という象徴レイヤーと、睡眠・ルーティン・関係・時間帯という行動レイヤーを一緒に見るページ。幸運は迷信ではなく、設計できる確率です。',
        question: {
          heading: 'このページが答える問い',
          body: [
            '「なぜある日は全てがうまくいき、ある日は全てがこじれるのか?」— 心理学者リチャード・ワイズマンの研究によれば、自分は運が良いと信じる人は実際に機会をより多く見つけます。幸運の半分は「機会が見える状態」を作ることで、その状態は睡眠・リズム・気分・環境で設計できます。',
            '残りの半分が象徴の役割です。ラッキーカラーを着て幸運の数字を選ぶ行為は宇宙を変えませんが、自分の注意と自信を変えます。このページは2つのレイヤーを併用する方法を案内します。',
          ],
        },
        concepts: {
          heading: '幸運の2つのレイヤー',
          items: [
            { title: '🎴 象徴レイヤー — 色・数字・方角・日付', body: '四柱推命の用神の色、数秘術のラッキーナンバー、星座の守護星。科学ではなく「注意を集める装置」として使うとき最も強力です。' },
            { title: '🛏️ 行動レイヤー — 睡眠・ルーティン・時間帯', body: '睡眠不足は機会認知能力を直接削ります。自分のクロノタイプに合うゴールデンタイムを知ることが、どんなお守りより効果的です。' },
            { title: '🔭 準備された偶然 — セレンディピティ', body: '運の良い人の共通点は、新しい人・場所・情報に自分を頻繁に晒すこと。偶然は露出面積に比例します。' },
            { title: '🌀 シンクロニシティ — 意味ある偶然', body: 'ユングの言う共時性は、因果なしに意味でつながる出来事。偶然から意味を読む能力自体が自己理解の道具になります。' },
          ],
        },
        tools: {
          heading: '実際に探求する',
          desc: '毎日変わる気(今日の宇宙)と固定された象徴(四柱・数秘術)を一緒に確かめましょう。',
          items: [
            { href: l('/today'), emoji: '🌌', label: '今日の宇宙', desc: '今日の日辰・星座・タロット' },
            { href: l('/saju/fortune'), emoji: '🀄', label: '四柱推命の運勢', desc: '五行ベースの幸運要素' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: '数秘術計算機', desc: '私のラッキーナンバー' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: 'バイオリズム計算機', desc: '身体・感情・知性のリズム' },
          ],
        },
        interpret: {
          heading: '幸運を設計する方法',
          steps: [
            { title: '自分の象徴セットを作る', body: '四柱の補完五行の色、数秘術のラッキーナンバー、惹かれる方角をワンセットに。大事な日の服・小物・席選びに使う「注意集中装置」です。' },
            { title: 'ゴールデンタイムを見つけて守る', body: '睡眠タイプ診断とバイオリズムで最も調子の良い時間帯を見つけ、その時間を最重要の仕事に割り当てましょう。これが行動レイヤーの核心です。' },
            { title: '偶然への露出量を増やす', body: '週に一度、新しい道・新しい人・新しいコンテンツのどれかを意図的に選びましょう。機会の母数が増えてこそ幸運の確率も増えます。' },
          ],
        },
        tests: {
          heading: '続けての探求',
          items: [
            { href: l('/tarot/daily'), emoji: '🃏', label: '今日のタロット' },
            { href: l('/zodiac/fortune'), emoji: '✨', label: '星座占い' },
            { href: l('/blood-type/fortune'), emoji: '🩸', label: '血液型占い' },
            { href: l('/tarot/daily'), emoji: '🃏', label: '今日のタロット' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: '睡眠タイプ診断' },
          ],
        },
        blog: {
          heading: '📖 深く読む (blog.oiyo.net)',
          items: [
            { href: b('entrance-wealth-luck'), label: '玄関と金運 — 風水の知恵', external: true },
            { href: b('science-synchronicity-jung-pauli'), label: 'シンクロニシティの科学 — ユングとパウリ', external: true },
            { href: b('saturn-return-meaning'), label: 'サターンリターンの意味', external: true },
            { href: b('moon-sign-secret-self'), label: '月星座 — 秘められた自分', external: true },
          ],
        },
        wiki: {
          heading: '📚 概念辞典 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-numerology'), label: '数秘術とは何か', external: true },
            { href: w('meaning-of-color-psychology'), label: '色彩心理学とは', external: true },
            { href: w('meaning-of-archetypes'), label: 'アーキタイプ(元型)とは', external: true },
          ],
        },
        faq: {
          heading: 'よくある質問',
          items: [
            { q: 'ラッキーカラーや数字は本当に効果がある?', a: '因果的効果の証拠はありませんが、心理的効果は実在します。幸運の象徴を持つ人は自信が上がり、機会に積極的に反応するという研究があります。「宇宙を変える装置」ではなく「自分を変える装置」として使いましょう。' },
            { q: '毎日の運勢を確認する価値はある?', a: '運勢の価値は的中ではなくリズムにあります。一日の始まりに1分間、自分の状態と計画を点検する儀式として使えば、内容に関わらずメタ認知が上がります。' },
            { q: '悪い運勢が出たらどうすれば?', a: '悪い運勢は「気をつけろ」という命令ではなく「今日は点検モード」という提案として読みましょう。実際に慎重さが必要な日は周期的に訪れ、それを先に想定することは損ではありません。' },
            { q: '四柱推命と数秘術の幸運要素が違う場合は?', a: '異なる象徴体系なので答えが違うのは正常です。選んで使えばいい — 自分の直感により響く象徴の方が、注意集中装置としてよく機能します。' },
          ],
        },
        next: {
          heading: '次の探求',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '私の存在地図' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '私が好きなもの' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: '存在論的な目標' },
            { href: l('/today'), emoji: '🌌', label: '今日の私' },
          ],
        },
      };

    case 'zh':
      return {
        badge: '🍀 存在探索 · 第4步',
        title: '为我带来幸运的事物',
        intro: '把幸运色、数字、方位等象征层,与睡眠、惯例、关系、时段等行动层放在一起看。幸运不是迷信,而是可以设计的概率。',
        question: {
          heading: '本页回答的问题',
          body: [
            '"为什么有的日子事事顺利,有的日子处处碰壁?"——心理学家理查德·怀斯曼的研究表明,相信自己运气好的人确实能发现更多机会。幸运的一半是营造"看得见机会的状态",而这种状态可以通过睡眠、节律、心情和环境来设计。',
            '另一半是象征的作用。穿幸运色、选幸运数字不会改变宇宙,却会改变你的注意力和自信。本页指导你把两个层面结合使用。',
          ],
        },
        concepts: {
          heading: '幸运的两个层面',
          items: [
            { title: '🎴 象征层 — 颜色、数字、方位、日期', body: '八字用神之色、数字命理的幸运数、星座的守护星。把它们当作"聚焦注意力的装置"而非科学,效力最大。' },
            { title: '🛏️ 行动层 — 睡眠、惯例、时段', body: '睡眠不足会直接削弱发现机会的能力。了解符合自己生物钟的黄金时段,比任何护身符都有效。' },
            { title: '🔭 有准备的偶然 — 机缘力', body: '运气好的人的共同点:经常把自己暴露在新的人、地方和信息面前。偶然与暴露面积成正比。' },
            { title: '🌀 共时性 — 有意义的巧合', body: '荣格所说的共时性,是没有因果却以意义相连的事件。从巧合中读出意义的能力,本身就是自我理解的工具。' },
          ],
        },
        tools: {
          heading: '亲自探索',
          desc: '把每日变化的气场(今日宇宙)与固定的象征(八字、数字命理)一起查看。',
          items: [
            { href: l('/today'), emoji: '🌌', label: '今日宇宙', desc: '今天的日辰、星座、塔罗' },
            { href: l('/saju/fortune'), emoji: '🀄', label: '八字运势', desc: '基于五行的幸运元素' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: '数字命理计算器', desc: '我的幸运数字' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: '生物节律计算器', desc: '身体、情绪、智力节律' },
          ],
        },
        interpret: {
          heading: '设计幸运的方法',
          steps: [
            { title: '建立自己的象征组合', body: '把八字互补五行的颜色、幸运数字、吸引你的方位整理成一套,用于重要日子的穿搭、随身物和座位选择——它是"注意力聚焦装置"。' },
            { title: '找到并守住黄金时段', body: '用睡眠类型测试和生物节律找出状态最好的时段,把它分配给最重要的事。这是行动层的核心。' },
            { title: '增加偶然的暴露量', body: '每周一次,有意选择一条新路、一个新朋友或一种新内容。机会的基数变大,幸运的概率才会变大。' },
          ],
        },
        tests: {
          heading: '接着探索',
          items: [
            { href: l('/tarot/daily'), emoji: '🃏', label: '今日塔罗' },
            { href: l('/zodiac/fortune'), emoji: '✨', label: '星座运势' },
            { href: l('/blood-type/fortune'), emoji: '🩸', label: '血型运势' },
            { href: l('/tarot/daily'), emoji: '🃏', label: '每日塔罗牌' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: '睡眠类型测试' },
          ],
        },
        blog: {
          heading: '📖 深入阅读 (blog.oiyo.net)',
          items: [
            { href: b('entrance-wealth-luck'), label: '玄关与财运——风水的智慧', external: true },
            { href: b('science-synchronicity-jung-pauli'), label: '共时性的科学——荣格与泡利', external: true },
            { href: b('saturn-return-meaning'), label: '土星回归的意义', external: true },
            { href: b('moon-sign-secret-self'), label: '月亮星座——隐秘的自我', external: true },
          ],
        },
        wiki: {
          heading: '📚 概念词典 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-numerology'), label: '什么是数字命理', external: true },
            { href: w('meaning-of-color-psychology'), label: '什么是色彩心理学', external: true },
            { href: w('meaning-of-archetypes'), label: '什么是原型', external: true },
          ],
        },
        faq: {
          heading: '常见问题',
          items: [
            { q: '幸运色和幸运数字真的有效吗?', a: '没有因果效应的证据,但心理效应是真实的。研究显示,携带幸运象征的人自信心提升,对机会反应更积极。请把它当作"改变自己的装置",而非"改变宇宙的装置"。' },
            { q: '每天看运势有价值吗?', a: '运势的价值不在应验,而在节律。把它当作每天开始前用一分钟检视状态与计划的仪式,无论内容如何,元认知都会提升。' },
            { q: '抽到坏运势怎么办?', a: '坏运势不是"小心"的命令,而是"今天进入检查模式"的建议。确实需要谨慎的日子会周期性到来,提前假设它并不吃亏。' },
            { q: '八字和数字命理的幸运元素不一致怎么办?', a: '它们是不同的象征体系,答案不同很正常。挑着用即可——更触动你直觉的象征,作为注意力聚焦装置运作得更好。' },
          ],
        },
        next: {
          heading: '下一站探索',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '我的存在地图' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '我喜欢的东西' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: '我的存在目标' },
            { href: l('/today'), emoji: '🌌', label: '今天的我' },
          ],
        },
      };

    case 'fr':
      return {
        badge: '🍀 Exploration de soi · Étape 4',
        title: 'Ce qui me porte chance',
        intro: 'Une page qui croise la couche symbolique — couleurs, nombres, directions — et la couche comportementale — sommeil, routines, relations, horaires. La chance n\'est pas une superstition : c\'est une probabilité qui se conçoit.',
        question: {
          heading: 'La question à laquelle cette page répond',
          body: [
            '« Pourquoi certains jours tout réussit, et d\'autres tout se noue ? » Selon les recherches du psychologue Richard Wiseman, ceux qui se croient chanceux repèrent réellement plus d\'occasions. La moitié de la chance consiste à créer « l\'état où l\'on voit les occasions » — un état qui se conçoit par le sommeil, le rythme, l\'humeur et l\'environnement.',
            'L\'autre moitié est le rôle du symbole. Porter sa couleur porte-bonheur ne change pas l\'univers, mais change votre attention et votre confiance. Cette page montre comment utiliser les deux couches ensemble.',
          ],
        },
        concepts: {
          heading: 'Les deux couches de la chance',
          items: [
            { title: '🎴 Couche symbolique — couleur, nombre, direction, date', body: 'La couleur de l\'élément complémentaire du Saju, le nombre porte-bonheur de la numérologie, l\'astre gardien du signe. Puissants comme « dispositifs d\'attention », non comme science.' },
            { title: '🛏️ Couche comportementale — sommeil, routine, horaires', body: 'Le manque de sommeil ampute directement la capacité à percevoir les occasions. Connaître son heure dorée selon son chronotype vaut tous les talismans.' },
            { title: '🔭 Le hasard préparé — sérendipité', body: 'Le point commun des chanceux : ils s\'exposent souvent à de nouvelles personnes, lieux et informations. Le hasard est proportionnel à la surface d\'exposition.' },
            { title: '🌀 Synchronicité — coïncidences signifiantes', body: 'La synchronicité de Jung : des événements liés par le sens, sans cause commune. Savoir lire du sens dans la coïncidence est en soi un outil de connaissance de soi.' },
          ],
        },
        tools: {
          heading: 'Explorer par soi-même',
          desc: 'Consultez ensemble l\'énergie changeante du jour (Univers du jour) et vos symboles fixes (Saju, numérologie).',
          items: [
            { href: l('/today'), emoji: '🌌', label: 'L\'Univers du jour', desc: 'Pilier du jour, signe, tarot' },
            { href: l('/saju/fortune'), emoji: '🀄', label: 'Fortune Saju', desc: 'Éléments de chance par les cinq éléments' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: 'Calculateur de numérologie', desc: 'Mes nombres porte-bonheur' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: 'Biorythme', desc: 'Rythmes physique, émotionnel, intellectuel' },
          ],
        },
        interpret: {
          heading: 'Concevoir sa chance',
          steps: [
            { title: 'Composez votre set de symboles', body: 'Couleur de l\'élément complémentaire, nombre porte-bonheur, direction qui vous attire : un set pour les jours importants — vêtements, objets, place. C\'est un dispositif de concentration de l\'attention.' },
            { title: 'Trouvez et protégez votre heure dorée', body: 'Avec le chronotype et le biorythme, identifiez votre meilleur créneau et réservez-le à ce qui compte le plus. C\'est le cœur de la couche comportementale.' },
            { title: 'Augmentez votre exposition au hasard', body: 'Une fois par semaine, choisissez délibérément un nouveau chemin, une nouvelle personne ou un nouveau contenu. La probabilité de chance croît avec le nombre d\'occasions.' },
          ],
        },
        tests: {
          heading: 'Explorations suivantes',
          items: [
            { href: l('/tarot/daily'), emoji: '🃏', label: 'Tarot du jour' },
            { href: l('/zodiac/fortune'), emoji: '✨', label: 'Horoscope' },
            { href: l('/blood-type/fortune'), emoji: '🩸', label: 'Fortune par groupe sanguin' },
            { href: l('/tarot/daily'), emoji: '🃏', label: 'Tarot du jour' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: 'Chronotype de sommeil' },
          ],
        },
        blog: {
          heading: '📖 Lire plus loin (blog.oiyo.net)',
          items: [
            { href: b('entrance-wealth-luck'), label: 'Entrée et fortune — sagesse du feng shui', external: true },
            { href: b('science-synchronicity-jung-pauli'), label: 'La science de la synchronicité — Jung et Pauli', external: true },
            { href: b('saturn-return-meaning'), label: 'Le retour de Saturne', external: true },
            { href: b('moon-sign-secret-self'), label: 'Signe lunaire — le moi secret', external: true },
          ],
        },
        wiki: {
          heading: '📚 Dictionnaire (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-numerology'), label: 'Qu\'est-ce que la numérologie', external: true },
            { href: w('meaning-of-color-psychology'), label: 'La psychologie des couleurs', external: true },
            { href: w('meaning-of-archetypes'), label: 'Que sont les archétypes', external: true },
          ],
        },
        faq: {
          heading: 'Questions fréquentes',
          items: [
            { q: 'Les couleurs et nombres porte-bonheur fonctionnent-ils vraiment ?', a: 'Aucune preuve d\'effet causal, mais l\'effet psychologique est réel : porter un symbole de chance augmente la confiance et la réactivité aux occasions. Utilisez-les comme dispositifs qui vous changent vous, pas l\'univers.' },
            { q: 'Vaut-il la peine de consulter l\'horoscope chaque jour ?', a: 'Sa valeur tient au rythme, pas à la justesse. Utilisé comme rituel d\'une minute pour passer en revue son état et ses plans, il améliore la métacognition quel que soit son contenu.' },
            { q: 'Que faire d\'une mauvaise prédiction ?', a: 'Lisez-la non comme un ordre de « faire attention » mais comme une proposition de « mode vérification ». Des jours demandant de la prudence reviennent périodiquement ; les anticiper ne coûte rien.' },
            { q: 'Et si le Saju et la numérologie se contredisent ?', a: 'Ce sont des systèmes symboliques différents : des réponses différentes sont normales. Choisissez — le symbole qui parle le plus à votre intuition fonctionne mieux comme dispositif d\'attention.' },
          ],
        },
        next: {
          heading: 'Prochaine exploration',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'Ma carte de l\'être' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'Ce que j\'aime' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: 'Mon but existentiel' },
            { href: l('/today'), emoji: '🌌', label: 'Moi, aujourd\'hui' },
          ],
        },
      };

    case 'es':
      return {
        badge: '🍀 Exploración del ser · Paso 4',
        title: 'Lo que me trae suerte',
        intro: 'Una página que cruza la capa simbólica — colores, números, direcciones — con la capa conductual — sueño, rutinas, relaciones, horarios. La suerte no es superstición: es una probabilidad que se puede diseñar.',
        question: {
          heading: 'La pregunta que responde esta página',
          body: [
            '«¿Por qué hay días en que todo sale bien y días en que todo se enreda?» Según las investigaciones del psicólogo Richard Wiseman, quienes se creen afortunados realmente detectan más oportunidades. La mitad de la suerte consiste en crear «el estado en que se ven las oportunidades», y ese estado se diseña con sueño, ritmo, ánimo y entorno.',
            'La otra mitad es el papel del símbolo. Vestir tu color de la suerte no cambia el universo, pero cambia tu atención y tu confianza. Esta página muestra cómo usar ambas capas juntas.',
          ],
        },
        concepts: {
          heading: 'Las dos capas de la suerte',
          items: [
            { title: '🎴 Capa simbólica — color, número, dirección, fecha', body: 'El color del elemento complementario del Saju, el número de la suerte de la numerología, el astro guardián del signo. Más poderosos como «dispositivos de atención» que como ciencia.' },
            { title: '🛏️ Capa conductual — sueño, rutina, horarios', body: 'La falta de sueño recorta directamente la capacidad de percibir oportunidades. Conocer tu hora dorada según tu cronotipo vale más que cualquier amuleto.' },
            { title: '🔭 El azar preparado — serendipia', body: 'Lo común entre los afortunados: se exponen a menudo a personas, lugares e información nuevos. El azar es proporcional a la superficie de exposición.' },
            { title: '🌀 Sincronicidad — coincidencias con sentido', body: 'La sincronicidad de Jung: eventos unidos por el significado, sin causa común. Saber leer sentido en la coincidencia es en sí una herramienta de autoconocimiento.' },
          ],
        },
        tools: {
          heading: 'Explorar en persona',
          desc: 'Consulta juntas la energía cambiante del día (Universo de hoy) y tus símbolos fijos (Saju, numerología).',
          items: [
            { href: l('/today'), emoji: '🌌', label: 'El Universo de hoy', desc: 'Pilar del día, signo, tarot' },
            { href: l('/saju/fortune'), emoji: '🀄', label: 'Fortuna Saju', desc: 'Elementos de suerte según los cinco elementos' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: 'Calculadora de numerología', desc: 'Mis números de la suerte' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: 'Biorritmo', desc: 'Ritmos físico, emocional e intelectual' },
          ],
        },
        interpret: {
          heading: 'Cómo diseñar tu suerte',
          steps: [
            { title: 'Compón tu set de símbolos', body: 'Color del elemento complementario, número de la suerte, dirección que te atrae: un set para los días importantes — ropa, objetos, asiento. Es un dispositivo para concentrar la atención.' },
            { title: 'Encuentra y protege tu hora dorada', body: 'Con el cronotipo y el biorritmo, identifica tu mejor franja y resérvala para lo más importante. Ese es el núcleo de la capa conductual.' },
            { title: 'Aumenta tu exposición al azar', body: 'Una vez por semana, elige deliberadamente un camino, una persona o un contenido nuevo. La probabilidad de suerte crece con el número de oportunidades.' },
          ],
        },
        tests: {
          heading: 'Exploraciones siguientes',
          items: [
            { href: l('/tarot/daily'), emoji: '🃏', label: 'Tarot del día' },
            { href: l('/zodiac/fortune'), emoji: '✨', label: 'Horóscopo' },
            { href: l('/blood-type/fortune'), emoji: '🩸', label: 'Fortuna por grupo sanguíneo' },
            { href: l('/tarot/daily'), emoji: '🃏', label: 'Tarot del día' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: 'Cronotipo de sueño' },
          ],
        },
        blog: {
          heading: '📖 Leer más (blog.oiyo.net)',
          items: [
            { href: b('entrance-wealth-luck'), label: 'La entrada y la fortuna — sabiduría del feng shui', external: true },
            { href: b('science-synchronicity-jung-pauli'), label: 'La ciencia de la sincronicidad — Jung y Pauli', external: true },
            { href: b('saturn-return-meaning'), label: 'El retorno de Saturno', external: true },
            { href: b('moon-sign-secret-self'), label: 'Signo lunar — el yo secreto', external: true },
          ],
        },
        wiki: {
          heading: '📚 Diccionario (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-numerology'), label: 'Qué es la numerología', external: true },
            { href: w('meaning-of-color-psychology'), label: 'La psicología del color', external: true },
            { href: w('meaning-of-archetypes'), label: 'Qué son los arquetipos', external: true },
          ],
        },
        faq: {
          heading: 'Preguntas frecuentes',
          items: [
            { q: '¿De verdad funcionan los colores y números de la suerte?', a: 'No hay pruebas de efecto causal, pero el efecto psicológico es real: llevar un símbolo de suerte aumenta la confianza y la reactividad ante las oportunidades. Úsalos como dispositivos que te cambian a ti, no al universo.' },
            { q: '¿Merece la pena mirar el horóscopo cada día?', a: 'Su valor está en el ritmo, no en el acierto. Usado como ritual de un minuto para revisar tu estado y tus planes al empezar el día, mejora la metacognición sea cual sea su contenido.' },
            { q: '¿Qué hago con una mala predicción?', a: 'Léela no como una orden de «ten cuidado» sino como una propuesta de «modo revisión». Los días que piden prudencia llegan periódicamente; anticiparlos no cuesta nada.' },
            { q: '¿Y si el Saju y la numerología se contradicen?', a: 'Son sistemas simbólicos distintos: respuestas distintas son normales. Elige — el símbolo que más hable a tu intuición funciona mejor como dispositivo de atención.' },
          ],
        },
        next: {
          heading: 'Siguiente exploración',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'Mi mapa del ser' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'Lo que me gusta' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: 'Mi propósito existencial' },
            { href: l('/today'), emoji: '🌌', label: 'Yo, hoy' },
          ],
        },
      };

    default:
      return {
        badge: '🍀 Self-Discovery · Step 4',
        title: 'What brings me luck',
        intro: 'A page that pairs the symbolic layer — lucky colors, numbers, directions — with the behavioral layer — sleep, routines, relationships, time of day. Luck is not superstition; it is a probability you can design.',
        question: {
          heading: 'The question this page answers',
          body: [
            '"Why does everything click on some days and tangle on others?" Psychologist Richard Wiseman\'s research found that people who believe they are lucky actually notice more opportunities. Half of luck is creating the state in which opportunities are visible — and that state is designed through sleep, rhythm, mood, and environment.',
            'The other half is the role of symbols. Wearing your lucky color doesn\'t change the universe, but it changes your attention and confidence. This page shows how to use both layers together.',
          ],
        },
        concepts: {
          heading: 'The two layers of luck',
          items: [
            { title: '🎴 Symbolic layer — color, number, direction, date', body: 'The color of your complementary element in Saju, numerology\'s lucky numbers, your sign\'s guardian planet. Most powerful when used as attention devices, not as science.' },
            { title: '🛏️ Behavioral layer — sleep, routine, time of day', body: 'Sleep deprivation directly cuts your ability to notice opportunities. Knowing your golden hours by chronotype beats any talisman.' },
            { title: '🔭 Prepared chance — serendipity', body: 'What lucky people share: they frequently expose themselves to new people, places, and information. Chance is proportional to exposure area.' },
            { title: '🌀 Synchronicity — meaningful coincidence', body: 'Jung\'s synchronicity: events connected by meaning without a shared cause. The ability to read meaning in coincidence is itself a tool of self-understanding.' },
          ],
        },
        tools: {
          heading: 'Explore it yourself',
          desc: 'Check the day\'s shifting energy (Today\'s Universe) alongside your fixed symbols (Saju, numerology).',
          items: [
            { href: l('/today'), emoji: '🌌', label: "Today's Universe", desc: 'Day pillar, sun sign, tarot' },
            { href: l('/saju/fortune'), emoji: '🀄', label: 'Saju fortune', desc: 'Luck elements from the five elements' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: 'Numerology calculator', desc: 'My lucky numbers' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: 'Biorhythm calculator', desc: 'Physical, emotional, intellectual rhythms' },
          ],
        },
        interpret: {
          heading: 'How to design your luck',
          steps: [
            { title: 'Build your symbol set', body: 'Complementary-element color, lucky number, the direction you\'re drawn to — one set for important days, used in clothing, objects, and seating. It is an attention-focusing device.' },
            { title: 'Find and guard your golden hours', body: 'Use the sleep chronotype test and biorhythm to find your best window, and assign it to what matters most. This is the heart of the behavioral layer.' },
            { title: 'Increase your exposure to chance', body: 'Once a week, deliberately choose a new route, a new person, or new content. The probability of luck grows with the number of opportunities in play.' },
          ],
        },
        tests: {
          heading: 'Explore next',
          items: [
            { href: l('/tarot/daily'), emoji: '🃏', label: 'Daily tarot' },
            { href: l('/zodiac/fortune'), emoji: '✨', label: 'Zodiac fortune' },
            { href: l('/blood-type/fortune'), emoji: '🩸', label: 'Blood type fortune' },
            { href: l('/tarot/daily'), emoji: '🃏', label: 'Daily tarot card' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: 'Sleep chronotype' },
          ],
        },
        blog: {
          heading: '📖 Read deeper (blog.oiyo.net)',
          items: [
            { href: b('entrance-wealth-luck'), label: 'Entrances and wealth luck — feng shui wisdom', external: true },
            { href: b('science-synchronicity-jung-pauli'), label: 'The science of synchronicity — Jung & Pauli', external: true },
            { href: b('saturn-return-meaning'), label: 'The meaning of the Saturn return', external: true },
            { href: b('moon-sign-secret-self'), label: 'Moon sign — the secret self', external: true },
          ],
        },
        wiki: {
          heading: '📚 Concept dictionary (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-numerology'), label: 'What is numerology', external: true },
            { href: w('meaning-of-color-psychology'), label: 'What is color psychology', external: true },
            { href: w('meaning-of-archetypes'), label: 'What are archetypes', external: true },
          ],
        },
        faq: {
          heading: 'Frequently asked questions',
          items: [
            { q: 'Do lucky colors and numbers actually work?', a: 'There is no evidence of a causal effect, but the psychological effect is real: carrying a luck symbol raises confidence and makes people respond more actively to opportunities. Use them as devices that change you, not the universe.' },
            { q: 'Is a daily fortune worth checking every day?', a: 'Its value lies in rhythm, not accuracy. Used as a one-minute ritual to review your state and plans at the start of the day, it improves metacognition regardless of content.' },
            { q: 'What should I do with a bad fortune?', a: 'Read it not as an order to "be careful" but as a suggestion: "today is inspection mode." Days that genuinely require caution come around periodically, and assuming one in advance costs nothing.' },
            { q: 'What if Saju and numerology give different luck elements?', a: 'They are different symbolic systems, so different answers are normal. Pick and choose — the symbol that speaks more to your intuition works better as an attention device.' },
          ],
        },
        next: {
          heading: 'Next exploration',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'My map of being' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'What I love' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: 'My existential purpose' },
            { href: l('/today'), emoji: '🌌', label: 'Me, today' },
          ],
        },
      };
  }
}
