import { NextRequest, NextResponse } from "next/server";
import { createFilm, listFilms } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json({ detail: "prompt is required" }, { status: 400 });
    }
    const film = createFilm(body.prompt);
    return NextResponse.json({ id: film.id, status: film.status, message: "Film created" });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const films = listFilms().map(f => ({
      id: f.id,
      title: f.title,
      status: f.status,
      prompt: f.prompt,
      genre: f.genre,
      tone: f.tone,
      version: f.version,
      createdAt: f.createdAt,
      isInfinite: f.isInfinite,
    }));
    return NextResponse.json(films);
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
