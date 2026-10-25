import type { Locale } from "@/i18n";

const COPY = {
  ko: ["복씨", "읽어 주셔서 고마워요.", "도움이 됐다면 아래 후원 메뉴에서 마음을 보태실 수 있어요. 후원은 선택이며, 모든 해석은 그대로 무료예요.", "후원 안내 보기"],
  en: ["Bokssi", "Thanks for reading.", "If this helped, you can support OIYO through the footer below. Support is optional, and every reading stays free.", "See support options"],
  ja: ["ボクシ", "読んでくださってありがとうございます。", "お役に立てたら、下のフッターから応援していただけます。応援は任意で、すべての解釈は引き続き無料です。", "応援方法を見る"],
  zh: ["福籽", "谢谢您读到这里。", "如果这些内容对您有帮助，可以通过下方页脚支持 OIYO。支持完全自愿，所有解读仍然免费。", "查看支持方式"],
  fr: ["Bokssi", "Merci de votre lecture.", "Si cela vous a aidé, vous pouvez soutenir OIYO depuis le pied de page. Ce soutien est facultatif et toutes les interprétations restent gratuites.", "Voir les options de soutien"],
  es: ["Bokssi", "Gracias por leer hasta aquí.", "Si le ha servido, puede apoyar a OIYO desde el pie de página. El apoyo es opcional y todas las interpretaciones siguen siendo gratuitas.", "Ver opciones de apoyo"],
};

export function BokssiThanks({ locale }: { locale: Locale }) {
  const [name, thanks, note, link] = COPY[locale];
  return (
    <aside className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4" data-bokssi>
      <svg viewBox="0 0 64 72" aria-hidden="true" className="h-16 w-14 shrink-0 text-primary" fill="none">
        <path d="M32 18C21 13 12 23 12 39c0 18 9 28 20 28s20-10 20-28c0-16-9-26-20-21Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="2" />
        <path d="M32 18C31 7 40 4 48 5c-1 8-7 13-16 13Z" fill="currentColor" />
        <circle cx="25" cy="36" r="2" fill="currentColor" /><circle cx="39" cy="36" r="2" fill="currentColor" />
        <path d="M27 45q5 5 10 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="min-w-0 space-y-2 text-sm">
        <p className="font-bold">{name} · {thanks}</p>
        <p className="leading-relaxed text-muted-foreground">{note}</p>
        {/* 2026-10-25: support destinations stay exclusively in the shared footer. */}
        <a href="#oiyo-support" className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">{link}</a>
      </div>
    </aside>
  );
}
