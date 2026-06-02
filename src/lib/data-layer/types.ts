export interface Career {
  category: string;
  description: LocalizedString;
  guidance?: {
    commonBarriers: LocalizedString[];
    educationPaths: LocalizedString[];
    firstSteps: LocalizedString[];
    howToOvercome: LocalizedString[];
    timeToEntry: LocalizedString;
  };
  id: string;
  marketData?: {
    automationRisk: number;
    competitionLevel: string;
    demandTrend: string;
    remoteWorkPossible: boolean;
  };
  mbtiTrends: string[];
  outlook: {
    description: LocalizedString;
    futureDemand: string;
    growthRate: number;
  };
  qualifications: {
    level: string;
    name: LocalizedString;
    type: string;
  }[];
  responsibilities: LocalizedString[];
  riasecCode: string;
  sajuElements: string[];
  salaryRange: {
    avg: number;
    max: number;
    min: number;
  };
  stressLevel: number;
  title: LocalizedString;
  tradeoffs?: {
    cons: LocalizedString[];
    pros: LocalizedString[];
    realityCheck: LocalizedString;
  };
  typicalDay?: {
    activity: LocalizedString;
    energyLevel: number;
    time: string;
  }[];
  workLifeBalance: number;
}

export interface Hobby {
  benefits: LocalizedStringArray;
  bloodTypeMatch: Record<string, number>;
  budget: string;
  category: string[];
  description: LocalizedString;
  difficulty: string;
  howToStart: LocalizedStringArray;
  id: string;
  imageEmoji: string;
  materials: LocalizedStringArray;
  mbtiMatch: Record<string, number>;
  moodMatch: Record<string, number>;
  name: LocalizedString;
  riasecMatch?: Record<string, number>; // NEW: RIASEC correlation scores (0-100)
  timeCommitment: string;
  zodiacMatch: Record<string, number>;
}

export type LocalizedString = {
  [key: string]: string | undefined;
  cn?: string;
  en?: string;
  es?: string;
  fr?: string;
  ja?: string;
  ko?: string;
};

export type LocalizedStringArray = {
  [key: string]: string[] | undefined;
  cn?: string[];
  en?: string[];
  es?: string[];
  fr?: string[];
  ja?: string[];
  ko?: string[];
};
