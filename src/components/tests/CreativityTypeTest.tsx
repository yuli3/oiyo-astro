import { useState, useEffect } from "react";
import ShareResultButton from '../shared/ShareResultButton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type CreativityType = "divergent" | "convergent" | "narrative" | "systems" | "aesthetic";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  options: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
    fr: string;
    es: string;
    type: CreativityType;
  }[];
}

const questions: Question[] = [
  {
    ko: "새로운 아이디어가 어떻게 떠오르나요?",
    en: "How do new ideas come to you?",
    ja: "新しいアイデアはどのように浮かびますか？",
    zh: "新的想法通常是怎样浮现的？",
    fr: "Comment les nouvelles idées vous viennent-elles ?",
    es: "¿Cómo se te ocurren las nuevas ideas?",
    options: [
      { ko: "여러 분야를 연결하거나 기존 것들을 새롭게 조합할 때", en: "When connecting different fields or recombining existing things in new ways", ja: "異なる分野を結びつけたり既存のものを新しく組み合わせるとき", zh: "当我连接不同领域，或以新方式重组已有事物时", fr: "Quand je relie plusieurs domaines ou recombine des éléments existants autrement", es: "Cuando conecto campos distintos o recombino cosas existentes de formas nuevas", type: "divergent" },
      { ko: "기존 아이디어의 문제점을 파악하고 더 나은 해결책을 찾을 때", en: "When identifying problems with existing ideas and finding better solutions", ja: "既存のアイデアの問題を把握してより良い解決策を見つけるとき", zh: "当我发现现有想法的问题，并寻找更好的解决方案时", fr: "Quand je repère les limites d'une idée existante et cherche une meilleure solution", es: "Cuando detecto problemas en ideas existentes y busco mejores soluciones", type: "convergent" },
      { ko: "개인 경험이나 관찰에서 패턴을 발견하거나 이야기를 만들어낼 때", en: "When finding patterns in personal experience or observation and crafting stories", ja: "個人的な経験や観察からパターンを発見し、物語を作るとき", zh: "当我从个人经历或观察中发现模式，并把它们变成故事时", fr: "Quand je trouve des motifs dans mes expériences ou observations et en fais des récits", es: "Cuando encuentro patrones en experiencias u observaciones personales y construyo historias", type: "narrative" },
      { ko: "복잡한 시스템이나 패턴을 분석하고 구조를 만들 때", en: "When analyzing complex systems or patterns and building structures", ja: "複雑なシステムやパターンを分析し、構造を作るとき", zh: "当我分析复杂系统或模式，并搭建结构时", fr: "Quand j'analyse des systèmes ou motifs complexes et que je bâtis des structures", es: "Cuando analizo sistemas o patrones complejos y creo estructuras", type: "systems" },
      { ko: "미적 감각이나 감정적 울림에서 영감을 받을 때", en: "When inspired by aesthetic sense or emotional resonance", ja: "美的感覚や感情的な共鳴からインスピレーションを受けるとき", zh: "当我受到美感或情感共鸣的启发时", fr: "Quand je suis inspiré par le sens esthétique ou la résonance émotionnelle", es: "Cuando me inspira el sentido estético o la resonancia emocional", type: "aesthetic" },
    ],
  },
  {
    ko: "창의적인 블록(막힘)을 극복하는 나만의 방법은?",
    en: "Your personal way to overcome creative blocks:",
    ja: "クリエイティブなブロックを乗り越える自分なりの方法は？",
    zh: "你克服创作卡壳的个人方法是？",
    fr: "Votre façon personnelle de surmonter les blocages créatifs :",
    es: "Tu forma personal de superar bloqueos creativos:",
    options: [
      { ko: "완전히 다른 분야의 책을 읽거나 새로운 경험을 한다", en: "Read books in completely different fields or have new experiences", ja: "全く異なる分野の本を読んだり、新しい経験をする", zh: "阅读完全不同领域的书，或尝试新的体验", fr: "Lire des livres dans des domaines très différents ou vivre de nouvelles expériences", es: "Leer libros de campos completamente distintos o vivir experiencias nuevas", type: "divergent" },
      { ko: "문제를 더 작게 나누거나 제약 조건을 명확히 한다", en: "Break the problem into smaller pieces or clarify constraints", ja: "問題をより小さく分けたり、制約条件を明確にする", zh: "把问题拆得更小，或明确限制条件", fr: "Découper le problème en parties plus petites ou clarifier les contraintes", es: "Dividir el problema en partes más pequeñas o aclarar las restricciones", type: "convergent" },
      { ko: "일기를 쓰거나 산책하며 생각과 감정을 정리한다", en: "Write in a journal or take a walk to organize thoughts and feelings", ja: "日記を書いたり散歩して考えと感情を整理する", zh: "写日记或散步，整理想法和感受", fr: "Écrire dans un journal ou marcher pour organiser mes pensées et émotions", es: "Escribir en un diario o caminar para ordenar pensamientos y emociones", type: "narrative" },
      { ko: "전체 흐름을 다시 그리고 어디서 막혔는지 파악한다", en: "Redraw the whole flow and figure out where I got stuck", ja: "全体の流れを描き直し、どこで詰まったかを把握する", zh: "重新画出整体流程，找出卡住的位置", fr: "Reprendre tout le déroulé et identifier l'endroit où je bloque", es: "Redibujar todo el flujo y ver en qué punto me atasqué", type: "systems" },
      { ko: "음악, 미술관, 자연 등 미적 자극을 찾는다", en: "Seek aesthetic stimulation — music, art galleries, nature", ja: "音楽、美術館、自然などの美的刺激を求める", zh: "寻找音乐、美术馆、自然等美学刺激", fr: "Chercher une stimulation esthétique : musique, musées, nature", es: "Buscar estímulos estéticos: música, galerías de arte, naturaleza", type: "aesthetic" },
    ],
  },
  {
    ko: "당신이 가장 즐기는 창의적 활동은?",
    en: "The creative activity you enjoy most:",
    ja: "あなたが最も楽しむクリエイティブな活動は？",
    zh: "你最享受的创意活动是？",
    fr: "L'activité créative que vous aimez le plus :",
    es: "La actividad creativa que más disfrutas:",
    options: [
      { ko: "브레인스토밍, 마인드맵, 새로운 아이디어 목록 만들기", en: "Brainstorming, mind mapping, creating lists of new ideas", ja: "ブレインストーミング、マインドマップ、新しいアイデアリスト作成", zh: "头脑风暴、思维导图、列出新点子清单", fr: "Brainstorming, cartes mentales, listes de nouvelles idées", es: "Lluvia de ideas, mapas mentales, listas de ideas nuevas", type: "divergent" },
      { ko: "기존 아이디어를 개선하거나 문제 해결 프로세스 만들기", en: "Improving existing ideas or creating problem-solving processes", ja: "既存のアイデアの改善や問題解決プロセスの作成", zh: "改进已有想法，或设计解决问题的流程", fr: "Améliorer des idées existantes ou créer des processus de résolution de problèmes", es: "Mejorar ideas existentes o crear procesos para resolver problemas", type: "convergent" },
      { ko: "글쓰기, 스토리텔링, 개인 경험 나누기", en: "Writing, storytelling, sharing personal experiences", ja: "ライティング、ストーリーテリング、個人的な経験の共有", zh: "写作、讲故事、分享个人经历", fr: "Écriture, storytelling, partage d'expériences personnelles", es: "Escritura, storytelling, compartir experiencias personales", type: "narrative" },
      { ko: "복잡한 것을 체계적으로 정리하거나 프레임워크 만들기", en: "Systematically organizing complex things or creating frameworks", ja: "複雑なものを体系的に整理したり、フレームワークの作成", zh: "系统整理复杂事物，或创建框架", fr: "Organiser méthodiquement des choses complexes ou créer des cadres", es: "Organizar sistemáticamente cosas complejas o crear marcos de trabajo", type: "systems" },
      { ko: "디자인, 음악, 사진 등 시각적·청각적 창작", en: "Visual and auditory creation — design, music, photography", ja: "デザイン、音楽、写真などの視覚的・聴覚的創作", zh: "设计、音乐、摄影等视觉或听觉创作", fr: "Création visuelle et sonore : design, musique, photographie", es: "Creación visual y auditiva: diseño, música, fotografía", type: "aesthetic" },
    ],
  },
  {
    ko: "다른 사람의 아이디어를 들었을 때 주로 드는 생각은?",
    en: "When you hear someone else's idea, your typical reaction is:",
    ja: "他の人のアイデアを聞いたとき、主に思うことは？",
    zh: "听到别人的想法时，你通常会怎么想？",
    fr: "Quand vous entendez l'idée de quelqu'un d'autre, votre réaction habituelle est :",
    es: "Cuando escuchas la idea de otra persona, tu reacción típica es:",
    options: [
      { ko: "이 아이디어를 다른 것과 연결하면 어떻게 될까?", en: "'What if I connected this to something else?'", ja: "このアイデアを他のものと結びつけたらどうなるか？", zh: "“如果把这个想法和别的东西连接起来会怎样？”", fr: "« Et si je reliais cette idée à autre chose ? »", es: "«¿Y si conectara esta idea con otra cosa?»", type: "divergent" },
      { ko: "이 아이디어의 약점은 무엇이고 어떻게 보완할 수 있을까?", en: "'What are the weaknesses and how can they be addressed?'", ja: "このアイデアの弱点は何で、どう補えるか？", zh: "“这个想法的弱点是什么？该如何弥补？”", fr: "« Quelles sont ses faiblesses et comment les corriger ? »", es: "«¿Cuáles son sus debilidades y cómo podrían corregirse?»", type: "convergent" },
      { ko: "이 아이디어의 배경에는 어떤 이야기가 있을까?", en: "'What story is behind this idea?'", ja: "このアイデアの背景にはどんなストーリーがあるか？", zh: "“这个想法背后有什么故事？”", fr: "« Quelle histoire se cache derrière cette idée ? »", es: "«¿Qué historia hay detrás de esta idea?»", type: "narrative" },
      { ko: "이것이 더 큰 시스템에서 어떻게 작동할까?", en: "'How would this work within a larger system?'", ja: "これはより大きなシステムでどう機能するか？", zh: "“它在更大的系统中会如何运作？”", fr: "« Comment cela fonctionnerait-il dans un système plus large ? »", es: "«¿Cómo funcionaría dentro de un sistema más amplio?»", type: "systems" },
      { ko: "이것이 어떤 감정이나 미적 경험을 만들어낼까?", en: "'What emotion or aesthetic experience would this create?'", ja: "これはどんな感情や美的体験を生み出すか？", zh: "“它会创造怎样的情绪或审美体验？”", fr: "« Quelle émotion ou expérience esthétique cela créerait-il ? »", es: "«¿Qué emoción o experiencia estética crearía?»", type: "aesthetic" },
    ],
  },
  {
    ko: "당신의 창의성이 빛나는 순간은?",
    en: "The moment your creativity shines brightest:",
    ja: "あなたの創造性が最も輝く瞬間は？",
    zh: "你的创造力最闪耀的时刻是？",
    fr: "Le moment où votre créativité brille le plus :",
    es: "El momento en que tu creatividad brilla más:",
    options: [
      { ko: "누구도 생각 못 한 연결고리를 발견했을 때", en: "When I discover connections no one else thought of", ja: "誰も考えなかったつながりを発見したとき", zh: "当我发现别人没想到的连接时", fr: "Quand je découvre des liens auxquels personne n'avait pensé", es: "Cuando descubro conexiones que nadie más había imaginado", type: "divergent" },
      { ko: "복잡한 문제에 우아한 해결책을 찾았을 때", en: "When I find an elegant solution to a complex problem", ja: "複雑な問題に優雅な解決策を見つけたとき", zh: "当我为复杂问题找到优雅的解决方案时", fr: "Quand je trouve une solution élégante à un problème complexe", es: "Cuando encuentro una solución elegante para un problema complejo", type: "convergent" },
      { ko: "내 이야기가 다른 사람의 마음을 울렸을 때", en: "When my story touches someone else's heart", ja: "自分の話が他の人の心に響いたとき", zh: "当我的故事打动别人的心时", fr: "Quand mon histoire touche le coeur de quelqu'un", es: "Cuando mi historia toca el corazón de otra persona", type: "narrative" },
      { ko: "흩어진 것들을 하나의 일관된 구조로 만들었을 때", en: "When I turn scattered things into one coherent structure", ja: "バラバラなものを一つの一貫した構造にまとめたとき", zh: "当我把零散事物整合成一个连贯结构时", fr: "Quand je transforme des éléments dispersés en une structure cohérente", es: "Cuando convierto elementos dispersos en una estructura coherente", type: "systems" },
      { ko: "아름다움이나 감동을 만들어냈을 때", en: "When I've created something beautiful or moving", ja: "美しさや感動を生み出したとき", zh: "当我创造出美或令人感动的东西时", fr: "Quand je crée quelque chose de beau ou d'émouvant", es: "Cuando creo algo bello o conmovedor", type: "aesthetic" },
    ],
  },
  {
    ko: "창의적 프로젝트에서 나의 역할은 주로?",
    en: "My typical role in a creative project:",
    ja: "クリエイティブなプロジェクトでの自分の役割は主に？",
    zh: "在创意项目中，你通常扮演什么角色？",
    fr: "Mon rôle habituel dans un projet créatif :",
    es: "Mi rol típico en un proyecto creativo:",
    options: [
      { ko: "아이디어를 폭발적으로 쏟아내는 발산자", en: "The diverger who explosively generates ideas", ja: "アイデアを爆発的に出す発散者", zh: "大量迸发想法的发散者", fr: "La personne divergente qui génère beaucoup d'idées", es: "La persona divergente que genera ideas con gran intensidad", type: "divergent" },
      { ko: "아이디어를 다듬고 실행 가능하게 만드는 정제자", en: "The refiner who polishes ideas and makes them executable", ja: "アイデアを磨いて実行可能にする精製者", zh: "打磨想法并让它们可执行的精炼者", fr: "La personne qui affine les idées et les rend réalisables", es: "La persona que pule ideas y las vuelve ejecutables", type: "convergent" },
      { ko: "의미와 스토리를 부여해 사람들과 연결하는 내레이터", en: "The narrator who adds meaning and story to connect with people", ja: "意味とストーリーを付与して人々とつなぐナレーター", zh: "赋予意义和故事、连接人们的叙事者", fr: "La personne narrative qui ajoute du sens et relie les autres par l'histoire", es: "La persona narradora que aporta sentido e historia para conectar con otros", type: "narrative" },
      { ko: "전체 구조와 흐름을 설계하는 아키텍트", en: "The architect who designs the whole structure and flow", ja: "全体の構造と流れを設計するアーキテクト", zh: "设计整体结构和流程的架构师", fr: "L'architecte qui conçoit toute la structure et le flux", es: "La persona arquitecta que diseña toda la estructura y el flujo", type: "systems" },
      { ko: "감각과 감정을 담아 표현을 완성하는 아티스트", en: "The artist who completes expression with sensory and emotional depth", ja: "感覚と感情を込めて表現を完成させるアーティスト", zh: "用感官和情感深度完成表达的艺术家", fr: "L'artiste qui finalise l'expression avec profondeur sensorielle et émotionnelle", es: "La persona artista que completa la expresión con profundidad sensorial y emocional", type: "aesthetic" },
    ],
  },
];

const results: Record<CreativityType, {
  emoji: string;
  color: string;
  ko: { title: string; description: string; strengths: string[]; famous: string; tip: string };
  en: { title: string; description: string; strengths: string[]; famous: string; tip: string };
  ja: { title: string; description: string; strengths: string[]; famous: string; tip: string };
  zh: { title: string; description: string; strengths: string[]; famous: string; tip: string };
  fr: { title: string; description: string; strengths: string[]; famous: string; tip: string };
  es: { title: string; description: string; strengths: string[]; famous: string; tip: string };
}> = {
  divergent: {
    emoji: "🌐",
    color: "#8b5cf6",
    ko: { title: "발산적 창의형", description: "당신은 연결의 달인입니다. 서로 무관해 보이는 것들을 연결하고 예상치 못한 조합으로 새로운 아이디어를 만들어냅니다. 다양한 관심사와 지식이 창의성의 원천입니다.", strengths: ["광범위한 아이디어 생성", "교차 분야 혁신", "풍부한 상상력"], famous: "레오나르도 다빈치, 일론 머스크", tip: "아이디어를 기록하는 습관이 중요합니다. 뛰어난 아이디어는 종종 잊혀집니다. 아이디어 일기나 노트를 항상 가지고 다니세요." },
    en: { title: "Divergent Creative", description: "You're a master of connections. You link seemingly unrelated things and create new ideas through unexpected combinations. Diverse interests and knowledge are your creative fuel.", strengths: ["Wide idea generation", "Cross-domain innovation", "Rich imagination"], famous: "Leonardo da Vinci, Elon Musk", tip: "Habitually recording ideas is crucial. Great ideas are often forgotten. Always carry an idea journal or notepad." },
    ja: { title: "発散型クリエイティブ", description: "あなたはつながりの達人です。一見無関係に見えるものをつなぎ、予想外の組み合わせで新しいアイデアを生み出します。多様な興味と知識が創造性の源です。", strengths: ["広範なアイデア生成", "クロスドメイン革新", "豊かな想像力"], famous: "レオナルド・ダ・ヴィンチ、イーロン・マスク", tip: "アイデアを記録する習慣が重要です。優れたアイデアはよく忘れられます。アイデア日記やノートを常に持ち歩きましょう。" },
    zh: { title: "发散型创意者", description: "你是连接的高手。你能把看似无关的事物联系起来，通过意想不到的组合创造新想法。多元的兴趣和知识是你的创造力燃料。", strengths: ["广泛生成想法", "跨领域创新", "丰富的想象力"], famous: "列奥纳多·达·芬奇、埃隆·马斯克", tip: "养成记录想法的习惯很重要。优秀的点子常常会被遗忘。请随身带着创意日记或笔记本。" },
    fr: { title: "Créatif divergent", description: "Vous excellez dans l'art des connexions. Vous reliez des choses qui semblent sans rapport et créez des idées nouvelles par des combinaisons inattendues. La diversité de vos intérêts et connaissances nourrit votre créativité.", strengths: ["Génération large d'idées", "Innovation entre domaines", "Imagination riche"], famous: "Léonard de Vinci, Elon Musk", tip: "Prendre l'habitude de noter vos idées est essentiel. Les grandes idées s'oublient souvent. Gardez toujours un carnet d'idées ou un bloc-notes à portée de main." },
    es: { title: "Creativo divergente", description: "Dominas el arte de las conexiones. Unes cosas que parecen no estar relacionadas y creas ideas nuevas mediante combinaciones inesperadas. Tus intereses y conocimientos diversos alimentan tu creatividad.", strengths: ["Amplia generación de ideas", "Innovación entre campos", "Imaginación rica"], famous: "Leonardo da Vinci, Elon Musk", tip: "Es clave acostumbrarte a registrar ideas. Las grandes ideas suelen olvidarse. Lleva siempre contigo un diario de ideas o una libreta." },
  },
  convergent: {
    emoji: "🎯",
    color: "#3b82f6",
    ko: { title: "수렴적 문제해결형", description: "당신은 문제의 본질을 꿰뚫어보고 최선의 해결책을 찾는 능력이 탁월합니다. 복잡한 것을 명확하게 만들고, 아이디어를 실행 가능한 형태로 다듬습니다.", strengths: ["정밀한 문제 분석", "실행 가능한 해결책", "논리적 창의성"], famous: "스티브 잡스(기존 기술의 재창조), 제임스 다이슨", tip: "가끔은 '최선의 해결책'이 아닌 '충분히 좋은 해결책'도 인정하세요. 완벽주의가 혁신의 속도를 늦출 수 있습니다." },
    en: { title: "Convergent Problem-Solver", description: "You have an exceptional ability to see through to the essence of problems and find the best solutions. You clarify what's complex and refine ideas into executable forms.", strengths: ["Precise problem analysis", "Actionable solutions", "Logical creativity"], famous: "Steve Jobs (recreation of existing tech), James Dyson", tip: "Sometimes accept 'good enough solutions' rather than only 'best solutions.' Perfectionism can slow the pace of innovation." },
    ja: { title: "収束型問題解決者", description: "問題の本質を見抜き、最善の解決策を見つける能力が優れています。複雑なものを明確にし、アイデアを実行可能な形に磨きます。", strengths: ["精密な問題分析", "実行可能な解決策", "論理的な創造性"], famous: "スティーブ・ジョブズ（既存技術の再創造）、ジェームズ・ダイソン", tip: "時には「最善の解決策」だけでなく「十分に良い解決策」も認めましょう。完璧主義が革新の速度を遅らせる可能性があります。" },
    zh: { title: "收敛型问题解决者", description: "你很擅长看清问题的本质，并找到最合适的解决方案。你能让复杂的事物变得清晰，并把想法打磨成可执行的形式。", strengths: ["精准的问题分析", "可执行的解决方案", "逻辑型创造力"], famous: "史蒂夫·乔布斯(重塑既有技术)、詹姆斯·戴森", tip: "有时也请接受“足够好的解决方案”，而不只追求“最佳解决方案”。完美主义可能会拖慢创新速度。" },
    fr: { title: "Résolveur convergent", description: "Vous avez une capacité remarquable à voir l'essence des problèmes et à trouver les meilleures solutions. Vous clarifiez ce qui est complexe et affinez les idées pour les rendre réalisables.", strengths: ["Analyse précise des problèmes", "Solutions applicables", "Créativité logique"], famous: "Steve Jobs (réinvention de technologies existantes), James Dyson", tip: "Acceptez parfois une solution « suffisamment bonne » plutôt que de chercher uniquement la « meilleure ». Le perfectionnisme peut ralentir le rythme de l'innovation." },
    es: { title: "Solucionador convergente", description: "Tienes una capacidad excepcional para ver la esencia de los problemas y encontrar las mejores soluciones. Aclaras lo complejo y conviertes las ideas en formas ejecutables.", strengths: ["Análisis preciso de problemas", "Soluciones accionables", "Creatividad lógica"], famous: "Steve Jobs (recreación de tecnología existente), James Dyson", tip: "A veces conviene aceptar soluciones «suficientemente buenas» en lugar de buscar solo la «mejor» solución. El perfeccionismo puede frenar el ritmo de la innovación." },
  },
  narrative: {
    emoji: "📖",
    color: "#10b981",
    ko: { title: "내러티브 스토리텔링형", description: "당신은 경험과 관찰에서 의미를 찾고 이야기로 만들어냅니다. 복잡한 아이디어를 공감 가능한 이야기로 전달하는 능력이 탁월합니다.", strengths: ["공감 유발 능력", "복잡한 것을 단순하게 설명", "감정적 연결 창출"], famous: "J.K. 롤링, 유발 하라리, 스티브 잡스(프레젠테이션)", tip: "당신의 가장 강력한 아이디어는 개인적 경험에서 나옵니다. 일상의 관찰과 경험을 꼼꼼히 기록하세요." },
    en: { title: "Narrative Storyteller", description: "You find meaning in experience and observation and turn it into stories. You have an exceptional ability to communicate complex ideas through relatable narratives.", strengths: ["Empathy generation", "Explaining complex things simply", "Creating emotional connections"], famous: "J.K. Rowling, Yuval Noah Harari, Steve Jobs (presentations)", tip: "Your most powerful ideas come from personal experience. Carefully record your everyday observations and experiences." },
    ja: { title: "ナラティブ・ストーリーテラー", description: "経験と観察から意味を見つけ、物語を作り出します。複雑なアイデアを共感できる物語で伝える能力が優れています。", strengths: ["共感を生む能力", "複雑なことを簡単に説明", "感情的なつながりの創出"], famous: "J.K.ローリング、ユヴァル・ノア・ハラリ、スティーブ・ジョブズ（プレゼン）", tip: "あなたの最も力強いアイデアは個人的な経験から生まれます。日常の観察と経験を丁寧に記録しましょう。" },
    zh: { title: "叙事型讲述者", description: "你会从经历和观察中寻找意义，并把它们转化为故事。你很擅长用容易共鸣的叙事来传达复杂想法。", strengths: ["激发共情的能力", "把复杂事物讲得简单", "创造情感连接"], famous: "J.K. 罗琳、尤瓦尔·诺亚·哈拉里、史蒂夫·乔布斯(演讲)", tip: "你最有力量的想法来自个人经历。请认真记录日常观察和体验。" },
    fr: { title: "Storyteller narratif", description: "Vous trouvez du sens dans l'expérience et l'observation, puis vous les transformez en histoires. Vous avez un talent particulier pour communiquer des idées complexes à travers des récits auxquels on peut s'identifier.", strengths: ["Capacité à susciter l'empathie", "Explication simple de sujets complexes", "Création de liens émotionnels"], famous: "J.K. Rowling, Yuval Noah Harari, Steve Jobs (présentations)", tip: "Vos idées les plus fortes viennent de vos expériences personnelles. Notez avec soin vos observations et expériences du quotidien." },
    es: { title: "Narrador de historias", description: "Encuentras significado en la experiencia y la observación, y lo conviertes en historias. Tienes una capacidad excepcional para comunicar ideas complejas mediante relatos cercanos.", strengths: ["Generación de empatía", "Explicar lo complejo de forma simple", "Crear conexiones emocionales"], famous: "J.K. Rowling, Yuval Noah Harari, Steve Jobs (presentaciones)", tip: "Tus ideas más poderosas nacen de la experiencia personal. Registra con cuidado tus observaciones y vivencias cotidianas." },
  },
  systems: {
    emoji: "🔬",
    color: "#f59e0b",
    ko: { title: "시스템 설계형", description: "당신은 복잡한 패턴을 파악하고 전체를 하나의 유기적 구조로 만드는 능력이 탁월합니다. 흩어진 것들에서 질서와 체계를 만들어냅니다.", strengths: ["복잡계 이해", "구조적 혁신", "확장 가능한 솔루션 설계"], famous: "버크민스터 풀러, 팀 버너스 리(월드 와이드 웹)", tip: "때로는 구조에서 벗어나 직관과 즉흥성을 허용해보세요. 최선의 시스템은 인간의 예측 불가능성을 반영합니다." },
    en: { title: "Systems Designer", description: "You have an exceptional ability to identify complex patterns and shape everything into one organic structure. You create order and systems from scattered things.", strengths: ["Understanding complex systems", "Structural innovation", "Designing scalable solutions"], famous: "Buckminster Fuller, Tim Berners-Lee (World Wide Web)", tip: "Sometimes let yourself deviate from structure and allow intuition and improvisation. The best systems reflect human unpredictability." },
    ja: { title: "システム設計者", description: "複雑なパターンを把握し、全体を一つの有機的な構造にする能力が優れています。バラバラなものから秩序と体系を作り出します。", strengths: ["複雑系の理解", "構造的革新", "スケーラブルなソリューション設計"], famous: "バックミンスター・フラー、ティム・バーナーズ・リー（WWW）", tip: "時には構造から離れ、直感と即興性を許してみましょう。最善のシステムは人間の予測不可能性を反映します。" },
    zh: { title: "系统设计者", description: "你很擅长识别复杂模式，并把整体塑造成一个有机结构。你能从零散事物中创造秩序和体系。", strengths: ["理解复杂系统", "结构性创新", "设计可扩展方案"], famous: "巴克敏斯特·富勒、蒂姆·伯纳斯-李(万维网)", tip: "有时也请允许自己偏离结构，给直觉和即兴留下空间。最好的系统会反映人的不可预测性。" },
    fr: { title: "Concepteur de systèmes", description: "Vous avez une capacité remarquable à repérer les motifs complexes et à façonner l'ensemble en une structure organique. Vous créez de l'ordre et des systèmes à partir d'éléments dispersés.", strengths: ["Compréhension des systèmes complexes", "Innovation structurelle", "Conception de solutions évolutives"], famous: "Buckminster Fuller, Tim Berners-Lee (World Wide Web)", tip: "Autorisez-vous parfois à sortir de la structure et à laisser place à l'intuition et à l'improvisation. Les meilleurs systèmes reflètent l'imprévisibilité humaine." },
    es: { title: "Diseñador de sistemas", description: "Tienes una capacidad excepcional para identificar patrones complejos y darles forma como una estructura orgánica. Creas orden y sistemas a partir de elementos dispersos.", strengths: ["Comprensión de sistemas complejos", "Innovación estructural", "Diseño de soluciones escalables"], famous: "Buckminster Fuller, Tim Berners-Lee (World Wide Web)", tip: "A veces permítete salir de la estructura y dejar espacio a la intuición y la improvisación. Los mejores sistemas reflejan la imprevisibilidad humana." },
  },
  aesthetic: {
    emoji: "🎨",
    color: "#ef4444",
    ko: { title: "미적 표현형", description: "당신은 감각과 감정에 민감하며, 아름다움과 의미를 표현하는 데 탁월합니다. 시각, 청각, 촉각적 자극에서 깊은 영감을 받으며 독특한 감성을 가집니다.", strengths: ["미적 감수성", "감정 전달 능력", "독창적 표현"], famous: "프리다 칼로, 빈센트 반 고흐, BTS", tip: "기술적 기반이 당신의 표현력을 더욱 높여줍니다. 좋아하는 분야의 기술을 꾸준히 연마하면 더 넓은 표현이 가능해집니다." },
    en: { title: "Aesthetic Expresser", description: "You're sensitive to sensory input and emotions, and excel at expressing beauty and meaning. You find deep inspiration in visual, auditory, and tactile stimuli and have a unique sensibility.", strengths: ["Aesthetic sensitivity", "Emotional communication", "Original expression"], famous: "Frida Kahlo, Vincent van Gogh, BTS", tip: "Technical foundations amplify your expressive power. Consistently honing skills in your favorite field opens up wider expression." },
    ja: { title: "美的表現型", description: "感覚と感情に敏感で、美しさと意味を表現することに優れています。視覚、聴覚、触覚的な刺激から深いインスピレーションを受け、独自の感性を持っています。", strengths: ["美的感受性", "感情伝達能力", "独創的な表現"], famous: "フリーダ・カーロ、ファン・ゴッホ、BTS", tip: "技術的な基盤があなたの表現力をさらに高めます。好きな分野のスキルを継続的に磨くと、より広い表現が可能になります。" },
    zh: { title: "美学表达者", description: "你对感官输入和情绪很敏锐，也擅长表达美与意义。你会从视觉、听觉和触觉刺激中获得深层灵感，并拥有独特的感性。", strengths: ["审美敏感度", "情感传达能力", "原创表达"], famous: "弗里达·卡罗、文森特·梵高、BTS", tip: "技术基础会放大你的表达力。持续打磨你喜欢领域的技能，会让你的表达拥有更宽广的可能。" },
    fr: { title: "Expression esthétique", description: "Vous êtes sensible aux perceptions sensorielles et aux émotions, et vous excellez dans l'expression de la beauté et du sens. Vous puisez une inspiration profonde dans les stimuli visuels, auditifs et tactiles, avec une sensibilité singulière.", strengths: ["Sensibilité esthétique", "Communication émotionnelle", "Expression originale"], famous: "Frida Kahlo, Vincent van Gogh, BTS", tip: "Les bases techniques amplifient votre pouvoir d'expression. En développant régulièrement les compétences de votre domaine favori, vous ouvrez un champ d'expression plus vaste." },
    es: { title: "Expresor estético", description: "Eres sensible a los estímulos sensoriales y a las emociones, y destacas al expresar belleza y significado. Encuentras inspiración profunda en estímulos visuales, auditivos y táctiles, y tienes una sensibilidad única.", strengths: ["Sensibilidad estética", "Comunicación emocional", "Expresión original"], famous: "Frida Kahlo, Vincent van Gogh, BTS", tip: "Las bases técnicas amplifican tu poder expresivo. Perfeccionar de forma constante las habilidades de tu campo favorito abre posibilidades de expresión más amplias." },
  },
};

const t: Record<SupportedLocale, {
  title: string;
  subtitle: string;
  progress: (cur: number, total: number) => string;
  resultTitle: string;
  strengths: string;
  famous: string;
  tip: string;
  scoreLabel: string;
  restart: string;
  share: string;
  copied: string;
}> = {
  ko: {
    title: "창의성 유형 테스트",
    subtitle: "나의 창의성은 어떤 형태인가?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "나의 창의성 유형",
    strengths: "핵심 강점",
    famous: "비슷한 창의적 유형",
    tip: "성장 팁",
    scoreLabel: "유형별 점수",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Creativity Type Test",
    subtitle: "What Form Does Your Creativity Take?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Your Creativity Type",
    strengths: "Core Strengths",
    famous: "Similar Creative Types",
    tip: "Growth Tip",
    scoreLabel: "Score by Type",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "創造性タイプテスト",
    subtitle: "あなたの創造性はどんな形ですか？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "あなたの創造性タイプ",
    strengths: "核心的な強み",
    famous: "似た創造的タイプ",
    tip: "成長のヒント",
    scoreLabel: "タイプ別スコア",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "创造力类型测试",
    subtitle: "你的创造力呈现什么形式？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "你的创造力类型",
    strengths: "核心优势",
    famous: "相似的创意类型",
    tip: "成长提示",
    scoreLabel: "各类型得分",
    restart: "重新开始",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test du type de créativité",
    subtitle: "Quelle forme prend votre créativité ?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Votre type de créativité",
    strengths: "Forces clés",
    famous: "Types créatifs similaires",
    tip: "Conseil de progression",
    scoreLabel: "Score par type",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de tipo de creatividad",
    subtitle: "¿Qué forma toma tu creatividad?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Tu tipo de creatividad",
    strengths: "Fortalezas clave",
    famous: "Tipos creativos similares",
    tip: "Consejo de crecimiento",
    scoreLabel: "Puntuación por tipo",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

export default function CreativityTypeTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<CreativityType, number>>({ divergent: 0, convergent: 0, narrative: 0, systems: 0, aesthetic: 0 });
  const [result, setResult] = useState<CreativityType | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ct = p.get("ct") as CreativityType | null;
    if (ct && results[ct]) setResult(ct);
  }, []);

  function pick(type: CreativityType) {
    const next = { ...scores, [type]: scores[type] + 1 };
    const answeredCount = Object.values(next).reduce((a, b) => a + b, 0);
    if (answeredCount < questions.length) {
      setScores(next);
      setTimeout(() => setIdx(answeredCount), 280);
    } else {
      setScores(next);
      const winner = (Object.keys(next) as CreativityType[]).reduce((a, b) => next[a] >= next[b] ? a : b);
      setResult(winner);
      const url = new URL(window.location.href);
      url.searchParams.set("ct", winner);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0);
    setScores({ divergent: 0, convergent: 0, narrative: 0, systems: 0, aesthetic: 0 });
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("ct");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: tx.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const typeLabels: Record<CreativityType, Record<SupportedLocale, string>> = {
    divergent: { ko: "발산형", en: "Divergent", ja: "発散型", zh: "发散型", fr: "Divergent", es: "Divergente" },
    convergent: { ko: "수렴형", en: "Convergent", ja: "収束型", zh: "收敛型", fr: "Convergent", es: "Convergente" },
    narrative: { ko: "내러티브", en: "Narrative", ja: "ナラティブ", zh: "叙事型", fr: "Narratif", es: "Narrativo" },
    systems: { ko: "시스템형", en: "Systems", ja: "システム型", zh: "系统型", fr: "Systèmes", es: "Sistemas" },
    aesthetic: { ko: "미적형", en: "Aesthetic", ja: "美的型", zh: "美学型", fr: "Esthétique", es: "Estético" },
  };

  if (result) {
    const r = results[result];
    const rd = r[locale];
    const chartData = (Object.keys(scores) as CreativityType[]).map((k) => ({
      name: typeLabels[k][locale],
      value: scores[k],
      fill: results[k].color,
      fillOpacity: k === result ? 1 : 0.4,
    }));

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `${r.color}12`, border: `1px solid ${r.color}40` }}>
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{r.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{rd.title}</h2>
          <p className="mt-1 text-sm" style={{ color: r.color }}>{tx.famous}: {rd.famous}</p>
          <p className="mt-3 text-gray-600">{rd.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">⭐ {tx.strengths}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {rd.strengths.map((s, i) => (
                <span key={i} className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: r.color }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ background: `${r.color}10` }}>
            <h3 className="font-semibold" style={{ color: r.color }}>💡 {tx.tip}</h3>
            <p className="mt-1 text-sm text-gray-700">{rd.tip}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-700">{tx.scoreLabel}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
              <XAxis type="number" domain={[0, questions.length]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={64} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">{tx.restart}</button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: r.color }}>{copied ? tx.copied : tx.share}</button>
        </div>
        <ShareResultButton locale={locale} heading={tx.title} resultTitle={rd.title} emoji={r.emoji} description={rd.description} />
      </div>
    );
  }

  const q = questions[idx];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">{tx.title}</h1>
        <p className="mt-1 text-gray-500">{tx.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-purple-500 transition-all duration-300" style={{ width: `${(idx / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm text-gray-500">{tx.progress(idx + 1, questions.length)}</span>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-5 text-center text-lg font-medium text-gray-800">{q[locale]}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => pick(opt.type)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 transition hover:border-purple-300 hover:bg-purple-50">
              {opt[locale]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
