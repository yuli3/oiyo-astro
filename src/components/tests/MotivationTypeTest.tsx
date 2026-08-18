import { useState, useEffect } from "react";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";
interface Props { locale?: string; }

type MotivationType = "achievement" | "affiliation" | "power" | "autonomy";

interface Question { ko: string; en: string; ja: string; zh: string; fr: string; es: string; type: MotivationType; }

const questions: Question[] = [
  // achievement
  { ko: "나는 어렵고 도전적인 목표에 매력을 느끼고, 그것을 달성했을 때 큰 만족감을 느낀다.", en: "I'm drawn to difficult and challenging goals and feel great satisfaction when I achieve them.", ja: "困難で挑戦的な目標に魅力を感じ、達成したとき大きな満足感を覚える。", zh: "我会被困难且有挑战性的目标吸引，并在达成它们时感到很大的满足。", fr: "Je suis attiré par les objectifs difficiles et stimulants, et je ressens une grande satisfaction quand je les atteins.", es: "Me atraen las metas difíciles y desafiantes, y siento una gran satisfacción cuando las alcanzo.", type: "achievement" },
  { ko: "나는 현재 방식보다 더 나은 방법을 항상 찾으려 한다.", en: "I'm always looking for a better way than the current approach.", ja: "現在の方法よりも良い方法を常に探そうとする。", zh: "我总是在寻找比当前做法更好的方法。", fr: "Je cherche toujours une meilleure façon de faire que l'approche actuelle.", es: "Siempre busco una forma mejor que el enfoque actual.", type: "achievement" },
  { ko: "내가 한 일의 결과가 얼마나 잘 됐는지 명확한 피드백을 받고 싶다.", en: "I want clear feedback on how well I've done my work.", ja: "自分の仕事の結果がどれくらいうまくいったか明確なフィードバックが欲しい。", zh: "我希望得到清晰的反馈，知道自己的工作完成得有多好。", fr: "J'aime recevoir un retour clair sur la qualité de mon travail.", es: "Quiero recibir comentarios claros sobre qué tan bien hice mi trabajo.", type: "achievement" },
  // affiliation
  { ko: "나는 일보다 사람들과의 관계가 더 중요하다고 느낀다.", en: "I feel that relationships with people matter more than work.", ja: "仕事より人々との関係の方が大切だと感じる。", zh: "我觉得与人的关系比工作本身更重要。", fr: "J'ai le sentiment que les relations avec les autres comptent plus que le travail.", es: "Siento que las relaciones con las personas importan más que el trabajo.", type: "affiliation" },
  { ko: "팀 내 갈등이 생기면 빠르게 해결하고 화합을 되찾고 싶어진다.", en: "When conflict arises in a team, I want to resolve it quickly and restore harmony.", ja: "チーム内に葛藤が生じると、素早く解決し和を取り戻したくなる。", zh: "团队中出现冲突时，我会想尽快解决，并恢复和谐。", fr: "Quand un conflit apparaît dans une équipe, j'ai envie de le résoudre vite et de rétablir l'harmonie.", es: "Cuando surge un conflicto en un equipo, quiero resolverlo rápido y recuperar la armonía.", type: "affiliation" },
  { ko: "나는 사람들에게 인정받고 좋아하는 감정을 받는 것이 중요하다.", en: "Being recognized and liked by people is important to me.", ja: "人々に認められ好かれることが大切だ。", zh: "被他人认可和喜欢，对我来说很重要。", fr: "Être reconnu et apprécié par les autres est important pour moi.", es: "Para mí es importante ser reconocido y apreciado por los demás.", type: "affiliation" },
  // power
  { ko: "나는 결정을 내리고 방향을 이끄는 위치에 있을 때 가장 편하다.", en: "I feel most comfortable in a position where I make decisions and lead direction.", ja: "決断を下し方向性を導く立場にいるとき最も快適だ。", zh: "当我处在做决定并引导方向的位置时，会感到最自在。", fr: "Je me sens le plus à l'aise quand je peux prendre des décisions et donner une direction.", es: "Me siento más cómodo cuando estoy en una posición donde tomo decisiones y marco la dirección.", type: "power" },
  { ko: "내가 생각하는 올바른 방식으로 일이 진행되는 것이 중요하다.", en: "It's important that things proceed the way I believe is correct.", ja: "自分が正しいと考える方法で物事が進むことが重要だ。", zh: "事情按照我认为正确的方式推进，对我很重要。", fr: "Il est important pour moi que les choses avancent de la façon que je juge correcte.", es: "Para mí es importante que las cosas avancen de la forma que considero correcta.", type: "power" },
  { ko: "나는 다른 사람들의 행동이나 결과에 영향을 미치고 싶다.", en: "I want to influence the behavior or outcomes of others.", ja: "他の人々の行動や結果に影響を与えたい。", zh: "我希望影响他人的行动或结果。", fr: "J'ai envie d'influencer les actions ou les résultats des autres.", es: "Quiero influir en las acciones o los resultados de otras personas.", type: "power" },
  // autonomy
  { ko: "나는 누군가의 지시보다 내 방식으로 일하는 것이 더 효과적이라고 느낀다.", en: "I feel more effective working my own way than following someone's direction.", ja: "誰かの指示より自分のやり方で仕事する方が効果的だと感じる。", zh: "相比听从别人的指示，我觉得按自己的方式工作更有效。", fr: "Je me sens plus efficace quand je travaille à ma façon plutôt qu'en suivant les consignes de quelqu'un.", es: "Me siento más eficaz trabajando a mi manera que siguiendo las instrucciones de otra persona.", type: "autonomy" },
  { ko: "업무 시간과 방식을 자유롭게 선택할 수 있을 때 가장 창의적으로 일한다.", en: "I work most creatively when I can freely choose my work hours and methods.", ja: "仕事の時間や方法を自由に選べるとき最も創造的に働く。", zh: "当我能自由选择工作时间和方式时，我最有创造力。", fr: "Je travaille avec le plus de créativité quand je peux choisir librement mes horaires et mes méthodes.", es: "Trabajo con más creatividad cuando puedo elegir libremente mis horarios y mis métodos.", type: "autonomy" },
  { ko: "나는 규칙이나 절차보다 목표와 결과에 집중하는 편이다.", en: "I tend to focus on goals and results rather than rules and procedures.", ja: "ルールや手続きより目標と結果に集中する方だ。", zh: "相比规则或流程，我更倾向于关注目标和结果。", fr: "J'ai tendance à me concentrer sur les objectifs et les résultats plutôt que sur les règles et les procédures.", es: "Tiendo a centrarme en las metas y los resultados más que en las reglas y los procedimientos.", type: "autonomy" },
];

const typeInfo: Record<MotivationType, { name: Record<SupportedLocale, string>; color: string; description: Record<SupportedLocale, string>; strengths: Record<SupportedLocale, string[]>; fit: Record<SupportedLocale, string>; watch: Record<SupportedLocale, string>; affirmation: Record<SupportedLocale, string> }> = {
  achievement: {
    name: { ko: "성취 동기형", en: "Achievement", ja: "達成動機型", zh: "成就动机型", fr: "Accomplissement", es: "Logro" },
    color: "#435D31",
    description: {
      ko: "당신은 뛰어난 성과와 목표 달성에서 가장 큰 만족을 얻습니다. 도전을 즐기고, 지속적인 개선을 추구하며, 자신의 성과를 측정하는 것을 좋아합니다. 데이비드 맥클리랜드(David McClelland)의 연구에 따르면 이 동기 유형은 기업가와 혁신가에게서 자주 나타납니다.",
      en: "You find greatest satisfaction in outstanding performance and goal achievement. You enjoy challenges, seek continuous improvement, and like measuring your results. David McClelland's research shows this motivation type is common in entrepreneurs and innovators.",
      ja: "あなたは優れた成果と目標達成に最大の満足を得ます。挑戦を楽しみ、継続的な改善を求め、自分の成果を測定することが好きです。デービッド・マクレランド(David McClelland)の研究によると、このモチベーションタイプは起業家と革新者によく見られます。",
      zh: "你从出色表现和达成目标中获得最大的满足感。你享受挑战，追求持续改进，也喜欢衡量自己的成果。根据戴维·麦克利兰(David McClelland)的研究，这种动机类型常见于创业者和创新者。",
      fr: "Vous trouvez votre plus grande satisfaction dans l'excellence et l'atteinte des objectifs. Vous aimez les défis, cherchez à vous améliorer en continu et appréciez de mesurer vos résultats. Les travaux de David McClelland montrent que ce type de motivation est fréquent chez les entrepreneurs et les innovateurs.",
      es: "Encuentras tu mayor satisfacción en el alto rendimiento y el logro de objetivos. Disfrutas los desafíos, buscas mejorar de forma continua y te gusta medir tus resultados. La investigación de David McClelland muestra que este tipo de motivación es común en emprendedores e innovadores.",
    },
    strengths: {
      ko: ["높은 성취 지향성과 끈기", "지속적인 자기 개선 추구", "명확한 목표 설정과 실행 능력", "도전에 대한 강한 회복력"],
      en: ["High achievement orientation and persistence", "Continuous pursuit of self-improvement", "Clear goal-setting and execution ability", "Strong resilience in the face of challenges"],
      ja: ["高い達成志向性と粘り強さ", "継続的な自己改善の追求", "明確な目標設定と実行能力", "挑戦に対する強い回復力"],
      zh: ["高度的成就导向和坚持力", "持续追求自我改进", "清晰设定目标并执行的能力", "面对挑战时强大的复原力"],
      fr: ["Forte orientation vers l'accomplissement et persévérance", "Recherche continue d'amélioration personnelle", "Capacité à fixer des objectifs clairs et à les exécuter", "Grande résilience face aux défis"],
      es: ["Alta orientación al logro y perseverancia", "Búsqueda continua de mejora personal", "Capacidad para fijar metas claras y ejecutarlas", "Gran resiliencia frente a los desafíos"],
    },
    fit: { ko: "기업가, 연구자, 운동선수, 세일즈, 프로젝트 매니저", en: "Entrepreneur, Researcher, Athlete, Sales, Project Manager", ja: "起業家、研究者、アスリート、セールス、プロジェクトマネージャー", zh: "创业者、研究者、运动员、销售、项目经理", fr: "Entrepreneur, chercheur, athlète, vente, chef de projet", es: "Emprendedor, investigador, atleta, ventas, gerente de proyecto" },
    watch: { ko: "지나친 완벽주의나 결과 집착으로 관계가 소홀해질 수 있습니다.", en: "Excessive perfectionism or obsession with results may neglect relationships.", ja: "過度な完璧主義や結果へのこだわりで、関係が疎かになることがあります。", zh: "过度完美主义或过分执着结果，可能会让你忽视人际关系。", fr: "Un perfectionnisme excessif ou une fixation sur les résultats peut vous faire négliger les relations.", es: "El perfeccionismo excesivo o la obsesión por los resultados puede hacer que descuides las relaciones." },
    affirmation: { ko: "나는 도전을 통해 더 강해집니다.", en: "I grow stronger through challenges.", ja: "私は挑戦を通じてより強くなります。", zh: "我通过挑战变得更强。", fr: "Je deviens plus fort grâce aux défis.", es: "Me vuelvo más fuerte a través de los desafíos." },
  },
  affiliation: {
    name: { ko: "친화 동기형", en: "Affiliation", ja: "親和動機型", zh: "亲和动机型", fr: "Affiliation", es: "Afiliación" },
    color: "#ec4899",
    description: {
      ko: "당신은 사람들과의 따뜻한 관계와 소속감에서 가장 큰 에너지를 얻습니다. 팀 내 화합을 중요시하고, 타인에게 인정받는 것을 소중히 여깁니다. 이 동기 유형은 협력적인 환경에서 가장 빛납니다.",
      en: "You draw greatest energy from warm relationships with people and a sense of belonging. You value team harmony and cherish being recognized by others. This motivation type shines most in collaborative environments.",
      ja: "あなたは人々との温かな関係と所属感から最大のエネルギーを得ます。チーム内の和を大切にし、他者に認められることを重視します。このモチベーションタイプは協力的な環境で最も輝きます。",
      zh: "你从温暖的人际关系和归属感中获得最大的能量。你重视团队和谐，也珍惜被他人认可。这种动机类型在合作型环境中最能发光。",
      fr: "Vous tirez votre plus grande énergie des relations chaleureuses et du sentiment d'appartenance. Vous accordez de l'importance à l'harmonie d'équipe et à la reconnaissance des autres. Ce type de motivation s'épanouit surtout dans les environnements collaboratifs.",
      es: "Obtienes tu mayor energía de las relaciones cálidas con las personas y del sentido de pertenencia. Valoras la armonía del equipo y aprecias ser reconocido por los demás. Este tipo de motivación brilla más en entornos colaborativos.",
    },
    strengths: {
      ko: ["뛰어난 팀워크와 협력 능력", "갈등 조정과 화합 유지", "진심 어린 지지와 돌봄 제공", "포용적이고 따뜻한 팀 문화 형성"],
      en: ["Excellent teamwork and collaboration", "Conflict resolution and harmony maintenance", "Providing sincere support and care", "Creating an inclusive and warm team culture"],
      ja: ["優れたチームワークと協力能力", "葛藤調整と和の維持", "心からのサポートとケアの提供", "包容的で温かいチーム文化の形成"],
      zh: ["出色的团队合作与协作能力", "调解冲突并维护和谐", "提供真诚的支持与关怀", "营造包容而温暖的团队文化"],
      fr: ["Excellent esprit d'équipe et sens de la collaboration", "Résolution des conflits et maintien de l'harmonie", "Soutien et attention sincères envers les autres", "Création d'une culture d'équipe inclusive et chaleureuse"],
      es: ["Excelente trabajo en equipo y colaboración", "Resolución de conflictos y mantenimiento de la armonía", "Apoyo y cuidado sinceros", "Creación de una cultura de equipo inclusiva y cálida"],
    },
    fit: { ko: "HR, 교육, 상담, 소셜워크, 간호, 고객 서비스, 팀 리더", en: "HR, Education, Counseling, Social Work, Nursing, Customer Service, Team Leader", ja: "HR、教育、カウンセリング、ソーシャルワーク、看護、顧客サービス、チームリーダー", zh: "人力资源、教育、咨询、社会工作、护理、客户服务、团队负责人", fr: "RH, éducation, conseil, travail social, soins infirmiers, service client, chef d'équipe", es: "RR. HH., educación, consejería, trabajo social, enfermería, atención al cliente, líder de equipo" },
    watch: { ko: "거절이나 갈등을 너무 두려워하면 자신의 필요를 희생할 수 있습니다.", en: "Excessive fear of rejection or conflict may cause you to sacrifice your own needs.", ja: "拒絶や葛藤をあまりにも恐れると、自分のニーズを犠牲にすることがあります。", zh: "如果过度害怕被拒绝或发生冲突，你可能会牺牲自己的需要。", fr: "Une peur excessive du rejet ou du conflit peut vous pousser à sacrifier vos propres besoins.", es: "El miedo excesivo al rechazo o al conflicto puede llevarte a sacrificar tus propias necesidades." },
    affirmation: { ko: "나의 따뜻함이 세상을 더 연결되게 합니다.", en: "My warmth makes the world more connected.", ja: "私の温かさが世界をより繋がった場所にします。", zh: "我的温暖让世界连接得更紧密。", fr: "Ma chaleur rend le monde plus connecté.", es: "Mi calidez hace que el mundo esté más conectado." },
  },
  power: {
    name: { ko: "권력/영향력 동기형", en: "Power/Influence", ja: "権力/影響力動機型", zh: "权力/影响力动机型", fr: "Pouvoir/Influence", es: "Poder/Influencia" },
    color: "#f59e0b",
    description: {
      ko: "당신은 영향력을 행사하고 변화를 이끄는 것에서 의미를 찾습니다. 리더십 역할을 자연스럽게 맡고, 결정권을 가지는 것을 선호합니다. 이 동기는 긍정적으로 활용되면 강력한 리더십으로, 부정적으로 활용되면 통제 욕구로 나타날 수 있습니다.",
      en: "You find meaning in exercising influence and leading change. You naturally take on leadership roles and prefer having decision-making authority. This motivation, positively channeled, becomes powerful leadership; negatively, it can manifest as a control drive.",
      ja: "あなたは影響力を発揮し変化を導くことに意味を見出します。リーダーシップの役割を自然に担い、決定権を持つことを好みます。このモチベーションを肯定的に活用すれば強力なリーダーシップに、否定的に活用すると支配欲として現れることがあります。",
      zh: "你在发挥影响力、引领变化中找到意义。你会自然地承担领导角色，也更偏好拥有决策权。这种动机若被积极引导，会成为强有力的领导力；若被消极使用，则可能表现为控制欲。",
      fr: "Vous trouvez du sens dans l'exercice de l'influence et la conduite du changement. Vous prenez naturellement des rôles de leadership et préférez disposer d'un pouvoir de décision. Bien canalisée, cette motivation devient un leadership puissant ; mal orientée, elle peut se manifester par un besoin de contrôle.",
      es: "Encuentras sentido al ejercer influencia y liderar el cambio. Asumes roles de liderazgo de manera natural y prefieres tener autoridad para decidir. Bien canalizada, esta motivación se convierte en un liderazgo potente; mal orientada, puede aparecer como deseo de control.",
    },
    strengths: {
      ko: ["강력한 리더십과 방향 제시 능력", "변화를 주도하는 추진력", "어려운 결정을 내리는 용기", "팀과 조직의 목표를 달성하는 실행력"],
      en: ["Strong leadership and directional ability", "Drive to initiate change", "Courage to make difficult decisions", "Execution ability to achieve team and organizational goals"],
      ja: ["強力なリーダーシップと方向性提示能力", "変化を主導する推進力", "難しい決断を下す勇気", "チームと組織の目標を達成する実行力"],
      zh: ["强大的领导力和指引方向的能力", "主动推动变化的行动力", "做出艰难决定的勇气", "实现团队和组织目标的执行力"],
      fr: ["Leadership fort et capacité à donner une direction", "Élan pour initier le changement", "Courage de prendre des décisions difficiles", "Capacité d'exécution pour atteindre les objectifs d'équipe et d'organisation"],
      es: ["Liderazgo sólido y capacidad para marcar dirección", "Impulso para iniciar cambios", "Valentía para tomar decisiones difíciles", "Capacidad de ejecución para alcanzar objetivos de equipo y organización"],
    },
    fit: { ko: "경영자, 정치인, 전략 컨설턴트, 군인/경찰, 기업 임원", en: "Executive, Politician, Strategy Consultant, Military/Police, Corporate Officer", ja: "経営者、政治家、戦略コンサルタント、軍人/警察、企業役員", zh: "管理者、政治人物、战略顾问、军人/警察、企业高管", fr: "Dirigeant, responsable politique, consultant en stratégie, militaire/policier, cadre d'entreprise", es: "Ejecutivo, político, consultor estratégico, militar/policía, directivo empresarial" },
    watch: { ko: "영향력을 지배로 사용하거나 타인의 의견을 무시하면 신뢰를 잃을 수 있습니다.", en: "Using influence for control or dismissing others' opinions can erode trust.", ja: "影響力を支配のために使ったり、他者の意見を無視したりすると信頼を失うことがあります。", zh: "如果把影响力用于控制，或忽视他人的意见，可能会削弱信任。", fr: "Utiliser l'influence pour contrôler ou écarter les opinions des autres peut éroder la confiance.", es: "Usar la influencia para controlar o ignorar las opiniones de los demás puede erosionar la confianza." },
    affirmation: { ko: "나는 긍정적인 변화를 이끄는 힘이 있습니다.", en: "I have the power to lead positive change.", ja: "私には前向きな変化を導く力があります。", zh: "我有力量引领积极的改变。", fr: "J'ai le pouvoir de mener un changement positif.", es: "Tengo el poder de liderar un cambio positivo." },
  },
  autonomy: {
    name: { ko: "자율 동기형", en: "Autonomy", ja: "自律動機型", zh: "自主动机型", fr: "Autonomie", es: "Autonomía" },
    color: "#10b981",
    description: {
      ko: "당신은 자신만의 방식으로 일하고 자유를 가질 때 가장 창의적이고 생산적입니다. 외부의 규칙이나 지시보다 내적 기준을 중요시하며, 독립성을 핵심 가치로 여깁니다. 에드워드 데시(Edward Deci)와 리처드 라이언(Richard Ryan)의 자기결정이론에서 자율성은 가장 강력한 내적 동기 중 하나입니다.",
      en: "You're most creative and productive when you can work your own way with freedom. You value internal standards over external rules or direction, and cherish independence as a core value. In Edward Deci and Richard Ryan's Self-Determination Theory, autonomy is one of the most powerful intrinsic motivators.",
      ja: "あなたは自分だけのやり方で仕事し、自由を持つときに最も創造的で生産的です。外部のルールや指示より内的基準を重視し、独立性を核心的な価値として考えます。エドワード・デシ(Edward Deci)とリチャード・ライアン(Richard Ryan)の自己決定理論では、自律性は最も強力な内的動機の一つです。",
      zh: "当你能以自己的方式自由工作时，最有创造力也最有效率。相比外部规则或指令，你更重视内在标准，并把独立性视为核心价值。在爱德华·德西(Edward Deci)和理查德·瑞安(Richard Ryan)的自我决定理论中，自主性是最强大的内在动机之一。",
      fr: "Vous êtes le plus créatif et productif quand vous pouvez travailler librement, à votre manière. Vous accordez plus de valeur aux critères internes qu'aux règles ou directives externes, et vous tenez l'indépendance pour une valeur centrale. Dans la théorie de l'autodétermination d'Edward Deci et Richard Ryan, l'autonomie est l'un des moteurs intrinsèques les plus puissants.",
      es: "Eres más creativo y productivo cuando puedes trabajar a tu manera y con libertad. Valoras los criterios internos por encima de reglas o instrucciones externas, y aprecias la independencia como un valor central. En la teoría de la autodeterminación de Edward Deci y Richard Ryan, la autonomía es uno de los motivadores intrínsecos más poderosos.",
    },
    strengths: {
      ko: ["높은 창의성과 혁신적 사고", "자기 주도적 문제 해결", "강한 내적 동기와 자기 관리 능력", "독립적 판단력과 유연한 사고"],
      en: ["High creativity and innovative thinking", "Self-directed problem solving", "Strong intrinsic motivation and self-management", "Independent judgment and flexible thinking"],
      ja: ["高い創造性と革新的思考", "自己主導的な問題解決", "強い内的動機と自己管理能力", "独立した判断力と柔軟な思考"],
      zh: ["高度创造力和创新思维", "自主解决问题的能力", "强烈的内在动机和自我管理能力", "独立判断力与灵活思维"],
      fr: ["Grande créativité et pensée innovante", "Résolution de problèmes autonome", "Forte motivation intrinsèque et bonne autogestion", "Jugement indépendant et pensée flexible"],
      es: ["Alta creatividad y pensamiento innovador", "Resolución de problemas autodirigida", "Fuerte motivación intrínseca y autogestión", "Juicio independiente y pensamiento flexible"],
    },
    fit: { ko: "프리랜서, 크리에이터, 연구자, 1인 기업가, 예술가, 디자이너", en: "Freelancer, Creator, Researcher, Solopreneur, Artist, Designer", ja: "フリーランサー、クリエイター、研究者、ひとり企業家、アーティスト、デザイナー", zh: "自由职业者、创作者、研究者、个人创业者、艺术家、设计师", fr: "Freelance, créateur, chercheur, entrepreneur solo, artiste, designer", es: "Freelancer, creador, investigador, emprendedor individual, artista, diseñador" },
    watch: { ko: "팀 협업이나 구조적 환경에서 답답함을 느낄 수 있고, 조직 적응이 어려울 수 있습니다.", en: "You may feel frustrated in team collaboration or structured environments, and adapting to organizations can be challenging.", ja: "チームの協業や構造的な環境で息苦しさを感じることがあり、組織への適応が難しいことがあります。", zh: "在团队协作或结构化环境中，你可能会感到受限，适应组织也可能有挑战。", fr: "Vous pouvez vous sentir limité dans la collaboration d'équipe ou les environnements très structurés, et l'adaptation aux organisations peut être difficile.", es: "Puedes sentirte limitado en la colaboración de equipo o en entornos estructurados, y adaptarte a organizaciones puede resultar desafiante." },
    affirmation: { ko: "나는 나만의 방식으로 세상에 기여합니다.", en: "I contribute to the world in my own unique way.", ja: "私は自分だけの方法で世界に貢献します。", zh: "我以自己独特的方式为世界做出贡献。", fr: "Je contribue au monde à ma manière unique.", es: "Contribuyo al mundo a mi manera única." },
  },
};

const scaleLabels: Record<SupportedLocale, string[]> = {
  ko: ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"],
  en: ["Not at all", "Rarely", "Neutral", "Often", "Very much so"],
  ja: ["全くない", "ほとんどない", "普通", "よくある", "とてもそうだ"],
  zh: ["完全不是", "不太是", "一般", "比较符合", "非常符合"],
  fr: ["Pas du tout", "Rarement", "Neutre", "Souvent", "Tout à fait"],
  es: ["Para nada", "Rara vez", "Neutral", "A menudo", "Totalmente"],
};

const ui: Record<SupportedLocale, { title: string; subtitle: string; scale: string; progress: string; resultTitle: string; allTypes: string; fit: string; watch: string; affirmation: string; restart: string; share: string; copied: string; note: string }> = {
  ko: { title: "동기 유형 테스트", subtitle: "나를 움직이는 것은 무엇인가요?", scale: "이 문장에 얼마나 동의하시나요?", progress: "질문", resultTitle: "나의 동기 유형", allTypes: "유형별 점수", fit: "잘 맞는 역할", watch: "주의할 점", affirmation: "오늘의 확언", restart: "다시 테스트하기", share: "결과 공유", copied: "링크가 복사되었습니다!", note: "이 테스트는 데이비드 맥클리랜드(McClelland)의 성취·친화·권력 동기 이론과 자기결정이론(SDT)을 참고합니다." },
  en: { title: "Motivation Type Test", subtitle: "What drives you?", scale: "How much do you agree with this statement?", progress: "Question", resultTitle: "My Motivation Type", allTypes: "Scores by Type", fit: "Roles That Suit You", watch: "Watch Out For", affirmation: "Today's Affirmation", restart: "Retake Test", share: "Share Result", copied: "Link copied!", note: "This test references McClelland's Achievement/Affiliation/Power motivation theory and Self-Determination Theory (SDT)." },
  ja: { title: "動機タイプテスト", subtitle: "あなたを動かすものは何ですか？", scale: "この文章にどれくらい同意しますか？", progress: "質問", resultTitle: "私の動機タイプ", allTypes: "タイプ別スコア", fit: "向いている役割", watch: "注意点", affirmation: "今日のアファメーション", restart: "もう一度テストする", share: "結果を共有", copied: "リンクをコピーしました！", note: "このテストはマクレランド(McClelland)の達成・親和・権力動機理論と自己決定理論(SDT)を参考にしています。" },
  zh: { title: "动机类型测试", subtitle: "是什么驱动着你？", scale: "你在多大程度上同意这句话？", progress: "问题", resultTitle: "我的动机类型", allTypes: "各类型得分", fit: "适合的角色", watch: "需要留意", affirmation: "今日肯定语", restart: "重新测试", share: "分享结果", copied: "链接已复制！", note: "本测试参考麦克利兰(McClelland)的成就/亲和/权力动机理论，以及自我决定理论(SDT)。" },
  fr: { title: "Test du type de motivation", subtitle: "Qu'est-ce qui vous anime ?", scale: "Dans quelle mesure êtes-vous d'accord avec cette phrase ?", progress: "Question", resultTitle: "Mon type de motivation", allTypes: "Scores par type", fit: "Rôles qui vous conviennent", watch: "Points de vigilance", affirmation: "Affirmation du jour", restart: "Refaire le test", share: "Partager le résultat", copied: "Lien copié !", note: "Ce test s'appuie sur la théorie des motivations d'accomplissement, d'affiliation et de pouvoir de McClelland, ainsi que sur la théorie de l'autodétermination (SDT)." },
  es: { title: "Test de tipo de motivación", subtitle: "¿Qué te impulsa?", scale: "¿Qué tanto estás de acuerdo con esta afirmación?", progress: "Pregunta", resultTitle: "Mi tipo de motivación", allTypes: "Puntuaciones por tipo", fit: "Roles que encajan contigo", watch: "A tener en cuenta", affirmation: "Afirmación de hoy", restart: "Repetir test", share: "Compartir resultado", copied: "¡Enlace copiado!", note: "Este test toma como referencia la teoría de motivación de logro, afiliación y poder de McClelland, y la teoría de la autodeterminación (SDT)." },
};

export default function MotivationTypeTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const t = ui[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ type: MotivationType; scores: Record<MotivationType, number> } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const mt = p.get("mt") as MotivationType | null;
    const ms = p.get("ms");
    if (mt && mt in typeInfo && ms) {
      const [ac, af, pw, au] = ms.split(",").map(Number);
      setResult({ type: mt, scores: { achievement: ac, affiliation: af, power: pw, autonomy: au } });
    }
  }, []);

  function pick(score: number) {
    const next = answers.slice(0, idx);
    next[idx] = score;
    if (next.length < questions.length) { setAnswers(next); setTimeout(() => setIdx(next.length), 280); }
    else {
      const scores: Record<MotivationType, number> = { achievement: 0, affiliation: 0, power: 0, autonomy: 0 };
      questions.forEach((q, i) => { scores[q.type] += next[i]; });
      const dominant = (Object.keys(scores) as MotivationType[]).reduce((a, b) => scores[a] >= scores[b] ? a : b);
      setAnswers(next);
      setResult({ type: dominant, scores });
      const url = new URL(window.location.href);
      url.searchParams.set("mt", dominant);
      url.searchParams.set("ms", (["achievement", "affiliation", "power", "autonomy"] as MotivationType[]).map((k) => scores[k]).join(","));
      window.history.replaceState({}, "", url.toString());
    }
  }

  function previous() {
    if (idx === 0) return;
    setIdx(idx - 1);
  }

  function restart() {
    setIdx(0); setAnswers([]); setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("mt"); url.searchParams.delete("ms");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: t.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  if (result) {
    const d = typeInfo[result.type];
    const chartData = (["achievement", "affiliation", "power", "autonomy"] as MotivationType[]).map((type) => ({
      name: typeInfo[type].name[locale],
      value: result.scores[type],
      color: typeInfo[type].color, fill: typeInfo[type].color,
    })).sort((a, b) => b.value - a.value);

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{t.resultTitle}</h1>
          <div className="inline-block px-4 py-2 rounded-full text-white font-semibold" style={{ backgroundColor: d.color }}>{d.name[locale]}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="font-semibold text-gray-700 mb-2 text-sm">{t.allTypes}</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 24 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <p className="text-gray-700 leading-relaxed">{d.description[locale]}</p>
          <div className="grid gap-3">
            <div className="bg-green-50 rounded-lg p-3">
              <h3 className="font-semibold text-green-800 text-sm mb-1">✓ Strengths</h3>
              <ul>{d.strengths[locale].map((s, i) => <li key={i} className="text-sm text-green-700">• {s}</li>)}</ul>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <h3 className="font-semibold text-green-800 text-sm mb-1">💼 {t.fit}</h3>
              <p className="text-sm text-green-700">{d.fit[locale]}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <h3 className="font-semibold text-orange-800 text-sm mb-1">⚠ {t.watch}</h3>
              <p className="text-sm text-orange-700">{d.watch[locale]}</p>
            </div>
          </div>
          <div className="text-center py-3 rounded-lg" style={{ backgroundColor: d.color + "18" }}>
            <p className="text-sm italic" style={{ color: d.color }}>"{d.affirmation[locale]}"</p>
            <p className="text-xs text-gray-400 mt-1">{t.affirmation}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">{t.note}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium text-sm">{t.restart}</button>
          <button onClick={share} className="px-5 py-2 text-white rounded-full font-medium text-sm" style={{ backgroundColor: d.color }}>{copied ? t.copied : t.share}</button>
        </div>
        <ShareResultButton locale={localeProp ?? 'ko'} heading={t.title} resultTitle={d.name[locale]} />
      </div>
    );
  }

  const q = questions[idx];
  return (
    <Questionnaire
      title={t.title}
      subtitle={t.subtitle}
      question={q[locale]}
      questionLabel={`${t.progress} ${idx + 1} / ${questions.length}`}
      progress={Math.round(((idx + 1) / questions.length) * 100)}
      options={scaleLabels[locale].map((label, i) => ({ label, value: i }))}
      selectedValue={answers[idx]}
      note={t.scale}
      previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
      onPrevious={idx > 0 ? previous : undefined}
      onSelect={pick}
    />
  );
}
