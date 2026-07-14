import { NextResponse } from "next/server";
import { getFilm } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const film = getFilm(params.id);
    if (!film) {
      return NextResponse.json({ detail: "Film not found" }, { status: 404 });
    }

    const pipeline = film.pipelineResult;
    const genre = pipeline?.genre || "Unknown";
    const title = pipeline?.title || film.title || "Untitled";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="50%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </linearGradient>
  </defs>
  <rect width="600" height="900" fill="url(#bg)"/>
  <text x="300" y="200" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="bold" fill="#6C5CE7">CineForge AI</text>
  <text x="300" y="260" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#6b6b80">${genre.toUpperCase()}</text>
  <text x="300" y="450" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="bold" fill="#e0e0e0" max-width="500">${escapeXml(title)}</text>
  <text x="300" y="500" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#6b6b80">A CineForge AI Original</text>
  <rect x="100" y="700" width="400" height="4" rx="2" fill="#00CEC9" opacity="0.5"/>
  <text x="300" y="740" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#6b6b80">cineforge-ai.app</text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
