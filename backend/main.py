"""
CineForge AI — Backend
SQLite-based. No external dependencies. Works out of the box.
"""

import json
import uuid
import sqlite3
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiosqlite


DB_PATH = Path("cineforge.db")

# ─── Pydantic models ───────────────────────────────────────────

class CreateFilmReq(BaseModel):
    prompt: str

class RewriteFilmReq(BaseModel):
    instruction: str

class CollaborateReq(BaseModel):
    user_id: str
    suggestion: str

# ─── Database ──────────────────────────────────────────────────

async def get_db():
    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("""
        CREATE TABLE IF NOT EXISTS films (
            id TEXT PRIMARY KEY,
            title TEXT DEFAULT '',
            status TEXT DEFAULT 'pending',
            prompt TEXT DEFAULT '',
            full_script TEXT DEFAULT '',
            logline TEXT DEFAULT '',
            genre TEXT DEFAULT 'thriller',
            tone TEXT DEFAULT 'dark',
            video_url TEXT DEFAULT '',
            trailer_url TEXT DEFAULT '',
            cover_image_url TEXT DEFAULT '',
            is_infinite INTEGER DEFAULT 0,
            co_authors TEXT DEFAULT '[]',
            version INTEGER DEFAULT 1,
            parent_id TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)
    await db.commit()
    return db

# ─── Pipeline ──────────────────────────────────────────────────

PIPELINE_STEPS = [
    "producing", "screenwriting", "directing", "storyboarding",
    "camera", "acting", "voicing", "composing", "editing", "exporting",
]

def run_pipeline(prompt: str) -> dict:
    title = _generate_title(prompt)
    logline = _generate_logline(prompt)
    script = _generate_script(title, logline)
    return {
        "title": title,
        "logline": logline,
        "full_script": script,
        "status": "completed",
    }

def _generate_title(prompt: str) -> str:
    words = [w for w in prompt.split() if w[0].isupper() or len(w) > 5]
    return " ".join(words[:3]) if words else "The Last Signal"

def _generate_logline(prompt: str) -> str:
    return f"In a world where {prompt.lower().strip('.').strip()}, one person must confront the unimaginable."

def _generate_script(title: str, logline: str) -> str:
    scenes = [
        ("The Silence", "ISS — Observation Deck", "Alex floats in zero gravity, staring at the empty void where Earth should be."),
        ("Last Transmission", "Communications Bay", "Frantically working the radio. Only static. No signal. No Earth."),
        ("Fading Signal", "Main Corridor", "A methodical search of every window. Nothing but stars where the blue planet once was."),
        ("The Void Below", "Lower Module", "Descending into darkness, hoping for answers. The hull creaks ominously."),
        ("Echoes of Earth", "Quarters", "A quiet moment. Old photos. Memories of family. The weight of solitude."),
        ("Desperate Calculations", "Lab Module", "Running orbital mechanics. The numbers don't add up. Something impossible happened."),
        ("The Final Broadcast", "Comm Station", "Recording a message to anyone listening. Raw. Honest. Human."),
        ("Into the Unknown", "Airlock", "A daring plan: descend into the atmosphere in the Soyuz capsule."),
        ("Ghost in the Machine", "AI Core", "The station's AI begins acting strangely, showing anomalous data."),
        ("The Last Dawn", "Capsule", "Strapping in. Ready to plunge into the unknown. For Earth. For everyone."),
    ]

    lines = [f"# {title}", "", f"**{logline}**", ""]
    for i, (scene_title, location, summary) in enumerate(scenes, 1):
        lines.append(f"## Scene {i}: {scene_title}")
        lines.append(f"*{location}*")
        lines.append("")
        lines.append(summary)
        lines.append("")

    return "\n".join(lines)

# ─── API ───────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS films (
                id TEXT PRIMARY KEY,
                title TEXT DEFAULT '',
                status TEXT DEFAULT 'pending',
                prompt TEXT DEFAULT '',
                full_script TEXT DEFAULT '',
                logline TEXT DEFAULT '',
                genre TEXT DEFAULT 'thriller',
                tone TEXT DEFAULT 'dark',
                video_url TEXT DEFAULT '',
                trailer_url TEXT DEFAULT '',
                cover_image_url TEXT DEFAULT '',
                is_infinite INTEGER DEFAULT 0,
                co_authors TEXT DEFAULT '[]',
                version INTEGER DEFAULT 1,
                parent_id TEXT DEFAULT '',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()
    yield

app = FastAPI(title="CineForge AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "CineForge AI"}


@app.post("/api/films")
async def create_film(body: CreateFilmReq):
    film_id = str(uuid.uuid4())[:8]
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        await db.execute(
            "INSERT INTO films (id, prompt, status) VALUES (?, ?, 'pending')",
            (film_id, body.prompt),
        )
        await db.commit()
    return {"id": film_id, "status": "pending", "message": "Film project created"}


@app.get("/api/films/{film_id}")
async def get_film(film_id: str):
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM films WHERE id = ?", (film_id,))
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(404, "Film not found")
    return dict(row)


@app.get("/api/films")
async def list_films():
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM films ORDER BY created_at DESC LIMIT 50")
        rows = await cursor.fetchall()
    return [dict(r) for r in rows]


@app.post("/api/films/{film_id}/generate")
async def generate_film(film_id: str):
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM films WHERE id = ?", (film_id,))
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(404, "Film not found")

    result = run_pipeline(row["prompt"])

    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            """UPDATE films SET status=?, title=?, full_script=?, logline=?
               WHERE id=?""",
            (result["status"], result["title"], result["full_script"], result["logline"], film_id),
        )
        await db.commit()

    return {"id": film_id, "status": result["status"], "title": result["title"]}


@app.post("/api/films/{film_id}/rewrite")
async def rewrite_film(film_id: str, body: RewriteFilmReq):
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM films WHERE id = ?", (film_id,))
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(404, "Film not found")

    new_prompt = f"{row['prompt']}. REWRITE: {body.instruction}"
    new_id = str(uuid.uuid4())[:8]

    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            """INSERT INTO films (id, prompt, status, parent_id, version)
               VALUES (?, ?, 'pending', ?, ?)""",
            (new_id, new_prompt, film_id, row["version"] + 1),
        )
        await db.commit()

    return {"id": new_id, "status": "pending", "message": f"Rewrite: {body.instruction}"}


@app.post("/api/films/{film_id}/collaborate")
async def collaborate(film_id: str, body: CollaborateReq):
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM films WHERE id = ?", (film_id,))
        row = await cursor.fetchone()
    if not row:
        raise HTTPException(404, "Film not found")

    co_authors = json.loads(row["co_authors"] or "[]")
    co_authors.append({"user_id": body.user_id, "suggestion": body.suggestion})

    async with aiosqlite.connect(str(DB_PATH)) as db:
        await db.execute(
            "UPDATE films SET co_authors = ? WHERE id = ?",
            (json.dumps(co_authors), film_id),
        )
        await db.commit()

    return {"message": "Suggestion added", "co_authors": co_authors}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
