import { NextRequest, NextResponse } from "next/server";
import { createFilm, listFilms } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.prompt || typeof body.prompt !== "string") {
    return NextResponse.json({ detail: "prompt is required" }, { status: 400 });
  }
  const film = createFilm(body.prompt);
  return NextResponse.json({ id: film.id, status: film.status, message: "Created" });
}

export async function GET() {
  const films = listFilms();
  return NextResponse.json(films);
}
