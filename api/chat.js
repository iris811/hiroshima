/**
 * Vercel Serverless Function for Claude API
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

// Load trip data for context
let tripData = {};
let hotelGuideData = {};

try {
    tripData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'itinerary.json'), 'utf8'));
    hotelGuideData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'hotel-guide.json'), 'utf8'));
} catch (error) {
    console.error('Failed to load trip data:', error);
}

// Create system prompt with trip context
function createSystemPrompt() {
    const hotelGuide = hotelGuideData.hotelGuide || {};
    const tripInfo = tripData.trip || {};

    let context = `당신은 히로시마 여행을 도와주는 친절한 여행 가이드입니다.

다음 정보를 바탕으로 질문에 답변해주세요:

## 여행 일정 정보
기간: ${tripInfo.dates || '2025년 11월 7일 - 11월 11일'}

`;

    // Add hotel guide information
    if (hotelGuide.description) {
        context += `## 숙소 정보 (KIRO THE SHARE HOTELS)
${hotelGuide.description}

`;
    }

    if (hotelGuide.faqs && hotelGuide.faqs.length > 0) {
        context += `## 숙소 주변 FAQ\n`;
        hotelGuide.faqs.forEach(faq => {
            context += `\n${faq.question}\n${faq.answer}\n`;
        });
    }

    // Add day-by-day itinerary
    if (tripInfo.days && tripInfo.days.length > 0) {
        context += `\n## 상세 일정\n`;
        tripInfo.days.forEach(day => {
            context += `\n### ${day.date} - ${day.title}\n${day.summary}\n`;
            if (day.places && day.places.length > 0) {
                context += `\n방문 장소:\n`;
                day.places.forEach(place => {
                    context += `- ${place.name} (${place.type}): ${place.description}\n`;
                    if (place.address) context += `  주소: ${place.address}\n`;
                });
            }
        });
    }

    context += `\n답변 시 다음 사항을 지켜주세요:
- 친절하고 자연스러운 한국어로 답변하세요
- 위 여행 일정과 호텔 정보를 기반으로 답변하세요
- 구체적인 정보가 없는 경우, 일반적인 히로시마 여행 정보를 제공하세요
- 추천이나 제안을 할 때는 이유를 함께 설명하세요
- 답변은 간결하되 필요한 정보는 충분히 제공하세요`;

    return context;
}

// Serverless function handler
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Build messages array
        const messages = [
            ...history.map(h => ({
                role: h.role,
                content: h.content
            })),
            {
                role: 'user',
                content: message
            }
        ];

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: createSystemPrompt(),
            messages: messages
        });

        const assistantMessage = response.content[0].text;

        res.status(200).json({
            response: assistantMessage
        });

    } catch (error) {
        console.error('Error calling Claude API:', error);
        res.status(500).json({
            error: 'Failed to process request',
            message: error.message
        });
    }
};
