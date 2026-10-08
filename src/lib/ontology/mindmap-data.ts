// The five branches and their leaves for "실제 나의 것" (ProfileMindmap), in six languages.
// Leaf order is part of the contract: recommendations (mindmap-recommend.ts) address a leaf by
// its position, and the profile store matches labels across languages by position.
export type MindmapLang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
export const MINDMAP_STORAGE_KEY = "oiyo:profile:v1";

export type MindmapCat = { id: string; label: Record<MindmapLang, string>; chips: Record<MindmapLang, string[]> };

export const MINDMAP_CATS: MindmapCat[] = [
  { id: "interest", label: { ko: "관심", en: "Interests", ja: "関心", zh: "兴趣", fr: "Intérêts", es: "Intereses" },
    chips: { ko: ["글쓰기", "정리", "탐험", "분석", "창작", "배움", "수집"], en: ["Writing", "Organizing", "Exploring", "Analyzing", "Creating", "Learning", "Collecting"], ja: ["書く", "整理", "探検", "分析", "創作", "学び", "収集"], zh: ["写作", "整理", "探索", "分析", "创作", "学习", "收藏"], fr: ["Écrire", "Organiser", "Explorer", "Analyser", "Créer", "Apprendre", "Collectionner"], es: ["Escribir", "Organizar", "Explorar", "Analizar", "Crear", "Aprender", "Coleccionar"] } },
  { id: "activity", label: { ko: "활동", en: "Activities", ja: "活動", zh: "活动", fr: "Activités", es: "Actividades" },
    chips: { ko: ["운동", "여행", "요리", "독서", "음악", "게임", "명상"], en: ["Exercise", "Travel", "Cooking", "Reading", "Music", "Gaming", "Meditation"], ja: ["運動", "旅行", "料理", "読書", "音楽", "ゲーム", "瞑想"], zh: ["运动", "旅行", "烹饪", "阅读", "音乐", "游戏", "冥想"], fr: ["Sport", "Voyage", "Cuisine", "Lecture", "Musique", "Jeux", "Méditation"], es: ["Ejercicio", "Viajar", "Cocinar", "Leer", "Música", "Juegos", "Meditación"] } },
  { id: "environment", label: { ko: "환경", en: "Environment", ja: "環境", zh: "环境", fr: "Environnement", es: "Entorno" },
    chips: { ko: ["자연", "도시", "바다", "산", "카페", "집", "야외"], en: ["Nature", "City", "Sea", "Mountains", "Café", "Home", "Outdoors"], ja: ["自然", "都市", "海", "山", "カフェ", "家", "屋外"], zh: ["自然", "城市", "海", "山", "咖啡馆", "家", "户外"], fr: ["Nature", "Ville", "Mer", "Montagne", "Café", "Maison", "Plein air"], es: ["Naturaleza", "Ciudad", "Mar", "Montaña", "Café", "Casa", "Aire libre"] } },
  { id: "relation", label: { ko: "관계", en: "Relationships", ja: "関係", zh: "关系", fr: "Relations", es: "Relaciones" },
    chips: { ko: ["혼자", "팀", "가족", "소수 친구", "커뮤니티", "멘토"], en: ["Solo", "Team", "Family", "Few friends", "Community", "Mentor"], ja: ["一人", "チーム", "家族", "少数の友人", "コミュニティ", "メンター"], zh: ["独处", "团队", "家庭", "少数朋友", "社群", "导师"], fr: ["Seul", "Équipe", "Famille", "Quelques amis", "Communauté", "Mentor"], es: ["Solo", "Equipo", "Familia", "Pocos amigos", "Comunidad", "Mentor"] } },
  { id: "goal", label: { ko: "목표", en: "Goals", ja: "目標", zh: "目标", fr: "Objectifs", es: "Metas" },
    chips: { ko: ["성장", "안정", "자유", "영향력", "숙련", "연결", "의미"], en: ["Growth", "Stability", "Freedom", "Impact", "Mastery", "Connection", "Meaning"], ja: ["成長", "安定", "自由", "影響力", "熟達", "つながり", "意味"], zh: ["成长", "稳定", "自由", "影响力", "精通", "连接", "意义"], fr: ["Croissance", "Stabilité", "Liberté", "Impact", "Maîtrise", "Connexion", "Sens"], es: ["Crecimiento", "Estabilidad", "Libertad", "Impacto", "Maestría", "Conexión", "Sentido"] } },
];
