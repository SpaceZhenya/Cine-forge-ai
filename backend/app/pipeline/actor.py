"""
AI Actor — enriches character emotions and motivations per scene.
Prepares emotional context for voice generation.
"""

from shared.types import FilmProject, VoiceLine


def create_emotions(project: FilmProject) -> FilmProject:
    voice_lines = []

    for scene in project.script.scenes:
        for line in scene.dialogue:
            emotion = line.get("emotion", "neutral")
            voice_lines.append(VoiceLine(
                character=line["character"],
                text=line["text"],
                emotion=emotion,
                timing_seconds=_estimate_timing(line["text"]),
            ))

    project.voice_lines = voice_lines
    return project


def _estimate_timing(text: str) -> float:
    word_count = len(text.split())
    base_time = word_count * 0.3
    pause_time = 0.5
    return round(base_time + pause_time, 1)
