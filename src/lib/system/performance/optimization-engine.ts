/**
 * Performance Optimization Engine
 * Comprehensive system for monitoring and optimizing application performance
 */

export interface CacheStrategy {
  maxEntries?: number;
  patterns: string[];
  strategy: "cache-first" | "network-first" | "stale-while-revalidate";
  ttl: number; // Time to live in seconds
  type: "api" | "dynamic" | "image" | "static";
}

export type LoadLevel = "high" | "low" | "medium";

export type MemoryPressure = "critical" | "normal" | "warning";

export type NetworkQuality = "excellent" | "good" | "poor";

export interface OptimizationRecommendation {
  beforeMetric: number;
  category: "bundle" | "caching" | "code" | "images" | "network" | "ux";
  description: string;
  difficulty: "easy" | "hard" | "medium";
  estimatedTimeToFix: string;
  id: string;
  impact: number; // 0-100 performance improvement score
  implementation: {
    codeExample?: string;
    resources: string[];
    steps: string[];
  };
  priority: "critical" | "high" | "low" | "medium";
  targetMetric: number;
  title: string;
}

export interface PerformanceBudget {
  bundleSize: number; // Target: < 250KB gzipped
  cls: number; // Target: < 0.1
  fid: number; // Target: < 100ms
  imageSize: number; // Target: < 500KB total
  lcp: number; // Target: < 2.5s
  testLoadTime: number; // Target: < 3s
}

export interface PerformanceMetrics {
  // Bundle Analysis
  bundleSize: {
    css: number;
    images: number;
    javascript: number;
    total: number;
  };
  cls: number; // Cumulative Layout Shift
  connection: string;

  device: "desktop" | "mobile" | "tablet";
  errorRate: number;
  fcp: number; // First Contentful Paint

  fid: number; // First Input Delay

  // Core Web Vitals
  lcp: number; // Largest Contentful Paint

  // Memory Usage
  memoryUsage: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  // User Experience
  pageLoadTime: number;
  testCompletionTime: number;

  timestamp: Date;
  // Custom Metrics
  ttfb: number; // Time to First Byte
  ttr: number; // Time to Ready (fully interactive)
  url: string;
  userAgent: string;
}
export interface PerformanceSummary {
  average: Partial<PerformanceMetrics>;
  budgetCompliance: {
    bundleSize: boolean;
    cls: boolean;
    fid: boolean;
    lcp: boolean;
    pageLoadTime: boolean;
  };
  latest: null | PerformanceMetrics;
  score: number;
  trend: PerformanceTrend;
}
export type PerformanceTrend = "degrading" | "improving" | "stable";

export interface RealTimePerformanceInsights {
  currentLoad: LoadLevel;
  memoryPressure: MemoryPressure;
  networkQuality: NetworkQuality;
  recommendations: string[];
}

/**
 * Performance Optimization Engine
 * Monitors, analyzes, and optimizes application performance
 */
export class PerformanceOptimizationEngine {
  private static instance: PerformanceOptimizationEngine;
  private budget: PerformanceBudget;
  private metrics: PerformanceMetrics[] = [];
  private observer: null | PerformanceObserver = null;
  private recommendations: Map<string, OptimizationRecommendation> = new Map();

  private constructor() {
    this.budget = {
      bundleSize: 250000, // 250KB
      cls: 0.1, // 0.1 score
      fid: 100, // 100ms
      imageSize: 500000, // 500KB
      lcp: 2500, // 2.5 seconds
      testLoadTime: 3000, // 3 seconds
    };

    this.initializePerformanceObserver();
    this.startPerformanceMonitoring();
  }

  public static getInstance(): PerformanceOptimizationEngine {
    if (!PerformanceOptimizationEngine.instance) {
      PerformanceOptimizationEngine.instance =
        new PerformanceOptimizationEngine();
    }
    return PerformanceOptimizationEngine.instance;
  }

  /**
   * Collect current performance metrics
   */
  public async collectCurrentMetrics(): Promise<PerformanceMetrics> {
    if (typeof window === "undefined") {
      throw new Error(
        "Performance metrics can only be collected in browser environment",
      );
    }

    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType("paint");
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const fidEntries = performance.getEntriesByType(
      "first-input",
    ) as PerformanceEventTiming[];
    const clsEntries = performance.getEntriesByType(
      "layout-shift",
    ) as LayoutShift[];

    // Calculate Core Web Vitals
    const lcp =
      lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
    const fidEntry = fidEntries[0];
    const fid = fidEntry ? fidEntry.processingStart - fidEntry.startTime : 0;
    const cls = clsEntries.reduce((sum, entry) => sum + (entry.value ?? 0), 0);

    // Calculate paint metrics
    const fcp =
      paint.find((p) => p.name === "first-contentful-paint")?.startTime || 0;
    const ttfb = navigation.responseStart - navigation.requestStart;

    // Memory usage
    type PerformanceWithMemory = Performance & {
      memory?: {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
      };
    };

    const performanceWithMemory = performance as PerformanceWithMemory;
    const memory = performanceWithMemory.memory ?? {
      jsHeapSizeLimit: 0,
      totalJSHeapSize: 0,
      usedJSHeapSize: 0,
    };

    // Calculate bundle sizes (would need to be provided from build process)
    const bundleSize = await this.estimateBundleSize();

    // Device detection
    const device = this.detectDevice();

    type NavigatorWithConnection = Navigator & {
      connection?: {
        effectiveType?: string;
      };
    };

    const navigatorWithConnection = navigator as NavigatorWithConnection;

    const metrics: PerformanceMetrics = {
      bundleSize,
      cls,
      connection:
        navigatorWithConnection.connection?.effectiveType || "unknown",
      device,
      errorRate: this.calculateErrorRate(),
      fcp,
      fid,
      lcp,
      memoryUsage: {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
      },
      pageLoadTime: navigation.loadEventEnd - navigation.startTime,
      testCompletionTime: 0, // Would be measured during test completion
      timestamp: new Date(),
      ttfb,
      ttr: navigation.loadEventEnd - navigation.startTime,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.push(metrics);
    this.analyzePerformance(metrics);

    return metrics;
  }

  /**
   * Get performance metrics summary
   */
  public getPerformanceSummary(): PerformanceSummary {
    if (this.metrics.length === 0) {
      return {
        average: {},
        budgetCompliance: {
          bundleSize: false,
          cls: false,
          fid: false,
          lcp: false,
          pageLoadTime: false,
        },
        latest: null,
        score: 0,
        trend: "stable",
      };
    }

    const latest = this.metrics[this.metrics.length - 1];
    const recentMetrics = this.metrics.slice(-10); // Last 10 measurements

    // Calculate averages
    const average = {
      cls:
        recentMetrics.reduce((sum, m) => sum + m.cls, 0) / recentMetrics.length,
      fid:
        recentMetrics.reduce((sum, m) => sum + m.fid, 0) / recentMetrics.length,
      lcp:
        recentMetrics.reduce((sum, m) => sum + m.lcp, 0) / recentMetrics.length,
      pageLoadTime:
        recentMetrics.reduce((sum, m) => sum + m.pageLoadTime, 0) /
        recentMetrics.length,
    };

    // Calculate trend
    const trend = this.calculateTrend(recentMetrics);

    // Calculate performance score
    const score = this.calculatePerformanceScore(latest);

    // Check budget compliance
    const budgetCompliance: PerformanceSummary["budgetCompliance"] = {
      bundleSize: latest.bundleSize.total <= this.budget.bundleSize,
      cls: latest.cls <= this.budget.cls,
      fid: latest.fid <= this.budget.fid,
      lcp: latest.lcp <= this.budget.lcp,
      pageLoadTime: latest.pageLoadTime <= this.budget.testLoadTime,
    };

    return {
      average,
      budgetCompliance,
      latest,
      score,
      trend,
    };
  }

  /**
   * Get real-time performance insights
   */
  public getRealTimeInsights(): RealTimePerformanceInsights {
    if (typeof window === "undefined") {
      return {
        currentLoad: "low",
        memoryPressure: "normal",
        networkQuality: "good",
        recommendations: [],
      };
    }

    const latest = this.metrics[this.metrics.length - 1];
    if (!latest) {
      return {
        currentLoad: "low",
        memoryPressure: "normal",
        networkQuality: "good",
        recommendations: [],
      };
    }

    // Assess current load
    const currentLoad =
      latest.pageLoadTime > 5000
        ? "high"
        : latest.pageLoadTime > 3000
          ? "medium"
          : "low";

    // Assess memory pressure
    const memoryUsagePercent =
      (latest.memoryUsage.usedJSHeapSize / latest.memoryUsage.jsHeapSizeLimit) *
      100;
    const memoryPressure =
      memoryUsagePercent > 90
        ? "critical"
        : memoryUsagePercent > 70
          ? "warning"
          : "normal";

    // Assess network quality
    const networkQuality =
      latest.connection === "4g"
        ? "excellent"
        : latest.connection === "3g"
          ? "good"
          : "poor";

    // Generate recommendations
    const recommendations = [];
    if (currentLoad === "high") {
      recommendations.push("Consider enabling resource prioritization");
    }
    if (memoryPressure !== "normal") {
      recommendations.push("Monitor memory usage and clear unused references");
    }
    if (networkQuality === "poor") {
      recommendations.push("Enable aggressive caching and compression");
    }

    return {
      currentLoad,
      memoryPressure,
      networkQuality,
      recommendations,
    };
  }

  /**
   * Get all performance recommendations sorted by priority and impact
   */
  public getRecommendations(): OptimizationRecommendation[] {
    const priorityOrder = { critical: 4, high: 3, low: 1, medium: 2 };

    return Array.from(this.recommendations.values()).sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impact - a.impact;
    });
  }

  /**
   * Optimize test completion performance
   */
  public optimizeTestCompletion(): {
    cachingRecommendations: CacheStrategy[];
    codeOptimizations: string[];
    preloadStrategies: string[];
  } {
    return {
      cachingRecommendations: [
        {
          maxEntries: 100,
          patterns: ["/static/**", "/_next/static/**"],
          strategy: "cache-first",
          ttl: 86400, // 24 hours
          type: "static",
        },
        {
          maxEntries: 50,
          patterns: ["/api/tests/**"],
          strategy: "stale-while-revalidate",
          ttl: 3600, // 1 hour
          type: "api",
        },
        {
          maxEntries: 200,
          patterns: ["*.jpg", "*.png", "*.webp"],
          strategy: "cache-first",
          ttl: 604800, // 7 days
          type: "image",
        },
      ],
      codeOptimizations: [
        "Implement virtual scrolling for long question lists",
        "Use React.memo for question components",
        "Debounce answer selection events",
        "Optimize result chart rendering",
      ],
      preloadStrategies: [
        "Preload test question data",
        "Prefetch result page components",
        "Cache personality calculation logic",
        "Optimize image loading for results",
      ],
    };
  }

  /**
   * Analyze performance and generate recommendations
   */
  private analyzePerformance(metrics: PerformanceMetrics): void {
    const recommendations: OptimizationRecommendation[] = [];

    // LCP Analysis
    if (metrics.lcp > this.budget.lcp) {
      recommendations.push({
        beforeMetric: metrics.lcp,
        category: "ux",
        description: `LCP가 ${(metrics.lcp / 1000).toFixed(2)}초로 목표치 ${this.budget.lcp / 1000}초를 초과했습니다.`,
        difficulty: "medium",
        estimatedTimeToFix: "2-4시간",
        id: "optimize-lcp",
        impact: 90,
        implementation: {
          codeExample: `
// Image optimization
<Image
  src="/hero-image.jpg"
  alt="Hero"
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
  placeholder="blur"
/>

// Resource preloading
<link rel="preload" href="/critical.css" as="style" />
          `,
          resources: [
            "Next.js Image Optimization",
            "Web Vitals Guide",
            "Critical Resource Preloading",
          ],
          steps: [
            "큰 이미지 최적화 및 lazy loading 적용",
            "중요한 리소스 preload 설정",
            "서버 응답 시간 개선",
            "렌더링 차단 리소스 제거",
          ],
        },
        priority: "critical",
        targetMetric: this.budget.lcp,
        title: "Largest Contentful Paint 최적화",
      });
    }

    // FID Analysis
    if (metrics.fid > this.budget.fid) {
      recommendations.push({
        beforeMetric: metrics.fid,
        category: "code",
        description: `FID가 ${metrics.fid.toFixed(2)}ms로 목표치 ${this.budget.fid}ms를 초과했습니다.`,
        difficulty: "medium",
        estimatedTimeToFix: "3-6시간",
        id: "optimize-fid",
        impact: 85,
        implementation: {
          codeExample: `
// Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});

// Web Worker for heavy calculations
const worker = new Worker('/calculation-worker.js');
worker.postMessage(data);
          `,
          resources: [
            "JavaScript Performance",
            "Web Workers Guide",
            "Code Splitting Best Practices",
          ],
          steps: [
            "JavaScript 코드 분할 및 지연 로딩",
            "무거운 계산 작업을 Web Worker로 이동",
            "이벤트 리스너 최적화",
            "requestIdleCallback 사용",
          ],
        },
        priority: "high",
        targetMetric: this.budget.fid,
        title: "First Input Delay 최적화",
      });
    }

    // CLS Analysis
    if (metrics.cls > this.budget.cls) {
      recommendations.push({
        beforeMetric: metrics.cls,
        category: "ux",
        description: `CLS가 ${metrics.cls.toFixed(3)}으로 목표치 ${this.budget.cls}를 초과했습니다.`,
        difficulty: "easy",
        estimatedTimeToFix: "1-2시간",
        id: "optimize-cls",
        impact: 80,
        implementation: {
          codeExample: `
// Explicit image dimensions
<Image
  src="/image.jpg"
  width={400}
  height={300}
  alt="Description"
/>

// Font optimization
@font-face {
  font-family: 'CustomFont';
  font-display: swap;
  src: url('/font.woff2') format('woff2');
}
          `,
          resources: [
            "Layout Shift Prevention",
            "Font Loading Strategies",
            "CSS Animation Performance",
          ],
          steps: [
            "이미지와 비디오에 명시적 크기 설정",
            "폰트 로딩 최적화",
            "동적 콘텐츠 위치 예약",
            "transform과 opacity만 사용한 애니메이션",
          ],
        },
        priority: "high",
        targetMetric: this.budget.cls,
        title: "Cumulative Layout Shift 최적화",
      });
    }

    // Bundle Size Analysis
    if (metrics.bundleSize.total > this.budget.bundleSize) {
      recommendations.push({
        beforeMetric: metrics.bundleSize.total,
        category: "bundle",
        description: `번들 크기가 ${(metrics.bundleSize.total / 1024).toFixed(1)}KB로 목표치 ${this.budget.bundleSize / 1024}KB를 초과했습니다.`,
        difficulty: "medium",
        estimatedTimeToFix: "4-8시간",
        id: "optimize-bundle",
        impact: 70,
        implementation: {
          codeExample: `
// Dynamic imports
const ChartComponent = dynamic(() =>
  import('recharts').then(mod => ({ default: mod.LineChart }))
);

// Tree shaking
import { debounce } from 'lodash-es'; // instead of 'lodash'
          `,
          resources: [
            "Bundle Analysis Tools",
            "Tree Shaking Guide",
            "Code Splitting Strategies",
          ],
          steps: [
            "사용하지 않는 코드 제거 (tree shaking)",
            "라이브러리 번들 분석 및 최적화",
            "동적 import로 코드 분할",
            "webpack-bundle-analyzer로 분석",
          ],
        },
        priority: "medium",
        targetMetric: this.budget.bundleSize,
        title: "번들 크기 최적화",
      });
    }

    // Memory Usage Analysis
    const memoryUsagePercent =
      (metrics.memoryUsage.usedJSHeapSize /
        metrics.memoryUsage.jsHeapSizeLimit) *
      100;
    if (memoryUsagePercent > 80) {
      recommendations.push({
        beforeMetric: memoryUsagePercent,
        category: "code",
        description: `메모리 사용률이 ${memoryUsagePercent.toFixed(1)}%로 높습니다.`,
        difficulty: "hard",
        estimatedTimeToFix: "6-12시간",
        id: "optimize-memory",
        impact: 60,
        implementation: {
          codeExample: `
// Cleanup in useEffect
useEffect(() => {
  const handleScroll = () => {};
  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
          `,
          resources: [
            "Memory Leak Detection",
            "JavaScript Memory Management",
            "Performance Profiling",
          ],
          steps: [
            "메모리 누수 탐지 및 수정",
            "이벤트 리스너 정리",
            "대용량 객체 참조 해제",
            "WeakMap/WeakSet 사용 고려",
          ],
        },
        priority: "medium",
        targetMetric: 60,
        title: "메모리 사용량 최적화",
      });
    }

    // Store recommendations
    recommendations.forEach((rec) => {
      this.recommendations.set(rec.id, rec);
    });
  }

  private calculateErrorRate(): number {
    // In a real implementation, this would track actual errors
    return Math.random() * 0.05; // 0-5% error rate
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // LCP penalty (40% weight)
    if (metrics.lcp > this.budget.lcp) {
      score -= Math.min(
        40,
        ((metrics.lcp - this.budget.lcp) / this.budget.lcp) * 40,
      );
    }

    // FID penalty (30% weight)
    if (metrics.fid > this.budget.fid) {
      score -= Math.min(
        30,
        ((metrics.fid - this.budget.fid) / this.budget.fid) * 30,
      );
    }

    // CLS penalty (20% weight)
    if (metrics.cls > this.budget.cls) {
      score -= Math.min(
        20,
        ((metrics.cls - this.budget.cls) / this.budget.cls) * 20,
      );
    }

    // Bundle size penalty (10% weight)
    if (metrics.bundleSize.total > this.budget.bundleSize) {
      score -= Math.min(
        10,
        ((metrics.bundleSize.total - this.budget.bundleSize) /
          this.budget.bundleSize) *
          10,
      );
    }

    return Math.max(0, Math.round(score));
  }

  private calculateTrend(
    metrics: PerformanceMetrics[],
  ): "degrading" | "improving" | "stable" {
    if (metrics.length < 2) return "stable";

    const recent = metrics.slice(-3);
    const older = metrics.slice(-6, -3);

    if (recent.length === 0 || older.length === 0) return "stable";

    const recentAvg =
      recent.reduce((sum, m) => sum + m.pageLoadTime, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, m) => sum + m.pageLoadTime, 0) / older.length;

    const changePercent = (recentAvg - olderAvg) / olderAvg;

    if (changePercent < -0.1) return "improving";
    if (changePercent > 0.1) return "degrading";
    return "stable";
  }

  private detectDevice(): "desktop" | "mobile" | "tablet" {
    if (typeof window === "undefined") return "desktop";

    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  private async estimateBundleSize(): Promise<
    PerformanceMetrics["bundleSize"]
  > {
    // In a real implementation, this would analyze the actual bundle
    // For now, return estimated values
    return {
      css: 50000, // 50KB
      images: 100000, // 100KB
      javascript: 200000, // 200KB
      total: 350000, // 350KB
    };
  }

  /**
   * Initialize performance observer for real-time monitoring
   */
  private initializePerformanceObserver(): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.processPerformanceEntry(entry);
        });
      });

      // Observe different types of performance entries
      this.observer.observe({
        entryTypes: [
          "paint",
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
        ],
      });
    } catch (error) {
      console.warn("Performance Observer not supported:", error);
    }
  }

  /**
   * Private helper methods
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    // Process different types of performance entries for real-time insights
    console.log("Performance entry:", entry.name, entry.duration);
  }

  /**
   * Start continuous performance monitoring
   */
  private startPerformanceMonitoring(): void {
    if (typeof window === "undefined") return;

    // Monitor performance every 30 seconds
    setInterval(() => {
      this.collectCurrentMetrics();
    }, 30000);

    // Collect initial metrics after page load
    if (document.readyState === "complete") {
      setTimeout(() => this.collectCurrentMetrics(), 1000);
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => this.collectCurrentMetrics(), 1000);
      });
    }
  }
}

export default PerformanceOptimizationEngine.getInstance();
