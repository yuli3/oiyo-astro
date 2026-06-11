import type { Locale } from '../../../i18n';
import { localePath } from '../../../i18n';
import { blogUrl, wikiUrl } from './types';
import type { JourneyContent } from './types';

export function personalityContent(locale: Locale): JourneyContent {
  const l = (p: string) => localePath(locale, p);
  const b = (s: string) => blogUrl(locale, s);
  const w = (s: string) => wikiUrl(locale, s);

  switch (locale) {
    case 'ko':
      return {
        badge: '🧭 존재 탐구 · 1단계',
        title: '나는 어떤 결을 가진 사람인가',
        intro: 'MBTI·빅파이브·에니어그램·사주를 하나의 지도로 겹쳐 보면, 단일 검사로는 보이지 않던 나의 패턴이 드러납니다.',
        question: {
          heading: '이 페이지가 답하는 질문',
          body: [
            '"나는 왜 이렇게 행동할까?" — 성격 검사를 하나만 해보면 라벨 하나가 남지만, 여러 렌즈를 겹쳐 보면 비로소 패턴이 보입니다. MBTI는 내가 에너지를 얻고 판단하는 방식을, 빅파이브는 과학적으로 검증된 5가지 기질의 농도를, 에니어그램은 나를 움직이는 핵심 욕망과 두려움을, 사주는 타고난 기질의 계절을 비춥니다.',
            '이 페이지는 그 렌즈들을 어떤 순서로 사용하고, 결과가 서로 모순될 때 어떻게 읽어야 하는지 안내하는 출발점입니다.',
          ],
        },
        concepts: {
          heading: '네 가지 렌즈',
          items: [
            { title: '🎭 MBTI — 선호의 언어', body: '에너지 방향(E/I), 정보 수집(S/N), 판단(T/F), 생활양식(J/P)의 4가지 선호 축. 인지기능까지 내려가면 "왜"가 보입니다.' },
            { title: '🌊 빅파이브 — 기질의 농도', body: '개방성·성실성·외향성·우호성·신경성을 연속선 위 점수로 측정하는, 심리학계에서 가장 검증된 모델입니다.' },
            { title: '🔥 에니어그램 — 욕망의 지도', body: '9가지 유형 각각의 핵심 욕망과 두려움. 성장 방향과 스트레스 방향까지 알려주는 역동적 지도입니다.' },
            { title: '🌳 사주 — 기질의 계절', body: '태어난 순간의 천간·지지가 그리는 오행 분포. 내 기질이 어떤 계절의 에너지를 닮았는지 보여줍니다.' },
          ],
        },
        tools: {
          heading: '직접 탐구하기',
          desc: '처음이라면 MBTI → 빅파이브 → 에니어그램 → 사주 순서를 추천합니다. 각 15분 이내.',
          items: [
            { href: l('/mbti/test'), emoji: '🎭', label: 'MBTI 성격유형 검사', desc: '16유형 + 인지기능 해설' },
            { href: l('/big5/test'), emoji: '🌊', label: '빅파이브 성격 검사', desc: '5요인 점수 프로파일' },
            { href: l('/enneagram/test'), emoji: '🔥', label: '에니어그램 검사', desc: '9유형 + 날개 분석' },
            { href: l('/saju/calculator'), emoji: '🌳', label: '사주 계산기', desc: '오행 분포와 일주 풀이' },
          ],
        },
        interpret: {
          heading: '결과를 겹쳐 읽는 법',
          steps: [
            { title: '공통 신호를 찾으세요', body: 'INFP + 높은 개방성 + 에니어그램 4번처럼 여러 검사가 같은 방향을 가리키면, 그것이 당신의 가장 안정적인 결입니다.' },
            { title: '모순은 오류가 아니라 입체감입니다', body: '외향형인데 신경성이 높다면 "사람을 좋아하지만 쉽게 소진되는 사람"일 수 있습니다. 모순처럼 보이는 조합이 오히려 정확한 자화상입니다.' },
            { title: '라벨이 아니라 동사로 번역하세요', body: '"나는 INFJ다"에서 멈추지 말고 "나는 혼자 정리할 시간이 있어야 결정을 잘한다"처럼 행동 문장으로 바꿔야 일상이 달라집니다.' },
          ],
        },
        tests: {
          heading: '이어서 해볼 검사',
          items: [
            { href: l('/attachment-style/test'), emoji: '🫂', label: '애착유형 검사' },
            { href: l('/eq/test'), emoji: '💗', label: 'EQ 감성지능 검사' },
            { href: l('/empathy/test'), emoji: '🤝', label: '공감능력 검사' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: '자존감 검사' },
            { href: l('/personal-color/test'), emoji: '🎨', label: '퍼스널컬러 검사' },
            { href: l('/inner-strength/test'), emoji: '💪', label: '내면 강점 검사' },
          ],
        },
        blog: {
          heading: '📖 더 깊이 읽기 (blog.oiyo.net)',
          items: [
            { href: b('mbti-complete-deep-guide'), label: 'MBTI 완전 정복 가이드', external: true },
            { href: b('8-cognitive-functions-deep-dive'), label: '8가지 인지기능 깊이 읽기', external: true },
            { href: b('enneagram-mbti-integration'), label: '에니어그램 × MBTI 통합하기', external: true },
            { href: b('evolving-self-saju-mbti'), label: '사주와 MBTI로 보는 진화하는 나', external: true },
            { href: b('jung-shadow-psychology'), label: '융의 그림자 심리학', external: true },
          ],
        },
        wiki: {
          heading: '📚 개념 사전 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-mbti'), label: 'MBTI란 무엇인가', external: true },
            { href: w('meaning-of-big5'), label: '빅파이브 5요인 모델', external: true },
            { href: w('meaning-of-enneagram'), label: '에니어그램의 기원과 구조', external: true },
            { href: w('meaning-of-archetypes'), label: '원형(아키타입)이란', external: true },
          ],
        },
        faq: {
          heading: '자주 묻는 질문',
          items: [
            { q: '검사마다 결과가 다르게 나오면 어느 것을 믿어야 하나요?', a: '검사들은 서로 다른 층위를 측정합니다. MBTI는 선호, 빅파이브는 기질의 강도, 에니어그램은 동기를 봅니다. 결과가 다른 것은 모순이 아니라 각 층위의 답이며, 겹치는 신호가 가장 신뢰할 만한 부분입니다.' },
            { q: 'MBTI는 비과학적이라던데 할 가치가 있나요?', a: '학술 연구에서는 빅파이브가 표준이지만, MBTI는 자기 언어화의 출발점으로 여전히 유용합니다. 둘을 함께 보면 MBTI의 직관적 언어와 빅파이브의 정밀한 측정을 모두 얻을 수 있습니다.' },
            { q: '성격은 평생 변하지 않나요?', a: '빅파이브 연구에 따르면 성격은 성인기에도 천천히 변합니다. 특히 성실성과 우호성은 나이가 들며 높아지는 경향이 있습니다. 검사 결과는 "현재의 나"의 스냅샷으로 읽는 것이 정확합니다.' },
            { q: '사주는 성격 검사와 어떻게 함께 보나요?', a: '사주의 오행 분포는 타고난 기질의 은유적 지도입니다. 심리 검사가 "지금의 나"를 측정한다면, 사주는 "원형으로서의 나"를 상징 언어로 보여줍니다. 두 그림의 차이 자체가 흥미로운 탐구 거리가 됩니다.' },
          ],
        },
        next: {
          heading: '다음 탐구',
          items: [
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '내가 좋아하는 것' },
            { href: l('/ontology/life-purpose'), emoji: '🧭', label: '나의 존재론적 목표' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '나에게 행운을 주는 것' },
            { href: l('/today'), emoji: '🌌', label: '오늘의 나' },
          ],
        },
      };

    case 'ja':
      return {
        badge: '🧭 存在の探求 · ステップ1',
        title: '私はどんな「結」を持つ人間か',
        intro: 'MBTI・ビッグファイブ・エニアグラム・四柱推命を一枚の地図に重ねると、単独のテストでは見えなかった自分のパターンが浮かび上がります。',
        question: {
          heading: 'このページが答える問い',
          body: [
            '「なぜ私はこう行動するのか?」— 性格テストを1つ受けるとラベルが1つ残るだけですが、複数のレンズを重ねるとパターンが見えてきます。MBTIはエネルギーと判断の方向を、ビッグファイブは科学的に検証された5つの気質の濃度を、エニアグラムは自分を動かす欲望と恐れを、四柱推命は生まれ持った気質の季節を映します。',
            'このページは、それらのレンズをどの順序で使い、結果が矛盾するときどう読むべきかを案内する出発点です。',
          ],
        },
        concepts: {
          heading: '4つのレンズ',
          items: [
            { title: '🎭 MBTI — 選好の言語', body: 'エネルギーの方向(E/I)、情報収集(S/N)、判断(T/F)、生活様式(J/P)の4軸。認知機能まで掘ると「なぜ」が見えます。' },
            { title: '🌊 ビッグファイブ — 気質の濃度', body: '開放性・誠実性・外向性・協調性・神経症傾向を連続的なスコアで測る、心理学で最も検証されたモデル。' },
            { title: '🔥 エニアグラム — 欲望の地図', body: '9タイプそれぞれの核心的な欲望と恐れ。成長とストレスの方向まで示す動的な地図です。' },
            { title: '🌳 四柱推命 — 気質の季節', body: '生まれた瞬間の天干・地支が描く五行の分布。自分の気質がどの季節のエネルギーに似ているかを示します。' },
          ],
        },
        tools: {
          heading: '実際に探求する',
          desc: '初めてなら MBTI → ビッグファイブ → エニアグラム → 四柱推命 の順がおすすめ。各15分以内。',
          items: [
            { href: l('/mbti/test'), emoji: '🎭', label: 'MBTI性格タイプ診断', desc: '16タイプ+認知機能の解説' },
            { href: l('/big5/test'), emoji: '🌊', label: 'ビッグファイブ診断', desc: '5因子スコアのプロファイル' },
            { href: l('/enneagram/test'), emoji: '🔥', label: 'エニアグラム診断', desc: '9タイプ+ウィング分析' },
            { href: l('/saju/calculator'), emoji: '🌳', label: '四柱推命計算機', desc: '五行の分布と日柱の解説' },
          ],
        },
        interpret: {
          heading: '結果を重ねて読む方法',
          steps: [
            { title: '共通のシグナルを探す', body: 'INFP+高い開放性+エニアグラム4番のように複数のテストが同じ方向を指すなら、それがあなたの最も安定した「結」です。' },
            { title: '矛盾はエラーではなく立体感', body: '外向型なのに神経症傾向が高いなら「人が好きだが消耗しやすい人」かもしれません。矛盾に見える組み合わせこそ正確な自画像です。' },
            { title: 'ラベルではなく動詞に翻訳する', body: '「私はINFJだ」で止まらず「一人で整理する時間があると良い決断ができる」のような行動文に変えると日常が変わります。' },
          ],
        },
        tests: {
          heading: '続けて受けたい診断',
          items: [
            { href: l('/attachment-style/test'), emoji: '🫂', label: '愛着スタイル診断' },
            { href: l('/eq/test'), emoji: '💗', label: 'EQ診断' },
            { href: l('/empathy/test'), emoji: '🤝', label: '共感力診断' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: '自己肯定感診断' },
            { href: l('/personal-color/test'), emoji: '🎨', label: 'パーソナルカラー診断' },
            { href: l('/inner-strength/test'), emoji: '💪', label: '内なる強み診断' },
          ],
        },
        blog: {
          heading: '📖 深く読む (blog.oiyo.net)',
          items: [
            { href: b('8-cognitive-functions-deep-dive'), label: '8つの認知機能を深く読む', external: true },
            { href: b('enneagram-mbti-integration'), label: 'エニアグラム×MBTIの統合', external: true },
            { href: b('evolving-self-saju-mbti'), label: '四柱推命とMBTIで見る進化する自分', external: true },
            { href: b('jung-shadow-psychology'), label: 'ユングの影の心理学', external: true },
          ],
        },
        wiki: {
          heading: '📚 概念辞典 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-mbti'), label: 'MBTIとは何か', external: true },
            { href: w('meaning-of-big5'), label: 'ビッグファイブ5因子モデル', external: true },
            { href: w('meaning-of-enneagram'), label: 'エニアグラムの起源と構造', external: true },
            { href: w('meaning-of-archetypes'), label: 'アーキタイプ(元型)とは', external: true },
          ],
        },
        faq: {
          heading: 'よくある質問',
          items: [
            { q: 'テストごとに結果が違う場合、どれを信じるべき?', a: 'テストは異なる層を測定しています。MBTIは選好、ビッグファイブは気質の強度、エニアグラムは動機を見ます。結果の違いは矛盾ではなく各層の答えであり、重なるシグナルが最も信頼できる部分です。' },
            { q: 'MBTIは非科学的と聞きましたが、受ける価値はありますか?', a: '学術研究ではビッグファイブが標準ですが、MBTIは自己言語化の出発点として有用です。両方を見ればMBTIの直感的な言語とビッグファイブの精密な測定の両方が得られます。' },
            { q: '性格は一生変わらないのですか?', a: 'ビッグファイブの研究によれば、性格は成人期にもゆっくり変化します。特に誠実性と協調性は年齢とともに高まる傾向があります。結果は「今の自分」のスナップショットとして読むのが正確です。' },
            { q: '四柱推命は性格テストとどう組み合わせる?', a: '四柱の五行分布は生まれ持った気質の隠喩的な地図です。心理テストが「今の自分」を測るなら、四柱推命は「原型としての自分」を象徴言語で示します。2つの絵の違い自体が興味深い探求の材料になります。' },
          ],
        },
        next: {
          heading: '次の探求',
          items: [
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '私が好きなもの' },
            { href: l('/ontology/life-purpose'), emoji: '🧭', label: '存在論的な目標' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '幸運をもたらすもの' },
            { href: l('/today'), emoji: '🌌', label: '今日の私' },
          ],
        },
      };

    case 'zh':
      return {
        badge: '🧭 存在探索 · 第1步',
        title: '我是怎样质地的人',
        intro: '把 MBTI、大五人格、九型人格和八字叠在同一张地图上,单一测试看不见的模式就会浮现。',
        question: {
          heading: '本页回答的问题',
          body: [
            '"我为什么会这样行动?"——只做一个性格测试,留下的只是一个标签;叠加多个视角,模式才会显现。MBTI 映照你获取能量与做判断的方式,大五人格测量经科学验证的五种气质浓度,九型人格揭示驱动你的核心欲望与恐惧,八字则呈现与生俱来的气质季节。',
            '本页是一个起点:告诉你按什么顺序使用这些镜头,以及当结果互相矛盾时该如何解读。',
          ],
        },
        concepts: {
          heading: '四个镜头',
          items: [
            { title: '🎭 MBTI — 偏好的语言', body: '能量方向(E/I)、信息收集(S/N)、判断(T/F)、生活方式(J/P)四个轴;深入认知功能,就能看见"为什么"。' },
            { title: '🌊 大五人格 — 气质的浓度', body: '以连续分数测量开放性、尽责性、外向性、宜人性、神经质,是心理学界验证最充分的模型。' },
            { title: '🔥 九型人格 — 欲望的地图', body: '九种类型各自的核心欲望与恐惧,还指出成长与压力的方向,是一张动态地图。' },
            { title: '🌳 八字 — 气质的季节', body: '出生时刻的天干地支描绘出五行分布,显示你的气质更像哪个季节的能量。' },
          ],
        },
        tools: {
          heading: '亲自探索',
          desc: '初次建议顺序:MBTI → 大五 → 九型 → 八字,每项15分钟以内。',
          items: [
            { href: l('/mbti/test'), emoji: '🎭', label: 'MBTI 性格测试', desc: '16型+认知功能解读' },
            { href: l('/big5/test'), emoji: '🌊', label: '大五人格测试', desc: '五因子分数档案' },
            { href: l('/enneagram/test'), emoji: '🔥', label: '九型人格测试', desc: '9型+侧翼分析' },
            { href: l('/saju/calculator'), emoji: '🌳', label: '八字计算器', desc: '五行分布与日柱解读' },
          ],
        },
        interpret: {
          heading: '叠加解读结果的方法',
          steps: [
            { title: '寻找共同信号', body: '如 INFP+高开放性+九型4号,多个测试指向同一方向时,那就是你最稳定的质地。' },
            { title: '矛盾不是错误,而是立体感', body: '外向却神经质高,可能是"喜欢人但容易耗竭的人"。看似矛盾的组合反而是准确的自画像。' },
            { title: '把标签翻译成动词', body: '不要停在"我是INFJ",改写成"我需要独处整理才能做好决定"这样的行动句,日常才会改变。' },
          ],
        },
        tests: {
          heading: '接着做的测试',
          items: [
            { href: l('/attachment-style/test'), emoji: '🫂', label: '依恋类型测试' },
            { href: l('/eq/test'), emoji: '💗', label: '情商测试' },
            { href: l('/empathy/test'), emoji: '🤝', label: '共情能力测试' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: '自尊测试' },
            { href: l('/personal-color/test'), emoji: '🎨', label: '个人色彩测试' },
            { href: l('/inner-strength/test'), emoji: '💪', label: '内在力量测试' },
          ],
        },
        blog: {
          heading: '📖 深入阅读 (blog.oiyo.net)',
          items: [
            { href: b('8-cognitive-functions-deep-dive'), label: '深入解读8种认知功能', external: true },
            { href: b('enneagram-mbti-integration'), label: '九型人格 × MBTI 整合', external: true },
            { href: b('evolving-self-saju-mbti'), label: '八字与MBTI中进化的自我', external: true },
            { href: b('jung-shadow-psychology'), label: '荣格的阴影心理学', external: true },
          ],
        },
        wiki: {
          heading: '📚 概念词典 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-mbti'), label: '什么是MBTI', external: true },
            { href: w('meaning-of-big5'), label: '大五人格五因子模型', external: true },
            { href: w('meaning-of-enneagram'), label: '九型人格的起源与结构', external: true },
            { href: w('meaning-of-archetypes'), label: '什么是原型', external: true },
          ],
        },
        faq: {
          heading: '常见问题',
          items: [
            { q: '不同测试结果不一致,该信哪个?', a: '这些测试测量的是不同层面:MBTI看偏好,大五看气质强度,九型看动机。结果不同不是矛盾,而是各层面的答案;重叠的信号才是最可信的部分。' },
            { q: '听说MBTI不科学,还值得做吗?', a: '学术研究以大五为标准,但MBTI作为自我语言化的起点仍然有用。两者并用,既得到MBTI的直观语言,又得到大五的精确测量。' },
            { q: '性格一辈子不变吗?', a: '大五研究表明,性格在成年后仍会缓慢变化,尤其尽责性和宜人性随年龄增长。把结果当作"当下的我"的快照最准确。' },
            { q: '八字怎么和性格测试一起看?', a: '八字的五行分布是先天气质的隐喻地图。心理测试测量"现在的我",八字以象征语言呈现"原型的我"。两幅图的差异本身就是有趣的探索素材。' },
          ],
        },
        next: {
          heading: '下一站探索',
          items: [
            { href: l('/ontology/hobbies'), emoji: '🎨', label: '我喜欢的东西' },
            { href: l('/ontology/life-purpose'), emoji: '🧭', label: '我的存在目标' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '带给我幸运的东西' },
            { href: l('/today'), emoji: '🌌', label: '今天的我' },
          ],
        },
      };

    case 'fr':
      return {
        badge: '🧭 Exploration de soi · Étape 1',
        title: 'Quelle est la texture de ma personnalité ?',
        intro: 'Superposez MBTI, Big Five, ennéagramme et Saju sur une même carte : des motifs invisibles à un seul test apparaissent.',
        question: {
          heading: 'La question à laquelle cette page répond',
          body: [
            '« Pourquoi est-ce que j\'agis ainsi ? » Un seul test de personnalité laisse une étiquette ; plusieurs lentilles superposées révèlent un motif. Le MBTI éclaire votre manière de puiser de l\'énergie et de décider, le Big Five mesure scientifiquement cinq tempéraments, l\'ennéagramme révèle le désir et la peur qui vous animent, et le Saju dessine la saison de votre tempérament inné.',
            'Cette page est un point de départ : dans quel ordre utiliser ces lentilles, et comment lire des résultats qui semblent se contredire.',
          ],
        },
        concepts: {
          heading: 'Quatre lentilles',
          items: [
            { title: '🎭 MBTI — le langage des préférences', body: 'Quatre axes : énergie (E/I), perception (S/N), décision (T/F), style de vie (J/P). Les fonctions cognitives révèlent le « pourquoi ».' },
            { title: '🌊 Big Five — l\'intensité du tempérament', body: 'Ouverture, conscienciosité, extraversion, agréabilité et névrosisme mesurés en continu : le modèle le plus validé en psychologie.' },
            { title: '🔥 Ennéagramme — la carte des désirs', body: 'Le désir central et la peur de chacun des 9 types, avec les directions de croissance et de stress.' },
            { title: '🌳 Saju — la saison du tempérament', body: 'La distribution des cinq éléments au moment de votre naissance : à quelle saison ressemble votre énergie innée.' },
          ],
        },
        tools: {
          heading: 'Explorer par soi-même',
          desc: 'Ordre conseillé pour débuter : MBTI → Big Five → ennéagramme → Saju. Moins de 15 minutes chacun.',
          items: [
            { href: l('/mbti/test'), emoji: '🎭', label: 'Test MBTI', desc: '16 types + fonctions cognitives' },
            { href: l('/big5/test'), emoji: '🌊', label: 'Test Big Five', desc: 'Profil en 5 facteurs' },
            { href: l('/enneagram/test'), emoji: '🔥', label: 'Test d\'ennéagramme', desc: '9 types + ailes' },
            { href: l('/saju/calculator'), emoji: '🌳', label: 'Calculateur Saju', desc: 'Cinq éléments et pilier du jour' },
          ],
        },
        interpret: {
          heading: 'Lire les résultats en superposition',
          steps: [
            { title: 'Cherchez les signaux communs', body: 'INFP + forte ouverture + type 4 : quand plusieurs tests pointent dans la même direction, c\'est votre trait le plus stable.' },
            { title: 'La contradiction est du relief, pas une erreur', body: 'Extraverti mais névrosisme élevé ? Peut-être « quelqu\'un qui aime les gens mais s\'épuise vite ». Les combinaisons paradoxales sont souvent le portrait le plus juste.' },
            { title: 'Traduisez l\'étiquette en verbe', body: 'Ne vous arrêtez pas à « je suis INFJ » ; transformez en « je décide mieux après un temps seul ». C\'est la phrase d\'action qui change le quotidien.' },
          ],
        },
        tests: {
          heading: 'Tests à enchaîner',
          items: [
            { href: l('/attachment-style/test'), emoji: '🫂', label: 'Style d\'attachement' },
            { href: l('/eq/test'), emoji: '💗', label: 'Intelligence émotionnelle' },
            { href: l('/empathy/test'), emoji: '🤝', label: 'Empathie' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: 'Estime de soi' },
            { href: l('/personal-color/test'), emoji: '🎨', label: 'Couleur personnelle' },
            { href: l('/inner-strength/test'), emoji: '💪', label: 'Forces intérieures' },
          ],
        },
        blog: {
          heading: '📖 Lire plus loin (blog.oiyo.net)',
          items: [
            { href: b('8-cognitive-functions-deep-dive'), label: 'Les 8 fonctions cognitives en profondeur', external: true },
            { href: b('enneagram-mbti-integration'), label: 'Intégrer ennéagramme et MBTI', external: true },
            { href: b('evolving-self-saju-mbti'), label: 'Le soi en évolution : Saju et MBTI', external: true },
            { href: b('jung-shadow-psychology'), label: 'La psychologie de l\'ombre de Jung', external: true },
          ],
        },
        wiki: {
          heading: '📚 Dictionnaire (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-mbti'), label: 'Qu\'est-ce que le MBTI', external: true },
            { href: w('meaning-of-big5'), label: 'Le modèle Big Five', external: true },
            { href: w('meaning-of-enneagram'), label: 'Origine et structure de l\'ennéagramme', external: true },
            { href: w('meaning-of-archetypes'), label: 'Que sont les archétypes', external: true },
          ],
        },
        faq: {
          heading: 'Questions fréquentes',
          items: [
            { q: 'Les tests donnent des résultats différents : lequel croire ?', a: 'Ils mesurent des couches différentes : le MBTI les préférences, le Big Five l\'intensité du tempérament, l\'ennéagramme les motivations. Les différences ne sont pas des contradictions ; les signaux qui se recoupent sont les plus fiables.' },
            { q: 'Le MBTI n\'est pas scientifique : vaut-il la peine ?', a: 'La recherche académique privilégie le Big Five, mais le MBTI reste un excellent point de départ pour mettre des mots sur soi. Ensemble, vous obtenez le langage intuitif de l\'un et la précision de l\'autre.' },
            { q: 'La personnalité change-t-elle au cours de la vie ?', a: 'Selon les études sur le Big Five, oui, lentement : la conscienciosité et l\'agréabilité tendent à augmenter avec l\'âge. Lisez vos résultats comme un instantané du « moi actuel ».' },
            { q: 'Comment combiner le Saju avec les tests psychologiques ?', a: 'La distribution des cinq éléments est une carte métaphorique du tempérament inné. Les tests mesurent le « moi actuel », le Saju montre le « moi archétypal » en langage symbolique. L\'écart entre les deux est en soi une piste d\'exploration.' },
          ],
        },
        next: {
          heading: 'Prochaine exploration',
          items: [
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'Ce que j\'aime' },
            { href: l('/ontology/life-purpose'), emoji: '🧭', label: 'Mon but existentiel' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'Ce qui me porte chance' },
            { href: l('/today'), emoji: '🌌', label: 'Moi, aujourd\'hui' },
          ],
        },
      };

    case 'es':
      return {
        badge: '🧭 Exploración del ser · Paso 1',
        title: '¿Qué textura tiene mi personalidad?',
        intro: 'Superpón MBTI, Big Five, eneagrama y Saju en un solo mapa: aparecen patrones que ningún test muestra por sí solo.',
        question: {
          heading: 'La pregunta que responde esta página',
          body: [
            '«¿Por qué actúo así?» Un solo test de personalidad deja una etiqueta; varias lentes superpuestas revelan un patrón. El MBTI ilumina cómo obtienes energía y decides, el Big Five mide científicamente cinco temperamentos, el eneagrama revela el deseo y el miedo que te mueven, y el Saju dibuja la estación de tu temperamento innato.',
            'Esta página es un punto de partida: en qué orden usar esas lentes y cómo leer resultados que parecen contradecirse.',
          ],
        },
        concepts: {
          heading: 'Cuatro lentes',
          items: [
            { title: '🎭 MBTI — el lenguaje de las preferencias', body: 'Cuatro ejes: energía (E/I), percepción (S/N), decisión (T/F), estilo de vida (J/P). Las funciones cognitivas revelan el «porqué».' },
            { title: '🌊 Big Five — la intensidad del temperamento', body: 'Apertura, responsabilidad, extraversión, amabilidad y neuroticismo en puntuaciones continuas: el modelo más validado de la psicología.' },
            { title: '🔥 Eneagrama — el mapa de los deseos', body: 'El deseo central y el miedo de cada uno de los 9 tipos, con direcciones de crecimiento y de estrés.' },
            { title: '🌳 Saju — la estación del temperamento', body: 'La distribución de los cinco elementos en el momento de tu nacimiento: a qué estación se parece tu energía innata.' },
          ],
        },
        tools: {
          heading: 'Explorar en persona',
          desc: 'Orden recomendado para empezar: MBTI → Big Five → eneagrama → Saju. Menos de 15 minutos cada uno.',
          items: [
            { href: l('/mbti/test'), emoji: '🎭', label: 'Test MBTI', desc: '16 tipos + funciones cognitivas' },
            { href: l('/big5/test'), emoji: '🌊', label: 'Test Big Five', desc: 'Perfil de 5 factores' },
            { href: l('/enneagram/test'), emoji: '🔥', label: 'Test de eneagrama', desc: '9 tipos + alas' },
            { href: l('/saju/calculator'), emoji: '🌳', label: 'Calculadora Saju', desc: 'Cinco elementos y pilar del día' },
          ],
        },
        interpret: {
          heading: 'Cómo leer los resultados superpuestos',
          steps: [
            { title: 'Busca las señales comunes', body: 'INFP + alta apertura + tipo 4: cuando varios tests apuntan en la misma dirección, ese es tu rasgo más estable.' },
            { title: 'La contradicción es relieve, no error', body: '¿Extravertido pero con neuroticismo alto? Quizá «alguien que ama a la gente pero se agota rápido». Las combinaciones paradójicas suelen ser el retrato más fiel.' },
            { title: 'Traduce la etiqueta a un verbo', body: 'No te quedes en «soy INFJ»; conviértelo en «decido mejor después de un rato a solas». La frase de acción es la que cambia el día a día.' },
          ],
        },
        tests: {
          heading: 'Tests para continuar',
          items: [
            { href: l('/attachment-style/test'), emoji: '🫂', label: 'Estilo de apego' },
            { href: l('/eq/test'), emoji: '💗', label: 'Inteligencia emocional' },
            { href: l('/empathy/test'), emoji: '🤝', label: 'Empatía' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: 'Autoestima' },
            { href: l('/personal-color/test'), emoji: '🎨', label: 'Color personal' },
            { href: l('/inner-strength/test'), emoji: '💪', label: 'Fortalezas internas' },
          ],
        },
        blog: {
          heading: '📖 Leer más (blog.oiyo.net)',
          items: [
            { href: b('8-cognitive-functions-deep-dive'), label: 'Las 8 funciones cognitivas a fondo', external: true },
            { href: b('enneagram-mbti-integration'), label: 'Integrar eneagrama y MBTI', external: true },
            { href: b('evolving-self-saju-mbti'), label: 'El yo en evolución: Saju y MBTI', external: true },
            { href: b('jung-shadow-psychology'), label: 'La psicología de la sombra de Jung', external: true },
          ],
        },
        wiki: {
          heading: '📚 Diccionario (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-mbti'), label: 'Qué es el MBTI', external: true },
            { href: w('meaning-of-big5'), label: 'El modelo Big Five', external: true },
            { href: w('meaning-of-enneagram'), label: 'Origen y estructura del eneagrama', external: true },
            { href: w('meaning-of-archetypes'), label: 'Qué son los arquetipos', external: true },
          ],
        },
        faq: {
          heading: 'Preguntas frecuentes',
          items: [
            { q: 'Los tests dan resultados distintos: ¿cuál creer?', a: 'Miden capas diferentes: el MBTI preferencias, el Big Five intensidad del temperamento, el eneagrama motivaciones. Las diferencias no son contradicciones; las señales que coinciden son las más fiables.' },
            { q: 'Dicen que el MBTI no es científico, ¿merece la pena?', a: 'La investigación académica prefiere el Big Five, pero el MBTI sigue siendo un buen punto de partida para ponerte en palabras. Juntos obtienes el lenguaje intuitivo de uno y la precisión del otro.' },
            { q: '¿La personalidad cambia a lo largo de la vida?', a: 'Según los estudios del Big Five, sí, lentamente: la responsabilidad y la amabilidad tienden a aumentar con la edad. Lee tus resultados como una instantánea del «yo actual».' },
            { q: '¿Cómo combino el Saju con los tests psicológicos?', a: 'La distribución de los cinco elementos es un mapa metafórico del temperamento innato. Los tests miden el «yo actual»; el Saju muestra el «yo arquetípico» en lenguaje simbólico. La diferencia entre ambos es en sí una pista de exploración.' },
          ],
        },
        next: {
          heading: 'Siguiente exploración',
          items: [
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'Lo que me gusta' },
            { href: l('/ontology/life-purpose'), emoji: '🧭', label: 'Mi propósito existencial' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'Lo que me da suerte' },
            { href: l('/today'), emoji: '🌌', label: 'Yo, hoy' },
          ],
        },
      };

    default:
      return {
        badge: '🧭 Self-Discovery · Step 1',
        title: 'What is the texture of my personality?',
        intro: 'Layer MBTI, Big Five, Enneagram, and Saju onto one map, and patterns emerge that no single test can show.',
        question: {
          heading: 'The question this page answers',
          body: [
            '"Why do I act this way?" Take one personality test and you are left with a label; layer several lenses and a pattern appears. MBTI shows how you gather energy and make decisions, the Big Five measures five scientifically validated temperaments, the Enneagram reveals the core desire and fear that drive you, and Saju sketches the season of your innate temperament.',
            'This page is a starting point: which order to use these lenses in, and how to read results that seem to contradict each other.',
          ],
        },
        concepts: {
          heading: 'Four lenses',
          items: [
            { title: '🎭 MBTI — the language of preferences', body: 'Four axes: energy (E/I), perception (S/N), judging (T/F), lifestyle (J/P). Dig down to cognitive functions and the "why" appears.' },
            { title: '🌊 Big Five — temperament intensity', body: 'Openness, conscientiousness, extraversion, agreeableness, and neuroticism on continuous scores — psychology\'s most validated model.' },
            { title: '🔥 Enneagram — the map of desires', body: 'The core desire and fear of each of the 9 types, plus growth and stress directions. A dynamic map, not a static label.' },
            { title: '🌳 Saju — the season of temperament', body: 'The five-element distribution drawn by the heavenly stems and earthly branches of your birth moment: which season your innate energy resembles.' },
          ],
        },
        tools: {
          heading: 'Explore it yourself',
          desc: 'First time? We recommend MBTI → Big Five → Enneagram → Saju. Under 15 minutes each.',
          items: [
            { href: l('/mbti/test'), emoji: '🎭', label: 'MBTI personality test', desc: '16 types + cognitive functions' },
            { href: l('/big5/test'), emoji: '🌊', label: 'Big Five test', desc: 'Five-factor score profile' },
            { href: l('/enneagram/test'), emoji: '🔥', label: 'Enneagram test', desc: '9 types + wing analysis' },
            { href: l('/saju/calculator'), emoji: '🌳', label: 'Saju calculator', desc: 'Five elements & day pillar' },
          ],
        },
        interpret: {
          heading: 'How to read results in layers',
          steps: [
            { title: 'Look for shared signals', body: 'INFP + high openness + Enneagram 4: when several tests point the same way, that is your most stable trait.' },
            { title: 'Contradiction is depth, not error', body: 'Extraverted but high in neuroticism? Perhaps "someone who loves people but drains quickly." Paradoxical combinations are often the most accurate self-portrait.' },
            { title: 'Translate labels into verbs', body: 'Don\'t stop at "I\'m an INFJ" — turn it into "I decide better after time alone." Action sentences are what change your days.' },
          ],
        },
        tests: {
          heading: 'Tests to take next',
          items: [
            { href: l('/attachment-style/test'), emoji: '🫂', label: 'Attachment style' },
            { href: l('/eq/test'), emoji: '💗', label: 'Emotional intelligence' },
            { href: l('/empathy/test'), emoji: '🤝', label: 'Empathy' },
            { href: l('/self-esteem/test'), emoji: '🌱', label: 'Self-esteem' },
            { href: l('/personal-color/test'), emoji: '🎨', label: 'Personal color' },
            { href: l('/inner-strength/test'), emoji: '💪', label: 'Inner strengths' },
          ],
        },
        blog: {
          heading: '📖 Read deeper (blog.oiyo.net)',
          items: [
            { href: b('mbti-complete-deep-guide'), label: 'The complete MBTI deep guide', external: true },
            { href: b('8-cognitive-functions-deep-dive'), label: '8 cognitive functions, in depth', external: true },
            { href: b('enneagram-mbti-integration'), label: 'Integrating Enneagram × MBTI', external: true },
            { href: b('jung-shadow-psychology'), label: 'Jung\'s shadow psychology', external: true },
          ],
        },
        wiki: {
          heading: '📚 Concept dictionary (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-mbti'), label: 'What is MBTI', external: true },
            { href: w('meaning-of-big5'), label: 'The Big Five model', external: true },
            { href: w('meaning-of-enneagram'), label: 'Origin & structure of the Enneagram', external: true },
            { href: w('meaning-of-archetypes'), label: 'What are archetypes', external: true },
          ],
        },
        faq: {
          heading: 'Frequently asked questions',
          items: [
            { q: 'Different tests give me different results — which should I trust?', a: 'They measure different layers: MBTI measures preferences, the Big Five measures temperament intensity, and the Enneagram measures motivation. Differences are not contradictions; the signals that overlap are the most trustworthy.' },
            { q: 'I heard MBTI is unscientific — is it still worth taking?', a: 'Academic research standardizes on the Big Five, but MBTI remains a useful starting point for putting yourself into words. Taken together, you get MBTI\'s intuitive language plus the Big Five\'s precise measurement.' },
            { q: 'Does personality stay the same for life?', a: 'Big Five research shows personality keeps changing slowly through adulthood — conscientiousness and agreeableness tend to rise with age. Read your results as a snapshot of your current self.' },
            { q: 'How does Saju fit alongside psychological tests?', a: 'The five-element distribution is a metaphorical map of innate temperament. Psychological tests measure the "current you"; Saju shows the "archetypal you" in symbolic language. The gap between the two pictures is itself worth exploring.' },
          ],
        },
        next: {
          heading: 'Next exploration',
          items: [
            { href: l('/ontology/hobbies'), emoji: '🎨', label: 'What I love' },
            { href: l('/ontology/life-purpose'), emoji: '🧭', label: 'My existential purpose' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'What brings me luck' },
            { href: l('/today'), emoji: '🌌', label: 'Me, today' },
          ],
        },
      };
  }
}
