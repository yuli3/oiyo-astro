import { Github, Mail, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Locale } from "@/i18n";
import { ROUTES } from "@/registry/routes";

interface FooterProps {
  locale: Locale;
  minimal?: boolean;
}

export function Footer({ locale, minimal = false }: FooterProps) {
  const t = useTranslations("ui");
  const tNav = useTranslations("nav");
  const currentYear = new Date().getFullYear();

  // 모바일 온리 페이지에서는 Footer를 최소화
  if (minimal) {
    return (
      <footer className="py-6 px-4 bg-muted border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-3">
            © {currentYear} Oiyo.net. {t("allRightsReserved")}
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors"
              href={ROUTES.LEGAL.PRIVACY.path(locale)}
            >
              {tNav("privacy")}
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors"
              href={ROUTES.LEGAL.TERMS.path(locale)}
            >
              {tNav("terms")}
            </Link>
            <a
              className="text-muted-foreground hover:text-foreground transition-colors"
              href={`mailto:support@oiyo.net`}
            >
              {tNav("contact")}
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#022c22] text-white border-t border-white/10 overflow-hidden relative z-[100]">
      <div className="container mx-auto px-4 py-12 relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Brand */}
        <div className="space-y-4 flex flex-col items-center">
          <Link
            className="flex items-center gap-2 group"
            href={ROUTES.HOME.path(locale)}
          >
            <div className="w-10 h-10 bg-primary/80 text-primary-foreground rounded-xl flex items-center justify-center font-serif text-xl font-bold group-hover:bg-primary transition-colors">
              O
            </div>
            <span className="text-3xl font-serif font-bold text-white tracking-tight">
              Oiyo.net
            </span>
          </Link>
          <p className="text-white/60 text-sm font-sans tracking-wide max-w-sm">
            {t("tagline")}
          </p>
        </div>

        {/* Essential Links Grouped */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-x-12 gap-y-6 text-sm font-medium tracking-wide">
          {/* Introduction Group */}
          <div className="flex gap-4 items-center">
            <Link
              className="text-white/60 hover:text-white transition-colors"
              href={ROUTES.MARKETING.ABOUT.path(locale)}
            >
              {tNav("about")}
            </Link>
            <span className="text-white/20">•</span>
            <Link
              className="text-white/60 hover:text-white transition-colors text-xs"
              href={ROUTES.MARKETING.ABOUT.path(locale) + "#changelog"}
            >
              {tNav("changelog")}
            </Link>
          </div>

          {/* Support Group */}
          <div className="flex gap-4 items-center">
            <Link
              className="text-white/60 hover:text-white transition-colors"
              href={ROUTES.CONTACT.path(locale)}
            >
              {tNav("contact")}
            </Link>
            <span className="text-white/20">•</span>
            <Link
              className="text-white/60 hover:text-white transition-colors text-xs"
              href={ROUTES.CONTACT.path(locale) + "#faq"}
            >
              {tNav("faq")}
            </Link>
          </div>

          {/* Legal Independent Lines */}
          <Link
            className="text-white/60 hover:text-white transition-colors"
            href={ROUTES.LEGAL.PRIVACY.path(locale)}
          >
            {tNav("privacy")}
          </Link>
          <Link
            className="text-white/60 hover:text-white transition-colors"
            href={ROUTES.LEGAL.TERMS.path(locale)}
          >
            {tNav("terms")}
          </Link>
        </div>

        {/* Family Sites */}
        <div className="flex gap-6 text-xs text-white/40 items-center">
          <span className="font-bold uppercase tracking-widest text-white/50 text-[10px]">
            Family
          </span>
          <a
            className="hover:text-white transition-colors"
            href="https://ahoxy.com?utm_source=oiyo&utm_medium=referral&utm_campaign=family_nav"
            rel="noopener noreferrer"
            target="_blank"
          >
            Ahoxy — Tools
          </a>
          <a
            className="hover:text-white transition-colors"
            href="https://blog.oiyo.net?utm_source=oiyo&utm_medium=referral&utm_campaign=family_nav"
            rel="noopener noreferrer"
            target="_blank"
          >
            Blog Oiyo
          </a>
        </div>

        {/* Divider */}
        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom Bar */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40 font-medium">
          <p>
            © {currentYear} Oiyo.net. {t("allRightsReserved")}
          </p>
          <div className="flex gap-6 items-center">
            <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">
              {t("donate")}
            </span>
            <a
              className="hover:text-white transition-colors flex items-center gap-1"
              href="https://ko-fi.com/tqqq3"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {t("koFi")}
            </a>
            <a
              className="hover:text-white transition-colors flex items-center gap-1"
              href="https://www.paypal.com/paypalme/chosean"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              {t("payPal")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
