import { NextResponse } from "next/server";
import { generateFilm, infiniteMovie, getFilm } from "@/lib/store";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const url = _req.url || "";
    const isInfinite = url.includes("infinite=true");

    let film;
    if (isInfinite) {
      film = infiniteMovie(params.id);
    } else {
      film = generateFilm(params.id);
    }

    if (!film) {
      return NextResponse.json({ detail: "Film not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: film.id,
      status: film.status,
      title: film.title,
      genre: film.genre,
      tone: film.tone,
      durationSeconds: film.pipelineResult?.durationSeconds || 0,
      isInfinite: film.isInfinite,
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
