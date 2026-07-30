import { generateGrandOracleReport } from "@/lib/engines/grand-oracle/logic";
import type { GrandOracleInput } from "@/lib/engines/grand-oracle/types";
import type { UniversalProfile } from "@/lib/ontology/engine/types";
import { heavenlyStems } from "@/lib/ontology/saju/data";
import { getLanguageName } from "@/lib/system/i18n/locale-helper";
import type { Locale } from "@/types/manifest";

import { SYSTEM_PROMPT, TIER_INSTRUCTIONS } from "./prompts";
import type {
  DailyFortuneResult,
  FortuneContext,
  FortuneRequest,
  FortuneResponse,
  UserTier,
} from "./types";

export class FortuneEngine {
  private static readonly API_KEY =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  /**
   * Core Generator Logic
   */
  /**
   * Core Generator Logic (Hybrid)
   */
  public static async generate(
    request: FortuneRequest,
  ): Promise<FortuneResponse> {
    const tier = request.context?.tier || "FREE";

    // TIER 1: DETERMINISTIC (ZERO COST)
    if (tier === "FREE") {
      return await this.generateDeterministic(request);
    }

    // TIER 2 & 3: GENERATIVE AI (PAID)
    if (!this.API_KEY) {
      return this.generateMock(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      const aiResponse = await this.callGemini(prompt);
      return this.processAIResponse(aiResponse, request);
    } catch (e) {
      console.error("FortuneEngine Fail:", e);
      // Fallback to deterministic if AI fails even for paid users
      return await this.generateDeterministic(request);
    }
  }

  /**
   * Unified Entry Point: Get Daily Fortune
   * Orchestrates Saju, Zodiac, and AI to generate the daily reading.
   */
  public static async getDailyFortune(
    profile: UniversalProfile,
    locale: Locale,
    tierOverride?: UserTier,
  ): Promise<DailyFortuneResult> {
    // 1. Determine Tier
    const tier: UserTier = tierOverride || "FREE";

    // 2. Build Context from Profile
    const context = this.buildContext(profile, tier);

    // 3. Prepare Request
    const request: FortuneRequest = {
      birthDate: profile.input.instant,
      category: "overall",
      context,
      locale,
      name: profile.input.fullName,
      profile,
      scope: "daily",
      zodiacSign: profile.westernZodiac.id,
    };

    // 4. Generate AI Content
    // Use the existing generation logic but upgraded
    return await this.generateDailyContent(request);
  }

  // --- INTERNAL BUILDERS ---

  private static buildContext(
    profile: UniversalProfile,
    tier: UserTier,
  ): FortuneContext {
    return {
      animal: profile.animalZodiac?.id,
      biorhythm: profile.biorhythms
        ? `P:${Math.round(profile.biorhythms.physical)}`
        : undefined,
      saju: profile.saju?.dayMaster
        ? heavenlyStems[profile.saju.dayMaster]?.element
        : undefined,
      tier,
      userHobbies: profile.hobbies || [],
      western: profile.westernZodiac?.id,
    };
  }

  private static buildPrompt(request: FortuneRequest): string {
    const langName = getLanguageName(request.locale as Locale);
    const userRole = "sage"; // Persona

    let profileContext = "";
    if (request.profile) {
      const p = request.profile;
      profileContext = `
        User Name: ${p.input.fullName || "Traveler"}
        Western Zodiac: ${p.westernZodiac?.id}
        Eastern Zodiac: ${p.animalZodiac?.id}
        Day Master (Saju): ${p.saju?.dayMaster ? heavenlyStems[p.saju.dayMaster]?.element : "Unknown"} (This is their core elemental nature)
        Strong Element: ${p.sajuAnalysis?.dominantElement}
        Weak Element: ${p.sajuAnalysis?.weakElement}
      `;
    }

    const tier = request.context?.tier || "FREE";
    const hobbies = request.context?.userHobbies?.join(", ") || "Unknown";
    const sajuElement = request.context?.saju || "Unknown";
    const dayMaster = request.context?.saju || "Unknown"; // Simplified mapping for now
    const westernZodiac = request.context?.western || "Unknown";

    let instructions = "";

    if (tier === "FREE") {
      instructions = TIER_INSTRUCTIONS.FREE(sajuElement);
    } else if (tier === "OFFERING") {
      instructions = TIER_INSTRUCTIONS.OFFERING(dayMaster, westernZodiac);
    } else if (tier === "SUBSCRIBER") {
      instructions = TIER_INSTRUCTIONS.SUBSCRIBER(hobbies);
    }

    return `
      ${SYSTEM_PROMPT(request.locale)}
      
      Tier Level: ${tier}
      Task: Generate a ${request.scope} fortune.

      User Profile:
      ${profileContext}
      
      Specific Instructions:
      ${instructions}

      Format: Return pure JSON.
      
      Output JSON Schema:
      {
        "title": "Poetic Title",
        "description": "Main advice text",
        "score": 0-100,
        "advice": ["Tip 1", "Tip 2", "Tip 3"],
        "lucky": {
          "color": "String",
          "number": 0,
          "direction": "String",
          "item": "String",
          "time": "String",
          "company": "String"
        },
        "energy": { "love": 0-100, "money": 0-100, "health": 0-100 },
        "keywords": ["Word1", "Word2"]
      }
    `;
  }

  private static async callGemini(prompt: string): Promise<any> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${this.API_KEY}`,
      {
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }], role: "user" }],
          generationConfig: { responseMimeType: "application/json" },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  }

  // --- MOCK FALLBACK (Simplified for skeleton) ---
  private static async generateDailyContent(
    request: FortuneRequest,
  ): Promise<DailyFortuneResult> {
    // In real implementation, this wraps generate() and casts type
    // leveraging the prompt schema above that matches DailyFortuneResult
    const base = await this.generate(request);
    return base as DailyFortuneResult;
  }

  // --- DETERMINISTIC ENGINE (TIER 1) ---

  private static async generateDeterministic(
    request: FortuneRequest,
  ): Promise<DailyFortuneResult> {
    // --- INTEGRATED GRAND ORACLE ENGINE ---
    // Replaces legacy static template with dynamic modular synthesis

    // 1. Build Grand Oracle Input
    // If ontologyProfile is present, use it. Otherwise, construct from UniversalProfile/Context.
    const { locale, profile } = request;
    const ontologyProfile = (request as any).ontologyProfile;

    // Fallback helpers
    const dayMasterStr =
      profile?.saju?.dayMaster || request.context?.saju?.toUpperCase() || "GAP";

    // Construct Input
    const oracleInput: GrandOracleInput = {
      biorhythm: profile?.biorhythms
        ? {
            emotional: profile.biorhythms.emotional,
            intellectual: profile.biorhythms.intellectual,
            physical: profile.biorhythms.physical,
          }
        : null,
      cosmic:
        profile?.cosmic ||
        (ontologyProfile as any)?.roots?.universal?.cosmic ||
        null,
      // Map Branches from OntologyProfile
      enneagram: (ontologyProfile as any)?.branches?.enneagram || null,
      locale,
      mbti: (ontologyProfile as any)?.branches?.mbti || null,
      // Map Mythos
      mythos: (ontologyProfile as any)?.roots?.universal?.mythos || {
        celtic: null,
        egyptian: null,
        symbols: null,
      },
      riasec: (ontologyProfile as any)?.branches?.riasec || null,
      saju:
        profile?.saju ||
        (ontologyProfile as any)?.roots?.universal?.saju ||
        null,
      tci: (ontologyProfile as any)?.branches?.psychology?.tci || null,
    };

    // 2. Generate Report
    const report = await generateGrandOracleReport(oracleInput);

    // 3. Map to DailyFortuneResult
    const now = new Date();

    // Synthesis as Description
    const description =
      report.summary + "\n\n" + (report.synthesis.paradoxResolution || "");

    return {
      // Use Synthesis/Summary for advice
      advice: [
        report.synthesis.paradoxKey,
        report.sections.prophecy?.content || "Trust the process.",
      ],
      description,
      energy: { health: 75, love: 75, money: 75 },

      generatedAt: now,
      id: `oracle-${now.getTime()}`,
      // Extract keywords from sections
      keywords: Object.values(report.sections)
        .filter((s) => s && s.content)
        .flatMap((s) => s.content.split(/\s+/))
        .filter((word) => word.length > 1 && /^[a-zA-Z가-힣]+$/.test(word))
        .slice(0, 5),

      lucky: {
        color: report.visualResonance.aura.primaryColor,
        company: "Self",
        direction: "East",
        item: "Mirror",
        number: 8,
        time: "Dawn",
      },

      luckyColors: [report.visualResonance.aura.primaryColor],
      luckyDays: [],
      luckyNumbers: [8],
      rating: "excellent",

      score: report.synthesis.alignmentScore || 85,
      // Pass full rich data to UI
      sections: report.sections,
      title: report.sections.cosmicEntry.title, // Or "Grand Oracle Readings"

      validUntil: new Date(now.setHours(23, 59, 59)),
      visualResonance: report.visualResonance,
    };
  }

  private static generateMock(request: FortuneRequest): any {
    return {
      advice: ["Listen to silence"],
      description:
        "Even when the skies are quiet, your heart beats with purpose.",
      energy: { health: 50, love: 50, money: 50 },
      generatedAt: new Date(),
      id: "mock",
      keywords: ["Silence"],
      lucky: { color: "Grey", direction: "Center", number: 0 },
      luckyColors: ["Grey"],
      luckyNumbers: [0],
      rating: "moderate",
      score: 50,
      title: "The Silent Stars",
      validUntil: new Date(),
    };
  }

  private static processAIResponse(raw: any, request: FortuneRequest): any {
    const now = new Date();
    return {
      advice: raw.advice || [],
      description: raw.description,
      // DailyFortuneResult specifics
      energy: raw.energy || { health: 50, love: 50, money: 50 },

      generatedAt: now,
      id: `fortune-${now.getTime()}`,
      keywords: raw.keywords || [],
      lucky: raw.lucky || {
        color: "White",
        company: "Friend",
        direction: "East",
        item: "Water",
        number: 7,
        time: "Morning",
      },

      luckyColors: [raw.lucky?.color || "White"],
      luckyDays: [], // Extended prop
      luckyNumbers: [raw.lucky?.number || 7],
      rating: raw.score > 80 ? "excellent" : "moderate",

      score: raw.score || 50,
      title: raw.title,
      validUntil: new Date(now.setHours(23, 59, 59)),
    };
  }
}
