"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

const STEPS = [
  { key: "producing", label: "AI Producer", desc: "Generating idea" },
  { key: "screenwriting", label: "AI Screenwriter", desc: "Writing script" },
  { key: "directing", label: "AI Director", desc: "Breaking down scenes" },
  { key: "storyboarding", label: "AI Storyboard", desc: "Creating frames" },
  { key: "camera", label: "AI Camera", desc: "Planning shots" },
  { key: "acting", label: "AI Actor", desc: "Character emotions" },
  { key: "voicing", label: "AI Voice", desc: "Voice generation" },
  { key: "composing", label: "AI Composer", desc: "Music composition" },
  { key: "editing", label: "AI Editor", desc: "Final assembly" },
  { key: "exporting", label: "Export", desc: "MP4 + Trailer + Poster" },
];

const ORDER = STEPS.map((s) => s.key);

export default function Project() {
  const { id } = useParams() as { id: string };
  const [film, setFilm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [tab, setTab] = useState<"script" | "video" | "collab">("script");
  const [rewrite, setRewrite] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.getFilm(id);
      setFilm(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading film");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); const i = setInterval(load, 4000); return () => clearInterval(i); }, [load]);

  const generate = async () => {
    setGenLoading(true);
    try {
      await api.generateFilm(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!rewrite.trim()) return;
    try {
      const res = await api.rewriteFilm(id, rewrite.trim());
      setRewrite("");
      window.location.href = `/project/${res.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rewrite failed");
    }
  };

  const handleCollab = async () => {
    if (!suggestion.trim()) return;
    try {
      await api.collaborate(id, "user_" + Math.random().toString(36).slice(2, 8), suggestion.trim());
      setSuggestion("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add suggestion");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (error && !film) return (
    <div className="text-center py-24 max-w-lg mx-auto px-6">
      <p className="text-red-400 text-xl mb-2">Film not found</p>
      <p className="text-muted text-sm mb-6">{error}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={load} className="px-6 py-3 rounded-xl bg-primary text-white font-medium">Retry</button>
        <a href="/" className="px-6 py-3 rounded-xl glass-card border-border text-muted hover:text-white">Create new</a>
      </div>
    </div>
  );

  if (!film) return null;

  const stepIndex = ORDER.indexOf(film.status || "");

  return (
    <div className="max-w-6xl mx-auto px-6">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{film.title || "Untitled"}</h1>
        <p className="text-muted mt-1">{film.prompt}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className={`text-xs px-3 py-1 rounded-full ${
            film.status === "completed" ? "bg-secondary/20 text-secondary"
            : film.status === "failed" ? "bg-red-500/20 text-red-400"
            : "bg-primary/20 text-primary"
          }`}>{film.status}</span>
          {film.status !== "completed" && (
            <button onClick={generate} disabled={genLoading}
              className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-30">
              {genLoading ? "Generating..." : "▶ Generate"}
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </header>

      {film.status !== "completed" && film.status !== "pending" && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Pipeline</h2>
          <div className="grid gap-2">
            {STEPS.map((s, i) => {
              const done = stepIndex > i;
              const active = stepIndex === i;
              return (
                <div key={s.key}
                  className={`flex items-center gap-3 p-4 rounded-xl glass-card transition-all ${
                    done ? "border-secondary/30" : active ? "border-primary shadow-lg shadow-primary/20" : "opacity-40"
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    done ? "bg-secondary/20 text-secondary" : active ? "bg-primary/20 text-primary" : "bg-border text-muted"
                  }`}>{done ? "✓" : i + 1}</div>
                  <div>
                    <div className={`font-medium ${active ? "text-white" : done ? "text-secondary" : "text-muted"}`}>{s.label}</div>
                    <div className="text-xs text-muted">{s.desc}</div>
                  </div>
                  {active && <div className="ml-auto w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex gap-4 border-b border-border mb-6">
        {(["script", "video", "collab"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize transition-colors ${
              tab === t ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"
            }`}>{t === "collab" ? "Co-Author" : t}</button>
        ))}
      </div>

      {tab === "script" && film.full_script && (
        <div className="glass-card border-border rounded-2xl p-6">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans">{film.full_script}</pre>
        </div>
      )}

      {tab === "video" && (
        <div className="space-y-6">
          {film.video_url && <video controls className="w-full rounded-2xl" src={film.video_url} />}
          {film.trailer_url && <video controls className="w-full max-w-lg rounded-xl" src={film.trailer_url} />}
          {film.cover_image_url && <img src={film.cover_image_url} alt="Poster" className="w-64 rounded-xl" />}
          {!film.video_url && !film.trailer_url && <p className="text-muted">Video will appear after generation.</p>}
        </div>
      )}

      {tab === "collab" && (
        <div className="space-y-6 max-w-xl">
          <div>
            <label className="text-sm font-medium text-muted mb-1 block">Rewrite Instruction</label>
            <div className="flex gap-2">
              <input value={rewrite} onChange={(e) => setRewrite(e.target.value)}
                placeholder='e.g. "Make protagonist a villain"'
                className="flex-1 p-3 rounded-xl glass-card border-border text-white placeholder-muted focus:outline-none focus:border-primary" />
              <button onClick={handleRewrite} className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90">Rewrite</button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted mb-1 block">Co-Author Suggestion</label>
            <div className="flex gap-2">
              <input value={suggestion} onChange={(e) => setSuggestion(e.target.value)}
                placeholder='e.g. "Add a dragon"'
                className="flex-1 p-3 rounded-xl glass-card border-border text-white placeholder-muted focus:outline-none focus:border-primary" />
              <button onClick={handleCollab} className="px-6 py-3 rounded-xl bg-secondary text-black font-medium hover:bg-secondary/90">Suggest</button>
            </div>
          </div>
          {film.co_authors && JSON.parse(film.co_authors || "[]").length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">Suggestions</h3>
              <div className="space-y-2">
                {JSON.parse(film.co_authors || "[]").map((c: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl glass-card border-border text-sm">
                    <span className="text-muted">{c.user_id}:</span> {c.suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
