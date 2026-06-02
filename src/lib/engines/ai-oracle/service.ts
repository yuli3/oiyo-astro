import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// NOTE: In a real app, ensure NEXT_PUBLIC_GEMINI_API_KEY is set in .env
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "mock_key",
);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateContent(
  systemPrompt: string,
  userContent: string,
): Promise<string> {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.warn("AI_ORACLE: No API Key found. Returning mock response.");
    return mockResponse(userContent);
  }

  try {
    const result = await model.generateContent(
      `${systemPrompt}\n\nDATA TO ANALYZE:\n${userContent}`,
    );
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI_ORACLE Error:", error);
    return mockResponse(userContent);
  }
}

function mockResponse(content: string): string {
  return (
    "The stars are silent momentarily (Missing API Key). However, your destiny remains bright. The data suggests a powerful resonance waiting to be unlocked. (Mock AI response based on: " +
    content.substring(0, 50) +
    "...)"
  );
}
