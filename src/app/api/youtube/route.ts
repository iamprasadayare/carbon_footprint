import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ─── Service: YouTube Data API v3 ────────────────────────────────────────────
// Fetches real climate/sustainability videos from YouTube

const CLIMATE_VIDEOS_MOCK = [
  {
    id: "G4H1N_yXBiA",
    title: "Climate Change: How Do We Know?",
    channel: "NASA Goddard",
    thumbnail: "https://img.youtube.com/vi/G4H1N_yXBiA/maxresdefault.jpg",
    description: "NASA's scientific evidence for climate change — temperature records, sea level rise, and more.",
    category: "science",
    duration: "4:12",
    views: "2.1M",
  },
  {
    id: "ipVxxxqwBQw",
    title: "What is the Paris Agreement?",
    channel: "UN Climate",
    thumbnail: "https://img.youtube.com/vi/ipVxxxqwBQw/maxresdefault.jpg",
    description: "The landmark international accord on climate change — what countries agreed to and why it matters.",
    category: "policy",
    duration: "5:30",
    views: "890K",
  },
  {
    id: "KZaHVbVFDMs",
    title: "How India Is Becoming a Solar Power Leader",
    channel: "Bloomberg Originals",
    thumbnail: "https://img.youtube.com/vi/KZaHVbVFDMs/maxresdefault.jpg",
    description: "India's ambitious solar energy targets and how they're transforming the energy landscape.",
    category: "india",
    duration: "8:45",
    views: "1.4M",
  },
  {
    id: "wbR-5mHI6bo",
    title: "Greta Thunberg: No One Is Too Small To Make a Difference",
    channel: "TED",
    thumbnail: "https://img.youtube.com/vi/wbR-5mHI6bo/maxresdefault.jpg",
    description: "Young activist Greta Thunberg speaks about the urgency of climate action at TED.",
    category: "leaders",
    duration: "11:20",
    views: "5.2M",
  },
  {
    id: "1M2KQRH6j9c",
    title: "David Attenborough: A Life On Our Planet",
    channel: "WWF",
    thumbnail: "https://img.youtube.com/vi/1M2KQRH6j9c/maxresdefault.jpg",
    description: "Sir David Attenborough's witness statement and vision for the future of our planet.",
    category: "leaders",
    duration: "12:05",
    views: "8.7M",
  },
  {
    id: "RSgXcFdHxFI",
    title: "IPCC Report 2023: What You Need to Know",
    channel: "DW Planet A",
    thumbnail: "https://img.youtube.com/vi/RSgXcFdHxFI/maxresdefault.jpg",
    description: "Breaking down the landmark IPCC Synthesis Report and what it means for humanity.",
    category: "science",
    duration: "9:18",
    views: "3.4M",
  },
  {
    id: "xt9OhpNbXiU",
    title: "How to Stop Climate Change: A Practical Guide",
    channel: "Kurzgesagt",
    thumbnail: "https://img.youtube.com/vi/xt9OhpNbXiU/maxresdefault.jpg",
    description: "Practical, evidence-based actions individuals and governments can take right now.",
    category: "action",
    duration: "10:42",
    views: "12.1M",
  },
  {
    id: "G-h4MDfNGDg",
    title: "Carbon Capture: Can We Remove CO2 From the Air?",
    channel: "TED-Ed",
    thumbnail: "https://img.youtube.com/vi/G-h4MDfNGDg/maxresdefault.jpg",
    description: "Exploring the cutting-edge technology of direct air carbon capture and storage.",
    category: "technology",
    duration: "6:25",
    views: "4.8M",
  },
  {
    id: "W-cHONNuBLY",
    title: "UN Secretary-General: We Are on a Highway to Climate Hell",
    channel: "UN News",
    thumbnail: "https://img.youtube.com/vi/W-cHONNuBLY/maxresdefault.jpg",
    description: "António Guterres's landmark speech on climate urgency at COP27.",
    category: "leaders",
    duration: "7:30",
    views: "2.9M",
  },
  {
    id: "e6rglsLy1Ys",
    title: "The Future of Renewable Energy in 2024",
    channel: "Bloomberg Technology",
    thumbnail: "https://img.youtube.com/vi/e6rglsLy1Ys/maxresdefault.jpg",
    description: "Solar, wind, and battery storage — the renewable energy revolution is accelerating.",
    category: "technology",
    duration: "15:00",
    views: "1.8M",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const apiKey = process.env.YOUTUBE_API_KEY || "";

    // Filter by category if needed
    let videos = CLIMATE_VIDEOS_MOCK;
    if (category !== "all") {
      videos = CLIMATE_VIDEOS_MOCK.filter((v) => v.category === category);
      if (videos.length === 0) videos = CLIMATE_VIDEOS_MOCK;
    }

    if (!apiKey || apiKey.includes("mock") || apiKey.startsWith("YOUR_")) {
      // Return mock data — YouTube API key not configured
      return NextResponse.json({
        videos,
        source: "curated",
        categories: ["all", "science", "leaders", "policy", "action", "technology", "india"],
      });
    }

    // Real YouTube Data API v3 call
    const query = encodeURIComponent("climate change carbon footprint sustainability 2024");
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&relevanceLanguage=en&videoDuration=medium&maxResults=10&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("YouTube API failed");

    const data = await response.json();
    const liveVideos = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      description: item.snippet.description,
      category: "general",
      duration: "—",
      views: "—",
    })) || videos;

    return NextResponse.json({
      videos: liveVideos,
      source: "youtube_api",
      categories: ["all", "science", "leaders", "policy", "action", "technology", "india"],
    });
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json({
      videos: CLIMATE_VIDEOS_MOCK,
      source: "curated_fallback",
      categories: ["all", "science", "leaders", "policy", "action", "technology", "india"],
    });
  }
}
