import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import type { Analytics } from "firebase/analytics";
import type { RemoteConfig } from "firebase/remote-config";

// Web App's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if variables are mock or valid
const isMock =
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey === "mock_firebase_key" ||
  firebaseConfig.apiKey.trim() === "";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let remoteConfig: RemoteConfig | null = null;

if (!isMock) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Analytics (browser only)
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app as FirebaseApp);
        }
      });

      // Remote Config
      try {
        remoteConfig = getRemoteConfig(app);
        remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
        remoteConfig.defaultConfig = {
          enable_forum: "true",
          enable_leaderboard: "true",
          enable_eco_avatar: "true",
          weekly_tip: "Reduce, Reuse, Recycle — every action counts!",
        };
      } catch {
        console.warn("Remote Config init failed");
      }
    }
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

export { analytics, remoteConfig };

// ─── SERVICE 1: Firebase Auth — Anonymous ───────────────────────────────────
export async function authenticateAnonymously(): Promise<string> {
  if (isMock || !auth) {
    console.warn("Using Mock Auth session.");
    let localUid = localStorage.getItem("ecoquest_mock_uid");
    if (!localUid) {
      localUid = "eq_mock_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("ecoquest_mock_uid", localUid);
    }
    return localUid;
  }

  try {
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  } catch (error) {
    console.error("Anonymous auth failed:", error);
    let localUid = localStorage.getItem("ecoquest_mock_uid");
    if (!localUid) {
      localUid = "eq_fallback_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("ecoquest_mock_uid", localUid);
    }
    return localUid;
  }
}

// ─── SERVICE 2: Firebase Auth — Google Sign-In (Identity Platform) ───────────
export async function signInWithGoogle(): Promise<{ uid: string; displayName: string; email: string; photoURL: string }> {
  if (isMock || !auth) {
    return {
      uid: "mock_google_" + Math.random().toString(36).substring(2, 8),
      displayName: "Eco Warrior",
      email: "eco@quest.app",
      photoURL: "",
    };
  }

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/drive.file");
  provider.addScope("https://www.googleapis.com/auth/spreadsheets");
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      uid: user.uid,
      displayName: user.displayName || "Eco Warrior",
      email: user.email || "",
      photoURL: user.photoURL || "",
    };
  } catch (error: unknown) {
    throw new Error("Google sign-in failed: " + (error instanceof Error ? error.message : String(error)));
  }
}

// ─── SERVICE 3: Firebase Auth — Sign Out ─────────────────────────────────────
export async function signOutUser(): Promise<void> {
  if (!isMock && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign-out error:", e);
    }
  }
  localStorage.removeItem("ecoquest_mock_uid");
}

// ─── SERVICE 4: Firestore — Save Carbon Footprint Score ──────────────────────
export async function saveFootprintScore(
  uid: string,
  scoreData: {
    breakdown: { transit: number; diet: number; energy: number; total: number };
    answers: Record<string, unknown>;
    timestamp: string;
    bonusPoints?: number;
    displayName?: string;
    country?: string;
  }
) {
  if (isMock || !db) {
    localStorage.setItem(`ecoquest_score_${uid}`, JSON.stringify(scoreData));
    return;
  }

  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(
      userDocRef,
      {
        score: scoreData.breakdown.total,
        breakdown: scoreData.breakdown,
        answers: scoreData.answers,
        updatedAt: scoreData.timestamp,
        bonusPoints: scoreData.bonusPoints || 0,
        displayName: scoreData.displayName || "Anonymous EcoWarrior",
        country: scoreData.country || "Global",
        totalPoints: (scoreData.bonusPoints || 0),
      },
      { merge: true }
    );

    // Also update the global leaderboard collection
    const leaderboardRef = doc(db, "leaderboard", uid);
    await setDoc(
      leaderboardRef,
      {
        uid,
        displayName: scoreData.displayName || "Anonymous EcoWarrior",
        score: scoreData.breakdown.total,
        totalPoints: scoreData.bonusPoints || 0,
        country: scoreData.country || "Global",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving to Firestore:", error);
    localStorage.setItem(`ecoquest_score_${uid}`, JSON.stringify(scoreData));
  }
}

// ─── SERVICE 5: Firestore — Save Missions ───────────────────────────────────
export async function saveUserMissions(uid: string, missions: Array<{ id: string; task: string; category: string; points: number; rationale: string; completed?: boolean }>) {
  if (isMock || !db) {
    localStorage.setItem(`ecoquest_missions_${uid}`, JSON.stringify(missions));
    return;
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const completedCount = missions.filter((m) => m.completed).length;
    const earnedPoints = missions
      .filter((m) => m.completed)
      .reduce((sum, m) => sum + (m.points || 0), 0);

    await setDoc(
      userDocRef,
      {
        missions,
        missionsUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Update leaderboard points
    if (earnedPoints > 0) {
      const leaderboardRef = doc(db, "leaderboard", uid);
      await setDoc(
        leaderboardRef,
        { totalPoints: earnedPoints, missionsCompleted: completedCount },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error saving missions:", error);
    localStorage.setItem(`ecoquest_missions_${uid}`, JSON.stringify(missions));
  }
}

// ─── SERVICE 6: Firestore — Get User Data ───────────────────────────────────
export async function getUserData(uid: string): Promise<{
  score?: number;
  breakdown?: { transit: number; diet: number; energy: number; total: number };
  answers?: Record<string, unknown>;
  missions?: Array<{ id: string; task: string; category: string; points: number; rationale: string; completed: boolean }>;
  bonusPoints?: number;
  displayName?: string;
  badges?: string[];
  country?: string;
} | null> {
  if (isMock || !db) {
    const scoreStr = localStorage.getItem(`ecoquest_score_${uid}`);
    const missionsStr = localStorage.getItem(`ecoquest_missions_${uid}`);
    if (!scoreStr && !missionsStr) return null;
    const scoreData = scoreStr ? JSON.parse(scoreStr) as { breakdown?: { transit: number; diet: number; energy: number; total: number }; answers?: Record<string, unknown>; bonusPoints?: number } : {};
    const missions = missionsStr ? JSON.parse(missionsStr) as Array<{ id: string; task: string; category: string; points: number; rationale: string; completed: boolean }> : [];
    return {
      score: scoreData.breakdown?.total,
      breakdown: scoreData.breakdown,
      answers: scoreData.answers,
      missions,
      bonusPoints: scoreData.bonusPoints || 0,
    };
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as { score?: number; breakdown?: { transit: number; diet: number; energy: number; total: number }; answers?: Record<string, unknown>; missions?: Array<{ id: string; task: string; category: string; points: number; rationale: string; completed: boolean }>; bonusPoints?: number; displayName?: string; badges?: string[]; country?: string };
    }
    return null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
}

// ─── SERVICE 7: Firestore — Global Leaderboard ──────────────────────────────
export async function getLeaderboard(limitCount = 50): Promise<Array<{ id: string; displayName: string; totalPoints: number; score: number; country: string; missionsCompleted: number; badge?: string }>> {
  if (isMock || !db) {
    // Return mock leaderboard data
    return generateMockLeaderboard();
  }

  try {
    const leaderboardRef = collection(db, "leaderboard");
    const q = query(leaderboardRef, orderBy("totalPoints", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const entries: Array<{ id: string; displayName: string; totalPoints: number; score: number; country: string; missionsCompleted: number; badge?: string }> = [];
    querySnapshot.forEach((docSnap) => {
      entries.push({ id: docSnap.id, ...docSnap.data() as { displayName: string; totalPoints: number; score: number; country: string; missionsCompleted: number; badge?: string } });
    });
    return entries.length > 0 ? entries : generateMockLeaderboard();
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return generateMockLeaderboard();
  }
}

function generateMockLeaderboard() {
  const names = [
    "GreenPanda_IN", "EcoWarrior_DE", "ClimateHero_JP", "SolarSage_BR",
    "WindWatcher_AU", "ForestFriend_CA", "OceanKeeper_UK", "LeafLover_FR",
    "BikeRider_NL", "VeganVictor_SE", "SunSeeker_ES", "RainHarvest_IN",
    "ZeroWaste_US", "PlantPower_NZ", "CleanAir_KR",
  ];
  const countries = ["India", "Germany", "Japan", "Brazil", "Australia", "Canada", "UK", "France", "Netherlands", "Sweden"];
  return names.map((name, i) => ({
    id: `mock_${i}`,
    displayName: name,
    totalPoints: Math.floor(Math.random() * 900) + 100 + (15 - i) * 50,
    score: Math.floor(Math.random() * 200) + 50,
    country: countries[i % countries.length],
    missionsCompleted: Math.floor(Math.random() * 20) + 3,
  })).sort((a, b) => b.totalPoints - a.totalPoints);
}

// ─── SERVICE 8: Firestore — Community Forum Posts ───────────────────────────
export async function getForumPosts(limitCount = 20): Promise<Array<{ id: string; displayName?: string; content: string; category: string; likes: number; createdAt?: { seconds: number } }>> {
  if (isMock || !db) return getMockForumPosts();

  try {
    const postsRef = collection(db, "forum");
    const q = query(postsRef, orderBy("createdAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    const posts: Array<{ id: string; displayName?: string; content: string; category: string; likes: number; createdAt?: { seconds: number } }> = [];
    snapshot.forEach((docSnap) => posts.push({ id: docSnap.id, ...docSnap.data() as { displayName?: string; content: string; category: string; likes: number; createdAt?: { seconds: number } } }));
    return posts.length > 0 ? posts : getMockForumPosts();
  } catch {
    return getMockForumPosts();
  }
}

export async function addForumPost(post: { uid: string; displayName: string; content: string; category: string; }): Promise<string> {
  if (isMock || !db) {
    return "mock_post_" + Date.now();
  }

  try {
    const postsRef = collection(db, "forum");
    const docRef = await addDoc(postsRef, {
      ...post,
      likes: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch {
    throw new Error("Failed to post");
  }
}

export async function likeForumPost(postId: string): Promise<void> {
  if (isMock || !db) return;
  try {
    const postRef = doc(db, "forum", postId);
    await updateDoc(postRef, { likes: increment(1) });
  } catch {
    console.error("Like failed");
  }
}

function getMockForumPosts() {
  return [
    { id: "1", displayName: "GreenPanda_IN", content: "I switched to cycling for my daily commute and saved 45kg CO2 this month! 🚴", category: "transit", likes: 42, createdAt: { seconds: Date.now() / 1000 - 3600 } },
    { id: "2", displayName: "EcoWarrior_DE", content: "Installed solar panels last year — my electricity bill dropped by 80% and I'm now carbon negative!", category: "energy", likes: 87, createdAt: { seconds: Date.now() / 1000 - 7200 } },
    { id: "3", displayName: "ClimateHero_JP", content: "Going plant-based for 30 days was easier than I thought. Net result: -120kg CO2e equivalent!", category: "diet", likes: 63, createdAt: { seconds: Date.now() / 1000 - 14400 } },
    { id: "4", displayName: "WindWatcher_AU", content: "The AI missions feature is incredible — it gave me super specific actions that actually fit my lifestyle.", category: "general", likes: 31, createdAt: { seconds: Date.now() / 1000 - 28800 } },
    { id: "5", displayName: "ForestFriend_CA", content: "Started a composting system at home. Food waste now becomes garden gold instead of landfill methane.", category: "diet", likes: 55, createdAt: { seconds: Date.now() / 1000 - 86400 } },
  ];
}

// ─── SERVICE 9: Firebase Storage — Upload Eco Avatar ────────────────────────
export async function uploadEcoAvatar(uid: string, imageBlob: Blob): Promise<string> {
  if (isMock || !storage) {
    return "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=200&fit=crop";
  }

  try {
    const storageRef = ref(storage, `avatars/${uid}/eco_planet.png`);
    await uploadBytes(storageRef, imageBlob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    return "";
  }
}

// ─── SERVICE 10: Firebase Analytics — Log Events ────────────────────────────
export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
    console.log(`[Analytics] ${eventName}`, params);
  } catch {
    // silently fail
  }
}

// ─── SERVICE 11: Firebase Remote Config — Feature Flags ─────────────────────
export async function getFeatureFlags(): Promise<Record<string, string>> {
  if (isMock || !remoteConfig) {
    return {
      enable_forum: "true",
      enable_leaderboard: "true",
      enable_eco_avatar: "true",
      weekly_tip: "Every small action creates a ripple of change 🌊",
    };
  }

  try {
    await fetchAndActivate(remoteConfig);
    return {
      enable_forum: getValue(remoteConfig, "enable_forum").asString(),
      enable_leaderboard: getValue(remoteConfig, "enable_leaderboard").asString(),
      enable_eco_avatar: getValue(remoteConfig, "enable_eco_avatar").asString(),
      weekly_tip: getValue(remoteConfig, "weekly_tip").asString(),
    };
  } catch {
    return {
      enable_forum: "true",
      enable_leaderboard: "true",
      enable_eco_avatar: "true",
      weekly_tip: "Every small action creates a ripple of change 🌊",
    };
  }
}

// ─── Badge Calculation Helper ─────────────────────────────────────────────────
export function calculateBadges(points: number, missionsCompleted: number): string[] {
  const badges: string[] = [];
  if (points >= 50) badges.push("seedling");
  if (points >= 150) badges.push("sapling");
  if (points >= 300) badges.push("tree");
  if (points >= 500) badges.push("forest");
  if (points >= 1000) badges.push("ecosystem");
  if (missionsCompleted >= 3) badges.push("first_quest");
  if (missionsCompleted >= 10) badges.push("eco_warrior");
  if (missionsCompleted >= 25) badges.push("climate_hero");
  return badges;
}
