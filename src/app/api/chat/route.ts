import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, context } = body;

    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/['"]/g, "").trim();

    const systemContext = context
      ? `User Carbon Profile: Total emissions ${context.total?.toFixed(1)} kg CO2e/week. Transit: ${context.transit?.toFixed(1)} kg, Diet: ${context.diet?.toFixed(1)} kg, Energy: ${context.energy?.toFixed(1)} kg. Quest Points: ${context.points || 0}.`
      : "";

    const mockResponses: Record<string, string> = {
      default: "Great question! Here's what you can do: Start with your highest-emission category. For most people, that's transportation. Even carpooling twice a week can cut your transit emissions by 40%. 🌿",
    };

    if (!apiKey || apiKey.includes("mock_gemini_key") || apiKey.startsWith("YOUR_")) {
      return NextResponse.json({
        reply: `🤖 EcoAdvisor: ${mockResponses.default}\n\n${systemContext ? `Based on your profile: your biggest opportunity is reducing ${context?.transit > context?.diet ? "transportation" : "diet"} emissions.` : "Complete your carbon audit to get personalized advice!"}`,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are EcoAdvisor, a friendly AI climate coach built into EcoQuest — a gamified carbon footprint platform. 
${systemContext}

Be conversational, encouraging, and science-backed. Use emojis sparingly. Keep responses under 150 words.
Answer the user's question about climate change, carbon footprints, or how to reduce emissions.

User question: ${message}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: "🌿 I'm having trouble connecting right now. Here's a quick tip: reducing meat consumption by just 50% can cut your diet-related emissions by nearly 30%!",
    });
  }
}
