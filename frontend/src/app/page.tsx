"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const EXAMPLES = [
  { text: "Триллер про астронавта, который понимает, что Земля исчезла", genre: "Sci-Fi Thriller" },
  { text: "Комедия о роботе-доставщике, который влюбился в кота", genre: "Comedy" },
  { text: "Хоррор про старую больницу, где пациенты исчезают по ночам", genre: "Horror" },
  { text: "Фэнтези про девочку, которая нашла портал в мир из книг", genre: "Fantasy" },
  { text: "Экшн про агента, который должен остановить ядерную угрозу", genre: "Action" },
  { text: "Романтика про двух незнакомцев в застрявшем лифте", genre: "Romance" },
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
      if (!film?.id) throw new Error("No film ID returned");
      router.push(`/project/${film.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create film");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <section className="text-center py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
          <span className="gradient-text">One Line.</span>
          <br />
          <span className="text-white">Full Movie.</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto mb-8">
          AI-powered film generation. Enter a prompt and get a complete movie — script, dialogue, storyboard, music, voice, and trailer.
        </p>

        <div className="max-w-2xl mx-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Describe your film idea... e.g. "Thriller about an astronaut who realizes Earth disappeared"'
            className="w-full h-28 p-5 rounded-2xl glass-card border-border text-white placeholder-muted resize-none focus:outline-none focus:border-primary text-lg"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button
            onClick={submit}
            disabled={loading || !prompt.trim()}
            className="mt-4 w-full py-4 rounded-2xl bg-primary text-white font-semibold text-lg hover:bg-primary/90 disabled:opacity-30 transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating your film...
              </span>
            ) : "Generate Film"}
          </button>
        </div>

        <div className="mt-10">
          <p className="text-sm text-muted mb-3">Try an example:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex.text)}
                className="px-4 py-2 rounded-full text-sm glass-card border-border text-muted hover:text-white hover:border-primary/50 transition-all"
                title={ex.genre}
              >
                {ex.text.length > 45 ? ex.text.slice(0, 42) + "..." : ex.text}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 py-8 border-t border-border">
        {[
          { emoji: "🎬", title: "AI Producer → Editor", desc: "9-stage pipeline: Producer → Screenwriter → Director → Storyboard → Camera → Actor → Voice → Composer → Editor" },
          { emoji: "🔄", title: "Infinite Movie Mode", desc: "Film never ends. After the finale, AI generates the next chapter. A series that goes on forever." },
          { emoji: "👥", title: "Co-Authoring + Rewrite", desc: 'Multiple users suggest changes. "Make hero a villain" — AI rewrites script, dialogue, music, and scenes automatically.' },
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-2xl glass-card border-border">
            <div className="text-2xl mb-3">{f.emoji}</div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-muted text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
