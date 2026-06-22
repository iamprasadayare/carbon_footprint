import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { totalEmissions } = body;

    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/['"]/g, "").trim();

    // Generate contextual planet description
    const planetLevel = totalEmissions < 100 ? "thriving" : totalEmissions < 200 ? "recovering" : "stressed";

    const mockImage = {
      thriving: {
        description: "A lush, vibrant Earth covered in verdant forests and sparkling blue oceans",
        color: "#10b981",
        emoji: "🌍",
        label: "Thriving Ecosystem",
      },
      recovering: {
        description: "Earth in recovery — partial green coverage with some industrial patches",
        color: "#f59e0b",
        emoji: "🌏",
        label: "Recovering Ecosystem",
      },
      stressed: {
        description: "A stressed Earth with visible deforestation and warming indicators",
        color: "#ef4444",
        emoji: "🌎",
        label: "Stressed Ecosystem",
      },
    };

    if (!apiKey || apiKey.includes("mock_gemini_key") || apiKey.startsWith("YOUR_")) {
      const mockData = mockImage[planetLevel as keyof typeof mockImage];
      return NextResponse.json({
        imageUrl: null,
        planetLevel,
        description: mockData.description,
        color: mockData.color,
        emoji: mockData.emoji,
        label: mockData.label,
        totalEmissions,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Create a vivid, poetic 2-sentence description of a planet Earth in "${planetLevel}" ecological state (user has ${totalEmissions.toFixed(0)} kg CO2e/week emissions). 
Make it emotionally resonant and visual. Include specific imagery of forests, oceans, cities, and atmosphere.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();

    const mockData = mockImage[planetLevel as keyof typeof mockImage];

    return NextResponse.json({
      imageUrl: null,
      planetLevel,
      description,
      color: mockData.color,
      emoji: mockData.emoji,
      label: mockData.label,
      totalEmissions,
    });
  } catch (error: unknown) {
    console.error("Imagen API error:", error);
    return NextResponse.json({
      imageUrl: null,
      planetLevel: "unknown",
      description: "Your planet awaits your choices.",
      color: "#10b981",
      emoji: "🌍",
      label: "Your Ecosystem",
      totalEmissions: 0,
    });
  }
}
