/* eslint-disable no-restricted-syntax */
import type { Locale } from "@/i18n";

import {
  COLOR_PERSONALITY_DESCRIPTIONS,
  COLOR_PERSONALITY_LABELS,
  type ColorPersonalityQuestion,
  type ColorPersonalityResult,
} from "./types";

export const colorPersonalityQuestions = {
  zh: [
    {
      id: 1,
      options: [
        {
          color: "#EF4444",
          emoji: "🔥",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "大胆、戏剧化且彰显个性的颜色",
        },
        {
          color: "#3B82F6",
          emoji: "🌊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "冷静、精致的蓝色和中性色",
        },
        {
          color: "#10B981",
          emoji: "🌿",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "自然、质朴的绿色和棕色",
        },
        {
          color: "#F59E0B",
          emoji: "☀️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "明亮、愉快的黄色和橙色",
        },
      ],
      text: "选择家居装饰时，您更喜欢：",
    },
    {
      id: 2,
      options: [
        {
          color: "#EF4444",
          emoji: "🏂",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "冒险运动和刺激的活动",
        },
        {
          color: "#3B82F6",
          emoji: "🏛️",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "博物馆、文化和智力体验",
        },
        {
          color: "#10B981",
          emoji: "🏔️",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "自然、宁静和和平的环境",
        },
        {
          color: "#F59E0B",
          emoji: "🎪",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "节日、社交活动和热闹的气氛",
        },
      ],
      text: "您理想的度假目的地会有：",
    },
    {
      id: 3,
      options: [
        {
          color: "#EF4444",
          emoji: "💪",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "立即采取行动并正面解决",
        },
        {
          color: "#3B82F6",
          emoji: "🧠",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "在决定之前仔细分析所有选项",
        },
        {
          color: "#10B981",
          emoji: "🤝",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "寻求和谐并考虑每个人的感受",
        },
        {
          color: "#F59E0B",
          emoji: "💡",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "保持乐观并寻找创意解决方案",
        },
      ],
      text: "面对挑战性局面时，您：",
    },
    {
      id: 4,
      options: [
        {
          color: "#EF4444",
          emoji: "👔",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "力量与自信 - 大胆、结构化的单品",
        },
        {
          color: "#3B82F6",
          emoji: "👗",
          scores: { blue: 3, green: 0, red: 0, yellow: 1 },
          text: "优雅与精致 - 经典且永恒",
        },
        {
          color: "#10B981",
          emoji: "👕",
          scores: { blue: 0, green: 3, red: 0, yellow: 1 },
          text: "舒适与实用 - 自然、放松",
        },
        {
          color: "#F59E0B",
          emoji: "🌈",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "趣味与创意 - 多彩、独特的单品",
        },
      ],
      text: "您的着装风格反映了：",
    },
    {
      id: 5,
      options: [
        {
          color: "#EF4444",
          emoji: "🎯",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "节奏快、有竞争性、结果导向",
        },
        {
          color: "#3B82F6",
          emoji: "📊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "有条理、安静、注重细节",
        },
        {
          color: "#10B981",
          emoji: "👥",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "协作、支持、以团队为中心",
        },
        {
          color: "#F59E0B",
          emoji: "🎨",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "创意、灵活、鼓励创新",
        },
      ],
      text: "在工作环境中，您更喜欢：",
    },
    {
      id: 6,
      options: [
        {
          color: "#EF4444",
          emoji: "🖼️",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "具有强烈对比的大胆抽象作品",
        },
        {
          color: "#3B82F6",
          emoji: "🏺",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "构图完美的经典、精致作品",
        },
        {
          color: "#10B981",
          emoji: "🌸",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "灵感来自自然的宁静风景画",
        },
        {
          color: "#F59E0B",
          emoji: "🎭",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "充满活力、趣味且有表现力的现代艺术",
        },
      ],
      text: "您最喜欢的艺术或设计类型是：",
    },
    {
      id: 7,
      options: [
        {
          color: "#EF4444",
          emoji: "🏃",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "高能量活动或竞技游戏",
        },
        {
          color: "#3B82F6",
          emoji: "📚",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "阅读、拼图或智力追求",
        },
        {
          color: "#10B981",
          emoji: "🧘",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "自然中的安静时光或冥想",
        },
        {
          color: "#F59E0B",
          emoji: "🎉",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "社交聚会和款待他人",
        },
      ],
      text: "放松时，您喜欢：",
    },
    {
      id: 8,
      options: [
        {
          color: "#EF4444",
          emoji: "📢",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "直接、坦率且切中要害",
        },
        {
          color: "#3B82F6",
          emoji: "📝",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "深思熟虑、精确且条理清晰",
        },
        {
          color: "#10B981",
          emoji: "💬",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "温和、富有同理心且体贴",
        },
        {
          color: "#F59E0B",
          emoji: "🗣️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "热情、有表现力且绘声绘色",
        },
      ],
      text: "您的沟通风格通常是：",
    },
  ] as ColorPersonalityQuestion[],
  en: [
    {
      id: 1,
      options: [
        {
          color: "#EF4444",
          emoji: "🔥",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Bold, dramatic colors that make a statement",
        },
        {
          color: "#3B82F6",
          emoji: "🌊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Calm, sophisticated blues and neutrals",
        },
        {
          color: "#10B981",
          emoji: "🌿",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Natural, earthy greens and browns",
        },
        {
          color: "#F59E0B",
          emoji: "☀️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Bright, cheerful yellows and oranges",
        },
      ],
      text: "When choosing home decor, you prefer:",
    },
    {
      id: 2,
      options: [
        {
          color: "#EF4444",
          emoji: "🏂",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "Adventure sports and exciting activities",
        },
        {
          color: "#3B82F6",
          emoji: "🏛️",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Museums, culture, and intellectual experiences",
        },
        {
          color: "#10B981",
          emoji: "🏔️",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Nature, tranquility, and peaceful surroundings",
        },
        {
          color: "#F59E0B",
          emoji: "🎪",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Festivals, social events, and lively atmosphere",
        },
      ],
      text: "Your ideal vacation destination would have:",
    },
    {
      id: 3,
      options: [
        {
          color: "#EF4444",
          emoji: "💪",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Take immediate action and tackle it head-on",
        },
        {
          color: "#3B82F6",
          emoji: "🧠",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Analyze all options carefully before deciding",
        },
        {
          color: "#10B981",
          emoji: "🤝",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Seek harmony and consider everyone's feelings",
        },
        {
          color: "#F59E0B",
          emoji: "💡",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Stay optimistic and find creative solutions",
        },
      ],
      text: "When facing a challenging situation, you:",
    },
    {
      id: 4,
      options: [
        {
          color: "#EF4444",
          emoji: "👔",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "Power and confidence - bold, structured pieces",
        },
        {
          color: "#3B82F6",
          emoji: "👗",
          scores: { blue: 3, green: 0, red: 0, yellow: 1 },
          text: "Elegance and sophistication - classic, timeless",
        },
        {
          color: "#10B981",
          emoji: "👕",
          scores: { blue: 0, green: 3, red: 0, yellow: 1 },
          text: "Comfort and practicality - natural, relaxed",
        },
        {
          color: "#F59E0B",
          emoji: "🌈",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Fun and creativity - colorful, unique pieces",
        },
      ],
      text: "Your clothing style reflects:",
    },
    {
      id: 5,
      options: [
        {
          color: "#EF4444",
          emoji: "🎯",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Fast-paced, competitive, results-driven",
        },
        {
          color: "#3B82F6",
          emoji: "📊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Organized, quiet, detail-oriented",
        },
        {
          color: "#10B981",
          emoji: "👥",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Collaborative, supportive, team-focused",
        },
        {
          color: "#F59E0B",
          emoji: "🎨",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Creative, flexible, innovation-friendly",
        },
      ],
      text: "In your work environment, you prefer:",
    },
    {
      id: 6,
      options: [
        {
          color: "#EF4444",
          emoji: "🖼️",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Bold abstract pieces with strong contrasts",
        },
        {
          color: "#3B82F6",
          emoji: "🏺",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Classical, refined pieces with perfect composition",
        },
        {
          color: "#10B981",
          emoji: "🌸",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Nature-inspired, peaceful landscapes",
        },
        {
          color: "#F59E0B",
          emoji: "🎭",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Vibrant, playful, and expressive modern art",
        },
      ],
      text: "Your favorite type of art or design is:",
    },
    {
      id: 7,
      options: [
        {
          color: "#EF4444",
          emoji: "🏃",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "High-energy activities or competitive games",
        },
        {
          color: "#3B82F6",
          emoji: "📚",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Reading, puzzles, or intellectual pursuits",
        },
        {
          color: "#10B981",
          emoji: "🧘",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Quiet time in nature or meditation",
        },
        {
          color: "#F59E0B",
          emoji: "🎉",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Social gatherings and entertaining others",
        },
      ],
      text: "When relaxing, you enjoy:",
    },
    {
      id: 8,
      options: [
        {
          color: "#EF4444",
          emoji: "📢",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "Direct, assertive, and to the point",
        },
        {
          color: "#3B82F6",
          emoji: "📝",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Thoughtful, precise, and well-structured",
        },
        {
          color: "#10B981",
          emoji: "💬",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Gentle, empathetic, and considerate",
        },
        {
          color: "#F59E0B",
          emoji: "🗣️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Enthusiastic, expressive, and animated",
        },
      ],
      text: "Your communication style is typically:",
    },
  ] as ColorPersonalityQuestion[],
  es: [
    {
      id: 1,
      options: [
        {
          color: "#EF4444",
          emoji: "🔥",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Colores audaces y dramáticos que llamen la atención",
        },
        {
          color: "#3B82F6",
          emoji: "🌊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Azules tranquilos y sofisticados y neutros",
        },
        {
          color: "#10B981",
          emoji: "🌿",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Verdes y marrones naturales y terrosos",
        },
        {
          color: "#F59E0B",
          emoji: "☀️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Amarillos y naranjas brillantes y alegres",
        },
      ],
      text: "Al elegir la decoración para el hogar, prefieres:",
    },
    {
      id: 2,
      options: [
        {
          color: "#EF4444",
          emoji: "🏂",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "Deportes de aventura y actividades emocionantes",
        },
        {
          color: "#3B82F6",
          emoji: "🏛️",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Museos, cultura y experiencias intelectuales",
        },
        {
          color: "#10B981",
          emoji: "🏔️",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Naturaleza, tranquilidad y entornos pacíficos",
        },
        {
          color: "#F59E0B",
          emoji: "🎪",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Festivales, eventos sociales y ambiente animado",
        },
      ],
      text: "Tu destino de vacaciones ideal tendría:",
    },
    {
      id: 3,
      options: [
        {
          color: "#EF4444",
          emoji: "💪",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Tomas medidas inmediatas y lo abordas de frente",
        },
        {
          color: "#3B82F6",
          emoji: "🧠",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Analizas todas las opciones cuidadosamente antes de decidir",
        },
        {
          color: "#10B981",
          emoji: "🤝",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Buscas la armonía y consideras los sentimientos de todos",
        },
        {
          color: "#F59E0B",
          emoji: "💡",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Mantienes el optimismo y encuentras soluciones creativas",
        },
      ],
      text: "Al enfrentar una situación desafiante:",
    },
    {
      id: 4,
      options: [
        {
          color: "#EF4444",
          emoji: "👔",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "Poder y confianza - piezas audaces y estructuradas",
        },
        {
          color: "#3B82F6",
          emoji: "👗",
          scores: { blue: 3, green: 0, red: 0, yellow: 1 },
          text: "Elegancia y sofisticación - clásico, atemporal",
        },
        {
          color: "#10B981",
          emoji: "👕",
          scores: { blue: 0, green: 3, red: 0, yellow: 1 },
          text: "Comodidad y practicidad - natural, relajado",
        },
        {
          color: "#F59E0B",
          emoji: "🌈",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Diversión y creatividad - piezas coloridas y únicas",
        },
      ],
      text: "Tu estilo de vestir refleja:",
    },
    {
      id: 5,
      options: [
        {
          color: "#EF4444",
          emoji: "🎯",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Ritmo rápido, competitivo, impulsado por resultados",
        },
        {
          color: "#3B82F6",
          emoji: "📊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Organizado, silencioso, orientado a los detalles",
        },
        {
          color: "#10B981",
          emoji: "👥",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Colaborativo, de apoyo, centrado en el equipo",
        },
        {
          color: "#F59E0B",
          emoji: "🎨",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Creativo, flexible, amigable con la innovación",
        },
      ],
      text: "En tu entorno de trabajo, prefieres:",
    },
    {
      id: 6,
      options: [
        {
          color: "#EF4444",
          emoji: "🖼️",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Piezas abstractas audaces con fuertes contrastes",
        },
        {
          color: "#3B82F6",
          emoji: "🏺",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Piezas clásicas y refinadas con una composición perfecta",
        },
        {
          color: "#10B981",
          emoji: "🌸",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Paisajes pacíficos inspirados en la naturaleza",
        },
        {
          color: "#F59E0B",
          emoji: "🎭",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Arte moderno vibrante, juguetón y expresivo",
        },
      ],
      text: "Tu tipo de arte o diseño favorito es:",
    },
    {
      id: 7,
      options: [
        {
          color: "#EF4444",
          emoji: "🏃",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "Actividades de alta energía o juegos competitivos",
        },
        {
          color: "#3B82F6",
          emoji: "📚",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Lectura, rompecabezas o búsquedas intelectuales",
        },
        {
          color: "#10B981",
          emoji: "🧘",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Tiempo tranquilo en la naturaleza o meditación",
        },
        {
          color: "#F59E0B",
          emoji: "🎉",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Reuniones sociales y entretener a los demás",
        },
      ],
      text: "Al relajarte, disfrutas:",
    },
    {
      id: 8,
      options: [
        {
          color: "#EF4444",
          emoji: "📢",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "Directo, asertivo y al grano",
        },
        {
          color: "#3B82F6",
          emoji: "📝",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Reflexivo, preciso y bien estructurado",
        },
        {
          color: "#10B981",
          emoji: "💬",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Gentil, empático y considerado",
        },
        {
          color: "#F59E0B",
          emoji: "🗣️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Entusiasta, expresivo y animado",
        },
      ],
      text: "Tu estilo de comunicación es típicamente:",
    },
  ] as ColorPersonalityQuestion[],
  fr: [
    {
      id: 1,
      options: [
        {
          color: "#EF4444",
          emoji: "🔥",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Des couleurs audacieuses et dramatiques qui s'affirment",
        },
        {
          color: "#3B82F6",
          emoji: "🌊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Des bleus calmes et sophistiqués et des tons neutres",
        },
        {
          color: "#10B981",
          emoji: "🌿",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Des verts et des bruns naturels et terreux",
        },
        {
          color: "#F59E0B",
          emoji: "☀️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Des jaunes et des oranges vifs et joyeux",
        },
      ],
      text: "En choisissant la décoration intérieure, vous préférez :",
    },
    {
      id: 2,
      options: [
        {
          color: "#EF4444",
          emoji: "🏂",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "Des sports d'aventure et des activités passionnantes",
        },
        {
          color: "#3B82F6",
          emoji: "🏛️",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Des musées, de la culture et des expériences intellectuelles",
        },
        {
          color: "#10B981",
          emoji: "🏔️",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Nature, tranquillité et environnement paisible",
        },
        {
          color: "#F59E0B",
          emoji: "🎪",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Des festivals, des événements sociaux et une atmosphère animée",
        },
      ],
      text: "Votre destination de vacances idéale aurait :",
    },
    {
      id: 3,
      options: [
        {
          color: "#EF4444",
          emoji: "💪",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Agissez immédiatement et l'affrontez de front",
        },
        {
          color: "#3B82F6",
          emoji: "🧠",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Analysez toutes les options avec soin avant de décider",
        },
        {
          color: "#10B981",
          emoji: "🤝",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Recherchez l'harmonie et considérez les sentiments de chacun",
        },
        {
          color: "#F59E0B",
          emoji: "💡",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Restez optimiste et trouvez des solutions créatives",
        },
      ],
      text: "Face à une situation difficile, vous :",
    },
    {
      id: 4,
      options: [
        {
          color: "#EF4444",
          emoji: "👔",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "Puissance et confiance - pièces audacieuses et structurées",
        },
        {
          color: "#3B82F6",
          emoji: "👗",
          scores: { blue: 3, green: 0, red: 0, yellow: 1 },
          text: "Élégance et sophistication - classique, intemporel",
        },
        {
          color: "#10B981",
          emoji: "👕",
          scores: { blue: 0, green: 3, red: 0, yellow: 1 },
          text: "Confort et praticité - naturel, décontracté",
        },
        {
          color: "#F59E0B",
          emoji: "🌈",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Plaisir et créativité - pièces colorées et uniques",
        },
      ],
      text: "Votre style vestimentaire reflète :",
    },
    {
      id: 5,
      options: [
        {
          color: "#EF4444",
          emoji: "🎯",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Un rythme rapide, compétitif, axé sur les résultats",
        },
        {
          color: "#3B82F6",
          emoji: "📊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Organisé, calme, axé sur les détails",
        },
        {
          color: "#10B981",
          emoji: "👥",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Collaboratif, solidaire, axé sur l'équipe",
        },
        {
          color: "#F59E0B",
          emoji: "🎨",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Créatif, flexible, favorable à l'innovation",
        },
      ],
      text: "Dans votre environnement de travail, vous préférez :",
    },
    {
      id: 6,
      options: [
        {
          color: "#EF4444",
          emoji: "🖼️",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "Des pièces abstraites audacieuses avec des contrastes forts",
        },
        {
          color: "#3B82F6",
          emoji: "🏺",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Des pièces classiques et raffinées avec une composition parfaite",
        },
        {
          color: "#10B981",
          emoji: "🌸",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Des paysages paisibles inspirés de la nature",
        },
        {
          color: "#F59E0B",
          emoji: "🎭",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Un art moderne vibrant, ludique et expressif",
        },
      ],
      text: "Votre type d'art ou de design préféré est :",
    },
    {
      id: 7,
      options: [
        {
          color: "#EF4444",
          emoji: "🏃",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "Des activités à haute énergie ou des jeux compétitifs",
        },
        {
          color: "#3B82F6",
          emoji: "📚",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Lire, faire des puzzles ou des activités intellectuelles",
        },
        {
          color: "#10B981",
          emoji: "🧘",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Un temps calme dans la nature ou la méditation",
        },
        {
          color: "#F59E0B",
          emoji: "🎉",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Des rassemblements sociaux et divertir les autres",
        },
      ],
      text: "En vous relaxant, vous aimez :",
    },
    {
      id: 8,
      options: [
        {
          color: "#EF4444",
          emoji: "📢",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "Direct, sûr de soi et va droit au but",
        },
        {
          color: "#3B82F6",
          emoji: "📝",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "Réfléchi, précis et bien structuré",
        },
        {
          color: "#10B981",
          emoji: "💬",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "Doux, empathique et attentionné",
        },
        {
          color: "#F59E0B",
          emoji: "🗣️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "Enthousiaste, expressif et animé",
        },
      ],
      text: "Votre style de communication est généralement :",
    },
  ] as ColorPersonalityQuestion[],
  ja: [
    {
      id: 1,
      options: [
        {
          color: "#EF4444",
          emoji: "🔥",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "主張のある、大胆で劇的な色",
        },
        {
          color: "#3B82F6",
          emoji: "🌊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "落ち着いた洗練されたブルーやニュートラルカラー",
        },
        {
          color: "#10B981",
          emoji: "🌿",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "自然的で土の温もりがあるグリーンやブラウン",
        },
        {
          color: "#F59E0B",
          emoji: "☀️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "明るく陽気なイエローやオレンジ",
        },
      ],
      text: "インテリアを選ぶとき、あなたは次を好みます：",
    },
    {
      id: 2,
      options: [
        {
          color: "#EF4444",
          emoji: "🏂",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "アドベンチャースポーツとエキサイティングな活動",
        },
        {
          color: "#3B82F6",
          emoji: "🏛️",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "美術館、文化、知的体験",
        },
        {
          color: "#10B981",
          emoji: "🏔️",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "自然、静寂、平和な環境",
        },
        {
          color: "#F59E0B",
          emoji: "🎪",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "フェスティバル、社交行事、活気ある雰囲気",
        },
      ],
      text: "理想的な休暇先には次があるでしょう：",
    },
    {
      id: 3,
      options: [
        {
          color: "#EF4444",
          emoji: "💪",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "すぐに行動を起こし、真っ向から取り組む",
        },
        {
          color: "#3B82F6",
          emoji: "🧠",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "決定する前にすべての選択肢を慎重に分析する",
        },
        {
          color: "#10B981",
          emoji: "🤝",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "調和を求め、全員の感情を考慮する",
        },
        {
          color: "#F59E0B",
          emoji: "💡",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "楽観的であり続け、創造的な解決策を見つける",
        },
      ],
      text: "困難な状況に直面したとき、あなたは：",
    },
    {
      id: 4,
      options: [
        {
          color: "#EF4444",
          emoji: "👔",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "パワーと自信 - 大胆で構造的なアイテム",
        },
        {
          color: "#3B82F6",
          emoji: "👗",
          scores: { blue: 3, green: 0, red: 0, yellow: 1 },
          text: "優雅さと洗練 - クラシックでタイムレス",
        },
        {
          color: "#10B981",
          emoji: "👕",
          scores: { blue: 0, green: 3, red: 0, yellow: 1 },
          text: "快適さと実用性 - 自然でリラックスした",
        },
        {
          color: "#F59E0B",
          emoji: "🌈",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "楽しさと創造性 - カラフルでユニークなアイテム",
        },
      ],
      text: "あなたの服装スタイルは次を反映しています：",
    },
    {
      id: 5,
      options: [
        {
          color: "#EF4444",
          emoji: "🎯",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "ペースが速く、競争力があり、結果重視",
        },
        {
          color: "#3B82F6",
          emoji: "📊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "組織的で静か、詳細重視",
        },
        {
          color: "#10B981",
          emoji: "👥",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "協力的でサポートに熱心、チーム重視",
        },
        {
          color: "#F59E0B",
          emoji: "🎨",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "創造的で柔軟、革新に寛容",
        },
      ],
      text: "職場環境において、あなたは次を好みます：",
    },
    {
      id: 6,
      options: [
        {
          color: "#EF4444",
          emoji: "🖼️",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "コントラストの強い大胆な抽象作品",
        },
        {
          color: "#3B82F6",
          emoji: "🏺",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "完璧な構成の古典的で洗練された作品",
        },
        {
          color: "#10B981",
          emoji: "🌸",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "自然からインスピレーションを得た平和な風景画",
        },
        {
          color: "#F59E0B",
          emoji: "🎭",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "活気に満ち、遊び心があり、表現力豊かな現代アート",
        },
      ],
      text: "好きなアートやデザインのタイプは：",
    },
    {
      id: 7,
      options: [
        {
          color: "#EF4444",
          emoji: "🏃",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "エネルギーの高い活動や競争力のあるゲーム",
        },
        {
          color: "#3B82F6",
          emoji: "📚",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "読書、パズル、または知的な追求",
        },
        {
          color: "#10B981",
          emoji: "🧘",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "自然の中での静かな時間や瞑想",
        },
        {
          color: "#F59E0B",
          emoji: "🎉",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "社交的な集まりや他人を楽しませること",
        },
      ],
      text: "リラックスするとき、あなたは次を楽しみます：",
    },
    {
      id: 8,
      options: [
        {
          color: "#EF4444",
          emoji: "📢",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "直接的で主張が強く、要点を突く",
        },
        {
          color: "#3B82F6",
          emoji: "📝",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "思慮深く、正確で、よく構成されている",
        },
        {
          color: "#10B981",
          emoji: "💬",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "穏やかで共感的、そして思いやりがある",
        },
        {
          color: "#F59E0B",
          emoji: "🗣️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "熱狂的で表現力豊か、そして生き生きとしている",
        },
      ],
      text: "あなたのコミュニケーションスタイルは通常：",
    },
  ] as ColorPersonalityQuestion[],
  ko: [
    {
      id: 1,
      options: [
        {
          color: "#EF4444",
          emoji: "🔥",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "인상적인 연출을 위한 대담하고 드라마틱한 색상",
        },
        {
          color: "#3B82F6",
          emoji: "🌊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "차분하고 세련된 파란색과 중성색",
        },
        {
          color: "#10B981",
          emoji: "🌿",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "자연스럽고 따뜻한 초록색과 갈색",
        },
        {
          color: "#F59E0B",
          emoji: "☀️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "밝고 유쾌한 노란색과 주황색",
        },
      ],
      text: "집 데코를 선택할 때, 당신은 다음을 선호합니다:",
    },
    {
      id: 2,
      options: [
        {
          color: "#EF4444",
          emoji: "🏂",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "모험 스포츠와 흥미진진한 활동",
        },
        {
          color: "#3B82F6",
          emoji: "🏛️",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "박물관, 문화, 지적 경험",
        },
        {
          color: "#10B981",
          emoji: "🏔️",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "자연, 고요함, 평화로운 환경",
        },
        {
          color: "#F59E0B",
          emoji: "🎪",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "축제, 사교 행사, 활기찬 분위기",
        },
      ],
      text: "이상적인 휴가지는 다음을 가지고 있을 것입니다:",
    },
    {
      id: 3,
      options: [
        {
          color: "#EF4444",
          emoji: "💪",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "즉시 행동을 취하고 정면으로 대처한다",
        },
        {
          color: "#3B82F6",
          emoji: "🧠",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "결정하기 전에 모든 옵션을 신중히 분석한다",
        },
        {
          color: "#10B981",
          emoji: "🤝",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "조화를 추구하고 모든 사람의 감정을 고려한다",
        },
        {
          color: "#F59E0B",
          emoji: "💡",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "낙관적으로 유지하고 창의적인 해결책을 찾는다",
        },
      ],
      text: "도전적인 상황에 직면했을 때, 당신은:",
    },
    {
      id: 4,
      options: [
        {
          color: "#EF4444",
          emoji: "👔",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "힘과 자신감 - 대담하고 구조적인 아이템",
        },
        {
          color: "#3B82F6",
          emoji: "👗",
          scores: { blue: 3, green: 0, red: 0, yellow: 1 },
          text: "우아함과 세련됨 - 클래식하고 시대를 초월한",
        },
        {
          color: "#10B981",
          emoji: "👕",
          scores: { blue: 0, green: 3, red: 0, yellow: 1 },
          text: "편안함과 실용성 - 자연스럽고 편안한",
        },
        {
          color: "#F59E0B",
          emoji: "🌈",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "재미와 창의성 - 다채롭고 독특한 아이템",
        },
      ],
      text: "당신의 의류 스타일은 다음을 반영합니다:",
    },
    {
      id: 5,
      options: [
        {
          color: "#EF4444",
          emoji: "🎯",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "빠른 속도, 경쟁적, 결과 중심적",
        },
        {
          color: "#3B82F6",
          emoji: "📊",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "조직적, 조용한, 세부사항 중심적",
        },
        {
          color: "#10B981",
          emoji: "👥",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "협력적, 지원적, 팀 중심적",
        },
        {
          color: "#F59E0B",
          emoji: "🎨",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "창의적, 유연한, 혁신 친화적",
        },
      ],
      text: "업무 환경에서 당신은 다음을 선호합니다:",
    },
    {
      id: 6,
      options: [
        {
          color: "#EF4444",
          emoji: "🖼️",
          scores: { blue: 0, green: 0, red: 3, yellow: 1 },
          text: "강한 대비의 대담한 추상 작품",
        },
        {
          color: "#3B82F6",
          emoji: "🏺",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "완벽한 구성의 고전적이고 세련된 작품",
        },
        {
          color: "#10B981",
          emoji: "🌸",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "자연에서 영감을 얻은 평화로운 풍경화",
        },
        {
          color: "#F59E0B",
          emoji: "🎭",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "생동감 있고 장난기 가득한 표현적인 현대 예술",
        },
      ],
      text: "당신이 좋아하는 예술이나 디자인 유형은:",
    },
    {
      id: 7,
      options: [
        {
          color: "#EF4444",
          emoji: "🏃",
          scores: { blue: 0, green: 0, red: 3, yellow: 2 },
          text: "고에너지 활동이나 경쟁 게임",
        },
        {
          color: "#3B82F6",
          emoji: "📚",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "독서, 퍼즐, 지적 활동",
        },
        {
          color: "#10B981",
          emoji: "🧘",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "자연 속에서의 조용한 시간이나 명상",
        },
        {
          color: "#F59E0B",
          emoji: "🎉",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "사교 모임과 다른 사람들을 즐겁게 하는 것",
        },
      ],
      text: "휴식할 때, 당신은 다음을 즐깁니다:",
    },
    {
      id: 8,
      options: [
        {
          color: "#EF4444",
          emoji: "📢",
          scores: { blue: 1, green: 0, red: 3, yellow: 0 },
          text: "직접적이고 단호하며 요점에 바로 들어간다",
        },
        {
          color: "#3B82F6",
          emoji: "📝",
          scores: { blue: 3, green: 1, red: 0, yellow: 0 },
          text: "사려 깊고 정확하며 체계적으로 구성된다",
        },
        {
          color: "#10B981",
          emoji: "💬",
          scores: { blue: 1, green: 3, red: 0, yellow: 0 },
          text: "부드럽고 공감적이며 배려심이 많다",
        },
        {
          color: "#F59E0B",
          emoji: "🗣️",
          scores: { blue: 0, green: 0, red: 1, yellow: 3 },
          text: "열정적이고 표현력이 풍부하며 생동감이 넘친다",
        },
      ],
      text: "당신의 소통 스타일은 일반적으로:",
    },
  ] as ColorPersonalityQuestion[],
} as const;

export const colorPersonalityResults: Record<string, ColorPersonalityResult> = {
  blue: {
    careerSuggestions: [
      "Data analyst or scientist",
      "Accountant or financial advisor",
      "Engineer or architect",
      "Researcher or academic",
      "Quality assurance specialist",
      "Librarian or archivist",
      "Medical professional",
    ],
    challenges: [
      "Can be overly critical or perfectionist",
      "May struggle with sudden changes",
      "Sometimes hesitant to take risks",
      "Can get overwhelmed by too many options",
      "May appear distant or unemotional",
    ],
    compatibleTypes: ["red", "green"],
    description: COLOR_PERSONALITY_DESCRIPTIONS.ko.blue,
    emoji: "🔵",
    idealColors: [
      "Calm blues and navy",
      "Sophisticated grays",
      "Clean whites and off-whites",
      "Muted pastels",
      "Classic earth tones",
    ],
    name: COLOR_PERSONALITY_LABELS.ko.blue,
    relationshipTips: [
      "Express emotions more openly",
      "Appreciate spontaneity occasionally",
      "Focus on the big picture sometimes",
      "Practice flexibility in plans",
      "Show affection through thoughtful gestures",
    ],
    strengths: [
      "Excellent problem-solving skills",
      "High attention to detail",
      "Creates systematic processes",
      "Maintains high standards",
      "Provides stability and consistency",
    ],
    traits: [
      "Analytical and logical",
      "Detail-oriented and precise",
      "Reliable and trustworthy",
      "Values quality over quantity",
      "Prefers structure and organization",
    ],
    type: "blue",
  },
  green: {
    careerSuggestions: [
      "Counselor or therapist",
      "Teacher or educator",
      "Human resources specialist",
      "Healthcare worker",
      "Social worker",
      "Environmental scientist",
      "Non-profit organization roles",
    ],
    challenges: [
      "May avoid necessary confrontations",
      "Can be indecisive to avoid conflict",
      "Sometimes sacrifices own needs",
      "May resist change even when beneficial",
      "Can be taken advantage of by others",
    ],
    compatibleTypes: ["blue", "yellow"],
    description: COLOR_PERSONALITY_DESCRIPTIONS.ko.green,
    emoji: "🟢",
    idealColors: [
      "Natural greens and forest tones",
      "Warm earth browns",
      "Soft creams and beiges",
      "Gentle pastels",
      "Muted nature-inspired hues",
    ],
    name: COLOR_PERSONALITY_LABELS.ko.green,
    relationshipTips: [
      "Express your needs more clearly",
      "Practice saying no when necessary",
      "Embrace positive changes",
      "Take initiative occasionally",
      "Value your own opinions and desires",
    ],
    strengths: [
      "Builds strong relationships",
      "Creates harmonious environments",
      "Excellent listener and supporter",
      "Loyal and dependable",
      "Mediates conflicts effectively",
    ],
    traits: [
      "Cooperative and team-oriented",
      "Empathetic and caring",
      "Patient and even-tempered",
      "Values stability and security",
      "Natural peacemaker",
    ],
    type: "green",
  },
  red: {
    careerSuggestions: [
      "Executive or CEO",
      "Sales manager",
      "Entrepreneur",
      "Military officer",
      "Emergency services",
      "Sports coach",
      "Project manager",
    ],
    challenges: [
      "Can be impatient with slower-paced individuals",
      "May overlook emotional needs",
      "Sometimes too direct in communication",
      "Can be perceived as aggressive",
      "Difficulty delegating control",
    ],
    compatibleTypes: ["blue", "yellow"],
    description: COLOR_PERSONALITY_DESCRIPTIONS.ko.red,
    emoji: "🔴",
    idealColors: [
      "Bold reds and crimsons",
      "Deep burgundy and maroon",
      "Strong blacks and whites",
      "Metallic silvers and golds",
      "Rich navy blues",
    ],
    name: COLOR_PERSONALITY_LABELS.ko.red, // Default to KO for internal data structure, UI will use localized
    relationshipTips: [
      "Practice active listening with partners",
      "Allow space for others' opinions",
      "Show appreciation through actions",
      "Be patient with different decision-making styles",
      "Balance assertiveness with empathy",
    ],
    strengths: [
      "Excellent in crisis situations",
      "Motivates and inspires others",
      "Takes initiative effectively",
      "Handles pressure well",
      "Drives results and achievement",
    ],
    traits: [
      "Confident and assertive",
      "Goal-oriented and results-driven",
      "Natural leadership abilities",
      "Quick decision-maker",
      "Competitive and ambitious",
    ],
    type: "red",
  },
  yellow: {
    careerSuggestions: [
      "Creative director or designer",
      "Marketing or advertising professional",
      "Event planner",
      "Entertainer or performer",
      "Innovation consultant",
      "Public relations specialist",
      "Motivational speaker",
    ],
    challenges: [
      "Can be disorganized or scattered",
      "May struggle with routine tasks",
      "Sometimes lacks attention to detail",
      "Can be overly optimistic",
      "May have difficulty with follow-through",
    ],
    compatibleTypes: ["red", "green"],
    description: COLOR_PERSONALITY_DESCRIPTIONS.ko.yellow,
    emoji: "🟡",
    idealColors: [
      "Bright yellows and golds",
      "Vibrant oranges and corals",
      "Cheerful pinks and purples",
      "Energetic greens",
      "Bold, contrasting combinations",
    ],
    name: COLOR_PERSONALITY_LABELS.ko.yellow,
    relationshipTips: [
      "Practice follow-through on commitments",
      "Pay attention to important details",
      "Balance enthusiasm with listening",
      "Be mindful of others' energy levels",
      "Create structure for important goals",
    ],
    strengths: [
      "Brings energy and positivity",
      "Excellent at brainstorming ideas",
      "Adapts quickly to changes",
      "Motivates and inspires others",
      "Creates enjoyable atmospheres",
    ],
    traits: [
      "Optimistic and enthusiastic",
      "Creative and innovative",
      "Social and outgoing",
      "Flexible and adaptable",
      "Inspiring and motivational",
    ],
    type: "yellow",
  },
};
