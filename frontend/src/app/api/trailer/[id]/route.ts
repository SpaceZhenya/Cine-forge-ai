import { NextResponse } from "next/server";
import { getFilm } from "@/lib/store";
import { execSync, execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const KEY_TO_FREQ: Record<string, number> = {
  "C": 261.63, "Dm": 293.66, "Em": 329.63, "F": 349.23, "G": 392.00, "Am": 440.00,
};

function freqFromKey(key: string): number {
  const base = key.replace(/m$/, "");
  return KEY_TO_FREQ[base] || KEY_TO_FREQ[base.toUpperCase()] || 440;
}

function escArg(s: string): string {
  return s.replace(/"/g, '\\"');
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const film = getFilm(params.id);
    if (!film || !film.pipelineResult) {
      return NextResponse.json({ detail: "Film not found or not generated" }, { status: 404 });
    }

    const pipeline = film.pipelineResult;
    const title = (pipeline.title || film.title || "Untitled").replace(/[^a-zA-Z0-9 ]/g, "");
    const genre = (pipeline.genre || "Unknown").replace(/[^a-zA-Z0-9 ]/g, "");
    const tone = (pipeline.tone || "Epic").replace(/[^a-zA-Z0-9 ]/g, "");
    const shortTitle = title.length > 40 ? title.slice(0, 37) + "..." : title;

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cineforge-tr-"));

    // Generate audio (15s dramatic)
    const audioFile = path.join(tmpDir, "audio.mp3");
    const freq1 = freqFromKey(pipeline.musicTracks?.[0]?.key || "C");
    execSync(
      `ffmpeg -y -filter_complex "aevalsrc=sin(${freq1}*2*PI*t)*0.3+sin(${freq1*1.5}*2*PI*t)*0.15+sin(${freq1*0.5}*2*PI*t)*0.1+sin(${freq1*2}*2*PI*t)*0.05:d=15" -ar 44100 -ac 2 -codec:a libmp3lame -b:a 192k "${audioFile}" 2>nul`,
      { timeout: 10000, windowsHide: true }
    );

    // Generate video: colored background + audio, no text (to avoid font escaping issues)
    // We use showwaves for a visual element and a simple color background
    const videoFile = path.join(tmpDir, "trailer_no_text.mp4");
    execSync(
      `ffmpeg -y -f lavfi -i "color=c=#0a0a1e:s=1920x1080:d=15:r=30" -i "${audioFile}" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest -t 15 "${videoFile}" 2>nul`,
      { timeout: 60000, windowsHide: true }
    );

    // If video was generated, add text overlay in a separate pass using subtitles
    // Fallback: just serve the no-text version
    let trailerFile = videoFile;

    // Try to add text using subtitles filter (more reliable on Windows)
    const assFile = path.join(tmpDir, "text.ass");
    const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: title,Arial,72,&H00E75C6C,&H00000000,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,2,1,2,10,10,40,1
Style: subtitle,Arial,36,&H00806B6B,&H00000000,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,10,10,40,1
Style: maintitle,Arial,48,&H00E0E0E0,&H00000000,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,2,1,2,10,10,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:15.00,title,,0,0,0,,CineForge AI
Dialogue: 0,0:00:00.50,0:00:15.00,subtitle,,0,0,0,,${escArg(genre.toUpperCase())}
Dialogue: 0,0:00:02.00,0:00:15.00,maintitle,,0,0,0,,${escArg(shortTitle)}
Dialogue: 0,0:00:04.00,0:00:15.00,subtitle,,0,0,0,,${escArg(tone)} · A CineForge AI Original
`;
    fs.writeFileSync(assFile, assContent);

    try {
      const textVideo = path.join(tmpDir, "trailer_text.mp4");
      execSync(
        `ffmpeg -y -i "${videoFile}" -vf "ass='${assFile}'" -c:a copy -c:v libx264 -pix_fmt yuv420p "${textVideo}" 2>nul`,
        { timeout: 60000, windowsHide: true }
      );
      if (fs.existsSync(textVideo) && fs.statSync(textVideo).size > 1000) {
        trailerFile = textVideo;
      }
    } catch { }

    const videoData = fs.readFileSync(trailerFile);

    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }

    return new NextResponse(videoData, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, "_")}-trailer.mp4"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
