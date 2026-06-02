import type {
  ApiResponse,
  PersonalityTest,
  PersonalityTestInsert,
  PersonalityTestUpdate,
  TestCategory,
  TestCategoryInsert,
} from "@/types/database";
import type { Database } from "@/types/database";

// Personality Tests Database Operations
import {
  getSupabaseAdminClientTyped,
  getSupabaseClientTyped,
  handleDatabaseError,
} from "@/lib/system/supabase";

const TEST_CATEGORIES_TABLE: keyof Database["public"]["Tables"] =
  "test_categories";
const PERSONALITY_TESTS_TABLE: keyof Database["public"]["Tables"] =
  "personality_tests";

type PersonalityTestRecord = PersonalityTestsTable["Row"] & {
  test_categories: null | TestCategoriesTable["Row"];
};
type PersonalityTestsTable = Database["public"]["Tables"]["personality_tests"];
type TestCategoriesTable = Database["public"]["Tables"]["test_categories"];

export async function createPersonalityTest(
  testData: PersonalityTestInsert,
): Promise<ApiResponse<PersonalityTest>> {
  const adminClient = getSupabaseAdminClientTyped();
  if (!adminClient) {
    return { error: { message: "Admin client not available" } };
  }

  try {
    const { data, error } = await adminClient
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
        PERSONALITY_TESTS_TABLE,
      )
      .insert(testData)
      .select()
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data as unknown as PersonalityTestRecord };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function createTestCategory(
  categoryData: TestCategoryInsert,
): Promise<ApiResponse<TestCategory>> {
  const adminClient = getSupabaseAdminClientTyped();
  if (!adminClient) {
    return { error: { message: "Admin client not available" } };
  }

  try {
    const { data, error } = await adminClient
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof TEST_CATEGORIES_TABLE, TestCategoriesTable>(
        TEST_CATEGORIES_TABLE,
      )
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    if (!data) {
      return { error: { message: "Failed to create category" } };
    }

    return { data: data as TestCategory };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Personality Test Operations
export async function getAllPersonalityTests(
  options: {
    categoryId?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {},
): Promise<ApiResponse<PersonalityTestRecord[]>> {
  try {
    const client = getSupabaseClientTyped();
    if (!client) {
      return { error: { message: "Supabase client not configured" } };
    }

    let query = client
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
        PERSONALITY_TESTS_TABLE,
      )
      .select(
        `
        *,
        test_categories (
          id,
          slug,
          name_en,
          name_ko,
          icon
        )
      `,
      )
      .eq("is_active", true);

    if (options.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }

    if (options.featured !== undefined) {
      query = query.eq("is_featured", options.featured);
    }

    if (options.limit) {
      const offset = options.offset || 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: (data ?? []) as unknown as PersonalityTestRecord[] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Test Category Operations
export async function getAllTestCategories(): Promise<
  ApiResponse<TestCategory[]>
> {
  try {
    const client = getSupabaseClientTyped();
    if (!client) {
      return { error: { message: "Supabase client not configured" } };
    }

    const { data, error } = await client
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof TEST_CATEGORIES_TABLE, TestCategoriesTable>(
        TEST_CATEGORIES_TABLE,
      )
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: (data ?? []) as TestCategory[] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getFeaturedPersonalityTests(
  limit: number = 6,
): Promise<ApiResponse<PersonalityTestRecord[]>> {
  return getAllPersonalityTests({ featured: true, limit });
}

export async function getPersonalityTestById(
  id: string,
): Promise<ApiResponse<PersonalityTestRecord>> {
  try {
    const client = getSupabaseClientTyped();
    if (!client) {
      return { error: { message: "Supabase client not configured" } };
    }

    const { data, error } = await client
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
        PERSONALITY_TESTS_TABLE,
      )
      .select(
        `
        *,
        test_categories (
          id,
          slug,
          name_en,
          name_ko,
          icon
        )
      `,
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    if (!data) {
      return { error: { message: "Test not found" } };
    }

    return { data: data as unknown as PersonalityTestRecord };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getPersonalityTestBySlug(
  slug: string,
): Promise<ApiResponse<PersonalityTestRecord>> {
  try {
    const client = getSupabaseClientTyped();
    if (!client) {
      return { error: { message: "Supabase client not configured" } };
    }

    const { data, error } = await client
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
        PERSONALITY_TESTS_TABLE,
      )
      .select(
        `
        *,
        test_categories (
          id,
          slug,
          name_en,
          name_ko,
          icon
        )
      `,
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    if (!data) {
      return { error: { message: "Test not found" } };
    }

    if (!data) {
      return { error: { message: "Failed to update test" } };
    }

    return { data: data as unknown as PersonalityTestRecord };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getPersonalityTestsByCategory(
  categorySlug: string,
  limit?: number,
): Promise<ApiResponse<PersonalityTestRecord[]>> {
  try {
    // First get the category ID
    const categoryResult = await getTestCategoryBySlug(categorySlug);
    if (categoryResult.error || !categoryResult.data) {
      return {
        error: categoryResult.error || { message: "Category not found" },
      };
    }

    return getAllPersonalityTests({
      categoryId: categoryResult.data.id,
      limit,
    });
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Analytics for tests
export async function getTestAnalytics(_testId?: string): Promise<
  ApiResponse<{
    activeTests: number;
    featuredTests: number;
    testsByCategory: Array<{ category: string; count: number }>;
    totalTests: number;
  }>
> {
  const adminClient = getSupabaseAdminClientTyped();
  if (!adminClient) {
    return { error: { message: "Admin client not available" } };
  }

  try {
    const [totalResult, activeResult, featuredResult, categoryResult] =
      await Promise.all([
        // @ts-ignore -- Supabase type mismatch
        // @ts-ignore -- Supabase type mismatch
        adminClient.from(PERSONALITY_TESTS_TABLE as any).select("count"),
        adminClient
          // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
          .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
            PERSONALITY_TESTS_TABLE,
          )
          .select("count")
          .eq("is_active", true),
        adminClient
          // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
          .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
            PERSONALITY_TESTS_TABLE,
          )
          .select("count")
          .eq("is_featured", true),
        adminClient
          // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
          .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
            PERSONALITY_TESTS_TABLE,
          )
          .select(
            `
          test_categories (name_en)
        `,
          )
          .eq("is_active", true),
      ]);

    // Count tests by category
    type CategoryRow = {
      test_categories: Array<{ name_en: null | string }> | null;
    };

    const categoryMap = new Map<string, number>();
    const categoryRows = (categoryResult.data ?? []) as CategoryRow[];
    categoryRows.forEach((row) => {
      const categories =
        row.test_categories && row.test_categories.length > 0
          ? row.test_categories
          : [{ name_en: "Uncategorized" }];

      categories.forEach((category) => {
        const categoryName = category.name_en ?? "Uncategorized";
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
      });
    });

    const testsByCategory = Array.from(categoryMap.entries()).map(
      ([category, count]) => ({
        category,
        count,
      }),
    );

    const analytics = {
      activeTests: activeResult.count || 0,
      featuredTests: featuredResult.count || 0,
      testsByCategory,
      totalTests: totalResult.count || 0,
    };

    return { data: analytics };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function getTestCategoryBySlug(
  slug: string,
): Promise<ApiResponse<TestCategory>> {
  try {
    const client = getSupabaseClientTyped();
    if (!client) {
      return { error: { message: "Supabase client not configured" } };
    }

    const { data, error } = await client
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof TEST_CATEGORIES_TABLE, TestCategoriesTable>(
        TEST_CATEGORIES_TABLE,
      )
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    if (!data) {
      return { error: { message: "Category not found" } };
    }

    return { data: data as TestCategory };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

// Search and filtering
export async function searchPersonalityTests(
  query: string,
  locale: string = "en",
  limit: number = 20,
): Promise<ApiResponse<PersonalityTestRecord[]>> {
  try {
    const client = getSupabaseClientTyped();
    if (!client) {
      return { error: { message: "Supabase client not configured" } };
    }

    const nameField = locale === "ko" ? "name_ko" : "name_en";
    const descriptionField =
      locale === "ko" ? "description_ko" : "description_en";

    const { data, error } = await client
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
        PERSONALITY_TESTS_TABLE,
      )
      .select(
        `
        *,
        test_categories (
          id,
          slug,
          name_en,
          name_ko,
          icon
        )
      `,
      )
      .or(
        `${nameField}.ilike.%${query}%,${descriptionField}.ilike.%${query}%,tags.cs.{${query}}`,
      )
      .eq("is_active", true)
      .limit(limit)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: (data ?? []) as unknown as PersonalityTestRecord[] };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function toggleTestFeatured(
  id: string,
): Promise<ApiResponse<PersonalityTest>> {
  const adminClient = getSupabaseAdminClientTyped();
  if (!adminClient) {
    return { error: { message: "Admin client not available" } };
  }

  try {
    // First get current state
    const { data: currentTest, error: fetchError } = await adminClient
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
        PERSONALITY_TESTS_TABLE,
      )
      .select("is_featured")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: handleDatabaseError(fetchError) };
    }

    // Toggle the featured status
    return updatePersonalityTest(id, {
      is_featured: !currentTest.is_featured,
    });
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}

export async function updatePersonalityTest(
  id: string,
  updates: PersonalityTestUpdate,
): Promise<ApiResponse<PersonalityTest>> {
  const adminClient = getSupabaseAdminClientTyped();
  if (!adminClient) {
    return { error: { message: "Admin client not available" } };
  }

  try {
    const { data, error } = await adminClient
      // @ts-expect-error -- Supabase generics unresolved without runtime schema inference
      .from<typeof PERSONALITY_TESTS_TABLE, PersonalityTestsTable>(
        PERSONALITY_TESTS_TABLE,
      )
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { error: handleDatabaseError(error) };
    }

    return { data: data as PersonalityTest };
  } catch (error) {
    return { error: handleDatabaseError(error) };
  }
}
