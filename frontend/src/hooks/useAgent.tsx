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
  const eventCount = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => setState(prev => ({ ...prev, connected: true }));

    socket.onmessage = (raw) => {
      try {
        const event: AgentEvent = JSON.parse(raw.data);
        eventCount.current++;

        setState(prev => {
          const newEvents = [...prev.events, event];
          const newTimeline = addToTimeline(prev.timeline, event);
          const newTerminal = ["terminal_output", "npm_install", "npm_test", "build_start", "build_failed", "build_success"].includes(event.type)
            ? [...prev.terminalOutput, (event.type === "build_start" || event.type === "npm_install" || event.type === "npm_test") ? `$ ${event.text || ""}` : event.text || ""]
            : prev.terminalOutput;
          const newFiles = prev.filesModified.includes(event.path || "") ? prev.filesModified : event.path ? [...prev.filesModified, event.path] : prev.filesModified;
          const progress = event.type === "completed" ? 100 : event.type === "build_failed" ? 60 : Math.min((eventCount.current / 31) * 100, 95);

          return {
            ...prev,
            events: newEvents,
            timeline: newTimeline,
            currentFile: event.path || prev.currentFile,
            fileContent: event.content || prev.fileContent,
            terminalOutput: newTerminal.slice(-100),
            progress,
            filesModified: newFiles,
            running: event.type !== "completed",
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
    eventCount.current = 0;
    setState(prev => ({
      ...prev, events: [], timeline: [], terminalOutput: [], progress: 0, elapsed: 0, filesModified: [], running: true, currentFile: null, fileContent: "",
    }));
    ws.current.send(JSON.stringify({ type: "start_task", text: prompt }));
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

const TIMELINE_ICONS: Record<string, { label: string; icon: string }> = {
  scanning: { label: "Repository Scan", icon: "🔍" },
  searching: { label: "Analyzing project", icon: "📂" },
  reading_file: { label: "Reading file", icon: "📖" },
  editing_file: { label: "Editing file", icon: "✏️" },
  terminal_output: { label: "Terminal", icon: "💻" },
  npm_install: { label: "Installing packages", icon: "📦" },
  npm_test: { label: "Running tests", icon: "🧪" },
  build_start: { label: "Building", icon: "🔨" },
  build_success: { label: "Build success", icon: "✅" },
  build_failed: { label: "Build failed", icon: "❌" },
  fixing_errors: { label: "Fixing errors", icon: "🔧" },
  completed: { label: "Completed", icon: "🎉" },
  status_update: { label: "Status", icon: "ℹ️" },
  thinking: { label: "Thinking", icon: "🤔" },
};

function addToTimeline(current: AgentState["timeline"], event: AgentEvent) {
  const info = TIMELINE_ICONS[event.type] || { label: event.type, icon: "•" };
  const label = event.text || info.label;
  const entry = { label, icon: info.icon, active: true };

  const idx = current.findIndex(e => e.label === label);
  if (idx >= 0) return current;

  return [...current, entry];
}
