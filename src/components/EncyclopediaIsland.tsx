"use client";

import React, { Suspense, useMemo } from 'react';
import { IntlProvider } from '@/lib/shims/next-intl';

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
    <IntlProvider locale={locale} messages={messages}>
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
          </div>
        }
      >
        <EncyclopediaClient />
      </Suspense>
    </IntlProvider>
  );
}
