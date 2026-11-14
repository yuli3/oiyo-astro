import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, FileImage, Sparkles, TrendingDown, Zap, Globe } from 'lucide-react';

export function AgentImageDietGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [sizeKb, setSizeKb] = useState(1800);
  const [format, setFormat] = useState<'png' | 'jpg' | 'gif'>('png');
  const [monthlyViews, setMonthlyViews] = useState(50000);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    let webpRatio = 0.40;
    let avifRatio = 0.22;

    if (format === 'png') {
      webpRatio = 0.35;
      avifRatio = 0.18;
    } else if (format === 'jpg') {
      webpRatio = 0.45;
      avifRatio = 0.28;
    } else if (format === 'gif') {
      webpRatio = 0.25;
      avifRatio = 0.15;
    }

    const webpSizeKb = Math.round(sizeKb * webpRatio);
    const avifSizeKb = Math.round(sizeKb * avifRatio);

    const webpSavingsPercent = Math.round((1 - webpRatio) * 100);
    const avifSavingsPercent = Math.round((1 - avifRatio) * 100);

    const originalMonthlyGb = (sizeKb * monthlyViews) / (1024 * 1024);
    const webpMonthlyGb = (webpSizeKb * monthlyViews) / (1024 * 1024);
    const avifMonthlyGb = (avifSizeKb * monthlyViews) / (1024 * 1024);

    const monthlyGbSavedWithAvif = originalMonthlyGb - avifMonthlyGb;
    const costPerGb = 0.085;
    const monthlyCostSavedUsd = Math.round(monthlyGbSavedWithAvif * costPerGb * 100) / 100;
    const annualCostSavedUsd = Math.round(monthlyCostSavedUsd * 12 * 100) / 100;

    const originalLoadTimeSec = Math.round(((sizeKb * 8) / (15 * 1024)) * 100) / 100;
    const avifLoadTimeSec = Math.round(((avifSizeKb * 8) / (15 * 1024)) * 100) / 100;
    const lcpImprovementSec = Math.round((originalLoadTimeSec - avifLoadTimeSec) * 100) / 100;

    const pictureSnippet = `<picture>
  <source type="image/avif" srcset="/images/hero.avif">
  <source type="image/webp" srcset="/images/hero.webp">
  <img src="/images/hero.${format}" alt="Hero" width="1200" height="630" loading="lazy" decoding="async">
</picture>`;

    return {
      originalSizeKb: sizeKb,
      webpSizeKb,
      avifSizeKb,
      webpSavingsPercent,
      avifSavingsPercent,
      originalMonthlyGb: Math.round(originalMonthlyGb * 10) / 10,
      webpMonthlyGb: Math.round(webpMonthlyGb * 10) / 10,
      avifMonthlyGb: Math.round(avifMonthlyGb * 10) / 10,
      monthlyGbSaved: Math.round(monthlyGbSavedWithAvif * 10) / 10,
      monthlyCostSavedUsd,
      annualCostSavedUsd,
      originalLoadTimeSec,
      avifLoadTimeSec,
      lcpImprovementSec,
      pictureSnippet,
    };
  }, [sizeKb, format, monthlyViews]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.pictureSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '⚡ 이미지 다이어트 & AVIF/WebP 압축 시뮬레이터' : '⚡ Image Diet & AVIF/WebP Compression Calculator'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '무거운 원본 이미지를 차세대 웹 포맷으로 압축 시 절약되는 대역폭, CDN Egress 비용 및 LCP 개선 효과를 즉시 계산합니다.'
                  : 'Calculate image payload reduction, CDN egress savings, and mobile LCP boost with AVIF and WebP.'}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {isKo ? `최대 ${result.avifSavingsPercent}% 절감` : `Up to ${result.avifSavingsPercent}% Savings`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '원본 파일 크기 (KB)' : 'Original File Size (KB)'}
                </label>
                <Input
                  type="number"
                  min={10}
                  max={50000}
                  value={sizeKb}
                  onChange={(e) => setSizeKb(Math.max(1, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '현재 이미지 포맷' : 'Current Format'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={format === 'png' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setFormat('png')}
                  >
                    PNG
                  </Button>
                  <Button
                    variant={format === 'jpg' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setFormat('jpg')}
                  >
                    JPEG
                  </Button>
                  <Button
                    variant={format === 'gif' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setFormat('gif')}
                  >
                    GIF
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '월간 예상 방문 횟수 (PV)' : 'Monthly Page Views'}
                </label>
                <Input
                  type="number"
                  min={100}
                  max={100000000}
                  step={10000}
                  value={monthlyViews}
                  onChange={(e) => setMonthlyViews(Math.max(1, Number(e.target.value) || 0))}
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileImage className="h-4 w-4" />
                  {isKo ? '원본 크기' : 'Original Size'}
                </div>
                <div className="text-2xl font-bold">{result.originalSizeKb} KB</div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `월간 트래픽: ${result.originalMonthlyGb} GB` : `Monthly Egress: ${result.originalMonthlyGb} GB`}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  {isKo ? 'WebP 변환 시' : 'With WebP'}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {result.webpSizeKb} KB <span className="text-xs font-normal">(-{result.webpSavingsPercent}%)</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `월간 트래픽: ${result.webpMonthlyGb} GB` : `Monthly Egress: ${result.webpMonthlyGb} GB`}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {isKo ? 'AVIF 변환 시 (추천)' : 'With AVIF (Recommended)'}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {result.avifSizeKb} KB <span className="text-xs font-normal">(-{result.avifSavingsPercent}%)</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `월간 트래픽: ${result.avifMonthlyGb} GB` : `Monthly Egress: ${result.avifMonthlyGb} GB`}
                </div>
              </div>
            </div>

            {/* Performance & Cost Impact */}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/10">
              <div className="font-semibold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                {isKo ? '성능 및 비용 절감 효과 종합' : 'Comprehensive Performance & Cost Impact'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="rounded border bg-background p-3 space-y-1">
                  <div className="text-muted-foreground">{isKo ? '월간 대역폭 절약' : 'Monthly Bandwidth Saved'}</div>
                  <div className="text-lg font-bold">{result.monthlyGbSaved} GB / 월</div>
                </div>
                <div className="rounded border bg-background p-3 space-y-1">
                  <div className="text-muted-foreground">{isKo ? '연간 CDN Egress 절감' : 'Annual CDN Egress Saved'}</div>
                  <div className="text-lg font-bold">${result.annualCostSavedUsd} USD / 년</div>
                </div>
                <div className="rounded border bg-background p-3 space-y-1">
                  <div className="text-muted-foreground">{isKo ? '모바일 LCP 지연 단축' : 'Mobile LCP Speedup'}</div>
                  <div className="text-lg font-bold text-primary">약 {result.lcpImprovementSec}초 단축</div>
                </div>
              </div>
            </div>

            {/* Responsive Snippet */}
            <div>
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {isKo ? '모던 웹 표준 반응형 <picture> 태그' : 'Modern Web Standard <picture> Tag'}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="ml-1 text-xs">{copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '복사' : 'Copy')}</span>
                </Button>
              </div>
              <div className="rounded border bg-background p-3 text-xs font-mono break-all text-muted-foreground">
                <pre className="whitespace-pre-wrap">{result.pictureSnippet}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default AgentImageDietGuard;
