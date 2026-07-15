"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { AgentEvent, FileNode, PROJECT_FILES } from "@/lib/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

export interface AgentState {
  events: AgentEvent[];
  connected: boolean;
  currentFile: string | null;
  fileContent: string;
  terminalOutput: string[];
  timeline: { label: string; icon: string; active: boolean }[];
  elapsed: number;
  progress: number;
  filesModified: string[];
  running: boolean;
}

interface AgentContextType {
  state: AgentState;
  startTask: (prompt: string) => void;
  stopTask: () => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

const TIMELINE_ICONS: Record<string, { label: string; icon: string }> = {
  scan_start: { label: "Repository Scan", icon: "🔍" },
  scan_progress: { label: "Scanning project", icon: "📂" },
  scan_complete: { label: "Scan complete", icon: "✅" },
  read_file: { label: "Reading file", icon: "📖" },
  edit_file: { label: "Editing file", icon: "✏️" },
  create_file: { label: "Creating file", icon: "📄" },
  npm_start: { label: "Installing packages", icon: "📦" },
  npm_progress: { label: "Installing packages", icon: "📦" },
  npm_complete: { label: "Packages installed", icon: "✅" },
  build_start: { label: "Building", icon: "🔨" },
  build_progress: { label: "Building", icon: "🔨" },
  build_error: { label: "Build error", icon: "❌" },
  build_complete: { label: "Build success", icon: "✅" },
  test_start: { label: "Running tests", icon: "🧪" },
  test_result: { label: "Tests complete", icon: "📊" },
  task_complete: { label: "Completed", icon: "🎉" },
  terminal_output: { label: "Terminal", icon: "💻" },
};

function getTimelineEvent(event: AgentEvent): { label: string; icon: string } {
  const info = TIMELINE_ICONS[event.type];
  if (info) return info;

  const text = event.payload?.text as string | undefined;
  const path = event.payload?.path as string | undefined;
  if (text) return { label: text, icon: "•" };
  if (path) return { label: path, icon: "📄" };
  return { label: event.type, icon: "•" };
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const ws = useRef<WebSocket | null>(null);
  const [state, setState] = useState<AgentState>({
    events: [],
    connected: false,
    currentFile: null,
    fileContent: "",
    terminalOutput: [],
    timeline: [],
    elapsed: 0,
    progress: 0,
    filesModified: [],
    running: false,
  });
  const startTime = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => setState(prev => ({ ...prev, connected: true }));

    socket.onmessage = (raw) => {
      try {
        const event: AgentEvent = JSON.parse(raw.data);
        if (!event.type) return;

        setState(prev => {
          const newEvents = [...prev.events, event];
          const info = getTimelineEvent(event);
          const entry = { label: info.label, icon: info.icon, active: true };
          const exists = prev.timeline.some(e => e.label === info.label);
          const newTimeline = exists ? prev.timeline : [...prev.timeline, entry];

          let newTerminal = prev.terminalOutput;
          if (event.type === "terminal_output") {
            const line = (event.payload?.line as string) || "";
            newTerminal = [...prev.terminalOutput, line];
          } else if (event.type === "build_error") {
            const msg = (event.payload?.message as string) || "Build error";
            newTerminal = [...prev.terminalOutput, `ERROR: ${msg}`];
          } else if (["npm_start", "build_start", "test_start"].includes(event.type)) {
            const text = (event.payload?.command as string) || event.type;
            newTerminal = [...prev.terminalOutput, `$ ${text}`];
          }

          const path = event.payload?.path as string | undefined;
          const content = event.payload?.content as string | undefined;
          const newFiles = path && !prev.filesModified.includes(path)
            ? [...prev.filesModified, path]
            : prev.filesModified;

          let progress = prev.progress;
          if (event.type === "task_complete") progress = 100;
          else if (event.type === "build_error") progress = Math.max(progress, 60);
          else if (event.type === "scan_start") progress = 5;
          else if (event.type === "scan_complete") progress = 10;
          else progress = Math.min(progress + 2, 95);

          return {
            ...prev,
            events: newEvents,
            timeline: newTimeline,
            currentFile: path || prev.currentFile,
            fileContent: content || prev.fileContent,
            terminalOutput: newTerminal.slice(-100),
            progress,
            filesModified: newFiles,
            running: event.type !== "task_complete" && event.type !== "session_end",
          };
        });
      } catch {}
    };

    socket.onclose = () => {
      setState(prev => ({ ...prev, connected: false }));
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => { ws.current?.close(); };
  }, [connect]);

  useEffect(() => {
    if (state.running) {
      startTime.current = Date.now();
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, elapsed: Math.floor((Date.now() - startTime.current) / 1000) }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.running]);

  const startTask = useCallback((prompt: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    setState(prev => ({
      ...prev, events: [], timeline: [], terminalOutput: [], progress: 0, elapsed: 0, filesModified: [], running: true, currentFile: null, fileContent: "",
    }));
    ws.current.send(JSON.stringify({ type: "run_task", text: prompt }));
  }, []);

  const stopTask = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "stop" }));
    }
    setState(prev => ({ ...prev, running: false }));
  }, []);

  return (
    <AgentContext.Provider value={{ state, startTask, stopTask }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
