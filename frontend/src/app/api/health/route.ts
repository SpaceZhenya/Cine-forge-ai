import { NextResponse } from "next/server";
import { listFilms } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ status: "ok", films: listFilms().length });
}
