import type { Locale } from '../../../i18n';
import { localePath } from '../../../i18n';
import { blogUrl, wikiUrl } from './types';
import type { JourneyContent } from './types';

export function hobbiesContent(locale: Locale): JourneyContent {
  const l = (p: string) => localePath(locale, p);
  const b = (s: string) => blogUrl(locale, s);
  const w = (s: string) => wikiUrl(locale, s);

  switch (locale) {
    case 'ko':
      return {
        badge: '🎨 존재 탐구 · 2단계',
        title: '나를 살아나게 하는 것들',
        intro: '취미는 시간 때우기가 아니라 "내가 살아나는 활동"의 목록입니다. 성격 데이터로 나에게 맞는 몰입·회복·연결의 방식을 찾아보세요.',
        question: {
          heading: '이 페이지가 답하는 질문',
          body: [
            '"쉬는 날에 뭘 해야 진짜 쉰 것 같을까?" — 남들이 좋다는 취미를 따라 해도 공허했다면, 취미가 아니라 매칭이 틀렸을 가능성이 큽니다. 외향형의 회복(사람·자극)과 내향형의 회복(고요·몰입)은 반대 방향이고, 개방성이 높은 사람은 새로움에서, 성실성이 높은 사람은 숙련의 누적에서 에너지를 얻습니다.',
            '이 페이지는 성격 결과를 "내가 살아나는 활동 / 나를 회복시키는 환경 / 내가 끌리는 색과 리듬"으로 번역하는 방법을 안내합니다.',
          ],
        },
        concepts: {
          heading: '취미를 고르는 세 가지 축',
          items: [
            { title: '⚡ 충전 방향 — 몰입 vs 발산', body: '내향형은 깊은 몰입(독서·공예·코딩)에서, 외향형은 발산과 교류(모임·스포츠·공연)에서 충전됩니다. 둘 다 필요하지만 비율이 다릅니다.' },
            { title: '🌱 동기 구조 — 새로움 vs 숙련', body: '개방성이 높으면 장르를 넘나드는 탐험형 취미가, 성실성이 높으면 실력이 쌓이는 누적형 취미(악기·운동·외국어)가 오래갑니다.' },
            { title: '🎨 감각 취향 — 색·소리·촉감', body: '끌리는 색과 환경은 우연이 아닙니다. 퍼스널컬러와 색채 심리는 어떤 감각 환경에서 내가 안정되는지 알려주는 단서입니다.' },
            { title: '🌀 몰입(Flow)의 조건', body: '실력과 난이도가 맞아떨어질 때 시간이 사라지는 경험이 옵니다. 너무 쉬우면 지루하고 너무 어려우면 불안한, 그 사이의 좁은 길이 당신의 몰입 구간입니다.' },
          ],
        },
        tools: {
          heading: '직접 탐구하기',
          desc: '성격유형별 취미 추천과 감각 취향 진단을 결합해 보세요.',
          items: [
            { href: l('/mbti/hobbies'), emoji: '🎭', label: 'MBTI별 취미 추천', desc: '16유형별 몰입 활동' },
            { href: l('/enneagram/hobbies'), emoji: '🔥', label: '에니어그램별 취미 추천', desc: '욕망 구조에 맞는 활동' },
            { href: l('/personal-color/test'), emoji: '🎨', label: '퍼스널컬러 검사', desc: '나를 살리는 색 찾기' },
            { href: l('/routine/builder'), emoji: '📅', label: '루틴 빌더', desc: '취미를 일상에 심는 도구' },
          ],
        },
        interpret: {
          heading: '결과를 생활로 옮기는 법',
          steps: [
            { title: '"살아나는 활동" 3개를 추리세요', body: '추천 목록에서 과거에 시간 가는 줄 몰랐던 경험과 겹치는 것을 고르세요. 기억 속 몰입 경험이 가장 강력한 증거입니다.' },
            { title: '회복 환경을 함께 설계하세요', body: '같은 독서라도 카페가 맞는 사람과 방이 맞는 사람이 다릅니다. 활동 × 장소 × 시간대를 한 세트로 실험해 보세요.' },
            { title: '2주 실험 후 루틴에 심으세요', body: '"매주 토요일 오전, 같은 자리에서" 식으로 고정하면 취미가 의지가 아니라 구조로 유지됩니다. 루틴 빌더가 도와줍니다.' },
          ],
        },
        tests: {
          heading: '이어서 해볼 검사',
          items: [
            { href: l('/love-language/test'), emoji: '💝', label: '사랑의 언어 검사' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: '수면 유형 검사' },
            { href: l('/burnout/test'), emoji: '🔥', label: '번아웃 검사' },
            { href: l('/lazy-perfectionist/test'), emoji: '🛋️', label: '게으른 완벽주의자 검사' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: '바이오리듬 계산기' },
          ],
        },
        blog: {
          heading: '📖 더 깊이 읽기 (blog.oiyo.net)',
          items: [
            { href: b('flow-state-happiness-psychology'), label: '몰입과 행복의 심리학', external: true },
            { href: b('psychology-of-flow'), label: '플로우 — 최적 경험의 심리학', external: true },
            { href: b('taoism-wu-wei-flow'), label: '무위(無爲) — 애쓰지 않는 몰입', external: true },
            { href: b('meaningful-consumption'), label: '의미 있는 소비의 기술', external: true },
          ],
        },
        wiki: {
          heading: '📚 개념 사전 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-color-psychology'), label: '색채 심리학이란', external: true },
            { href: w('meaning-of-mbti'), label: 'MBTI란 무엇인가', external: true },
            { href: w('meaning-of-big5'), label: '빅파이브와 개방성', external: true },
            { href: w('meaning-of-enneagram'), label: '에니어그램의 욕망 구조', external: true },
          ],
        },
        faq: {
          heading: '자주 묻는 질문',
          items: [
            { q: '추천받은 취미가 끌리지 않으면 어떻게 하나요?', a: '추천은 출발점이지 처방이 아닙니다. 끌리지 않는 이유(활동 자체인지, 장소·비용·동행 같은 조건인지)를 분리해 보세요. 조건만 바꿔도 같은 활동이 살아나는 경우가 많습니다.' },
            { q: '취미를 시작해도 늘 작심삼일로 끝납니다.', a: '의지의 문제가 아니라 설계의 문제일 수 있습니다. 난이도가 실력보다 너무 높으면 불안해서, 너무 낮으면 지루해서 그만둡니다. 더 작은 단위로 시작하고, 요일·시간·장소를 고정해 보세요.' },
            { q: '내향형인데 사람 만나는 취미를 가져도 되나요?', a: '물론입니다. 내향형은 교류 자체가 싫은 게 아니라 회복 비용이 클 뿐입니다. 소수와 깊게 만나는 형태(독서 모임, 2~3인 클라이밍)로 구조를 바꾸면 즐기면서도 소진되지 않습니다.' },
            { q: '취미에 돈을 얼마나 쓰는 게 적당한가요?', a: '금액보다 회수 구조가 중요합니다. "쓴 돈이 경험·기술·관계로 돌아오는가"를 기준으로 삼고, 시작 단계에서는 장비보다 경험에 먼저 쓰는 것을 추천합니다.' },
          ],
        },
        next: {
          heading: '다음 탐구',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '나의 존재 지도' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: '나의 존재론적 목표' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '나에게 행운을 주는 것' },
            { href: l('/today'), emoji: '🌌', label: '오늘의 나' },
          ],
        },
      };

    case 'ja':
      return {
        badge: '🎨 存在の探求 · ステップ2',
        title: '私を生き返らせるもの',
        intro: '趣味は暇つぶしではなく「自分が生き返る活動」のリスト。性格データから、自分に合う没入・回復・つながりの形を見つけましょう。',
        question: {
          heading: 'このページが答える問い',
          body: [
            '「休みの日に何をすれば本当に休めた気がする?」— 人が良いという趣味を真似しても空虚だったなら、趣味ではなくマッチングが間違っていた可能性が高い。外向型の回復(人・刺激)と内向型の回復(静けさ・没入)は逆方向で、開放性が高い人は新しさから、誠実性が高い人は熟練の積み重ねからエネルギーを得ます。',
            'このページは、性格の結果を「生き返る活動/回復する環境/惹かれる色とリズム」に翻訳する方法を案内します。',
          ],
        },
        concepts: {
          heading: '趣味を選ぶ3つの軸',
          items: [
            { title: '⚡ 充電の方向 — 没入 vs 発散', body: '内向型は深い没入(読書・工芸・コーディング)で、外向型は発散と交流(集まり・スポーツ・ライブ)で充電します。両方必要ですが比率が違います。' },
            { title: '🌱 動機の構造 — 新しさ vs 熟練', body: '開放性が高ければジャンルを渡る探検型趣味が、誠実性が高ければ実力が積み上がる蓄積型趣味(楽器・運動・語学)が長続きします。' },
            { title: '🎨 感覚の好み — 色・音・手触り', body: '惹かれる色と環境は偶然ではありません。パーソナルカラーと色彩心理は、どんな感覚環境で自分が安定するかの手がかりです。' },
            { title: '🌀 フロー(没入)の条件', body: '実力と難易度が釣り合うとき、時間が消える体験が訪れます。簡単すぎると退屈、難しすぎると不安。その間の細い道があなたのフロー帯です。' },
          ],
        },
        tools: {
          heading: '実際に探求する',
          desc: '性格タイプ別の趣味推薦と感覚診断を組み合わせてみましょう。',
          items: [
            { href: l('/mbti/hobbies'), emoji: '🎭', label: 'MBTI別おすすめ趣味', desc: '16タイプ別の没入活動' },
            { href: l('/enneagram/hobbies'), emoji: '🔥', label: 'エニアグラム別おすすめ趣味', desc: '欲望構造に合う活動' },
            { href: l('/personal-color/test'), emoji: '🎨', label: 'パーソナルカラー診断', desc: '自分を生かす色を探す' },
            { href: l('/routine/builder'), emoji: '📅', label: 'ルーティンビルダー', desc: '趣味を日常に植える道具' },
          ],
        },
        interpret: {
          heading: '結果を生活に移す方法',
          steps: [
            { title: '「生き返る活動」を3つ絞る', body: '推薦リストから、過去に時間を忘れた経験と重なるものを選びましょう。記憶の中のフロー体験が最も強い証拠です。' },
            { title: '回復の環境もセットで設計する', body: '同じ読書でもカフェが合う人と部屋が合う人がいます。活動×場所×時間帯をワンセットで実験しましょう。' },
            { title: '2週間試してルーティンに植える', body: '「毎週土曜の午前、同じ席で」のように固定すると、趣味が意志ではなく構造で続きます。' },
          ],
        },
        tests: {
          heading: '続けて受けたい診断',
          items: [
            { href: l('/love-language/test'), emoji: '💝', label: '愛の言語診断' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: '睡眠タイプ診断' },
            { href: l('/burnout/test'), emoji: '🔥', label: 'バーンアウト診断' },
            { href: l('/lazy-perfectionist/test'), emoji: '🛋️', label: '怠け完璧主義者診断' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: 'バイオリズム計算機' },
          ],
        },
        blog: {
          heading: '📖 深く読む (blog.oiyo.net)',
          items: [
            { href: b('flow-state-happiness-psychology'), label: 'フローと幸福の心理学', external: true },
            { href: b('psychology-of-flow'), label: 'フロー — 最適経験の心理学', external: true },
            { href: b('taoism-wu-wei-flow'), label: '無為 — 頑張らない没入', external: true },
            { href: b('meaningful-consumption'), label: '意味ある消費の技術', external: true },
          ],
        },
        wiki: {
          heading: '📚 概念辞典 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-color-psychology'), label: '色彩心理学とは', external: true },
            { href: w('meaning-of-mbti'), label: 'MBTIとは何か', external: true },
            { href: w('meaning-of-big5'), label: 'ビッグファイブと開放性', external: true },
            { href: w('meaning-of-enneagram'), label: 'エニアグラムの欲望構造', external: true },
          ],
        },
        faq: {
          heading: 'よくある質問',
          items: [
            { q: 'おすすめされた趣味に惹かれない場合は?', a: '推薦は出発点であって処方箋ではありません。惹かれない理由(活動自体か、場所・費用・同行者などの条件か)を切り分けてみてください。条件を変えるだけで同じ活動が生き返ることも多いのです。' },
            { q: '趣味を始めてもいつも三日坊主で終わります。', a: '意志ではなく設計の問題かもしれません。難易度が実力より高すぎると不安で、低すぎると退屈でやめてしまいます。より小さな単位で始め、曜日・時間・場所を固定してみましょう。' },
            { q: '内向型でも人と会う趣味を持っていい?', a: 'もちろんです。内向型は交流が嫌いなのではなく、回復コストが大きいだけです。少人数と深く会う形(読書会、2〜3人のクライミング)に構造を変えれば、楽しみながら消耗しません。' },
            { q: '趣味にいくら使うのが適切?', a: '金額より回収構造が重要です。「使ったお金が経験・技術・関係として戻るか」を基準にし、始めの段階では道具より経験に先に使うことをおすすめします。' },
          ],
        },
        next: {
          heading: '次の探求',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '私の存在地図' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: '存在論的な目標' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '幸運をもたらすもの' },
            { href: l('/today'), emoji: '🌌', label: '今日の私' },
          ],
        },
      };

    case 'zh':
      return {
        badge: '🎨 存在探索 · 第2步',
        title: '让我重新活过来的事物',
        intro: '爱好不是消磨时间,而是一份"让我活过来的活动"清单。用性格数据找到适合你的沉浸、恢复与连接方式。',
        question: {
          heading: '本页回答的问题',
          body: [
            '"休息日做什么才算真正休息了?"——如果模仿别人推崇的爱好却感到空虚,问题很可能不在爱好,而在匹配。外向者的恢复(人群、刺激)与内向者的恢复(安静、沉浸)方向相反;开放性高的人从新鲜感获得能量,尽责性高的人从技能积累中获得能量。',
            '本页指导你把性格结果翻译成"让我活过来的活动 / 让我恢复的环境 / 吸引我的颜色与节奏"。',
          ],
        },
        concepts: {
          heading: '选择爱好的三个轴',
          items: [
            { title: '⚡ 充电方向 — 沉浸 vs 发散', body: '内向者通过深度沉浸(阅读、手工、编程)充电,外向者通过发散与交流(聚会、运动、演出)充电。两者都需要,但比例不同。' },
            { title: '🌱 动机结构 — 新鲜 vs 精进', body: '开放性高的人适合跨界探索型爱好;尽责性高的人适合可以积累实力的精进型爱好(乐器、运动、外语)。' },
            { title: '🎨 感官偏好 — 颜色、声音、触感', body: '吸引你的颜色和环境不是偶然。个人色彩与色彩心理学是了解什么感官环境让你安定的线索。' },
            { title: '🌀 心流的条件', body: '当实力与难度匹配时,时间消失的体验就会到来。太简单则无聊,太难则焦虑——之间那条窄路就是你的心流区。' },
          ],
        },
        tools: {
          heading: '亲自探索',
          desc: '把按性格类型的爱好推荐与感官偏好测试结合起来。',
          items: [
            { href: l('/mbti/hobbies'), emoji: '🎭', label: 'MBTI 爱好推荐', desc: '16型各自的沉浸活动' },
            { href: l('/enneagram/hobbies'), emoji: '🔥', label: '九型人格爱好推荐', desc: '匹配欲望结构的活动' },
            { href: l('/personal-color/test'), emoji: '🎨', label: '个人色彩测试', desc: '找到让你焕发的颜色' },
            { href: l('/routine/builder'), emoji: '📅', label: '例行计划工具', desc: '把爱好种进日常' },
          ],
        },
        interpret: {
          heading: '把结果带进生活的方法',
          steps: [
            { title: '筛出3个"让我活过来的活动"', body: '从推荐列表中挑出与你过去忘记时间的经历重叠的项目。记忆中的心流体验是最有力的证据。' },
            { title: '同时设计恢复环境', body: '同样是阅读,有人适合咖啡馆,有人适合房间。把活动×地点×时间段作为一组来实验。' },
            { title: '实验两周后种进例行', body: '固定为"每周六上午、同一个位置",爱好就靠结构而非意志维持。' },
          ],
        },
        tests: {
          heading: '接着做的测试',
          items: [
            { href: l('/love-language/test'), emoji: '💝', label: '爱之语测试' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: '睡眠类型测试' },
            { href: l('/burnout/test'), emoji: '🔥', label: '倦怠测试' },
            { href: l('/lazy-perfectionist/test'), emoji: '🛋️', label: '懒惰完美主义者测试' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: '生物节律计算器' },
          ],
        },
        blog: {
          heading: '📖 深入阅读 (blog.oiyo.net)',
          items: [
            { href: b('flow-state-happiness-psychology'), label: '心流与幸福的心理学', external: true },
            { href: b('psychology-of-flow'), label: '心流——最优体验的心理学', external: true },
            { href: b('taoism-wu-wei-flow'), label: '无为——不费力的沉浸', external: true },
            { href: b('meaningful-consumption'), label: '有意义消费的艺术', external: true },
          ],
        },
        wiki: {
          heading: '📚 概念词典 (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-color-psychology'), label: '什么是色彩心理学', external: true },
            { href: w('meaning-of-mbti'), label: '什么是MBTI', external: true },
            { href: w('meaning-of-big5'), label: '大五人格与开放性', external: true },
            { href: w('meaning-of-enneagram'), label: '九型人格的欲望结构', external: true },
          ],
        },
        faq: {
          heading: '常见问题',
          items: [
            { q: '推荐的爱好不吸引我怎么办?', a: '推荐是起点而非处方。试着分离不吸引你的原因:是活动本身,还是地点、费用、同伴等条件?很多时候只改变条件,同一个活动就活了过来。' },
            { q: '开始爱好总是三天打鱼两天晒网。', a: '可能不是意志问题,而是设计问题。难度高于实力会焦虑,低于实力会无聊。从更小的单位开始,并固定星期、时间和地点。' },
            { q: '内向者可以选择社交型爱好吗?', a: '当然。内向者并非讨厌交流,只是恢复成本更高。把结构改成少人数深度相处(读书会、两三人攀岩),就能享受而不耗竭。' },
            { q: '在爱好上花多少钱合适?', a: '比金额更重要的是回收结构。以"花的钱是否以经验、技能、关系的形式回来"为标准;起步阶段建议先为经验花钱,而非装备。' },
          ],
        },
        next: {
          heading: '下一站探索',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: '我的存在地图' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: '我的存在目标' },
            { href: l('/ontology/luck'), emoji: '🍀', label: '带给我幸运的东西' },
            { href: l('/today'), emoji: '🌌', label: '今天的我' },
          ],
        },
      };

    case 'fr':
      return {
        badge: '🎨 Exploration de soi · Étape 2',
        title: 'Ce qui me fait revivre',
        intro: 'Un loisir n\'est pas un passe-temps : c\'est la liste des activités qui vous font revivre. Utilisez vos données de personnalité pour trouver vos formes d\'immersion, de récupération et de lien.',
        question: {
          heading: 'La question à laquelle cette page répond',
          body: [
            '« Que faire de mon jour de repos pour me sentir vraiment reposé ? » Si imiter les loisirs des autres vous a laissé un vide, le problème n\'est sans doute pas le loisir mais l\'appariement. La récupération de l\'extraverti (gens, stimulation) et celle de l\'introverti (calme, immersion) vont en sens opposés ; l\'ouverture se nourrit de nouveauté, la conscienciosité de progrès accumulés.',
            'Cette page vous aide à traduire vos résultats de personnalité en « activités qui me font revivre / environnements qui me régénèrent / couleurs et rythmes qui m\'attirent ».',
          ],
        },
        concepts: {
          heading: 'Trois axes pour choisir un loisir',
          items: [
            { title: '⚡ Direction de la recharge — immersion vs expansion', body: 'L\'introverti se recharge dans l\'immersion profonde (lecture, artisanat, code), l\'extraverti dans l\'échange (rencontres, sport, concerts). Les deux sont nécessaires, mais pas dans les mêmes proportions.' },
            { title: '🌱 Structure de motivation — nouveauté vs maîtrise', body: 'Une forte ouverture appelle des loisirs d\'exploration ; une forte conscienciosité, des loisirs cumulatifs où le niveau monte (instrument, sport, langue).' },
            { title: '🎨 Goûts sensoriels — couleur, son, toucher', body: 'Les couleurs et les lieux qui vous attirent ne sont pas un hasard : la couleur personnelle et la psychologie des couleurs indiquent les environnements sensoriels qui vous stabilisent.' },
            { title: '🌀 Les conditions du flow', body: 'Quand compétence et difficulté s\'équilibrent, le temps disparaît. Trop facile : ennui ; trop dur : anxiété. L\'étroit chemin entre les deux est votre zone de flow.' },
          ],
        },
        tools: {
          heading: 'Explorer par soi-même',
          desc: 'Combinez les recommandations de loisirs par type et le diagnostic sensoriel.',
          items: [
            { href: l('/mbti/hobbies'), emoji: '🎭', label: 'Loisirs par type MBTI', desc: 'Activités d\'immersion par type' },
            { href: l('/enneagram/hobbies'), emoji: '🔥', label: 'Loisirs par ennéatype', desc: 'Activités selon vos désirs' },
            { href: l('/personal-color/test'), emoji: '🎨', label: 'Test de couleur personnelle', desc: 'Les couleurs qui vous portent' },
            { href: l('/routine/builder'), emoji: '📅', label: 'Constructeur de routine', desc: 'Planter le loisir dans le quotidien' },
          ],
        },
        interpret: {
          heading: 'Passer des résultats à la vie réelle',
          steps: [
            { title: 'Retenez 3 activités « qui font revivre »', body: 'Choisissez dans les recommandations celles qui recoupent vos souvenirs d\'heures envolées : le flow vécu est la meilleure preuve.' },
            { title: 'Concevez aussi l\'environnement de récupération', body: 'Même lecture, lieux différents : café pour l\'un, chambre pour l\'autre. Expérimentez activité × lieu × moment comme un ensemble.' },
            { title: 'Deux semaines d\'essai, puis ancrez en routine', body: '« Chaque samedi matin, à la même place » : le loisir tient alors par la structure, pas par la volonté.' },
          ],
        },
        tests: {
          heading: 'Tests à enchaîner',
          items: [
            { href: l('/love-language/test'), emoji: '💝', label: 'Langages de l\'amour' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: 'Chronotype de sommeil' },
            { href: l('/burnout/test'), emoji: '🔥', label: 'Burn-out' },
            { href: l('/lazy-perfectionist/test'), emoji: '🛋️', label: 'Perfectionniste paresseux' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: 'Biorythme' },
          ],
        },
        blog: {
          heading: '📖 Lire plus loin (blog.oiyo.net)',
          items: [
            { href: b('flow-state-happiness-psychology'), label: 'Flow et psychologie du bonheur', external: true },
            { href: b('psychology-of-flow'), label: 'Le flow, expérience optimale', external: true },
            { href: b('taoism-wu-wei-flow'), label: 'Wu wei — l\'immersion sans effort', external: true },
            { href: b('meaningful-consumption'), label: 'L\'art de consommer avec sens', external: true },
          ],
        },
        wiki: {
          heading: '📚 Dictionnaire (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-color-psychology'), label: 'La psychologie des couleurs', external: true },
            { href: w('meaning-of-mbti'), label: 'Qu\'est-ce que le MBTI', external: true },
            { href: w('meaning-of-big5'), label: 'Big Five et ouverture', external: true },
            { href: w('meaning-of-enneagram'), label: 'La structure des désirs de l\'ennéagramme', external: true },
          ],
        },
        faq: {
          heading: 'Questions fréquentes',
          items: [
            { q: 'Et si les loisirs recommandés ne m\'attirent pas ?', a: 'Une recommandation est un point de départ, pas une ordonnance. Séparez la cause : l\'activité elle-même, ou ses conditions (lieu, coût, compagnie) ? Souvent, changer les conditions suffit à faire revivre la même activité.' },
            { q: 'J\'abandonne toujours au bout de trois jours.', a: 'C\'est souvent un problème de conception, pas de volonté. Trop difficile : anxiété ; trop facile : ennui. Commencez plus petit et fixez jour, heure et lieu.' },
            { q: 'Introverti, puis-je choisir un loisir social ?', a: 'Bien sûr. L\'introverti n\'évite pas l\'échange, il en paie simplement le coût de récupération plus cher. En petit comité (club de lecture, escalade à deux ou trois), on profite sans s\'épuiser.' },
            { q: 'Quel budget consacrer à un loisir ?', a: 'La structure de retour compte plus que le montant : l\'argent dépensé revient-il en expérience, compétence ou lien ? Au début, investissez dans l\'expérience avant l\'équipement.' },
          ],
        },
        next: {
          heading: 'Prochaine exploration',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'Ma carte de l\'être' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: 'Mon but existentiel' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'Ce qui me porte chance' },
            { href: l('/today'), emoji: '🌌', label: 'Moi, aujourd\'hui' },
          ],
        },
      };

    case 'es':
      return {
        badge: '🎨 Exploración del ser · Paso 2',
        title: 'Lo que me devuelve a la vida',
        intro: 'Un hobby no es matar el tiempo: es la lista de actividades que te devuelven a la vida. Usa tus datos de personalidad para encontrar tus formas de inmersión, recuperación y conexión.',
        question: {
          heading: 'La pregunta que responde esta página',
          body: [
            '«¿Qué hago en mi día libre para sentir que de verdad descansé?» Si imitar los hobbies que otros alaban te dejó vacío, el problema probablemente no es el hobby sino el emparejamiento. La recuperación del extravertido (gente, estímulos) y la del introvertido (calma, inmersión) van en direcciones opuestas; la apertura se alimenta de novedad y la responsabilidad, del progreso acumulado.',
            'Esta página te ayuda a traducir tus resultados de personalidad en «actividades que me reviven / entornos que me recuperan / colores y ritmos que me atraen».',
          ],
        },
        concepts: {
          heading: 'Tres ejes para elegir un hobby',
          items: [
            { title: '⚡ Dirección de recarga — inmersión vs expansión', body: 'El introvertido se recarga en la inmersión profunda (lectura, artesanía, código); el extravertido, en el intercambio (reuniones, deporte, conciertos). Ambos hacen falta, pero en proporciones distintas.' },
            { title: '🌱 Estructura de motivación — novedad vs maestría', body: 'Alta apertura pide hobbies exploratorios entre géneros; alta responsabilidad, hobbies acumulativos donde el nivel sube (instrumento, deporte, idioma).' },
            { title: '🎨 Gustos sensoriales — color, sonido, tacto', body: 'Los colores y lugares que te atraen no son casualidad: el color personal y la psicología del color indican qué entornos sensoriales te estabilizan.' },
            { title: '🌀 Las condiciones del flow', body: 'Cuando habilidad y dificultad se equilibran, el tiempo desaparece. Demasiado fácil: aburrimiento; demasiado difícil: ansiedad. El camino estrecho entre ambos es tu zona de flow.' },
          ],
        },
        tools: {
          heading: 'Explorar en persona',
          desc: 'Combina las recomendaciones de hobbies por tipo con el diagnóstico sensorial.',
          items: [
            { href: l('/mbti/hobbies'), emoji: '🎭', label: 'Hobbies por tipo MBTI', desc: 'Actividades de inmersión por tipo' },
            { href: l('/enneagram/hobbies'), emoji: '🔥', label: 'Hobbies por eneatipo', desc: 'Actividades según tus deseos' },
            { href: l('/personal-color/test'), emoji: '🎨', label: 'Test de color personal', desc: 'Los colores que te favorecen' },
            { href: l('/routine/builder'), emoji: '📅', label: 'Constructor de rutinas', desc: 'Plantar el hobby en lo cotidiano' },
          ],
        },
        interpret: {
          heading: 'Llevar los resultados a la vida',
          steps: [
            { title: 'Elige 3 actividades «que te reviven»', body: 'De las recomendaciones, escoge las que coincidan con recuerdos de horas que volaron: el flow vivido es la mejor evidencia.' },
            { title: 'Diseña también el entorno de recuperación', body: 'La misma lectura funciona en el café para uno y en la habitación para otro. Experimenta actividad × lugar × franja horaria como un conjunto.' },
            { title: 'Dos semanas de prueba y ánclalo en la rutina', body: '«Cada sábado por la mañana, en el mismo sitio»: así el hobby se sostiene por estructura, no por fuerza de voluntad.' },
          ],
        },
        tests: {
          heading: 'Tests para continuar',
          items: [
            { href: l('/love-language/test'), emoji: '💝', label: 'Lenguajes del amor' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: 'Cronotipo de sueño' },
            { href: l('/burnout/test'), emoji: '🔥', label: 'Burnout' },
            { href: l('/lazy-perfectionist/test'), emoji: '🛋️', label: 'Perfeccionista perezoso' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: 'Biorritmo' },
          ],
        },
        blog: {
          heading: '📖 Leer más (blog.oiyo.net)',
          items: [
            { href: b('flow-state-happiness-psychology'), label: 'Flow y psicología de la felicidad', external: true },
            { href: b('psychology-of-flow'), label: 'El flow, la experiencia óptima', external: true },
            { href: b('taoism-wu-wei-flow'), label: 'Wu wei — inmersión sin esfuerzo', external: true },
            { href: b('meaningful-consumption'), label: 'El arte del consumo con sentido', external: true },
          ],
        },
        wiki: {
          heading: '📚 Diccionario (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-color-psychology'), label: 'La psicología del color', external: true },
            { href: w('meaning-of-mbti'), label: 'Qué es el MBTI', external: true },
            { href: w('meaning-of-big5'), label: 'Big Five y apertura', external: true },
            { href: w('meaning-of-enneagram'), label: 'La estructura de deseos del eneagrama', external: true },
          ],
        },
        faq: {
          heading: 'Preguntas frecuentes',
          items: [
            { q: '¿Y si los hobbies recomendados no me atraen?', a: 'Una recomendación es un punto de partida, no una receta. Separa la causa: ¿la actividad en sí, o sus condiciones (lugar, coste, compañía)? Muchas veces basta cambiar las condiciones para que la misma actividad reviva.' },
            { q: 'Siempre abandono a los tres días.', a: 'Suele ser un problema de diseño, no de voluntad. Demasiado difícil: ansiedad; demasiado fácil: aburrimiento. Empieza con unidades más pequeñas y fija día, hora y lugar.' },
            { q: 'Soy introvertido, ¿puedo elegir un hobby social?', a: 'Claro. El introvertido no rechaza el intercambio; solo paga un coste de recuperación mayor. En grupos pequeños (club de lectura, escalada de dos o tres), se disfruta sin agotarse.' },
            { q: '¿Cuánto dinero es razonable gastar en un hobby?', a: 'Importa más la estructura de retorno que la cantidad: ¿el dinero gastado vuelve como experiencia, habilidad o vínculo? Al principio, invierte antes en experiencias que en equipamiento.' },
          ],
        },
        next: {
          heading: 'Siguiente exploración',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'Mi mapa del ser' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: 'Mi propósito existencial' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'Lo que me da suerte' },
            { href: l('/today'), emoji: '🌌', label: 'Yo, hoy' },
          ],
        },
      };

    default:
      return {
        badge: '🎨 Self-Discovery · Step 2',
        title: 'The things that bring me back to life',
        intro: 'A hobby is not killing time — it\'s the list of activities that make you come alive. Use your personality data to find your own forms of immersion, recovery, and connection.',
        question: {
          heading: 'The question this page answers',
          body: [
            '"What should I do on my day off to feel truly rested?" If copying the hobbies everyone praises left you hollow, the problem was probably the matching, not the hobby. An extravert\'s recovery (people, stimulation) and an introvert\'s recovery (quiet, immersion) point in opposite directions; high openness feeds on novelty, while high conscientiousness feeds on accumulated mastery.',
            'This page shows how to translate personality results into "activities that revive me / environments that restore me / the colors and rhythms I\'m drawn to."',
          ],
        },
        concepts: {
          heading: 'Three axes for choosing a hobby',
          items: [
            { title: '⚡ Recharge direction — immersion vs expansion', body: 'Introverts recharge through deep immersion (reading, crafts, coding); extraverts through exchange (gatherings, sports, live shows). You need both — in different ratios.' },
            { title: '🌱 Motivation structure — novelty vs mastery', body: 'High openness sustains exploratory, genre-hopping hobbies; high conscientiousness sustains cumulative ones where skill stacks up (instruments, training, languages).' },
            { title: '🎨 Sensory taste — color, sound, texture', body: 'The colors and places you\'re drawn to aren\'t random. Personal color and color psychology are clues to the sensory environments that steady you.' },
            { title: '🌀 The conditions of flow', body: 'When skill and challenge match, time disappears. Too easy is boring, too hard is anxious — the narrow path between is your flow zone.' },
          ],
        },
        tools: {
          heading: 'Explore it yourself',
          desc: 'Combine type-based hobby recommendations with a sensory-taste diagnosis.',
          items: [
            { href: l('/mbti/hobbies'), emoji: '🎭', label: 'Hobbies by MBTI type', desc: 'Immersion activities for 16 types' },
            { href: l('/enneagram/hobbies'), emoji: '🔥', label: 'Hobbies by Enneagram type', desc: 'Activities that fit your desires' },
            { href: l('/personal-color/test'), emoji: '🎨', label: 'Personal color test', desc: 'Find the colors that lift you' },
            { href: l('/routine/builder'), emoji: '📅', label: 'Routine builder', desc: 'Plant the hobby into daily life' },
          ],
        },
        interpret: {
          heading: 'Turning results into a life',
          steps: [
            { title: 'Shortlist 3 "come alive" activities', body: 'From the recommendations, pick the ones that overlap with memories of losing track of time. Remembered flow is the strongest evidence.' },
            { title: 'Design the recovery environment too', body: 'The same reading habit fits a café for one person and a quiet room for another. Experiment with activity × place × time-of-day as one set.' },
            { title: 'Trial for two weeks, then plant it in a routine', body: '"Every Saturday morning, same seat" — fixed slots keep a hobby alive through structure rather than willpower.' },
          ],
        },
        tests: {
          heading: 'Tests to take next',
          items: [
            { href: l('/love-language/test'), emoji: '💝', label: 'Love languages' },
            { href: l('/sleep-type/test'), emoji: '🌙', label: 'Sleep chronotype' },
            { href: l('/burnout/test'), emoji: '🔥', label: 'Burnout' },
            { href: l('/lazy-perfectionist/test'), emoji: '🛋️', label: 'Lazy perfectionist' },
            { href: l('/biorhythm/calculator'), emoji: '📈', label: 'Biorhythm calculator' },
          ],
        },
        blog: {
          heading: '📖 Read deeper (blog.oiyo.net)',
          items: [
            { href: b('flow-state-happiness-psychology'), label: 'Flow and the psychology of happiness', external: true },
            { href: b('psychology-of-flow'), label: 'Flow — the psychology of optimal experience', external: true },
            { href: b('taoism-wu-wei-flow'), label: 'Wu wei — effortless immersion', external: true },
            { href: b('meaningful-consumption'), label: 'The art of meaningful consumption', external: true },
          ],
        },
        wiki: {
          heading: '📚 Concept dictionary (wiki.oiyo.net)',
          items: [
            { href: w('meaning-of-color-psychology'), label: 'What is color psychology', external: true },
            { href: w('meaning-of-mbti'), label: 'What is MBTI', external: true },
            { href: w('meaning-of-big5'), label: 'Big Five and openness', external: true },
            { href: w('meaning-of-enneagram'), label: 'The Enneagram\'s desire structure', external: true },
          ],
        },
        faq: {
          heading: 'Frequently asked questions',
          items: [
            { q: 'What if the recommended hobbies don\'t appeal to me?', a: 'A recommendation is a starting point, not a prescription. Separate the cause: is it the activity itself, or its conditions — place, cost, company? Often changing only the conditions brings the same activity to life.' },
            { q: 'I always quit new hobbies after three days.', a: 'It\'s usually a design problem, not a willpower problem. Too hard breeds anxiety; too easy breeds boredom. Start smaller, and fix the day, time, and place.' },
            { q: 'I\'m an introvert — can I still pick a social hobby?', a: 'Absolutely. Introverts don\'t dislike connection; they just pay a higher recovery cost. Restructure toward small, deep formats — a book club, climbing with two or three friends — and you can enjoy it without draining.' },
            { q: 'How much money should a hobby cost?', a: 'The return structure matters more than the amount: does the money come back as experience, skill, or relationships? Early on, spend on experiences before equipment.' },
          ],
        },
        next: {
          heading: 'Next exploration',
          items: [
            { href: l('/ontology/personality'), emoji: '🧭', label: 'My map of being' },
            { href: l('/ontology/life-purpose'), emoji: '🌟', label: 'My existential purpose' },
            { href: l('/ontology/luck'), emoji: '🍀', label: 'What brings me luck' },
            { href: l('/today'), emoji: '🌌', label: 'Me, today' },
          ],
        },
      };
  }
}
