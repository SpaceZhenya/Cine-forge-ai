"""
AI Director — breaks down scenes with visual direction, camera blocking,
and determines the emotional arc of each scene.
"""

from shared.types import FilmProject


def break_down_scenes(project: FilmProject) -> FilmProject:
    for scene in project.script.scenes:
        scene.camera_movement = _plan_camera(scene.emotional_tone, scene.location)
        scene.storyboard_prompt = _build_storyboard_prompt(scene, project.script.characters)
    return project


def _plan_camera(emotion: str, location: str) -> str:
    if "panic" in emotion.lower() or "intensity" in emotion.lower():
        return "Handheld, shaky cam, rapid cuts, breathing lens"
    elif "calm" in emotion.lower() or "reflection" in emotion.lower():
        return "Slow dolly in, steady wide shot, long take"
    elif "mystery" in emotion.lower() or "uneasy" in emotion.lower():
        return "Dutch angles, slow push-in, shallow focus"
    elif "determination" in emotion.lower() or "climax" in emotion.lower():
        return "Stedicam tracking, heroic low angles, crash zoom"
    else:
        return "Static tripod, medium shot, smooth pan"


def _build_storyboard_prompt(scene, characters) -> str:
    char_names = ", ".join(c.name for c in characters) if characters else "astronaut"
    return (
        f"Scene: {scene.title}. "
        f"Location: {scene.location} at {scene.time_of_day}. "
        f"Characters: {char_names}. "
        f"Action: {scene.summary}. "
        f"Camera: {scene.camera_movement}. "
        f"Mood: {scene.emotional_tone}. "
        f"Style: Cinematic, photorealistic, IMAX-quality, film grain."
    )
