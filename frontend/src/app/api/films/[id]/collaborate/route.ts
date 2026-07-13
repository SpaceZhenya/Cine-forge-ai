import { NextRequest, NextResponse } from "next/server";
import { addCollaboration } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!body.user_id || !body.suggestion) {
      return NextResponse.json({ detail: "user_id and suggestion are required" }, { status: 400 });
    }
    const film = addCollaboration(params.id, body.user_id, body.suggestion);
    if (!film) {
      return NextResponse.json({ detail: "Film not found" }, { status: 404 });
    }
    return NextResponse.json({
      message: "Suggestion added",
      co_authors: JSON.parse(film.coAuthors),
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
