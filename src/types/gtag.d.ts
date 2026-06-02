export {};

declare global {
  interface Window {
    gtag: (
      command: "config" | "consent" | "event" | "js",
      targetId: Date | string,
      config?: Record<string, any>,
    ) => void;
  }
}
