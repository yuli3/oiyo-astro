'use client';

import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire';
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en';
}

interface Question {
  id: string;
  dimension: 1 | 2 | 3 | 4 | 5 | 6;
  text: Record<SupportedLang, string>;
}

interface DimensionInfo {
  name: Record<SupportedLang, string>;
  desc: Record<SupportedLang, string>;
  icon: string;
  lowAdvice: Record<SupportedLang, string>;
  highAdvice: Record<SupportedLang, string>;
}

const DIMENSIONS: Record<1 | 2 | 3 | 4 | 5 | 6, DimensionInfo> = {
  1: {
    name: { ko: '자기절제', en: 'Self-Discipline', ja: '自己制御', zh: '自律', fr: 'Maîtrise de soi', es: 'Autocontrol' },
    desc: { ko: '충동과 유혹을 조절하고 장기 목표를 위해 단기 욕구를 지연하는 능력', en: 'The ability to regulate impulses and delay gratification for long-term goals', ja: '衝動を制御し、長期目標のために短期的欲求を遅らせる能力', zh: '调节冲动与诱惑，为长期目标延迟短期欲望的能力', fr: 'Capacité à réguler impulsions et tentations et à différer un désir immédiat au profit d’un objectif à long terme', es: 'Capacidad de regular impulsos y tentaciones y posponer deseos inmediatos por metas a largo plazo' },
    icon: '🧘',
    lowAdvice: { ko: '작은 습관부터 시작하세요. 5분 명상, 운동 10분. 절제 근육은 훈련됩니다.', en: 'Start with small habits. 5-minute meditation, 10-minute exercise. The discipline muscle can be trained.', ja: '小さな習慣から始めましょう。5分の瞑想、10分の運動。自制心は訓練できます。', zh: '从小习惯开始：冥想 5 分钟、运动 10 分钟。自律的肌肉是可以锻炼的。', fr: 'Commencez par de petites habitudes : 5 minutes de méditation, 10 minutes de sport. La maîtrise de soi se muscle.', es: 'Empieza por hábitos pequeños: 5 minutos de meditación, 10 de ejercicio. El autocontrol se entrena.' },
    highAdvice: { ko: '강한 자기절제를 유지하세요. 다른 사람에게도 그 힘을 나눠주세요.', en: 'Keep your strong self-discipline. Share this strength with others.', ja: '強い自己制御を維持してください。その力を他の人にも分かち合いましょう。', zh: '保持强大的自律，也把这份力量分享给别人。', fr: 'Gardez cette forte maîtrise de soi, et partagez cette force avec les autres.', es: 'Mantén ese fuerte autocontrol y comparte esa fuerza con los demás.' },
  },
  2: {
    name: { ko: '삶의 서사', en: 'Life Narrative', ja: '人生の物語', zh: '人生叙事', fr: 'Récit de vie', es: 'Relato vital' },
    desc: { ko: '자신의 경험을 의미 있는 이야기로 엮어 정체성을 만드는 능력', en: 'The ability to weave your experiences into a meaningful narrative to form identity', ja: '自分の経験を意味ある物語に編んでアイデンティティを形成する能力', zh: '把自己的经历编织成有意义的故事、形成身份认同的能力', fr: 'Capacité à tisser ses expériences en une histoire qui a du sens et à forger son identité', es: 'Capacidad de tejer tus experiencias en una historia con sentido y construir tu identidad' },
    icon: '📖',
    lowAdvice: { ko: '매일 저녁 3문장으로 오늘을 기록해보세요. 당신의 이야기가 보이기 시작합니다.', en: "Write 3 sentences about today every evening. Your story will start to emerge.", ja: '毎晩3文で今日を記録してみてください。あなたの物語が見えてきます。', zh: '每晚用三句话记录今天。你的故事会开始浮现。', fr: 'Chaque soir, résumez votre journée en trois phrases. Votre histoire commencera à se dessiner.', es: 'Cada noche, resume tu día en tres frases. Tu historia empezará a verse.' },
    highAdvice: { ko: '당신의 풍부한 서사를 다른 이들과 나누세요. 멘토링이나 글쓰기를 고려해보세요.', en: "Share your rich narrative with others. Consider mentoring or writing.", ja: '豊かな物語を他の人と分かち合いましょう。メンタリングや執筆を検討してください。', zh: '把你丰富的故事分享给别人。可以考虑当导师或写作。', fr: 'Partagez votre riche récit avec les autres. Pensez au mentorat ou à l’écriture.', es: 'Comparte tu rico relato con otros. Plantéate la mentoría o la escritura.' },
  },
  3: {
    name: { ko: '목표 몰입', en: 'Goal Focus', ja: '目標への集中', zh: '目标专注', fr: 'Engagement dans les objectifs', es: 'Compromiso con las metas' },
    desc: { ko: '중요한 목표에 에너지를 집중하고 방해 요소를 필터링하는 능력', en: 'The ability to focus energy on important goals and filter distractions', ja: '重要な目標にエネルギーを集中し、妨害要素をフィルタリングする能力', zh: '把精力集中在重要目标上、过滤干扰的能力', fr: 'Capacité à concentrer son énergie sur les objectifs importants et à filtrer les distractions', es: 'Capacidad de concentrar la energía en metas importantes y filtrar las distracciones' },
    icon: '🎯',
    lowAdvice: { ko: '목표를 3개 이하로 줄이세요. 모든 것을 잡으려 하면 아무것도 잡지 못합니다.', en: 'Reduce your goals to 3 or fewer. Trying to grab everything means grabbing nothing.', ja: '目標を3つ以下に減らしましょう。すべてを掴もうとすると何も掴めません。', zh: '把目标减到 3 个以内。什么都想抓，就什么都抓不住。', fr: 'Réduisez vos objectifs à trois au maximum. À vouloir tout saisir, on ne saisit rien.', es: 'Reduce tus metas a tres como mucho. Quien quiere abarcarlo todo no abarca nada.' },
    highAdvice: { ko: '뛰어난 집중력이 있습니다. 올바른 목표를 선택하고 있는지 주기적으로 점검하세요.', en: 'You have excellent focus. Periodically check that you are pursuing the right goals.', ja: '優れた集中力があります。正しい目標を追っているかを定期的に確認しましょう。', zh: '你有出色的专注力。定期检查自己是否选对了目标。', fr: 'Votre concentration est remarquable. Vérifiez régulièrement que vous visez les bons objectifs.', es: 'Tienes una gran capacidad de concentración. Revisa de vez en cuando si has elegido bien tus metas.' },
  },
  4: {
    name: { ko: '한계 돌파', en: 'Limit-Breaking', ja: '限界突破', zh: '突破极限', fr: 'Dépassement des limites', es: 'Superar límites' },
    desc: { ko: '자신이 만든 정신적 장벽을 인식하고 넘어서는 능력', en: 'The ability to recognize and overcome the mental barriers you have created', ja: '自分が作った精神的な壁を認識し、乗り越える能力', zh: '察觉并跨越自己设下的心理障碍的能力', fr: 'Capacité à reconnaître et franchir les barrières mentales qu’on s’impose', es: 'Capacidad de reconocer y superar las barreras mentales que uno mismo se pone' },
    icon: '🚀',
    lowAdvice: { ko: '"나는 못해"라는 생각이 들 때 "아직 안 해봤다"로 바꿔보세요.', en: 'When you think "I can\'t", change it to "I haven\'t tried yet."', ja: '「できない」と思ったとき、「まだやっていない」に変えてみてください。', zh: '冒出“我做不到”时，换成“我还没试过”。', fr: 'Quand vous pensez « je n’y arrive pas », remplacez par « je n’ai pas encore essayé ».', es: 'Cuando pienses «no puedo», cámbialo por «aún no lo he intentado».' },
    highAdvice: { ko: '한계를 잘 돌파합니다. 이 힘으로 남들이 포기한 일에 도전하세요.', en: 'You break through limits well. Use this strength to tackle what others have given up on.', ja: '限界を上手く突破できています。この力で他の人が諦めたことに挑戦してください。', zh: '你很善于突破极限。用这份力量去挑战别人放弃的事吧。', fr: 'Vous dépassez bien vos limites. Servez-vous de cette force pour relever les défis que d’autres abandonnent.', es: 'Superas bien tus límites. Usa esa fuerza para afrontar retos que otros abandonan.' },
  },
  5: {
    name: { ko: '평정심', en: 'Equanimity', ja: '平静心', zh: '平静', fr: 'Sérénité', es: 'Serenidad' },
    desc: { ko: '어떤 상황에서도 정서적 균형을 유지하고 빠르게 회복하는 능력', en: 'The ability to maintain emotional balance and recover quickly in any situation', ja: 'どんな状況でも感情的なバランスを保ち、素早く回復する能力', zh: '在任何情况下都能维持情绪平衡、迅速恢复的能力', fr: 'Capacité à garder l’équilibre émotionnel en toute situation et à récupérer vite', es: 'Capacidad de mantener el equilibrio emocional en cualquier situación y recuperarse rápido' },
    icon: '⚖️',
    lowAdvice: { ko: '감정에 반응하기 전에 10초를 멈추세요. 그 공간에서 다른 선택이 가능해집니다.', en: 'Pause for 10 seconds before reacting to emotions. Different choices become possible in that space.', ja: '感情に反応する前に10秒止まりましょう。その空間で別の選択が可能になります。', zh: '对情绪作出反应前，先停 10 秒。在那段空隙里，就有别的选择。', fr: 'Avant de réagir à une émotion, marquez une pause de 10 secondes. Dans cet espace, un autre choix devient possible.', es: 'Antes de reaccionar a una emoción, para 10 segundos. En ese espacio aparece otra opción.' },
    highAdvice: { ko: '탁월한 평정심을 갖고 있습니다. 위기 상황에서 주변 사람들의 닻이 되어줄 수 있습니다.', en: 'You have excellent equanimity. You can be an anchor for those around you in times of crisis.', ja: '卓越した平静心があります。危機的な状況で周りの人の錨になれます。', zh: '你拥有出色的平静心。在危机中，你能成为身边人的锚。', fr: 'Votre sérénité est remarquable. En situation de crise, vous pouvez être l’ancre de votre entourage.', es: 'Tienes una serenidad excepcional. En una crisis puedes ser el ancla de quienes te rodean.' },
  },
  6: {
    name: { ko: '리더십', en: 'Leadership', ja: 'リーダーシップ', zh: '领导力', fr: 'Leadership', es: 'Liderazgo' },
    desc: { ko: '타인에게 영감을 주고 공동의 목표를 향해 이끄는 능력', en: 'The ability to inspire others and lead toward shared goals', ja: '他者を鼓舞し、共通の目標に向かって導く能力', zh: '激励他人、带领大家朝共同目标前进的能力', fr: 'Capacité à inspirer les autres et à les mener vers un objectif commun', es: 'Capacidad de inspirar a otros y guiarlos hacia una meta común' },
    icon: '👑',
    lowAdvice: { ko: '리더십은 직위가 아닙니다. 오늘 한 사람에게 진심 어린 피드백을 주는 것부터 시작하세요.', en: 'Leadership is not a position. Start by giving one person sincere feedback today.', ja: 'リーダーシップは地位ではありません。今日、一人に誠実なフィードバックを与えることから始めましょう。', zh: '领导力不是职位。从今天给一个人真诚的反馈开始吧。', fr: 'Le leadership n’est pas un poste. Commencez aujourd’hui par donner un retour sincère à une personne.', es: 'El liderazgo no es un cargo. Empieza hoy dando a alguien una opinión sincera.' },
    highAdvice: { ko: '강한 리더십을 발휘하고 있습니다. 이 능력이 더 큰 무대에서 발휘될 기회를 찾아보세요.', en: 'You are demonstrating strong leadership. Look for opportunities to exercise this ability on a larger stage.', ja: '強いリーダーシップを発揮しています。この能力がより大きな舞台で発揮される機会を探してください。', zh: '你正发挥着强大的领导力。去寻找能在更大舞台上发挥的机会吧。', fr: 'Vous faites preuve d’un fort leadership. Cherchez des occasions de l’exercer sur une plus grande scène.', es: 'Ejerces un liderazgo fuerte. Busca oportunidades para desplegarlo en un escenario mayor.' },
  },
};

const QUESTIONS: Question[] = [
  { id: 'q1', dimension: 1, text: { ko: '하고 싶지 않아도 해야 하는 일을 꾸준히 완수한다', en: 'I consistently complete tasks I need to do even when I don\'t want to', ja: 'やりたくなくても、やるべきことを着実に完了する', zh: '即使不想做，该做的事我也会持续完成', fr: 'J’accomplis régulièrement ce que je dois faire, même sans en avoir envie', es: 'Cumplo con constancia lo que debo hacer aunque no me apetezca' } },
  { id: 'q2', dimension: 1, text: { ko: '유혹이 있어도 장기 목표를 위해 지금의 즐거움을 참을 수 있다', en: 'Even with temptations, I can resist current pleasures for long-term goals', ja: '誘惑があっても、長期目標のために今の楽しみを我慢できる', zh: '即使有诱惑，我也能为了长期目标忍住眼前的快乐', fr: 'Même tenté, je peux renoncer à un plaisir immédiat pour un objectif à long terme', es: 'Aunque haya tentaciones, puedo renunciar a un placer inmediato por una meta a largo plazo' } },
  { id: 'q3', dimension: 2, text: { ko: '내 삶의 경험들이 하나의 의미 있는 이야기로 연결된다고 느낀다', en: 'I feel that my life experiences connect into one meaningful story', ja: '自分の人生経験が一つの意味ある物語として繋がっていると感じる', zh: '我觉得人生的经历连成了一个有意义的故事', fr: 'J’ai le sentiment que mes expériences de vie forment une histoire qui a du sens', es: 'Siento que las experiencias de mi vida forman una historia con sentido' } },
  { id: 'q4', dimension: 2, text: { ko: '어려운 경험도 내 성장의 일부로 의미 있게 받아들일 수 있다', en: 'I can meaningfully accept even difficult experiences as part of my growth', ja: '困難な経験も自分の成長の一部として意味深く受け入れられる', zh: '即使是艰难的经历，我也能把它当成成长的一部分，赋予意义', fr: 'Je peux donner du sens aux épreuves en les voyant comme une part de ma croissance', es: 'Puedo dar sentido incluso a las experiencias difíciles como parte de mi crecimiento' } },
  { id: 'q5', dimension: 3, text: { ko: '중요한 일에 에너지를 집중하고 사소한 일에 흔들리지 않는다', en: 'I focus energy on important things and am not swayed by trivial matters', ja: '重要なことにエネルギーを集中し、些細なことに揺れない', zh: '我能把精力集中在重要的事上，不被琐事动摇', fr: 'Je concentre mon énergie sur l’essentiel sans me laisser distraire par les détails', es: 'Concentro mi energía en lo importante y no me distraen las pequeñeces' } },
  { id: 'q6', dimension: 3, text: { ko: '한 번 시작한 목표는 끝까지 집중하여 완료하는 편이다', en: 'I tend to focus and complete goals I have started to the end', ja: '一度始めた目標は最後まで集中して完了する方だ', zh: '目标一旦开始，我通常会专注到完成为止', fr: 'Une fois un objectif lancé, j’ai tendance à m’y consacrer jusqu’au bout', es: 'Cuando empiezo una meta, suelo concentrarme en ella hasta terminarla' } },
  { id: 'q7', dimension: 4, text: { ko: '"나는 이런 사람이야"라는 고정된 자기 이미지에서 벗어날 수 있다', en: 'I can break free from the fixed self-image of "this is who I am"', ja: '「私はこういう人間だ」という固定した自己イメージから抜け出せる', zh: '我能摆脱“我就是这种人”的固定自我形象', fr: 'Je peux sortir d’une image figée de moi-même (« je suis comme ça »)', es: 'Puedo salir de una imagen fija de mí mismo («yo soy así»)' } },
  { id: 'q8', dimension: 4, text: { ko: '두렵더라도 새로운 도전과 낯선 상황에 뛰어든다', en: 'Even if afraid, I jump into new challenges and unfamiliar situations', ja: '恐くても、新しい挑戦や慣れない状況に飛び込む', zh: '即使害怕，我也会投入新的挑战和陌生的情境', fr: 'Même si j’ai peur, je me lance dans de nouveaux défis et des situations inconnues', es: 'Aunque tenga miedo, me lanzo a retos nuevos y situaciones desconocidas' } },
  { id: 'q9', dimension: 5, text: { ko: '예상치 못한 나쁜 일이 생겨도 비교적 빠르게 평정심을 되찾는다', en: 'Even when unexpected bad things happen, I regain composure relatively quickly', ja: '予想外の悪いことが起きても、比較的早く平静を取り戻す', zh: '即使发生意外的坏事，我也能较快恢复平静', fr: 'Même face à un imprévu fâcheux, je retrouve assez vite mon calme', es: 'Aunque pase algo malo e inesperado, recupero la calma con relativa rapidez' } },
  { id: 'q10', dimension: 5, text: { ko: '감정에 휩쓸리기보다 상황을 객관적으로 바라보려 노력한다', en: 'I try to look at situations objectively rather than being swept up in emotions', ja: '感情に流されるより、状況を客観的に見ようと努力する', zh: '比起被情绪卷走，我会努力客观地看待情况', fr: 'Plutôt que de me laisser emporter par l’émotion, je m’efforce de voir la situation objectivement', es: 'En vez de dejarme arrastrar por las emociones, intento ver la situación con objetividad' } },
  { id: 'q11', dimension: 6, text: { ko: '내 행동이 주변 사람들에게 긍정적인 영향을 준다고 느낀다', en: 'I feel that my actions have a positive impact on the people around me', ja: '自分の行動が周りの人に良い影響を与えていると感じる', zh: '我觉得自己的行为给身边的人带来正面影响', fr: 'J’ai le sentiment que mes actes ont une influence positive sur mon entourage', es: 'Siento que lo que hago influye positivamente en quienes me rodean' } },
  { id: 'q12', dimension: 6, text: { ko: '공동의 목표를 위해 사람들을 하나로 모을 수 있다', en: 'I can bring people together for a common goal', ja: '共通の目標のために人々をまとめることができる', zh: '我能为了共同的目标把大家团结起来', fr: 'Je sais rassembler les gens autour d’un objectif commun', es: 'Sé unir a la gente en torno a una meta común' } },
];

const LABELS = {
  ko: {
    title: '내면 근력 자가진단',
    subtitle: '6가지 차원으로 측정하는 나의 내면 힘',
    instruction: '각 문항에 얼마나 동의하는지 선택해주세요.',
    scale: ['전혀 아니다', '아닌 편이다', '보통이다', '그런 편이다', '매우 그렇다'],
    result: '진단 결과',
    yourScore: '나의 점수',
    outOf: '/ 10',
    restart: '다시 하기',
    strengthLabel: '강점',
    growthLabel: '성장 기회',
    totalLabel: '총 내면 근력 지수',
    note: '이 진단은 자기이해를 돕기 위한 참고 도구입니다. 전문적 상담을 대체하지 않습니다.',
    next: '다음',
    prev: '이전',
    submit: '결과 보기',
    of: '번째 질문',
  },
  en: {
    title: 'Inner Strength Assessment',
    subtitle: 'Measure your inner strength across 6 dimensions',
    instruction: 'Select how much you agree with each statement.',
    scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    result: 'Your Results',
    yourScore: 'Your Score',
    outOf: '/ 10',
    restart: 'Restart',
    strengthLabel: 'Strengths',
    growthLabel: 'Growth Areas',
    totalLabel: 'Total Inner Strength Index',
    note: 'This assessment is a reference tool for self-understanding. It does not replace professional counseling.',
    next: 'Next',
    prev: 'Previous',
    submit: 'See Results',
    of: 'of',
  },
  ja: {
    title: '内面強度自己診断',
    subtitle: '6つの次元で測る内面の力',
    instruction: '各項目にどの程度同意するか選択してください。',
    scale: ['全くない', 'ない方だ', '普通', 'ある方だ', 'とてもそうだ'],
    result: '診断結果',
    yourScore: '私のスコア',
    outOf: '/ 10',
    restart: 'やり直す',
    strengthLabel: '強み',
    growthLabel: '成長の機会',
    totalLabel: '総内面強度指数',
    note: 'この診断は自己理解を助けるための参考ツールです。専門的なカウンセリングの代替ではありません。',
    next: '次へ',
    prev: '前へ',
    submit: '結果を見る',
    of: '番目の質問',
  },
  zh: {
    title: '内在力量自我诊断',
    subtitle: '用六个维度测量我的内在力量',
    instruction: '请选择你对每个题目的同意程度。',
    scale: ['完全不是', '不太是', '一般', '比较是', '非常是'],
    result: '诊断结果',
    yourScore: '我的分数',
    outOf: '/ 10',
    restart: '重新测验',
    strengthLabel: '优势',
    growthLabel: '成长机会',
    totalLabel: '内在力量总指数',
    note: '本诊断是帮助认识自己的参考工具，不能替代专业咨询。',
    next: '下一题',
    prev: '上一题',
    submit: '查看结果',
    of: '题',
  },
  fr: {
    title: 'Auto-évaluation de la force intérieure',
    subtitle: 'Ma force intérieure mesurée sur six dimensions',
    instruction: 'Indiquez dans quelle mesure vous êtes d’accord avec chaque affirmation.',
    scale: ['Pas du tout', 'Plutôt pas', 'Moyennement', 'Plutôt oui', 'Tout à fait'],
    result: 'Résultat',
    yourScore: 'Mon score',
    outOf: '/ 10',
    restart: 'Recommencer',
    strengthLabel: 'Forces',
    growthLabel: 'Pistes de croissance',
    totalLabel: 'Indice global de force intérieure',
    note: 'Cette évaluation est un outil de référence pour mieux se connaître. Elle ne remplace pas un accompagnement professionnel.',
    next: 'Suivant',
    prev: 'Précédent',
    submit: 'Voir le résultat',
    of: 'e question',
  },
  es: {
    title: 'Autoevaluación de la fuerza interior',
    subtitle: 'Mi fuerza interior medida en seis dimensiones',
    instruction: 'Indica cuánto estás de acuerdo con cada afirmación.',
    scale: ['Nada', 'Poco', 'A medias', 'Bastante', 'Totalmente'],
    result: 'Resultado',
    yourScore: 'Mi puntuación',
    outOf: '/ 10',
    restart: 'Repetir',
    strengthLabel: 'Fortalezas',
    growthLabel: 'Oportunidades de crecimiento',
    totalLabel: 'Índice global de fuerza interior',
    note: 'Esta evaluación es una herramienta de referencia para conocerte mejor. No sustituye la ayuda profesional.',
    next: 'Siguiente',
    prev: 'Anterior',
    submit: 'Ver resultado',
    of: '.ª pregunta',
  },
};

interface Props { locale?: string; }

export default function InnerStrengthTest({ locale: lp = 'ko' }: Props) {

  const L = lang(lp);
  const locale = L;
  const lb = LABELS[L];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  useRecordFinishedTest({ testId: "inner-strength", title: "InnerStrengthTest", finished: Boolean(done) });

  const q = QUESTIONS[current];
  const total = QUESTIONS.length;

  // 고르면 바로 다음 문항으로 넘어간다 — 공용 Questionnaire 와 같은 모델이라
  // 선택 후 "다음"을 한 번 더 누르던 2단계 확인은 없앴다. 답은 문항 id 로 남으므로
  // 뒤로 가면 고른 값이 그대로 표시된다.
  const handleAnswer = (val: number) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }));
    if (current < total - 1) setCurrent(c => c + 1);
    else setDone(true);
  };

  const handlePrev = () => { if (current > 0) setCurrent(c => c - 1); };
  const handleRestart = () => { setAnswers({}); setCurrent(0); setDone(false); };

  // Compute dimension scores (0–10)
  const dimScores = (() => {
    const scores: Record<number, { sum: number; count: number }> = {};
    QUESTIONS.forEach(q => {
      const d = q.dimension;
      if (!scores[d]) scores[d] = { sum: 0, count: 0 };
      const ans = answers[q.id];
      if (ans !== undefined) { scores[d].sum += ans; scores[d].count++; }
    });
    const result: Record<number, number> = {};
    for (let d = 1; d <= 6; d++) {
      const s = scores[d];
      result[d] = s && s.count > 0 ? Math.round((s.sum / (s.count * 4)) * 10) : 0;
    }
    return result;
  })();

  const totalScore = Math.round(Object.values(dimScores).reduce((a, b) => a + b, 0) / 6);
  const strengths = (Object.entries(dimScores) as [string, number][]).filter(([, v]) => v >= 7).map(([k]) => parseInt(k) as 1|2|3|4|5|6);
  const growths = (Object.entries(dimScores) as [string, number][]).filter(([, v]) => v < 5).map(([k]) => parseInt(k) as 1|2|3|4|5|6);

  const progress = ((current + 1) / total) * 100;

  if (done) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🧠</div>
          <h2 className="text-2xl font-bold text-slate-900">{lb.result}</h2>
          <p className="text-slate-500 mt-1">{lb.totalLabel}: <span className="font-bold text-green-600 text-xl">{totalScore}/10</span></p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {([1,2,3,4,5,6] as const).map(d => {
            const dim = DIMENSIONS[d];
            const score = dimScores[d];
            const isStrength = score >= 7;
            const isGrowth = score < 5;
            return (
              <div key={d} className={`rounded-2xl border p-5 ${isStrength ? 'border-green-200 bg-surface-subtle' : isGrowth ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-card'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{dim.icon}</span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{dim.name[L]}</div>
                      <div className="text-xs text-slate-500">{dim.desc[L]}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-700">{score}<span className="text-sm font-normal text-slate-400">/10</span></div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full transition-all ${isStrength ? 'bg-green-500' : isGrowth ? 'bg-orange-400' : 'bg-green-500'}`} style={{ width: `${score * 10}%` }} />
                </div>
                <p className="text-xs text-slate-600">{score >= 7 ? dim.highAdvice[L] : dim.lowAdvice[L]}</p>
              </div>
            );
          })}
        </div>

        {strengths.length > 0 && (
          <div className="bg-surface-subtle rounded-2xl p-5 border border-green-200">
            <div className="font-bold text-green-800 mb-2">✨ {lb.strengthLabel}</div>
            <div className="flex flex-wrap gap-2">
              {strengths.map(d => <span key={d} className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">{DIMENSIONS[d].icon} {DIMENSIONS[d].name[L]}</span>)}
            </div>
          </div>
        )}

        {growths.length > 0 && (
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
            <div className="font-bold text-orange-800 mb-2">🌱 {lb.growthLabel}</div>
            <div className="flex flex-wrap gap-2">
              {growths.map(d => <span key={d} className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">{DIMENSIONS[d].icon} {DIMENSIONS[d].name[L]}</span>)}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 px-4">{lb.note}</p>
        <ShareResultButton
          locale={locale}
          heading={lb.title}
          resultTitle={`${lb.totalLabel}: ${totalScore}/10`}
          emoji="🧠"
          description={lb.subtitle}
        />
        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${locale}/ontology/life-purpose/`, label: ({ ko: '🧭 삶의 목적 지도', en: '🧭 Life purpose map', ja: '🧭 人生の目的マップ', zh: '🧭 人生目的地图', fr: '🧭 Carte du sens de la vie', es: '🧭 Mapa del propósito vital' } as Record<string, string>)[locale] ?? '🧭 Life purpose map' },
            { href: `/${locale}/self-esteem/test/`, label: ({ ko: '🌿 자존감 테스트', en: '🌿 Self-esteem test', ja: '🌿 自尊感情テスト', zh: '🌿 自尊测验', fr: '🌿 Test d’estime de soi', es: '🌿 Test de autoestima' } as Record<string, string>)[locale] ?? '🌿 Self-esteem test' },
            { href: `/${locale}/habit-builder/guide/`, label: ({ ko: '✅ 습관 만들기 가이드', en: '✅ Habit builder guide', ja: '✅ 習慣づくりガイド', zh: '✅ 养成习惯指南', fr: '✅ Guide pour créer des habitudes', es: '✅ Guía para crear hábitos' } as Record<string, string>)[locale] ?? '✅ Habit builder guide' },
          ]}
        />

        <button onClick={handleRestart} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-strong transition-colors">
          {lb.restart}
        </button>
      </div>
    );
  }

  return (
    /* 차원 배지는 Questionnaire 에 문항별 슬롯이 없어 subtitle 로 합친다.
       배지를 그냥 버리면 사용자가 보던 정보가 사라진다. */
    <Questionnaire
      title={lb.title}
      subtitle={`${lb.subtitle} · ${DIMENSIONS[q.dimension].icon} ${DIMENSIONS[q.dimension].name[L]}`}
      question={q.text[L]}
      questionLabel={`${current + 1} / ${total}`}
      progress={Math.round(progress)}
      options={lb.scale.map((label, idx) => ({ label, value: idx + 1 }))}
      selectedValue={answers[q.id] === undefined ? undefined : answers[q.id] + 1}
      note={lb.instruction}
      previousLabel={lb.prev}
      onPrevious={current > 0 ? handlePrev : undefined}
      onSelect={(value) => handleAnswer(value - 1)}
    />
  );
}
