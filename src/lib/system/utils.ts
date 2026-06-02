import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for generating deterministic particles based on a seed.
 */
export type ParticleOptions = {
  delayBase: number;
  delayRange: number;
  durationBase: number;
  durationRange: number;
  minSize: number;
  sizeRange: number;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | number | string,
  locale: string = "en",
) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const DEFAULT_PARTICLE_OPTIONS: ParticleOptions = {
  delayBase: 0,
  delayRange: 3,
  durationBase: 3,
  durationRange: 4,
  minSize: 20,
  sizeRange: 60,
};

export function createDeterministicParticles(
  colors: string[],
  seed: string,
  options: Partial<ParticleOptions> = {},
) {
  const config = { ...DEFAULT_PARTICLE_OPTIONS, ...options };

  return colors.map((color, index) => {
    const width =
      config.minSize + seededRandom(seed, index, 1) * config.sizeRange;
    const height =
      config.minSize + seededRandom(seed, index, 2) * config.sizeRange;
    const left = seededRandom(seed, index, 3) * 100;
    const top = seededRandom(seed, index, 4) * 100;
    const delay =
      config.delayBase + seededRandom(seed, index, 5) * config.delayRange;
    const duration =
      config.durationBase + seededRandom(seed, index, 6) * config.durationRange;

    return {
      key: `${seed}-${index}`,
      style: {
        animationDelay: `${delay.toFixed(2)}s`,
        animationDuration: `${duration.toFixed(2)}s`,
        backgroundColor: color,
        height: `${height.toFixed(2)}px`,
        left: `${left.toFixed(2)}%`,
        top: `${top.toFixed(2)}%`,
        width: `${width.toFixed(2)}px`,
      },
    };
  });
}

function seededRandom(seed: string, index: number, offset = 0): number {
  const source = `${seed}-${index}-${offset}`;
  let hash = 0;

  for (let i = 0; i < source.length; i++) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }

  const result = Math.sin(hash) * 10000;
  return result - Math.floor(result);
}
