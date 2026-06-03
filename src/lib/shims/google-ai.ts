// Stub: Google Generative AI disabled in static build
export class GoogleGenerativeAI {
  constructor(_key: string) {}
  getGenerativeModel() {
    return { generateContent: async () => ({ response: { text: () => '' } }) };
  }
}
