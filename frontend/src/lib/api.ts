// API client — calls Next.js API routes (same server)

async function req<T>(path: string, opts?: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || `Error ${res.status}`);
  return body as T;
}

export const api = {
  createFilm: (prompt: string) =>
    req<{ id: string; status: string }>("/api/films", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  getFilm: (id: string) => req<any>(`/api/films/${id}`),

  listFilms: () => req<any[]>("/api/films"),

  generateFilm: (id: string, infinite?: boolean) =>
    req<{ id: string; status: string; title: string }>(
      `/api/films/${id}/generate${infinite ? "?infinite=true" : ""}`,
      { method: "POST" }
    ),

  rewriteFilm: (id: string, instruction: string) =>
    req<{ id: string; status: string }>(`/api/films/${id}/rewrite`, {
      method: "POST",
      body: JSON.stringify({ instruction }),
    }),

  collaborate: (id: string, userId: string, suggestion: string) =>
    req<{ message: string }>(`/api/films/${id}/collaborate`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, suggestion }),
    }),
};
