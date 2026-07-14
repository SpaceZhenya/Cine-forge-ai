// In-memory store with full pipeline support

import { runFullPipeline, type FilmResult } from "./pipeline";

export interface Film {
  id: string;
  title: string;
  status: string;
  prompt: string;
  genre: string;
  tone: string;
  logline: string;
  fullScript: string;
  pipelineResult: FilmResult | null;
  videoUrl: string;
  trailerUrl: string;
  coverImageUrl: string;
  coAuthors: string;
  version: number;
  parentId: string;
  isInfinite: boolean;
  createdAt: string;
}

// Use globalThis to survive Next.js hot reloads in dev mode
const g = globalThis as any;
if (!g.__cineforgeStore) g.__cineforgeStore = new Map<string, Film>();
if (g.__cineforgeCounter === undefined) g.__cineforgeCounter = 0;
const store: Map<string, Film> = g.__cineforgeStore;
let counter: number = g.__cineforgeCounter;

export function createFilm(prompt: string): Film {
  g.__cineforgeCounter = ++counter;
  const id = Date.now().toString(36) + counter.toString(36);
  const film: Film = {
    id,
    title: "",
    status: "pending",
    prompt,
    genre: "",
    tone: "",
    logline: "",
    fullScript: "",
    pipelineResult: null,
    videoUrl: "",
    trailerUrl: "",
    coverImageUrl: "",
    coAuthors: "[]",
    version: 1,
    parentId: "",
    isInfinite: false,
    createdAt: new Date().toISOString(),
  };
  store.set(id, film);
  return film;
}

export function getFilm(id: string): Film | undefined {
  return store.get(id);
}

export function listFilms(): Film[] {
  return Array.from(store.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
}

export function generateFilm(id: string): Film | undefined {
  const film = store.get(id);
  if (!film) return undefined;

  if (film.status !== "pending" && film.status !== "failed") return film;

  film.status = "producing";
  film.pipelineResult = null;

  runPipelineAsync(film);

  return film;
}

async function runPipelineAsync(film: Film) {
  try {
    const stages = ["producing", "screenwriting", "directing", "storyboarding", "camera", "acting", "voicing", "composing", "editing"];
    for (const stage of stages) {
      film.status = stage;
      await new Promise(r => setTimeout(r, 800));
    }

    const result = runFullPipeline(film.prompt);

    film.title = result.title;
    film.genre = result.genre;
    film.tone = result.tone;
    film.logline = result.logline;
    film.fullScript = result.fullScript;
    film.pipelineResult = result;
    film.status = "completed";
    film.coverImageUrl = `/api/poster/${film.id}`;
  } catch (e) {
    film.status = "failed";
  }
}

export function infiniteMovie(id: string): Film | undefined {
  const film = store.get(id);
  if (!film || !film.pipelineResult) return undefined;

  film.isInfinite = true;

  // Continue the story: add more scenes
  const result = film.pipelineResult;
  const lastScene = result.scenes[result.scenes.length - 1];
  const newSceneNum = result.scenes.length + 1;

  const continuationScenes = [
    {
      id: `s${newSceneNum}`,
      number: newSceneNum,
      title: "The Next Chapter",
      location: lastScene.location,
      timeOfDay: "Unknown",
      summary: "The story continues... New challenges await beyond the horizon.",
      dialogue: [
        { character: result.characters[0]?.name || "Hero", text: "What now?", emotion: "uncertain" },
        { character: result.characters[1]?.name || "Guide", text: "The journey is far from over.", emotion: "mysterious" },
      ],
      cameraMovement: "Slow reveal, wide angle",
      emotionalTone: "Mystery",
      durationSeconds: 30,
      storyboardPrompt: "Continue the cinematic journey...",
      musicCue: "Evolving ambient, new theme emerging",
      soundEffects: ["wind", "distant thunder"],
    },
    {
      id: `s${newSceneNum + 1}`,
      number: newSceneNum + 1,
      title: "The Infinite Horizon",
      location: "The Edge of Known World",
      timeOfDay: "Twilight",
      summary: "The protagonist steps into the unknown. The story never ends.",
      dialogue: [
        { character: result.characters[0]?.name || "Hero", text: "There's no end to this, is there?", emotion: "realization" },
        { character: "Narrator", text: "Every ending is a new beginning.", emotion: "omniscient" },
      ],
      cameraMovement: "Infinite zoom out, then zoom in",
      emotionalTone: "Wonder",
      durationSeconds: 25,
      storyboardPrompt: "Infinite horizon, cinematic wide shot...",
      musicCue: "End credits that loop back to main theme",
      soundEffects: ["heartbeat", "whisper"],
    },
  ];

  result.scenes.push(...continuationScenes);
  result.durationSeconds += 55;
  result.fullScript += "\n\n— INFINITE MODE —\n\nThe story continues...\n\n";
  for (const s of continuationScenes) {
    result.fullScript += `\n## Scene ${s.number}: ${s.title}\n*${s.location}*\n${s.summary}\n`;
    for (const line of s.dialogue) {
      result.fullScript += `\n**${line.character}**: ${line.text}`;
    }
  }

  film.fullScript = result.fullScript;
  film.status = "completed";
  return film;
}

export function rewriteFilm(id: string, instruction: string): Film | undefined {
  const original = store.get(id);
  if (!original) return undefined;

  counter++;
  const newId = Date.now().toString(36) + counter.toString(36);
  const film: Film = {
    id: newId,
    title: "",
    status: "pending",
    prompt: `${original.prompt}. REWRITE: ${instruction}`,
    genre: "",
    tone: "",
    logline: "",
    fullScript: "",
    pipelineResult: null,
    videoUrl: "",
    trailerUrl: "",
    coverImageUrl: "",
    coAuthors: "[]",
    version: (original.version || 1) + 1,
    parentId: id,
    isInfinite: false,
    createdAt: new Date().toISOString(),
  };
  store.set(newId, film);
  return film;
}

export function addCollaboration(id: string, userId: string, suggestion: string): Film | undefined {
  const film = store.get(id);
  if (!film) return undefined;
  const authors = JSON.parse(film.coAuthors || "[]");
  authors.push({ user_id: userId, suggestion, timestamp: new Date().toISOString() });
  film.coAuthors = JSON.stringify(authors);
  return film;
}
