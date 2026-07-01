"use client";

import React, { useMemo } from 'react';
import { IntlProvider } from '@/lib/shims/next-intl';
import { OntologyClient } from '@/components/ontology/OntologyClient';
import { UserProvider } from '@/lib/user/context/UserContext';

interface OntologyIslandProps {
  locale: string;
  messages: Record<string, unknown>;
}

/**
 * Pre-process messages to build the nested namespace tree that next-intl expects.
 * e.g. useTranslations("ontology.dashboard") navigates messages["ontology"]["dashboard"]
 *      useTranslations("ontology.lifestyle.hobby") navigates messages["ontology"]["lifestyle"]["hobby"]
 */
function buildMessageTree(flat: Record<string, unknown>): Record<string, unknown> {
  const tree: Record<string, unknown> = { ...flat };

  // Build nested paths for dotted namespaces used by OntologyClient
  // "ontology.dashboard" → tree["ontology"]["dashboard"]
  // "ontology.lifestyle.hobby" → tree["ontology"]["lifestyle"]["hobby"]
  const dotPaths: Array<[string, string]> = [
    ['ontology.dashboard', 'dashboard'],
    ['ontology.lifestyle.hobby', 'hobby'],
    ['fortune.selfSaju', 'saju'],
  ];

  for (const [dotPath, sourceKey] of dotPaths) {
    if (!flat[sourceKey]) continue;
    const parts = dotPath.split('.');
    let cur = tree as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') {
        cur[parts[i]] = {};
      }
      cur = cur[parts[i]] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = flat[sourceKey];
  }

  // Merge ontology.lucky into ontology.dashboard so t('lucky.*') resolves
  // within the useNamespacedFallback('ontology.dashboard', 'dashboard') context.
  const ontObj = flat['ontology'] as Record<string, unknown> | undefined;
  const ontTree = tree['ontology'] as Record<string, unknown> | undefined;
  if (ontObj?.['lucky'] && ontTree?.['dashboard']) {
    (ontTree['dashboard'] as Record<string, unknown>)['lucky'] = ontObj['lucky'];
  }

  return tree;
}

export default function OntologyIsland({ locale, messages }: OntologyIslandProps) {
  const tree = useMemo(() => buildMessageTree(messages), [messages]);

  return (
    <IntlProvider locale={locale} messages={tree}>
      <UserProvider>
        <OntologyClient />
      </UserProvider>
    </IntlProvider>
  );
}
