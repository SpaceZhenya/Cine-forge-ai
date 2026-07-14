"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

const PIPELINE = [
  { id: "producing", label: "AI Producer", desc: "Creating film idea", emoji: "💡" },
  { id: "screenwriting", label: "AI Screenwriter", desc: "Writing screenplay", emoji: "📝" },
  { id: "directing", label: "AI Director", desc: "Breaking down scenes", emoji: "🎬" },
  { id: "storyboarding", label: "AI Storyboard", desc: "Generating storyboards", emoji: "🎨" },
  { id: "camera", label: "AI Camera", desc: "Planning camera movement", emoji: "📷" },
  { id: "acting", label: "AI Actor", desc: "Creating character emotions", emoji: "🎭" },
  { id: "voicing", label: "AI Voice", desc: "Generating voice lines", emoji: "🎙" },
  { id: "composing", label: "AI Composer", desc: "Composing music", emoji: "🎵" },
  { id: "editing", label: "AI Editor", desc: "Assembling final film", emoji: "✂️" },
];

const PIPELINE_IDS = PIPELINE.map(p => p.id);

export default function Project() {
  const { id } = useParams() as { id: string };
  const [film, setFilm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [tab, setTab] = useState("script");
  const [rewrite, setRewrite] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await api.getFilm(id);
      setFilm(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading film");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); const i = setInterval(load, 2000); return () => clearInterval(i); }, [load]);

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

  const infiniteMovie = async () => {
    setGenLoading(true);
    try {
      await api.generateFilm(id, true); // infinite mode
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Infinite movie failed");
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

  const playAudio = () => {
    if (audioPlaying) {
      audioRef.current?.pause();
      setAudioPlaying(false);
      return;
    }
    const audio = new Audio(`/api/audio/${id}`);
    audioRef.current = audio;
    audio.onended = () => setAudioPlaying(false);
    audio.play().then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false));
  };

  const speak = (text: string, voice: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = voice.includes("female") ? 1.2 : voice.includes("young") ? 1.3 : 0.8;
    utterance.onstart = () => setTtsPlaying(text);
    utterance.onend = () => setTtsPlaying(null);
    window.speechSynthesis.speak(utterance);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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

  const pipeline = film.pipeline;
  const pipIndex = PIPELINE_IDS.indexOf(film.status || "");
  const scenes = pipeline?.scenes || [];

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold">{film.title || "Untitled"}</h1>
            {pipeline && (
              <div className="flex gap-3 mt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">{pipeline.genre}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-secondary/20 text-secondary">{pipeline.tone}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent">{Math.round((pipeline.durationSeconds || 0) / 60)} min</span>
                {film.isInfinite && <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent">♾ Infinite</span>}
              </div>
            )}
          </div>
        </div>
        <p className="text-muted mt-2">{film.prompt}</p>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex gap-3 mt-4 flex-wrap">
          {film.status === "pending" ? (
            <button onClick={generate} disabled={genLoading}
              className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-30">
              {genLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />Starting...</>
                : "▶ Run Full Pipeline"}
            </button>
          ) : film.status === "completed" || film.status === "failed" ? (
            <>
              <button onClick={infiniteMovie} disabled={genLoading || film.status === "failed"}
                className="px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-30">
                ♾ Infinite Movie
              </button>
              <span className={`px-4 py-2 rounded-xl text-sm ${film.status === "completed" ? "bg-secondary/20 text-secondary" : "bg-red-500/20 text-red-400"}`}>
                {film.status === "completed" ? "✓ Completed" : "✗ Failed"}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-primary font-medium">Pipeline running...</span>
            </div>
          )}
        </div>
      </header>

      {/* Pipeline Progress */}
      {film.status !== "completed" && film.status !== "pending" && film.status !== "failed" && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Pipeline Progress</h2>
          <div className="grid gap-2">
            {PIPELINE.map((step, i) => {
              const done = pipIndex > i;
              const active = pipIndex === i;
              return (
                <div key={step.id}
                  className={`pipeline-step flex items-center gap-4 p-4 rounded-xl glass-card transition-all ${
                    done ? "border-secondary/40" : active ? "border-primary pipeline-active" : "opacity-30"
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    done ? "bg-secondary/20" : active ? "bg-primary/20" : "bg-border"
                  }`}>{done ? "✓" : step.emoji}</div>
                  <div className="flex-1">
                    <div className={`font-medium ${active ? "text-white" : done ? "text-secondary" : "text-muted"}`}>{step.label}</div>
                    <div className="text-xs text-muted">{step.desc}</div>
                  </div>
                  {active && <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                  {done && <div className="text-secondary text-sm">Done</div>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6 overflow-x-auto">
        {[
          { id: "script", label: "📜 Script" },
          { id: "scenes", label: "🎬 Scenes" },
          { id: "characters", label: "🎭 Characters" },
          { id: "music", label: "🎵 Music" },
          { id: "export", label: "📺 Export" },
          { id: "collab", label: "👥 Co-Author" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`tab-btn pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Script Tab */}
      {tab === "script" && (
        <div className="glass-card border-border rounded-2xl p-6">
          {film.fullScript ? (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans">{film.fullScript}</pre>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted text-lg mb-2">No script yet</p>
              <p className="text-muted text-sm">Click "Run Full Pipeline" to generate the complete screenplay.</p>
            </div>
          )}
        </div>
      )}

      {/* Scenes Tab */}
      {tab === "scenes" && (
        <div className="space-y-4">
          {scenes.length === 0 && <p className="text-muted text-center py-8">No scenes generated yet.</p>}
          {scenes.map((scene: any, i: number) => (
            <div key={scene.id || i}
              className="glass-card border-border rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setExpandedScene(expandedScene === i ? null : i)}>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {scene.number || i + 1}
                  </div>
                  <div>
                    <div className="font-medium">{scene.title}</div>
                    <div className="text-xs text-muted">{scene.location} — {scene.timeOfDay}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); const lines = scene.dialogue?.map((d: any) => d.text).join(". "); if (lines) speak(lines, "default"); }}
                    className="text-xs px-2 py-1 rounded bg-secondary/20 text-secondary hover:bg-secondary/30">🔊</button>
                  <span className="text-xs px-2 py-1 rounded-full bg-border text-muted">{scene.durationSeconds}s</span>
                  <span className="text-xs">{expandedScene === i ? "▲" : "▼"}</span>
                </div>
              </div>
              {expandedScene === i && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 text-sm">
                  <p className="text-gray-400">{scene.summary}</p>
                  {scene.cameraMovement && (
                    <div>
                      <span className="text-muted text-xs">📷 Camera:</span>
                      <p className="text-gray-400">{scene.cameraMovement}</p>
                    </div>
                  )}
                  {scene.musicCue && (
                    <div>
                      <span className="text-muted text-xs">🎵 Music:</span>
                      <p className="text-gray-400">{scene.musicCue}</p>
                    </div>
                  )}
                  {scene.dialogue && scene.dialogue.length > 0 && (
                    <div>
                      <span className="text-muted text-xs">💬 Dialogue:</span>
                      {scene.dialogue.map((d: any, di: number) => (
                        <p key={di} className="text-gray-300 mt-1 flex items-start gap-2">
                          <span className="text-primary font-medium">{d.character}</span>
                          <span className="text-muted text-xs"> ({d.emotion}): </span>
                          <span className="flex-1">{d.text}</span>
                          <button onClick={(e) => { e.stopPropagation(); speak(d.text, d.character); }}
                            className="text-xs px-2 py-0.5 rounded bg-secondary/20 text-secondary hover:bg-secondary/30 shrink-0">
                            {ttsPlaying === d.text ? "🔊" : "🔈"}
                          </button>
                        </p>
                      ))}
                    </div>
                  )}
                  {scene.soundEffects && scene.soundEffects.length > 0 && (
                    <div>
                      <span className="text-muted text-xs">🔊 SFX: </span>
                      <span className="text-gray-400">{scene.soundEffects.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Characters Tab */}
      {tab === "characters" && (
        <div className="grid md:grid-cols-2 gap-4">
          {(!pipeline?.characters || pipeline.characters.length === 0) && (
            <p className="text-muted text-center py-8 col-span-2">No characters generated yet.</p>
          )}
          {(pipeline?.characters || []).map((char: any, i: number) => (
            <div key={i} className="glass-card border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                  {["👨‍🚀", "👩‍🔬", "🧙‍♂️", "🕵️", "🤖", "🧛"][i % 6]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{char.name}</h3>
                  <p className="text-xs text-muted">{char.role || char.voiceType || "Character"}</p>
                </div>
                <button onClick={() => speak(`I am ${char.name}. ${char.personality}. My goal is ${char.goal}.`, char.voiceType)}
                  className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30">
                  {ttsPlaying?.includes(char.name) ? "🔊" : "🔈"} Voice
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted">Personality:</span> <span className="text-gray-300">{char.personality}</span></div>
                <div><span className="text-muted">Motivation:</span> <span className="text-gray-300">{char.motivation}</span></div>
                <div><span className="text-muted">Goal:</span> <span className="text-gray-300">{char.goal}</span></div>
                <div><span className="text-muted">Arc:</span> <span className="text-gray-300">{char.arc}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Music Tab */}
      {tab === "music" && (
        <div className="space-y-3">
          {(!pipeline?.musicTracks || pipeline.musicTracks.length === 0) && (
            <p className="text-muted text-center py-8">No music tracks generated yet.</p>
          )}
          <div className="flex items-center gap-3 mb-2">
            <button onClick={playAudio}
              className="px-4 py-2 rounded-xl bg-secondary/20 text-secondary hover:bg-secondary/30 text-sm font-medium">
              {audioPlaying ? "⏹ Stop Soundtrack" : "▶ Play Full Soundtrack"}
            </button>
            <span className="text-xs text-muted">
              {pipeline?.musicTracks?.length || 0} tracks · ~{Math.round((pipeline?.durationSeconds || 0) / 60)} min
            </span>
          </div>
          {(pipeline?.musicTracks || []).map((track: any, i: number) => (
            <div key={i} className="glass-card border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-lg">🎵</div>
              <div className="flex-1">
                <div className="font-medium">Scene {i + 1}: <span className="text-secondary">{track.mood}</span></div>
                <div className="text-xs text-muted mt-1">
                  ♩ {track.tempo} BPM · Key: {track.key} · {track.instruments?.join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Tab */}
      {tab === "export" && (
        <div className="glass-card border-border rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">Export Options</h3>
          {film.status === "completed" ? (
            <div className="grid md:grid-cols-2 gap-4">
              <a href={`/api/export/${id}/script`} target="_blank"
                className="p-4 rounded-xl glass-card border-border hover:border-primary/50 transition-all block">
                <div className="font-medium mb-1">📄 Plain Text Script</div>
                <div className="text-xs text-muted">Download screenplay as .txt</div>
              </a>
              <a href={`/api/trailer/${id}`} target="_blank"
                className="p-4 rounded-xl glass-card border-border hover:border-primary/50 transition-all block">
                <div className="font-medium mb-1">🎞 Trailer MP4</div>
                <div className="text-xs text-muted">15-second cinematic trailer</div>
              </a>
              <a href={film.coverImageUrl || "#"} target="_blank"
                className="p-4 rounded-xl glass-card border-border hover:border-primary/50 transition-all block">
                <div className="font-medium mb-1">🖼 Poster</div>
                <div className="text-xs text-muted">AI-generated movie poster (SVG)</div>
              </a>
              <button onClick={playAudio}
                className="p-4 rounded-xl glass-card border-border hover:border-primary/50 transition-all text-left">
                <div className="font-medium mb-1">{audioPlaying ? "⏹ Stop Music" : "🎵 Play Soundtrack"}</div>
                <div className="text-xs text-muted">Generated from film music metadata</div>
              </button>
              <div className="p-4 rounded-xl glass-card border-border opacity-60">
                <div className="font-medium mb-1">📱 TikTok Clip</div>
                <div className="text-xs text-muted">Coming soon</div>
              </div>
              <div className="p-4 rounded-xl glass-card border-border opacity-60">
                <div className="font-medium mb-1">🎬 Full Film</div>
                <div className="text-xs text-muted">Coming soon</div>
              </div>
              <button onClick={() => {
                const s = JSON.stringify(film.pipeline, null, 2);
                const blob = new Blob([s], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "film-data.json"; a.click();
                URL.revokeObjectURL(url);
              }}
                className="p-4 rounded-xl glass-card border-border hover:border-primary/50 transition-all text-left">
                <div className="font-medium mb-1">📊 Film Data (JSON)</div>
                <div className="text-xs text-muted">Export all film data as JSON</div>
              </button>
              <button onClick={() => {
                if (!film.fullScript) return;
                const win = window.open("", "_blank");
                if (!win) return;
                win.document.write(`<html><head><title>${film.title || "Script"}</title><style>body{font-family:monospace;padding:40px;max-width:800px;margin:auto;line-height:1.6}pre{white-space:pre-wrap}</style></head><body><h1>${film.title || "Untitled"}</h1><pre>${film.fullScript.replace(/</g, "&lt;")}</pre></body></html>`);
                win.document.close();
                win.print();
              }}
                className="p-4 rounded-xl glass-card border-border hover:border-primary/50 transition-all text-left">
                <div className="font-medium mb-1">🖨 Print / PDF</div>
                <div className="text-xs text-muted">Print to PDF from browser</div>
              </button>
            </div>
          ) : (
            <p className="text-muted text-center py-8">Generate the film first to see export options.</p>
          )}
        </div>
      )}

      {/* Co-Author Tab */}
      {tab === "collab" && (
        <div className="space-y-6 max-w-xl">
          <div className="glass-card border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔄</span>
              <h3 className="font-semibold">Rewrite Mode</h3>
            </div>
            <p className="text-xs text-muted mb-3">
              Tell AI to change anything: "Make the hero a villain", "Set it in Tokyo", "Add a dragon".
              The AI rewrites the entire film automatically.
            </p>
            <div className="flex gap-2">
              <input value={rewrite} onChange={(e) => setRewrite(e.target.value)}
                placeholder='e.g. "Make the protagonist a villain"'
                className="flex-1 p-3 rounded-xl glass-card border-border text-white placeholder-muted focus:outline-none focus:border-primary" />
              <button onClick={handleRewrite} className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90">Rewrite</button>
            </div>
          </div>

          <div className="glass-card border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">👥</span>
              <h3 className="font-semibold">Co-Authoring</h3>
            </div>
            <p className="text-xs text-muted mb-3">
              Multiple users can suggest ideas simultaneously.
              AI analyzes all suggestions and integrates the best ones while keeping logical consistency.
            </p>
            <div className="flex gap-2">
              <input value={suggestion} onChange={(e) => setSuggestion(e.target.value)}
                placeholder='e.g. "Add a dragon", "Kill the protagonist", "Set in Tokyo"'
                className="flex-1 p-3 rounded-xl glass-card border-border text-white placeholder-muted focus:outline-none focus:border-primary" />
              <button onClick={handleCollab} className="px-6 py-3 rounded-xl bg-secondary text-black font-medium hover:bg-secondary/90">Suggest</button>
            </div>
          </div>

          {film.coAuthors && JSON.parse(film.coAuthors || "[]").length > 0 && (
            <div className="glass-card border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Suggestions</h3>
              <div className="space-y-3">
                {JSON.parse(film.coAuthors).map((c: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl glass-card border-border text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {c.user_id?.slice(-2) || "??"}
                      </span>
                      <span className="text-muted text-xs">{c.user_id}</span>
                      {c.timestamp && <span className="text-muted text-xs ml-auto">{new Date(c.timestamp).toLocaleTimeString()}</span>}
                    </div>
                    <p className="text-gray-300">"{c.suggestion}"</p>
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
