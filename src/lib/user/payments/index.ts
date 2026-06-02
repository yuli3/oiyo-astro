// Unified payment service for Oiyo.net

import type {
  LemonSqueezyConfig,
  PaymentConfig,
  PaymentErrorCode,
  PaymentProvider,
  PaymentResult,
  SubscriptionPlan,
  TossPaymentConfig,
} from "./types";

import { lemonSqueezy } from "./lemonsqueezy";
import { getPlanById, getPlansForLocale } from "./plans";
import { tossPayments } from "./toss";

export class PaymentService {
  // Calculate savings for yearly plans
  static calculateYearlySavings(plan: SubscriptionPlan): number {
    const yearlyTotal = plan.price.yearly;
    const monthlyTotal = plan.price.monthly * 12;
    return monthlyTotal - yearlyTotal;
  }

  // Create payment session
  static async createPayment(
    planId: string,
    userId: string,
    userEmail: string,
    userName: string,
    locale: string,
    baseUrl: string,
    options?: {
      orderName?: string;
    },
  ): Promise<PaymentResult> {
    const provider = this.getProviderForLocale(locale);
    const plan = getPlanById(planId, locale);

    if (!plan) {
      return {
        error: {
          code: "PLAN_NOT_FOUND",
        },
        success: false,
      };
    }

    // Generate URLs
    const successUrl = `${baseUrl}/${locale}/payment/success`;
    const failUrl = `${baseUrl}/${locale}/payment/failed`;

    try {
      if (provider === "toss") {
        return await this.createTossPayment(
          plan,
          userId,
          userEmail,
          userName,
          successUrl,
          failUrl,
          options?.orderName,
        );
      } else {
        return await this.createLemonSqueezyPayment(
          plan,
          userId,
          userEmail,
          userName,
        );
      }
    } catch (error: unknown) {
      return {
        error: {
          code: "PAYMENT_SERVICE_ERROR",
          details: {
            message: error instanceof Error ? error.message : "Unknown error",
          },
        },
        success: false,
      };
    }
  }

  // Format price for display
  static formatPrice(
    amount: number,
    currency: "KRW" | "USD",
    _locale: string,
  ): string {
    if (currency === "KRW") {
      return tossPayments.formatAmount(amount);
    } else {
      return lemonSqueezy.formatAmount(amount);
    }
  }

  // Get appropriate currency for locale
  static getCurrencyForLocale(locale: string): "KRW" | "USD" {
    return locale === "ko" ? "KRW" : "USD";
  }

  // Get available plans for user's locale
  static getPlans(locale: string): SubscriptionPlan[] {
    return getPlansForLocale(locale);
  }

  // Determine payment provider based on locale
  static getProviderForLocale(locale: string): PaymentProvider {
    return locale === "ko" ? "toss" : "lemonsqueezy";
  }

  // Get savings percentage
  static getSavingsPercentage(plan: SubscriptionPlan): number {
    const savings = this.calculateYearlySavings(plan);
    const monthlyTotal = plan.price.monthly * 12;
    return Math.round((savings / monthlyTotal) * 100);
  }

  // Validate payment configuration
  static validatePaymentConfig(config: PaymentConfig): {
    errors: PaymentErrorCode[];
    valid: boolean;
  } {
    const errors: PaymentErrorCode[] = [];

    if (!config.provider) {
      errors.push("PROVIDER_REQUIRED");
    }

    if (!config.locale) {
      errors.push("LOCALE_REQUIRED");
    }

    if (!config.currency) {
      errors.push("CURRENCY_REQUIRED");
    }

    if (config.provider === "toss" && !config.clientKey) {
      errors.push("TOSS_CLIENT_KEY_REQUIRED");
    }

    if (
      config.provider === "lemonsqueezy" &&
      (!config.storeId || !config.variantId)
    ) {
      errors.push("LEMONSQUEEZY_CONFIG_REQUIRED");
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  // Create LemonSqueezy payment
  private static async createLemonSqueezyPayment(
    plan: SubscriptionPlan,
    userId: string,
    userEmail: string,
    userName: string,
  ): Promise<PaymentResult> {
    const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;
    if (!storeId) {
      return {
        error: {
          code: "LEMONSQUEEZY_CONFIG_REQUIRED",
        },
        success: false,
      };
    }

    const variantIds = lemonSqueezy.getVariantIds();
    const variantId = plan.id.includes("yearly")
      ? variantIds.premium_yearly
      : variantIds.premium_monthly;

    const config: LemonSqueezyConfig = {
      checkoutData: {
        custom: {
          plan_id: plan.id,
          user_id: userId,
        },
        email: userEmail,
        name: userName,
      },
      storeId,
      variantId,
    };

    return await lemonSqueezy.createCheckout(config);
  }

  // Create Toss payment
  private static async createTossPayment(
    plan: SubscriptionPlan,
    userId: string,
    userEmail: string,
    userName: string,
    successUrl: string,
    failUrl: string,
    orderName?: string,
  ): Promise<PaymentResult> {
    const orderId = tossPayments.generateOrderId(userId, plan.id);
    const amount = plan.price.monthly; // Start with monthly for simplicity

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      return {
        error: {
          code: "TOSS_CLIENT_KEY_REQUIRED",
        },
        success: false,
      };
    }

    const config: TossPaymentConfig = {
      amount,
      clientKey,
      customerEmail: userEmail,
      customerName: userName,
      failUrl,
      orderId,
      orderName: orderName || "Oiyo.net Subscription",
      successUrl,
    };

    return await tossPayments.createPayment(config);
  }
}

export { lemonSqueezy } from "./lemonsqueezy";
export * from "./plans";
export { tossPayments } from "./toss";
// Export types and services
export * from "./types";
