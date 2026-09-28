import type { Locale } from '../i18n';

export interface TestSourceNote {
  basis: string[];
  /** 출처 표기를 마지막으로 고친 날. 없으면 첫 작성일(2026-06-13). */
  updated?: string;
  caution: 'clinical' | 'reflection' | 'symbolic' | 'style' | 'color' | 'finance';
}

export const TEST_SOURCE_NOTES: Record<string, TestSourceNote> = {
  adhd: {
    basis: ['Adult ADHD Self-Report Scale (ASRS v1.1)', 'WHO Composite International Diagnostic Interview screening structure'],
    caution: 'clinical',
  },
  anxiety: {
    basis: ['Generalized Anxiety Disorder 7-item scale (GAD-7)', 'brief anxiety screening literature'],
    caution: 'clinical',
  },
  'attachment-style': {
    basis: ['draft OIYO-authored 12-item reflection prompts', 'adult attachment anxiety/avoidance concepts (educational reference only)', 'not a validated or licensed ECR-family instrument'],
    caution: 'reflection',
  },
  'anger-style': {
    basis: ['Novaco anger model', 'State-Trait Anger Expression Inventory (STAXI) concepts'],
    caution: 'reflection',
  },
  authoritarian: {
    basis: ['Right-Wing Authoritarianism (RWA)', 'Social Dominance Orientation (SDO)', 'system justification theory'],
    caution: 'reflection',
  },
  big5: {
    basis: ['Big Five / Five-Factor Model', 'IPIP-style public-domain personality item structure'],
    caution: 'reflection',
  },
  'coping-style-test': {
    basis: [
      'Lazarus & Folkman transactional model of stress and coping (problem-focused vs emotion-focused)',
      'Brief COPE subscale structure (support seeking, disengagement)',
      'meaning-focused coping literature (Folkman)',
      '6-scenario OIYO-authored items — educational reference, not a validated instrument',
    ],
    caution: 'reflection',
  },
  'color-memory-test': {
    basis: [
      'casual visual recognition game: 4-8 colours shown briefly, then recognised',
      'set size grows with level, which is why later rounds feel harder',
      'not a memory assessment and not diagnostic of anything',
    ],
    caution: 'reflection',
  },
  'loneliness-test': {
    basis: [
      '10 OIYO-authored items on concepts from UCLA Loneliness Scale research (Russell, 1996) and the expectation–reality gap (Peplau & Perlman, 1982)',
      'measures the gap between expectation and reality, not the amount of social contact',
      'for self-observation, not clinical diagnosis',
    ],
    caution: 'reflection',
  },
  'conflict-style-test': {
    basis: [
      'OIYO-authored items — sorts how you tend to respond in conflict into styles',
      'does not use a validated conflict instrument (TKI and the like); not comparable to those scores',
    ],
    caution: 'style',
  },
  'breakup-recovery-test': {
    basis: [
      'OIYO-authored items — divides post-breakup recovery into storm, growth, solitude and turning phases',
      'inspired by grief-stage theory, but does not assume the stages arrive in order',
      'if grief disrupts daily functioning, see a professional rather than this result',
    ],
    caution: 'reflection',
  },
  'emotional-eating-test': {
    basis: [
      'OIYO-authored items — self-report on how mood and eating connect',
      'not an eating-disorder screening tool',
    ],
    caution: 'clinical',
  },
  'coffee-personality-test': {
    basis: [
      'for fun — uses coffee preference as a metaphor for personality',
      'claims no correlation between taste and personality; the result is conversation, not diagnosis',
    ],
    caution: 'color',
  },
  'animal-personality-test': {
    basis: [
      'for fun — talks about behavioural tendencies through animal symbols',
      'the animal metaphor is a memory aid with no taxonomic basis',
    ],
    caution: 'style',
  },
  'chimp-test': {
    basis: [
      'a casual game of remembering where numbers flashed',
      'named after the Kyoto University chimpanzee studies; does not reproduce their procedure',
      'not a working-memory measure and diagnoses nothing',
    ],
    caution: 'reflection',
  },
  'typing-speed-test': {
    basis: [
      'measures typing speed (WPM) and accuracy — not a psychological test',
      'values shift with keyboard, language and passage, so they are not for absolute comparison',
    ],
    caution: 'style',
  },
  'productivity-style-test': {
    basis: [
      'OIYO-authored items — looks at working style across deep-focus, multitasking, collaborative and flexible',
      'does not predict job performance; closer to a preference that shifts with environment',
    ],
    caution: 'style',
  },
  'thinking-patterns-test': {
    basis: [
      'OIYO-authored items — which way you lean first: analytical, creative, practical or relational',
      'a preference in approach, not a test of cognitive ability',
    ],
    caution: 'style',
  },
  'work-life-balance-test': {
    basis: [
      'OIYO-authored items — self-report on how you split time, energy and boundaries',
      'not a burnout screening tool; if exhaustion is the worry, take the burnout test',
    ],
    caution: 'reflection',
  },
  'digital-wellness-test': {
    basis: [
      'OIYO-authored items — where device use touches sleep, focus and relationships',
      'does not use addiction criteria (such as IGD) and should not be read as such',
    ],
    caution: 'clinical',
  },
  'risk-tolerance-test': {
    basis: [
      'OIYO-authored items — how you tend to choose when the outcome is uncertain',
      'not an investment suitability assessment; not a basis for choosing financial products',
    ],
    caution: 'finance',
  },
  'music-taste-test': {
    basis: [
      'five textures follow the MUSIC model — Rentfrow, Goldberg & Levitin (2011), J. Personality and Social Psychology 100(6)',
      'OIYO-authored items — 12 everyday listening scenes, not the original genre-rating instrument',
      'not a validated instrument; shows all five proportions instead of a single type',
    ],
    caution: 'style',
  },
  'friendship-style-test': {
    basis: [
      'OIYO-authored items — 12 everyday scenes sorted into five parts people take among friends',
      'draws on group-role language (initiator, energiser, coordinator, supporter, reflector) used in team literature',
      'not a validated instrument; shows all five proportions instead of a single type'
    ],
    caution: 'style',
  },
  'focus-blocker-test': {
    basis: [
      '10 OIYO-authored items — sorts where your focus breaks from',
      'not an ADHD screen; persistent attention difficulty calls for the ADHD test and a professional',
    ],
    caution: 'clinical',
  },
  burnout: {
    basis: ['Maslach Burnout Inventory (MBI) model', 'occupational stress and recovery literature'],
    caution: 'clinical',
  },
  depression: {
    basis: ['Patient Health Questionnaire-9 (PHQ-9)', 'brief depression screening literature'],
    caution: 'clinical',
  },
  empathy: {
    basis: ['12 original OIYO-authored reflection prompts', 'cognitive, affective, and compassionate empathy concepts (theory reference only)', 'not the IRI, Empathy Quotient, or a validated scale'],
    caution: 'reflection',
  },
  enneagram: {
    basis: ['Enneagram nine-type tradition', 'modern personality typology interpretation'],
    caution: 'symbolic',
  },
  eq: {
    basis: ['Mayer-Salovey emotional intelligence model', 'Goleman emotional competence framework'],
    caution: 'reflection',
  },
  'inner-strength': {
    basis: ['VIA character strengths framework', 'resilience and strengths-based psychology'],
    caution: 'reflection',
  },
  'investment-type': {
    basis: ['risk tolerance questionnaires', 'behavioral finance bias research'],
    caution: 'finance',
  },
  'lazy-perfectionist': {
    basis: ['perfectionism coping literature', 'procrastination and self-regulation models'],
    caution: 'reflection',
  },
  lethargy: {
    basis: ['behavioral activation principles', 'stress recovery and sleep hygiene literature'],
    caution: 'clinical',
  },
  'love-language': {
    basis: ['five love languages framework', 'relationship communication research'],
    caution: 'reflection',
  },
  'life-values-test': {
    basis: ['18 original OIYO-authored value cards', 'Schwartz values theory (theory reference only)', 'Wilson & Murrell values work (practice reference only)', 'not a validated values scale'],
    caution: 'reflection',
  },
  'career-values-test': {
    basis: ['18 original OIYO-authored work-value prompts across six dimensions', 'O*NET Work Values and CareerOneStop Work Values Matcher (concept references only)', 'not the retired O*NET Work Importance Locator and not a validated scale'],
    caution: 'reflection',
  },
  mbti: {
    basis: ['Jungian type theory', 'MBTI-style four preference axes'],
    caution: 'symbolic',
  },
  narcissism: {
    basis: ['Narcissistic Personality Inventory (NPI) concepts', 'grandiosity and vulnerability trait literature'],
    caution: 'clinical',
  },
  perfectionism: {
    basis: ['Frost Multidimensional Perfectionism Scale concepts', 'Almost Perfect Scale-Revised concepts'],
    caution: 'reflection',
  },
  'personal-color': {
    basis: ['seasonal color analysis tradition', 'personal styling color harmony principles'],
    caution: 'color',
  },
  political: {
    basis: ['two-axis political compass model', 'civic values and ideological orientation surveys'],
    caution: 'reflection',
  },
  'self-esteem': {
    basis: ['Rosenberg Self-Esteem Scale', 'self-worth and self-compassion research'],
    caution: 'reflection',
  },
  'sleep-type': {
    basis: ['Morningness-Eveningness Questionnaire concepts', 'Munich Chronotype Questionnaire concepts'],
    caution: 'reflection',
  },
  'social-anxiety': {
    basis: ['Social Interaction Anxiety Scale concepts', 'Liebowitz Social Anxiety Scale concepts'],
    caution: 'clinical',
  },
  riasec: {
    basis: ['Holland Occupational Themes (RIASEC)', "John Holland's theory of vocational personality types"],
    caution: 'reflection',
  },
  'stress-response': {
    basis: ["Fight-Flight-Freeze-Fawn (4F) stress response model concepts", "Cannon's fight-or-flight response theory"],
    caution: 'reflection',
  },
  'stress-type': {
    basis: ["Fight-Flight-Freeze-Fawn (4F) stress response model concepts", "Cannon's fight-or-flight response theory"],
    caution: 'reflection',
  },
  'riasec-quick': {
    basis: ['Holland Occupational Themes (RIASEC)', "John Holland's theory of vocational personality types"],
    caution: 'reflection',
  },
  saju: {
    basis: ['Four Pillars of Destiny (BaZi/사주팔자)', 'Chinese Five Elements (Wuxing) theory'],
    caution: 'symbolic',
  },
  natal: {
    basis: ['Western tropical astrology', 'natal chart calculation from birth date/time/location (Sun/Moon/Rising signs)'],
    caution: 'symbolic',
  },
  tarot: {
    basis: ['Tarot card tradition (Rider-Waite-Smith deck structure)', 'divinatory/reflective interpretation practice'],
    caution: 'symbolic',
  },
  workaholic: {
    basis: ['Bergen Work Addiction Scale (BWAS)', 'Griffiths behavioral addiction component model'],
    caution: 'reflection',
  },
  // 2026-09-28 O9: 설명 없이 검사만 있던 57개 페이지의 출처·한계 안내. 근거는 각 검사 컴포넌트가 밝힌 이론을 따른다.
  'english-level-test': {
    basis: ["Common European Framework of Reference for Languages (CEFR) levels A1–C2", "OIYO-authored 20-item placement check — not an official CEFR exam"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'optimism-test': {
    basis: ["Life Orientation Test–Revised (LOT-R; Scheier, Carver & Bridges, 1994) — several items follow the published wording", "four OIYO-added items; all ten are scored, so totals are not LOT-R scores", "dispositional optimism research"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'self-compassion-test': {
    basis: ["Self-Compassion Scale (Neff, 2003) concepts", "short-form self-compassion structure", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'color-personality-test': {
    basis: ["popular color–personality typing used as a self-exploration frame", "not a psychological instrument"],
    updated: '2026-09-28',
    caution: 'color',
  },
  'egogram-test': {
    basis: ["Transactional Analysis ego states (Berne)", "Dusay egogram — CP, NP, A, FC, AC"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'tci-personality-test': {
    basis: ["Cloninger Temperament and Character Inventory (TCI-R)", "abridged educational version — not the licensed inventory"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'introvert-extrovert-test': {
    basis: ["Jung's psychological types (introversion–extraversion)", "Big Five extraversion research"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'dopamine-dependency-test': {
    basis: ["reward-seeking and behavioral-addiction research on instant gratification", "OIYO-authored self-check — not a diagnostic scale"],
    updated: '2026-09-28',
    caution: 'clinical',
  },
  'leftbrain-test': {
    basis: ["popular left-brain/right-brain thinking-style framing", "hemispheric-dominance personality claims are not supported by neuroscience research"],
    updated: '2026-09-28',
    caution: 'symbolic',
  },
  'work-style-test': {
    basis: ["work-style and job-preference typologies", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'assertiveness-test': {
    basis: ["Rathus Assertiveness Schedule (RAS, 1973) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'trust-style-test': {
    basis: ["interpersonal trust research (Rotter's Interpersonal Trust Scale concepts)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'imposter-syndrome-test': {
    basis: ["Clance Impostor Phenomenon Scale (CIPS) concepts", "items rewritten by OIYO — not the CIPS item set"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'money-personality-test': {
    basis: ["money attitudes and money script research (Klontz et al.)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'finance',
  },
  'humor-style-test': {
    basis: ["Humor Styles Questionnaire (Martin et al., 2003) — affiliative, self-enhancing, aggressive, self-defeating", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'codependency-test': {
    basis: ["codependency concepts in family-systems and relationship research", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'business-type-test': {
    basis: ["entrepreneurial psychology and founder-role typologies", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'self-efficacy-test': {
    basis: ["General Self-Efficacy Scale (GSE; Schwarzer & Jerusalem, 1995) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'sensory-processing-test': {
    basis: ["Highly Sensitive Person construct (Aron & Aron, 1997)", "sensory processing sensitivity research", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'social-media-personality-test': {
    basis: ["social media use-style typologies", "entertainment framing — not a psychological measure"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'grit-scale-test': {
    basis: ["Grit Scale (Duckworth et al., 2007) concepts — passion and perseverance", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'emotional-expressiveness-test': {
    basis: ["Gross & John emotional expressivity research (Berkeley Expressivity Questionnaire concepts)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'gratitude-style-test': {
    basis: ["Gratitude Questionnaire (GQ-6; McCullough, Emmons & Tsang, 2002) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'curiosity-test': {
    basis: ["Curiosity and Exploration Inventory (CEI-II; Kashdan et al., 2009) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'playfulness-test': {
    basis: ["adult playfulness research (Proyer, OLIW model)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'cognitive-bias-test': {
    basis: ["heuristics-and-biases research (Tversky & Kahneman)", "scenario items written by OIYO — not a validated bias inventory"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'inner-child-test': {
    basis: ["inner-child concept from humanistic and schema-therapy writing", "not a clinical measure", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'happiness-meter-test': {
    basis: ["subjective well-being research (Diener; Oxford Happiness Questionnaire concepts)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'self-control-test': {
    basis: ["Brief Self-Control Scale (BSCS; Tangney, Baumeister & Boone, 2004) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'mindfulness-test': {
    basis: ["Mindful Attention Awareness Scale (MAAS; Brown & Ryan, 2003) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'emotional-labor-test': {
    basis: ["emotional labor theory (Hochschild, 1983) — surface and deep acting", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'personal-boundaries-test': {
    basis: ["interpersonal boundary concepts in counseling and relationship research", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'social-comparison-test': {
    basis: ["Iowa-Netherlands Comparison Orientation Measure (INCOM; Gibbons & Buunk, 1999) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'entrepreneurial-aptitude-test': {
    basis: ["Entrepreneurial Orientation research — risk-taking, innovativeness, proactiveness", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'compatibility-test': {
    basis: ["relationship satisfaction and similarity–complementarity research", "entertainment framing — does not predict relationship outcomes"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'communication-style-test': {
    basis: ["assertive, passive, aggressive and passive-aggressive communication styles (assertiveness-training literature)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'emotion-regulation-test': {
    basis: ["emotion regulation strategies (Gross process model — reappraisal, suppression)", "acceptance-based approaches (ACT, MBCT)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'shadow-self-test': {
    basis: ["Jung's concept of the shadow", "not a clinical measure", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'symbolic',
  },
  'self-concept-clarity-test': {
    basis: ["Self-Concept Clarity Scale (Campbell et al., 1996) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'decision-making-test': {
    basis: ["decision-making style research (Scott & Bruce General Decision-Making Style concepts)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'locus-of-control-test': {
    basis: ["locus of control (Rotter, 1966) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'money-anxiety-test': {
    basis: ["financial anxiety and money-script research (Klontz et al.)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'finance',
  },
  'relationship-boredom-test': {
    basis: ["relationship satisfaction and boredom research (Tsapelas, Aron & Orbuch, 2009)", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'creativity-type-test': {
    basis: ["divergent and convergent thinking (Guilford)", "creative-process typologies", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'fomo-test': {
    basis: ["Fear of Missing Out scale (Przybylski et al., 2013) concepts", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'spending-habits-test': {
    basis: ["consumer spending and impulse-buying research", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'finance',
  },
  'fear-type-test': {
    basis: ["fear and anxiety themes from psychology writing on core fears", "entertainment and self-reflection framing", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'learning-style-test': {
    basis: ["VARK learning preferences (Fleming)", "learning-style matching to instruction is not supported by evidence; use as a preference check only"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'jealousy-type-test': {
    basis: ["Multidimensional Jealousy Scale (Pfeiffer & Wong, 1989) concepts — cognitive, emotional, behavioral", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'color-aura-test': {
    basis: ["aura colors as a symbolic, New Age self-exploration frame", "not a scientific or psychological measure"],
    updated: '2026-09-28',
    caution: 'symbolic',
  },
  'toxic-relationship-test': {
    basis: ["relationship-pattern and coercive-control awareness literature", "not a safety assessment — seek help if you feel unsafe", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'clinical',
  },
  'parenting-style-test': {
    basis: ["Baumrind's parenting styles (authoritative, authoritarian, permissive) and Maccoby & Martin's extension", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'boundary-style-test': {
    basis: ["boundary styles (porous, rigid, healthy) from counseling literature", "OIYO-authored items — educational reference, not a validated instrument"],
    updated: '2026-09-28',
    caution: 'style',
  },
  'hexaco-personality-test': {
    basis: ["HEXACO model of personality (Ashton & Lee)", "abridged educational version — not the HEXACO-PI-R item set"],
    updated: '2026-09-28',
    caution: 'reflection',
  },
  'mbti-love-test': {
    basis: ["Myers-Briggs type language applied to relationships", "popular framing — not the official MBTI instrument"],
    updated: '2026-09-28',
    caution: 'symbolic',
  },
  'economics-school-test': {
    basis: ["schools of economic thought (classical, Keynesian, monetarist, Austrian, behavioral, and others)", "educational sorting — academic positions are more nuanced"],
    updated: '2026-09-28',
    caution: 'style',
  },
};

const CAUTION_TEXT: Record<TestSourceNote['caution'], Record<Locale, string>> = {
  clinical: {
    ko: '이 검사는 자기 점검용 선별 참고 자료이고 의학적 진단을 대신하지 않아요. 일상 기능에 어려움이 있거나 위험 신호가 있다면 전문가 상담을 먼저 받으세요.',
    en: 'This is a self-check screening reference, not a medical diagnosis. If symptoms affect daily life or feel unsafe, professional support comes first.',
    ja: 'これは自己点検のための参考スクリーニングであり、医学的診断ではありません。生活に支障がある場合は専門家への相談を優先してください。',
    zh: '这是自我检查用的筛查参考，并非医学诊断。如影响日常生活或出现危险信号，请优先寻求专业帮助。',
    fr: "Ceci est un repère d'auto-évaluation, pas un diagnostic médical. Si les symptômes perturbent le quotidien, consultez un professionnel.",
    es: 'Es una referencia de autoevaluación, no un diagnóstico médico. Si afecta tu vida diaria, prioriza el apoyo profesional.',
  },
  reflection: {
    ko: '결과는 고정된 성격 판정이 아니라 자기이해를 돕는 참고 신호예요. 실제 선택에는 상황, 경험, 주변 피드백을 함께 보세요.',
    en: 'Results are reflection signals, not fixed labels. Use them alongside context, experience, and feedback from people who know you.',
    ja: '結果は固定ラベルではなく自己理解の手がかりです。状況・経験・周囲のフィードバックと合わせて読んでください。',
    zh: '结果是自我理解的参考信号，而非固定标签。请结合情境、经验与他人反馈理解。',
    fr: "Les résultats sont des signaux de réflexion, pas des étiquettes fixes. Lisez-les avec votre contexte et vos expériences.",
    es: 'Los resultados son señales para reflexionar, no etiquetas fijas. Úsalos junto con tu contexto y experiencia.',
  },
  symbolic: {
    ko: '이 검사는 대중적인 유형 언어를 자기 성찰용으로 다시 짠 거예요. 사람을 단정하거나 중요한 결정을 대신하는 근거로 쓰지 마세요.',
    en: 'This test adapts popular type language for reflection. Do not use it to define a person or replace important decisions.',
    ja: 'このテストは一般的なタイプ言語を自己省察向けに再構成したものです。人を断定したり重要な判断の代わりにしないでください。',
    zh: '本测试将流行类型语言改编为自我反思工具。请勿用来定义他人或替代重要决策。',
    fr: "Ce test adapte un langage typologique populaire pour l'introspection. Il ne doit pas définir une personne ni remplacer une décision importante.",
    es: 'Este test adapta un lenguaje tipológico popular para la reflexión. No debe definir a una persona ni reemplazar decisiones importantes.',
  },
  // 2026-09-23: 이 문구는 색채 이론만 말하고 있었는데, 갈등 스타일·정신 동물·
  // 타자 속도·생산성·사고 습관까지 일곱 검사가 같이 쓰고 있었다. 동물 검사
  // 아래에 "색채와 스타일 이론은…" 이 뜨는 식이었다. 문구를 유형 분류 전반에
  // 맞게 고치고, 색채 전용 문구는 color 로 따로 둔다.
  style: {
    ko: '이 분류는 과학적 진단이 아니라 자기 경향을 살펴보는 도구예요. 사람을 한 유형으로 단정하지 말고 이야깃거리로 삼아 주세요.',
    en: 'This typology is a way to look at your own tendencies, not a scientific diagnosis. Use it as something to talk about, not a label for a person.',
    ja: 'この分類は科学的診断ではなく、自分の傾向を眺めるための道具です。人を一つの型に決めつけず、話のきっかけとして使ってください。',
    zh: '这个分类不是科学诊断，而是用来看看自己的倾向。别把人定成某一型，当作聊天的由头就好。',
    fr: "Cette typologie sert à observer vos tendances, ce n'est pas un diagnostic scientifique. Prenez-la comme un sujet de conversation, pas comme une étiquette.",
    es: 'Esta tipología sirve para mirar tus propias tendencias; no es un diagnóstico científico. Tómala como tema de conversación, no como etiqueta.',
  },
  color: {
    ko: '색채·스타일 이론은 과학적 진단이 아니라 취향을 탐색하는 도구예요. 결과는 어울림을 실험하는 출발점으로만 써 주세요.',
    en: 'Color and style theory is a preference exploration tool, not a scientific diagnosis. Treat results as a starting point for trying looks.',
    ja: '色彩・スタイル理論は科学的診断ではなく好みを探る道具です。結果は試すための出発点として使ってください。',
    zh: '色彩与风格理论不是科学诊断，而是探索偏好的工具。请把结果作为尝试搭配的起点。',
    fr: "La théorie couleur/style explore les préférences, ce n'est pas un diagnostic scientifique. Utilisez le résultat comme point de départ.",
    es: 'La teoría de color y estilo explora preferencias, no es un diagnóstico científico. Usa el resultado como punto de partida.',
  },
  finance: {
    ko: '투자 성향 결과는 교육용 자기 점검이고 금융 조언이 아니에요. 실제 투자 판단은 개인 재무 상황과 전문가 조언을 함께 고려하세요.',
    en: 'Investment-style results are educational self-checks, not financial advice. Real decisions should consider your finances and qualified advice.',
    ja: '投資タイプの結果は教育目的の自己点検であり金融助言ではありません。実際の判断は個人状況と専門助言を考慮してください。',
    zh: '投资类型结果仅为教育性自检，不构成金融建议。实际投资应结合个人财务状况与专业建议。',
    fr: "Le résultat d'investissement est éducatif, pas un conseil financier. Décidez avec votre situation et un avis qualifié.",
    es: 'El resultado de inversión es educativo, no asesoría financiera. Decide considerando tu situación y consejo cualificado.',
  },
};

export function getTestSourceNote(pathWithoutLocale: string): TestSourceNote | undefined {
  const parts = pathWithoutLocale.split('/').filter(Boolean);
  if (parts.at(-1) === 'test') return TEST_SOURCE_NOTES[parts.slice(0, -1).join('/')];
  const standaloneTest = parts.at(-1);
  return standaloneTest?.endsWith('-test') ? TEST_SOURCE_NOTES[standaloneTest] : undefined;
}

export function getCautionText(caution: TestSourceNote['caution'], locale: Locale): string {
  return CAUTION_TEXT[caution][locale] ?? CAUTION_TEXT[caution].en;
}
