import { NextResponse } from "next/server";
import { getFilm } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const film = getFilm(params.id);
  if (!film) {
    return NextResponse.json({ detail: "Film not found" }, { status: 404 });
  }
  return NextResponse.json(film);
}
