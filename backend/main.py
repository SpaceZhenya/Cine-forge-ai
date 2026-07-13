"""
CineForge AI — In-memory backend. No database, no files.
"""

import uuid
import json
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class CreateFilmReq(BaseModel):
    prompt: str

class RewriteFilmReq(BaseModel):
    instruction: str

class CollaborateReq(BaseModel):
    user_id: str
    suggestion: str


store: dict[str, dict] = {}


def run_pipeline(prompt: str) -> dict:
    words = [w for w in prompt.split() if w[0].isupper() or len(w) > 5]
    title = " ".join(words[:3]) if words else prompt.split()[0] if prompt else "Untitled"
    logline = f"In a world where {prompt.lower().strip('.').strip()}, one person must confront the unimaginable."

    scenes = [
        ("The Silence", "ISS Observation Deck", "Alex stares at the void where Earth should be."),
        ("Last Transmission", "Communications Bay", "Frantically working the radio. Only static."),
        ("Fading Signal", "Main Corridor", "Searching every window. Nothing but stars."),
        ("The Void Below", "Lower Module", "Descending into darkness. The hull creaks."),
        ("Echoes of Earth", "Quarters", "Old photos. Memories. The weight of being alone."),
        ("Desperate Calculations", "Lab Module", "The numbers don't add up. Something impossible."),
        ("The Final Broadcast", "Comm Station", "A message to anyone listening. Raw. Honest."),
        ("Into the Unknown", "Airlock", "A daring plan: descend into the atmosphere."),
        ("Ghost in the Machine", "AI Core", "The station AI shows anomalous data."),
        ("The Last Dawn", "Capsule", "Ready to plunge into the unknown. For Earth."),
    ]

    script = f"# {title}\n\n**{logline}**\n\n"
    for i, (st, loc, summary) in enumerate(scenes, 1):
        script += f"## Scene {i}: {st}\n*{loc}*\n\n{summary}\n\n"

    return {"title": title, "logline": logline, "full_script": script, "status": "completed"}


app = FastAPI(title="CineForge AI")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "films_in_store": len(store)}


@app.post("/api/films")
async def create_film(body: CreateFilmReq):
    film_id = str(uuid.uuid4())[:8]
    store[film_id] = {
        "id": film_id,
        "title": "",
        "status": "pending",
        "prompt": body.prompt,
        "full_script": "",
        "logline": "",
        "video_url": "",
        "trailer_url": "",
        "cover_image_url": "",
        "co_authors": "[]",
        "version": 1,
        "parent_id": "",
        "created_at": datetime.utcnow().isoformat(),
    }
    return {"id": film_id, "status": "pending", "message": "Created"}


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
async def generate_film(film_id: str):
    film = store.get(film_id)
    if not film:
        raise HTTPException(404, "Film not found")
    result = run_pipeline(film["prompt"])
    film.update(result)
    return {"id": film_id, "status": "completed", "title": film["title"]}


@app.post("/api/films/{film_id}/rewrite")
async def rewrite_film(film_id: str, body: RewriteFilmReq):
    film = store.get(film_id)
    if not film:
        raise HTTPException(404, "Film not found")
    new_id = str(uuid.uuid4())[:8]
    new_prompt = f"{film['prompt']}. REWRITE: {body.instruction}"
    store[new_id] = {
        "id": new_id, "title": "", "status": "pending", "prompt": new_prompt,
        "full_script": "", "logline": "", "video_url": "", "trailer_url": "",
        "cover_image_url": "", "co_authors": "[]", "version": film["version"] + 1,
        "parent_id": film_id, "created_at": datetime.utcnow().isoformat(),
    }
    return {"id": new_id, "status": "pending", "message": f"Rewrite: {body.instruction}"}


@app.post("/api/films/{film_id}/collaborate")
async def collaborate(film_id: str, body: CollaborateReq):
    film = store.get(film_id)
    if not film:
        raise HTTPException(404, "Film not found")
    co_authors = json.loads(film.get("co_authors", "[]"))
    co_authors.append({"user_id": body.user_id, "suggestion": body.suggestion})
    film["co_authors"] = json.dumps(co_authors)
    return {"message": "Suggestion added", "co_authors": co_authors}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
