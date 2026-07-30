"use client";

import { loadTossPayments } from "@tosspayments/payment-sdk";

import {
  type PaymentErrorCode,
  type PaymentResult,
  type TossPaymentConfig,
} from "./types";

// Toss Payments client key (test key for development)
const FALLBACK_TEST_KEY = "test_ck_docs_Ej8W0qXqLVXm8aXb4E7M8aZ0M5QRkR2bB1M";

type TossPaymentRequest = {
  amount: number;
  customerEmail?: string;
  customerName?: string;
  failUrl: string;
  orderId: string;
  orderName: string;
  successUrl: string;
};

type TossPaymentResponse = {
  amount: number;
  orderId: string;
  paymentKey: string;
};

type TossPaymentsClient = {
  requestPayment(
    method: string,
    payload: TossPaymentRequest,
  ): Promise<TossPaymentResponse>;
};

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

const normalizePaymentErrorCode = (
  value: unknown,
  fallback: PaymentErrorCode,
): PaymentErrorCode => {
  return typeof value === "string" && isPaymentErrorCode(value)
    ? value
    : fallback;
};

class TossPaymentsService {
  private currentClientKey: null | string = null;
  private initialized = false;
  private tossPayments: null | TossPaymentsClient = null;

  async createPayment(config: TossPaymentConfig): Promise<PaymentResult> {
    await this.initialize(config.clientKey);

    try {
      // Validate required fields
      if (!config.amount || !config.orderId || !config.orderName) {
        throw new Error("필수 결제 정보가 누락되었습니다.");
      }

      if (!this.tossPayments) {
        throw new Error("Toss Payments client failed to initialize.");
      }

      // Request payment
      const result = await this.tossPayments.requestPayment("카드", {
        amount: config.amount,
        customerEmail: config.customerEmail,
        customerName: config.customerName,
        failUrl: config.failUrl,
        orderId: config.orderId,
        orderName: config.orderName,
        successUrl: config.successUrl,
      });

      return {
        amount: result.amount,
        orderId: result.orderId,
        paymentKey: result.paymentKey,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Toss payment error:", error);

      const codeCandidate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code?: string }).code
          : undefined;
      const normalizedCode = normalizePaymentErrorCode(
        codeCandidate,
        "PAYMENT_SERVICE_ERROR",
      );
      const message =
        error instanceof Error
          ? error.message
          : "결제 처리 중 오류가 발생했습니다.";

      return {
        error: {
          code: normalizedCode,
          message,
        },
        success: false,
      };
    }
  }

  // Format amount for display
  formatAmount(amount: number): string {
    return new Intl.NumberFormat("ko-KR", {
      currency: "KRW",
      style: "currency",
    }).format(amount);
  }

  // Generate unique order ID
  generateOrderId(userId: string, planId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `oiyo_${userId}_${planId}_${timestamp}_${random}`;
  }

  async initialize(clientKey?: string): Promise<void> {
    const resolvedClientKey =
      clientKey || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || FALLBACK_TEST_KEY;

    if (!resolvedClientKey) {
      throw new Error("Toss Payments client key is not configured.");
    }

    if (this.initialized && this.currentClientKey === resolvedClientKey) {
      return;
    }

    try {
      this.tossPayments = (await loadTossPayments(
        resolvedClientKey,
      )) as unknown as TossPaymentsClient;
      this.initialized = true;
      this.currentClientKey = resolvedClientKey;
    } catch (error) {
      console.error("Failed to initialize Toss Payments:", error);
      throw new Error("결제 시스템 초기화에 실패했습니다.");
    }
  }

  async requestBankTransfer(config: TossPaymentConfig): Promise<PaymentResult> {
    await this.initialize(config.clientKey);

    try {
      if (!this.tossPayments) {
        throw new Error("Toss Payments client failed to initialize.");
      }

      const result = await this.tossPayments.requestPayment("계좌이체", {
        amount: config.amount,
        customerEmail: config.customerEmail,
        customerName: config.customerName,
        failUrl: config.failUrl,
        orderId: config.orderId,
        orderName: config.orderName,
        successUrl: config.successUrl,
      });

      return {
        amount: result.amount,
        orderId: result.orderId,
        paymentKey: result.paymentKey,
        success: true,
      };
    } catch (error: unknown) {
      const codeCandidate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code?: string }).code
          : undefined;
      const normalizedCode = normalizePaymentErrorCode(
        codeCandidate,
        "PAYMENT_SERVICE_ERROR",
      );
      const message =
        error instanceof Error
          ? error.message
          : "계좌이체 처리 중 오류가 발생했습니다.";

      return {
        error: {
          code: normalizedCode,
          message,
        },
        success: false,
      };
    }
  }

  async requestKakaoPay(config: TossPaymentConfig): Promise<PaymentResult> {
    await this.initialize(config.clientKey);

    try {
      if (!this.tossPayments) {
        throw new Error("Toss Payments client failed to initialize.");
      }

      const result = await this.tossPayments.requestPayment("카카오페이", {
        amount: config.amount,
        customerEmail: config.customerEmail,
        customerName: config.customerName,
        failUrl: config.failUrl,
        orderId: config.orderId,
        orderName: config.orderName,
        successUrl: config.successUrl,
      });

      return {
        amount: result.amount,
        orderId: result.orderId,
        paymentKey: result.paymentKey,
        success: true,
      };
    } catch (error: unknown) {
      const codeCandidate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code?: string }).code
          : undefined;
      const normalizedCode = normalizePaymentErrorCode(
        codeCandidate,
        "PAYMENT_SERVICE_ERROR",
      );
      const message =
        error instanceof Error
          ? error.message
          : "카카오페이 결제 중 오류가 발생했습니다.";

      return {
        error: {
          code: normalizedCode,
          message,
        },
        success: false,
      };
    }
  }

  // Validate payment data
  validatePaymentData(config: TossPaymentConfig): {
    errors: string[];
    valid: boolean;
  } {
    const errors: string[] = [];

    if (!config.clientKey && !process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
      errors.push("Toss Payments client key is not configured.");
    }

    if (!config.amount || config.amount <= 0) {
      errors.push("결제 금액이 유효하지 않습니다.");
    }

    if (!config.orderId) {
      errors.push("주문번호가 필요합니다.");
    }

    if (!config.orderName) {
      errors.push("주문명이 필요합니다.");
    }

    if (!config.successUrl || !config.failUrl) {
      errors.push("리다이렉트 URL이 필요합니다.");
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }
}

// Export singleton instance
export const tossPayments = new TossPaymentsService();
