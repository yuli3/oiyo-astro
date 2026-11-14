import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Moon, Sparkles, AlertTriangle, Sun, Flame } from 'lucide-react';

export function OvertimeNightHolidayCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [hourlyWage, setHourlyWage] = useState<number>(15000); // 통상시급
  const [overtimeHours, setOvertimeHours] = useState<number>(4); // 평일 연장근로
  const [nightHours, setNightHours] = useState<number>(2); // 야간근로
  const [holidayHours, setHolidayHours] = useState<number>(8); // 휴일 8시간 이내
  const [holidayOvertimeHours, setHolidayOvertimeHours] = useState<number>(2); // 휴일 8시간 초과
  const [holidayNightHours, setHolidayNightHours] = useState<number>(2); // 휴일 야간 중복
  const [isFiveOrMore, setIsFiveOrMore] = useState<boolean>(true); // 5인 이상 사업장

  const result = useMemo(() => {
    if (!isFiveOrMore) {
      const totalHours = overtimeHours + nightHours + holidayHours + holidayOvertimeHours;
      const basePay = Math.round(totalHours * hourlyWage);
      return {
        isFiveOrMore: false,
        totalPay: basePay,
        overtimePay: 0,
        nightPay: 0,
        holidayPay: 0,
        holidayOvertimePay: 0,
        holidayNightPay: 0,
        totalHours,
      };
    }

    const overtimePay = Math.round(overtimeHours * hourlyWage * 1.5);
    const nightPay = Math.round(nightHours * hourlyWage * 0.5);
    const holidayPay = Math.round(holidayHours * hourlyWage * 1.5);
    const holidayOvertimePay = Math.round(holidayOvertimeHours * hourlyWage * 2.0);
    const holidayNightPay = Math.round(holidayNightHours * hourlyWage * 0.5);

    const totalPay = overtimePay + nightPay + holidayPay + holidayOvertimePay + holidayNightPay;
    const totalHours = overtimeHours + holidayHours + holidayOvertimeHours;

    return {
      isFiveOrMore: true,
      totalPay,
      overtimePay,
      nightPay,
      holidayPay,
      holidayOvertimePay,
      holidayNightPay,
      totalHours,
    };
  }, [hourlyWage, overtimeHours, nightHours, holidayHours, holidayOvertimeHours, holidayNightHours, isFiveOrMore]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {isKo ? '근로기준법 제56조' : 'Labor Standards Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '최대 2.5배 중복할증' : 'Up to 250% Rate'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '연장·야간·휴일근로 가산수당 & 중복할증(최대 2.5배) 계산기'
              : 'Overtime, Night & Holiday Premium Pay Calculator'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '근로기준법 제56조에 따른 연장(1.5배), 야간(0.5배 가산), 휴일(1.5~2.0배) 및 휴일야간 중복할증(최대 2.5배) 법정 가산수당을 1초 만에 계산합니다.'
              : 'Calculate mandatory premium pay for overtime, night shift (22:00-06:00), and holiday labor.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="wage-input" className="text-sm font-medium">
                  {isKo ? '본인의 통상시급 (원)' : 'Regular Hourly Wage (KRW)'}
                </label>
                <Input
                  id="wage-input"
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Math.max(10030, Number(e.target.value) || 0))}
                  step={500}
                  min={10030}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo ? '2026년 법정 최저시급(10,030원) 이상 입력' : 'Minimum wage 10,030 KRW'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">{isKo ? '사업장 상시근로자 수' : 'Company Size'}</span>
                <div className="flex gap-2">
                  <Button
                    variant={isFiveOrMore ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsFiveOrMore(true)}
                  >
                    {isKo ? '5인 이상 (가산수당 100% 의무)' : '>= 5 Employees (Mandatory)'}
                  </Button>
                  <Button
                    variant={!isFiveOrMore ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsFiveOrMore(false)}
                  >
                    {isKo ? '5인 미만 (기본시급만 적용)' : '< 5 Employees (Base Only)'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
              <div className="space-y-2 p-3 border rounded-lg bg-background">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {isKo ? '평일 연장근로 (1.5배)' : 'Overtime (1.5x)'}
                </span>
                <label htmlFor="overtime-hours-input" className="sr-only">
                  {isKo ? '평일 연장근로 시간' : 'Overtime Hours'}
                </label>
                <Input
                  id="overtime-hours-input"
                  type="number"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Math.max(0, Number(e.target.value) || 0))}
                  step={0.5}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">{isKo ? '1일 8시간 초과 근무' : '> 8 hours / day'}</p>
              </div>

              <div className="space-y-2 p-3 border rounded-lg bg-background">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Moon className="h-3.5 w-3.5 text-primary" />
                  {isKo ? '평일 야간근로 (+0.5배)' : 'Night Shift (+0.5x)'}
                </span>
                <label htmlFor="night-hours-input" className="sr-only">
                  {isKo ? '평일 야간근로 시간' : 'Night Shift Hours'}
                </label>
                <Input
                  id="night-hours-input"
                  type="number"
                  value={nightHours}
                  onChange={(e) => setNightHours(Math.max(0, Number(e.target.value) || 0))}
                  step={0.5}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">{isKo ? '22:00 ~ 익일 06:00 사이' : '22:00 - 06:00'}</p>
              </div>

              <div className="space-y-2 p-3 border rounded-lg bg-background">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Sun className="h-3.5 w-3.5 text-primary" />
                  {isKo ? '휴일근로 (8시간 이내 1.5배)' : 'Holiday (1.5x)'}
                </span>
                <label htmlFor="holiday-hours-input" className="sr-only">
                  {isKo ? '휴일근로 시간' : 'Holiday Hours'}
                </label>
                <Input
                  id="holiday-hours-input"
                  type="number"
                  value={holidayHours}
                  onChange={(e) => setHolidayHours(Math.max(0, Number(e.target.value) || 0))}
                  step={0.5}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">{isKo ? '주휴일/공휴일 8시간 이내' : '<= 8 hours'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2 p-3 border rounded-lg bg-background">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                  {isKo ? '휴일 연장근로 (8시간 초과 2.0배)' : 'Holiday Overtime (2.0x)'}
                </span>
                <label htmlFor="holiday-overtime-hours-input" className="sr-only">
                  {isKo ? '휴일 연장근로 시간' : 'Holiday Overtime Hours'}
                </label>
                <Input
                  id="holiday-overtime-hours-input"
                  type="number"
                  value={holidayOvertimeHours}
                  onChange={(e) => setHolidayOvertimeHours(Math.max(0, Number(e.target.value) || 0))}
                  step={0.5}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">{isKo ? '휴일에 8시간을 넘겨 일한 시간' : '> 8 hours on holiday'}</p>
              </div>

              <div className="space-y-2 p-3 border rounded-lg bg-background">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <Moon className="h-3.5 w-3.5 text-primary" />
                  {isKo ? '휴일 야간근로 (+0.5배 중복, 최대 2.5배)' : 'Holiday Night (+0.5x, Max 2.5x)'}
                </span>
                <label htmlFor="holiday-night-hours-input" className="sr-only">
                  {isKo ? '휴일 야간근로 시간' : 'Holiday Night Hours'}
                </label>
                <Input
                  id="holiday-night-hours-input"
                  type="number"
                  value={holidayNightHours}
                  onChange={(e) => setHolidayNightHours(Math.max(0, Number(e.target.value) || 0))}
                  step={0.5}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">{isKo ? '휴일 연장과 야간이 겹쳐 최대 250% 적용' : 'Overlapped night shift'}</p>
              </div>
            </div>

            {/* 수당 계산 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '법정 가산수당 계산 결과' : 'Total Premium Pay'}</span>
                </div>
                <Badge variant={result.isFiveOrMore ? 'default' : 'secondary'}>
                  {result.isFiveOrMore ? (isKo ? '가산수당 적용 대상 ✅' : 'Premium Applied') : (isKo ? '5인 미만 기본급 ⚠️' : 'Base Pay Only')}
                </Badge>
              </div>

              <div className="p-4 border rounded-lg bg-background space-y-2">
                <span className="text-xs text-muted-foreground">{isKo ? '총 법정 가산수당 합계' : 'Total Payable Premium Pay'}</span>
                <div className="text-3xl font-extrabold tracking-tight text-primary">
                  {result.totalPay.toLocaleString()}{isKo ? '원' : ' KRW'}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 text-xs text-muted-foreground">
                  <div>• {isKo ? `연장수당(1.5배): ${result.overtimePay.toLocaleString()}원` : `OT: ${result.overtimePay}`}</div>
                  <div>• {isKo ? `야간수당(0.5배): ${result.nightPay.toLocaleString()}원` : `Night: ${result.nightPay}`}</div>
                  <div>• {isKo ? `휴일기본(1.5배): ${result.holidayPay.toLocaleString()}원` : `Holiday: ${result.holidayPay}`}</div>
                  <div>• {isKo ? `휴일연장(2.0배): ${result.holidayOvertimePay.toLocaleString()}원` : `Hol-OT: ${result.holidayOvertimePay}`}</div>
                  <div>• {isKo ? `휴일야간(+0.5배): ${result.holidayNightPay.toLocaleString()}원` : `Hol-Night: ${result.holidayNightPay}`}</div>
                </div>
              </div>

              {!result.isFiveOrMore && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {isKo
                      ? '5인 미만 사업장은 근로기준법상 가산수당(50~100%) 지급 의무가 면제되어 통상시급(100%) 기준 기본급만 지급됩니다.'
                      : 'Companies with <5 employees are exempt from statutory premium overtime rates.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OvertimeNightHolidayCalculator;
