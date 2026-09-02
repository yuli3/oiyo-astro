"use client";

import { Heart, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";

import {
  buildPersonalProfileExportV2,
  buildRelationshipResultCode,
  compareRelationshipResultCodes,
  decodeRelationshipResultCode,
  encodeRelationshipResultCode,
  listAssessmentResults,
  projectPersonalProfileSnapshot,
  withdrawRelationshipComparison,
  type RelationshipComparisonReportV1,
  type RelationshipContext,
  type RelationshipParticipant,
  type RelationshipResultCodeV1,
} from "@/assessments";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
type Step = "consent" | "codes" | "report";

interface Copy {
  title: string;
  description: string;
  boundary: string;
  guardrailsTitle: string;
  guardrails: string[];
  contextLabel: string;
  contexts: Record<RelationshipContext, string>;
  consentAdult: string;
  consentReflection: string;
  consentContinue: string;
  evidenceEmpty: string;
  evidenceReady: (count: number) => string;
  myCodeTitle: string;
  generateButton: string;
  myCodeExpiry: (date: string) => string;
  copyButton: string;
  copiedMsg: string;
  partnerCodeTitle: string;
  partnerCodePlaceholder: string;
  partnerPresent: string;
  compareButton: string;
  reportTitle: string;
  sharedTitle: string;
  differencesTitle: string;
  unmatchedTitle: string;
  questionsTitle: string;
  emptySection: string;
  withdrawMine: string;
  withdrawPartner: string;
  withdrawnMsg: string;
  startOver: string;
  errors: { generate: string; decode: string; compare: string; sameCode: string };
}

const COPY: Record<Lang, Copy> = {
  ko: {
    title: "친구·커플·가족 비교 리포트 (파일럿)",
    description: "친구를 포함해 각자 완료한 검사 근거만으로, 같은 자리에 있는 두 사람이 공통점·차이·대화 질문을 함께 확인합니다.",
    boundary: "서버로 전송되지 않고 저장도 되지 않습니다 — 이 브라우저 탭을 벗어나면 사라집니다. 새로고침하면 처음부터 다시 시작해야 합니다.",
    guardrailsTitle: "이 도구가 하지 않는 것",
    guardrails: [
      "건강·정치 성향 추론 금지",
      "미성년자 사용 금지",
      "직장 평가·채용 목적 금지",
      "궁합·성공률 같은 단일 점수 산출 금지",
      "결과의 진위(서명) 자체는 보증하지 않음 — 참고용",
    ],
    contextLabel: "누구와 비교하나요?",
    contexts: { couple: "커플", family: "가족", friend: "친구" },
    consentAdult: "저는 성인입니다.",
    consentReflection: "이 결과는 진단이 아니라 대화를 위한 참고 자료임을 이해합니다.",
    consentContinue: "동의하고 계속하기",
    evidenceEmpty: "Big5·MBTI·RIASEC·Career Values·성인 애착 중 완료한 검사가 아직 없습니다. 먼저 검사를 완료해 주세요.",
    evidenceReady: (n) => `${n}개 근거로 코드를 만들 수 있습니다.`,
    myCodeTitle: "내 코드 만들기",
    generateButton: "내 코드 생성",
    myCodeExpiry: (date) => `이 코드는 ${date}에 만료됩니다. 비교할 사람에게 직접 전달하세요(문자·메신저 등).`,
    copyButton: "코드 복사",
    copiedMsg: "복사했습니다.",
    partnerCodeTitle: "상대방 코드 붙여넣기",
    partnerCodePlaceholder: "OIYO-RC1.로 시작하는 상대방 코드를 붙여넣으세요",
    partnerPresent: "상대방이 지금 함께 있고, 본인 코드로 비교하는 데 동의합니다.",
    compareButton: "비교하기",
    reportTitle: "비교 리포트",
    sharedTitle: "공통점",
    differencesTitle: "차이",
    unmatchedTitle: "한쪽에만 있는 근거",
    questionsTitle: "대화 질문",
    emptySection: "해당 항목이 없습니다.",
    withdrawMine: "내 코드 철회·삭제",
    withdrawPartner: "상대방 코드 철회·삭제",
    withdrawnMsg: "로컬에서 코드와 리포트를 삭제했습니다. 이미 상대방에게 전달한 사본은 원격으로 회수할 수 없습니다.",
    startOver: "처음부터 다시",
    errors: {
      generate: "코드를 만들지 못했습니다. 완료한 검사 결과를 확인해 주세요.",
      decode: "코드를 해석하지 못했습니다. 상대방 코드를 다시 확인해 주세요.",
      compare: "비교하지 못했습니다. 코드가 만료되었거나 동일한 코드일 수 있습니다.",
      sameCode: "같은 코드로는 비교할 수 없습니다.",
    },
  },
  en: {
    title: "Friend, Couple & Family Comparison Report (pilot)",
    description: "Friends and other pairs can use only evidence from assessments each person has completed to see shared points, differences, and conversation prompts.",
    boundary: "Nothing is sent to a server or saved — it disappears when you leave this tab. Refreshing starts over from the beginning.",
    guardrailsTitle: "What this tool does not do",
    guardrails: [
      "No health or political inference",
      "Not for minors",
      "Not for workplace evaluation or hiring",
      "No single compatibility or success score",
      "Does not verify authenticity of a code — for reflection only",
    ],
    contextLabel: "Who are you comparing with?",
    contexts: { couple: "Couple", family: "Family", friend: "Friend" },
    consentAdult: "I am an adult.",
    consentReflection: "I understand this is a conversation prompt, not a diagnosis.",
    consentContinue: "Agree and continue",
    evidenceEmpty: "No completed Big5, MBTI, RIASEC, Career Values, or adult attachment assessment yet. Complete one first.",
    evidenceReady: (n) => `${n} evidence coordinates ready for a code.`,
    myCodeTitle: "Generate your code",
    generateButton: "Generate my code",
    myCodeExpiry: (date) => `This code expires on ${date}. Share it directly with the person you are comparing with (text, messenger, etc).`,
    copyButton: "Copy code",
    copiedMsg: "Copied.",
    partnerCodeTitle: "Paste partner's code",
    partnerCodePlaceholder: "Paste a code starting with OIYO-RC1.",
    partnerPresent: "My partner is here with me and agrees to compare using their own code.",
    compareButton: "Compare",
    reportTitle: "Comparison report",
    sharedTitle: "Shared",
    differencesTitle: "Differences",
    unmatchedTitle: "Only on one side",
    questionsTitle: "Conversation prompts",
    emptySection: "Nothing here.",
    withdrawMine: "Withdraw & delete my code",
    withdrawPartner: "Withdraw & delete partner's code",
    withdrawnMsg: "The code and report were deleted locally. A copy already shared with someone else cannot be recalled remotely.",
    startOver: "Start over",
    errors: {
      generate: "Could not generate a code. Check your completed assessment results.",
      decode: "Could not read that code. Please check the partner code again.",
      compare: "Could not compare. The code may be expired or identical.",
      sameCode: "You cannot compare a code with itself.",
    },
  },
  ja: {
    title: "友人・カップル・家族比較レポート（試験版）",
    description: "友人を含む二人が、各自の完了した検査の根拠だけを使って共通点・違い・会話のきっかけを確認します。",
    boundary: "サーバーには送信されず保存もされません — このタブを離れると消えます。更新すると最初からやり直しになります。",
    guardrailsTitle: "このツールがしないこと",
    guardrails: [
      "健康・政治的傾向の推測はしない",
      "未成年は利用不可",
      "職場評価・採用目的では使わない",
      "相性や成功率の単一スコアは出さない",
      "コードの真正性は保証しない — 参考用",
    ],
    contextLabel: "誰と比較しますか？",
    contexts: { couple: "カップル", family: "家族", friend: "友人" },
    consentAdult: "私は成人です。",
    consentReflection: "この結果は診断ではなく会話のきっかけであると理解しています。",
    consentContinue: "同意して続ける",
    evidenceEmpty: "Big5・MBTI・RIASEC・Career Values・成人アタッチメントのいずれも未完了です。先に検査を完了してください。",
    evidenceReady: (n) => `${n}件のエビデンスでコードを作成できます。`,
    myCodeTitle: "自分のコードを作成",
    generateButton: "コードを生成",
    myCodeExpiry: (date) => `このコードは${date}に失効します。相手に直接渡してください（メッセージアプリなど）。`,
    copyButton: "コードをコピー",
    copiedMsg: "コピーしました。",
    partnerCodeTitle: "相手のコードを貼り付け",
    partnerCodePlaceholder: "OIYO-RC1.で始まる相手のコードを貼り付けてください",
    partnerPresent: "相手が今一緒にいて、自分のコードで比較することに同意しています。",
    compareButton: "比較する",
    reportTitle: "比較レポート",
    sharedTitle: "共通点",
    differencesTitle: "違い",
    unmatchedTitle: "片方だけにある項目",
    questionsTitle: "会話のきっかけ",
    emptySection: "該当項目はありません。",
    withdrawMine: "自分のコードを撤回・削除",
    withdrawPartner: "相手のコードを撤回・削除",
    withdrawnMsg: "コードとレポートをローカルから削除しました。すでに相手に渡したコピーは遠隔で回収できません。",
    startOver: "最初からやり直す",
    errors: {
      generate: "コードを作成できませんでした。完了した検査結果を確認してください。",
      decode: "コードを読み取れませんでした。相手のコードをもう一度確認してください。",
      compare: "比較できませんでした。コードが失効しているか、同一の可能性があります。",
      sameCode: "同じコード同士は比較できません。",
    },
  },
  zh: {
    title: "朋友·情侣·家庭比较报告（试点）",
    description: "朋友和其他两人组合只使用各自已完成测验的证据，一起查看共同点、差异和对话话题。",
    boundary: "不会发送到服务器也不会保存 — 离开此标签页即消失。刷新页面需要从头开始。",
    guardrailsTitle: "此工具不会做的事",
    guardrails: [
      "不推断健康或政治倾向",
      "不面向未成年人",
      "不用于职场评估或招聘",
      "不生成单一的相合度或成功率分数",
      "不验证代码的真实性 — 仅供参考",
    ],
    contextLabel: "你想和谁比较？",
    contexts: { couple: "情侣", family: "家人", friend: "朋友" },
    consentAdult: "我是成年人。",
    consentReflection: "我理解这个结果是对话话题，而不是诊断。",
    consentContinue: "同意并继续",
    evidenceEmpty: "尚未完成 Big5、MBTI、RIASEC、Career Values 或成人依恋测验中的任何一项，请先完成一项。",
    evidenceReady: (n) => `已准备 ${n} 个证据坐标，可以生成代码。`,
    myCodeTitle: "生成我的代码",
    generateButton: "生成我的代码",
    myCodeExpiry: (date) => `此代码将于 ${date} 过期。请直接把代码发给对方（短信、聊天软件等）。`,
    copyButton: "复制代码",
    copiedMsg: "已复制。",
    partnerCodeTitle: "粘贴对方的代码",
    partnerCodePlaceholder: "粘贴以 OIYO-RC1. 开头的对方代码",
    partnerPresent: "对方现在和我在一起，并同意用自己的代码进行比较。",
    compareButton: "开始比较",
    reportTitle: "比较报告",
    sharedTitle: "共同点",
    differencesTitle: "差异",
    unmatchedTitle: "仅一方拥有的证据",
    questionsTitle: "对话话题",
    emptySection: "此处暂无内容。",
    withdrawMine: "撤回并删除我的代码",
    withdrawPartner: "撤回并删除对方的代码",
    withdrawnMsg: "已在本地删除代码和报告。已经分享给对方的副本无法远程收回。",
    startOver: "重新开始",
    errors: {
      generate: "无法生成代码，请检查已完成的测验结果。",
      decode: "无法读取该代码，请重新检查对方的代码。",
      compare: "无法比较，代码可能已过期或完全相同。",
      sameCode: "不能用同一个代码相互比较。",
    },
  },
  fr: {
    title: "Rapport de comparaison entre amis, couples et familles (pilote)",
    description: "Des amis ou deux proches utilisent uniquement les preuves des évaluations complétées par chacun pour voir leurs points communs, différences et sujets de conversation.",
    boundary: "Rien n'est envoyé à un serveur ni enregistré — tout disparaît en quittant cet onglet. Un rafraîchissement recommence depuis le début.",
    guardrailsTitle: "Ce que cet outil ne fait pas",
    guardrails: [
      "Aucune inférence de santé ou politique",
      "Pas pour les mineurs",
      "Pas pour l'évaluation au travail ou le recrutement",
      "Aucun score unique de compatibilité ou de réussite",
      "Ne vérifie pas l'authenticité d'un code — à but réflexif uniquement",
    ],
    contextLabel: "Avec qui comparez-vous ?",
    contexts: { couple: "Couple", family: "Famille", friend: "Ami" },
    consentAdult: "Je suis majeur(e).",
    consentReflection: "Je comprends que ce résultat est un sujet de conversation, pas un diagnostic.",
    consentContinue: "Accepter et continuer",
    evidenceEmpty: "Aucune évaluation Big5, MBTI, RIASEC, Career Values ou attachement adulte n'est encore complétée. Complétez-en une d'abord.",
    evidenceReady: (n) => `${n} coordonnées de preuve prêtes pour un code.`,
    myCodeTitle: "Générer votre code",
    generateButton: "Générer mon code",
    myCodeExpiry: (date) => `Ce code expire le ${date}. Partagez-le directement avec la personne comparée (SMS, messagerie, etc).`,
    copyButton: "Copier le code",
    copiedMsg: "Copié.",
    partnerCodeTitle: "Coller le code du partenaire",
    partnerCodePlaceholder: "Collez un code commençant par OIYO-RC1.",
    partnerPresent: "Mon/ma partenaire est présent(e) avec moi et accepte de comparer avec son propre code.",
    compareButton: "Comparer",
    reportTitle: "Rapport de comparaison",
    sharedTitle: "Points communs",
    differencesTitle: "Différences",
    unmatchedTitle: "Présent d'un seul côté",
    questionsTitle: "Sujets de conversation",
    emptySection: "Rien ici.",
    withdrawMine: "Retirer et supprimer mon code",
    withdrawPartner: "Retirer et supprimer le code du partenaire",
    withdrawnMsg: "Le code et le rapport ont été supprimés localement. Une copie déjà partagée ne peut pas être récupérée à distance.",
    startOver: "Recommencer",
    errors: {
      generate: "Impossible de générer un code. Vérifiez vos résultats d'évaluation complétés.",
      decode: "Impossible de lire ce code. Vérifiez à nouveau le code du partenaire.",
      compare: "Impossible de comparer. Le code est peut-être expiré ou identique.",
      sameCode: "Vous ne pouvez pas comparer un code avec lui-même.",
    },
  },
  es: {
    title: "Informe de comparación entre amigos, parejas y familias (piloto)",
    description: "Amigos u otras dos personas usan solo evidencia de evaluaciones completadas por cada uno para ver puntos en común, diferencias y temas de conversación.",
    boundary: "Nada se envía a un servidor ni se guarda — desaparece al salir de esta pestaña. Al actualizar la página se empieza de nuevo.",
    guardrailsTitle: "Lo que esta herramienta no hace",
    guardrails: [
      "No infiere salud ni tendencia política",
      "No es para menores de edad",
      "No es para evaluación laboral ni contratación",
      "No genera un puntaje único de compatibilidad o éxito",
      "No verifica la autenticidad de un código — solo para reflexión",
    ],
    contextLabel: "¿Con quién vas a comparar?",
    contexts: { couple: "Pareja", family: "Familia", friend: "Amigo/a" },
    consentAdult: "Soy adulto/a.",
    consentReflection: "Entiendo que este resultado es un tema de conversación, no un diagnóstico.",
    consentContinue: "Aceptar y continuar",
    evidenceEmpty: "Aún no hay una evaluación completada de Big5, MBTI, RIASEC, Career Values o apego adulto. Completa una primero.",
    evidenceReady: (n) => `${n} coordenadas de evidencia listas para un código.`,
    myCodeTitle: "Genera tu código",
    generateButton: "Generar mi código",
    myCodeExpiry: (date) => `Este código expira el ${date}. Compártelo directamente con la persona que vas a comparar (mensaje, chat, etc).`,
    copyButton: "Copiar código",
    copiedMsg: "Copiado.",
    partnerCodeTitle: "Pegar el código de tu pareja",
    partnerCodePlaceholder: "Pega un código que empiece con OIYO-RC1.",
    partnerPresent: "Mi pareja está aquí conmigo y acepta comparar usando su propio código.",
    compareButton: "Comparar",
    reportTitle: "Informe de comparación",
    sharedTitle: "En común",
    differencesTitle: "Diferencias",
    unmatchedTitle: "Solo en un lado",
    questionsTitle: "Temas de conversación",
    emptySection: "Nada aquí.",
    withdrawMine: "Retirar y eliminar mi código",
    withdrawPartner: "Retirar y eliminar el código de mi pareja",
    withdrawnMsg: "El código y el informe se eliminaron localmente. Una copia ya compartida no se puede recuperar remotamente.",
    startOver: "Empezar de nuevo",
    errors: {
      generate: "No se pudo generar un código. Revisa tus resultados de evaluación completados.",
      decode: "No se pudo leer ese código. Revisa de nuevo el código de tu pareja.",
      compare: "No se pudo comparar. El código puede haber expirado o ser idéntico.",
      sameCode: "No puedes comparar un código consigo mismo.",
    },
  },
};

const LANE_LABELS: Record<Lang, Record<string, string>> = {
  ko: { trait: "성향", preference: "선호", interest: "관심사", "chosen-value": "선택 가치관", "reflective-signal": "성찰 신호" },
  en: { trait: "Trait", preference: "Preference", interest: "Interest", "chosen-value": "Chosen value", "reflective-signal": "Reflective signal" },
  ja: { trait: "特性", preference: "好み", interest: "興味", "chosen-value": "選択した価値観", "reflective-signal": "内省的シグナル" },
  zh: { trait: "特质", preference: "偏好", interest: "兴趣", "chosen-value": "选择的价值观", "reflective-signal": "反思信号" },
  fr: { trait: "Trait", preference: "Préférence", interest: "Intérêt", "chosen-value": "Valeur choisie", "reflective-signal": "Signal réflexif" },
  es: { trait: "Rasgo", preference: "Preferencia", interest: "Interés", "chosen-value": "Valor elegido", "reflective-signal": "Señal reflexiva" },
};

const LANE_QUESTIONS: Record<Lang, Record<string, string>> = {
  ko: {
    trait: "각자의 패턴이 어떤 상황에서 도움이 되고, 어디서 다른 방식의 지지가 필요할까요?",
    preference: "이 선호 차이가 소통에 도움이 되는 순간은 언제이고, 짐작 대신 물어봐야 할 때는 언제인가요?",
    interest: "같은 정도의 흥미를 기대하지 않고 서로 시도해볼 수 있는 활동은 무엇인가요?",
    "chosen-value": "두 우선순위가 함께 들어갈 수 있는 지점은 어디이고, 어떤 트레이드오프는 명시적으로 이야기해야 할까요?",
    "reflective-signal": "이 결과를 진단이 아닌 대화의 실마리로 다루면서, 각자가 이해받는다고 느끼려면 무엇이 필요할까요?",
  },
  en: {
    trait: "In which situations does each pattern feel useful, and where might you need different support?",
    preference: "When do these preferences help communication, and when should you ask instead of assume?",
    interest: "Which activity could each person try without expecting identical enthusiasm?",
    "chosen-value": "Where could both priorities fit, and what trade-off needs an explicit conversation?",
    "reflective-signal": "What helps each person feel heard, while treating this result as a prompt rather than a diagnosis?",
  },
  ja: {
    trait: "それぞれのパターンがどんな場面で役立ち、どこで異なるサポートが必要でしょうか？",
    preference: "この好みの違いがコミュニケーションに役立つのはいつで、推測せず尋ねるべきなのはいつでしょうか？",
    interest: "同じ熱量を期待せずに、互いに試せる活動は何でしょうか？",
    "chosen-value": "二つの優先事項が両立できる点はどこで、どのトレードオフを率直に話し合うべきでしょうか？",
    "reflective-signal": "この結果を診断ではなく会話のきっかけとして扱いながら、それぞれが理解されていると感じるには何が必要でしょうか？",
  },
  zh: {
    trait: "各自的模式在什么情境下有用，哪里可能需要不同的支持方式？",
    preference: "这种偏好差异什么时候有助于沟通，什么时候该询问而不是假设？",
    interest: "有哪些活动可以让双方尝试，而不必期待同等的热情？",
    "chosen-value": "两种优先事项能在哪里兼顾，哪些取舍需要坦诚讨论？",
    "reflective-signal": "把这个结果当作对话的线索而非诊断，怎样才能让彼此都感到被理解？",
  },
  fr: {
    trait: "Dans quelles situations chaque tendance est-elle utile, et où pourriez-vous avoir besoin d'un soutien différent ?",
    preference: "Quand ces préférences aident-elles la communication, et quand devriez-vous demander plutôt que supposer ?",
    interest: "Quelle activité chacun pourrait-il essayer sans attendre le même enthousiasme ?",
    "chosen-value": "Où ces deux priorités peuvent-elles coexister, et quel compromis mérite une conversation explicite ?",
    "reflective-signal": "Qu'est-ce qui aide chacun à se sentir entendu, en traitant ce résultat comme une piste plutôt qu'un diagnostic ?",
  },
  es: {
    trait: "¿En qué situaciones resulta útil cada patrón y dónde podrían necesitar un apoyo distinto?",
    preference: "¿Cuándo ayudan estas preferencias a la comunicación y cuándo deberían preguntar en lugar de suponer?",
    interest: "¿Qué actividad podría probar cada uno sin esperar el mismo entusiasmo?",
    "chosen-value": "¿Dónde podrían encajar ambas prioridades y qué compromiso merece una conversación explícita?",
    "reflective-signal": "¿Qué ayuda a que cada uno se sienta escuchado, tratando este resultado como una pista y no un diagnóstico?",
  },
};

function constructLabel(constructId: string): string {
  const last = constructId.split(".").at(-1) ?? constructId;
  return last.length <= 2 ? last.toUpperCase() : last.charAt(0).toUpperCase() + last.slice(1);
}

function randomCodeId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export default function RelationshipComparisonPanel({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = COPY[lang];
  const laneLabels = LANE_LABELS[lang];
  const laneQuestions = LANE_QUESTIONS[lang];

  const [step, setStep] = useState<Step>("consent");
  const [context, setContext] = useState<RelationshipContext>("friend");
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [reflectionAck, setReflectionAck] = useState(false);

  const [myCode, setMyCode] = useState<RelationshipResultCodeV1 | null>(null);
  const [myCodeString, setMyCodeString] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [partnerInput, setPartnerInput] = useState("");
  const [partnerPresentAck, setPartnerPresentAck] = useState(false);
  const [revokedCodeIds, setRevokedCodeIds] = useState<string[]>([]);
  const [report, setReport] = useState<RelationshipComparisonReportV1 | null>(null);
  const [message, setMessage] = useState("");

  const evidenceCount = useMemo(() => {
    const snapshot = projectPersonalProfileSnapshot(listAssessmentResults());
    return snapshot.lanes.reduce((sum, lane) => sum + lane.projections.length, 0);
  }, []);

  function generateMyCode() {
    setMessage("");
    try {
      const now = new Date().toISOString();
      const profileExport = buildPersonalProfileExportV2(projectPersonalProfileSnapshot(listAssessmentResults()), now);
      const code = buildRelationshipResultCode(profileExport, {
        adultConfirmed: true,
        codeId: randomCodeId(),
        consentAcknowledgedAt: now,
        createdAt: now,
        ownerSelfExported: true,
        reflectionOnly: true,
      });
      setMyCode(code);
      setMyCodeString(encodeRelationshipResultCode(code));
    } catch {
      setMessage(t.errors.generate);
    }
  }

  async function copyMyCode() {
    await navigator.clipboard.writeText(myCodeString);
    setCopyMsg(t.copiedMsg);
  }

  function runComparison() {
    setMessage("");
    if (!myCode || !myCodeString) return;
    if (partnerInput.trim() === myCodeString.trim()) {
      setMessage(t.errors.sameCode);
      return;
    }
    try {
      const partnerCode = decodeRelationshipResultCode(partnerInput.trim());
      const now = new Date().toISOString();
      const result = compareRelationshipResultCodes(myCode, partnerCode, {
        consent: {
          analyticsPayload: "none",
          localOnlyUnderstood: true,
          participantA: { acknowledgedAt: now, codeId: myCode.codeId, mayWithdraw: true, ownerPresent: true },
          participantB: { acknowledgedAt: now, codeId: partnerCode.codeId, mayWithdraw: true, ownerPresent: true },
          purpose: "mutual-reflection",
          serverTransmission: "none",
        },
        context,
        now,
        revokedCodeIds,
      });
      setReport(result);
      setStep("report");
    } catch (error) {
      setMessage(error instanceof TypeError && /decode|prefix|schema/i.test(error.message) ? t.errors.decode : t.errors.compare);
    }
  }

  function withdraw(participant: RelationshipParticipant) {
    if (!report) return;
    const codeId = participant === "A" ? report.participants.A.codeId : report.participants.B.codeId;
    const receipt = withdrawRelationshipComparison(participant, codeId, revokedCodeIds);
    setRevokedCodeIds(receipt.revokedCodeIds);
    setReport(null);
    setMyCode(null);
    setMyCodeString("");
    setPartnerInput("");
    setPartnerPresentAck(false);
    setStep("consent");
    setMessage(t.withdrawnMsg);
  }

  function startOver() {
    setReport(null);
    setMyCode(null);
    setMyCodeString("");
    setPartnerInput("");
    setPartnerPresentAck(false);
    setMessage("");
    setStep("consent");
  }

  return (
    <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-rose-200 bg-rose-50/40 p-4 sm:p-6" aria-labelledby="relationship-comparison-title">
      <div className="flex items-start gap-3">
        <Heart className="mt-1 h-6 w-6 shrink-0 text-rose-700" aria-hidden="true" />
        <div>
          <h2 id="relationship-comparison-title" className="text-xl font-black text-slate-950">{t.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{t.description}</p>
          <p className="mt-1 text-xs leading-5 text-rose-800">{t.boundary}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-rose-100 bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950"><ShieldCheck className="h-4 w-4 text-rose-700" aria-hidden="true" />{t.guardrailsTitle}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-700">
          {t.guardrails.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      {step === "consent" && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-900">{t.contextLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t.contextLabel}>
              {(Object.keys(t.contexts) as RelationshipContext[]).map((key) => (
                <button key={key} type="button" onClick={() => setContext(key)} aria-pressed={context === key}
                  className={`min-h-11 rounded-lg px-3 py-2 text-sm font-bold ${context === key ? "bg-rose-700 text-white" : "border border-rose-200 bg-card text-rose-800"}`}>
                  {t.contexts[key]}
                </button>
              ))}
            </div>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" checked={adultConfirmed} onChange={(event) => setAdultConfirmed(event.target.checked)} className="h-5 w-5" />
            {t.consentAdult}
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" checked={reflectionAck} onChange={(event) => setReflectionAck(event.target.checked)} className="h-5 w-5" />
            {t.consentReflection}
          </label>
          <button type="button" disabled={!adultConfirmed || !reflectionAck} onClick={() => setStep("codes")}
            className="min-h-11 rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            {t.consentContinue}
          </button>
        </div>
      )}

      {step === "codes" && (
        <div className="mt-4 space-y-6">
          <div className="rounded-xl border border-rose-100 bg-card p-4">
            <h3 className="text-sm font-bold text-slate-950">{t.myCodeTitle}</h3>
            <p className="mt-1 text-xs text-slate-600" aria-live="polite">{evidenceCount ? t.evidenceReady(evidenceCount) : t.evidenceEmpty}</p>
            {!myCodeString ? (
              <button type="button" disabled={evidenceCount === 0} onClick={generateMyCode}
                className="mt-3 min-h-11 rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {t.generateButton}
              </button>
            ) : (
              <div className="mt-3">
                <p className="break-all rounded-lg bg-slate-100 p-3 font-mono text-xs text-slate-800">{myCodeString}</p>
                <p className="mt-2 text-xs text-slate-600">{myCode && t.myCodeExpiry(formatDate(myCode.expiresAt, locale))}</p>
                <button type="button" onClick={copyMyCode} className="mt-2 min-h-11 rounded-lg border border-rose-300 bg-card px-4 py-2 text-sm font-bold text-rose-800">
                  {t.copyButton}
                </button>
                {copyMsg && <span className="ml-3 text-xs text-slate-600" role="status">{copyMsg}</span>}
              </div>
            )}
          </div>

          {myCodeString && (
            <div className="rounded-xl border border-rose-100 bg-card p-4">
              <h3 className="text-sm font-bold text-slate-950">{t.partnerCodeTitle}</h3>
              <textarea value={partnerInput} onChange={(event) => setPartnerInput(event.target.value)} placeholder={t.partnerCodePlaceholder}
                rows={3} className="mt-2 w-full rounded-lg border border-rose-200 p-2 font-mono text-xs" />
              <label className="mt-3 flex min-h-11 items-center gap-2 text-sm text-slate-800">
                <input type="checkbox" checked={partnerPresentAck} onChange={(event) => setPartnerPresentAck(event.target.checked)} className="h-5 w-5" />
                {t.partnerPresent}
              </label>
              <button type="button" disabled={!partnerInput.trim() || !partnerPresentAck} onClick={runComparison}
                className="mt-3 min-h-11 rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {t.compareButton}
              </button>
            </div>
          )}
        </div>
      )}

      {step === "report" && report && (
        <div className="mt-4 space-y-6">
          <section>
            <h3 className="text-sm font-bold text-slate-950">{t.sharedTitle}</h3>
            {report.shared.length === 0 ? <p className="mt-1 text-xs text-slate-600">{t.emptySection}</p> : (
              <ul className="mt-2 space-y-1">
                {report.shared.map((item) => (
                  <li key={`${item.lane}:${item.constructId}`} className="rounded-lg bg-card px-3 py-2 text-xs text-slate-800">
                    <span className="font-bold">{laneLabels[item.lane]}</span> · {constructLabel(item.constructId)}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3 className="text-sm font-bold text-slate-950">{t.differencesTitle}</h3>
            {report.differences.length === 0 ? <p className="mt-1 text-xs text-slate-600">{t.emptySection}</p> : (
              <ul className="mt-2 space-y-1">
                {report.differences.map((item) => (
                  <li key={`${item.lane}:${item.constructId}`} className="rounded-lg bg-card px-3 py-2 text-xs text-slate-800">
                    <span className="font-bold">{laneLabels[item.lane]}</span> · {constructLabel(item.constructId)}: {item.participantAValue} / {item.participantBValue}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3 className="text-sm font-bold text-slate-950">{t.unmatchedTitle}</h3>
            {report.unmatched.A.length === 0 && report.unmatched.B.length === 0 ? <p className="mt-1 text-xs text-slate-600">{t.emptySection}</p> : (
              <p className="mt-1 text-xs text-slate-600">A: {report.unmatched.A.map(constructLabel).join(", ") || "-"} / B: {report.unmatched.B.map(constructLabel).join(", ") || "-"}</p>
            )}
          </section>
          <section>
            <h3 className="text-sm font-bold text-slate-950">{t.questionsTitle}</h3>
            <ul className="mt-2 space-y-2">
              {[...new Set(report.questions.map((q) => q.lane))].map((lane) => (
                <li key={lane} className="rounded-lg bg-card px-3 py-2 text-xs leading-5 text-slate-800">
                  <span className="font-bold">{laneLabels[lane]}:</span> {laneQuestions[lane]}
                </li>
              ))}
            </ul>
          </section>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => withdraw("A")} className="min-h-11 rounded-lg border border-rose-300 bg-card px-4 py-2 text-sm font-bold text-rose-800">{t.withdrawMine}</button>
            <button type="button" onClick={() => withdraw("B")} className="min-h-11 rounded-lg border border-rose-300 bg-card px-4 py-2 text-sm font-bold text-rose-800">{t.withdrawPartner}</button>
            <button type="button" onClick={startOver} className="min-h-11 rounded-lg border border-slate-300 bg-card px-4 py-2 text-sm font-bold text-slate-700">{t.startOver}</button>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-sm font-semibold text-slate-700" role="status">{message}</p>}
    </section>
  );
}
