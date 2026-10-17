"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Locale } from "../../i18n";
import { useReducedMotion } from "../../hooks/useMotion";

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

export interface ZodiacSignInfo {
  key: ZodiacSignKey;
  emoji: string;
  element: "fire" | "earth" | "air" | "water";
  ruler: Record<Locale, string>;
  dates: string;
  name: Record<Locale, string>;
  color: string;
  luckyColor: Record<Locale, string>;
  luckyNumber: number;
  companion: ZodiacSignKey;
  angle: number; // in degrees
  affirmation: Record<Locale, string>;
}

export const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  {
    key: "aries",
    emoji: "♈",
    element: "fire",
    ruler: { ko: "화성", en: "Mars", ja: "火星", zh: "火星", fr: "Mars", es: "Marte" },
    dates: "3/21–4/19",
    name: { ko: "양자리", en: "Aries", ja: "牡羊座", zh: "白羊座", fr: "Bélier", es: "Aries" },
    color: "#f87171",
    luckyColor: { ko: "크림슨 레드", en: "Crimson Red", ja: "クリムゾンレッド", zh: "绯红色", fr: "Rouge cramoisi", es: "Rojo carmesí" },
    luckyNumber: 9,
    companion: "leo",
    angle: 0,
    affirmation: {
      ko: "두려움 없이 내딛는 한 걸음이 새로운 가능성의 문을 엽니다.",
      en: "A bold step taken without fear unlocks unprecedented possibilities.",
      ja: "恐れずに踏み出す一歩が、新しい可能性の扉を開きます。",
      zh: "无所畏惧迈出的一步，将开启前所未有的可能之门。",
      fr: "Un pas audacieux sans crainte ouvre des perspectives inédites.",
      es: "Un paso audaz sin temor abre puertas a posibilidades inéditas.",
    },
  },
  {
    key: "taurus",
    emoji: "♉",
    element: "earth",
    ruler: { ko: "금성", en: "Venus", ja: "金星", zh: "金星", fr: "Vénus", es: "Venus" },
    dates: "4/20–5/20",
    name: { ko: "황소자리", en: "Taurus", ja: "牡牛座", zh: "金牛座", fr: "Taureau", es: "Tauro" },
    color: "#a3e635",
    luckyColor: { ko: "에메랄드 그린", en: "Emerald Green", ja: "エメラルドグリーン", zh: "祖母绿", fr: "Vert émeraude", es: "Verde esmeralda" },
    luckyNumber: 6,
    companion: "virgo",
    angle: 30,
    affirmation: {
      ko: "단단한 인내와 성실한 축적이 흔들리지 않는 풍요를 완성합니다.",
      en: "Steadfast patience and disciplined accumulation build enduring abundance.",
      ja: "揺るぎない忍耐と誠実な積み重ねが、確かな豊かさを築きます。",
      zh: "坚定的耐力与脚踏实地的积累，将造就稳固的丰盛。",
      fr: "Une patience constante et une accumulation rigoureuse bâtissent l'abondance.",
      es: "La paciencia constante y la acumulación firme construyen abundancia duradera.",
    },
  },
  {
    key: "gemini",
    emoji: "♊",
    element: "air",
    ruler: { ko: "수성", en: "Mercury", ja: "水星", zh: "水星", fr: "Mercure", es: "Mercurio" },
    dates: "5/21–6/20",
    name: { ko: "쌍둥이자리", en: "Gemini", ja: "双子座", zh: "双子座", fr: "Gémeaux", es: "Géminis" },
    color: "#38bdf8",
    luckyColor: { ko: "브라이트 옐로우", en: "Bright Yellow", ja: "ブライトイエロー", zh: "亮黄色", fr: "Jaune éclatant", es: "Amarillo brillante" },
    luckyNumber: 5,
    companion: "libra",
    angle: 60,
    affirmation: {
      ko: "유연한 사고와 영민한 통찰이 복잡한 상황을 가볍게 전환합니다.",
      en: "Agile thinking and perceptive wit effortlessly illuminate complex situations.",
      ja: "柔軟な思考と鋭い洞察が、複雑な状況を軽やかに転換します。",
      zh: "灵活的思维与敏锐的洞察力，能举重若轻地化解复杂局势。",
      fr: "Une pensée agile et un esprit vif transforment la complexité en clarté.",
      es: "El pensamiento ágil y la perspicacia transforman con ligereza lo complejo.",
    },
  },
  {
    key: "cancer",
    emoji: "♋",
    element: "water",
    ruler: { ko: "달", en: "Moon", ja: "月", zh: "月亮", fr: "Lune", es: "Luna" },
    dates: "6/21–7/22",
    name: { ko: "게자리", en: "Cancer", ja: "蟹座", zh: "巨蟹座", fr: "Cancer", es: "Cáncer" },
    color: "#818cf8",
    luckyColor: { ko: "오팔 실버", en: "Opal Silver", ja: "オパールシルバー", zh: "蛋白银", fr: "Argent opale", es: "Plata ópalo" },
    luckyNumber: 2,
    companion: "scorpio",
    angle: 90,
    affirmation: {
      ko: "따뜻한 공감과 진심 어린 배려가 가장 든든한 보호막이 됩니다.",
      en: "Warm empathy and sincere care form the most resilient shield.",
      ja: "温かい共感と真心からの気遣いが、何よりも確かな守りとなります。",
      zh: "真挚的共情与体贴关怀，是心灵最坚固的守护之盾。",
      fr: "Une empathie chaleureuse et une bienveillance sincère forment le plus sûr des boucliers.",
      es: "La empatía cálida y el cuidado genuino forman el escudo más resistente.",
    },
  },
  {
    key: "leo",
    emoji: "♌",
    element: "fire",
    ruler: { ko: "태양", en: "Sun", ja: "太陽", zh: "太阳", fr: "Soleil", es: "Sol" },
    dates: "7/23–8/22",
    name: { ko: "사자자리", en: "Leo", ja: "獅子座", zh: "狮子座", fr: "Lion", es: "Leo" },
    color: "#fb923c",
    luckyColor: { ko: "솔라 골드", en: "Solar Gold", ja: "ソーラーゴールド", zh: "日光金", fr: "Or solaire", es: "Oro solar" },
    luckyNumber: 1,
    companion: "sagittarius",
    angle: 120,
    affirmation: {
      ko: "자신을 온전히 믿는 당당한 빛이 주변의 모든 어둠을 밝힙니다.",
      en: "A radiant confidence in oneself dispels all surrounding shadows.",
      ja: "自分を信じる堂々とした輝きが、周りの暗がりを晴らします。",
      zh: "全然坚信自我的光芒，足以驱散周围的一切阴霾。",
      fr: "Une confiance rayonnante en soi dissipe toutes les ombres alentour.",
      es: "La confianza radiante en uno mismo disipa cualquier sombra alrededor.",
    },
  },
  {
    key: "virgo",
    emoji: "♍",
    element: "earth",
    ruler: { ko: "수성", en: "Mercury", ja: "水星", zh: "水星", fr: "Mercure", es: "Mercurio" },
    dates: "8/23–9/22",
    name: { ko: "처녀자리", en: "Virgo", ja: "乙女座", zh: "处女座", fr: "Vierge", es: "Virgo" },
    color: "#4ade80",
    luckyColor: { ko: "세이지 그린", en: "Sage Green", ja: "セージグリーン", zh: "鼠尾草绿", fr: "Vert sauge", es: "Verde salvia" },
    luckyNumber: 4,
    companion: "capricorn",
    angle: 150,
    affirmation: {
      ko: "정교한 손길과 세심한 질서 속에서 완전한 결실이 맺어집니다.",
      en: "In meticulous craftsmanship and calm order, perfection takes shape.",
      ja: "繊細な手仕事と秩序ある整えの中に、完全な実りが宿ります。",
      zh: "在细致入微的专注与井然秩序中，结出最完美的果实。",
      fr: "Dans le soin méticuleux et l'ordre serein se façonne la perfection.",
      es: "En la atención meticulosa y el orden sereno se forja la perfección.",
    },
  },
  {
    key: "libra",
    emoji: "♎",
    element: "air",
    ruler: { ko: "금성", en: "Venus", ja: "金星", zh: "金星", fr: "Vénus", es: "Venus" },
    dates: "9/23–10/22",
    name: { ko: "천칭자리", en: "Libra", ja: "天秤座", zh: "天秤座", fr: "Balance", es: "Libra" },
    color: "#67e8f9",
    luckyColor: { ko: "로즈 파우더", en: "Rose Powder", ja: "ローズパウダー", zh: "粉玫瑰", fr: "Rose poudré", es: "Rosa polvo" },
    luckyNumber: 7,
    companion: "aquarius",
    angle: 180,
    affirmation: {
      ko: "균형 잡힌 시선과 조화로운 조율이 최선의 해답을 찾아냅니다.",
      en: "Balanced perspective and graceful harmony uncover the highest solution.",
      ja: "バランスの取れた視線と調和の取れた歩み寄りが、最善の解を導きます。",
      zh: "平衡的视野与温雅的协调，能指引出最卓越的答案。",
      fr: "Un regard équilibré et une harmonie gracieuse révèlent la meilleure solution.",
      es: "La perspectiva equilibrada y la armonía elegante descubren la mejor solución.",
    },
  },
  {
    key: "scorpio",
    emoji: "♏",
    element: "water",
    ruler: { ko: "명왕성", en: "Pluto", ja: "冥王星", zh: "冥王星", fr: "Pluton", es: "Plutón" },
    dates: "10/23–11/21",
    name: { ko: "전갈자리", en: "Scorpio", ja: "蠍座", zh: "天蝎座", fr: "Scorpion", es: "Escorpio" },
    color: "#a855f7",
    luckyColor: { ko: "미드나잇 버건디", en: "Midnight Burgundy", ja: "ミッドナイトバーガンディ", zh: "午夜勃艮第", fr: "Bordeaux nuit", es: "Borgoña medianoche" },
    luckyNumber: 8,
    companion: "pisces",
    angle: 210,
    affirmation: {
      ko: "깊은 내면의 직관과 불굴의 집중력이 불가능을 돌파합니다.",
      en: "Profound inner intuition and unyielding focus transcend any obstacle.",
      ja: "深い内なる直感と不屈の集中力が、不可能を突破します。",
      zh: "深邃的内在直觉与坚韧的专注力，能冲破一切不可逾越的障碍。",
      fr: "Une intuition profonde et une concentration inébranlable brisent les limites.",
      es: "La intuición profunda y el enfoque inquebrantable superan cualquier obstáculo.",
    },
  },
  {
    key: "sagittarius",
    emoji: "♐",
    element: "fire",
    ruler: { ko: "목성", en: "Jupiter", ja: "木星", zh: "木星", fr: "Jupiter", es: "Júpiter" },
    dates: "11/22–12/21",
    name: { ko: "사수자리", en: "Sagittarius", ja: "射手座", zh: "射手座", fr: "Sagittaire", es: "Sagitario" },
    color: "#f59e0b",
    luckyColor: { ko: "로열 퍼플", en: "Royal Purple", ja: "ロイヤルパープル", zh: "皇家紫", fr: "Pourpre royal", es: "Púrpura real" },
    luckyNumber: 3,
    companion: "aries",
    angle: 240,
    affirmation: {
      ko: "넓은 시야와 끝없는 호기심이 삶의 새로운 지평을 넓힙니다.",
      en: "An expansive horizon and boundless curiosity broaden life's journey.",
      ja: "広い視野と尽きない好奇心が、人生の新しい地平を切り拓きます。",
      zh: "辽阔的视野与无止境的好奇心，不断拓宽生命的壮丽征程。",
      fr: "Un horizon vaste et une curiosité sans fin élargissent le chemin de vie.",
      es: "Un horizonte amplio y una curiosidad sin límites expanden el viaje de la vida.",
    },
  },
  {
    key: "capricorn",
    emoji: "♑",
    element: "earth",
    ruler: { ko: "토성", en: "Saturn", ja: "土星", zh: "土星", fr: "Saturne", es: "Saturno" },
    dates: "12/22–1/19",
    name: { ko: "염소자리", en: "Capricorn", ja: "山羊座", zh: "摩羯座", fr: "Capricorne", es: "Capricornio" },
    color: "#22c55e",
    luckyColor: { ko: "차콜 그레이", en: "Charcoal Slate", ja: "チャコールグレー", zh: "炭灰黑", fr: "Gris anthracite", es: "Gris carbón" },
    luckyNumber: 10,
    companion: "taurus",
    angle: 270,
    affirmation: {
      ko: "뚜렷한 목표와 묵묵한 발걸음이 정상의 영광을 약속합니다.",
      en: "Clear determination and steady paces guarantee triumph at the summit.",
      ja: "明確な目標と静かな歩みが、頂上での栄光を約束します。",
      zh: "清晰的目标与沉着稳健的步伐，必将抵达巅峰的荣光。",
      fr: "Une détermination claire et un pas mesuré mènent au sommet du succès.",
      es: "La determinación clara y el paso constante garantizan la cumbre del éxito.",
    },
  },
  {
    key: "aquarius",
    emoji: "♒",
    element: "air",
    ruler: { ko: "천왕성", en: "Uranus", ja: "天王星", zh: "天王星", fr: "Uranus", es: "Urano" },
    dates: "1/20–2/18",
    name: { ko: "물병자리", en: "Aquarius", ja: "水瓶座", zh: "水瓶座", fr: "Verseau", es: "Acuario" },
    color: "#06b6d4",
    luckyColor: { ko: "일렉트릭 블루", en: "Electric Blue", ja: "エレクトリックブルー", zh: "电光蓝", fr: "Bleu électrique", es: "Azul eléctrico" },
    luckyNumber: 11,
    companion: "gemini",
    angle: 300,
    affirmation: {
      ko: "관습을 넘어서는 독창적 통찰이 세상을 한 단계 전진시킵니다.",
      en: "Original foresight beyond conventions propels the world forward.",
      ja: "既成概念を超える独創的な発想が、世界を一歩先へと導きます。",
      zh: "打破常规的独创远见，将引领世界迈向崭新纪元。",
      fr: "Une vision originale au-delà des conventions fait avancer le monde.",
      es: "La visión original más allá de lo convencional impulsa al mundo hacia adelante.",
    },
  },
  {
    key: "pisces",
    emoji: "♓",
    element: "water",
    ruler: { ko: "해왕성", en: "Neptune", ja: "海王星", zh: "海王星", fr: "Neptune", es: "Neptuno" },
    dates: "2/19–3/20",
    name: { ko: "물고기자리", en: "Pisces", ja: "魚座", zh: "双鱼座", fr: "Poissons", es: "Piscis" },
    color: "#6366f1",
    luckyColor: { ko: "라벤더 블루", en: "Lavender Mist", ja: "ラベンダーミスト", zh: "熏衣草蓝", fr: "Brume lavande", es: "Niebla lavanda" },
    luckyNumber: 12,
    companion: "cancer",
    angle: 330,
    affirmation: {
      ko: "무한한 상상력과 맑은 영감이 아름다운 현실로 번져갑니다.",
      en: "Boundless imagination and pure inspiration gently blossom into reality.",
      ja: "無限の想像力と澄んだインスピレーションが、美しい現実へと花開きます。",
      zh: "无限的想象力与澄澈灵感，将在现实中温柔盛放。",
      fr: "Une imagination infinie et une inspiration pure s'épanouissent dans le réel.",
      es: "La imaginación infinita y la inspiración pura florecen con gracia en la realidad.",
    },
  },
];

const RADIUS = 2.4;
const TILT = (23.44 * Math.PI) / 180;

function toEclipticCoords(angleDeg: number, r: number): [number, number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  const x = Math.cos(rad) * r;
  const z = -Math.sin(rad) * r;
  const y = Math.sin(rad) * Math.sin(TILT) * r;
  return [x, y, z];
}

function StarField({ count = 180 }: { count?: number }) {
  const points = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4.0 + Math.random() * 2.5;
      const sinPhi = Math.sin(phi);
      arr[i * 3] = r * sinPhi * Math.cos(theta);
      arr[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={0xcbd5e1}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

function CelestialRings() {
  const ringPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 360;
      const [x, y, z] = toEclipticCoords(angle, RADIUS);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(ringPoints);
  }, [ringPoints]);

  return (
    <group>
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 }))} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RADIUS - 0.02, RADIUS + 0.02, 64]} />
        <meshBasicMaterial color={0x6366f1} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CenterCore({ activeColor }: { activeColor: string }) {
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!coreRef.current) return;
    const t = clock.getElapsedTime();
    coreRef.current.rotation.y = t * 0.2;
    coreRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color={activeColor} wireframe transparent opacity={0.7} />
      </mesh>
      <pointLight color={activeColor} intensity={1.5} distance={5} />
    </group>
  );
}

function ConstellationNodes({
  activeKey,
  onSelect,
  locale,
}: {
  activeKey: ZodiacSignKey;
  onSelect: (k: ZodiacSignKey) => void;
  locale: Locale;
}) {
  return (
    <group>
      {ZODIAC_SIGNS.map((sign) => {
        const [x, y, z] = toEclipticCoords(sign.angle, RADIUS);
        const isActive = sign.key === activeKey;

        return (
          <group key={sign.key} position={[x, y, z]}>
            <mesh onClick={() => onSelect(sign.key)}>
              <sphereGeometry args={[isActive ? 0.13 : 0.08, 16, 16]} />
              <meshBasicMaterial
                color={sign.color}
                transparent
                opacity={isActive ? 1 : 0.65}
              />
            </mesh>

            {isActive && (
              <mesh>
                <ringGeometry args={[0.16, 0.2, 24]} />
                <meshBasicMaterial color={sign.color} transparent opacity={0.8} side={THREE.DoubleSide} />
              </mesh>
            )}

            <Html
              center
              position={[0, isActive ? 0.35 : 0.26, 0]}
              zIndexRange={[10, 0]}
            >
              <button
                type="button"
                onClick={() => onSelect(sign.key)}
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm transition-transform hover:scale-110 ${
                  isActive
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/40 scale-105"
                    : "bg-background/80 text-foreground ring-1 ring-border/50 hover:bg-muted"
                }`}
              >
                <span>{sign.emoji}</span>{" "}
                <span>{sign.name[locale] ?? sign.name.en}</span>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function SceneCanvas({
  activeKey,
  onSelect,
  locale,
  autoRotate,
}: {
  activeKey: ZodiacSignKey;
  onSelect: (k: ZodiacSignKey) => void;
  locale: Locale;
  autoRotate: boolean;
}) {
  const currentSign = ZODIAC_SIGNS.find((s) => s.key === activeKey) ?? ZODIAC_SIGNS[0];
  const controlsRef = useRef<any>(null);

  return (
    <Canvas
      camera={{ position: [0, 3.2, 4.6], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "low-power" }}
    >
      <color attach="background" args={["#030712"]} />
      <ambientLight intensity={0.6} />
      <StarField />
      <CelestialRings />
      <CenterCore activeColor={currentSign.color} />
      <ConstellationNodes activeKey={activeKey} onSelect={onSelect} locale={locale} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.5}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 2 + 0.3}
        minPolarAngle={Math.PI / 6}
      />
    </Canvas>
  );
}

export interface ZodiacCelestial3DProps {
  locale: Locale;
  defaultSign?: ZodiacSignKey;
}

export default function ZodiacCelestial3D({
  locale,
  defaultSign = "aries",
}: ZodiacCelestial3DProps) {
  const [selectedKey, setSelectedKey] = useState<ZodiacSignKey>(defaultSign);
  const reducedMotion = useReducedMotion();
  const [autoRotate, setAutoRotate] = useState(!reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setAutoRotate(false);
    }
  }, [reducedMotion]);

  const activeSign = useMemo(
    () => ZODIAC_SIGNS.find((s) => s.key === selectedKey) ?? ZODIAC_SIGNS[0],
    [selectedKey]
  );

  const companionSign = useMemo(
    () => ZODIAC_SIGNS.find((s) => s.key === activeSign.companion) ?? ZODIAC_SIGNS[0],
    [activeSign.companion]
  );

  const handleSelect = useCallback((key: ZodiacSignKey) => {
    setSelectedKey(key);
  }, []);

  const elementLabel: Record<Locale, Record<ZodiacSignInfo["element"], string>> = {
    ko: { fire: "🔥 불 (열정·결단)", earth: "🌿 흙 (안정·결실)", air: "💨 공기 (지성·소통)", water: "💧 물 (직관·감수성)" },
    en: { fire: "🔥 Fire (Passion)", earth: "🌿 Earth (Stability)", air: "💨 Air (Intellect)", water: "💧 Water (Intuition)" },
    ja: { fire: "🔥 火 (情熱·決断)", earth: "🌿 地 (安定·結実)", air: "💨 風 (知性·対話)", water: "💧 水 (直感·感受性)" },
    zh: { fire: "🔥 火 (激情·决断)", earth: "🌿 土 (稳固·结实)", air: "💨 风 (智慧·沟通)", water: "💧 水 (直觉·感性)" },
    fr: { fire: "🔥 Feu (Passion)", earth: "🌿 Terre (Stabilité)", air: "💨 Air (Intellect)", water: "💧 Eau (Intuition)" },
    es: { fire: "🔥 Fuego (Pasión)", earth: "🌿 Tierra (Estabilidad)", air: "💨 Aire (Intelecto)", water: "💧 Agua (Intuición)" },
  };

  const uiText: Record<
    Locale,
    {
      title: string;
      desc: string;
      reset: string;
      pause: string;
      play: string;
      ruler: string;
      element: string;
      luckyNum: string;
      luckyCol: string;
      companion: string;
      todayAffirm: string;
      quickSelect: string;
    }
  > = {
    ko: {
      title: "3D 황도 12궁 천구 뷰어",
      desc: "3차원 황도 좌표계 속에서 나의 별자리를 회전 탐색하고 오늘의 우주 기운과 행운의 상징을 확인하세요.",
      reset: "기본 뷰 리셋",
      pause: "회전 일시정지",
      play: "자동 회전 시작",
      ruler: "수호 행성",
      element: "소속 원소",
      luckyNum: "행운의 숫자",
      luckyCol: "행운의 색상",
      companion: "최고의 조화 별자리",
      todayAffirm: "오늘의 우주 확언",
      quickSelect: "12별자리 빠른 선택",
    },
    en: {
      title: "3D Zodiac Celestial Wheel",
      desc: "Orbit through the 3D celestial sphere to explore your zodiac constellation and daily cosmic energy.",
      reset: "Reset View",
      pause: "Pause Orbit",
      play: "Resume Orbit",
      ruler: "Ruling Planet",
      element: "Element",
      luckyNum: "Lucky Number",
      luckyCol: "Lucky Color",
      companion: "Cosmic Companion",
      todayAffirm: "Cosmic Affirmation",
      quickSelect: "Quick Sign Selector",
    },
    ja: {
      title: "3D 黄道十二宮 天球ビューア",
      desc: "3次元の天球座標で自分の星座を回転探索し、今日の宇宙エネルギーと幸運のシンボルを確認しましょう。",
      reset: "リセット",
      pause: "回転停止",
      play: "自動回転",
      ruler: "守護星",
      element: "属性エレメント",
      luckyNum: "ラッキーナンバー",
      luckyCol: "ラッキーカラー",
      companion: "最高の相性星座",
      todayAffirm: "今日のアファメーション",
      quickSelect: "12星座クイック選択",
    },
    zh: {
      title: "3D 黄道十二星座 天球仪",
      desc: "在三维黄道坐标系中旋转探索属于你的星座，接收今日的宇宙能量与幸运指引。",
      reset: "重置视角",
      pause: "暂停旋转",
      play: "恢复旋转",
      ruler: "守护行星",
      element: "归属元素",
      luckyNum: "幸运数字",
      luckyCol: "幸运色彩",
      companion: "最佳默契星座",
      todayAffirm: "今日宇宙肯定语",
      quickSelect: "十二星座快速选择",
    },
    fr: {
      title: "Sphère Céleste 3D du Zodiaque",
      desc: "Naviguez dans la sphère céleste 3D pour explorer votre constellation et révéler l'énergie cosmique du jour.",
      reset: "Réinitialiser",
      pause: "Pause",
      play: "Rotation",
      ruler: "Planète maîtresse",
      element: "Élément",
      luckyNum: "Chiffre porte-bonheur",
      luckyCol: "Couleur faste",
      companion: "Signe complice",
      todayAffirm: "Affirmation Cosmique",
      quickSelect: "Sélecteur rapide",
    },
    es: {
      title: "Esfera Celeste 3D del Zodíaco",
      desc: "Explora la esfera celeste 3D para descubrir tu constelación y sintonizar con la energía cósmica del día.",
      reset: "Reiniciar",
      pause: "Pausar órbita",
      play: "Reanudar",
      ruler: "Planeta regente",
      element: "Elemento",
      luckyNum: "Número de la suerte",
      luckyCol: "Color favorable",
      companion: "Constelación afín",
      todayAffirm: "Afirmación Cósmica",
      quickSelect: "Selector rápido",
    },
  };

  const t = uiText[locale] ?? uiText.en;
  const curElement = elementLabel[locale]?.[activeSign.element] ?? elementLabel.en[activeSign.element];

  return (
    <div className="space-y-6">
      {/* 3D Celestial Container */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
        {/* Top Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto rounded-lg bg-background/80 px-3 py-1.5 backdrop-blur-sm border border-border/60">
            <h3 className="text-xs font-bold text-foreground">
              {t.title}
            </h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t.desc}
            </p>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm border border-border/60 hover:bg-muted"
            >
              {autoRotate ? t.pause : t.play}
            </button>
            <button
              type="button"
              onClick={() => setSelectedKey("aries")}
              className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm border border-border/60 hover:bg-muted"
            >
              {t.reset}
            </button>
          </div>
        </div>

        {/* 3D Scene Viewport */}
        <div className="h-80 sm:h-96 w-full cursor-grab active:cursor-grabbing">
          <SceneCanvas
            activeKey={selectedKey}
            onSelect={handleSelect}
            locale={locale}
            autoRotate={autoRotate}
          />
        </div>
      </div>

      {/* Quick Sign Selector */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">
          {t.quickSelect}
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {ZODIAC_SIGNS.map((s) => {
            const isSel = s.key === selectedKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => handleSelect(s.key)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center ${
                  isSel
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span className="text-base">{s.emoji}</span>
                <span className="text-xs mt-0.5">{s.name[locale] ?? s.name.en}</span>
                <span className="text-xs opacity-70">{s.dates}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Sign Detailed Energy Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{activeSign.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">
                  {activeSign.name[locale] ?? activeSign.name.en}
                </h3>
                <span className="text-xs text-muted-foreground">({activeSign.dates})</span>
              </div>
              <p className="text-xs text-primary font-medium mt-0.5">{curElement}</p>
            </div>
          </div>

          <div className="rounded-xl bg-primary/10 px-4 py-2 text-right">
            <span className="text-xs font-semibold text-primary block">{t.todayAffirm}</span>
            <p className="text-sm font-bold text-foreground mt-0.5">
              "{activeSign.affirmation[locale] ?? activeSign.affirmation.en}"
            </p>
          </div>
        </div>

        {/* 4 Attributes Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl bg-muted/20 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block">{t.ruler}</span>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              {activeSign.ruler[locale] ?? activeSign.ruler.en}
            </span>
          </div>

          <div className="rounded-xl bg-muted/20 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block">{t.luckyNum}</span>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              {activeSign.luckyNumber}
            </span>
          </div>

          <div className="rounded-xl bg-muted/20 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block">{t.luckyCol}</span>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              {activeSign.luckyColor[locale] ?? activeSign.luckyColor.en}
            </span>
          </div>

          <div className="rounded-xl bg-muted/20 p-3 border border-border/40">
            <span className="text-xs text-muted-foreground block">{t.companion}</span>
            <span className="text-sm font-semibold text-foreground mt-1 block">
              {companionSign.emoji} {companionSign.name[locale] ?? companionSign.name.en}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
