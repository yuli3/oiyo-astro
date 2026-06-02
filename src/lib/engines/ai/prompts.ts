export const AI_PROMPTS = {
  DAILY_HOROSCOPE: {
    en: `Generate a daily horoscope based on the following:
- Zodiac Sign: {{sign}}
- Current Mood: {{mood}}
- Date: {{date}}

Response must strictly follow this JSON format:
{
  "title": "Today's Key Theme (One sentence)",
  "message": "Detailed horoscope (3-4 sentences)",
  "advice": "Actionable advice (1-2 sentences)",
  "luckyColor": "Lucky Color",
  "luckyItem": "Lucky Item"
}`,
    ko: `다음 정보를 바탕으로 오늘의 운세와 조언을 생성해주세요:
- 별자리: {{sign}}
- 현재 기분: {{mood}}
- 날짜: {{date}}

응답은 다음 JSON 형식을 엄격히 따라주세요:
{
  "title": "오늘의 핵심 테마 (한 문장)",
  "message": "상세한 운세 내용 (3-4 문장)",
  "advice": "실천 가능한 구체적 조언 (1-2 문장)",
  "luckyColor": "행운의 색상",
  "luckyItem": "행운의 아이템"
}`,
  },

  SYSTEM: {
    en: `You are 'Oiyo', a mystical life coach and astrologer.
Your tone is warm, mystical, and insightful.
Provide specific, actionable advice for the user's day.
Maintain a friendly yet respectful tone.`,
    ko: `당신은 '오이요(Oiyo)'라는 신비로운 인생 코치이자 점성술사입니다. 
당신의 말투는 따뜻하고, 신비로우며, 통찰력이 있습니다. 
사용자의 하루를 위한 구체적이고 실천 가능한 조언을 제공합니다.
항상 존댓말을 사용하며, 너무 딱딱하지 않게 친근한 어조를 유지하세요.`,
  },
};
