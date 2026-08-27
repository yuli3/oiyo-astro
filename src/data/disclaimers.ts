import type { Locale } from '../i18n';

export type DisclaimerKind = 'symbolic-interpretation';

export const DISCLAIMERS: Record<DisclaimerKind, Record<Locale, string>> = {
  'symbolic-interpretation': {
    ko: '천문 위치 계산과 점성술 해석은 다릅니다. 이 결과의 해석은 오락과 자기 성찰을 위한 상징적 참고이며, 의료·법률·재정·관계 결정을 대신하지 않습니다.',
    en: 'Astronomical position calculations and astrological interpretation are different. This interpretation is a symbolic reference for entertainment and self-reflection, not a substitute for medical, legal, financial, or relationship decisions.',
    ja: '天体位置の計算と占星術の解釈は異なります。この解釈は娯楽と自己省察のための象徴的な参考であり、医療・法律・財務・人間関係の判断を代替しません。',
    zh: '天体位置计算与占星解释并不相同。本解读仅作为娱乐与自我反思的象征性参考，不替代医疗、法律、财务或关系决定。',
    fr: 'Le calcul des positions astronomiques et l’interprétation astrologique sont distincts. Cette interprétation est une référence symbolique pour le divertissement et la réflexion, non un substitut aux décisions médicales, juridiques, financières ou relationnelles.',
    es: 'El cálculo de posiciones astronómicas y la interpretación astrológica son distintos. Esta interpretación es una referencia simbólica para entretenimiento y reflexión, no sustituye decisiones médicas, legales, financieras ni relacionales.',
  },
};

