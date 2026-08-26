'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { QuestionnaireMatrix } from "@/components/ui/questionnaire-matrix";

interface Props { locale?: string; }

type RiskLevel = "low" | "moderate" | "high" | "critical";

const data = {
  ko: {
    title: "협업 리스크 테스트: 나는 어떤 팀원인가?",
    description: "12개의 질문으로 나의 협업 리스크 패턴을 파악하세요.",
    questions: [
      { id: "q1", text: "동료에게 비판적 피드백을 받을 때 나는?", options: [
        { text: "열린 마음으로 듣고 명확히 하는 질문을 한다", score: 0 },
        { text: "그들의 관점을 인정하고 고려한다", score: 1 },
        { text: "약간 방어적이지만 나중에 처리한다", score: 2 },
        { text: "방어적이 되어 왜 틀렸는지 설명한다", score: 3 },
        { text: "무시하거나 내 일을 이해 못 한다고 생각한다", score: 4 },
      ] },
      { id: "q2", text: "비판적인 댓글을 칭찬보다 오래 기억하는 이유는?", options: [
        { text: "체계적으로 성과를 향상시키기 위해 활용한다", score: 0 },
        { text: "개인적 성찰에 가치 있다고 생각해서", score: 1 },
        { text: "정확성에 대해 약간 불확실해서", score: 2 },
        { text: "신경이 쓰이기 때문에", score: 3 },
        { text: "내 능력에 의문을 품고 집착한다", score: 4 },
      ] },
      { id: "q3", text: "회의에서 동료가 내 아이디어에 공개적으로 반대할 때?", options: [
        { text: "그들의 견해를 존중하고 공개적으로 논의한다", score: 0 },
        { text: "건설적으로 참여하고 의견을 환영한다", score: 1 },
        { text: "더 명확히 설명하려 노력한다", score: 2 },
        { text: "불편하지만 계속 나아가려 한다", score: 3 },
        { text: "좌절감, 당혹감, 혹은 위협감을 느낀다", score: 4 },
      ] },
      { id: "q4", text: "부정적인 피드백을 받으면 나는?", options: [
        { text: "즉시 개선을 위해 행동한다", score: 0 },
        { text: "성찰하고 개선 계획을 세운다", score: 1 },
        { text: "개인적으로 내 관점을 공유한다", score: 2 },
        { text: "걱정을 확인하려 동료들에게 언급한다", score: 3 },
        { text: "여러 사람과 공유하고 원한을 품는다", score: 4 },
      ] },
      { id: "q5", text: "프로젝트나 작업이 잘못되었을 때 나는?", options: [
        { text: "완전한 책임을 지고 해결에 집중한다", score: 0 },
        { text: "내 역할을 인정하고 개선점을 생각한다", score: 1 },
        { text: "맥락과 상황을 설명한다", score: 2 },
        { text: "외부 요인이나 다른 사람을 부분적으로 탓한다", score: 3 },
        { text: "주로 다른 사람이나 외부 환경을 탓한다", score: 4 },
      ] },
      { id: "q6", text: "마감이나 결과물을 약속했을 때 나는?", options: [
        { text: "일관되게 일찍 또는 제때 완수한다", score: 0 },
        { text: "보통 품질 좋게 마감을 맞춘다", score: 1 },
        { text: "가끔 약간의 차이로 마감을 놓친다", score: 2 },
        { text: "자주 연장을 협상한다", score: 3 },
        { text: "과도하게 약속하고 일관되게 날짜를 놓친다", score: 4 },
      ] },
      { id: "q7", text: "누군가 프로젝트에 도움을 요청하면 나는?", options: [
        { text: "내 능력 내에서 열정적으로 돕는다", score: 0 },
        { text: "가능한 한 많이 돕는다", score: 1 },
        { text: "역할에서 기대된다면 돕는다", score: 2 },
        { text: "내 일에 집중하면서 마지못해 돕는다", score: 3 },
        { text: "그들이 보답하거나 빚지면 돕는다", score: 4 },
      ] },
      { id: "q8", text: "팀원이 나에게 자주 요청을 과부하시키면 나는?", options: [
        { text: "내 역량을 명확히 소통하고 협상한다", score: 0 },
        { text: "가용성에 대한 경계를 부드럽게 설정한다", score: 1 },
        { text: "수용하려 하지만 부담을 느낀다", score: 2 },
        { text: "조용히 원망하지만 계속 동의한다", score: 3 },
        { text: "수동적 공격적이 되거나 그들을 피한다", score: 4 },
      ] },
      { id: "q9", text: "매니저가 동의하지 않는 결정을 내릴 때 나는?", options: [
        { text: "전문적으로 지지하고 실행한다", score: 0 },
        { text: "관점을 제공하면서 공손히 실행한다", score: 1 },
        { text: "준수하지만 내심 의심한다", score: 2 },
        { text: "자주 동료들에게 우려를 표현한다", score: 3 },
        { text: "결정을 약화시키거나 우회한다", score: 4 },
      ] },
      { id: "q10", text: "매니저의 주된 동기가 무엇이라고 생각하나요?", options: [
        { text: "나와 팀이 성공하도록 돕는 것", score: 0 },
        { text: "팀의 목표와 복지를 지원하는 것", score: 1 },
        { text: "비즈니스와 팀 필요 사이의 균형", score: 2 },
        { text: "주로 자신의 커리어를 발전시키는 것", score: 3 },
        { text: "팀을 통제하거나 세세하게 관리하는 것", score: 4 },
      ] },
      { id: "q11", text: "매니저의 피드백에 대해 나는 어떻게 생각하나요?", options: [
        { text: "공정하고, 정확하고, 건설적이다", score: 0 },
        { text: "대체로 공정하지만 가끔 편향이 있다", score: 1 },
        { text: "때로 편향되거나 일관성이 없다", score: 2 },
        { text: "종종 불공평하거나 편애에 기반한다", score: 3 },
        { text: "매우 편향되어 실제 성과를 반영하지 않는다", score: 4 },
      ] },
      { id: "q12", text: "매니저는 조직 변화와 결정에 대해 투명한가요?", options: [
        { text: "매우 투명하고 이유를 설명한다", score: 0 },
        { text: "적절한 범위 내에서 대체로 투명하다", score: 1 },
        { text: "어느 정도 투명하지만 세부사항을 숨긴다", score: 2 },
        { text: "드물게 투명하여 추측하게 만든다", score: 3 },
        { text: "변화를 다른 사람을 통해 먼저 듣는다", score: 4 },
      ] },
    ],
    results: {
      low: { emoji: "🌿", title: "저위험 협업자", desc: "피드백을 건설적으로 처리하고, 책임감 있게 헌신하며, 리더십을 신뢰합니다. 탁월한 팀원입니다. 이 강점을 계속 유지하세요." },
      moderate: { emoji: "⚡", title: "보통 수준의 협업 위험", desc: "일부 협업 패턴이 팀 역학에 마찰을 일으킬 수 있습니다. 피드백 수용, 책임감, 또는 리더십 신뢰를 개선하면 더 효과적인 팀원이 될 수 있습니다." },
      high: { emoji: "🔶", title: "높은 협업 위험", desc: "여러 협업 영역에서 리스크가 있습니다. 이러한 패턴은 팀 성과에 영향을 줄 수 있습니다. 자기 인식을 높이고 구체적인 개선 계획을 세워보세요." },
      critical: { emoji: "🔴", title: "심각한 협업 위험", desc: "현재 패턴이 효과적인 협업을 크게 방해하고 있습니다. 전문 코칭이나 직장 상담을 받아보는 것을 강력히 권장합니다." },
    },
    retake: "다시하기", resultLabel: "나의 협업 위험 수준",
  },
  en: {
    title: "Collab Risk Test: What Kind of Teammate Are You?",
    description: "Identify your collaboration risk patterns with 12 questions.",
    questions: [
      { id: "q1", text: "When receiving critical feedback from a colleague, I tend to:", options: [
        { text: "Listen openly and ask clarifying questions", score: 0 },
        { text: "Acknowledge their perspective and consider it", score: 1 },
        { text: "Feel slightly defensive but process it later", score: 2 },
        { text: "Become defensive and explain why they're wrong", score: 3 },
        { text: "Dismiss it or assume they don't understand my work", score: 4 },
      ] },
      { id: "q2", text: "I tend to remember critical comments longer than praise because:", options: [
        { text: "I use them to improve my performance systematically", score: 0 },
        { text: "I find them valuable for personal reflection", score: 1 },
        { text: "I'm somewhat uncertain about their accuracy", score: 2 },
        { text: "They're bothering to think about", score: 3 },
        { text: "I dwell on them and question my competence", score: 4 },
      ] },
      { id: "q3", text: "When a peer publicly disagrees with my idea in a meeting, I:", options: [
        { text: "Respect their view and discuss it openly", score: 0 },
        { text: "Engage constructively and welcome their input", score: 1 },
        { text: "Explain my reasoning more carefully to clarify", score: 2 },
        { text: "Feel uncomfortable but try to move forward", score: 3 },
        { text: "Feel frustrated, embarrassed, or undermined", score: 4 },
      ] },
      { id: "q4", text: "If I receive negative feedback, I'm likely to:", options: [
        { text: "Act on it immediately to improve", score: 0 },
        { text: "Reflect and make an improvement plan", score: 1 },
        { text: "Share my perspective with the person privately", score: 2 },
        { text: "Mention it to colleagues to validate my concerns", score: 3 },
        { text: "Share it with multiple people and hold resentment", score: 4 },
      ] },
      { id: "q5", text: "When a project or task goes wrong, I:", options: [
        { text: "Take full ownership and focus on solutions", score: 0 },
        { text: "Acknowledge my role and what I could improve", score: 1 },
        { text: "Explain the context and circumstances", score: 2 },
        { text: "Partly blame external factors or others involved", score: 3 },
        { text: "Blame others or external circumstances primarily", score: 4 },
      ] },
      { id: "q6", text: "When I commit to a deadline or deliverable, I:", options: [
        { text: "Consistently deliver early or on time", score: 0 },
        { text: "Typically meet the deadline with quality work", score: 1 },
        { text: "Sometimes miss deadlines by small margins", score: 2 },
        { text: "Frequently negotiate extensions", score: 3 },
        { text: "Over-commit and consistently miss dates", score: 4 },
      ] },
      { id: "q7", text: "When someone asks for help on their project, I:", options: [
        { text: "Enthusiastically help within my capacity", score: 0 },
        { text: "Help as much as reasonably possible", score: 1 },
        { text: "Help if it's expected of my role", score: 2 },
        { text: "Reluctantly help while focusing on my work", score: 3 },
        { text: "Help only if they reciprocate or owe me a favor", score: 4 },
      ] },
      { id: "q8", text: "If a team member frequently overloads me with requests, I:", options: [
        { text: "Clearly communicate my capacity and negotiate", score: 0 },
        { text: "Gently set boundaries about my availability", score: 1 },
        { text: "Try to accommodate but feel stretched", score: 2 },
        { text: "Resent it silently but keep agreeing", score: 3 },
        { text: "Become passive-aggressive or avoid them", score: 4 },
      ] },
      { id: "q9", text: "When my manager makes a decision I disagree with, I:", options: [
        { text: "Support and execute it professionally", score: 0 },
        { text: "Execute it respectfully while offering perspective", score: 1 },
        { text: "Comply but privately doubt the decision", score: 2 },
        { text: "Frequently express concerns to colleagues", score: 3 },
        { text: "Undermine the decision or work around it", score: 4 },
      ] },
      { id: "q10", text: "I believe my manager's main motivation is to:", options: [
        { text: "Help me and the team succeed", score: 0 },
        { text: "Support the team's goals and wellbeing", score: 1 },
        { text: "Maintain balance between business and team needs", score: 2 },
        { text: "Advance their own career primarily", score: 3 },
        { text: "Control or micromanage the team", score: 4 },
      ] },
      { id: "q11", text: "Regarding feedback from my manager, I believe:", options: [
        { text: "It's fair, accurate, and constructive", score: 0 },
        { text: "It's mostly fair with occasional bias", score: 1 },
        { text: "It's sometimes biased or inconsistent", score: 2 },
        { text: "It's often unfair or based on favoritism", score: 3 },
        { text: "It's highly biased and doesn't reflect my actual performance", score: 4 },
      ] },
      { id: "q12", text: "My manager is transparent about organizational changes and decisions:", options: [
        { text: "Very transparent and explains the reasoning", score: 0 },
        { text: "Mostly transparent, within appropriate bounds", score: 1 },
        { text: "Somewhat transparent but withholds details", score: 2 },
        { text: "Rarely transparent, leaving me guessing", score: 3 },
        { text: "Not transparent; I learn changes from others first", score: 4 },
      ] },
    ],
    results: {
      low: { emoji: "🌿", title: "Low-Risk Collaborator", desc: "You handle feedback constructively, follow through on commitments, and trust leadership. You're an excellent teammate. Keep up these strengths." },
      moderate: { emoji: "⚡", title: "Moderate Collaboration Risk", desc: "Some collaboration patterns may create friction in team dynamics. Improving your feedback receptivity, accountability, or leadership trust will make you an even more effective team member." },
      high: { emoji: "🔶", title: "High Collaboration Risk", desc: "There are risks in multiple collaboration areas. These patterns may impact team performance. Increase self-awareness and create a concrete improvement plan." },
      critical: { emoji: "🔴", title: "Critical Collaboration Risk", desc: "Current patterns are significantly hindering effective collaboration. Professional coaching or workplace counseling is strongly recommended." },
    },
    retake: "Retake", resultLabel: "Your Collaboration Risk Level",
  },
  ja: {
    title: "コラボレーションリスクテスト：あなたはどんなチームメイトですか？",
    description: "12の質問であなたの協業リスクパターンを把握しましょう。",
    questions: [
      { id: "q1", text: "同僚から批判的なフィードバックを受けたとき、私は？", options: [
        { text: "オープンな心で聞き、明確にする質問をする", score: 0 },
        { text: "相手の視点を認め、考慮する", score: 1 },
        { text: "少し防御的になるが、後で処理する", score: 2 },
        { text: "防御的になり、なぜ間違っているか説明する", score: 3 },
        { text: "無視するか、自分の仕事を理解していないと思う", score: 4 },
      ] },
      { id: "q2", text: "褒め言葉より批判的なコメントを長く覚えている理由は？", options: [
        { text: "体系的にパフォーマンス向上に活用するから", score: 0 },
        { text: "個人的な内省に価値があると感じるから", score: 1 },
        { text: "正確性について少し不確かだから", score: 2 },
        { text: "気になってしまうから", score: 3 },
        { text: "自分の能力に疑問を抱き、こだわってしまうから", score: 4 },
      ] },
      { id: "q3", text: "会議で同僚が自分のアイデアに公然と反対したとき、私は？", options: [
        { text: "相手の見解を尊重し、オープンに議論する", score: 0 },
        { text: "建設的に関わり、意見を歓迎する", score: 1 },
        { text: "より明確に説明しようと努める", score: 2 },
        { text: "不快だが、前に進もうとする", score: 3 },
        { text: "挫折感、恥ずかしさ、あるいは脅威を感じる", score: 4 },
      ] },
      { id: "q4", text: "否定的なフィードバックを受けたら、私は？", options: [
        { text: "すぐに改善のために行動する", score: 0 },
        { text: "内省し、改善計画を立てる", score: 1 },
        { text: "個人的に自分の視点を共有する", score: 2 },
        { text: "懸念を確認するために同僚に話す", score: 3 },
        { text: "複数の人と共有し、恨みを抱く", score: 4 },
      ] },
      { id: "q5", text: "プロジェクトや業務がうまくいかなかったとき、私は？", options: [
        { text: "完全に責任を負い、解決に集中する", score: 0 },
        { text: "自分の役割を認め、改善点を考える", score: 1 },
        { text: "背景や状況を説明する", score: 2 },
        { text: "外部要因や他人を部分的に責める", score: 3 },
        { text: "主に他人や外部環境を責める", score: 4 },
      ] },
      { id: "q6", text: "締め切りや成果物を約束したとき、私は？", options: [
        { text: "一貫して早め、または期限通りに完了させる", score: 0 },
        { text: "通常、質の良い成果で締め切りを守る", score: 1 },
        { text: "時々わずかな差で締め切りを逃す", score: 2 },
        { text: "頻繁に延長を交渉する", score: 3 },
        { text: "過度に約束し、一貫して期限を逃す", score: 4 },
      ] },
      { id: "q7", text: "誰かがプロジェクトの手伝いを頼んできたら、私は？", options: [
        { text: "自分の能力の範囲内で熱心に手伝う", score: 0 },
        { text: "できる限り手伝う", score: 1 },
        { text: "役割上期待されるなら手伝う", score: 2 },
        { text: "自分の仕事に集中しながら渋々手伝う", score: 3 },
        { text: "相手が見返りをくれるか借りを作るなら手伝う", score: 4 },
      ] },
      { id: "q8", text: "チームメンバーが頻繁に依頼で私を過負荷にすると、私は？", options: [
        { text: "自分のキャパシティを明確に伝え、交渉する", score: 0 },
        { text: "稼働可能な範囲について穏やかに境界線を引く", score: 1 },
        { text: "対応しようとするが、無理を感じる", score: 2 },
        { text: "静かに恨みつつも同意し続ける", score: 3 },
        { text: "受動攻撃的になるか、相手を避ける", score: 4 },
      ] },
      { id: "q9", text: "マネージャーが自分が同意できない決定を下したとき、私は？", options: [
        { text: "プロフェッショナルに支持し、実行する", score: 0 },
        { text: "自分の見解を伝えつつ、礼儀正しく実行する", score: 1 },
        { text: "従うが、内心では疑っている", score: 2 },
        { text: "頻繁に同僚に懸念を表明する", score: 3 },
        { text: "決定を弱体化させるか、回避する", score: 4 },
      ] },
      { id: "q10", text: "マネージャーの主な動機は何だと思いますか？", options: [
        { text: "私とチームが成功するのを助けること", score: 0 },
        { text: "チームの目標と幸福を支援すること", score: 1 },
        { text: "ビジネスとチームのニーズのバランスを取ること", score: 2 },
        { text: "主に自分自身のキャリアを伸ばすこと", score: 3 },
        { text: "チームをコントロールまたは細かく管理すること", score: 4 },
      ] },
      { id: "q11", text: "マネージャーからのフィードバックについて、私は？", options: [
        { text: "公正で、正確で、建設的だと思う", score: 0 },
        { text: "概ね公正だが、時々偏りがあると思う", score: 1 },
        { text: "時に偏っていたり一貫性がないと思う", score: 2 },
        { text: "しばしば不公平か、えこひいきに基づいていると思う", score: 3 },
        { text: "非常に偏っており、実際の成果を反映していないと思う", score: 4 },
      ] },
      { id: "q12", text: "マネージャーは組織の変化や決定について透明ですか？", options: [
        { text: "非常に透明で、理由を説明してくれる", score: 0 },
        { text: "適切な範囲内でおおむね透明である", score: 1 },
        { text: "ある程度透明だが、詳細を隠す", score: 2 },
        { text: "めったに透明でなく、推測させられる", score: 3 },
        { text: "変化を他の人からまず聞くことになる", score: 4 },
      ] },
    ],
    results: {
      low: { emoji: "🌿", title: "低リスクの協力者", desc: "あなたはフィードバックを建設的に処理し、責任を持ってコミットメントを果たし、リーダーシップを信頼しています。優れたチームメイトです。この強みを維持し続けましょう。" },
      moderate: { emoji: "⚡", title: "中程度の協業リスク", desc: "一部の協業パターンがチームの力学に摩擦を生む可能性があります。フィードバックの受容、責任感、またはリーダーシップへの信頼を改善すれば、さらに効果的なチームメンバーになれます。" },
      high: { emoji: "🔶", title: "高い協業リスク", desc: "複数の協業領域にリスクがあります。これらのパターンはチームの成果に影響を与える可能性があります。自己認識を高め、具体的な改善計画を立てましょう。" },
      critical: { emoji: "🔴", title: "深刻な協業リスク", desc: "現在のパターンが効果的な協業を大きく妨げています。専門的なコーチングや職場カウンセリングを受けることを強くお勧めします。" },
    },
    retake: "もう一度", resultLabel: "あなたの協業リスクレベル",
  },
  zh: {
    title: "协作风险测试：你是什么样的团队成员？",
    description: "通过12个问题，了解你的协作风险模式。",
    questions: [
      { id: "q1", text: "收到同事的批评性反馈时，我通常会：", options: [
        { text: "敞开心扉倾听并提出澄清性问题", score: 0 },
        { text: "承认并考虑他们的观点", score: 1 },
        { text: "略感防御，但之后会处理", score: 2 },
        { text: "变得有防御性，解释为什么他们错了", score: 3 },
        { text: "忽视，或认为他们不理解我的工作", score: 4 },
      ] },
      { id: "q2", text: "我记住批评性评论比记住表扬更久，是因为：", options: [
        { text: "我会系统地利用它们来提升表现", score: 0 },
        { text: "我认为它们对自我反思很有价值", score: 1 },
        { text: "我对其准确性有些不确定", score: 2 },
        { text: "它们让我很在意", score: 3 },
        { text: "我会反复琢磨，并对自己的能力产生怀疑", score: 4 },
      ] },
      { id: "q3", text: "在会议上，同事公开反对我的想法时，我会：", options: [
        { text: "尊重他们的观点并公开讨论", score: 0 },
        { text: "建设性地参与并欢迎他们的意见", score: 1 },
        { text: "努力更清楚地解释来澄清", score: 2 },
        { text: "感到不舒服，但努力继续推进", score: 3 },
        { text: "感到沮丧、尴尬或被削弱", score: 4 },
      ] },
      { id: "q4", text: "收到负面反馈时，我通常会：", options: [
        { text: "立即采取行动加以改进", score: 0 },
        { text: "进行反思并制定改进计划", score: 1 },
        { text: "私下与对方分享我的看法", score: 2 },
        { text: "向同事提起以确认我的担忧", score: 3 },
        { text: "和多人分享并心怀怨恨", score: 4 },
      ] },
      { id: "q5", text: "当项目或任务出现问题时，我会：", options: [
        { text: "承担全部责任并专注于解决方案", score: 0 },
        { text: "承认自己的角色以及可以改进之处", score: 1 },
        { text: "解释背景和情况", score: 2 },
        { text: "部分归咎于外部因素或其他相关人员", score: 3 },
        { text: "主要归咎于他人或外部环境", score: 4 },
      ] },
      { id: "q6", text: "当我承诺一个截止日期或交付物时，我会：", options: [
        { text: "始终提前或按时交付", score: 0 },
        { text: "通常按时完成，质量良好", score: 1 },
        { text: "有时会小幅错过截止日期", score: 2 },
        { text: "经常协商延期", score: 3 },
        { text: "过度承诺，并经常错过日期", score: 4 },
      ] },
      { id: "q7", text: "当有人请求项目上的帮助时，我会：", options: [
        { text: "在自己能力范围内热情帮助", score: 0 },
        { text: "尽可能多地提供帮助", score: 1 },
        { text: "如果角色上有此期望，就会帮忙", score: 2 },
        { text: "专注于自己的工作，勉强帮忙", score: 3 },
        { text: "只有对方给予回报或欠我人情时才帮忙", score: 4 },
      ] },
      { id: "q8", text: "如果团队成员经常用请求让我不堪重负，我会：", options: [
        { text: "清楚地传达我的承受能力并进行协商", score: 0 },
        { text: "温和地设定关于我可用时间的界限", score: 1 },
        { text: "尽量配合，但感到力不从心", score: 2 },
        { text: "默默心生不满，但仍然继续答应", score: 3 },
        { text: "变得消极对抗，或回避对方", score: 4 },
      ] },
      { id: "q9", text: "当经理做出我不同意的决定时，我会：", options: [
        { text: "以专业的态度支持并执行", score: 0 },
        { text: "提出自己的看法，同时有礼貌地执行", score: 1 },
        { text: "遵从，但内心持怀疑态度", score: 2 },
        { text: "经常向同事表达担忧", score: 3 },
        { text: "削弱该决定或绕过它", score: 4 },
      ] },
      { id: "q10", text: "我认为经理的主要动机是：", options: [
        { text: "帮助我和团队取得成功", score: 0 },
        { text: "支持团队的目标和福祉", score: 1 },
        { text: "在业务和团队需求之间保持平衡", score: 2 },
        { text: "主要是发展他们自己的职业生涯", score: 3 },
        { text: "控制或事无巨细地管理团队", score: 4 },
      ] },
      { id: "q11", text: "关于经理给出的反馈，我认为：", options: [
        { text: "公平、准确且具有建设性", score: 0 },
        { text: "大体公平，偶尔有偏差", score: 1 },
        { text: "有时存在偏见或不一致", score: 2 },
        { text: "经常不公平，或基于偏袒", score: 3 },
        { text: "高度偏颇，不能反映我的实际表现", score: 4 },
      ] },
      { id: "q12", text: "我的经理在组织变革和决策方面是否透明？", options: [
        { text: "非常透明，并解释原因", score: 0 },
        { text: "在适当范围内大体透明", score: 1 },
        { text: "有一定透明度，但会隐瞒细节", score: 2 },
        { text: "很少透明，让我只能猜测", score: 3 },
        { text: "变化总是先从别人那里听说", score: 4 },
      ] },
    ],
    results: {
      low: { emoji: "🌿", title: "低风险协作者", desc: "你能建设性地处理反馈，认真履行承诺，并信任领导层。你是一位出色的团队成员，请继续保持这些优点。" },
      moderate: { emoji: "⚡", title: "中等协作风险", desc: "一些协作模式可能会在团队互动中造成摩擦。提升对反馈的接受度、责任感或对领导层的信任，会让你成为更有效的团队成员。" },
      high: { emoji: "🔶", title: "较高协作风险", desc: "你在多个协作方面存在风险。这些模式可能会影响团队绩效。请提高自我认知，并制定具体的改进计划。" },
      critical: { emoji: "🔴", title: "严重协作风险", desc: "当前的模式正在严重阻碍有效协作。强烈建议寻求专业辅导或职场咨询。" },
    },
    retake: "重新测试", resultLabel: "你的协作风险水平",
  },
  fr: {
    title: "Test de risque collaboratif : quel genre de coéquipier êtes-vous ?",
    description: "Identifiez vos schémas de risque en matière de collaboration à travers 12 questions.",
    questions: [
      { id: "q1", text: "Quand je reçois un retour critique d'un(e) collègue, j'ai tendance à :", options: [
        { text: "Écouter avec ouverture et poser des questions de clarification", score: 0 },
        { text: "Reconnaître son point de vue et le prendre en compte", score: 1 },
        { text: "Me sentir légèrement sur la défensive, mais y réfléchir plus tard", score: 2 },
        { text: "Devenir sur la défensive et expliquer pourquoi il/elle a tort", score: 3 },
        { text: "Ignorer, ou supposer qu'il/elle ne comprend pas mon travail", score: 4 },
      ] },
      { id: "q2", text: "J'ai tendance à me souvenir des commentaires critiques plus longtemps que des compliments parce que :", options: [
        { text: "Je les utilise pour améliorer systématiquement ma performance", score: 0 },
        { text: "Je les trouve utiles pour une réflexion personnelle", score: 1 },
        { text: "Je suis un peu incertain(e) de leur exactitude", score: 2 },
        { text: "Ils me préoccupent", score: 3 },
        { text: "J'y repense sans arrêt et je remets en question ma compétence", score: 4 },
      ] },
      { id: "q3", text: "Quand un(e) collègue s'oppose publiquement à mon idée en réunion, je :", options: [
        { text: "Respecte son point de vue et en discute ouvertement", score: 0 },
        { text: "M'engage de façon constructive et accueille son avis", score: 1 },
        { text: "Explique mon raisonnement plus soigneusement pour clarifier", score: 2 },
        { text: "Me sens mal à l'aise mais essaie d'avancer", score: 3 },
        { text: "Me sens frustré(e), gêné(e) ou déstabilisé(e)", score: 4 },
      ] },
      { id: "q4", text: "Si je reçois un retour négatif, je suis susceptible de :", options: [
        { text: "Agir immédiatement pour m'améliorer", score: 0 },
        { text: "Réfléchir et établir un plan d'amélioration", score: 1 },
        { text: "Partager mon point de vue en privé avec la personne", score: 2 },
        { text: "En parler à des collègues pour valider mes préoccupations", score: 3 },
        { text: "Le partager avec plusieurs personnes et garder du ressentiment", score: 4 },
      ] },
      { id: "q5", text: "Quand un projet ou une tâche tourne mal, je :", options: [
        { text: "Assume l'entière responsabilité et me concentre sur les solutions", score: 0 },
        { text: "Reconnais mon rôle et ce que je pourrais améliorer", score: 1 },
        { text: "Explique le contexte et les circonstances", score: 2 },
        { text: "Blâme partiellement des facteurs externes ou d'autres personnes impliquées", score: 3 },
        { text: "Blâme principalement les autres ou les circonstances externes", score: 4 },
      ] },
      { id: "q6", text: "Quand je m'engage sur une échéance ou un livrable, je :", options: [
        { text: "Livre systématiquement en avance ou à temps", score: 0 },
        { text: "Respecte généralement l'échéance avec un travail de qualité", score: 1 },
        { text: "Manque parfois l'échéance de peu", score: 2 },
        { text: "Négocie fréquemment des prolongations", score: 3 },
        { text: "M'engage trop et manque systématiquement les dates", score: 4 },
      ] },
      { id: "q7", text: "Quand quelqu'un me demande de l'aide sur son projet, je :", options: [
        { text: "Aide avec enthousiasme dans la limite de mes capacités", score: 0 },
        { text: "Aide autant que raisonnablement possible", score: 1 },
        { text: "Aide si c'est attendu de mon rôle", score: 2 },
        { text: "Aide à contrecœur tout en me concentrant sur mon travail", score: 3 },
        { text: "N'aide que si la personne me rend la pareille ou me doit un service", score: 4 },
      ] },
      { id: "q8", text: "Si un membre de l'équipe me surcharge fréquemment de demandes, je :", options: [
        { text: "Communique clairement ma capacité et négocie", score: 0 },
        { text: "Pose doucement des limites concernant ma disponibilité", score: 1 },
        { text: "Essaie de m'adapter mais me sens débordé(e)", score: 2 },
        { text: "En garde silencieusement du ressentiment mais continue d'accepter", score: 3 },
        { text: "Deviens passif(ve)-agressif(ve) ou évite la personne", score: 4 },
      ] },
      { id: "q9", text: "Quand mon manager prend une décision avec laquelle je suis en désaccord, je :", options: [
        { text: "La soutiens et l'exécute professionnellement", score: 0 },
        { text: "L'exécute avec respect tout en donnant mon point de vue", score: 1 },
        { text: "M'y conforme mais en doute en privé", score: 2 },
        { text: "Exprime fréquemment mes préoccupations à des collègues", score: 3 },
        { text: "Sape la décision ou la contourne", score: 4 },
      ] },
      { id: "q10", text: "Je crois que la principale motivation de mon manager est de :", options: [
        { text: "M'aider, moi et l'équipe, à réussir", score: 0 },
        { text: "Soutenir les objectifs et le bien-être de l'équipe", score: 1 },
        { text: "Maintenir un équilibre entre les besoins de l'entreprise et de l'équipe", score: 2 },
        { text: "Faire avancer principalement sa propre carrière", score: 3 },
        { text: "Contrôler ou microgérer l'équipe", score: 4 },
      ] },
      { id: "q11", text: "Concernant les retours de mon manager, je pense que :", options: [
        { text: "Ils sont justes, précis et constructifs", score: 0 },
        { text: "Ils sont globalement justes, avec parfois un biais", score: 1 },
        { text: "Ils sont parfois biaisés ou incohérents", score: 2 },
        { text: "Ils sont souvent injustes ou basés sur du favoritisme", score: 3 },
        { text: "Ils sont fortement biaisés et ne reflètent pas ma performance réelle", score: 4 },
      ] },
      { id: "q12", text: "Mon manager est-il transparent concernant les changements et décisions organisationnels :", options: [
        { text: "Très transparent et explique son raisonnement", score: 0 },
        { text: "Globalement transparent, dans des limites appropriées", score: 1 },
        { text: "Quelque peu transparent mais retient des détails", score: 2 },
        { text: "Rarement transparent, ce qui me laisse deviner", score: 3 },
        { text: "Pas transparent ; j'apprends les changements par d'autres en premier", score: 4 },
      ] },
    ],
    results: {
      low: { emoji: "🌿", title: "Collaborateur à faible risque", desc: "Vous gérez les retours de façon constructive, tenez vos engagements et faites confiance à la direction. Vous êtes un(e) excellent(e) coéquipier(ère). Continuez sur cette voie." },
      moderate: { emoji: "⚡", title: "Risque de collaboration modéré", desc: "Certains schémas de collaboration peuvent créer des frictions dans la dynamique d'équipe. Améliorer votre réceptivité aux retours, votre sens des responsabilités ou votre confiance envers la direction fera de vous un membre d'équipe encore plus efficace." },
      high: { emoji: "🔶", title: "Risque de collaboration élevé", desc: "Il existe des risques dans plusieurs domaines de collaboration. Ces schémas peuvent affecter la performance de l'équipe. Renforcez votre conscience de soi et établissez un plan d'amélioration concret." },
      critical: { emoji: "🔴", title: "Risque de collaboration critique", desc: "Les schémas actuels entravent considérablement une collaboration efficace. Un accompagnement professionnel ou un conseil en milieu de travail est fortement recommandé." },
    },
    retake: "Recommencer", resultLabel: "Votre niveau de risque de collaboration",
  },
  es: {
    title: "Test de riesgo de colaboración: ¿qué tipo de compañero(a) de equipo eres?",
    description: "Identifica tus patrones de riesgo en la colaboración con 12 preguntas.",
    questions: [
      { id: "q1", text: "Cuando recibo comentarios críticos de un(a) colega, tiendo a:", options: [
        { text: "Escuchar con apertura y hacer preguntas aclaratorias", score: 0 },
        { text: "Reconocer su perspectiva y considerarla", score: 1 },
        { text: "Sentirme algo a la defensiva, pero procesarlo después", score: 2 },
        { text: "Ponerme a la defensiva y explicar por qué se equivocan", score: 3 },
        { text: "Ignorarlo o suponer que no entienden mi trabajo", score: 4 },
      ] },
      { id: "q2", text: "Tiendo a recordar los comentarios críticos más tiempo que los elogios porque:", options: [
        { text: "Los uso para mejorar mi rendimiento de forma sistemática", score: 0 },
        { text: "Me parecen valiosos para la reflexión personal", score: 1 },
        { text: "Tengo algo de incertidumbre sobre su exactitud", score: 2 },
        { text: "Me preocupan", score: 3 },
        { text: "Le doy vueltas y cuestiono mi competencia", score: 4 },
      ] },
      { id: "q3", text: "Cuando un(a) compañero(a) discrepa públicamente de mi idea en una reunión, yo:", options: [
        { text: "Respeto su punto de vista y lo discuto abiertamente", score: 0 },
        { text: "Participo de forma constructiva y agradezco su aporte", score: 1 },
        { text: "Explico mi razonamiento con más cuidado para aclararlo", score: 2 },
        { text: "Me siento incómodo(a) pero intento seguir adelante", score: 3 },
        { text: "Me siento frustrado(a), avergonzado(a) o desautorizado(a)", score: 4 },
      ] },
      { id: "q4", text: "Si recibo comentarios negativos, es probable que yo:", options: [
        { text: "Actúe de inmediato para mejorar", score: 0 },
        { text: "Reflexione y elabore un plan de mejora", score: 1 },
        { text: "Comparta mi perspectiva con la persona en privado", score: 2 },
        { text: "Lo mencione a colegas para validar mis inquietudes", score: 3 },
        { text: "Lo comparta con varias personas y guarde resentimiento", score: 4 },
      ] },
      { id: "q5", text: "Cuando un proyecto o tarea sale mal, yo:", options: [
        { text: "Asumo toda la responsabilidad y me enfoco en soluciones", score: 0 },
        { text: "Reconozco mi papel y qué podría mejorar", score: 1 },
        { text: "Explico el contexto y las circunstancias", score: 2 },
        { text: "Culpo en parte a factores externos u otras personas involucradas", score: 3 },
        { text: "Culpo principalmente a otros o a circunstancias externas", score: 4 },
      ] },
      { id: "q6", text: "Cuando me comprometo con una fecha límite o un entregable, yo:", options: [
        { text: "Entrego de forma constante antes de tiempo o a tiempo", score: 0 },
        { text: "Normalmente cumplo el plazo con un trabajo de calidad", score: 1 },
        { text: "A veces incumplo el plazo por poco margen", score: 2 },
        { text: "Negocio prórrogas con frecuencia", score: 3 },
        { text: "Me comprometo en exceso e incumplo las fechas de forma constante", score: 4 },
      ] },
      { id: "q7", text: "Cuando alguien pide ayuda con su proyecto, yo:", options: [
        { text: "Ayudo con entusiasmo dentro de mi capacidad", score: 0 },
        { text: "Ayudo tanto como razonablemente sea posible", score: 1 },
        { text: "Ayudo si se espera de mi rol", score: 2 },
        { text: "Ayudo a regañadientes mientras me centro en mi trabajo", score: 3 },
        { text: "Solo ayudo si me devuelven el favor o me deben algo", score: 4 },
      ] },
      { id: "q8", text: "Si un(a) compañero(a) de equipo me sobrecarga frecuentemente de solicitudes, yo:", options: [
        { text: "Comunico claramente mi capacidad y negocio", score: 0 },
        { text: "Establezco límites con suavidad sobre mi disponibilidad", score: 1 },
        { text: "Intento acomodarme, pero me siento desbordado(a)", score: 2 },
        { text: "Guardo resentimiento en silencio, pero sigo accediendo", score: 3 },
        { text: "Me vuelvo pasivo(a)-agresivo(a) o evito a esa persona", score: 4 },
      ] },
      { id: "q9", text: "Cuando mi jefe(a) toma una decisión con la que no estoy de acuerdo, yo:", options: [
        { text: "La apoyo y la ejecuto de forma profesional", score: 0 },
        { text: "La ejecuto con respeto mientras aporto mi perspectiva", score: 1 },
        { text: "La cumplo, pero dudo de ella en privado", score: 2 },
        { text: "Expreso mis inquietudes a colegas con frecuencia", score: 3 },
        { text: "Debilito la decisión o la eludo", score: 4 },
      ] },
      { id: "q10", text: "Creo que la principal motivación de mi jefe(a) es:", options: [
        { text: "Ayudarme a mí y al equipo a tener éxito", score: 0 },
        { text: "Apoyar los objetivos y el bienestar del equipo", score: 1 },
        { text: "Mantener el equilibrio entre las necesidades del negocio y del equipo", score: 2 },
        { text: "Avanzar principalmente en su propia carrera", score: 3 },
        { text: "Controlar o microgestionar al equipo", score: 4 },
      ] },
      { id: "q11", text: "Sobre los comentarios de mi jefe(a), creo que:", options: [
        { text: "Son justos, precisos y constructivos", score: 0 },
        { text: "Son mayormente justos, con algún sesgo ocasional", score: 1 },
        { text: "A veces son sesgados o inconsistentes", score: 2 },
        { text: "A menudo son injustos o se basan en favoritismo", score: 3 },
        { text: "Son muy sesgados y no reflejan mi rendimiento real", score: 4 },
      ] },
      { id: "q12", text: "¿Mi jefe(a) es transparente sobre los cambios y decisiones organizacionales?", options: [
        { text: "Muy transparente y explica los motivos", score: 0 },
        { text: "Mayormente transparente, dentro de límites apropiados", score: 1 },
        { text: "Algo transparente, pero oculta detalles", score: 2 },
        { text: "Rara vez transparente, lo que me hace suponer cosas", score: 3 },
        { text: "Nada transparente; me entero de los cambios por otras personas primero", score: 4 },
      ] },
    ],
    results: {
      low: { emoji: "🌿", title: "Colaborador(a) de bajo riesgo", desc: "Manejas los comentarios de forma constructiva, cumples tus compromisos y confías en el liderazgo. Eres un(a) excelente compañero(a) de equipo. Sigue así." },
      moderate: { emoji: "⚡", title: "Riesgo de colaboración moderado", desc: "Algunos patrones de colaboración pueden generar fricción en la dinámica del equipo. Mejorar tu receptividad al feedback, tu responsabilidad o tu confianza en el liderazgo te hará un(a) miembro del equipo aún más eficaz." },
      high: { emoji: "🔶", title: "Riesgo de colaboración alto", desc: "Existen riesgos en varias áreas de colaboración. Estos patrones pueden afectar el rendimiento del equipo. Aumenta tu autoconciencia y elabora un plan de mejora concreto." },
      critical: { emoji: "🔴", title: "Riesgo de colaboración crítico", desc: "Los patrones actuales están obstaculizando significativamente una colaboración eficaz. Se recomienda encarecidamente buscar coaching profesional o asesoría laboral." },
    },
    retake: "Repetir", resultLabel: "Tu nivel de riesgo de colaboración",
  },
};

type SupportedLocale = keyof typeof data;
const SUPPORTED_LOCALES: SupportedLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const UI_LABELS: Record<SupportedLocale, {
  completed: (completed: number, total: number) => string;
  unanswered: (count: number) => string;
  submit: string;
  validation: string;
  collabHealth: string;
}> = {
  ko: { completed: (c, t) => `${c} / ${t} 응답`, unanswered: (c) => `미응답 ${c}개`, submit: "결과 보기", validation: "응답하지 않은 첫 문항으로 이동했습니다.", collabHealth: "협업 건강 지수" },
  en: { completed: (c, t) => `${c} / ${t} answered`, unanswered: (c) => `${c} unanswered`, submit: "See Results", validation: "Moved to the first unanswered question.", collabHealth: "Collaboration Health" },
  ja: { completed: (c, t) => `${c} / ${t} 回答済み`, unanswered: (c) => `未回答 ${c}件`, submit: "結果を見る", validation: "未回答の最初の質問に移動しました。", collabHealth: "協業健全度指数" },
  zh: { completed: (c, t) => `已回答 ${c} / ${t}`, unanswered: (c) => `未回答 ${c} 题`, submit: "查看结果", validation: "已跳转到第一个未回答的问题。", collabHealth: "协作健康指数" },
  fr: { completed: (c, t) => `${c} / ${t} réponses`, unanswered: (c) => `${c} sans réponse`, submit: "Voir les résultats", validation: "Vous avez été redirigé(e) vers la première question sans réponse.", collabHealth: "Indice de santé de la collaboration" },
  es: { completed: (c, t) => `${c} / ${t} respondidas`, unanswered: (c) => `${c} sin responder`, submit: "Ver resultados", validation: "Se te ha llevado a la primera pregunta sin responder.", collabHealth: "Índice de salud de la colaboración" },
};

export default function CollabRiskTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "collab-risk", title: "CollabRiskTest", finished: phase === "result" });

  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const maxScore = t.questions.length * 4;
  const pct = totalScore / maxScore;

  const level: RiskLevel =
    pct <= 0.2 ? "low" :
    pct <= 0.45 ? "moderate" :
    pct <= 0.7 ? "high" :
    "critical";

  if (phase === "result") {
    const r = t.results[level];
    const barPct = Math.round((1 - pct) * 100);
    return (
      <div className="not-prose my-10 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{ui.collabHealth}</span>
            <span className="font-bold text-orange-600">{barPct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full">
            <div className="h-3 bg-orange-500 rounded-full transition-all" style={{ width: `${barPct}%` }} />
          </div>
        </div>
        <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
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
        options: question.options.map((option) => ({ label: option.text, value: option.score })),
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
