"use client";

import React, { useState, useEffect } from "react";
import { Globe2, Loader2, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

const COUNTRY_COLORS = (value: number) => {
  if (value <= 2) return "#10b981"; // emerald - very low
  if (value <= 5) return "#34d399"; // light emerald - low
  if (value <= 8) return "#fbbf24"; // amber - medium
  if (value <= 12) return "#f97316"; // orange - high
  return "#ef4444"; // red - very high
};

interface CountryData {
  country: string;
  code: string;
  co2PerCapita: number;
  totalMt: number;
  trend: string;
}

export default function WorldMap() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [countryPlan, setCountryPlan] = useState<{ target: string; progress: string; leader: string; initiatives: string[]; co2PerCapita: string } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/leaderboard?type=map_data");
        const data = await res.json();
        setCountries(data.countries || []);
      } catch {
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  async function fetchCountryPlan(country: string) {
    setLoadingPlan(true);
    setCountryPlan(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "country_climate", data: { country } }),
      });
      const data = await res.json();
      setCountryPlan(data.plan);
    } catch {
      setCountryPlan(null);
    } finally {
      setLoadingPlan(false);
    }
  }

  function handleCountrySelect(country: CountryData) {
    setSelectedCountry(country);
    const knownCountries = ["India", "USA", "China", "Germany", "UK"];
    if (knownCountries.includes(country.country)) {
      fetchCountryPlan(country.country);
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") return <TrendingUp className="w-3.5 h-3.5 text-rose-400" />;
    if (trend === "decreasing") return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
    return <Minus className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <Globe2 className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h2 className="font-black text-slate-100 font-heading text-xl">Global Emissions Map</h2>
          <p className="text-xs text-slate-400">BigQuery · Maps JavaScript API · CO₂ per capita by country</p>
        </div>
      </div>

      {/* Map Visualization — SVG-based world map with colored countries */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">CO₂/capita:</span>
          {[
            { label: "< 2t", color: "#10b981" },
            { label: "2–5t", color: "#34d399" },
            { label: "5–8t", color: "#fbbf24" },
            { label: "8–12t", color: "#f97316" },
            { label: "> 12t", color: "#ef4444" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: l.color }} />
              <span className="text-[10px] text-slate-400 font-semibold">{l.label}</span>
            </div>
          ))}
        </div>

        {/* World Map SVG — simplified continent-level visualization */}
        <div className="relative bg-slate-950 rounded-xl overflow-hidden" style={{ height: 260 }}>
          <svg viewBox="0 0 800 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Ocean background */}
            <rect width="800" height="400" fill="#0f172a" />

            {/* Simplified continent shapes */}
            {/* North America */}
            <path d="M80,60 L200,50 L220,140 L180,180 L140,200 L100,180 L70,140 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* South America */}
            <path d="M150,210 L200,200 L220,280 L200,340 L160,360 L130,320 L120,260 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Europe */}
            <path d="M360,50 L440,45 L450,110 L410,130 L370,120 L345,90 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Africa */}
            <path d="M350,130 L430,125 L450,230 L430,310 L380,330 L340,290 L320,210 L335,155 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Asia */}
            <path d="M450,40 L650,30 L680,150 L620,200 L540,190 L470,170 L445,110 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* India subcontinent */}
            <path d="M540,155 L580,150 L595,220 L565,250 L540,220 L530,180 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            {/* Australia */}
            <path d="M600,240 L700,230 L710,310 L670,340 L620,330 L590,290 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />

            {/* Country dots/markers */}
            {countries.map((c) => {
              const positions: Record<string, [number, number]> = {
                China: [580, 100],
                USA: [150, 120],
                India: [560, 195],
                Russia: [560, 60],
                Japan: [660, 115],
                Germany: [400, 80],
                "South Korea": [645, 120],
                Canada: [150, 75],
                Iran: [510, 130],
                "Saudi Arabia": [490, 165],
                Brazil: [175, 280],
                "South Africa": [410, 290],
                Australia: [650, 280],
                UK: [375, 70],
                France: [385, 85],
                Indonesia: [600, 210],
                Mexico: [120, 155],
                Turkey: [460, 110],
                Netherlands: [390, 72],
                Sweden: [410, 55],
              };

              const pos = positions[c.country];
              if (!pos) return null;
              const color = COUNTRY_COLORS(c.co2PerCapita);
              const radius = Math.min(Math.max(c.co2PerCapita * 1.5, 6), 20);

              return (
                <g
                  key={c.code}
                  onClick={() => handleCountrySelect(c)}
                  className="cursor-pointer"
                  role="button"
                  aria-label={`${c.country}: ${c.co2PerCapita}t CO2 per capita`}
                >
                  <circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r={radius + 4}
                    fill={color}
                    opacity="0.15"
                  />
                  <circle
                    cx={pos[0]}
                    cy={pos[1]}
                    r={radius}
                    fill={color}
                    opacity="0.85"
                    stroke={selectedCountry?.code === c.code ? "#fff" : color}
                    strokeWidth={selectedCountry?.code === c.code ? 2 : 0}
                  />
                  <text
                    x={pos[0]}
                    y={pos[1] + 4}
                    textAnchor="middle"
                    fontSize="7"
                    fill="white"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {c.code}
                  </text>
                </g>
              );
            })}

            {/* Attribution */}
            <text x="790" y="395" textAnchor="end" fontSize="8" fill="#475569">
              EcoQuest · BigQuery Data · 2024
            </text>
          </svg>

          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm rounded-lg px-3 py-2 text-[10px] text-slate-400 border border-slate-800">
            📍 Click any bubble to view country plan
          </div>
        </div>

        {/* Selected Country Detail */}
        {selectedCountry && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-100 font-heading">{selectedCountry.country}</h4>
              <div className="flex items-center gap-2">
                {getTrendIcon(selectedCountry.trend)}
                <span className={`text-xs font-bold ${
                  selectedCountry.trend === "decreasing" ? "text-emerald-400" :
                  selectedCountry.trend === "increasing" ? "text-rose-400" : "text-amber-400"
                }`}>
                  {selectedCountry.trend}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CO₂ Per Capita</p>
                <p className="text-lg font-black font-heading" style={{ color: COUNTRY_COLORS(selectedCountry.co2PerCapita) }}>
                  {selectedCountry.co2PerCapita}t
                </p>
                <p className="text-[10px] text-slate-500">tonnes/year</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Emissions</p>
                <p className="text-lg font-black font-heading text-slate-200">{selectedCountry.totalMt.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">Mt CO₂/year</p>
              </div>
            </div>

            {loadingPlan && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Loading climate commitments...
              </div>
            )}

            {countryPlan && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300 font-bold">{countryPlan.target}</p>
                </div>
                <p className="text-xs text-slate-400">{countryPlan.progress}</p>
                <div className="flex flex-wrap gap-1.5">
                  {countryPlan.initiatives?.slice(0, 3).map((init: string, i: number) => (
                    <span key={i} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {init}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Country List Table */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-bold text-slate-200 text-sm">Top 20 Emitters — Country Breakdown</h3>
        </div>
        <div className="divide-y divide-slate-900 max-h-64 overflow-y-auto">
          {countries.map((c, i) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCountrySelect(c)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-900/40 transition-all cursor-pointer text-left"
            >
              <span className="text-xs text-slate-600 w-5 font-bold">#{i + 1}</span>
              <div className="flex-grow">
                <span className="text-sm text-slate-200 font-bold">{c.country}</span>
              </div>
              <div className="flex items-center gap-3">
                {getTrendIcon(c.trend)}
                <div
                  className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ color: COUNTRY_COLORS(c.co2PerCapita), backgroundColor: COUNTRY_COLORS(c.co2PerCapita) + "20" }}
                >
                  {c.co2PerCapita}t
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
