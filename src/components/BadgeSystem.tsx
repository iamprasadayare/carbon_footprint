"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/app/providers";
import { Leaf, Globe, Zap, TreeDeciduous, Award, Star, Crown } from "lucide-react";
import { calculateBadges } from "@/lib/firebase";

const BADGE_DATA: Record<string, {
  icon: React.ComponentType<any>;
  emoji: string;
  name: string;
  description: string;
  color: string;
  gradient: string;
  threshold: string;
}> = {
  seedling: {
    icon: Leaf,
    emoji: "🌱",
    name: "Seedling",
    description: "First steps on your eco journey. Every tree was once a seed.",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    gradient: "from-yellow-900/30 to-yellow-950/20",
    threshold: "50+ points",
  },
  sapling: {
    icon: Leaf,
    emoji: "🌿",
    name: "Sapling",
    description: "Growing stronger every day! Your habits are taking root.",
    color: "text-lime-400 border-lime-500/30 bg-lime-500/10",
    gradient: "from-lime-900/30 to-lime-950/20",
    threshold: "150+ points",
  },
  tree: {
    icon: TreeDeciduous,
    emoji: "🌲",
    name: "Tree Planter",
    description: "Standing tall! Your positive impact is now visible to others.",
    color: "text-green-400 border-green-500/30 bg-green-500/10",
    gradient: "from-green-900/30 to-green-950/20",
    threshold: "300+ points",
  },
  forest: {
    icon: Globe,
    emoji: "🌳",
    name: "Forest Keeper",
    description: "You're creating real change — an entire forest of impact!",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/10",
    gradient: "from-teal-900/30 to-teal-950/20",
    threshold: "500+ points",
  },
  ecosystem: {
    icon: Zap,
    emoji: "🌍",
    name: "Ecosystem Guardian",
    description: "Elite level. You're actively reshaping the planet's future.",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    gradient: "from-emerald-900/30 to-emerald-950/20",
    threshold: "1000+ points",
  },
  first_quest: {
    icon: Award,
    emoji: "⚡",
    name: "Quest Starter",
    description: "Completed your first full set of weekly missions!",
    color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    gradient: "from-sky-900/30 to-sky-950/20",
    threshold: "3 missions done",
  },
  eco_warrior: {
    icon: Star,
    emoji: "🌟",
    name: "Eco Warrior",
    description: "10 missions completed! You're a true environmental champion.",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    gradient: "from-amber-900/30 to-amber-950/20",
    threshold: "10 missions done",
  },
  climate_hero: {
    icon: Crown,
    emoji: "👑",
    name: "Climate Hero",
    description: "25+ missions! You've earned legendary status in EcoQuest.",
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    gradient: "from-purple-900/30 to-purple-950/20",
    threshold: "25 missions done",
  },
};

export default function BadgeSystem() {
  const { points, missions } = useAppState();
  const missionsCompleted = missions.filter((m: any) => m.completed).length;
  const earnedBadges = calculateBadges(points, missionsCompleted);

  const allBadgeIds = Object.keys(BADGE_DATA);
  const nextBadge = allBadgeIds.find((b) => !earnedBadges.includes(b));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 font-heading">Achievement Badges</h3>
            <p className="text-[10px] text-slate-400">Firebase Analytics · Remote Config</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-emerald-400 font-heading">{earnedBadges.length}</span>
          <span className="text-slate-500 text-sm">/{allBadgeIds.length} earned</span>
        </div>
      </div>

      {/* Progress to next badge */}
      {nextBadge && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="text-3xl">{BADGE_DATA[nextBadge].emoji}</div>
          <div className="flex-grow">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Next Achievement</p>
            <p className="text-sm font-bold text-slate-200">{BADGE_DATA[nextBadge].name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{BADGE_DATA[nextBadge].threshold}</p>
          </div>
          <div className="text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {allBadgeIds.map((badgeId) => {
          const badge = BADGE_DATA[badgeId];
          const isEarned = earnedBadges.includes(badgeId);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={badgeId}
              className={`relative p-4 rounded-2xl border flex flex-col items-center text-center space-y-2 transition-all ${
                isEarned
                  ? `bg-gradient-to-br ${badge.gradient} ${badge.color} shadow-lg`
                  : "border-slate-900 bg-slate-950/50 opacity-40 grayscale"
              }`}
            >
              {isEarned && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-slate-950 font-black">✓</span>
                </div>
              )}
              <span className="text-3xl" role="img" aria-label={badge.name}>{badge.emoji}</span>
              <div>
                <p className={`text-xs font-black font-heading ${isEarned ? "" : "text-slate-600"}`}>
                  {badge.name}
                </p>
                <p className={`text-[9px] mt-0.5 leading-tight ${isEarned ? "text-slate-400" : "text-slate-700"}`}>
                  {badge.threshold}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Quest Points", value: points.toLocaleString(), color: "text-emerald-400" },
          { label: "Missions Done", value: missionsCompleted, color: "text-amber-400" },
          { label: "Badges Earned", value: earnedBadges.length, color: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl py-3 px-2">
            <p className={`text-xl font-black font-heading ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
