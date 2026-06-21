"use client";

import React, { useState, useEffect } from "react";
import { Play, ExternalLink, Globe, BookOpen, Filter, Sparkles, ChevronRight } from "lucide-react";

interface ClimateVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  description: string;
  category: string;
  duration: string;
  views: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  all: { label: "All", color: "bg-slate-700 text-slate-200" },
  science: { label: "🔬 Science", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  leaders: { label: "🎙️ Leaders", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  policy: { label: "📜 Policy", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  action: { label: "⚡ Action", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  technology: { label: "🔧 Tech", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  india: { label: "🇮🇳 India", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
};

// World Leaders / Organizations Data
const CLIMATE_LEADERS = [
  {
    name: "António Guterres",
    role: "UN Secretary-General",
    country: "United Nations",
    flag: "🇺🇳",
    quote: "We are on a highway to climate hell with our foot on the accelerator. We need a climate solidarity pact.",
    mission: "Net zero by 2050, limit warming to 1.5°C",
    year: 2022,
    color: "from-blue-900/50 to-blue-950/50 border-blue-700/30",
  },
  {
    name: "Narendra Modi",
    role: "Prime Minister of India",
    country: "India",
    flag: "🇮🇳",
    quote: "India is not just committed to the Paris Agreement targets — we are going beyond them.",
    mission: "500 GW renewable by 2030; Net zero by 2070",
    year: 2021,
    color: "from-orange-900/50 to-orange-950/50 border-orange-700/30",
  },
  {
    name: "Xi Jinping",
    role: "President of China",
    country: "China",
    flag: "🇨🇳",
    quote: "China aims to have CO₂ emissions peak before 2030 and achieve carbon neutrality before 2060.",
    mission: "Carbon neutral before 2060; largest renewable buildout",
    year: 2020,
    color: "from-red-900/50 to-red-950/50 border-red-700/30",
  },
  {
    name: "Ursula von der Leyen",
    role: "European Commission President",
    country: "European Union",
    flag: "🇪🇺",
    quote: "The European Green Deal is Europe's man-on-the-moon moment.",
    mission: "55% emissions cut by 2030; climate neutral by 2050",
    year: 2019,
    color: "from-indigo-900/50 to-indigo-950/50 border-indigo-700/30",
  },
  {
    name: "Greta Thunberg",
    role: "Climate Activist",
    country: "Sweden",
    flag: "🇸🇪",
    quote: "Our house is on fire. I want you to act as if the house is on fire, because it is.",
    mission: "Fridays for Future; systemic change now",
    year: 2018,
    color: "from-teal-900/50 to-teal-950/50 border-teal-700/30",
  },
  {
    name: "John Kerry",
    role: "US Climate Envoy",
    country: "USA",
    flag: "🇺🇸",
    quote: "The climate crisis is real. It is happening now. It is existential.",
    mission: "50-52% emissions reduction from 2005 levels by 2030",
    year: 2021,
    color: "from-blue-900/40 to-slate-900/60 border-blue-800/20",
  },
];

const INTERNATIONAL_ORGS = [
  { name: "IPCC", full: "Intergovernmental Panel on Climate Change", role: "Scientific consensus on climate change", fact: "1.5°C limit requires cutting emissions 45% by 2030" },
  { name: "UNFCCC", full: "UN Framework Convention on Climate Change", role: "International treaty coordination", fact: "197 countries are parties to the Paris Agreement" },
  { name: "IEA", full: "International Energy Agency", role: "Energy data and policy advice", fact: "Renewables will account for 90% of new power by 2030" },
  { name: "WWF", full: "World Wildlife Fund", role: "Nature conservation and climate advocacy", fact: "Protecting 30% of land and ocean can halt biodiversity loss" },
  { name: "Greenpeace", full: "Greenpeace International", role: "Environmental activism worldwide", fact: "Campaigns in 55+ countries for climate justice" },
  { name: "C40 Cities", full: "C40 Cities Climate Leadership Group", role: "City-level climate action", fact: "97 cities committing to 1.5°C compatible pathways" },
];

export default function AcademyPanel() {
  const [videos, setVideos] = useState<ClimateVideo[]>([]);
  const [category, setCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"videos" | "leaders" | "orgs" | "future">("videos");
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/youtube?category=${category}`);
        const data = await res.json();
        setVideos(data.videos || []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [category]);

  const filteredVideos = videos.filter((v) =>
    category === "all" ? true : v.category === category
  );

  return (
    <div className="space-y-6">
      {/* Academy Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="font-black text-slate-100 font-heading text-xl">Climate Academy</h2>
          <p className="text-xs text-slate-400">YouTube API · Learn from world leaders & science</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-900 flex-wrap">
        {[
          { id: "videos", label: "📹 Videos" },
          { id: "leaders", label: "🎙️ World Leaders" },
          { id: "orgs", label: "🏛️ Organisations" },
          { id: "future", label: "🔮 Future of Earth" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Videos Tab */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  category === key
                    ? "bg-emerald-500 text-slate-950 border-emerald-500"
                    : `border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200`
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900 rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredVideos.slice(0, 8).map((video) => (
                <div key={video.id} className="group bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all">
                  {playingVideo === video.id ? (
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                        title={video.title}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div
                      className="relative cursor-pointer overflow-hidden"
                      onClick={() => setPlayingVideo(video.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Play ${video.title}`}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        {video.duration}
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_CONFIG[video.category]?.color || "bg-slate-700 text-slate-300"}`}>
                          {video.category}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <h4 className="font-bold text-slate-100 text-xs leading-tight line-clamp-2">{video.title}</h4>
                    <p className="text-[10px] text-slate-500">{video.channel} · {video.views} views</p>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Open on YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaders Tab */}
      {activeTab === "leaders" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CLIMATE_LEADERS.map((leader, i) => (
            <div key={i} className={`p-5 rounded-2xl bg-gradient-to-br border space-y-3 ${leader.color}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{leader.flag}</span>
                <div>
                  <h4 className="font-bold text-slate-100 font-heading">{leader.name}</h4>
                  <p className="text-[10px] text-slate-400">{leader.role} · {leader.country}</p>
                </div>
              </div>
              <blockquote className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-emerald-500/40 pl-3">
                "{leader.quote}"
              </blockquote>
              <div className="bg-slate-950/40 rounded-xl p-3 space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Climate Commitment</p>
                <p className="text-xs text-slate-300">{leader.mission}</p>
              </div>
              <p className="text-[10px] text-slate-500">Statement: {leader.year}</p>
            </div>
          ))}
        </div>
      )}

      {/* Organisations Tab */}
      {activeTab === "orgs" && (
        <div className="grid grid-cols-1 gap-4">
          {INTERNATIONAL_ORGS.map((org, i) => (
            <div key={i} className="flex gap-4 items-start p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-slate-100 font-heading">{org.name}</h4>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{org.full}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{org.role}</p>
                <div className="mt-2 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300">{org.fact}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Future of Earth Tab */}
      {activeTab === "future" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
            <h3 className="font-black text-slate-100 font-heading text-lg mb-4">🔮 Future Projections</h3>
            <div className="space-y-4">
              {[
                { year: "2030", scenario: "If nations meet Paris targets", desc: "Warming limited to +1.5°C. Arctic summers still exist. Extreme weather 2× more frequent. Renewables cover 90% of new power. 1.5B people adopt EVs.", color: "text-emerald-400 border-emerald-500/20 bg-emerald-950/30" },
                { year: "2050", scenario: "Net Zero achieved globally", desc: "Carbon neutral world. Sea levels +20cm (manageable). Coral reefs partially recovered. 100% clean energy globally. Forests expanding.", color: "text-teal-400 border-teal-500/20 bg-teal-950/30" },
                { year: "2100", scenario: "Business as usual (no action)", desc: "Warming +3.5°C to 4°C. Sea levels +1m+. 1B+ climate refugees. Mass species extinction. India summer temperatures regularly exceed 50°C.", color: "text-rose-400 border-rose-500/20 bg-rose-950/30" },
                { year: "India 2047", scenario: "India's Amrit Kaal vision", desc: "500 GW solar capacity. 30% EV fleet penetration. 33% forest cover target. 170M green jobs. World's largest renewable energy market.", color: "text-amber-400 border-amber-500/20 bg-amber-950/30" },
              ].map((proj, i) => (
                <div key={i} className={`p-4 rounded-xl border ${proj.color} space-y-2`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-heading">{proj.year}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-300 font-bold">{proj.scenario}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{proj.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
            <h4 className="font-bold text-emerald-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> The Power of Individual Action
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              If every person on Earth reduced their carbon footprint by just 15%, global emissions would drop by <strong className="text-emerald-300">8.4 billion tonnes CO₂/year</strong> — equivalent to shutting down 2,100 coal power plants. Your individual EcoQuest matters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
