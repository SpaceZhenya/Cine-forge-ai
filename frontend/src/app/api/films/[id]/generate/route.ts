import { NextResponse } from "next/server";
import { generateFilm } from "@/lib/store";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const film = generateFilm(params.id);
  if (!film) {
    return NextResponse.json({ detail: "Film not found" }, { status: 404 });
  }
  return NextResponse.json({ id: film.id, status: film.status, title: film.title });
}
