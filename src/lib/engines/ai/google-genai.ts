import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";
const genAI = new GoogleGenerativeAI(apiKey);

export interface ImageGenerationResult {
  imageUrl: string; // Base64 or URL
  revisedPrompt?: string;
}

export const GoogleGenAIService = {
  /**
   * Edit image roughly using Gemini Vision if possible, or just generate new.
   * True Image Editing (In-painting) requires specific Imagen parameters/masks which are complex via simple REST.
   * For this MVP, we might treat "Edit" as "Generate with Image Prompt" or similar.
   */
  async editImage(
    base64Image: string,
    prompt: string,
  ): Promise<ImageGenerationResult> {
    // For now, treat as variation generation
    // Or use Gemini 1.5 Pro to "describe changes" and then generate?
    // Realistically, direct edits are hard without specialized endpoint.
    // We will implement a mock or simple regeneration with description for now
    // unless we find the edit endpoint.

    return this.generateImage(prompt);
  },

  /**
   * Generates an image from a text prompt using Google's Imagen model via REST API.
   * Note: The Node SDK primarily supports Gemini (text/multimodal). Imagen often requires REST.
   */
  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    if (!apiKey) {
      console.warn("Google GenAI API Key is missing");
      return {
        imageUrl:
          "https://placehold.co/1024x1024/orange/white?text=API+Key+Missing",
      };
    }

    try {
      // Attempt to call Imagen 3 endpoint
      // Docs: https://ai.google.dev/api/rest/v1beta/models/imagen-3.0-generate-001:predict
      const modelName = "imagen-3.0-generate-001";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;

      const response = await fetch(url, {
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: {
            aspectRatio: "1:1", // or "1024x1024"
            personGeneration: "allow_adult",
            sampleCount: 1,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        // Fallback/Error handling
        const errorText = await response.text();
        console.error("Imagen API Error:", errorText);
        throw new Error(`Imagen API Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Response format check (Vertex AI style vs AI Studio style)
      // AI Studio usually returns { predictions: [ { bytesBase64Encoded: "..." } ] }
      // or similar.

      if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
        const base64 = data.predictions[0].bytesBase64Encoded;
        return {
          imageUrl: `data:image/png;base64,${base64}`,
          revisedPrompt: prompt,
        };
      }

      if (
        data.predictions &&
        data.predictions[0]?.mimeType &&
        data.predictions[0]?.bytesBase64Encoded
      ) {
        return {
          imageUrl: `data:${data.predictions[0].mimeType};base64,${data.predictions[0].bytesBase64Encoded}`,
          revisedPrompt: prompt,
        };
      }

      throw new Error("Unexpected response format from Imagen");
    } catch (error) {
      console.error("Image Generation Failed:", error);
      // Fallback for demo/dev if API fails (e.g. 404 on model)
      // Return a placeholder or re-throw
      return {
        imageUrl:
          "https://placehold.co/1024x1024/orange/white?text=Generation+Failed",
      };
    }
  },

  /**
   * Generates structured JSON data using Gemini model.
   * Enforces JSON structure by appending format instructions if not present.
   */
  async generateJson<T>(
    prompt: string,
    modelName: string = "gemini-1.5-flash",
  ): Promise<null | T> {
    if (!apiKey) {
      console.error("Google GenAI API Key is missing");
      return null;
    }

    try {
      const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON without any markdown formatting or explanations.`;
      const model = genAI.getGenerativeModel({
        generationConfig: { responseMimeType: "application/json" },
        model: modelName,
      });

      const result = await model.generateContent(jsonPrompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text) as T;
      } catch (e) {
        console.error("Failed to parse JSON response:", text);
        // Fallback: try to clean markdown code blocks if model ignored instructions
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleaned) as T;
      }
    } catch (error) {
      console.error("JSON Generation Failed:", error);
      return null;
    }
  },

  /**
   * Generates text content using Gemini model.
   */
  async generateText(
    prompt: string,
    modelName: string = "gemini-1.5-flash",
  ): Promise<string> {
    if (!apiKey) {
      return "Google GenAI API Key is missing. Please configure it in settings.";
    }

    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Text Generation Failed:", error);
      return "I apologize, but I couldn't generate the content at this moment. Please try again later.";
    }
  },
};
