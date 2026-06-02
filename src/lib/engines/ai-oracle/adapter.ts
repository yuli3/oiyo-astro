import { buildSystemPrompt } from "./prompts";
import { generateContent } from "./service";
import { OracleInput, OracleResponse } from "./types";

/**
 * The Main Entry point for the AI Oracle.
 * Takes structured domain data, prompts the AI, and returns a poetic narrative.
 */
export async function consultOracle(
  input: OracleInput,
): Promise<OracleResponse> {
  // 1. Convert context object to a string representation for the AI
  const dataString = JSON.stringify(input.context, null, 2);

  // 2. Build the Persona/System prompt
  const systemPrompt = buildSystemPrompt(input);

  // 3. Call the AI Service
  const rawText = await generateContent(systemPrompt, dataString);

  // 4. Post-process (extract keywords if needed, logic to be improved)
  // For now, we return the raw text as the narrative.
  return {
    keywords: ["Destiny", "Resonance", "Oracle"], // Mock keywords, or ask AI to json output
    narrative: rawText,
    tone: "mystical",
  };
}
