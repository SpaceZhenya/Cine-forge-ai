const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ""}`);
  }
  return res.json();
}

export const api = {
  createFilm: (prompt: string) =>
    request<{ id: string; status: string }>("/api/films", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  generateFilm: (id: string) =>
    request<{ id: string; status: string; title: string }>(`/api/films/${id}/generate`, {
      method: "POST",
    }),

  getFilm: (id: string) => request<any>(`/api/films/${id}`),

  listFilms: () => request<any[]>("/api/films"),

  rewriteFilm: (id: string, instruction: string) =>
    request<{ id: string; status: string; message: string }>(`/api/films/${id}/rewrite`, {
      method: "POST",
      body: JSON.stringify({ instruction }),
    }),

  collaborate: (id: string, userId: string, suggestion: string) =>
    request<{ message: string }>(`/api/films/${id}/collaborate`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, suggestion }),
    }),
};
