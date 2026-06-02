// Payment system types for Oiyo.net

// LemonSqueezy specific types
export interface LemonSqueezyConfig {
  checkoutData?: {
    custom?: Record<string, unknown>;
    email?: string;
    name?: string;
  };
  storeId: string;
  variantId: string;
}

export interface PaymentConfig {
  clientKey?: string;
  currency: "KRW" | "USD";
  locale: string;
  provider: PaymentProvider;
  storeId?: string;
  variantId?: string;
}

export interface PaymentError {
  code: PaymentErrorCode;
  details?: Record<string, unknown>;
  message?: string;
}

export type PaymentErrorCode =
  | "CURRENCY_REQUIRED"
  | "LEMONSQUEEZY_CONFIG_REQUIRED"
  | "LOCALE_REQUIRED"
  | "PAYMENT_SERVICE_ERROR"
  | "PLAN_NOT_FOUND"
  | "PROVIDER_REQUIRED"
  | "TOSS_CLIENT_KEY_REQUIRED";

export type PaymentProvider = "lemonsqueezy" | "toss";

export interface PaymentResult {
  amount?: number;
  error?: PaymentError;
  metadata?: Record<string, unknown>;
  orderId?: string;
  paymentKey?: string;
  success: boolean;
}

export interface PaymentSession {
  amount: number;
  createdAt: string;
  currency: "KRW" | "USD";
  expiresAt: string;
  id: string;
  metadata?: Record<string, unknown>;
  planId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  userId: string;
}

export type PaymentStatus =
  | "cancelled"
  | "completed"
  | "failed"
  | "pending"
  | "processing";

export interface PaymentVerificationFailure {
  error: {
    code: string;
    details?: Record<string, unknown>;
    message: string;
    status?: number;
  };
  success: false;
}

export interface PaymentVerificationPayload {
  amount?: number;
  orderId?: string;
  paymentKey?: string;
  provider: PaymentProvider;
}

export type PaymentVerificationResult =
  | PaymentVerificationFailure
  | PaymentVerificationSuccess;

export interface PaymentVerificationSuccess {
  amount: number;
  approvedAt?: string;
  currency: "KRW" | "USD";
  orderId: string;
  paymentKey?: string;
  provider: PaymentProvider;
  rawResponse?: Record<string, unknown>;
  success: true;
}

// Premium feature access control
export interface PremiumFeatures {
  advancedInsights: boolean;
  aiAnalysis: boolean;
  customReports: boolean;
  pdfExport: boolean;
  prioritySupport: boolean;
  testHistory: boolean;
  unlimitedTests: boolean;
}

export interface SubscriptionPlan {
  currency: "KRW" | "USD";
  description: string;
  features: string[];
  id: string;
  name: string;
  popular?: boolean;
  price: {
    monthly: number;
    yearly: number;
  };
  tier: SubscriptionTier;
}

export interface SubscriptionStatus {
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  isActive: boolean;
  planId?: string;
  provider?: PaymentProvider;
  tier: SubscriptionTier;
}

export type SubscriptionTier = "free" | "premium" | "pro";

// Toss Payments specific types
export interface TossPaymentConfig {
  amount: number;
  clientKey: string;
  customerEmail?: string;
  customerName?: string;
  failUrl: string;
  orderId: string;
  orderName: string;
  successUrl: string;
}

export interface UserSubscription {
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  currentPeriodEnd: string;
  currentPeriodStart: string;
  features: PremiumFeatures;
  id: string;
  metadata?: Record<string, unknown>;
  planId: string;
  provider: PaymentProvider;
  status: "active" | "cancelled" | "past_due" | "trialing";
  tier: SubscriptionTier;
  updatedAt: string;
  userId: string;
}
