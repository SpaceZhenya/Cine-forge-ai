"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const EXAMPLES = [
  "Триллер про астронавта, который понимает, что Земля исчезла",
  "Комедия о роботе-доставщике, который влюбился в кота",
  "Хоррор про старую больницу, где пациенты исчезают по ночам",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const film = await api.createFilm(prompt.trim());
      router.push(`/project/${film.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create film");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 text-center py-20">
      <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
        <span className="gradient-text">One Prompt.</span>
        <br />
        <span className="text-white">Full Movie.</span>
      </h1>
      <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
        Describe your film idea. CineForge AI generates script, scenes, music, and trailer.
      </p>

      <div className="max-w-xl mx-auto">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your film idea..."
          className="w-full h-28 p-5 rounded-2xl glass-card border-border text-white placeholder-muted resize-none focus:outline-none focus:border-primary text-lg"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        <button
          onClick={submit}
          disabled={loading || !prompt.trim()}
          className="mt-4 w-full py-4 rounded-2xl bg-primary text-white font-semibold text-lg hover:bg-primary/90 disabled:opacity-30 transition-all"
        >
          {loading ? "Creating..." : "Generate Film"}
        </button>
      </div>

      <div className="mt-10 flex flex-wrap gap-2 justify-center">
        {EXAMPLES.map((e, i) => (
          <button key={i} onClick={() => setPrompt(e)}
            className="px-4 py-2 rounded-full text-sm glass-card border-border text-muted hover:text-white transition-all">
            {e.length > 40 ? e.slice(0, 40) + "..." : e}
          </button>
        ))}
      </div>
    </div>
  );
}
