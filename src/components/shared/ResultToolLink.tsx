import { useEffect, useState } from 'react';
import { gaEvent, gaEventOnce } from '@/lib/analytics/ga-event';
import { pickTestTool, testIdFromPath, type ToolLink } from '@/lib/analytics/result-tool-link';

/**
 * One related calculator link under a test result (2026-11-23).
 * Rendered by ShareResultButton, so it only appears once a result is on screen.
 * Opens in a new tab so the result stays. GA4: result_tool_shown / result_tool_click.
 */
export default function ResultToolLink({ locale }: { locale: string }) {
  const [tool, setTool] = useState<(ToolLink & { testId: string }) | null>(null);

  useEffect(() => {
    const testId = testIdFromPath(location.pathname);
    const pick = pickTestTool(testId, locale, new Date().getMonth() + 1);
    if (!pick) return;
    setTool({ ...pick, testId });
    gaEventOnce('result_tool_shown', { test_id: testId, locale, tool: pick.key });
  }, [locale]);

  if (!tool) return null;

  return (
    <a
      href={tool.href}
      target="_blank"
      rel="noopener"
      data-result-tool={tool.key}
      onClick={() => gaEvent('result_tool_click', { test_id: tool.testId, locale, tool: tool.key })}
      className="mt-3 flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
    >
      <span aria-hidden="true" className="text-xl">🧮</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">{tool.lead}</span>
        <span className="block text-sm font-bold text-primary">{tool.label}</span>
      </span>
      <span aria-hidden="true" className="text-muted-foreground">→</span>
    </a>
  );
}
