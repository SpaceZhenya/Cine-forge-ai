import { NextResponse } from "next/server";
import { getFilm } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const film = getFilm(params.id);
    if (!film || !film.pipelineResult) {
      return NextResponse.json({ detail: "Film not found or not generated" }, { status: 404 });
    }

    const pipeline = film.pipelineResult;
    const header = `CineForge AI — Script Export
================================
Title: ${pipeline.title || film.title}
Genre: ${pipeline.genre}
Tone: ${pipeline.tone}
Duration: ${Math.round((pipeline.durationSeconds || 0) / 60)} min
Logline: ${pipeline.logline}

${pipeline.characters?.map((c: any) => `  ${c.name} — ${c.personality} (${c.voiceType})`).join("\n") || ""}

`;

    const content = header + "\n" + (film.fullScript || pipeline.fullScript || "No script generated.");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${(pipeline.title || film.title || "film").replace(/[^a-zA-Z0-9]/g, "_")}-script.txt"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
