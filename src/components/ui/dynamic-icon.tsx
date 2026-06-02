/* eslint-disable react-hooks/static-components */
"use client";

import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import dynamic from "next/dynamic";
import { useMemo } from "react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = useMemo(
    () =>
      dynamic(dynamicIconImports[name as keyof typeof dynamicIconImports], {
        loading: () => (
          <div className="w-6 h-6 bg-green-50 rounded animate-pulse" />
        ),
      }),
    [name],
  );

  return <IconComponent {...props} />;
}
