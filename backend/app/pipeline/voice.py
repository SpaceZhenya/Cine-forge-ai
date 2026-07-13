"""
AI Voice — generates voice audio for each character.
In production, calls OpenAI TTS or a local model.
"""

from shared.types import FilmProject


def generate_voices(project: FilmProject) -> FilmProject:
    for vl in project.voice_lines:
        vl.audio_url = f"/audio/{project.id}/{_slugify(vl.character)}/{_slugify(vl.text[:20])}.mp3"
    return project


def _slugify(text: str) -> str:
    return text.lower().replace(" ", "_").replace("?", "").replace("!", "")[:30]
