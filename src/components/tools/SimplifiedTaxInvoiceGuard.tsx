import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, CheckCircle2, XCircle, AlertTriangle, Building, Sparkles, ShieldCheck } from 'lucide-react';

export function SimplifiedTaxInvoiceGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [salesTenThousand, setSalesTenThousand] = useState(6500); // 연매출 6,500만원
  const [industryType, setIndustryType] = useState<'b2b' | 'retail' | 'special' | 'real_estate'>('retail');
  const [isFirstYear, setIsFirstYear] = useState(false);
  const [buyerRequested, setBuyerRequested] = useState(true);

  const result = useMemo(() => {
    const priorSales = salesTenThousand * 10000;

    if (industryType === 'real_estate') {
      const isGeneral = priorSales >= 48000000;
      return {
        taxpayerType: isGeneral ? '일반과세자 (부동산임대 4,800만 초과)' : '간이과세자 (부동산임대 등)',
        canIssue: isGeneral,
        mustIssue: isGeneral,
        canDeductBuyerVat: isGeneral,
        risk: isGeneral ? '미발급 시 가산세 2%' : '영수증 교부 (발급 불가)',
        description: isGeneral
          ? '부동산임대업은 4,800만원 이상 시 일반과세자로 전환되어 세금계산서 발급 의무가 발생합니다.'
          : '부동산임대 간이과세자는 세금계산서를 발급할 수 없으며 영수증만 교부합니다.',
      };
    }

    if (isFirstYear) {
      return {
        taxpayerType: '신규 간이과세자 (개업 1차년도)',
        canIssue: false,
        mustIssue: false,
        canDeductBuyerVat: false,
        risk: '영수증 전용 (세금계산서 발급 불가)',
        description: '개업 첫해 간이과세자는 직전 연도 실적이 없어 세금계산서를 발급할 수 없으며 영수증(카드/현금영수증)만 교부 가능합니다.',
      };
    }

    if (priorSales >= 104000000) {
      return {
        taxpayerType: '일반과세자 (1억 400만원 이상)',
        canIssue: true,
        mustIssue: true,
        canDeductBuyerVat: true,
        risk: '미발급 시 가산세 2%, 지연 1%',
        description: '연 매출 1억 400만원 이상으로 일반과세자로 전환되며, 사업자 거래 시 무조건 세금계산서를 의무 발급해야 합니다.',
      };
    }

    if (priorSales < 48000000) {
      return {
        taxpayerType: '간이과세자 (4,800만원 미만)',
        canIssue: false,
        mustIssue: false,
        canDeductBuyerVat: false,
        risk: '세금계산서 발급 권한 없음',
        description: '4,800만원 미만 간이과세자는 세금계산서를 발급할 수 없습니다. 거래처가 요구해도 신용카드전표나 현금영수증만 교부 가능하며 매입세액공제는 불가합니다.',
      };
    }

    // 4,800만 ~ 1억 400만원
    let canIssue = true;
    let mustIssue = false;
    let desc = '';

    if (industryType === 'special') {
      canIssue = false;
      mustIssue = false;
      desc = '목욕·미용·여객운송 등 특수 서비스업은 영수증 교부 업종으로 세금계산서 발급이 금지됩니다.';
    } else if (industryType === 'b2b') {
      mustIssue = true;
      desc = '제조·도매·건설·용역 등 B2B 업종은 사업자 거래 시 세금계산서를 반드시 의무 발급해야 합니다.';
    } else {
      if (buyerRequested) {
        mustIssue = true;
        desc = '소매·음식점 등 소비자 상대 업종이라도 거래처 사업자가 사업자등록증 제시 시 세금계산서를 의무 발급해야 합니다.';
      } else {
        mustIssue = false;
        desc = '평상시에는 영수증(카드/현금영수증) 교부 가능하며, 상대방 사업자 요구 시 세금계산서 발급 의무가 발생합니다.';
      }
    }

    return {
      taxpayerType: '간이과세자 (4,800만~1억 400만원)',
      canIssue,
      mustIssue,
      canDeductBuyerVat: canIssue,
      risk: canIssue ? '미발급 시 공급대가의 1% 가산세' : '영수증 교부 대상',
      description: desc,
    };
  }, [salesTenThousand, industryType, isFirstYear, buyerRequested]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {isKo ? '부가가치세법 제32조·제36조' : 'Value-Added Tax Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '2024.7.1 개정 세법' : 'Revised Tax Law'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '간이과세자 세금계산서 발급 의무 & 거래처 공제 진단기'
              : 'Simplified Taxpayer Invoice Guard'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '기준금액 1억 400만원 상향에 따른 4,800만~1억 400만원 간이과세자의 세금계산서 발급 의무, 상대방 매입세액공제 가능 여부 및 가산세를 1초 만에 확인합니다.'
              : 'Determine tax invoice issuance obligations and buyer tax credit eligibility for simplified taxpayers.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sales-input" className="text-sm font-medium">
                {isKo ? '직전 연도 연간 매출 (공급대가, 만원)' : 'Prior Year Gross Revenue (10k KRW)'}
              </label>
              <Input
                id="sales-input"
                type="number"
                value={salesTenThousand}
                onChange={(e) => setSalesTenThousand(Math.max(0, Number(e.target.value) || 0))}
                step={100}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                {isKo
                  ? `현재 연 매출: ${(salesTenThousand / 10000).toFixed(2)}억원 (${salesTenThousand.toLocaleString()}만원)`
                  : 'Total annual gross sales'}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="industry-select" className="text-sm font-medium">
                {isKo ? '사업 업종 유형' : 'Industry Type'}
              </label>
              <select
                id="industry-select"
                aria-label={isKo ? '사업 업종 유형 선택' : 'Select industry type'}
                className="w-full h-10 px-3 py-2 bg-background border rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value as 'b2b' | 'retail' | 'special' | 'real_estate')}
              >
                <option value="retail">{isKo ? '소매·음식·숙박·소비자상대 (B2C)' : 'Retail, Dining, Lodging (B2C)'}</option>
                <option value="b2b">{isKo ? '제조·도매·건설·용역 (B2B)' : 'Manufacturing, Wholesale, B2B'}</option>
                <option value="special">{isKo ? '목욕·이용·미용·택시 (영수증 전용)' : 'Personal Care, Taxi (Receipt only)'}</option>
                <option value="real_estate">{isKo ? '부동산임대업·과세유흥장소' : 'Real Estate Rental, Nightlife'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">{isKo ? '신규 개업 1차년도' : 'First Year of Business'}</span>
                <p className="text-xs text-muted-foreground">{isKo ? '직전 연도 매출 실적이 없음' : 'No prior year record'}</p>
              </div>
              <Button
                variant={isFirstYear ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsFirstYear(!isFirstYear)}
              >
                {isFirstYear ? (isKo ? '신규 사업자' : 'Yes') : (isKo ? '기존 사업자' : 'No')}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">{isKo ? '거래처 사업자등록증 제시 및 요구' : 'Buyer Request Invoice'}</span>
                <p className="text-xs text-muted-foreground">{isKo ? '상대방이 세금계산서를 원함' : 'Buyer requested tax invoice'}</p>
              </div>
              <Button
                variant={buyerRequested ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBuyerRequested(!buyerRequested)}
              >
                {buyerRequested ? (isKo ? '요구함' : 'Requested') : (isKo ? '요구 없음' : 'No')}
              </Button>
            </div>
          </div>

          {/* 판정 결과 카드 */}
          <div className="p-4 bg-muted/60 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">{isKo ? '세무 판정 결과' : 'Tax Evaluation Result'}</span>
              </div>
              <Badge variant={result.canIssue ? 'default' : 'secondary'}>
                {result.taxpayerType}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg bg-background space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{isKo ? '세금계산서 발급 여부' : 'Issuance Eligibility'}</span>
                  {result.canIssue ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                </div>
                <div className="text-base font-bold">
                  {result.canIssue ? (isKo ? '발급 가능 ✅' : 'Eligible') : (isKo ? '발급 불가 ❌' : 'Ineligible')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.canIssue ? (isKo ? '홈택스 전자발급 가능' : 'Via Hometax') : (isKo ? '영수증만 교부 가능' : 'Receipts only')}
                </p>
              </div>

              <div className="p-3 border rounded-lg bg-background space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{isKo ? '의무 발급 여부' : 'Issuance Obligation'}</span>
                  {result.mustIssue ? <AlertTriangle className="h-4 w-4 text-primary" /> : <ShieldCheck className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="text-base font-bold">
                  {result.mustIssue ? (isKo ? '의무 발급 대상 ⚠️' : 'Mandatory') : (isKo ? '선택 / 영수증 교부' : 'Optional')}
                </div>
                <p className="text-xs text-muted-foreground">{result.risk}</p>
              </div>

              <div className="p-3 border rounded-lg bg-background space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{isKo ? '거래처 매입세액공제' : 'Buyer Tax Credit'}</span>
                  {result.canDeductBuyerVat ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                </div>
                <div className="text-base font-bold">
                  {result.canDeductBuyerVat ? (isKo ? '100% 공제 가능 🌟' : '100% Deductible') : (isKo ? '공제 불가 ⚠️' : 'Non-deductible')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.canDeductBuyerVat ? (isKo ? '거래처 부담 없음' : 'Full VAT credit') : (isKo ? '비용 처리만 가능' : 'Expense only')}
                </p>
              </div>
            </div>

            <div className="p-3 bg-background rounded-lg border text-xs leading-relaxed space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-primary" />
                {isKo ? '국세청 실무 가이드' : 'NTS Guidelines'}
              </span>
              <p className="text-muted-foreground">{result.description}</p>
            </div>
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}

export default SimplifiedTaxInvoiceGuard;
