// Premium feature gates and access control

import type { Locale } from "@/i18n";

import { getLocalizedContent } from "@/lib/system/i18n/locale-utils";

import { FREE_FEATURES, getFeaturesForTier } from "../payments/plans";
import { PremiumFeatures, SubscriptionStatus } from "../payments/types";

export class PremiumGates {
  // Check if user can access advanced insights
  static canAccessAdvancedInsights(
    userSubscription: null | SubscriptionStatus,
  ): boolean {
    return this.hasFeatureAccess(userSubscription, "advancedInsights");
  }

  // Check if user can create custom reports
  static canCreateCustomReports(
    userSubscription: null | SubscriptionStatus,
  ): boolean {
    return this.hasFeatureAccess(userSubscription, "customReports");
  }

  // Check if user can export PDF reports
  static canExportPDF(userSubscription: null | SubscriptionStatus): boolean {
    return this.hasFeatureAccess(userSubscription, "pdfExport");
  }

  // Check if user can access AI analysis
  static canUseAIAnalysis(
    userSubscription: null | SubscriptionStatus,
  ): boolean {
    return this.hasFeatureAccess(userSubscription, "aiAnalysis");
  }

  // Get feature limitations for users based on locale
  static getFeatureLimitations(locale: Locale): {
    feature: keyof PremiumFeatures;
    limitation: string;
    upgradeMessage: string;
  }[] {
    return [
      {
        feature: "aiAnalysis",
        limitation: getLocalizedContent(locale, {
          zh: "无法使用AI深度分析",
          en: "AI Deep Analysis is not available",
          es: "El análisis profundo de IA no está disponible",
          fr: "L'analyse approfondie de l'IA n'est pas disponible",
          ja: "AI詳細分析は利用できません",
          ko: "AI 심화 분석을 사용할 수 없습니다",
        })!,
        upgradeMessage: getLocalizedContent(locale, {
          zh: "升级到高级版以获取基于AI的性格分析",
          en: "Upgrade to Premium to get AI-based personality analysis",
          es: "Actualiza a Premium para obtener un análisis de personalidad basado en IA",
          fr: "Passez au mode Premium pour obtenir une analyse de personnalité basée sur l'IA",
          ja: "プレミアムにアップグレードしてAIベースの性格分析を受けましょう",
          ko: "프리미엄으로 업그레이드하여 AI 기반 성격 분석을 받아보세요",
        })!,
      },
      {
        feature: "pdfExport",
        limitation: getLocalizedContent(locale, {
          zh: "无法下载PDF报告",
          en: "Cannot download PDF reports",
          es: "No se pueden descargar los informes PDF",
          fr: "Impossible de télécharger les rapports PDF",
          ja: "PDFレポートをダウンロードできません",
          ko: "PDF 리포트를 다운로드할 수 없습니다",
        })!,
        upgradeMessage: getLocalizedContent(locale, {
          zh: "升级到高级版以将结果保存为PDF",
          en: "Upgrade to Premium to save results as PDF",
          es: "Actualiza a Premium para guardar los resultados como PDF",
          fr: "Passez au mode Premium pour enregistrer les résultats en PDF",
          ja: "プレミアムにアップグレードして結果をPDFで保存しましょう",
          ko: "프리미엄으로 업그레이드하여 결과를 PDF로 저장하세요",
        })!,
      },
      {
        feature: "advancedInsights",
        limitation: getLocalizedContent(locale, {
          zh: "无法查看高级洞察",
          en: "Cannot view advanced insights",
          es: "No se pueden ver los informes avanzados",
          fr: "Impossible de voir les insights avancés",
          ja: "高度なインサイトを表示できません",
          ko: "고급 인사이트를 볼 수 없습니다",
        })!,
        upgradeMessage: getLocalizedContent(locale, {
          zh: "升级到高级版以获取个性化洞察",
          en: "Upgrade to Premium to get personalized insights",
          es: "Actualiza a Premium para obtener informes personalizados",
          fr: "Passez au mode Premium pour obtenir des insights personnalisés",
          ja: "プレミアムにアップグレードしてパーソナライズされたインサイトを受けましょう",
          ko: "프리미엄으로 업그레이드하여 개인 맞춤형 인사이트를 받아보세요",
        })!,
      },
      {
        feature: "customReports",
        limitation: getLocalizedContent(locale, {
          zh: "无法创建自定义报告",
          en: "Cannot create custom reports",
          es: "No se pueden crear informes personalizados",
          fr: "Impossible de créer des rapports personnalisés",
          ja: "カスタムレポートを作成できません",
          ko: "맞춤형 리포트를 생성할 수 없습니다",
        })!,
        upgradeMessage: getLocalizedContent(locale, {
          zh: "升级到高级版以使用自定义数据分析",
          en: "Upgrade to Premium to use custom data analysis",
          es: "Actualiza a Premium para utilizar el análisis de datos personalizado",
          fr: "Passez au mode Premium pour utiliser l'analyse de données personnalisée",
          ja: "プレミアムにアップグレードしてカスタムデータ分析を利用しましょう",
          ko: "프리미엄으로 업그레이드하여 맞춤형 데이터 분석을 이용하세요",
        })!,
      },
    ];
  }

  // Get upgrade call-to-action for specific feature
  static getUpgradeCTA(
    feature: keyof PremiumFeatures,
    locale: Locale,
  ): {
    buttonText: string;
    description: string;
    title: string;
  } {
    const ctaMap = {
      advancedInsights: {
        buttonText: getLocalizedContent(locale, {
          zh: "现在升级",
          en: "Upgrade Now",
          es: "Actualizar ahora",
          fr: "Mettre à niveau maintenant",
          ja: "今すぐアップグレード",
          ko: "지금 업그레이드",
        })!,
        description: getLocalizedContent(locale, {
          zh: "获取更深入的性格分析和个性化建议",
          en: "Get deeper personality analysis and personalized advice",
          es: "Obtén un análisis de personalidad más profundo y consejos personalizados",
          fr: "Obtenez une analyse de personnalité plus approfondie et des conseils personnalisés",
          ja: "より深い性格分析とパーソナライズされたアドバイスを受けましょう",
          ko: "더 깊이 있는 성격 분석과 개인 맞춤 조언을 받아보세요",
        })!,
        title: getLocalizedContent(locale, {
          zh: "访问高级洞察",
          en: "Access Advanced Insights",
          es: "Acceder a informes avanzados",
          fr: "Accéder aux insights avancés",
          ja: "高度なインサイトにアクセス",
          ko: "고급 인사이트 확인",
        })!,
      },
      aiAnalysis: {
        buttonText: getLocalizedContent(locale, {
          zh: "升级到高级版",
          en: "Upgrade to Premium",
          es: "Actualizar a Premium",
          fr: "Passer au mode Premium",
          ja: "プレミアムにアップグレード",
          ko: "프리미엄으로 업그레이드",
        })!,
        description: getLocalizedContent(locale, {
          zh: "利用先进AI技术获取更准确、更个性化的性格分析",
          en: "Get more accurate and personalized personality analysis with advanced AI technology",
          es: "Obtén un análisis de personalidad más preciso y personalizado con tecnología de IA avanzada",
          fr: "Obtenez une analyse de personnalité plus précise et personnalisée grâce à la technologie IA avancée",
          ja: "高度なAI技術により、より正確でパーソナライズされた性格分析を受けましょう",
          ko: "고급 AI 기술로 더 정확하고 개인화된 성격 분석을 받아보세요",
        })!,
        title: getLocalizedContent(locale, {
          zh: "解锁AI深度分析",
          en: "Unlock AI Deep Analysis",
          es: "Desbloquear el análisis profundo de IA",
          fr: "Débloquer l'analyse approfondie de l'IA",
          ja: "AI詳細分析のロック解除",
          ko: "AI 심화 분석 잠금 해제",
        })!,
      },
      customReports: {
        buttonText: getLocalizedContent(locale, {
          zh: "试用高级版",
          en: "Try Premium",
          es: "Probar Premium",
          fr: "Essayer le mode Premium",
          ja: "プレミアムを試す",
          ko: "프리미엄 체험하기",
        })!,
        description: getLocalizedContent(locale, {
          zh: "生成您自己的数据分析和自定义报告",
          en: "Generate your own data analysis and custom reports",
          es: "Genera tu propio análisis de datos e informes personalizados",
          fr: "Générez votre propre analyse de données et vos rapports personnalisés",
          ja: "独自のデータ分析とカスタムレポートを生成しましょう",
          ko: "나만의 데이터 분석과 맞춤형 리포트를 생성하세요",
        })!,
        title: getLocalizedContent(locale, {
          zh: "创建自定义报告",
          en: "Create Custom Reports",
          es: "Crear informes personalizados",
          fr: "Créer des rapports personnalisés",
          ja: "カスタムレポートを作成",
          ko: "맞춤형 리포트 생성",
        })!,
      },
      pdfExport: {
        buttonText: getLocalizedContent(locale, {
          zh: "开始使用高级版",
          en: "Start Premium",
          es: "Iniciar Premium",
          fr: "Démarrer le mode Premium",
          ja: "プレミアムを開始",
          ko: "프리미엄 시작하기",
        })!,
        description: getLocalizedContent(locale, {
          zh: "以精美的PDF格式保存和分享您的结果",
          en: "Save and share your results in beautiful PDF format",
          es: "Guarda y comparte tus resultados en un hermoso formato PDF",
          fr: "Enregistrez et partagez vos résultats dans un superbe format PDF",
          ja: "結果を美しいPDF形式で保存して共有しましょう",
          ko: "결과를 아름다운 PDF 형태로 저장하고 공유하세요",
        })!,
        title: getLocalizedContent(locale, {
          zh: "下载PDF报告",
          en: "Download PDF Reports",
          es: "Descargar informes PDF",
          fr: "Télécharger les rapports PDF",
          ja: "PDFレポートをダウンロード",
          ko: "PDF 리포트 다운로드",
        })!,
      },
      prioritySupport: {
        buttonText: getLocalizedContent(locale, {
          zh: "加入高级版",
          en: "Join Premium",
          es: "Unirse a Premium",
          fr: "Rejoindre le mode Premium",
          ja: "プレミアムに加入",
          ko: "프리미엄 가입",
        })!,
        description: getLocalizedContent(locale, {
          zh: "获取更快速、更专业的客户支持",
          en: "Get faster and more professional customer support",
          es: "Obtén un soporte al cliente más rápido y profesional",
          fr: "Obtenez un support client plus rapide et plus professionnel",
          ja: "より迅速で専門的なカスタマーサポートを受けましょう",
          ko: "더 빠르고 전문적인 고객 지원을 받아보세요",
        })!,
        title: getLocalizedContent(locale, {
          zh: "优先客户支持",
          en: "Priority Customer Support",
          es: "Atención al cliente prioritaria",
          fr: "Support client prioritaire",
          ja: "優先カスタマーサポート",
          ko: "우선 고객 지원",
        })!,
      },
      testHistory: {
        buttonText: getLocalizedContent(locale, {
          zh: "免费注册",
          en: "Sign Up Free",
          es: "Registrarse gratis",
          fr: "S'inscrire gratuitement",
          ja: "無料で新規登録",
          ko: "무료 회원가입",
        })!,
        description: getLocalizedContent(locale, {
          zh: "保存您的所有测试结果并跟踪随时间的变化",
          en: "Save all your test results and track changes over time",
          es: "Guarda todos los resultados de tus pruebas y realiza un seguimiento de los cambios a lo largo del tiempo",
          fr: "Enregistrez tous vos résultats de tests et suivez les changements au fil du temps",
          ja: "すべてのテスト結果を保存し、時間経過による変化を追跡しましょう",
          ko: "모든 테스트 결과를 저장하고 시간에 따른 변화를 추적하세요",
        })!,
        title: getLocalizedContent(locale, {
          zh: "保存测试历史",
          en: "Save Test History",
          es: "Guardar historial de pruebas",
          fr: "Enregistrer l'historique des tests",
          ja: "テスト履歴を保存",
          ko: "테스트 기록 저장",
        })!,
      },
      unlimitedTests: {
        buttonText: getLocalizedContent(locale, {
          zh: "继续免费使用",
          en: "Continue Free",
          es: "Continuar gratis",
          fr: "Continuer gratuitement",
          ja: "無料で継続",
          ko: "계속 무료로 이용",
        })!,
        description: getLocalizedContent(locale, {
          zh: "进行无限次的性格测试",
          en: "Take unlimited personality tests",
          es: "Realiza pruebas de personalidad ilimitadas",
          fr: "Passez des tests de personnalité illimités",
          ja: "すべての性格テストを無制限に受けましょう",
          ko: "모든 성격 테스트를 무제한으로 이용하세요",
        })!,
        title: getLocalizedContent(locale, {
          zh: "无限测试",
          en: "Unlimited Tests",
          es: "Pruebas ilimitadas",
          fr: "Tests illimités",
          ja: "無制限テスト",
          ko: "무제한 테스트",
        })!,
      },
    };

    return ctaMap[feature] || ctaMap.aiAnalysis;
  }

  // Get all features for user's subscription
  static getUserFeatures(
    userSubscription: null | SubscriptionStatus,
  ): PremiumFeatures {
    if (!userSubscription || !userSubscription.isActive) {
      return FREE_FEATURES;
    }

    return getFeaturesForTier(userSubscription.tier);
  }

  // Check if user has access to a specific feature
  static hasFeatureAccess(
    userSubscription: null | SubscriptionStatus,
    feature: keyof PremiumFeatures,
  ): boolean {
    if (!userSubscription || !userSubscription.isActive) {
      return FREE_FEATURES[feature];
    }

    const userFeatures = getFeaturesForTier(userSubscription.tier);
    return userFeatures[feature];
  }

  // Check if user has priority support
  static hasPrioritySupport(
    userSubscription: null | SubscriptionStatus,
  ): boolean {
    return this.hasFeatureAccess(userSubscription, "prioritySupport");
  }

  // Check if feature should show upgrade prompt
  static shouldShowUpgradePrompt(
    userSubscription: null | SubscriptionStatus,
    feature: keyof PremiumFeatures,
  ): boolean {
    return !this.hasFeatureAccess(userSubscription, feature);
  }
}

// Hook for accessing premium features in React components
export function usePremiumFeature(
  feature: keyof PremiumFeatures,
  userSubscription: null | SubscriptionStatus,
  locale: Locale = "en",
) {
  const hasAccess = PremiumGates.hasFeatureAccess(userSubscription, feature);
  const shouldShowUpgrade = PremiumGates.shouldShowUpgradePrompt(
    userSubscription,
    feature,
  );

  return {
    hasAccess,
    limitation: PremiumGates.getFeatureLimitations(locale).find(
      (l) => l.feature === feature,
    ),
    shouldShowUpgrade,
  };
}
