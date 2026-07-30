"use client";

import { Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { AuthStatus } from "@/components/auth/auth-status";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { MobileNav } from "@/components/ui/mobile-nav";
import { DESKTOP_NAV_ITEMS } from "@/config/navigation";
import type { Locale } from "@/i18n";
import { getLocalizedContent } from "@/lib/system/i18n/locale-utils";
import { features } from "@/registry/features";
import { ROUTES } from "@/registry/routes";

interface HeaderClientProps {
  locale: string;
  minimal?: boolean;
  tagline: string;
}

export function HeaderClient({
  locale,
  minimal = false,
  tagline,
}: HeaderClientProps) {
  const t = useTranslations("nav");
  const currentLocale = useLocale() as Locale;

  // 모바일 온리 페이지에서는 헤더를 최소화
  if (minimal) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link
              className="flex items-center space-x-2"
              href={ROUTES.HOME.path(locale as Locale)}
            >
              <span className="text-xl font-bold text-primary">Oiyo.net</span>
            </Link>
            <div className="flex items-center gap-2">
              <AuthStatus locale={locale} />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="z-50 sticky top-0 border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center space-x-2 group"
            href={ROUTES.HOME.path(locale as Locale)}
          >
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-serif text-lg font-bold group-hover:bg-primary/90 transition-colors">
              O
            </div>
            <span className="text-2xl font-serif font-bold text-foreground tracking-tight">
              Oiyo.net
            </span>
          </Link>

          <nav className="hidden items-center space-x-2 md:flex">
            {DESKTOP_NAV_ITEMS.map((item) => {
              const manifest = item.featureId ? features[item.featureId] : null;
              const label = manifest
                ? getLocalizedContent(currentLocale, manifest.name as any)
                : t(item.id as any);

              return (
                <Link
                  className={`px-4 py-2 text-sm text-muted-foreground transition-colors rounded-md font-medium hover:text-foreground ${item.className || ""}`}
                  href={
                    item.href.startsWith("http")
                      ? item.href
                      : `/${locale}${item.href}`
                  }
                  key={item.id}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <GlobalSearch locale={locale} />
            </div>
            <div className="flex items-center gap-2">
              <AuthStatus locale={locale} />
              <MobileNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
