import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
type StyleKey = 'quick' | 'earned' | 'cautious' | 'guarded'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Question { id: string; text: string; choices: string[] }
interface StyleData {
  title: string; subtitle: string; description: string
  strengths: string[]; tips: string[]; affirmation: string
}

const LABELS: Record<SupportedLang, {
  title: string; subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string; share: string; shareMsg: string
  yourStyle: string; strengths: string; tips: string
  affirmation: string; dimLabels: Record<StyleKey, string>
  note: string; barLabel: string
}> = {
  ko: {
    title: '신뢰 스타일 테스트',
    subtitle: '나는 어떻게 타인을 믿는가?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기', share: '결과 공유', shareMsg: '내 신뢰 스타일은',
    yourStyle: '나의 신뢰 스타일', strengths: '이 스타일의 강점', tips: '성장 포인트',
    affirmation: '오늘의 메시지',
    dimLabels: { quick: '빠른 신뢰형', earned: '검증형', cautious: '신중형', guarded: '방어형' },
    note: '이 테스트는 참고용이며 전문적 심리 진단을 대체하지 않습니다.',
    barLabel: '성향 분포',
  },
  en: {
    title: 'Trust Style Test',
    subtitle: 'How Do You Trust Others?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake', share: 'Share Result', shareMsg: 'My trust style is',
    yourStyle: 'Your Trust Style', strengths: 'Strengths of This Style', tips: 'Growth Points',
    affirmation: "Today's Message",
    dimLabels: { quick: 'Quick Truster', earned: 'Earned Truster', cautious: 'Cautious', guarded: 'Guarded' },
    note: 'This test is for reference only and does not replace professional psychological diagnosis.',
    barLabel: 'Tendency Distribution',
  },
  ja: {
    title: '信頼スタイルテスト',
    subtitle: '私はどのように他者を信じるか？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度', share: '結果を共有', shareMsg: '私の信頼スタイルは',
    yourStyle: '私の信頼スタイル', strengths: 'このスタイルの強み', tips: '成長ポイント',
    affirmation: '今日のメッセージ',
    dimLabels: { quick: '即時信頼型', earned: '検証型', cautious: '慎重型', guarded: '防衛型' },
    note: 'このテストは参考用であり、専門的な心理診断の代替ではありません。',
    barLabel: '傾向分布',
  },
  zh: {
    title: '信任风格测验',
    subtitle: '我是怎么相信别人的？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验', share: '分享结果', shareMsg: '我的信任风格是',
    yourStyle: '我的信任风格', strengths: '这种风格的长处', tips: '可以练习的地方',
    affirmation: '今天想对你说',
    dimLabels: { quick: '快速信任型', earned: '验证型', cautious: '谨慎型', guarded: '防守型' },
    note: '本测验仅供参考，不能替代专业的心理评估。',
    barLabel: '倾向分布',
  },
  fr: {
    title: 'Test du style de confiance',
    subtitle: 'Comment est-ce que je fais confiance ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer', share: 'Partager le résultat', shareMsg: 'Mon style de confiance',
    yourStyle: 'Votre style de confiance', strengths: 'Les forces de ce style', tips: 'Pistes de progrès',
    affirmation: 'Un mot pour aujourd’hui',
    dimLabels: { quick: 'Confiance rapide', earned: 'Confiance éprouvée', cautious: 'Prudent', guarded: 'Sur ses gardes' },
    note: 'Ce test est indicatif et ne remplace pas une évaluation psychologique professionnelle.',
    barLabel: 'Répartition des tendances',
  },
  es: {
    title: 'Test de estilo de confianza',
    subtitle: '¿Cómo confío en los demás?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir', share: 'Compartir resultado', shareMsg: 'Mi estilo de confianza',
    yourStyle: 'Tu estilo de confianza', strengths: 'Las fortalezas de este estilo', tips: 'Para practicar',
    affirmation: 'Algo para hoy',
    dimLabels: { quick: 'Confianza rápida', earned: 'Confianza ganada', cautious: 'Cauto', guarded: 'En guardia' },
    note: 'Este test es orientativo y no sustituye una evaluación psicológica profesional.',
    barLabel: 'Reparto de tendencias',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    { id: 'q1', text: '처음 만난 동료가 도움을 제안할 때 나는', choices: ['바로 기꺼이 받아들인다', '일단 고맙다고 하고 상황을 본다', '정중히 사양하며 혼자 해결한다', '의도를 의심하게 된다'] },
    { id: 'q2', text: '친구가 새로운 조언을 줄 때 나는', choices: ['곧바로 실천해 본다', '충분히 생각한 후 결정한다', '여러 사람 의견을 더 모은다', '내 판단을 더 믿는다'] },
    { id: 'q3', text: '낯선 사람이 길을 안내해줄 때 나는', choices: ['감사히 따라간다', '지도로 확인하며 간다', '여러 번 확인하고 조심히 따른다', '다른 방법을 찾아본다'] },
    { id: 'q4', text: '온라인에서 처음 만난 사람과 대화할 때 나는', choices: ['자연스럽게 개인 이야기를 나눈다', '어느 정도 알게 된 후 개방한다', '필요한 이야기만 한다', '개인 정보를 거의 주지 않는다'] },
    { id: 'q5', text: '팀 프로젝트에서 처음 보는 팀원과 협력할 때 나는', choices: ['바로 역할을 맡기고 믿는다', '작은 일부터 시작해 신뢰를 쌓는다', '꼼꼼히 확인하며 진행한다', '가능하면 직접 처리한다'] },
    { id: 'q6', text: '누군가 나에게 비밀을 털어놓을 때 나는', choices: ['진심으로 받아들이고 공감한다', '맥락을 파악한 후 반응한다', '조심스럽게 듣는다', '왜 나에게 말하는지 의문이 생긴다'] },
    { id: 'q7', text: '과거에 신뢰했던 사람에게 배신당한 경험이 있다면', choices: ['그것은 그 사람 문제였다고 넘긴다', '교훈으로 삼되 다음엔 더 신중히 한다', '상당히 오래 영향을 받는다', '그 이후 사람을 쉽게 믿지 않는다'] },
    { id: 'q8', text: '상대가 약속을 한 번 어겼을 때 나는', choices: ['금방 용서하고 다시 믿는다', '이유를 듣고 판단한다', '신뢰가 많이 줄어든다', '그 관계 자체를 재평가한다'] },
    { id: 'q9', text: '누군가가 나를 칭찬할 때 나는', choices: ['순수하게 기뻐한다', '감사하지만 이유를 생각해본다', '어색하게 받아들인다', '의도가 있는 건 아닌지 생각한다'] },
    { id: 'q10', text: '처음 방문한 식당의 추천 메뉴를 물어볼 때 나는', choices: ['직원 말을 바로 따른다', '리뷰와 함께 참고한다', '여러 번 물어보고 고른다', '내 판단으로 결정한다'] },
    { id: 'q11', text: '친한 친구가 갑자기 돈을 빌려달라고 할 때 나는', choices: ['고민없이 빌려준다', '상황을 듣고 결정한다', '어렵다고 정중히 거절한다', '그 친구를 의심하게 된다'] },
    { id: 'q12', text: '의사나 전문가의 의견을 들을 때 나는', choices: ['전적으로 믿고 따른다', '다른 의견도 확인 후 결정한다', '꼼꼼히 검색 후 판단한다', '스스로 결정을 내린다'] },
    { id: 'q13', text: '새로운 환경(직장, 학교 등)에 적응할 때 나는', choices: ['빠르게 사람들과 친해진다', '천천히 알아가며 관계를 쌓는다', '시간이 걸리고 조심스럽다', '거리감을 유지하는 편이다'] },
    { id: 'q14', text: '소셜 미디어에서 뉴스나 정보를 접할 때 나는', choices: ['공감되면 바로 믿는다', '출처를 확인한다', '여러 출처를 비교한다', '대부분 의심하며 본다'] },
    { id: 'q15', text: '어린 시절 주요 보호자(부모 등)와의 관계는', choices: ['매우 안정적이고 믿을 수 있었다', '대체로 좋았지만 일부 불안감이 있었다', '일관적이지 않아 혼란스러웠다', '신뢰하기 어려웠다'] },
    { id: 'q16', text: '상대가 나에게 약점을 드러낼 때 나는', choices: ['귀하게 여기고 더 가까워진다', '받아들이되 조심스럽게 반응한다', '괜찮은지 걱정이 된다', '불편함을 느낀다'] },
  ],
  en: [
    { id: 'q1', text: 'When a new colleague offers to help, I', choices: ['Accept gladly right away', 'Thank them and observe first', 'Politely decline and handle it myself', 'Wonder about their motives'] },
    { id: 'q2', text: 'When a friend gives me new advice, I', choices: ['Try it out immediately', 'Think it over before deciding', 'Collect more opinions first', 'Trust my own judgment more'] },
    { id: 'q3', text: 'When a stranger gives me directions, I', choices: ['Gratefully follow them', 'Cross-check with a map', 'Verify several times and proceed carefully', 'Look for another way'] },
    { id: 'q4', text: 'Chatting with someone I met online, I', choices: ['Naturally share personal stories', 'Open up after getting to know them a bit', 'Stick to what is necessary', 'Give away almost no personal info'] },
    { id: 'q5', text: 'Working with a brand-new teammate on a project, I', choices: ['Assign roles and trust them right away', 'Start with small tasks to build trust', 'Verify carefully as we go', 'Handle things myself when possible'] },
    { id: 'q6', text: 'When someone confides a secret in me, I', choices: ['Accept it sincerely and empathize', 'Understand context before reacting', 'Listen carefully and cautiously', 'Wonder why they are telling me'] },
    { id: 'q7', text: 'If someone I once trusted betrayed me, I', choices: ['See it as their problem and move on', 'Learn from it and be more careful next time', 'Feel the impact for quite a long time', 'Stopped trusting people easily after that'] },
    { id: 'q8', text: 'When someone breaks a promise once, I', choices: ['Forgive quickly and trust again', 'Hear their reason and then judge', 'Feel my trust drop significantly', 'Re-evaluate the relationship itself'] },
    { id: 'q9', text: 'When someone praises me, I', choices: ['Feel genuinely happy', 'Feel grateful but wonder why', 'Accept it awkwardly', 'Wonder if they have an ulterior motive'] },
    { id: 'q10', text: 'Asking for the recommended dish at a new restaurant, I', choices: ["Follow the staff's word immediately", 'Use it along with reviews', 'Ask several times before choosing', 'Decide based on my own judgment'] },
    { id: 'q11', text: 'When a close friend suddenly asks to borrow money, I', choices: ['Lend without hesitation', 'Hear the situation and decide', 'Politely decline', 'Start to feel suspicious'] },
    { id: 'q12', text: "When hearing a doctor's or expert's opinion, I", choices: ['Fully trust and follow it', 'Check other opinions before deciding', 'Search thoroughly then judge', 'Make my own decision'] },
    { id: 'q13', text: 'Adapting to a new environment (job, school, etc.), I', choices: ['Bond with people quickly', 'Build relationships slowly and steadily', 'Take time and feel cautious', 'Prefer to keep my distance'] },
    { id: 'q14', text: 'Encountering news or information on social media, I', choices: ['Believe it if it resonates', 'Check the source', 'Compare multiple sources', 'View most things with suspicion'] },
    { id: 'q15', text: 'My relationship with my primary caregiver growing up was', choices: ['Very stable and trustworthy', 'Generally good with some anxiety', 'Inconsistent and confusing', 'Hard to trust'] },
    { id: 'q16', text: 'When someone shows me their vulnerability, I', choices: ['Value it and feel closer', 'Accept it but respond carefully', 'Feel worried about them', 'Feel uncomfortable'] },
  ],
  ja: [
    { id: 'q1', text: '初めて会った同僚が助けを申し出たとき、私は', choices: ['すぐに喜んで受け入れる', 'とりあえずお礼を言い様子を見る', '丁重に断って自分で解決する', '意図を疑ってしまう'] },
    { id: 'q2', text: '友人が新しいアドバイスをくれたとき、私は', choices: ['すぐに試してみる', 'よく考えてから決める', '他の人の意見も集める', '自分の判断を優先する'] },
    { id: 'q3', text: '知らない人が道を教えてくれたとき、私は', choices: ['ありがたくその通りに進む', '地図で確認しながら進む', '何度か確認して慎重に従う', '別の方法を探す'] },
    { id: 'q4', text: 'オンラインで初めて会った人と話すとき、私は', choices: ['自然に個人的な話をする', 'ある程度知ってから打ち明ける', '必要なことだけ話す', '個人情報はほとんど教えない'] },
    { id: 'q5', text: 'チームプロジェクトで初めてのメンバーと協力するとき、私は', choices: ['すぐに役割を任せて信頼する', '小さなことから始めて信頼を築く', '慎重に確認しながら進める', 'できるだけ自分で処理する'] },
    { id: 'q6', text: '誰かが秘密を打ち明けてくれたとき、私は', choices: ['誠実に受け止め共感する', '文脈を把握してから反応する', '慎重に聞く', 'なぜ私に話すのか疑問に思う'] },
    { id: 'q7', text: 'かつて信頼した人に裏切られた経験があれば', choices: ['その人の問題だと割り切る', '教訓にして次回はより慎重にする', 'かなり長い間影響を受ける', 'それ以来人を簡単に信じなくなった'] },
    { id: 'q8', text: '相手が約束を一度破ったとき、私は', choices: ['すぐに許してまた信じる', '理由を聞いて判断する', '信頼がかなり下がる', '関係自体を再評価する'] },
    { id: 'q9', text: '誰かに褒められたとき、私は', choices: ['純粋に喜ぶ', '感謝するが理由を考える', 'ぎこちなく受け取る', '裏に意図があるのかと思う'] },
    { id: 'q10', text: '初めて行ったレストランでお勧めを聞くとき、私は', choices: ['店員の言葉にすぐ従う', 'レビューと合わせて参考にする', '何度も確認してから選ぶ', '自分の判断で決める'] },
    { id: 'q11', text: '親しい友人が突然お金を貸してほしいと言ったとき、私は', choices: ['迷わず貸す', '状況を聞いて決める', '丁重に断る', 'その友人を疑うようになる'] },
    { id: 'q12', text: '医師や専門家の意見を聞くとき、私は', choices: ['全面的に信じて従う', '他の意見も確認してから決める', 'よく調べてから判断する', '自分で決断する'] },
    { id: 'q13', text: '新しい環境（職場・学校など）に適応するとき、私は', choices: ['すぐに人と打ち解ける', 'ゆっくり知り合いながら関係を築く', '時間がかかり慎重になる', '距離を置く方だ'] },
    { id: 'q14', text: 'SNSでニュースや情報を見るとき、私は', choices: ['共感できればすぐ信じる', '出典を確認する', '複数の出典を比較する', 'ほとんど疑って見る'] },
    { id: 'q15', text: '幼少期の主な養育者との関係は', choices: ['とても安定していて信頼できた', 'おおむね良かったが不安もあった', '一貫性がなく混乱した', '信頼しにくかった'] },
    { id: 'q16', text: '相手が自分の弱みを見せてくれたとき、私は', choices: ['大切に思い、より近しく感じる', '受け入れるが慎重に反応する', '大丈夫か心配になる', '居心地の悪さを感じる'] },
  ],
  zh: [
    { id: 'q1', text: '初次见面的同事主动帮忙时，我会', choices: ['马上高兴地接受', '先道谢，再看看情况', '客气地婉拒，自己处理', '开始怀疑对方的用意'] },
    { id: 'q2', text: '朋友给我新建议时，我会', choices: ['马上试试看', '想清楚再决定', '再多问几个人的意见', '更相信自己的判断'] },
    { id: 'q3', text: '陌生人给我指路时，我会', choices: ['道谢后跟着走', '边看地图边走', '反复确认，小心地跟', '另外找别的办法'] },
    { id: 'q4', text: '和网上初次认识的人聊天时，我会', choices: ['自然地聊起自己的事', '等熟一点再打开', '只说需要说的', '几乎不给个人资料'] },
    { id: 'q5', text: '和第一次共事的组员合作时，我会', choices: ['直接把任务交给他，信他', '从小事开始，慢慢建立信任', '仔细核对着推进', '能自己做就自己做'] },
    { id: 'q6', text: '有人对我吐露秘密时，我会', choices: ['真心接住，并感同身受', '先弄清来龙去脉再回应', '小心地听着', '心里疑惑：为什么跟我说'] },
    { id: 'q7', text: '如果曾被信任的人辜负过，我会', choices: ['觉得那是那个人的问题', '当成教训，下次更谨慎', '被影响相当久', '从此不太轻易信人'] },
    { id: 'q8', text: '对方失约一次时，我会', choices: ['很快原谅，继续相信', '听完理由再判断', '信任掉得不少', '重新评估这段关系'] },
    { id: 'q9', text: '有人称赞我时，我会', choices: ['单纯地高兴', '谢谢，但也想想原因', '有点不自在地接下', '想想是不是有别的用意'] },
    { id: 'q10', text: '第一次去的餐厅问推荐菜时，我会', choices: ['直接照店员说的点', '参考评论一起看', '多问几次再挑', '按自己的判断决定'] },
    { id: 'q11', text: '好朋友突然开口借钱时，我会', choices: ['二话不说借给他', '听完情况再决定', '客气地说不方便', '开始对这个朋友起疑'] },
    { id: 'q12', text: '听医生或专家的意见时，我会', choices: ['完全相信并照做', '再看别的意见后决定', '仔细查过再判断', '自己下判断'] },
    { id: 'q13', text: '适应新环境（职场、学校）时，我会', choices: ['很快和大家熟起来', '慢慢了解，慢慢建立关系', '要花时间，也比较小心', '保持一点距离'] },
    { id: 'q14', text: '在社群网络上看到新闻或资讯时，我会', choices: ['有共鸣就直接相信', '先查来源', '比对好几个来源', '大多带着怀疑看'] },
    { id: 'q15', text: '小时候和主要照顾者（父母等）的关系是', choices: ['非常稳定，可以信赖', '大体不错，但有些不安', '不太一致，让人困惑', '难以信任'] },
    { id: 'q16', text: '对方在我面前露出弱点时，我会', choices: ['很珍惜，也更靠近', '接住，但反应小心', '担心他是不是还好', '觉得有点不自在'] },
  ],
  fr: [
    { id: 'q1', text: 'Quand un collègue rencontré pour la première fois propose son aide, je', choices: ['accepte tout de suite, avec plaisir', 'remercie d’abord et j’observe la situation', 'décline poliment et je me débrouille seul', 'me mets à douter de ses intentions'] },
    { id: 'q2', text: 'Quand un ami me donne un conseil nouveau, je', choices: ['l’essaie aussitôt', 'y réfléchis bien avant de décider', 'demande encore d’autres avis', 'me fie davantage à mon propre jugement'] },
    { id: 'q3', text: 'Quand un inconnu m’indique le chemin, je', choices: ['le remercie et je le suis', 'avance en vérifiant sur la carte', 'vérifie plusieurs fois et je suis prudemment', 'cherche une autre solution'] },
    { id: 'q4', text: 'Quand je parle à quelqu’un rencontré en ligne, je', choices: ['raconte naturellement des choses personnelles', 'm’ouvre une fois que je le connais un peu', 'ne dis que le nécessaire', 'ne donne presque aucune information personnelle'] },
    { id: 'q5', text: 'Quand je travaille avec un équipier que je ne connais pas, je', choices: ['lui confie un rôle tout de suite et je lui fais confiance', 'commence par de petites choses pour bâtir la confiance', 'avance en vérifiant soigneusement', 'fais moi-même dès que possible'] },
    { id: 'q6', text: 'Quand quelqu’un me confie un secret, je', choices: ['l’accueille sincèrement et je comprends', 'cerne d’abord le contexte avant de réagir', 'écoute avec prudence', 'me demande pourquoi c’est à moi qu’il le dit'] },
    { id: 'q7', text: 'Si quelqu’un en qui j’avais confiance m’a trahi, je', choices: ['me dis que le problème venait de lui', 'en tire une leçon et je serai plus prudent', 'en reste marqué assez longtemps', 'ne fais plus facilement confiance'] },
    { id: 'q8', text: 'Quand l’autre manque une fois à sa parole, je', choices: ['pardonne vite et je refais confiance', 'écoute la raison avant de juger', 'perds beaucoup de confiance', 'réévalue la relation elle-même'] },
    { id: 'q9', text: 'Quand on me complimente, je', choices: ['me réjouis simplement', 'remercie tout en me demandant pourquoi', 'accueille cela avec gêne', 'me demande s’il y a une intention derrière'] },
    { id: 'q10', text: 'Quand je demande la spécialité d’un restaurant inconnu, je', choices: ['suis directement ce que dit le serveur', 'le croise avec les avis en ligne', 'pose plusieurs fois la question avant de choisir', 'décide selon mon propre jugement'] },
    { id: 'q11', text: 'Quand un ami proche me demande soudain de l’argent, je', choices: ['prête sans hésiter', 'écoute la situation avant de décider', 'refuse poliment en disant que c’est compliqué', 'commence à douter de cet ami'] },
    { id: 'q12', text: 'Quand j’écoute l’avis d’un médecin ou d’un expert, je', choices: ['fais entièrement confiance et je suis', 'décide après avoir vérifié d’autres avis', 'cherche soigneusement avant de juger', 'décide par moi-même'] },
    { id: 'q13', text: 'Quand je m’adapte à un nouvel environnement (travail, école), je', choices: ['me rapproche vite des gens', 'apprends à connaître lentement et je construis', 'mets du temps et je reste prudent', 'garde plutôt mes distances'] },
    { id: 'q14', text: 'Devant une information ou une actualité sur les réseaux, je', choices: ['y crois tout de suite si cela me parle', 'vérifie la source', 'compare plusieurs sources', 'regarde cela avec méfiance la plupart du temps'] },
    { id: 'q15', text: 'Ma relation avec la personne qui s’est occupée de moi enfant était', choices: ['très stable et digne de confiance', 'globalement bonne, avec un peu d’insécurité', 'inconstante, et cela m’a déstabilisé', 'difficile à investir de confiance'] },
    { id: 'q16', text: 'Quand l’autre me montre une faiblesse, je', choices: ['le prends comme précieux et je me sens plus proche', 'l’accueille, mais je réagis avec prudence', 'm’inquiète pour lui', 'ressens un certain malaise'] },
  ],
  es: [
    { id: 'q1', text: 'Cuando un compañero al que acabo de conocer me ofrece ayuda, yo', choices: ['la acepto encantado al momento', 'le doy las gracias y observo la situación', 'lo rechazo con educación y lo resuelvo solo', 'empiezo a dudar de sus intenciones'] },
    { id: 'q2', text: 'Cuando un amigo me da un consejo nuevo, yo', choices: ['lo pruebo enseguida', 'lo pienso bien antes de decidir', 'pido todavía más opiniones', 'me fío más de mi propio criterio'] },
    { id: 'q3', text: 'Cuando un desconocido me indica el camino, yo', choices: ['se lo agradezco y le hago caso', 'voy comprobándolo en el mapa', 'lo confirmo varias veces y sigo con cuidado', 'busco otra alternativa'] },
    { id: 'q4', text: 'Cuando hablo con alguien que acabo de conocer en internet, yo', choices: ['cuento cosas personales con naturalidad', 'me abro cuando ya lo conozco algo', 'digo solo lo necesario', 'apenas doy datos personales'] },
    { id: 'q5', text: 'Cuando colaboro con alguien del equipo a quien no conozco, yo', choices: ['le doy una tarea enseguida y confío', 'empiezo por cosas pequeñas y construyo confianza', 'avanzo comprobándolo todo con cuidado', 'lo hago yo mismo si puedo'] },
    { id: 'q6', text: 'Cuando alguien me confía un secreto, yo', choices: ['lo recibo de corazón y me pongo en su lugar', 'entiendo primero el contexto y luego respondo', 'escucho con cautela', 'me pregunto por qué me lo cuenta a mí'] },
    { id: 'q7', text: 'Si alguien en quien confiaba me falló, yo', choices: ['pienso que el problema era suyo', 'lo tomo como lección y la próxima vez voy con más cuidado', 'me queda marcado bastante tiempo', 'ya no confío con facilidad'] },
    { id: 'q8', text: 'Cuando el otro falta una vez a su palabra, yo', choices: ['perdono pronto y vuelvo a confiar', 'escucho el motivo y luego juzgo', 'pierdo bastante confianza', 'me replanteo la relación entera'] },
    { id: 'q9', text: 'Cuando alguien me elogia, yo', choices: ['me alegro sin más', 'lo agradezco, pero pienso el porqué', 'lo recibo con cierta incomodidad', 'me pregunto si hay una intención detrás'] },
    { id: 'q10', text: 'Cuando pregunto qué recomiendan en un restaurante nuevo, yo', choices: ['hago caso directamente al camarero', 'lo cruzo con las reseñas', 'pregunto varias veces antes de elegir', 'decido según mi propio criterio'] },
    { id: 'q11', text: 'Cuando un buen amigo me pide dinero de repente, yo', choices: ['se lo presto sin pensarlo', 'escucho la situación y decido', 'le digo con educación que no puedo', 'empiezo a desconfiar de ese amigo'] },
    { id: 'q12', text: 'Cuando escucho la opinión de un médico o un experto, yo', choices: ['confío del todo y la sigo', 'decido después de ver otras opiniones', 'busco a fondo y luego juzgo', 'decido por mí mismo'] },
    { id: 'q13', text: 'Cuando me adapto a un entorno nuevo (trabajo, estudios), yo', choices: ['me hago pronto con la gente', 'conozco despacio y voy construyendo', 'tardo y voy con cautela', 'mantengo cierta distancia'] },
    { id: 'q14', text: 'Ante una noticia o información en redes, yo', choices: ['me la creo enseguida si me resuena', 'compruebo la fuente', 'comparo varias fuentes', 'la miro con desconfianza casi siempre'] },
    { id: 'q15', text: 'Mi relación con quien me cuidó de niño (padres u otros) era', choices: ['muy estable y de fiar', 'en general buena, con algo de inseguridad', 'poco constante, y eso me desconcertaba', 'difícil de confiar'] },
    { id: 'q16', text: 'Cuando el otro me muestra una debilidad, yo', choices: ['lo tomo como algo valioso y me siento más cerca', 'lo recibo, pero respondo con cuidado', 'me preocupo por si está bien', 'siento cierta incomodidad'] },
  ],
}

// Each question maps to a style: index 0=quick,1=earned,2=cautious,3=guarded
// The chosen answer index corresponds to the style it increments
const STYLE_ORDER: StyleKey[] = ['quick', 'earned', 'cautious', 'guarded']

const RESULTS: Record<StyleKey, Record<SupportedLang, StyleData>> = {
  quick: {
    ko: {
      title: '빠른 신뢰형',
      subtitle: '당신은 열린 마음으로 타인을 만납니다',
      description: '처음 만나는 사람에게도 빠르게 마음을 여는 편입니다. 관계 형성이 빠르고 따뜻한 분위기를 만들어내는 능력이 탁월합니다. 다만, 판단이 앞서 상처를 받을 수도 있어요.',
      strengths: ['새로운 관계 형성에 탁월함', '따뜻하고 열린 에너지', '협력적 환경 조성', '신뢰받는 느낌을 먼저 줌'],
      tips: ['판단보다 관찰을 먼저 하는 연습', '신뢰는 선물이 아닌 교환임을 기억하기', '경계를 설정하는 것이 냉정함이 아님을 인지하기'],
      affirmation: '당신의 열린 마음은 세상에 따뜻함을 줍니다. 동시에 스스로를 보호하는 경계도 그 마음의 일부입니다.',
    },
    en: {
      title: 'Quick Truster',
      subtitle: 'You meet others with an open heart',
      description: 'You tend to open up quickly even to people you have just met. You are excellent at forming relationships fast and creating warm atmospheres. However, rapid judgment can sometimes lead to getting hurt.',
      strengths: ['Excellent at forming new relationships', 'Warm and open energy', 'Creates collaborative environments', 'Makes others feel trusted first'],
      tips: ['Practice observing before judging', 'Remember trust is an exchange, not a gift', 'Understand that setting boundaries is not coldness'],
      affirmation: 'Your open heart brings warmth to the world. At the same time, the boundaries that protect you are also part of that heart.',
    },
    ja: {
      title: '即時信頼型',
      subtitle: 'あなたは開かれた心で他者と出会います',
      description: '初めて会う人にもすぐに心を開く方です。関係構築が速く、温かい雰囲気を作る能力に優れています。ただし、判断が先走り傷つくこともあります。',
      strengths: ['新しい関係の構築に優れる', '温かく開かれたエネルギー', '協力的な環境づくり', '先に信頼感を与える'],
      tips: ['判断より観察を先にする練習', '信頼は贈り物ではなく交換であることを覚える', '境界を設けることは冷たさではないと理解する'],
      affirmation: 'あなたの開かれた心は世界に温もりをもたらします。同時に、自分を守る境界もその心の一部です。',
    },
    zh: {
      title: '快速信任型',
      subtitle: '你带着敞开的心遇见别人',
      description: '对初次见面的人，你也很快就敞开。你建立关系快，也很会把气氛弄暖。不过判断在前时，有时会因此受伤。',
      strengths: ['很会建立新关系', '温暖而开放的气场', '能把协作的氛围造出来', '先给对方「我被信任」的感觉'],
      tips: ['练习先观察，再判断', '记得信任是交换，不是礼物', '知道设界线并不等于冷漠'],
      affirmation: '你的敞开给世界带来温度。同时，保护自己的界线，也是这份心的一部分。',
    },
    fr: {
      title: 'Confiance rapide',
      subtitle: 'Vous allez vers les autres à cœur ouvert',
      description: 'Même avec quelqu’un rencontré pour la première fois, vous vous ouvrez vite. Vous créez le lien rapidement et vous savez réchauffer l’ambiance. Quand le jugement passe en premier, cela peut aussi vous blesser.',
      strengths: ['Excellent pour créer de nouveaux liens', 'Une énergie chaleureuse et ouverte', 'Vous installez un climat de coopération', 'Vous donnez d’emblée le sentiment d’être digne de confiance'],
      tips: ['S’exercer à observer avant de juger', 'Se rappeler que la confiance est un échange, pas un cadeau', 'Savoir que poser une limite n’est pas de la froideur'],
      affirmation: 'Votre ouverture réchauffe le monde. Et les limites qui vous protègent font partie de ce même cœur.',
    },
    es: {
      title: 'Confianza rápida',
      subtitle: 'Te acercas a la gente con el corazón abierto',
      description: 'Incluso con quien acabas de conocer, te abres pronto. Creas vínculo rápido y sabes calentar el ambiente. Cuando el juicio va por delante, eso también puede hacerte daño.',
      strengths: ['Muy bueno creando vínculos nuevos', 'Una energía cálida y abierta', 'Generas un clima de colaboración', 'Das de entrada la sensación de ser de fiar'],
      tips: ['Practicar observar antes de juzgar', 'Recordar que la confianza es intercambio, no regalo', 'Saber que poner un límite no es frialdad'],
      affirmation: 'Tu apertura da calor al mundo. Y los límites que te protegen son parte de ese mismo corazón.',
    },
  },
  earned: {
    ko: {
      title: '검증형',
      subtitle: '당신은 신중하게, 그러나 진심으로 믿습니다',
      description: '신뢰를 쌓는 데 시간이 걸리지만, 한 번 형성된 신뢰는 깊고 견고합니다. 경험을 바탕으로 사람을 판단하며 균형 잡힌 대인관계를 유지합니다.',
      strengths: ['깊고 지속적인 인간관계', '균형 잡힌 신뢰 판단력', '신뢰받는 친구/동료', '감정적 안정감 제공'],
      tips: ['처음 만남에서 조금 더 열린 자세 갖기', '검증 기간이 길어질 때 상대가 느끼는 거리감 인식하기', '완벽한 신뢰는 없다는 것을 받아들이기'],
      affirmation: '당신이 신뢰를 쌓는 방식은 진심 어린 것입니다. 그 신중함이 당신과 주변 사람을 지킵니다.',
    },
    en: {
      title: 'Earned Truster',
      subtitle: 'You trust carefully, but sincerely',
      description: 'It takes time for you to build trust, but once formed it is deep and solid. You judge people through experience and maintain balanced relationships.',
      strengths: ['Deep and lasting relationships', 'Balanced trust judgment', 'Trusted friend and colleague', 'Provides emotional stability'],
      tips: ['Try to be a little more open on first meetings', 'Be aware that long verification periods may create distance', 'Accept that perfect trust does not exist'],
      affirmation: 'The way you build trust is genuine. Your carefulness protects both you and the people around you.',
    },
    ja: {
      title: '検証型',
      subtitle: 'あなたは慎重に、しかし誠実に信じます',
      description: '信頼を築くのに時間がかかりますが、一度形成された信頼は深く確固たるものです。経験に基づいて人を判断し、バランスの取れた対人関係を保ちます。',
      strengths: ['深く続く人間関係', 'バランスの取れた信頼判断力', '信頼される友人・同僚', '感情的な安定感を提供する'],
      tips: ['初対面でもう少しオープンな姿勢を持つ', '検証期間が長くなると相手が感じる距離感を意識する', '完璧な信頼はないことを受け入れる'],
      affirmation: '信頼を築くあなたのやり方は誠実です。その慎重さがあなたと周囲の人を守っています。',
    },
    zh: {
      title: '验证型',
      subtitle: '你相信得谨慎，却是真心的',
      description: '要建立信任需要时间，但一旦建起来，就深也牢。你靠经验判断人，也维持着平衡的人际关系。',
      strengths: ['深而长久的关系', '对信任的判断很均衡', '是别人信得过的朋友或同事', '能给人情绪上的安定'],
      tips: ['初见时，把姿态再打开一点', '察觉一下：验证期太长时，对方会不会感到距离', '接受「没有完美的信任」这件事'],
      affirmation: '你建立信任的方式是真诚的。那份谨慎护住了你，也护住了身边的人。',
    },
    fr: {
      title: 'Confiance éprouvée',
      subtitle: 'Vous faites confiance avec prudence, mais sincèrement',
      description: 'Bâtir votre confiance demande du temps ; une fois établie, elle est profonde et solide. Vous jugez à partir de l’expérience et vous entretenez des relations équilibrées.',
      strengths: ['Des relations profondes et durables', 'Un jugement équilibré sur la confiance', 'Un ami ou un collègue sur qui l’on compte', 'Vous apportez une stabilité émotionnelle'],
      tips: ['S’ouvrir un peu plus dès la première rencontre', 'Remarquer la distance que peut créer une longue période de vérification', 'Accepter qu’il n’existe pas de confiance parfaite'],
      affirmation: 'Votre façon de bâtir la confiance est sincère. Cette prudence vous protège, vous et vos proches.',
    },
    es: {
      title: 'Confianza ganada',
      subtitle: 'Confías con prudencia, pero de verdad',
      description: 'Construir tu confianza lleva tiempo; una vez hecha, es honda y firme. Juzgas a partir de la experiencia y mantienes relaciones equilibradas.',
      strengths: ['Relaciones hondas y duraderas', 'Un juicio equilibrado sobre la confianza', 'Un amigo o compañero con quien se cuenta', 'Aportas estabilidad emocional'],
      tips: ['Abrirte un poco más en el primer encuentro', 'Notar la distancia que puede crear un periodo largo de comprobación', 'Aceptar que no existe la confianza perfecta'],
      affirmation: 'Tu manera de construir confianza es sincera. Esa prudencia te protege a ti y a los tuyos.',
    },
  },
  cautious: {
    ko: {
      title: '신중형',
      subtitle: '당신은 천천히, 단단하게 관계를 쌓습니다',
      description: '신뢰를 주는 데 매우 신중합니다. 충분한 관찰과 시간이 지난 후에야 마음을 엽니다. 이로 인해 관계가 느리게 발전하지만, 맺어진 관계는 매우 의미 있습니다.',
      strengths: ['깊이 있는 소수의 관계', '상처받을 위험 최소화', '신중한 의사 결정', '자기 자신에 대한 이해 깊음'],
      tips: ['작은 신뢰 실험을 조금씩 해보기', '모든 관계가 같은 기준을 적용할 필요는 없음', '누군가 기다려주고 있다는 것을 기억하기'],
      affirmation: '천천히 가는 것은 뒤처지는 것이 아닙니다. 당신의 신중함은 진정성 있는 관계의 기반입니다.',
    },
    en: {
      title: 'Cautious',
      subtitle: 'You build relationships slowly and solidly',
      description: 'You are very careful about giving trust. You only open up after sufficient observation and time. Relationships develop slowly, but the ones you do form are deeply meaningful.',
      strengths: ['A few deep and meaningful relationships', 'Minimized risk of getting hurt', 'Careful decision-making', 'Deep self-understanding'],
      tips: ['Try small trust experiments gradually', 'Not every relationship requires the same standard', 'Remember that some people are willing to wait for you'],
      affirmation: 'Going slowly is not falling behind. Your carefulness is the foundation of genuine relationships.',
    },
    ja: {
      title: '慎重型',
      subtitle: 'あなたはゆっくりと、しっかりと関係を築きます',
      description: '信頼を与えることにとても慎重です。十分な観察と時間の後にのみ心を開きます。関係の発展は遅いですが、築かれた関係はとても意味深いものです。',
      strengths: ['少数だが深い人間関係', '傷つくリスクの最小化', '慎重な意思決定', '自己理解が深い'],
      tips: ['小さな信頼実験を少しずつ試す', 'すべての関係に同じ基準を適用する必要はない', '待ってくれている人がいることを忘れずに'],
      affirmation: 'ゆっくり進むことは遅れることではありません。あなたの慎重さは真の関係の基盤です。',
    },
    zh: {
      title: '谨慎型',
      subtitle: '你慢慢地、稳稳地把关系建起来',
      description: '你在把信任交出去这件事上非常谨慎。要观察够久、时间够长，才会敞开。关系因此走得慢，但一旦结成，就很有分量。',
      strengths: ['少而深的关系', '把受伤的风险压到最低', '决定做得慎重', '对自己的理解很深'],
      tips: ['一点一点做些小的信任实验', '不是每段关系都要用同一把尺', '记得，也有人正在等你'],
      affirmation: '慢不等于落后。你的谨慎是真诚关系的地基。',
    },
    fr: {
      title: 'Prudent',
      subtitle: 'Vous bâtissez lentement, solidement',
      description: 'Vous accordez votre confiance avec beaucoup de prudence : il vous faut du temps et de l’observation avant de vous ouvrir. Les relations avancent lentement, mais celles qui se nouent comptent vraiment.',
      strengths: ['Peu de relations, mais profondes', 'Le risque d’être blessé réduit au minimum', 'Des décisions mûries', 'Une connaissance de soi profonde'],
      tips: ['Tenter peu à peu de petites expériences de confiance', 'Ne pas appliquer la même mesure à toutes les relations', 'Se rappeler que quelqu’un vous attend peut-être'],
      affirmation: 'Aller lentement n’est pas être en retard. Votre prudence est le socle de relations sincères.',
    },
    es: {
      title: 'Cauto',
      subtitle: 'Construyes despacio y firme',
      description: 'Das tu confianza con mucha prudencia: necesitas tiempo y observación antes de abrirte. Los vínculos avanzan despacio, pero los que se forman pesan de verdad.',
      strengths: ['Pocas relaciones, pero hondas', 'El riesgo de salir herido reducido al mínimo', 'Decisiones bien pensadas', 'Un conocimiento hondo de ti mismo'],
      tips: ['Probar poco a poco pequeños experimentos de confianza', 'No aplicar la misma vara a todas las relaciones', 'Recordar que quizá alguien te está esperando'],
      affirmation: 'Ir despacio no es ir por detrás. Tu prudencia es la base de vínculos sinceros.',
    },
  },
  guarded: {
    ko: {
      title: '방어형',
      subtitle: '당신은 스스로를 보호하는 법을 알고 있습니다',
      description: '신뢰하기가 매우 어렵게 느껴집니다. 이는 과거의 경험이나 상처에서 비롯된 경우가 많습니다. 자신을 보호하려는 본능은 자연스럽지만, 때로는 고립감으로 이어질 수 있습니다.',
      strengths: ['자기 보호 본능이 강함', '독립적이고 자율적', '조심스러운 정보 공유로 안전 유지', '깊은 내면 세계 보유'],
      tips: ['혼자 모든 것을 해결할 필요는 없음을 기억하기', '신뢰의 작은 단계들을 안전하게 실험해보기', '과거의 경험이 현재 모든 관계를 정의하지 않음'],
      affirmation: '당신이 경계를 갖는 것은 이유가 있습니다. 그 경계 안에도, 연결될 준비가 된 당신이 있습니다.',
    },
    en: {
      title: 'Guarded',
      subtitle: 'You know how to protect yourself',
      description: 'Trusting others feels very difficult. This often stems from past experiences or wounds. The instinct to protect yourself is natural, but it can sometimes lead to feelings of isolation.',
      strengths: ['Strong self-protective instinct', 'Independent and autonomous', 'Stays safe through careful information sharing', 'Rich inner world'],
      tips: ['Remember you do not have to solve everything alone', 'Safely experiment with small steps of trust', 'Past experiences do not define every current relationship'],
      affirmation: 'There is a reason you have your boundaries. Within those boundaries, there is also a version of you ready to connect.',
    },
    ja: {
      title: '防衛型',
      subtitle: 'あなたは自分を守る方法を知っています',
      description: '信頼することがとても難しく感じられます。これは過去の経験や傷から来ていることが多いです。自分を守ろうとする本能は自然ですが、孤立感につながることもあります。',
      strengths: ['強い自己防衛本能', '自立的・自律的', '慎重な情報共有で安全を保つ', '豊かな内面世界'],
      tips: ['すべてを一人で解決する必要はないことを覚える', '小さな信頼のステップを安全に試す', '過去の経験が今のすべての関係を定義するわけではない'],
      affirmation: 'あなたが境界を持つのには理由があります。その境界の中にも、つながる準備ができたあなたがいます。',
    },
    zh: {
      title: '防守型',
      subtitle: '你懂得怎么保护自己',
      description: '要你去相信，是很难的事。这常常来自过去的经历或伤。想保护自己是自然的本能，但有时候也会把人推向孤单。',
      strengths: ['自我保护的本能强', '独立，也自主', '把资讯分享得谨慎，保住安全', '内心世界很深'],
      tips: ['记得：不是所有事都得一个人扛', '在安全的范围里，试试信任的小步骤', '过去的经历，不该定义现在所有的关系'],
      affirmation: '你会立起界线，是有理由的。而在那道界线里面，也有一个准备好去连结的你。',
    },
    fr: {
      title: 'Sur ses gardes',
      subtitle: 'Vous savez vous protéger',
      description: 'Faire confiance vous est très difficile. Cela vient souvent d’expériences ou de blessures passées. L’instinct de se protéger est naturel, mais il peut parfois mener à l’isolement.',
      strengths: ['Un instinct de protection solide', 'Indépendant et autonome', 'Vous partagez l’information avec prudence, ce qui vous garde en sécurité', 'Un monde intérieur profond'],
      tips: ['Se rappeler qu’on n’a pas à tout porter seul', 'Tenter de petits pas de confiance dans un cadre sûr', 'Le passé ne définit pas toutes vos relations présentes'],
      affirmation: 'Si vous posez ces limites, il y a une raison. Et derrière elles se tient un vous prêt à se relier.',
    },
    es: {
      title: 'En guardia',
      subtitle: 'Sabes protegerte',
      description: 'Confiar te resulta muy difícil. Suele venir de experiencias o heridas del pasado. El instinto de protegerte es natural, aunque a veces lleva al aislamiento.',
      strengths: ['Un instinto de protección fuerte', 'Independiente y autónomo', 'Compartes la información con cautela y eso te mantiene a salvo', 'Un mundo interior hondo'],
      tips: ['Recordar que no tienes que cargar con todo solo', 'Probar pasos pequeños de confianza en un entorno seguro', 'El pasado no define todas tus relaciones de ahora'],
      affirmation: 'Si pones esos límites, es por algo. Y tras ellos hay un tú listo para vincularse.',
    },
  },
}

interface Props { locale?: string }

export default function TrustStyleTest({ locale: lp = 'ko' }: Props) {
  const l = lang(lp)
  const lb = LABELS[l]
  const questions = QUESTIONS[l]

  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<Record<StyleKey, number>>({ quick: 0, earned: 0, cautious: 0, guarded: 0 })
  const [result, setResult] = useState<StyleKey | null>(null)
  useRecordFinishedTest({ testId: "trust-style", title: "TrustStyleTest", finished: Boolean(result) });

  function pick(choiceIndex: number) {
    const style = STYLE_ORDER[choiceIndex]
    const next = { ...scores, [style]: scores[style] + 1 }
    if (current + 1 >= questions.length) {
      const top = (Object.keys(next) as StyleKey[]).reduce((a, b) => next[a] >= next[b] ? a : b)
      setResult(top)
    }
    setScores(next)
    setCurrent(current + 1)
  }

  function restart() { setScores({ quick: 0, earned: 0, cautious: 0, guarded: 0 }); setCurrent(0); setResult(null) }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result][l].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= questions.length
  const maxScore = questions.length

  if (!finished) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      <Questionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={q.choices.map((choice, i) => ({ label: choice, value: i + 1 }))}
        note={lb.note}
        onSelect={(value) => pick(value - 1)}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result][l]
  const styleColors: Record<StyleKey, string> = { quick: '#22c55e', earned: '#16a34a', cautious: '#f59e0b', guarded: '#6b7280' }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{lb.yourStyle}</p>
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white" style={{ backgroundColor: styleColors[result] }}>
          {r.title}
        </div>
        <p className="font-bold" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{r.subtitle}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{r.description}</p>
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm">{lb.barLabel}</h3>
        {(Object.keys(scores) as StyleKey[]).map(sk => {
          const pct = Math.round((scores[sk] / maxScore) * 100)
          return (
            <div key={sk} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{lb.dimLabels[sk]}</span>
                <span>{scores[sk]}</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={lb.dimLabels[sk]}
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--muted, #e5e7eb)' }}
              >
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: styleColors[sk] }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm">{lb.strengths}</h3>
        <ul className="space-y-1">{r.strengths.map(s => <li key={s} className="text-sm flex gap-2" style={{ color: 'var(--muted-foreground, #6b7280)' }}><span>•</span>{s}</li>)}</ul>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: 'var(--card, #fff)' }}>
        <h3 className="font-bold text-sm" style={{ color: '#16a34a' }}>{lb.tips}</h3>
        <ul className="space-y-1">{r.tips.map(t => <li key={t} className="text-sm flex gap-2" style={{ color: 'var(--muted-foreground, #6b7280)' }}><span style={{ color: '#22c55e' }}>→</span>{t}</li>)}</ul>
      </div>

      <div className="rounded-xl border p-4 space-y-1" style={{ borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
        <h3 className="font-bold text-sm" style={{ color: '#16a34a' }}>{lb.affirmation}</h3>
        <p className="text-sm" style={{ color: '#15803d' }}>"{r.affirmation}"</p>
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--muted-foreground, #6b7280)' }}>{lb.note}</p>
      <div className="flex gap-3">
        <button
          onClick={restart}
          aria-label={lb.restart}
          className="flex-1 rounded-lg border px-4 py-2 text-sm font-bold transition-colors"
          style={{ backgroundColor: 'var(--card, #fff)' }}
        >{lb.restart}</button>
        <button
          onClick={share}
          aria-label={lb.share}
          className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#16a34a' }}
        >{lb.share}</button>
      </div>
      <ShareResultButton locale={lp} heading={lb.title} resultTitle={r.title} />
    </div>
  )
}
