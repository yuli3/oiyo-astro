import type {
  DiscussionMembershipRow,
  DiscussionMessageRow,
  DiscussionSpaceRow,
  DiscussionTopicRow,
  Json,
} from "@/types/database";

interface CreateMessagePayload {
  content: string;
  metadata?: Record<string, unknown>;
  personalityType?: null | string;
  sessionId?: null | string;
  spaceId: string;
  topicId: string;
  userId?: null | string;
}

interface CreateSpacePayload {
  description: string;
  isPrivate: boolean;
  locale: string;
  personalityTypes: string[];
  sessionId?: null | string;
  title: string;
  userId?: null | string;
}

interface CreateTopicPayload {
  locale?: string;
  sessionId?: null | string;
  spaceId: string;
  summary?: string;
  tags?: string[];
  title: string;
  userId?: null | string;
}

interface ListSpacesOptions {
  limit?: number;
  personalityTypes?: string[];
  search?: null | string;
  visibility?: null | string;
}

interface ListTrendingTopicsOptions {
  limit?: number;
  locale?: null | string;
  spaceId?: null | string;
}

interface MockDiscussionStore {
  memberships: Map<string, DiscussionMembershipRow>;
  messages: Map<string, DiscussionMessageRow[]>; // keyed by topic id
  spaces: Map<string, DiscussionSpaceRow>;
  topics: Map<string, DiscussionTopicRow>;
}

interface MockTrendingTopic {
  space: DiscussionSpaceRow | null;
  topic: DiscussionTopicRow;
}

const GLOBAL_STORE_KEY = "__oiyoMockDiscussionStore__";

export function createMockDiscussionMessage(
  payload: CreateMessagePayload,
): DiscussionMessageRow {
  const store = getStore();
  const timestamp = nowIsoDate();
  const messageId = generateId("mock-msg");

  const existing = store.messages.get(payload.topicId) ?? [];
  const authorName =
    typeof payload.metadata?.authorName === "string"
      ? payload.metadata?.authorName
      : payload.userId
        ? "커뮤니티 회원"
        : "게스트";

  const personalityHint =
    typeof payload.metadata?.personalityHint === "string"
      ? payload.metadata?.personalityHint
      : null;

  const messageMetadata: Json = {
    authorName,
    personalityHint,
    reactions: [] as string[],
  };

  const message: DiscussionMessageRow = {
    attachments: null,
    content: payload.content,
    created_at: timestamp,
    deleted_at: null,
    id: messageId,
    metadata: messageMetadata,
    personality_type: payload.personalityType ?? null,
    sentiment: null,
    session_id: payload.userId ? null : (payload.sessionId ?? null),
    space_id: payload.spaceId,
    topic_id: payload.topicId,
    updated_at: timestamp,
    user_id: payload.userId ?? null,
  };

  existing.push(clone(message));
  store.messages.set(payload.topicId, existing);

  updateTopicMetrics(payload.topicId);
  refreshMockSpaceMetrics(payload.spaceId);

  return clone(message);
}

export function createMockDiscussionSpace(
  payload: CreateSpacePayload,
): DiscussionSpaceRow {
  const store = getStore();
  const id = generateId("mock-space");
  const slug = `${payload.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = nowIsoDate();

  const space: DiscussionSpaceRow = {
    active_connections: 0,
    allowed_personality_types: payload.personalityTypes,
    compatibility_min_score: 0,
    cover_image_url: null,
    created_at: timestamp,
    created_by: payload.userId ?? null,
    created_session_id: payload.userId ? null : (payload.sessionId ?? null),
    description_en: payload.description,
    description_ko: payload.description,
    id,
    is_private: payload.isPrivate,
    last_activity_at: timestamp,
    locale: payload.locale,
    member_count: 0,
    metadata: {
      averageSessionDuration: 0,
      commentsPerPost: 0,
      dailyActiveUsers: 0,
      messageCount: 0,
      postsPerWeek: 0,
      weeklyActiveUsers: 0,
    },
    moderation_settings: {
      allowInvites: !payload.isPrivate,
    },
    name_en: payload.title,
    name_ko: payload.title,
    personality_focus: payload.personalityTypes,
    requires_approval: payload.isPrivate,
    slug,
    updated_at: timestamp,
    visibility: payload.isPrivate ? "private" : "public",
  };

  store.spaces.set(id, clone(space));
  return clone(space);
}

export function createMockDiscussionTopic(
  payload: CreateTopicPayload,
): DiscussionTopicRow {
  const store = getStore();
  const timestamp = nowIsoDate();
  const topicId = generateId("mock-topic");
  const slug = `${payload.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;

  const topic: DiscussionTopicRow = {
    created_at: timestamp,
    created_by: payload.userId ?? null,
    engagement_score: 0,
    id: topicId,
    is_locked: false,
    is_pinned: Boolean(payload.tags?.includes("announcement")),
    last_activity_at: timestamp,
    locale: payload.locale ?? "ko",
    message_count: 0,
    metadata: {
      isLocked: false,
      isSticky: Boolean(payload.tags?.includes("announcement")),
      lastActivity: timestamp,
      lastMessage: null,
      messageCount: 0,
      participantCount: 0,
      viewCount: 0,
    },
    participant_count: 0,
    session_id: payload.userId ? null : (payload.sessionId ?? null),
    slug,
    space_id: payload.spaceId,
    summary: payload.summary ?? null,
    tags: payload.tags ?? [],
    title: payload.title,
    updated_at: timestamp,
  };

  store.topics.set(topicId, clone(topic));
  store.messages.set(topicId, []);
  refreshMockSpaceMetrics(payload.spaceId);

  return clone(topic);
}

export function getMockDiscussionDataSnapshot() {
  const store = getStore();
  return {
    messages: Array.from(store.messages.entries()).reduce<
      Record<string, DiscussionMessageRow[]>
    >((acc, [topicId, list]) => {
      acc[topicId] = list.map((message) => clone(message));
      return acc;
    }, {}),
    spaces: Array.from(store.spaces.values()).map((space) => clone(space)),
    topics: Array.from(store.topics.values()).map((topic) => clone(topic)),
  };
}

export function joinMockDiscussionSpace(
  spaceId: string,
  {
    sessionId,
    userId,
  }: {
    sessionId?: null | string;
    userId?: null | string;
  },
): { membership: DiscussionMembershipRow; status: "existing" | "joined" } {
  const store = getStore();
  const identifier = userId ?? sessionId ?? "anonymous";
  const membershipKey = `${spaceId}:${identifier}`;
  const existing = store.memberships.get(membershipKey);

  if (existing) {
    return { membership: clone(existing), status: "existing" };
  }

  const timestamp = nowIsoDate();
  const membership: DiscussionMembershipRow = {
    compatibility_score: null,
    id: membershipKey,
    joined_at: timestamp,
    last_seen_at: timestamp,
    notification_preferences: { mentionAlerts: true, weeklyDigest: false },
    role: "member",
    session_id: userId ? null : (sessionId ?? null),
    space_id: spaceId,
    user_id: userId ?? null,
  };

  store.memberships.set(membershipKey, clone(membership));
  refreshMockSpaceMetrics(spaceId);

  return { membership: clone(membership), status: "joined" };
}

export function listMockDiscussionMessages(
  topicId: string,
  options: { limit?: number } = {},
): DiscussionMessageRow[] {
  const { limit = 100 } = options;
  const store = getStore();
  const items = store.messages.get(topicId) ?? [];
  return items
    .slice()
    .sort((a, b) => {
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return aTime - bTime;
    })
    .slice(-limit)
    .map((message) => clone(message));
}

export function listMockDiscussionSpaces(
  options: ListSpacesOptions = {},
): DiscussionSpaceRow[] {
  const store = getStore();
  const { limit = 20, personalityTypes = [], search, visibility } = options;
  const normalizedSearch = normalizeSearch(search);

  let items = Array.from(store.spaces.values());

  if (normalizedSearch) {
    items = items.filter((space) => {
      const haystack = [
        space.name_en,
        space.name_ko,
        space.description_en,
        space.description_ko,
      ]
        .filter(Boolean)
        .map((value) => value!.toLowerCase())
        .join(" ");
      return haystack.includes(normalizedSearch);
    });
  }

  if (visibility) {
    items = items.filter((space) => space.visibility === visibility);
  }

  if (personalityTypes.length > 0) {
    items = items.filter((space) => {
      const allowed = space.allowed_personality_types ?? [];
      return personalityTypes.every((type) => allowed.includes(type));
    });
  }

  items.sort((a, b) => {
    const aTime = a.last_activity_at ? Date.parse(a.last_activity_at) : 0;
    const bTime = b.last_activity_at ? Date.parse(b.last_activity_at) : 0;
    return bTime - aTime;
  });

  return items.slice(0, limit).map((item) => clone(item));
}

export function listMockDiscussionTopics(
  spaceId: string,
  options: { limit?: number; search?: null | string } = {},
): DiscussionTopicRow[] {
  const { limit = 20, search } = options;
  const normalizedSearch = normalizeSearch(search);
  const store = getStore();

  let items = Array.from(store.topics.values()).filter(
    (topic) => topic.space_id === spaceId,
  );

  if (normalizedSearch) {
    items = items.filter((topic) =>
      topic.title.toLowerCase().includes(normalizedSearch),
    );
  }

  items.sort((a, b) => {
    const aTime = a.last_activity_at ? Date.parse(a.last_activity_at) : 0;
    const bTime = b.last_activity_at ? Date.parse(b.last_activity_at) : 0;
    return bTime - aTime;
  });

  return items.slice(0, limit).map((topic) => clone(topic));
}

export function listMockTrendingTopics(
  options: ListTrendingTopicsOptions = {},
): MockTrendingTopic[] {
  const { limit = 10, locale = null, spaceId = null } = options;
  const store = getStore();

  let items = Array.from(store.topics.values());

  if (spaceId) {
    items = items.filter((topic) => topic.space_id === spaceId);
  }

  if (locale) {
    items = items.filter((topic) => (topic.locale ?? "ko") === locale);
  }

  items.sort((a, b) => {
    const aScore = Number(a.engagement_score ?? 0);
    const bScore = Number(b.engagement_score ?? 0);

    if (bScore !== aScore) {
      return bScore - aScore;
    }

    const aMessages = Number(a.message_count ?? 0);
    const bMessages = Number(b.message_count ?? 0);
    if (bMessages !== aMessages) {
      return bMessages - aMessages;
    }

    const aActivity = a.last_activity_at ? Date.parse(a.last_activity_at) : 0;
    const bActivity = b.last_activity_at ? Date.parse(b.last_activity_at) : 0;
    return bActivity - aActivity;
  });

  return items.slice(0, limit).map((topic) => {
    const space = topic.space_id
      ? (store.spaces.get(topic.space_id) ?? null)
      : null;
    return {
      space: space ? clone(space) : null,
      topic: clone(topic),
    };
  });
}

export function refreshMockSpaceMetrics(
  spaceId: string,
): DiscussionSpaceRow | null {
  const store = getStore();
  const space = store.spaces.get(spaceId);
  if (!space) {
    return null;
  }

  const memberCount = Array.from(store.memberships.values()).filter(
    (m) => m.space_id === spaceId,
  ).length;
  const relatedTopics = Array.from(store.topics.values()).filter(
    (topic) => topic.space_id === spaceId,
  );
  const messageCount = relatedTopics.reduce((total, topic) => {
    const topicMessages = store.messages.get(topic.id) ?? [];
    return total + topicMessages.length;
  }, 0);

  const lastTopicActivity = relatedTopics.reduce(
    (latest, topic) => {
      const activity = topic.last_activity_at
        ? Date.parse(topic.last_activity_at)
        : 0;
      return activity > latest ? activity : latest;
    },
    space.last_activity_at ? Date.parse(space.last_activity_at) : 0,
  );

  const lastActivityIso = lastTopicActivity
    ? new Date(lastTopicActivity).toISOString()
    : nowIsoDate();

  space.member_count = memberCount;
  space.active_connections = Math.min(
    memberCount,
    Math.max(3, Math.round(memberCount * 0.4)),
  );
  space.updated_at = lastActivityIso;
  space.last_activity_at = lastActivityIso;

  const previousSpaceMetadata =
    typeof space.metadata === "object" &&
    space.metadata !== null &&
    !Array.isArray(space.metadata)
      ? (space.metadata as Record<string, Json>)
      : {};

  const spaceMetadata: Json = {
    ...previousSpaceMetadata,
    dailyActiveUsers: Math.max(5, Math.round(memberCount * 0.35)),
    messageCount,
    participantCount: memberCount,
    weeklyActiveUsers: Math.max(12, Math.round(memberCount * 0.6)),
  };

  space.metadata = spaceMetadata;

  store.spaces.set(spaceId, space);
  return clone(space);
}

function bootstrapStore(): MockDiscussionStore {
  const spaces = new Map<string, DiscussionSpaceRow>();
  const topics = new Map<string, DiscussionTopicRow>();
  const messages = new Map<string, DiscussionMessageRow[]>();
  const memberships = new Map<string, DiscussionMembershipRow>();

  const now = new Date();
  const nowIso = now.toISOString();

  const sampleSpaces: DiscussionSpaceRow[] = [
    {
      active_connections: 18,
      allowed_personality_types: ["egenteto-tetonam", "egenteto-egennam"],
      compatibility_min_score: 40,
      cover_image_url: null,
      created_at: nowIso,
      created_by: "mock-user-eunji",
      created_session_id: null,
      description_en:
        "For Tetonam / Egennam personalities who thrive on heartfelt conversations and emotional support.",
      description_ko:
        "감정 중심형(Egenteto) 구성원들이 서로의 마음을 나누고 치유하는 공간입니다.",
      id: "mock-space-1",
      is_private: false,
      last_activity_at: nowIso,
      locale: "ko",
      member_count: 128,
      metadata: {
        averageSessionDuration: 18,
        commentsPerPost: 4.2,
        dailyActiveUsers: 52,
        messageCount: 420,
        postsPerWeek: 36,
        weeklyActiveUsers: 188,
      },
      moderation_settings: {
        allowInvites: true,
        autoArchiveDays: 45,
      },
      name_en: "Empathetic Connections",
      name_ko: "따뜻한 공감 커뮤니티",
      personality_focus: ["empathy", "support"],
      requires_approval: false,
      slug: "empathetic-connections",
      updated_at: nowIso,
      visibility: "public",
    },
    {
      active_connections: 26,
      allowed_personality_types: [
        "communication-analytical",
        "communication-direct",
      ],
      compatibility_min_score: 55,
      cover_image_url: null,
      created_at: nowIso,
      created_by: "mock-user-minhyeok",
      created_session_id: null,
      description_en:
        "Analytical discussion lounge for communication-analytical personalities who love structured debate.",
      description_ko:
        "분석형 커뮤니케이터들이 인사이트를 공유하고 문제 해결 전략을 나누는 전문 커뮤니티입니다.",
      id: "mock-space-2",
      is_private: false,
      last_activity_at: nowIso,
      locale: "ko",
      member_count: 94,
      metadata: {
        averageSessionDuration: 22,
        commentsPerPost: 5.1,
        dailyActiveUsers: 41,
        messageCount: 312,
        postsPerWeek: 29,
        weeklyActiveUsers: 153,
      },
      moderation_settings: {
        allowInvites: true,
        promptTemplates: ["Share a challenge you solved this week"],
      },
      name_en: "Strategic Thinkers Circle",
      name_ko: "전략적 사고 네트워크",
      personality_focus: ["analysis", "debate"],
      requires_approval: false,
      slug: "strategic-thinkers-circle",
      updated_at: nowIso,
      visibility: "public",
    },
    {
      active_connections: 12,
      allowed_personality_types: [
        "egenteto-egennye",
        "communication-supportive",
      ],
      compatibility_min_score: 45,
      cover_image_url: null,
      created_at: nowIso,
      created_by: "mock-user-jisoo",
      created_session_id: null,
      description_en:
        "Vision-driven space for Egennye personalities exploring long-term goals, growth and leadership.",
      description_ko:
        "미래 지향형 구성원들이 커리어, 성장 전략, 리더십을 함께 연구하는 공간입니다.",
      id: "mock-space-3",
      is_private: true,
      last_activity_at: nowIso,
      locale: "ko",
      member_count: 62,
      metadata: {
        averageSessionDuration: 24,
        commentsPerPost: 6.3,
        dailyActiveUsers: 28,
        messageCount: 185,
        postsPerWeek: 18,
        weeklyActiveUsers: 102,
      },
      moderation_settings: {
        allowInvites: false,
        moderatorNotes: "Invite-only for verified members",
      },
      name_en: "Future Focused Builders",
      name_ko: "미래 설계 연구소",
      personality_focus: ["vision", "growth"],
      requires_approval: true,
      slug: "future-focused-builders",
      updated_at: nowIso,
      visibility: "private",
    },
  ];

  sampleSpaces.forEach((space) => {
    spaces.set(space.id, clone(space));
  });

  const sampleTopics: DiscussionTopicRow[] = [
    {
      created_at: nowIso,
      created_by: "mock-user-eunji",
      engagement_score: 82,
      id: "mock-topic-1",
      is_locked: false,
      is_pinned: true,
      last_activity_at: nowIso,
      locale: "ko",
      message_count: 12,
      metadata: {
        isLocked: false,
        isSticky: true,
        lastActivity: nowIso,
        lastMessage: {
          author: "소담",
          excerpt: "오늘은 스스로에게 휴식을 허락해 보려고요.",
        },
        messageCount: 12,
        participantCount: 8,
        viewCount: 220,
      },
      participant_count: 8,
      session_id: null,
      slug: "daily-check-in",
      space_id: "mock-space-1",
      summary: "하루를 시작하며 감정을 나누고 서로를 응원하는 공간입니다.",
      tags: ["daily", "support"],
      title: "감정 체크인 & 오늘의 응원",
      updated_at: nowIso,
    },
    {
      created_at: nowIso,
      created_by: "mock-user-hayeon",
      engagement_score: 76,
      id: "mock-topic-2",
      is_locked: false,
      is_pinned: false,
      last_activity_at: nowIso,
      locale: "ko",
      message_count: 9,
      metadata: {
        isLocked: false,
        isSticky: false,
        lastActivity: nowIso,
        lastMessage: {
          author: "윤아",
          excerpt: "나만의 회복 루틴을 만들었어요.",
        },
        messageCount: 9,
        participantCount: 6,
        viewCount: 168,
      },
      participant_count: 6,
      session_id: null,
      slug: "relationship-boundaries",
      space_id: "mock-space-1",
      summary: "소중한 관계를 지키면서도 나를 돌보는 방법을 함께 나눠요.",
      tags: ["relationships", "self-care"],
      title: "관계에서 건강한 거리두기 연습",
      updated_at: nowIso,
    },
    {
      created_at: nowIso,
      created_by: "mock-user-minhyeok",
      engagement_score: 90,
      id: "mock-topic-3",
      is_locked: false,
      is_pinned: true,
      last_activity_at: nowIso,
      locale: "ko",
      message_count: 15,
      metadata: {
        isLocked: false,
        isSticky: true,
        lastActivity: nowIso,
        lastMessage: {
          author: "민혁",
          excerpt: "데이터 기반 설득 전략 정리했습니다.",
        },
        messageCount: 15,
        participantCount: 11,
        viewCount: 305,
      },
      participant_count: 11,
      session_id: null,
      slug: "weekly-case-study",
      space_id: "mock-space-2",
      summary: "실제 비즈니스 상황을 분석하고 소통 전략을 제안합니다.",
      tags: ["case-study", "business"],
      title: "주간 커뮤니케이션 케이스 스터디",
      updated_at: nowIso,
    },
  ];

  sampleTopics.forEach((topic) => {
    topics.set(topic.id, clone(topic));
  });

  const sampleMessages: DiscussionMessageRow[] = [
    {
      attachments: null,
      content:
        "오늘은 유난히 마음이 예민하네요. 오전에 다짐했던 것들을 적어보며 다시 마음을 다잡았어요.",
      created_at: nowIso,
      deleted_at: null,
      id: "mock-msg-1",
      metadata: {
        authorName: "서진",
        personalityHint: "감정 중심 + 현재 지향",
        reactions: ["warm_hug", "support"],
      },
      personality_type: "egenteto-tetonam",
      sentiment: { energy: "low", mood: "sensitive" },
      session_id: null,
      space_id: "mock-space-1",
      topic_id: "mock-topic-1",
      updated_at: nowIso,
      user_id: "mock-user-seojin",
    },
    {
      attachments: null,
      content:
        "서진님, 그런 날에는 따뜻한 차 한 잔과 짧은 산책이 큰 도움이 되더라고요. 오늘도 충분히 잘하고 있어요.",
      created_at: nowIso,
      deleted_at: null,
      id: "mock-msg-2",
      metadata: {
        authorName: "하연",
        personalityHint: "감정 중심 + 미래 지향",
        reactions: ["heart"],
      },
      personality_type: "egenteto-egennam",
      sentiment: { energy: "medium", mood: "encouraging" },
      session_id: null,
      space_id: "mock-space-1",
      topic_id: "mock-topic-1",
      updated_at: nowIso,
      user_id: "mock-user-hayeon",
    },
    {
      attachments: null,
      content:
        "이번 케이스의 이해관계자 분석 결과 공유합니다. 핵심 의사결정권자 3명과 영향력 사용자 2명을 식별했습니다.",
      created_at: nowIso,
      deleted_at: null,
      id: "mock-msg-3",
      metadata: {
        authorName: "도현",
        personalityHint: "분석적 소통",
        reactions: ["insightful"],
      },
      personality_type: "communication-analytical",
      sentiment: { energy: "high", mood: "focused" },
      session_id: null,
      space_id: "mock-space-2",
      topic_id: "mock-topic-3",
      updated_at: nowIso,
      user_id: "mock-user-dohyun",
    },
  ];

  sampleMessages.forEach((message) => {
    const list = messages.get(message.topic_id ?? "") ?? [];
    list.push(clone(message));
    messages.set(message.topic_id ?? "", list);
  });

  sampleSpaces.forEach((space) => {
    const membership: DiscussionMembershipRow = {
      compatibility_score: 88,
      id: `membership-${space.id}-seed`,
      joined_at: nowIso,
      last_seen_at: nowIso,
      notification_preferences: { mentionAlerts: true, weeklyDigest: true },
      role: "host",
      session_id: null,
      space_id: space.id,
      user_id: space.created_by,
    };
    memberships.set(membership.id, membership);
  });

  return {
    memberships,
    messages,
    spaces,
    topics,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getStore(): MockDiscussionStore {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_STORE_KEY]?: MockDiscussionStore;
  };

  if (!globalScope[GLOBAL_STORE_KEY]) {
    globalScope[GLOBAL_STORE_KEY] = bootstrapStore();
  }

  return globalScope[GLOBAL_STORE_KEY]!;
}

function normalizeSearch(value?: null | string): string {
  return value?.toLowerCase().trim() ?? "";
}

function nowIsoDate(): string {
  return new Date().toISOString();
}

function updateTopicMetrics(topicId: string): void {
  const store = getStore();
  const topic = store.topics.get(topicId);
  if (!topic) return;

  const messages = store.messages.get(topicId) ?? [];
  const participants = new Set<string>();
  messages.forEach((message) => {
    const identifier = message.user_id ?? message.session_id ?? "anonymous";
    participants.add(identifier);
  });

  const lastMessage = messages[messages.length - 1] ?? null;
  const lastActivity =
    lastMessage?.created_at ?? topic.last_activity_at ?? nowIsoDate();

  const lastMessageMetadata =
    (lastMessage?.metadata as null | Record<string, unknown>) ?? null;
  const lastMessageAuthor =
    typeof lastMessageMetadata?.authorName === "string"
      ? lastMessageMetadata.authorName
      : "익명";
  const lastMessageExcerpt = lastMessage
    ? lastMessage.content.slice(0, 80)
    : "";

  const previousTopicMetadata =
    typeof topic.metadata === "object" &&
    topic.metadata !== null &&
    !Array.isArray(topic.metadata)
      ? (topic.metadata as Record<string, Json>)
      : {};

  const topicMetadata: Json = {
    ...previousTopicMetadata,
    lastActivity,
    lastMessage: lastMessage
      ? {
          author: lastMessageAuthor,
          excerpt: lastMessageExcerpt,
        }
      : null,
    messageCount: messages.length,
    participantCount: participants.size,
  };

  topic.message_count = messages.length;
  topic.participant_count = participants.size;
  topic.updated_at = lastActivity;
  topic.last_activity_at = lastActivity;
  topic.metadata = topicMetadata;

  store.topics.set(topicId, topic);
}
