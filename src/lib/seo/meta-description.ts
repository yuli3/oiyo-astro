/**
 * meta-description.ts — OIYO 패밀리 통합 SEO(Google·Bing) & AIEO 메타 디스크립션 빌더
 * (Phase A: 단문·누락 방어 및 골든 레인지 110~140자 스마트 확장 엔진)
 */
import type { Locale } from '../../i18n';

export interface BuildMetaDescriptionOptions {
  title: string;
  description?: string;
  locale: Locale;
  pathname?: string;
  basis?: string | string[];
  category?: string;
}

// 6개 로케일별 기본 브랜드 및 가치 제안 문구 (단독 노출 금지, 결합용)
const LOCALE_CTA: Record<Locale, {
  testCta: string;
  sajuCta: string;
  dreamCta: string;
  generalCta: string;
  fallbackTemplate: (title: string) => string;
}> = {
  ko: {
    testCta: '문항별 응답을 통해 나의 성향과 행동 특성을 분석하고, 유형별 맞춤 분석 리포트와 솔루션을 즉시 무료로 확인하세요.',
    sajuCta: '만세력 60갑자 기반 정밀 알고리즘으로 대운과 오행의 흐름을 분석한 맞춤 운세와 길흉 조언을 확인하세요.',
    dreamCta: '전통 해몽의 문화적 상징과 현대 꿈 연구의 심리적 의미를 종합 비교하고, 대표 장면별 길흉 해석과 무의식의 메시지를 확인하세요.',
    generalCta: '정밀 인터랙티브 분석 도구로 나의 상태를 진단하고 맞춤 가이드와 통찰을 즉시 확인하세요.',
    fallbackTemplate: (t) => `${t} — OIYO의 정밀 인터랙티브 도구로 나의 성향과 운명을 분석하고 맞춤 결과를 즉시 무료로 확인하세요.`,
  },
  en: {
    testCta: 'Answer questions to analyze your behavioral traits and discover your personalized profile report and practical advice instantly for free.',
    sajuCta: 'Explore your destiny, energy flow, and fortune with traditional Asian astrology and precise algorithmic calculations.',
    dreamCta: 'Explore traditional cultural symbol interpretations and modern dream psychology to uncover subconscious messages, scene-by-scene meanings, and guidance.',
    generalCta: 'Explore interactive self-discovery tools to gain personal insights, behavioral analysis, and customized guidance.',
    fallbackTemplate: (t) => `${t} — Explore your personality, destiny, and self with OIYO interactive tools. Get instant personalized insights for free.`,
  },
  ja: {
    testCta: '設問に答えて自分の傾向と行動特性を分析し、パーソナライズされた結果レポートとアドバイスを今すぐ無料で確認しましょう。',
    sajuCta: '伝統的な四柱推命と精密アルゴリズムで、あなたの運勢と五行の流れをリアルタイムに診断し、開運のヒントをお届けします。',
    dreamCta: '伝統的な夢解きの象徴と現代心理学の視点を総合的に比較し、場面ごとの吉凶の意味と無意識からのメッセージを詳しく解説します。',
    generalCta: '自己探求のための対話型ツールで、あなたの可能性とパーソナルな指針を今すぐ見つけましょう。',
    fallbackTemplate: (t) => `${t} — OIYOの対話型診断ツールであなたの個性と運命を探求し、パーソナライズされた結果を今すぐ無料で確認しましょう。`,
  },
  zh: {
    testCta: '通过回答问题深入分析你的内在特质与行为模式，立即免费获取定制化的个性分析报告与行动建议。',
    sajuCta: '基于传统生辰八字万年历与精密算法，全面解析五行大运流年，即时查看你的命理运势与开运指引。',
    dreamCta: '结合传统周公解梦的文化象征与现代梦境心理学分析，深入解读各种具体梦境场景下的吉凶预兆与潜意识指引。',
    generalCta: '借助精准互动探索工具，深入了解自我特质并获取量身定制的成长指南。',
    fallbackTemplate: (t) => `${t} — 使用OIYO精准互动探索工具深入了解自我特质与命运，立即免费获取定制化结果。`,
  },
  fr: {
    testCta: 'Répondez aux questions pour analyser vos traits et découvrez votre rapport personnalisé et vos conseils instantanément et gratuitement.',
    sajuCta: "Explorez votre destinée et vos énergies astrologiques grâce à des algorithmes de calcul traditionnels précis et des conseils clairs.",
    dreamCta: "Interprétez les symboles de votre subconscient grâce aux lectures traditionnelles et psychologiques des rêves scène par scène.",
    generalCta: "Découvrez nos outils interactifs d'introspection pour mieux comprendre votre potentiel et votre avenir.",
    fallbackTemplate: (t) => `${t} — Explorez votre personnalité et votre destin avec les outils interactifs d'OIYO. Obtenez des résultats personnalisés gratuits.`,
  },
  es: {
    testCta: 'Responde a las preguntas para analizar tus rasgos y descubre tu informe personalizado y consejos prácticos al instante y gratis.',
    sajuCta: 'Explora tu destino y las energías astrales con cálculos precisos basados en la astrología tradicional y guías claras.',
    dreamCta: 'Interpreta los símbolos de tu subconsciente con perspectivas tradicionales y psicológicas sobre los sueños escena por escena.',
    generalCta: 'Descubre herramientas interactivas de autoconocimiento para obtener orientación y claridad personal.',
    fallbackTemplate: (t) => `${t} — Explora tu personalidad y tu destino con las herramientas interactivas de OIYO. Obtén resultados personalizados gratis.`,
  },
};

/**
 * Clean and truncate string at sentence or word boundary without breaking emojis/words.
 */
function safeTruncate(text: string, maxLen: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;

  // Try to cut at sentence boundary (. ! ?)
  const sub = cleaned.slice(0, maxLen);
  const lastPunct = Math.max(sub.lastIndexOf('. '), sub.lastIndexOf('! '), sub.lastIndexOf('? '));
  if (lastPunct > maxLen * 0.7) {
    return sub.slice(0, lastPunct + 1).trim();
  }

  // Otherwise cut at last space
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.7) {
    return sub.slice(0, lastSpace).trim() + '...';
  }

  return sub.trim() + '...';
}

/**
 * Builds an optimized, informative meta description for SEO (Google, Bing) and AIEO (Copilot, SGE, ChatGPT).
 */
export function buildMetaDescription(opts: BuildMetaDescriptionOptions): string {
  const { title, locale, pathname = '', basis } = opts;
  let rawDesc = (opts.description ?? '').trim();
  const cta = LOCALE_CTA[locale] ?? LOCALE_CTA.en;
  const isCjk = ['ko', 'ja', 'zh'].includes(locale);
  const minLength = isCjk ? 75 : 95;
  const targetMax = isCjk ? 145 : 170;

  // 1. If description is already good and sufficiently long, check if it's identical to title
  const cleanTitle = title.split('—')[0].split('|')[0].trim();
  const isTitleDuplicate = rawDesc.toLowerCase() === title.toLowerCase() || rawDesc.toLowerCase() === cleanTitle.toLowerCase();

  // Route-type detection
  const path = pathname.toLowerCase();
  const isTest = path.includes('test') || path.includes('quiz') || Boolean(basis);
  const isSaju = path.includes('saju') || path.includes('tojeong') || path.includes('60gapja') || path.includes('almanac');
  const isNatal = path.includes('natal') || path.includes('zodiac') || path.includes('birth');
  const isDream = path.includes('dream');

  // Case A: Description is missing or duplicate of title
  if (!rawDesc || isTitleDuplicate) {
    if (isTest) {
      const basisText = Array.isArray(basis) ? basis.join(', ') : basis;
      const basisNote = basisText ? ` (${basisText})` : '';
      const lowerTitle = cleanTitle.toLowerCase();
      const hasTestWord = lowerTitle.includes('test') || lowerTitle.includes('quiz') || lowerTitle.includes('자가진단') || lowerTitle.includes('진단') || lowerTitle.includes('自测');

      if (locale === 'ko') {
        const suffix = hasTestWord ? '' : ' 자가진단';
        rawDesc = `${cleanTitle}${basisNote}${suffix} — ${cta.testCta}`;
      } else if (locale === 'ja') {
        const suffix = hasTestWord ? '' : ' 診断';
        rawDesc = `${cleanTitle}${basisNote}${suffix} — ${cta.testCta}`;
      } else if (locale === 'zh') {
        const suffix = hasTestWord ? '' : ' 自测';
        rawDesc = `${cleanTitle}${basisNote}${suffix} — ${cta.testCta}`;
      } else if (locale === 'fr') {
        const prefix = hasTestWord ? '' : 'Test ';
        rawDesc = `${prefix}${cleanTitle}${basisNote} — ${cta.testCta}`;
      } else if (locale === 'es') {
        const prefix = hasTestWord ? '' : 'Test ';
        rawDesc = `${prefix}${cleanTitle}${basisNote} — ${cta.testCta}`;
      } else {
        const suffix = hasTestWord ? '' : ' Self-Test';
        rawDesc = `${cleanTitle}${basisNote}${suffix} — ${cta.testCta}`;
      }
    } else if (isSaju || isNatal) {
      rawDesc = `${cleanTitle} — ${isSaju ? cta.sajuCta : cta.generalCta}`;
    } else if (isDream) {
      rawDesc = `${cleanTitle} 해몽 — ${cta.dreamCta}`;
    } else {
      rawDesc = cta.fallbackTemplate(cleanTitle);
    }
  }

  // Case B: Description exists but is too short (< minLength)
  if (rawDesc.length < minLength) {
    // Append the appropriate CTA if not already present
    if (isTest && !rawDesc.includes('무료') && !rawDesc.includes('free') && !rawDesc.includes('無料')) {
      rawDesc = `${rawDesc.replace(/[.]+$/, '')}. ${cta.testCta}`;
    } else if (isDream && !rawDesc.includes('메시지') && !rawDesc.includes('message')) {
      rawDesc = `${rawDesc.replace(/[.]+$/, '')}. ${cta.dreamCta}`;
    } else if (isSaju && !rawDesc.includes('운세') && !rawDesc.includes('fortune')) {
      rawDesc = `${rawDesc.replace(/[.]+$/, '')}. ${cta.sajuCta}`;
    } else {
      rawDesc = `${rawDesc.replace(/[.]+$/, '')}. ${cta.generalCta}`;
    }
  }

  return safeTruncate(rawDesc, targetMax);
}
