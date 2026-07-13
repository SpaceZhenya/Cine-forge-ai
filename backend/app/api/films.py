"""
Film API endpoints — create, get, update, and manage film projects.
Supports co-authoring and infinite movie mode.
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import json

from app.models import FilmModel, SceneModel, CharacterModel, get_db
from shared.types import FilmProject, FilmIdea, PipelineStatus
from app.pipeline.graph import create_film_pipeline

router = APIRouter(prefix="/api/films", tags=["films"])


@router.post("")
async def create_film(prompt: str, db: AsyncSession = Depends(get_db)):
    project = FilmProject(
        idea=FilmIdea(prompt=prompt),
        status=PipelineStatus.PENDING,
    )

    db_film = FilmModel(
        prompt=prompt,
        status=project.status.value,
    )
    db.add(db_film)
    await db.commit()
    await db.refresh(db_film)

    project.id = db_film.id

    return {"id": db_film.id, "status": project.status.value, "message": "Film project created"}


@router.post("/{film_id}/generate")
async def generate_film(film_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FilmModel).where(FilmModel.id == film_id))
    db_film = result.scalar_one_or_none()
    if not db_film:
        raise HTTPException(404, "Film not found")

    project = _db_to_project(db_film)

    async def on_status_change(proj: FilmProject):
        await db.execute(
            FilmModel.__table__.update().where(FilmModel.id == film_id).values(
                status=proj.status.value,
                title=proj.title,
                full_script=proj.script.full_text,
                video_url=proj.video_url,
                trailer_url=proj.trailer_url,
                cover_image_url=proj.cover_image_url,
            )
        )
        await db.commit()

    pipeline = create_film_pipeline(on_status_change=on_status_change)
    project = await pipeline.run(project)

    db_film.status = project.status.value
    db_film.title = project.title
    db_film.full_script = project.script.full_text
    db_film.video_url = project.video_url
    db_film.trailer_url = project.trailer_url
    db_film.cover_image_url = project.cover_image_url
    await db.commit()

    return {"id": film_id, "status": project.status.value, "title": project.title}


@router.get("/{film_id}")
async def get_film(film_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FilmModel).where(FilmModel.id == film_id))
    db_film = result.scalar_one_or_none()
    if not db_film:
        raise HTTPException(404, "Film not found")
    return _film_to_dict(db_film)


@router.get("")
async def list_films(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FilmModel).order_by(FilmModel.created_at.desc()).limit(50))
    films = result.scalars().all()
    return [_film_to_dict(f) for f in films]


@router.post("/{film_id}/rewrite")
async def rewrite_film(film_id: str, instruction: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FilmModel).where(FilmModel.id == film_id))
    db_film = result.scalar_one_or_none()
    if not db_film:
        raise HTTPException(404, "Film not found")

    project = _db_to_project(db_film)
    project.idea.prompt = f"{project.idea.prompt}. REWRITE: {instruction}"
    project.version += 1

    old_id = project.id
    project.id = ""

    db_film.parent_id = old_id
    db_film.version = project.version
    db_film.status = PipelineStatus.PENDING.value
    db_film.prompt = project.idea.prompt
    await db.commit()

    return {"id": db_film.id, "status": "pending", "message": f"Rewrite in progress: {instruction}"}


@router.post("/{film_id}/collaborate")
async def add_collaboration(film_id: str, user_id: str, suggestion: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FilmModel).where(FilmModel.id == film_id))
    db_film = result.scalar_one_or_none()
    if not db_film:
        raise HTTPException(404, "Film not found")

    co_authors = db_film.co_authors or []
    co_authors.append({"user_id": user_id, "suggestion": suggestion})
    db_film.co_authors = co_authors
    await db.commit()

    return {"message": "Suggestion added", "co_authors": co_authors}


@router.websocket("/ws/{film_id}")
async def film_websocket(websocket: WebSocket, film_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            elif msg.get("type") == "suggestion":
                await websocket.send_json({
                    "type": "suggestion_received",
                    "film_id": film_id,
                    "suggestion": msg.get("text", ""),
                })
    except WebSocketDisconnect:
        pass


def _db_to_project(db_film: FilmModel) -> FilmProject:
    return FilmProject(
        id=db_film.id,
        title=db_film.title,
        status=PipelineStatus(db_film.status) if db_film.status else PipelineStatus.PENDING,
        idea=FilmIdea(prompt=db_film.prompt),
        script=Script(full_text=db_film.full_script or ""),
        video_url=db_film.video_url or "",
        trailer_url=db_film.trailer_url or "",
        cover_image_url=db_film.cover_image_url or "",
        is_infinite=db_film.is_infinite or False,
        co_authors=db_film.co_authors or [],
        version=db_film.version or 1,
        parent_id=db_film.parent_id or "",
    )


def _film_to_dict(db_film: FilmModel) -> dict:
    return {
        "id": db_film.id,
        "title": db_film.title,
        "status": db_film.status,
        "prompt": db_film.prompt,
        "logline": db_film.logline,
        "genre": db_film.genre,
        "tone": db_film.tone,
        "duration_minutes": db_film.duration_minutes,
        "full_script": db_film.full_script,
        "cover_image_url": db_film.cover_image_url,
        "video_url": db_film.video_url,
        "trailer_url": db_film.trailer_url,
        "is_infinite": db_film.is_infinite,
        "co_authors": db_film.co_authors,
        "version": db_film.version,
        "parent_id": db_film.parent_id,
        "created_at": db_film.created_at,
        "updated_at": db_film.updated_at,
    }


from shared.types import Script
