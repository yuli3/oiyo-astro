import { LocalizedText } from "@/types/manifest";

export type BloodType = "A" | "AB" | "B" | "O";

export interface BloodTypeShard {
  advice: Record<string, Record<BloodType, LocalizedText>>; // matchLevel -> BloodType -> advice
  synergy: Record<BloodType, Record<BloodType, number>>;
  traits: Record<
    BloodType,
    {
      description: LocalizedText;
      name: LocalizedText;
      negatives: LocalizedText[];
      positives: LocalizedText[];
    }
  >;
}

export const bloodTypeData: BloodTypeShard = {
  advice: {
    challenging: {
      A: {
        cn: "慢慢发展。",
        en: "Develop slowly.",
        es: "Desarrollen lentamente.",
        fr: "Développez lentement.",
        ja: "ゆっくりと発展させてください。",
        ko: "천천히 발전시키세요.",
      },
      AB: {
        cn: "需要时间。",
        en: "Requires time.",
        es: "Requiere tiempo.",
        fr: "Nécessite du temps.",
        ja: "時間が必要です。",
        ko: "시간이 필요합니다.",
      },
      B: {
        cn: "寻找妥协点。",
        en: "Find compromises.",
        es: "Encuentren compromisos.",
        fr: "Trouvez des compromis.",
        ja: "妥協点を見つけてください。",
        ko: "타협점을 찾으세요.",
      },
      O: {
        cn: "专注于优势。",
        en: "Focus on strengths.",
        es: "Concéntrense en las fortalezas.",
        fr: "Concentrez-vous sur les forces.",
        ja: "長所に集中してください.",
        ko: "장점에 집중하세요.",
      },
    },
    good: {
      A: {
        cn: "需要沟通努力。",
        en: "Effort to communicate.",
        es: "Esfuerzo de comunicación necesario.",
        fr: "Effort de communication nécessaire.",
        ja: "コミュニケーションの努力が必要です。",
        ko: "소통 노력이 필요합니다.",
      },
      AB: {
        cn: "缩小距离感。",
        en: "Reduce distance.",
        es: "Reduzcan la distancia.",
        fr: "Réduisez la distance.",
        ja: "距離を縮めてください。",
        ko: "거리감을 좁혀보세요.",
      },
      B: {
        cn: "建立信任。",
        en: "Build trust.",
        es: "Construyan confianza.",
        fr: "Bâtissez la confiance.",
        ja: "信頼を築いてください。",
        ko: "신뢰를 쌓아가세요.",
      },
      O: {
        cn: "表现出体谅。",
        en: "Show consideration.",
        es: "Muestren consideración.",
        fr: "Faites preuve de considération.",
        ja: "配慮を示してください。",
        ko: "배려를 보여주세요.",
      },
    },
    great: {
      A: {
        cn: "承认差异。",
        en: "Acknowledge differences.",
        es: "Reconozcan las diferencias.",
        fr: "Reconnaissez les différences.",
        ja: "違いを認めてください。",
        ko: "차이점을 인정하세요.",
      },
      AB: {
        cn: "敞开心扉。",
        en: "Open your heart.",
        es: "Abran su corazón.",
        fr: "Ouvrez votre cœur.",
        ja: "心を開いてください。",
        ko: "마음을 열어보세요.",
      },
      B: {
        cn: "平衡计划和创造力。",
        en: "Balance plans and creativity.",
        es: "Equilibren planes y creatividad.",
        fr: "Équilibrez plans et créativité.",
        ja: "計画と創造のバランスをとってください。",
        ko: "계획과 창의의 균형을 맞추세요.",
      },
      O: {
        cn: "配合彼此的步伐。",
        en: "Match your pace.",
        es: "Igualen su ritmo.",
        fr: "Adaptez votre rythme.",
        ja: "ペースを合わせてください。",
        ko: "서로의 속도를 맞추세요.",
      },
    },
    perfect: {
      A: {
        cn: "尊重彼此的谨慎。",
        en: "Respect each other's caution.",
        es: "Respeten la precaución del otro.",
        fr: "Respectez la prudence de chacun.",
        ja: "お互いの慎重さを尊重してください。",
        ko: "서로의 신중함을 존중하세요.",
      },
      AB: {
        cn: "建立深厚的共鸣。",
        en: "Build deep rapport.",
        es: "Construyan un vínculo profundo.",
        fr: "Établissez un lien profond.",
        ja: "深い絆を築いてください。",
        ko: "깊은 유대감을 형성하세요.",
      },
      B: {
        cn: "分享创造力。",
        en: "Share creativity.",
        es: "Compartan la creatividad.",
        fr: "Partagez votre créativité.",
        ja: "創造性を共有してください。",
        ko: "창의성을 공유하세요.",
      },
      O: {
        cn: "共同达成目标。",
        en: "Achieve goals together.",
        es: "Logren metas juntos.",
        fr: "Atteignez vos objectifs ensemble.",
        ja: "共に目標を達成してください。",
        ko: "함께 목표를 달성하세요.",
      },
    },
  },
  synergy: {
    A: { A: 85, AB: 75, B: 40, O: 70 },
    AB: { A: 75, AB: 90, B: 75, O: 50 },
    B: { A: 40, AB: 75, B: 80, O: 65 },
    O: { A: 70, AB: 50, B: 65, O: 85 },
  },
  traits: {
    A: {
      description: {
        cn: "完美主义者，谨慎且注重和谐的性格",
        en: "Perfectionist, cautious, and harmony-oriented personality",
        es: "Personalidad perfeccionista, cautelosa y orientada a la armonía",
        fr: "Personnalité perfectionniste, prudente et axée sur l'harmonie",
        ja: "完璧主義者で慎重、調和を重視する性格",
        ko: "완벽주의자이며 신중하고 조화를 중시하는 성격",
      },
      name: {
        cn: "A型",
        en: "Type A",
        es: "Tipo A",
        fr: "Type A",
        ja: "A型",
        ko: "A형",
      },
      negatives: [
        {
          cn: "焦虑",
          en: "Worrisome",
          es: "Preocupado",
          fr: "Inquiet",
          ja: "心配性",
          ko: "걱정이 많음",
        },
        {
          cn: "优柔寡断",
          en: "Indecisive",
          es: "Indeciso",
          fr: "Indécis",
          ja: "優柔不断",
          ko: "우유부단",
        },
      ],
      positives: [
        {
          cn: "负责任",
          en: "Responsible",
          es: "Responsable",
          fr: "Responsable",
          ja: "責任感",
          ko: "책임감",
        },
        {
          cn: "完美主义",
          en: "Perfectionist",
          es: "Perfeccionista",
          fr: "Perfectionniste",
          ja: "完璧主義",
          ko: "완벽주의",
        },
        {
          cn: "体贴",
          en: "Considerate",
          es: "Considerado",
          fr: "Attentionné",
          ja: "思いやり",
          ko: "배려심",
        },
      ],
    },
    AB: {
      description: {
        cn: "双重性格，理性和独特的性格",
        en: "Dual personality, rational and unique character",
        es: "Personalidad dual, carácter racional y único",
        fr: "Double personnalité, caractère rationnel et unique",
        ja: "二面性を持ち、合理的でユニークな性格",
        ko: "이중적 성격을 가지고 있으며 합리적이고 독특한 성격",
      },
      name: {
        cn: "AB型",
        en: "Type AB",
        es: "Tipo AB",
        fr: "Type AB",
        ja: "AB型",
        ko: "AB형",
      },
      negatives: [
        {
          cn: "不可预测",
          en: "Unpredictable",
          es: "Impredecible",
          fr: "Imprévisible",
          ja: "予測不可能",
          ko: "예측불가",
        },
        {
          cn: "疏远",
          en: "Distant",
          es: "Distante",
          fr: "Distant",
          ja: "距離感",
          ko: "거리감",
        },
      ],
      positives: [
        {
          cn: "理性",
          en: "Rational",
          es: "Racional",
          fr: "Rationnel",
          ja: "合理的",
          ko: "합리적",
        },
        {
          cn: "多才多艺",
          en: "Multitalented",
          es: "Multitalentoso",
          fr: "Multitalentueux",
          ja: "多才",
          ko: "다재다능",
        },
        {
          cn: "公平",
          en: "Fair",
          es: "Justo",
          fr: "Juste",
          ja: "公平",
          ko: "공정함",
        },
      ],
    },
    B: {
      description: {
        cn: "自由奔放、富有创造力和个性的性格",
        en: "Free-spirited, creative, and individualistic personality",
        es: "Personalidad de espíritu libre, creativa e individualista",
        fr: "Personnalité libre d'esprit, créative et individualiste",
        ja: "自由奔放で創造的、個性が強い性格",
        ko: "자유롭고 창의적이며 개성이 강한 성격",
      },
      name: {
        cn: "B型",
        en: "Type B",
        es: "Tipo B",
        fr: "Type B",
        ja: "B型",
        ko: "B형",
      },
      negatives: [
        {
          cn: "以自我为中心",
          en: "Self-centered",
          es: "Egocéntrico",
          fr: "Égocentrique",
          ja: "自己中心的",
          ko: "자기중심적",
        },
        {
          cn: "无计划",
          en: "Unplanned",
          es: "No planificado",
          fr: "Non planifié",
          ja: "無計画",
          ko: "계획성 부족",
        },
      ],
      positives: [
        {
          cn: "有创造力",
          en: "Creative",
          es: "Creativo",
          fr: "Créatif",
          ja: "創造的",
          ko: "창의적",
        },
        {
          cn: "适应性强",
          en: "Adaptable",
          es: "Adaptable",
          fr: "Adaptable",
          ja: "適応力",
          ko: "적응력",
        },
        {
          cn: "积极",
          en: "Positive",
          es: "Positivo",
          fr: "Positif",
          ja: "肯定的",
          ko: "긍정적",
        },
      ],
    },
    O: {
      description: {
        cn: "领导力强、现实且雄心勃勃的性格",
        en: "Strong leadership, realistic and ambitious personality",
        es: "Fuerte liderazgo, personalidad realista y ambiciosa",
        fr: "Leadership fort, personnalité réaliste et ambitieuse",
        ja: "リーダーシップが強く、現実的で意欲的な性格",
        ko: "리더십이 강하고 현실적이며 의욕적인 성격",
      },
      name: {
        cn: "O型",
        en: "Type O",
        es: "Tipo O",
        fr: "Type O",
        ja: "O型",
        ko: "O형",
      },
      negatives: [
        {
          cn: "不耐烦",
          en: "Impatient",
          es: "Impaciente",
          fr: "Impatient",
          ja: "せっかち",
          ko: "성급함",
        },
        {
          cn: "固执",
          en: "Stubborn",
          es: "Terco",
          fr: "Têtu",
          ja: "頑固",
          ko: "고집이 셈",
        },
      ],
      positives: [
        {
          cn: "领导力",
          en: "Leadership",
          es: "Liderazgo",
          fr: "Leadership",
          ja: "リーダーシップ",
          ko: "리더십",
        },
        {
          cn: "雄心勃勃",
          en: "Ambitious",
          es: "Ambicioso",
          fr: "Ambitieux",
          ja: "意欲적",
          ko: "의욕적",
        },
        {
          cn: "善于交际",
          en: "Sociable",
          es: "Sociable",
          fr: "Sociable",
          ja: "社交的",
          ko: "사교적",
        },
      ],
    },
  },
};
