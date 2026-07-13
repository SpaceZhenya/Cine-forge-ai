"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useFilmStore } from "@/store/film";

const PIPELINE_STEPS = [
  { key: "producing", label: "AI Producer", desc: "Generating film idea" },
  { key: "screenwriting", label: "AI Screenwriter", desc: "Writing screenplay" },
  { key: "directing", label: "AI Director", desc: "Breaking down scenes" },
  { key: "storyboarding", label: "AI Storyboard", desc: "Creating storyboards" },
  { key: "camera", label: "AI Camera", desc: "Planning camera movement" },
  { key: "acting", label: "AI Actor", desc: "Defining character emotions" },
  { key: "voicing", label: "AI Voice", desc: "Generating voiceovers" },
  { key: "composing", label: "AI Composer", desc: "Composing music" },
  { key: "editing", label: "AI Editor", desc: "Assembling final cut" },
  { key: "exporting", label: "Export", desc: "Exporting MP4 + Trailer + Poster" },
];

const PIPELINE_ORDER = PIPELINE_STEPS.map((s) => s.key);

export default function ProjectPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const [film, setFilm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rewritePrompt, setRewritePrompt] = useState("");
  const [collabPrompt, setCollabPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"script" | "video" | "collab">("script");
  const status = useFilmStore((s) => s.status);
  const setStatus = useFilmStore((s) => s.setStatus);

  const loadFilm = useCallback(async () => {
    try {
      const data = await api.getFilm(id);
      setFilm(data);
      setStatus(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, setStatus]);

  useEffect(() => {
    loadFilm();
    const interval = setInterval(loadFilm, 3000);
    return () => clearInterval(interval);
  }, [loadFilm]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.generateFilm(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRewrite = async () => {
    if (!rewritePrompt.trim()) return;
    try {
      await api.rewriteFilm(id, rewritePrompt.trim());
      setRewritePrompt("");
      await loadFilm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCollab = async () => {
    if (!collabPrompt.trim()) return;
    try {
      await api.collaborate(id, "user_" + Math.random().toString(36).slice(2, 8), collabPrompt.trim());
      setCollabPrompt("");
      await loadFilm();
    } catch (err) {
      console.error(err);
    }
  };

  const currentStepIndex = status ? PIPELINE_ORDER.indexOf(status) : -1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!film) {
    return (
      <div className="text-center py-24">
        <p className="text-muted text-xl">Film not found</p>
        <a href="/" className="text-primary hover:underline mt-4 inline-block">Create new</a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display">{film.title || "Untitled"}</h1>
        <p className="text-muted mt-2">{film.prompt}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className={`text-xs px-3 py-1 rounded-full ${film.status === "completed" ? "bg-secondary/20 text-secondary" : film.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary"}`}>
            {film.status}
          </span>
          {film.status !== "completed" && film.status !== "failed" && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-30"
            >
              {generating ? "Generating..." : "▶ Generate Film"}
            </button>
          )}
        </div>
      </header>

      {!(film.status === "completed" || film.status === "failed") && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Pipeline Progress</h2>
          <div className="grid gap-2">
            {PIPELINE_STEPS.map((step, i) => {
              const isDone = currentStepIndex > i;
              const isActive = currentStepIndex === i;
              return (
                <div
                  key={step.key}
                  className={`pipeline-step ${isDone ? "done" : isActive ? "active" : "pending"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDone ? "bg-secondary/20 text-secondary" : isActive ? "bg-primary/20 text-primary animate-pulse" : "bg-border text-muted"}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div>
                    <div className={`font-medium ${isActive ? "text-white" : isDone ? "text-secondary" : "text-muted"}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-muted">{step.desc}</div>
                  </div>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-8">
        <div className="flex gap-4 border-b border-border mb-6">
          {(["script", "video", "collab"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"}`}
            >
              {tab === "collab" ? "Co-Author" : tab}
            </button>
          ))}
        </div>

        {activeTab === "script" && film.full_script && (
          <div className="glass-card border-border rounded-2xl p-6">
            <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-gray-300">
              {film.full_script}
            </pre>
          </div>
        )}

        {activeTab === "video" && (
          <div className="space-y-6">
            {film.video_url && (
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">Full Film</h3>
                <video controls className="w-full rounded-2xl" src={film.video_url} />
              </div>
            )}
            {film.trailer_url && (
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">Trailer</h3>
                <video controls className="w-full max-w-lg rounded-xl" src={film.trailer_url} />
              </div>
            )}
            {film.cover_image_url && (
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">Poster</h3>
                <img src={film.cover_image_url} alt="Poster" className="w-64 rounded-xl" />
              </div>
            )}
          </div>
        )}

        {activeTab === "collab" && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted mb-2 block">Rewrite Instruction</label>
              <div className="flex gap-2">
                <input
                  value={rewritePrompt}
                  onChange={(e) => setRewritePrompt(e.target.value)}
                  placeholder="e.g. Make the protagonist a villain..."
                  className="flex-1 p-3 rounded-xl glass-card border-border text-white placeholder-muted focus:outline-none focus:border-primary"
                />
                <button onClick={handleRewrite} className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90">
                  Rewrite
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted mb-2 block">Co-Author Suggestion</label>
              <div className="flex gap-2">
                <input
                  value={collabPrompt}
                  onChange={(e) => setCollabPrompt(e.target.value)}
                  placeholder="e.g. Add a dragon..."
                  className="flex-1 p-3 rounded-xl glass-card border-border text-white placeholder-muted focus:outline-none focus:border-primary"
                />
                <button onClick={handleCollab} className="px-6 py-3 rounded-xl bg-secondary text-black font-medium hover:bg-secondary/90">
                  Suggest
                </button>
              </div>
            </div>
            {film.co_authors && film.co_authors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted mb-2">Suggestions</h3>
                <div className="space-y-2">
                  {film.co_authors.map((c: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl glass-card border-border text-sm">
                      <span className="text-muted">{c.user_id}:</span> {c.suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
