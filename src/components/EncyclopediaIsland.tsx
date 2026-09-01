"use client";

import React, { Suspense, useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import { IntlProvider } from '@/lib/shims/next-intl';
import { Spinner } from '@/components/ui/spinner';

const EncyclopediaClient = React.lazy(() =>
  import('@/components/ontology/encyclopedia/EncyclopediaClient').then((m) => ({
    default: m.EncyclopediaClient,
  })),
);

interface Props {
  locale: string;
  messages: Record<string, unknown>;
}

export default function EncyclopediaIsland({ locale, messages }: Props) {
  return (
    // framer 는 transform 을 rAF 로 굴리므로 global.css 의 모션 담요가 닿지 않고,
    // framer 의 기본값(MotionConfigContext 의 "never")은 사용자 선호를 무시한다.
    // "user" 는 transform 만 끄고 opacity 는 남기는데, 전정기관 위험은 큰 면적의
    // 이동·확대·회전에서 오고 불투명도 변화에서는 오지 않으므로 정확히 맞는다.
    //
    // 이 섬이 사이트 전체에서 framer 가 실제로 하이드레이트되는 유일한 곳이다
    // (빌드 294개 청크 중 framer 런타임을 담은 청크는 EncyclopediaClient 하나).
    <MotionConfig reducedMotion="user">
      <IntlProvider locale={locale} messages={messages}>
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <Spinner className="size-8 text-green-400 motion-reduce:animate-none" />
            </div>
          }
        >
          <EncyclopediaClient />
        </Suspense>
      </IntlProvider>
    </MotionConfig>
  );
}
