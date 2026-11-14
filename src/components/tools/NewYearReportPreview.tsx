import { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { BokssiThanks } from "./BokssiThanks";

import { BirthDateField } from "@/components/shared/BirthDateField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gaEvent } from "@/lib/analytics/ga-event";
import { ROLE_EMOJI, getNewYearReportCopy, monthName } from "@/lib/fortune/new-year-report-copy";
import { BRANCH_HANJA, STEM_HANJA, buildNewYearReport } from "@/lib/fortune/new-year-report";
import type { PeriodReading } from "@/lib/fortune/new-year-report";
import type { Locale } from "@/lib/fortune/periodic";

interface Props {
  locale: Locale;
}

const TARGET_YEAR = 2027;
const REPORT_ID = "new-year-2027";
// 결제 없이 수요만 재는 단계(2026-10-14 세운 결정: P1 미리보기부터). 누른 사실만
// 이 브라우저에 남겨 같은 사람이 두 번 세지지 않게 한다. 개인정보는 받지 않는다.
const WAITLIST_KEY = "oiyo:waitlist:new-year-2027";
// 미리보기로 전부 보여 주는 달. 1월은 아직 병오년이지만 리포트가 가장 먼저 쓰일 달이다.
const PREVIEW_MONTH = 1;
// 출시 알림은 news 메일링이 주간 소식과 따로 동의받아 보관한다. 이 페이지는 주소를 받지 않는다 (2026-10-19).
// ko 외 언어는 영어 신청 페이지로 보낸다. 확인 메일·출시 알림도 영어로 간다.
const NOTIFY_QUERY = "?utm_source=oiyo&utm_medium=new_year_preview&utm_campaign=new_year_2027";
function notifyUrl(locale: Locale): string {
  return `https://news.oiyo.net/subscribe/new-year-2027/${locale === "ko" ? "" : "en/"}${NOTIFY_QUERY}`;
}

function pillarLabel(p: Pick<PeriodReading, "stem" | "branch">): string {
  return `${STEM_HANJA[p.stem]}${BRANCH_HANJA[p.branch]}`;
}

export default function NewYearReportPreview({ locale }: Props) {
  const copy = getNewYearReportCopy(locale);
  const [birthDate, setBirthDate] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    try {
      setJoined(window.localStorage.getItem(WAITLIST_KEY) === "1");
    } catch {
      // 저장소가 막힌 브라우저에서도 화면은 그대로 동작한다.
    }
  }, []);

  const report = useMemo(() => buildNewYearReport(birthDate, TARGET_YEAR), [birthDate]);

  useEffect(() => {
    if (report) gaEvent("report_preview_view", { report_id: REPORT_ID, locale });
  }, [report, locale]);

  function joinWaitlist() {
    gaEvent("report_waitlist_click", { report_id: REPORT_ID, locale });
    setJoined(true);
    try {
      window.localStorage.setItem(WAITLIST_KEY, "1");
    } catch {
      // 무시: 클릭 이벤트는 이미 보냈다.
    }
  }

  const preview = report?.months.find((m) => m.month === PREVIEW_MONTH);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="pt-6">
            <BirthDateField
              id="new-year-report-birth-date"
              locale={locale}
              label={copy.ui.birthDate}
              value={birthDate}
              onChange={setBirthDate}
              max={new Date().toISOString().slice(0, 10)}
            />
            {!report && <p className="mt-3 text-sm text-muted-foreground">{copy.ui.empty}</p>}
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          <Card>
            <CardHeader>
              <div><Badge variant="outline">{pillarLabel(report.year)} · {STEM_HANJA[report.dayMaster]}{BRANCH_HANJA[report.dayBranch]}</Badge></div>
              <CardTitle>{copy.ui.yearHeading}</CardTitle>
              <CardDescription>
                {copy.ui.surface}: {ROLE_EMOJI[report.year.stemRole]} {copy.role[report.year.stemRole].label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="leading-relaxed">{copy.role[report.year.stemRole].year}</p>
                <p className="leading-relaxed text-muted-foreground">
                  {copy.ui.undercurrent(copy.role[report.year.branchRole].label)}
                </p>
                {report.year.relation !== "none" && (
                  <p className="leading-relaxed">{copy.relation[report.year.relation].year}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <section aria-labelledby="new-year-months">
            <h2 id="new-year-months" className="text-xl font-black">{copy.ui.monthsHeading}</h2>
            <ol className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {report.months.map((m) => (
                <li key={m.month} className="rounded-xl border bg-card p-3 text-center">
                  <p className="text-xs font-bold text-muted-foreground">{monthName(locale, m.month, "short")}</p>
                  <p className="mt-1 text-2xl" aria-hidden="true">{ROLE_EMOJI[m.stemRole]}</p>
                  <p className="mt-1 text-xs font-bold">{copy.role[m.stemRole].label}</p>
                  {m.relation !== "none" && (
                    <p className="mt-1 text-xs text-primary">{m.relation === "clash" ? "沖" : "合"}</p>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">{copy.ui.monthsNote}</p>
          </section>

          {preview && (
            <Card>
              <CardHeader>
                <div><Badge variant="outline">{pillarLabel(preview)}</Badge></div>
                <CardTitle>{copy.ui.previewHeading(monthName(locale, preview.month))}</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-3">
                  <p className="leading-relaxed">
                    {ROLE_EMOJI[preview.stemRole]} {copy.role[preview.stemRole].month}
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    {copy.ui.undercurrent(copy.role[preview.branchRole].label)}
                  </p>
                  {preview.relation !== "none" && (
                    <p className="leading-relaxed">{copy.relation[preview.relation].month}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div>
                <Badge>
                  <Lock aria-hidden="true" className="size-3" /> {copy.ui.lockedBadge}
                </Badge>
              </div>
              <CardTitle>{copy.ui.lockedHeading}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="list-disc space-y-1 pl-5">
                  {copy.ui.lockedItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {joined ? (
                  <div className="space-y-2">
                    <p className="font-bold text-primary" role="status">{copy.ui.waitlistDone}</p>
                    {copy.ui.notifyCta && (
                      <a
                        href={notifyUrl(locale)}
                        onClick={() => gaEvent("report_notify_click", { report_id: REPORT_ID, locale })}
                        className="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4"
                      >
                        {copy.ui.notifyCta}
                      </a>
                    )}
                  </div>
                ) : (
                  <Button size="lg" onClick={joinWaitlist}>
                    {copy.ui.waitlistCta}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">{copy.ui.disclaimer}</p>
          <BokssiThanks locale={locale} />
        </>
      )}
    </div>
  );
}
