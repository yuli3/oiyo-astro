import type {
  DiscussionMembershipRow,
  DiscussionMessageRow,
  DiscussionSpaceRow,
  DiscussionTopicRow,
} from "@/types/database";

import { getOrCreateSessionId } from "@/lib/system/supabase";

import type {
  CommunityUser,
  DiscussionMessage,
  DiscussionSpace,
  DiscussionTopic,
  PersonalityType,
  TrendingDiscussionTopic,
} from "./community-types";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: string;
  success: boolean;
}

interface CreateMessagePayload {
  metadata?: Record<string, unknown>;
  personalityType?: PersonalityType;
}

interface CreateTopicPayload {
  locale?: string;
  summary?: string;
  tags?: string[];
  title: string;
}

interface GetTrendingTopicsOptions {
  limit?: number;
  locale?: string;
  spaceId?: string;
}

interface TrendingTopicApiPayload {
  space: DiscussionSpaceRow | null;
  topic: DiscussionTopicRow;
}

const BASE_PATH = "/api/community/discussions";

export class DiscussionSpaceService {
  async createDiscussionSpace(
    user: CommunityUser,
    title: string,
    description: string,
    personalityTypes: PersonalityType[],
    isPrivate: boolean,
    locale: string = "ko",
  ): Promise<DiscussionSpace> {
    const sessionId = this.getSessionIdentifier();

    const payload = await this.request<ApiResponse<DiscussionSpaceRow>>(
      "/spaces",
      {
        body: JSON.stringify({
          description,
          isPrivate,
          locale,
          personalityTypes,
          sessionId,
          title,
          userId: user.id,
        }),
        method: "POST",
      },
    );

    if (!payload.data) {
      throw new Error("Failed to create discussion space");
    }

    return this.mapSpace(payload.data);
  }

  async createTopic(
    spaceId: string,
    user: CommunityUser,
    data: CreateTopicPayload,
  ): Promise<DiscussionTopic> {
    const sessionId = this.getSessionIdentifier();
    const payload = await this.request<ApiResponse<DiscussionTopicRow>>(
      `/spaces/${spaceId}/topics`,
      {
        body: JSON.stringify({
          ...data,
          sessionId,
          userId: user.id,
        }),
        method: "POST",
      },
    );

    if (!payload.data) {
      throw new Error("Failed to create topic");
    }

    return this.mapTopic(payload.data);
  }

  async getMessages(
    topicId: string,
    limit: number = 100,
  ): Promise<DiscussionMessage[]> {
    const payload = await this.request<ApiResponse<DiscussionMessageRow[]>>(
      `/topics/${topicId}/messages?limit=${limit}`,
    );
    const rows = payload.data ?? [];
    return rows.map((row) => this.mapMessage(row));
  }

  async getRecommendedSpaces(
    user: CommunityUser,
    limit: number = 10,
  ): Promise<DiscussionSpace[]> {
    const personalities = this.extractPersonalityFilters(user);
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (personalities.length > 0) {
      params.set("personalityTypes", personalities.join(","));
    }

    const payload = await this.request<ApiResponse<DiscussionSpaceRow[]>>(
      `/spaces?${params.toString()}`,
    );
    const rows = payload.data ?? [];
    return rows.map((row) => this.mapSpace(row));
  }

  async getTopics(
    spaceId: string,
    limit: number = 20,
  ): Promise<DiscussionTopic[]> {
    const payload = await this.request<ApiResponse<DiscussionTopicRow[]>>(
      `/spaces/${spaceId}/topics?limit=${limit}`,
    );
    const rows = payload.data ?? [];
    return rows.map((row) => this.mapTopic(row));
  }

  async getTrendingTopics(
    options: GetTrendingTopicsOptions = {},
  ): Promise<TrendingDiscussionTopic[]> {
    const params = new URLSearchParams();
    if (options.limit) {
      params.set("limit", String(options.limit));
    }
    if (options.spaceId) {
      params.set("spaceId", options.spaceId);
    }
    if (options.locale) {
      params.set("locale", options.locale);
    }

    const query = params.toString();
    const path = query ? `/topics/trending?${query}` : "/topics/trending";
    const payload =
      await this.request<ApiResponse<TrendingTopicApiPayload[]>>(path);
    const rows = payload.data ?? [];

    return rows.map((entry) => ({
      space: entry.space ? this.mapSpace(entry.space) : null,
      topic: this.mapTopic(entry.topic),
    }));
  }

  async joinDiscussionSpace(
    user: CommunityUser,
    space: DiscussionSpace,
  ): Promise<{ reason?: string; success: boolean }> {
    const sessionId = this.getSessionIdentifier();
    const response = await this.request<
      ApiResponse<DiscussionMembershipRow | undefined>
    >(`/spaces/${space.id}/join`, {
      body: JSON.stringify({
        sessionId,
        userId: user.id,
      }),
      method: "POST",
    });

    return {
      reason: response.status === "joined" ? undefined : response.status,
      success: response.status === "joined" || response.status === "existing",
    };
  }

  async sendMessage(
    user: CommunityUser,
    space: DiscussionSpace,
    topicId: string,
    content: string,
    options: CreateMessagePayload = {},
  ): Promise<DiscussionMessage> {
    const sessionId = this.getSessionIdentifier();
    const payload = await this.request<ApiResponse<DiscussionMessageRow>>(
      `/topics/${topicId}/messages`,
      {
        body: JSON.stringify({
          content,
          metadata: options.metadata,
          personalityType: options.personalityType,
          sessionId,
          spaceId: space.id,
          userId: user.id,
        }),
        method: "POST",
      },
    );

    if (!payload.data) {
      throw new Error("Failed to send message");
    }

    return this.mapMessage(payload.data);
  }

  // Real-time features are placeholders for future WebSocket integration.
  updateTypingIndicator(
    _userId: string,
    _topicId: string,
    _isTyping: boolean,
  ): void {
    // To be implemented with real-time channel integration (Supabase Realtime / Pusher / Ably)
  }

  updateUserPresence(
    _userId: string,
    _spaceId: string,
    _isOnline: boolean,
  ): void {
    // To be implemented with real-time channel integration
  }

  private extractPersonalityFilters(user: CommunityUser): string[] {
    const filters: string[] = [];
    const profile = user.personalityProfile;
    if (!profile) {
      return filters;
    }

    if (profile.egenteto?.verified && profile.egenteto.type) {
      filters.push(`egenteto-${profile.egenteto.type}`);
    }

    if (
      profile.communicationStyle?.verified &&
      profile.communicationStyle.type
    ) {
      filters.push(`communication-${profile.communicationStyle.type}`);
    }

    return filters;
  }

  private getSessionIdentifier(): string {
    try {
      return getOrCreateSessionId();
    } catch (_error) {
      console.warn("[Discussions] Failed to read session id", _error);
      return `anon_${crypto.randomUUID()}`;
    }
  }

  private mapMessage(row: DiscussionMessageRow): DiscussionMessage {
    const metadata = (row.metadata as null | Record<string, unknown>) ?? {};
    const createdAt = row.created_at ? Date.parse(row.created_at) : Date.now();

    const reactionsArray = (metadata.reactions as string[] | undefined) ?? [];
    const reactionsSet = new Set<string>(reactionsArray);

    return {
      authorId: row.user_id ?? row.session_id ?? "anonymous",
      authorName: (metadata.authorName as string) ?? "익명 사용자",
      content: row.content,
      createdAt: new Date(createdAt),
      id: row.id,
      metadata: {
        reactions: reactionsSet,
      },
      personalityContext: {
        authorPersonalityHint:
          (metadata.personalityHint as string) ?? "알 수 없음",
      },
      personalityType:
        (row.personality_type as PersonalityType | undefined) ?? undefined,
      spaceId: row.space_id ?? "",
      timestamp: new Date(createdAt),
    };
  }

  private mapSpace(row: DiscussionSpaceRow): DiscussionSpace {
    const metadata = (row.metadata as null | Record<string, unknown>) ?? {};
    const createdAt = row.created_at ? Date.parse(row.created_at) : Date.now();
    const updatedAt = row.updated_at ? Date.parse(row.updated_at) : createdAt;
    const lastActivity = row.last_activity_at
      ? Date.parse(row.last_activity_at)
      : updatedAt;

    return {
      accessLevel: row.is_private ? "members-only" : "public",
      activeMembers: row.active_connections ?? 0,
      allowedContentTypes: ["text", "question", "advice"],
      anonymousPostsAllowed: true,
      createdAt,
      createdBy: row.created_by ?? row.created_session_id ?? "anonymous",
      description: row.description_en ?? "",
      descriptionKo: row.description_ko ?? "",
      engagement: {
        averageSessionDuration:
          (metadata.averageSessionDuration as number) ?? 0,
        commentsPerPost: (metadata.commentsPerPost as number) ?? 0,
        dailyActiveUsers: (metadata.dailyActiveUsers as number) ?? 0,
        postsPerWeek: (metadata.postsPerWeek as number) ?? 0,
        weeklyActiveUsers: (metadata.weeklyActiveUsers as number) ?? 0,
      },
      id: row.id,
      memberCount: row.member_count ?? 0,
      metadata: {
        createdAt: new Date(createdAt),
        lastActivity: new Date(lastActivity),
        messageCount: (metadata.messageCount as number) ?? 0,
        participantCount: row.member_count ?? 0,
        updatedAt: new Date(updatedAt),
      },
      moderators: row.created_by ? [row.created_by] : [],
      name: row.name_en,
      nameKo: row.name_ko,
      personalityInsights: (row.allowed_personality_types?.length ?? 0) > 0,
      personalityTypes: (row.allowed_personality_types ??
        []) as PersonalityType[],
      requiresPersonalityVerification: false,
      rules: [],
      settings: {
        allowInvites: true,
        isPrivate: Boolean(row.is_private),
        moderatorApproval: Boolean(row.requires_approval),
      },
      spaceType: "personality-type",
      targetPersonalities: row.personality_focus ?? undefined,
      title: row.name_ko,
    };
  }

  private mapTopic(row: DiscussionTopicRow): DiscussionTopic {
    const metadata = (row.metadata as null | Record<string, unknown>) ?? {};
    const createdAt = row.created_at ? Date.parse(row.created_at) : Date.now();
    const lastActivity = row.last_activity_at
      ? Date.parse(row.last_activity_at)
      : createdAt;

    return {
      category: (metadata.category as string) ?? "general",
      createdAt: new Date(createdAt),
      createdBy: row.created_by ?? row.session_id ?? "anonymous",
      engagementScore: Number(row.engagement_score ?? 0),
      id: row.id,
      metadata: {
        isLocked: Boolean(row.is_locked ?? metadata.isLocked),
        isSticky: Boolean(row.is_pinned ?? metadata.isSticky),
        lastActivity: new Date(lastActivity),
        lastMessage:
          metadata.lastMessage as DiscussionTopic["metadata"]["lastMessage"],
        messageCount: Number(row.message_count ?? metadata.messageCount ?? 0),
        participantCount: Number(
          row.participant_count ?? metadata.participantCount ?? 0,
        ),
        viewCount: Number(metadata.viewCount ?? 0),
      },
      participantCount: row.participant_count ?? 0,
      personalityInsights:
        metadata.personalityInsights as DiscussionTopic["personalityInsights"],
      recentActivity: new Date(lastActivity),
      spaceId: row.space_id ?? "",
      tags: (row.tags ?? []) as string[],
      title: row.title,
    };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_PATH}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      const errorPayload = await safeJson<ApiResponse<unknown>>(response);
      const message =
        errorPayload?.error ?? `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return (await response.json()) as T;
  }
}

async function safeJson<T>(response: Response): Promise<T | undefined> {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}
