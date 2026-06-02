export interface PaymentProvider {
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  createCheckoutSession(
    userId: string,
    planId: string,
    returnUrl: string,
  ): Promise<{ checkoutUrl: string }>;
  getSubscription(userId: string): Promise<null | Subscription>;
}

export interface Subscription {
  currentPeriodEnd: string;
  id: string;
  planName: string;
  provider: "lemon-squeezy" | "toss";
  status: "active" | "canceled" | "expired";
}

// Mock Implementation
class MockPaymentService implements PaymentProvider {
  // Helper for mock "success" page to call
  async activateSubscription(
    userId: string,
    provider: "lemon-squeezy" | "toss",
    _planId: string,
  ) {
    const sub: Subscription = {
      currentPeriodEnd: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(), // +30 days
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      planName: "Premium Plan",
      provider,
      status: "active",
    };

    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(sub));
    return sub;
  }

  async cancelSubscription(_subscriptionId: string): Promise<boolean> {
    // In a real app, call provider API
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  }

  async createCheckoutSession(
    userId: string,
    planId: string,
    returnUrl: string,
  ): Promise<{ checkoutUrl: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, this would return a URL to the provider's hosted checkout page.
    // Here we return a local route that will "process" the mock payment.
    return {
      checkoutUrl: `${returnUrl}?success=true&plan=${planId}&provider=${planId.includes("usd") ? "lemon-squeezy" : "toss"}`,
    };
  }

  async getSubscription(userId: string): Promise<null | Subscription> {
    if (typeof window === "undefined") return null;

    const data = localStorage.getItem(this.getStorageKey(userId));
    if (!data) return null;

    return JSON.parse(data);
  }

  private getStorageKey(userId: string) {
    return `oiyo_subscription_${userId}`;
  }
}

export const mockPaymentService = new MockPaymentService();
