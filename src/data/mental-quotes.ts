import type { Locale } from '../i18n';

/**
 * Mental-boost quotes shown between features.
 *
 * `tags` ties a quote to MBTI letters — the client picks from quotes whose
 * tags match the visitor's stored MBTI (profile.mbti in oiyo-user-storage,
 * falling back to the legacy oiyo_mbti_result key) with double weight, and
 * untagged quotes are universal. Without a stored type it is a plain random
 * rotation, so the feature degrades gracefully.
 */
export type MbtiLetter = 'I' | 'E' | 'N' | 'S' | 'T' | 'F' | 'J' | 'P';

export interface MentalQuote {
  label: string;
  text: string;
  tags?: MbtiLetter[];
}

const fallbackLocale: Locale = 'en';

const quotes: Partial<Record<Locale, MentalQuote[]>> = {
  ko: [
    // ── 강해지고 있다는 신호 시리즈 (universal) ──
    { label: '강해지고 있다는 신호', text: '말은 줄고, 행동은 늘어난다.' },
    { label: '강해지고 있다는 신호', text: '깔끔한 외모와 단정한 태도를 갖게 된다.' },
    { label: '강해지고 있다는 신호', text: '감정이 점점 안정되고, 마음이 더 단단해진다.' },
    { label: '강해지고 있다는 신호', text: '누군가에게 의존하지 않고도 하루가 굴러간다.' },
    { label: '강해지고 있다는 신호', text: '혼자 있는 시간이 편해진다.' },
    { label: '강해지고 있다는 신호', text: '실패에 오래 머물지 않는다.' },
    { label: '강해지고 있다는 신호', text: '지나간 일과 오지 않은 일보다, 현재에 집중한다.' },
    { label: '강해지고 있다는 신호', text: '남의 삶에 억지로 나를 맞추지 않고, 있는 그대로의 나로 산다.' },
    // ── universal ──
    { label: '마음 글귀', text: '성장은 거창한 결심이 아니라, 오늘 한 번 더 해보는 데서 시작됩니다.' },
    { label: '신기한 사실', text: '뇌는 완료한 일보다 미완성인 일을 더 오래 기억합니다. 머릿속이 시끄럽다면, 아주 작은 매듭 하나부터 지어보세요.' },
    // ── I / E ──
    { label: '마음 글귀', text: '혼자 있는 시간은 도피가 아니라 충전입니다. 조용히 보낸 오늘이 내일의 에너지가 됩니다.', tags: ['I'] },
    { label: '신기한 사실', text: '내향형의 뇌는 자극을 더 깊게 처리하는 경향이 있습니다. 쉽게 지치는 게 아니라, 깊게 살고 있는 것입니다.', tags: ['I'] },
    { label: '마음 글귀', text: '사람에게서 얻은 에너지는 사람에게 쓰일 때 가장 빛납니다. 다만 나를 위한 몫을 먼저 떼어두세요.', tags: ['E'] },
    { label: '신기한 사실', text: '외향형도 회복의 시간이 필요합니다. 활발함은 무한 동력이 아니라, 잘 쉰 만큼 켜지는 불빛입니다.', tags: ['E'] },
    // ── N / S ──
    { label: '마음 글귀', text: '상상력이 불안을 만들 때는, 같은 상상력으로 잘 풀리는 장면도 그려보세요. 둘 다 아직 일어나지 않았습니다.', tags: ['N'] },
    { label: '실천 문장', text: '큰 그림이 흐려질 땐 발밑의 한 칸만 봅니다. 오늘의 한 칸이 결국 그 그림의 일부가 됩니다.', tags: ['N'] },
    { label: '마음 글귀', text: '지금 눈앞의 것을 정확히 보는 힘은 흔치 않은 재능입니다. 현실 감각은 당신의 닻입니다.', tags: ['S'] },
    { label: '실천 문장', text: '변화가 막막하면 손에 잡히는 것부터: 책상 한 칸, 산책 십 분, 물 한 잔.', tags: ['S'] },
    // ── T / F ──
    { label: '마음 글귀', text: '문제를 분석하는 그 정확함으로 자신을 평가할 때는, 데이터에 "노력한 시간"도 포함시키세요.', tags: ['T'] },
    { label: '신기한 사실', text: '자기비판이 강한 사람일수록 기준이 높다는 뜻입니다. 기준을 버리지 말고, 마감선만 현실로 내려놓으세요.', tags: ['T'] },
    { label: '마음 글귀', text: '다른 사람의 마음을 살피는 만큼, 내 마음에도 같은 질문을 건네주세요. "오늘 너는 괜찮니?"', tags: ['F'] },
    { label: '신기한 사실', text: '공감 능력이 높은 사람은 감정이 "옮는" 속도도 빠릅니다. 무거운 대화 뒤에 지치는 건 자연스러운 일입니다.', tags: ['F'] },
    // ── J / P ──
    { label: '마음 글귀', text: '계획대로 되지 않은 날도 계획의 일부입니다. 수정하는 능력이야말로 계획형의 진짜 힘입니다.', tags: ['J'] },
    { label: '실천 문장', text: '오늘 끝내지 못한 일은 내일의 첫 줄에 적어두는 것으로 충분합니다. 그러면 마음이 먼저 퇴근할 수 있습니다.', tags: ['J'] },
    { label: '마음 글귀', text: '즉흥성은 산만함이 아니라 적응력입니다. 정해진 길이 막혔을 때 가장 먼저 새 길을 찾는 건 당신입니다.', tags: ['P'] },
    { label: '실천 문장', text: '시작은 잘하니, 이번엔 "끝의 기준"을 미리 정해보세요. 80%면 완료라고 부르기로.', tags: ['P'] },
  ],
  en: [
    { label: 'Signs you are getting stronger', text: 'You talk less and act more.' },
    { label: 'Signs you are getting stronger', text: 'You keep yourself neat — appearance and manner alike.' },
    { label: 'Signs you are getting stronger', text: 'Your emotions settle, and your mind grows steadier.' },
    { label: 'Signs you are getting stronger', text: 'Your day runs without depending on anyone.' },
    { label: 'Signs you are getting stronger', text: 'Time alone feels comfortable.' },
    { label: 'Signs you are getting stronger', text: 'You no longer dwell on failures.' },
    { label: 'Signs you are getting stronger', text: 'You focus on now — not on what passed or what may come.' },
    { label: 'Signs you are getting stronger', text: 'You stop bending your life to fit others, and live as you are.' },
    { label: 'Gentle Line', text: 'Growth starts not with grand resolutions but with trying once more today.' },
    { label: 'Curious Fact', text: 'Your brain remembers unfinished tasks longer than finished ones. If your head is noisy, tie off one tiny knot first.' },
    { label: 'Gentle Line', text: 'Time alone is not escape — it is recharging. A quiet today powers tomorrow.', tags: ['I'] },
    { label: 'Curious Fact', text: 'Introvert brains tend to process stimulation more deeply. You are not easily drained — you are living deeply.', tags: ['I'] },
    { label: 'Gentle Line', text: 'Energy gained from people shines brightest when spent on people — but set aside your own share first.', tags: ['E'] },
    { label: 'Curious Fact', text: 'Extraverts need recovery too. Liveliness is not an infinite engine; it lights up as much as you rest.', tags: ['E'] },
    { label: 'Gentle Line', text: 'When imagination builds anxiety, use the same imagination to picture things going well. Neither has happened yet.', tags: ['N'] },
    { label: 'Practice Line', text: 'When the big picture blurs, look at the single square under your feet. Today’s square becomes part of that picture.', tags: ['N'] },
    { label: 'Gentle Line', text: 'Seeing what is actually in front of you is a rare talent. Your sense of reality is your anchor.', tags: ['S'] },
    { label: 'Practice Line', text: 'When change feels vague, start with what your hands can reach: one shelf, a ten-minute walk, a glass of water.', tags: ['S'] },
    { label: 'Gentle Line', text: 'When you turn your analytical precision on yourself, include “hours of effort” in the data.', tags: ['T'] },
    { label: 'Curious Fact', text: 'Strong self-criticism means high standards. Keep the standards — just move the deadline back to reality.', tags: ['T'] },
    { label: 'Gentle Line', text: 'You check on everyone’s feelings — ask your own heart the same question: “Are you okay today?”', tags: ['F'] },
    { label: 'Curious Fact', text: 'High empathy means emotions transfer to you faster. Feeling tired after a heavy talk is natural.', tags: ['F'] },
    { label: 'Gentle Line', text: 'A day that broke the plan is still part of the plan. Revising is the planner’s real strength.', tags: ['J'] },
    { label: 'Practice Line', text: 'For what you could not finish, writing it as tomorrow’s first line is enough. Then your mind can clock out.', tags: ['J'] },
    { label: 'Gentle Line', text: 'Spontaneity is not distraction — it is adaptability. When the set path closes, you find the new one first.', tags: ['P'] },
    { label: 'Practice Line', text: 'You start well — this time define “done” in advance. Agree that 80% counts as finished.', tags: ['P'] },
  ],
  ja: [
    { label: '強くなっているサイン', text: '言葉は減り、行動が増えていく。' },
    { label: '強くなっているサイン', text: '身だしなみと振る舞いが整っていく。' },
    { label: '強くなっているサイン', text: '感情が安定し、心が少しずつ強くなる。' },
    { label: '強くなっているサイン', text: '誰かに依存しなくても、一日が回るようになる。' },
    { label: '強くなっているサイン', text: 'ひとりの時間が心地よくなる。' },
    { label: '強くなっているサイン', text: '失敗に長くとどまらなくなる。' },
    { label: '強くなっているサイン', text: '過ぎたことや来ていないことより、今に集中できる。' },
    { label: '強くなっているサイン', text: '他人の人生に無理に合わせず、ありのままの自分で生きる。' },
    { label: '心の言葉', text: '成長は大きな決意ではなく、今日もう一度やってみることから始まります。' },
    { label: '小さな発見', text: '脳は終えた仕事より、未完成の仕事を長く覚えています。頭の中が騒がしい時は、小さな結び目を一つ作ることから。' },
    { label: '心の言葉', text: 'ひとりの時間は逃避ではなく充電です。静かな今日が、明日のエネルギーになります。', tags: ['I'] },
    { label: '小さな発見', text: '内向型の脳は刺激を深く処理する傾向があります。疲れやすいのではなく、深く生きているのです。', tags: ['I'] },
    { label: '心の言葉', text: '人から得たエネルギーは人のために使う時に輝きます。ただし、自分の分を先に取っておきましょう。', tags: ['E'] },
    { label: '小さな発見', text: '外向型にも回復の時間が必要です。活発さは無限の動力ではなく、休んだ分だけ灯る光です。', tags: ['E'] },
    { label: '心の言葉', text: '想像力が不安を生む時は、同じ想像力でうまくいく場面も描いてみましょう。どちらもまだ起きていません。', tags: ['N'] },
    { label: '実践の言葉', text: '大きな絵がぼやけたら、足元の一マスだけを見ます。今日の一マスが、いつかその絵の一部になります。', tags: ['N'] },
    { label: '心の言葉', text: '目の前のものを正確に見る力は、めったにない才能です。現実感覚はあなたの錨です。', tags: ['S'] },
    { label: '実践の言葉', text: '変化が漠然としている時は、手の届くものから:棚ひとつ、散歩十分、水一杯。', tags: ['S'] },
    { label: '心の言葉', text: '問題を分析するその正確さで自分を評価する時は、データに「努力した時間」も含めてください。', tags: ['T'] },
    { label: '小さな発見', text: '自己批判が強いのは基準が高い証拠です。基準は捨てず、締切だけ現実に合わせましょう。', tags: ['T'] },
    { label: '心の言葉', text: 'みんなの気持ちを気遣うように、自分の心にも同じ質問を。「今日、あなたは大丈夫?」', tags: ['F'] },
    { label: '小さな発見', text: '共感力が高い人は感情が「移る」速度も速いのです。重い話の後に疲れるのは自然なことです。', tags: ['F'] },
    { label: '心の言葉', text: '計画通りにいかなかった日も計画の一部です。修正する力こそ、計画型の本当の強さです。', tags: ['J'] },
    { label: '実践の言葉', text: '終わらなかったことは、明日の最初の行に書いておくだけで十分。心が先に退勤できます。', tags: ['J'] },
    { label: '心の言葉', text: '即興性は散漫さではなく適応力です。決まった道が塞がれた時、最初に新しい道を見つけるのはあなたです。', tags: ['P'] },
    { label: '実践の言葉', text: '始めるのは得意だから、今回は「終わりの基準」を先に決めましょう。80%で完了と呼ぶことに。', tags: ['P'] },
  ],
};

export function getMentalQuotes(locale: Locale): MentalQuote[] {
  return quotes[locale] ?? quotes[fallbackLocale] ?? [];
}
