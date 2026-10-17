"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Locale } from "../../i18n";
import { useReducedMotion } from "../../hooks/useMotion";
import { useUserStore } from "@/lib/user/store/user-store";

export type ZodiacSignKey =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export interface CelestialConstellationData {
  key: ZodiacSignKey;
  emoji: string;
  name: Record<Locale, string>;
  dates: string;
  eclipticDeg: number; // 0 to 330 deg (in 30 deg intervals)
  rightAscension: string; // e.g. "2h 38m"
  declination: string; // e.g. "+20° 48'"
  alphaStar: Record<Locale, string>;
  element: "fire" | "earth" | "air" | "water";
  brightness: string;
  mythSummary: Record<Locale, string>;
  // Local star offsets relative to constellation center for 3D star pattern
  starPattern: [number, number, number][];
  connections: [number, number][];
}

const OBLIQUITY = (23.44 * Math.PI) / 180; // Earth's axial tilt in radians
const SPHERE_RADIUS = 9.0;

export const CELESTIAL_SIGNS: CelestialConstellationData[] = [
  {
    key: "aries",
    emoji: "♈",
    name: { ko: "양자리", en: "Aries", ja: "牡羊座", zh: "白羊座", fr: "Bélier", es: "Aries" },
    dates: "3/21–4/19",
    eclipticDeg: 15,
    rightAscension: "02h 38m",
    declination: "+20° 48′",
    alphaStar: { ko: "하말 (Hamal, 2.0등성)", en: "Hamal (2.0 mag)", ja: "ハマル (2.0等星)", zh: "娄宿三 (2.0等)", fr: "Hamal (mag 2.0)", es: "Hamal (mag 2.0)" },
    element: "fire",
    brightness: "2.0 mag",
    mythSummary: {
      ko: "황금 양털을 가진 전설의 양으로, 봄의 시작(춘분점)을 알리는 천문학적 기준점입니다.",
      en: "The mythical ram with the golden fleece, traditionally marking the vernal equinox.",
      ja: "黄金の羊毛を持つ伝説の牡羊。春の訪れ（春分点）を告げる天文学の基準点です。",
      zh: "长着金羊毛的神羊，在传统天文学中曾是标定春分点的黄道第一宫。",
      fr: "Le bélier à la toison d'or, qui marquait traditionnellement l'équinoxe de printemps.",
      es: "El carnero del vellocino de oro, que tradicionalmente marcaba el equinoccio vernal.",
    },
    starPattern: [[0, 0, 0], [0.6, 0.4, 0.2], [1.1, 0.3, 0.4], [1.5, -0.2, 0.5]],
    connections: [[0, 1], [1, 2], [2, 3]],
  },
  {
    key: "taurus",
    emoji: "♉",
    name: { ko: "황소자리", en: "Taurus", ja: "牡牛座", zh: "金牛座", fr: "Taureau", es: "Tauro" },
    dates: "4/20–5/20",
    eclipticDeg: 45,
    rightAscension: "04h 36m",
    declination: "+16° 31′",
    alphaStar: { ko: "알데바란 (Aldebaran, 0.85등성)", en: "Aldebaran (0.85 mag)", ja: "アルデバラン (0.85等星)", zh: "毕宿五 (0.85等)", fr: "Aldébaran (mag 0.85)", es: "Aldebarán (mag 0.85)" },
    element: "earth",
    brightness: "0.85 mag",
    mythSummary: {
      ko: "플레이아데스와 히아데스 성단을 품고 있는 붉은 거성 알데바란의 웅장한 황소입니다.",
      en: "Home to the Pleiades and Hyades clusters, anchored by the fiery red giant Aldebaran.",
      ja: "プレアデスとヒアデス星団を抱え、赤色巨星アルデバランが輝く雄牛の星座です。",
      zh: "拥有昴星团和毕星团的壮丽星座，其核心是炽热明亮的红巨星毕宿五。",
      fr: "Abritant les Pléiades et les Hyades, sous l'œil rouge flamboyant d'Aldébaran.",
      es: "Hogar de las Pléyades y las Híades, vigilado por la gigante roja Aldebarán.",
    },
    starPattern: [[0, 0, 0], [0.8, 0.5, 0.2], [1.4, 0.9, 0.3], [0.5, -0.6, 0.1], [1.2, -0.8, 0.2], [-0.5, 0.3, -0.2]],
    connections: [[0, 1], [1, 2], [0, 3], [3, 4], [0, 5]],
  },
  {
    key: "gemini",
    emoji: "♊",
    name: { ko: "쌍둥이자리", en: "Gemini", ja: "双子座", zh: "双子座", fr: "Gémeaux", es: "Géminis" },
    dates: "5/21–6/20",
    eclipticDeg: 75,
    rightAscension: "07h 45m",
    declination: "+28° 02′",
    alphaStar: { ko: "폴룩스 & 카스토르 (1.15등성)", en: "Pollux & Castor (1.15 mag)", ja: "ポルックスとカストル", zh: "北河三与北河二", fr: "Pollux et Castor", es: "Pólux y Cástor" },
    element: "air",
    brightness: "1.15 mag",
    mythSummary: {
      ko: "다정하게 나란히 빛나는 카스토르와 폴룩스 형제의 별자리로 겨울철 은하수를 장식합니다.",
      en: "The celestial twins Castor and Pollux side by side in the winter Milky Way.",
      ja: "仲良く並んで輝くカストルとポルックスの兄弟星。冬の天の川を美しく彩ります。",
      zh: "并肩闪耀的双子星卡斯托尔与波鲁克斯，冬夜银河边最温暖的相伴。",
      fr: "Les jumeaux célestes Castor et Pollux brillant côte à côte le long de la Voie lactée.",
      es: "Los gemelos celestiales Cástor y Pólux brillando juntos en la Vía Láctea invernal.",
    },
    starPattern: [[0, 0, 0], [0.6, 0.1, 0.1], [-0.2, -0.8, -0.1], [0.5, -0.9, 0.1], [-0.1, -1.6, -0.2], [0.6, -1.7, 0.2]],
    connections: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5]],
  },
  {
    key: "cancer",
    emoji: "♋",
    name: { ko: "게자리", en: "Cancer", ja: "蟹座", zh: "巨蟹座", fr: "Cancer", es: "Cáncer" },
    dates: "6/21–7/22",
    eclipticDeg: 105,
    rightAscension: "08h 58m",
    declination: "+11° 51′",
    alphaStar: { ko: "알타르프 (Al Tarf, 3.5등성)", en: "Al Tarf (3.5 mag)", ja: "タルフ (3.5等星)", zh: "柳宿增三 (3.5等)", fr: "Al Tarf (mag 3.5)", es: "Al Tarf (mag 3.5)" },
    element: "water",
    brightness: "3.5 mag",
    mythSummary: {
      ko: "벌집 성단(프레세페, M44)을 품은 고요하고 은은한 별자리입니다.",
      en: "Faint yet captivating, nurturing the famous Beehive open cluster (M44).",
      ja: "プレセペ星団（蜂の巣星団・M44）を内に宿す、静かで神秘的な蟹の星座です。",
      zh: "中央深藏着著名的蜂巢星团（M44 鬼星团），微弱却无比温柔。",
      fr: "Discrète mais envoûtante, berceau du célèbre amas de la Crèche (M44).",
      es: "Discreta pero cautivadora, alberga el famoso cúmulo del Pesebre (M44).",
    },
    starPattern: [[0, 0, 0], [0.3, 0.4, 0.1], [-0.3, 0.4, -0.1], [0, -0.6, 0], [-0.4, -1.0, -0.1]],
    connections: [[0, 1], [0, 2], [0, 3], [3, 4]],
  },
  {
    key: "leo",
    emoji: "♌",
    name: { ko: "사자자리", en: "Leo", ja: "獅子座", zh: "狮子座", fr: "Lion", es: "Leo" },
    dates: "7/23–8/22",
    eclipticDeg: 135,
    rightAscension: "10h 08m",
    declination: "+11° 58′",
    alphaStar: { ko: "레굴루스 (Regulus, 1.36등성)", en: "Regulus (1.36 mag)", ja: "レグルス (1.36等星)", zh: "轩辕十四 (1.36等)", fr: "Régulus (mag 1.36)", es: "Régulo (mag 1.36)" },
    element: "fire",
    brightness: "1.36 mag",
    mythSummary: {
      ko: "사자의 심장에서 빛나는 '작은 왕' 레굴루스와 낫 모양의 별무리가 위엄을 드러냅니다.",
      en: "The celestial lion crowned by 'Little King' Regulus and the distinctive Sickle.",
      ja: "「小さな王」レグルスを心臓に抱き、鎌状の星の並びが威厳を放つ百獣の王です。",
      zh: "以'小国王'轩辕十四为心脏，镰刀状的头部轮廓极具王者威仪。",
      fr: "Le fier lion couronné par Régulus, le 'Petit Roi', et sa faucille d'étoiles.",
      es: "El león celestial coronado por 'El Pequeño Rey' Régulo y su inconfundible hoz.",
    },
    starPattern: [[0, 0, 0], [0.3, 0.7, 0.1], [-0.2, 1.2, 0], [-0.7, 1.0, -0.1], [-0.6, 0.5, -0.1], [0.8, -0.3, 0.2], [1.6, -0.1, 0.3], [1.4, -0.7, 0.2]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7]],
  },
  {
    key: "virgo",
    emoji: "♍",
    name: { ko: "처녀자리", en: "Virgo", ja: "乙女座", zh: "室女座", fr: "Vierge", es: "Virgo" },
    dates: "8/23–9/22",
    eclipticDeg: 165,
    rightAscension: "13h 25m",
    declination: "-11° 10′",
    alphaStar: { ko: "스피카 (Spica, 0.98등성)", en: "Spica (0.98 mag)", ja: "スピカ (0.98等星)", zh: "角宿一 (0.98等)", fr: "Spica (mag 0.98)", es: "Espiga (mag 0.98)" },
    element: "earth",
    brightness: "0.98 mag",
    mythSummary: {
      ko: "푸른 순백의 1등성 스피카(보리 이삭)를 손에 쥔 정의와 풍요의 여신입니다.",
      en: "Goddess of harvest holding the brilliant blue-white ear of wheat, Spica.",
      ja: "青白く澄んだ1等星スピカ（麦の穂）を手にする、正義と豊穣の女神の星座です。",
      zh: "手握闪耀蓝白色麦穗（角宿一）的正义与丰收女神，是全天第二大星座。",
      fr: "La déesse tenant dans sa main le pur épi de blé bleu-blanc, Spica.",
      es: "La diosa de la cosecha sosteniendo la deslumbrante espiga blanco-azulada, Espiga.",
    },
    starPattern: [[0, 0, 0], [-0.6, 0.6, -0.1], [-1.0, 1.2, -0.2], [-0.2, 1.4, 0], [0.6, 1.1, 0.2], [1.0, 0.4, 0.3]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  {
    key: "libra",
    emoji: "♎",
    name: { ko: "천칭자리", en: "Libra", ja: "天秤座", zh: "天秤座", fr: "Balance", es: "Libra" },
    dates: "9/23–10/22",
    eclipticDeg: 195,
    rightAscension: "14h 51m",
    declination: "-16° 03′",
    alphaStar: { ko: "주벤엘게누비 (2.75등성)", en: "Zubenelgenubi (2.75 mag)", ja: "ズベン・エル・ゲヌビ", zh: "氐宿一", fr: "Zubenelgenubi", es: "Zubenelgenubi" },
    element: "air",
    brightness: "2.75 mag",
    mythSummary: {
      ko: "황도 12궁 중 유일한 무생물 상징으로, 정의와 균형의 저울을 나타냅니다.",
      en: "The only inanimate sign among the zodiac, symbolizing cosmic equilibrium and justice.",
      ja: "黄道十二星座で唯一の無生物シンボル。宇宙の調和と正義の天秤を表します。",
      zh: "黄道十二宫中唯一的无生命器物，象征着万物公正与和谐的平衡法秤。",
      fr: "Le seul signe inanimé du zodiaque, emblème de justice et d'harmonie universelle.",
      es: "El único signo inanimado del zodíaco, símbolo de equilibrio y justicia cósmica.",
    },
    starPattern: [[0, 0, 0], [0.8, 0.6, 0.1], [-0.8, 0.6, -0.1], [0, 1.1, 0]],
    connections: [[0, 1], [0, 2], [1, 3], [2, 3]],
  },
  {
    key: "scorpio",
    emoji: "♏",
    name: { ko: "전갈자리", en: "Scorpio", ja: "蠍座", zh: "天蝎座", fr: "Scorpion", es: "Escorpio" },
    dates: "10/23–11/21",
    eclipticDeg: 225,
    rightAscension: "16h 29m",
    declination: "-26° 26′",
    alphaStar: { ko: "안타레스 (Antares, 1.06등성)", en: "Antares (1.06 mag)", ja: "アンタレス (1.06等星)", zh: "心宿二 (1.06等)", fr: "Antarès (mag 1.06)", es: "Antares (mag 1.06)" },
    element: "water",
    brightness: "1.06 mag",
    mythSummary: {
      ko: "붉게 타오르는 전갈의 심장 안타레스와 아름다운 S자 꼬리가 밤하늘을 압도합니다.",
      en: "Dominated by the flaming red supergiant heart Antares and its curving stinger.",
      ja: "赤く燃える心臓アンタレスと、優美なS字を描く毒針の尾が夜空に君臨します。",
      zh: "以深红超巨星'大火'心宿二为心脏，优雅的S型长尾直刺苍穹。",
      fr: "Dominé par le cœur rougeoyant d'Antarès et sa courbe majestueuse terminée par le dard.",
      es: "Dominado por la supergigante roja Antares en su corazón y su aguijón curvilíneo.",
    },
    starPattern: [[0, 0, 0], [-0.5, 0.5, -0.1], [-0.3, 0.9, 0], [0.3, 0.8, 0.1], [0.4, -0.6, 0.1], [0.7, -1.2, 0.2], [1.3, -1.5, 0.3], [1.7, -1.2, 0.3]],
    connections: [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [6, 7]],
  },
  {
    key: "sagittarius",
    emoji: "♐",
    name: { ko: "궁수자리", en: "Sagittarius", ja: "射手座", zh: "射手座", fr: "Sagittaire", es: "Sagitario" },
    dates: "11/22–12/21",
    eclipticDeg: 255,
    rightAscension: "18h 24m",
    declination: "-34° 23′",
    alphaStar: { ko: "카우스 아우스트랄리스 (1.79등성)", en: "Kaus Australis (1.79 mag)", ja: "カウス・アウストラリス", zh: "箕宿三", fr: "Kaus Australis", es: "Kaus Australis" },
    element: "fire",
    brightness: "1.79 mag",
    mythSummary: {
      ko: "우리 은하의 중심(초대질량 블랙홀)을 향해 활을 겨누고 있는 현자 켄타우로스입니다.",
      en: "The archer aiming his arrow straight into the galactic center of the Milky Way.",
      ja: "天の川銀河の中心（ブラックホール）に向かって弓を引き絞るケンタウロスの賢者です。",
      zh: "手持神弓对准银河系超大质量黑洞中心的半人马贤者喀戎。",
      fr: "L'archer pointant sa flèche vers le cœur même de notre Voie lactée.",
      es: "El arquero apuntando su flecha hacia el centro galáctico de la Vía Láctea.",
    },
    starPattern: [[0, 0, 0], [0.5, 0.6, 0.1], [1.1, 0.4, 0.2], [0.8, -0.2, 0.1], [0.2, -0.5, 0], [-0.5, -0.2, -0.1], [-0.7, 0.5, -0.1]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [5, 6]],
  },
  {
    key: "capricorn",
    emoji: "♑",
    name: { ko: "염소자리", en: "Capricorn", ja: "山羊座", zh: "摩羯座", fr: "Capricorne", es: "Capricornio" },
    dates: "12/22–1/19",
    eclipticDeg: 285,
    rightAscension: "21h 47m",
    declination: "-16° 08′",
    alphaStar: { ko: "데네브 알게디 (2.85등성)", en: "Deneb Algedi (2.85 mag)", ja: "デネブ・アルゲディ", zh: "垒壁阵四", fr: "Deneb Algedi", es: "Deneb Algedi" },
    element: "earth",
    brightness: "2.85 mag",
    mythSummary: {
      ko: "상반신은 산양, 하반신은 물고기의 형상을 한 판(Pan) 신화의 신비로운 성좌입니다.",
      en: "The sea-goat with the upper body of a mountain goat and the tail of a fish.",
      ja: "上半身は山羊、下半身は魚の姿をしたパン神の神話が宿る神秘的な星座です。",
      zh: "拥有山羊上半身与鱼尾的海山羊，象征坚韧不拔的意志与古老智慧。",
      fr: "La chèvre marine à queue de poisson, emblème de patience et de persévérance.",
      es: "La cabra marina con cuerpo superior de cabra y cola de pez, guardiana de la constancia.",
    },
    starPattern: [[0, 0, 0], [-0.8, 0.3, -0.1], [-1.4, 0.1, -0.2], [-1.0, -0.6, -0.1], [-0.2, -0.7, 0], [0.6, -0.3, 0.1]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    key: "aquarius",
    emoji: "♒",
    name: { ko: "물병자리", en: "Aquarius", ja: "水瓶座", zh: "宝瓶座", fr: "Verseau", es: "Acuario" },
    dates: "1/20–2/18",
    eclipticDeg: 315,
    rightAscension: "21h 32m",
    declination: "-05° 34′",
    alphaStar: { ko: "사달수드 (Sadalmelik, 2.9등성)", en: "Sadalsuud (2.9 mag)", ja: "サダルスード (2.9等星)", zh: "虚宿一", fr: "Sadalsuud (mag 2.9)", es: "Sadalsuud (mag 2.9)" },
    element: "air",
    brightness: "2.9 mag",
    mythSummary: {
      ko: "지혜의 물병에서 은빛 생명수를 쏟아붓는 가니메데스의 자유로운 영혼입니다.",
      en: "The water-bearer pouring celestial streams of wisdom and truth from his urn.",
      ja: "知恵の水瓶から生命の聖水を惜しみなく注ぎ込む、自由な魂の星座です。",
      zh: "手持宝瓶倾倒天界智慧之甘露的美少年伽倪墨得斯，代表革新与博爱。",
      fr: "Le porteur d'eau versant les flots de la sagesse et de la connaissance éternelle.",
      es: "El aguador vertiendo ríos de sabiduría y claridad desde su cántaro celestial.",
    },
    starPattern: [[0, 0, 0], [0.4, 0.5, 0.1], [0.9, 0.2, 0.1], [0.6, -0.4, 0.1], [0.2, -0.9, 0], [-0.4, -0.5, -0.1], [-0.8, -0.9, -0.2]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6]],
  },
  {
    key: "pisces",
    emoji: "♓",
    name: { ko: "물고기자리", en: "Pisces", ja: "魚座", zh: "双鱼座", fr: "Poissons", es: "Piscis" },
    dates: "2/19–3/20",
    eclipticDeg: 345,
    rightAscension: "01h 31m",
    declination: "+15° 21′",
    alphaStar: { ko: "알레샤 (Alrescha, 3.8등성)", en: "Alrescha (3.8 mag)", ja: "アルレシャ (3.8等星)", zh: "外屏七", fr: "Alrescha (mag 3.8)", es: "Alrescha (mag 3.8)" },
    element: "water",
    brightness: "3.8 mag",
    mythSummary: {
      ko: "리본으로 묶인 두 마리의 물고기로, 현재의 춘분점이 머물고 있는 평화의 별자리입니다.",
      en: "Two fish bound by a cosmic cord, currently hosting the vernal equinox.",
      ja: "天のリボンで結ばれた二匹の魚。現代の春分点が位置する大いなる愛の星座です。",
      zh: "以丝带相系的相依游鱼，当前天文学春分点正是坐落在此星座之中。",
      fr: "Deux poissons reliés par un ruban d'étoiles, hébergeant l'équinoxe vernal actuel.",
      es: "Dos peces entrelazados por una cinta cósmica, actual hogar del equinoccio de primavera.",
    },
    starPattern: [[0, 0, 0], [-0.6, 0.5, -0.1], [-1.0, 0.3, -0.2], [-0.4, -0.6, -0.1], [-0.8, -1.0, -0.2]],
    connections: [[0, 1], [1, 2], [0, 3], [3, 4]],
  },
];

// Helper: Calculate 3D position on tilted ecliptic ring
function getEclipticPosition(deg: number, radius: number): [number, number, number] {
  const rad = (deg * Math.PI) / 180;
  const x = radius * Math.cos(rad);
  const y = -radius * Math.sin(rad) * Math.sin(OBLIQUITY);
  const z = radius * Math.sin(rad) * Math.cos(OBLIQUITY);
  return [x, y, z];
}

// Background Deep-Space Twinkling Star Field
function DeepSpaceStars() {
  const count = 1200;
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const starColors = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#93c5fd"), // Soft blue
      new THREE.Color("#fef08a"), // Soft yellow
      new THREE.Color("#fed7aa"), // Soft orange
    ];

    for (let i = 0; i < count; i++) {
      const radius = 14 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} vertexColors transparent opacity={0.8} />
    </points>
  );
}

// Celestial Equator and Coordinate Rings
function CelestialGridRings() {
  const equatorPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(SPHERE_RADIUS * Math.cos(theta), 0, SPHERE_RADIUS * Math.sin(theta)));
    }
    return pts;
  }, []);

  const eclipticPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const deg = (i / segments) * 360;
      const [x, y, z] = getEclipticPosition(deg, SPHERE_RADIUS);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  const equatorGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(equatorPoints), [equatorPoints]);
  const eclipticGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(eclipticPoints), [eclipticPoints]);
  const axisGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -11, 0),
      new THREE.Vector3(0, 11, 0),
    ]);
  }, []);

  const equatorLine = useMemo(() => {
    return new THREE.Line(
      equatorGeo,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
    );
  }, [equatorGeo]);

  const eclipticLine = useMemo(() => {
    return new THREE.Line(
      eclipticGeo,
      new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 })
    );
  }, [eclipticGeo]);

  const axisLine = useMemo(() => {
    return new THREE.Line(
      axisGeo,
      new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.4 })
    );
  }, [axisGeo]);

  return (
    <group>
      {/* Celestial Equator (Cyan Wire) */}
      <primitive object={equatorLine} />

      {/* Ecliptic Orbit (Gold/Amber Wire) */}
      <primitive object={eclipticLine} />

      {/* Celestial Polar Axis Line */}
      <primitive object={axisLine} />

      {/* North Pole Marker */}
      <mesh position={[0, SPHERE_RADIUS, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={0x38bdf8} />
      </mesh>
      {/* South Pole Marker */}
      <mesh position={[0, -SPHERE_RADIUS, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={0x38bdf8} />
      </mesh>
    </group>
  );
}

// 3D Zodiac Node with Constellation star lines
interface SignNodeProps {
  sign: CelestialConstellationData;
  isSelected: boolean;
  isNatal: boolean;
  showConstellations: boolean;
  onSelect: (key: ZodiacSignKey) => void;
  locale: Locale;
}

function SignNode({
  sign,
  isSelected,
  isNatal,
  showConstellations,
  onSelect,
  locale,
}: SignNodeProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [centerPos] = useMemo(() => {
    return [getEclipticPosition(sign.eclipticDeg, SPHERE_RADIUS)];
  }, [sign.eclipticDeg]);

  // Constellation lines geometry
  const constellationLinesGeo = useMemo(() => {
    const points: THREE.Vector3[] = [];
    sign.connections.forEach(([i, j]) => {
      const p1 = sign.starPattern[i];
      const p2 = sign.starPattern[j];
      if (p1 && p2) {
        points.push(new THREE.Vector3(p1[0], p1[1], p1[2]));
        points.push(new THREE.Vector3(p2[0], p2[1], p2[2]));
      }
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [sign]);

  const linesSegmentsMesh = useMemo(() => {
    return new THREE.LineSegments(
      constellationLinesGeo,
      new THREE.LineBasicMaterial({
        color: isSelected ? 0xfbbf24 : 0x60a5fa,
        transparent: true,
        opacity: isSelected ? 0.9 : 0.4,
      })
    );
  }, [constellationLinesGeo, isSelected]);

  useFrame((state) => {
    if (meshRef.current && (isSelected || isNatal)) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 3) * 0.08;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const nodeColor = isNatal ? "#10b981" : isSelected ? "#f59e0b" : "#94a3b8";

  return (
    <group position={centerPos} ref={meshRef}>
      {/* Central Node Sphere */}
      <mesh onClick={() => onSelect(sign.key)}>
        <sphereGeometry args={[isSelected ? 0.32 : isNatal ? 0.28 : 0.2, 16, 16]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isSelected || isNatal ? 0.8 : 0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Natal Pulsing Aura Ring */}
      {isNatal && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.52, 32]} />
          <meshBasicMaterial color={0x10b981} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Selected Halo Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.55, 32]} />
          <meshBasicMaterial color={0xf59e0b} side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
      )}

      {/* 3D Constellation star points and lines (shown when selected or toggled on) */}
      {(isSelected || showConstellations) && (
        <group>
          <primitive object={linesSegmentsMesh} />
          {sign.starPattern.map(([sx, sy, sz], idx) => (
            <mesh key={idx} position={[sx, sy, sz]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshBasicMaterial color={isSelected ? 0xfef08a : 0xbfdbfe} />
            </mesh>
          ))}
        </group>
      )}

      {/* HTML Label Floating Above Node */}
      <Html distanceFactor={14} position={[0, 0.45, 0]} center>
        <button
          type="button"
          onClick={() => onSelect(sign.key)}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
            isNatal
              ? "bg-primary text-primary-foreground border border-primary ring-2 ring-primary/40 font-bold"
              : isSelected
              ? "bg-chart-5 text-foreground border border-chart-5 font-bold"
              : "bg-background/80 text-foreground border border-border/60 hover:bg-muted"
          }`}
        >
          <span>{sign.emoji}</span>
          <span>{sign.name[locale] ?? sign.name.en}</span>
          {isNatal && <span className="text-xs">★</span>}
        </button>
      </Html>
    </group>
  );
}

// Main 3D Canvas Scene
function CelestialCanvas({
  selectedKey,
  natalSignKey,
  onSelect,
  locale,
  autoRotate,
  showConstellations,
}: {
  selectedKey: ZodiacSignKey;
  natalSignKey: ZodiacSignKey | null;
  onSelect: (k: ZodiacSignKey) => void;
  locale: Locale;
  autoRotate: boolean;
  showConstellations: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReduced = useReducedMotion();

  useFrame((_, delta) => {
    if (autoRotate && !prefersReduced && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 8, 18], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color={0xfffbeb} />
      <pointLight position={[10, 15, 10]} intensity={0.8} />

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={28}
        rotateSpeed={0.6}
        dampingFactor={0.05}
      />

      <DeepSpaceStars />

      <group ref={groupRef}>
        <CelestialGridRings />

        {CELESTIAL_SIGNS.map((sign) => (
          <SignNode
            key={sign.key}
            sign={sign}
            isSelected={sign.key === selectedKey}
            isNatal={sign.key === natalSignKey}
            showConstellations={showConstellations}
            onSelect={onSelect}
            locale={locale}
          />
        ))}
      </group>
    </Canvas>
  );
}

// Date to Zodiac helper
function getZodiacFromBirthDate(dateStr: string): ZodiacSignKey | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length < 3) return null;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return null;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces";
}

// Translation UI copy
const I18N_TEXT: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    eclipticTip: string;
    play: string;
    pause: string;
    reset: string;
    constellationsToggle: string;
    natalSignNotice: string;
    noBirthSetNotice: string;
    quickSelect: string;
    astronomyData: string;
    ra: string;
    dec: string;
    eclipticDeg: string;
    alphaStar: string;
    element: string;
    mythology: string;
  }
> = {
  ko: {
    title: "3D 별자리 천구(天球) 및 12궁도 천문 오브",
    subtitle: "지구의 자전축 23.44° 기울기를 반영한 황도(Ecliptic)와 적도(Equator) 상의 12성좌 천문 궤도 시뮬레이션",
    eclipticTip: "황금색 궤도는 태양이 한 해 동안 지나는 '황도(Ecliptic)', 하늘색 선은 '천구의 적도(Equator)'입니다.",
    play: "회전",
    pause: "정지",
    reset: "원점 복귀",
    constellationsToggle: "별자리 성도 선 표시",
    natalSignNotice: "회원님의 출생 프로필(생년월일)을 기준으로 내 탄생 태양궁 위치가 초록색(★)으로 동기화되었습니다.",
    noBirthSetNotice: "생년월일을 입력하시면 내 탄생 천문 별자리 좌표가 3D 천구 위에 자동으로 빛납니다.",
    quickSelect: "12궁도 성좌 선택",
    astronomyData: "천문 관측 제원",
    ra: "적경 (Right Ascension)",
    dec: "적위 (Declination)",
    eclipticDeg: "황도 경도 (Ecliptic Longitude)",
    alphaStar: "가장 밝은 알파성 (Alpha Star)",
    element: "4원소 (Element)",
    mythology: "성좌 천문학 및 신화적 배경",
  },
  en: {
    title: "3D Celestial Sphere & Zodiac Astronomical Orb",
    subtitle: "Real-time astronomical simulation of the 12 zodiac constellations along the 23.44° tilted Ecliptic",
    eclipticTip: "The golden orbit represents the Sun's annual path (Ecliptic); the cyan ring marks the Celestial Equator.",
    play: "Rotate",
    pause: "Pause",
    reset: "Reset View",
    constellationsToggle: "Show Star Lines",
    natalSignNotice: "Your natal Sun sign coordinate is synchronized and highlighted in emerald green (★).",
    noBirthSetNotice: "Set your birth date to automatically locate your personal natal celestial coordinates.",
    quickSelect: "Select Zodiac Sign",
    astronomyData: "Astronomical Specifications",
    ra: "Right Ascension (RA)",
    dec: "Declination (Dec)",
    eclipticDeg: "Ecliptic Longitude",
    alphaStar: "Alpha Star",
    element: "Element",
    mythology: "Astronomical & Mythological Context",
  },
  ja: {
    title: "3D天球儀と黄道十二星座の天文インタラクティブ・オーブ",
    subtitle: "地軸の傾き23.44°を忠実に再現した黄道（Ecliptic）と天の赤道上の12星座天文軌道シミュレーター",
    eclipticTip: "金色の軌道は太陽の通り道である「黄道」、水色のリングは「天の赤道」を示しています。",
    play: "回転",
    pause: "停止",
    reset: "リセット",
    constellationsToggle: "星座線を表示",
    natalSignNotice: "生年月日のプロフィールに基づき、あなたの誕生星座がエメラルド（★）で同期されました。",
    noBirthSetNotice: "生年月日を入力すると、あなたの天文学的誕生座標が3D天球上に自動でハイライトされます。",
    quickSelect: "星座をクイック選択",
    astronomyData: "天体観測データ",
    ra: "赤経 (RA)",
    dec: "赤緯 (Dec)",
    eclipticDeg: "黄道経度",
    alphaStar: "最も明るいアルファ星",
    element: "四大元素",
    mythology: "星座の天文学・神話的背景",
  },
  zh: {
    title: "3D天球仪与黄道十二星座天文交互天球",
    subtitle: "基于地球自转轴23.44°倾角精确模拟黄道与天赤道上的十二星座天体轨道",
    eclipticTip: "金色环带为太阳一年视运动所经的'黄道'，青色环线为'天赤道'。",
    play: "旋转",
    pause: "暂停",
    reset: "复位视角",
    constellationsToggle: "显示星座连线",
    natalSignNotice: "已根据您的出生日期资料，将您的本命太阳星座以翡翠绿（★）在天球上精确高亮。",
    noBirthSetNotice: "设置出生日期即可在3D天球仪上自动定位专属于您的本命天体坐标。",
    quickSelect: "快速选择星座",
    astronomyData: "天文观测参数",
    ra: "赤经 (RA)",
    dec: "赤纬 (Dec)",
    eclipticDeg: "黄道经度",
    alphaStar: "主星 / 最亮阿尔法星",
    element: "四元素",
    mythology: "星座天文学与神话背景",
  },
  fr: {
    title: "Sphère céleste 3D & Orbite astronomique du zodiaque",
    subtitle: "Simulation astronomique des 12 constellations zodiacales le long de l'écliptique inclinée à 23,44°",
    eclipticTip: "L'anneau doré représente l'écliptique (trajectoire du Soleil) ; l'anneau cyan marque l'équateur céleste.",
    play: "Tourner",
    pause: "Pause",
    reset: "Réinitialiser",
    constellationsToggle: "Lignes d'étoiles",
    natalSignNotice: "Votre position solaire natale est synchronisée et mise en valeur en vert émeraude (★).",
    noBirthSetNotice: "Renseignez votre date de naissance pour afficher vos coordonnées célestes personnelles.",
    quickSelect: "Choisir un signe",
    astronomyData: "Données astronomiques",
    ra: "Ascension droite (AD)",
    dec: "Déclinaison (Déc)",
    eclipticDeg: "Longitude écliptique",
    alphaStar: "Étoile Alpha",
    element: "Élément",
    mythology: "Contexte astronomique & mythologique",
  },
  es: {
    title: "Esfera celeste 3D y orbe astronómico del zodíaco",
    subtitle: "Simulación astronómica de las 12 constelaciones zodiacales en la eclíptica inclinada a 23,44°",
    eclipticTip: "La órbita dorada es la eclíptica (camino del Sol); el anillo cian marca el ecuador celeste.",
    play: "Girar",
    pause: "Pausar",
    reset: "Restablecer",
    constellationsToggle: "Líneas de estrellas",
    natalSignNotice: "Su signo solar natal está sincronizado y resaltado en verde esmeralda (★).",
    noBirthSetNotice: "Indique su fecha de nacimiento para localizar automáticamente sus coordenadas celestes natales.",
    quickSelect: "Seleccionar signo",
    astronomyData: "Datos astronómicos",
    ra: "Ascensión recta (AR)",
    dec: "Declinación (Dec)",
    eclipticDeg: "Longitud eclíptica",
    alphaStar: "Estrella Alfa",
    element: "Elemento",
    mythology: "Contexto astronómico y mitológico",
  },
};

export default function AstroCelestialSphere3D({ locale = "ko" }: { locale?: Locale }) {
  const t = I18N_TEXT[locale] ?? I18N_TEXT.ko;

  // Single SSOT: Access user store
  const birthDate = useUserStore((s) => s.profile.birthDate);
  const userName = useUserStore((s) => s.profile.name);

  // Derive user's natal sign
  const natalSignKey = useMemo(() => {
    return birthDate ? getZodiacFromBirthDate(birthDate) : null;
  }, [birthDate]);

  const [selectedKey, setSelectedKey] = useState<ZodiacSignKey>("aries");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showConstellations, setShowConstellations] = useState<boolean>(true);

  // Automatically select natal sign on first load if available
  useEffect(() => {
    if (natalSignKey) {
      setSelectedKey(natalSignKey);
    }
  }, [natalSignKey]);

  const selectedSign = useMemo(() => {
    return CELESTIAL_SIGNS.find((s) => s.key === selectedKey) ?? CELESTIAL_SIGNS[0];
  }, [selectedKey]);

  const handleSelect = useCallback((key: ZodiacSignKey) => {
    setSelectedKey(key);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Info Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌌</span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t.title}</h2>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* User SSOT Profile Sync Status */}
          {natalSignKey ? (
            <div className="rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs text-primary font-medium flex items-center gap-2">
              <span className="text-base">★</span>
              <div>
                <p className="font-bold">{userName ? `${userName}님의 ` : ""}탄생궁 연동 완료</p>
                <p className="text-xs text-muted-foreground">{t.natalSignNotice}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {t.noBirthSetNotice}
            </div>
          )}
        </div>
      </div>

      {/* 3D Celestial Sphere Viewport */}
      <div className="relative rounded-2xl border border-border bg-background overflow-hidden shadow-inner">
        {/* Controls Overlay Header */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto rounded-lg bg-background/80 backdrop-blur-md px-3 py-1.5 border border-border/60 text-xs text-foreground">
            {t.eclipticTip}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConstellations((p) => !p)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-sm border transition-colors ${
                showConstellations
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/80 text-foreground border-border/60 hover:bg-muted"
              }`}
            >
              {t.constellationsToggle}
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate((p) => !p)}
              className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm border border-border/60 hover:bg-muted"
            >
              {autoRotate ? t.pause : t.play}
            </button>
            <button
              type="button"
              onClick={() => setSelectedKey(natalSignKey ?? "aries")}
              className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm border border-border/60 hover:bg-muted"
            >
              {t.reset}
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="h-96 sm:h-120 w-full cursor-grab active:cursor-grabbing">
          <CelestialCanvas
            selectedKey={selectedKey}
            natalSignKey={natalSignKey}
            onSelect={handleSelect}
            locale={locale}
            autoRotate={autoRotate}
            showConstellations={showConstellations}
          />
        </div>
      </div>

      {/* 12 Signs Quick Selector Bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">{t.quickSelect}</h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {CELESTIAL_SIGNS.map((s) => {
            const isSel = s.key === selectedKey;
            const isUserSign = s.key === natalSignKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => handleSelect(s.key)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center ${
                  isSel
                    ? "border-chart-5 bg-chart-5/15 text-foreground font-bold shadow-sm"
                    : isUserSign
                    ? "border-primary/80 bg-primary/10 text-primary font-medium"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-base">{s.emoji}</span>
                  {isUserSign && <span className="text-primary text-xs">★</span>}
                </div>
                <span className="text-xs mt-0.5">{s.name[locale] ?? s.name.en}</span>
                <span className="text-xs opacity-70">{s.dates}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Constellation Detailed Astronomical Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedSign.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">
                  {selectedSign.name[locale] ?? selectedSign.name.en}
                </h3>
                <span className="text-xs text-muted-foreground">({selectedSign.dates})</span>
                {selectedSign.key === natalSignKey && (
                  <span className="rounded-md bg-primary/20 text-primary px-2 py-0.5 text-xs font-bold">
                    내 탄생궁 (My Natal Sign)
                  </span>
                )}
              </div>
              <p className="text-xs text-primary font-medium mt-0.5">
                {t.element}: {selectedSign.element.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Coordinate Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl bg-muted/20 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block">{t.eclipticDeg}</span>
            <span className="text-sm font-bold text-foreground mt-1 block">
              {selectedSign.eclipticDeg}° ~ {selectedSign.eclipticDeg + 30}°
            </span>
          </div>

          <div className="rounded-xl bg-muted/20 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block">{t.ra}</span>
            <span className="text-sm font-bold text-foreground mt-1 block">
              {selectedSign.rightAscension}
            </span>
          </div>

          <div className="rounded-xl bg-muted/20 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block">{t.dec}</span>
            <span className="text-sm font-bold text-foreground mt-1 block">
              {selectedSign.declination}
            </span>
          </div>

          <div className="rounded-xl bg-muted/20 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block">{t.alphaStar}</span>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              {selectedSign.alphaStar[locale] ?? selectedSign.alphaStar.en}
            </span>
          </div>
        </div>

        {/* Astronomy & Mythology Summary */}
        <div className="mt-4 rounded-xl bg-muted/30 p-4 border border-border/40">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            {t.mythology}
          </span>
          <p className="text-sm leading-relaxed text-foreground">
            {selectedSign.mythSummary[locale] ?? selectedSign.mythSummary.en}
          </p>
        </div>
      </div>
    </div>
  );
}
