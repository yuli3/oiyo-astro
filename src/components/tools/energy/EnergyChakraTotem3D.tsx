"use client";

import { Suspense, lazy, useState } from "react";
import { RotateCw, Sparkles, Activity, ShieldCheck, Heart, Eye, Sun, Compass } from "lucide-react";
import type { ChakraKey } from "./EnergyChakraTotem3DScene";
import { CHAKRA_LIST } from "./EnergyChakraTotem3DScene";

const EnergyChakraTotem3DScene = lazy(() => import("./EnergyChakraTotem3DScene"));

export type Locale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: Locale;
  defaultChakra?: ChakraKey;
}

const I18N_TEXT: Record<Locale, {
  title: string;
  subtitle: string;
  rotateHint: string;
  toggleAutoRotate: string;
  resetFocus: string;
  vitalityLabel: string;
  vitalityCalm: string;
  vitalityBalanced: string;
  vitalityActive: string;
  chakraListTitle: string;
  chakraDetailsTitle: string;
  harmonyState: string;
  imbalanceState: string;
  healingPractices: string;
  soundNote: string;
  frequency: string;
  loadingText: string;
  chakras: Record<ChakraKey, {
    sanskrit: string;
    name: string;
    location: string;
    element: string;
    harmony: string;
    imbalance: string;
    practices: string;
  }>;
}> = {
  ko: {
    title: "3D 인체 경락 & 7차크라 오행 토템 오브 뷰어",
    subtitle: "인체의 척추 중심 수슘나(Sushumna) 경락과 7대 차크라, 동양 오행(목·화·토·금·수) 에너지를 3D 신성 기하학 토템으로 입체 탐색합니다.",
    rotateHint: "드래그하여 3D 토템을 360도 회전하고, 원하는 차크라 구체를 터치하여 생명 에너지 센터를 확인하세요.",
    toggleAutoRotate: "자동 회전",
    resetFocus: "전체 에너지 보기",
    vitalityLabel: "에너지 순환 속도",
    vitalityCalm: "명상 · 이완 (0.6x)",
    vitalityBalanced: "조화 · 균형 (1.0x)",
    vitalityActive: "활력 · 각성 (1.6x)",
    chakraListTitle: "7대 에너지 센터 (Chakras)",
    chakraDetailsTitle: "차크라 심층 에너지 분석",
    harmonyState: "✨ 조화롭고 활성화된 상태",
    imbalanceState: "⚠️ 에너지 정체 및 불균형 징후",
    healingPractices: "🌿 일상 치유 및 밸런싱 가이드",
    soundNote: "음계",
    frequency: "공명 주파수",
    loadingText: "3D 차크라 에너지 토템을 렌더링 중입니다...",
    chakras: {
      crown: {
        sanskrit: "사하스라라 (Sahasrara)",
        name: "정수리 (왕관) 차크라",
        location: "백회혈 (머리 정수리 최상단)",
        element: "우주 의식 / 순수 영성",
        harmony: "우주와의 일체감, 영적 평온, 깊은 삶의 목적의식과 통찰.",
        imbalance: "고립감, 냉소주의, 정신적 혼란, 물질에 대한 지나친 집착 또는 현실 도피.",
        practices: "침묵 명상, 자연 관조, 흰색/보라색 크리스탈(자수정) 명상, 963Hz 솔페지오 주파수 청취.",
      },
      thirdEye: {
        sanskrit: "아즈나 (Ajna)",
        name: "제3의 눈 (미간) 차크라",
        location: "인당혈 (양 눈썹 사이 미간)",
        element: "빛 / 고차원 직관",
        harmony: "선명한 통찰력, 정확한 직관, 상상력과 결단력, 본질을 꿰뚫어 보는 혜안.",
        imbalance: "과도한 잡념, 두통, 수면 장애, 직관 결여, 타인에 대한 비판적 태도.",
        practices: "촛불 응시(트라타카), 라피스 라줄리 원석 명상, 깊은 호흡과 852Hz 주파수 공명.",
      },
      throat: {
        sanskrit: "비슈다 (Vishuddha)",
        name: "목 (인후) 차크라",
        location: "천돌혈 (목 중심부 및 성대)",
        element: "에테르 / 금(金) 기운",
        harmony: "진실된 자기표현, 명확한 의사소통, 창의적 발표력, 진심 어린 경청 능력.",
        imbalance: "말을 더듬거나 자기표현의 두려움, 험담, 목 통증 및 갑상선 긴장감.",
        practices: "목 스트레칭, 옴(OM) 만트라 발성, 따뜻한 허브차 음용, 아쿠아마린 소지, 741Hz 공명.",
      },
      heart: {
        sanskrit: "아나하타 (Anahata)",
        name: "가슴 (심장) 차크라",
        location: "단중혈 (가슴 정중앙 심장 부위)",
        element: "공기 / 목(木) 기운",
        harmony: "무조건적인 자기 수용, 타인에 대한 깊은 공감, 사랑과 용서의 충만함.",
        imbalance: "외로움, 타인에 대한 불신과 경계, 질투, 심장의 답답함과 슬픔 정체.",
        practices: "가슴 열기 요가(코브라 자세), 숲길 산책, 장미수정(로즈쿼츠) 명상, 639Hz 공명.",
      },
      solarPlexus: {
        sanskrit: "마니푸라 (Manipura)",
        name: "태양신경총 (명치) 차크라",
        location: "중완혈 (명치와 배꼽 사이)",
        element: "불(火)의 기운",
        harmony: "강한 자신감, 흔들리지 않는 자존감, 실행력, 주도적인 삶의 활력.",
        imbalance: "무기력증, 분노 폭발, 통제 강박, 소화불량 및 우유부단함.",
        practices: "코어 복근 운동, 햇볕 쬐기, 황수정(시트린) 소지, 단전호흡 및 528Hz 주파수 청취.",
      },
      sacral: {
        sanskrit: "스와디스타나 (Svadhisthana)",
        name: "천골 (단전) 차크라",
        location: "기해혈 (배꼽 아래 3cm 하복부)",
        element: "물(水)의 기운",
        harmony: "풍부한 감수성, 건강한 성 에너지, 창의적 영감, 변화에 대한 유연한 적응.",
        imbalance: "감정 기복, 무감각, 창작 블록, 관계에 대한 과도한 의존 또는 두려움.",
        practices: "골반 스트레칭, 물 많이 마시기, 춤이나 예술 활동, 카넬리안 원석, 417Hz 공명.",
      },
      root: {
        sanskrit: "물라다라 (Muladhara)",
        name: "뿌리 (회음) 차크라",
        location: "회음혈 (척추 최하단 꼬리뼈 부위)",
        element: "대지(土)의 기운",
        harmony: "깊은 안정감, 생존에 대한 확신, 경제적 현실감, 흔들리지 않는 그라운딩.",
        imbalance: "만성 불안, 미래에 대한 공포, 재정적 불안감, 하체 피로 및 만성 피로.",
        practices: "맨발 흙길 걷기(어싱), 스쿼트 운동, 레드 재스퍼 원석 소지, 396Hz 솔페지오 청취.",
      },
    },
  },
  en: {
    title: "3D Human Energy Meridian & 7 Chakras Totem Orb Viewer",
    subtitle: "Explore the central Sushumna meridian, the seven sacred chakras, and the Five Elements in an interactive 3D sacred geometry totem orb.",
    rotateHint: "Drag to rotate the 3D totem 360 degrees. Tap any glowing chakra orb to inspect its energetic frequency and harmonizing practices.",
    toggleAutoRotate: "Auto Rotate",
    resetFocus: "View All Centers",
    vitalityLabel: "Energy Circulation Pace",
    vitalityCalm: "Calm / Relax (0.6x)",
    vitalityBalanced: "Harmonious (1.0x)",
    vitalityActive: "Vitalizing (1.6x)",
    chakraListTitle: "Seven Sacred Energy Centers",
    chakraDetailsTitle: "Chakra In-Depth Energy Analysis",
    harmonyState: "✨ Harmonious & Balanced State",
    imbalanceState: "⚠️ Blocked or Imbalanced Signs",
    healingPractices: "🌿 Daily Harmonizing Practices",
    soundNote: "Musical Note",
    frequency: "Solfeggio Frequency",
    loadingText: "Rendering 3D Chakra Energy Totem...",
    chakras: {
      crown: {
        sanskrit: "Sahasrara (सहस्रार)",
        name: "Crown Chakra",
        location: "Top of the head (Brahmarandhra)",
        element: "Cosmic Consciousness",
        harmony: "Unity with universal consciousness, deep spiritual peace, profound life purpose.",
        imbalance: "Isolation, cynicism, spiritual disconnection, or escapism from earthly duties.",
        practices: "Silent meditation, stargazing, amethyst crystal contemplation, 963Hz frequency.",
      },
      thirdEye: {
        sanskrit: "Ajna (आज्ञा)",
        name: "Third Eye Chakra",
        location: "Between the eyebrows (Mid-brow center)",
        element: "Light & Higher Intuition",
        harmony: "Clear intuitive foresight, visionary imagination, lucid discernment.",
        imbalance: "Overthinking, mental fog, insomnia, skepticism, fear of truth.",
        practices: "Candle gazing (Trataka), lapis lazuli crystal healing, 852Hz tuning resonance.",
      },
      throat: {
        sanskrit: "Vishuddha (विशुद्ध)",
        name: "Throat Chakra",
        location: "Throat center & vocal cords",
        element: "Ether & Pure Resonance",
        harmony: "Authentic self-expression, honest communication, eloquent listening capacity.",
        imbalance: "Fear of speaking out, gossip, vocal tension, thyroid stagnation.",
        practices: "Neck gentle stretching, chanting sacred sound 'HAM', warm herbal tea, 741Hz resonance.",
      },
      heart: {
        sanskrit: "Anahata (अनाहत)",
        name: "Heart Chakra",
        location: "Center of the chest",
        element: "Air & Expansive Wood",
        harmony: "Unconditional self-love, compassionate empathy, forgiveness, radiant harmony.",
        imbalance: "Grief, guardedness, jealousy, loneliness, emotional dependency.",
        practices: "Chest opener yoga poses, walking in forest greenery, rose quartz, 639Hz resonance.",
      },
      solarPlexus: {
        sanskrit: "Manipura (मणिपूर)",
        name: "Solar Plexus Chakra",
        location: "Navel to upper abdomen",
        element: "Inner Fire",
        harmony: "Unwavering confidence, disciplined willpower, self-worth, motivated drive.",
        imbalance: "Powerlessness, chronic frustration, digestive distress, control obsessions.",
        practices: "Core abdominal breathing, sunbathing, citrine stone meditation, 528Hz tuning.",
      },
      sacral: {
        sanskrit: "Svadhisthana (स्वाधिष्ठान)",
        name: "Sacral Chakra",
        location: "Lower abdomen below navel",
        element: "Water & Fluidity",
        harmony: "Vibrant creative flow, healthy emotional expression, sensuality, adaptability.",
        imbalance: "Emotional numbness, fear of intimacy, creative blockages, guilt.",
        practices: "Hip-opening movements, drinking pure spring water, creative painting, 417Hz tuning.",
      },
      root: {
        sanskrit: "Muladhara (मूलाधार)",
        name: "Root Chakra",
        location: "Base of spine & perineum",
        element: "Earth & Stability",
        harmony: "Unshakable groundedness, financial security confidence, robust physical vitality.",
        imbalance: "Chronic anxiety, survival panic, lethargy, feeling unsettled.",
        practices: "Barefoot grounding on earth (Earthing), squats, red jasper crystal, 396Hz tuning.",
      },
    },
  },
  ja: {
    title: "3D 人体経絡 & 7大チャクラ五行トーテムオーブビューア",
    subtitle: "人体の中心軸スシュムナー経絡と7つのチャクラ、東洋の五行(木・火・土・金・水)エネルギーを3D神聖幾何学トーテムで立体体験します。",
    rotateHint: "ドラッグして3Dトーテムを360度回転させ、各チャクラオーブをタップして詳細なエネルギー情報を確認してください。",
    toggleAutoRotate: "自動回転",
    resetFocus: "全体表示",
    vitalityLabel: "エネルギー循環速度",
    vitalityCalm: "瞑想・リラックス (0.6x)",
    vitalityBalanced: "調和・バランス (1.0x)",
    vitalityActive: "活力・覚醒 (1.6x)",
    chakraListTitle: "7大エネルギーセンター (Chakras)",
    chakraDetailsTitle: "チャクラ詳細エネルギー分析",
    harmonyState: "✨ 調和して活性化された状態",
    imbalanceState: "⚠️ 滞り・アンバランスの兆候",
    healingPractices: "🌿 日常のヒーリング・調整法",
    soundNote: "音階",
    frequency: "共鳴周波数",
    loadingText: "3Dチャクラエネルギートーテムを読み込み中...",
    chakras: {
      crown: {
        sanskrit: "サハスラーラ (Sahasrara)",
        name: "頭頂 (クラウン) チャクラ",
        location: "頭頂部 (百会)",
        element: "宇宙意識 / 純粋霊性",
        harmony: "大いなる宇宙との一体感、精神的平安、深い人生の目的意識。",
        imbalance: "孤独感、冷笑主義、現実逃避、過度な物質主義。",
        practices: "静寂瞑想、星空観賞、アメジスト瞑想、963Hzソルフェジオ周波数。",
      },
      thirdEye: {
        sanskrit: "アージュニャー (Ajna)",
        name: "第3の目 (眉間) チャクラ",
        location: "眉間の中央 (印堂)",
        element: "光 / 高次直感",
        harmony: "明晰な洞察力、鋭い直感、豊かな想像力、本質を見抜く眼力。",
        imbalance: "雑念の過多、頭痛、睡眠障害、不信感。",
        practices: "キャンドル凝視瞑想、ラピスラズリ鉱石、852Hz共鳴。",
      },
      throat: {
        sanskrit: "ヴィシュッダ (Vishuddha)",
        name: "喉 (スロート) チャクラ",
        location: "喉の中央部・声帯",
        element: "エーテル / 金気",
        harmony: "真実の自己表現、円滑な対話力、心からの傾聴力。",
        imbalance: "自己表現への恐れ、喉の緊張、他者への批判的態度。",
        practices: "首のストレッチ、発声瞑想、ハーブティー、741Hz周波数。",
      },
      heart: {
        sanskrit: "アナハタ (Anahata)",
        name: "胸 (ハート) チャクラ",
        location: "胸の中央部・心臓",
        element: "空気 / 木気",
        harmony: "無条件の愛、深い共感、許しと感謝の充実。",
        imbalance: "孤独感、不信感、嫉妬、胸の息苦しさ。",
        practices: "胸を開くヨガポーズ、森林浴、ローズクォーツ、639Hz共鳴。",
      },
      solarPlexus: {
        sanskrit: "マニプーラ (Manipura)",
        name: "みぞおち (太陽神経叢) チャクラ",
        location: "みぞおちとおへその間",
        element: "内なる火の気",
        harmony: "揺るぎない自信、強い意志、行動力、主体的な活力。",
        imbalance: "無気力、感情の爆発、消化不良、優柔不断。",
        practices: "腹筋運動、日光浴、シトリン瞑想、528Hz周波数。",
      },
      sacral: {
        sanskrit: "スヴァディシュターナ (Svadhisthana)",
        name: "丹田 (セイクラル) チャクラ",
        location: "おへそから3cm下の丹田",
        element: "水の気",
        harmony: "豊かな感受性、健康的で創造的な意欲、柔軟な適応力。",
        imbalance: "感情の起伏、無気力、創作のスランプ、依存心。",
        practices: "骨盤ストレッチ、水分補給、アート制作、417Hz周波数。",
      },
      root: {
        sanskrit: "ムーラダーラ (Muladhara)",
        name: "会陰 (ルート) チャクラ",
        location: "尾骨・会陰部",
        element: "大地の気",
        harmony: "深い安心感、生活への確信、大地に根ざしたグラウンディング。",
        imbalance: "慢性的な不安、生存の恐怖、下半身の倦怠感。",
        practices: "裸足でのアーシング歩行、スクワット、396Hz周波数。",
      },
    },
  },
  zh: {
    title: "3D 人体经络与七脉轮五行能量图腾仪",
    subtitle: "立体探索人体中脉（Sushumna）经络、七大脉轮能量中心以及东方五行（木火土金水）的3D神圣几何图腾。",
    rotateHint: "拖动可360度旋转3D图腾，点击各个发光脉轮光球即可查看对应能量频率与日常调和法。",
    toggleAutoRotate: "自动旋转",
    resetFocus: "查看全部",
    vitalityLabel: "能量循环速率",
    vitalityCalm: "静心冥想 (0.6x)",
    vitalityBalanced: "和谐平衡 (1.0x)",
    vitalityActive: "活力焕发 (1.6x)",
    chakraListTitle: "七大能量中心 (Chakras)",
    chakraDetailsTitle: "脉轮深度能量解析",
    harmonyState: "✨ 和谐平衡激活状态",
    imbalanceState: "⚠️ 能量淤堵与失衡征兆",
    healingPractices: "🌿 日常能量调和与疗愈建议",
    soundNote: "对应音阶",
    frequency: "共鸣赫兹 (Hz)",
    loadingText: "正在加载3D脉轮能量图腾...",
    chakras: {
      crown: {
        sanskrit: "顶轮 (Sahasrara)",
        name: "顶轮 / 百会",
        location: "头顶正中央 (百会穴)",
        element: "宇宙意识 / 纯净灵性",
        harmony: "与天地合一，心灵澄澈宁静，拥有崇高的生命觉知。",
        imbalance: "疏离感、虚无主义、精神迷茫、过分逃避现实。",
        practices: "静坐冥想、观星、紫水晶冥想、聆听963Hz索尔菲吉奥频率。",
      },
      thirdEye: {
        sanskrit: "眉心轮 (Ajna)",
        name: "第三眼 / 印堂",
        location: "双眉正中间 (印堂穴)",
        element: "光芒与深层直觉",
        harmony: "洞察敏锐，直觉精准，具备看透事物本质的智慧。",
        imbalance: "多梦失眠、思虑过剩、直觉迟钝、执着评判他人。",
        practices: "凝视烛光、青金石疗愈、深呼吸、调和852Hz音频。",
      },
      throat: {
        sanskrit: "喉轮 (Vishuddha)",
        name: "喉轮 / 咽喉",
        location: "喉部中央及声带",
        element: "以太 / 金之气",
        harmony: "真诚自如地表达自我，善于倾听，人际沟通清晰顺畅。",
        imbalance: "怯于发声、咽喉紧张、言不由衷、甲状腺淤堵。",
        practices: "颈部温和拉伸、发声吟诵、饮用草本茶、佩戴海蓝宝、741Hz音频。",
      },
      heart: {
        sanskrit: "心轮 (Anahata)",
        name: "心轮 / 膻中",
        location: "胸腔正中 (膻中穴)",
        element: "空气 / 木之气",
        harmony: "充满无条件的爱，同理心丰富，宽恕包容，内心喜悦。",
        imbalance: "冷漠防备、嫉妒怨恨、心悸胸闷、情感过度依赖。",
        practices: "扩胸瑜伽体式、林间散步、粉晶冥想、639Hz音频共鸣。",
      },
      solarPlexus: {
        sanskrit: "太阳神经丛轮 (Manipura)",
        name: "太阳轮 / 脐上",
        location: "心窝与肚脐之间 (中脘穴)",
        element: "生命之火",
        harmony: "自信坚定，意志力强，行动敏捷，具备主导生命的活力。",
        imbalance: "畏缩自卑、易怒失控、消化不良、犹豫不决。",
        practices: "核心腹肌运动、晒太阳、黄水晶冥想、腹式呼吸及528Hz音频。",
      },
      sacral: {
        sanskrit: "生殖轮 / 本我轮 (Svadhisthana)",
        name: "脐轮 / 丹田",
        location: "肚脐下方约3厘米 (气海穴)",
        element: "流动之水",
        harmony: "感性充沛，富有艺术创造力，欣然接纳生命变化。",
        imbalance: "情绪麻木、缺乏激情、灵感枯竭、过分依附关系。",
        practices: "骨盆伸展运动、充足补水、艺术绘画、红玛瑙及417Hz音频。",
      },
      root: {
        sanskrit: "海底轮 (Muladhara)",
        name: "海底轮 / 会阴",
        location: "脊椎底端 (会阴穴)",
        element: "大地之土",
        harmony: "内心安定沉着，脚踏实地，对现实生活充满安全感与底气。",
        imbalance: "生存焦虑、莫名恐惧、体质虚弱、身心漂浮不定。",
        practices: "赤脚接地气步行、深蹲锻炼、红碧玉冥想、396Hz频率疗愈。",
      },
    },
  },
  fr: {
    title: "Visualiseur 3D Méridiens d'Énergie et 7 Chakras",
    subtitle: "Explorez le méridien central Sushumna, les sept chakras sacrés et les Cinq Éléments dans un orbe géométrique sacré 3D interactif.",
    rotateHint: "Glissez pour faire pivoter le totem 3D à 360°. Appuyez sur chaque orbe pour inspecter ses fréquences et pratiques d'harmonisation.",
    toggleAutoRotate: "Rotation Auto",
    resetFocus: "Vue Globale",
    vitalityLabel: "Rythme de Circulation",
    vitalityCalm: "Méditation (0.6x)",
    vitalityBalanced: "Harmonieux (1.0x)",
    vitalityActive: "Vitalisant (1.6x)",
    chakraListTitle: "Sept Centres d'Énergie Sacrés",
    chakraDetailsTitle: "Analyse Énergétique Approfondie",
    harmonyState: "✨ État Harmonieux et Équilibré",
    imbalanceState: "⚠️ Signes de Blocage ou Déséquilibre",
    healingPractices: "🌿 Pratiques Quotidiennes d'Harmonisation",
    soundNote: "Note Musicale",
    frequency: "Fréquence Sacrée (Hz)",
    loadingText: "Chargement du Totem Énergétique 3D...",
    chakras: {
      crown: {
        sanskrit: "Sahasrara (सहस्रार)",
        name: "Chakra Coronal",
        location: "Sommet du crâne",
        element: "Conscience Cosmique",
        harmony: "Union avec l'univers, paix intérieure profonde, claire vision du destin.",
        imbalance: "Isolement, cynisme, déconnexion spirituelle, fuite du réel.",
        practices: "Méditation silencieuse, contemplation céleste, améthyste, fréquence 963Hz.",
      },
      thirdEye: {
        sanskrit: "Ajna (आज्ञा)",
        name: "Chakra du Troisième Œil",
        location: "Entre les deux sourcils",
        element: "Lumière & Intuition",
        harmony: "Clarté d'esprit, intuition vive, vision perçante de la vérité.",
        imbalance: "Confusion mentale, insomnie, manque de discernement, dogmatisme.",
        practices: "Méditation Trataka, lapis-lazuli, respiration consciente, 852Hz.",
      },
      throat: {
        sanskrit: "Vishuddha (विशुद्ध)",
        name: "Chakra de la Gorge",
        location: "Centre de la gorge",
        element: "Éther & Métal",
        harmony: "Expression authentique, écoute empathique, communication fluide.",
        imbalance: "Peur de s'exprimer, bavardage compulsif, raideur de la nuque.",
        practices: "Étirements doux du cou, chant du mantra HAM, aigue-marine, 741Hz.",
      },
      heart: {
        sanskrit: "Anahata (अनाहत)",
        name: "Chakra du Cœur",
        location: "Centre de la poitrine",
        element: "Air & Bois",
        harmony: "Amour inconditionnel, compassion profonde, pardon et paix émotionnelle.",
        imbalance: "Rancune, méfiance excessive, solitude pesante, jalousie.",
        practices: "Postures d'ouverture du cœur, promenades en forêt, quartz rose, 639Hz.",
      },
      solarPlexus: {
        sanskrit: "Manipura (मणिपूर)",
        name: "Chakra du Plexus Solaire",
        location: "Au-dessus du nombril",
        element: "Feu Intérieur",
        harmony: "Confiance en soi inébranlable, volonté affirmée, vitalité radieuse.",
        imbalance: "Perte d'estime de soi, colères, troubles digestifs, indécision.",
        practices: "Exercices de gainage, bains de soleil, citrine, respiration abdominale, 528Hz.",
      },
      sacral: {
        sanskrit: "Svadhisthana (स्वाधिष्ठान)",
        name: "Chakra Sacré",
        location: "Bas-ventre sous le nombril",
        element: "Eau Fluide",
        harmony: "Créativité jaillissante, sensualité saine, souplesse face aux changements.",
        imbalance: "Blocages émotionnels, culpabilité, manque d'élan créatif.",
        practices: "Assouplissement du bassin, hydratation bienfaisante, cornaline, 417Hz.",
      },
      root: {
        sanskrit: "Muladhara (मूलाधार)",
        name: "Chakra Racine",
        location: "Base de la colonne vertébrale",
        element: "Terre & Ancrage",
        harmony: "Enracinement solide, sentiment de sécurité vital, force physique.",
        imbalance: "Angoisses d'insécurité, panique, fatigue chronique, sentiment d'instabilité.",
        practices: "Marche pieds nus dans l'herbe (Earthing), squats, jaspe rouge, 396Hz.",
      },
    },
  },
  es: {
    title: "Visor 3D de Meridianos de Energía y 7 Chakras",
    subtitle: "Explora el meridiano central Sushumna, los siete chakras sagrados y los Cinco Elementos en un orbe totémico 3D interactivo.",
    rotateHint: "Arrastra para girar el tótem 3D en 360°. Toca cualquier orbe para descubrir su frecuencia y métodos de armonización.",
    toggleAutoRotate: "Giro Automático",
    resetFocus: "Ver Todos",
    vitalityLabel: "Ritmo de Circulación",
    vitalityCalm: "Meditación (0.6x)",
    vitalityBalanced: "Armonioso (1.0x)",
    vitalityActive: "Vitalizante (1.6x)",
    chakraListTitle: "Siete Centros de Energía Sagrados",
    chakraDetailsTitle: "Análisis Energético en Profundidad",
    harmonyState: "✨ Estado Armonioso y Equilibrado",
    imbalanceState: "⚠️ Signos de Bloqueo o Desequilibrio",
    healingPractices: "🌿 Prácticas Diarias de Armonización",
    soundNote: "Nota Musical",
    frequency: "Frecuencia Sagrada (Hz)",
    loadingText: "Renderizando Tótem Energético 3D...",
    chakras: {
      crown: {
        sanskrit: "Sahasrara (सहस्रार)",
        name: "Chakra Corona",
        location: "Corona de la cabeza",
        element: "Conciencia Cósmica",
        harmony: "Conexión con el universo, paz espiritual sublime, propósito de vida claro.",
        imbalance: "Aislamiento, cinismo, desconexión del alma o evasión de la realidad.",
        practices: "Meditación en silencio, contemplar las estrellas, amatista, frecuencia 963Hz.",
      },
      thirdEye: {
        sanskrit: "Ajna (आज्ञा)",
        name: "Chakra del Tercer Ojo",
        location: "Entrecejo",
        element: "Luz e Intuición Superior",
        harmony: "Claridad mental, intuición lúcida, sabiduría para discernir la verdad.",
        imbalance: "Mente dispersa, insomnio, falta de visión interior, rigidez mental.",
        practices: "Mirar la llama de una vela (Trataka), lapislázuli, 852Hz.",
      },
      throat: {
        sanskrit: "Vishuddha (विशुद्ध)",
        name: "Chakra de la Garganta",
        location: "Centro de la garganta",
        element: "Éter y Metal",
        harmony: "Expresión auténtica, sinceridad, elocuencia y escucha compasiva.",
        imbalance: "Miedo a hablar, hablar de más, tensión en el cuello o tiroides.",
        practices: "Estiramiento suave de cuello, canto del mantra HAM, aguamarina, 741Hz.",
      },
      heart: {
        sanskrit: "Anahata (अनाहत)",
        name: "Chakra del Corazón",
        location: "Centro del pecho",
        element: "Aire y Madera",
        harmony: "Amor incondicional, compasión fraternal, perdón y empatía radiante.",
        imbalance: "Rencor, desconfianza, soledad, dolor emocional no resuelto.",
        practices: "Posturas de apertura de pecho, paseos por el bosque, cuarzo rosa, 639Hz.",
      },
      solarPlexus: {
        sanskrit: "Manipura (मणिपूर)",
        name: "Chakra del Plexo Solar",
        location: "Parte superior del abdomen",
        element: "Fuego Interior",
        harmony: "Autoestima firme, poder personal, motivación incansable y disciplina.",
        imbalance: "Inseguridad, frustración, problemas digestivos, necesidad de control.",
        practices: "Ejercicios de abdomen, baños de sol, citrino, respiración diafragmática, 528Hz.",
      },
      sacral: {
        sanskrit: "Svadhisthana (स्वाधिष्ठान)",
        name: "Chakra Sacro",
        location: "Abdomen inferior bajo el ombligo",
        element: "Agua Fluyente",
        harmony: "Fluidez creativa, alegría vital, relaciones afectivas sanas.",
        imbalance: "Apatía, miedo al placer, bloqueos artísticos, dependencia emocional.",
        practices: "Danza suave de cadera, hidratación constante, cornalina, 417Hz.",
      },
      root: {
        sanskrit: "Muladhara (मूलाधार)",
        name: "Chakra Raíz",
        location: "Base de la columna vertebral",
        element: "Tierra y Firmeza",
        harmony: "Enraizamiento profundo, tranquilidad ante la vida, vitalidad corporal.",
        imbalance: "Miedo a la supervivencia, ansiedad, fatiga crónica, falta de suelo firme.",
        practices: "Caminar descalzo en la tierra (Earthing), sentadillas, jaspe rojo, 396Hz.",
      },
    },
  },
};

const CHAKRA_BG_CLASSES: Record<ChakraKey, string> = {
  crown: "bg-chart-6",
  thirdEye: "bg-chart-8",
  throat: "bg-chart-2",
  heart: "bg-chart-1",
  solarPlexus: "bg-chart-3",
  sacral: "bg-chart-7",
  root: "bg-chart-9",
};

export default function EnergyChakraTotem3D({
  locale = "ko",
  defaultChakra = "heart",
}: Props) {
  const t = I18N_TEXT[locale] ?? I18N_TEXT.en;
  const [selectedChakra, setSelectedChakra] = useState<ChakraKey | null>(defaultChakra);
  const [autoRotate, setAutoRotate] = useState(true);
  const [vitality, setVitality] = useState(1.0);

  const activeMeta = selectedChakra
    ? CHAKRA_LIST.find((c) => c.key === selectedChakra)
    : null;
  const activeDetail = selectedChakra ? t.chakras[selectedChakra] : null;

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col my-8">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                autoRotate
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t.toggleAutoRotate}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChakra(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.resetFocus}</span>
            </button>
          </div>
        </div>

        {/* Vitality Speed Switcher */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            {t.vitalityLabel}:
          </span>
          {[
            { val: 0.6, label: t.vitalityCalm },
            { val: 1.0, label: t.vitalityBalanced },
            { val: 1.6, label: t.vitalityActive },
          ].map((sp) => (
            <button
              key={sp.val}
              type="button"
              onClick={() => setVitality(sp.val)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                vitality === sp.val
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative w-full h-95 sm:h-115 bg-card">
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-3">
              <RotateCw className="w-6 h-6 animate-spin text-primary" />
              <span>{t.loadingText}</span>
            </div>
          }
        >
          <EnergyChakraTotem3DScene
            selectedChakra={selectedChakra}
            onSelectChakra={(key) => setSelectedChakra(key)}
            autoRotate={autoRotate}
            vitalityLevel={vitality}
          />
        </Suspense>

        {/* Floating Hint */}
        <div className="absolute bottom-3 left-4 right-4 pointer-events-none text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-card/90 backdrop-blur-md text-xs text-muted-foreground border border-border">
            {t.rotateHint}
          </span>
        </div>
      </div>

      {/* Chakra Selector Chips */}
      <div className="p-4 border-t border-border bg-muted/10">
        <div className="text-xs font-bold text-muted-foreground mb-2">
          {t.chakraListTitle}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CHAKRA_LIST.map((chakra) => {
            const isSel = selectedChakra === chakra.key;
            return (
              <button
                key={chakra.key}
                type="button"
                onClick={() => setSelectedChakra(chakra.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSel
                    ? "border-primary bg-primary text-primary-foreground shadow-xs scale-105"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full inline-block ${CHAKRA_BG_CLASSES[chakra.key]}`}
                />
                <span>{chakra.nameKo.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* In-Depth Card for Selected Chakra */}
      {activeMeta && activeDetail && (
        <div className="p-6 border-t border-border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded-full inline-block ${CHAKRA_BG_CLASSES[activeMeta.key]}`}
                />
                <h3 className="text-base font-bold text-foreground">
                  {activeDetail.name} ({activeDetail.sanskrit})
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                📍 {activeDetail.location} • 원소: {activeDetail.element}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-semibold">
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {t.soundNote}: {activeMeta.note}
              </span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                {activeMeta.frequencyHz} Hz
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1">
                <Sun className="w-4 h-4 text-chart-3" />
                <span>{t.harmonyState}</span>
              </div>
              <p className="text-muted-foreground">{activeDetail.harmony}</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1">
                <Activity className="w-4 h-4 text-destructive" />
                <span>{t.imbalanceState}</span>
              </div>
              <p className="text-muted-foreground">{activeDetail.imbalance}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs leading-relaxed space-y-1">
            <div className="font-bold text-primary flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{t.healingPractices}</span>
            </div>
            <p className="text-muted-foreground">{activeDetail.practices}</p>
          </div>
        </div>
      )}
    </div>
  );
}
