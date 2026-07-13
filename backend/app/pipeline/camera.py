"""
AI Camera — plans detailed camera movements and shot types for each scene.
"""

from shared.types import FilmProject, CameraShot


def plan_camera(project: FilmProject) -> FilmProject:
    shots = []
    for scene in project.script.scenes:
        shot_count = max(1, scene.duration_seconds // 10)
        for i in range(shot_count):
            shots.append(CameraShot(
                scene_id=scene.id,
                shot_type=_pick_shot_type(i, shot_count, scene.emotional_tone),
                movement=_pick_movement(i, scene.camera_movement),
                angle=_pick_angle(i, scene.emotional_tone),
                lens=_pick_lens(i, scene.emotional_tone),
                description=f"Shot {i+1} of scene {scene.number}: {scene.summary[:50]}..."
            ))
    project.camera_shots = shots
    return project


def _pick_shot_type(i: int, total: int, emotion: str) -> str:
    if i == 0:
        return "wide" if "space" in emotion.lower() else "establishing"
    elif i == total - 1:
        return "close-up" if "intimate" in emotion.lower() else "medium"
    else:
        import random
        return random.choice(["close-up", "medium", "over-shoulder", "insert"])


def _pick_movement(i: int, camera_plan: str) -> str:
    if "handheld" in camera_plan.lower():
        return "handheld"
    elif "dolly" in camera_plan.lower():
        return "dolly-in" if i % 2 == 0 else "dolly-out"
    elif "steady" in camera_plan.lower():
        return "steadicam"
    else:
        import random
        return random.choice(["static", "pan-left", "pan-right", "tilt-up"])


def _pick_angle(i: int, emotion: str) -> str:
    if i == 0:
        return "eye-level"
    elif "power" in emotion.lower() or "hero" in emotion.lower():
        return "low-angle"
    elif "vulnerable" in emotion.lower() or "fear" in emotion.lower():
        return "high-angle"
    else:
        import random
        return random.choice(["eye-level", "low-angle", "dutch"])


def _pick_lens(i: int, emotion: str) -> str:
    if "intimate" in emotion.lower() or "close" in emotion.lower():
        return "85mm"
    elif "epic" in emotion.lower() or "wide" in emotion.lower():
        return "24mm"
    elif "mystery" in emotion.lower():
        return "50mm with anamorphic adapter"
    else:
        return "35mm"
