// In-memory store — shared across all API routes.
// Films persist only while the server is running.

import { randomUUID } from "crypto";
const uuid = () => randomUUID();

export interface Film {
  id: string;
  title: string;
  status: string;
  prompt: string;
  full_script: string;
  logline: string;
  video_url: string;
  trailer_url: string;
  cover_image_url: string;
  co_authors: string;
  version: number;
  parent_id: string;
  created_at: string;
}

const store = new Map<string, Film>();

export function createFilm(prompt: string): Film {
  const id = uuid().slice(0, 8);
  const film: Film = {
    id,
    title: "",
    status: "pending",
    prompt,
    full_script: "",
    logline: "",
    video_url: "",
    trailer_url: "",
    cover_image_url: "",
    co_authors: "[]",
    version: 1,
    parent_id: "",
    created_at: new Date().toISOString(),
  };
  store.set(id, film);
  return film;
}

export function getFilm(id: string): Film | undefined {
  return store.get(id);
}

export function listFilms(): Film[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 50);
}

export function generateFilm(id: string): Film | undefined {
  const film = store.get(id);
  if (!film) return undefined;

  const words = film.prompt.split(/\s+/).filter(w => w.length > 0);
  const title = words.length > 2
    ? words.slice(0, 3).map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
    : film.prompt.slice(0, 30);

  const logline = `In a world where ${film.prompt.toLowerCase().replace(/[.!?]$/, "")}, one person must confront the unimaginable.`;

  const scenes = [
    ["The Silence", "ISS Observation Deck", "Alex stares at the void where Earth should be."],
    ["Last Transmission", "Communications Bay", "Frantically working the radio. Only static."],
    ["Fading Signal", "Main Corridor", "Searching every window. Nothing but stars."],
    ["The Void Below", "Lower Module", "Descending into darkness. The hull creaks ominously."],
    ["Echoes of Earth", "Quarters", "Old photos. Memories of family. The weight of solitude."],
    ["Desperate Calculations", "Lab Module", "The orbital math doesn't add up. Something impossible happened."],
    ["The Final Broadcast", "Comm Station", "Recording a message to anyone listening. Raw. Honest."],
    ["Into the Unknown", "Airlock", "A daring plan: descend into the atmosphere."],
    ["Ghost in the Machine", "AI Core", "The station AI shows strange data. Hiding something."],
    ["The Last Dawn", "Capsule", "Strapping in. Ready to plunge into the unknown."],
  ];

  let script = `# ${title}\n\n**${logline}**\n\n`;
  for (let i = 0; i < scenes.length; i++) {
    script += `## Scene ${i + 1}: ${scenes[i][0]}\n*${scenes[i][1]}*\n\n${scenes[i][2]}\n\n`;
  }

  film.title = title;
  film.logline = logline;
  film.full_script = script;
  film.status = "completed";
  return film;
}

export function rewriteFilm(id: string, instruction: string): Film | undefined {
  const original = store.get(id);
  if (!original) return undefined;

  const newId = uuid().slice(0, 8);
  const film: Film = {
    id: newId,
    title: "",
    status: "pending",
    prompt: `${original.prompt}. REWRITE: ${instruction}`,
    full_script: "",
    logline: "",
    video_url: "",
    trailer_url: "",
    cover_image_url: "",
    co_authors: "[]",
    version: original.version + 1,
    parent_id: id,
    created_at: new Date().toISOString(),
  };
  store.set(newId, film);
  return film;
}

export function addCollaboration(id: string, userId: string, suggestion: string): Film | undefined {
  const film = store.get(id);
  if (!film) return undefined;
  const authors = JSON.parse(film.co_authors || "[]");
  authors.push({ user_id: userId, suggestion });
  film.co_authors = JSON.stringify(authors);
  return film;
}
