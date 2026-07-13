"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useFilmStore } from "@/store/film";

const PROMPT_EXAMPLES = [
  "Триллер про астронавта, который понимает, что Земля исчезла",
  "Комедия о роботе-доставщике, который влюбился в кота",
  "Хоррор про старую больницу, где пациенты исчезают по ночам",
  "Фэнтези про девочку, которая нашла портал в мир из книг",
  "Научная фантастика: первый контакт с внеземной жизнью в Марианской впадине",
];

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setFilm = useFilmStore((s) => s.setFilm);

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const film = await api.createFilm(prompt.trim());
      if (!film?.id) {
        throw new Error("Server returned empty film id");
      }
      setFilm(film.id);
      toast.success("Film project created! Redirecting...");
      router.push(`/project/${film.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to create film: ${msg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <section className="text-center py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
          <span className="gradient-text">One Prompt.</span>
          <br />
          <span className="text-white">Full Movie.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10">
          CineForge AI transforms your ideas into complete films — script, visuals, music, voice, and trailer.
        </p>

        <div className="relative max-w-2xl mx-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your film idea..."
            className="w-full h-28 p-5 rounded-2xl glass-card border-border text-white placeholder-muted resize-none focus:outline-none focus:border-primary transition-all text-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="mt-4 w-full py-4 rounded-2xl bg-primary text-white font-semibold text-lg hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed animate-glow"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating your film...
              </span>
            ) : (
              "Generate Film"
            )}
          </button>
        </div>

        <div className="mt-10">
          <p className="text-sm text-muted mb-3">Try an example:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {PROMPT_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex)}
                className="px-4 py-2 rounded-full text-sm glass-card border-border text-muted hover:text-white hover:border-primary/50 transition-all"
              >
                {ex.length > 40 ? ex.slice(0, 40) + "..." : ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 py-12">
        {[
          { title: "🎬 Full Pipeline", desc: "Script → Storyboard → Video → Music → Voice — all automated" },
          { title: "🔄 Infinite Movie", desc: "Film that never ends. AI continues the story after every finale" },
          { title: "👥 Co-Authoring", desc: "Multiple users shape the story in real-time. AI merges ideas" },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-2xl glass-card border-border">
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-muted text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
