// ─── Full AI Pipeline ───────────────────────────────────────────
// Nine stages: Producer → Screenwriter → Director → Storyboard →
// Camera → Actor → Voice → Composer → Editor

export interface Scene {
  id: string;
  number: number;
  title: string;
  location: string;
  timeOfDay: string;
  summary: string;
  dialogue: { character: string; text: string; emotion: string }[];
  cameraMovement: string;
  emotionalTone: string;
  durationSeconds: number;
  storyboardPrompt: string;
  musicCue: string;
  soundEffects: string[];
}

export interface Character {
  name: string;
  age: number;
  personality: string;
  motivation: string;
  goal: string;
  arc: string;
  voiceType: string;
}

export interface FilmResult {
  title: string;
  logline: string;
  genre: string;
  tone: string;
  characters: Character[];
  scenes: Scene[];
  fullScript: string;
  cameraShots: string[];
  musicTracks: { sceneId: string; mood: string; tempo: number; key: string; instruments: string[] }[];
  voiceLines: { character: string; text: string; emotion: string }[];
  durationSeconds: number;
}

// ─── Stage 1: AI Producer ──────────────────────────────────────

function stageProducer(prompt: string) {
  const promptLower = prompt.toLowerCase();

  const genreMap: Record<string, string> = {
    action: "Action", battle: "Action", war: "Action",
    comedy: "Comedy", funny: "Comedy", hilarious: "Comedy", laugh: "Comedy",
    drama: "Drama", emotional: "Drama",
    thriller: "Thriller", mystery: "Thriller", detective: "Thriller", spy: "Thriller",
    horror: "Horror", scary: "Horror", ghost: "Horror", monster: "Horror",
    zombie: "Horror", dark: "Horror", haunt: "Horror",
    fantasy: "Fantasy", magic: "Fantasy", dragon: "Fantasy", sword: "Fantasy",
    medieval: "Fantasy", kingdom: "Fantasy",
    romance: "Romance", love: "Romance", romantic: "Romance",
    scifi: "Sci-Fi", space: "Sci-Fi", astronaut: "Sci-Fi", alien: "Sci-Fi",
    future: "Sci-Fi", robot: "Sci-Fi", ai: "Sci-Fi", planet: "Sci-Fi",
    galaxy: "Sci-Fi", cyber: "Sci-Fi", quantum: "Sci-Fi",
    western: "Western", cowboy: "Western",
    musical: "Musical", song: "Musical", sing: "Musical",
  };

  let genre = "Sci-Fi";
  let bestScore = 0;
  for (const [key, val] of Object.entries(genreMap)) {
    const score = (promptLower.match(new RegExp(key, "g")) || []).length;
    if (score > bestScore) { bestScore = score; genre = val; }
  }

  const tone = /dark|disappear|void|empty|shadow|alone|death|vanish|haunt/.test(promptLower) ? "Dark"
    : /hope|survive|rescue|find|return|light|beautiful/.test(promptLower) ? "Hopeful"
    : /funny|comedy|laugh|ridiculous/.test(promptLower) ? "Light"
    : /mystery|secret|strange|unknown/.test(promptLower) ? "Mysterious"
    : "Epic";

  const words = prompt.split(/\s+/).filter(w => w.length > 2);
  const significant = words.filter(w => /[A-ZА-ЯЁ]/.test(w[0]) || w.length > 5);
  const title = significant.length >= 2
    ? significant.slice(0, 3).join(" ")
    : words.slice(0, 3).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  const logline = genre === "Comedy"
    ? `When ${promptLower.replace(/[.!?]$/, "")}, ${charStart(genre)} finds themselves in the most ridiculous situation imaginable.`
    : genre === "Horror"
    ? `${promptLower.replace(/[.!?]$/, "")}. ${charStart(genre)} must survive before it's too late.`
    : `In a world where ${promptLower.replace(/[.!?]$/, "")}, ${charStart(genre)} must confront the unimaginable.`;

  return { title: title || "Untitled", genre, tone, logline };
}

function charStart(genre: string): string {
  const map: Record<string, string> = {
    "Action": "a hero", "Comedy": "an unlikely hero", "Drama": "one person",
    "Thriller": "one person", "Horror": "a survivor", "Fantasy": "a chosen one",
    "Romance": "two souls", "Sci-Fi": "an astronaut",
  };
  return map[genre] || "a protagonist";
}

// ─── Stage 2: AI Screenwriter ──────────────────────────────────

function stageScreenwriter(title: string, logline: string, genre: string, tone: string): { characters: Character[]; scenes: Scene[] } {
  const characters: Character[] = [
    { name: "Alex", age: 34, personality: "Resourceful, analytical, haunted", motivation: "To understand the truth", goal: "Survive and find answers", arc: "Fear → Determination", voiceType: "deep male" },
    { name: "Dr. Kova", age: 52, personality: "Calm, wise, enigmatic", motivation: "To protect the mission", goal: "Maintain order in chaos", arc: "Control → Acceptance", voiceType: "wise female" },
  ];

  if (genre === "Horror") {
    characters[0] = { name: "Maya", age: 28, personality: "Cautious, intuitive, brave", motivation: "Escape the nightmare", goal: "Survive the night", arc: "Fear → Fury", voiceType: "young female" };
    characters[1] = { name: "The Entity", age: 999, personality: "Ancient, malevolent, patient", motivation: "To consume", goal: "Claim all souls", arc: "Static evil", voiceType: "distorted" };
  } else if (genre === "Comedy") {
    characters[0] = { name: "Benny", age: 30, personality: "Clumsy, optimistic, loud", motivation: "Prove everyone wrong", goal: "Win the contest", arc: "Loser → Winner", voiceType: "comedic male" };
    characters[1] = { name: "Zara", age: 29, personality: "Sarcastic, brilliant, secretly kind", motivation: "Keep Benny alive", goal: "Survive Benny's plans", arc: "Cold → Caring", voiceType: "dry female" };
  } else if (genre === "Fantasy") {
    characters[0] = { name: "Elara", age: 22, personality: "Brave, curious, stubborn", motivation: "Save her kingdom", goal: "Find the Crystal of Light", arc: "Naive → Wise", voiceType: "young female" };
    characters[1] = { name: "Theron", age: 200, personality: "Ancient, mysterious, powerful", motivation: "Atone for past sins", goal: "Protect the prophecy", arc: "Guilt → Redemption", voiceType: "deep male" };
  } else if (genre === "Action") {
    characters[0] = { name: "Jack", age: 38, personality: "Brutal, tactical, lone wolf", motivation: "Revenge for his family", goal: "Destroy the cartel", arc: "Vengeance → Justice", voiceType: "gruff male" };
    characters[1] = { name: "Agent Reyes", age: 35, personality: "Sharp, principled, relentless", motivation: "Uphold the law", goal: "Bring Jack in alive", arc: "Hunter → Ally", voiceType: "firm female" };
  } else if (genre === "Romance") {
    characters[0] = { name: "Lily", age: 26, personality: "Dreamy, passionate, impulsive", motivation: "Find true love", goal: "Open her heart again", arc: "Closed → Open", voiceType: "warm female" };
    characters[1] = { name: "Sam", age: 28, personality: "Grounded, kind, shy", motivation: "Protect his heart", goal: "Confess his feelings", arc: "Insecure → Confident", voiceType: "gentle male" };
  }

  const sceneTemplates = getSceneTemplates(genre, tone);
  const numScenes = 10;

  const scenes: Scene[] = sceneTemplates.slice(0, numScenes).map((tmpl, i) => {
    const lines = tmpl.dialogue.map((d, di) => ({
      character: characters[di % characters.length].name,
      text: d.text,
      emotion: d.emotion,
    }));

    return {
      id: `s${i + 1}`,
      number: i + 1,
      title: tmpl.title,
      location: tmpl.location,
      timeOfDay: tmpl.timeOfDay,
      summary: tmpl.summary,
      dialogue: lines,
      cameraMovement: "",
      emotionalTone: tmpl.emotion,
      durationSeconds: 20 + Math.floor(Math.random() * 20),
      storyboardPrompt: "",
      musicCue: "",
      soundEffects: tmpl.sounds,
    };
  });

  return { characters, scenes };
}

function getSceneTemplates(genre: string, tone: string) {
  // Generic templates that work for any prompt
  const templates = [
    { title: "The Beginning", location: "Main Location", timeOfDay: "Dawn", summary: "Our story begins as the protagonist faces an unexpected change.", emotion: "Curiosity", sounds: ["ambient"], dialogue: [{ character: "A", text: "This is where it starts.", emotion: "calm" }, { character: "B", text: "Are you sure about this?", emotion: "worried" }] },
    { title: "The Discovery", location: "Central Hub", timeOfDay: "Day", summary: "A crucial discovery changes everything the protagonist thought they knew.", emotion: "Wonder", sounds: ["distant hum"], dialogue: [{ character: "A", text: "I found something. You need to see this.", emotion: "urgent" }, { character: "B", text: "What is it? Is it dangerous?", emotion: "fear" }] },
    { title: "The Conflict", location: "Crossroads", timeOfDay: "Dusk", summary: "Tensions rise as opposing forces collide. A choice must be made.", emotion: "Tension", sounds: ["footsteps", "heartbeat"], dialogue: [{ character: "A", text: "You don't have to do this.", emotion: "pleading" }, { character: "B", text: "Yes. I do.", emotion: "determined" }] },
    { title: "The Descent", location: "Lower Depths", timeOfDay: "Night", summary: "Descending into the unknown. The darkest hour before the dawn.", emotion: "Dread", sounds: ["eerie wind", "creaking"], dialogue: [{ character: "A", text: "It's darker than I expected.", emotion: "uneasy" }, { character: "B", text: "Stay close. Don't look back.", emotion: "stern" }] },
    { title: "The Turning Point", location: "Chamber of Truth", timeOfDay: "Twilight", summary: "A revelation that changes the course of the journey. Nothing will be the same.", emotion: "Shock", sounds: ["dramatic sting"], dialogue: [{ character: "A", text: "The truth is... I'm not who you think I am.", emotion: "confession" }, { character: "B", text: "Then who are you?", emotion: "demanding" }] },
    { title: "The Alliance", location: "Neutral Ground", timeOfDay: "Evening", summary: "Former enemies become allies against a greater threat.", emotion: "Hope", sounds: ["fire crackling"], dialogue: [{ character: "A", text: "I never thought I'd say this, but I need your help.", emotion: "humble" }, { character: "B", text: "The enemy of my enemy...", emotion: "reluctant" }] },
    { title: "The Preparation", location: "Armory / Sanctum", timeOfDay: "Dawn", summary: "Gearing up for the final confrontation. Every moment counts.", emotion: "Determination", sounds: ["metal clanking"], dialogue: [{ character: "A", text: "Is everyone ready?", emotion: "serious" }, { character: "B", text: "As ready as we'll ever be.", emotion: "resolute" }] },
    { title: "The Climax", location: "The Final Arena", timeOfDay: "Storm", summary: "Everything comes down to this moment. The ultimate test of will.", emotion: "Intensity", sounds: ["explosions", "wind"], dialogue: [{ character: "A", text: "This ends now!", emotion: "fury" }, { character: "B", text: "I was thinking the same thing.", emotion: "cold" }] },
    { title: "The Aftermath", location: "Ruins / Quiet Place", timeOfDay: "Dawn", summary: "Silence falls. The dust settles. What remains is peace.", emotion: "Relief", sounds: ["birds", "gentle wind"], dialogue: [{ character: "A", text: "It's over.", emotion: "exhausted" }, { character: "B", text: "No. It's just beginning.", emotion: "hopeful" }] },
    { title: "The New Dawn", location: "Horizon View", timeOfDay: "Sunrise", summary: "A new day rises. The journey continues, but everything has changed.", emotion: "Hope", sounds: ["uplifting swell"], dialogue: [{ character: "A", text: "What happens now?", emotion: "uncertain" }, { character: "B", text: "We live. And we remember.", emotion: "peaceful" }] },
  ];

  // Add genre-specific flavor to templates
  if (genre === "Horror") {
    templates[1].location = "Abandoned Asylum";
    templates[4].location = "The Entity's Lair";
    templates[7].location = "The Ritual Chamber";
  } else if (genre === "Fantasy") {
    templates[1].location = "Enchanted Forest";
    templates[4].location = "The Crystal Cave";
    templates[7].location = "The Dragon's Peak";
  } else if (genre === "Comedy") {
    templates[1].location = "Food Court";
    templates[4].location = "The Boss's Office";
    templates[7].location = "The Talent Show Stage";
  } else if (genre === "Romance") {
    templates[1].location = "Coffee Shop";
    templates[4].location = "Rooftop at Sunset";
    templates[7].location = "The Airport";
  } else if (genre === "Action") {
    templates[1].location = "Black Site";
    templates[4].location = "Enemy Headquarters";
    templates[7].location = "The Bridge";
  }

  return templates;
}

// ─── Stage 3: AI Director ──────────────────────────────────────

function stageDirector(scenes: Scene[]): Scene[] {
  const cameraMoves = [
    "Slow dolly in, intimate close-up",
    "Steadicam tracking shot, following the action",
    "Handheld, documentary style, immediate",
    "Wide establishing shot, crane descending",
    "Dutch angle, disorienting and tense",
    "Drone shot, aerial perspective",
    "POV shot, subjective experience",
    "Rack focus between foreground and background",
    "360° orbit around the subject",
    "Static tripod, classical composition",
  ];

  return scenes.map((scene, i) => ({
    ...scene,
    cameraMovement: cameraMoves[i % cameraMoves.length],
    storyboardPrompt: `Cinematic shot: ${scene.title}. Location: ${scene.location}. ${scene.summary}. Camera: ${cameraMoves[i % cameraMoves.length]}. Mood: ${scene.emotionalTone}. Style: Photorealistic, film grain, anamorphic.`,
    musicCue: getMusicCue(scene.emotionalTone),
  }));
}

function getMusicCue(emotion: string): string {
  const map: Record<string, string> = {
    "Curiosity": "Light piano arpeggios, soft pads",
    "Wonder": "Ethereal synth swells, choir pads",
    "Tension": "Low strings, percussion pulse, sub-bass drone",
    "Dread": "Atmospheric drones, dissonant strings, creaking",
    "Shock": "Staccato strings, brass stab, silence",
    "Hope": "Warm piano, rising strings, gentle percussion",
    "Determination": "Driving percussion, heroic brass, building",
    "Intensity": "Full orchestra, rapid strings, pounding drums",
    "Relief": "Soft piano, ambient pads, gentle release",
    "Uncertain": "Minimal guitar, sparse piano, floating",
  };
  return map[emotion] || "Ambient electronic, evolving texture";
}

// ─── Stage 4: AI Camera ────────────────────────────────────────

function stageCamera(scenes: Scene[]): string[] {
  const shots: string[] = [];
  for (const scene of scenes) {
    shots.push(`Scene ${scene.number}: ${scene.cameraMovement}`);
    shots.push(`  Lens: ${["35mm", "50mm", "85mm", "24mm"][scene.number % 4]}`);
    shots.push(`  Angle: ${["Eye-level", "Low-angle", "High-angle", "Dutch"][scene.number % 4]}`);
    shots.push(`  Lighting: ${["Natural key", "Hard contrast", "Soft diffused", "Rim light"][scene.number % 4]}`);
  }
  return shots;
}

// ─── Stage 5-6: AI Actor + Voice ───────────────────────────────

function stageActorVoice(scenes: Scene[], characters: Character[]) {
  const voiceLines: { character: string; text: string; emotion: string }[] = [];
  for (const scene of scenes) {
    for (const line of scene.dialogue) {
      voiceLines.push(line);
    }
  }
  return voiceLines;
}

// ─── Stage 7: AI Composer ──────────────────────────────────────

function stageComposer(scenes: Scene[]) {
  return scenes.map(scene => {
    const mood = scene.emotionalTone.toLowerCase();
    const tempo = /tension|intensity|action/.test(mood) ? 140
      : /hope|determination/.test(mood) ? 110
      : /dread|shock/.test(mood) ? 80
      : /relief|curiosity/.test(mood) ? 70 : 95;

    const key = ["C", "Dm", "Em", "F", "G", "Am"][scene.number % 6];

    const instruments = /tension|intensity/.test(mood)
      ? ["strings (pizzicato)", "taiko drums", "sub-bass"]
      : /hope|relief/.test(mood)
      ? ["grand piano", "soft strings", "glockenspiel"]
      : /dread|shock/.test(mood)
      ? ["cello", "double bass", "atmospheric synth pad"]
      : ["synthesizer", "ambient pads", "electronic percussion"];

    return { sceneId: scene.id, mood: scene.emotionalTone, tempo, key, instruments };
  });
}

// ─── Stage 8: AI Editor ────────────────────────────────────────

function stageEditor(scenes: Scene[]): string {
  let script = "";
  for (const scene of scenes) {
    script += `\n## Scene ${scene.number}: ${scene.title}\n`;
    script += `*${scene.location} — ${scene.timeOfDay}*\n`;
    script += `Camera: ${scene.cameraMovement}\n`;
    script += `Music: ${scene.musicCue}\n`;
    script += `\n${scene.summary}\n`;
    for (const line of scene.dialogue) {
      script += `\n**${line.character}** (${line.emotion}): ${line.text}`;
    }
    script += "\n";
  }
  return script;
}

// ─── Full Pipeline Run ─────────────────────────────────────────

export function runFullPipeline(prompt: string): FilmResult {
  // Stage 1
  const { title, genre, tone, logline } = stageProducer(prompt);

  // Stage 2
  const { characters, scenes } = stageScreenwriter(title, logline, genre, tone);

  // Stage 3
  const directedScenes = stageDirector(scenes);

  // Stage 4
  const cameraShots = stageCamera(directedScenes);

  // Stage 5+6
  const voiceLines = stageActorVoice(directedScenes, characters);

  // Stage 7
  const musicTracks = stageComposer(directedScenes);

  // Stage 8
  const fullScript = stageEditor(directedScenes);

  const totalDuration = directedScenes.reduce((sum, s) => sum + s.durationSeconds, 0);

  return {
    title, logline, genre, tone, characters,
    scenes: directedScenes,
    fullScript,
    cameraShots,
    musicTracks,
    voiceLines,
    durationSeconds: totalDuration,
  };
}
