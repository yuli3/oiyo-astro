/**
 * Toss Payments Integration
 * Handles Korean payment methods (Card, Bank Transfer, KakaoPay, etc.)
 */

import { createClient } from "@/lib/system/database/supabase";
import {
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  TossPaymentRequest,
  TossWebhookPayload,
} from "@/types/payment";

// Toss Payments Configuration
export const TOSS_PAYMENTS_CONFIG = {
  apiUrl: "https://api.tosspayments.com/v1",
  clientKey: process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY || "",
  // Price in KRW (₩9,900)
  monthlyPrice: 9900,
  secretKey: process.env.TOSS_PAYMENTS_SECRET_KEY || "",
};

/**
 * Cancel Toss Payment
 */
export async function cancelTossPayment(
  paymentKey: string,
  cancelReason: string,
) {
  if (!TOSS_PAYMENTS_CONFIG.secretKey) {
    throw new Error("Toss Payments secret key not configured");
  }

  try {
    const response = await fetch(
      `${TOSS_PAYMENTS_CONFIG.apiUrl}/payments/${paymentKey}/cancel`,
      {
        body: JSON.stringify({
          cancelReason,
        }),
        headers: {
          Authorization: `Basic ${Buffer.from(TOSS_PAYMENTS_CONFIG.secretKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Payment cancellation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("[TossPayments] Payment cancellation failed:", error);
    throw error;
  }
}

/**
 * Confirm payment with Toss Payments
 * Called after user completes payment
 */
export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
) {
  if (!TOSS_PAYMENTS_CONFIG.secretKey) {
    throw new Error("Toss Payments secret key not configured");
  }

  try {
    const response = await fetch(
      `${TOSS_PAYMENTS_CONFIG.apiUrl}/payments/confirm`,
      {
        body: JSON.stringify({
          amount,
          orderId,
          paymentKey,
        }),
        headers: {
          Authorization: `Basic ${Buffer.from(TOSS_PAYMENTS_CONFIG.secretKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Payment confirmation failed");
    }

    const payment = await response.json();
    return payment;
  } catch (error) {
    console.error("[TossPayments] Payment confirmation failed:", error);
    throw error;
  }
}

/**
 * Create a payment request for Toss Payments
 * This returns the payment data that will be used with Toss Payments SDK
 */
export async function createTossPaymentRequest(
  request: CreateCheckoutRequest,
): Promise<CreateCheckoutResponse> {
  try {
    if (!TOSS_PAYMENTS_CONFIG.clientKey) {
      return {
        error: "Toss Payments not configured",
        success: false,
      };
    }

    const orderId = generateOrderId();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Prepare payment data for client-side SDK
    const _paymentData: TossPaymentRequest = {
      amount: TOSS_PAYMENTS_CONFIG.monthlyPrice,
      failUrl:
        request.cancelUrl ||
        `${baseUrl}/${request.locale}/payments/fail?orderId=${orderId}`,
      orderId,
      orderName: "프리미엄 구독 (월간)",
      successUrl:
        request.successUrl ||
        `${baseUrl}/${request.locale}/payments/success?orderId=${orderId}`,
    };

    // Return payment data for client-side SDK
    return {
      // We'll handle the actual checkout on the client side with Toss SDK
      // The checkoutUrl will be constructed by the client
      checkoutUrl: undefined,
      sessionId: orderId,
      success: true,
    };
  } catch (error) {
    console.error("[TossPayments] Payment request creation failed:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to create payment request",
      success: false,
    };
  }
}

/**
 * Get payment details from Toss Payments
 */
export async function getTossPayment(paymentKey: string) {
  if (!TOSS_PAYMENTS_CONFIG.secretKey) {
    throw new Error("Toss Payments secret key not configured");
  }

  try {
    const response = await fetch(
      `${TOSS_PAYMENTS_CONFIG.apiUrl}/payments/${paymentKey}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(TOSS_PAYMENTS_CONFIG.secretKey + ":").toString("base64")}`,
        },
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get payment details");
    }

    return await response.json();
  } catch (error) {
    console.error("[TossPayments] Get payment failed:", error);
    throw error;
  }
}

/**
 * Check if Toss Payments is configured
 */
export function isTossPaymentsConfigured(): boolean {
  return Boolean(
    TOSS_PAYMENTS_CONFIG.clientKey && TOSS_PAYMENTS_CONFIG.secretKey,
  );
}

/**
 * Process Toss Payments webhook
 */
export async function processTossWebhook(
  payload: TossWebhookPayload,
): Promise<{ error?: string; success: boolean }> {
  try {
    const eventType = payload.eventType;
    const data = payload.data;

    if (process.env.NODE_ENV === "development") {
      console.log(`[TossPayments] Processing webhook: ${eventType}`);
    }

    switch (eventType) {
      case "PAYMENT_CANCELED":
        await handlePaymentCanceled(data);
        break;

      case "PAYMENT_CONFIRMATION_FAILED":
        await handlePaymentFailed(data);
        break;

      case "PAYMENT_CONFIRMATION_SUCCESS":
        await handlePaymentSuccess(data);
        break;

      default:
        if (process.env.NODE_ENV === "development") {
          console.log(`[TossPayments] Unhandled event: ${eventType}`);
        }
    }

    return { success: true };
  } catch (error) {
    console.error("[TossPayments] Webhook processing failed:", error);
    return {
      error:
        error instanceof Error ? error.message : "Webhook processing failed",
      success: false,
    };
  }
}

/**
 * Verify Toss Payments webhook
 * Toss doesn't use HMAC signature, but we should verify the payment exists
 */
export async function verifyTossWebhook(
  payload: TossWebhookPayload,
): Promise<boolean> {
  try {
    // Verify payment exists by fetching it
    const payment = await getTossPayment(payload.data.paymentKey);

    // Verify basic data matches
    return (
      payment.orderId === payload.data.orderId &&
      payment.status === payload.data.status
    );
  } catch (error) {
    console.error("[TossPayments] Webhook verification failed:", error);
    return false;
  }
}

// ============================================================================
// Webhook Event Handlers (to be implemented with database integration)
// ============================================================================

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `ORDER_${timestamp}_${random}`;
}

async function handlePaymentCanceled(data: TossWebhookPayload["data"]) {
  const supabase = createClient();

  // Update premium status in public.users
  await supabase
    .from("users")
    .update({
      is_premium: false,
      premium_expires_at: null,
    })
    .eq("last_order_id", data.orderId);
}

async function handlePaymentFailed(data: TossWebhookPayload["data"]) {
  const supabase = createClient();

  // Record failure event
  await supabase.from("payment_events").insert({
    event_type: "PAYMENT_FAILED",
    metadata: data,
    order_id: data.orderId,
    payment_key: data.paymentKey,
  });
}

async function handlePaymentSuccess(data: TossWebhookPayload["data"]) {
  const supabase = createClient();

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now

  // Update user premium status and record order
  await Promise.all([
    supabase
      .from("users")
      .update({
        is_premium: true,
        last_order_id: data.orderId,
        premium_expires_at: expiryDate.toISOString(),
      })
      .eq("last_order_id", data.orderId), // Or use a separate internal mapping if available

    supabase.from("subscriptions").insert({
      amount: (data as any).amount,
      expires_at: expiryDate.toISOString(),
      order_id: (data as any).orderId,
      payment_key: (data as any).paymentKey,
      status: "active",
      user_id: (data as any).metadata?.userId, // Assuming passed in metadata
    }),
  ]);
}
