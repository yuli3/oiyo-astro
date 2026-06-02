import { getTranslations } from "next-intl/server";

import { HeaderClient } from "@/components/ui/header-client";

interface HeaderProps {
  locale: string;
  minimal?: boolean;
}

export async function Header({ locale, minimal = false }: HeaderProps) {
  const t = await getTranslations({ locale, namespace: "ui" });

  return (
    <HeaderClient locale={locale} minimal={minimal} tagline={t("tagline")} />
  );
}
