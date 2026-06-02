import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AIInsight {
  careerGuidance: string;
  financialStrategy: string;
  growthAreas: string[];
  keyStrengths: string[];
  relationshipAdvice: string;
  summary: string;
  wellnessRecommendations: string;
}

export interface WholeSelfProfile {
  [key: string]: string | undefined;
  bloodType?: string;
  celticType?: string;
  colorTone?: string;
  enneagram?: string;
  mbti?: string;
  moneyType?: string;
  zodiac?: string;
}

export async function generateWholeSelfInsights(
  profile: WholeSelfProfile,
): Promise<AIInsight> {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  });

  const profileSummary = Object.entries(profile)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const prompt = `You are a world-class psychologist and life coach analyzing a person's complete personality profile. Based on the following assessment results, provide deep, actionable insights.

PROFILE:
${profileSummary}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "A 2-3 sentence holistic summary of this person's core ontology and life approach",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "growthAreas": ["area 1", "area 2", "area 3"],
  "careerGuidance": "Specific career advice based on their personality constellation (2-3 sentences)",
  "relationshipAdvice": "How they can improve their relationships based on their traits (2-3 sentences)",
  "financialStrategy": "Personalized financial advice considering their money habits and personality (2-3 sentences)",
  "wellnessRecommendations": "Mental and physical wellness strategies tailored to their profile (2-3 sentences)"
}

Be specific, actionable, and insightful. Avoid generic advice. Connect the dots between different aspects of their personality.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let cleanedText = text.trim();

    cleanedText = cleanedText.replace(/^```json\s*/g, "");
    cleanedText = cleanedText.replace(/\s*```$/g, "");

    cleanedText = cleanedText.replace(/^```\s*/g, "");
    cleanedText = cleanedText.replace(/\s*```$/g, "");

    cleanedText = cleanedText.replace(/^[^{\[]*/, "");
    cleanedText = cleanedText.replace(/[^}\]]*$/, "");

    let jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    }

    if (!jsonMatch) {
      console.error("Raw AI response:", text);
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as AIInsight;
  } catch (error) {
    console.error("Gemini API error:", error);

    // Fallback response
    return {
      careerGuidance:
        "Your profile suggests success in roles that allow for autonomy and creative problem-solving. Consider positions that leverage your analytical skills while providing variety.",
      financialStrategy:
        "Create a balanced portfolio that reflects both your risk tolerance and need for security. Automate savings while maintaining flexibility for opportunities.",
      growthAreas: [
        "Developing consistency in long-term goals",
        "Building deeper connections",
        "Managing energy levels",
      ],
      keyStrengths: [
        "Adaptability across different contexts",
        "Balanced approach to life decisions",
        "Strong self-awareness",
      ],
      relationshipAdvice:
        "Focus on clear communication and setting boundaries. Your natural empathy is a strength—use it intentionally rather than reactively.",
      summary:
        "Your unique combination of traits creates a multifaceted personality with tremendous potential for growth and impact.",
      wellnessRecommendations:
        "Prioritize consistent sleep schedules and regular physical activity. Your mental clarity depends on routine, but allow space for spontaneity to prevent burnout.",
    };
  }
}
