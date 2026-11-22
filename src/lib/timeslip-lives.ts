// "My parallel lives" timeline (season 3 #7): every episode result the reader drew,
// kept in this browser only and laid out by the year each episode happens in.
import { EPISODES, type EpisodeId } from "./past-life-1426";

export const LIVES_KEY = "oiyo:timeslip-lives";

/** The year each episode is set in (sort key and the label on the timeline). */
export const EPISODE_YEAR: Record<EpisodeId, number> = {
  "silla-golpum": 726, // "1,300 years ago"
  "domesday-1086": 1086,
  "joseon-1426": 1426,
  "europe-1426": 1426,
  "hometown-1426": 1426,
  "ancestors-1426": 1426,
  "sillok-1426": 1426,
  "lunch-1426": 1426,
  "gwageo-1426": 1426,
  "ninbetsu-edo": 1723, // Edo at its 1723 headcount
  "tongsinsa-1763": 1763,
  "joseon-1789": 1789,
  "france-1789": 1789,
  "hoebinghwan-1789": 1789,
  "birthday-calendars": 1793,
  "banchado-1795": 1795,
  "ellis-1907": 1907,
  "census-1911": 1911,
  "huangce-1391": 1391,
  "jinshin-1872": 1872,
  "census-1850": 1850,
  "us-birth-state": 2026, // "born today"
};

export type Life = {
  ep: EpisodeId;
  title: string;
  subtitle?: string;
  kicker: string;
  /** Share query of the result (e.g. "?c=villan…"), so the timeline can link back. */
  query: string;
  accent: string;
  at: number;
};
export type Lives = Partial<Record<EpisodeId, Life>>;

const isEpisode = (v: unknown): v is EpisodeId => typeof v === "string" && (EPISODES as readonly string[]).includes(v);

/** Drop anything malformed that may have been stored by an older build or by hand. */
export function cleanLives(raw: unknown): Lives {
  if (!raw || typeof raw !== "object") return {};
  const out: Lives = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!isEpisode(k) || !v || typeof v !== "object") continue;
    const life = v as Partial<Life>;
    if (typeof life.title !== "string" || !life.title) continue;
    out[k] = {
      ep: k,
      title: life.title.slice(0, 80),
      subtitle: typeof life.subtitle === "string" ? life.subtitle.slice(0, 80) : undefined,
      kicker: typeof life.kicker === "string" ? life.kicker.slice(0, 80) : "",
      query: typeof life.query === "string" && life.query.startsWith("?") ? life.query.slice(0, 300) : "",
      accent: typeof life.accent === "string" && /^#[0-9a-f]{6}$/i.test(life.accent) ? life.accent : "#2b1708",
      at: typeof life.at === "number" ? life.at : 0,
    };
  }
  return out;
}

/** Oldest era first; within a year, the series order. */
export function timeline(lives: Lives): Life[] {
  return EPISODES.filter((e) => lives[e]).map((e) => lives[e]!).sort((a, b) => EPISODE_YEAR[a.ep] - EPISODE_YEAR[b.ep] || EPISODES.indexOf(a.ep) - EPISODES.indexOf(b.ep));
}

/** Years spanned, e.g. 726 → 2026 = 1,300. */
export function span(list: Life[]): number {
  if (list.length < 2) return 0;
  return EPISODE_YEAR[list[list.length - 1]!.ep] - EPISODE_YEAR[list[0]!.ep];
}
