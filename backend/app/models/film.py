import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, Text, JSON, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
from shared.types import PipelineStatus, Genre, Tone


def ulid() -> str:
    return str(uuid.uuid4())[:8] + datetime.utcnow().strftime("%Y%m%d%H%M%S")


class FilmModel(Base):
    __tablename__ = "films"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=ulid)
    title: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(32), default=PipelineStatus.PENDING.value)
    prompt: Mapped[str] = mapped_column(Text, default="")
    logline: Mapped[str] = mapped_column(Text, default="")
    genre: Mapped[str] = mapped_column(String(32), default=Genre.THRILLER.value)
    tone: Mapped[str] = mapped_column(String(32), default=Tone.DARK.value)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=10)
    full_script: Mapped[str] = mapped_column(Text, default="")
    cover_image_url: Mapped[str] = mapped_column(String(512), default="")
    video_url: Mapped[str] = mapped_column(String(512), default="")
    trailer_url: Mapped[str] = mapped_column(String(512), default="")
    is_infinite: Mapped[bool] = mapped_column(Boolean, default=False)
    co_authors: Mapped[list] = mapped_column(JSON, default=list)
    version: Mapped[int] = mapped_column(Integer, default=1)
    parent_id: Mapped[str] = mapped_column(String(36), default="")
    created_at: Mapped[str] = mapped_column(String(32), default=lambda: datetime.utcnow().isoformat())
    updated_at: Mapped[str] = mapped_column(String(32), default=lambda: datetime.utcnow().isoformat())

    scenes = relationship("SceneModel", back_populates="film", cascade="all, delete-orphan")
    characters = relationship("CharacterModel", back_populates="film", cascade="all, delete-orphan")


class SceneModel(Base):
    __tablename__ = "scenes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=ulid)
    film_id: Mapped[str] = mapped_column(ForeignKey("films.id"), nullable=False)
    number: Mapped[int] = mapped_column(Integer, default=0)
    title: Mapped[str] = mapped_column(String(255), default="")
    location: Mapped[str] = mapped_column(String(255), default="")
    time_of_day: Mapped[str] = mapped_column(String(64), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    dialogue: Mapped[list] = mapped_column(JSON, default=list)
    camera_movement: Mapped[str] = mapped_column(Text, default="")
    emotional_tone: Mapped[str] = mapped_column(String(64), default="")
    duration_seconds: Mapped[int] = mapped_column(Integer, default=30)
    storyboard_prompt: Mapped[str] = mapped_column(Text, default="")
    video_url: Mapped[str] = mapped_column(String(512), default="")
    music_cue: Mapped[str] = mapped_column(String(255), default="")
    sound_effects: Mapped[list] = mapped_column(JSON, default=list)

    film = relationship("FilmModel", back_populates="scenes")


class CharacterModel(Base):
    __tablename__ = "characters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=ulid)
    film_id: Mapped[str] = mapped_column(ForeignKey("films.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(128), default="")
    age: Mapped[int] = mapped_column(Integer, default=30)
    personality: Mapped[str] = mapped_column(Text, default="")
    motivation: Mapped[str] = mapped_column(Text, default="")
    goal: Mapped[str] = mapped_column(Text, default="")
    arc: Mapped[str] = mapped_column(Text, default="")
    voice_actor: Mapped[str] = mapped_column(String(128), default="")

    film = relationship("FilmModel", back_populates="characters")
