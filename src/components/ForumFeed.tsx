"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/app/providers";
import { Heart, Send, MessageSquare, Flame, Zap, Leaf, Loader2, AlertCircle, ThumbsUp, Globe } from "lucide-react";
import { addForumPost, getForumPosts, likeForumPost, trackEvent } from "@/lib/firebase";

const CATEGORIES = ["general", "transit", "diet", "energy", "tips"];
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  general: Globe,
  transit: Zap,
  diet: Leaf,
  energy: Flame,
  tips: MessageSquare,
};
const CATEGORY_COLORS: Record<string, string> = {
  general: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  transit: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  diet: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  energy: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  tips: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

function timeAgo(seconds: number) {
  const diff = Date.now() / 1000 - seconds;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ForumFeed() {
  const { uid } = useAppState();
  const [posts, setPosts] = useState<Array<{ id: string; displayName?: string; content: string; category: string; likes: number; createdAt?: { seconds: number } }>>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [filterCategory, setFilterCategory] = useState("all");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const data = await getForumPosts(25);
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    if (!content.trim() || content.length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }
    if (content.length > 280) {
      setError("Keep it under 280 characters.");
      return;
    }

    setPosting(true);
    setError(null);

    try {
      // Sentiment check via NLP API
      const sentimentRes = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sentiment", data: { text: content } }),
      });
      const sentimentData = await sentimentRes.json();

      if (!sentimentData.approved) {
        setError("Your message was flagged by our AI moderation system. Please keep posts eco-positive!");
        setPosting(false);
        return;
      }

      await addForumPost({
        uid: uid || "anon",
        displayName: "EcoWarrior_" + (uid?.substring(0, 6) || "anon"),
        content: content.trim(),
        category: selectedCategory,
      });

      trackEvent("forum_post_created", { category: selectedCategory });
      setContent("");
      setCharCount(0);
      await fetchPosts();
    } catch {
      setError("Failed to post. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId: string) {
    if (likedIds.has(postId)) return;
    await likeForumPost(postId);
    setLikedIds((prev) => new Set([...prev, postId]));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );
    trackEvent("forum_post_liked");
  }

  const filteredPosts = filterCategory === "all"
    ? posts
    : posts.filter((p) => p.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-black text-slate-100 font-heading text-xl">Eco Community</h2>
            <p className="text-xs text-slate-400">Firestore · AI-moderated with Cloud NL API</p>
          </div>
        </div>
        <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
          {posts.length} posts
        </span>
      </div>

      {/* Compose Post */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-300">Share your eco story</h3>

        {/* Category Selector */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat] || Globe;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? CATEGORY_COLORS[cat]
                    : "border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                <CatIcon className="w-3 h-3" />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setCharCount(e.target.value.length);
              setError(null);
            }}
            placeholder="Share a tip, success story, or question about reducing your carbon footprint..."
            rows={3}
            maxLength={280}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 transition-all resize-none"
            id="forum-post-input"
          />
          <span className={`absolute bottom-3 right-3 text-[10px] font-bold ${charCount > 250 ? "text-rose-400" : "text-slate-600"}`}>
            {charCount}/280
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-[10px] text-slate-600">AI-moderated by Cloud Natural Language API</p>
          <button
            type="button"
            onClick={handlePost}
            disabled={posting || !content.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-emerald-400 transition-all cursor-pointer"
            id="forum-post-submit"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              filterCategory === cat
                ? "bg-emerald-500 text-slate-950 border-emerald-500"
                : "border-slate-800 text-slate-400 bg-slate-900 hover:text-slate-200"
            }`}
          >
            {cat === "all" ? "🌍 All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const CatIcon = CATEGORY_ICONS[post.category] || Globe;
            const catColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general;
            const isLiked = likedIds.has(post.id);

            return (
              <div
                key={post.id}
                className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-black text-emerald-400 font-heading flex-shrink-0">
                      {post.displayName?.[0]?.toUpperCase() || "E"}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-slate-200">{post.displayName}</span>
                      <span className="text-[10px] text-slate-500 ml-2">
                        {post.createdAt?.seconds ? timeAgo(post.createdAt.seconds) : "just now"}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${catColor}`}>
                    <CatIcon className="w-2.5 h-2.5" />
                    {post.category}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{post.content}</p>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      isLiked ? "text-rose-400" : "text-slate-500 hover:text-rose-400"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-400" : ""}`} />
                    {post.likes || 0}
                  </button>
                  <span className="text-xs text-slate-600">·</span>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-400 transition-all cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
