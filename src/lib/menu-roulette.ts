export const MEAL_KEYS = ['lunch', 'dinner', 'lateNight', 'cafe'] as const;
export const SEASON_KEYS = ['spring', 'summer', 'autumn', 'winter'] as const;
export const WEATHER_KEYS = ['clear', 'rainy', 'hot', 'cold'] as const;

export type MealKey = (typeof MEAL_KEYS)[number];
export type SeasonKey = (typeof SEASON_KEYS)[number];
export type WeatherKey = (typeof WEATHER_KEYS)[number];

export interface MenuOption {
  id: string;
  cuisine: string;
  meals: readonly MealKey[];
  seasons?: readonly SeasonKey[];
  weather?: readonly WeatherKey[];
}

export interface MenuFilters {
  meal: MealKey;
  cuisine: string;
  season: SeasonKey | '';
  weather: WeatherKey | '';
}

export function filterMenuOptions<T extends MenuOption>(
  menus: readonly T[],
  filters: MenuFilters,
): T[] {
  return menus.filter((menu) =>
    menu.meals.includes(filters.meal)
    && (!filters.cuisine || menu.cuisine === filters.cuisine)
    && (!filters.season || !menu.seasons || menu.seasons.includes(filters.season))
    && (!filters.weather || !menu.weather || menu.weather.includes(filters.weather))
  );
}

/** Pick without repeating recent results when another candidate exists. */
export function pickMenuOption<T extends MenuOption>(
  pool: readonly T[],
  recentIds: readonly string[],
  random: () => number = Math.random,
): T | null {
  if (pool.length === 0) return null;

  const fresh = pool.filter((menu) => !recentIds.includes(menu.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[index] ?? null;
}

export function pushRecentResult(recentIds: readonly string[], id: string, limit = 3): string[] {
  return [id, ...recentIds.filter((recentId) => recentId !== id)].slice(0, Math.max(0, limit));
}
