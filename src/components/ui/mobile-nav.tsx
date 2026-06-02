"use client";

import {
  ChevronRight,
  Home,
  Menu,
  Moon,
  Sparkles,
  User,
  Waves,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import * as React from "react";
import { Drawer } from "vaul";

import { Button } from "@/components/ui/button";
import { MOBILE_NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  home: Home,
  Moon: Moon,
  Sparkles: Sparkles,
  User: User,
  Waves: Waves,
};

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <Drawer.Root onOpenChange={setOpen} open={open}>
      <Drawer.Trigger asChild>
        <Button
          aria-label="Open menu"
          className="md:hidden"
          size="icon"
          variant="ghost"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-[100]" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[24px] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] outline-none border-t border-border">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border my-4" />

          <div className="flex-1 overflow-y-auto px-6 pb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Oiyo.net</h2>
                <p className="text-muted-foreground text-sm font-medium">
                  Cosmic Sanctuary
                </p>
              </div>
              <Drawer.Close asChild>
                <Button
                  aria-label="Close menu"
                  className="rounded-full bg-muted text-foreground"
                  size="icon"
                  variant="ghost"
                >
                  <X className="w-5 h-5" />
                </Button>
              </Drawer.Close>
            </div>

            <div className="grid gap-3">
              {MOBILE_NAV_ITEMS.map((item) => {
                const Icon = ICON_MAP[item.icon] || Home;
                const fullHref = item.href.startsWith("http")
                  ? item.href
                  : item.href === "/"
                    ? `/${locale}`
                    : `/${locale}${item.href}`;
                return (
                  <Link
                    className="group"
                    href={fullHref}
                    key={item.id}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border transition-colors hover:bg-muted">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-lg">
                            {t(item.translationKey as any)}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {item.labelEn}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
