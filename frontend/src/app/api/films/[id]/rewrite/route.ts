import { NextRequest, NextResponse } from "next/server";
import { rewriteFilm } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!body.instruction || typeof body.instruction !== "string") {
      return NextResponse.json({ detail: "instruction is required" }, { status: 400 });
    }
    const film = rewriteFilm(params.id, body.instruction);
    if (!film) {
      return NextResponse.json({ detail: "Film not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: film.id,
      status: film.status,
      message: `Rewrite: ${body.instruction}`,
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
