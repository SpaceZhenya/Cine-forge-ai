import { create } from "zustand";

interface FilmState {
  currentFilmId: string | null;
  status: string;
  pipelineProgress: string[];
  setFilm: (id: string) => void;
  setStatus: (status: string) => void;
  addProgress: (step: string) => void;
  reset: () => void;
}

export const useFilmStore = create<FilmState>((set) => ({
  currentFilmId: null,
  status: "idle",
  pipelineProgress: [],
  setFilm: (id) => set({ currentFilmId: id }),
  setStatus: (status) => set({ status }),
  addProgress: (step) =>
    set((state) => ({
      pipelineProgress: [...new Set([...state.pipelineProgress, step])],
    })),
  reset: () => set({ currentFilmId: null, status: "idle", pipelineProgress: [] }),
}));
