import { NextResponse } from "next/server";
import { getFilm } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const film = getFilm(params.id);
    if (!film) {
      return NextResponse.json({ detail: "Film not found" }, { status: 404 });
    }

    // Return safe serializable version
    const result = film.pipelineResult ? {
      title: film.pipelineResult.title,
      logline: film.pipelineResult.logline,
      genre: film.pipelineResult.genre,
      tone: film.pipelineResult.tone,
      characters: film.pipelineResult.characters,
      scenes: film.pipelineResult.scenes,
      cameraShots: film.pipelineResult.cameraShots,
      musicTracks: film.pipelineResult.musicTracks,
      voiceLines: film.pipelineResult.voiceLines,
      durationSeconds: film.pipelineResult.durationSeconds,
    } : null;

    return NextResponse.json({
      id: film.id,
      title: film.title,
      status: film.status,
      prompt: film.prompt,
      genre: film.genre,
      tone: film.tone,
      logline: film.logline,
      fullScript: film.fullScript,
      videoUrl: film.videoUrl,
      trailerUrl: film.trailerUrl,
      coverImageUrl: film.coverImageUrl,
      coAuthors: film.coAuthors,
      version: film.version,
      parentId: film.parentId,
      isInfinite: film.isInfinite,
      createdAt: film.createdAt,
      pipeline: result,
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
