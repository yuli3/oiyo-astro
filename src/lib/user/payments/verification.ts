"use server";

import type {
  PaymentProvider as _PaymentProvider,
  PaymentVerificationPayload,
  PaymentVerificationResult,
} from "./types";

import { confirmTossPayment } from "./toss-server";

export async function verifyPayment(
  payload: PaymentVerificationPayload,
): Promise<PaymentVerificationResult> {
  const { amount, orderId, paymentKey, provider } = payload;

  if (provider === "toss") {
    if (!paymentKey || !orderId || typeof amount !== "number") {
      return {
        error: {
          code: "TOSS_CONFIRMATION_PARAMS_MISSING",
          message:
            "Missing paymentKey, orderId, or amount for Toss verification.",
          status: 400,
        },
        success: false,
      };
    }

    return confirmTossPayment({ amount, orderId, paymentKey });
  }

  return {
    error: {
      code: "UNSUPPORTED_PROVIDER",
      message: `Payment verification for provider "${provider}" is not supported yet.`,
      status: 400,
    },
    success: false,
  };
}
