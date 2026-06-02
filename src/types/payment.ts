/**
 * Payment System Types
 * Supports both Toss Payments (Korean) and Lemon Squeezy (International)
 */

export interface CancelSubscriptionRequest {
  cancelAtPeriodEnd?: boolean;
  subscriptionId: string;
}

export interface CancelSubscriptionResponse {
  error?: string;
  subscription?: Subscription;
  success: boolean;
}

export interface CreateCheckoutRequest {
  cancelUrl?: string;
  locale: string;
  priceId?: string; // For Lemon Squeezy variants
  provider: PaymentProvider;
  successUrl?: string;
  userId: string; // Required to link subscription to user
}

export interface CreateCheckoutResponse {
  checkoutUrl?: string;
  error?: string;
  sessionId?: string;
  success: boolean;
}

export type Currency = "KRW" | "USD";

// ============================================================================
// Database Models
// ============================================================================

export interface GetInvoicesResponse {
  error?: string;
  invoices?: PaymentEvent[];
  success: boolean;
}

export interface GetSubscriptionResponse {
  error?: string;
  subscription?: Subscription;
  success: boolean;
}

export interface LemonSqueezyProduct {
  currency: string;
  description: string;
  id: string;
  name: string;
  price: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface LemonSqueezyVariant {
  currency: string;
  id: string;
  interval: "month" | "year";
  name: string;
  price: number;
  product_id: string;
}

export interface LemonSqueezyWebhookPayload {
  data: {
    attributes: Record<string, unknown>;
    id: string;
    relationships?: Record<string, unknown>;
    type: string;
  };
  meta: {
    custom_data?: Record<string, unknown>;
    event_name: string;
  };
}

export interface PaymentError {
  code: string;
  message: string;
  provider: PaymentProvider;
  retryable: boolean;
}

export interface PaymentEvent {
  amount: null | number; // In cents
  created_at: string;
  currency: Currency | null;
  error_message: null | string;
  event_type: string;
  external_id: null | string; // Payment ID from provider
  id: string;
  metadata: Record<string, unknown>;
  provider: PaymentProvider;
  status: PaymentStatus;
  subscription_id: null | string;
  user_id: null | string;
}

export type PaymentMethod =
  | "apple_pay"
  | "bank_transfer"
  | "card"
  | "google_pay"
  | "kakao_pay"
  | "naver_pay"
  | "paypal"
  | "toss_pay";

export interface PaymentMetrics {
  activeSubscriptions: number;
  churnRate: number;
  conversionRate: number;
  totalRevenue: number;
}

// ============================================================================
// Lemon Squeezy Types
// ============================================================================

export type PaymentProvider = "lemon-squeezy" | "toss";

export type PaymentStatus = "failed" | "pending" | "refunded" | "succeeded";

export type PremiumFeature =
  | "advanced-analytics"
  | "ai-insights"
  | "custom-themes"
  | "data-export"
  | "early-access"
  | "pdf-export"
  | "priority-support";

// ============================================================================
// Toss Payments Types
// ============================================================================

export interface PremiumFeatureConfig {
  description: string;
  icon: string;
  id: PremiumFeature;
  name: string;
}

export interface PremiumUser {
  id: string;
  is_premium: boolean;
  premium_expires_at: null | string;
  premium_provider: null | PaymentProvider;
  premium_subscription_id: null | string;
}

export interface PricingPlan {
  description: string;
  features: PremiumFeature[];
  id: string;
  name: string;
  popular?: boolean;
  price: {
    krw: number;
    usd: number;
  };
}

// ============================================================================
// Premium Features Types
// ============================================================================

export interface Subscription {
  cancel_at_period_end: boolean;
  canceled_at: null | string;
  created_at: string;
  current_period_end: null | string;
  current_period_start: null | string;
  id: string;
  metadata: Record<string, unknown>;
  payment_method: null | PaymentMethod;
  price_amount: number; // In cents
  price_currency: Currency;
  provider: PaymentProvider;
  status: SubscriptionStatus;
  subscription_id: string; // External subscription ID
  updated_at: string;
  user_id: string;
}

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "expired"
  | "past_due"
  | "trialing";

export interface TossPaymentRequest {
  amount: number;
  customerEmail?: string;
  customerName?: string;
  failUrl: string;
  orderId: string;
  orderName: string;
  successUrl: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface TossPaymentResponse {
  approvedAt: string;
  method: string;
  orderId: string;
  orderName: string;
  paymentKey: string;
  requestedAt: string;
  status: string;
  totalAmount: number;
}

export interface TossWebhookPayload {
  createdAt: string;
  data: {
    method: string;
    orderId: string;
    paymentKey: string;
    status: string;
    totalAmount: number;
  };
  eventType: string;
}
