"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Globe, TrendingUp, Users, Leaf, Star, ChevronUp } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  displayName: string;
  totalPoints: number;
  score: number;
  country: string;
  missionsCompleted: number;
  badge: string;
}

interface PlatformStats {
  totalUsers: number;
  totalMissionsCompleted: number;
  totalCO2Saved: number;
  weeklyNewUsers: number;
}

const BADGE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  ecosystem: { label: "Ecosystem Guardian", color: "text-emerald-300 bg-emerald-500/20 border-emerald-500/30", icon: "🌳" },
  forest: { label: "Forest Keeper", color: "text-teal-300 bg-teal-500/20 border-teal-500/30", icon: "🌲" },
  tree: { label: "Tree Planter", color: "text-green-300 bg-green-500/20 border-green-500/30", icon: "🌱" },
  sapling: { label: "Sapling", color: "text-lime-300 bg-lime-500/20 border-lime-500/30", icon: "🌿" },
  seedling: { label: "Seedling", color: "text-yellow-300 bg-yellow-500/20 border-yellow-500/30", icon: "🌾" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳", Germany: "🇩🇪", Japan: "🇯🇵", Brazil: "🇧🇷",
  Australia: "🇦🇺", Canada: "🇨🇦", UK: "🇬🇧", France: "🇫🇷",
  Netherlands: "🇳🇱", Sweden: "🇸🇪", Spain: "🇪🇸", USA: "🇺🇸",
  "New Zealand": "🇳🇿", "South Korea": "🇰🇷", Global: "🌍",
};

export default function Leaderboard({ currentUid }: { currentUid?: string | null }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lbRes, statsRes] = await Promise.all([
          fetch("/api/leaderboard?type=leaderboard"),
          fetch("/api/leaderboard?type=stats"),
        ]);
        const lbData = await lbRes.json();
        const statsData = await statsRes.json();
        setLeaderboard(lbData.leaderboard || []);
        setStats(statsData);
      } catch {
        // Use mock data
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBoard = filter === "all"
    ? leaderboard
    : leaderboard.filter((e) => e.country.toLowerCase().includes(filter.toLowerCase()));

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-slate-500 font-bold text-sm w-5 text-center">#{rank}</span>;
  };

  return (
    <div className="space-y-6">

      {/* Platform Stats Banner */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "EcoWarriors", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-emerald-400" },
            { label: "Missions Done", value: stats.totalMissionsCompleted.toLocaleString(), icon: Star, color: "text-amber-400" },
            { label: "CO₂ Saved (kg)", value: stats.totalCO2Saved.toLocaleString(), icon: Leaf, color: "text-teal-400" },
            { label: "New This Week", value: `+${stats.weeklyNewUsers.toLocaleString()}`, icon: TrendingUp, color: "text-sky-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div className="text-xl font-black text-slate-100 font-heading">{stat.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-black text-slate-100 font-heading">Global Leaderboard</h2>
              <p className="text-xs text-slate-400">Firebase + BigQuery · Resets weekly</p>
            </div>
          </div>

          {/* Country Filter */}
          <div className="flex gap-2 flex-wrap">
            {["all", "India", "Germany", "USA", "Japan"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === f
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {COUNTRY_FLAGS[f] || "🌍"} {f === "all" ? "Global" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-slate-900">
            {filteredBoard.map((entry, idx) => {
              const rank = idx + 1;
              const badgeInfo = BADGE_CONFIG[entry.badge] || BADGE_CONFIG.seedling;
              const isTop3 = rank <= 3;
              const isCurrentUser = entry.id === currentUid;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 px-5 py-4 transition-all ${
                    isCurrentUser
                      ? "bg-emerald-500/10 border-l-2 border-emerald-400"
                      : isTop3
                      ? "bg-slate-950/30"
                      : "hover:bg-slate-900/20"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(rank)}
                  </div>

                  {/* Badge Icon */}
                  <div className="text-2xl flex-shrink-0" title={badgeInfo.label}>
                    {badgeInfo.icon}
                  </div>

                  {/* User Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm font-heading ${isCurrentUser ? "text-emerald-300" : isTop3 ? "text-slate-100" : "text-slate-200"}`}>
                        {entry.displayName}
                        {isCurrentUser && <span className="text-[10px] text-emerald-400 ml-1">(You)</span>}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeInfo.color}`}>
                        {badgeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-500">
                        {COUNTRY_FLAGS[entry.country] || "🌍"} {entry.country}
                      </span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-slate-500">{entry.missionsCompleted} missions</span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-rose-400">{entry.score} kg CO₂/wk</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-lg text-emerald-400 font-heading">{entry.totalPoints.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            {leaderboard.length} global participants
          </span>
          <span className="flex items-center gap-1">
            <ChevronUp className="w-3.5 h-3.5 text-emerald-500" />
            Complete missions to climb the ranks
          </span>
        </div>
      </div>
    </div>
  );
}
