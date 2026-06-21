"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AuditAnswers,
  EmissionBreakdown,
  calculateFootprint,
} from "@/utils/carbonCalc";
import {
  authenticateAnonymously,
  signInWithGoogle,
  signOutUser,
  saveFootprintScore,
  saveUserMissions,
  getUserData,
  getLeaderboard,
  trackEvent,
  getFeatureFlags,
  calculateBadges,
} from "@/lib/firebase";
import { Mission } from "@/app/api/gemini/route";

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  isAnonymous: boolean;
}

interface AppStateContext {
  uid: string | null;
  user: UserProfile | null;
  stage: "welcome" | "timeline" | "audit" | "dashboard";
  answers: AuditAnswers | null;
  emissions: EmissionBreakdown | null;
  missions: Mission[];
  completedMissionIds: string[];
  points: number;
  bonusPoints: number;
  badges: string[];
  loading: boolean;
  loadingMissions: boolean;
  error: string | null;
  featureFlags: Record<string, string>;
  setStage: (stage: "welcome" | "timeline" | "audit" | "dashboard") => void;
  startTimeline: () => void;
  startAudit: () => void;
  proceedToAudit: (pts: number) => void;
  submitAudit: (answers: AuditAnswers) => Promise<void>;
  toggleMission: (missionId: string) => Promise<void>;
  resetQuest: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppStateContext | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stage, setStage] = useState<"welcome" | "timeline" | "audit" | "dashboard">("welcome");
  const [answers, setAnswers] = useState<AuditAnswers | null>(null);
  const [emissions, setEmissions] = useState<EmissionBreakdown | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initUser() {
      try {
        // Load feature flags from Firebase Remote Config
        const flags = await getFeatureFlags();
        setFeatureFlags(flags);

        const userUid = await authenticateAnonymously();
        setUid(userUid);
        setUser({
          uid: userUid,
          displayName: "Anonymous EcoWarrior",
          email: "",
          photoURL: "",
          isAnonymous: true,
        });

        const userData = await getUserData(userUid);
        if (userData) {
          const savedBonus = (userData as any).bonusPoints || 0;
          setBonusPoints(savedBonus);
          if (userData.answers) {
            setAnswers(userData.answers);
            const computedBreakdown = calculateFootprint(userData.answers);
            setEmissions(computedBreakdown);
            setStage("dashboard");
          }
          if (userData.missions) {
            setMissions(userData.missions);
            const completed = userData.missions
              .filter((m: any) => m.completed)
              .map((m: any) => m.id);
            setCompletedMissionIds(completed);

            const totalPoints = userData.missions
              .filter((m: any) => m.completed)
              .reduce((sum: number, m: any) => sum + (m.points || 0), savedBonus);
            setPoints(totalPoints);

            const earnedBadges = calculateBadges(totalPoints, completed.length);
            setBadges(earnedBadges);
          } else if (savedBonus > 0) {
            setPoints(savedBonus);
          }
        }

        trackEvent("app_initialized", { uid: userUid });
      } catch (err) {
        console.error("Error initializing session:", err);
        setError("Failed to initialize user session.");
      } finally {
        setLoading(false);
      }
    }

    initUser();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const googleUser = await signInWithGoogle();
      setUid(googleUser.uid);
      setUser({
        uid: googleUser.uid,
        displayName: googleUser.displayName,
        email: googleUser.email,
        photoURL: googleUser.photoURL,
        isAnonymous: false,
      });
      trackEvent("google_login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const logout = async () => {
    await signOutUser();
    setUid(null);
    setUser(null);
    setStage("welcome");
    setAnswers(null);
    setEmissions(null);
    setMissions([]);
    setPoints(0);
    setBadges([]);
    trackEvent("user_logout");
  };

  const startTimeline = () => {
    setStage("timeline");
    setError(null);
    trackEvent("timeline_started");
  };

  const startAudit = () => {
    setStage("audit");
    setError(null);
  };

  const proceedToAudit = (pts: number) => {
    setBonusPoints(pts);
    setStage("audit");
    trackEvent("audit_started", { bonusPoints: pts });
  };

  const submitAudit = async (newAnswers: AuditAnswers) => {
    if (!uid) return;
    setLoadingMissions(true);
    setError(null);

    try {
      const breakdown = calculateFootprint(newAnswers);
      setAnswers(newAnswers);
      setEmissions(breakdown);

      const timestamp = new Date().toISOString();
      await saveFootprintScore(uid, {
        breakdown,
        answers: newAnswers,
        timestamp,
        bonusPoints,
        displayName: user?.displayName || "Anonymous EcoWarrior",
        country: "Global",
      });

      trackEvent("audit_submitted", {
        total_emissions: breakdown.total.toFixed(2),
        transit_mode: newAnswers.transitMode,
        diet_type: newAnswers.dietType,
      });

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transitEmissions: breakdown.transit,
          dietEmissions: breakdown.diet,
          energyEmissions: breakdown.energy,
          totalEmissions: breakdown.total,
          answers: newAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate missions from AI endpoint.");
      }

      const data = await response.json();
      const rawMissions: Mission[] = data.missions || [];

      const formattedMissions = rawMissions.map((m) => ({
        ...m,
        completed: false,
      }));

      setMissions(formattedMissions);
      setCompletedMissionIds([]);
      setPoints(bonusPoints);

      const earnedBadges = calculateBadges(bonusPoints, 0);
      setBadges(earnedBadges);

      await saveUserMissions(uid, formattedMissions);
      setStage("dashboard");
      trackEvent("missions_generated", { mission_count: formattedMissions.length });
    } catch (err: any) {
      console.error("Audit submission failed:", err);
      setError(err.message || "Failed to submit audit. Please try again.");
    } finally {
      setLoadingMissions(false);
    }
  };

  const toggleMission = async (missionId: string) => {
    if (!uid) return;

    const updatedMissions = missions.map((m) => {
      if (m.id === missionId) {
        return { ...m, completed: !(m as any).completed };
      }
      return m;
    });

    const completed = updatedMissions
      .filter((m: any) => m.completed)
      .map((m) => m.id);

    const totalPoints = updatedMissions
      .filter((m: any) => m.completed)
      .reduce((sum, m) => sum + m.points, bonusPoints);

    setMissions(updatedMissions);
    setCompletedMissionIds(completed);
    setPoints(totalPoints);

    const earnedBadges = calculateBadges(totalPoints, completed.length);
    setBadges(earnedBadges);

    trackEvent("mission_toggled", { mission_id: missionId, completed: completed.includes(missionId) });
    await saveUserMissions(uid, updatedMissions);
  };

  const resetQuest = () => {
    setAnswers(null);
    setEmissions(null);
    setMissions([]);
    setCompletedMissionIds([]);
    setPoints(0);
    setBonusPoints(0);
    setBadges([]);
    setStage("audit");
    trackEvent("quest_reset");
  };

  return (
    <AppContext.Provider
      value={{
        uid,
        user,
        stage,
        answers,
        emissions,
        missions,
        completedMissionIds,
        points,
        bonusPoints,
        badges,
        loading,
        loadingMissions,
        error,
        featureFlags,
        setStage,
        startTimeline,
        startAudit,
        proceedToAudit,
        submitAudit,
        toggleMission,
        resetQuest,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
