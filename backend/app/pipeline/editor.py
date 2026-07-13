"""
AI Editor — assembles all assets into the final film.
Coordinates video clips, audio tracks, music, and effects.
Generates trailer, poster, and social clips.
"""

from shared.types import FilmProject


def assemble_film(project: FilmProject) -> FilmProject:
    project.video_url = f"/output/{project.id}/film.mp4"
    project.trailer_url = f"/output/{project.id}/trailer.mp4"
    project.cover_image_url = f"/output/{project.id}/poster.png"

    return project


def create_trailer(project: FilmProject) -> str:
    trailer_path = f"/output/{project.id}/trailer.mp4"
    return trailer_path


def create_poster(project: FilmProject) -> str:
    poster_path = f"/output/{project.id}/poster.png"
    return poster_path


def create_social_clips(project: FilmProject) -> list[str]:
    return [
        f"/output/{project.id}/clips/tiktok_1.mp4",
        f"/output/{project.id}/clips/reel_1.mp4",
        f"/output/{project.id}/clips/short_1.mp4",
    ]
