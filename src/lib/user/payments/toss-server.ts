"use server";

import type { PaymentVerificationResult } from "./types";

const TOSS_API_BASE_URL = "https://api.tosspayments.com/v1";

export interface ConfirmTossPaymentInput {
  amount: number;
  orderId: string;
  paymentKey: string;
}

export async function confirmTossPayment(
  input: ConfirmTossPaymentInput,
): Promise<PaymentVerificationResult> {
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    return {
      error: {
        code: "TOSS_SECRET_KEY_MISSING",
        message: "Toss secret key is not configured on the server.",
        status: 500,
      },
      success: false,
    };
  }

  const { amount, orderId, paymentKey } = input;

  try {
    const response = await fetch(`${TOSS_API_BASE_URL}/payments/confirm`, {
      body: JSON.stringify({ amount, orderId, paymentKey }),
      cache: "no-store",
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        error: {
          code:
            typeof payload?.["code"] === "string"
              ? (payload["code"] as string)
              : "TOSS_CONFIRM_FAILED",
          details: payload,
          message:
            typeof payload?.["message"] === "string"
              ? (payload["message"] as string)
              : "Failed to confirm Toss payment.",
          status: response.status,
        },
        success: false,
      };
    }

    const confirmedAmount = Number(payload?.["totalAmount"] ?? amount);

    return {
      amount: Number.isFinite(confirmedAmount) ? confirmedAmount : amount,
      approvedAt:
        typeof payload?.["approvedAt"] === "string"
          ? (payload["approvedAt"] as string)
          : undefined,
      currency: "KRW",
      orderId: String(payload?.["orderId"] ?? orderId),
      paymentKey,
      provider: "toss",
      rawResponse: payload,
      success: true,
    };
  } catch (error) {
    return {
      error: {
        code: "TOSS_CONFIRM_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Unknown Toss confirmation error.",
      },
      success: false,
    };
  }
}
