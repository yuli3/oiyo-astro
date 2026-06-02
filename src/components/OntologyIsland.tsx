"use client";

import React, { Suspense } from 'react';
import { IntlProvider } from '@/lib/shims/next-intl';
import { UserProvider } from '@/lib/user/context/UserContext';

// Lazy-load the heavy OntologyClient to keep initial bundle lean
const OntologyClient = React.lazy(() =>
  import('@/components/ontology/OntologyClient').then((m) => ({
    default: m.OntologyClient,
  })),
);

interface OntologyIslandProps {
  locale: string;
  messages: Record<string, unknown>;
}

export default function OntologyIsland({ locale, messages }: OntologyIslandProps) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      <UserProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full border-2 border-green-400 border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-sm text-green-600">Loading sanctuary…</p>
              </div>
            </div>
          }
        >
          <OntologyClient />
        </Suspense>
      </UserProvider>
    </IntlProvider>
  );
}
