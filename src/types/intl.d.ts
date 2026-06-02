// next-intl v4 Type Safety Configuration
// Since this project uses dynamic message loading via i18n.ts,
// we use the generated type interface instead of direct JSON import
import type { GeneratedMessages } from "./messages";

declare module "next-intl" {
  interface AppConfig {
    // Messages: GeneratedMessages; // Disabled to prevent type explosion. Safety handled by useSafeT.
  }
}

export {};
