from enum import Enum
from dataclasses import dataclass, field, asdict
from typing import Optional
from datetime import datetime


class Genre(str, Enum):
    ACTION = "action"
    COMEDY = "comedy"
    DRAMA = "drama"
    THRILLER = "thriller"
    HORROR = "horror"
    SCI_FI = "sci_fi"
    FANTASY = "fantasy"
    ROMANCE = "romance"
    WESTERN = "western"
    DOCUMENTARY = "documentary"
    ANIMATION = "animation"


class Tone(str, Enum):
    DARK = "dark"
    LIGHT = "light"
    MYSTERIOUS = "mysterious"
    HOPEFUL = "hopeful"
    EPIC = "epic"
    INTIMATE = "intimate"
    SATIRICAL = "satirical"


class PipelineStatus(str, Enum):
    PENDING = "pending"
    PRODUCING = "producing"
    SCREENWRITING = "screenwriting"
    DIRECTING = "directing"
    STORYBOARDING = "storyboarding"
    CAMERA = "camera"
    ACTING = "acting"
    VOICING = "voicing"
    COMPOSING = "composing"
    EDITING = "editing"
    EXPORTING = "exporting"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class FilmIdea:
    prompt: str
    logline: str = ""
    genre: Genre = Genre.THRILLER
    tone: Tone = Tone.DARK
    duration_minutes: int = 10


@dataclass
class Character:
    name: str
    age: int = 30
    personality: str = ""
    motivation: str = ""
    goal: str = ""
    arc: str = ""


@dataclass
class Scene:
    id: str = ""
    number: int = 0
    title: str = ""
    location: str = ""
    time_of_day: str = ""
    summary: str = ""
    dialogue: list[dict] = field(default_factory=list)
    camera_movement: str = ""
    emotional_tone: str = ""
    duration_seconds: int = 30
    storyboard_prompt: str = ""
    video_url: str = ""
    music_cue: str = ""
    sound_effects: list[str] = field(default_factory=list)


@dataclass
class Script:
    title: str = ""
    logline: str = ""
    characters: list[Character] = field(default_factory=list)
    scenes: list[Scene] = field(default_factory=list)
    full_text: str = ""


@dataclass
class CameraShot:
    scene_id: str
    shot_type: str  # close-up, wide, medium, over-shoulder, etc.
    movement: str  # static, pan, tilt, dolly, crane, handheld, steadicam
    angle: str  # eye-level, low-angle, high-angle, dutch
    lens: str  # 35mm, 50mm, wide-angle, telephoto
    description: str


@dataclass
class MusicTrack:
    scene_id: str
    mood: str
    tempo: int = 120
    key: str = "C"
    instruments: list[str] = field(default_factory=list)
    audio_url: str = ""
    duration_seconds: int = 30


@dataclass
class VoiceLine:
    character: str
    text: str
    emotion: str = "neutral"
    audio_url: str = ""
    timing_seconds: float = 0.0


@dataclass
class FilmProject:
    id: str = ""
    title: str = ""
    status: PipelineStatus = PipelineStatus.PENDING
    idea: FilmIdea = field(default_factory=FilmIdea)
    script: Script = field(default_factory=Script)
    camera_shots: list[CameraShot] = field(default_factory=list)
    music_tracks: list[MusicTrack] = field(default_factory=list)
    voice_lines: list[VoiceLine] = field(default_factory=list)
    cover_image_url: str = ""
    video_url: str = ""
    trailer_url: str = ""
    created_at: str = ""
    updated_at: str = ""
    is_infinite: bool = False
    co_authors: list[str] = field(default_factory=list)
    version: int = 1
    parent_id: str = ""


@dataclass
class CoAuthorSuggestion:
    user_id: str
    suggestion: str
    timestamp: str = ""
    accepted: bool = False
