import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire'
import ShareResultButton from '../shared/ShareResultButton'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

type Style = 'compete' | 'collaborate' | 'compromise' | 'avoid' | 'accommodate'
type Scores = Record<Style, number>
type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

interface Pair { a: { text: string; style: Style }; b: { text: string; style: Style } }
interface ResultData { title: string; subtitle: string; description: string; strengths: string[]; risks: string[]; tip: string; bestWith: string }

const COLORS: Record<Style, string> = {
  compete: '#ef4444', collaborate: '#22c55e', compromise: '#3b82f6',
  avoid: '#435D31', accommodate: '#f59e0b',
}

const LABELS: Record<Locale, {
  title: string; subtitle: string; pairOf: (c: number, t: number) => string; chooseOne: string
  restart: string; share: string; shareMsg: string; yourStyle: string
  strengths: string; risks: string; tip: string; bestWith: string; chartTitle: string
  types: Record<Style, string>
}> = {
  ko: {
    title: '갈등 해결 스타일 테스트', subtitle: '갈등 상황에서 나는 어떻게 반응하나요?',
    pairOf: (c, t) => `${c} / ${t}`, chooseOne: '더 자연스러운 반응을 선택해주세요',
    restart: '다시 하기', share: '결과 공유', shareMsg: '내 갈등 스타일은',
    yourStyle: '나의 갈등 해결 스타일', strengths: '강점', risks: '주의점', tip: '성장 조언', bestWith: '잘 맞는 상대',
    chartTitle: '갈등 스타일 분포',
    types: { compete: '경쟁형', collaborate: '협력형', compromise: '타협형', avoid: '회피형', accommodate: '양보형' },
  },
  en: {
    title: 'Conflict Resolution Style Test', subtitle: 'How do you respond in conflicts?',
    pairOf: (c, t) => `${c} / ${t}`, chooseOne: 'Choose the more natural response',
    restart: 'Retake', share: 'Share Result', shareMsg: 'My conflict style is',
    yourStyle: 'Your Conflict Style', strengths: 'Strengths', risks: 'Watch Out', tip: 'Growth Tip', bestWith: 'Best Match',
    chartTitle: 'Conflict Style Profile',
    types: { compete: 'Competing', collaborate: 'Collaborating', compromise: 'Compromising', avoid: 'Avoiding', accommodate: 'Accommodating' },
  },
  ja: {
    title: '葛藤解決スタイルテスト', subtitle: '葛藤の場面でどう反応しますか？',
    pairOf: (c, t) => `${c} / ${t}`, chooseOne: 'より自然な反応を選んでください',
    restart: 'もう一度', share: '結果を共有', shareMsg: '私の葛藤スタイルは',
    yourStyle: '葛藤解決スタイル', strengths: '強み', risks: '注意点', tip: '成長アドバイス', bestWith: '相性の良い相手',
    chartTitle: '葛藤スタイル分布',
    types: { compete: '競争型', collaborate: '協力型', compromise: '妥協型', avoid: '回避型', accommodate: '従順型' },
  },  zh: {
    title: '冲突处理风格测验', subtitle: '起冲突时，我通常怎么反应？',
    pairOf: (c, t) => `${c} / ${t}`, chooseOne: '选出更接近你的那一句',
    restart: '重新测验', share: '分享结果', shareMsg: '我的冲突风格是',
    yourStyle: '我的冲突处理风格', strengths: '长处', risks: '留意', tip: '成长建议', bestWith: '合得来的对象',
    chartTitle: '冲突风格分布',
    types: { compete: '竞争型', collaborate: '合作型', compromise: '妥协型', avoid: '回避型', accommodate: '迁就型' },
  },
  fr: {
    title: 'Test du style de gestion des conflits', subtitle: 'Comment réagissez-vous quand un conflit éclate ?',
    pairOf: (c, t) => `${c} / ${t}`, chooseOne: 'Choisissez la réaction qui vous ressemble le plus',
    restart: 'Recommencer', share: 'Partager le résultat', shareMsg: 'Mon style face aux conflits est',
    yourStyle: 'Votre style de gestion des conflits', strengths: 'Forces', risks: 'Points de vigilance', tip: 'Piste de progrès', bestWith: 'Bon binôme',
    chartTitle: 'Répartition des styles',
    types: { compete: 'Compétition', collaborate: 'Collaboration', compromise: 'Compromis', avoid: 'Évitement', accommodate: 'Accommodation' },
  },
  es: {
    title: 'Test de estilo ante los conflictos', subtitle: '¿Cómo reaccionas cuando surge un conflicto?',
    pairOf: (c, t) => `${c} / ${t}`, chooseOne: 'Elige la reacción que más se te parece',
    restart: 'Repetir', share: 'Compartir resultado', shareMsg: 'Mi estilo ante los conflictos es',
    yourStyle: 'Tu estilo ante los conflictos', strengths: 'Fortalezas', risks: 'Ten cuidado con', tip: 'Para crecer', bestWith: 'Buena pareja',
    chartTitle: 'Distribución de estilos',
    types: { compete: 'Competir', collaborate: 'Colaborar', compromise: 'Ceder a medias', avoid: 'Evitar', accommodate: 'Acomodarse' },
  },
}

const PAIRS: Record<Locale, Pair[]> = {
  ko: [
    { a: { text: '내 입장을 명확히 주장하고 관철시킨다', style: 'compete' }, b: { text: '갈등을 피하고 나중에 해결하려 한다', style: 'avoid' } },
    { a: { text: '모두가 만족하는 해결책을 찾을 때까지 논의한다', style: 'collaborate' }, b: { text: '상대방의 의견에 맞춰주며 관계를 지킨다', style: 'accommodate' } },
    { a: { text: '각자 양보해서 적당한 선에서 합의한다', style: 'compromise' }, b: { text: '내가 옳다고 생각하면 끝까지 주장한다', style: 'compete' } },
    { a: { text: '시간이 지나면 자연스럽게 해결될 거라 생각한다', style: 'avoid' }, b: { text: '상대와 깊이 대화하며 진짜 해결책을 찾는다', style: 'collaborate' } },
    { a: { text: '상대가 원하는 대로 해주는 게 더 편하다', style: 'accommodate' }, b: { text: '중간 지점을 찾아 서로 조금씩 양보한다', style: 'compromise' } },
    { a: { text: '갈등 상황을 직접 다루기보다 일단 자리를 피한다', style: 'avoid' }, b: { text: '이기는 것보다 최선의 결과를 찾는 게 중요하다', style: 'collaborate' } },
    { a: { text: '내가 지더라도 관계가 더 중요하다', style: 'accommodate' }, b: { text: '승패보다는 서로 반씩 양보하는 게 현실적이다', style: 'compromise' } },
    { a: { text: '논쟁보다 침묵이 낫다', style: 'avoid' }, b: { text: '분명하게 내 의견을 밝혀야 일이 해결된다', style: 'compete' } },
    { a: { text: '공동 이익을 위해 서로의 입장을 충분히 나눈다', style: 'collaborate' }, b: { text: '갈등은 내가 이겨야 상대도 존중한다', style: 'compete' } },
    { a: { text: '상대의 필요를 내 것보다 우선시한다', style: 'accommodate' }, b: { text: '50:50으로 나누는 것이 가장 공평하다', style: 'compromise' } },
  ],
  en: [
    { a: { text: 'I clearly assert my position and push for it', style: 'compete' }, b: { text: 'I avoid conflict and try to resolve it later', style: 'avoid' } },
    { a: { text: 'I discuss until everyone is satisfied', style: 'collaborate' }, b: { text: 'I go along with the other person to preserve the relationship', style: 'accommodate' } },
    { a: { text: 'We each give a little and meet in the middle', style: 'compromise' }, b: { text: 'I hold my ground if I believe I\'m right', style: 'compete' } },
    { a: { text: 'I think time will resolve it naturally', style: 'avoid' }, b: { text: 'I have a deep conversation to find a real solution', style: 'collaborate' } },
    { a: { text: 'It\'s easier to just give them what they want', style: 'accommodate' }, b: { text: 'Finding the middle ground where we both give a little', style: 'compromise' } },
    { a: { text: 'I prefer to step away rather than deal with conflict directly', style: 'avoid' }, b: { text: 'Finding the best outcome matters more than winning', style: 'collaborate' } },
    { a: { text: 'The relationship matters more than winning', style: 'accommodate' }, b: { text: 'Half and half is the most realistic approach', style: 'compromise' } },
    { a: { text: 'Silence is better than argument', style: 'avoid' }, b: { text: 'Making my opinion clear is how things get resolved', style: 'compete' } },
    { a: { text: 'We share our positions fully for the common good', style: 'collaborate' }, b: { text: 'Winning the conflict earns respect', style: 'compete' } },
    { a: { text: 'I prioritize the other person\'s needs over my own', style: 'accommodate' }, b: { text: '50/50 is the fairest way', style: 'compromise' } },
  ],
  ja: [
    { a: { text: '自分の立場を明確に主張して貫く', style: 'compete' }, b: { text: '葛藤を避けて後で解決しようとする', style: 'avoid' } },
    { a: { text: '全員が満足する解決策が見つかるまで話し合う', style: 'collaborate' }, b: { text: '相手の意見に合わせて関係を守る', style: 'accommodate' } },
    { a: { text: 'お互い少し譲って適当な線で合意する', style: 'compromise' }, b: { text: '自分が正しいと思えば最後まで主張する', style: 'compete' } },
    { a: { text: '時間が経てば自然に解決すると思う', style: 'avoid' }, b: { text: '深く対話して本当の解決策を見つける', style: 'collaborate' } },
    { a: { text: '相手の望む通りにする方が楽だ', style: 'accommodate' }, b: { text: '中間点を見つけてお互い少し譲る', style: 'compromise' } },
    { a: { text: '葛藤を直接扱うより一旦席を外す', style: 'avoid' }, b: { text: '勝つより最善の結果を見つけることが大切', style: 'collaborate' } },
    { a: { text: '負けても関係の方が大切', style: 'accommodate' }, b: { text: '勝ち負けより半々が現実的', style: 'compromise' } },
    { a: { text: '議論より沈黙の方がいい', style: 'avoid' }, b: { text: '明確に意見を言わないと解決しない', style: 'compete' } },
    { a: { text: '共同利益のためにお互いの立場を十分に共有する', style: 'collaborate' }, b: { text: '葛藤に勝てば相手も尊重してくれる', style: 'compete' } },
    { a: { text: '相手のニーズを自分より優先する', style: 'accommodate' }, b: { text: '50:50が最も公平', style: 'compromise' } },
  ],  zh: [
    { a: { text: '明确主张自己的立场并坚持到底', style: 'compete' }, b: { text: '先避开冲突，之后再处理', style: 'avoid' } },
    { a: { text: '一直谈到所有人都满意为止', style: 'collaborate' }, b: { text: '顺着对方的意思，保住关系', style: 'accommodate' } },
    { a: { text: '各退一步，在中间达成一致', style: 'compromise' }, b: { text: '只要我认为自己对，就坚持到底', style: 'compete' } },
    { a: { text: '觉得时间久了自然会解决', style: 'avoid' }, b: { text: '深谈一次，找出真正的解法', style: 'collaborate' } },
    { a: { text: '照对方的意思做反而省事', style: 'accommodate' }, b: { text: '找中间点，各让一点', style: 'compromise' } },
    { a: { text: '与其正面处理，不如先离开现场', style: 'avoid' }, b: { text: '比起赢，找出最好的结果更重要', style: 'collaborate' } },
    { a: { text: '就算我让步，关系更重要', style: 'accommodate' }, b: { text: '比起输赢，一人一半更实际', style: 'compromise' } },
    { a: { text: '与其争论，不如沉默', style: 'avoid' }, b: { text: '把话说清楚，事情才解决得了', style: 'compete' } },
    { a: { text: '为了共同利益，把彼此的立场摊开讲', style: 'collaborate' }, b: { text: '在冲突里赢了，对方才会尊重我', style: 'compete' } },
    { a: { text: '把对方的需要放在自己前面', style: 'accommodate' }, b: { text: '对半分最公平', style: 'compromise' } },
  ],
  fr: [
    { a: { text: 'J’affirme clairement ma position et je la tiens', style: 'compete' }, b: { text: 'J’évite le conflit et je verrai plus tard', style: 'avoid' } },
    { a: { text: 'On en discute jusqu’à ce que chacun y trouve son compte', style: 'collaborate' }, b: { text: 'Je me range à son avis pour préserver la relation', style: 'accommodate' } },
    { a: { text: 'Chacun lâche un peu et on se retrouve au milieu', style: 'compromise' }, b: { text: 'Si je me sais dans le vrai, je ne cède pas', style: 'compete' } },
    { a: { text: 'Je me dis que le temps arrangera les choses', style: 'avoid' }, b: { text: 'On prend le temps d’une vraie conversation', style: 'collaborate' } },
    { a: { text: 'C’est plus simple de faire comme il ou elle veut', style: 'accommodate' }, b: { text: 'Trouver le point médian où chacun cède un peu', style: 'compromise' } },
    { a: { text: 'Je préfère m’éloigner plutôt que d’affronter la situation', style: 'avoid' }, b: { text: 'Trouver le meilleur résultat compte plus que gagner', style: 'collaborate' } },
    { a: { text: 'Même si je perds, la relation passe avant', style: 'accommodate' }, b: { text: 'Moitié-moitié, c’est le plus réaliste', style: 'compromise' } },
    { a: { text: 'Le silence vaut mieux que la dispute', style: 'avoid' }, b: { text: 'Rien ne se règle si je ne dis pas clairement ce que je pense', style: 'compete' } },
    { a: { text: 'On expose nos positions à fond, dans l’intérêt commun', style: 'collaborate' }, b: { text: 'C’est en gagnant qu’on se fait respecter', style: 'compete' } },
    { a: { text: 'Je fais passer ses besoins avant les miens', style: 'accommodate' }, b: { text: 'Cinquante-cinquante, c’est le plus juste', style: 'compromise' } },
  ],
  es: [
    { a: { text: 'Defiendo mi postura con claridad y la sostengo', style: 'compete' }, b: { text: 'Esquivo el conflicto y ya lo resolveré más tarde', style: 'avoid' } },
    { a: { text: 'Hablamos hasta que a todos nos encaje', style: 'collaborate' }, b: { text: 'Me amoldo a la otra persona para cuidar la relación', style: 'accommodate' } },
    { a: { text: 'Cada uno cede un poco y nos vemos en el medio', style: 'compromise' }, b: { text: 'Si creo que tengo razón, no me bajo', style: 'compete' } },
    { a: { text: 'Pienso que con el tiempo se arregla solo', style: 'avoid' }, b: { text: 'Nos sentamos a hablarlo a fondo', style: 'collaborate' } },
    { a: { text: 'Me resulta más fácil hacer lo que quiere', style: 'accommodate' }, b: { text: 'Buscar el punto medio donde cada uno cede algo', style: 'compromise' } },
    { a: { text: 'Prefiero apartarme antes que afrontarlo de frente', style: 'avoid' }, b: { text: 'Dar con el mejor resultado importa más que ganar', style: 'collaborate' } },
    { a: { text: 'Aunque pierda, la relación está por encima', style: 'accommodate' }, b: { text: 'Mitad y mitad es lo más realista', style: 'compromise' } },
    { a: { text: 'Mejor callarse que discutir', style: 'avoid' }, b: { text: 'Si no digo claro lo que pienso, no se resuelve', style: 'compete' } },
    { a: { text: 'Ponemos las posturas sobre la mesa por el bien común', style: 'collaborate' }, b: { text: 'Ganando el conflicto es como me respetan', style: 'compete' } },
    { a: { text: 'Pongo sus necesidades por delante de las mías', style: 'accommodate' }, b: { text: 'Al cincuenta por ciento es lo más justo', style: 'compromise' } },
  ],
}

const RESULTS: Record<Style, Record<Locale, ResultData>> = {
  compete: {
    ko: { title: '경쟁형', subtitle: '명확하고 단호하게 자신의 입장을 지킵니다', description: '갈등에서 자신의 목표와 입장을 관철시키는 것을 중시합니다. 빠른 결정이 필요하거나 명확한 원칙이 있는 상황에서 효과적입니다.', strengths: ['빠른 결정력', '명확한 주장', '위기 상황에서 리더십'], risks: ['관계 손상 위험', '상대방 감정 무시', '갈등 확대 가능성'], tip: '이기는 것만큼 상대를 이해하는 것도 중요합니다. 가끔 지는 것이 더 큰 승리일 수 있습니다.', bestWith: '협력형 — 서로의 관점에서 배울 수 있습니다' },
    en: { title: 'Competing', subtitle: 'You stand your ground clearly and decisively', description: 'You prioritize advancing your goals and position in conflicts. Effective in situations requiring quick decisions or where clear principles are at stake.', strengths: ['Quick decision-making', 'Clear assertion', 'Leadership in crises'], risks: ['Risk of relationship damage', 'Ignoring others\' emotions', 'Escalating conflict'], tip: 'Understanding the other person matters as much as winning. Sometimes losing is the bigger victory.', bestWith: 'Collaborating — you can learn from each other\'s perspectives' },
    ja: { title: '競争型', subtitle: '明確かつ断固として自分の立場を守ります', description: '葛藤において自分の目標と立場を貫くことを重視します。素早い決断が必要な時や明確な原則がある状況で効果的です。', strengths: ['素早い決断力', '明確な主張', '危機時のリーダーシップ'], risks: ['関係損傷リスク', '相手の感情を無視', '葛藤の拡大可能性'], tip: '勝つことと同じくらい、相手を理解することが大切です。時に負けることが大きな勝利になることもあります。', bestWith: '協力型 — お互いの視点から学べます' },
    zh: { title: '竞争型', subtitle: '立场清楚，态度坚决', description: '在冲突中，你看重把自己的目标和立场推到底。需要快速决断、或原则明确的场合，这种做法最管用。', strengths: ['决断快', '主张清楚', '危机时能带头'], risks: ['可能伤到关系', '容易忽略对方情绪', '冲突有扩大的风险'], tip: '赢很重要，听懂对方同样重要。有时候让一步，反而是更大的胜利。', bestWith: '合作型——你们能从彼此的角度学到东西' },
    fr: { title: 'Compétition', subtitle: 'Vous tenez votre position, clairement et fermement', description: 'Dans un conflit, vous tenez à faire avancer votre objectif et votre position. C’est efficace quand il faut trancher vite ou quand un principe clair est en jeu.', strengths: ['Décision rapide', 'Position nette', 'Leadership dans la crise'], risks: ['Peut abîmer la relation', 'Émotions de l’autre laissées de côté', 'Risque d’escalade'], tip: 'Comprendre l’autre compte autant que gagner. Céder, parfois, est la plus grande victoire.', bestWith: 'Collaboration — vous apprenez du point de vue de l’autre' },
    es: { title: 'Competir', subtitle: 'Sostienes tu postura con claridad y firmeza', description: 'En un conflicto te importa sacar adelante tu objetivo y tu postura. Funciona cuando hay que decidir rápido o cuando hay un principio claro en juego.', strengths: ['Decides rápido', 'Postura clara', 'Lideras en la crisis'], risks: ['Puede dañar la relación', 'Dejas fuera lo que siente el otro', 'El conflicto puede crecer'], tip: 'Entender al otro pesa tanto como ganar. A veces ceder es la victoria mayor.', bestWith: 'Colaborar — cada uno aprende de la mirada del otro' },
  },
  collaborate: {
    ko: { title: '협력형', subtitle: '모두에게 최선인 해결책을 찾아냅니다', description: '갈등을 통해 모두의 필요를 충족시키는 창의적 해결책을 찾습니다. 장기적 관계와 상호 이익을 중시합니다.', strengths: ['높은 신뢰 구축', '창의적 해결', '모두가 만족하는 결과'], risks: ['시간과 에너지 소모', '즉각 결정 어려움', '상대가 협력 의지 없을 때 좌절'], tip: '모든 갈등이 협력으로 해결되지는 않습니다. 상황에 따라 빠른 결정도 필요합니다.', bestWith: '누구와도 잘 맞지만 특히 경쟁형과 좋은 균형을 이룹니다' },
    en: { title: 'Collaborating', subtitle: 'You find the best solution for everyone', description: 'You seek creative solutions that meet everyone\'s needs through conflict. You value long-term relationships and mutual benefit.', strengths: ['High trust-building', 'Creative resolution', 'Outcomes everyone accepts'], risks: ['Time and energy consuming', 'Difficult for quick decisions', 'Frustrating when others won\'t collaborate'], tip: 'Not every conflict can be resolved through collaboration. Sometimes a quick decision is needed.', bestWith: 'Works with anyone, but especially balances well with Competing types' },
    ja: { title: '協力型', subtitle: '全員にとって最善の解決策を見つけます', description: '葛藤を通じて全員のニーズを満たす創造的な解決策を探します。長期的な関係と相互利益を重視します。', strengths: ['高い信頼構築', '創造的な解決', '全員が満足する結果'], risks: ['時間とエネルギーの消耗', '即座の決断が難しい', '相手が協力する気がない時に挫折'], tip: 'すべての葛藤が協力で解決されるわけではありません。状況によって素早い決断も必要です。', bestWith: '誰とでも合いますが、特に競争型と良いバランスを取れます' },
    zh: { title: '合作型', subtitle: '找出对每个人都最好的解法', description: '你会借着冲突去找一个能照顾到所有人需要的解法。你看重长期的关系与共同的好处。', strengths: ['能建立信任', '解法有创意', '结果大家都接受'], risks: ['花时间也花力气', '难以当场决断', '对方不想合作时会受挫'], tip: '不是每个冲突都能靠合作解决。有些场合，果断更要紧。', bestWith: '跟谁都合得来，尤其能跟竞争型互补' },
    fr: { title: 'Collaboration', subtitle: 'Vous cherchez la solution qui convient à tous', description: 'Vous vous servez du conflit pour trouver une issue qui tienne compte des besoins de chacun. Vous tenez à la relation dans la durée et au bénéfice partagé.', strengths: ['Construit la confiance', 'Solutions inventives', 'Résultat accepté par tous'], risks: ['Demande du temps et de l’énergie', 'Difficile quand il faut trancher vite', 'Frustrant si l’autre ne joue pas le jeu'], tip: 'Tout conflit ne se règle pas par la collaboration. Parfois il faut décider vite.', bestWith: 'S’entend avec tous, et équilibre particulièrement bien la Compétition' },
    es: { title: 'Colaborar', subtitle: 'Buscas la salida que sirva a todos', description: 'Aprovechas el conflicto para encontrar una solución que atienda lo que cada uno necesita. Te importan la relación a largo plazo y el beneficio común.', strengths: ['Construyes confianza', 'Soluciones creativas', 'Resultados que todos aceptan'], risks: ['Consume tiempo y energía', 'Cuesta cuando hay que decidir ya', 'Frustra si el otro no colabora'], tip: 'No todo conflicto se resuelve colaborando. A veces hace falta decidir rápido.', bestWith: 'Encaja con todos, y equilibra especialmente bien a quien compite' },
  },
  compromise: {
    ko: { title: '타협형', subtitle: '서로 조금씩 양보하여 실용적으로 해결합니다', description: '각자가 일정 부분을 양보하여 적당한 합의점을 찾습니다. 시간 압박이 있거나 두 입장이 대등할 때 효과적입니다.', strengths: ['실용적이고 신속한 해결', '공정성 추구', '균형 잡힌 접근'], risks: ['최적 해결책이 아닐 수 있음', '모두 일부 불만족', '협력 기회 놓침'], tip: '타협이 항상 최선은 아닙니다. 때로는 더 깊이 파고들어 모두가 만족하는 해결책을 찾아보세요.', bestWith: '대부분의 스타일과 잘 작동합니다' },
    en: { title: 'Compromising', subtitle: 'You find practical solutions through mutual give-and-take', description: 'You find an acceptable agreement where both parties give a little. Effective under time pressure or when both positions are equally valid.', strengths: ['Practical and quick resolution', 'Fairness-seeking', 'Balanced approach'], risks: ['May not be the optimal solution', 'Everyone partially unsatisfied', 'Missed opportunity to collaborate'], tip: 'Compromise isn\'t always the best path. Sometimes dig deeper to find a solution everyone truly accepts.', bestWith: 'Works well with most styles' },
    ja: { title: '妥協型', subtitle: 'お互い少し譲って実用的に解決します', description: 'それぞれが一定部分を譲歩して適切な合意点を見つけます。時間的プレッシャーがある時や両方の立場が対等な時に効果的です。', strengths: ['実用的で素早い解決', '公平性の追求', 'バランスのとれたアプローチ'], risks: ['最適解でない可能性', '全員が部分的に不満', '協力の機会を逃す'], tip: '妥協が常に最善ではありません。時にはもっと深く掘り下げて全員が満足する解決策を探しましょう。', bestWith: 'ほとんどのスタイルとうまく機能します' },
    zh: { title: '妥协型', subtitle: '各让一步，务实收场', description: '你让双方各退一点，找到一个过得去的共识。时间紧、或两边的理由都站得住时，这样最有效。', strengths: ['务实又快', '讲究公平', '拿捏得住分寸'], risks: ['未必是最好的解法', '两边都留点不满', '错过更深的合作'], tip: '妥协不总是上策。偶尔多挖一层，也许能找到两边都真心满意的答案。', bestWith: '跟大多数风格都合得来' },
    fr: { title: 'Compromis', subtitle: 'Chacun lâche un peu, la solution est pratique', description: 'Vous cherchez un accord acceptable où chacun concède une part. Efficace sous la pression du temps ou quand les deux positions se valent.', strengths: ['Résolution rapide et concrète', 'Souci d’équité', 'Approche équilibrée'], risks: ['Pas forcément la meilleure issue', 'Chacun reste un peu sur sa faim', 'Occasion de collaborer manquée'], tip: 'Le compromis n’est pas toujours la meilleure voie. Creusez parfois jusqu’à une solution que chacun accepte vraiment.', bestWith: 'Fonctionne avec presque tous les styles' },
    es: { title: 'Ceder a medias', subtitle: 'Cada uno cede un poco y se resuelve', description: 'Buscas un acuerdo aceptable en el que ambas partes cedan algo. Funciona con prisa o cuando las dos posturas valen lo mismo.', strengths: ['Resuelves rápido y con los pies en el suelo', 'Buscas lo justo', 'Enfoque equilibrado'], risks: ['Puede no ser la mejor salida', 'Los dos quedáis algo a medias', 'Se pierde la oportunidad de colaborar'], tip: 'Ceder a medias no siempre es lo mejor. A veces conviene escarbar hasta una solución que convenza de verdad.', bestWith: 'Funciona con casi todos los estilos' },
  },
  avoid: {
    ko: { title: '회피형', subtitle: '갈등 상황에서 한 발 물러서는 편입니다', description: '갈등을 직접 대면하기보다 물러서거나 시간이 해결해주기를 기다립니다. 중요하지 않은 갈등이나 감정이 격할 때는 유용하지만, 중요한 문제를 방치할 위험이 있습니다.', strengths: ['불필요한 갈등 방지', '감정 냉각 시간 확보', '자신을 보호'], risks: ['중요한 문제 해결 지연', '불만 축적', '상대에게 무관심으로 보일 수 있음'], tip: '작은 갈등은 피할 수 있지만, 반복되는 중요한 문제는 직면해야 합니다. 용기 있는 대화가 관계를 지킵니다.', bestWith: '협력형이나 타협형이 먼저 다가오면 더 잘 해결됩니다' },
    en: { title: 'Avoiding', subtitle: 'You tend to step back in conflict situations', description: 'Rather than facing conflict directly, you withdraw or wait for time to resolve it. Useful for minor conflicts or when emotions are high, but risks leaving important issues unaddressed.', strengths: ['Preventing unnecessary conflict', 'Allowing emotions to cool', 'Self-protection'], risks: ['Delaying resolution of important issues', 'Accumulating resentment', 'May appear indifferent to others'], tip: 'Small conflicts can be avoided, but repeated important issues must be faced. A courageous conversation protects relationships.', bestWith: 'Works better when a Collaborating or Compromising person initiates' },
    ja: { title: '回避型', subtitle: '葛藤の場面では一歩引く傾向があります', description: '葛藤を直接対面するより引いたり、時間が解決してくれるのを待ちます。重要でない葛藤や感情が高ぶっている時には有用ですが、重要な問題を放置するリスクがあります。', strengths: ['不必要な葛藤の防止', '感情冷却の時間確保', '自己保護'], risks: ['重要な問題の解決の遅れ', '不満の蓄積', '相手に無関心に見える可能性'], tip: '小さな葛藤は避けられますが、繰り返す重要な問題は向き合う必要があります。勇気ある会話が関係を守ります。', bestWith: '協力型や妥協型が先に近づいてくれるとうまく解決できます' },
    zh: { title: '回避型', subtitle: '冲突当前，你倾向先退一步', description: '比起正面处理，你更常先退开，或等时间把事情带过。不重要的摩擦、或情绪正烈时，这样有用；但重要的事被搁着，会留下风险。', strengths: ['省下不必要的争执', '给情绪降温的时间', '保护自己'], risks: ['要紧的事一拖再拖', '不满会累积', '可能被看成不在乎'], tip: '小摩擦可以放过，反复出现的大问题得面对。一次有勇气的对话，才守得住关系。', bestWith: '合作型或妥协型先开口时，事情会顺得多' },
    fr: { title: 'Évitement', subtitle: 'Face au conflit, vous prenez du recul', description: 'Plutôt que d’affronter, vous vous retirez ou laissez le temps faire. Utile pour les frictions mineures ou quand les émotions montent, mais les vrais sujets risquent de rester en suspens.', strengths: ['Évite les disputes inutiles', 'Laisse retomber l’émotion', 'Vous protège'], risks: ['Les sujets importants traînent', 'Le ressentiment s’accumule', 'Peut passer pour de l’indifférence'], tip: 'On peut laisser filer les petites frictions ; ce qui revient sans cesse demande à être regardé en face. Une conversation courageuse protège la relation.', bestWith: 'Cela se passe mieux quand une personne Collaboration ou Compromis fait le premier pas' },
    es: { title: 'Evitar', subtitle: 'Ante el conflicto, das un paso atrás', description: 'En vez de afrontarlo de frente, te retiras o dejas que el tiempo lo arregle. Sirve con roces menores o cuando los ánimos están calientes, pero los asuntos importantes pueden quedarse sin tratar.', strengths: ['Te ahorras peleas innecesarias', 'Das tiempo a que baje la emoción', 'Te proteges'], risks: ['Lo importante se aplaza', 'El malestar se acumula', 'Pueden leerlo como desinterés'], tip: 'Los roces pequeños se pueden dejar pasar; lo que se repite hay que mirarlo de frente. Una conversación valiente sostiene la relación.', bestWith: 'Va mejor cuando alguien que colabora o que cede a medias da el primer paso' },
  },
  accommodate: {
    ko: { title: '양보형', subtitle: '관계를 위해 자신의 필요를 뒤로 미룹니다', description: '갈등에서 상대방의 필요를 충족시키기 위해 자신의 입장을 양보합니다. 장기적 관계와 조화를 중시하지만, 자신의 필요가 무시될 위험이 있습니다.', strengths: ['강한 관계 유지', '갈등 완화', '팀워크 촉진'], risks: ['자신의 필요 방치', '분노와 억울함 누적', '존중받지 못함'], tip: '양보는 강점이지만, 자신의 필요와 감정을 무시하면 장기적으로 관계가 더 어려워집니다. 자신의 목소리도 소중합니다.', bestWith: '경쟁형이나 협력형과 좋은 균형을 이룹니다' },
    en: { title: 'Accommodating', subtitle: 'You prioritize the relationship over your own needs', description: 'You yield your position to meet the other person\'s needs in conflicts. You value long-term harmony but risk having your own needs neglected.', strengths: ['Maintaining strong relationships', 'Conflict de-escalation', 'Promoting teamwork'], risks: ['Neglecting own needs', 'Accumulating resentment', 'Not being respected'], tip: 'Accommodating is a strength, but ignoring your own needs and feelings makes relationships harder long-term. Your voice matters too.', bestWith: 'Balances well with Competing and Collaborating types' },
    ja: { title: '従順型', subtitle: '関係のために自分のニーズを後回しにします', description: '葛藤において相手のニーズを満たすために自分の立場を譲ります。長期的な調和を重視しますが、自分のニーズが無視されるリスクがあります。', strengths: ['強い関係の維持', '葛藤の緩和', 'チームワークの促進'], risks: ['自分のニーズの放置', '怒りや憤りの蓄積', '尊重されない'], tip: '従順さは強みですが、自分のニーズと感情を無視すると長期的に関係がより難しくなります。あなたの声も大切です。', bestWith: '競争型と協力型と良いバランスを取れます' },
    zh: { title: '迁就型', subtitle: '为了关系，先把自己的需要放一放', description: '冲突时你让出自己的立场，去满足对方的需要。你看重长久的和气，但自己的需要有被忽略的风险。', strengths: ['关系维持得牢', '能把火降下来', '带得动团队合作'], risks: ['把自己的需要搁着', '委屈会积起来', '可能不被当回事'], tip: '愿意让步是长处，但一直不理会自己的需要，关系反而会越走越难。你的声音同样要紧。', bestWith: '与竞争型、合作型能取得好平衡' },
    fr: { title: 'Accommodation', subtitle: 'Vous faites passer la relation avant vos besoins', description: 'Dans le conflit, vous cédez votre position pour répondre aux besoins de l’autre. Vous tenez à l’harmonie durable, au risque de laisser vos propres besoins de côté.', strengths: ['Relations solides', 'Apaise les tensions', 'Favorise le travail d’équipe'], risks: ['Vos besoins passent à la trappe', 'La rancune s’accumule', 'Vous risquez de ne pas être pris au sérieux'], tip: 'Savoir céder est une force, mais ignorer ses propres besoins rend la relation plus difficile à la longue. Votre voix compte aussi.', bestWith: 'Bon équilibre avec la Compétition et la Collaboration' },
    es: { title: 'Acomodarse', subtitle: 'Pones la relación por delante de lo tuyo', description: 'En el conflicto cedes tu postura para atender lo que el otro necesita. Te importa la armonía duradera, aunque tus propias necesidades se queden atrás.', strengths: ['Relaciones que aguantan', 'Bajas la tensión', 'Impulsas el trabajo en equipo'], risks: ['Descuidas lo tuyo', 'El resentimiento se acumula', 'Puede que no te tomen en cuenta'], tip: 'Ceder es una fortaleza, pero ignorar lo que necesitas acaba complicando la relación. Tu voz también cuenta.', bestWith: 'Buen equilibrio con quien compite y con quien colabora' },
  },
}

interface Props { locale?: string }

export default function ConflictStyleTest({ locale: lp = 'ko' }: Props) {
  const locale: Locale = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(lp) ? lp : 'en') as Locale
  const lb = LABELS[locale]
  const pairs = PAIRS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Style[]>([])
  const [result, setResult] = useState<{ style: Style; scores: Scores } | null>(null)
  useRecordFinishedTest({ testId: "conflict-style", title: "ConflictStyleTest", finished: Boolean(result) });

  function calcResult(ans: Style[]): { style: Style; scores: Scores } {
    const scores: Scores = { compete: 0, collaborate: 0, compromise: 0, avoid: 0, accommodate: 0 }
    for (const a of ans) scores[a]++
    const style = (Object.keys(scores) as Style[]).reduce((a, b) => scores[a] >= scores[b] ? a : b)
    return { style, scores }
  }

  function pick(side: 'a' | 'b') {
    const chosen = side === 'a' ? pairs[current].a.style : pairs[current].b.style
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const newAns = answers.slice(0, current)
    newAns[current] = chosen
    if (current + 1 >= pairs.length) setResult(calcResult(newAns))
    setAnswers(newAns)
    setCurrent(current + 1)
  }

  function restart() { setAnswers([]); setCurrent(0); setResult(null) }

  function share() {
    if (!result) return
    const url = window.location.href
    if (navigator.share) navigator.share({ title: lb.title, text: `${lb.shareMsg} ${lb.types[result.style]}`, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= pairs.length

  if (!finished) {
    const pair = pairs[current]
    const progress = Math.round((current / pairs.length) * 100)
    const chosen = answers[current]
    return (
      <Questionnaire<'a' | 'b'>
        title={lb.title}
        subtitle={lb.subtitle}
        question={lb.chooseOne}
        questionLabel={lb.pairOf(current + 1, pairs.length)}
        progress={progress}
        options={(['a', 'b'] as const).map(side => ({ label: pair[side].text, value: side }))}
        selectedValue={chosen === pair.a.style ? 'a' : chosen === pair.b.style ? 'b' : undefined}
        previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
        onPrevious={current > 0 ? () => setCurrent(current - 1) : undefined}
        onSelect={pick}
      />
    )
  }

  if (!result) return null
  const r = RESULTS[result.style][locale]
  const color = COLORS[result.style]
  const chartData = (Object.keys(result.scores) as Style[]).map(k => ({
    name: lb.types[k], value: result.scores[k], fill: COLORS[k],
  })).sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourStyle}</p>
        <div className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white" style={{ backgroundColor: color }}>{r.title}</div>
        <p className="font-medium text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground text-center mb-3">{lb.chartTitle}</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 20 }}>
            <XAxis type="number" domain={[0, pairs.length]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={64} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm text-green-600">{lb.strengths}</h3>
          <ul className="space-y-1">{r.strengths.map(s => <li key={s} className="text-xs text-muted-foreground flex gap-1"><span className="text-green-500">+</span>{s}</li>)}</ul>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-sm text-amber-600">{lb.risks}</h3>
          <ul className="space-y-1">{r.risks.map(risk => <li key={risk} className="text-xs text-muted-foreground flex gap-1"><span className="text-amber-500">△</span>{risk}</li>)}</ul>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-1">
        <h3 className="font-semibold text-sm">{lb.bestWith}</h3>
        <p className="text-sm text-muted-foreground">{r.bestWith}</p>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.tip}</h3>
        <p className="text-sm">{r.tip}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={restart} className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">{lb.restart}</button>
        <button onClick={share} className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">{lb.share}</button>
      </div>
      <ShareResultButton locale={locale} heading={lb.title} resultTitle={r.title} description={r.description} />
    </div>
  )
}
