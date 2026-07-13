import { useState, useEffect } from "react";
import ShareResultButton from '../shared/ShareResultButton'

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";
interface Props { locale?: string; }

type ValueKey = "security" | "adventure" | "creativity" | "family" | "achievement" | "freedom" | "contribution" | "growth" | "spirituality" | "wealth";

// Forced-choice pairs — each answer adds 1 point to one value
interface Pair { a: ValueKey; b: ValueKey; question: Record<SupportedLocale, { a: string; b: string; prompt: string }> }

const pairs: Pair[] = [
  { a: "security", b: "adventure", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "안정적이고 예측 가능한 삶", b: "새로운 경험과 모험" }, en: { prompt: "Which matters more to me?", a: "A stable and predictable life", b: "New experiences and adventure" }, ja: { prompt: "私にとってより重要なのは？", a: "安定した予測可能な生活", b: "新しい経験と冒険" }, zh: { prompt: "对我来说，什么更重要？", a: "稳定且可预期的生活", b: "新的体验和冒险" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "Une vie stable et prévisible", b: "De nouvelles expériences et l'aventure" }, es: { prompt: "¿Qué es más importante para mí?", a: "Una vida estable y predecible", b: "Nuevas experiencias y aventura" } } },
  { a: "family", b: "achievement", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "가족과 친밀한 관계", b: "목표 달성과 성공" }, en: { prompt: "Which matters more to me?", a: "Family and close relationships", b: "Achieving goals and success" }, ja: { prompt: "私にとってより重要なのは？", a: "家族と親密な関係", b: "目標達成と成功" }, zh: { prompt: "对我来说，什么更重要？", a: "家庭和亲密关系", b: "实现目标和取得成功" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "La famille et les relations proches", b: "Atteindre mes objectifs et réussir" }, es: { prompt: "¿Qué es más importante para mí?", a: "La familia y las relaciones cercanas", b: "Alcanzar metas y tener éxito" } } },
  { a: "creativity", b: "wealth", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "창의적 표현과 예술적 삶", b: "재정적 풍요와 경제적 안정" }, en: { prompt: "Which matters more to me?", a: "Creative expression and artistic life", b: "Financial abundance and economic security" }, ja: { prompt: "私にとってより重要なのは？", a: "創造的表現と芸術的な生活", b: "経済的豊かさと財政的安定" }, zh: { prompt: "对我来说，什么更重要？", a: "创意表达和艺术化的生活", b: "财务丰裕和经济安全" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "L'expression créative et une vie artistique", b: "L'abondance financière et la sécurité économique" }, es: { prompt: "¿Qué es más importante para mí?", a: "La expresión creativa y una vida artística", b: "La abundancia financiera y la seguridad económica" } } },
  { a: "freedom", b: "security", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "나만의 규칙으로 사는 자유", b: "사회적 안전망과 보호" }, en: { prompt: "Which matters more to me?", a: "Freedom to live by my own rules", b: "Social safety nets and protection" }, ja: { prompt: "私にとってより重要なのは？", a: "自分だけのルールで生きる自由", b: "社会的セーフティネットと保護" }, zh: { prompt: "对我来说，什么更重要？", a: "按自己的规则生活的自由", b: "社会安全网和保护" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "La liberté de vivre selon mes propres règles", b: "Les filets de sécurité sociale et la protection" }, es: { prompt: "¿Qué es más importante para mí?", a: "La libertad de vivir según mis propias reglas", b: "Las redes de seguridad social y la protección" } } },
  { a: "contribution", b: "achievement", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "사회와 타인에게 기여하는 삶", b: "개인적인 성과와 인정" }, en: { prompt: "Which matters more to me?", a: "A life of contributing to society and others", b: "Personal accomplishments and recognition" }, ja: { prompt: "私にとってより重要なのは？", a: "社会と他者に貢献する人生", b: "個人的な成果と認知" }, zh: { prompt: "对我来说，什么更重要？", a: "为社会和他人做贡献的生活", b: "个人成就和认可" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "Une vie qui contribue à la société et aux autres", b: "Les accomplissements personnels et la reconnaissance" }, es: { prompt: "¿Qué es más importante para mí?", a: "Una vida de contribución a la sociedad y a los demás", b: "Los logros personales y el reconocimiento" } } },
  { a: "growth", b: "family", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "지속적인 배움과 자기 성장", b: "사랑하는 사람들과의 시간" }, en: { prompt: "Which matters more to me?", a: "Continuous learning and self-growth", b: "Time with the people I love" }, ja: { prompt: "私にとってより重要なのは？", a: "継続的な学びと自己成長", b: "愛する人々との時間" }, zh: { prompt: "对我来说，什么更重要？", a: "持续学习和自我成长", b: "和所爱的人共度时光" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "L'apprentissage continu et le développement personnel", b: "Du temps avec les personnes que j'aime" }, es: { prompt: "¿Qué es más importante para mí?", a: "El aprendizaje continuo y el crecimiento personal", b: "Tiempo con las personas que amo" } } },
  { a: "spirituality", b: "wealth", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "내면의 평화와 영적 성장", b: "물질적 풍요와 사회적 성공" }, en: { prompt: "Which matters more to me?", a: "Inner peace and spiritual growth", b: "Material abundance and social success" }, ja: { prompt: "私にとってより重要なのは？", a: "内なる平和と霊的成長", b: "物質的豊かさと社会的成功" }, zh: { prompt: "对我来说，什么更重要？", a: "内心平静和精神成长", b: "物质丰裕和社会成功" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "La paix intérieure et la croissance spirituelle", b: "L'abondance matérielle et la réussite sociale" }, es: { prompt: "¿Qué es más importante para mí?", a: "La paz interior y el crecimiento espiritual", b: "La abundancia material y el éxito social" } } },
  { a: "adventure", b: "family", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "예측 불가능한 모험과 자극", b: "안정적인 가족 관계와 소속감" }, en: { prompt: "Which matters more to me?", a: "Unpredictable adventure and stimulation", b: "Stable family bonds and belonging" }, ja: { prompt: "私にとってより重要なのは？", a: "予測不可能な冒険と刺激", b: "安定した家族関係と帰属感" }, zh: { prompt: "对我来说，什么更重要？", a: "不可预期的冒险和刺激", b: "稳定的家庭纽带和归属感" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "L'aventure imprévisible et la stimulation", b: "Des liens familiaux stables et un sentiment d'appartenance" }, es: { prompt: "¿Qué es más importante para mí?", a: "La aventura impredecible y la estimulación", b: "Vínculos familiares estables y pertenencia" } } },
  { a: "creativity", b: "contribution", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "나만의 독창적인 작품 창조", b: "더 많은 사람들에게 도움이 되는 일" }, en: { prompt: "Which matters more to me?", a: "Creating original work of my own", b: "Doing work that helps more people" }, ja: { prompt: "私にとってより重要なのは？", a: "自分だけのオリジナル作品の創造", b: "より多くの人々を助ける仕事" }, zh: { prompt: "对我来说，什么更重要？", a: "创造属于自己的原创作品", b: "做能帮助更多人的事情" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "Créer une œuvre originale qui m'appartient", b: "Faire un travail qui aide davantage de personnes" }, es: { prompt: "¿Qué es más importante para mí?", a: "Crear una obra original propia", b: "Hacer un trabajo que ayude a más personas" } } },
  { a: "freedom", b: "growth", question: { ko: { prompt: "나에게 더 중요한 것은?", a: "어디에도 얽매이지 않는 자유", b: "더 나은 내가 되어가는 성장" }, en: { prompt: "Which matters more to me?", a: "Freedom tied to nothing", b: "Growth into a better self" }, ja: { prompt: "私にとってより重要なのは？", a: "何にも縛られない自由", b: "より良い自分への成長" }, zh: { prompt: "对我来说，什么更重要？", a: "不被任何事物束缚的自由", b: "成长为更好的自己" }, fr: { prompt: "Qu'est-ce qui compte le plus pour moi ?", a: "Une liberté qui ne m'attache à rien", b: "Devenir une meilleure version de moi-même" }, es: { prompt: "¿Qué es más importante para mí?", a: "La libertad de no estar atado a nada", b: "Crecer hacia una mejor versión de mí" } } },
];

const valueInfo: Record<ValueKey, { name: Record<SupportedLocale, string>; emoji: string; color: string; description: Record<SupportedLocale, string>; live: Record<SupportedLocale, string> }> = {
  security: { name: { ko: "안정", en: "Security", ja: "安定", zh: "安全感", fr: "Sécurité", es: "Seguridad" }, emoji: "🏠", color: "#6366f1", description: { ko: "당신에게 안정감과 예측 가능성은 삶의 근간입니다. 안전한 환경에서 더 깊이 성장하고 타인을 돌볼 수 있습니다.", en: "Security and predictability are the foundation of your life. In a safe environment, you can grow deeper and care for others.", ja: "安定感と予測可能性はあなたの人生の基盤です。安全な環境でより深く成長し、他者を思いやることができます。", zh: "安全感和可预期性是你生活的基础。在安全的环境中，你能更深入地成长，也能照顾他人。", fr: "La sécurité et la prévisibilité sont les bases de votre vie. Dans un environnement sûr, vous pouvez grandir plus profondément et prendre soin des autres.", es: "La seguridad y la previsibilidad son la base de tu vida. En un entorno seguro, puedes crecer con más profundidad y cuidar de los demás." }, live: { ko: "안정적인 루틴과 비상금, 신뢰할 수 있는 사람들 곁에 있는 것이 당신의 삶에 활력을 줍니다.", en: "Stable routines, emergency savings, and having trustworthy people around energize your life.", ja: "安定したルーティン、緊急資金、信頼できる人々の近くにいることがあなたの人生に活力を与えます。", zh: "稳定的日常、应急储蓄，以及身边有值得信赖的人，会为你的生活注入能量。", fr: "Des routines stables, une épargne de secours et la présence de personnes fiables donnent de l'énergie à votre vie.", es: "Las rutinas estables, los ahorros de emergencia y tener personas confiables cerca dan energía a tu vida." } },
  adventure: { name: { ko: "모험", en: "Adventure", ja: "冒険", zh: "冒险", fr: "Aventure", es: "Aventura" }, emoji: "🌍", color: "#ef4444", description: { ko: "새로운 경험과 예측 불가능한 자극이 당신을 살아있게 만듭니다. 틀에 박힌 일상보다 새로운 도전이 에너지를 줍니다.", en: "New experiences and unpredictable stimulation make you feel alive. New challenges energize you more than routine.", ja: "新しい経験と予測不可能な刺激があなたを生き生きとさせます。決まりきった日常より新しい挑戦がエネルギーを与えます。", zh: "新的体验和不可预期的刺激会让你感到真正活着。比起固定的日常，新的挑战更能带给你能量。", fr: "Les nouvelles expériences et les stimulations imprévisibles vous donnent le sentiment d'être pleinement vivant. Les nouveaux défis vous dynamisent plus que la routine.", es: "Las nuevas experiencias y los estímulos impredecibles te hacen sentir vivo. Los nuevos desafíos te dan más energía que la rutina." }, live: { ko: "새로운 여행, 낯선 사람과의 대화, 처음 해보는 경험들이 당신을 충전시킵니다.", en: "New travel, conversations with strangers, and first-time experiences recharge you.", ja: "新しい旅、見知らぬ人との会話、初めての経験があなたを充電させます。", zh: "新的旅行、与陌生人的对话，以及第一次尝试的体验，都会为你充电。", fr: "Les nouveaux voyages, les conversations avec des inconnus et les premières expériences vous ressourcent.", es: "Los viajes nuevos, las conversaciones con desconocidos y las experiencias por primera vez te recargan." } },
  creativity: { name: { ko: "창의성", en: "Creativity", ja: "創造性", zh: "创造力", fr: "Créativité", es: "Creatividad" }, emoji: "🎨", color: "#ec4899", description: { ko: "당신은 새로운 것을 만들고 아이디어를 표현하는 과정에서 깊은 의미를 찾습니다. 창의적 출구 없이는 답답함을 느낄 수 있습니다.", en: "You find deep meaning in creating new things and expressing ideas. Without a creative outlet, you may feel stifled.", ja: "あなたは新しいものを作り、アイデアを表現する過程に深い意味を見出します。創造的な出口なしには息苦しさを感じることがあります。", zh: "你会在创造新事物和表达想法的过程中找到深层意义。没有创造性的出口时，你可能会感到压抑。", fr: "Vous trouvez un sens profond dans la création de nouvelles choses et l'expression des idées. Sans espace créatif, vous pouvez vous sentir à l'étroit.", es: "Encuentras un sentido profundo al crear cosas nuevas y expresar ideas. Sin una salida creativa, puedes sentirte limitado." }, live: { ko: "예술, 글쓰기, 디자인, 음악, 혁신적 아이디어를 실험할 수 있는 공간이 필요합니다.", en: "You need space to experiment with art, writing, design, music, or innovative ideas.", ja: "芸術、文章、デザイン、音楽、革新的なアイデアを実験できる空間が必要です。", zh: "你需要能尝试艺术、写作、设计、音乐或创新想法的空间。", fr: "Vous avez besoin d'un espace pour expérimenter avec l'art, l'écriture, le design, la musique ou des idées innovantes.", es: "Necesitas espacio para experimentar con arte, escritura, diseño, música o ideas innovadoras." } },
  family: { name: { ko: "가족/관계", en: "Family/Relationships", ja: "家族/関係", zh: "家庭/关系", fr: "Famille/Relations", es: "Familia/Relaciones" }, emoji: "💞", color: "#f59e0b", description: { ko: "당신에게 사랑하는 사람들과의 깊은 유대가 삶의 중심입니다. 관계의 질이 삶의 질을 결정합니다.", en: "For you, deep bonds with the people you love are the center of life. The quality of relationships determines the quality of life.", ja: "あなたにとって愛する人々との深い絆が人生の中心です。関係の質が人生の質を決定します。", zh: "对你来说，与所爱之人的深厚联结是生活的中心。关系的质量决定了生活的质量。", fr: "Pour vous, les liens profonds avec les personnes que vous aimez sont au centre de la vie. La qualité des relations détermine la qualité de vie.", es: "Para ti, los vínculos profundos con las personas que amas están en el centro de la vida. La calidad de las relaciones determina la calidad de vida." }, live: { ko: "정기적인 가족 모임, 친한 친구들과의 깊은 대화, 서로를 돌보는 시간이 삶을 풍요롭게 합니다.", en: "Regular family gatherings, deep talks with close friends, and time caring for each other enrich your life.", ja: "定期的な家族の集まり、親しい友人との深い対話、互いを思いやる時間が人生を豊かにします。", zh: "定期的家庭聚会、与亲密朋友深入交谈，以及彼此照顾的时间，会让你的生活更丰盛。", fr: "Les réunions familiales régulières, les conversations profondes avec des amis proches et le temps passé à prendre soin les uns des autres enrichissent votre vie.", es: "Las reuniones familiares regulares, las conversaciones profundas con amigos cercanos y el tiempo de cuidado mutuo enriquecen tu vida." } },
  achievement: { name: { ko: "성취", en: "Achievement", ja: "達成", zh: "成就", fr: "Accomplissement", es: "Logro" }, emoji: "🏆", color: "#10b981", description: { ko: "목표를 달성하고 성과를 인정받는 것이 당신에게 강력한 동기입니다. 성장의 증거를 보고 싶어합니다.", en: "Achieving goals and receiving recognition for your results is a powerful motivator. You want to see evidence of growth.", ja: "目標を達成し成果を認められることが強力な動機です。成長の証拠を見たいと思っています。", zh: "达成目标并让成果得到认可，是你的强大动力。你希望看见自己成长的证据。", fr: "Atteindre des objectifs et voir vos résultats reconnus est un puissant moteur pour vous. Vous voulez voir des preuves de votre progression.", es: "Alcanzar metas y recibir reconocimiento por tus resultados es una motivación poderosa. Quieres ver evidencia de crecimiento." }, live: { ko: "명확한 목표, 측정 가능한 진척도, 이정표마다의 작은 축하가 삶에 에너지를 줍니다.", en: "Clear goals, measurable progress, and small celebrations at each milestone energize your life.", ja: "明確な目標、測定可能な進捗、各マイルストーンでの小さなお祝いが人生にエネルギーを与えます。", zh: "清晰的目标、可衡量的进展，以及在每个里程碑上的小庆祝，会给你的生活带来能量。", fr: "Des objectifs clairs, des progrès mesurables et de petites célébrations à chaque étape donnent de l'énergie à votre vie.", es: "Las metas claras, el progreso medible y pequeñas celebraciones en cada hito dan energía a tu vida." } },
  freedom: { name: { ko: "자유", en: "Freedom", ja: "自由", zh: "自由", fr: "Liberté", es: "Libertad" }, emoji: "🦋", color: "#8b5cf6", description: { ko: "당신은 외부의 강제나 제약 없이 자신의 방식으로 살고 싶습니다. 자율성이 핵심 가치입니다.", en: "You want to live your own way without external coercion or constraints. Autonomy is your core value.", ja: "あなたは外部の強制や制約なく、自分のやり方で生きたいと思っています。自律性が核心的な価値です。", zh: "你想在没有外部强迫或限制的情况下，按照自己的方式生活。自主性是你的核心价值。", fr: "Vous voulez vivre à votre manière, sans contrainte ni pression extérieure. L'autonomie est votre valeur centrale.", es: "Quieres vivir a tu manera, sin coerción ni restricciones externas. La autonomía es tu valor central." }, live: { ko: "스스로 결정하는 일, 유연한 일정, 억압적인 환경에서 벗어나는 것이 당신을 살아있게 합니다.", en: "Self-determined work, flexible schedules, and freedom from oppressive environments keep you alive.", ja: "自分で決める仕事、柔軟なスケジュール、抑圧的な環境からの解放があなたを生き生きとさせます。", zh: "自主决定的工作、灵活的日程，以及摆脱压抑环境，会让你感到充满生命力。", fr: "Un travail autodéterminé, des horaires flexibles et la liberté de quitter les environnements oppressants vous font vous sentir vivant.", es: "El trabajo autodeterminado, los horarios flexibles y liberarte de entornos opresivos te hacen sentir vivo." } },
  contribution: { name: { ko: "사회 기여", en: "Contribution", ja: "社会貢献", zh: "社会贡献", fr: "Contribution", es: "Contribución" }, emoji: "🌱", color: "#10b981", description: { ko: "당신은 세상을 더 나은 곳으로 만드는 것에서 의미를 찾습니다. 개인의 성공보다 더 큰 목적을 추구합니다.", en: "You find meaning in making the world a better place. You pursue a larger purpose beyond personal success.", ja: "あなたは世界をより良い場所にすることに意味を見出します。個人の成功より大きな目的を追求します。", zh: "你会在让世界变得更好这件事中找到意义。相比个人成功，你追求更大的目的。", fr: "Vous trouvez du sens dans le fait de rendre le monde meilleur. Vous poursuivez un objectif plus grand que la réussite personnelle.", es: "Encuentras sentido en hacer del mundo un lugar mejor. Persigues un propósito más grande que el éxito personal." }, live: { ko: "봉사, NGO, 교육, 의료, 환경보호 등 사람과 세상에 직접 영향을 미치는 일이 삶의 목적이 됩니다.", en: "Service, NGOs, education, healthcare, environmental protection — work that directly impacts people and the world becomes your life's purpose.", ja: "봉사、NGO、教育、医療、環境保護など人と世界に直接影響を与える仕事が人生の目的になります。", zh: "志愿服务、非政府组织、教育、医疗、环境保护等能直接影响人与世界的工作，会成为你的人生目的。", fr: "Le bénévolat, les ONG, l'éducation, la santé, la protection de l'environnement et les missions qui touchent directement les personnes et le monde deviennent votre raison d'être.", es: "El servicio, las ONG, la educación, la salud, la protección ambiental y el trabajo que impacta directamente a las personas y al mundo se convierten en tu propósito de vida." } },
  growth: { name: { ko: "성장", en: "Growth", ja: "成長", zh: "成长", fr: "Croissance", es: "Crecimiento" }, emoji: "📈", color: "#3b82f6", description: { ko: "당신은 어제보다 나은 오늘을 지향합니다. 배움, 발전, 자기 개선이 삶의 핵심 드라이버입니다.", en: "You strive to be better today than yesterday. Learning, development, and self-improvement are your life's core drivers.", ja: "あなたは昨日より良い今日を目指します。学び、発展、自己改善が人生の核心的な推進力です。", zh: "你追求今天比昨天更好。学习、发展和自我提升，是你生活的核心驱动力。", fr: "Vous cherchez à être meilleur aujourd'hui qu'hier. L'apprentissage, le développement et l'amélioration personnelle sont les moteurs centraux de votre vie.", es: "Buscas ser mejor hoy que ayer. El aprendizaje, el desarrollo y la mejora personal son los motores centrales de tu vida." }, live: { ko: "책, 강의, 멘토십, 새로운 기술 습득 — 계속 배우는 환경이 당신에게 가장 좋은 환경입니다.", en: "Books, courses, mentorship, acquiring new skills — an environment of constant learning is best for you.", ja: "本、講座、メンターシップ、新しいスキルの習得 — 常に学べる環境があなたにとって最高の環境です。", zh: "书籍、课程、导师指导、学习新技能——持续学习的环境最适合你。", fr: "Livres, cours, mentorat, acquisition de nouvelles compétences : un environnement d'apprentissage continu est le meilleur pour vous.", es: "Libros, cursos, mentoría, adquisición de nuevas habilidades: un entorno de aprendizaje constante es lo mejor para ti." } },
  spirituality: { name: { ko: "영성/내면", en: "Spirituality/Inner Life", ja: "霊性/内面", zh: "灵性/内在生活", fr: "Spiritualité/Vie intérieure", es: "Espiritualidad/Vida interior" }, emoji: "🕊️", color: "#6366f1", description: { ko: "당신은 외부의 성취보다 내면의 평화와 더 깊은 의미를 추구합니다. 삶의 목적과 연결감이 중요합니다.", en: "You seek inner peace and deeper meaning over external achievements. Life's purpose and connection are important to you.", ja: "あなたは外部の成果より内なる平和とより深い意味を追求します。人生の目的とつながりが重要です。", zh: "相比外在成就，你更追求内心平静和更深层的意义。人生目的和联结感对你很重要。", fr: "Vous recherchez la paix intérieure et un sens plus profond plutôt que les réussites extérieures. Le but de la vie et le sentiment de connexion sont importants pour vous.", es: "Buscas paz interior y un significado más profundo por encima de los logros externos. El propósito de vida y la conexión son importantes para ti." }, live: { ko: "명상, 자연, 깊은 철학적 대화, 봉사, 예술적 체험이 당신을 충전시킵니다.", en: "Meditation, nature, deep philosophical conversations, service, and artistic experiences recharge you.", ja: "瞑想、自然、深い哲学的対話、봉사、芸術的な体験があなたを充電させます。", zh: "冥想、自然、深入的哲学对话、服务他人和艺术体验，都会为你充电。", fr: "La méditation, la nature, les conversations philosophiques profondes, le service et les expériences artistiques vous ressourcent.", es: "La meditación, la naturaleza, las conversaciones filosóficas profundas, el servicio y las experiencias artísticas te recargan." } },
  wealth: { name: { ko: "부/풍요", en: "Wealth/Abundance", ja: "富/豊かさ", zh: "财富/丰裕", fr: "Richesse/Abondance", es: "Riqueza/Abundancia" }, emoji: "💎", color: "#f59e0b", description: { ko: "재정적 안정과 물질적 풍요는 당신에게 자유와 선택권을 의미합니다. 돈을 목적이 아닌 가능성의 도구로 봅니다.", en: "Financial stability and material abundance mean freedom and options to you. You see money not as an end but as a tool for possibility.", ja: "財政的安定と物質的豊かさはあなたにとって自由と選択肢を意味します。お金を目的ではなく可能性のツールとして見ています。", zh: "财务稳定和物质丰裕对你来说意味着自由和选择权。你不把钱看作目的，而把它看作实现可能性的工具。", fr: "La stabilité financière et l'abondance matérielle représentent pour vous la liberté et les options. Vous voyez l'argent non comme une fin, mais comme un outil de possibilités.", es: "La estabilidad financiera y la abundancia material significan libertad y opciones para ti. Ves el dinero no como un fin, sino como una herramienta de posibilidades." }, live: { ko: "재정 목표 설정, 투자, 가치 있는 경험에 지출하는 것이 삶의 만족도를 높입니다.", en: "Setting financial goals, investing, and spending on meaningful experiences raise your life satisfaction.", ja: "財政的目標設定、投資、価値ある経験への支出が人生の満足度を高めます。", zh: "设定财务目标、投资，以及把钱花在有价值的体验上，会提升你的生活满意度。", fr: "Fixer des objectifs financiers, investir et dépenser pour des expériences qui ont du sens augmentent votre satisfaction de vie.", es: "Definir metas financieras, invertir y gastar en experiencias significativas aumenta tu satisfacción con la vida." } },
};

const ui: Record<SupportedLocale, { title: string; subtitle: string; progress: string; choose: string; resultTitle: string; top3: string; howToLive: string; affirmation: string; restart: string; share: string; copied: string; note: string }> = {
  ko: { title: "삶의 가치관 테스트", subtitle: "나에게 가장 중요한 것은 무엇인가요?", progress: "선택", choose: "어느 것이 더 중요한가요?", resultTitle: "나의 핵심 가치관", top3: "나의 상위 3가지 가치관", howToLive: "이 가치관에 맞게 사는 법", affirmation: "나의 가치관 선언", restart: "다시 테스트하기", share: "결과 공유", copied: "링크가 복사되었습니다!", note: "이 테스트는 가치관이 행동과 삶의 만족도에 미치는 영향을 연구한 긍정심리학 기반으로 합니다." },
  en: { title: "Life Values Test", subtitle: "What matters most to you in life?", progress: "Choice", choose: "Which is more important?", resultTitle: "My Core Values", top3: "My Top 3 Values", howToLive: "How to Live by These Values", affirmation: "My Values Declaration", restart: "Retake Test", share: "Share Result", copied: "Link copied!", note: "This test is based on positive psychology research on how values influence behavior and life satisfaction." },
  ja: { title: "人生の価値観テスト", subtitle: "あなたにとって最も重要なことは何ですか？", progress: "選択", choose: "どちらがより重要ですか？", resultTitle: "私の核心的価値観", top3: "私のトップ3価値観", howToLive: "この価値観に合わせて生きる方法", affirmation: "私の価値観宣言", restart: "もう一度テストする", share: "結果を共有", copied: "リンクをコピーしました！", note: "このテストは価値観が行動と人生の満足度に与える影響を研究したポジティブ心理学に基づいています。" },
  zh: { title: "人生价值观测试", subtitle: "生活中什么对你最重要？", progress: "选择", choose: "哪一个更重要？", resultTitle: "我的核心价值观", top3: "我的前三项价值观", howToLive: "如何按照这些价值观生活", affirmation: "我的价值观宣言", restart: "重新测试", share: "分享结果", copied: "链接已复制！", note: "本测试基于积极心理学中关于价值观如何影响行为和生活满意度的研究。" },
  fr: { title: "Test des valeurs de vie", subtitle: "Qu'est-ce qui compte le plus dans votre vie ?", progress: "Choix", choose: "Qu'est-ce qui est le plus important ?", resultTitle: "Mes valeurs fondamentales", top3: "Mes 3 valeurs principales", howToLive: "Comment vivre selon ces valeurs", affirmation: "Ma déclaration de valeurs", restart: "Refaire le test", share: "Partager le résultat", copied: "Lien copié !", note: "Ce test s'appuie sur les recherches en psychologie positive sur l'influence des valeurs sur le comportement et la satisfaction de vie." },
  es: { title: "Test de valores de vida", subtitle: "¿Qué es lo más importante para ti en la vida?", progress: "Elección", choose: "¿Qué es más importante?", resultTitle: "Mis valores centrales", top3: "Mis 3 valores principales", howToLive: "Cómo vivir según estos valores", affirmation: "Mi declaración de valores", restart: "Repetir test", share: "Compartir resultado", copied: "¡Enlace copiado!", note: "Este test se basa en investigaciones de psicología positiva sobre cómo los valores influyen en la conducta y la satisfacción vital." },
};

export default function LifeValuesTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const t = ui[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Partial<Record<ValueKey, number>>>({});
  const [result, setResult] = useState<ValueKey[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const lv = p.get("lv");
    if (lv) setResult(lv.split(",") as ValueKey[]);
  }, []);

  function pick(chosen: ValueKey) {
    const next = { ...scores, [chosen]: (scores[chosen] ?? 0) + 1 };
    if (idx + 1 < pairs.length) {
      setScores(next);
      setTimeout(() => setIdx(idx + 1), 280);
    } else {
      const allKeys = Object.keys(valueInfo) as ValueKey[];
      const sorted = allKeys.sort((a, b) => (next[b] ?? 0) - (next[a] ?? 0));
      const top3 = sorted.slice(0, 3);
      setScores(next);
      setResult(top3);
      const url = new URL(window.location.href);
      url.searchParams.set("lv", top3.join(","));
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0); setScores({}); setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("lv");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: t.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  if (result) {
    const primary = result[0];
    const d = valueInfo[primary];
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{t.resultTitle}</h1>
          <div className="text-4xl">{d.emoji}</div>
          <div className="inline-block px-4 py-2 rounded-full text-white font-semibold" style={{ backgroundColor: d.color }}>{d.name[locale]}</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="font-semibold text-gray-700 text-sm mb-3">{t.top3}</h2>
          <div className="flex flex-wrap gap-2">
            {result.map((key, i) => (
              <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium" style={{ backgroundColor: valueInfo[key].color }}>
                <span>{valueInfo[key].emoji}</span>
                <span>{i + 1}. {valueInfo[key].name[locale]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <p className="text-gray-700 leading-relaxed">{d.description[locale]}</p>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 text-sm mb-1">🌱 {t.howToLive}</h3>
            <p className="text-sm text-blue-700">{d.live[locale]}</p>
          </div>
          {result.slice(1).map((key) => (
            <div key={key} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span>{valueInfo[key].emoji}</span>
                <span className="font-semibold text-sm text-gray-800">{valueInfo[key].name[locale]}</span>
              </div>
              <p className="text-sm text-gray-600">{valueInfo[key].description[locale]}</p>
            </div>
          ))}
          <div className="text-center py-3 rounded-lg" style={{ backgroundColor: d.color + "18" }}>
            <p className="text-sm font-medium" style={{ color: d.color }}>
              {result.map((k) => valueInfo[k].name[locale]).join(" · ")}
            </p>
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

  const pair = pairs[idx];
  const q = pair.question[locale];
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-500">{t.subtitle}</p>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{t.progress} {idx + 1} / {pairs.length}</span>
        <div className="w-48 bg-gray-200 rounded-full h-1.5">
          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${((idx + 1) / pairs.length) * 100}%` }} />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
        <p className="text-sm font-medium text-gray-500 text-center">{q.prompt}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button onClick={() => pick(pair.a)}
            className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left space-y-1">
            <div className="text-2xl">{valueInfo[pair.a].emoji}</div>
            <div className="font-semibold text-gray-800 text-sm">{valueInfo[pair.a].name[locale]}</div>
            <div className="text-xs text-gray-500">{q.a}</div>
          </button>
          <button onClick={() => pick(pair.b)}
            className="p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left space-y-1">
            <div className="text-2xl">{valueInfo[pair.b].emoji}</div>
            <div className="font-semibold text-gray-800 text-sm">{valueInfo[pair.b].name[locale]}</div>
            <div className="text-xs text-gray-500">{q.b}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
