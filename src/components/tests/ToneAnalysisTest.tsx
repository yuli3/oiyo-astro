'use client';
import ShareResultButton from '../shared/ShareResultButton'
import { QuestionnaireMatrix } from '@/components/ui/questionnaire-matrix'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";

interface Props { locale?: string; }

type ToneType = "sharp" | "avoidant" | "friendly" | "neutral";

const data = {
  ko: {
    title: "말투 분석 테스트: 나의 커뮤니케이션 유형은?",
    description: "10가지 직장 내 시나리오로 나의 말투 유형을 진단해보세요.",
    questions: [
      {
        id: "q1",
        text: "동료가 회의 자료를 잘못 준비했다. 당신은 어떻게 말하는가?",
        options: [
          { text: "이게 왜 이렇게 됐어요? 다시 제대로 해주세요.", type: "sharp" as ToneType },
          { text: "음... 혹시 가능하다면 조금 수정해 주실 수 있을까요?", type: "avoidant" as ToneType },
          { text: "수고했어요! 여기 몇 가지 수정하면 더 좋아질 것 같아요.", type: "friendly" as ToneType },
          { text: "이 부분과 저 부분이 기준과 다르네요. 이렇게 수정해 주세요.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q2",
        text: "회의 중 상사가 비현실적인 마감을 요구한다. 당신은?",
        options: [
          { text: "그건 불가능합니다. 일정을 다시 논의해야 합니다.", type: "sharp" as ToneType },
          { text: "네, 최대한 해볼게요... (사실 걱정이 되지만 말 못함)", type: "avoidant" as ToneType },
          { text: "열심히 해볼게요! 혹시 우선순위를 같이 봐주실 수 있나요?", type: "friendly" as ToneType },
          { text: "현재 리소스 기준으로는 3일이 더 필요합니다. 조율이 가능할까요?", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q3",
        text: "동료가 자꾸 내 업무에 개입한다. 당신은?",
        options: [
          { text: "이건 제 담당이에요. 관여하지 마세요.", type: "sharp" as ToneType },
          { text: "아, 네... 그래도 제가 할 수 있어요... 아마도요.", type: "avoidant" as ToneType },
          { text: "감사해요! 지금은 혼자 해볼게요. 필요하면 연락할게요.", type: "friendly" as ToneType },
          { text: "현재 제가 담당하고 있으니, 이슈가 생기면 알려주세요.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q4",
        text: "팀원의 아이디어가 실현 불가능하다고 생각된다. 당신은?",
        options: [
          { text: "그건 안 돼요. 현실적으로 생각해봐요.", type: "sharp" as ToneType },
          { text: "아, 좋은 것 같은데요... 제 생각엔 좀 어려울 수도 있을 것 같아서요...", type: "avoidant" as ToneType },
          { text: "아이디어 좋은데요! 기술적인 부분에서 도전이 있을 것 같아요. 같이 해결책 찾아봐요!", type: "friendly" as ToneType },
          { text: "이 접근 방식에는 구현 상 제약이 있습니다. 대안을 검토해 봅시다.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q5",
        text: "클라이언트가 계약 범위 밖의 작업을 요청한다. 당신은?",
        options: [
          { text: "그건 계약 범위 밖입니다. 추가 비용이 발생합니다.", type: "sharp" as ToneType },
          { text: "네, 음... 일단 해보긴 할게요... 근데 좀 어렵긴 한데요...", type: "avoidant" as ToneType },
          { text: "요청 감사해요! 현재 범위 밖이지만, 어떻게 도울 수 있는지 방법 찾아볼게요.", type: "friendly" as ToneType },
          { text: "현재 계약 범위와 다릅니다. 추가 범위에 대한 견적을 드릴 수 있습니다.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q6",
        text: "회의가 계속 주제를 벗어나고 있다. 당신은?",
        options: [
          { text: "잠깐, 지금 우리가 왜 이 얘기를 하는 거죠?", type: "sharp" as ToneType },
          { text: "아... 저도 좀 헷갈리긴 하는데, 뭐 괜찮아요...", type: "avoidant" as ToneType },
          { text: "잠깐만요! 원래 주제로 돌아가면 어떨까요? 다들 바쁘시니까요.", type: "friendly" as ToneType },
          { text: "현재 안건에서 벗어난 것 같습니다. 원래 주제로 복귀하는 것을 제안합니다.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q7",
        text: "내 실수로 프로젝트에 문제가 생겼다. 당신은?",
        options: [
          { text: "제 실수입니다. 바로 수정하겠습니다. 원인은 나중에 분석하죠.", type: "sharp" as ToneType },
          { text: "죄송합니다, 정말 죄송해요... 제가 너무 모자란 것 같아요...", type: "avoidant" as ToneType },
          { text: "제가 실수했어요, 정말 미안합니다! 지금 바로 고치고 앞으로 더 조심할게요.", type: "friendly" as ToneType },
          { text: "제 실수로 발생한 문제입니다. 원인을 파악하고 즉시 수정하겠습니다.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q8",
        text: "동료가 내 작업에 대해 비판적인 피드백을 준다. 당신은?",
        options: [
          { text: "그 피드백은 제 접근 방식과 다릅니다. 근거를 설명해주세요.", type: "sharp" as ToneType },
          { text: "아, 네... 그렇군요... 제가 잘못한 건지도 모르겠어요...", type: "avoidant" as ToneType },
          { text: "피드백 감사해요! 더 자세히 설명해 줄 수 있어요? 같이 개선해봐요.", type: "friendly" as ToneType },
          { text: "피드백 감사합니다. 구체적으로 어떤 부분이 문제인지 알 수 있을까요?", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q9",
        text: "팀원이 약속한 기한을 또 지키지 못했다. 당신은?",
        options: [
          { text: "이번이 세 번째예요. 왜 계속 기한을 못 지키는 건가요?", type: "sharp" as ToneType },
          { text: "아, 괜찮아요... 바빠서 그랬겠죠... 제가 좀 기다릴게요...", type: "avoidant" as ToneType },
          { text: "많이 바빴지? 다음엔 어렵겠다 싶으면 미리 알려줘. 같이 조율해보자.", type: "friendly" as ToneType },
          { text: "기한이 세 번 연속 지켜지지 않았습니다. 원인과 대책을 논의합시다.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q10",
        text: "중요한 결정에서 내 의견이 무시당했다고 느낀다. 당신은?",
        options: [
          { text: "제 의견을 왜 반영하지 않은 건가요? 설명해주세요.", type: "sharp" as ToneType },
          { text: "뭐, 다들 그렇게 결정했다면... 제 의견이 맞는지도 모르겠고요...", type: "avoidant" as ToneType },
          { text: "제 생각도 공유하고 싶었는데, 다음 회의 때 한 번 이야기해도 될까요?", type: "friendly" as ToneType },
          { text: "제 분석 결과를 공유하지 못했습니다. 재검토할 기회를 요청합니다.", type: "neutral" as ToneType },
        ],
      },
    ],
    results: {
      sharp: { emoji: "⚡", title: "날카로운 직설형", desc: "당신은 생각을 직접적으로 표현하며 효율을 중시합니다. 빠른 결단과 명확한 의사소통이 강점이지만, 상대방이 날카롭게 느낄 수 있습니다. 메시지 전달 전 상대방의 감정을 한 번 더 고려해 보세요." },
      avoidant: { emoji: "🌿", title: "회피형 완충형", desc: "당신은 갈등을 피하고 상대방의 기분을 우선시하는 성향입니다. 배려심이 깊지만, 정작 중요한 메시지가 전달되지 못할 수 있습니다. 조금 더 자신의 의견을 명확히 표현하는 연습을 해보세요." },
      friendly: { emoji: "🌸", title: "친화적 관계형", desc: "당신은 따뜻하고 긍정적인 방식으로 소통합니다. 관계를 중시하고 상대방을 배려하면서도 의견을 전달하는 균형 잡힌 스타일입니다. 이 강점을 잘 살려 팀의 분위기 메이커가 되어보세요." },
      neutral: { emoji: "📊", title: "중립적 분석형", desc: "당신은 논리적이고 사실에 기반한 소통을 선호합니다. 명확하고 체계적인 메시지 전달이 강점이지만, 때로는 감정적인 연결이 부족하게 느껴질 수 있습니다. 데이터와 공감을 함께 활용해 보세요." },
    },
    retake: "다시하기", resultLabel: "나의 말투 유형",
  },
  en: {
    title: "Tone Analysis Test: What's Your Communication Style?",
    description: "Diagnose your communication tone type through 10 workplace scenarios.",
    questions: [
      {
        id: "q1",
        text: "A colleague prepared meeting materials incorrectly. What do you say?",
        options: [
          { text: "Why is this like this? Please redo it properly.", type: "sharp" as ToneType },
          { text: "Um... if possible, could you maybe make some changes?", type: "avoidant" as ToneType },
          { text: "Good effort! I think tweaking a few things here will make it even better.", type: "friendly" as ToneType },
          { text: "These sections don't match the standard. Please update them like this.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q2",
        text: "Your manager demands an unrealistic deadline in a meeting. What do you do?",
        options: [
          { text: "That's impossible. We need to renegotiate the timeline.", type: "sharp" as ToneType },
          { text: "Sure, I'll try my best... (though I'm worried but can't say so)", type: "avoidant" as ToneType },
          { text: "I'll do my best! Could we review priorities together?", type: "friendly" as ToneType },
          { text: "Based on current resources, we need 3 more days. Can we adjust?", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q3",
        text: "A colleague keeps interfering with your work. What do you say?",
        options: [
          { text: "This is my responsibility. Please don't interfere.", type: "sharp" as ToneType },
          { text: "Oh, it's okay... I can handle it... I think...", type: "avoidant" as ToneType },
          { text: "Thanks! I'll handle this for now. I'll reach out if I need help.", type: "friendly" as ToneType },
          { text: "I'm currently in charge of this. Please let me know if any issues arise.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q4",
        text: "You think a team member's idea is unrealistic. What do you say?",
        options: [
          { text: "That won't work. Let's think realistically.", type: "sharp" as ToneType },
          { text: "Oh, it sounds good... I just think it might be a bit difficult...", type: "avoidant" as ToneType },
          { text: "Great idea! There might be some technical challenges. Let's find solutions together!", type: "friendly" as ToneType },
          { text: "This approach has implementation constraints. Let's evaluate alternatives.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q5",
        text: "A client requests work outside the contract scope. What do you say?",
        options: [
          { text: "That's outside the contract scope. Additional costs will apply.", type: "sharp" as ToneType },
          { text: "Okay, um... I'll try... though it's a bit difficult...", type: "avoidant" as ToneType },
          { text: "Thanks for the request! It's outside our current scope, but let me find a way to help.", type: "friendly" as ToneType },
          { text: "This differs from the current contract scope. I can provide a quote for additional work.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q6",
        text: "The meeting keeps going off-topic. What do you do?",
        options: [
          { text: "Hold on — why are we talking about this?", type: "sharp" as ToneType },
          { text: "Oh... I'm a bit confused too, but it's okay...", type: "avoidant" as ToneType },
          { text: "Quick pause! How about we get back to the main topic? Everyone's busy.", type: "friendly" as ToneType },
          { text: "We seem to have drifted from the agenda. I suggest we return to the original topic.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q7",
        text: "Your mistake caused a problem in the project. What do you say?",
        options: [
          { text: "That was my mistake. I'll fix it immediately. Let's analyze the cause later.", type: "sharp" as ToneType },
          { text: "I'm so sorry... I think I'm just not good enough...", type: "avoidant" as ToneType },
          { text: "I made a mistake — I'm really sorry! I'll fix it right now and be more careful going forward.", type: "friendly" as ToneType },
          { text: "This issue was caused by my error. I'll identify the cause and correct it immediately.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q8",
        text: "A colleague gives you critical feedback about your work. What do you say?",
        options: [
          { text: "That feedback differs from my approach. Please explain your reasoning.", type: "sharp" as ToneType },
          { text: "Oh, I see... Maybe I was wrong... I'm not sure...", type: "avoidant" as ToneType },
          { text: "Thanks for the feedback! Can you explain more? Let's improve it together.", type: "friendly" as ToneType },
          { text: "Thank you for the feedback. Could you specify which parts are problematic?", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q9",
        text: "A team member misses a deadline again. What do you say?",
        options: [
          { text: "This is the third time. Why do you keep missing deadlines?", type: "sharp" as ToneType },
          { text: "Oh, it's fine... You must have been busy... I'll just wait longer...", type: "avoidant" as ToneType },
          { text: "Were you really swamped? Next time, let me know in advance if it's tight — we'll work it out.", type: "friendly" as ToneType },
          { text: "This is the third consecutive missed deadline. Let's discuss the cause and a plan.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q10",
        text: "You feel your opinion was ignored in an important decision. What do you do?",
        options: [
          { text: "Why wasn't my opinion reflected? Please explain.", type: "sharp" as ToneType },
          { text: "Well, if everyone decided that way... I'm not even sure I'm right...", type: "avoidant" as ToneType },
          { text: "I wanted to share my thoughts too — could I bring it up at the next meeting?", type: "friendly" as ToneType },
          { text: "I wasn't able to share my analysis. I'd like to request an opportunity to revisit this.", type: "neutral" as ToneType },
        ],
      },
    ],
    results: {
      sharp: { emoji: "⚡", title: "Sharp & Direct", desc: "You express thoughts directly and value efficiency. Quick decisions and clear communication are your strengths, but others may find you cutting. Consider the recipient's emotional state before delivering a message." },
      avoidant: { emoji: "🌿", title: "Avoidant & Buffered", desc: "You prioritize avoiding conflict and keeping others comfortable. Your consideration runs deep, but critical messages may not get through. Practice expressing your views more clearly." },
      friendly: { emoji: "🌸", title: "Friendly & Relational", desc: "You communicate in a warm, positive way. You strike a balanced style — valuing relationships and caring for others while still getting your message across. Use this strength to be the team's atmosphere maker." },
      neutral: { emoji: "📊", title: "Neutral & Analytical", desc: "You prefer logical, fact-based communication. Clear and systematic messaging is your strength, but sometimes the emotional connection can feel lacking. Try pairing data with empathy." },
    },
    retake: "Retake", resultLabel: "Your Communication Tone",
  },
  ja: {
    title: "話し方分析テスト：あなたのコミュニケーションスタイルは？",
    description: "10の職場シナリオであなたの話し方タイプを診断しましょう。",
    questions: [
      {
        id: "q1",
        text: "同僚が会議資料を間違って準備した。あなたはどう言いますか？",
        options: [
          { text: "これ、なんでこうなったんですか？ちゃんとやり直してください。", type: "sharp" as ToneType },
          { text: "うーん…もし可能なら、少し直していただけますか？", type: "avoidant" as ToneType },
          { text: "お疲れ様です！ここを少し直せば、もっと良くなると思います。", type: "friendly" as ToneType },
          { text: "この部分とあの部分が基準と違いますね。こう修正してください。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q2",
        text: "会議中に上司が非現実的な締め切りを要求してくる。あなたは？",
        options: [
          { text: "それは不可能です。スケジュールを再検討する必要があります。", type: "sharp" as ToneType },
          { text: "はい、できる限りやってみます…（本当は心配だけど言えない）", type: "avoidant" as ToneType },
          { text: "頑張ってみます！優先順位を一緒に見ていただけますか？", type: "friendly" as ToneType },
          { text: "現在のリソースでは、あと3日必要です。調整は可能でしょうか？", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q3",
        text: "同僚が自分の業務にたびたび口を出してくる。あなたは？",
        options: [
          { text: "これは私の担当です。関与しないでください。", type: "sharp" as ToneType },
          { text: "あ、はい…でも私にもできます…たぶん…", type: "avoidant" as ToneType },
          { text: "ありがとうございます！今は自分でやってみます。必要があれば連絡します。", type: "friendly" as ToneType },
          { text: "現在私が担当していますので、問題があればお知らせください。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q4",
        text: "チームメンバーのアイデアが実現不可能だと思う。あなたは？",
        options: [
          { text: "それは無理です。現実的に考えましょう。", type: "sharp" as ToneType },
          { text: "あ、良さそうですね…でも私の考えでは少し難しいかもしれないような…", type: "avoidant" as ToneType },
          { text: "いいアイデアですね！技術的な課題がありそうです。一緒に解決策を探しましょう！", type: "friendly" as ToneType },
          { text: "このアプローチには実装上の制約があります。代替案を検討しましょう。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q5",
        text: "クライアントが契約範囲外の作業を依頼してくる。あなたは？",
        options: [
          { text: "それは契約範囲外です。追加費用が発生します。", type: "sharp" as ToneType },
          { text: "はい、うーん…とりあえずやってみますが…少し難しいですが…", type: "avoidant" as ToneType },
          { text: "ご依頼ありがとうございます！現在範囲外ですが、どうお手伝いできるか方法を探してみます。", type: "friendly" as ToneType },
          { text: "現在の契約範囲とは異なります。追加範囲についてお見積もりを提示できます。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q6",
        text: "会議がずっと話題からそれている。あなたは？",
        options: [
          { text: "ちょっと待ってください、今なぜこの話をしているんですか？", type: "sharp" as ToneType },
          { text: "あ…私も少し混乱していますが、まあいいです…", type: "avoidant" as ToneType },
          { text: "ちょっと待ってください！元の話題に戻りませんか？皆さんお忙しいので。", type: "friendly" as ToneType },
          { text: "現在の議題からそれているようです。元の話題に戻ることを提案します。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q7",
        text: "自分のミスでプロジェクトに問題が生じた。あなたは？",
        options: [
          { text: "私のミスです。すぐに修正します。原因は後で分析しましょう。", type: "sharp" as ToneType },
          { text: "すみません、本当にすみません…私が至らないせいだと思います…", type: "avoidant" as ToneType },
          { text: "私のミスです、本当にすみません！今すぐ直して、今後はもっと気をつけます。", type: "friendly" as ToneType },
          { text: "私のミスにより発生した問題です。原因を把握し、すぐに修正します。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q8",
        text: "同僚が自分の作業に対して批判的なフィードバックをくれる。あなたは？",
        options: [
          { text: "そのフィードバックは私のアプローチとは異なります。根拠を説明してください。", type: "sharp" as ToneType },
          { text: "あ、はい…そうですね…私が間違っているのかもしれません…", type: "avoidant" as ToneType },
          { text: "フィードバックありがとうございます！もう少し詳しく説明してもらえますか？一緒に改善しましょう。", type: "friendly" as ToneType },
          { text: "フィードバックありがとうございます。具体的にどの部分が問題か教えていただけますか？", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q9",
        text: "チームメンバーが約束した期限をまた守れなかった。あなたは？",
        options: [
          { text: "これで三回目です。なぜ期限を守れないのですか？", type: "sharp" as ToneType },
          { text: "あ、大丈夫です…忙しかったんでしょうね…もう少し待ちます…", type: "avoidant" as ToneType },
          { text: "すごく忙しかったんですね？次回、難しそうなら事前に教えてください。一緒に調整しましょう。", type: "friendly" as ToneType },
          { text: "期限が三回連続で守られていません。原因と対策について話し合いましょう。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q10",
        text: "重要な決定で自分の意見が無視されたと感じる。あなたは？",
        options: [
          { text: "なぜ私の意見が反映されなかったのですか？説明してください。", type: "sharp" as ToneType },
          { text: "まあ、皆がそう決めたなら…私の意見が正しいかもわかりませんし…", type: "avoidant" as ToneType },
          { text: "私の考えも共有したかったのですが、次の会議で一度話してもいいですか？", type: "friendly" as ToneType },
          { text: "私の分析結果を共有できませんでした。再検討の機会をお願いします。", type: "neutral" as ToneType },
        ],
      },
    ],
    results: {
      sharp: { emoji: "⚡", title: "鋭い直言型", desc: "あなたは考えを直接的に表現し、効率を重視します。素早い決断と明確なコミュニケーションが強みですが、相手には鋭く感じられることがあります。メッセージを伝える前に、相手の感情をもう一度考慮してみましょう。" },
      avoidant: { emoji: "🌿", title: "回避型・緩衝型", desc: "あなたは対立を避け、相手の気持ちを優先する傾向があります。思いやりが深い一方で、肝心なメッセージが伝わらないことがあります。もう少し自分の意見をはっきりと表現する練習をしてみましょう。" },
      friendly: { emoji: "🌸", title: "親和的関係型", desc: "あなたは温かく前向きな方法でコミュニケーションを取ります。関係を大切にしながらも意見をしっかり伝える、バランスの取れたスタイルです。この強みを生かして、チームのムードメーカーになりましょう。" },
      neutral: { emoji: "📊", title: "中立的分析型", desc: "あなたは論理的で事実に基づいたコミュニケーションを好みます。明確で体系的なメッセージ伝達が強みですが、時には感情的なつながりが不足していると感じられることがあります。データと共感を一緒に活用してみましょう。" },
    },
    retake: "もう一度", resultLabel: "あなたの話し方タイプ",
  },
  zh: {
    title: "语气分析测试：你的沟通风格是什么？",
    description: "通过10个职场情境，诊断你的沟通语气类型。",
    questions: [
      {
        id: "q1",
        text: "同事把会议资料准备错了。你会怎么说？",
        options: [
          { text: "这怎么会这样？请重新做好。", type: "sharp" as ToneType },
          { text: "嗯……如果可以的话，能麻烦你稍微修改一下吗？", type: "avoidant" as ToneType },
          { text: "辛苦了！这里稍微改一下应该会更好。", type: "friendly" as ToneType },
          { text: "这部分和那部分与标准不符，请按这样修改。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q2",
        text: "会议中上司要求一个不切实际的截止日期。你会？",
        options: [
          { text: "那不可能，我们需要重新商定时间表。", type: "sharp" as ToneType },
          { text: "好的，我尽量……（其实很担心，但说不出口）", type: "avoidant" as ToneType },
          { text: "我会努力的！能不能一起看看优先级？", type: "friendly" as ToneType },
          { text: "以目前的资源来看，还需要3天。可以商量调整吗？", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q3",
        text: "同事总是插手你的工作。你会说？",
        options: [
          { text: "这是我负责的，请不要插手。", type: "sharp" as ToneType },
          { text: "啊，好的……不过我也能做……大概吧……", type: "avoidant" as ToneType },
          { text: "谢谢！我先自己试试，需要的话会联系你。", type: "friendly" as ToneType },
          { text: "目前由我负责，如有问题请告诉我。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q4",
        text: "你觉得团队成员的想法不切实际。你会说？",
        options: [
          { text: "那行不通，我们现实一点吧。", type: "sharp" as ToneType },
          { text: "啊，听起来不错……我只是觉得可能会有点难……", type: "avoidant" as ToneType },
          { text: "好点子！可能会有一些技术上的挑战，我们一起想办法吧！", type: "friendly" as ToneType },
          { text: "这个方案在实现上存在限制，我们评估一下替代方案吧。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q5",
        text: "客户要求合同范围之外的工作。你会说？",
        options: [
          { text: "那超出了合同范围，会产生额外费用。", type: "sharp" as ToneType },
          { text: "好的，嗯……我先试试看……不过确实有点难……", type: "avoidant" as ToneType },
          { text: "谢谢你的请求！目前超出了范围，但我会想办法帮忙。", type: "friendly" as ToneType },
          { text: "这与目前的合同范围不同，我可以为额外的工作提供报价。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q6",
        text: "会议一直偏离主题。你会？",
        options: [
          { text: "等等，我们现在为什么在说这个？", type: "sharp" as ToneType },
          { text: "啊……我也有点搞不清楚，不过没关系……", type: "avoidant" as ToneType },
          { text: "稍等一下！我们要不要回到原来的话题？大家都挺忙的。", type: "friendly" as ToneType },
          { text: "似乎偏离了当前议程，建议我们回到原来的话题。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q7",
        text: "你的失误导致项目出了问题。你会说？",
        options: [
          { text: "是我的错，我会立即修正，原因以后再分析。", type: "sharp" as ToneType },
          { text: "对不起，真的很抱歉……我觉得是我能力不够……", type: "avoidant" as ToneType },
          { text: "是我的错，真的很抱歉！我现在马上改，以后会更加小心。", type: "friendly" as ToneType },
          { text: "这个问题是我的失误造成的，我会查明原因并立即修正。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q8",
        text: "同事对你的工作给出了批评性反馈。你会说？",
        options: [
          { text: "这个反馈和我的做法不同，请解释一下依据。", type: "sharp" as ToneType },
          { text: "啊，好吧……原来如此……也许是我做错了……", type: "avoidant" as ToneType },
          { text: "谢谢你的反馈！能再详细说说吗？我们一起改进吧。", type: "friendly" as ToneType },
          { text: "谢谢反馈，能具体说明是哪部分有问题吗？", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q9",
        text: "团队成员又一次没能遵守约定的截止日期。你会说？",
        options: [
          { text: "这已经是第三次了，为什么一直无法按时完成？", type: "sharp" as ToneType },
          { text: "啊，没关系……可能是太忙了吧……我再等等……", type: "avoidant" as ToneType },
          { text: "是不是特别忙？下次如果有困难，提前告诉我，我们一起调整。", type: "friendly" as ToneType },
          { text: "截止日期已连续三次未能遵守，我们来讨论一下原因和对策。", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q10",
        text: "在一个重要决定中，你觉得自己的意见被忽视了。你会？",
        options: [
          { text: "为什么没有采纳我的意见？请解释一下。", type: "sharp" as ToneType },
          { text: "唉，既然大家都这么决定了……也不知道我的想法对不对……", type: "avoidant" as ToneType },
          { text: "我也想分享一下我的想法，可以在下次会议上提一下吗？", type: "friendly" as ToneType },
          { text: "我没能分享我的分析结果，希望能有机会重新讨论。", type: "neutral" as ToneType },
        ],
      },
    ],
    results: {
      sharp: { emoji: "⚡", title: "犀利直率型", desc: "你直接表达想法，重视效率。快速决断和清晰沟通是你的优势，但对方可能会觉得你有些尖锐。在传达信息前，不妨再考虑一下对方的感受。" },
      avoidant: { emoji: "🌿", title: "回避缓冲型", desc: "你倾向于避免冲突，优先照顾对方的情绪。你体贴周到，但关键信息可能无法有效传达。可以多练习更清晰地表达自己的意见。" },
      friendly: { emoji: "🌸", title: "亲和关系型", desc: "你以温暖积极的方式沟通。你重视关系，同时也能兼顾表达意见，是一种平衡的风格。发挥这个优势，成为团队的氛围调节者吧。" },
      neutral: { emoji: "📊", title: "中立分析型", desc: "你偏好逻辑清晰、基于事实的沟通。清晰而系统的表达是你的优势，但有时可能让人感觉缺乏情感联结。可以尝试将数据与共情结合起来。" },
    },
    retake: "重新测试", resultLabel: "你的语气类型",
  },
  fr: {
    title: "Test d'analyse du ton : quel est votre style de communication ?",
    description: "Diagnostiquez votre style de ton de communication à travers 10 scénarios professionnels.",
    questions: [
      {
        id: "q1",
        text: "Un(e) collègue a mal préparé les documents de la réunion. Que dites-vous ?",
        options: [
          { text: "Pourquoi c'est comme ça ? Veuillez le refaire correctement.", type: "sharp" as ToneType },
          { text: "Euh… si possible, pourriez-vous apporter quelques modifications ?", type: "avoidant" as ToneType },
          { text: "Bon travail ! Je pense qu'en ajustant quelques points ici, ce sera encore mieux.", type: "friendly" as ToneType },
          { text: "Ces sections ne correspondent pas au standard. Veuillez les mettre à jour ainsi.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q2",
        text: "Votre manager exige un délai irréaliste en réunion. Que faites-vous ?",
        options: [
          { text: "C'est impossible. Nous devons renégocier le calendrier.", type: "sharp" as ToneType },
          { text: "Bien sûr, je vais faire de mon mieux... (bien que je sois inquiet(ète) mais je ne peux pas le dire)", type: "avoidant" as ToneType },
          { text: "Je vais faire de mon mieux ! Pourrions-nous revoir les priorités ensemble ?", type: "friendly" as ToneType },
          { text: "Avec les ressources actuelles, il nous faut 3 jours de plus. Peut-on ajuster ?", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q3",
        text: "Un(e) collègue interfère constamment avec votre travail. Que dites-vous ?",
        options: [
          { text: "C'est ma responsabilité. Merci de ne pas intervenir.", type: "sharp" as ToneType },
          { text: "Oh, c'est bon... Je peux m'en occuper... je crois...", type: "avoidant" as ToneType },
          { text: "Merci ! Je vais m'en occuper pour l'instant. Je vous contacterai si besoin.", type: "friendly" as ToneType },
          { text: "J'en suis actuellement responsable. Faites-moi savoir si un problème survient.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q4",
        text: "Vous pensez que l'idée d'un membre de l'équipe n'est pas réaliste. Que dites-vous ?",
        options: [
          { text: "Ça ne marchera pas. Soyons réalistes.", type: "sharp" as ToneType },
          { text: "Oh, ça semble bien... je pense juste que ça pourrait être un peu difficile...", type: "avoidant" as ToneType },
          { text: "Excellente idée ! Il pourrait y avoir des défis techniques. Trouvons des solutions ensemble !", type: "friendly" as ToneType },
          { text: "Cette approche présente des contraintes de mise en œuvre. Évaluons des alternatives.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q5",
        text: "Un(e) client(e) demande un travail hors du périmètre du contrat. Que dites-vous ?",
        options: [
          { text: "C'est hors du périmètre du contrat. Des coûts supplémentaires s'appliqueront.", type: "sharp" as ToneType },
          { text: "D'accord, euh... je vais essayer... même si c'est un peu difficile...", type: "avoidant" as ToneType },
          { text: "Merci pour votre demande ! C'est hors de notre périmètre actuel, mais je vais trouver un moyen d'aider.", type: "friendly" as ToneType },
          { text: "Cela diffère du périmètre contractuel actuel. Je peux vous fournir un devis pour le travail supplémentaire.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q6",
        text: "La réunion s'écarte sans cesse du sujet. Que faites-vous ?",
        options: [
          { text: "Attendez — pourquoi parlons-nous de ça maintenant ?", type: "sharp" as ToneType },
          { text: "Oh... je suis aussi un peu perdu(e), mais ce n'est pas grave...", type: "avoidant" as ToneType },
          { text: "Petite pause ! Et si on revenait au sujet principal ? Tout le monde est occupé.", type: "friendly" as ToneType },
          { text: "Nous semblons nous être écartés de l'ordre du jour. Je propose de revenir au sujet initial.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q7",
        text: "Votre erreur a causé un problème dans le projet. Que dites-vous ?",
        options: [
          { text: "C'était mon erreur. Je vais la corriger immédiatement. Analysons la cause plus tard.", type: "sharp" as ToneType },
          { text: "Je suis tellement désolé(e)... je pense que je ne suis tout simplement pas assez compétent(e)...", type: "avoidant" as ToneType },
          { text: "J'ai fait une erreur — je suis vraiment désolé(e) ! Je vais la corriger tout de suite et faire plus attention à l'avenir.", type: "friendly" as ToneType },
          { text: "Ce problème a été causé par mon erreur. J'identifierai la cause et la corrigerai immédiatement.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q8",
        text: "Un(e) collègue vous donne un retour critique sur votre travail. Que dites-vous ?",
        options: [
          { text: "Ce retour diffère de mon approche. Merci d'expliquer votre raisonnement.", type: "sharp" as ToneType },
          { text: "Oh, je vois... j'avais peut-être tort... je ne suis pas sûr(e)...", type: "avoidant" as ToneType },
          { text: "Merci pour ce retour ! Pouvez-vous m'en dire plus ? Améliorons cela ensemble.", type: "friendly" as ToneType },
          { text: "Merci pour votre retour. Pourriez-vous préciser quelles parties posent problème ?", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q9",
        text: "Un membre de l'équipe manque à nouveau une échéance. Que dites-vous ?",
        options: [
          { text: "C'est la troisième fois. Pourquoi manquez-vous sans cesse les délais ?", type: "sharp" as ToneType },
          { text: "Oh, ce n'est rien... vous avez dû être occupé(e)... je vais encore attendre...", type: "avoidant" as ToneType },
          { text: "Vous étiez vraiment débordé(e) ? La prochaine fois, prévenez-moi à l'avance si c'est serré — on s'arrangera.", type: "friendly" as ToneType },
          { text: "C'est le troisième délai manqué consécutif. Discutons de la cause et d'un plan.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q10",
        text: "Vous sentez que votre avis a été ignoré dans une décision importante. Que faites-vous ?",
        options: [
          { text: "Pourquoi mon avis n'a-t-il pas été pris en compte ? Merci d'expliquer.", type: "sharp" as ToneType },
          { text: "Eh bien, si tout le monde en a décidé ainsi... je ne suis même pas sûr(e) d'avoir raison...", type: "avoidant" as ToneType },
          { text: "Je voulais aussi partager mes réflexions — pourrais-je en parler à la prochaine réunion ?", type: "friendly" as ToneType },
          { text: "Je n'ai pas pu partager mon analyse. J'aimerais demander une occasion de revenir sur ce sujet.", type: "neutral" as ToneType },
        ],
      },
    ],
    results: {
      sharp: { emoji: "⚡", title: "Direct(e) et tranchant(e)", desc: "Vous exprimez vos pensées directement et valorisez l'efficacité. Des décisions rapides et une communication claire sont vos points forts, mais les autres peuvent vous trouver abrupt(e). Pensez à considérer l'état émotionnel du destinataire avant de délivrer un message." },
      avoidant: { emoji: "🌿", title: "Évitant(e) et tempéré(e)", desc: "Vous privilégiez l'évitement des conflits et le confort d'autrui. Votre attention aux autres est profonde, mais des messages essentiels peuvent ne pas passer. Entraînez-vous à exprimer vos opinions plus clairement." },
      friendly: { emoji: "🌸", title: "Chaleureux(se) et relationnel(le)", desc: "Vous communiquez d'une manière chaleureuse et positive. Vous adoptez un style équilibré — valorisant les relations et prenant soin des autres tout en faisant passer votre message. Utilisez cette force pour devenir l'animateur(rice) de l'ambiance de l'équipe." },
      neutral: { emoji: "📊", title: "Neutre et analytique", desc: "Vous préférez une communication logique et fondée sur des faits. Un message clair et structuré est votre force, mais la connexion émotionnelle peut parfois sembler manquante. Essayez d'allier données et empathie." },
    },
    retake: "Recommencer", resultLabel: "Votre style de communication",
  },
  es: {
    title: "Test de análisis de tono: ¿cuál es tu estilo de comunicación?",
    description: "Diagnostica tu tipo de tono de comunicación a través de 10 escenarios laborales.",
    questions: [
      {
        id: "q1",
        text: "Un(a) colega preparó mal los materiales de la reunión. ¿Qué dices?",
        options: [
          { text: "¿Por qué está así? Por favor, hazlo bien de nuevo.", type: "sharp" as ToneType },
          { text: "Mmm... si es posible, ¿podrías hacer algunos cambios?", type: "avoidant" as ToneType },
          { text: "¡Buen trabajo! Creo que ajustando algunas cosas aquí quedará aún mejor.", type: "friendly" as ToneType },
          { text: "Estas secciones no coinciden con el estándar. Por favor, actualízalas así.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q2",
        text: "Tu jefe(a) exige un plazo poco realista en una reunión. ¿Qué haces?",
        options: [
          { text: "Eso es imposible. Necesitamos renegociar el cronograma.", type: "sharp" as ToneType },
          { text: "Claro, haré lo posible... (aunque estoy preocupado(a) pero no puedo decirlo)", type: "avoidant" as ToneType },
          { text: "¡Haré lo mejor que pueda! ¿Podríamos revisar las prioridades juntos?", type: "friendly" as ToneType },
          { text: "Con los recursos actuales, necesitamos 3 días más. ¿Podemos ajustarlo?", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q3",
        text: "Un(a) colega sigue interfiriendo en tu trabajo. ¿Qué dices?",
        options: [
          { text: "Esto es responsabilidad mía. Por favor, no interfieras.", type: "sharp" as ToneType },
          { text: "Ah, está bien... yo puedo manejarlo... creo...", type: "avoidant" as ToneType },
          { text: "¡Gracias! Lo manejaré yo por ahora. Te avisaré si necesito ayuda.", type: "friendly" as ToneType },
          { text: "Actualmente estoy a cargo de esto. Avísame si surge algún problema.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q4",
        text: "Crees que la idea de un(a) compañero(a) de equipo no es realista. ¿Qué dices?",
        options: [
          { text: "Eso no va a funcionar. Seamos realistas.", type: "sharp" as ToneType },
          { text: "Ah, suena bien... solo creo que podría ser un poco difícil...", type: "avoidant" as ToneType },
          { text: "¡Buena idea! Podría haber algunos desafíos técnicos. ¡Busquemos soluciones juntos!", type: "friendly" as ToneType },
          { text: "Este enfoque tiene limitaciones de implementación. Evaluemos alternativas.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q5",
        text: "Un(a) cliente pide trabajo fuera del alcance del contrato. ¿Qué dices?",
        options: [
          { text: "Eso está fuera del alcance del contrato. Se aplicarán costos adicionales.", type: "sharp" as ToneType },
          { text: "Bien, mmm... lo intentaré... aunque es un poco difícil...", type: "avoidant" as ToneType },
          { text: "¡Gracias por la solicitud! Está fuera de nuestro alcance actual, pero buscaré la forma de ayudar.", type: "friendly" as ToneType },
          { text: "Esto difiere del alcance actual del contrato. Puedo proporcionarte una cotización por el trabajo adicional.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q6",
        text: "La reunión sigue desviándose del tema. ¿Qué haces?",
        options: [
          { text: "Un momento, ¿por qué estamos hablando de esto ahora?", type: "sharp" as ToneType },
          { text: "Ah... yo también estoy un poco confundido(a), pero está bien...", type: "avoidant" as ToneType },
          { text: "¡Un momento! ¿Qué tal si volvemos al tema principal? Todos estamos ocupados.", type: "friendly" as ToneType },
          { text: "Parece que nos hemos desviado de la agenda. Sugiero volver al tema original.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q7",
        text: "Tu error causó un problema en el proyecto. ¿Qué dices?",
        options: [
          { text: "Fue mi error. Lo corregiré de inmediato. Analicemos la causa después.", type: "sharp" as ToneType },
          { text: "Lo siento mucho... creo que simplemente no soy lo suficientemente bueno(a)...", type: "avoidant" as ToneType },
          { text: "Cometí un error, ¡lo siento mucho! Lo corregiré ahora mismo y tendré más cuidado en el futuro.", type: "friendly" as ToneType },
          { text: "Este problema fue causado por mi error. Identificaré la causa y lo corregiré de inmediato.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q8",
        text: "Un(a) colega te da comentarios críticos sobre tu trabajo. ¿Qué dices?",
        options: [
          { text: "Ese comentario difiere de mi enfoque. Por favor, explica tu razonamiento.", type: "sharp" as ToneType },
          { text: "Ah, ya veo... tal vez estaba equivocado(a)... no estoy seguro(a)...", type: "avoidant" as ToneType },
          { text: "¡Gracias por el comentario! ¿Puedes explicarlo más? Mejorémoslo juntos.", type: "friendly" as ToneType },
          { text: "Gracias por el comentario. ¿Podrías especificar qué partes son problemáticas?", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q9",
        text: "Un(a) compañero(a) de equipo vuelve a incumplir un plazo. ¿Qué dices?",
        options: [
          { text: "Esta es la tercera vez. ¿Por qué sigues sin cumplir los plazos?", type: "sharp" as ToneType },
          { text: "Ah, está bien... debiste estar ocupado(a)... esperaré un poco más...", type: "avoidant" as ToneType },
          { text: "¿Estabas muy ocupado(a)? La próxima vez, avísame con antelación si es complicado, lo resolveremos juntos.", type: "friendly" as ToneType },
          { text: "Este es el tercer plazo consecutivo incumplido. Hablemos de la causa y un plan.", type: "neutral" as ToneType },
        ],
      },
      {
        id: "q10",
        text: "Sientes que tu opinión fue ignorada en una decisión importante. ¿Qué haces?",
        options: [
          { text: "¿Por qué no se tuvo en cuenta mi opinión? Por favor, explícamelo.", type: "sharp" as ToneType },
          { text: "Bueno, si todos decidieron eso... ni siquiera estoy seguro(a) de tener razón...", type: "avoidant" as ToneType },
          { text: "También quería compartir mis ideas... ¿podría mencionarlo en la próxima reunión?", type: "friendly" as ToneType },
          { text: "No pude compartir mi análisis. Me gustaría solicitar la oportunidad de revisarlo.", type: "neutral" as ToneType },
        ],
      },
    ],
    results: {
      sharp: { emoji: "⚡", title: "Directo(a) y contundente", desc: "Expresas tus pensamientos de forma directa y valoras la eficiencia. Las decisiones rápidas y la comunicación clara son tus fortalezas, pero otros pueden percibirte como cortante. Considera el estado emocional del destinatario antes de transmitir un mensaje." },
      avoidant: { emoji: "🌿", title: "Evitativo(a) y amortiguado(a)", desc: "Priorizas evitar el conflicto y que los demás se sientan cómodos. Tu consideración es profunda, pero los mensajes importantes pueden no llegar a comunicarse. Practica expresar tus opiniones con más claridad." },
      friendly: { emoji: "🌸", title: "Cercano(a) y relacional", desc: "Te comunicas de forma cálida y positiva. Tienes un estilo equilibrado: valoras las relaciones y cuidas de los demás mientras logras transmitir tu mensaje. Aprovecha esta fortaleza para ser quien anima el ambiente del equipo." },
      neutral: { emoji: "📊", title: "Neutral y analítico(a)", desc: "Prefieres una comunicación lógica y basada en hechos. Un mensaje claro y sistemático es tu fortaleza, pero a veces puede sentirse falto de conexión emocional. Intenta combinar los datos con la empatía." },
    },
    retake: "Repetir", resultLabel: "Tu tono de comunicación",
  },
};

type SupportedLocale = keyof typeof data;
const SUPPORTED_LOCALES: SupportedLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const UI_LABELS: Record<SupportedLocale, {
  completed: (completed: number, total: number) => string;
  unanswered: (count: number) => string;
  submit: string;
  validation: string;
}> = {
  ko: { completed: (c, t) => `응답 ${c}/${t}`, unanswered: (c) => `미응답 ${c}`, submit: "결과 보기", validation: "모든 문항에 응답해 주세요." },
  en: { completed: (c, t) => `Answered ${c}/${t}`, unanswered: (c) => `Unanswered ${c}`, submit: "See Results", validation: "Please answer every question." },
  ja: { completed: (c, t) => `回答 ${c}/${t}`, unanswered: (c) => `未回答 ${c}`, submit: "結果を見る", validation: "すべての質問に答えてください。" },
  zh: { completed: (c, t) => `已回答 ${c}/${t}`, unanswered: (c) => `未回答 ${c}`, submit: "查看结果", validation: "请回答所有问题。" },
  fr: { completed: (c, t) => `Répondu ${c}/${t}`, unanswered: (c) => `${c} sans réponse`, submit: "Voir les résultats", validation: "Veuillez répondre à toutes les questions." },
  es: { completed: (c, t) => `Respondido ${c}/${t}`, unanswered: (c) => `${c} sin responder`, submit: "Ver resultados", validation: "Por favor, responde todas las preguntas." },
};

export default function ToneAnalysisTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "tone-analysis", title: "ToneAnalysisTest", finished: phase === "result" });

  const types: ToneType[] = ["sharp", "avoidant", "friendly", "neutral"];
  const scores = Object.fromEntries(types.map((s) => [s, 0])) as Record<ToneType, number>;
  Object.values(answers).forEach((typeIndex) => { scores[types[typeIndex]] += 1; });
  const topType = (Object.entries(scores) as [ToneType, number][]).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  if (phase === "result") {
    const r = t.results[topType];
    return (
      <div className="not-prose my-10 p-8 bg-card border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
          <p className="text-slate-700 text-base leading-relaxed">{r.desc}</p>
        </div>
        <button onClick={() => { setAnswers({}); setPhase("quiz"); }} className="text-slate-400 text-sm hover:underline">{t.retake}</button>
        <ShareResultButton locale={lang} heading={t.title} resultTitle={r.title} emoji={r.emoji} />
      </div>
    );
  }

  return (
    <QuestionnaireMatrix
      title={t.title}
      description={t.description}
      questions={t.questions.map((question) => ({
        id: question.id,
        text: question.text,
        columns: 1,
        options: question.options.map((option, value) => ({ label: option.text, value })),
      }))}
      answers={answers}
      completedLabel={ui.completed}
      unansweredLabel={ui.unanswered}
      submitLabel={ui.submit}
      validationLabel={ui.validation}
      onAnswer={(questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }))}
      onSubmit={() => setPhase("result")}
    />
  );
}
