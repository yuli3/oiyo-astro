import { Locale } from "@/i18n";
import { StrictLocalized } from "@/lib/system/utils/localization";

export const commonTranslations = {
  finish: {
    zh: "完成",
    en: "Finish",
    es: "Finalizar",
    fr: "Terminer",
    ja: "完了",
    ko: "완료",
  },
  next: {
    zh: "下一个",
    en: "Next",
    es: "Siguiente",
    fr: "Suivant",
    ja: "次へ",
    ko: "다음",
  },
  offlineMode: {
    zh: "离线模式",
    en: "Offline Mode",
    es: "Modo fuera de línea",
    fr: "Mode hors ligne",
    ja: "オフラインモード",
    ko: "오프라인 모드",
  },
  offlineNotice: {
    zh: "进度将自动保存，您可以在在线时继续。",
    en: "Your progress is automatically saved and you can continue when online.",
    es: "Su progreso se guarda automáticamente y puede continuar cuando esté en línea.",
    fr: "Votre progression est automatiquement enregistrée et vous pouvez continuer en ligne.",
    ja: "進捗状況は自動的に保存され、オンライン時に続行できます。",
    ko: "진행 상황이 자동으로 저장되어 온라인 상태에서 계속할 수 있습니다.",
  },
  previous: {
    zh: "上一个",
    en: "Previous",
    es: "Anterior",
    fr: "Précédent",
    ja: "戻る",
    ko: "이전",
  },
  processing: {
    zh: "处理中...",
    en: "Processing...",
    es: "Procesando...",
    fr: "Traitement...",
    ja: "処理中...",
    ko: "처리 중...",
  },
  progress: {
    zh: "进度",
    en: "Progress",
    es: "Progreso",
    fr: "Progression",
    ja: "進捗",
    ko: "진행률",
  },
  questionOf: {
    zh: (current: number, total: number) => `问题 ${current} / ${total}`,
    en: (current: number, total: number) => `Question ${current} of ${total}`,
    es: (current: number, total: number) => `Pregunta ${current} de ${total}`,
    fr: (current: number, total: number) => `Question ${current} sur ${total}`,
    ja: (current: number, total: number) => `質問 ${current} / ${total}`,
    ko: (current: number, total: number) => `질문 ${current} / ${total}`,
  },
  saved: {
    zh: "已自动保存",
    en: "Auto-saved",
    es: "Auto-guardado",
    fr: "Auto-enregistré",
    ja: "自動保存済み",
    ko: "자동 저장됨",
  },
  saving: {
    zh: "保存中...",
    en: "Saving...",
    es: "Guardando...",
    fr: "Enregistrement...",
    ja: "保存中...",
    ko: "저장 중...",
  },
  seeResults: {
    zh: "查看结果",
    en: "See Results",
    es: "Ver resultados",
    fr: "Voir les résultats",
    ja: "結果を見る",
    ko: "결과 보기",
  },
  submit: {
    zh: "提交",
    en: "Submit",
    es: "Enviar",
    fr: "Soumettre",
    ja: "送信する",
    ko: "제출하기",
  },
  swipeToNavigate: {
    zh: "← 滑动移动 →",
    en: "← Swipe to navigate →",
    es: "← Deslizar para navegar →",
    fr: "← Balayer pour naviguer →",
    ja: "← スワイプで移動 →",
    ko: "← 스와이프로 이동 →",
  },
} as const;

export function getCommonTranslation(
  key: keyof typeof commonTranslations,
  locale: Locale,
) {
  return commonTranslations[key][locale];
}
