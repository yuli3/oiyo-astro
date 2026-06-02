import React from 'react';

type DynamicOptions<P> = {
  loading?: () => React.ReactElement | null;
  ssr?: boolean;
};

function dynamic<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> } | React.ComponentType<P>>,
  options?: DynamicOptions<P>,
): React.ComponentType<P> {
  const LazyComponent = React.lazy(async () => {
    const mod = await importFn();
    // Handle both { default: Component } and Component directly
    if (typeof mod === 'function' || (mod && typeof (mod as any).default === 'function')) {
      return { default: (typeof mod === 'function' ? mod : (mod as any).default) as React.ComponentType<P> };
    }
    return { default: mod as React.ComponentType<P> };
  });

  const Fallback = options?.loading ?? (() => null);

  return function DynamicWrapper(props: P) {
    return (
      React.createElement(React.Suspense, { fallback: React.createElement(Fallback) },
        React.createElement(LazyComponent as React.ComponentType<P>, props)
      )
    );
  } as React.ComponentType<P>;
}

export default dynamic;
