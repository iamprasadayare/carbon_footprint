import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const runtime = "nodejs";

export interface GeminiRequestPayload {
  transitEmissions: number;
  dietEmissions: number;
  energyEmissions: number;
  totalEmissions: number;
  answers: {
    transitMode: string;
    transitDistance: number;
    dietType: string;
    energySource: string;
    householdSize: number;
    weeklyKwh: number;
  };
}

export interface Mission {
  id: string;
  task: string;
  category: "transit" | "diet" | "energy";
  points: number;
  rationale: string;
}

export async function POST(request: Request) {
  try {
    const body: GeminiRequestPayload = await request.json();
    const { transitEmissions, dietEmissions, energyEmissions, totalEmissions, answers } = body;

    if (
      transitEmissions === undefined ||
      dietEmissions === undefined ||
      energyEmissions === undefined ||
      totalEmissions === undefined ||
      !answers
    ) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/['"]/g, "").trim();

    const getMockMissions = (): Mission[] => {
      const missions: Mission[] = [];

      if (answers.transitMode === "gasoline-car" || answers.transitDistance > 100) {
        missions.push({
          id: "mission-transit-1",
          task: `Swap one solo drive of ${Math.round(answers.transitDistance / 5)} km with carpooling or public transit this week.`,
          category: "transit",
          points: 120,
          rationale: `Reduces direct CO2 by ~${Math.round(answers.transitDistance * 0.18 / 5)} kg — the equivalent of planting 2 trees.`,
        });
      } else {
        missions.push({
          id: "mission-transit-2",
          task: "Optimize your bicycle or e-scooter for your commute — inflate tires and check chain lubrication.",
          category: "transit",
          points: 50,
          rationale: "Proper maintenance reduces rolling resistance by 15%, making zero-emission transit even more efficient.",
        });
      }

      if (answers.dietType === "meat-heavy" || answers.dietType === "balanced") {
        missions.push({
          id: "mission-diet-1",
          task: "Commit to one fully plant-based day this week — replace all meat and dairy meals with legumes and vegetables.",
          category: "diet",
          points: 100,
          rationale: `A plant-based day cuts weekly diet emissions by ~15%, saving up to ${Math.round(dietEmissions * 0.15)} kg CO2e.`,
        });
      } else {
        missions.push({
          id: "mission-diet-2",
          task: "Audit your fridge this Sunday: plan meals to eliminate food waste entirely for one week.",
          category: "diet",
          points: 60,
          rationale: "Food waste decomposing in landfills releases methane — 28× more potent than CO2 over 100 years.",
        });
      }

      if (answers.energySource === "grid-gas" || answers.energySource === "grid-oil-coal") {
        missions.push({
          id: "mission-energy-1",
          task: "Lower your thermostat by 2°C (or raise AC setpoint by 2°C) during peak afternoon hours (12–4 PM).",
          category: "energy",
          points: 80,
          rationale: "Each degree of HVAC adjustment reduces household energy use by ~5%, cutting grid-side fossil fuel burning.",
        });
      } else {
        missions.push({
          id: "mission-energy-2",
          task: "Unplug all standby electronics (TV, chargers, microwaves) when not in use tonight.",
          category: "energy",
          points: 70,
          rationale: "Vampire power (standby consumption) accounts for up to 10% of household electricity bills and grid load.",
        });
      }

      return missions;
    };

    if (
      !apiKey ||
      apiKey.includes("mock_gemini_key") ||
      apiKey === "" ||
      apiKey.includes("your_gemini_api_key") ||
      apiKey.startsWith("YOUR_")
    ) {
      console.warn("Using mock missions (GEMINI_API_KEY not configured).");
      return NextResponse.json({ missions: getMockMissions() });
    }

    try {
      // ─── Service: Vertex AI (Gemini 2.0 Flash) ────────────────────────────
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              missions: {
                type: SchemaType.ARRAY,
                description: "Exactly three highly specific carbon reduction missions tailored to the user.",
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    id: { type: SchemaType.STRING, description: "Unique slug (e.g., transit-carpool-tuesday)" },
                    task: { type: SchemaType.STRING, description: "Direct actionable instruction, 1-2 sentences." },
                    category: { type: SchemaType.STRING, enum: ["transit", "diet", "energy"], format: "enum" },
                    points: { type: SchemaType.INTEGER, description: "Points 50–150 based on difficulty" },
                    rationale: { type: SchemaType.STRING, description: "1-sentence scientific explanation with CO2 savings." },
                  },
                  required: ["id", "task", "category", "points", "rationale"],
                },
              },
            },
            required: ["missions"],
          },
        },
      });

      const prompt = `
        You are EcoQuest AI, powered by Google Vertex AI Gemini 2.0 Flash, helping users gamify their carbon reduction journey.
        
        Analyze this user's weekly carbon footprint and generate EXACTLY 3 highly specific, actionable missions.
        Focus on the highest-emission categories first for maximum impact.
        
        User Profile:
        - Transport: ${answers.transitMode} (${answers.transitDistance} km/week)
        - Diet: ${answers.dietType}
        - Energy: ${answers.energySource}
        - Household Size: ${answers.householdSize} people
        - Weekly kWh: ${answers.weeklyKwh}
        
        Calculated Weekly Emissions (kg CO2e):
        - Transit: ${transitEmissions.toFixed(2)} kg CO2e
        - Diet: ${dietEmissions.toFixed(2)} kg CO2e  
        - Energy: ${energyEmissions.toFixed(2)} kg CO2e
        - Total: ${totalEmissions.toFixed(2)} kg CO2e
        
        Guidelines:
        1. Be HYPER-SPECIFIC (exact quantities, specific days, specific actions — not vague advice).
        2. Points (50–150) scaled to impact and difficulty.
        3. Rationale must cite specific kg CO2e savings or % reduction.
        4. Each mission must cover a different category (transit, diet, energy).
        5. Return exactly 3 missions in the JSON schema.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedData = JSON.parse(responseText);
      return NextResponse.json(parsedData);
    } catch (apiError: any) {
      console.error("Gemini API failed, using mock missions:", apiError.message);
      return NextResponse.json({
        missions: getMockMissions(),
        warning: "Gemini API unavailable — using intelligent local recommendations.",
      });
    }
  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate missions." },
      { status: 500 }
    );
  }
}
