"""
CineForge AI — FastAPI Backend
Full 9-stage pipeline with in-memory storage.
"""

import uuid
import json
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── Pydantic Schemas ───────────────────────────────

class CreateFilmReq(BaseModel):
    prompt: str

class RewriteFilmReq(BaseModel):
    instruction: str

class CollaborateReq(BaseModel):
    user_id: str
    suggestion: str

# ─── In-Memory Store ────────────────────────────────

store: dict[str, dict] = {}

# ─── Pipeline Modules ───────────────────────────────

def run_pipeline(prompt: str) -> dict:
    # Stage 1: Producer
    genre, tone = detect_genre_tone(prompt)
    title = generate_title(prompt)
    logline = generate_logline(prompt, genre)

    # Stage 2: Screenwriter
    characters = generate_characters(genre)
    scenes = generate_scenes(genre, tone, characters)

    # Stage 3-4: Director + Storyboard
    scenes = add_direction(scenes)

    # Stage 5: Camera
    camera_shots = plan_camera(scenes)

    # Stage 6-7: Actor + Voice
    voice_lines = extract_voice_lines(scenes)

    # Stage 8: Composer
    music_tracks = compose_music(scenes)

    # Stage 9: Editor
    full_script = assemble_script(title, logline, scenes)

    return {
        "title": title,
        "logline": logline,
        "genre": genre,
        "tone": tone,
        "full_script": full_script,
        "characters": characters,
        "scenes": scenes,
        "camera_shots": camera_shots,
        "voice_lines": voice_lines,
        "music_tracks": music_tracks,
        "duration_seconds": sum(s.get("duration_seconds", 20) for s in scenes),
        "status": "completed",
    }

def detect_genre_tone(prompt: str) -> tuple:
    prompt_l = prompt.lower()
    genre_scores = {
        "Sci-Fi": ["space", "alien", "robot", "future", "ai", "astronaut", "planet", "clone"],
        "Horror": ["horror", "scary", "ghost", "monster", "demon", "nightmare", "dark", "dead"],
        "Fantasy": ["fantasy", "magic", "dragon", "sword", "kingdom", "mythical", "spell"],
        "Comedy": ["comedy", "funny", "hilarious", "laugh", "silly", "ridiculous", "joke"],
        "Action": ["action", "chase", "fight", "explosion", "battle", "war", "mission", "agent"],
        "Thriller": ["thriller", "suspense", "mystery", "twist", "disappear", "dark", "spy"],
        "Romance": ["romance", "love", "romantic", "heart", "passion", "kiss", "date"],
        "Drama": ["drama", "emotional", "family", "loss", "struggle", "relationship"],
    }
    best_genre, best_score = "Sci-Fi", 0
    for g, keywords in genre_scores.items():
        score = sum(prompt_l.count(k) for k in keywords)
        if score > best_score:
            best_score, best_genre = score, g

    tone = "Dark" if any(w in prompt_l for w in ["dark", "disappear", "void", "lost", "alone", "death"]) else \
           "Hopeful" if any(w in prompt_l for w in ["hope", "survive", "rescue", "find", "return", "light"]) else \
           "Mysterious" if any(w in prompt_l for w in ["mystery", "secret", "strange", "unknown"]) else \
           "Light" if any(w in prompt_l for w in ["funny", "comedy", "laugh", "joy"]) else "Epic"

    return best_genre, tone

def generate_title(prompt: str) -> str:
    words = [w for w in prompt.split() if len(w) > 3]
    caps = [w for w in words if w[0].isupper() or len(w) > 5]
    return " ".join(caps[:3]) if caps else (words[0].title() if words else "Untitled")

def generate_logline(prompt: str, genre: str) -> str:
    hero = {"Sci-Fi": "an astronaut", "Horror": "a survivor", "Fantasy": "a chosen one",
            "Comedy": "an unlikely hero", "Action": "a hero", "Thriller": "one person",
            "Romance": "two souls", "Drama": "a person"}.get(genre, "a protagonist")
    p = prompt.lower().strip(".!?").strip()
    return f"In a world where {p}, {hero} must confront the unimaginable."

def generate_characters(genre: str) -> list:
    templates = {
        "Sci-Fi": [
            {"name": "Alex", "age": 34, "personality": "Resourceful, analytical, haunted by solitude", "motivation": "To understand the truth", "goal": "Survive and find answers", "arc": "Fear → Determination"},
            {"name": "Dr. Kova", "age": 52, "personality": "Calm, wise, enigmatic", "motivation": "To protect the mission", "goal": "Maintain order in chaos", "arc": "Control → Acceptance"},
        ],
        "Horror": [
            {"name": "Maya", "age": 28, "personality": "Cautious, intuitive, brave", "motivation": "Escape the nightmare", "goal": "Survive the night", "arc": "Fear → Fury"},
            {"name": "The Entity", "age": 999, "personality": "Ancient, malevolent, patient", "motivation": "To consume", "goal": "Claim all souls", "arc": "Static evil"},
        ],
        "Fantasy": [
            {"name": "Elara", "age": 22, "personality": "Brave, curious, stubborn", "motivation": "Save her kingdom", "goal": "Find the Crystal of Light", "arc": "Naive → Wise"},
            {"name": "Theron", "age": 200, "personality": "Ancient, mysterious, powerful", "motivation": "Atone for past sins", "goal": "Protect the prophecy", "arc": "Guilt → Redemption"},
        ],
        "Comedy": [
            {"name": "Benny", "age": 30, "personality": "Clumsy, optimistic, loud", "motivation": "Prove everyone wrong", "goal": "Win the contest", "arc": "Loser → Winner"},
            {"name": "Zara", "age": 29, "personality": "Sarcastic, brilliant, secretly kind", "motivation": "Keep Benny alive", "goal": "Survive Benny's plans", "arc": "Cold → Caring"},
        ],
        "Action": [
            {"name": "Jack", "age": 38, "personality": "Brutal, tactical, lone wolf", "motivation": "Revenge for his family", "goal": "Destroy the enemy", "arc": "Vengeance → Justice"},
            {"name": "Agent Reyes", "age": 35, "personality": "Sharp, principled, relentless", "motivation": "Uphold the law", "goal": "Bring Jack in alive", "arc": "Hunter → Ally"},
        ],
        "Romance": [
            {"name": "Lily", "age": 26, "personality": "Dreamy, passionate, impulsive", "motivation": "Find true love", "goal": "Open her heart again", "arc": "Closed → Open"},
            {"name": "Sam", "age": 28, "personality": "Grounded, kind, shy", "motivation": "Protect his heart", "goal": "Confess his feelings", "arc": "Insecure → Confident"},
        ],
    }
    return templates.get(genre, templates["Sci-Fi"])

def generate_scenes(genre: str, tone: str, characters: list) -> list:
    locations = {
        "Sci-Fi": ["ISS Observation Deck", "Communications Bay", "Main Corridor", "Lower Module", "Quarters", "Lab Module", "Airlock", "AI Core", "Capsule", "Debris Field"],
        "Horror": ["Abandoned Ward", "Basement Morgue", "Operating Theater", "Attic", "Chapel", "Graveyard", "Secret Tunnel", "Ritual Chamber", "Roof", "The Void"],
        "Fantasy": ["Enchanted Forest", "Castle Courtyard", "Crystal Cave", "Floating Islands", "Dragon's Lair", "Ancient Library", "Market Square", "Mountain Pass", "Throne Room", "Portal Gate"],
        "Comedy": ["Food Court", "Office Cubicle", "Subway Train", "Apartment", "Rooftop", "Supermarket", "Laundromat", "Dentist Office", "Wedding Hall", "Airport"],
        "Action": ["Rooftop Chase", "Underground Bunker", "Highway", "Warehouse", "Helicopter", "Military Base", "Nightclub", "Bank Vault", "Bridge", "Airplane"],
        "Romance": ["Coffee Shop", "Bookstore", "Rainy Street", "Rooftop", "Art Gallery", "Park Bench", "Restaurant", "Ferris Wheel", "Airport Gate", "Sunset Beach"],
    }
    locs = locations.get(genre, locations["Sci-Fi"])

    times = ["Dawn", "Day", "Dusk", "Night", "Twilight", "Midnight", "Sunrise", "Storm", "Fog", "Golden Hour"]
    emotions = ["Curiosity", "Wonder", "Tension", "Dread", "Shock", "Hope", "Determination", "Intensity", "Relief", "Uncertain"]

    scenes = []
    for i in range(10):
        scene = {
            "id": f"s{i+1}",
            "number": i + 1,
            "title": f"Chapter {i+1}",
            "location": locs[i % len(locs)],
            "time_of_day": times[i],
            "summary": f"The story continues as {characters[0]['name']} faces new challenges.",
            "emotional_tone": emotions[i],
            "duration_seconds": 20 + (i * 3),
            "sound_effects": ["ambient", "footsteps", "heartbeat"],
            "dialogue": [
                {"character": characters[0]["name"], "text": "I can sense something has changed.", "emotion": "cautious"},
                {"character": characters[1 % len(characters)]["name"], "text": "We need to keep moving. There's no turning back.", "emotion": "determined"},
            ],
        }
        scenes.append(scene)

    # Add scene-specific summaries
    summaries = [
        "The journey begins. Everything is about to change.",
        "A discovery that challenges everything they believed.",
        "Tension rises as opposing forces draw closer.",
        "Into the unknown. The darkest hour approaches.",
        "A revelation that changes the course of everything.",
        "An unlikely alliance forms against a common threat.",
        "Preparing for the final confrontation.",
        "The climax. Everything hangs in the balance.",
        "The dust settles. Nothing will be the same.",
        "A new dawn. The story continues...",
    ]
    for i, scene in enumerate(scenes):
        scene["summary"] = summaries[i]

    return scenes

def add_direction(scenes: list) -> list:
    camera_moves = [
        "Slow dolly in, intimate close-up",
        "Steadicam tracking shot, following the action",
        "Handheld, documentary-style immediacy",
        "Wide establishing shot, crane descending",
        "Dutch angle, disorienting and tense",
        "Drone shot, aerial perspective revealing scale",
        "POV shot, subjective experience",
        "Rack focus between foreground and background",
        "360° orbit around the subject",
        "Static tripod, classical composition",
    ]
    for i, scene in enumerate(scenes):
        scene["camera_movement"] = camera_moves[i % len(camera_moves)]

    return scenes

def plan_camera(scenes: list) -> list:
    shots = []
    for s in scenes:
        shots.append({
            "scene_id": s["id"],
            "shot_type": ["wide", "medium", "close-up", "over-shoulder"][s["number"] % 4],
            "movement": s.get("camera_movement", "static"),
            "angle": ["eye-level", "low-angle", "high-angle", "dutch"][s["number"] % 4],
            "lens": ["35mm", "50mm", "85mm", "24mm"][s["number"] % 4],
        })
    return shots

def extract_voice_lines(scenes: list) -> list:
    lines = []
    for s in scenes:
        for d in s.get("dialogue", []):
            lines.append({"character": d["character"], "text": d["text"], "emotion": d["emotion"]})
    return lines

def compose_music(scenes: list) -> list:
    tracks = []
    for s in scenes:
        emotion = s.get("emotional_tone", "Neutral").lower()
        tempo = 140 if any(w in emotion for w in ["tension", "intensity"]) else \
                110 if any(w in emotion for w in ["hope", "determination"]) else \
                80 if any(w in emotion for w in ["dread", "shock"]) else 95
        key = ["C", "Dm", "Em", "F", "G", "Am"][s["number"] % 6]
        instruments = ["strings (pizzicato)", "taiko drums", "sub-bass"] if tempo > 120 else \
                      ["grand piano", "soft strings", "glockenspiel"] if tempo < 90 else \
                      ["synthesizer", "ambient pads", "electronic percussion"]
        tracks.append({"scene_id": s["id"], "mood": s["emotional_tone"], "tempo": tempo, "key": key, "instruments": instruments})
    return tracks

def assemble_script(title: str, logline: str, scenes: list) -> str:
    lines = [f"# {title}", "", f"**{logline}**", ""]
    for s in scenes:
        lines.append(f"\n## Scene {s['number']}: {s.get('title', '')}")
        lines.append(f"*{s['location']} — {s['time_of_day']}*")
        lines.append(f"\nCamera: {s.get('camera_movement', 'Static')}")
        lines.append(f"\n{s['summary']}")
        for d in s.get("dialogue", []):
            lines.append(f"\n**{d['character']}** ({d['emotion']}): {d['text']}")
        lines.append("")
    return "\n".join(lines)

def rewrite_script(prompt: str, instruction: str) -> dict:
    new_prompt = f"{prompt}. REWRITE: {instruction}"
    return run_pipeline(new_prompt)

# ─── FastAPI App ────────────────────────────────────

app = FastAPI(title="CineForge AI", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "CineForge AI", "version": "2.0.0", "films_in_store": len(store)}

@app.post("/api/films")
async def create_film(body: CreateFilmReq):
    film_id = str(uuid.uuid4())[:8]
    store[film_id] = {
        "id": film_id, "title": "", "status": "pending", "prompt": body.prompt,
        "full_script": "", "logline": "", "genre": "", "tone": "",
        "pipeline_result": None,
        "video_url": "", "trailer_url": "", "cover_image_url": "",
        "co_authors": "[]", "version": 1, "parent_id": "", "is_infinite": False,
        "created_at": datetime.utcnow().isoformat(),
    }
    return {"id": film_id, "status": "pending", "message": "Film created"}

@app.get("/api/films/{film_id}")
async def get_film(film_id: str):
    film = store.get(film_id)
    if not film:
        raise HTTPException(404, "Film not found")
    return film

@app.get("/api/films")
async def list_films():
    return sorted(store.values(), key=lambda f: f["created_at"], reverse=True)[:50]

@app.post("/api/films/{film_id}/generate")
async def generate_film(film_id: str, infinite: bool = False):
    film = store.get(film_id)
    if not film:
        raise HTTPException(404, "Film not found")

    result = run_pipeline(film["prompt"])
    film["title"] = result["title"]
    film["logline"] = result["logline"]
    film["genre"] = result["genre"]
    film["tone"] = result["tone"]
    film["full_script"] = result["full_script"]
    film["pipeline_result"] = {k: v for k, v in result.items() if k != "status"}
    film["status"] = "completed"
    film["is_infinite"] = infinite

    return {"id": film_id, "status": "completed", "title": result["title"],
            "genre": result["genre"], "duration_seconds": result["duration_seconds"]}

@app.post("/api/films/{film_id}/rewrite")
async def rewrite_film(film_id: str, body: RewriteFilmReq):
    film = store.get(film_id)
    if not film:
        raise HTTPException(404, "Film not found")
    new_id = str(uuid.uuid4())[:8]
    new_prompt = f"{film['prompt']}. REWRITE: {body.instruction}"
    store[new_id] = {
        "id": new_id, "title": "", "status": "pending", "prompt": new_prompt,
        "full_script": "", "logline": "", "genre": "", "tone": "",
        "pipeline_result": None,
        "video_url": "", "trailer_url": "", "cover_image_url": "",
        "co_authors": "[]", "version": (film.get("version", 1) or 1) + 1,
        "parent_id": film_id, "is_infinite": False,
        "created_at": datetime.utcnow().isoformat(),
    }
    return {"id": new_id, "status": "pending", "message": f"Rewrite: {body.instruction}"}

@app.post("/api/films/{film_id}/collaborate")
async def collaborate(film_id: str, body: CollaborateReq):
    film = store.get(film_id)
    if not film:
        raise HTTPException(404, "Film not found")
    authors = json.loads(film.get("co_authors", "[]"))
    authors.append({"user_id": body.user_id, "suggestion": body.suggestion,
                    "timestamp": datetime.utcnow().isoformat()})
    film["co_authors"] = json.dumps(authors)
    return {"message": "Suggestion added", "co_authors": authors}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
