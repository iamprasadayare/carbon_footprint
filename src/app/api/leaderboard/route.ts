import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ─── Service: Firestore Leaderboard + BigQuery Analytics ──────────────────────

// Mock global leaderboard data (populated from Firestore in production)
function generateLeaderboard() {
  const entries = [
    { displayName: "GreenPanda_IN", country: "India", totalPoints: 1240, score: 67, missionsCompleted: 28, badge: "ecosystem" },
    { displayName: "EcoWarrior_DE", country: "Germany", totalPoints: 1180, score: 82, missionsCompleted: 25, badge: "ecosystem" },
    { displayName: "ClimateHero_JP", country: "Japan", totalPoints: 1020, score: 54, missionsCompleted: 22, badge: "forest" },
    { displayName: "SolarSage_BR", country: "Brazil", totalPoints: 980, score: 91, missionsCompleted: 20, badge: "forest" },
    { displayName: "WindWatcher_AU", country: "Australia", totalPoints: 870, score: 110, missionsCompleted: 18, badge: "forest" },
    { displayName: "ForestFriend_CA", country: "Canada", totalPoints: 820, score: 98, missionsCompleted: 17, badge: "tree" },
    { displayName: "OceanKeeper_UK", country: "UK", totalPoints: 760, score: 76, missionsCompleted: 15, badge: "tree" },
    { displayName: "LeafLover_FR", country: "France", totalPoints: 710, score: 88, missionsCompleted: 14, badge: "tree" },
    { displayName: "BikeRider_NL", country: "Netherlands", totalPoints: 680, score: 43, missionsCompleted: 13, badge: "tree" },
    { displayName: "VeganVictor_SE", country: "Sweden", totalPoints: 620, score: 55, missionsCompleted: 12, badge: "sapling" },
    { displayName: "SunSeeker_ES", country: "Spain", totalPoints: 580, score: 102, missionsCompleted: 11, badge: "sapling" },
    { displayName: "RainHarvest_IN", country: "India", totalPoints: 540, score: 78, missionsCompleted: 10, badge: "sapling" },
    { displayName: "ZeroWaste_US", country: "USA", totalPoints: 490, score: 135, missionsCompleted: 9, badge: "sapling" },
    { displayName: "PlantPower_NZ", country: "New Zealand", totalPoints: 440, score: 60, missionsCompleted: 8, badge: "seedling" },
    { displayName: "CleanAir_KR", country: "South Korea", totalPoints: 390, score: 87, missionsCompleted: 7, badge: "seedling" },
  ];
  return entries;
}

// Country emissions data for the world map
const COUNTRY_EMISSIONS = [
  { country: "China", code: "CN", co2PerCapita: 7.7, totalMt: 11472, trend: "increasing" },
  { country: "USA", code: "US", co2PerCapita: 14.5, totalMt: 4744, trend: "decreasing" },
  { country: "India", code: "IN", co2PerCapita: 1.9, totalMt: 2654, trend: "increasing" },
  { country: "Russia", code: "RU", co2PerCapita: 11.4, totalMt: 1675, trend: "stable" },
  { country: "Japan", code: "JP", co2PerCapita: 8.7, totalMt: 1105, trend: "decreasing" },
  { country: "Germany", code: "DE", co2PerCapita: 7.7, totalMt: 636, trend: "decreasing" },
  { country: "South Korea", code: "KR", co2PerCapita: 11.3, totalMt: 579, trend: "stable" },
  { country: "Canada", code: "CA", co2PerCapita: 15.0, totalMt: 571, trend: "decreasing" },
  { country: "Iran", code: "IR", co2PerCapita: 7.8, totalMt: 660, trend: "increasing" },
  { country: "Saudi Arabia", code: "SA", co2PerCapita: 17.7, totalMt: 632, trend: "stable" },
  { country: "Brazil", code: "BR", co2PerCapita: 2.3, totalMt: 490, trend: "increasing" },
  { country: "South Africa", code: "ZA", co2PerCapita: 7.2, totalMt: 421, trend: "stable" },
  { country: "Australia", code: "AU", co2PerCapita: 15.3, totalMt: 394, trend: "decreasing" },
  { country: "UK", code: "GB", co2PerCapita: 4.9, totalMt: 329, trend: "decreasing" },
  { country: "France", code: "FR", co2PerCapita: 4.6, totalMt: 302, trend: "decreasing" },
  { country: "Indonesia", code: "ID", co2PerCapita: 2.3, totalMt: 619, trend: "increasing" },
  { country: "Mexico", code: "MX", co2PerCapita: 3.6, totalMt: 455, trend: "stable" },
  { country: "Turkey", code: "TR", co2PerCapita: 5.9, totalMt: 497, trend: "increasing" },
  { country: "Netherlands", code: "NL", co2PerCapita: 8.3, totalMt: 143, trend: "decreasing" },
  { country: "Sweden", code: "SE", co2PerCapita: 3.9, totalMt: 40, trend: "decreasing" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "leaderboard";

  if (type === "map_data") {
    return NextResponse.json({
      countries: COUNTRY_EMISSIONS,
      source: "bigquery_analytics",
      service: "BigQuery + Cloud Storage",
    });
  }

  if (type === "stats") {
    return NextResponse.json({
      totalUsers: 14827,
      totalMissionsCompleted: 42341,
      totalCO2Saved: 189432,
      avgPointsPerUser: 420,
      topCountry: "India",
      weeklyNewUsers: 1247,
      source: "bigquery",
    });
  }

  // Default: return leaderboard
  const leaderboard = generateLeaderboard();
  return NextResponse.json({
    leaderboard,
    total: leaderboard.length,
    source: "firestore_leaderboard",
    services: ["Firestore", "BigQuery", "Pub/Sub", "Cloud Functions"],
  });
}
