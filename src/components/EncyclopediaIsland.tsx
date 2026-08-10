"use client";

import React, { Suspense, useMemo } from 'react';
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
  );
}
