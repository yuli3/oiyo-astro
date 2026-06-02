/**
 * Lemon Squeezy Payment Integration
 * Handles international payments via Lemon Squeezy
 */

import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { createHmac, timingSafeEqual } from "node:crypto";

import type {
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  LemonSqueezyWebhookPayload,
} from "@/types/payment";

// Initialize Lemon Squeezy
const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

if (!apiKey) {
  console.warn("[LemonSqueezy] API key not configured");
}

if (apiKey) {
  lemonSqueezySetup({ apiKey });
}

// Store and Product IDs (to be configured in Lemon Squeezy dashboard)
export const LEMON_SQUEEZY_CONFIG = {
  products: {
    premiumMonthly: {
      price: 799, // $7.99
      variantId: process.env.LEMON_SQUEEZY_VARIANT_MONTHLY || "",
    },
  },
  storeId: process.env.LEMON_SQUEEZY_STORE_ID || "",
};

/**
 * Cancel a Lemon Squeezy subscription
 */
export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  if (!apiKey) {
    throw new Error("Lemon Squeezy not configured");
  }

  try {
    const { cancelSubscription } =
      await import("@lemonsqueezy/lemonsqueezy.js");

    const result = await cancelSubscription(subscriptionId);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (error) {
    console.error("[LemonSqueezy] Cancel subscription failed:", error);
    throw error;
  }
}

/**
 * Create a checkout session for Lemon Squeezy
 */
export async function createLemonSqueezyCheckout(
  request: CreateCheckoutRequest,
): Promise<CreateCheckoutResponse> {
  if (!apiKey) {
    return {
      error: "Lemon Squeezy not configured",
      success: false,
    };
  }

  try {
    const { createCheckout } = await import("@lemonsqueezy/lemonsqueezy.js");

    const variantId =
      request.priceId || LEMON_SQUEEZY_CONFIG.products.premiumMonthly.variantId;

    if (!variantId) {
      throw new Error("Product variant ID not configured");
    }

    const parsedVariantId = Number.parseInt(variantId, 10);

    const checkout = await createCheckout(
      LEMON_SQUEEZY_CONFIG.storeId,
      variantId,
      {
        checkoutData: {
          custom: {
            locale: request.locale,
            user_id: request.userId, // PASS USER ID HERE
          },
        },
        checkoutOptions: {
          embed: false,
          logo: true,
          media: true,
        },
        productOptions: {
          ...(Number.isNaN(parsedVariantId)
            ? {}
            : { enabledVariants: [parsedVariantId] }),
          redirectUrl:
            request.successUrl ||
            `${process.env.NEXT_PUBLIC_APP_URL}/${request.locale}/dashboard?payment=success`,
        },
      },
    );

    if (checkout.error) {
      throw new Error(checkout.error.message);
    }

    return {
      checkoutUrl: checkout.data?.data.attributes.url,
      sessionId: checkout.data?.data.id,
      success: true,
    };
  } catch (error) {
    console.error("[LemonSqueezy] Checkout creation failed:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create checkout",
      success: false,
    };
  }
}

/**
 * Get subscription details from Lemon Squeezy
 */
export async function getLemonSqueezySubscription(subscriptionId: string) {
  if (!apiKey) {
    throw new Error("Lemon Squeezy not configured");
  }

  try {
    const { getSubscription } = await import("@lemonsqueezy/lemonsqueezy.js");

    const subscription = await getSubscription(subscriptionId);

    if (subscription.error) {
      throw new Error(subscription.error.message);
    }

    return subscription.data;
  } catch (error) {
    console.error("[LemonSqueezy] Get subscription failed:", error);
    throw error;
  }
}

/**
 * Check if Lemon Squeezy is configured
 */
export function isLemonSqueezyConfigured(): boolean {
  return Boolean(apiKey && LEMON_SQUEEZY_CONFIG.storeId);
}

/**
 * Process Lemon Squeezy webhook event
 */
export async function processLemonSqueezyWebhook(
  payload: LemonSqueezyWebhookPayload,
): Promise<{ error?: string; success: boolean }> {
  try {
    const eventName = payload.meta.event_name;
    const data = payload.data;

    console.log(`[LemonSqueezy] Processing webhook: ${eventName}`);

    switch (eventName) {
      case "order_created":
        await handleOrderCreated(data, payload.meta);
        break;

      case "subscription_cancelled":
        await handleSubscriptionCancelled(data);
        break;

      case "subscription_created":
        await handleSubscriptionCreated(data, payload.meta);
        break;

      case "subscription_expired":
        await handleSubscriptionExpired(data);
        break;

      case "subscription_payment_failed":
        await handlePaymentFailed(data);
        break;

      case "subscription_payment_success":
        await handlePaymentSuccess(data);
        break;

      case "subscription_resumed":
        await handleSubscriptionResumed(data);
        break;

      case "subscription_updated":
        await handleSubscriptionUpdated(data);
        break;

      default:
        console.log(`[LemonSqueezy] Unhandled event: ${eventName}`);
    }

    return { success: true };
  } catch (error) {
    console.error("[LemonSqueezy] Webhook processing failed:", error);
    return {
      error:
        error instanceof Error ? error.message : "Webhook processing failed",
      success: false,
    };
  }
}

// ============================================================================
// Webhook Event Handlers (to be implemented with database integration)
// ============================================================================

// ============================================================================
// Webhook Event Handlers (DB Integration)
// ============================================================================

import type { SubscriptionStatus } from "@/types/payment";

import { supabaseAdmin } from "@/lib/system/supabase";

/**
 * Verify Lemon Squeezy webhook signature
 */
export function verifyLemonSqueezyWebhook(
  payload: string,
  signature: string,
): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[LemonSqueezy] Webhook secret not configured");
    return false;
  }

  try {
    const hmac = createHmac("sha256", secret);
    const digest = hmac.update(payload).digest("hex");

    return timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (error) {
    console.error("[LemonSqueezy] Webhook verification failed:", error);
    return false;
  }
}

async function handleOrderCreated(
  data: LemonSqueezyWebhookPayload["data"],
  meta: LemonSqueezyWebhookPayload["meta"],
) {
  console.log("[LemonSqueezy] Order created:", data.id);

  if (!supabaseAdmin) return;
  const adminValue = supabaseAdmin as any;
  const attributes = data.attributes as any;
  const customData = meta.custom_data as Record<string, any>;
  const userId = customData?.user_id;

  if (!userId) {
    console.error(
      "[LemonSqueezy] No user_id found in custom_data for order:",
      data.id,
    );
    return;
  }

  // Determine if this is an Offering or something else based on variant_id if needed
  // For now, any one-time order is treated as an Offering
  const isOffering = true; // Simplified for now

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(now.getFullYear() + 100); // "Permanent"

  // Update user status
  await adminValue
    .from("users")
    .update({
      is_premium: true,
      premium_expires_at: expiresAt.toISOString(),
      premium_provider: "lemon-squeezy",
      premium_subscription_id: data.id,
    } as never)
    .eq("id", userId);

  // Record payment event
  await adminValue.from("payment_events").insert({
    amount: attributes.total,
    currency: attributes.currency,
    event_type: "order_created",
    external_id: data.id,
    metadata: {
      receipt_url: attributes.urls?.receipt,
      tier: "OFFERING",
    },
    provider: "lemon-squeezy",
    status: "succeeded",
    user_id: userId,
  });
}

async function handlePaymentFailed(data: LemonSqueezyWebhookPayload["data"]) {
  console.log("[LemonSqueezy] Payment failed:", data.id);

  if (!supabaseAdmin) return;

  const adminValue = supabaseAdmin as any;

  const attributes = data.attributes as any;

  await adminValue.from("payment_events").insert({
    amount: attributes.total,
    created_at: new Date().toISOString(),
    currency: attributes.currency,
    event_type: "payment_failed",
    external_id: data.id,
    provider: "lemon-squeezy",
    status: "failed",
  });
}

async function handlePaymentSuccess(data: LemonSqueezyWebhookPayload["data"]) {
  console.log("[LemonSqueezy] Payment success:", data.id);

  if (!supabaseAdmin) return;

  const adminValue = supabaseAdmin as any;

  const attributes = data.attributes as any;
  const subscriptionId = attributes.subscription_id as string;

  let userId = null;
  if (subscriptionId) {
    const { data: sub } = await adminValue
      .from("subscriptions")
      .select("user_id")
      .eq("subscription_id", subscriptionId)
      .single();
    userId = sub?.user_id;
  }

  await adminValue.from("payment_events").insert({
    amount: attributes.total,
    created_at: new Date().toISOString(),
    currency: attributes.currency,
    event_type: "payment_success",
    external_id: data.id,
    metadata: { receipt_url: attributes.urls?.receipt },
    provider: "lemon-squeezy",
    status: "succeeded",
    user_id: userId,
  });
}

async function handleSubscriptionCancelled(
  data: LemonSqueezyWebhookPayload["data"],
) {
  console.log("[LemonSqueezy] Subscription cancelled:", data.id);

  if (!supabaseAdmin) return;

  const adminValue = supabaseAdmin as any;

  // Update subscription status
  await adminValue
    .from("subscriptions")
    .update({
      cancel_at_period_end: true,
      canceled_at: new Date().toISOString(),
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("subscription_id", data.id);
}

async function handleSubscriptionCreated(
  data: LemonSqueezyWebhookPayload["data"],
  meta: LemonSqueezyWebhookPayload["meta"],
) {
  console.log("[LemonSqueezy] Subscription created:", data.id);

  if (!supabaseAdmin) {
    console.error("[LemonSqueezy] Supabase Admin client not available");
    return;
  }

  const adminValue = supabaseAdmin as any;

  const attributes = data.attributes as any;

  const customData = meta.custom_data as Record<string, any>;
  const userId = customData?.user_id;

  if (!userId) {
    console.error(
      "[LemonSqueezy] No user_id found in custom_data for subscription:",
      data.id,
    );
    return;
  }

  // Insert subscription
  const { error } = await adminValue.from("subscriptions").insert({
    created_at: new Date().toISOString(),
    current_period_end: attributes.renews_at
      ? new Date(attributes.renews_at).toISOString()
      : null,
    current_period_start: attributes.renews_at
      ? new Date(attributes.created_at).toISOString()
      : null, // Approx
    price_amount: attributes.total, // amount in cents
    price_currency: attributes.currency,
    provider: "lemon-squeezy",
    status: mapLemonSqueezyStatus(attributes.status),
    subscription_id: data.id,
    updated_at: new Date().toISOString(),
    user_id: userId,
  });

  if (error) {
    console.error("[LemonSqueezy] Failed to insert subscription:", error);
    // Don't throw, just log.
  }

  // Update user premium status
  const { error: userError } = await adminValue.rpc(
    "update_user_premium_status",
    {
      p_expires_at: attributes.renews_at
        ? new Date(attributes.renews_at).toISOString()
        : null,
      p_is_premium: true,
      p_provider: "lemon-squeezy",
      p_subscription_id: data.id,
      p_user_id: userId,
    },
  );

  if (userError) {
    console.error("[LemonSqueezy] Failed to update user status:", userError);
  }
}

async function handleSubscriptionExpired(
  data: LemonSqueezyWebhookPayload["data"],
) {
  console.log("[LemonSqueezy] Subscription expired:", data.id);

  if (!supabaseAdmin) return;

  const adminValue = supabaseAdmin as any;

  await adminValue
    .from("subscriptions")
    .update({
      status: "expired",
      updated_at: new Date().toISOString(),
    })
    .eq("subscription_id", data.id);

  // Revoke access
  const { data: sub } = await adminValue
    .from("subscriptions")
    .select("user_id")
    .eq("subscription_id", data.id)
    .single();
  if (sub && sub.user_id) {
    await adminValue.rpc("update_user_premium_status", {
      p_expires_at: new Date().toISOString(), // Expired now
      p_is_premium: false, // Access revoked
      p_provider: "lemon-squeezy",
      p_subscription_id: data.id,
      p_user_id: sub.user_id,
    });
  }
}

async function handleSubscriptionResumed(
  data: LemonSqueezyWebhookPayload["data"],
) {
  console.log("[LemonSqueezy] Subscription resumed:", data.id);
  if (!supabaseAdmin) return;

  const adminValue = supabaseAdmin as any;

  await adminValue
    .from("subscriptions")
    .update({
      cancel_at_period_end: false,
      canceled_at: null,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("subscription_id", data.id);
}

async function handleSubscriptionUpdated(
  data: LemonSqueezyWebhookPayload["data"],
) {
  console.log("[LemonSqueezy] Subscription updated:", data.id);

  if (!supabaseAdmin) return;

  const adminValue = supabaseAdmin as any;

  const attributes = data.attributes as any;

  const { error } = await adminValue
    .from("subscriptions")
    .update({
      current_period_end: attributes.renews_at
        ? new Date(attributes.renews_at).toISOString()
        : null,
      price_amount: attributes.total,
      status: mapLemonSqueezyStatus(attributes.status),
      updated_at: new Date().toISOString(),
    })
    .eq("subscription_id", data.id);

  if (error) {
    console.error("[LemonSqueezy] Failed to update subscription:", error);
  }

  // Also sync user status if needed (e.g. expiration date changed)
  const { data: sub } = await adminValue
    .from("subscriptions")
    .select("user_id")
    .eq("subscription_id", data.id)
    .single();

  if (sub && sub.user_id) {
    await adminValue.rpc("update_user_premium_status", {
      p_expires_at: attributes.renews_at
        ? new Date(attributes.renews_at).toISOString()
        : null,
      p_is_premium:
        attributes.status === "active" || attributes.status === "on_trial",
      p_provider: "lemon-squeezy",
      p_subscription_id: data.id,
      p_user_id: sub.user_id,
    });
  }
}

// Helper to map LS status to our status
function mapLemonSqueezyStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "cancelled":
      return "canceled";
    case "expired":
      return "expired";
    case "on_trial":
      return "trialing"; // Map on_trial to trialing
    case "past_due":
      return "past_due";
    case "paused":
      return "past_due"; // Best approximation
    case "unpaid":
      return "past_due";
    default:
      return "active";
  }
}
