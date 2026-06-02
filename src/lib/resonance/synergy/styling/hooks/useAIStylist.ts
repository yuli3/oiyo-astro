import { useCallback, useState } from "react";

// Types for our Style Data
export interface StyleRecommendation {
  category: "color" | "fashion" | "hair" | "makeup";
  description: { en: string; ko: string };
  imageUrl?: string; // Placeholder for generated/reference image
  tags: string[];
  title: { en: string; ko: string };
}

export interface StylingResult {
  faceShape: { en: string; ko: string };
  personalColor: { en: string; ko: string }; // e.g. "Summer Cool"
  recommendations: StyleRecommendation[];
}

// Mock Data for Simulation
const MOCK_RESULTS: Record<string, StylingResult> = {
  default: {
    faceShape: { en: "Oval", ko: "계란형" },
    personalColor: { en: "Summer Light", ko: "여쿨 라이트" },
    recommendations: [
      {
        category: "hair",
        description: {
          en: "Natural volume style",
          ko: "자연스러운 볼륨감을 주는 스타일",
        },
        tags: ["Chic", "Volume"],
        title: { en: "Layered Cut", ko: "레이어드 컷" },
      },
      {
        category: "fashion",
        description: {
          en: "Simple and modern silhouette",
          ko: "심플하고 모던한 실루엣",
        },
        tags: ["Modern", "Clean"],
        title: { en: "Minimal Look", ko: "미니멀 룩" },
      },
      {
        category: "color",
        description: {
          en: "Soft and bright image",
          ko: "부드럽고 밝은 이미지 연출",
        },
        tags: ["Soft", "Bright"],
        title: { en: "Pastel Tones", ko: "파스텔 톤" },
      },
    ],
  },
  // We can add more specific mocks based on Zodiac if needed later
};

export const useAIStylist = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | StylingResult>(null);
  const [uploadedImage, setUploadedImage] = useState<null | string>(null);

  const analyzeImage = useCallback(
    async (file: File, userProfile?: { mbti?: string; sign?: string }) => {
      setIsAnalyzing(true);
      setUploadedImage(URL.createObjectURL(file));
      setResult(null);

      // Simulated API Delay (3 seconds)
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // In a real app, we would send 'file' to a backend (Gemini API) here.
          // For now, we return mock data.
          // We could spice this up by "randomizing" based on userProfile if we wanted.
          setResult(MOCK_RESULTS.default);
          setIsAnalyzing(false);
          resolve();
        }, 3000);
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setUploadedImage(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analyzeImage,
    isAnalyzing,
    reset,
    result,
    uploadedImage,
  };
};
