import { LocalizedContent } from "@/types/manifest";

export const COSMIC_CONSTANTS = {
  DISTANCE_TO_GALACTIC_CENTER_LY: 26000,
  DISTANCE_TO_SUN_KM: 149600000,
  EARTH_AXIAL_TILT_DEGREES: 23.5, // Approx current
  EARTH_MEAN_ORBITAL_SPEED_KM_S: 29.78,
  GALACTIC_YEAR_YEARS: 230000000, // 230 million years
  SOLAR_SYSTEM_GALACTIC_SPEED_KM_S: 230,
};

export interface CosmicFact {
  id: string;
  label: LocalizedContent;
  narrative: LocalizedContent;
  unit: string;
  value: number;
}

export const COSMIC_FACTS: CosmicFact[] = [
  {
    id: "earth-speed",
    label: {
      zh: "地球公转速度",
      en: "Earth's Orbital Speed",
      es: "Velocidad orbital de la Tierra",
      fr: "Vitesse orbitale de la Terre",
      ja: "地球の公転速度",
      ko: "지구의 공전 속도",
    },
    narrative: {
      zh: "在你出生的那一刻，地球正以大约每秒29.78公里的速度绕着太阳飞驰。",
      en: "At the moment of your birth, Earth was rushing through space around the Sun at approximately 29.78 km/s.",
      es: "En el momento de tu nacimiento, la Tierra corría por el espacio alrededor del Sol a aproximadamente 29,78 km/s.",
      fr: "Au moment de votre naissance, la Terre fonçait dans l'espace autour du Soleil à environ 29,78 km/s.",
      ja: "あなたが生まれた瞬間、地球は太陽の周りを約29.78km/sの速度で宇宙を疾走していました。",
      ko: "당신이 태어난 순간, 지구는 태양 주위를 초속 약 29.78km의 속도로 질주하고 있었습니다.",
    },
    unit: "km/s",
    value: COSMIC_CONSTANTS.EARTH_MEAN_ORBITAL_SPEED_KM_S,
  },
  {
    id: "galactic-journey",
    label: {
      zh: "太阳系银河公转速度",
      en: "Solar System's Galactic Speed",
      es: "Velocidad galáctica del sistema solar",
      fr: "Vitesse galactique du système solaire",
      ja: "太陽系の銀河公転速度",
      ko: "태양계의 은하 공전 속도",
    },
    narrative: {
      zh: "整个太阳系载着你，以惊人的每秒230公里的速度绕着银河系中心公转。",
      en: "The entire Solar System, carrying you, was orbiting the center of the Milky Way at a breathtaking 230 km/s.",
      es: "Todo el Sistema Solar, llevándote, orbitaba el centro de la Vía Láctea a una vertiginosa velocidad de 230 km/s.",
      fr: "Le système solaire tout entier, vous transportant, orbitait autour du centre de la Voie lactée à une vitesse époustouflante de 230 km/s.",
      ja: "あなたを乗せた太陽系全体が、息をのむような230km/sの速度で天の川の中心を公転していました。",
      ko: "당신을 태운 태양계 전체가 은하수 중심을 초속 230km라는 숨막히는 속도로 돌고 있었습니다.",
    },
    unit: "km/s",
    value: COSMIC_CONSTANTS.SOLAR_SYSTEM_GALACTIC_SPEED_KM_S,
  },
  {
    id: "axial-tilt",
    label: {
      zh: "地轴倾角",
      en: "Axial Tilt",
      es: "Inclinación axial",
      fr: "Inclinaison axiale",
      ja: "地軸の傾き",
      ko: "지축의 기울기",
    },
    narrative: {
      zh: "地球23.5度的倾斜创造了你出生的特定季节，塑造了你第一次呼吸时的气候。",
      en: "Earth's 23.5-degree tilt created the specific season of your birth, shaping the very climate you took your first breath in.",
      es: "La inclinación de 23,5 grados de la Tierra creó la estación específica de tu nacimiento, dando forma al clima en el que tomaste tu primer aliento.",
      fr: "L'inclinaison de 23,5 degrés de la Terre a créé la saison spécifique de votre naissance, façonnant le climat même dans lequel vous avez pris votre première respiration.",
      ja: "地球の23.5度の傾きがあなたが生まれた特定の季節を作り出し、あなたが最初の息を吸った気候を形成しました。",
      ko: "지구의 23.5도 기울기는 당신이 태어난 계절을 만들었고, 당신이 첫 숨을 들이마신 기후를 형성했습니다.",
    },
    unit: "degrees",
    value: COSMIC_CONSTANTS.EARTH_AXIAL_TILT_DEGREES,
  },
];
