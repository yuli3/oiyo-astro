import type { Locale } from '../i18n';

export type WisdomTopic =
  | 'test-hub'
  | 'lazy-perfectionist'
  | 'lethargy'
  | 'habit-builder'
  | 'mbti'
  | 'calculator';

export interface WisdomNote {
  label: string;
  text: string;
  source?: string;
}

const fallbackLocale: Locale = 'en';

const notes: Record<WisdomTopic, Partial<Record<Locale, WisdomNote[]>>> = {
  'test-hub': {
    ko: [
      { label: '오늘의 관찰', text: '테스트 결과는 당신을 가두는 이름표가 아니라, 다음 행동을 고르는 작은 지도입니다.' },
      { label: '자기계발 메모', text: '좋은 질문은 결심보다 오래 갑니다. 내가 왜 이렇게 반응하는지 묻는 순간 변화가 시작됩니다.' },
      { label: '성현의 가르침', text: '공부의 첫 걸음은 모른다는 사실을 정직하게 보는 데서 시작됩니다.', source: '고전 철학에서 재구성' },
    ],
    en: [
      { label: 'Today’s Lens', text: 'A test result is not a label that traps you. It is a small map for choosing the next action.' },
      { label: 'Growth Note', text: 'A good question lasts longer than a promise. Change begins when you ask why you react this way.' },
      { label: 'Classical Wisdom', text: 'Learning begins when you can honestly see what you do not yet know.', source: 'Paraphrased from classical philosophy' },
    ],
    ja: [
      { label: '今日の視点', text: 'テスト結果はあなたを閉じ込めるラベルではなく、次の行動を選ぶ小さな地図です。' },
      { label: '成長メモ', text: 'よい問いは決意より長く残ります。なぜそう反応するのかを問う時、変化が始まります。' },
      { label: '古典の知恵', text: '学びは、まだ知らないことを正直に見るところから始まります。', source: '古典哲学からの再構成' },
    ],
  },
  'lazy-perfectionist': {
    ko: [
      { label: '마음을 가볍게 하는 글귀', text: '완벽한 시작을 기다리는 동안 삶은 지나갑니다. 작은 시작은 이미 회복입니다.' },
      { label: '신기한 사실', text: '완벽주의형 미루기는 의지가 약해서가 아니라, 평가받는 순간을 늦추려는 보호 반응일 때가 많습니다.' },
      { label: '실천 문장', text: '오늘은 잘하려고 시작하지 말고, 시작했기 때문에 잘해질 가능성을 열어둡니다.' },
    ],
    en: [
      { label: 'Calming Line', text: 'While you wait for the perfect start, life keeps moving. A tiny start is already recovery.' },
      { label: 'Curious Fact', text: 'Perfectionist procrastination is often not weak will. It can be a protective delay against being judged.' },
      { label: 'Practice Line', text: 'Today, do not begin because you are ready. Begin so readiness has somewhere to grow.' },
    ],
    ja: [
      { label: '心を軽くする言葉', text: '完璧な始まりを待つ間にも、時間は進みます。小さな開始はすでに回復です。' },
      { label: '小さな発見', text: '完璧主義の先延ばしは意志の弱さではなく、評価される瞬間を遅らせる保護反応の場合があります。' },
      { label: '実践の言葉', text: '今日は準備ができたから始めるのではなく、始めることで準備が育つ余地を作ります。' },
    ],
  },
  lethargy: {
    ko: [
      { label: '불교식 관찰', text: '몸과 마음은 고정된 상태가 아니라 조건에 따라 변합니다. 그래서 작은 조건 하나를 바꾸는 일이 중요합니다.' },
      { label: '평온한 글귀', text: '무기력한 날에도 당신 전체가 멈춘 것은 아닙니다. 아주 작은 감각 하나는 다시 움직일 수 있습니다.' },
      { label: '신기한 사실', text: '행동이 기분을 기다리기보다, 작은 행동이 기분의 방향을 먼저 바꾸는 경우가 많습니다.' },
    ],
    en: [
      { label: 'Buddhist Lens', text: 'Body and mind are not fixed states. They shift with conditions, so changing one small condition matters.' },
      { label: 'Calming Line', text: 'Even on a low-energy day, not all of you has stopped. One small sensation can begin moving again.' },
      { label: 'Curious Fact', text: 'Mood does not always come before action. A small action often changes the direction of mood first.' },
    ],
    ja: [
      { label: '仏教的な見方', text: '身体と心は固定された状態ではなく、条件によって変わります。だから小さな条件を一つ変えることが大切です。' },
      { label: '穏やかな言葉', text: '無気力な日でも、あなた全体が止まったわけではありません。小さな感覚一つからまた動けます。' },
      { label: '小さな発見', text: '気分が行動を待つだけではありません。小さな行動が先に気分の向きを変えることがあります。' },
    ],
  },
  'habit-builder': {
    ko: [
      { label: '30일 문장', text: '습관은 강한 사람이 만드는 것이 아니라, 다시 돌아오는 길을 짧게 만든 사람이 만듭니다.' },
      { label: '자기계발 메모', text: '하루 실패를 전체 실패로 해석하지 않는 능력이 장기 루틴의 핵심입니다.' },
      { label: '옛 가르침', text: '먼 길은 한 걸음씩 가까워집니다. 오늘의 한 칸은 작아 보여도 방향을 만듭니다.', source: '동아시아 고전 사유에서 재구성' },
    ],
    en: [
      { label: '30-Day Line', text: 'Habits are not built by people who never miss. They are built by people who shorten the path back.' },
      { label: 'Growth Note', text: 'The key to a long routine is refusing to interpret one missed day as a failed identity.' },
      { label: 'Old Teaching', text: 'A long road becomes near one step at a time. Today’s small mark still creates direction.', source: 'Paraphrased from East Asian classical thought' },
    ],
    ja: [
      { label: '30日の言葉', text: '習慣は一度も失敗しない人ではなく、戻る道を短くした人が作ります。' },
      { label: '成長メモ', text: '一日の失敗を自分全体の失敗にしない力が、長く続く習慣の核心です。' },
      { label: '古い教え', text: '遠い道も一歩ずつ近づきます。今日の小さな一枠も方向を作ります。', source: '東アジア古典思想からの再構成' },
    ],
  },
  mbti: {
    ko: [
      { label: '궁금증', text: '같은 MBTI 유형이라도 스트레스 상황, 애착 패턴, 가치관에 따라 전혀 다른 모습으로 보일 수 있습니다.' },
      { label: '주의할 점', text: 'MBTI는 정답표가 아니라 대화의 시작점입니다. 유형보다 반복되는 선택을 더 자세히 보세요.' },
    ],
    en: [
      { label: 'Curious Point', text: 'The same MBTI type can look very different depending on stress, attachment patterns, and values.' },
      { label: 'Careful Use', text: 'MBTI is not an answer key. It is a conversation starter. Watch repeated choices more than the label.' },
    ],
    ja: [
      { label: '気になる視点', text: '同じMBTIタイプでも、ストレス、愛着パターン、価値観によってまったく違って見えることがあります。' },
      { label: '使い方', text: 'MBTIは答えではなく会話の入口です。タイプ名より、繰り返す選択をよく見てください。' },
    ],
  },
  calculator: {
    ko: [
      { label: '계산기 메모', text: '숫자는 미래를 확정하지 않지만, 막연한 걱정을 조정 가능한 변수로 바꾸어 줍니다.' },
      { label: '실용 지혜', text: '좋은 계산은 결론을 대신하지 않습니다. 다만 선택지를 더 정직하게 보게 합니다.' },
    ],
    en: [
      { label: 'Calculator Note', text: 'Numbers do not decide the future, but they can turn vague worry into adjustable variables.' },
      { label: 'Practical Wisdom', text: 'A good calculation does not replace judgment. It helps you see your options more honestly.' },
    ],
    ja: [
      { label: '計算機メモ', text: '数字は未来を決めませんが、漠然とした不安を調整できる変数に変えてくれます。' },
      { label: '実用の知恵', text: 'よい計算は判断の代わりではありません。選択肢をより正直に見る助けになります。' },
    ],
  },
};

export function getWisdomNotes(topic: WisdomTopic, locale: Locale): WisdomNote[] {
  return notes[topic][locale] ?? notes[topic][fallbackLocale] ?? [];
}
