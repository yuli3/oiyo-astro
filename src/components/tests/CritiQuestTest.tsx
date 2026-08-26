'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";

interface Props { locale?: string; }

type ScoreLevel = "expert" | "proficient" | "developing" | "beginner";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  explanation: string;
}

const data = {
  ko: {
    title: "비판적 사고력 테스트: 나의 논리 수준은?",
    description: "10개의 논리 문제로 비판적 사고 능력을 측정하세요.",
    questions: [
      { id: "q1", text: "전제 1: 모든 고양이는 포유류이다.\n전제 2: 모든 포유류는 척추동물이다.\n반드시 참인 결론은?", options: [
        { id: "a", text: "모든 척추동물은 고양이이다.", isCorrect: false },
        { id: "b", text: "모든 고양이는 척추동물이다.", isCorrect: true },
        { id: "c", text: "일부 척추동물은 고양이이다.", isCorrect: false },
        { id: "d", text: "일부 고양이는 척추동물이 아니다.", isCorrect: false },
      ], explanation: "삼단논법: 고양이 ⊂ 포유류 ⊂ 척추동물이므로, 모든 고양이는 척추동물입니다." },
      { id: "q2", text: "'우리 학교 학생들은 모두 스마트폰 중독이야. 왜냐하면 내가 아는 학생들 대부분이 쉬는 시간마다 스마트폰만 보고 있거든.' 이 주장의 논리적 오류는?", options: [
        { id: "a", text: "흑백논리의 오류", isCorrect: false },
        { id: "b", text: "인신공격의 오류", isCorrect: false },
        { id: "c", text: "성급한 일반화의 오류", isCorrect: true },
        { id: "d", text: "피장파장의 오류", isCorrect: false },
      ], explanation: "일부 학생들의 관찰로 전체를 단정 짓는 성급한 일반화의 오류입니다." },
      { id: "q3", text: "'최근 연구에 따르면 커피를 마시면 심장병 위험이 50% 감소한다.' 이 주장을 비판적으로 평가하기 위해 가장 중요한 질문은?", options: [
        { id: "a", text: "누가 이 연구에 자금을 지원했는가?", isCorrect: false },
        { id: "b", text: "연구에 몇 명이 참여했으며 그들은 누구였는가?", isCorrect: true },
        { id: "c", text: "이 연구는 동료 심사를 거친 학술지에 게재되었는가?", isCorrect: false },
        { id: "d", text: "연구자들은 스스로 커피를 마시는가?", isCorrect: false },
      ], explanation: "표본 크기와 대표성이 '50% 감소'라는 주장의 신뢰성을 평가하는 데 핵심입니다." },
      { id: "q4", text: "새 빨간 차를 구입한 후, 갑자기 도로에 빨간 차가 많다는 것을 알아차립니다. 이는 어떤 인지 편향의 예입니까?", options: [
        { id: "a", text: "확증 편향", isCorrect: false },
        { id: "b", text: "빈도 착각(바더-마인호프 현상)", isCorrect: true },
        { id: "c", text: "정박 효과", isCorrect: false },
        { id: "d", text: "사후 확신 편향", isCorrect: false },
      ], explanation: "방금 알아차린 것이 갑자기 어디에나 나타나는 것처럼 느껴지는 빈도 착각입니다." },
      { id: "q5", text: "'지난 겨울에 기록적인 추위가 있었는데 지구 온난화가 어떻게 사실일 수 있지?' 이 진술에 포함된 오류는?", options: [
        { id: "a", text: "권위에 호소하는 오류", isCorrect: false },
        { id: "b", text: "허수아비 논증", isCorrect: false },
        { id: "c", text: "일화적 증거의 오류", isCorrect: true },
        { id: "d", text: "감정에 호소하는 오류", isCorrect: false },
      ], explanation: "단일 날씨 사건으로 장기적 기후 추세를 반박하는 일화적 증거의 오류입니다." },
      { id: "q6", text: "모든 A는 B이고, 일부 B는 C라면, 다음 중 반드시 참인 것은?", options: [
        { id: "a", text: "모든 A는 C이다", isCorrect: false },
        { id: "b", text: "일부 A는 C이다", isCorrect: false },
        { id: "c", text: "A는 C가 아니다", isCorrect: false },
        { id: "d", text: "위의 어떤 것도 확실하게 결정할 수 없다", isCorrect: true },
      ], explanation: "A와 C의 관계는 추가 정보 없이는 확정할 수 없습니다." },
      { id: "q7", text: "다이어트 약이 '상당한 체중 감량'으로 이어진다고 주장합니다. 이 주장을 평가하는 데 가장 중요한 정보는?", options: [
        { id: "a", text: "얼마나 많은 유명인이 제품을 홍보하는지", isCorrect: false },
        { id: "b", text: "구체적인 체중 감량 양과 위약 그룹과 비교한 결과", isCorrect: true },
        { id: "c", text: "회사가 사업을 운영한 기간", isCorrect: false },
        { id: "d", text: "경쟁사와 비교한 가격", isCorrect: false },
      ], explanation: "대조군과의 비교만이 효과가 실제인지 확인할 수 있습니다." },
      { id: "q8", text: "투자한 주식이 하락했지만 '이미 많이 투자했으니 포기할 수 없어'라며 보유합니다. 이는 어떤 인지 편향입니까?", options: [
        { id: "a", text: "매몰 비용 오류", isCorrect: true },
        { id: "b", text: "도박사의 오류", isCorrect: false },
        { id: "c", text: "낙관주의 편향", isCorrect: false },
        { id: "d", text: "더닝-크루거 효과", isCorrect: false },
      ], explanation: "회수 불가능한 과거 투자에 근거해 비합리적 결정을 내리는 매몰 비용 오류입니다." },
      { id: "q9", text: "'내 상대는 대중교통 지원을 늘리고 싶어합니다. 히틀러도 나치 독일에서 고속도로를 건설했습니다. 그런 위험한 생각을 지지하겠습니까?' 이것은 어떤 오류입니까?", options: [
        { id: "a", text: "인신공격의 오류", isCorrect: false },
        { id: "b", text: "거짓 등가", isCorrect: false },
        { id: "c", text: "연좌제의 오류", isCorrect: true },
        { id: "d", text: "미끄러운 경사길의 오류", isCorrect: false },
      ], explanation: "아이디어 자체의 장점이 아닌 부정적 인물과의 연관으로 신뢰성을 떨어뜨리는 연좌제의 오류입니다." },
      { id: "q10", text: "'내가 그렇게 말했으니까 너는 대학에서 의학을 공부해야 해.' 이 진술은 어떤 오류를 보여줍니까?", options: [
        { id: "a", text: "권위에 호소하는 오류", isCorrect: true },
        { id: "b", text: "순환 논법", isCorrect: false },
        { id: "c", text: "거짓 이분법", isCorrect: false },
        { id: "d", text: "논점 일탈의 오류", isCorrect: false },
      ], explanation: "실질적 이유 없이 권위만을 근거로 주장하는 권위에 호소하는 오류입니다." },
    ] as Question[],
    results: {
      expert: { emoji: "🧠", title: "비판적 사고 전문가", desc: "뛰어난 논리적 추론 능력을 갖추고 있습니다. 복잡한 논증을 쉽게 분석하고 인지 편향을 명확히 식별합니다. 이 능력을 주변 사람들과 나눠보세요." },
      proficient: { emoji: "🔍", title: "능숙한 분석가", desc: "탄탄한 비판적 사고 능력을 가지고 있습니다. 대부분의 논리적 오류를 인식하지만 가끔 놓치는 부분이 있습니다. 지속적인 연습으로 더욱 발전할 수 있습니다." },
      developing: { emoji: "📚", title: "성장 중인 사상가", desc: "기본적인 논리 개념은 이해하고 있지만 더 깊은 훈련이 필요합니다. 논리학과 인지 편향에 관한 책을 읽으며 사고력을 키워보세요." },
      beginner: { emoji: "🌱", title: "비판적 사고 초보자", desc: "비판적 사고의 여정을 막 시작했습니다. 논리적 오류와 인지 편향에 대해 배우면 일상의 판단력이 크게 향상됩니다. 꾸준한 학습을 권장합니다." },
    },
    retake: "다시하기", resultLabel: "나의 비판적 사고력 수준",
    correct: "정답!", wrong: "오답",
  },
  en: {
    title: "Critical Thinking: What's Your Critical Thinking Level?",
    description: "Measure your critical thinking ability with 10 logic questions.",
    questions: [
      { id: "q1", text: "Premise 1: All cats are mammals.\nPremise 2: All mammals are vertebrates.\nWhich conclusion must be true?", options: [
        { id: "a", text: "All vertebrates are cats.", isCorrect: false },
        { id: "b", text: "All cats are vertebrates.", isCorrect: true },
        { id: "c", text: "Some vertebrates are cats.", isCorrect: false },
        { id: "d", text: "Some cats are not vertebrates.", isCorrect: false },
      ], explanation: "Syllogism: cats ⊂ mammals ⊂ vertebrates, therefore all cats must be vertebrates." },
      { id: "q2", text: "'All students at our school are addicted to smartphones because most of the students I know are always on their phones during breaks.' What logical fallacy is this?", options: [
        { id: "a", text: "Black and white fallacy", isCorrect: false },
        { id: "b", text: "Ad hominem fallacy", isCorrect: false },
        { id: "c", text: "Hasty generalization fallacy", isCorrect: true },
        { id: "d", text: "Tu quoque fallacy", isCorrect: false },
      ], explanation: "Drawing a conclusion about all students based on limited observation is a hasty generalization." },
      { id: "q3", text: "'A recent study shows drinking coffee reduces heart disease risk by 50%.' What's the most important question to critically evaluate this claim?", options: [
        { id: "a", text: "Who funded the study?", isCorrect: false },
        { id: "b", text: "How many people participated and who were they?", isCorrect: true },
        { id: "c", text: "Was it published in a peer-reviewed journal?", isCorrect: false },
        { id: "d", text: "Do the researchers drink coffee themselves?", isCorrect: false },
      ], explanation: "Sample size and representativeness are key to evaluating the '50% reduction' claim." },
      { id: "q4", text: "After buying a new red car, you suddenly notice many red cars on the road. This is an example of which cognitive bias?", options: [
        { id: "a", text: "Confirmation bias", isCorrect: false },
        { id: "b", text: "Frequency illusion (Baader-Meinhof phenomenon)", isCorrect: true },
        { id: "c", text: "Anchoring bias", isCorrect: false },
        { id: "d", text: "Hindsight bias", isCorrect: false },
      ], explanation: "Something you just noticed suddenly seems to appear everywhere — the frequency illusion." },
      { id: "q5", text: "'How can global warming be real if we had record cold temperatures last winter?' What fallacy does this contain?", options: [
        { id: "a", text: "Appeal to authority", isCorrect: false },
        { id: "b", text: "Straw man argument", isCorrect: false },
        { id: "c", text: "Anecdotal evidence fallacy", isCorrect: true },
        { id: "d", text: "Appeal to emotion", isCorrect: false },
      ], explanation: "Using a single local weather event to challenge a global long-term climate trend is anecdotal evidence." },
      { id: "q6", text: "If all A are B, and some B are C, which of the following must be true?", options: [
        { id: "a", text: "All A are C", isCorrect: false },
        { id: "b", text: "Some A are C", isCorrect: false },
        { id: "c", text: "No A are C", isCorrect: false },
        { id: "d", text: "None of the above can be determined with certainty", isCorrect: true },
      ], explanation: "Without additional information, the relationship between A and C cannot be definitively determined." },
      { id: "q7", text: "A company claims its diet pill leads to 'significant weight loss.' What information is most important to evaluate this?", options: [
        { id: "a", text: "How many celebrities endorse the product", isCorrect: false },
        { id: "b", text: "The specific amount of weight loss compared to a placebo group", isCorrect: true },
        { id: "c", text: "How long the company has been in business", isCorrect: false },
        { id: "d", text: "The price compared to competitors", isCorrect: false },
      ], explanation: "Only comparison with a control group can determine if the weight loss is real or due to other factors." },
      { id: "q8", text: "You hold a losing stock because 'I've already invested so much, I can't give up now.' Which cognitive bias is this?", options: [
        { id: "a", text: "Sunk cost fallacy", isCorrect: true },
        { id: "b", text: "Gambler's fallacy", isCorrect: false },
        { id: "c", text: "Optimism bias", isCorrect: false },
        { id: "d", text: "Dunning-Kruger effect", isCorrect: false },
      ], explanation: "Making decisions based on irrecoverable past investments rather than rational future evaluation is the sunk cost fallacy." },
      { id: "q9", text: "'My opponent wants more public transportation funding. Hitler built highways in Nazi Germany. Do you really want to support such dangerous ideas?' What fallacy is this?", options: [
        { id: "a", text: "Ad hominem fallacy", isCorrect: false },
        { id: "b", text: "False equivalence", isCorrect: false },
        { id: "c", text: "Guilt by association fallacy", isCorrect: true },
        { id: "d", text: "Slippery slope fallacy", isCorrect: false },
      ], explanation: "Rejecting an idea by associating it with a negative figure without addressing its merits is guilt by association." },
      { id: "q10", text: "A parent tells their child: 'You need to study medicine in college because I said so.' What fallacy does this demonstrate?", options: [
        { id: "a", text: "Appeal to authority", isCorrect: true },
        { id: "b", text: "Circular reasoning", isCorrect: false },
        { id: "c", text: "False dilemma", isCorrect: false },
        { id: "d", text: "Red herring fallacy", isCorrect: false },
      ], explanation: "Using authority position as the sole justification without providing substantive reasons is an appeal to authority." },
    ] as Question[],
    results: {
      expert: { emoji: "🧠", title: "Critical Thinking Expert", desc: "You have outstanding logical reasoning abilities. You easily analyze complex arguments and clearly identify cognitive biases. Share this skill with those around you." },
      proficient: { emoji: "🔍", title: "Proficient Analyst", desc: "You have solid critical thinking skills. You recognize most logical fallacies but occasionally miss some. Continued practice will take you even further." },
      developing: { emoji: "📚", title: "Developing Thinker", desc: "You understand basic logic concepts but need deeper training. Reading about logical fallacies and cognitive biases will significantly sharpen your thinking." },
      beginner: { emoji: "🌱", title: "Critical Thinking Beginner", desc: "You've just started your critical thinking journey. Learning about logical fallacies and cognitive biases will greatly improve your everyday judgment. Keep learning!" },
    },
    retake: "Retake", resultLabel: "Your Critical Thinking Level",
    correct: "Correct!", wrong: "Wrong",
  },
  ja: {
    title: "批判的思考力テスト：あなたの論理レベルは？",
    description: "10の論理問題であなたの批判的思考力を測定しましょう。",
    questions: [
      { id: "q1", text: "前提1：すべての猫は哺乳類である。\n前提2：すべての哺乳類は脊椎動物である。\n必ず真である結論は？", options: [
        { id: "a", text: "すべての脊椎動物は猫である。", isCorrect: false },
        { id: "b", text: "すべての猫は脊椎動物である。", isCorrect: true },
        { id: "c", text: "一部の脊椎動物は猫である。", isCorrect: false },
        { id: "d", text: "一部の猫は脊椎動物ではない。", isCorrect: false },
      ], explanation: "三段論法：猫⊂哺乳類⊂脊椎動物なので、すべての猫は脊椎動物です。" },
      { id: "q2", text: "「私たちの学校の生徒はみんなスマートフォン中毒だ。なぜなら私が知っている生徒のほとんどが休み時間ずっとスマートフォンばかり見ているから。」この主張の論理的誤りは？", options: [
        { id: "a", text: "白黒思考の誤り", isCorrect: false },
        { id: "b", text: "人身攻撃の誤り", isCorrect: false },
        { id: "c", text: "早まった一般化の誤り", isCorrect: true },
        { id: "d", text: "お前もだろうの誤り", isCorrect: false },
      ], explanation: "一部の生徒の観察だけで全体を決めつける、早まった一般化の誤りです。" },
      { id: "q3", text: "「最近の研究によると、コーヒーを飲むと心臓病のリスクが50%減少する。」この主張を批判的に評価するために最も重要な質問は？", options: [
        { id: "a", text: "誰がこの研究に資金提供したか？", isCorrect: false },
        { id: "b", text: "何人がこの研究に参加し、その人々は誰だったか？", isCorrect: true },
        { id: "c", text: "この研究は査読付き学術誌に掲載されたか？", isCorrect: false },
        { id: "d", text: "研究者自身はコーヒーを飲むか？", isCorrect: false },
      ], explanation: "標本サイズと代表性が「50%減少」という主張の信頼性を評価する鍵です。" },
      { id: "q4", text: "新しい赤い車を買った後、突然道路に赤い車が多いことに気づきます。これはどの認知バイアスの例ですか？", options: [
        { id: "a", text: "確証バイアス", isCorrect: false },
        { id: "b", text: "頻度錯覚（バーダー・マインホフ現象）", isCorrect: true },
        { id: "c", text: "アンカリング効果", isCorrect: false },
        { id: "d", text: "後知恵バイアス", isCorrect: false },
      ], explanation: "たった今気づいたものが、突然どこにでもあるように感じられる頻度錯覚です。" },
      { id: "q5", text: "「去年の冬は記録的な寒さだったのに、地球温暖化がどうして本当だと言えるのか？」この発言に含まれる誤りは？", options: [
        { id: "a", text: "権威への訴えの誤り", isCorrect: false },
        { id: "b", text: "藁人形論法", isCorrect: false },
        { id: "c", text: "逸話的証拠の誤り", isCorrect: true },
        { id: "d", text: "感情への訴えの誤り", isCorrect: false },
      ], explanation: "単一の気象現象で長期的な気候傾向を否定する、逸話的証拠の誤りです。" },
      { id: "q6", text: "すべてのAはBであり、一部のBはCであるとき、次のうち必ず真であるものは？", options: [
        { id: "a", text: "すべてのAはCである", isCorrect: false },
        { id: "b", text: "一部のAはCである", isCorrect: false },
        { id: "c", text: "AはCではない", isCorrect: false },
        { id: "d", text: "上記のいずれも確実には決定できない", isCorrect: true },
      ], explanation: "AとCの関係は、追加情報なしには確定できません。" },
      { id: "q7", text: "あるダイエット薬が「著しい体重減少」につながると主張しています。この主張を評価する上で最も重要な情報は？", options: [
        { id: "a", text: "何人の有名人がこの製品を宣伝しているか", isCorrect: false },
        { id: "b", text: "具体的な体重減少量とプラセボ群との比較結果", isCorrect: true },
        { id: "c", text: "その会社が事業を運営してきた期間", isCorrect: false },
        { id: "d", text: "競合他社と比較した価格", isCorrect: false },
      ], explanation: "対照群との比較だけが、その効果が本物かどうかを確認できます。" },
      { id: "q8", text: "投資した株が下落しているにもかかわらず、「もうこんなに投資したのだから今さらやめられない」と保有し続けます。これはどの認知バイアスですか？", options: [
        { id: "a", text: "サンクコストの誤り", isCorrect: true },
        { id: "b", text: "ギャンブラーの誤謬", isCorrect: false },
        { id: "c", text: "楽観主義バイアス", isCorrect: false },
        { id: "d", text: "ダニング＝クルーガー効果", isCorrect: false },
      ], explanation: "回収不可能な過去の投資に基づいて非合理的な決定を下す、サンクコストの誤りです。" },
      { id: "q9", text: "「私の対立候補は公共交通機関への支援拡大を望んでいます。ヒトラーもナチス・ドイツで高速道路を建設しました。そんな危険な考えを支持したいですか？」これはどの誤りですか？", options: [
        { id: "a", text: "人身攻撃の誤り", isCorrect: false },
        { id: "b", text: "偽の等価性", isCorrect: false },
        { id: "c", text: "連座の誤り（ギルト・バイ・アソシエーション）", isCorrect: true },
        { id: "d", text: "滑りやすい坂論法", isCorrect: false },
      ], explanation: "アイデアそのものの是非ではなく、否定的な人物との関連付けで信頼性を落とす、連座の誤りです。" },
      { id: "q10", text: "「私がそう言ったのだから、あなたは大学で医学を学ぶべきだ。」この発言はどの誤りを示していますか？", options: [
        { id: "a", text: "権威への訴えの誤り", isCorrect: true },
        { id: "b", text: "循環論法", isCorrect: false },
        { id: "c", text: "偽の二分法", isCorrect: false },
        { id: "d", text: "論点のすり替えの誤り", isCorrect: false },
      ], explanation: "実質的な理由なしに権威のみを根拠に主張する、権威への訴えの誤りです。" },
    ] as Question[],
    results: {
      expert: { emoji: "🧠", title: "批判的思考のエキスパート", desc: "優れた論理的推論能力を備えています。複雑な論証を簡単に分析し、認知バイアスを明確に見極めます。この能力を周りの人と分かち合いましょう。" },
      proficient: { emoji: "🔍", title: "熟練したアナリスト", desc: "しっかりとした批判的思考力を持っています。ほとんどの論理的誤りを認識できますが、時々見逃すこともあります。継続的な練習でさらに伸びるでしょう。" },
      developing: { emoji: "📚", title: "成長中の思考者", desc: "基本的な論理概念は理解していますが、より深い訓練が必要です。論理学と認知バイアスに関する本を読んで思考力を鍛えましょう。" },
      beginner: { emoji: "🌱", title: "批判的思考の初心者", desc: "批判的思考の旅を始めたばかりです。論理的誤りと認知バイアスについて学ぶことで、日常の判断力が大きく向上します。継続的な学習をお勧めします。" },
    },
    retake: "もう一度", resultLabel: "あなたの批判的思考力レベル",
    correct: "正解！", wrong: "不正解",
  },
  zh: {
    title: "批判性思维测试：你的逻辑水平如何？",
    description: "通过10道逻辑题测试你的批判性思维能力。",
    questions: [
      { id: "q1", text: "前提1：所有猫都是哺乳动物。\n前提2：所有哺乳动物都是脊椎动物。\n哪个结论一定为真？", options: [
        { id: "a", text: "所有脊椎动物都是猫。", isCorrect: false },
        { id: "b", text: "所有猫都是脊椎动物。", isCorrect: true },
        { id: "c", text: "一些脊椎动物是猫。", isCorrect: false },
        { id: "d", text: "一些猫不是脊椎动物。", isCorrect: false },
      ], explanation: "三段论：猫⊂哺乳动物⊂脊椎动物，因此所有猫都必然是脊椎动物。" },
      { id: "q2", text: "「我们学校的学生都沉迷智能手机，因为我认识的大多数学生课间休息时都一直盯着手机看。」这个论断存在什么逻辑谬误？", options: [
        { id: "a", text: "非黑即白谬误", isCorrect: false },
        { id: "b", text: "人身攻击谬误", isCorrect: false },
        { id: "c", text: "以偏概全谬误", isCorrect: true },
        { id: "d", text: "以子之矛攻子之盾谬误", isCorrect: false },
      ], explanation: "仅凭对部分学生的观察就对整体下结论，属于以偏概全的谬误。" },
      { id: "q3", text: "「最新研究显示，喝咖啡可将心脏病风险降低50%。」要批判性地评估这一说法，最重要的问题是什么？", options: [
        { id: "a", text: "谁资助了这项研究？", isCorrect: false },
        { id: "b", text: "有多少人参与了这项研究，他们是谁？", isCorrect: true },
        { id: "c", text: "这项研究是否发表在同行评审期刊上？", isCorrect: false },
        { id: "d", text: "研究人员自己喝咖啡吗？", isCorrect: false },
      ], explanation: "样本量与代表性是评估「降低50%」这一说法可信度的关键。" },
      { id: "q4", text: "买了一辆新的红色车之后，你突然发现路上有很多红色车。这是哪种认知偏误的例子？", options: [
        { id: "a", text: "确认偏误", isCorrect: false },
        { id: "b", text: "频率错觉（巴德尔-迈因霍夫现象）", isCorrect: true },
        { id: "c", text: "锚定效应", isCorrect: false },
        { id: "d", text: "后见之明偏误", isCorrect: false },
      ], explanation: "刚注意到的事物突然感觉无处不在，这就是频率错觉。" },
      { id: "q5", text: "「去年冬天创下了寒冷纪录，全球变暖怎么可能是真的？」这句话包含了什么谬误？", options: [
        { id: "a", text: "诉诸权威谬误", isCorrect: false },
        { id: "b", text: "稻草人论证", isCorrect: false },
        { id: "c", text: "轶事证据谬误", isCorrect: true },
        { id: "d", text: "诉诸情感谬误", isCorrect: false },
      ], explanation: "用单一天气事件来反驳长期气候趋势，属于轶事证据谬误。" },
      { id: "q6", text: "如果所有A都是B，且一些B是C，以下哪项一定为真？", options: [
        { id: "a", text: "所有A都是C", isCorrect: false },
        { id: "b", text: "一些A是C", isCorrect: false },
        { id: "c", text: "没有A是C", isCorrect: false },
        { id: "d", text: "以上都无法确定", isCorrect: true },
      ], explanation: "在没有额外信息的情况下，A与C之间的关系无法确定。" },
      { id: "q7", text: "一家公司声称其减肥药能带来「显著的体重减轻」。评估这一说法时，最重要的信息是什么？", options: [
        { id: "a", text: "有多少名人为该产品代言", isCorrect: false },
        { id: "b", text: "与安慰剂组相比的具体减重量", isCorrect: true },
        { id: "c", text: "该公司经营了多长时间", isCorrect: false },
        { id: "d", text: "与竞争对手相比的价格", isCorrect: false },
      ], explanation: "只有与对照组比较，才能确定减重效果是否真实。" },
      { id: "q8", text: "你持有一只亏损的股票，理由是「我已经投入这么多了，现在不能放弃」。这是哪种认知偏误？", options: [
        { id: "a", text: "沉没成本谬误", isCorrect: true },
        { id: "b", text: "赌徒谬误", isCorrect: false },
        { id: "c", text: "乐观偏误", isCorrect: false },
        { id: "d", text: "邓宁-克鲁格效应", isCorrect: false },
      ], explanation: "基于无法收回的过去投入做出非理性决定，属于沉没成本谬误。" },
      { id: "q9", text: "「我的对手希望增加公共交通拨款。希特勒也曾在纳粹德国修建高速公路。你真的想支持这种危险的想法吗？」这是什么谬误？", options: [
        { id: "a", text: "人身攻击谬误", isCorrect: false },
        { id: "b", text: "错误等价", isCorrect: false },
        { id: "c", text: "连坐谬误（因关联而获罪）", isCorrect: true },
        { id: "d", text: "滑坡谬误", isCorrect: false },
      ], explanation: "不针对想法本身的优劣，而是通过与负面人物关联来削弱其可信度，这属于连坐谬误。" },
      { id: "q10", text: "「我说了算，所以你大学必须学医。」这句话体现了什么谬误？", options: [
        { id: "a", text: "诉诸权威谬误", isCorrect: true },
        { id: "b", text: "循环论证", isCorrect: false },
        { id: "c", text: "假两难", isCorrect: false },
        { id: "d", text: "转移话题谬误", isCorrect: false },
      ], explanation: "在没有实质理由的情况下，仅凭权威地位来主张观点，这是诉诸权威谬误。" },
    ] as Question[],
    results: {
      expert: { emoji: "🧠", title: "批判性思维专家", desc: "你拥有出色的逻辑推理能力，能轻松分析复杂论证，并清晰识别认知偏误。请把这项能力分享给身边的人。" },
      proficient: { emoji: "🔍", title: "熟练的分析者", desc: "你拥有扎实的批判性思维能力，能识别大多数逻辑谬误，但偶尔会有遗漏。持续练习会让你更进一步。" },
      developing: { emoji: "📚", title: "成长中的思考者", desc: "你理解基本的逻辑概念，但还需要更深入的训练。多读一些关于逻辑谬误和认知偏误的书籍，将有助于磨练你的思维能力。" },
      beginner: { emoji: "🌱", title: "批判性思维初学者", desc: "你刚刚开始批判性思维之旅。学习逻辑谬误和认知偏误将大大提升你日常的判断力。建议持续学习。" },
    },
    retake: "重新测试", resultLabel: "你的批判性思维水平",
    correct: "答对了！", wrong: "答错了",
  },
  fr: {
    title: "Test de pensée critique : quel est votre niveau de logique ?",
    description: "Mesurez votre pensée critique avec 10 questions de logique.",
    questions: [
      { id: "q1", text: "Prémisse 1 : Tous les chats sont des mammifères.\nPrémisse 2 : Tous les mammifères sont des vertébrés.\nQuelle conclusion doit être vraie ?", options: [
        { id: "a", text: "Tous les vertébrés sont des chats.", isCorrect: false },
        { id: "b", text: "Tous les chats sont des vertébrés.", isCorrect: true },
        { id: "c", text: "Certains vertébrés sont des chats.", isCorrect: false },
        { id: "d", text: "Certains chats ne sont pas des vertébrés.", isCorrect: false },
      ], explanation: "Syllogisme : chats ⊂ mammifères ⊂ vertébrés, donc tous les chats sont nécessairement des vertébrés." },
      { id: "q2", text: "« Tous les élèves de notre école sont accros aux smartphones, car la plupart des élèves que je connais sont toujours sur leur téléphone pendant les pauses. » Quel sophisme cela illustre-t-il ?", options: [
        { id: "a", text: "Sophisme du tout ou rien", isCorrect: false },
        { id: "b", text: "Sophisme ad hominem", isCorrect: false },
        { id: "c", text: "Sophisme de généralisation hâtive", isCorrect: true },
        { id: "d", text: "Sophisme du tu quoque", isCorrect: false },
      ], explanation: "Tirer une conclusion sur tous les élèves à partir d'une observation limitée est une généralisation hâtive." },
      { id: "q3", text: "« Une étude récente montre que boire du café réduit de 50 % le risque de maladie cardiaque. » Quelle est la question la plus importante pour évaluer cette affirmation de façon critique ?", options: [
        { id: "a", text: "Qui a financé l'étude ?", isCorrect: false },
        { id: "b", text: "Combien de personnes ont participé et qui étaient-elles ?", isCorrect: true },
        { id: "c", text: "A-t-elle été publiée dans une revue à comité de lecture ?", isCorrect: false },
        { id: "d", text: "Les chercheurs boivent-ils eux-mêmes du café ?", isCorrect: false },
      ], explanation: "La taille de l'échantillon et sa représentativité sont essentielles pour évaluer l'affirmation d'une « réduction de 50 % »." },
      { id: "q4", text: "Après avoir acheté une nouvelle voiture rouge, vous remarquez soudain beaucoup de voitures rouges sur la route. C'est un exemple de quel biais cognitif ?", options: [
        { id: "a", text: "Biais de confirmation", isCorrect: false },
        { id: "b", text: "Illusion de fréquence (phénomène Baader-Meinhof)", isCorrect: true },
        { id: "c", text: "Biais d'ancrage", isCorrect: false },
        { id: "d", text: "Biais rétrospectif", isCorrect: false },
      ], explanation: "Ce que vous venez de remarquer semble soudain apparaître partout : c'est l'illusion de fréquence." },
      { id: "q5", text: "« Comment le réchauffement climatique peut-il être réel si nous avons eu des températures record l'hiver dernier ? » Quel sophisme cette affirmation contient-elle ?", options: [
        { id: "a", text: "Argument d'autorité", isCorrect: false },
        { id: "b", text: "Homme de paille", isCorrect: false },
        { id: "c", text: "Sophisme de la preuve anecdotique", isCorrect: true },
        { id: "d", text: "Appel à l'émotion", isCorrect: false },
      ], explanation: "Utiliser un événement météorologique isolé pour contester une tendance climatique globale à long terme est une preuve anecdotique." },
      { id: "q6", text: "Si tous les A sont B, et que certains B sont C, laquelle des affirmations suivantes doit être vraie ?", options: [
        { id: "a", text: "Tous les A sont C", isCorrect: false },
        { id: "b", text: "Certains A sont C", isCorrect: false },
        { id: "c", text: "Aucun A n'est C", isCorrect: false },
        { id: "d", text: "Aucune des réponses ci-dessus ne peut être déterminée avec certitude", isCorrect: true },
      ], explanation: "Sans information supplémentaire, la relation entre A et C ne peut pas être déterminée avec certitude." },
      { id: "q7", text: "Une entreprise affirme que sa pilule amaigrissante entraîne une « perte de poids significative ». Quelle information est la plus importante pour évaluer cette affirmation ?", options: [
        { id: "a", text: "Le nombre de célébrités qui approuvent le produit", isCorrect: false },
        { id: "b", text: "La quantité précise de perte de poids comparée à un groupe placebo", isCorrect: true },
        { id: "c", text: "Depuis combien de temps l'entreprise existe", isCorrect: false },
        { id: "d", text: "Le prix par rapport à la concurrence", isCorrect: false },
      ], explanation: "Seule une comparaison avec un groupe témoin permet de savoir si la perte de poids est réelle." },
      { id: "q8", text: "Vous conservez une action perdante en vous disant « j'ai déjà tellement investi, je ne peux pas abandonner maintenant ». Quel biais cognitif est-ce ?", options: [
        { id: "a", text: "Sophisme des coûts irrécupérables", isCorrect: true },
        { id: "b", text: "Erreur du joueur", isCorrect: false },
        { id: "c", text: "Biais d'optimisme", isCorrect: false },
        { id: "d", text: "Effet Dunning-Kruger", isCorrect: false },
      ], explanation: "Prendre des décisions basées sur des investissements passés irrécupérables plutôt que sur une évaluation rationnelle future est le sophisme des coûts irrécupérables." },
      { id: "q9", text: "« Mon adversaire veut plus de financement pour les transports en commun. Hitler aussi a construit des autoroutes dans l'Allemagne nazie. Voulez-vous vraiment soutenir des idées aussi dangereuses ? » Quel sophisme est-ce ?", options: [
        { id: "a", text: "Sophisme ad hominem", isCorrect: false },
        { id: "b", text: "Fausse équivalence", isCorrect: false },
        { id: "c", text: "Culpabilité par association", isCorrect: true },
        { id: "d", text: "Pente glissante", isCorrect: false },
      ], explanation: "Rejeter une idée en l'associant à une figure négative sans en examiner le fond est une culpabilité par association." },
      { id: "q10", text: "Un parent dit à son enfant : « Tu dois étudier la médecine à l'université parce que je l'ai dit. » Quel sophisme cela illustre-t-il ?", options: [
        { id: "a", text: "Argument d'autorité", isCorrect: true },
        { id: "b", text: "Raisonnement circulaire", isCorrect: false },
        { id: "c", text: "Faux dilemme", isCorrect: false },
        { id: "d", text: "Argument du hareng saur (diversion)", isCorrect: false },
      ], explanation: "Utiliser une position d'autorité comme seule justification, sans raison substantielle, est un argument d'autorité." },
    ] as Question[],
    results: {
      expert: { emoji: "🧠", title: "Expert(e) en pensée critique", desc: "Vous avez d'excellentes capacités de raisonnement logique. Vous analysez facilement des arguments complexes et identifiez clairement les biais cognitifs. Partagez cette compétence avec votre entourage." },
      proficient: { emoji: "🔍", title: "Analyste compétent(e)", desc: "Vous avez de solides compétences en pensée critique. Vous reconnaissez la plupart des sophismes logiques mais en manquez parfois quelques-uns. Une pratique continue vous fera progresser encore davantage." },
      developing: { emoji: "📚", title: "Penseur(se) en développement", desc: "Vous comprenez les concepts logiques de base mais avez besoin d'un entraînement plus approfondi. Lire sur les sophismes logiques et les biais cognitifs affinera nettement votre réflexion." },
      beginner: { emoji: "🌱", title: "Débutant(e) en pensée critique", desc: "Vous commencez tout juste votre parcours en pensée critique. Apprendre les sophismes logiques et les biais cognitifs améliorera considérablement votre jugement au quotidien. Continuez à apprendre !" },
    },
    retake: "Recommencer", resultLabel: "Votre niveau de pensée critique",
    correct: "Correct !", wrong: "Incorrect",
  },
  es: {
    title: "Test de pensamiento crítico: ¿cuál es tu nivel de lógica?",
    description: "Mide tu capacidad de pensamiento crítico con 10 preguntas de lógica.",
    questions: [
      { id: "q1", text: "Premisa 1: Todos los gatos son mamíferos.\nPremisa 2: Todos los mamíferos son vertebrados.\n¿Qué conclusión debe ser verdadera?", options: [
        { id: "a", text: "Todos los vertebrados son gatos.", isCorrect: false },
        { id: "b", text: "Todos los gatos son vertebrados.", isCorrect: true },
        { id: "c", text: "Algunos vertebrados son gatos.", isCorrect: false },
        { id: "d", text: "Algunos gatos no son vertebrados.", isCorrect: false },
      ], explanation: "Silogismo: gatos ⊂ mamíferos ⊂ vertebrados, por lo tanto todos los gatos deben ser vertebrados." },
      { id: "q2", text: "«Todos los estudiantes de nuestra escuela son adictos a los smartphones, porque la mayoría de los que conozco están siempre en el teléfono durante los recreos.» ¿Qué falacia lógica es esta?", options: [
        { id: "a", text: "Falacia del blanco o negro", isCorrect: false },
        { id: "b", text: "Falacia ad hominem", isCorrect: false },
        { id: "c", text: "Falacia de generalización apresurada", isCorrect: true },
        { id: "d", text: "Falacia del tu quoque", isCorrect: false },
      ], explanation: "Sacar una conclusión sobre todos los estudiantes a partir de una observación limitada es una generalización apresurada." },
      { id: "q3", text: "«Un estudio reciente muestra que beber café reduce el riesgo de enfermedad cardíaca en un 50%.» ¿Cuál es la pregunta más importante para evaluar críticamente esta afirmación?", options: [
        { id: "a", text: "¿Quién financió el estudio?", isCorrect: false },
        { id: "b", text: "¿Cuántas personas participaron y quiénes eran?", isCorrect: true },
        { id: "c", text: "¿Se publicó en una revista revisada por pares?", isCorrect: false },
        { id: "d", text: "¿Los investigadores beben café ellos mismos?", isCorrect: false },
      ], explanation: "El tamaño de la muestra y su representatividad son clave para evaluar la afirmación de una «reducción del 50%»." },
      { id: "q4", text: "Después de comprar un coche rojo nuevo, de repente notas muchos coches rojos en la carretera. ¿De qué sesgo cognitivo es un ejemplo esto?", options: [
        { id: "a", text: "Sesgo de confirmación", isCorrect: false },
        { id: "b", text: "Ilusión de frecuencia (fenómeno Baader-Meinhof)", isCorrect: true },
        { id: "c", text: "Sesgo de anclaje", isCorrect: false },
        { id: "d", text: "Sesgo retrospectivo", isCorrect: false },
      ], explanation: "Algo que acabas de notar de repente parece aparecer en todas partes: es la ilusión de frecuencia." },
      { id: "q5", text: "«¿Cómo puede ser real el calentamiento global si el invierno pasado tuvimos temperaturas récord de frío?» ¿Qué falacia contiene esta afirmación?", options: [
        { id: "a", text: "Apelación a la autoridad", isCorrect: false },
        { id: "b", text: "Hombre de paja", isCorrect: false },
        { id: "c", text: "Falacia de evidencia anecdótica", isCorrect: true },
        { id: "d", text: "Apelación a la emoción", isCorrect: false },
      ], explanation: "Usar un solo evento climático puntual para cuestionar una tendencia climática global a largo plazo es evidencia anecdótica." },
      { id: "q6", text: "Si todos los A son B, y algunos B son C, ¿cuál de las siguientes afirmaciones debe ser verdadera?", options: [
        { id: "a", text: "Todos los A son C", isCorrect: false },
        { id: "b", text: "Algunos A son C", isCorrect: false },
        { id: "c", text: "Ningún A es C", isCorrect: false },
        { id: "d", text: "Ninguna de las anteriores se puede determinar con certeza", isCorrect: true },
      ], explanation: "Sin información adicional, la relación entre A y C no se puede determinar con certeza." },
      { id: "q7", text: "Una empresa afirma que su pastilla para adelgazar produce una «pérdida de peso significativa». ¿Qué información es más importante para evaluar esto?", options: [
        { id: "a", text: "Cuántas celebridades respaldan el producto", isCorrect: false },
        { id: "b", text: "La cantidad específica de pérdida de peso comparada con un grupo placebo", isCorrect: true },
        { id: "c", text: "Cuánto tiempo lleva la empresa en el mercado", isCorrect: false },
        { id: "d", text: "El precio comparado con la competencia", isCorrect: false },
      ], explanation: "Solo la comparación con un grupo de control puede determinar si la pérdida de peso es real." },
      { id: "q8", text: "Mantienes una acción que está perdiendo valor porque «ya he invertido tanto que no puedo rendirme ahora». ¿Qué sesgo cognitivo es este?", options: [
        { id: "a", text: "Falacia del costo hundido", isCorrect: true },
        { id: "b", text: "Falacia del jugador", isCorrect: false },
        { id: "c", text: "Sesgo de optimismo", isCorrect: false },
        { id: "d", text: "Efecto Dunning-Kruger", isCorrect: false },
      ], explanation: "Tomar decisiones basadas en inversiones pasadas irrecuperables en lugar de una evaluación racional futura es la falacia del costo hundido." },
      { id: "q9", text: "«Mi oponente quiere más financiamiento para el transporte público. Hitler también construyó autopistas en la Alemania nazi. ¿De verdad quieres apoyar ideas tan peligrosas?» ¿Qué falacia es esta?", options: [
        { id: "a", text: "Falacia ad hominem", isCorrect: false },
        { id: "b", text: "Falsa equivalencia", isCorrect: false },
        { id: "c", text: "Culpa por asociación", isCorrect: true },
        { id: "d", text: "Pendiente resbaladiza", isCorrect: false },
      ], explanation: "Rechazar una idea asociándola con una figura negativa sin abordar sus méritos es culpa por asociación." },
      { id: "q10", text: "Un padre le dice a su hijo(a): «Debes estudiar medicina en la universidad porque yo lo digo.» ¿Qué falacia demuestra esto?", options: [
        { id: "a", text: "Apelación a la autoridad", isCorrect: true },
        { id: "b", text: "Razonamiento circular", isCorrect: false },
        { id: "c", text: "Falso dilema", isCorrect: false },
        { id: "d", text: "Falacia del arenque rojo (distracción)", isCorrect: false },
      ], explanation: "Usar la posición de autoridad como única justificación, sin razones sustanciales, es una apelación a la autoridad." },
    ] as Question[],
    results: {
      expert: { emoji: "🧠", title: "Experto(a) en pensamiento crítico", desc: "Tienes capacidades de razonamiento lógico excepcionales. Analizas con facilidad argumentos complejos e identificas claramente los sesgos cognitivos. Comparte esta habilidad con quienes te rodean." },
      proficient: { emoji: "🔍", title: "Analista competente", desc: "Tienes sólidas habilidades de pensamiento crítico. Reconoces la mayoría de las falacias lógicas, aunque ocasionalmente se te escapa alguna. La práctica continua te llevará aún más lejos." },
      developing: { emoji: "📚", title: "Pensador(a) en desarrollo", desc: "Entiendes los conceptos lógicos básicos, pero necesitas un entrenamiento más profundo. Leer sobre falacias lógicas y sesgos cognitivos afinará notablemente tu forma de pensar." },
      beginner: { emoji: "🌱", title: "Principiante en pensamiento crítico", desc: "Acabas de comenzar tu camino en el pensamiento crítico. Aprender sobre falacias lógicas y sesgos cognitivos mejorará enormemente tu criterio diario. ¡Sigue aprendiendo!" },
    },
    retake: "Repetir", resultLabel: "Tu nivel de pensamiento crítico",
    correct: "¡Correcto!", wrong: "Incorrecto",
  },
};

type SupportedLocale = keyof typeof data;
const SUPPORTED_LOCALES: SupportedLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const SCORE_LABEL: Record<SupportedLocale, string> = {
  ko: "정답률", en: "Score", ja: "正答率", zh: "正确率", fr: "Score", es: "Puntuación",
};
const RESULTS_LABEL: Record<SupportedLocale, string> = {
  ko: "결과 보기", en: "See Results", ja: "結果を見る", zh: "查看结果", fr: "Voir les résultats", es: "Ver resultados",
};

export default function CritiQuestTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "criti-quest", title: "CritiQuestTest", finished: phase === "result" });

  const correctCount = t.questions.filter((q) => {
    const correct = q.options.find((o) => o.isCorrect);
    return correct && answers[q.id] === correct.id;
  }).length;

  const isComplete = Object.keys(answers).length === t.questions.length;
  const pct = isComplete ? correctCount / t.questions.length : 0;

  const level: ScoreLevel =
    pct >= 0.9 ? "expert" :
    pct >= 0.7 ? "proficient" :
    pct >= 0.5 ? "developing" :
    "beginner";

  if (phase === "result") {
    const r = t.results[level];
    return (
      <div className="not-prose my-10 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{SCORE_LABEL[lang]}</span>
            <span className="font-bold text-rose-600">{correctCount} / {t.questions.length}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full">
            <div className="h-3 bg-rose-500 rounded-full transition-all" style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
        </div>
        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
          <p className="text-slate-700 text-base leading-relaxed">{r.desc}</p>
        </div>
        <button onClick={() => { setAnswers({}); setRevealed({}); setPhase("quiz"); }} className="text-slate-400 text-sm hover:underline">{t.retake}</button>
        <ShareResultButton locale={lang} heading={t.title} resultTitle={r.title} emoji={r.emoji} />
      </div>
    );
  }

  return (
    <div className="not-prose my-10 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-black text-slate-900">{t.title}</h3>
        <p className="text-sm text-slate-500 mt-2">{t.description}</p>
        <div className="mt-3 h-2 bg-slate-100 rounded-full">
          <div className="h-2 bg-rose-500 rounded-full transition-all" style={{ width: `${(Object.keys(answers).length / t.questions.length) * 100}%` }} />
        </div>
      </div>
      <div className="space-y-8">
        {t.questions.map((q, i) => {
          const selected = answers[q.id];
          const isRevealed = revealed[q.id];
          return (
            <div key={q.id} className="space-y-3">
              <p className="font-semibold text-slate-800 leading-snug whitespace-pre-line">{i + 1}. {q.text}</p>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt) => {
                  let cls = "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
                  if (selected === opt.id) {
                    cls = isRevealed
                      ? opt.isCorrect
                        ? "bg-green-500 border-green-500 text-white font-bold"
                        : "bg-red-500 border-red-500 text-white font-bold"
                      : "bg-rose-500 border-rose-500 text-white font-bold shadow-md";
                  } else if (isRevealed && opt.isCorrect) {
                    cls = "bg-green-100 border-green-400 text-green-800";
                  }
                  return (
                    <button
                      key={opt.id}
                      disabled={isRevealed}
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                        setRevealed((prev) => ({ ...prev, [q.id]: true }));
                      }}
                      className={`py-3 px-4 text-sm rounded-xl border transition-all text-left ${cls}`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {isRevealed && (
                <div className="text-xs p-3 bg-slate-100 rounded-lg text-slate-600">
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center pt-4">
        <button
          disabled={!isComplete}
          onClick={() => setPhase("result")}
          className={`px-10 py-3 rounded-2xl font-bold text-base transition-all ${isComplete ? "bg-rose-500 text-white hover:bg-rose-600 shadow-lg" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
        >
          {RESULTS_LABEL[lang]}
        </button>
      </div>
    </div>
  );
}
