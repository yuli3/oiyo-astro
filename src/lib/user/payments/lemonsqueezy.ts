"use client";

import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

import {
  type LemonSqueezyConfig,
  type PaymentErrorCode,
  type PaymentResult,
} from "./types";

// LemonSqueezy configuration
const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const LEMON_SQUEEZY_STORE_ID = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;

const isPaymentErrorCode = (value: string): value is PaymentErrorCode => {
  return (
    value === "PLAN_NOT_FOUND" ||
    value === "PAYMENT_SERVICE_ERROR" ||
    value === "PROVIDER_REQUIRED" ||
    value === "LOCALE_REQUIRED" ||
    value === "CURRENCY_REQUIRED" ||
    value === "TOSS_CLIENT_KEY_REQUIRED" ||
    value === "LEMONSQUEEZY_CONFIG_REQUIRED"
  );
};

type LemonSqueezyCheckoutResponse = {
  data?: {
    attributes?: {
      url?: string;
    };
    id?: string;
  };
  error?: { message: string };
};

class LemonSqueezyService {
  private initialized = false;

  async createCheckout(config: LemonSqueezyConfig): Promise<PaymentResult> {
    try {
      await this.initialize();

      const checkoutData = {
        checkoutData: {
          custom: {
            locale: config.checkoutData?.custom?.locale,
            user_id: config.checkoutData?.custom?.user_id,
            ...config.checkoutData?.custom,
          },
          email: config.checkoutData?.email,
          name: config.checkoutData?.name,
        },
        checkoutOptions: {
          embed: false,
          logo: true,
          media: true,
        },
        expiresAt: null,
        preview: false,
        productOptions: {
          description: "Oiyo.net Premium Subscription",
          name: config.checkoutData?.name,
        },
        testMode: process.env.NODE_ENV !== "production",
      };

      const response = await createCheckout(
        config.storeId,
        config.variantId,
        checkoutData,
      );

      const checkoutResponse = response as LemonSqueezyCheckoutResponse;

      if (checkoutResponse.error) {
        throw new Error(checkoutResponse.error.message);
      }

      return {
        metadata: {
          checkoutUrl: checkoutResponse.data?.attributes?.url ?? "",
          storeId: config.storeId,
          variantId: config.variantId,
        },
        paymentKey: checkoutResponse.data?.id ?? "",
        success: true,
      };
    } catch (error: unknown) {
      console.error("LemonSqueezy checkout error:", error);

      const fallbackMessage = "Failed to create checkout session";
      const message = error instanceof Error ? error.message : fallbackMessage;
      const codeCandidate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code?: string }).code
          : undefined;
      const normalizedCode: PaymentErrorCode =
        codeCandidate && isPaymentErrorCode(codeCandidate)
          ? codeCandidate
          : "PAYMENT_SERVICE_ERROR";

      return {
        error: {
          code: normalizedCode,
          message,
        },
        success: false,
      };
    }
  }

  // Format amount for display (USD)
  formatAmount(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
    }).format(amount);
  }

  // Generate checkout URL for direct redirect
  async getCheckoutUrl(
    variantId: string,
    userEmail?: string,
    userName?: string,
  ): Promise<null | string> {
    try {
      const config: LemonSqueezyConfig = {
        checkoutData: {
          email: userEmail,
          name: userName,
        },
        storeId: LEMON_SQUEEZY_STORE_ID!,
        variantId,
      };

      const result = await this.createCheckout(config);

      if (result.success) {
        const metadata = result.metadata;
        if (metadata && typeof metadata.checkoutUrl === "string") {
          return metadata.checkoutUrl;
        }
      }

      return null;
    } catch (error) {
      console.error("Failed to get checkout URL:", error);
      return null;
    }
  }

  // Get product variant IDs for different plans
  getVariantIds() {
    return {
      premium_monthly:
        process.env.NEXT_PUBLIC_LS_PREMIUM_MONTHLY_VARIANT_ID ||
        "variant_premium_monthly",
      premium_yearly:
        process.env.NEXT_PUBLIC_LS_PREMIUM_YEARLY_VARIANT_ID ||
        "variant_premium_yearly",
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!LEMON_SQUEEZY_API_KEY) {
      throw new Error("LemonSqueezy API key is not configured");
    }

    this.initialized = true;
  }

  // Validate configuration
  validateConfig(config: LemonSqueezyConfig): {
    errors: string[];
    valid: boolean;
  } {
    const errors: string[] = [];

    if (!config.storeId) {
      errors.push("Store ID is required");
    }

    if (!config.variantId) {
      errors.push("Variant ID is required");
    }

    if (!LEMON_SQUEEZY_API_KEY) {
      errors.push("LemonSqueezy API key is not configured");
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  // Handle webhook verification
  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    try {
      const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error("Webhook secret not configured");
        return false;
      }

      // Implementation depends on LemonSqueezy's webhook signature verification
      // This is a placeholder - refer to LemonSqueezy docs for exact implementation
      return true;
    } catch (error) {
      console.error("Webhook verification failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const lemonSqueezy = new LemonSqueezyService();
