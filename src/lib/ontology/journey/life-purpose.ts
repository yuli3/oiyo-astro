import type { Locale } from '../../../i18n';
import { localePath } from '../../../i18n';
import { blogUrl, wikiUrl } from './types';
import type { JourneyContent } from './types';

export function lifePurposeContent(locale: Locale): JourneyContent {
  const l = (p: string) => localePath(locale, p);
  const b = (s: string) => blogUrl(locale, s);
  const w = (s: string) => wikiUrl(locale, s);

  switch (locale) {
    case 'ko':
      return {
        badge: '🌟 존재 탐구 · 3단계',
        title: '나의 존재론적 목표',
        intro: '직업 추천이 아니라 "삶의 문장"을 만드는 페이지입니다. 나는 무엇을 위해, 어떤 방식으로 존재하는 사람인지 한 문장으로 빚어 보세요.',
        question: {
          heading: '이 페이지가 답하는 질문',
          body: [
            '"이 일을 계속해도 되는 걸까?"라는 질문은 사실 직업의 질문이 아니라 존재의 질문입니다. 직함은 바뀌어도 "내가 세상에 일으키고 싶은 변화"는 잘 바뀌지 않습니다. 그래서 목표 탐구의 결과물은 회사 이름이 아니라 문장이어야 합니다 — 예: "나는 흩어진 감정과 생각을 아름다운 질서로 바꾸는 사람이다."',
            '이 페이지는 이키가이·로고테라피·개성화·수비학이라는 네 가지 전통을 빌려, 당신만의 삶의 문장을 빚는 과정을 안내합니다.',
          ],
        },
        concepts: {
          heading: '목적을 보는 네 가지 전통',
          items: [
            { title: '⭕ 이키가이 — 네 원의 교집합', body: '좋아하는 것, 잘하는 것, 세상이 필요로 하는 것, 보상받을 수 있는 것. 네 원이 겹치는 자리가 아침에 일어나는 이유입니다.' },
            { title: '🕯️ 로고테라피 — 의미는 발견하는 것', body: '빅터 프랭클은 의미를 만드는 게 아니라 발견하는 것이라 했습니다. 창조(일), 경험(사랑), 태도(고난을 대하는 자세) — 세 갈래의 길이 있습니다.' },
            { title: '🌗 개성화 — 자기 자신이 되는 과정', body: '융이 말한 삶의 과업은 "남들이 기대하는 나"를 벗고 본래의 자기(Self)가 되는 것. 그림자와의 대면이 그 관문입니다.' },
            { title: '🔢 수비학 — 인생 경로수', body: '생년월일을 한 자리로 줄인 인생 경로수는 반복되는 삶의 테마를 상징 언어로 요약합니다. 진지한 예언이 아니라 자기 서사의 거울로 쓰세요.' },
          ],
        },
        tools: {
          heading: '직접 탐구하기',
          desc: '욕망의 구조(에니어그램) → 강점(내면 강점) → 방향(커리어) → 상징(수비학) 순서를 추천합니다.',
          items: [
            { href: l('/enneagram/test'), emoji: '🔥', label: '에니어그램 검사', desc: '나를 움직이는 핵심 욕망' },
            { href: l('/inner-strength/test'), emoji: '💪', label: '내면 강점 검사', desc: '이미 가진 무기 확인' },
            { href: l('/mbti/career'), emoji: '🧑‍💼', label: 'MBTI 커리어 가이드', desc: '유형별 일의 방식' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: '수비학 계산기', desc: '인생 경로수 풀이' },
          ],
        },
        interpret: {
          heading: '삶의 문장을 빚는 법',
          steps: [
            { title: '재료를 모으세요', body: '에니어그램의 핵심 욕망, 강점 검사의 상위 3개, 시간 가는 줄 모르고 했던 일들의 공통점. 이 세 가지가 문장의 재료입니다.' },
            { title: '동사 + 대상 + 변화로 조립하세요', body: '"나는 [무엇]을 [어떻게] 바꾸는 사람이다" 틀에 채워 보세요. 직업명이 아니라 동사가 핵심입니다. 동사는 직업이 바뀌어도 살아남습니다.' },
            { title: '한 달간 문장으로 결정해 보세요', body: '작은 선택의 갈림길마다 "이 길이 내 문장에 가까운가?"를 물어 보세요. 문장이 어색하면 고치면 됩니다 — 문장은 완성품이 아니라 나침반입니다.' },
          ],
        },
        tests: {
          heading: '이어서 해볼 검사',
          items: [
            { href: l('/big5/test'), emoji: '🌊', label: '빅파이브 검사' },
            { href: l('/eq/test'), emoji: '💗', label: 'EQ 감성지능 검사' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: '자존감 검사' },
            { href: l('/investment-type/test'), emoji: '💰', label: '투자 성향 검사' },
          ],
        },
        blog: {
          heading: '📖 더 깊이 읽기 (blog.oiyo.net)',
          items: [
            { href: b('ikigai-life-purpose-guide'), label: '이키가이 — 삶의 목적 가이드', external: true },
            { href: b('viktor-frankl-purpose'), label: '빅터 프랭클 — 의미를 찾아서', external: true },
            { href: b('individuation-process-self-realization'), label: '개성화 — 자기실현의 과정', external: true },
            { href: b('purpose-and-mental-health'), label: '목적과 정신 건강', external: true },
            { href: b('power-of-purpose'), label: '목적의 힘', external: true },
          ],
        },
        wiki: {
          heading: '📚 개념 사전 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-archetypes'), label: '원형(아키타입)이란', external: true },
            { href: w('meaning-of-enneagram'), label: '에니어그램의 기원과 구조', external: true },
          ],
        },
        faq: {
          heading: '자주 묻는 질문',
          items: [
            { q: '삶의 목적이 꼭 있어야 하나요?', a: '거창한 사명이 없어도 괜찮습니다. 연구에 따르면 중요한 것은 목적의 크기가 아니라 "방향감"입니다. 오늘의 행동이 어디로 향하는지 느끼는 것만으로 정신 건강 지표가 달라집니다.' },
            { q: '좋아하는 일과 잘하는 일이 다르면 어떻게 하나요?', a: '이키가이의 네 원이 처음부터 겹치는 사람은 드뭅니다. 잘하는 일로 토대를 만들고, 좋아하는 일을 작은 실험으로 키워 교집합을 넓혀가는 것이 현실적인 경로입니다.' },
            { q: '삶의 문장이 시간이 지나면 바뀌어도 되나요?', a: '바뀌는 것이 정상입니다. 개성화는 평생의 과정이고, 문장은 그 시점의 나침반일 뿐입니다. 1년에 한 번 문장을 다시 읽고 고쳐 쓰는 것 자체가 훌륭한 자기 탐구 의식이 됩니다.' },
            { q: '수비학 같은 상징 도구를 진지하게 믿어야 하나요?', a: '믿음의 문제가 아니라 용도의 문제입니다. 상징 도구는 예측 장치가 아니라 자기 서사를 비추는 거울로 쓸 때 가장 유용합니다. "이 숫자의 테마가 내 삶 어디에서 보이는가?"라고 묻는 순간 탐구가 시작됩니다.' },
          ],
        },
        next: {
          heading: '다음 탐구',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '나의 존재 지도' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '내가 좋아하는 것' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '나에게 행운을 주는 것' },
            { href: l('/today'), emoji: '🌌', label: '오늘의 나' },
          ],
        },
      };

    case 'ja':
      return {
        badge: '🌟 存在の探求 · ステップ3',
        title: '私の存在論的な目標',
        intro: '職業のおすすめではなく「人生の一文」をつくるページ。自分は何のために、どんな形で存在する人間なのかを一文に練り上げましょう。',
        question: {
          heading: 'このページが答える問い',
          body: [
            '「この仕事を続けていいのだろうか?」という問いは、実は職業の問いではなく存在の問いです。肩書きは変わっても「世界に起こしたい変化」はなかなか変わりません。だから目標探求の成果物は会社名ではなく一文であるべきです — 例:「私は散らばった感情と思考を美しい秩序に変える人間だ」。',
            'このページは、生きがい・ロゴセラピー・個性化・数秘術という4つの伝統を借りて、あなただけの「人生の一文」を練る過程を案内します。',
          ],
        },
        concepts: {
          heading: '目的を見る4つの伝統',
          items: [
            { title: '⭕ 生きがい — 4つの円の交わり', body: '好きなこと、得意なこと、世界が必要とすること、報酬を得られること。4つの円が重なる場所が、朝起きる理由です。' },
            { title: '🕯️ ロゴセラピー — 意味は発見するもの', body: 'フランクルは、意味は作るものではなく発見するものだと言いました。創造(仕事)、体験(愛)、態度(苦難への姿勢) — 3つの道があります。' },
            { title: '🌗 個性化 — 自分自身になる過程', body: 'ユングの言う人生の課題は「他人が期待する自分」を脱ぎ、本来の自己(Self)になること。影との対面がその関門です。' },
            { title: '🔢 数秘術 — ライフパスナンバー', body: '生年月日を一桁に縮めたライフパスナンバーは、繰り返される人生のテーマを象徴言語で要約します。予言ではなく自己の物語の鏡として使いましょう。' },
          ],
        },
        tools: {
          heading: '実際に探求する',
          desc: '欲望の構造(エニアグラム)→ 強み → 方向(キャリア)→ 象徴(数秘術)の順がおすすめ。',
          items: [
            { href: l('/enneagram/test'), emoji: '🔥', label: 'エニアグラム診断', desc: '自分を動かす核心的欲望' },
            { href: l('/inner-strength/test'), emoji: '💪', label: '内なる強み診断', desc: 'すでに持つ武器の確認' },
            { href: l('/mbti/career'), emoji: '🧑‍💼', label: 'MBTIキャリアガイド', desc: 'タイプ別の働き方' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: '数秘術計算機', desc: 'ライフパスナンバー解説' },
          ],
        },
        interpret: {
          heading: '人生の一文を練る方法',
          steps: [
            { title: '材料を集める', body: 'エニアグラムの核心的欲望、強み診断の上位3つ、時間を忘れてやったことの共通点。この3つが一文の材料です。' },
            { title: '動詞+対象+変化で組み立てる', body: '「私は[何]を[どう]変える人間だ」という型に当てはめましょう。職業名ではなく動詞が核心です。動詞は職業が変わっても生き残ります。' },
            { title: '1か月、その一文で決めてみる', body: '小さな選択の分かれ道ごとに「この道は私の一文に近いか?」と問いましょう。違和感があれば直せばいい — 一文は完成品ではなく羅針盤です。' },
          ],
        },
        tests: {
          heading: '続けて受けたい診断',
          items: [
            { href: l('/big5/test'), emoji: '🌊', label: 'ビッグファイブ診断' },
            { href: l('/eq/test'), emoji: '💗', label: 'EQ診断' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: '自己肯定感診断' },
            { href: l('/investment-type/test'), emoji: '💰', label: '投資タイプ診断' },
          ],
        },
        blog: {
          heading: '📖 深く読む (blog.oiyo.net)',
          items: [
            { href: b('ikigai-art-of-purpose'), label: '生きがい — 目的の技法', external: true },
            { href: b('viktor-frankl-purpose'), label: 'フランクル — 意味を求めて', external: true },
            { href: b('individuation-process-self-realization'), label: '個性化 — 自己実現の過程', external: true },
            { href: b('purpose-and-mental-health'), label: '目的とメンタルヘルス', external: true },
            { href: b('power-of-purpose'), label: '目的の力', external: true },
          ],
        },
        wiki: {
          heading: '📚 概念辞典 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-archetypes'), label: 'アーキタイプ(元型)とは', external: true },
            { href: w('meaning-of-enneagram'), label: 'エニアグラムの起源と構造', external: true },
          ],
        },
        faq: {
          heading: 'よくある質問',
          items: [
            { q: '人生の目的は必ず必要ですか?', a: '壮大な使命がなくても大丈夫です。研究によれば重要なのは目的の大きさではなく「方向感」。今日の行動がどこへ向かうかを感じるだけで、メンタルヘルスの指標が変わります。' },
            { q: '好きなことと得意なことが違う場合は?', a: '生きがいの4つの円が最初から重なる人は稀です。得意なことで土台を作り、好きなことを小さな実験で育てて交わりを広げるのが現実的な道です。' },
            { q: '人生の一文は時間とともに変わってもいい?', a: '変わるのが正常です。個性化は生涯の過程であり、一文はその時点の羅針盤に過ぎません。年に一度読み返して書き直すこと自体が、優れた自己探求の儀式になります。' },
            { q: '数秘術のような象徴ツールを本気で信じるべき?', a: '信仰の問題ではなく用途の問題です。象徴ツールは予測装置ではなく、自己の物語を映す鏡として使うとき最も有用です。「この数字のテーマは私の人生のどこに見えるか?」と問う瞬間、探求が始まります。' },
          ],
        },
        next: {
          heading: '次の探求',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '私の存在地図' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '私が好きなもの' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '幸運をもたらすもの' },
            { href: l('/today'), emoji: '🌌', label: '今日の私' },
          ],
        },
      };

    case 'zh':
      return {
        badge: '🌟 存在探索 · 第3步',
        title: '我的存在目标',
        intro: '这不是职业推荐页,而是打造"人生一句话"的页面。把"我为了什么、以怎样的方式存在"凝练成一句话。',
        question: {
          heading: '本页回答的问题',
          body: [
            '"这份工作该继续吗?"其实不是职业问题,而是存在问题。头衔会变,但"我想给世界带来的改变"很少改变。所以目标探索的成果不应是公司名,而应是一句话——例如:"我是把散落的情绪和思绪变成美的秩序的人。"',
            '本页借助生之意义(Ikigai)、意义疗法、个体化、数字命理四个传统,引导你打磨属于自己的人生一句话。',
          ],
        },
        concepts: {
          heading: '看待目的的四个传统',
          items: [
            { title: '⭕ Ikigai — 四圆交集', body: '热爱的、擅长的、世界需要的、能获得回报的。四个圆重叠之处,就是早晨起床的理由。' },
            { title: '🕯️ 意义疗法 — 意义是被发现的', body: '弗兰克尔说,意义不是制造而是发现的。创造(工作)、体验(爱)、态度(面对苦难的姿态)——三条路径。' },
            { title: '🌗 个体化 — 成为自己的过程', body: '荣格所说的人生课题,是脱下"别人期待的我",成为本来的自己(Self)。与阴影的相遇是必经之门。' },
            { title: '🔢 数字命理 — 生命灵数', body: '把生日缩减为一位数的生命灵数,用象征语言概括人生反复出现的主题。请把它当作自我叙事的镜子,而非预言。' },
          ],
        },
        tools: {
          heading: '亲自探索',
          desc: '推荐顺序:欲望结构(九型)→ 优势 → 方向(职业)→ 象征(数字命理)。',
          items: [
            { href: l('/enneagram/test'), emoji: '🔥', label: '九型人格测试', desc: '驱动我的核心欲望' },
            { href: l('/inner-strength/test'), emoji: '💪', label: '内在力量测试', desc: '确认已有的武器' },
            { href: l('/mbti/career'), emoji: '🧑‍💼', label: 'MBTI 职业指南', desc: '各类型的工作方式' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: '数字命理计算器', desc: '生命灵数解读' },
          ],
        },
        interpret: {
          heading: '打磨人生一句话的方法',
          steps: [
            { title: '收集材料', body: '九型人格的核心欲望、优势测试的前三名、让你忘记时间的事情的共同点——这三样是句子的材料。' },
            { title: '用"动词+对象+改变"组装', body: '套进"我是把[什么][怎样]改变的人"的句式。关键不是职业名而是动词——动词在职业更替后仍能存活。' },
            { title: '用这句话做一个月的决定', body: '在每个小小的岔路口问:"哪条路更接近我的句子?"觉得别扭就修改——句子不是成品,而是罗盘。' },
          ],
        },
        tests: {
          heading: '接着做的测试',
          items: [
            { href: l('/big5/test'), emoji: '🌊', label: '大五人格测试' },
            { href: l('/eq/test'), emoji: '💗', label: '情商测试' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: '自尊测试' },
            { href: l('/investment-type/test'), emoji: '💰', label: '投资风格测试' },
          ],
        },
        blog: {
          heading: '📖 深入阅读 (blog.oiyo.net)',
          items: [
            { href: b('ikigai-art-of-purpose'), label: 'Ikigai——目的的艺术', external: true },
            { href: b('viktor-frankl-purpose'), label: '弗兰克尔——寻找意义', external: true },
            { href: b('individuation-process-self-realization'), label: '个体化——自我实现之路', external: true },
            { href: b('purpose-and-mental-health'), label: '目的与心理健康', external: true },
            { href: b('power-of-purpose'), label: '目的的力量', external: true },
          ],
        },
        wiki: {
          heading: '📚 概念词典 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-archetypes'), label: '什么是原型', external: true },
            { href: w('meaning-of-enneagram'), label: '九型人格的起源与结构', external: true },
          ],
        },
        faq: {
          heading: '常见问题',
          items: [
            { q: '人生一定要有目的吗?', a: '没有宏大使命也没关系。研究表明,重要的不是目的的大小,而是"方向感"。仅仅感到今天的行动通向何方,心理健康指标就会不同。' },
            { q: '热爱的事和擅长的事不一致怎么办?', a: 'Ikigai 四圆一开始就重叠的人很少。现实的路径是:用擅长之事打地基,用小实验培育热爱之事,逐渐扩大交集。' },
            { q: '人生句子随时间改变可以吗?', a: '改变才是正常的。个体化是终生过程,句子只是当下的罗盘。每年重读并改写一次,本身就是极好的自我探索仪式。' },
            { q: '需要认真相信数字命理这类象征工具吗?', a: '这不是信仰问题,而是用途问题。象征工具不是预测装置,当作映照自我叙事的镜子时最有用。当你问"这个数字的主题出现在我人生的哪里?",探索就开始了。' },
          ],
        },
        next: {
          heading: '下一站探索',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '我的存在地图' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '我喜欢的东西' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '带给我幸运的东西' },
            { href: l('/today'), emoji: '🌌', label: '今天的我' },
          ],
        },
      };

    case 'fr':
      return {
        badge: '🌟 Exploration de soi · Étape 3',
        title: 'Mon but existentiel',
        intro: 'Pas une recommandation de métier : une page pour forger votre « phrase de vie ». Pour quoi, et de quelle manière, existez-vous ?',
        question: {
          heading: 'La question à laquelle cette page répond',
          body: [
            '« Devrais-je continuer ce travail ? » est en réalité une question d\'existence, pas de métier. Les titres changent ; « le changement que je veux provoquer dans le monde » change rarement. Le fruit de cette exploration ne doit donc pas être un nom d\'entreprise mais une phrase — par exemple : « Je suis quelqu\'un qui transforme les émotions et pensées éparses en un ordre beau. »',
            'Cette page emprunte quatre traditions — ikigai, logothérapie, individuation, numérologie — pour vous guider dans la forge de votre propre phrase de vie.',
          ],
        },
        concepts: {
          heading: 'Quatre traditions du but',
          items: [
            { title: '⭕ Ikigai — l\'intersection de quatre cercles', body: 'Ce que vous aimez, ce que vous savez faire, ce dont le monde a besoin, ce qui peut être rémunéré. Là où les quatre cercles se recoupent : votre raison de vous lever.' },
            { title: '🕯️ Logothérapie — le sens se découvre', body: 'Pour Viktor Frankl, le sens ne se fabrique pas, il se découvre. Trois voies : la création (l\'œuvre), l\'expérience (l\'amour), l\'attitude (face à l\'épreuve).' },
            { title: '🌗 Individuation — devenir soi-même', body: 'La tâche de la vie selon Jung : quitter « le moi attendu par les autres » pour devenir le Soi véritable. La rencontre avec l\'ombre en est la porte.' },
            { title: '🔢 Numérologie — le chemin de vie', body: 'Le nombre du chemin de vie résume en langage symbolique les thèmes récurrents d\'une existence. À utiliser comme miroir de son récit, non comme prophétie.' },
          ],
        },
        tools: {
          heading: 'Explorer par soi-même',
          desc: 'Ordre conseillé : structure du désir (ennéagramme) → forces → direction (carrière) → symbole (numérologie).',
          items: [
            { href: l('/enneagram/test'), emoji: '🔥', label: 'Test d\'ennéagramme', desc: 'Le désir central qui vous anime' },
            { href: l('/inner-strength/test'), emoji: '💪', label: 'Forces intérieures', desc: 'Les armes déjà en main' },
            { href: l('/mbti/career'), emoji: '🧑‍💼', label: 'Guide carrière MBTI', desc: 'Manières de travailler par type' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: 'Calculateur de numérologie', desc: 'Lecture du chemin de vie' },
          ],
        },
        interpret: {
          heading: 'Forger sa phrase de vie',
          steps: [
            { title: 'Rassemblez les matériaux', body: 'Le désir central de votre ennéatype, vos trois forces majeures, le point commun des moments où le temps a disparu : voilà les matériaux de la phrase.' },
            { title: 'Assemblez : verbe + objet + transformation', body: '« Je suis quelqu\'un qui transforme [quoi] en [quoi] ». Le cœur n\'est pas le nom de métier mais le verbe — le verbe survit aux changements de carrière.' },
            { title: 'Décidez avec la phrase pendant un mois', body: 'À chaque petit carrefour, demandez : « Ce chemin rapproche-t-il de ma phrase ? » Si elle sonne faux, corrigez-la — c\'est une boussole, pas un produit fini.' },
          ],
        },
        tests: {
          heading: 'Tests à enchaîner',
          items: [
            { href: l('/big5/test'), emoji: '🌊', label: 'Big Five' },
            { href: l('/eq/test'), emoji: '💗', label: 'Intelligence émotionnelle' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: 'Estime de soi' },
            { href: l('/investment-type/test'), emoji: '💰', label: 'Profil d\'investisseur' },
          ],
        },
        blog: {
          heading: '📖 Lire plus loin (blog.oiyo.net)',
          items: [
            { href: b('ikigai-art-of-purpose'), label: 'Ikigai — l\'art du but', external: true },
            { href: b('viktor-frankl-purpose'), label: 'Viktor Frankl — la quête de sens', external: true },
            { href: b('individuation-process-self-realization'), label: 'L\'individuation, chemin de réalisation', external: true },
            { href: b('purpose-and-mental-health'), label: 'But et santé mentale', external: true },
          ],
        },
        wiki: {
          heading: '📚 Dictionnaire (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-archetypes'), label: 'Que sont les archétypes', external: true },
            { href: w('meaning-of-enneagram'), label: 'Origine et structure de l\'ennéagramme', external: true },
          ],
        },
        faq: {
          heading: 'Questions fréquentes',
          items: [
            { q: 'Faut-il absolument un but dans la vie ?', a: 'Pas besoin d\'une mission grandiose. La recherche montre que ce qui compte n\'est pas la taille du but mais le « sens de la direction » : sentir vers où vont vos actions du jour suffit à changer les indicateurs de santé mentale.' },
            { q: 'Que faire si ce que j\'aime et ce que je sais faire diffèrent ?', a: 'Rares sont ceux dont les quatre cercles de l\'ikigai se recoupent d\'emblée. La voie réaliste : bâtir le socle sur vos compétences et cultiver ce que vous aimez par petites expériences, pour élargir l\'intersection.' },
            { q: 'Ma phrase de vie peut-elle changer avec le temps ?', a: 'C\'est normal qu\'elle change. L\'individuation dure toute la vie ; la phrase n\'est que la boussole du moment. La relire et la réécrire une fois par an est en soi un beau rituel d\'exploration.' },
            { q: 'Dois-je croire sérieusement à la numérologie ?', a: 'Ce n\'est pas une question de foi mais d\'usage. Un outil symbolique est utile non comme dispositif de prédiction mais comme miroir de votre récit. Demandez : « Où ce thème apparaît-il dans ma vie ? » — l\'exploration commence là.' },
          ],
        },
        next: {
          heading: 'Prochaine exploration',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'Ma carte de l\'être' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'Ce que j\'aime' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'Ce qui me porte chance' },
            { href: l('/today'), emoji: '🌌', label: 'Moi, aujourd\'hui' },
          ],
        },
      };

    case 'es':
      return {
        badge: '🌟 Exploración del ser · Paso 3',
        title: 'Mi propósito existencial',
        intro: 'No es una página de recomendación laboral: es una página para forjar tu «frase de vida». ¿Para qué y de qué manera existes?',
        question: {
          heading: 'La pregunta que responde esta página',
          body: [
            '«¿Debería seguir en este trabajo?» es en realidad una pregunta de existencia, no de empleo. Los títulos cambian; «el cambio que quiero provocar en el mundo» rara vez cambia. Por eso el fruto de esta exploración no debe ser el nombre de una empresa sino una frase — por ejemplo: «Soy alguien que convierte emociones y pensamientos dispersos en un orden bello.»',
            'Esta página toma prestadas cuatro tradiciones — ikigai, logoterapia, individuación y numerología — para guiarte en la forja de tu propia frase de vida.',
          ],
        },
        concepts: {
          heading: 'Cuatro tradiciones del propósito',
          items: [
            { title: '⭕ Ikigai — la intersección de cuatro círculos', body: 'Lo que amas, lo que haces bien, lo que el mundo necesita y lo que puede remunerarse. Donde los cuatro círculos se superponen está tu razón para levantarte.' },
            { title: '🕯️ Logoterapia — el sentido se descubre', body: 'Para Viktor Frankl, el sentido no se fabrica: se descubre. Tres vías: la creación (la obra), la experiencia (el amor), la actitud (ante el sufrimiento).' },
            { title: '🌗 Individuación — llegar a ser uno mismo', body: 'La tarea vital según Jung: quitarse el «yo que otros esperan» y convertirse en el Sí-mismo verdadero. El encuentro con la sombra es la puerta.' },
            { title: '🔢 Numerología — el camino de vida', body: 'El número del camino de vida resume en lenguaje simbólico los temas recurrentes de una existencia. Úsalo como espejo de tu relato, no como profecía.' },
          ],
        },
        tools: {
          heading: 'Explorar en persona',
          desc: 'Orden recomendado: estructura del deseo (eneagrama) → fortalezas → dirección (carrera) → símbolo (numerología).',
          items: [
            { href: l('/enneagram/test'), emoji: '🔥', label: 'Test de eneagrama', desc: 'El deseo central que te mueve' },
            { href: l('/inner-strength/test'), emoji: '💪', label: 'Fortalezas internas', desc: 'Las armas que ya tienes' },
            { href: l('/mbti/career'), emoji: '🧑‍💼', label: 'Guía de carrera MBTI', desc: 'Formas de trabajar por tipo' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: 'Calculadora de numerología', desc: 'Lectura del camino de vida' },
          ],
        },
        interpret: {
          heading: 'Cómo forjar tu frase de vida',
          steps: [
            { title: 'Reúne los materiales', body: 'El deseo central de tu eneatipo, tus tres fortalezas principales y lo que tienen en común los momentos en que el tiempo desapareció: esos son los materiales de la frase.' },
            { title: 'Ensambla: verbo + objeto + transformación', body: '«Soy alguien que convierte [qué] en [qué]». El núcleo no es el nombre del oficio sino el verbo — el verbo sobrevive a los cambios de carrera.' },
            { title: 'Decide con la frase durante un mes', body: 'En cada pequeña encrucijada pregunta: «¿Este camino me acerca a mi frase?» Si suena falsa, corrígela — es una brújula, no un producto terminado.' },
          ],
        },
        tests: {
          heading: 'Tests para continuar',
          items: [
            { href: l('/big5/test'), emoji: '🌊', label: 'Big Five' },
            { href: l('/eq/test'), emoji: '💗', label: 'Inteligencia emocional' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: 'Autoestima' },
            { href: l('/investment-type/test'), emoji: '💰', label: 'Perfil de inversor' },
          ],
        },
        blog: {
          heading: '📖 Leer más (blog.oiyo.net)',
          items: [
            { href: b('ikigai-art-of-purpose'), label: 'Ikigai — el arte del propósito', external: true },
            { href: b('viktor-frankl-purpose'), label: 'Viktor Frankl — en busca de sentido', external: true },
            { href: b('individuation-process-self-realization'), label: 'La individuación, camino de realización', external: true },
            { href: b('purpose-and-mental-health'), label: 'Propósito y salud mental', external: true },
          ],
        },
        wiki: {
          heading: '📚 Diccionario (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-archetypes'), label: 'Qué son los arquetipos', external: true },
            { href: w('meaning-of-enneagram'), label: 'Origen y estructura del eneagrama', external: true },
          ],
        },
        faq: {
          heading: 'Preguntas frecuentes',
          items: [
            { q: '¿Es obligatorio tener un propósito de vida?', a: 'No hace falta una misión grandiosa. La investigación muestra que lo que importa no es el tamaño del propósito sino el «sentido de dirección»: basta con sentir hacia dónde van tus acciones de hoy para que los indicadores de salud mental cambien.' },
            { q: '¿Qué hago si lo que amo y lo que hago bien no coinciden?', a: 'Pocas personas tienen los cuatro círculos del ikigai superpuestos desde el principio. La vía realista: construir la base sobre lo que haces bien y cultivar lo que amas con pequeños experimentos, ampliando la intersección.' },
            { q: '¿Puede cambiar mi frase de vida con el tiempo?', a: 'Es normal que cambie. La individuación dura toda la vida; la frase es solo la brújula del momento. Releerla y reescribirla una vez al año es en sí un buen ritual de exploración.' },
            { q: '¿Debo creer en serio en la numerología?', a: 'No es cuestión de fe sino de uso. Una herramienta simbólica es útil no como dispositivo de predicción sino como espejo de tu relato. Pregunta: «¿Dónde aparece este tema en mi vida?» — ahí empieza la exploración.' },
          ],
        },
        next: {
          heading: 'Siguiente exploración',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'Mi mapa del ser' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'Lo que me gusta' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'Lo que me da suerte' },
            { href: l('/today'), emoji: '🌌', label: 'Yo, hoy' },
          ],
        },
      };

    default:
      return {
        badge: '🌟 Self-Discovery · Step 3',
        title: 'My existential purpose',
        intro: 'Not a career recommendation — a page for forging your "life sentence." For what, and in what way, do you exist?',
        question: {
          heading: 'The question this page answers',
          body: [
            '"Should I keep doing this job?" is really a question about existence, not employment. Titles change; "the change I want to cause in the world" rarely does. So the deliverable of purpose exploration should not be a company name but a sentence — for example: "I am someone who turns scattered feelings and thoughts into beautiful order."',
            'This page borrows four traditions — ikigai, logotherapy, individuation, and numerology — to guide you through forging your own life sentence.',
          ],
        },
        concepts: {
          heading: 'Four traditions of purpose',
          items: [
            { title: '⭕ Ikigai — where four circles meet', body: 'What you love, what you\'re good at, what the world needs, what you can be paid for. The overlap of the four circles is your reason to get up in the morning.' },
            { title: '🕯️ Logotherapy — meaning is discovered', body: 'Viktor Frankl taught that meaning is discovered, not manufactured. Three paths: creation (work), experience (love), and attitude (how you face suffering).' },
            { title: '🌗 Individuation — becoming yourself', body: 'Jung\'s life task: shedding "the self others expect" to become the true Self. Facing the shadow is the gateway.' },
            { title: '🔢 Numerology — the life path number', body: 'Your birth date reduced to a single digit summarizes recurring life themes in symbolic language. Use it as a mirror for your narrative, not a prophecy.' },
          ],
        },
        tools: {
          heading: 'Explore it yourself',
          desc: 'Recommended order: desire structure (Enneagram) → strengths → direction (career) → symbol (numerology).',
          items: [
            { href: l('/enneagram/test'), emoji: '🔥', label: 'Enneagram test', desc: 'The core desire that drives you' },
            { href: l('/inner-strength/test'), emoji: '💪', label: 'Inner strengths test', desc: 'The weapons you already carry' },
            { href: l('/mbti/career'), emoji: '🧑‍💼', label: 'MBTI career guide', desc: 'Ways of working by type' },
            { href: l('/numerology/calculator'), emoji: '🔢', label: 'Numerology calculator', desc: 'Life path number reading' },
          ],
        },
        interpret: {
          heading: 'How to forge your life sentence',
          steps: [
            { title: 'Gather the materials', body: 'Your Enneagram core desire, your top three strengths, and the common thread of moments when time vanished — these are the sentence\'s raw materials.' },
            { title: 'Assemble: verb + object + transformation', body: 'Fill the frame "I am someone who turns [what] into [what]." The core is the verb, not a job title — verbs survive career changes.' },
            { title: 'Decide by the sentence for one month', body: 'At each small crossroads, ask: "Which path is closer to my sentence?" If it rings false, revise it — the sentence is a compass, not a finished product.' },
          ],
        },
        tests: {
          heading: 'Tests to take next',
          items: [
            { href: l('/big5/test'), emoji: '🌊', label: 'Big Five' },
            { href: l('/eq/test'), emoji: '💗', label: 'Emotional intelligence' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: 'Self-esteem' },
            { href: l('/investment-type/test'), emoji: '💰', label: 'Investor profile' },
          ],
        },
        blog: {
          heading: '📖 Read deeper (blog.oiyo.net)',
          items: [
            { href: b('ikigai-art-of-purpose'), label: 'Ikigai — the art of purpose', external: true },
            { href: b('viktor-frankl-purpose'), label: 'Viktor Frankl — the search for meaning', external: true },
            { href: b('individuation-process-self-realization'), label: 'Individuation — the path of self-realization', external: true },
            { href: b('purpose-and-mental-health'), label: 'Purpose and mental health', external: true },
            { href: b('power-of-purpose'), label: 'The power of purpose', external: true },
          ],
        },
        wiki: {
          heading: '📚 Concept dictionary (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-archetypes'), label: 'What are archetypes', external: true },
            { href: w('meaning-of-enneagram'), label: 'Origin & structure of the Enneagram', external: true },
          ],
        },
        faq: {
          heading: 'Frequently asked questions',
          items: [
            { q: 'Do I really need a life purpose?', a: 'You don\'t need a grand mission. Research shows what matters is not the size of the purpose but a sense of direction — simply feeling where today\'s actions point changes mental-health outcomes.' },
            { q: 'What if what I love and what I\'m good at are different?', a: 'Few people start with all four ikigai circles overlapping. The realistic path: build your foundation on what you\'re good at, grow what you love through small experiments, and widen the intersection over time.' },
            { q: 'Is it okay if my life sentence changes over time?', a: 'Changing is normal. Individuation is a lifelong process, and the sentence is only the compass of this moment. Rereading and rewriting it once a year is itself a fine ritual of self-exploration.' },
            { q: 'Should I seriously believe in tools like numerology?', a: 'It\'s a question of use, not belief. Symbolic tools work best not as prediction devices but as mirrors for your narrative. The moment you ask "where does this number\'s theme show up in my life?", the exploration begins.' },
          ],
        },
        next: {
          heading: 'Next exploration',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'My map of being' },
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'What I love' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'What brings me luck' },
            { href: l('/today'), emoji: '🌌', label: 'Me, today' },
          ],
        },
      };
  }
}
