import { Locale } from "@/i18n";
import { StrictLocalized } from "@/lib/system/utils/localization";

import { ArtStyle, ArtStyleProfile, ArtStyleQuestion } from "./types";

// Constants
export const ART_STYLE_EMOJIS: Record<ArtStyle, string> = {
  "abstract-expressionist": "🎨",
  "classical-realist": "🏛️",
  "modern-minimalist": "⬜",
  "nature-impressionist": "🌿",
  "pop-culture-vibrant": "🌈",
  "surreal-dreamer": "🔮",
};

const EN_LABELS: Record<ArtStyle, string> = {
  "abstract-expressionist": "Abstract Expressionist",
  "classical-realist": "Classical Realist",
  "modern-minimalist": "Modern Minimalist",
  "nature-impressionist": "Nature Impressionist",
  "pop-culture-vibrant": "Pop Culture Vibrant",
  "surreal-dreamer": "Surreal Dreamer",
};

const KO_LABELS: Record<ArtStyle, string> = {
  "abstract-expressionist": "추상 표현주의자",
  "classical-realist": "고전적 사실주의자",
  "modern-minimalist": "현대적 미니멀리스트",
  "nature-impressionist": "자연 인상주의자",
  "pop-culture-vibrant": "팝 아트 애호가",
  "surreal-dreamer": "초현실적 몽상가",
};

export const ART_STYLE_LABELS: Record<Locale, Record<ArtStyle, string>> = {
  cn: EN_LABELS,
  en: EN_LABELS,
  es: EN_LABELS,
  fr: EN_LABELS,
  ja: EN_LABELS,
  ko: KO_LABELS,
};

const EN_DESCRIPTIONS: Record<ArtStyle, string> = {
  "abstract-expressionist":
    "You find beauty in raw emotion and unstructured forms.",
  "classical-realist":
    "You appreciate tradition, skill, and realistic representation.",
  "modern-minimalist": 'You value simplicity, clarity, and "less is more".',
  "nature-impressionist":
    "You feel most connected to art that captures natural light and landscapes.",
  "pop-culture-vibrant":
    "You are drawn to bold colors, commercial imagery, and energy.",
  "surreal-dreamer":
    "You love the dreamlike, the bizarre, and the subconscious.",
};

const KO_DESCRIPTIONS: Record<ArtStyle, string> = {
  "abstract-expressionist":
    "당신은 가공되지 않은 감정과 비정형의 형태에서 아름다움을 발견합니다.",
  "classical-realist":
    "당신은 전통, 기술, 그리고 사실적인 묘사를 높이 평가합니다.",
  "modern-minimalist":
    '당신은 단순함, 명료함, 그리고 "적을수록 좋다"는 미학을 중요시합니다.',
  "nature-impressionist":
    "당신은 자연의 빛과 풍경을 포착한 예술에 가장 큰 연결감을 느낍니다.",
  "pop-culture-vibrant":
    "당신은 대담한 색채, 상업적 이미지, 그리고 활기찬 에너지에 끌립니다.",
  "surreal-dreamer":
    "당신은 꿈 같은 분위기, 기묘함, 그리고 무의식의 세계를 사랑합니다.",
};

export const ART_STYLE_DESCRIPTIONS: Record<
  Locale,
  Record<ArtStyle, string>
> = {
  cn: EN_DESCRIPTIONS,
  en: EN_DESCRIPTIONS,
  es: EN_DESCRIPTIONS,
  fr: EN_DESCRIPTIONS,
  ja: EN_DESCRIPTIONS,
  ko: KO_DESCRIPTIONS,
};

const EN_RECOMMENDATIONS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": [
    "Action Painting",
    "Color Field",
    "Lyrical Abstraction",
  ],
  "classical-realist": ["Renaissance Art", "Academic Art", "Dutch Golden Age"],
  "modern-minimalist": ["Bauhaus", "De Stijl", "Minimalism"],
  "nature-impressionist": [
    "Impressionism",
    "Post-Impressionism",
    "Landscape Painting",
  ],
  "pop-culture-vibrant": ["Pop Art", "Neo-Pop", "Street Art"],
  "surreal-dreamer": ["Surrealism", "Symbolism", "Magic Realism"],
};

const KO_RECOMMENDATIONS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": ["액션 페인팅", "색면 회화", "서정적 추상"],
  "classical-realist": ["르네상스 미술", "아카데미즘", "네덜란드 황금기"],
  "modern-minimalist": ["바우하우스", "데 스틸", "미니멀리즘"],
  "nature-impressionist": ["인상주의", "후기 인상주의", "풍경화"],
  "pop-culture-vibrant": ["팝 아트", "네오 팝", "거리 예술"],
  "surreal-dreamer": ["초현실주의", "상징주의", "마술적 사실주의"],
};

export const ART_STYLE_ART_RECOMMENDATIONS: Record<
  Locale,
  Record<ArtStyle, string[]>
> = {
  cn: EN_RECOMMENDATIONS,
  en: EN_RECOMMENDATIONS,
  es: EN_RECOMMENDATIONS,
  fr: EN_RECOMMENDATIONS,
  ja: EN_RECOMMENDATIONS,
  ko: KO_RECOMMENDATIONS,
};

const EN_MUSEUMS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": ["MoMA (NYC)", "Tate Modern (London)"],
  "classical-realist": ["Louvre (Paris)", "Uffizi (Florence)"],
  "modern-minimalist": ["Guggenheim (NYC)", "Dia Beacon"],
  "nature-impressionist": ["Musée d'Orsay (Paris)", "Orangerie Museum"],
  "pop-culture-vibrant": ["The Warhol (Pittsburgh)", "Broad Museum (LA)"],
  "surreal-dreamer": ["Dalí Theatre-Museum", "Magritte Museum"],
};

const KO_MUSEUMS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": ["뉴욕 현대 미술관 (MoMA)", "테이트 모던"],
  "classical-realist": ["루브르 박물관", "우피치 미술관"],
  "modern-minimalist": ["구겐하임 미술관", "디아 비콘"],
  "nature-impressionist": ["오르세 미술관", "오랑주리 미술관"],
  "pop-culture-vibrant": ["워홀 미술관", "브로드 미술관"],
  "surreal-dreamer": ["달리 극장 박물관", "마그리트 미술관"],
};

export const ART_STYLE_MUSEUM_SUGGESTIONS: Record<
  Locale,
  Record<ArtStyle, string[]>
> = {
  cn: EN_MUSEUMS,
  en: EN_MUSEUMS,
  es: EN_MUSEUMS,
  fr: EN_MUSEUMS,
  ja: EN_MUSEUMS,
  ko: KO_MUSEUMS,
};

const EN_EXPRESSIONS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": ["Splatter painting", "Intuitive drawing"],
  "classical-realist": ["Figure drawing", "Oil painting"],
  "modern-minimalist": ["Black and white photography", "Digital design"],
  "nature-impressionist": ["Plein air painting", "Botanical sketching"],
  "pop-culture-vibrant": ["Screen printing", "Comic strip creation"],
  "surreal-dreamer": ["Collage", "Dream journaling"],
};

const KO_EXPRESSIONS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": ["뿌리기 기법", "직관적 드로잉"],
  "classical-realist": ["인체 소묘", "유화"],
  "modern-minimalist": ["흑백 사진", "디지털 디자인"],
  "nature-impressionist": ["야외 스케치", "식물 드로잉"],
  "pop-culture-vibrant": ["실크스크린", "만화 창작"],
  "surreal-dreamer": ["콜라주", "꿈 일기 시각화"],
};

export const ART_STYLE_CREATIVE_EXPRESSIONS: Record<
  Locale,
  Record<ArtStyle, string[]>
> = {
  cn: EN_EXPRESSIONS,
  en: EN_EXPRESSIONS,
  es: EN_EXPRESSIONS,
  fr: EN_EXPRESSIONS,
  ja: EN_EXPRESSIONS,
  ko: KO_EXPRESSIONS,
};

const EN_ARTISTS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": ["Jackson Pollock", "Mark Rothko"],
  "classical-realist": ["Leonardo da Vinci", "Rembrandt"],
  "modern-minimalist": ["Donald Judd", "Agnes Martin"],
  "nature-impressionist": ["Claude Monet", "Vincent van Gogh"],
  "pop-culture-vibrant": ["Andy Warhol", "Keith Haring"],
  "surreal-dreamer": ["Salvador Dalí", "René Magritte"],
};

const KO_ARTISTS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": ["잭슨 폴록", "마크 로스코"],
  "classical-realist": ["레오나르도 다 빈치", "렘브란트"],
  "modern-minimalist": ["도널드 저드", "아그네스 마틴"],
  "nature-impressionist": ["클로드 모네", "빈센트 반 고흐"],
  "pop-culture-vibrant": ["앤디 워홀", "키스 해링"],
  "surreal-dreamer": ["살바도르 달리", "르네 마그리트"],
};

export const ART_STYLE_FAMOUS_ARTISTS: Record<
  Locale,
  Record<ArtStyle, string[]>
> = {
  cn: EN_ARTISTS,
  en: EN_ARTISTS,
  es: EN_ARTISTS,
  fr: EN_ARTISTS,
  ja: EN_ARTISTS,
  ko: KO_ARTISTS,
};

// TODO : 6개의 언어 지원 확실하게, 그리고 컨텐츠 추가하기
const createArtStyleProfile = (
  style: ArtStyle,
  locale: Locale = "en",
): ArtStyleProfile => ({
  artRecommendations: ART_STYLE_ART_RECOMMENDATIONS[locale][style],
  /* eslint-disable no-restricted-syntax */
  colorPalette: {
    "abstract-expressionist": [
      "#FF4444",
      "#4444FF",
      "#FFFF44",
      "#44FF44",
      "#FF44FF",
    ],
    "classical-realist": [
      "#8B4513",
      "#DAA520",
      "#2F4F4F",
      "#800000",
      "#F5DEB3",
    ],
    "modern-minimalist": [
      "#000000",
      "#FFFFFF",
      "#808080",
      "#C0C0C0",
      "#F5F5F5",
    ],
    "nature-impressionist": [
      "#228B22",
      "#87CEEB",
      "#DDA0DD",
      "#F0E68C",
      "#FFB6C1",
    ],
    "pop-culture-vibrant": [
      "#FF69B4",
      "#00FFFF",
      "#FFFF00",
      "#FF4500",
      "#32CD32",
    ],
    "surreal-dreamer": ["#4B0082", "#8A2BE2", "#FF1493", "#FFD700", "#00CED1"],
  }[style],
  /* eslint-enable no-restricted-syntax */
  creativeExpressions: ART_STYLE_CREATIVE_EXPRESSIONS[locale][style],
  description: ART_STYLE_DESCRIPTIONS[locale][style],
  emoji: ART_STYLE_EMOJIS[style],
  famousArtists: ART_STYLE_FAMOUS_ARTISTS[locale][style],
  museumSuggestions: ART_STYLE_MUSEUM_SUGGESTIONS[locale][style],
  name: ART_STYLE_LABELS[locale][style],
  traits: ART_STYLE_TRAITS[locale][style],
});

export const getArtStyleProfile = (
  style: ArtStyle,
  locale: Locale = "en",
): ArtStyleProfile => createArtStyleProfile(style, locale);

export const getAllArtStyleProfiles = (
  locale: Locale = "en",
): Record<ArtStyle, ArtStyleProfile> => ({
  "abstract-expressionist": createArtStyleProfile(
    "abstract-expressionist",
    locale,
  ),
  "classical-realist": createArtStyleProfile("classical-realist", locale),
  "modern-minimalist": createArtStyleProfile("modern-minimalist", locale),
  "nature-impressionist": createArtStyleProfile("nature-impressionist", locale),
  "pop-culture-vibrant": createArtStyleProfile("pop-culture-vibrant", locale),
  "surreal-dreamer": createArtStyleProfile("surreal-dreamer", locale),
});

// 6-Locale strict support with English fallback for missing languages
const EN_TRAITS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": [
    "Emotionally expressive and intuitive",
    "Values spontaneity and creative freedom",
    "Drawn to bold colors and dynamic compositions",
    "Prefers non-representational art forms",
    "Appreciates the process over the final product",
  ],
  "classical-realist": [
    "Values technical skill and craftsmanship",
    "Appreciates traditional artistic techniques",
    "Drawn to realistic and figurative art",
    "Enjoys historical and mythological themes",
    "Prefers balanced and harmonious compositions",
  ],
  "modern-minimalist": [
    "Values simplicity and clarity",
    "Appreciates clean geometric forms",
    "Drawn to monochromatic color schemes",
    "Prefers functional and purposeful design",
    "Enjoys contemplative and meditative art",
  ],
  "nature-impressionist": [
    "Deeply connected to nature",
    "Values organic and flowing forms",
    "Appreciates changing light and atmosphere",
    "Drawn to landscape and botanical art",
    "Enjoys plein air and outdoor creation",
  ],
  "pop-culture-vibrant": [
    "Celebrates contemporary culture",
    "Values accessibility and mass appeal",
    "Drawn to bright colors and bold graphics",
    "Enjoys commercial and popular imagery",
    "Appreciates irony and social commentary",
  ],
  "surreal-dreamer": [
    "Fascinated by dreams and the subconscious",
    "Values imagination over reality",
    "Drawn to symbolic and metaphorical imagery",
    "Enjoys psychological and philosophical depth",
    "Appreciates the mysterious and fantastical",
  ],
};

export const ART_STYLE_TRAITS: Record<Locale, Record<ArtStyle, string[]>> = {
  cn: EN_TRAITS,
  en: EN_TRAITS,
  es: EN_TRAITS,
  fr: EN_TRAITS,
  // TODO : strict 6 locale support
  ja: EN_TRAITS,
  ko: {
    "abstract-expressionist": [
      "감정적으로 표현적이고 직관적",
      "자발성과 창작의 자유를 중시",
      "대담한 색채와 역동적인 구성에 끌림",
      "비구상적인 예술 형태를 선호",
      "최종 결과보다 과정을 감상",
    ],
    "classical-realist": [
      "기술적 숙련도와 장인정신을 중시",
      "전통적인 예술 기법을 감상",
      "현실적이고 구상적인 예술에 끌림",
      "역사적이고 신화적인 주제를 즐김",
      "균형잡히고 조화로운 구성을 선호",
    ],
    "modern-minimalist": [
      "단순함과 명료함을 중시",
      "깔끔한 기하학적 형태를 감상",
      "단색 색채 구성에 끌림",
      "기능적이고 목적이 있는 디자인을 선호",
      "명상적이고 사색적인 예술을 즐김",
    ],
    "nature-impressionist": [
      "자연과 깊이 연결됨",
      "유기적이고 흐르는 형태를 중시",
      "변화하는 빛과 분위기를 감상",
      "풍경화와 식물 예술에 끌림",
      "야외 창작과 플레인 에어를 즐김",
    ],
    "pop-culture-vibrant": [
      "현대 문화를 찬양",
      "접근성과 대중적 매력을 중시",
      "밝은 색채와 대담한 그래픽에 끌림",
      "상업적이고 대중적인 이미지를 즐김",
      "아이러니와 사회적 논평을 감상",
    ],
    "surreal-dreamer": [
      "꿈과 무의식에 매혹됨",
      "현실보다 상상력을 중시",
      "상징적이고 은유적인 이미지에 끌림",
      "심리적이고 철학적인 깊이를 즐김",
      "신비롭고 환상적인 것을 감상",
    ],
  },
};

const EN_ART_RECOMMENDATIONS: Record<ArtStyle, string[]> = {
  "abstract-expressionist": [
    "Action painting and gestural brushwork",
    "Large-scale canvas works",
    "Mixed media and experimental techniques",
    "Color field painting",
    "Sculpture and installation art",
  ],
  "classical-realist": [
    "Renaissance and Baroque paintings",
    "Classical sculpture and architecture",
    "Portrait and landscape painting",
    "Academic drawing techniques",
    "Historical and religious art",
  ],
  "modern-minimalist": [
    "Geometric abstraction",
    "Conceptual art installations",
    "Contemporary sculpture",
    "Architectural photography",
    "Digital and new media art",
  ],
  "nature-impressionist": [
    "Impressionist and post-impressionist works",
    "Landscape and seascape painting",
    "Botanical illustration",
    "Nature photography",
    "Environmental and land art",
  ],
  "pop-culture-vibrant": [
    "Pop art and street art",
    "Commercial and graphic design",
    "Contemporary photography",
    "Video and digital media",
    "Fashion and textile design",
  ],
  "surreal-dreamer": [
    "Surrealist paintings and sculptures",
    "Fantasy and visionary art",
    "Psychedelic and dream-like imagery",
    "Symbolic and metaphorical works",
    "Contemporary magical realism",
  ],
};
const ART_STYLE_QUESTIONS_LEGACY: ArtStyleQuestion[] = [
  {
    id: "1",
    options: [
      {
        id: "a",
        style: "abstract-expressionist" as ArtStyle,
        text: "Bold and emotionally charged abstract paintings",
        weight: 3,
      },
      {
        id: "b",
        style: "classical-realist" as ArtStyle,
        text: "Classical sculptures and Renaissance masterpieces",
        weight: 3,
      },
      {
        id: "c",
        style: "modern-minimalist" as ArtStyle,
        text: "Clean geometric installations with minimal elements",
        weight: 3,
      },
      {
        id: "d",
        style: "surreal-dreamer" as ArtStyle,
        text: "Dreamlike and fantastical scenes that challenge reality",
        weight: 3,
      },
      {
        id: "e",
        style: "pop-culture-vibrant" as ArtStyle,
        text: "Bright, pop-culture inspired contemporary works",
        weight: 3,
      },
      {
        id: "f",
        style: "nature-impressionist" as ArtStyle,
        text: "Beautiful landscapes and natural scenes",
        weight: 3,
      },
    ],
    scenario: "When you visit an art museum, what works draw you in most?",
  },
  {
    id: "2",
    options: [
      {
        id: "a",
        style: "abstract-expressionist" as ArtStyle,
        text: "A large studio with canvases everywhere and paint splatters",
        weight: 3,
      },
      {
        id: "b",
        style: "classical-realist" as ArtStyle,
        text: "A traditional atelier with classical casts and drawing materials",
        weight: 3,
      },
      {
        id: "c",
        style: "modern-minimalist" as ArtStyle,
        text: "A clean, white space with perfect lighting and zero clutter",
        weight: 3,
      },
      {
        id: "d",
        style: "surreal-dreamer" as ArtStyle,
        text: "A mysterious room filled with curious objects and inspiration boards",
        weight: 3,
      },
      {
        id: "e",
        style: "pop-culture-vibrant" as ArtStyle,
        text: "A vibrant studio with music, colors, and pop culture references",
        weight: 3,
      },
      {
        id: "f",
        style: "nature-impressionist" as ArtStyle,
        text: "An outdoor garden studio or a room with large windows overlooking nature",
        weight: 3,
      },
    ],
    scenario: "Your ideal creative space is:",
  },
  {
    id: "3",
    options: [
      {
        id: "a",
        style: "abstract-expressionist" as ArtStyle,
        text: "Bold, contrasting colors that evoke strong emotions",
        weight: 2,
      },
      {
        id: "b",
        style: "classical-realist" as ArtStyle,
        text: "Earth tones and classical color harmonies",
        weight: 2,
      },
      {
        id: "c",
        style: "modern-minimalist" as ArtStyle,
        text: "Monochromatic or very limited palettes",
        weight: 2,
      },
      {
        id: "d",
        style: "surreal-dreamer" as ArtStyle,
        text: "Unusual color combinations that create a mysterious atmosphere",
        weight: 2,
      },
      {
        id: "e",
        style: "pop-culture-vibrant" as ArtStyle,
        text: "Bright, saturated colors that grab attention",
        weight: 2,
      },
      {
        id: "f",
        style: "nature-impressionist" as ArtStyle,
        text: "Soft, natural tones inspired by landscapes and flowers",
        weight: 2,
      },
    ],
    scenario: "When choosing colors for a project, you prefer:",
  },
  {
    id: "4",
    options: [
      {
        id: "a",
        style: "abstract-expressionist" as ArtStyle,
        text: "Intuitive and spontaneous, following my emotions",
        weight: 3,
      },
      {
        id: "b",
        style: "classical-realist" as ArtStyle,
        text: "Disciplined and structured, following traditional techniques",
        weight: 3,
      },
      {
        id: "c",
        style: "modern-minimalist" as ArtStyle,
        text: "Conceptual and calculated, focusing on the idea over decoration",
        weight: 3,
      },
      {
        id: "d",
        style: "surreal-dreamer" as ArtStyle,
        text: "Dream-inspired and symbolic, exploring the subconscious",
        weight: 3,
      },
      {
        id: "e",
        style: "pop-culture-vibrant" as ArtStyle,
        text: "Influenced by pop culture and meant to be accessible to everyone",
        weight: 3,
      },
      {
        id: "f",
        style: "nature-impressionist" as ArtStyle,
        text: "Observational, trying to capture the beauty of the natural world",
        weight: 3,
      },
    ],
    scenario: "Your approach to creating art is usually:",
  },
  {
    id: "5",
    options: [
      {
        id: "a",
        style: "abstract-expressionist" as ArtStyle,
        text: "Art that expresses raw human emotion and experience",
        weight: 3,
      },
      {
        id: "b",
        style: "classical-realist" as ArtStyle,
        text: "Art that shows incredible technical skill and timeless beauty",
        weight: 3,
      },
      {
        id: "c",
        style: "modern-minimalist" as ArtStyle,
        text: "Art that challenges you to think and see differently",
        weight: 3,
      },
      {
        id: "d",
        style: "surreal-dreamer" as ArtStyle,
        text: "Art that is mysterious and opens up your imagination and dreams",
        weight: 3,
      },
      {
        id: "e",
        style: "pop-culture-vibrant" as ArtStyle,
        text: "Art that reflects and celebrates contemporary life",
        weight: 3,
      },
      {
        id: "f",
        style: "nature-impressionist" as ArtStyle,
        text: "Art that is a beautiful representation of the natural world",
        weight: 3,
      },
    ],
    scenario: "The art that moves you most deeply is:",
  },
  {
    id: "6",
    options: [
      {
        id: "a",
        style: "abstract-expressionist" as ArtStyle,
        text: "A large-scale abstract painting with powerful brushwork",
        weight: 2,
      },
      {
        id: "b",
        style: "classical-realist" as ArtStyle,
        text: "A classical portrait or sculpture with perfect proportions",
        weight: 2,
      },
      {
        id: "c",
        style: "modern-minimalist" as ArtStyle,
        text: "A minimalist installation that transforms a space",
        weight: 2,
      },
      {
        id: "d",
        style: "surreal-dreamer" as ArtStyle,
        text: "A surrealist piece that makes you question reality",
        weight: 2,
      },
      {
        id: "e",
        style: "pop-culture-vibrant" as ArtStyle,
        text: "A vibrant pop-art piece with a strong message",
        weight: 2,
      },
      {
        id: "f",
        style: "nature-impressionist" as ArtStyle,
        text: "A beautiful landscape painting that brings peace to your home",
        weight: 2,
      },
    ],
    scenario: "If you could own one type of artwork, it would be:",
  },
  {
    id: "7",
    options: [
      {
        id: "a",
        style: "abstract-expressionist" as ArtStyle,
        text: "Internal emotions and personal experiences",
        weight: 3,
      },
      {
        id: "b",
        style: "classical-realist" as ArtStyle,
        text: "Classical ideals of beauty and perfection",
        weight: 3,
      },
      {
        id: "c",
        style: "modern-minimalist" as ArtStyle,
        text: "Philosophical concepts and pure forms",
        weight: 3,
      },
      {
        id: "d",
        style: "surreal-dreamer" as ArtStyle,
        text: "Dreams, myths, and the mysteries of the mind",
        weight: 3,
      },
      {
        id: "e",
        style: "pop-culture-vibrant" as ArtStyle,
        text: "Pop culture, media, and social commentary",
        weight: 3,
      },
      {
        id: "f",
        style: "nature-impressionist" as ArtStyle,
        text: "The beauty and rhythms of the natural world",
        weight: 3,
      },
    ],
    scenario: "When expressing your creativity, you are most inspired by:",
  },
  {
    id: "8",
    options: [
      {
        id: "a",
        style: "abstract-expressionist" as ArtStyle,
        text: "Expressive techniques and emotional release through art",
        weight: 2,
      },
      {
        id: "b",
        style: "classical-realist" as ArtStyle,
        text: "The fundamentals of traditional drawing and painting",
        weight: 2,
      },
      {
        id: "c",
        style: "modern-minimalist" as ArtStyle,
        text: "Conceptual art and installation techniques",
        weight: 2,
      },
      {
        id: "d",
        style: "surreal-dreamer" as ArtStyle,
        text: "Surrealist methods and dream interpretation",
        weight: 2,
      },
      {
        id: "e",
        style: "pop-culture-vibrant" as ArtStyle,
        text: "Pop art techniques and contemporary media",
        weight: 2,
      },
      {
        id: "f",
        style: "nature-impressionist" as ArtStyle,
        text: "En plein air painting and nature observation",
        weight: 2,
      },
    ],
    scenario: "Your ideal art workshop or class would focus on:",
  },
];

export const ART_STYLE_QUESTIONS: StrictLocalized<ArtStyleQuestion[]> = {
  cn: ART_STYLE_QUESTIONS_LEGACY,
  // TODO : strict 6 locale support
  en: ART_STYLE_QUESTIONS_LEGACY,
  es: ART_STYLE_QUESTIONS_LEGACY,
  fr: ART_STYLE_QUESTIONS_LEGACY,
  // TODO : strict 6 locale support
  ja: ART_STYLE_QUESTIONS_LEGACY,
  ko: [
    {
      id: "1",
      options: [
        {
          id: "a",
          style: "abstract-expressionist" as ArtStyle,
          text: "대담하고 감정적으로 충전된 추상화",
          weight: 3,
        },
        {
          id: "b",
          style: "classical-realist" as ArtStyle,
          text: "고전 조각품과 르네상스 걸작",
          weight: 3,
        },
        {
          id: "c",
          style: "modern-minimalist" as ArtStyle,
          text: "미니멀한 요소의 깔끔한 기하학적 설치작품",
          weight: 3,
        },
        {
          id: "d",
          style: "surreal-dreamer" as ArtStyle,
          text: "현실에 도전하는 꿈같고 환상적인 장면",
          weight: 3,
        },
        {
          id: "e",
          style: "pop-culture-vibrant" as ArtStyle,
          text: "밝고 팝 컬처에서 영감을 받은 현대 작품",
          weight: 3,
        },
        {
          id: "f",
          style: "nature-impressionist" as ArtStyle,
          text: "아름다운 풍경과 자연 장면",
          weight: 3,
        },
      ],
      scenario: "미술관을 방문했을 때, 당신이 가장 끌리는 작품은:",
    },
    {
      id: "2",
      options: [
        {
          id: "a",
          style: "abstract-expressionist" as ArtStyle,
          text: "캔버스가 곳곳에 있고 물감이 튀어있는 큰 스튜디오",
          weight: 3,
        },
        {
          id: "b",
          style: "classical-realist" as ArtStyle,
          text: "고전 조각품과 드로잉 재료가 있는 전통적인 아틀리에",
          weight: 3,
        },
        {
          id: "c",
          style: "modern-minimalist" as ArtStyle,
          text: "완벽한 조명과 정리정돈된 깔끔한 흰색 공간",
          weight: 3,
        },
        {
          id: "d",
          style: "surreal-dreamer" as ArtStyle,
          text: "호기심 많은 물건들과 영감 보드로 가득한 신비로운 방",
          weight: 3,
        },
        {
          id: "e",
          style: "pop-culture-vibrant" as ArtStyle,
          text: "음악, 색깔, 팝 컬처 레퍼런스가 있는 활기찬 스튜디오",
          weight: 3,
        },
        {
          id: "f",
          style: "nature-impressionist" as ArtStyle,
          text: "야외 정원 스튜디오나 자연이 내려다보이는 큰 창문이 있는 방",
          weight: 3,
        },
      ],
      scenario: "당신의 이상적인 창작 공간은:",
    },
    {
      id: "3",
      options: [
        {
          id: "a",
          style: "abstract-expressionist" as ArtStyle,
          text: "강한 감정을 불러일으키는 대담하고 대조적인 색상",
          weight: 2,
        },
        {
          id: "b",
          style: "classical-realist" as ArtStyle,
          text: "어스톤과 고전적인 색상 조화",
          weight: 2,
        },
        {
          id: "c",
          style: "modern-minimalist" as ArtStyle,
          text: "단색 계열이나 매우 제한적인 팔레트",
          weight: 2,
        },
        {
          id: "d",
          style: "surreal-dreamer" as ArtStyle,
          text: "신비로운 분위기를 만드는 특이한 색상 조합",
          weight: 2,
        },
        {
          id: "e",
          style: "pop-culture-vibrant" as ArtStyle,
          text: "시선을 사로잡는 밝고 포화된 색상",
          weight: 2,
        },
        {
          id: "f",
          style: "nature-impressionist" as ArtStyle,
          text: "풍경과 꽃에서 영감을 받은 부드럽고 자연스러운 톤",
          weight: 2,
        },
      ],
      scenario: "프로젝트를 위해 색상을 선택할 때, 당신이 선호하는 것은:",
    },
    {
      id: "4",
      options: [
        {
          id: "a",
          style: "abstract-expressionist" as ArtStyle,
          text: "직관적이고 자발적으로, 내 감정을 따라가며",
          weight: 3,
        },
        {
          id: "b",
          style: "classical-realist" as ArtStyle,
          text: "체계적이고 구조화되어, 전통적인 기법을 따라가며",
          weight: 3,
        },
        {
          id: "c",
          style: "modern-minimalist" as ArtStyle,
          text: "개념적이고 계획적으로, 장식보다 아이디어에 집중하며",
          weight: 3,
        },
        {
          id: "d",
          style: "surreal-dreamer" as ArtStyle,
          text: "꿈에서 영감을 받고 상징적으로, 무의식을 탐구하며",
          weight: 3,
        },
        {
          id: "e",
          style: "pop-culture-vibrant" as ArtStyle,
          text: "팝 컬처의 영향을 받아 모든 사람에게 접근 가능하게",
          weight: 3,
        },
        {
          id: "f",
          style: "nature-impressionist" as ArtStyle,
          text: "관찰을 바탕으로, 자연의 아름다움을 포착하려 하며",
          weight: 3,
        },
      ],
      scenario: "예술 창작에 대한 당신의 접근법은 보통:",
    },
    {
      id: "5",
      options: [
        {
          id: "a",
          style: "abstract-expressionist" as ArtStyle,
          text: "날것 그대로의 인간의 감정과 경험을 표현하는 작품",
          weight: 3,
        },
        {
          id: "b",
          style: "classical-realist" as ArtStyle,
          text: "숙련된 기법과 영원한 아름다움을 보여주는 작품",
          weight: 3,
        },
        {
          id: "c",
          style: "modern-minimalist" as ArtStyle,
          text: "당신이 다르게 생각하고 보도록 도전하는 예술",
          weight: 3,
        },
        {
          id: "d",
          style: "surreal-dreamer" as ArtStyle,
          text: "상상력과 꿈을 열어주는 신비로운 작품",
          weight: 3,
        },
        {
          id: "e",
          style: "pop-culture-vibrant" as ArtStyle,
          text: "현대 생활을 반영하고 축하하는 예술",
          weight: 3,
        },
        {
          id: "f",
          style: "nature-impressionist" as ArtStyle,
          text: "자연 세계의 아름다운 묘사",
          weight: 3,
        },
      ],
      scenario: "당신을 가장 깊이 감동시키는 예술은:",
    },
    {
      id: "6",
      options: [
        {
          id: "a",
          style: "abstract-expressionist" as ArtStyle,
          text: "강력한 붓놀림의 대형 추상화",
          weight: 2,
        },
        {
          id: "b",
          style: "classical-realist" as ArtStyle,
          text: "완벽한 비율의 고전 초상화나 조각",
          weight: 2,
        },
        {
          id: "c",
          style: "modern-minimalist" as ArtStyle,
          text: "공간을 변화시키는 미니멀한 설치 작품",
          weight: 2,
        },
        {
          id: "d",
          style: "surreal-dreamer" as ArtStyle,
          text: "현실을 의문시하게 만드는 초현실적 작품",
          weight: 2,
        },
        {
          id: "e",
          style: "pop-culture-vibrant" as ArtStyle,
          text: "강한 메시지를 전하는 활기찬 팝아트 작품",
          weight: 2,
        },
        {
          id: "f",
          style: "nature-impressionist" as ArtStyle,
          text: "집에 평화를 가져다주는 아름다운 풍경화",
          weight: 2,
        },
      ],
      scenario: "한 가지 유형의 예술 작품을 소유할 수 있다면:",
    },
    {
      id: "7",
      options: [
        {
          id: "a",
          style: "abstract-expressionist" as ArtStyle,
          text: "내면의 감정과 개인적 경험",
          weight: 3,
        },
        {
          id: "b",
          style: "classical-realist" as ArtStyle,
          text: "고전적 아름다움과 완벽함의 이상",
          weight: 3,
        },
        {
          id: "c",
          style: "modern-minimalist" as ArtStyle,
          text: "철학적 개념과 순수한 형태",
          weight: 3,
        },
        {
          id: "d",
          style: "surreal-dreamer" as ArtStyle,
          text: "꿈, 신화, 그리고 마음의 신비",
          weight: 3,
        },
        {
          id: "e",
          style: "pop-culture-vibrant" as ArtStyle,
          text: "팝 컬처, 미디어, 그리고 사회적 논평",
          weight: 3,
        },
        {
          id: "f",
          style: "nature-impressionist" as ArtStyle,
          text: "자연 세계의 아름다움과 리듬",
          weight: 3,
        },
      ],
      scenario: "창의성을 표현할 때, 당신이 가장 영감을 받는 것은:",
    },
    {
      id: "8",
      options: [
        {
          id: "a",
          style: "abstract-expressionist" as ArtStyle,
          text: "표현 기법과 예술을 통한 감정 해소",
          weight: 2,
        },
        {
          id: "b",
          style: "classical-realist" as ArtStyle,
          text: "전통적인 드로잉과 회화의 기초",
          weight: 2,
        },
        {
          id: "c",
          style: "modern-minimalist" as ArtStyle,
          text: "개념 미술과 설치 기법",
          weight: 2,
        },
        {
          id: "d",
          style: "surreal-dreamer" as ArtStyle,
          text: "초현실주의 방법과 꿈 해석",
          weight: 2,
        },
        {
          id: "e",
          style: "pop-culture-vibrant" as ArtStyle,
          text: "팝아트 기법과 현대 미디어",
          weight: 2,
        },
        {
          id: "f",
          style: "nature-impressionist" as ArtStyle,
          text: "야외 회화와 자연 관찰",
          weight: 2,
        },
      ],
      scenario:
        "당신의 이상적인 미술 워크샵이나 수업은 다음에 집중할 것입니다:",
    },
  ],
};

export const getArtStyleQuestions = (
  locale: Locale = "en",
): ArtStyleQuestion[] => {
  return ART_STYLE_QUESTIONS[locale];
};
