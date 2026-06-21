"use client";

import React, { useState } from "react";
import { useAppState } from "@/app/providers";
import { CheckSquare, Square, Award, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { Mission } from "@/app/api/gemini/route";

export default function MissionList() {
  const { missions, toggleMission, completedMissionIds, points } = useAppState();
  const [hoveredMissionId, setHoveredMissionId] = useState<string | null>(null);

  if (missions.length === 0) {
    return (
      <div 
        className="glass rounded-2xl p-8 text-center border border-dashed border-slate-800 space-y-4"
        role="status"
      >
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <div>
          <h3 className="font-bold text-slate-200 text-lg font-heading">No Active Missions</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Please complete the Carbon Footprint Audit to trigger your personalized weekly quest recommendations.
          </p>
        </div>
      </div>
    );
  }

  const completedCount = completedMissionIds.length;
  const totalCount = missions.length;
  const isQuestComplete = completedCount === totalCount;

  // Helpers to select styling based on category
  const categoryConfigs = {
    transit: {
      color: "text-sky-400 border-sky-500/20 bg-sky-500/5",
      badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    diet: {
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    energy: {
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  };

  return (
    <div className="space-y-6">
      
      {/* Gamified Header & Points Tracker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-heading">
            <Sparkles className="text-emerald-400 w-5 h-5" /> Weekly Quest Active
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Complete the 3 actions below to restore your Personal Ecosystem balance.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-xl">
          <Award className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score Multiplier</span>
            <span className="font-bold text-slate-100 text-sm font-heading">{points} Quest Points</span>
          </div>
        </div>
      </div>

      {/* Quest Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Quest Progress</span>
          <span>{completedCount} of {totalCount} Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist Cards */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Weekly Carbon Reduction Missions</legend>
        
        {missions.map((mission) => {
          const isCompleted = completedMissionIds.includes(mission.id);
          const isHovered = hoveredMissionId === mission.id;
          const config = categoryConfigs[mission.category || "diet"];

          return (
            <label
              key={mission.id}
              className={`block p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                isCompleted 
                  ? "bg-slate-900/20 border-emerald-500/20 opacity-70" 
                  : isHovered 
                    ? "bg-slate-900/60 border-slate-700 shadow-lg shadow-emerald-500/[0.01]" 
                    : "bg-slate-900/40 border-slate-800"
              }`}
              onMouseEnter={() => setHoveredMissionId(mission.id)}
              onMouseLeave={() => setHoveredMissionId(null)}
            >
              {/* Keyboard accessible toggle input */}
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggleMission(mission.id)}
                className="sr-only"
                aria-label={`Toggle mission: ${mission.task}`}
              />

              <div className="flex items-start gap-4">
                {/* Visual Checkbox */}
                <div 
                  className={`mt-1 flex-shrink-0 transition-transform ${isHovered && !isCompleted ? "scale-110" : ""}`}
                  role="presentation"
                >
                  {isCompleted ? (
                    <CheckSquare className="w-6 h-6 text-emerald-400 fill-emerald-500/10" />
                  ) : (
                    <Square className="w-6 h-6 text-slate-500 hover:text-slate-400" />
                  )}
                </div>

                {/* Mission Details */}
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${config.badge}`}>
                      {mission.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Award className="w-3 h-3" /> +{mission.points} Pts
                    </span>
                  </div>

                  <div>
                    <span className={`text-sm sm:text-base font-semibold leading-relaxed block ${
                      isCompleted 
                        ? "text-slate-500 line-through decoration-emerald-500/40" 
                        : "text-slate-100"
                    }`}>
                      {mission.task}
                    </span>
                    <p className={`text-xs mt-1 leading-relaxed ${isCompleted ? "text-slate-600" : "text-slate-400"}`}>
                      {mission.rationale}
                    </p>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </fieldset>

      {/* Quest Completion Celebration Card */}
      {isQuestComplete && (
        <div 
          className="glass-emerald rounded-2xl p-6 text-center space-y-3 animate-pulse border border-emerald-500/35"
          style={{ animationDuration: "3s" }}
          role="status"
        >
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-300 font-heading">Ecosystem Balance Restored!</h4>
            <p className="text-emerald-400/80 text-xs mt-1 max-w-sm mx-auto">
              Outstanding! You have accomplished all weekly carbon reduction challenges and offset your impact. Come back next week to continue your quest.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
