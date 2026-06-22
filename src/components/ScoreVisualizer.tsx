"use client";

import React from "react";
import { useAppState } from "@/app/providers";
import { Car, Leaf, Zap, RefreshCw } from "lucide-react";

export default function ScoreVisualizer() {
  const { emissions, resetQuest } = useAppState();

  if (!emissions) return null;

  const { transit, diet, energy, total } = emissions;

  // Determine ecosystem health level
  // Low: < 50 kg CO2e/week (Excellent, sustainable)
  // Medium: 50 - 120 kg CO2e/week (Moderate)
  // High: > 120 kg CO2e/week (Struggling)
  let health: "healthy" | "moderate" | "struggling" = "moderate";
  if (total < 50) {
    health = "healthy";
  } else if (total > 120) {
    health = "struggling";
  }

  // Get localized configurations for styling
  const healthConfigs = {
    healthy: {
      title: "Vibrant Sanctuary",
      description: "Your carbon footprint is within a sustainable boundary. Your personal ecosystem is flourishing!",
      gradientClass: "from-teal-900/40 via-emerald-950/20 to-slate-950",
      accentColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      bgBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      svgSky: "fill-emerald-950/20",
      svgLeaves: "fill-emerald-400",
      svgFlowers: "fill-rose-400",
      svgTrunk: "fill-emerald-800",
      svgFloor: "fill-emerald-900/60",
    },
    moderate: {
      title: "Balanced Forest",
      description: "Your emissions match the average national baseline. With simple optimizations, you can help this forest bloom.",
      gradientClass: "from-amber-950/30 via-yellow-950/10 to-slate-950",
      accentColor: "text-amber-400",
      borderColor: "border-amber-500/20",
      bgBadge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      svgSky: "fill-amber-950/10",
      svgLeaves: "fill-amber-400",
      svgFlowers: "fill-transparent", // No flowers in moderate state
      svgTrunk: "fill-amber-800",
      svgFloor: "fill-amber-900/40",
    },
    struggling: {
      title: "Struggling Wasteland",
      description: "High carbon intensity is impacting your ecosystem. Complete weekly missions to restore balance and clear the air.",
      gradientClass: "from-rose-950/30 via-slate-900/30 to-slate-950",
      accentColor: "text-rose-400",
      borderColor: "border-rose-500/20",
      bgBadge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      svgSky: "fill-slate-900",
      svgLeaves: "fill-amber-900/70", // Brown leaves
      svgFlowers: "fill-transparent",
      svgTrunk: "fill-slate-800",
      svgFloor: "fill-slate-900",
    },
  };

  const config = healthConfigs[health];

  // Calculate percentages for the breakdown bar
  const totalSum = Math.max(0.1, transit + diet + energy);
  const transitPct = (transit / totalSum) * 100;
  const dietPct = (diet / totalSum) * 100;
  const energyPct = (energy / totalSum) * 100;

  return (
    <div className={`glass rounded-2xl border ${config.borderColor} overflow-hidden shadow-xl flex flex-col md:flex-row`}>
      
      {/* Ecosystem Visual Canvas (SVG Left/Top) */}
      <div className={`flex-1 min-h-[300px] relative bg-gradient-to-b ${config.gradientClass} flex items-center justify-center p-6 border-b md:border-b-0 md:border-r ${config.borderColor}`}>
        
        {/* Sky / Smog layer */}
        {health === "struggling" && (
          <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-75 pointer-events-none">
            {/* Animated smog particles */}
            <div className="absolute top-8 left-4 right-4 h-16 bg-slate-800/10 blur-xl rounded-full animate-pulse" style={{ animationDuration: "6s" }} />
            <div className="absolute top-16 left-12 right-12 h-10 bg-slate-700/10 blur-xl rounded-full animate-pulse" style={{ animationDuration: "8s" }} />
          </div>
        )}

        {/* Ecosystem SVG */}
        <svg 
          viewBox="0 0 400 400" 
          className="w-full max-w-[280px] h-auto drop-shadow-2xl"
          aria-label={`Ecosystem representation: ${config.title}`}
          role="img"
        >
          {/* Sky background circle */}
          <circle cx="200" cy="180" r="150" className={`${config.svgSky} transition-colors duration-500`} />

          {/* Floating pollen / seed particles for healthy state */}
          {health === "healthy" && (
            <g className="animate-pulse">
              <circle cx="120" cy="120" r="2.5" className="fill-emerald-200/60" />
              <circle cx="280" cy="140" r="1.5" className="fill-emerald-200/50" />
              <circle cx="140" cy="220" r="2.0" className="fill-emerald-200/60" />
              <circle cx="240" cy="90" r="3.0" className="fill-emerald-200/40" />
            </g>
          )}

          {/* Floor / Ground */}
          <path d="M 50 300 Q 200 280 350 300 L 350 330 L 50 330 Z" className={`${config.svgFloor} transition-colors duration-500`} />
          
          {/* Cracked lines for struggling state */}
          {health === "struggling" && (
            <g className="stroke-slate-950 stroke-2 opacity-60">
              <line x1="150" y1="292" x2="160" y2="305" />
              <line x1="160" y1="305" x2="155" y2="315" />
              <line x1="240" y1="290" x2="230" y2="302" />
              <line x1="230" y1="302" x2="235" y2="312" />
            </g>
          )}

          {/* Tree Trunk */}
          <path 
            d="M 190 290 L 192 200 Q 185 180 170 170 Q 185 178 194 192 L 198 120 Q 202 120 205 135 L 204 194 Q 212 178 225 172 Q 212 182 206 200 L 208 290 Z" 
            className={`${config.svgTrunk} transition-colors duration-500`} 
          />

          {/* Healthy Leaves and Flowers */}
          {health === "healthy" && (
            <g className="transition-all duration-500">
              {/* Main canopy blobs */}
              <circle cx="198" cy="110" r="32" className={config.svgLeaves} />
              <circle cx="165" cy="155" r="28" className={config.svgLeaves} />
              <circle cx="230" cy="155" r="28" className={config.svgLeaves} />
              <circle cx="202" cy="150" r="34" className={config.svgLeaves} />
              <circle cx="150" cy="180" r="18" className={config.svgLeaves} />
              <circle cx="245" cy="180" r="18" className={config.svgLeaves} />

              {/* Blooming flowers */}
              <circle cx="198" cy="98" r="4.5" className={config.svgFlowers} />
              <circle cx="160" cy="148" r="4.5" className={config.svgFlowers} />
              <circle cx="235" cy="148" r="4.5" className={config.svgFlowers} />
              <circle cx="210" cy="138" r="4.0" className={config.svgFlowers} />
            </g>
          )}

          {/* Moderate Leaves */}
          {health === "moderate" && (
            <g className="transition-all duration-500">
              <circle cx="198" cy="115" r="26" className={config.svgLeaves} />
              <circle cx="170" cy="160" r="22" className={config.svgLeaves} />
              <circle cx="225" cy="160" r="22" className={config.svgLeaves} />
              <circle cx="200" cy="150" r="28" className={config.svgLeaves} />
            </g>
          )}

          {/* Struggling Leaves (sparse and brown) */}
          {health === "struggling" && (
            <g className="transition-all duration-500">
              <circle cx="198" cy="118" r="14" className={config.svgLeaves} />
              <circle cx="172" cy="162" r="10" className={config.svgLeaves} />
              <circle cx="222" cy="162" r="10" className={config.svgLeaves} />
              
              {/* Falling leaves */}
              <path d="M 148 230 Q 142 240 148 245 Z" className="fill-amber-800" />
              <path d="M 235 245 Q 242 255 237 262 Z" className="fill-amber-900" />
            </g>
          )}
        </svg>

        {/* Level indicator badge */}
        <span className={`absolute bottom-4 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.bgBadge}`}>
          {config.title}
        </span>
      </div>

      {/* Score Dashboard (Right/Bottom) */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* Footprint number */}
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Your Personal Ecosystem Score
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-5xl font-black ${config.accentColor} font-heading`}>
                {total}
              </span>
              <span className="text-slate-400 text-sm font-semibold">
                kg CO2e / week
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* Global Target Comparison */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-400">Sustainable Global Target:</span>
              <span className="text-emerald-400">~38 kg/week</span>
            </div>
            <div className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              {/* Sustainable Target Line */}
              <div className="absolute top-0 bottom-0 left-[38%] w-0.5 bg-emerald-500 z-10" title="Target Limit" />
              {/* User Value Bar */}
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  health === "healthy" 
                    ? "bg-emerald-500" 
                    : health === "moderate" 
                      ? "bg-amber-500" 
                      : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, (total / 180) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>0 kg</span>
              <span>Target</span>
              <span>180+ kg</span>
            </div>
          </div>

          {/* Relative Breakdown Progress Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Impact Category Breakdown
            </h4>

            {/* Composite Progress Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
              <div className="bg-sky-500 h-full" style={{ width: `${transitPct}%` }} title="Transit" />
              <div className="bg-emerald-400 h-full" style={{ width: `${dietPct}%` }} title="Diet" />
              <div className="bg-amber-500 h-full" style={{ width: `${energyPct}%` }} title="Energy" />
            </div>

            {/* Labels grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-sky-400 font-medium">
                <Car className="w-3.5 h-3.5" />
                <div>
                  <span className="block text-slate-400 text-[10px]">Transit</span>
                  {transit} kg
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Leaf className="w-3.5 h-3.5" />
                <div>
                  <span className="block text-slate-400 text-[10px]">Diet</span>
                  {diet} kg
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Zap className="w-3.5 h-3.5" />
                <div>
                  <span className="block text-slate-400 text-[10px]">Energy</span>
                  {energy} kg
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Reset / Re-audit controls */}
        <div className="mt-8 pt-4 border-t border-slate-900 flex justify-end">
          <button
            type="button"
            onClick={resetQuest}
            className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-2 cursor-pointer transition-colors"
            aria-label="Restart the carbon audit questionnaire"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Evaluate Footprint
          </button>
        </div>

      </div>

    </div>
  );
}
