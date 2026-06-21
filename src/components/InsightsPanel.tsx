"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/app/providers";
import { Sparkles, Download, Globe, BarChart3, Loader2, TrendingDown, Zap } from "lucide-react";

interface Insight {
  globalComparison: {
    worldAvgWeekly: number;
    indiaAvgWeekly: number;
    usaAvgWeekly: number;
    euAvgWeekly: number;
    userScore: number;
  };
  projections: {
    yearlyEmissions: string;
    treesNeededToOffset: number;
    potentialSavings: string;
  };
  insights: string[];
}

export default function InsightsPanel() {
  const { emissions, points, missions, uid, answers } = useAppState();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tips, setTips] = useState<any[]>([]);
  const [tipsLang, setTipsLang] = useState("en");
  const [tipsLoading, setTipsLoading] = useState(false);

  useEffect(() => {
    if (emissions) {
      fetchInsights();
      fetchTips(tipsLang);
    }
  }, [emissions]);

  async function fetchInsights() {
    if (!emissions) return;
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "climate_insights",
          data: {
            totalEmissions: emissions.total,
            transitEmissions: emissions.transit,
            dietEmissions: emissions.diet,
            energyEmissions: emissions.energy,
          },
        }),
      });
      const data = await res.json();
      setInsight(data);
    } catch {
      setInsight(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTips(lang: string) {
    setTipsLoading(true);
    try {
      const res = await fetch(`/api/translate?lang=${lang}`);
      const data = await res.json();
      setTips(data.tips || []);
    } catch {
      setTips([]);
    } finally {
      setTipsLoading(false);
    }
  }

  async function handleExport() {
    if (!emissions) return;
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emissions,
          answers,
          missions,
          points,
          displayName: "EcoWarrior_" + (uid?.substring(0, 6) || "anon"),
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ecoquest_carbon_report_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const languages = [
    { code: "en", label: "🇺🇸 English" },
    { code: "hi", label: "🇮🇳 हिंदी" },
    { code: "fr", label: "🇫🇷 Français" },
    { code: "es", label: "🇪🇸 Español" },
    { code: "de", label: "🇩🇪 Deutsch" },
  ];

  if (!emissions) {
    return (
      <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-8 text-center space-y-3">
        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-slate-400 text-sm">Complete your Carbon Audit to see AI-powered insights and tips.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* AI Insights Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 font-heading">AI Climate Insights</h3>
              <p className="text-[10px] text-slate-400">Powered by Vertex AI Gemini</p>
            </div>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl text-xs font-bold hover:bg-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
            id="export-report-btn"
            title="Export to Google Sheets (CSV)"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export Report
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            <span className="text-sm text-slate-400">Gemini is analyzing your footprint...</span>
          </div>
        ) : insight ? (
          <div className="space-y-4">
            {/* Global Comparison Bar Chart */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Footprint vs Global</h4>
              {[
                { label: "You", value: insight.globalComparison.userScore, max: 480, color: insight.globalComparison.userScore < 150 ? "#10b981" : insight.globalComparison.userScore < 300 ? "#f59e0b" : "#ef4444" },
                { label: "India Avg", value: insight.globalComparison.indiaAvgWeekly, max: 480, color: "#f97316" },
                { label: "EU Avg", value: insight.globalComparison.euAvgWeekly, max: 480, color: "#3b82f6" },
                { label: "World Avg", value: insight.globalComparison.worldAvgWeekly, max: 480, color: "#8b5cf6" },
                { label: "USA Avg", value: insight.globalComparison.usaAvgWeekly, max: 480, color: "#ef4444" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-bold">{item.label}</span>
                    <span className="text-slate-400">{item.value} kg CO₂/wk</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Projections */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Yearly Footprint", value: `${Number(insight.projections.yearlyEmissions).toLocaleString()} kg`, icon: BarChart3, color: "text-rose-400" },
                { label: "Trees to Offset", value: `${insight.projections.treesNeededToOffset} trees`, icon: Globe, color: "text-emerald-400" },
                { label: "If All Missions Done", value: `-${Number(insight.projections.potentialSavings).toLocaleString()} kg`, icon: TrendingDown, color: "text-teal-400" },
              ].map((proj, i) => (
                <div key={i} className="bg-slate-950 rounded-xl p-3 text-center space-y-1">
                  <proj.icon className={`w-5 h-5 ${proj.color} mx-auto`} />
                  <p className={`text-sm font-black font-heading ${proj.color}`}>{proj.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">{proj.label}</p>
                </div>
              ))}
            </div>

            {/* AI-Generated Insights */}
            <div className="space-y-2">
              {insight.insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">{ins}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Failed to load insights. Please try again.</p>
        )}
      </div>

      {/* Daily Eco Tips with Translation API */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 font-heading">Daily Eco Tips</h3>
              <p className="text-[10px] text-slate-400">Cloud Translation API · Multi-language</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex gap-1.5 flex-wrap">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setTipsLang(lang.code);
                  fetchTips(lang.code);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  tipsLang === lang.code
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {tipsLoading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-sm text-slate-400">Translating tips...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {tips.map((tip, i) => {
              const catColors: Record<string, string> = {
                diet: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                energy: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                transit: "text-sky-400 bg-sky-500/10 border-sky-500/20",
                general: "text-purple-400 bg-purple-500/10 border-purple-500/20",
              };
              const color = catColors[tip.category] || catColors.general;
              return (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-950/50 border border-slate-900 rounded-xl hover:border-slate-800 transition-all">
                  <span className="text-lg flex-shrink-0">{tip.icon || "🌱"}</span>
                  <div className="flex-grow">
                    <p className="text-xs text-slate-300 leading-relaxed">{tip.tip}</p>
                    <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
                      {tip.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
