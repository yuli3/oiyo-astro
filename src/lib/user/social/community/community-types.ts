// Community & Social Features Types
// Comprehensive type system for personality-based social interactions and community building

import { Locale } from "@/i18n";

// Achievement & Gamification System
export interface Achievement {
  // Achievement Details
  category: AchievementCategory;
  celebrationAnimation?: string;
  // Metadata
  createdAt: number;
  description: string;
  descriptionKo: string;

  difficulty: "easy" | "hard" | "legendary" | "medium";
  endDate?: number;
  iconUrl: string;

  id: string;
  // Availability
  isActive: boolean;

  // Progress Tracking
  isProgressive: boolean; // Can be partially completed

  isRepeatable: boolean;
  maxProgress?: number;
  name: string;

  nameKo: string;
  prerequisites?: string[]; // Other achievement IDs required
  rarityScore: number; // 0-100, how rare this achievement is
  // Requirements
  requirements: AchievementRequirement[];

  // Rewards
  rewards: {
    badges: string[];
    experiencePoints: number;
    specialPrivileges?: string[];
    titles: string[];
  };
  startDate?: number;
  trackingMetric?: string;
  type: "challenge" | "milestone" | "rare" | "seasonal" | "streak";
}

export type AchievementCategory =
  | "community-engagement"
  | "content-creation"
  | "helping-others"
  | "knowledge-sharing"
  | "milestone"
  | "personality-growth"
  | "special-event"
  | "twin-connections";

export interface AchievementPopularity {
  achievementId: string;
  attemptCount: number;
  completionCount: number;
  completionRate: number;
}

export interface AchievementRequirement {
  description: string;
  metric: string;
  target: number;
  timeframe?: number; // milliseconds
  type:
    | "action-count"
    | "content-quality"
    | "score-threshold"
    | "social"
    | "streak"
    | "time-based";
}

export interface Badge {
  category: BadgeCategory;
  color: string;
  // Metadata
  createdAt: number;
  description: string;
  // Visual
  iconUrl: string;

  id: string;
  isAutoAwarded: boolean;
  name: string;

  nameKo: string;
  rarity: "common" | "epic" | "legendary" | "rare" | "uncommon";

  // Requirements
  requirementType: "achievement" | "community-vote" | "manual" | "time-based";
  totalAwarded: number;
}

export type BadgeCategory =
  | "community-helper"
  | "content-creator"
  | "discussion-leader"
  | "milestone"
  | "personality-expert"
  | "seasonal"
  | "supportive-member"
  | "twin-finder";

// Community Analytics & Insights
export interface CommunityAnalytics {
  // Achievement Distribution
  achievementMetrics: {
    achievementEngagement: number; // how much achievements drive engagement
    averageAchievementsPerUser: number;
    mostPopularAchievements: AchievementPopularity[];
    totalAchievementsEarned: number;
  };

  // Community Health
  communityHealth: {
    diversityIndex: number; // personality type diversity
    helpfulnessRatio: number; // helpful reactions / total reactions
    moderationActions: number;
    supportivenessScore: number; // 0-100
    toxicityScore: number; // 0-100 (lower is better)
  };

  // Content Metrics
  contentMetrics: {
    averageCommentsPerPost: number;
    qualityScore: number; // 0-100
    topCategories: ContentCategoryMetric[];
    totalComments: number;
    totalPosts: number;
  };

  period: {
    end: number;
    start: number;
  };

  // Twin Matching Success
  twinMatchingMetrics: {
    averageMatchQuality: number;
    longTermConnections: number; // connections lasting >30 days
    satisfactionRating: number; // 1-5
    successfulConnections: number;
    totalMatchesAttempted: number;
  };

  // User Engagement
  userEngagement: {
    averageSessionDuration: number;
    engagementByPersonality: { [key: string]: EngagementMetric };
    newUsers: number;
    personalityDistribution: { [key: string]: number };
    returningUsers: number;
    totalActiveUsers: number;
  };
}

export interface CommunityNotification {
  actionUrl?: string;
  category: "achievement" | "moderation" | "social" | "system";

  createdAt: number;
  expiresAt?: number;
  id: string;
  // Status
  isRead: boolean;

  message: string;
  // Metadata
  priority: "high" | "low" | "medium" | "urgent";
  readAt?: number;

  relatedAchievementId?: string;
  relatedContentId?: string;
  // Context
  relatedUserId?: string;
  title: string;

  // Notification Details
  type: NotificationType;
  userId: string;
}

export interface CommunityRule {
  autoEnforce: boolean;
  description: string;
  id: string;
  severity: "info" | "strict" | "warning";
  title: string;
}

// User Profile & Ontology System
export interface CommunityUser {
  avatarUrl?: string;
  // Community Stats
  communityStats: {
    achievements: Achievement[];
    badges: Badge[];
    contributionLevel: UserContributionLevel;
    helpfulVotes: number;
    reputationScore: number;
    thanksReceived: number;
    totalComments: number;
    totalPosts: number;
  };
  displayName?: string;
  id: string;
  joinDate: number;

  // Personality Profile Integration
  personalityProfile?: {
    colorPersonality?: {
      type: "blue" | "green" | "red" | "yellow";
      verificationDate?: number;
      verified: boolean;
    };
    communicationStyle?: {
      type: "analytical" | "diplomatic" | "direct" | "supportive";
      verificationDate?: number;
      verified: boolean;
    };
    completenessScore: number; // 0-100
    egenteto?: {
      type: "egennam" | "egennye" | "tetonam" | "tetonye";
      verificationDate?: number;
      verified: boolean;
    };
  };

  // Engagement Preferences
  preferences: {
    blockedUsers: string[];
    communityGroups: string[];
    contentLanguage: Locale;
    notificationSettings: NotificationSettings;
    personalityInsights: boolean;
  };

  // Privacy & Safety
  privacy: {
    allowDirectMessages: boolean;
    allowTwinMatching: boolean;
    anonymousMode: boolean;
    showPersonalityType: boolean;
  };

  username: string;
}

export type ConfessionCategory =
  | "burnout"
  | "career-anxiety"
  | "decision-paralysis"
  | "impostor-syndrome"
  | "life-transitions"
  | "personality-struggles"
  | "relationship-work"
  | "self-doubt"
  | "social-anxiety"
  | "success-guilt"
  | "work-stress"
  | "workplace-conflict";

export interface ConfessionComment {
  anonymousAuthorId: string;
  authorId: string;
  confessionId: string;
  // Content
  content: string;

  // Metadata
  createdAt?: Date;
  depth?: number;
  helpfulVotes?: number;

  id: string;

  isAdvice?: boolean;
  isSupportive?: boolean;
  // Threading
  parentCommentId?: string;

  // Personality Context
  personalityContext: {
    commenterPersonalityHint: string;
    perspective?: string; // e.g., "From a blue personality perspective..."
    type?: string;
  };
  replies?: string[];

  status?: "active" | "featured" | "hidden";
  thanksCount?: number;
  // Engagement
  upvotes?: number;
}

export type ConfessionFilter = {
  category?: ConfessionCategory;
  contentType?: string;
  personalityType?: string;
  personalityTypes?: PersonalityType[];
  sortBy?: "mostCommented" | "mostHelpful" | "newest" | "oldest";
  tags?: string[];
  timeRange?: string;
};

// Anonymous Confession Booth System
export interface ConfessionPost {
  anonymousAuthorId: string; // Generated anonymous identifier for this confession
  authorId: string; // Still tracked for moderation, but not displayed
  category?: ConfessionCategory;

  commentCount?: number;
  content: string;
  // Engagement
  engagement: {
    comments: ConfessionComment[];
    dislikeCount?: number;
    helpfulCount?: number;
    likeCount?: number;
  };
  helpfulCount?: number;

  id: string;

  // Metadata
  metadata: {
    createdAt: Date;
    reactionCount: number;
    updatedAt?: Date;
  };
  // Moderation
  moderationFlags?: ModerationFlag[];

  // Personality Context (anonymous)
  personalityContext: {
    authorPersonalityHint: string;
    contextualNote?: string; // e.g., "As a tetonam, I struggle with..."
    type?: "egennam" | "egennye" | "tetonam" | "tetonye";
  };
  reactions?: ConfessionReaction[];
  status?: "active" | "archived" | "hidden" | "reported";
  tags: string[];
  // Content
  title?: string;

  verified?: boolean; // Verified as authentic experience
  viewCount?: number;
}

export interface ConfessionReaction {
  anonymous: boolean;
  timestamp: number;
  type: "grateful" | "helpful" | "hopeful" | "relate" | "support";
  userId: string;
}

export interface ContentCategoryMetric {
  averageQualityScore: number;
  category: string;
  engagementRate: number;
  postCount: number;
}

export type ContentType =
  | "advice"
  | "event"
  | "poll"
  | "question"
  | "resource"
  | "story"
  | "text";

// Discussion Message for chat/discussion
export interface DiscussionMessage {
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  id: string;
  metadata?: {
    reactions?: Set<string>;
  };
  personalityContext?: {
    authorPersonalityHint: string;
  };
  personalityType?: PersonalityType;
  spaceId: string;
  timestamp: Date;
}

export interface DiscussionPost {
  authorId: string;
  // Personality Context
  authorPersonality?: {
    contextualFraming?: string; // "As a tetonam, I approach this by..."
    showType: boolean;
    type: string;
  };
  bookmarkCount: number;

  commentCount: number;
  content: string;
  contentType: ContentType;
  // Metadata
  createdAt: number;

  downvotes: number;

  id: string;
  isFeatured: boolean;
  isPinned: boolean;
  personalityInsights?: PersonalityInsight[];
  // Advanced Features
  poll?: PollData;

  resources?: ResourceLink[];
  shareCount: number;
  spaceId: string;
  status: "active" | "archived" | "hidden" | "locked";
  tags: string[];

  // Content
  title: string;
  updatedAt?: number;
  // Engagement
  upvotes: number;
}

// Type-based Discussion Spaces
export interface DiscussionSpace {
  accessLevel: "members-only" | "public" | "verified-only";
  activeMembers: number; // active in last 30 days
  // Content Guidelines
  allowedContentTypes: ContentType[];
  anonymousPostsAllowed: boolean;
  createdAt: number;
  createdBy: string;

  description: string;
  descriptionKo: string;

  // Analytics
  engagement: {
    averageSessionDuration: number;
    commentsPerPost: number;
    dailyActiveUsers: number;
    postsPerWeek: number;
    weeklyActiveUsers: number;
  };
  id: string;
  // Community Settings
  memberCount: number;

  // Metadata
  metadata?: {
    createdAt: Date;
    lastActivity: Date;
    messageCount: number;
    participantCount: number;
    updatedAt: Date;
  };
  moderators: string[];
  name: string;
  nameKo: string;

  personalityInsights: boolean; // Whether to show personality-based insights
  personalityTypes?: PersonalityType[]; // Expected personality types
  requiresPersonalityVerification: boolean;

  rules: CommunityRule[];

  // Settings
  settings?: {
    allowInvites: boolean;
    isPrivate: boolean;
    moderatorApproval: boolean;
  };

  // Space Configuration
  spaceType:
    | "career-stage"
    | "interest-group"
    | "personality-type"
    | "topic-based";

  // Personality Focus
  targetPersonalities?: string[]; // Which types this space is designed for
  title?: string; // Used in some components
}

// Discussion Topic for trending topics
export interface DiscussionTopic {
  category: string;
  createdAt: Date;
  createdBy: string;
  engagementScore: number;
  id: string;
  metadata: {
    isLocked: boolean;
    isSticky: boolean;
    lastActivity: Date;
    lastMessage?: {
      author: string;
      content: string;
      timestamp: Date;
    };
    messageCount: number;
    participantCount: number;
    viewCount: number;
  };
  participantCount: number;
  personalityInsights?: {
    communicationStyle: string;
    dominantPersonalityTypes: PersonalityType[];
    emotionalTone: string;
    trendingTopics?: string[];
  };
  recentActivity: Date;
  spaceId: string;
  tags: string[];
  title: string;
}

export interface EngagementMetric {
  averageSessionDuration: number;
  commentsPerUser: number;
  postsPerUser: number;
  returnRate: number; // percentage returning within 7 days
}

// Korean Cultural Integration
export interface KoreanCommunityFeatures {
  // Cultural Values
  collectivism: {
    conflictAvoidance: boolean;
    consensusBuilding: boolean;
    groupHarmonyEmphasis: boolean;
  };

  // Language & Communication
  honorifics: {
    ageBasedRespect: boolean;
    enabled: boolean;
    seniorityRecognition: boolean;
  };

  // Social Expectations
  socialNorms: {
    groupIdentity: boolean;
    humility: boolean;
    indirectCommunication: boolean;
    nunchi: boolean; // social awareness/emotional intelligence
  };

  // Workplace Culture
  workplaceCulture: {
    hierarchyAwareness: boolean;
    seonbaeHoobae: boolean; // senior-junior relationships
    workLifeBalance: boolean;
  };
}

export interface MatchDifference {
  category: "career" | "interests" | "lifestyle" | "personality" | "values";
  description: string;
  growthOpportunity?: string;
  impact: "complementary" | "conflicting" | "neutral";
}

export interface MatchSimilarity {
  category: "career" | "interests" | "lifestyle" | "personality" | "values";
  description: string;
  details: string[];
  strength: "moderate" | "strong" | "weak";
}

// Moderation & Safety System
export interface ModerationFlag {
  // Automated Detection
  automatedFlag: boolean;
  confidenceScore?: number; // 0-100 for automated flags
  contentId: string;

  contentType: "comment" | "message" | "post" | "profile";
  flaggedAt: number;
  flaggedBy: string;
  // Flag Details
  flagType: ModerationFlagType;

  id: string;
  reason: string;
  resolution?: string;
  reviewedAt?: number;

  reviewedBy?: string;
  // Context
  severityLevel: "critical" | "high" | "low" | "medium";

  // Review Status
  status: "dismissed" | "pending" | "resolved" | "reviewing";
  userHistory: boolean; // whether this user has previous flags
}

export type ModerationFlagType =
  | "commercial-spam"
  | "duplicate"
  | "false-information"
  | "harassment"
  | "inappropriate-content"
  | "off-topic"
  | "privacy-violation"
  | "self-harm-concern"
  | "spam";

// Notification & Communication System
export interface NotificationSettings {
  // Achievements
  achievementEarned: boolean;
  // Content Moderation
  contentApproved: boolean;
  contentFlagged: boolean;

  emailDigest: "daily" | "never" | "weekly";
  followedUserPosted: boolean;
  inAppNotifications: boolean;
  mentionReceived: boolean;

  moderatorMessage: boolean;
  // Community Activity
  postCommented: boolean;
  postUpvoted: boolean;

  progressMilestone: boolean;
  // Delivery Preferences
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    end: string; // "08:00"
    start: string; // "22:00"
  };

  // Twin Matching
  twinMatchFound: boolean;
  twinMessageReceived: boolean;
  twinMilestones: boolean;
  weeklyProgress: boolean;
}

export type NotificationType =
  | "achievement-earned"
  | "badge-awarded"
  | "content-featured"
  | "mention-received"
  | "milestone-reached"
  | "post-commented"
  | "post-reaction"
  | "system-announcement"
  | "twin-match-found"
  | "twin-message";

export interface PersonalityInsight {
  confidence: number; // 0-100
  insight: string;
  personalityType: string;
  supportingData?: string;
}

export interface PersonalityTwinMatch {
  // Connection Status
  connectionStatus: "connected" | "declined" | "expired" | "pending";
  differences: MatchDifference[];
  initiatedAt: number;

  initiatedBy: string;
  matchDetails: {
    activityScore: number;
    demographicScore: number;
    interestScore: number;
    personalityScore: number;
  };

  matchId: string;
  matchUserId: string;

  // Match Quality
  overallScore: number; // 0-100
  respondedAt?: number;
  // Match Explanation
  similarities: MatchSimilarity[];
  // Twin Relationship Data
  twinData?: {
    compatibilityRating?: number; // 1-5 from both users
    connectionDate: number;
    conversationCount: number;
    mutualHelpCount: number;
    sharedActivities: string[];
  };

  userId: string;
}

// Personality Twin Finder System
export interface PersonalityTwinRequest {
  expiresAt: number;
  matches?: PersonalityTwinMatch[];
  // Matching Criteria
  matchingCriteria: {
    ageRange?: [number, number];
    careerStage?: "entry" | "executive" | "mid" | "senior" | "student";
    interests?: string[];
    location?: {
      country?: string;
      preferLocal: boolean;
      region?: string;
    };
    personalityTypes: string[]; // Which personality dimensions to match
    similarityThreshold: number; // 0-100
  };

  requestId: string;

  // Search Preferences
  searchPreferences: {
    excludePreviousMatches: boolean;
    includePartialMatches: boolean;
    maxMatches: number;
    prioritizeActiveUsers: boolean;
  };

  status: "completed" | "expired" | "searching";
  timestamp: number;
  userId: string;
}

export type PersonalityType =
  | "communication-analytical"
  | "communication-diplomatic"
  | "communication-direct"
  | "communication-supportive"
  | "egenteto-egennam"
  | "egenteto-egennye"
  | "egenteto-tetonam"
  | "egenteto-tetonye";

export interface PollData {
  allowMultiple: boolean;
  expiresAt?: number;
  options: PollOption[];
  question: string;
  showResults: "after-close" | "after-vote" | "immediate";
  totalVotes: number;
}

export interface PollOption {
  id: string;
  text: string;
  voterPersonalities?: { [key: string]: number }; // personality type distribution
  votes: number;
}

export interface ProgressSnapshot {
  context?: string;
  progress: number;
  timestamp: number;
}

// Real-time Features
export interface RealTimeEvent {
  data?: Record<string, unknown>;
  spaceId?: string;
  timestamp: number;
  type:
    | "message-sent"
    | "reaction-added"
    | "typing-start"
    | "typing-stop"
    | "user-joined"
    | "user-left";
  userId: string;
}

export interface ResourceLink {
  description?: string;
  title: string;
  type: "article" | "book" | "course" | "tool" | "video";
  url: string;
}

export interface TrendingDiscussionTopic {
  space: DiscussionSpace | null;
  topic: DiscussionTopic;
}

export interface TypingIndicator {
  isTyping: boolean;
  lastTypingAt: number;
  spaceId: string;
  userId: string;
}

export interface UserAchievementProgress {
  achievementId: string;
  bestStreak?: number;

  celebrationViewed: boolean;
  completedAt?: number;
  // Progress
  currentProgress: number;

  currentStreak?: number;
  isCompleted: boolean;
  // Recognition
  isDisplayed: boolean; // Whether user chooses to display this

  // Progress Details
  progressHistory: ProgressSnapshot[];
  shareCount: number;
  userId: string;
}

export type UserContributionLevel =
  | "active"
  | "contributor"
  | "expert"
  | "legend"
  | "mentor"
  | "newcomer";
