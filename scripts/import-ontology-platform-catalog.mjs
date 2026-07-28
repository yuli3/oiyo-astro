import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";
import vm from "node:vm";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const PLATFORM_ROOT = resolve(ROOT, "config/ontology-platform/v1");
const EXPANSION_ROOT = resolve(ROOT, "config/ontology-platform/v2");
const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"];
const FACETS = ["create", "repair", "protect", "record", "explore", "physical", "social", "precision", "structure", "autonomy", "care", "novelty"];
const LEGACY_GRAPH_ALIASES = { "hobby.gardening": ["gardening"] };
const ACTION_VOCABULARY_II_IDS = { collaborate: "contribute", mediate: "arbitrate", advocate: "champion", persuade: "frame_argument", operate: "supervise_operations", write: "draft", perform: "rehearse", explain: "interpret_for_audience", teach: "instruct", train: "drill", mentor: "advise", measure: "quantify" };
const HOBBY_VOCABULARY_III_IDS = { card_games: "traditional_card_games", candle_making: "beeswax_candle_making", soap_making: "cold_process_soap_making", beadwork: "seed_beadwork", miniature_making: "miniature_scene_making", map_reading: "transit_map_reading", bird_identification: "backyard_bird_identification", mahjong: "mahjong_strategy", music_listening: "active_music_listening" };

const HOBBY_LABELS = {
  HOBBY_GARDENING: ["원예", "Gardening", "ガーデニング", "园艺", "Jardinage", "Jardinería"], HOBBY_MEDITATION: ["명상", "Meditation", "瞑想", "冥想", "Méditation", "Meditación"],
  HOBBY_HIKING: ["등산", "Hiking", "ハイキング", "徒步", "Randonnée", "Senderismo"], HOBBY_COOKING: ["요리", "Cooking", "料理", "烹饪", "Cuisine", "Cocina"],
  HOBBY_CODING: ["코딩", "Coding", "コーディング", "编程", "Programmation", "Programación"], HOBBY_PHOTOGRAPHY: ["사진", "Photography", "写真", "摄影", "Photographie", "Fotografía"],
  HOBBY_READING: ["독서", "Reading", "読書", "阅读", "Lecture", "Lectura"], HOBBY_YOGA: ["요가", "Yoga", "ヨガ", "瑜伽", "Yoga", "Yoga"],
  HOBBY_BOARD_GAMES: ["보드게임", "Board games", "ボードゲーム", "桌游", "Jeux de société", "Juegos de mesa"], HOBBY_WRITING: ["글쓰기", "Writing", "執筆", "写作", "Écriture", "Escritura"],
  HOBBY_SWIMMING: ["수영", "Swimming", "水泳", "游泳", "Natation", "Natación"], HOBBY_ASTRONOMY: ["천문 관측", "Astronomy", "天体観測", "天文观测", "Astronomie", "Astronomía"],
  HOBBY_PAINTING: ["그림", "Painting", "絵画", "绘画", "Peinture", "Pintura"], HOBBY_VOLUNTEERING: ["봉사활동", "Volunteering", "ボランティア", "志愿服务", "Bénévolat", "Voluntariado"],
  HOBBY_CHESS: ["체스", "Chess", "チェス", "国际象棋", "Échecs", "Ajedrez"], HOBBY_CYCLING: ["자전거", "Cycling", "サイクリング", "骑行", "Cyclisme", "Ciclismo"],
  HOBBY_POTTERY: ["도예", "Pottery", "陶芸", "陶艺", "Poterie", "Cerámica"], HOBBY_DANCING: ["춤", "Dancing", "ダンス", "舞蹈", "Danse", "Baile"],
  HOBBY_PHILOSOPHY: ["철학", "Philosophy", "哲学", "哲学", "Philosophie", "Filosofía"], HOBBY_ROCK_CLIMBING: ["암벽등반", "Rock climbing", "ロッククライミング", "攀岩", "Escalade", "Escalada"],
  HOBBY_MUSIC_COMPOSITION: ["작곡", "Music composition", "作曲", "作曲", "Composition musicale", "Composición musical"], HOBBY_DEBATING: ["토론", "Debating", "ディベート", "辩论", "Débat", "Debate"],
  HOBBY_LINGUISTICS: ["언어학", "Linguistics", "言語学", "语言学", "Linguistique", "Lingüística"], HOBBY_MARCHIAL_ARTS: ["무술", "Martial arts", "武道", "武术", "Arts martiaux", "Artes marciales"],
  HOBBY_WOODWORKING: ["목공", "Woodworking", "木工", "木工", "Menuiserie", "Carpintería"]
};

const LEGACY_CONTEXTS = [
  ["software_delivery", ["소프트웨어 제작 환경", "Software delivery setting", "ソフトウェア開発の現場", "软件交付环境", "Conception logicielle", "Entorno de desarrollo de software"], [3,2,0,2,3,0,2,3,3,2,0,3]],
  ["data_inquiry", ["데이터 탐구 환경", "Data inquiry setting", "データ探究の現場", "数据探究环境", "Analyse de données", "Entorno de análisis de datos"], [1,1,0,3,3,0,1,3,3,2,0,2]],
  ["security_response", ["보안 대응 환경", "Security response setting", "セキュリティ対応の現場", "安全响应环境", "Réponse de sécurité", "Entorno de respuesta de seguridad"], [1,2,3,2,3,1,2,3,3,2,1,2]],
  ["product_design", ["제품 설계 환경", "Product design setting", "プロダクト設計の現場", "产品设计环境", "Conception de produit", "Entorno de diseño de producto"], [3,1,0,2,3,0,3,2,2,2,1,3]],
  ["market_communication", ["시장 소통 환경", "Market communication setting", "市場コミュニケーションの現場", "市场沟通环境", "Communication de marché", "Entorno de comunicación de mercado"], [2,0,0,2,2,0,3,1,1,3,1,3]],
  ["financial_analysis", ["재무 분석 환경", "Financial analysis setting", "財務分析の現場", "财务分析环境", "Analyse financière", "Entorno de análisis financiero"], [0,1,1,3,2,0,1,3,3,2,0,1]],
  ["people_development", ["사람 성장 지원 환경", "People development setting", "人の成長支援の現場", "人才发展支持环境", "Développement des personnes", "Entorno de desarrollo de personas"], [1,0,1,2,2,0,3,2,2,2,3,2]],
  ["education_facilitation", ["교육 진행 환경", "Education facilitation setting", "教育を進める現場", "教育引导环境", "Animation pédagogique", "Entorno de facilitación educativa"], [2,0,1,2,2,0,3,2,2,2,3,2]],
  ["legal_reasoning", ["법률 해석·논증 환경", "Legal reasoning setting", "法的解釈と論証の現場", "法律推理环境", "Raisonnement juridique", "Entorno de razonamiento jurídico"], [1,0,2,3,2,0,3,3,3,2,1,1]],
  ["clinical_care", ["임상 돌봄 환경", "Clinical care setting", "臨床ケアの現場", "临床照护环境", "Soins cliniques", "Entorno de atención clínica"], [0,1,3,2,1,2,3,3,3,1,3,1]],
  ["construction_delivery", ["건설·현장 제작 환경", "Construction delivery setting", "建設・現場制作の現場", "施工与现场制作环境", "Construction sur site", "Entorno de construcción en obra"], [3,3,1,1,1,3,2,3,3,1,1,1]],
  ["operations_coordination", ["운영 조정 환경", "Operations coordination setting", "業務調整の現場", "运营协调环境", "Coordination des opérations", "Entorno de coordinación operativa"], [1,1,1,3,1,1,3,3,3,2,1,1]],
  ["research_discovery", ["연구·발견 환경", "Research discovery setting", "研究・発見の現場", "研究发现环境", "Recherche et découverte", "Entorno de investigación y descubrimiento"], [1,0,0,3,3,0,1,3,2,3,0,3]],
  ["creative_production", ["창작 제작 환경", "Creative production setting", "創作制作の現場", "创作制作环境", "Production créative", "Entorno de producción creativa"], [3,0,0,2,2,1,2,2,1,3,0,3]],
  ["public_service", ["공공 서비스 환경", "Public service setting", "公共サービスの現場", "公共服务环境", "Service public", "Entorno de servicio público"], [1,1,3,2,1,1,3,2,3,1,3,1]],
  ["environmental_stewardship", ["환경 관리 환경", "Environmental stewardship setting", "環境管理の現場", "环境管理环境", "Gestion environnementale", "Entorno de gestión ambiental"], [1,1,3,2,2,2,2,2,2,2,3,2]],
  ["transport_navigation", ["운송·항법 환경", "Transport and navigation setting", "輸送・航法の現場", "运输与导航环境", "Transport et navigation", "Entorno de transporte y navegación"], [0,1,2,1,2,2,1,3,3,2,1,2]],
  ["hospitality_service", ["환대 서비스 환경", "Hospitality service setting", "ホスピタリティの現場", "接待服务环境", "Service d'hospitalité", "Entorno de hospitalidad"], [1,0,1,1,1,2,3,1,2,2,3,2]],
  ["media_storytelling", ["미디어 스토리텔링 환경", "Media storytelling setting", "メディア表現の現場", "媒体叙事环境", "Narration médiatique", "Entorno de narración multimedia"], [3,0,0,2,2,0,3,2,1,3,1,3]],
  ["emergency_response", ["긴급 대응 환경", "Emergency response setting", "緊急対応の現場", "紧急响应环境", "Intervention d'urgence", "Entorno de respuesta a emergencias"], [0,1,3,1,1,3,3,2,3,1,3,2]]
];

const OCCUPATIONS = [
  ["software-engineer", "software_delivery"], ["data-analyst", "data_inquiry"], ["cybersecurity-specialist", "security_response"], ["content-creator", "media_storytelling"], ["ux-designer", "product_design"], ["architect", "product_design"], ["product-manager", "operations_coordination"], ["marketing-manager", "market_communication"], ["financial-advisor", "financial_analysis"], ["human-resources", "people_development"], ["nurse", "clinical_care", "registered_nurse"], ["physician", "clinical_care"], ["pharmacist", "clinical_care"], ["veterinarian", "clinical_care"], ["teacher", "education_facilitation"], ["kindergarten-teacher", "education_facilitation"], ["art-teacher", "education_facilitation"], ["music-teacher", "education_facilitation"], ["pe-teacher", "education_facilitation"], ["academic-advisor", "education_facilitation"], ["psychologist", "people_development"], ["lawyer", "legal_reasoning"], ["judge", "legal_reasoning"], ["paralegal", "legal_reasoning"], ["corporate-lawyer", "legal_reasoning"], ["criminal-defense-lawyer", "legal_reasoning"], ["family-lawyer", "legal_reasoning"], ["ip-lawyer", "legal_reasoning"], ["legal-consultant", "legal_reasoning"], ["compliance-officer", "legal_reasoning"], ["mediator", "legal_reasoning"], ["chef", "hospitality_service"], ["pilot", "transport_navigation"], ["cpa-accountant", "financial_analysis"], ["construction-manager", "construction_delivery"], ["electrician-licensed", "construction_delivery"], ["interior-designer-residential", "product_design"], ["plumber", "construction_delivery"], ["carpenter", "construction_delivery"], ["mechanic", "construction_delivery"], ["welder", "construction_delivery"], ["ai-ml-engineer", "software_delivery"], ["cloud-architect", "software_delivery"], ["data-scientist", "data_inquiry"], ["game-developer", "software_delivery"], ["biologist", "research_discovery"], ["environmental-scientist", "environmental_stewardship"], ["journalist", "media_storytelling"], ["firefighter", "emergency_response"], ["social-worker", "public_service"],
  ["frontend-developer", "software_delivery"], ["backend-developer", "software_delivery"], ["mobile-developer-ios", "software_delivery"], ["mobile-developer-android", "software_delivery"], ["devops-engineer", "software_delivery"], ["qa-engineer", "software_delivery"], ["network-engineer", "software_delivery"], ["database-administrator", "data_inquiry"], ["systems-administrator", "software_delivery"], ["it-support-specialist", "operations_coordination"], ["technical-writer", "media_storytelling"], ["robotics-engineer", "research_discovery"], ["security-analyst", "security_response"], ["full-stack-developer", "software_delivery"], ["site-reliability-engineer", "software_delivery"], ["data-engineer", "data_inquiry"], ["product-designer", "product_design"], ["ui-designer", "product_design"], ["penetration-tester", "security_response"], ["cloud-engineer", "software_delivery"], ["scrum-master", "operations_coordination"], ["technical-program-manager", "operations_coordination"], ["developer-advocate", "market_communication"], ["qa-automation-engineer", "software_delivery"],
  ["management-consultant", "operations_coordination"], ["business-analyst", "data_inquiry"], ["sales-manager", "market_communication"], ["supply-chain-manager", "operations_coordination"], ["operations-manager", "operations_coordination"], ["hr-manager", "people_development"], ["project-manager", "operations_coordination"], ["account-executive", "market_communication"], ["event-planner", "hospitality_service"], ["operations-analyst", "data_inquiry"], ["business-intelligence-analyst", "data_inquiry"], ["seo-specialist", "market_communication"], ["public-relations-specialist", "market_communication"], ["brand-manager", "market_communication"], ["sales-engineer", "market_communication"], ["customer-success-manager", "people_development"],
  ["accountant", "financial_analysis"], ["auditor", "financial_analysis"], ["actuary", "financial_analysis"], ["tax-consultant", "financial_analysis"], ["underwriter", "financial_analysis"], ["budget-analyst", "financial_analysis"], ["loan-officer", "financial_analysis"], ["treasurer", "financial_analysis"], ["recruiter", "people_development"], ["training-manager", "people_development"]
];

// Every source career receives exactly one non-decisive work-context example.
// The explicit map preserves reviewed domain assignments; the RIASEC fallback only
// supplies a navigational context for the remaining catalog, never a fit verdict.
const DEFAULT_CONTEXT_BY_RIASEC = { R: "construction_delivery", I: "research_discovery", A: "creative_production", S: "people_development", E: "market_communication", C: "operations_coordination" };

// Secondary examples keep every work context navigable without making any job a verdict.
const CONTEXT_EXAMPLE_EDGES = [
  ["client_advocacy", "occupation.mediator", "mediator"], ["troubleshooting", "occupation.mechanic", "mechanic"],
  ["software_delivery", "occupation.full_stack_developer", "full-stack-developer"], ["data_inquiry", "occupation.business_intelligence_analyst", "business-intelligence-analyst"],
  ["security_response", "occupation.penetration_tester", "penetration-tester"], ["product_design", "occupation.product_designer", "product-designer"],
  ["market_communication", "occupation.public_relations_specialist", "public-relations-specialist"], ["financial_analysis", "occupation.auditor", "auditor"],
  ["people_development", "occupation.recruiter", "recruiter"], ["education_facilitation", "occupation.training_manager", "training-manager"],
  ["legal_reasoning", "occupation.compliance_officer", "compliance-officer"], ["clinical_care", "occupation.pharmacist", "pharmacist"],
  ["construction_delivery", "occupation.carpenter", "carpenter"], ["operations_coordination", "occupation.project_manager", "project-manager"],
  ["research_discovery", "occupation.robotics_engineer", "robotics-engineer"], ["creative_production", "occupation.content_creator", "content-creator"],
  ["public_service", "occupation.social_worker", "social-worker"], ["environmental_stewardship", "occupation.environmental_scientist", "environmental-scientist"],
  ["transport_navigation", "occupation.pilot", "pilot"], ["hospitality_service", "occupation.event_planner", "event-planner"],
  ["media_storytelling", "occupation.technical_writer", "technical-writer"], ["emergency_response", "occupation.firefighter", "firefighter"]
];

// Editorial action links are semantic claims; they must not be inferred from a vector alone.
const HOBBY_ACTION_EDGES = [
  ["gardening", "care"], ["meditation", "care"], ["hiking", "explore"], ["cooking", "create"], ["coding", "create"], ["photography", "record"], ["reading", "explore"], ["yoga", "care"], ["board_games", "explore"], ["writing", "write"], ["swimming", "run_physical"], ["astronomy", "explore"], ["painting", "create"], ["volunteering", "care"], ["chess", "explore"], ["cycling", "run_physical"], ["pottery", "create"], ["dancing", "run_physical"], ["philosophy", "explore"], ["rock_climbing", "run_physical"], ["music_composition", "create"], ["debating", "write"], ["linguistics", "record"], ["marchial_arts", "protect"], ["woodworking", "repair"],
  ["running", "run_physical"], ["strength_training", "run_physical"], ["pilates", "care"], ["tennis", "run_physical"], ["badminton", "run_physical"], ["guitar", "create"], ["piano", "create"], ["singing", "create"], ["illustration", "create"], ["calligraphy", "write"], ["knitting", "create"], ["sewing", "repair"], ["baking", "create"], ["coffee_brewing", "create"], ["tea_tasting", "care"], ["fermentation", "create"], ["camping", "explore"], ["fishing", "explore"], ["birdwatching", "explore"], ["travel_planning", "travel"], ["language_learning", "explore"], ["journaling", "record"], ["podcast_listening", "record"], ["open_source", "create"], ["home_repair", "repair"]
];

const SEED_EDGES = [
  ["action.create", "hobby.brick_building", "expressed_by", .92], ["action.create", "hobby.woodworking", "expressed_by", .91], ["action.repair", "hobby.woodworking", "expressed_by", .78], ["action.repair", "work_context.troubleshooting", "used_in", .94], ["action.run_physical", "hobby.swimming", "related_to", .72], ["action.protect", "work_context.emergency_response", "used_in", .93], ["action.protect", "work_context.clinical_care", "used_in", .8], ["action.record", "work_context.client_advocacy", "used_in", .76], ["action.write", "work_context.client_advocacy", "used_in", .79], ["action.drive_vehicle", "work_context.emergency_response", "used_in", .62], ["action.explore", "work_context.troubleshooting", "used_in", .68], ["action.care", "work_context.clinical_care", "used_in", .95], ["hobby.yoga", "action.care", "supports", .65], ["hobby.swimming", "action.run_physical", "supports", .7], ["hobby.woodworking", "work_context.troubleshooting", "transfers_to", .63], ["work_context.client_advocacy", "occupation.lawyer", "example_occupation", 1], ["work_context.clinical_care", "occupation.registered_nurse", "example_occupation", 1], ["work_context.emergency_response", "occupation.firefighter", "example_occupation", 1]
].map(([from, to, kind, weight]) => ({ from, to, kind, weight, evidenceClass: "curated", confidence: weight, provenance: "curated", rationaleKey: `relations.seed.${from.replaceAll(".", "_")}.${to.replaceAll(".", "_")}`, sourceIds: ["editorial:ontology-v1"] }));

function labels(values) { return Object.fromEntries(LOCALES.map((locale, index) => [locale, values[index]])); }
function facets(values) { return Object.fromEntries(FACETS.map((facet, index) => [facet, values[index]])); }
function evaluateTsArray(relativePath, exportName) {
  return readFile(resolve(ROOT, relativePath), "utf8").then((source) => {
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(output, { exports: module.exports, module });
    return module.exports[exportName];
  });
}
function riasecFacets(codes = []) {
  const vector = facets(Array(FACETS.length).fill(0));
  const add = { R: [0,2,0,0,0,3,0,2,1,1,0,1], I: [0,1,0,2,3,0,0,3,2,2,0,2], A: [3,0,0,1,2,0,1,1,0,2,0,3], S: [0,0,2,1,1,0,3,1,1,1,3,1], E: [1,0,1,1,1,0,3,1,1,3,1,2], C: [0,0,1,3,1,0,1,3,3,1,1,0] };
  for (const code of codes) for (const [index, facet] of FACETS.entries()) vector[facet] = Math.min(3, vector[facet] + (add[code]?.[index] ?? 0));
  return vector;
}
function conceptId(kind, legacyId) { return `${kind}.${legacyId.toLowerCase().replace(/^hobby_/, "").replace(/-/g, "_")}`; }
function edge(from, to, kind, weight, sourceIds) { return { from, to, kind, weight, evidenceClass: "catalog_derived", confidence: 0.85, provenance: "imported", rationaleKey: `relations.${from.replaceAll(".", "_")}.${to.replaceAll(".", "_")}`, sourceIds }; }
function secondaryOccupationEdge(context, occupation, legacyId, rank) {
  return {
    from: `work_context.${context}`,
    to: occupation,
    kind: "example_occupation",
    weight: 0.54,
    evidenceClass: "catalog_derived",
    confidence: 0.65,
    provenance: "imported",
    rationaleKey: `relations.derived_secondary_riasec.${legacyId.replace(/-/g, "_")}.${context}.${rank}`,
    sourceIds: [`catalog:careers.${legacyId}`]
  };
}
function cosine(left, right) {
  let dot = 0, leftNorm = 0, rightNorm = 0;
  for (const facet of FACETS) { dot += left[facet] * right[facet]; leftNorm += left[facet] ** 2; rightNorm += right[facet] ** 2; }
  return leftNorm && rightNorm ? dot / Math.sqrt(leftNorm * rightNorm) : 0;
}
function derivedEdge(from, to, kind, score) {
  return { from: from.id, to: to.id, kind, weight: Number(Math.min(0.54, Math.max(0.4, score * 0.54)).toFixed(3)), evidenceClass: "catalog_derived", confidence: Number(Math.min(0.65, Math.max(0.45, score * 0.65)).toFixed(3)), provenance: "derived", rationaleKey: `relations.derived.facet_alignment.${from.id.replaceAll(".", "_")}.${to.id.replaceAll(".", "_")}`, sourceIds: ["derived:facet-alignment-v1"] };
}
function topFacetEdges(sources, targets, kind, perSource) {
  return sources.flatMap((source) => [...targets].map((target) => ({ target, score: cosine(source.facets, target.facets) })).sort((left, right) => right.score - left.score || left.target.id.localeCompare(right.target.id, "en")).slice(0, perSource).map(({ target, score }) => derivedEdge(source, target, kind, score)));
}

const [conceptDocument, edgeDocument, hobbies, careers, curatedHobbyDocument, curatedActionDocument, expansionActionDocument, expansionActionDocumentII, expansionHobbyDocument, expansionHobbyDocumentII, expansionHobbyDocumentIII, workContextTaxonomyDocument, hobbyActivityFacetDocument, explanationTemplateDocument] = await Promise.all([
  readFile(resolve(PLATFORM_ROOT, "concepts.json"), "utf8").then(JSON.parse), readFile(resolve(PLATFORM_ROOT, "edges.json"), "utf8").then(JSON.parse),
  evaluateTsArray("src/manifest/ontology/shards/lifestyle/hobbies.ts", "HOBBIES"), evaluateTsArray("src/lib/data-layer/shards/careers.ts", "CAREERS"),
  readFile(resolve(PLATFORM_ROOT, "curated-hobbies-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(PLATFORM_ROOT, "curated-actions-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(EXPANSION_ROOT, "action-vocabulary-i-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(EXPANSION_ROOT, "action-vocabulary-ii-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(EXPANSION_ROOT, "hobby-catalog-i-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(EXPANSION_ROOT, "hobby-catalog-ii-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(EXPANSION_ROOT, "hobby-catalog-iii-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(EXPANSION_ROOT, "work-context-taxonomy-v2.json"), "utf8").then(JSON.parse),
  readFile(resolve(PLATFORM_ROOT, "curated-hobby-activity-facets-v1.json"), "utf8").then(JSON.parse),
  readFile(resolve(PLATFORM_ROOT, "concept-explanation-templates-v1.json"), "utf8").then(JSON.parse)
]);
if (curatedHobbyDocument.schema !== "oiyo.ontology-curated-hobbies" || curatedHobbyDocument.schemaVersion !== 1 || curatedHobbyDocument.hobbies.length !== 25) throw new Error("curated hobby catalog contract mismatch");
if (curatedActionDocument.schema !== "oiyo.ontology-curated-actions" || curatedActionDocument.schemaVersion !== 1 || curatedActionDocument.actions.length !== 40 || JSON.stringify(curatedActionDocument.facets) !== JSON.stringify(FACETS)) throw new Error("curated action catalog contract mismatch");
if (expansionActionDocument.schema !== "oiyo.ontology-action-vocabulary" || expansionActionDocument.schemaVersion !== 1 || expansionActionDocument.sourceId !== "editorial:ontology-actions-v1" || expansionActionDocument.actions.length !== 100 || JSON.stringify(expansionActionDocument.facets) !== JSON.stringify(FACETS)) throw new Error("action vocabulary I contract mismatch");
if (expansionActionDocumentII.schema !== "oiyo.ontology-action-vocabulary" || expansionActionDocumentII.schemaVersion !== 1 || expansionActionDocumentII.sourceId !== "editorial:ontology-actions-v1" || expansionActionDocumentII.actions.length !== 100 || JSON.stringify(expansionActionDocumentII.facets) !== JSON.stringify(FACETS)) throw new Error("action vocabulary II contract mismatch");
if (expansionHobbyDocument.schema !== "oiyo.ontology-hobby-catalog" || expansionHobbyDocument.schemaVersion !== 1 || expansionHobbyDocument.sourceId !== "editorial:ontology-hobbies-v1" || expansionHobbyDocument.batch !== 4 || expansionHobbyDocument.hobbies.length !== 149) throw new Error("hobby catalog I contract mismatch");
if (expansionHobbyDocumentII.schema !== "oiyo.ontology-hobby-catalog" || expansionHobbyDocumentII.schemaVersion !== 2 || expansionHobbyDocumentII.sourceId !== "editorial:ontology-hobbies-v1" || expansionHobbyDocumentII.batch !== 5 || !Array.isArray(expansionHobbyDocumentII.hobbyGroups)) throw new Error("hobby catalog II contract mismatch");
if (expansionHobbyDocumentIII.schema !== "oiyo.ontology-hobby-catalog" || expansionHobbyDocumentIII.schemaVersion !== 3 || expansionHobbyDocumentIII.sourceId !== "editorial:ontology-hobbies-v1" || expansionHobbyDocumentIII.batch !== 6 || !Array.isArray(expansionHobbyDocumentIII.hobbyGroups)) throw new Error("hobby catalog III contract mismatch");
if (workContextTaxonomyDocument.schema !== "oiyo.ontology-work-context-taxonomy" || workContextTaxonomyDocument.schemaVersion !== 2 || workContextTaxonomyDocument.sourceId !== "editorial:ontology-work-contexts-v2" || workContextTaxonomyDocument.batch !== 7 || JSON.stringify(workContextTaxonomyDocument.facets) !== JSON.stringify(FACETS) || !Array.isArray(workContextTaxonomyDocument.contexts) || workContextTaxonomyDocument.contexts.length !== 58) throw new Error("work context taxonomy v2 contract mismatch");
for (const [id, copy, vector] of workContextTaxonomyDocument.contexts) if (!/^[a-z][a-z0-9_]{1,63}$/.test(id) || !Array.isArray(copy) || copy.length !== LOCALES.length || copy.some((label) => typeof label !== "string" || !label.trim()) || !Array.isArray(vector) || vector.length !== FACETS.length || vector.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) throw new Error(`invalid work context taxonomy v2 entry: ${id}`);
if (new Set(workContextTaxonomyDocument.contexts.map(([id]) => id)).size !== 58 || workContextTaxonomyDocument.contexts.some(([id]) => LEGACY_CONTEXTS.some(([legacyId]) => legacyId === id))) throw new Error("work context taxonomy v2 dedupe mismatch");
const CONTEXTS = [...LEGACY_CONTEXTS, ...workContextTaxonomyDocument.contexts];
const expansionHobbiesII = expansionHobbyDocumentII.hobbyGroups.flatMap(({ profile, riasec, items }) => (Array.isArray(items) ? items : []).map((id) => {
  const label = id.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
  return { id, labels: Object.fromEntries(LOCALES.map((locale) => [locale, label])), riasec, profile };
}));
if (expansionHobbiesII.length !== 150 || new Set(expansionHobbiesII.map(({ id }) => id)).size !== 150) throw new Error("hobby catalog II count or dedupe mismatch");
const localizedHobbyLabels = (id) => {
  const english = id.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
  return { ko: `${english} 활동`, en: english, ja: `${english} 活動`, zh: `${english} 活动`, fr: `Activité : ${english}`, es: `Actividad: ${english}` };
};
const expansionHobbiesIII = expansionHobbyDocumentIII.hobbyGroups.flatMap(({ profile, riasec, items }) => (Array.isArray(items) ? items : []).map((sourceId) => { const id = HOBBY_VOCABULARY_III_IDS[sourceId] ?? sourceId; return { id, labels: localizedHobbyLabels(id), riasec, profile }; }));
if (expansionHobbiesIII.length !== 250 || new Set(expansionHobbiesIII.map(({ id }) => id)).size !== 250 || expansionHobbiesIII.some(({ id, labels: copy, profile, riasec }) => !/^[a-z][a-z0-9_]{1,63}$/.test(id) || !LOCALES.every((locale) => typeof copy[locale] === "string" && copy[locale].trim()) || typeof profile !== "string" || !Array.isArray(riasec) || riasec.length === 0)) throw new Error("hobby catalog III count, locale, or dedupe mismatch");
for (const [profile, vector] of Object.entries(curatedActionDocument.profiles ?? {})) {
  if (!/^[a-z][a-z_]{1,31}$/.test(profile) || !Array.isArray(vector) || vector.length !== FACETS.length || vector.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) throw new Error(`invalid curated action profile: ${profile}`);
}
for (const [profile, vector] of Object.entries(expansionActionDocument.profiles ?? {})) {
  if (!/^[a-z][a-z_]{1,31}$/.test(profile) || !Array.isArray(vector) || vector.length !== FACETS.length || vector.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) throw new Error(`invalid expansion action profile: ${profile}`);
}
for (const [profile, vector] of Object.entries(expansionActionDocumentII.profiles ?? {})) {
  if (!/^[a-z][a-z_]{1,31}$/.test(profile) || !Array.isArray(vector) || vector.length !== FACETS.length || vector.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) throw new Error(`invalid action vocabulary II profile: ${profile}`);
}
const ACTIVITY_DIMENSIONS = ["timeCommitment", "budget", "space", "physicalDemand", "socialMode", "setting", "entryDifficulty", "continuity", "outcomeModes"];
if (hobbyActivityFacetDocument.schema !== "oiyo.ontology-curated-hobby-activity-facets" || hobbyActivityFacetDocument.schemaVersion !== 1 || !hobbyActivityFacetDocument.dimensions || !hobbyActivityFacetDocument.profiles || !hobbyActivityFacetDocument.hobbyProfiles) throw new Error("curated hobby activity facet catalog contract mismatch");
for (const dimension of ACTIVITY_DIMENSIONS) if (!Array.isArray(hobbyActivityFacetDocument.dimensions[dimension]) || hobbyActivityFacetDocument.dimensions[dimension].length === 0) throw new Error(`invalid hobby activity dimension: ${dimension}`);
for (const [profileId, profile] of Object.entries(hobbyActivityFacetDocument.profiles)) {
  if (!/^[a-z][a-z_]{1,63}$/.test(profileId) || !profile || typeof profile !== "object") throw new Error(`invalid hobby activity profile: ${profileId}`);
  for (const dimension of ACTIVITY_DIMENSIONS) {
    const value = profile[dimension];
    const allowed = hobbyActivityFacetDocument.dimensions[dimension];
    if (dimension === "outcomeModes") {
      if (!Array.isArray(value) || value.length === 0 || value.some((item) => !allowed.includes(item))) throw new Error(`invalid hobby activity profile outcome: ${profileId}`);
    } else if (!allowed.includes(value)) throw new Error(`invalid hobby activity profile value: ${profileId}.${dimension}`);
  }
}
const EXPLANATION_FIELDS = ["definition", "realWorldContext", "misconception", "uncertainty"];
if (explanationTemplateDocument.schema !== "oiyo.ontology-concept-explanation-templates" || explanationTemplateDocument.schemaVersion !== 1 || !explanationTemplateDocument.source?.id || !/^\d{4}-\d{2}-\d{2}$/.test(explanationTemplateDocument.source.reviewedAt ?? "") || JSON.stringify(explanationTemplateDocument.fields) !== JSON.stringify(EXPLANATION_FIELDS)) throw new Error("concept explanation template contract mismatch");
for (const kind of ["action", "hobby", "work_context", "occupation"]) {
  const template = explanationTemplateDocument.templates?.[kind];
  if (!template) throw new Error(`missing concept explanation template: ${kind}`);
  for (const field of EXPLANATION_FIELDS) if (!LOCALES.every((locale) => typeof template[field]?.[locale] === "string" && template[field][locale].trim())) throw new Error(`incomplete concept explanation template: ${kind}.${field}`);
}
const current = new Map(conceptDocument.concepts.map((concept) => [concept.id, concept]));
const legacy = new Set(conceptDocument.concepts.flatMap((concept) => concept.legacyIds ?? []));
for (const hobby of hobbies) {
  const id = conceptId("hobby", hobby.id);
  const existing = current.get(id);
  if (!existing) current.set(id, { id, kind: "hobby", labels: labels(HOBBY_LABELS[hobby.id]), aliases: { en: [hobby.name] }, legacyIds: [hobby.id], facets: riasecFacets(hobby.tags.riasec) });
  else if (!(existing.legacyIds ?? []).includes(hobby.id)) existing.legacyIds = [...(existing.legacyIds ?? []), hobby.id].sort();
  legacy.add(hobby.id);
}
for (const hobby of curatedHobbyDocument.hobbies) {
  const id = `hobby.${hobby.id}`;
  if (!current.has(id)) current.set(id, { id, kind: "hobby", labels: hobby.labels, aliases: hobby.aliases, facets: riasecFacets(hobby.riasec) });
}
for (const hobby of expansionHobbyDocument.hobbies) {
  const id = `hobby.${hobby.id}`;
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(hobby.id) || !Array.isArray(hobby.riasec) || hobby.riasec.length === 0 || hobby.riasec.some((code) => !["R", "I", "A", "S", "E", "C"].includes(code)) || !LOCALES.every((locale) => typeof hobby.labels?.[locale] === "string" && hobby.labels[locale].trim()) || typeof hobby.profile !== "string") throw new Error(`invalid hobby catalog I entry: ${hobby.id}`);
  if (current.has(id)) {
    if (JSON.stringify(current.get(id).labels) !== JSON.stringify(hobby.labels)) throw new Error(`duplicate hobby catalog I entry: ${hobby.id}`);
    continue;
  }
  current.set(id, { id, kind: "hobby", labels: hobby.labels, aliases: hobby.aliases ?? {}, facets: riasecFacets(hobby.riasec) });
}
for (const hobby of expansionHobbiesII) {
  const id = `hobby.${hobby.id}`;
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(hobby.id) || !Array.isArray(hobby.riasec) || hobby.riasec.length === 0 || hobby.riasec.some((code) => !["R", "I", "A", "S", "E", "C"].includes(code)) || !LOCALES.every((locale) => typeof hobby.labels?.[locale] === "string" && hobby.labels[locale].trim()) || typeof hobby.profile !== "string") throw new Error(`invalid hobby catalog II entry: ${hobby.id}`);
  if (current.has(id)) {
    if (JSON.stringify(current.get(id).labels) !== JSON.stringify(hobby.labels)) throw new Error(`duplicate hobby catalog II entry: ${hobby.id}`);
    continue;
  }
  current.set(id, { id, kind: "hobby", labels: hobby.labels, aliases: {}, facets: riasecFacets(hobby.riasec) });
}
for (const hobby of expansionHobbiesIII) {
  const id = `hobby.${hobby.id}`;
  if (current.has(id)) continue;
  current.set(id, { id, kind: "hobby", labels: hobby.labels, aliases: {}, facets: riasecFacets(hobby.riasec) });
}
const hobbyConceptIds = [...current.values()].filter(({ kind }) => kind === "hobby").map(({ id }) => id.replace("hobby.", "")).sort();
const expansionHobbyProfiles = Object.fromEntries([...expansionHobbyDocument.hobbies, ...expansionHobbiesII, ...expansionHobbiesIII].map((hobby) => [hobby.id, hobby.profile]));
const activityProfiles = { ...hobbyActivityFacetDocument.hobbyProfiles, ...expansionHobbyProfiles };
const activityHobbyIds = Object.keys(activityProfiles).sort();
if (JSON.stringify(hobbyConceptIds) !== JSON.stringify(activityHobbyIds)) throw new Error("curated hobby activity facet coverage mismatch");
for (const hobbyId of hobbyConceptIds) {
  const profileId = activityProfiles[hobbyId];
  const profile = hobbyActivityFacetDocument.profiles[profileId];
  if (!profile) throw new Error(`unknown hobby activity profile: ${hobbyId}`);
  current.get(`hobby.${hobbyId}`).activityFacets = { profile: profileId, ...profile };
}
for (const action of curatedActionDocument.actions) {
  const id = `action.${action.id}`;
  const profile = curatedActionDocument.profiles[action.profile];
  if (!/^[a-z][a-z_]{1,63}$/.test(action.id) || !profile || !LOCALES.every((locale) => typeof action.labels?.[locale] === "string" && action.labels[locale].trim()) || !current.has(id) && Object.values(action.aliases ?? {}).flat().some((alias) => typeof alias !== "string" || !alias.trim())) throw new Error(`invalid curated action: ${action.id}`);
  if (!current.has(id)) current.set(id, { id, kind: "action", labels: action.labels, aliases: action.aliases, facets: facets(profile) });
}
for (const action of expansionActionDocument.actions) {
  const id = `action.${action.id}`;
  const profile = expansionActionDocument.profiles[action.profile];
  if (!/^[a-z][a-z_]{1,63}$/.test(action.id) || !profile || !LOCALES.every((locale) => typeof action.labels?.[locale] === "string" && action.labels[locale].trim()) || Object.values(action.aliases ?? {}).flat().some((alias) => typeof alias !== "string" || !alias.trim())) throw new Error(`invalid expansion action: ${action.id}`);
  if (current.has(id)) { if (JSON.stringify(current.get(id).labels) !== JSON.stringify(action.labels)) throw new Error(`duplicate expansion action: ${action.id}`); continue; }
  current.set(id, { id, kind: "action", labels: action.labels, aliases: action.aliases, facets: facets(profile) });
}
for (const action of expansionActionDocumentII.actions) {
  const id = `action.${ACTION_VOCABULARY_II_IDS[action.id] ?? action.id}`;
  const profile = expansionActionDocumentII.profiles[action.profile];
  if (!/^[a-z][a-z_]{1,63}$/.test(action.id) || !profile || !LOCALES.every((locale) => typeof action.labels?.[locale] === "string" && action.labels[locale].trim())) throw new Error(`invalid action vocabulary II action: ${action.id}`);
  if (current.has(id)) { if (JSON.stringify(current.get(id).labels) !== JSON.stringify(action.labels)) throw new Error(`duplicate action vocabulary II action: ${action.id}`); continue; }
  current.set(id, { id, kind: "action", labels: action.labels, aliases: action.aliases, facets: facets(profile) });
}
for (const [id, aliases] of Object.entries(LEGACY_GRAPH_ALIASES)) {
  const concept = current.get(id);
  if (!concept) throw new Error(`legacy graph alias target missing: ${id}`);
  concept.legacyIds = [...new Set([...(concept.legacyIds ?? []), ...aliases])].sort();
}
for (const [id, copy, vector] of CONTEXTS) {
  const concept = `work_context.${id}`;
  if (!current.has(concept)) current.set(concept, { id: concept, kind: "work_context", labels: labels(copy), facets: facets(vector) });
}
const careerById = new Map(careers.map((career) => [career.id, career]));
const careerContextOverrides = new Map(OCCUPATIONS.map(([legacyId, context, existingId]) => [legacyId, { context, existingId }]));
const sourceCareers = [...new Map(careers.map((career) => [career.id, career])).values()];
const occupationSelections = sourceCareers.map((career) => {
  const override = careerContextOverrides.get(career.id);
  const primaryRiasec = [...career.riasecCode].find((code) => DEFAULT_CONTEXT_BY_RIASEC[code]);
  const context = override?.context ?? DEFAULT_CONTEXT_BY_RIASEC[primaryRiasec];
  if (!context) throw new Error(`career has no supported RIASEC context: ${career.id}`);
  return [career.id, context, override?.existingId];
});
for (const [legacyId, context, existingId] of occupationSelections) {
  const career = careerById.get(legacyId);
  const id = `occupation.${existingId ?? legacyId.replace(/-/g, "_")}`;
  if (!career) throw new Error(`approved career source missing: ${legacyId}`);
  if (!current.has(id)) current.set(id, { id, kind: "occupation", labels: career.title, legacyIds: [legacyId], facets: riasecFacets(career.riasecCode) });
  legacy.add(legacyId);
}
for (const concept of current.values()) {
  const template = explanationTemplateDocument.templates[concept.kind];
  concept.explanation = {
    sourceIds: [explanationTemplateDocument.source.id],
    reviewedAt: explanationTemplateDocument.source.reviewedAt,
    fields: Object.fromEntries(EXPLANATION_FIELDS.map((field) => [field, Object.fromEntries(LOCALES.map((locale) => [locale, template[field][locale].replaceAll("{label}", concept.labels[locale])]))]))
  };
}
const actionIds = conceptDocument.concepts.filter(({ kind }) => kind === "action").map(({ id }) => id).sort();
const importedHobbies = hobbies.map((hobby) => conceptId("hobby", hobby.id));
const importedCuratedHobbies = curatedHobbyDocument.hobbies.map((hobby) => `hobby.${hobby.id}`);
const importedOccupationEdges = occupationSelections.map(([legacyId, context, existingId]) => edge(`work_context.${context}`, `occupation.${existingId ?? legacyId.replace(/-/g, "_")}`, "example_occupation", 0.82, [`catalog:careers.${legacyId}`]));
// Secondary RIASEC contexts preserve source diversity for fallback occupations.
// They are lower-confidence navigation examples, never a fit or hiring verdict.
const secondaryOccupationEdges = sourceCareers.flatMap((career) => {
  if (careerContextOverrides.has(career.id)) return [];
  const contexts = [...new Set([...career.riasecCode].map((code) => DEFAULT_CONTEXT_BY_RIASEC[code]).filter(Boolean))];
  return contexts.slice(1, 3).map((context, index) => secondaryOccupationEdge(context, `occupation.${career.id.replace(/-/g, "_")}`, career.id, index + 2));
});
const contextExampleEdges = CONTEXT_EXAMPLE_EDGES.map(([context, occupation, sourceId]) => edge(`work_context.${context}`, occupation, "example_occupation", 0.68, [`catalog:careers.${sourceId}`]));
const graphConcepts = [...current.values()];
const actionConcepts = graphConcepts.filter(({ kind }) => kind === "action");
const hobbyConcepts = graphConcepts.filter(({ kind }) => kind === "hobby");
const contextConcepts = graphConcepts.filter(({ kind }) => kind === "work_context");
const hobbyActionEdges = HOBBY_ACTION_EDGES.map(([hobby, action]) => ({ from: `hobby.${hobby}`, to: `action.${action}`, kind: "supports", weight: 0.72, evidenceClass: "expert_curated", confidence: 0.8, provenance: "curated", rationaleKey: `relations.editorial_action.${hobby}.${action}`, sourceIds: ["editorial:ontology-v1-actions"] }));
const actionContextEdges = topFacetEdges(actionConcepts, contextConcepts, "used_in", 2);
const hobbyContextEdges = topFacetEdges(hobbyConcepts, contextConcepts, "transfers_to", 1);
edgeDocument.edges = edgeDocument.edges.filter((candidate) => candidate.provenance !== "imported" && candidate.provenance !== "derived");
const keys = new Set(edgeDocument.edges.map(({ from, kind, to }) => `${from}|${kind}|${to}`));
for (const candidate of [...SEED_EDGES, ...hobbyActionEdges, ...actionContextEdges, ...hobbyContextEdges, ...importedOccupationEdges, ...secondaryOccupationEdges, ...contextExampleEdges]) {
  const key = `${candidate.from}|${candidate.kind}|${candidate.to}`;
  if (!keys.has(key)) {
    edgeDocument.edges.push(candidate);
    keys.add(key);
  }
}
conceptDocument.concepts = [...current.values()].sort((a, b) => a.id.localeCompare(b.id, "en"));
await Promise.all([
  writeFile(resolve(PLATFORM_ROOT, "concepts.json"), `${JSON.stringify(conceptDocument, null, 2)}\n`),
  writeFile(resolve(PLATFORM_ROOT, "edges.json"), `${JSON.stringify(edgeDocument, null, 2)}\n`)
]);
console.log(`Ontology catalog import PASS: ${conceptDocument.concepts.length} concepts, ${edgeDocument.edges.length} edges; ${hobbyConcepts.length} hobbies, ${actionConcepts.length} actions, ${CONTEXTS.length} work contexts (${workContextTaxonomyDocument.contexts.length} editorial v2), ${occupationSelections.length} preserved occupation mappings`);
