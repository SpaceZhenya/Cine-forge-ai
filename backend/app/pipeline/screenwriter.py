"""
AI Screenwriter — generates a full script with scenes and dialogue.
"""

from shared.types import FilmProject, Scene


def write_script(project: FilmProject) -> FilmProject:
    idea = project.idea
    characters = project.script.characters

    scenes = _generate_scenes(idea.logline, characters, idea.duration_minutes)

    project.script.scenes = scenes
    project.script.logline = idea.logline
    project.script.title = project.title
    project.script.full_text = _build_full_text(project.title, idea.logline, scenes)

    return project


def _generate_scenes(logline: str, characters: list, duration: int) -> list[Scene]:
    num_scenes = max(3, duration // 2)

    scenes = [
        Scene(
            id=f"scene_{i+1}",
            number=i + 1,
            title=_scene_titles[i] if i < len(_scene_titles) else f"Chapter {i+1}",
            location=_locations[i % len(_locations)],
            time_of_day=_times[i % len(_times)],
            summary=_summaries[i] if i < len(_summaries) else f"The story continues as {characters[0].name} faces new challenges.",
            duration_seconds=max(20, 1800 // num_scenes),
            emotional_tone=_emotions[i % len(_emotions)],
            sound_effects=_sounds[i % len(_sounds)],
        )
        for i in range(num_scenes)
    ]

    _add_dialogue(scenes, characters)
    return scenes


_scene_titles = [
    "The Silence of Space",
    "Last Transmission",
    "Fading Signal",
    "The Void Below",
    "Echoes of Earth",
    "Desperate Calculations",
    "The Final Broadcast",
    "Into the Unknown",
    "Ghost in the Machine",
    "The Last Dawn",
]

_locations = [
    "ISS — Observation Deck",
    "ISS — Communications Bay",
    "ISS — Main Corridor",
    "Capsule — Interior",
    "Deep Space — Suit Cam View",
    "ISS — Laboratory Module",
    "Abandoned Russian Module",
    "Airlock — Preparing for EVA",
    "Exterior — Floating in Orbit",
    "Capsule — Re-entry Sequence",
]

_times = [
    "Orbit Dawn",
    "Mission Time +24h",
    "Orbit Dusk",
    "Total Darkness",
    "Earth's Shadow",
    "First Light",
    "The Long Night",
    "Solar Flare",
]

_emotions = [
    "Tension and disbelief",
    "Urgency mixed with fear",
    "Isolation and despair",
    "Determination through dread",
    "Moments of calm reflection",
    "Building panic",
    "Resolve and acceptance",
    "Hope against all odds",
    "Mystery and wonder",
    "Climactic intensity",
]

_sounds = [
    "Eerie silence, low hum of life support",
    "Static crackle, distant alarm beeps",
    "Breathing echoes in helmet",
    "Metal creaking, air hissing",
    "Heartbeat, faint radio static",
    "Keyboard clicks, system warnings",
    "Reverberating silence",
    "Suit joints moving, oxygen flow",
    "Wind tunnel (simulated)",
    "Explosive decompression warning",
]


_summaries = [
    "Alex floats in the observation deck, staring at the empty space where Earth should be. Disbelief turns to cold realization.",
    "Frantically trying all communication channels. Only static returns. Alex records a log entry, voice trembling.",
    "A methodical search of the station confirms the worst: every window shows nothing but stars where the blue planet once was.",
    "Alex descends into the lower modules, hoping to find answers. The darkness feels alive.",
    "A quiet moment of reflection. Alex looks at old photos, memories of family flood back.",
    "Running calculations, checking orbital mechanics. Nothing explains the disappearance. A pattern begins to emerge.",
    "Alex decides to broadcast a最后一message to anyone who might be listening. The words are raw, honest, human.",
    "A daring plan takes shape. Alex will use the Soyuz capsule to descend into the atmosphere and search for answers.",
    "The station's AI begins acting strangely — showing data that doesn't make sense, as if hiding something.",
    "The final scene. Alex straps into the capsule, ready to plunge into the unknown below.",
]


def _add_dialogue(scenes: list[Scene], characters: list):
    dialogues = [
        [
            {"character": characters[0].name, "text": "It's gone. My God... it's just... gone.", "emotion": "shock"},
            {"character": characters[0].name, "text": "Houston? Houston, do you copy? Please... anyone?", "emotion": "desperation"},
        ],
        [
            {"character": characters[0].name, "text": "Mission log, day one. Earth has vanished. I'm initiating search protocols.", "emotion": "controlled panic"},
            {"character": characters[1].name if len(characters) > 1 else "COM", "text": "— ...s...tatic... —", "emotion": "distant"},
        ],
        [
            {"character": characters[0].name, "text": "Every window. Every camera. Nothing. It's like she was never here.", "emotion": "hollow"},
        ],
        [
            {"character": characters[0].name, "text": "The dark down here... it presses against the hull. I can feel it.", "emotion": "uneasy"},
        ],
        [
            {"character": characters[0].name, "text": "Sarah... I'm sorry I didn't say goodbye properly. I thought I'd have more time.", "emotion": "grief"},
        ],
        [
            {"character": characters[0].name, "text": "If the math is right... and I pray it's not... this isn't a natural phenomenon.", "emotion": "grim realization"},
        ],
        [
            {"character": characters[0].name, "text": "If anyone is out there. If anyone can hear this. My name is Alex. I was aboard the ISS. And I'm still here.", "emotion": "resolute"},
        ],
        [
            {"character": characters[0].name, "text": "I'm taking the Soyuz. Whatever happened to Earth, the answers are down there. Or I'll die trying.", "emotion": "determined"},
        ],
        [
            {"character": "AI", "text": "Warning: Unauthorized data access detected. Life support compromised.", "emotion": "flat"},
            {"character": characters[0].name, "text": "You knew. You've known this whole time. What did you see?", "emotion": "accusatory"},
        ],
        [
            {"character": characters[0].name, "text": "This is it. Whatever's waiting for me... I'm ready. For Earth. For all of us.", "emotion": "peaceful determination"},
        ],
    ]

    for i, scene in enumerate(scenes):
        if i < len(dialogues):
            scene.dialogue = dialogues[i]


def _build_full_text(title: str, logline: str, scenes: list[Scene]) -> str:
    lines = [f"# {title}", "", f"**Logline:** {logline}", ""]
    for scene in scenes:
        lines.append(f"## Scene {scene.number}: {scene.title}")
        lines.append(f"*{scene.location} — {scene.time_of_day}*")
        lines.append(f"")
        lines.append(scene.summary)
        for line in scene.dialogue:
            lines.append(f"\n**{line['character']}** ({line['emotion']}): {line['text']}")
        lines.append("")
    return "\n".join(lines)
