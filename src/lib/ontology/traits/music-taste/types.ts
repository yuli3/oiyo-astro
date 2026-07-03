export interface MusicTasteQuestion {
  id: number;
  options: Array<{
    emoji: string;
    genre: string;
    scores: Record<MusicTasteType, number>;
    text: string;
  }>;
  text: string;
}

export interface MusicTasteResult {
  artistSuggestions: string[];
  concertStyle: string;
  description: string;
  emoji: string;
  listeningHabits: string[];
  moodBooster: string;
  name: string;
  personalityTraits: string[];
  preferredGenres: string[];
  socialStyle: string;
  traits: string[];
  type: MusicTasteType;
}

export interface MusicTasteScores {
  contemporary: number;
  explorer: number;
  intense: number;
  mainstream: number;
  traditionalist: number;
}

export type MusicTasteType =
  | "contemporary"
  | "explorer"
  | "intense"
  | "mainstream"
  | "traditionalist";

const MUSIC_TASTE_LABELS_EN = {
  contemporary: "The Contemporary Curator",
  explorer: "The Musical Explorer",
  intense: "The Intense Devotee",
  mainstream: "The Mainstream Enthusiast",
  traditionalist: "The Musical Traditionalist",
};

export const MUSIC_TASTE_LABELS: Record<string, typeof MUSIC_TASTE_LABELS_EN> =
  {
    zh: MUSIC_TASTE_LABELS_EN,
    en: MUSIC_TASTE_LABELS_EN,
    es: MUSIC_TASTE_LABELS_EN,
    fr: MUSIC_TASTE_LABELS_EN,
    ja: MUSIC_TASTE_LABELS_EN,
    ko: {
      contemporary: "컨템포러리 큐레이터",
      explorer: "음악 탐험가",
      intense: "열정적 음악 신봉자",
      mainstream: "대중 음악 애호가",
      traditionalist: "음악 전통주의자",
    },
  };

export const MUSIC_TASTE_EMOJIS: Record<MusicTasteType, string> = {
  contemporary: "🎯",
  explorer: "🧭",
  intense: "🔥",
  mainstream: "🎤",
  traditionalist: "🎼",
};

const MUSIC_TASTE_DESCRIPTIONS_EN = {
  contemporary:
    "You have your finger on the pulse of what's happening right now in music. You love being early to new trends, discovering emerging artists, and staying connected to the current cultural zeitgeist through sound. Your taste evolves with the times while maintaining a keen sense for quality.",
  explorer:
    "You are a fearless musical adventurer who thrives on discovering new sounds, genres, and artists from around the world. Your taste is eclectic and always evolving, and you love being the person who introduces others to amazing music they've never heard before.",
  intense:
    "Music is not just entertainment for you - it's a vital emotional outlet and a core part of your ontology. You connect deeply with artists and genres that express raw emotion and authentic experiences, and you're drawn to music scenes with passionate, devoted communities.",
  mainstream:
    "You love music that connects people and brings joy to everyday life. You're not afraid to enjoy what's popular because you understand that popular music becomes popular for good reasons - it's catchy, relatable, and makes people feel good.",
  traditionalist:
    "You appreciate the timeless beauty of musical classics and have a deep respect for musical history and craftsmanship. Quality over quantity is your motto, and you believe the best music has already been made and deserves to be preserved and celebrated.",
};

export const MUSIC_TASTE_DESCRIPTIONS: Record<
  string,
  typeof MUSIC_TASTE_DESCRIPTIONS_EN
> = {
  zh: MUSIC_TASTE_DESCRIPTIONS_EN,
  en: MUSIC_TASTE_DESCRIPTIONS_EN,
  es: MUSIC_TASTE_DESCRIPTIONS_EN,
  fr: MUSIC_TASTE_DESCRIPTIONS_EN,
  ja: MUSIC_TASTE_DESCRIPTIONS_EN,
  ko: {
    contemporary:
      "당신은 지금 음악에서 일어나고 있는 일에 대한 촉각을 가지고 있습니다. 새로운 트렌드에 일찍 참여하고, 신흥 아티스트를 발견하며, 사운드를 통해 현재의 문화적 시대정신과 연결되어 있는 것을 좋아합니다. 당신의 취향은 시대와 함께 진화하면서도 품질에 대한 예리한 감각을 유지합니다.",
    explorer:
      "당신은 전 세계의 새로운 사운드, 장르, 아티스트를 발견하는 것을 즐기는 두려움 없는 음악 모험가입니다. 당신의 취향은 절충적이고 항상 진화하며, 다른 사람들에게 들어보지 못한 놀라운 음악을 소개해주는 사람이 되는 것을 좋아합니다.",
    intense:
      "음악은 당신에게 단순한 오락이 아닙니다 - 그것은 중요한 감정적 배출구이자 당신의 정체성의 핵심 부분입니다. 당신은 원초적인 감정과 진정한 경험을 표현하는 아티스트와 장르와 깊이 연결되며, 열정적이고 헌신적인 커뮤니티를 가진 음악 장면에 끌립니다.",
    mainstream:
      "당신은 사람들을 연결하고 일상에 기쁨을 가져다주는 음악을 사랑합니다. 인기 있는 것을 즐기는 것을 두려워하지 않는데, 인기 음악이 인기 있는 이유가 있다는 것을 이해하기 때문입니다 - 그것은 중독성 있고, 공감할 수 있고, 사람들을 기분 좋게 만듭니다.",
    traditionalist:
      "당신은 음악 클래식의 시대를 초월한 아름다움을 감상하고 음악 역사와 장인정신에 대한 깊은 존경을 가지고 있습니다. 양보다 질이 당신의 좌우명이며, 최고의 음악은 이미 만들어졌고 보존되고 기념되어야 한다고 믿습니다.",
  },
};

const MUSIC_TASTE_TRAITS_EN = {
  contemporary: [
    "Trend-aware and forward-thinking",
    "Values innovation and freshness",
    "Culturally connected",
    "Quality-conscious about new music",
    "Early adopter of emerging artists",
  ],
  explorer: [
    "Curious and open-minded",
    "Values musical diversity",
    "Enjoys discovering hidden gems",
    "Appreciates artistic innovation",
    "Often ahead of musical trends",
  ],
  intense: [
    "Emotionally driven",
    "Values authenticity and passion",
    "Deep connection to music communities",
    "Appreciates raw and honest expression",
    "Music as personal ontology",
  ],
  mainstream: [
    "Socially connected through music",
    "Enjoys shared musical experiences",
    "Values accessibility and relatability",
    "Optimistic and uplifting",
    "Comfortable with current trends",
  ],
  traditionalist: [
    "Values musical heritage",
    "Appreciates superior audio quality",
    "Respects musical craftsmanship",
    "Prefers depth over breadth",
    "Knowledgeable about music history",
  ],
};

export const MUSIC_TASTE_TRAITS: Record<string, typeof MUSIC_TASTE_TRAITS_EN> =
  {
    zh: MUSIC_TASTE_TRAITS_EN,
    en: MUSIC_TASTE_TRAITS_EN,
    es: MUSIC_TASTE_TRAITS_EN,
    fr: MUSIC_TASTE_TRAITS_EN,
    ja: MUSIC_TASTE_TRAITS_EN,
    ko: {
      contemporary: [
        "트렌드에 민감하고 미래 지향적",
        "혁신과 신선함을 중시",
        "문화적으로 연결됨",
        "새로운 음악에 대한 품질 의식",
        "신흥 아티스트의 얼리 어답터",
      ],
      explorer: [
        "호기심이 많고 열린 마음",
        "음악적 다양성을 중시",
        "숨겨진 보석 발견을 즐김",
        "예술적 혁신을 감상",
        "종종 음악 트렌드를 앞서감",
      ],
      intense: [
        "감정적으로 움직임",
        "진정성과 열정을 중시",
        "음악 커뮤니티와 깊은 연결",
        "날것 그대로의 정직한 표현을 감상",
        "음악이 개인적 정체성",
      ],
      mainstream: [
        "음악을 통해 사회적으로 연결됨",
        "공유된 음악 경험을 즐김",
        "접근성과 친근함을 중시",
        "긍정적이고 기운을 북돋움",
        "현재 트렌드에 편안함",
      ],
      traditionalist: [
        "음악적 유산을 중시",
        "뛰어난 오디오 품질을 감상",
        "음악적 장인정신을 존경",
        "폭보다 깊이를 선호",
        "음악 역사에 대한 지식이 풍부",
      ],
    },
  };

const MUSIC_TASTE_PREFERRED_GENRES_EN = {
  contemporary: [
    "Contemporary Pop",
    "New Wave Electronic",
    "Modern R&B",
    "Current Hip-Hop",
    "Indie Pop",
    "Alternative Hip-Hop",
    "Future genres",
  ],
  explorer: [
    "World Music",
    "Experimental",
    "Art Rock",
    "Ambient",
    "Folk from different cultures",
    "Progressive genres",
    "Fusion styles",
  ],
  intense: [
    "Alternative Rock",
    "Indie",
    "Punk",
    "Metal",
    "Emo/Post-Hardcore",
    "Underground Hip-Hop",
    "Grunge",
  ],
  mainstream: [
    "Pop",
    "Top 40",
    "Contemporary R&B",
    "Mainstream Hip-Hop",
    "Pop Rock",
    "Dance/EDM",
    "Contemporary Country",
  ],
  traditionalist: [
    "Classic Rock",
    "Jazz",
    "Blues",
    "Classical",
    "Folk",
    "Soul",
    "Country (traditional)",
  ],
};

export const MUSIC_TASTE_PREFERRED_GENRES: Record<
  string,
  typeof MUSIC_TASTE_PREFERRED_GENRES_EN
> = {
  zh: MUSIC_TASTE_PREFERRED_GENRES_EN,
  en: MUSIC_TASTE_PREFERRED_GENRES_EN,
  es: MUSIC_TASTE_PREFERRED_GENRES_EN,
  fr: MUSIC_TASTE_PREFERRED_GENRES_EN,
  ja: MUSIC_TASTE_PREFERRED_GENRES_EN,
  ko: {
    contemporary: [
      "컨템포러리 팝",
      "뉴웨이브 일렉트로닉",
      "모던 R&B",
      "현재의 힙합",
      "인디 팝",
      "얼터너티브 힙합",
      "미래 장르",
    ],
    explorer: [
      "월드 뮤직",
      "실험 음악",
      "아트 록",
      "앰비언트",
      "다양한 문화의 포크",
      "프로그레시브 장르",
      "퓨전 스타일",
    ],
    intense: [
      "얼터너티브 록",
      "인디",
      "펑크",
      "메탈",
      "이모/포스트-하드코어",
      "언더그라운드 힙합",
      "그런지",
    ],
    mainstream: [
      "팝",
      "톱 40",
      "컨템포러리 R&B",
      "주류 힙합",
      "팝 록",
      "댄스/EDM",
      "컨템포러리 컨트리",
    ],
    traditionalist: [
      "클래식 록",
      "재즈",
      "블루스",
      "클래식",
      "포크",
      "소울",
      "컨트리 (전통)",
    ],
  },
};

const MUSIC_TASTE_ARTIST_SUGGESTIONS_EN = {
  contemporary: [
    "Frank Ocean",
    "Tyler, The Creator",
    "Phoebe Bridgers",
    "Bad Bunny",
    "Clairo",
    "BROCKHAMPTON",
    "SZA",
  ],
  explorer: [
    "Radiohead",
    "Björk",
    "Tinariwen",
    "Brian Eno",
    "Godspeed You! Black Emperor",
    "Anoushka Shankar",
    "Thom Yorke",
  ],
  intense: [
    "Nirvana",
    "The National",
    "Fugazi",
    "Kendrick Lamar",
    "My Chemical Romance",
    "Arctic Monkeys",
    "Death Cab for Cutie",
  ],
  mainstream: [
    "Taylor Swift",
    "Bruno Mars",
    "Ariana Grande",
    "Ed Sheeran",
    "Billie Eilish",
    "The Weeknd",
    "Dua Lipa",
  ],
  traditionalist: [
    "The Beatles",
    "Miles Davis",
    "Bob Dylan",
    "Aretha Franklin",
    "Johnny Cash",
    "Ella Fitzgerald",
    "Neil Young",
  ],
};

export const MUSIC_TASTE_ARTIST_SUGGESTIONS: Record<
  string,
  typeof MUSIC_TASTE_ARTIST_SUGGESTIONS_EN
> = {
  zh: MUSIC_TASTE_ARTIST_SUGGESTIONS_EN,
  en: MUSIC_TASTE_ARTIST_SUGGESTIONS_EN,
  es: MUSIC_TASTE_ARTIST_SUGGESTIONS_EN,
  fr: MUSIC_TASTE_ARTIST_SUGGESTIONS_EN,
  ja: MUSIC_TASTE_ARTIST_SUGGESTIONS_EN,
  ko: {
    contemporary: [
      "프랭크 오션",
      "타일러, 더 크리에이터",
      "피비 브리저스",
      "배드 버니",
      "클레어로",
      "브록햄톤",
      "SZA",
    ],
    explorer: [
      "라디오헤드",
      "비욕",
      "티나리웬",
      "브라이언 이노",
      "갓스피드 유! 블랙 엠페러",
      "아누시카 샨카르",
      "톰 요크",
    ],
    intense: [
      "너바나",
      "더 내셔널",
      "후가지",
      "켄드릭 라마",
      "마이 케미컬 로맨스",
      "아틱 몽키즈",
      "데스 캡 포 큐티",
    ],
    mainstream: [
      "테일러 스위프트",
      "브루노 마스",
      "아리아나 그란데",
      "에드 시런",
      "빌리 아일리시",
      "더 위켄드",
      "두아 리파",
    ],
    traditionalist: [
      "비틀즈",
      "마일즈 데이비스",
      "밥 딜런",
      "아레사 프랭클린",
      "조니 캐시",
      "엘라 피츠제럴드",
      "닐 영",
    ],
  },
};

const MUSIC_TASTE_PERSONALITY_TRAITS_EN = {
  contemporary: [
    "Culturally aware and engaged",
    "Good at spotting emerging talent",
    "Values both innovation and quality",
    "Socially connected",
    "Comfortable with change",
  ],
  explorer: [
    "Creative and imaginative",
    "Values authenticity over popularity",
    "Intellectually curious",
    "Comfortable with complexity",
    "Enjoys sharing discoveries with others",
  ],
  intense: [
    "Passionate and committed",
    "Values emotional authenticity",
    "Forms deep connections",
    "Unafraid of intensity",
    "Loyal to favorite artists",
  ],
  mainstream: [
    "Socially aware and connected",
    "Values shared cultural experiences",
    "Optimistic and positive",
    "Good at reading social dynamics",
    "Enjoys being part of cultural moments",
  ],
  traditionalist: [
    "Values substance and authenticity",
    "Appreciates skilled musicianship",
    "Has a strong sense of musical ontology",
    "Prefers proven excellence",
    "Enjoys sharing musical knowledge",
  ],
};

export const MUSIC_TASTE_PERSONALITY_TRAITS: Record<
  string,
  typeof MUSIC_TASTE_PERSONALITY_TRAITS_EN
> = {
  zh: MUSIC_TASTE_PERSONALITY_TRAITS_EN,
  en: MUSIC_TASTE_PERSONALITY_TRAITS_EN,
  es: MUSIC_TASTE_PERSONALITY_TRAITS_EN,
  fr: MUSIC_TASTE_PERSONALITY_TRAITS_EN,
  ja: MUSIC_TASTE_PERSONALITY_TRAITS_EN,
  ko: {
    contemporary: [
      "문화적으로 인식하고 참여",
      "신흥 재능 발견에 능함",
      "혁신과 품질 모두를 중시",
      "사회적으로 연결됨",
      "변화에 편안함",
    ],
    explorer: [
      "창의적이고 상상력 풍부",
      "인기보다 진정성을 중시",
      "지적 호기심",
      "복잡성에 편안함",
      "다른 사람들과 발견을 공유하는 것을 즐김",
    ],
    intense: [
      "열정적이고 헌신적",
      "감정적 진정성을 중시",
      "깊은 연결을 형성",
      "강도를 두려워하지 않음",
      "좋아하는 아티스트에 충성",
    ],
    mainstream: [
      "사회적으로 인식하고 연결됨",
      "공유된 문화적 경험을 중시",
      "낙관적이고 긍정적",
      "사회적 역학을 잘 읽음",
      "문화적 순간의 일부가 되는 것을 즐김",
    ],
    traditionalist: [
      "실질과 진정성을 중시",
      "숙련된 음악성을 감상",
      "강한 음악적 정체성을 가짐",
      "입증된 우수성을 선호",
      "음악적 지식을 공유하는 것을 즐김",
    ],
  },
};

const MUSIC_TASTE_LISTENING_HABITS_EN = {
  contemporary: [
    "Follows music blogs and publications",
    "Uses discovery algorithms effectively",
    "Attends emerging artist showcases",
    "Shares new discoveries on social media",
    "Creates trend-aware playlists",
  ],
  explorer: [
    "Deep album listening sessions",
    "Explores artist discographies thoroughly",
    "Reads about music history and context",
    "Seeks out live performances",
    "Uses multiple discovery methods",
  ],
  intense: [
    "High-volume, immersive listening",
    "Follows artists' entire careers",
    "Attends multiple shows per artist",
    "Engages with music communities online",
    "Analyzes lyrics and meanings deeply",
  ],
  mainstream: [
    "Uses streaming platforms actively",
    "Creates playlists for different moods",
    "Follows music charts and trends",
    "Listens while multitasking",
    "Shares music on social media",
  ],
  traditionalist: [
    "Owns physical music collection",
    "Listens to complete albums",
    "Invests in quality audio equipment",
    "Reads liner notes and music history",
    "Attends concerts at historic venues",
  ],
};

export const MUSIC_TASTE_LISTENING_HABITS: Record<
  string,
  typeof MUSIC_TASTE_LISTENING_HABITS_EN
> = {
  zh: MUSIC_TASTE_LISTENING_HABITS_EN,
  en: MUSIC_TASTE_LISTENING_HABITS_EN,
  es: MUSIC_TASTE_LISTENING_HABITS_EN,
  fr: MUSIC_TASTE_LISTENING_HABITS_EN,
  ja: MUSIC_TASTE_LISTENING_HABITS_EN,
  ko: {
    contemporary: [
      "음악 블로그와 출판물을 팔로우",
      "발견 알고리즘을 효과적으로 사용",
      "신흥 아티스트 쇼케이스에 참석",
      "소셜 미디어에서 새로운 발견을 공유",
      "트렌드를 인식한 플레이리스트 생성",
    ],
    explorer: [
      "깊은 앨범 듣기 세션",
      "아티스트의 디스코그래피를 철저히 탐색",
      "음악 역사와 맥락에 대해 읽음",
      "라이브 공연을 찾아감",
      "여러 발견 방법을 사용",
    ],
    intense: [
      "고볼륨, 몰입적 듣기",
      "아티스트의 전체 경력을 팔로우",
      "아티스트 당 여러 쇼에 참석",
      "온라인 음악 커뮤니티에 참여",
      "가사와 의미를 깊이 분석",
    ],
    mainstream: [
      "스트리밍 플랫폼을 적극적으로 사용",
      "다양한 기분에 맞는 플레이리스트 생성",
      "음악 차트와 트렌드를 팔로우",
      "멀티태스킹하면서 들음",
      "소셜 미디어에서 음악을 공유",
    ],
    traditionalist: [
      "물리적 음악 컬렉션을 소유",
      "완전한 앨범을 들음",
      "고품질 오디오 장비에 투자",
      "라이너 노트와 음악 역사를 읽음",
      "역사적인 장소에서 콘서트에 참석",
    ],
  },
};

const MUSIC_TASTE_CONCERT_STYLES_EN = {
  contemporary:
    "Mid-size venues where you can discover the next big thing before everyone else",
  explorer: "Small venues with unique acoustics and intimate atmospheres",
  intense:
    "Intimate clubs where you can feel the energy and connect with the artist",
  mainstream: "Large venues with spectacular production and crowd energy",
  traditionalist:
    "Historic venues with excellent acoustics and musical significance",
};

export const MUSIC_TASTE_CONCERT_STYLES: Record<
  string,
  typeof MUSIC_TASTE_CONCERT_STYLES_EN
> = {
  zh: MUSIC_TASTE_CONCERT_STYLES_EN,
  en: MUSIC_TASTE_CONCERT_STYLES_EN,
  es: MUSIC_TASTE_CONCERT_STYLES_EN,
  fr: MUSIC_TASTE_CONCERT_STYLES_EN,
  ja: MUSIC_TASTE_CONCERT_STYLES_EN,
  ko: {
    contemporary:
      "다른 사람들보다 먼저 차세대 스타를 발견할 수 있는 중간 규모 공연장",
    explorer: "독특한 음향과 친밀한 분위기를 가진 소규모 공연장",
    intense: "에너지를 느끼고 아티스트와 연결될 수 있는 친밀한 클럽",
    mainstream: "화려한 프로덕션과 관중 에너지를 가진 대형 공연장",
    traditionalist: "뛰어난 음향과 음악적 의미를 가진 역사적인 공연장",
  },
};

const MUSIC_TASTE_SOCIAL_STYLES_EN = {
  contemporary:
    "The trendsetter who introduces friends to tomorrow's favorites today",
  explorer: "The curator who creates adventurous playlists for friends",
  intense: "The passionate advocate who evangelizes for their favorite artists",
  mainstream: "The playlist curator who keeps everyone's favorite songs ready",
  traditionalist: "The musical mentor who shares wisdom about musical legends",
};

export const MUSIC_TASTE_SOCIAL_STYLES: Record<
  string,
  typeof MUSIC_TASTE_SOCIAL_STYLES_EN
> = {
  zh: MUSIC_TASTE_SOCIAL_STYLES_EN,
  en: MUSIC_TASTE_SOCIAL_STYLES_EN,
  es: MUSIC_TASTE_SOCIAL_STYLES_EN,
  fr: MUSIC_TASTE_SOCIAL_STYLES_EN,
  ja: MUSIC_TASTE_SOCIAL_STYLES_EN,
  ko: {
    contemporary: "오늘 친구들에게 내일의 인기곡을 소개하는 트렌드세터",
    explorer: "친구들을 위해 모험적인 플레이리스트를 만드는 큐레이터",
    intense: "자신이 좋아하는 아티스트를 열정적으로 전도하는 옹호자",
    mainstream: "모든 사람이 좋아하는 노래를 준비해두는 플레이리스트 큐레이터",
    traditionalist: "음악 전설에 대한 지혜를 나누는 음악적 멘토",
  },
};

const MUSIC_TASTE_MOOD_BOOSTERS_EN = {
  contemporary:
    "Finding a new artist who's about to blow up and knowing you discovered them first",
  explorer:
    "A newly discovered artist that perfectly captures your current emotions",
  intense: "A song that perfectly expresses exactly what you're feeling",
  mainstream: "That perfect sing-along song that everyone knows and loves",
  traditionalist: "A perfectly mastered classic album on high-quality speakers",
};

export const MUSIC_TASTE_MOOD_BOOSTERS: Record<
  string,
  typeof MUSIC_TASTE_MOOD_BOOSTERS_EN
> = {
  zh: MUSIC_TASTE_MOOD_BOOSTERS_EN,
  en: MUSIC_TASTE_MOOD_BOOSTERS_EN,
  es: MUSIC_TASTE_MOOD_BOOSTERS_EN,
  fr: MUSIC_TASTE_MOOD_BOOSTERS_EN,
  ja: MUSIC_TASTE_MOOD_BOOSTERS_EN,
  ko: {
    contemporary:
      "곧 떠오를 새로운 아티스트를 발견하고 당신이 먼저 발견했다는 것을 아는 것",
    explorer: "현재 감정을 완벽하게 포착하는 새로 발견한 아티스트",
    intense: "당신이 느끼는 것을 정확히 표현하는 노래",
    mainstream: "모든 사람이 알고 사랑하는 완벽한 따라 부를 수 있는 노래",
    traditionalist: "고품질 스피커로 듣는 완벽하게 마스터된 클래식 앨범",
  },
};
