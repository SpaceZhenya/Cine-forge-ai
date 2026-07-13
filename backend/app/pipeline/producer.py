"""
AI Producer — generates the core film idea from a user prompt.
Takes a raw prompt and produces a logline, genre, tone, and character concepts.
"""

import re
from shared.types import FilmProject, FilmIdea, Genre, Tone, Character


def produce_idea(project: FilmProject) -> FilmProject:
    prompt = project.idea.prompt

    logline = _generate_logline(prompt)
    genre = _detect_genre(prompt)
    tone = _detect_tone(prompt)

    project.idea.logline = logline
    project.idea.genre = genre
    project.idea.tone = tone

    project.title = _generate_title(logline)

    project.script.characters = _generate_characters(prompt, genre)

    return project


def _generate_logline(prompt: str) -> str:
    return f"In a world where {prompt.lower().strip('.').strip()}, one person must confront the unimaginable."


_genre_keywords = {
    Genre.ACTION: ["action", "chase", "fight", "explosion", "battle", "war", "agent", "mission"],
    Genre.COMEDY: ["comedy", "funny", "humor", "laugh", "ridiculous", "silly", "hilarious"],
    Genre.DRAMA: ["drama", "emotional", "relationship", "family", "loss", "struggle"],
    Genre.THRILLER: ["thriller", "suspense", "mystery", "disappear", "dark", "twist", "astronaut", "earth", "space"],
    Genre.HORROR: ["horror", "scary", "terror", "nightmare", "monster", "ghost", "demon"],
    Genre.SCI_FI: ["sci-fi", "future", "alien", "robot", "space", "planet", "technology", "ai", "clone"],
    Genre.FANTASY: ["fantasy", "magic", "dragon", "sword", "kingdom", "mythical", "spell"],
    Genre.ROMANCE: ["romance", "love", "heart", "relationship", "passion", "romantic"],
}


def _detect_genre(prompt: str) -> Genre:
    prompt_lower = prompt.lower()
    best_genre = Genre.THRILLER
    best_score = 0

    for genre, keywords in _genre_keywords.items():
        score = sum(1 for kw in keywords if kw in prompt_lower)
        if score > best_score:
            best_score = score
            best_genre = genre

    return best_genre


_tone_keywords = {
    Tone.DARK: ["dark", "disappear", "lost", "alone", "void", "empty", "shadow", "death"],
    Tone.LIGHT: ["light", "bright", "joy", "happy", "hope", "beautiful", "wonderful"],
    Tone.MYSTERIOUS: ["mystery", "unknown", "secret", "disappear", "strange", "unexplained"],
    Tone.HOPEFUL: ["hope", "survive", "rescue", "find", "discover", "return"],
    Tone.EPIC: ["epic", "universe", "galaxy", "world", "journey", "quest", "save"],
    Tone.INTIMATE: ["personal", "alone", "inside", "mind", "memory", "dream"],
}


def _detect_tone(prompt: str) -> Tone:
    prompt_lower = prompt.lower()
    best_tone = Tone.DARK
    best_score = 0

    for tone, keywords in _tone_keywords.items():
        score = sum(1 for kw in keywords if kw in prompt_lower)
        if score > best_score:
            best_score = score
            best_tone = tone

    return best_tone


def _generate_title(logline: str) -> str:
    words = logline.split()
    significant = [w for w in words if w[0].isupper() and len(w) > 3]
    if significant:
        return " ".join(significant[:3])
    return "The Last Signal"


def _generate_characters(prompt: str, genre: Genre) -> list[Character]:
    return [
        Character(
            name="Alex",
            age=35,
            personality="Resilient, analytical, haunted by solitude",
            motivation="To understand what happened and find a way back",
            goal="Survive and uncover the truth",
            arc="From terrified isolation to determined action"
        ),
        Character(
            name="Mission Control",
            age=45,
            personality="Calm, professional, hiding fear",
            motivation="To bring Alex home safely",
            goal="Maintain communication at all costs",
            arc="Steady anchor in the chaos"
        ),
    ]
