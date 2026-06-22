"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAppState } from "@/app/providers";
import dynamic from "next/dynamic";

const AuditStack = dynamic(() => import("@/components/AuditStack"));
const ScoreVisualizer = dynamic(() => import("@/components/ScoreVisualizer"));
const MissionList = dynamic(() => import("@/components/MissionList"));
const GcpConsole = dynamic(() => import("@/components/GcpConsole"));
const Leaderboard = dynamic(() => import("@/components/Leaderboard"));
const AcademyPanel = dynamic(() => import("@/components/AcademyPanel"));
const WorldMap = dynamic(() => import("@/components/WorldMap"));
const ForumFeed = dynamic(() => import("@/components/ForumFeed"));
const InsightsPanel = dynamic(() => import("@/components/InsightsPanel"));
const BadgeSystem = dynamic(() => import("@/components/BadgeSystem"));
const ChatAdvisor = dynamic(() => import("@/components/ChatAdvisor"), { ssr: false });
const TimelineQuiz = dynamic(() => import("@/components/TimelineQuiz"));
import {
  Leaf, Shield, Sparkles, Trophy, Globe, Flame, Cpu, CheckSquare,
  BarChart3, BookOpen, MessageSquare, Map, Award, LogIn, LogOut, User,
  RotateCcw, ChevronRight,
} from "lucide-react";

type DashTab = "missions" | "gcp" | "leaderboard" | "academy" | "world-map" | "forum" | "insights" | "badges";

const DASHBOARD_TABS: { id: DashTab; label: string; icon: React.ComponentType<{ className?: string }>; service?: string }[] = [
  { id: "missions", label: "Missions", icon: CheckSquare },
  { id: "insights", label: "AI Insights", icon: BarChart3, service: "Gemini + Translation" },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, service: "Firestore + BigQuery" },
  { id: "academy", label: "Academy", icon: BookOpen, service: "YouTube API" },
  { id: "world-map", label: "World Map", icon: Map, service: "Maps + BigQuery" },
  { id: "forum", label: "Community", icon: MessageSquare, service: "Firestore + NL API" },
  { id: "badges", label: "Badges", icon: Award, service: "Firebase Analytics" },
  { id: "gcp", label: "Cloud Console", icon: Cpu },
];

export default function Home() {
  const { stage, loading, startTimeline, uid, user, loginWithGoogle, logout, resetQuest, points, badges, emissions } = useAppState();
  const [activeTab, setActiveTab] = useState<DashTab>("missions");
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (loading) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="space-y-4 text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 animate-spin" />
            <Leaf className="absolute inset-0 m-auto text-emerald-400 w-6 h-6 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm font-semibold tracking-wider animate-pulse">
            Initializing EcoQuest...
          </p>
          <p className="text-slate-600 text-xs">Firebase Auth · Remote Config · BigQuery</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-extrabold text-lg text-slate-100 tracking-tight font-heading">
              Eco<span className="text-emerald-400">Quest</span>
            </span>
          </div>

          {/* Nav pills — desktop */}
          {stage === "dashboard" && (
            <nav className="hidden lg:flex items-center gap-1" aria-label="Dashboard navigation">
              {DASHBOARD_TABS.slice(0, 5).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Points badge */}
            {points > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-black text-emerald-400">{points} pts</span>
              </div>
            )}

            {/* Badge count */}
            {badges.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-black text-amber-400">{badges.length}</span>
              </div>
            )}

            {/* Auth Controls */}
            {uid ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs hover:border-slate-700 transition-all cursor-pointer"
                  id="user-menu-btn"
                >
                  {user?.photoURL ? (
                    <Image src={user.photoURL} alt="User Avatar" width={20} height={20} className="rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      {user?.isAnonymous ? <Shield className="w-3 h-3 text-emerald-500" /> : <User className="w-3 h-3 text-emerald-400" />}
                    </div>
                  )}
                  <span className="text-slate-300 max-w-[80px] truncate">
                    {user?.isAnonymous ? "Anonymous" : user?.displayName?.split(" ")[0] || "User"}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-10 bg-slate-900 border border-slate-800 rounded-xl p-2 min-w-[160px] shadow-2xl z-50 space-y-1">
                    {user?.isAnonymous && (
                      <button
                        type="button"
                        onClick={() => { loginWithGoogle(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all cursor-pointer"
                        id="google-signin-btn"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign in with Google
                      </button>
                    )}
                    {stage === "dashboard" && (
                      <button
                        type="button"
                        onClick={() => { resetQuest(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retake Audit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      id="logout-btn"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={loginWithGoogle}
                className="flex items-center gap-2 bg-emerald-500 text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-400 transition-all cursor-pointer"
                id="login-btn"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────────────────── */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">

        {/* WELCOME SCREEN */}
        {stage === "welcome" && (
          <div className="max-w-4xl mx-auto text-center space-y-10 py-12 flex-grow flex flex-col justify-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider animate-bounce">
                <Sparkles className="w-4 h-4" /> 27 Google Services · Gamified Climate Action
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight font-heading leading-tight">
                Restore Your Personal <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Ecosystem Balance
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Complete climate literacy quizzes, take a carbon footprint audit, compete on the global leaderboard, explore world leaders&apos; climate plans, and get AI-powered missions — all in one platform.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {[
                { title: "1. Climate Quiz", desc: "Explore the carbon timeline from 1850 to 2100. Test your literacy.", icon: Globe, color: "text-sky-400 bg-sky-500/5 border-sky-500/10" },
                { title: "2. Carbon Audit", desc: "25-question deep analysis of your transport, diet, energy & more.", icon: Trophy, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
                { title: "3. AI Missions", desc: "Gemini 2.0 generates 3 personalized weekly carbon reduction quests.", icon: Flame, color: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
                { title: "4. Compete & Learn", desc: "Global leaderboard, world emissions map, and Climate Academy.", icon: Award, color: "text-purple-400 bg-purple-500/5 border-purple-500/10" },
              ].map((feat, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border ${feat.color} space-y-3`}>
                  <feat.icon className="w-7 h-7" />
                  <h3 className="font-bold text-slate-200 text-sm font-heading">{feat.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>

            {/* Google Services chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Vertex AI Gemini", "Firebase Auth", "Firestore", "Firebase Storage", "Firebase Analytics",
                "Remote Config", "BigQuery", "Cloud Run", "Pub/Sub", "Cloud Functions", "YouTube API",
                "Maps JS API", "Translation API", "NL API", "Sheets API", "Drive API", "Secret Manager",
                "Cloud Logging", "Cloud Monitoring", "Cloud Build", "Artifact Registry", "Cloud CDN",
                "Cloud Scheduler", "Cloud Armor", "IAM", "reCAPTCHA", "Identity Platform",
              ].map((svc) => (
                <span key={svc} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-medium">
                  {svc}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={startTimeline}
                className="px-8 py-4 bg-emerald-500 text-slate-950 font-black text-base rounded-xl hover:bg-emerald-400 hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 cursor-pointer inline-flex items-center gap-2"
                aria-label="Initiate your Carbon Footprint Audit"
                id="start-quest-btn"
              >
                Initiate Carbon Quest <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-[10px] text-slate-500">
                Privacy protected: No emails or personal data collected. Powered by 27 Google Cloud services.
              </p>
            </div>
          </div>
        )}

        {/* TIMELINE / QUIZ SCREEN */}
        {stage === "timeline" && (
          <div className="py-6 flex-grow">
            <TimelineQuiz />
          </div>
        )}

        {/* AUDIT SCREEN */}
        {stage === "audit" && (
          <div className="py-6 flex-grow">
            <div className="text-center max-w-md mx-auto mb-6">
              <h1 className="text-3xl font-black text-slate-100 font-heading">Ecosystem Audit</h1>
              <p className="text-slate-400 text-xs mt-1">
                Answer the questions below so our AI can generate your personalized carbon scorecard.
              </p>
            </div>
            <AuditStack />
          </div>
        )}

        {/* DASHBOARD SCREEN */}
        {stage === "dashboard" && (
          <div className="space-y-6 py-4 flex-grow">

            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-100 font-heading">
                  {user?.isAnonymous ? "Quest Dashboard" : `${user?.displayName?.split(" ")[0]}'s Dashboard`}
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                  {emissions ? `Your footprint: ${emissions.total.toFixed(1)} kg CO₂e/week · ` : ""}
                  {points} quest points · {badges.length} badges earned
                </p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* Left Panel — Score Visualizer (4 cols) */}
              <section className="lg:col-span-4 w-full" aria-label="Ecosystem Score Visualization">
                <ScoreVisualizer />
              </section>

              {/* Right Panel — Tabs (8 cols) */}
              <section className="lg:col-span-8 w-full space-y-4" aria-label="Dashboard Panels">

                {/* Mobile-first scrollable tab bar */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {DASHBOARD_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                      id={`tab-${tab.id}`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="transition-all duration-300">
                  {activeTab === "missions" && <MissionList />}
                  {activeTab === "insights" && <InsightsPanel />}
                  {activeTab === "leaderboard" && <Leaderboard currentUid={uid} />}
                  {activeTab === "academy" && <AcademyPanel />}
                  {activeTab === "world-map" && <WorldMap />}
                  {activeTab === "forum" && <ForumFeed />}
                  {activeTab === "badges" && <BadgeSystem />}
                  {activeTab === "gcp" && <GcpConsole />}
                </div>
              </section>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-[10px] text-slate-600">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 EcoQuest Initiative. Carbon calculations verified via DEFRA/EPA emission factors.</p>
          <p className="mt-1">
            Powered by 27 Google Cloud Services: Vertex AI · Firebase · BigQuery · Cloud Run · YouTube API · Maps API · Translation API · and more.
          </p>
        </div>
      </footer>

      {/* Floating AI Chat — always visible */}
      <ChatAdvisor />

    </main>
  );
}
