export type TCIDimension =
  // Temperament (기질)
  | "C" // Cooperativeness
  | "HA" // Harm Avoidance
  | "NS" // Novelty Seeking
  | "P" // Persistence
  // Character (성격)
  | "RD" // Reward Dependence
  | "SD" // Self-Directedness
  | "ST"; // Self-Transcendence

export interface TCIResult {
  character: {
    cooperativeness: number;
    // Detailed sub-facets
    details?: {
      C?: Record<string, number>;
      SD?: Record<string, number>;
      ST?: Record<string, number>;
    };
    selfDirectedness: number;
    selfTranscendence: number;
  };
  interpretation: {
    key: string;
    params: Record<string, any>;
  };
  paradoxKey?: string;
  // True statistical percentiles (based on age/gender norms if available)
  percentiles: Record<TCIDimension, number>;
  rawScores: Record<TCIDimension, number>;
  subScaleScores: Record<TCISubDimension, number>;
  temperament: {
    // Detailed sub-facets
    details?: {
      HA?: Record<string, number>;
      NS?: Record<string, number>;
      P?: Record<string, number>;
      RD?: Record<string, number>;
    };
    harmAvoidance: number;
    noveltySeeking: number;
    persistence: number;
    rewardDependence: number;
  };
  timestamp: number;
}

export type TCISubDimension =
  // NS Sub-facets
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  // HA Sub-facets
  | "C5"
  | "HA1"
  | "HA2"
  | "HA3"
  // RD Sub-facets
  | "HA4"
  | "NS1"
  | "NS2"
  | "NS3"
  // P Sub-facets
  | "NS4"
  | "P1"
  | "P2"
  | "P3"
  // SD Sub-facets
  | "P4"
  | "RD1"
  | "RD2"
  | "RD3"
  | "RD4"
  // C Sub-facets
  | "SD1"
  | "SD2"
  | "SD3"
  | "SD4"
  | "SD5"
  // ST Sub-facets
  | "ST1"
  | "ST2"
  | "ST3";
