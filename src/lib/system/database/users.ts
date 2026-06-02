// Supabase-backed user synchronization helpers

export interface CreateUserData {
  clerkId: string;
  email: string;
  firstName?: string;
  fullName?: string;
  imageUrl?: string;
  lastName?: string;
  locale?: string;
}

interface SyncResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

export async function createUser(userData: CreateUserData) {
  const payload = await request<SyncResponse>("/api/users/sync", {
    body: JSON.stringify(userData),
    method: "POST",
  });

  if (!payload.success) {
    throw new Error(payload.error ?? "Failed to sync user");
  }

  return payload.data;
}

export async function updateUserLastSeen(clerkId: string) {
  const payload = await request<SyncResponse>("/api/users/sync", {
    body: JSON.stringify({ clerkId }),
    method: "PATCH",
  });

  if (!payload.success) {
    throw new Error(payload.error ?? "Failed to update last seen");
  }

  return payload.data;
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => undefined)) as
      | SyncResponse
      | undefined;
    throw new Error(
      payload?.error ?? `Request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}
