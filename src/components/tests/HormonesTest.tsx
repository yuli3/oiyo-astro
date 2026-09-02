'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { QuestionnaireMatrix } from "@/components/ui/questionnaire-matrix";

interface Props { locale?: string; }

type HormoneType = "dopamine" | "serotonin" | "testosterone" | "estrogen" | "endorphin" | "oxytocin" | "cortisol";

const data = {
  ko: {
    title: "호르몬 성격 테스트: 나를 움직이는 호르몬은?",
    description: "14개의 질문으로 나의 주도적 호르몬 유형을 알아보세요.",
    questions: [
      { id: "q1", text: "나는 종종 새로운 경험을 찾고 새로운 활동에 흥분한다.", type: "dopamine" as HormoneType },
      { id: "q2", text: "나는 작업을 완료하거나 목표를 달성할 때 강한 성취감을 느낀다.", type: "dopamine" as HormoneType },
      { id: "q3", text: "나는 구조화된 일상과 정리된 환경을 선호한다.", type: "serotonin" as HormoneType },
      { id: "q4", text: "나는 일반적으로 내 삶에 만족하고 행복하다.", type: "serotonin" as HormoneType },
      { id: "q5", text: "나는 경쟁을 즐기고 종종 최고가 되기 위해 노력한다.", type: "testosterone" as HormoneType },
      { id: "q6", text: "나는 책임을 맡고 그룹을 위한 결정을 내리는 것이 편안하다.", type: "testosterone" as HormoneType },
      { id: "q7", text: "나는 다른 사람들이 어떻게 느끼는지 쉽게 감지하고 공감할 수 있다.", type: "estrogen" as HormoneType },
      { id: "q8", text: "나는 깊은 정서적 연결과 의미 있는 관계를 중요시한다.", type: "estrogen" as HormoneType },
      { id: "q9", text: "나는 목표를 달성하기 위해 신체적 불편함이나 통증을 견딜 수 있다.", type: "endorphin" as HormoneType },
      { id: "q10", text: "나는 격렬한 신체 활동이나 운동 후에 자연스러운 행복감을 느낀다.", type: "endorphin" as HormoneType },
      { id: "q11", text: "나는 다른 사람들을 돕거나 그들의 행복에 기여할 때 가장 충만함을 느낀다.", type: "oxytocin" as HormoneType },
      { id: "q12", text: "나의 관계에서 신체적 접촉과 친밀함은 중요하다.", type: "oxytocin" as HormoneType },
      { id: "q13", text: "나는 잠재적인 문제나 잘못될 수 있는 일에 대해 걱정하는 경향이 있다.", type: "cortisol" as HormoneType },
      { id: "q14", text: "나는 새롭거나 불확실한 상황에서 종종 경계하고 주의한다.", type: "cortisol" as HormoneType },
    ],
    options: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
    results: {
      dopamine: { emoji: "🎯", title: "도파민 유형 (Dopamine)", desc: "당신은 호기심, 흥분, 새로운 경험 추구에 의해 움직입니다. 뇌의 보상 시스템이 매우 활발하여 성취와 인정에 의해 동기부여됩니다." },
      serotonin: { emoji: "☯️", title: "세로토닌 유형 (Serotonin)", desc: "당신은 안정, 일상, 조화를 중요시합니다. 균형 잡힌 성격으로 대부분의 상황에서 침착하고 만족스러운 상태를 유지합니다." },
      testosterone: { emoji: "🏆", title: "테스토스테론 유형 (Testosterone)", desc: "당신은 본래 자기주장이 강하고, 경쟁적이며, 결단력이 있습니다. 책임을 맡는 것을 즐기며 목표를 달성하기 위해 위험을 감수하는 것을 두려워하지 않습니다." },
      estrogen: { emoji: "💗", title: "에스트로겐 유형 (Estrogen)", desc: "당신은 매우 공감적이고 정서적으로 지능적입니다. 다른 사람들과의 깊은 연결을 중요시하며 주변 사람들의 감정과 필요에 자연스럽게 맞춰져 있습니다." },
      endorphin: { emoji: "🏃", title: "엔도르핀 유형 (Endorphin)", desc: "당신은 회복력이 강하고 높은 통증 역치를 가지고 있습니다. 신체 활동에서 기쁨을 찾고 도전을 극복하는 자연스러운 능력이 있습니다." },
      oxytocin: { emoji: "🤗", title: "옥시토신 유형 (Oxytocin)", desc: "당신은 자연스럽게 깊은 유대와 연결을 형성하는 데 끌립니다. 관계를 육성하는 데서 성취감을 찾고 종종 그룹을 하나로 묶는 역할을 합니다." },
      cortisol: { emoji: "🔍", title: "코르티솔 유형 (Cortisol)", desc: "당신은 매우 경계하고 주의 깊으며, 잠재적인 문제를 예상하는 자연스러운 능력이 있습니다. 계획과 준비에 탁월합니다." },
    },
    retake: "다시하기", resultLabel: "나의 주도 호르몬 유형",
  },
  en: {
    title: "Hormone Personality Test: What Hormone Drives You?",
    description: "Find your dominant hormone type with 14 questions.",
    questions: [
      { id: "q1", text: "I often seek new experiences and get excited about novel activities.", type: "dopamine" as HormoneType },
      { id: "q2", text: "I feel a strong sense of accomplishment when I complete tasks or achieve goals.", type: "dopamine" as HormoneType },
      { id: "q3", text: "I prefer having a structured routine and organized environment.", type: "serotonin" as HormoneType },
      { id: "q4", text: "I generally feel content and satisfied with my life.", type: "serotonin" as HormoneType },
      { id: "q5", text: "I enjoy competition and often strive to be the best.", type: "testosterone" as HormoneType },
      { id: "q6", text: "I'm comfortable taking charge and making decisions for a group.", type: "testosterone" as HormoneType },
      { id: "q7", text: "I can easily sense how others are feeling and empathize with them.", type: "estrogen" as HormoneType },
      { id: "q8", text: "I value deep emotional connections and meaningful relationships.", type: "estrogen" as HormoneType },
      { id: "q9", text: "I can push through physical discomfort or pain to achieve my goals.", type: "endorphin" as HormoneType },
      { id: "q10", text: "I feel a natural high after intense physical activity or exercise.", type: "endorphin" as HormoneType },
      { id: "q11", text: "I feel most fulfilled when I'm helping others or contributing to their wellbeing.", type: "oxytocin" as HormoneType },
      { id: "q12", text: "Physical touch and closeness are important to me in my relationships.", type: "oxytocin" as HormoneType },
      { id: "q13", text: "I tend to worry about potential problems or what might go wrong.", type: "cortisol" as HormoneType },
      { id: "q14", text: "I'm often alert and vigilant in new or uncertain situations.", type: "cortisol" as HormoneType },
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    results: {
      dopamine: { emoji: "🎯", title: "Dopamine Type", desc: "You're driven by curiosity, excitement, and the pursuit of new experiences. Your brain's reward system is highly active, making you motivated by achievement and recognition." },
      serotonin: { emoji: "☯️", title: "Serotonin Type", desc: "You value stability, routine, and harmony. Your balanced nature helps you stay calm and content in most situations." },
      testosterone: { emoji: "🏆", title: "Testosterone Type", desc: "You're naturally assertive, competitive, and decisive. You enjoy taking charge and aren't afraid to take risks to achieve your goals." },
      estrogen: { emoji: "💗", title: "Estrogen Type", desc: "You're highly empathetic and emotionally intelligent. You value deep connections with others and are naturally attuned to the feelings and needs of those around you." },
      endorphin: { emoji: "🏃", title: "Endorphin Type", desc: "You're resilient and have a high pain threshold, both physically and emotionally. You find joy in physical activity and have a natural ability to overcome challenges." },
      oxytocin: { emoji: "🤗", title: "Oxytocin Type", desc: "You're naturally drawn to forming deep bonds and connections. You find fulfillment in nurturing relationships and are often the glue that holds groups together." },
      cortisol: { emoji: "🔍", title: "Cortisol Type", desc: "You're highly alert and vigilant, with a natural ability to anticipate potential problems. You excel at planning and preparation." },
    },
    retake: "Retake", resultLabel: "Your Dominant Hormone Type",
  },
  ja: {
    title: "ホルモン性格テスト：あなたを動かすホルモンは？",
    description: "14の質問であなたの主導ホルモンタイプを調べましょう。",
    questions: [
      { id: "q1", text: "私はよく新しい経験を求め、新しい活動に興奮する。", type: "dopamine" as HormoneType },
      { id: "q2", text: "課題を完了したり目標を達成したりすると、強い達成感を感じる。", type: "dopamine" as HormoneType },
      { id: "q3", text: "構造化された日常と整理された環境を好む。", type: "serotonin" as HormoneType },
      { id: "q4", text: "全体的に自分の人生に満足し、幸せを感じている。", type: "serotonin" as HormoneType },
      { id: "q5", text: "競争を楽しみ、しばしば一番になろうと努力する。", type: "testosterone" as HormoneType },
      { id: "q6", text: "責任を引き受け、グループのために決定を下すことが心地よい。", type: "testosterone" as HormoneType },
      { id: "q7", text: "他人がどう感じているかを簡単に察知し、共感できる。", type: "estrogen" as HormoneType },
      { id: "q8", text: "深い感情的なつながりと意味のある関係を大切にしている。", type: "estrogen" as HormoneType },
      { id: "q9", text: "目標を達成するために身体的な不快感や痛みに耐えられる。", type: "endorphin" as HormoneType },
      { id: "q10", text: "激しい身体活動や運動の後、自然な高揚感を感じる。", type: "endorphin" as HormoneType },
      { id: "q11", text: "他人を助けたり、その幸福に貢献したりするとき最も満たされる。", type: "oxytocin" as HormoneType },
      { id: "q12", text: "自分の関係において、身体的接触と親密さが重要だ。", type: "oxytocin" as HormoneType },
      { id: "q13", text: "潜在的な問題やうまくいかないかもしれないことについて心配する傾向がある。", type: "cortisol" as HormoneType },
      { id: "q14", text: "新しい状況や不確実な状況では、しばしば警戒し注意深くなる。", type: "cortisol" as HormoneType },
    ],
    options: ["全くそう思わない", "そう思わない", "普通", "そう思う", "非常にそう思う"],
    results: {
      dopamine: { emoji: "🎯", title: "ドーパミン型 (Dopamine)", desc: "あなたは好奇心、興奮、新しい経験の追求によって動かされます。脳の報酬系が非常に活発で、達成と承認によって動機づけられます。" },
      serotonin: { emoji: "☯️", title: "セロトニン型 (Serotonin)", desc: "あなたは安定、日常、調和を大切にします。バランスの取れた性格で、ほとんどの状況で落ち着いて満足した状態を保ちます。" },
      testosterone: { emoji: "🏆", title: "テストステロン型 (Testosterone)", desc: "あなたは本来自己主張が強く、競争的で、決断力があります。責任を引き受けることを楽しみ、目標達成のためにリスクを取ることを恐れません。" },
      estrogen: { emoji: "💗", title: "エストロゲン型 (Estrogen)", desc: "あなたは非常に共感的で感情的知性が高いです。他人との深いつながりを大切にし、周囲の人の感情やニーズに自然に寄り添います。" },
      endorphin: { emoji: "🏃", title: "エンドルフィン型 (Endorphin)", desc: "あなたは回復力が強く、高い痛みの閾値を持っています。身体活動に喜びを見出し、困難を克服する自然な力があります。" },
      oxytocin: { emoji: "🤗", title: "オキシトシン型 (Oxytocin)", desc: "あなたは自然に深い絆とつながりを形成することに惹かれます。関係を育むことに達成感を見出し、しばしばグループをまとめる役割を果たします。" },
      cortisol: { emoji: "🔍", title: "コルチゾール型 (Cortisol)", desc: "あなたは非常に警戒心が強く注意深く、潜在的な問題を予測する自然な力を持っています。計画と準備に優れています。" },
    },
    retake: "もう一度", resultLabel: "あなたの主導ホルモンタイプ",
  },
  zh: {
    title: "激素性格测试：驱动你的激素是什么？",
    description: "通过14个问题，找到你的主导激素类型。",
    questions: [
      { id: "q1", text: "我经常寻求新的体验，并对新活动感到兴奋。", type: "dopamine" as HormoneType },
      { id: "q2", text: "完成任务或达成目标时，我会感到强烈的成就感。", type: "dopamine" as HormoneType },
      { id: "q3", text: "我偏好有条理的日常和井然有序的环境。", type: "serotonin" as HormoneType },
      { id: "q4", text: "总体而言，我对自己的生活感到满足和幸福。", type: "serotonin" as HormoneType },
      { id: "q5", text: "我享受竞争，并常常努力争第一。", type: "testosterone" as HormoneType },
      { id: "q6", text: "我很自在地承担责任，并为团队做决定。", type: "testosterone" as HormoneType },
      { id: "q7", text: "我能轻易察觉他人的感受并产生共情。", type: "estrogen" as HormoneType },
      { id: "q8", text: "我重视深厚的情感联系和有意义的关系。", type: "estrogen" as HormoneType },
      { id: "q9", text: "为了达成目标，我能忍受身体上的不适或疼痛。", type: "endorphin" as HormoneType },
      { id: "q10", text: "在剧烈运动或体力活动后，我会感到一种自然的愉悦感。", type: "endorphin" as HormoneType },
      { id: "q11", text: "帮助他人或为他们的幸福做贡献时，我感到最充实。", type: "oxytocin" as HormoneType },
      { id: "q12", text: "在我的人际关系中，身体接触和亲密感很重要。", type: "oxytocin" as HormoneType },
      { id: "q13", text: "我倾向于担心潜在的问题或可能出错的事情。", type: "cortisol" as HormoneType },
      { id: "q14", text: "在新的或不确定的情况下，我常常保持警惕和谨慎。", type: "cortisol" as HormoneType },
    ],
    options: ["完全不符合", "不符合", "一般", "符合", "非常符合"],
    results: {
      dopamine: { emoji: "🎯", title: "多巴胺型 (Dopamine)", desc: "你受好奇心、兴奋感和对新体验的追求所驱动。你大脑的奖励系统非常活跃，成就与认可能带给你强烈的动力。" },
      serotonin: { emoji: "☯️", title: "血清素型 (Serotonin)", desc: "你重视稳定、规律和和谐。均衡的性格让你在大多数情况下都能保持冷静与满足。" },
      testosterone: { emoji: "🏆", title: "睾酮型 (Testosterone)", desc: "你天生自信、好胜且果断。你喜欢主动承担责任，也不惧为达成目标而冒险。" },
      estrogen: { emoji: "💗", title: "雌激素型 (Estrogen)", desc: "你极具同理心且情商很高。你重视与他人建立深厚的联系，也能自然地感知身边人的情绪与需求。" },
      endorphin: { emoji: "🏃", title: "内啡肽型 (Endorphin)", desc: "你有很强的韧性和较高的痛觉阈值。你在身体活动中找到快乐，并天生具备克服挑战的能力。" },
      oxytocin: { emoji: "🤗", title: "催产素型 (Oxytocin)", desc: "你天生倾向于建立深厚的纽带与联系。你在维系关系中找到成就感，常常是把团队凝聚在一起的人。" },
      cortisol: { emoji: "🔍", title: "皮质醇型 (Cortisol)", desc: "你高度警觉且细心，天生具备预见潜在问题的能力。你擅长规划与准备。" },
    },
    retake: "重新测试", resultLabel: "你的主导激素类型",
  },
  fr: {
    title: "Test de personnalité hormonale : quelle hormone vous fait avancer ?",
    description: "Découvrez votre type hormonal dominant à travers 14 questions.",
    questions: [
      { id: "q1", text: "Je recherche souvent de nouvelles expériences et je m'enthousiasme pour des activités inédites.", type: "dopamine" as HormoneType },
      { id: "q2", text: "Je ressens un fort sentiment d'accomplissement quand je termine une tâche ou atteins un objectif.", type: "dopamine" as HormoneType },
      { id: "q3", text: "Je préfère une routine structurée et un environnement organisé.", type: "serotonin" as HormoneType },
      { id: "q4", text: "En général, je me sens satisfait(e) et heureux(se) de ma vie.", type: "serotonin" as HormoneType },
      { id: "q5", text: "J'aime la compétition et je m'efforce souvent d'être le/la meilleur(e).", type: "testosterone" as HormoneType },
      { id: "q6", text: "Je suis à l'aise pour prendre les rênes et décider pour un groupe.", type: "testosterone" as HormoneType },
      { id: "q7", text: "Je perçois facilement les sentiments des autres et j'éprouve de l'empathie envers eux.", type: "estrogen" as HormoneType },
      { id: "q8", text: "Je valorise les connexions émotionnelles profondes et les relations significatives.", type: "estrogen" as HormoneType },
      { id: "q9", text: "Je peux surmonter un inconfort ou une douleur physique pour atteindre mes objectifs.", type: "endorphin" as HormoneType },
      { id: "q10", text: "Je ressens une euphorie naturelle après une activité physique intense.", type: "endorphin" as HormoneType },
      { id: "q11", text: "Je me sens le plus épanoui(e) quand j'aide les autres ou contribue à leur bien-être.", type: "oxytocin" as HormoneType },
      { id: "q12", text: "Le contact physique et la proximité sont importants pour moi dans mes relations.", type: "oxytocin" as HormoneType },
      { id: "q13", text: "J'ai tendance à m'inquiéter de problèmes potentiels ou de ce qui pourrait mal tourner.", type: "cortisol" as HormoneType },
      { id: "q14", text: "Je suis souvent vigilant(e) et sur mes gardes dans des situations nouvelles ou incertaines.", type: "cortisol" as HormoneType },
    ],
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    results: {
      dopamine: { emoji: "🎯", title: "Type Dopamine", desc: "Vous êtes animé(e) par la curiosité, l'excitation et la recherche de nouvelles expériences. Le système de récompense de votre cerveau est très actif, vous motivant par l'accomplissement et la reconnaissance." },
      serotonin: { emoji: "☯️", title: "Type Sérotonine", desc: "Vous valorisez la stabilité, la routine et l'harmonie. Votre nature équilibrée vous aide à rester calme et satisfait(e) dans la plupart des situations." },
      testosterone: { emoji: "🏆", title: "Type Testostérone", desc: "Vous êtes naturellement assertif(ve), compétitif(ve) et décisif(ve). Vous aimez prendre les commandes et n'avez pas peur de prendre des risques pour atteindre vos objectifs." },
      estrogen: { emoji: "💗", title: "Type Œstrogène", desc: "Vous êtes très empathique et émotionnellement intelligent(e). Vous valorisez les liens profonds avec les autres et êtes naturellement à l'écoute des sentiments et besoins de votre entourage." },
      endorphin: { emoji: "🏃", title: "Type Endorphine", desc: "Vous êtes résilient(e) et avez un seuil de douleur élevé. Vous trouvez de la joie dans l'activité physique et avez une capacité naturelle à surmonter les défis." },
      oxytocin: { emoji: "🤗", title: "Type Ocytocine", desc: "Vous êtes naturellement attiré(e) par la création de liens profonds. Vous trouvez de l'épanouissement à cultiver des relations et êtes souvent celui/celle qui soude un groupe." },
      cortisol: { emoji: "🔍", title: "Type Cortisol", desc: "Vous êtes très vigilant(e) et attentif(ve), avec une capacité naturelle à anticiper les problèmes potentiels. Vous excellez dans la planification et la préparation." },
    },
    retake: "Recommencer", resultLabel: "Votre type hormonal dominant",
  },
  es: {
    title: "Test de personalidad hormonal: ¿qué hormona te impulsa?",
    description: "Descubre tu tipo hormonal dominante con 14 preguntas.",
    questions: [
      { id: "q1", text: "A menudo busco nuevas experiencias y me emociono con actividades novedosas.", type: "dopamine" as HormoneType },
      { id: "q2", text: "Siento un fuerte sentido de logro cuando completo tareas o alcanzo metas.", type: "dopamine" as HormoneType },
      { id: "q3", text: "Prefiero una rutina estructurada y un entorno organizado.", type: "serotonin" as HormoneType },
      { id: "q4", text: "En general, me siento satisfecho(a) y contento(a) con mi vida.", type: "serotonin" as HormoneType },
      { id: "q5", text: "Disfruto de la competencia y a menudo me esfuerzo por ser el/la mejor.", type: "testosterone" as HormoneType },
      { id: "q6", text: "Me siento cómodo(a) tomando el mando y decidiendo por un grupo.", type: "testosterone" as HormoneType },
      { id: "q7", text: "Puedo percibir fácilmente cómo se sienten los demás y empatizar con ellos.", type: "estrogen" as HormoneType },
      { id: "q8", text: "Valoro las conexiones emocionales profundas y las relaciones significativas.", type: "estrogen" as HormoneType },
      { id: "q9", text: "Puedo superar la incomodidad o el dolor físico para lograr mis metas.", type: "endorphin" as HormoneType },
      { id: "q10", text: "Siento una euforia natural después de una actividad física intensa.", type: "endorphin" as HormoneType },
      { id: "q11", text: "Me siento más pleno(a) cuando ayudo a otros o contribuyo a su bienestar.", type: "oxytocin" as HormoneType },
      { id: "q12", text: "El contacto físico y la cercanía son importantes para mí en mis relaciones.", type: "oxytocin" as HormoneType },
      { id: "q13", text: "Tiendo a preocuparme por problemas potenciales o por lo que podría salir mal.", type: "cortisol" as HormoneType },
      { id: "q14", text: "A menudo estoy alerta y vigilante en situaciones nuevas o inciertas.", type: "cortisol" as HormoneType },
    ],
    options: ["Nunca", "Rara vez", "A veces", "A menudo", "Siempre"],
    results: {
      dopamine: { emoji: "🎯", title: "Tipo Dopamina", desc: "Te impulsan la curiosidad, la emoción y la búsqueda de nuevas experiencias. El sistema de recompensa de tu cerebro está muy activo, motivándote a través del logro y el reconocimiento." },
      serotonin: { emoji: "☯️", title: "Tipo Serotonina", desc: "Valoras la estabilidad, la rutina y la armonía. Tu naturaleza equilibrada te ayuda a mantener la calma y la satisfacción en la mayoría de las situaciones." },
      testosterone: { emoji: "🏆", title: "Tipo Testosterona", desc: "Eres naturalmente asertivo(a), competitivo(a) y decidido(a). Disfrutas tomando el mando y no temes asumir riesgos para lograr tus metas." },
      estrogen: { emoji: "💗", title: "Tipo Estrógeno", desc: "Eres muy empático(a) e inteligente emocionalmente. Valoras las conexiones profundas con los demás y sintonizas de forma natural con los sentimientos y necesidades de quienes te rodean." },
      endorphin: { emoji: "🏃", title: "Tipo Endorfina", desc: "Eres resiliente y tienes un alto umbral de dolor. Encuentras alegría en la actividad física y tienes una capacidad natural para superar desafíos." },
      oxytocin: { emoji: "🤗", title: "Tipo Oxitocina", desc: "Te atrae de forma natural formar vínculos y conexiones profundas. Encuentras plenitud cultivando relaciones y a menudo eres quien mantiene unido a un grupo." },
      cortisol: { emoji: "🔍", title: "Tipo Cortisol", desc: "Estás muy alerta y eres cauteloso(a), con una capacidad natural para anticipar problemas potenciales. Destacas en la planificación y la preparación." },
    },
    retake: "Repetir", resultLabel: "Tu tipo hormonal dominante",
  },
};

type SupportedLocale = keyof typeof data;
const SUPPORTED_LOCALES: SupportedLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const UI_LABELS: Record<SupportedLocale, {
  completed: (completed: number, total: number) => string;
  unanswered: (count: number) => string;
  submit: string;
  validation: string;
}> = {
  ko: { completed: (c, t) => `${c} / ${t} 응답`, unanswered: (c) => `미응답 ${c}개`, submit: "결과 보기", validation: "응답하지 않은 첫 문항으로 이동했습니다." },
  en: { completed: (c, t) => `${c} / ${t} answered`, unanswered: (c) => `${c} unanswered`, submit: "See Results", validation: "Moved to the first unanswered question." },
  ja: { completed: (c, t) => `${c} / ${t} 回答済み`, unanswered: (c) => `未回答 ${c}件`, submit: "結果を見る", validation: "未回答の最初の質問に移動しました。" },
  zh: { completed: (c, t) => `已回答 ${c} / ${t}`, unanswered: (c) => `未回答 ${c} 题`, submit: "查看结果", validation: "已跳转到第一个未回答的问题。" },
  fr: { completed: (c, t) => `${c} / ${t} réponses`, unanswered: (c) => `${c} sans réponse`, submit: "Voir les résultats", validation: "Vous avez été redirigé(e) vers la première question sans réponse." },
  es: { completed: (c, t) => `${c} / ${t} respondidas`, unanswered: (c) => `${c} sin responder`, submit: "Ver resultados", validation: "Se te ha llevado a la primera pregunta sin responder." },
};

export default function HormonesTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "hormones", title: "HormonesTest", finished: phase === "result" });

  const hormoneTypes: HormoneType[] = ["dopamine", "serotonin", "testosterone", "estrogen", "endorphin", "oxytocin", "cortisol"];
  const scores = Object.fromEntries(hormoneTypes.map((h) => [h, 0])) as Record<HormoneType, number>;

  t.questions.forEach((q) => {
    if (answers[q.id]) scores[q.type] += answers[q.id];
  });

  const topType = (Object.entries(scores) as [HormoneType, number][]).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  if (phase === "result") {
    const r = t.results[topType];
    return (
      <div className="not-prose my-10 p-8 bg-card border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-green-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
          <p className="text-slate-700 text-base leading-relaxed">{r.desc}</p>
        </div>
        <button onClick={() => { setAnswers({}); setPhase("quiz"); }} className="text-slate-400 text-sm hover:underline">{t.retake}</button>
        <ShareResultButton locale={lang} heading={t.title} resultTitle={r.title} emoji={r.emoji} />
      </div>
    );
  }

  return (
    <QuestionnaireMatrix
      title={t.title}
      description={t.description}
      questions={t.questions}
      options={t.options}
      answers={answers}
      completedLabel={ui.completed}
      unansweredLabel={ui.unanswered}
      submitLabel={ui.submit}
      validationLabel={ui.validation}
      onAnswer={(questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }))}
      onSubmit={() => setPhase("result")}
    />
  );
}
