import { NextResponse } from "next/server";
import { getFilm } from "@/lib/store";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const KEY_TO_FREQ: Record<string, number> = {
  "C": 261.63, "Dm": 293.66, "Em": 329.63, "F": 349.23, "G": 392.00, "Am": 440.00,
  "D": 293.66, "E": 329.63, "A": 440.00, "B": 493.88,
};

function freqFromKey(key: string): number {
  const base = key.replace(/m$/, "");
  return KEY_TO_FREQ[base] || KEY_TO_FREQ[base.toUpperCase()] || 440;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const film = getFilm(params.id);
    if (!film || !film.pipelineResult) {
      return NextResponse.json({ detail: "Film not found or not generated" }, { status: 404 });
    }

    const tracks = film.pipelineResult.musicTracks;
    if (!tracks || tracks.length === 0) {
      return NextResponse.json({ detail: "No music tracks" }, { status: 400 });
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cineforge-"));
    const parts: string[] = [];

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const freq = freqFromKey(track.key);
      const bpm = track.tempo || 95;
      const duration = 6;
      const outFile = path.join(tmpDir, `track_${i}.wav`);

      // Generate a tone based on key + tempo
      const freq2 = freq * (1 + ((i + 1) % 4) * 0.125);
      const vol = 0.3 - (i % 3) * 0.05;
      const filter = `aevalsrc=sin(${freq}*2*PI*t)*${vol}+sin(${freq2}*2*PI*t)*${vol * 0.5}:d=${duration}`;

      try {
        execSync(
          `ffmpeg -y -filter_complex "${filter}" -ar 44100 -ac 1 "${outFile}" 2>nul`,
          { timeout: 10000, windowsHide: true }
        );
        if (fs.existsSync(outFile)) parts.push(outFile);
      } catch { }
    }

    if (parts.length === 0) {
      return NextResponse.json({ detail: "Audio generation failed" }, { status: 500 });
    }

    // Concatenate all parts and convert to MP3
    const concatFile = path.join(tmpDir, "list.txt");
    const concatContent = parts.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
    fs.writeFileSync(concatFile, concatContent);

    const outputFile = path.join(tmpDir, "output.mp3");
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -codec:a libmp3lame -b:a 128k "${outputFile}" 2>nul`,
      { timeout: 30000, windowsHide: true }
    );

    const audioData = fs.readFileSync(outputFile);

    // Cleanup
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }

    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${film.title || "film"}-music.mp3"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
