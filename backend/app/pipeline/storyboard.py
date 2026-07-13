"""
AI Storyboard — generates frame descriptions for each scene.
In production, this would call Sora / DALL-E / Stable Diffusion.
"""

from shared.types import FilmProject


def generate_storyboard(project: FilmProject) -> FilmProject:
    for scene in project.script.scenes:
        scene.storyboard_prompt = _enhance_prompt(scene.storyboard_prompt, scene)
    return project


def _enhance_prompt(base_prompt: str, scene) -> str:
    return (
        f"{base_prompt} "
        f"Shot: Cinematic composition, 24fps, anamorphic lens. "
        f"Lighting: {_get_lighting(scene.time_of_day)}. "
        f"Color grade: {_get_color_grade(scene.emotional_tone)}. "
        f"Atmosphere: {scene.emotional_tone}."
    )


def _get_lighting(time_of_day: str) -> str:
    if "dawn" in time_of_day.lower() or "first light" in time_of_day.lower():
        return "Soft golden hour light streaming through ports"
    elif "dusk" in time_of_day.lower() or "dark" in time_of_day.lower():
        return "Low key, hard shadows, emergency lighting"
    elif "shadow" in time_of_day.lower() or "night" in time_of_day.lower():
        return "Minimal, harsh directional light from helmet lamp"
    else:
        return "Mixed artificial and natural space light"


def _get_color_grade(emotion: str) -> str:
    if "fear" in emotion.lower() or "panic" in emotion.lower():
        return "Cold blues, crushed blacks, desaturated"
    elif "hope" in emotion.lower() or "calm" in emotion.lower():
        return "Warm ambers, soft contrast, slightly boosted"
    elif "mystery" in emotion.lower() or "uneasy" in emotion.lower():
        return "Teal-green shadows, high contrast, subtle grain"
    elif "determination" in emotion.lower() or "climax" in emotion.lower():
        return "High contrast, warm highlights, deep shadows"
    else:
        return "Neutral, documentary-style"
