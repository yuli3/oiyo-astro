import { LocalizedContent } from "@/types/manifest";

export type FriendshipAttachmentType =
  | "anxious"
  | "avoidant_dismissive"
  | "avoidant_fearful"
  | "secure";

export interface FriendshipQuestion {
  id: string;
  options: {
    id: string;
    text: LocalizedContent;
    weights: Partial<Record<FriendshipAttachmentType, number>>;
  }[];
  text: LocalizedContent;
}

export interface FriendshipStyleResult {
  connectionAdvice: LocalizedContent;
  description: LocalizedContent;
  primaryType: FriendshipAttachmentType;
  scores: Record<FriendshipAttachmentType, number>;
  secondaryType: FriendshipAttachmentType;
  vulnerability: LocalizedContent;
}
