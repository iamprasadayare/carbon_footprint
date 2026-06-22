import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

// ─── Service: Vertex AI Gemini + Translation API (emulated) ──────────────────
// Uses Gemini to generate tips in the target language directly

const CLIMATE_TOPICS = [
  "renewable energy adoption",
  "plant-based diets and carbon savings",
  "electric vehicles vs gasoline cars",
  "deforestation and reforestation efforts",
  "carbon capture technology",
  "water conservation",
  "sustainable fashion",
  "zero-waste living",
  "solar panel installation",
  "public transit vs private cars",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";
    const topic = searchParams.get("topic") || CLIMATE_TOPICS[Math.floor(Math.random() * CLIMATE_TOPICS.length)];

    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/['"]/g, "").trim();

    const langMap: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      fr: "French",
      es: "Spanish",
      de: "German",
      ja: "Japanese",
      pt: "Portuguese",
    };

    const targetLanguage = langMap[lang] || "English";

    // Mock tips if no API key
    const mockTips: Record<string, Array<{ tip: string; category: string; icon: string }>> = {
      en: [
        { tip: "Replace one beef meal per week with lentils — saves ~3.5 kg CO2e per meal!", category: "diet", icon: "🥗" },
        { tip: "Switch to LED bulbs throughout your home — 75% less energy than incandescent!", category: "energy", icon: "💡" },
        { tip: "Walk or cycle for trips under 3km — zero emissions and great for health!", category: "transit", icon: "🚴" },
        { tip: "Unplug chargers and devices when not in use — standby power = 10% of bills!", category: "energy", icon: "🔌" },
        { tip: "Buy local seasonal produce — cuts food transport emissions by up to 50%.", category: "diet", icon: "🥬" },
      ],
      hi: [
        { tip: "सप्ताह में एक बार गोमांस की जगह दाल खाएं — प्रति भोजन ~3.5 किग्रा CO2e बचाता है!", category: "diet", icon: "🥗" },
        { tip: "LED बल्ब का उपयोग करें — तापदीप्त बल्बों की तुलना में 75% कम ऊर्जा!", category: "energy", icon: "💡" },
        { tip: "3 किमी से कम यात्रा के लिए पैदल चलें या साइकिल चलाएं!", category: "transit", icon: "🚴" },
      ],
      fr: [
        { tip: "Remplacez un repas de bœuf par semaine par des lentilles — économise ~3,5 kg CO2e!", category: "diet", icon: "🥗" },
        { tip: "Utilisez des ampoules LED — 75% moins d'énergie que les ampoules à incandescence!", category: "energy", icon: "💡" },
        { tip: "Marchez ou pédalez pour les trajets de moins de 3 km — zéro émission!", category: "transit", icon: "🚴" },
      ],
    };

    if (!apiKey || apiKey.includes("mock_gemini_key") || apiKey.startsWith("YOUR_")) {
      const tips = mockTips[lang] || mockTips["en"];
      return NextResponse.json({ tips, topic, language: targetLanguage, source: "curated" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate 5 specific, actionable eco tips about "${topic}" in ${targetLanguage}.
Each tip should be 1-2 sentences, practical, and include a quantified benefit where possible.
Return a JSON array with objects: { tip: string, category: "diet"|"energy"|"transit"|"general", icon: emoji }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip markdown code blocks if present
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const tips = JSON.parse(text);
      return NextResponse.json({ tips, topic, language: targetLanguage, source: "gemini" });
    } catch {
      return NextResponse.json({ tips: mockTips[lang] || mockTips["en"], topic, language: targetLanguage, source: "fallback" });
    }
  } catch (error: unknown) {
    console.error("Translate/Tips API error:", error);
    return NextResponse.json({
      tips: [
        { tip: "Every small action matters — start with what's easiest for you today! 🌱", category: "general", icon: "🌱" },
      ],
      source: "error_fallback",
    });
  }
}
