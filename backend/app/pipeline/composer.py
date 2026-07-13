"""
AI Composer — generates music cues for each scene.
Assigns mood, tempo, and key based on scene emotion.
"""

from shared.types import FilmProject, MusicTrack


def compose_music(project: FilmProject) -> FilmProject:
    tracks = []
    for scene in project.script.scenes:
        mood = _detect_mood(scene.emotional_tone)
        tracks.append(MusicTrack(
            scene_id=scene.id,
            mood=mood,
            tempo=_pick_tempo(mood),
            key=_pick_key(scene.number),
            instruments=_pick_instruments(mood),
            duration_seconds=scene.duration_seconds,
        ))
    project.music_tracks = tracks
    return project


def _detect_mood(emotion: str) -> str:
    mood_map = {
        "fear": "dark ambient",
        "panic": "tense percussion",
        "sad": "mournful strings",
        "hope": "uplifting piano",
        "mystery": "ethereal synth",
        "action": "driving orchestra",
        "calm": "minimal piano",
        "grief": "slow cello",
    }
    for key, mood in mood_map.items():
        if key in emotion.lower():
            return mood
    return "ambient electronic"


def _pick_tempo(mood: str) -> int:
    if "action" in mood or "driving" in mood:
        return 140
    elif "tense" in mood:
        return 120
    elif "ambient" in mood or "mournful" in mood:
        return 70
    elif "uplifting" in mood:
        return 100
    else:
        return 90


def _pick_key(scene_number: int) -> str:
    keys = ["C", "Dm", "Em", "F", "G", "Am", "Bb", "D"]
    return keys[scene_number % len(keys)]


def _pick_instruments(mood: str) -> list[str]:
    instrument_map = {
        "dark ambient": ["synthesizer pad", "sub-bass", "textural drones"],
        "tense percussion": ["taiko drums", "snare rolls", "cymbal swells"],
        "mournful strings": ["cello", "viola", "string ensemble"],
        "uplifting piano": ["grand piano", "strings", "soft percussion"],
        "ethereal synth": ["analog synth", "glass pad", "reversed sounds"],
        "driving orchestra": ["full orchestra", "brass", "timpani"],
        "minimal piano": ["solo piano", "room tone"],
        "slow cello": ["cello", "double bass", "ambient pad"],
    }
    return instrument_map.get(mood, ["piano", "synth pad"])
